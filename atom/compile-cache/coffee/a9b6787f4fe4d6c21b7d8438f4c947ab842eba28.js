(function() {
  var Motion, Search, SearchBackwards, SearchBase, SearchCurrentWord, SearchCurrentWordBackwards, SearchModel, _, getNonWordCharactersForCursor, ref, saveEditorState, searchByProjectFind,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  ref = require('./utils'), saveEditorState = ref.saveEditorState, getNonWordCharactersForCursor = ref.getNonWordCharactersForCursor, searchByProjectFind = ref.searchByProjectFind;

  SearchModel = require('./search-model');

  Motion = require('./base').getClass('Motion');

  SearchBase = (function(superClass) {
    extend(SearchBase, superClass);

    function SearchBase() {
      return SearchBase.__super__.constructor.apply(this, arguments);
    }

    SearchBase.extend(false);

    SearchBase.prototype.jump = true;

    SearchBase.prototype.backwards = false;

    SearchBase.prototype.useRegexp = true;

    SearchBase.prototype.configScope = null;

    SearchBase.prototype.landingPoint = null;

    SearchBase.prototype.defaultLandingPoint = 'start';

    SearchBase.prototype.relativeIndex = null;

    SearchBase.prototype.updatelastSearchPattern = true;

    SearchBase.prototype.isBackwards = function() {
      return this.backwards;
    };

    SearchBase.prototype.isIncrementalSearch = function() {
      return this["instanceof"]('Search') && !this.repeated && this.getConfig('incrementalSearch');
    };

    SearchBase.prototype.initialize = function() {
      SearchBase.__super__.initialize.apply(this, arguments);
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.finish();
        };
      })(this));
    };

    SearchBase.prototype.getCount = function() {
      var count;
      count = SearchBase.__super__.getCount.apply(this, arguments);
      if (this.isBackwards()) {
        return -count;
      } else {
        return count;
      }
    };

    SearchBase.prototype.getCaseSensitivity = function() {
      if (this.getConfig("useSmartcaseFor" + this.configScope)) {
        return 'smartcase';
      } else if (this.getConfig("ignoreCaseFor" + this.configScope)) {
        return 'insensitive';
      } else {
        return 'sensitive';
      }
    };

    SearchBase.prototype.isCaseSensitive = function(term) {
      switch (this.getCaseSensitivity()) {
        case 'smartcase':
          return term.search('[A-Z]') !== -1;
        case 'insensitive':
          return false;
        case 'sensitive':
          return true;
      }
    };

    SearchBase.prototype.finish = function() {
      var ref1;
      if (this.isIncrementalSearch() && this.getConfig('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      this.relativeIndex = null;
      if ((ref1 = this.searchModel) != null) {
        ref1.destroy();
      }
      return this.searchModel = null;
    };

    SearchBase.prototype.getLandingPoint = function() {
      return this.landingPoint != null ? this.landingPoint : this.landingPoint = this.defaultLandingPoint;
    };

    SearchBase.prototype.getPoint = function(cursor) {
      var point, range;
      if (this.searchModel != null) {
        this.relativeIndex = this.getCount() + this.searchModel.getRelativeIndex();
      } else {
        if (this.relativeIndex == null) {
          this.relativeIndex = this.getCount();
        }
      }
      if (range = this.search(cursor, this.input, this.relativeIndex)) {
        point = range[this.getLandingPoint()];
      }
      this.searchModel.destroy();
      this.searchModel = null;
      return point;
    };

    SearchBase.prototype.moveCursor = function(cursor) {
      var input, point;
      input = this.input;
      if (!input) {
        return;
      }
      if (point = this.getPoint(cursor)) {
        cursor.setBufferPosition(point, {
          autoscroll: false
        });
      }
      if (!this.repeated) {
        this.globalState.set('currentSearch', this);
        this.vimState.searchHistory.save(input);
      }
      if (this.updatelastSearchPattern) {
        return this.globalState.set('lastSearchPattern', this.getPattern(input));
      }
    };

    SearchBase.prototype.getSearchModel = function() {
      return this.searchModel != null ? this.searchModel : this.searchModel = new SearchModel(this.vimState, {
        incrementalSearch: this.isIncrementalSearch()
      });
    };

    SearchBase.prototype.search = function(cursor, input, relativeIndex) {
      var fromPoint, searchModel;
      searchModel = this.getSearchModel();
      if (input) {
        fromPoint = this.getBufferPositionForCursor(cursor);
        return searchModel.search(fromPoint, this.getPattern(input), relativeIndex);
      } else {
        this.vimState.hoverSearchCounter.reset();
        return searchModel.clearMarkers();
      }
    };

    return SearchBase;

  })(Motion);

  Search = (function(superClass) {
    extend(Search, superClass);

    function Search() {
      this.handleConfirmSearch = bind(this.handleConfirmSearch, this);
      return Search.__super__.constructor.apply(this, arguments);
    }

    Search.extend();

    Search.prototype.configScope = "Search";

    Search.prototype.requireInput = true;

    Search.prototype.initialize = function() {
      Search.__super__.initialize.apply(this, arguments);
      if (this.isComplete()) {
        return;
      }
      if (this.isIncrementalSearch()) {
        this.restoreEditorState = saveEditorState(this.editor);
        this.onDidCommandSearch(this.handleCommandEvent.bind(this));
      }
      this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
      this.onDidCancelSearch(this.handleCancelSearch.bind(this));
      this.onDidChangeSearch(this.handleChangeSearch.bind(this));
      return this.focusSearchInputEditor();
    };

    Search.prototype.focusSearchInputEditor = function() {
      var classList;
      classList = [];
      if (this.backwards) {
        classList.push('backwards');
      }
      return this.vimState.searchInput.focus({
        classList: classList
      });
    };

    Search.prototype.handleCommandEvent = function(commandEvent) {
      var direction, input, operation;
      if (!commandEvent.input) {
        return;
      }
      switch (commandEvent.name) {
        case 'visit':
          direction = commandEvent.direction;
          if (this.isBackwards() && this.getConfig('incrementalSearchVisitDirection') === 'relative') {
            direction = (function() {
              switch (direction) {
                case 'next':
                  return 'prev';
                case 'prev':
                  return 'next';
              }
            })();
          }
          switch (direction) {
            case 'next':
              return this.getSearchModel().visit(+1);
            case 'prev':
              return this.getSearchModel().visit(-1);
          }
          break;
        case 'occurrence':
          operation = commandEvent.operation, input = commandEvent.input;
          this.vimState.occurrenceManager.addPattern(this.getPattern(input), {
            reset: operation != null
          });
          this.vimState.occurrenceManager.saveLastPattern();
          this.vimState.searchHistory.save(input);
          this.vimState.searchInput.cancel();
          if (operation != null) {
            return this.vimState.operationStack.run(operation);
          }
          break;
        case 'project-find':
          input = commandEvent.input;
          this.vimState.searchHistory.save(input);
          this.vimState.searchInput.cancel();
          return searchByProjectFind(this.editor, input);
      }
    };

    Search.prototype.handleCancelSearch = function() {
      var ref1;
      if ((ref1 = this.mode) !== 'visual' && ref1 !== 'insert') {
        this.vimState.resetNormalMode();
      }
      if (typeof this.restoreEditorState === "function") {
        this.restoreEditorState();
      }
      this.vimState.reset();
      return this.finish();
    };

    Search.prototype.isSearchRepeatCharacter = function(char) {
      var searchChar;
      if (this.isIncrementalSearch()) {
        return char === '';
      } else {
        searchChar = this.isBackwards() ? '?' : '/';
        return char === '' || char === searchChar;
      }
    };

    Search.prototype.handleConfirmSearch = function(arg) {
      this.input = arg.input, this.landingPoint = arg.landingPoint;
      if (this.isSearchRepeatCharacter(this.input)) {
        this.input = this.vimState.searchHistory.get('prev');
        if (!this.input) {
          atom.beep();
        }
      }
      return this.processOperation();
    };

    Search.prototype.handleChangeSearch = function(input) {
      if (input.startsWith(' ')) {
        input = input.replace(/^ /, '');
        this.useRegexp = false;
      }
      this.vimState.searchInput.updateOptionSettings({
        useRegexp: this.useRegexp
      });
      if (this.isIncrementalSearch()) {
        return this.search(this.editor.getLastCursor(), input, this.getCount());
      }
    };

    Search.prototype.getPattern = function(term) {
      var modifiers;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (indexOf.call(modifiers, 'i') < 0) {
          modifiers += 'i';
        }
      }
      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (error) {
          null;
        }
      }
      return new RegExp(_.escapeRegExp(term), modifiers);
    };

    return Search;

  })(SearchBase);

  SearchBackwards = (function(superClass) {
    extend(SearchBackwards, superClass);

    function SearchBackwards() {
      return SearchBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchBackwards.extend();

    SearchBackwards.prototype.backwards = true;

    return SearchBackwards;

  })(Search);

  SearchCurrentWord = (function(superClass) {
    extend(SearchCurrentWord, superClass);

    function SearchCurrentWord() {
      return SearchCurrentWord.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWord.extend();

    SearchCurrentWord.prototype.configScope = "SearchCurrentWord";

    SearchCurrentWord.prototype.moveCursor = function(cursor) {
      var wordRange;
      if (this.input == null) {
        this.input = (wordRange = this.getCurrentWordBufferRange(), wordRange != null ? (this.editor.setCursorBufferPosition(wordRange.start), this.editor.getTextInBufferRange(wordRange)) : '');
      }
      return SearchCurrentWord.__super__.moveCursor.apply(this, arguments);
    };

    SearchCurrentWord.prototype.getPattern = function(term) {
      var modifiers, pattern;
      modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      pattern = _.escapeRegExp(term);
      if (/\W/.test(term)) {
        return new RegExp(pattern + "\\b", modifiers);
      } else {
        return new RegExp("\\b" + pattern + "\\b", modifiers);
      }
    };

    SearchCurrentWord.prototype.getCurrentWordBufferRange = function() {
      var cursor, found, nonWordCharacters, point, wordRegex;
      cursor = this.editor.getLastCursor();
      point = cursor.getBufferPosition();
      nonWordCharacters = getNonWordCharactersForCursor(cursor);
      wordRegex = new RegExp("[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+", 'g');
      found = null;
      this.scanForward(wordRegex, {
        from: [point.row, 0],
        allowNextLine: false
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.end.isGreaterThan(point)) {
          found = range;
          return stop();
        }
      });
      return found;
    };

    return SearchCurrentWord;

  })(SearchBase);

  SearchCurrentWordBackwards = (function(superClass) {
    extend(SearchCurrentWordBackwards, superClass);

    function SearchCurrentWordBackwards() {
      return SearchCurrentWordBackwards.__super__.constructor.apply(this, arguments);
    }

    SearchCurrentWordBackwards.extend();

    SearchCurrentWordBackwards.prototype.backwards = true;

    return SearchCurrentWordBackwards;

  })(SearchCurrentWord);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24tc2VhcmNoLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0xBQUE7SUFBQTs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE1BQXdFLE9BQUEsQ0FBUSxTQUFSLENBQXhFLEVBQUMscUNBQUQsRUFBa0IsaUVBQWxCLEVBQWlEOztFQUNqRCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUixDQUFpQixDQUFDLFFBQWxCLENBQTJCLFFBQTNCOztFQUVIOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOzt5QkFDQSxJQUFBLEdBQU07O3lCQUNOLFNBQUEsR0FBVzs7eUJBQ1gsU0FBQSxHQUFXOzt5QkFDWCxXQUFBLEdBQWE7O3lCQUNiLFlBQUEsR0FBYzs7eUJBQ2QsbUJBQUEsR0FBcUI7O3lCQUNyQixhQUFBLEdBQWU7O3lCQUNmLHVCQUFBLEdBQXlCOzt5QkFFekIsV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFDLENBQUE7SUFEVTs7eUJBR2IsbUJBQUEsR0FBcUIsU0FBQTthQUNuQixJQUFDLEVBQUEsVUFBQSxFQUFELENBQVksUUFBWixDQUFBLElBQTBCLENBQUksSUFBQyxDQUFBLFFBQS9CLElBQTRDLElBQUMsQ0FBQSxTQUFELENBQVcsbUJBQVg7SUFEekI7O3lCQUdyQixVQUFBLEdBQVksU0FBQTtNQUNWLDRDQUFBLFNBQUE7YUFDQSxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNwQixLQUFDLENBQUEsTUFBRCxDQUFBO1FBRG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQUZVOzt5QkFLWixRQUFBLEdBQVUsU0FBQTtB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QixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBO01BQ1QsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BRVIsaUJBQUEsR0FBb0IsNkJBQUEsQ0FBOEIsTUFBOUI7TUFDcEIsU0FBQSxHQUFnQixJQUFBLE1BQUEsQ0FBTyxPQUFBLEdBQU8sQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLGlCQUFmLENBQUQsQ0FBUCxHQUEwQyxJQUFqRCxFQUFzRCxHQUF0RDtNQUVoQixLQUFBLEdBQVE7TUFDUixJQUFDLENBQUEsV0FBRCxDQUFhLFNBQWIsRUFBd0I7UUFBQyxJQUFBLEVBQU0sQ0FBQyxLQUFLLENBQUMsR0FBUCxFQUFZLENBQVosQ0FBUDtRQUF1QixhQUFBLEVBQWUsS0FBdEM7T0FBeEIsRUFBc0UsU0FBQyxHQUFEO0FBQ3BFLFlBQUE7UUFEc0UsbUJBQU87UUFDN0UsSUFBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsS0FBeEIsQ0FBSDtVQUNFLEtBQUEsR0FBUTtpQkFDUixJQUFBLENBQUEsRUFGRjs7TUFEb0UsQ0FBdEU7YUFJQTtJQVp5Qjs7OztLQXZCRzs7RUFxQzFCOzs7Ozs7O0lBQ0osMEJBQUMsQ0FBQSxNQUFELENBQUE7O3lDQUNBLFNBQUEsR0FBVzs7OztLQUY0QjtBQW5QekMiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57c2F2ZUVkaXRvclN0YXRlLCBnZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvciwgc2VhcmNoQnlQcm9qZWN0RmluZH0gPSByZXF1aXJlICcuL3V0aWxzJ1xuU2VhcmNoTW9kZWwgPSByZXF1aXJlICcuL3NlYXJjaC1tb2RlbCdcbk1vdGlvbiA9IHJlcXVpcmUoJy4vYmFzZScpLmdldENsYXNzKCdNb3Rpb24nKVxuXG5jbGFzcyBTZWFyY2hCYXNlIGV4dGVuZHMgTW90aW9uXG4gIEBleHRlbmQoZmFsc2UpXG4gIGp1bXA6IHRydWVcbiAgYmFja3dhcmRzOiBmYWxzZVxuICB1c2VSZWdleHA6IHRydWVcbiAgY29uZmlnU2NvcGU6IG51bGxcbiAgbGFuZGluZ1BvaW50OiBudWxsICMgWydzdGFydCcgb3IgJ2VuZCddXG4gIGRlZmF1bHRMYW5kaW5nUG9pbnQ6ICdzdGFydCcgIyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgcmVsYXRpdmVJbmRleDogbnVsbFxuICB1cGRhdGVsYXN0U2VhcmNoUGF0dGVybjogdHJ1ZVxuXG4gIGlzQmFja3dhcmRzOiAtPlxuICAgIEBiYWNrd2FyZHNcblxuICBpc0luY3JlbWVudGFsU2VhcmNoOiAtPlxuICAgIEBpbnN0YW5jZW9mKCdTZWFyY2gnKSBhbmQgbm90IEByZXBlYXRlZCBhbmQgQGdldENvbmZpZygnaW5jcmVtZW50YWxTZWFyY2gnKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAb25EaWRGaW5pc2hPcGVyYXRpb24gPT5cbiAgICAgIEBmaW5pc2goKVxuXG4gIGdldENvdW50OiAtPlxuICAgIGNvdW50ID0gc3VwZXJcbiAgICBpZiBAaXNCYWNrd2FyZHMoKVxuICAgICAgLWNvdW50XG4gICAgZWxzZVxuICAgICAgY291bnRcblxuICBnZXRDYXNlU2Vuc2l0aXZpdHk6IC0+XG4gICAgaWYgQGdldENvbmZpZyhcInVzZVNtYXJ0Y2FzZUZvciN7QGNvbmZpZ1Njb3BlfVwiKVxuICAgICAgJ3NtYXJ0Y2FzZSdcbiAgICBlbHNlIGlmIEBnZXRDb25maWcoXCJpZ25vcmVDYXNlRm9yI3tAY29uZmlnU2NvcGV9XCIpXG4gICAgICAnaW5zZW5zaXRpdmUnXG4gICAgZWxzZVxuICAgICAgJ3NlbnNpdGl2ZSdcblxuICBpc0Nhc2VTZW5zaXRpdmU6ICh0ZXJtKSAtPlxuICAgIHN3aXRjaCBAZ2V0Q2FzZVNlbnNpdGl2aXR5KClcbiAgICAgIHdoZW4gJ3NtYXJ0Y2FzZScgdGhlbiB0ZXJtLnNlYXJjaCgnW0EtWl0nKSBpc250IC0xXG4gICAgICB3aGVuICdpbnNlbnNpdGl2ZScgdGhlbiBmYWxzZVxuICAgICAgd2hlbiAnc2Vuc2l0aXZlJyB0aGVuIHRydWVcblxuICBmaW5pc2g6IC0+XG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKSBhbmQgQGdldENvbmZpZygnc2hvd0hvdmVyU2VhcmNoQ291bnRlcicpXG4gICAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnJlc2V0KClcbiAgICBAcmVsYXRpdmVJbmRleCA9IG51bGxcbiAgICBAc2VhcmNoTW9kZWw/LmRlc3Ryb3koKVxuICAgIEBzZWFyY2hNb2RlbCA9IG51bGxcblxuICBnZXRMYW5kaW5nUG9pbnQ6IC0+XG4gICAgQGxhbmRpbmdQb2ludCA/PSBAZGVmYXVsdExhbmRpbmdQb2ludFxuXG4gIGdldFBvaW50OiAoY3Vyc29yKSAtPlxuICAgIGlmIEBzZWFyY2hNb2RlbD9cbiAgICAgIEByZWxhdGl2ZUluZGV4ID0gQGdldENvdW50KCkgKyBAc2VhcmNoTW9kZWwuZ2V0UmVsYXRpdmVJbmRleCgpXG4gICAgZWxzZVxuICAgICAgQHJlbGF0aXZlSW5kZXggPz0gQGdldENvdW50KClcblxuICAgIGlmIHJhbmdlID0gQHNlYXJjaChjdXJzb3IsIEBpbnB1dCwgQHJlbGF0aXZlSW5kZXgpXG4gICAgICBwb2ludCA9IHJhbmdlW0BnZXRMYW5kaW5nUG9pbnQoKV1cblxuICAgIEBzZWFyY2hNb2RlbC5kZXN0cm95KClcbiAgICBAc2VhcmNoTW9kZWwgPSBudWxsXG5cbiAgICBwb2ludFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgaW5wdXQgPSBAaW5wdXRcbiAgICByZXR1cm4gdW5sZXNzIGlucHV0XG5cbiAgICBpZiBwb2ludCA9IEBnZXRQb2ludChjdXJzb3IpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQsIGF1dG9zY3JvbGw6IGZhbHNlKVxuXG4gICAgdW5sZXNzIEByZXBlYXRlZFxuICAgICAgQGdsb2JhbFN0YXRlLnNldCgnY3VycmVudFNlYXJjaCcsIHRoaXMpXG4gICAgICBAdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGlucHV0KVxuXG4gICAgaWYgQHVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuXG4gICAgICBAZ2xvYmFsU3RhdGUuc2V0KCdsYXN0U2VhcmNoUGF0dGVybicsIEBnZXRQYXR0ZXJuKGlucHV0KSlcblxuICBnZXRTZWFyY2hNb2RlbDogLT5cbiAgICBAc2VhcmNoTW9kZWwgPz0gbmV3IFNlYXJjaE1vZGVsKEB2aW1TdGF0ZSwgaW5jcmVtZW50YWxTZWFyY2g6IEBpc0luY3JlbWVudGFsU2VhcmNoKCkpXG5cbiAgc2VhcmNoOiAoY3Vyc29yLCBpbnB1dCwgcmVsYXRpdmVJbmRleCkgLT5cbiAgICBzZWFyY2hNb2RlbCA9IEBnZXRTZWFyY2hNb2RlbCgpXG4gICAgaWYgaW5wdXRcbiAgICAgIGZyb21Qb2ludCA9IEBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcihjdXJzb3IpXG4gICAgICBzZWFyY2hNb2RlbC5zZWFyY2goZnJvbVBvaW50LCBAZ2V0UGF0dGVybihpbnB1dCksIHJlbGF0aXZlSW5kZXgpXG4gICAgZWxzZVxuICAgICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5yZXNldCgpXG4gICAgICBzZWFyY2hNb2RlbC5jbGVhck1hcmtlcnMoKVxuXG4jIC8sID9cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoIGV4dGVuZHMgU2VhcmNoQmFzZVxuICBAZXh0ZW5kKClcbiAgY29uZmlnU2NvcGU6IFwiU2VhcmNoXCJcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIHJldHVybiBpZiBAaXNDb21wbGV0ZSgpICMgV2hlbiByZXBlYXRlZCwgbm8gbmVlZCB0byBnZXQgdXNlciBpbnB1dFxuXG4gICAgaWYgQGlzSW5jcmVtZW50YWxTZWFyY2goKVxuICAgICAgQHJlc3RvcmVFZGl0b3JTdGF0ZSA9IHNhdmVFZGl0b3JTdGF0ZShAZWRpdG9yKVxuICAgICAgQG9uRGlkQ29tbWFuZFNlYXJjaChAaGFuZGxlQ29tbWFuZEV2ZW50LmJpbmQodGhpcykpXG5cbiAgICBAb25EaWRDb25maXJtU2VhcmNoKEBoYW5kbGVDb25maXJtU2VhcmNoLmJpbmQodGhpcykpXG4gICAgQG9uRGlkQ2FuY2VsU2VhcmNoKEBoYW5kbGVDYW5jZWxTZWFyY2guYmluZCh0aGlzKSlcbiAgICBAb25EaWRDaGFuZ2VTZWFyY2goQGhhbmRsZUNoYW5nZVNlYXJjaC5iaW5kKHRoaXMpKVxuXG4gICAgQGZvY3VzU2VhcmNoSW5wdXRFZGl0b3IoKVxuXG4gIGZvY3VzU2VhcmNoSW5wdXRFZGl0b3I6IC0+XG4gICAgY2xhc3NMaXN0ID0gW11cbiAgICBjbGFzc0xpc3QucHVzaCgnYmFja3dhcmRzJykgaWYgQGJhY2t3YXJkc1xuICAgIEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5mb2N1cyh7Y2xhc3NMaXN0fSlcblxuICBoYW5kbGVDb21tYW5kRXZlbnQ6IChjb21tYW5kRXZlbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBjb21tYW5kRXZlbnQuaW5wdXRcbiAgICBzd2l0Y2ggY29tbWFuZEV2ZW50Lm5hbWVcbiAgICAgIHdoZW4gJ3Zpc2l0J1xuICAgICAgICB7ZGlyZWN0aW9ufSA9IGNvbW1hbmRFdmVudFxuICAgICAgICBpZiBAaXNCYWNrd2FyZHMoKSBhbmQgQGdldENvbmZpZygnaW5jcmVtZW50YWxTZWFyY2hWaXNpdERpcmVjdGlvbicpIGlzICdyZWxhdGl2ZSdcbiAgICAgICAgICBkaXJlY3Rpb24gPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICAgICAgICB3aGVuICduZXh0JyB0aGVuICdwcmV2J1xuICAgICAgICAgICAgd2hlbiAncHJldicgdGhlbiAnbmV4dCdcblxuICAgICAgICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgICAgICAgd2hlbiAnbmV4dCcgdGhlbiBAZ2V0U2VhcmNoTW9kZWwoKS52aXNpdCgrMSlcbiAgICAgICAgICB3aGVuICdwcmV2JyB0aGVuIEBnZXRTZWFyY2hNb2RlbCgpLnZpc2l0KC0xKVxuXG4gICAgICB3aGVuICdvY2N1cnJlbmNlJ1xuICAgICAgICB7b3BlcmF0aW9uLCBpbnB1dH0gPSBjb21tYW5kRXZlbnRcbiAgICAgICAgQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4oQGdldFBhdHRlcm4oaW5wdXQpLCByZXNldDogb3BlcmF0aW9uPylcbiAgICAgICAgQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybigpXG5cbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShpbnB1dClcbiAgICAgICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG5cbiAgICAgICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihvcGVyYXRpb24pIGlmIG9wZXJhdGlvbj9cblxuICAgICAgd2hlbiAncHJvamVjdC1maW5kJ1xuICAgICAgICB7aW5wdXR9ID0gY29tbWFuZEV2ZW50XG4gICAgICAgIEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUoaW5wdXQpXG4gICAgICAgIEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuICAgICAgICBzZWFyY2hCeVByb2plY3RGaW5kKEBlZGl0b3IsIGlucHV0KVxuXG4gIGhhbmRsZUNhbmNlbFNlYXJjaDogLT5cbiAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKCkgdW5sZXNzIEBtb2RlIGluIFsndmlzdWFsJywgJ2luc2VydCddXG4gICAgQHJlc3RvcmVFZGl0b3JTdGF0ZT8oKVxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgQGZpbmlzaCgpXG5cbiAgaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXI6IChjaGFyKSAtPlxuICAgIGlmIEBpc0luY3JlbWVudGFsU2VhcmNoKClcbiAgICAgIGNoYXIgaXMgJydcbiAgICBlbHNlXG4gICAgICBzZWFyY2hDaGFyID0gaWYgQGlzQmFja3dhcmRzKCkgdGhlbiAnPycgZWxzZSAnLydcbiAgICAgIGNoYXIgaW4gWycnLCBzZWFyY2hDaGFyXVxuXG4gIGhhbmRsZUNvbmZpcm1TZWFyY2g6ICh7QGlucHV0LCBAbGFuZGluZ1BvaW50fSkgPT5cbiAgICBpZiBAaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIoQGlucHV0KVxuICAgICAgQGlucHV0ID0gQHZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KCdwcmV2JylcbiAgICAgIGF0b20uYmVlcCgpIHVubGVzcyBAaW5wdXRcbiAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgaGFuZGxlQ2hhbmdlU2VhcmNoOiAoaW5wdXQpIC0+XG4gICAgIyBJZiBpbnB1dCBzdGFydHMgd2l0aCBzcGFjZSwgcmVtb3ZlIGZpcnN0IHNwYWNlIGFuZCBkaXNhYmxlIHVzZVJlZ2V4cC5cbiAgICBpZiBpbnB1dC5zdGFydHNXaXRoKCcgJylcbiAgICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvXiAvLCAnJylcbiAgICAgIEB1c2VSZWdleHAgPSBmYWxzZVxuICAgIEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC51cGRhdGVPcHRpb25TZXR0aW5ncyh7QHVzZVJlZ2V4cH0pXG5cbiAgICBpZiBAaXNJbmNyZW1lbnRhbFNlYXJjaCgpXG4gICAgICBAc2VhcmNoKEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLCBpbnB1dCwgQGdldENvdW50KCkpXG5cbiAgZ2V0UGF0dGVybjogKHRlcm0pIC0+XG4gICAgbW9kaWZpZXJzID0gaWYgQGlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSB0aGVuICdnJyBlbHNlICdnaSdcbiAgICAjIEZJWE1FIHRoaXMgcHJldmVudCBzZWFyY2ggXFxcXGMgaXRzZWxmLlxuICAgICMgRE9OVCB0aGlua2xlc3NseSBtaW1pYyBwdXJlIFZpbS4gSW5zdGVhZCwgcHJvdmlkZSBpZ25vcmVjYXNlIGJ1dHRvbiBhbmQgc2hvcnRjdXQuXG4gICAgaWYgdGVybS5pbmRleE9mKCdcXFxcYycpID49IDBcbiAgICAgIHRlcm0gPSB0ZXJtLnJlcGxhY2UoJ1xcXFxjJywgJycpXG4gICAgICBtb2RpZmllcnMgKz0gJ2knIHVubGVzcyAnaScgaW4gbW9kaWZpZXJzXG5cbiAgICBpZiBAdXNlUmVnZXhwXG4gICAgICB0cnlcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAodGVybSwgbW9kaWZpZXJzKVxuICAgICAgY2F0Y2hcbiAgICAgICAgbnVsbFxuXG4gICAgbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0ZXJtKSwgbW9kaWZpZXJzKVxuXG5jbGFzcyBTZWFyY2hCYWNrd2FyZHMgZXh0ZW5kcyBTZWFyY2hcbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG4jICosICNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmQgZXh0ZW5kcyBTZWFyY2hCYXNlXG4gIEBleHRlbmQoKVxuICBjb25maWdTY29wZTogXCJTZWFyY2hDdXJyZW50V29yZFwiXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBAaW5wdXQgPz0gKFxuICAgICAgd29yZFJhbmdlID0gQGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgICAgaWYgd29yZFJhbmdlP1xuICAgICAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHdvcmRSYW5nZS5zdGFydClcbiAgICAgICAgQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZSh3b3JkUmFuZ2UpXG4gICAgICBlbHNlXG4gICAgICAgICcnXG4gICAgKVxuICAgIHN1cGVyXG5cbiAgZ2V0UGF0dGVybjogKHRlcm0pIC0+XG4gICAgbW9kaWZpZXJzID0gaWYgQGlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSB0aGVuICdnJyBlbHNlICdnaSdcbiAgICBwYXR0ZXJuID0gXy5lc2NhcGVSZWdFeHAodGVybSlcbiAgICBpZiAvXFxXLy50ZXN0KHRlcm0pXG4gICAgICBuZXcgUmVnRXhwKFwiI3twYXR0ZXJufVxcXFxiXCIsIG1vZGlmaWVycylcbiAgICBlbHNlXG4gICAgICBuZXcgUmVnRXhwKFwiXFxcXGIje3BhdHRlcm59XFxcXGJcIiwgbW9kaWZpZXJzKVxuXG4gIGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2U6IC0+XG4gICAgY3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBub25Xb3JkQ2hhcmFjdGVycyA9IGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgICB3b3JkUmVnZXggPSBuZXcgUmVnRXhwKFwiW15cXFxccyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIsICdnJylcblxuICAgIGZvdW5kID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCB3b3JkUmVnZXgsIHtmcm9tOiBbcG9pbnQucm93LCAwXSwgYWxsb3dOZXh0TGluZTogZmFsc2V9LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgIGZvdW5kXG5cbmNsYXNzIFNlYXJjaEN1cnJlbnRXb3JkQmFja3dhcmRzIGV4dGVuZHMgU2VhcmNoQ3VycmVudFdvcmRcbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkczogdHJ1ZVxuIl19
