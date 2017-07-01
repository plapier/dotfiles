(function() {
  var AllWhitespace, Paragraph, Range, SelectAParagraph, SelectAWholeWord, SelectAWord, SelectInsideBrackets, SelectInsideParagraph, SelectInsideQuotes, SelectInsideWholeWord, SelectInsideWord, TextObject, WholeWordRegex, mergeRanges,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  AllWhitespace = /^\s$/;

  WholeWordRegex = /\S+/;

  mergeRanges = require('./utils').mergeRanges;

  TextObject = (function() {
    function TextObject(editor, state) {
      this.editor = editor;
      this.state = state;
    }

    TextObject.prototype.isComplete = function() {
      return true;
    };

    TextObject.prototype.isRecordable = function() {
      return false;
    };

    TextObject.prototype.execute = function() {
      return this.select.apply(this, arguments);
    };

    return TextObject;

  })();

  SelectInsideWord = (function(_super) {
    __extends(SelectInsideWord, _super);

    function SelectInsideWord() {
      return SelectInsideWord.__super__.constructor.apply(this, arguments);
    }

    SelectInsideWord.prototype.select = function() {
      var selection, _i, _len, _ref;
      _ref = this.editor.getSelections();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        if (selection.isEmpty()) {
          selection.selectRight();
        }
        selection.expandOverWord();
      }
      return [true];
    };

    return SelectInsideWord;

  })(TextObject);

  SelectInsideWholeWord = (function(_super) {
    __extends(SelectInsideWholeWord, _super);

    function SelectInsideWholeWord() {
      return SelectInsideWholeWord.__super__.constructor.apply(this, arguments);
    }

    SelectInsideWholeWord.prototype.select = function() {
      var range, selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        range = selection.cursor.getCurrentWordBufferRange({
          wordRegex: WholeWordRegex
        });
        selection.setBufferRange(mergeRanges(selection.getBufferRange(), range));
        _results.push(true);
      }
      return _results;
    };

    return SelectInsideWholeWord;

  })(TextObject);

  SelectInsideQuotes = (function(_super) {
    __extends(SelectInsideQuotes, _super);

    function SelectInsideQuotes(editor, char, includeQuotes) {
      this.editor = editor;
      this.char = char;
      this.includeQuotes = includeQuotes;
    }

    SelectInsideQuotes.prototype.findOpeningQuote = function(pos) {
      var line, start;
      start = pos.copy();
      pos = pos.copy();
      while (pos.row >= 0) {
        line = this.editor.lineTextForBufferRow(pos.row);
        if (pos.column === -1) {
          pos.column = line.length - 1;
        }
        while (pos.column >= 0) {
          if (line[pos.column] === this.char) {
            if (pos.column === 0 || line[pos.column - 1] !== '\\') {
              if (this.isStartQuote(pos)) {
                return pos;
              } else {
                return this.lookForwardOnLine(start);
              }
            }
          }
          --pos.column;
        }
        pos.column = -1;
        --pos.row;
      }
      return this.lookForwardOnLine(start);
    };

    SelectInsideQuotes.prototype.isStartQuote = function(end) {
      var line, numQuotes;
      line = this.editor.lineTextForBufferRow(end.row);
      numQuotes = line.substring(0, end.column + 1).replace("'" + this.char, '').split(this.char).length - 1;
      return numQuotes % 2;
    };

    SelectInsideQuotes.prototype.lookForwardOnLine = function(pos) {
      var index, line;
      line = this.editor.lineTextForBufferRow(pos.row);
      index = line.substring(pos.column).indexOf(this.char);
      if (index >= 0) {
        pos.column += index;
        return pos;
      }
      return null;
    };

    SelectInsideQuotes.prototype.findClosingQuote = function(start) {
      var end, endLine, escaping;
      end = start.copy();
      escaping = false;
      while (end.row < this.editor.getLineCount()) {
        endLine = this.editor.lineTextForBufferRow(end.row);
        while (end.column < endLine.length) {
          if (endLine[end.column] === '\\') {
            ++end.column;
          } else if (endLine[end.column] === this.char) {
            if (this.includeQuotes) {
              --start.column;
            }
            if (this.includeQuotes) {
              ++end.column;
            }
            return end;
          }
          ++end.column;
        }
        end.column = 0;
        ++end.row;
      }
    };

    SelectInsideQuotes.prototype.select = function() {
      var end, selection, start, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        start = this.findOpeningQuote(selection.cursor.getBufferPosition());
        if (start != null) {
          ++start.column;
          end = this.findClosingQuote(start);
          if (end != null) {
            selection.setBufferRange(mergeRanges(selection.getBufferRange(), [start, end]));
          }
        }
        _results.push(!selection.isEmpty());
      }
      return _results;
    };

    return SelectInsideQuotes;

  })(TextObject);

  SelectInsideBrackets = (function(_super) {
    __extends(SelectInsideBrackets, _super);

    function SelectInsideBrackets(editor, beginChar, endChar, includeBrackets) {
      this.editor = editor;
      this.beginChar = beginChar;
      this.endChar = endChar;
      this.includeBrackets = includeBrackets;
    }

    SelectInsideBrackets.prototype.findOpeningBracket = function(pos) {
      var depth, line;
      pos = pos.copy();
      depth = 0;
      while (pos.row >= 0) {
        line = this.editor.lineTextForBufferRow(pos.row);
        if (pos.column === -1) {
          pos.column = line.length - 1;
        }
        while (pos.column >= 0) {
          switch (line[pos.column]) {
            case this.endChar:
              ++depth;
              break;
            case this.beginChar:
              if (--depth < 0) {
                return pos;
              }
          }
          --pos.column;
        }
        pos.column = -1;
        --pos.row;
      }
    };

    SelectInsideBrackets.prototype.findClosingBracket = function(start) {
      var depth, end, endLine;
      end = start.copy();
      depth = 0;
      while (end.row < this.editor.getLineCount()) {
        endLine = this.editor.lineTextForBufferRow(end.row);
        while (end.column < endLine.length) {
          switch (endLine[end.column]) {
            case this.beginChar:
              ++depth;
              break;
            case this.endChar:
              if (--depth < 0) {
                if (this.includeBrackets) {
                  --start.column;
                }
                if (this.includeBrackets) {
                  ++end.column;
                }
                return end;
              }
          }
          ++end.column;
        }
        end.column = 0;
        ++end.row;
      }
    };

    SelectInsideBrackets.prototype.select = function() {
      var end, selection, start, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        start = this.findOpeningBracket(selection.cursor.getBufferPosition());
        if (start != null) {
          ++start.column;
          end = this.findClosingBracket(start);
          if (end != null) {
            selection.setBufferRange(mergeRanges(selection.getBufferRange(), [start, end]));
          }
        }
        _results.push(!selection.isEmpty());
      }
      return _results;
    };

    return SelectInsideBrackets;

  })(TextObject);

  SelectAWord = (function(_super) {
    __extends(SelectAWord, _super);

    function SelectAWord() {
      return SelectAWord.__super__.constructor.apply(this, arguments);
    }

    SelectAWord.prototype.select = function() {
      var char, endPoint, selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        if (selection.isEmpty()) {
          selection.selectRight();
        }
        selection.expandOverWord();
        while (true) {
          endPoint = selection.getBufferRange().end;
          char = this.editor.getTextInRange(Range.fromPointWithDelta(endPoint, 0, 1));
          if (!AllWhitespace.test(char)) {
            break;
          }
          selection.selectRight();
        }
        _results.push(true);
      }
      return _results;
    };

    return SelectAWord;

  })(TextObject);

  SelectAWholeWord = (function(_super) {
    __extends(SelectAWholeWord, _super);

    function SelectAWholeWord() {
      return SelectAWholeWord.__super__.constructor.apply(this, arguments);
    }

    SelectAWholeWord.prototype.select = function() {
      var char, endPoint, range, selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        range = selection.cursor.getCurrentWordBufferRange({
          wordRegex: WholeWordRegex
        });
        selection.setBufferRange(mergeRanges(selection.getBufferRange(), range));
        while (true) {
          endPoint = selection.getBufferRange().end;
          char = this.editor.getTextInRange(Range.fromPointWithDelta(endPoint, 0, 1));
          if (!AllWhitespace.test(char)) {
            break;
          }
          selection.selectRight();
        }
        _results.push(true);
      }
      return _results;
    };

    return SelectAWholeWord;

  })(TextObject);

  Paragraph = (function(_super) {
    __extends(Paragraph, _super);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.prototype.select = function() {
      var selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        _results.push(this.selectParagraph(selection));
      }
      return _results;
    };

    Paragraph.prototype.paragraphDelimitedRange = function(startPoint) {
      var inParagraph, lowerRow, upperRow;
      inParagraph = this.isParagraphLine(this.editor.lineTextForBufferRow(startPoint.row));
      upperRow = this.searchLines(startPoint.row, -1, inParagraph);
      lowerRow = this.searchLines(startPoint.row, this.editor.getLineCount(), inParagraph);
      return new Range([upperRow + 1, 0], [lowerRow, 0]);
    };

    Paragraph.prototype.searchLines = function(startRow, rowLimit, startedInParagraph) {
      var currentRow, line, _i;
      for (currentRow = _i = startRow; startRow <= rowLimit ? _i <= rowLimit : _i >= rowLimit; currentRow = startRow <= rowLimit ? ++_i : --_i) {
        line = this.editor.lineTextForBufferRow(currentRow);
        if (startedInParagraph !== this.isParagraphLine(line)) {
          return currentRow;
        }
      }
      return rowLimit;
    };

    Paragraph.prototype.isParagraphLine = function(line) {
      return /\S/.test(line);
    };

    return Paragraph;

  })(TextObject);

  SelectInsideParagraph = (function(_super) {
    __extends(SelectInsideParagraph, _super);

    function SelectInsideParagraph() {
      return SelectInsideParagraph.__super__.constructor.apply(this, arguments);
    }

    SelectInsideParagraph.prototype.selectParagraph = function(selection) {
      var newRange, oldRange, startPoint;
      oldRange = selection.getBufferRange();
      startPoint = selection.cursor.getBufferPosition();
      newRange = this.paragraphDelimitedRange(startPoint);
      selection.setBufferRange(mergeRanges(oldRange, newRange));
      return true;
    };

    return SelectInsideParagraph;

  })(Paragraph);

  SelectAParagraph = (function(_super) {
    __extends(SelectAParagraph, _super);

    function SelectAParagraph() {
      return SelectAParagraph.__super__.constructor.apply(this, arguments);
    }

    SelectAParagraph.prototype.selectParagraph = function(selection) {
      var newRange, nextRange, oldRange, startPoint;
      oldRange = selection.getBufferRange();
      startPoint = selection.cursor.getBufferPosition();
      newRange = this.paragraphDelimitedRange(startPoint);
      nextRange = this.paragraphDelimitedRange(newRange.end);
      selection.setBufferRange(mergeRanges(oldRange, [newRange.start, nextRange.end]));
      return true;
    };

    return SelectAParagraph;

  })(Paragraph);

  module.exports = {
    TextObject: TextObject,
    SelectInsideWord: SelectInsideWord,
    SelectInsideWholeWord: SelectInsideWholeWord,
    SelectInsideQuotes: SelectInsideQuotes,
    SelectInsideBrackets: SelectInsideBrackets,
    SelectAWord: SelectAWord,
    SelectAWholeWord: SelectAWholeWord,
    SelectInsideParagraph: SelectInsideParagraph,
    SelectAParagraph: SelectAParagraph
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvdGV4dC1vYmplY3RzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtT0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsTUFEaEIsQ0FBQTs7QUFBQSxFQUVBLGNBQUEsR0FBaUIsS0FGakIsQ0FBQTs7QUFBQSxFQUdDLGNBQWUsT0FBQSxDQUFRLFNBQVIsRUFBZixXQUhELENBQUE7O0FBQUEsRUFLTTtBQUNTLElBQUEsb0JBQUUsTUFBRixFQUFXLEtBQVgsR0FBQTtBQUFtQixNQUFsQixJQUFDLENBQUEsU0FBQSxNQUFpQixDQUFBO0FBQUEsTUFBVCxJQUFDLENBQUEsUUFBQSxLQUFRLENBQW5CO0lBQUEsQ0FBYjs7QUFBQSx5QkFFQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQUcsS0FBSDtJQUFBLENBRlosQ0FBQTs7QUFBQSx5QkFHQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQUcsTUFBSDtJQUFBLENBSGQsQ0FBQTs7QUFBQSx5QkFLQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBZCxFQUFvQixTQUFwQixFQUFIO0lBQUEsQ0FMVCxDQUFBOztzQkFBQTs7TUFORixDQUFBOztBQUFBLEVBYU07QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsK0JBQUEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFVBQUEseUJBQUE7QUFBQTtBQUFBLFdBQUEsMkNBQUE7NkJBQUE7QUFDRSxRQUFBLElBQUcsU0FBUyxDQUFDLE9BQVYsQ0FBQSxD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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/text-objects.coffee
