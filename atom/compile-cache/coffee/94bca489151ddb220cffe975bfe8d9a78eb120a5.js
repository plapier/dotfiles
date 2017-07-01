(function() {
  var AnyBracket, BracketMatchingMotion, CloseBrackets, Input, MotionWithInput, OpenBrackets, Point, Range, RepeatSearch, Search, SearchBase, SearchCurrentWord, SearchViewModel, settings, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  MotionWithInput = require('./general-motions').MotionWithInput;

  SearchViewModel = require('../view-models/search-view-model');

  Input = require('../view-models/view-model').Input;

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  settings = require('../settings');

  SearchBase = (function(_super) {
    __extends(SearchBase, _super);

    function SearchBase(editor, vimState, options) {
      this.editor = editor;
      this.vimState = vimState;
      if (options == null) {
        options = {};
      }
      this.reversed = __bind(this.reversed, this);
      SearchBase.__super__.constructor.call(this, this.editor, this.vimState);
      this.reverse = this.initiallyReversed = false;
      if (!options.dontUpdateCurrentSearch) {
        this.updateCurrentSearch();
      }
    }

    SearchBase.prototype.reversed = function() {
      this.initiallyReversed = this.reverse = true;
      this.updateCurrentSearch();
      return this;
    };

    SearchBase.prototype.moveCursor = function(cursor, count) {
      var range, ranges;
      if (count == null) {
        count = 1;
      }
      ranges = this.scan(cursor);
      if (ranges.length > 0) {
        range = ranges[(count - 1) % ranges.length];
        return cursor.setBufferPosition(range.start);
      } else {
        return atom.beep();
      }
    };

    SearchBase.prototype.scan = function(cursor) {
      var currentPosition, rangesAfter, rangesBefore, _ref1;
      if (this.input.characters === "") {
        return [];
      }
      currentPosition = cursor.getBufferPosition();
      _ref1 = [[], []], rangesBefore = _ref1[0], rangesAfter = _ref1[1];
      this.editor.scan(this.getSearchTerm(this.input.characters), (function(_this) {
        return function(_arg) {
          var isBefore, range;
          range = _arg.range;
          isBefore = _this.reverse ? range.start.compare(currentPosition) < 0 : range.start.compare(currentPosition) <= 0;
          if (isBefore) {
            return rangesBefore.push(range);
          } else {
            return rangesAfter.push(range);
          }
        };
      })(this));
      if (this.reverse) {
        return rangesAfter.concat(rangesBefore).reverse();
      } else {
        return rangesAfter.concat(rangesBefore);
      }
    };

    SearchBase.prototype.getSearchTerm = function(term) {
      var modFlags, modifiers;
      modifiers = {
        'g': true
      };
      if (!term.match('[A-Z]') && settings.useSmartcaseForSearch()) {
        modifiers['i'] = true;
      }
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        modifiers['i'] = true;
      }
      modFlags = Object.keys(modifiers).join('');
      try {
        return new RegExp(term, modFlags);
      } catch (_error) {
        return new RegExp(_.escapeRegExp(term), modFlags);
      }
    };

    SearchBase.prototype.updateCurrentSearch = function() {
      this.vimState.globalVimState.currentSearch.reverse = this.reverse;
      return this.vimState.globalVimState.currentSearch.initiallyReversed = this.initiallyReversed;
    };

    SearchBase.prototype.replicateCurrentSearch = function() {
      this.reverse = this.vimState.globalVimState.currentSearch.reverse;
      return this.initiallyReversed = this.vimState.globalVimState.currentSearch.initiallyReversed;
    };

    return SearchBase;

  })(MotionWithInput);

  Search = (function(_super) {
    __extends(Search, _super);

    function Search(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.reversed = __bind(this.reversed, this);
      Search.__super__.constructor.call(this, this.editor, this.vimState);
      this.viewModel = new SearchViewModel(this);
      this.updateViewModel();
    }

    Search.prototype.reversed = function() {
      this.initiallyReversed = this.reverse = true;
      this.updateCurrentSearch();
      this.updateViewModel();
      return this;
    };

    Search.prototype.updateViewModel = function() {
      return this.viewModel.update(this.initiallyReversed);
    };

    return Search;

  })(SearchBase);

  SearchCurrentWord = (function(_super) {
    __extends(SearchCurrentWord, _super);

    SearchCurrentWord.keywordRegex = null;

    function SearchCurrentWord(editor, vimState) {
      var defaultIsKeyword, searchString, userIsKeyword;
      this.editor = editor;
      this.vimState = vimState;
      SearchCurrentWord.__super__.constructor.call(this, this.editor, this.vimState);
      defaultIsKeyword = "[@a-zA-Z0-9_\-]+";
      userIsKeyword = atom.config.get('vim-mode.iskeyword');
      this.keywordRegex = new RegExp(userIsKeyword || defaultIsKeyword);
      searchString = this.getCurrentWordMatch();
      this.input = new Input(searchString);
      if (searchString !== this.vimState.getSearchHistoryItem()) {
        this.vimState.pushSearchHistory(searchString);
      }
    }

    SearchCurrentWord.prototype.getCurrentWord = function() {
      var cursor, cursorPosition, wordEnd, wordStart;
      cursor = this.editor.getLastCursor();
      wordStart = cursor.getBeginningOfCurrentWordBufferPosition({
        wordRegex: this.keywordRegex,
        allowPrevious: false
      });
      wordEnd = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.keywordRegex,
        allowNext: false
      });
      cursorPosition = cursor.getBufferPosition();
      if (wordEnd.column === cursorPosition.column) {
        wordEnd = cursor.getEndOfCurrentWordBufferPosition({
          wordRegex: this.keywordRegex,
          allowNext: true
        });
        if (wordEnd.row !== cursorPosition.row) {
          return "";
        }
        cursor.setBufferPosition(wordEnd);
        wordStart = cursor.getBeginningOfCurrentWordBufferPosition({
          wordRegex: this.keywordRegex,
          allowPrevious: false
        });
      }
      cursor.setBufferPosition(wordStart);
      return this.editor.getTextInBufferRange([wordStart, wordEnd]);
    };

    SearchCurrentWord.prototype.cursorIsOnEOF = function(cursor) {
      var eofPos, pos;
      pos = cursor.getNextWordBoundaryBufferPosition({
        wordRegex: this.keywordRegex
      });
      eofPos = this.editor.getEofBufferPosition();
      return pos.row === eofPos.row && pos.column === eofPos.column;
    };

    SearchCurrentWord.prototype.getCurrentWordMatch = function() {
      var characters;
      characters = this.getCurrentWord();
      if (characters.length > 0) {
        if (/\W/.test(characters)) {
          return "" + characters + "\\b";
        } else {
          return "\\b" + characters + "\\b";
        }
      } else {
        return characters;
      }
    };

    SearchCurrentWord.prototype.isComplete = function() {
      return true;
    };

    SearchCurrentWord.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      if (this.input.characters.length > 0) {
        return SearchCurrentWord.__super__.execute.call(this, count);
      }
    };

    return SearchCurrentWord;

  })(SearchBase);

  OpenBrackets = ['(', '{', '['];

  CloseBrackets = [')', '}', ']'];

  AnyBracket = new RegExp(OpenBrackets.concat(CloseBrackets).map(_.escapeRegExp).join("|"));

  BracketMatchingMotion = (function(_super) {
    __extends(BracketMatchingMotion, _super);

    function BracketMatchingMotion() {
      return BracketMatchingMotion.__super__.constructor.apply(this, arguments);
    }

    BracketMatchingMotion.prototype.operatesInclusively = true;

    BracketMatchingMotion.prototype.isComplete = function() {
      return true;
    };

    BracketMatchingMotion.prototype.searchForMatch = function(startPosition, reverse, inCharacter, outCharacter) {
      var character, depth, eofPosition, increment, lineLength, point;
      depth = 0;
      point = startPosition.copy();
      lineLength = this.editor.lineTextForBufferRow(point.row).length;
      eofPosition = this.editor.getEofBufferPosition().translate([0, 1]);
      increment = reverse ? -1 : 1;
      while (true) {
        character = this.characterAt(point);
        if (character === inCharacter) {
          depth++;
        }
        if (character === outCharacter) {
          depth--;
        }
        if (depth === 0) {
          return point;
        }
        point.column += increment;
        if (depth < 0) {
          return null;
        }
        if (point.isEqual([0, -1])) {
          return null;
        }
        if (point.isEqual(eofPosition)) {
          return null;
        }
        if (point.column < 0) {
          point.row--;
          lineLength = this.editor.lineTextForBufferRow(point.row).length;
          point.column = lineLength - 1;
        } else if (point.column >= lineLength) {
          point.row++;
          lineLength = this.editor.lineTextForBufferRow(point.row).length;
          point.column = 0;
        }
      }
    };

    BracketMatchingMotion.prototype.characterAt = function(position) {
      return this.editor.getTextInBufferRange([position, position.translate([0, 1])]);
    };

    BracketMatchingMotion.prototype.getSearchData = function(position) {
      var character, index;
      character = this.characterAt(position);
      if ((index = OpenBrackets.indexOf(character)) >= 0) {
        return [character, CloseBrackets[index], false];
      } else if ((index = CloseBrackets.indexOf(character)) >= 0) {
        return [character, OpenBrackets[index], true];
      } else {
        return [];
      }
    };

    BracketMatchingMotion.prototype.moveCursor = function(cursor) {
      var inCharacter, matchPosition, outCharacter, restOfLine, reverse, startPosition, _ref1, _ref2;
      startPosition = cursor.getBufferPosition();
      _ref1 = this.getSearchData(startPosition), inCharacter = _ref1[0], outCharacter = _ref1[1], reverse = _ref1[2];
      if (inCharacter == null) {
        restOfLine = [startPosition, [startPosition.row, Infinity]];
        this.editor.scanInBufferRange(AnyBracket, restOfLine, function(_arg) {
          var range, stop;
          range = _arg.range, stop = _arg.stop;
          startPosition = range.start;
          return stop();
        });
      }
      _ref2 = this.getSearchData(startPosition), inCharacter = _ref2[0], outCharacter = _ref2[1], reverse = _ref2[2];
      if (inCharacter == null) {
        return;
      }
      if (matchPosition = this.searchForMatch(startPosition, reverse, inCharacter, outCharacter)) {
        return cursor.setBufferPosition(matchPosition);
      }
    };

    return BracketMatchingMotion;

  })(SearchBase);

  RepeatSearch = (function(_super) {
    __extends(RepeatSearch, _super);

    function RepeatSearch(editor, vimState) {
      var _ref1;
      this.editor = editor;
      this.vimState = vimState;
      RepeatSearch.__super__.constructor.call(this, this.editor, this.vimState, {
        dontUpdateCurrentSearch: true
      });
      this.input = new Input((_ref1 = this.vimState.getSearchHistoryItem(0)) != null ? _ref1 : "");
      this.replicateCurrentSearch();
    }

    RepeatSearch.prototype.isComplete = function() {
      return true;
    };

    RepeatSearch.prototype.reversed = function() {
      this.reverse = !this.initiallyReversed;
      return this;
    };

    return RepeatSearch;

  })(SearchBase);

  module.exports = {
    Search: Search,
    SearchCurrentWord: SearchCurrentWord,
    BracketMatchingMotion: BracketMatchingMotion,
    RepeatSearch: RepeatSearch
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvbW90aW9ucy9zZWFyY2gtbW90aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2TEFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0Msa0JBQW1CLE9BQUEsQ0FBUSxtQkFBUixFQUFuQixlQURELENBQUE7O0FBQUEsRUFFQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxrQ0FBUixDQUZsQixDQUFBOztBQUFBLEVBR0MsUUFBUyxPQUFBLENBQVEsMkJBQVIsRUFBVCxLQUhELENBQUE7O0FBQUEsRUFJQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FKUixDQUFBOztBQUFBLEVBS0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBTFgsQ0FBQTs7QUFBQSxFQU9NO0FBQ0osaUNBQUEsQ0FBQTs7QUFBYSxJQUFBLG9CQUFFLE1BQUYsRUFBVyxRQUFYLEVBQXFCLE9BQXJCLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BRHFCLElBQUMsQ0FBQSxXQUFBLFFBQ3RCLENBQUE7O1FBRGdDLFVBQVU7T0FDMUM7QUFBQSxpREFBQSxDQUFBO0FBQUEsTUFBQSw0Q0FBTSxJQUFDLENBQUEsTUFBUCxFQUFlLElBQUMsQ0FBQSxRQUFoQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLGlCQUFELEdBQXFCLEtBRGhDLENBQUE7QUFFQSxNQUFBLElBQUEsQ0FBQSxPQUFxQyxDQUFDLHVCQUF0QztBQUFB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/motions/search-motion.coffee
