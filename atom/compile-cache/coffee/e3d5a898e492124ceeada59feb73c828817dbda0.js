(function() {
  var Change, Delete, Insert, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertBelowWithNewline, Motions, Operator, ReplaceMode, settings, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Motions = require('../motions/index');

  _ref = require('./general-operators'), Operator = _ref.Operator, Delete = _ref.Delete;

  _ = require('underscore-plus');

  settings = require('../settings');

  Insert = (function(_super) {
    __extends(Insert, _super);

    function Insert() {
      return Insert.__super__.constructor.apply(this, arguments);
    }

    Insert.prototype.standalone = true;

    Insert.prototype.isComplete = function() {
      return this.standalone || Insert.__super__.isComplete.apply(this, arguments);
    };

    Insert.prototype.confirmChanges = function(changes) {
      if (changes.length > 0) {
        return this.typedText = changes[0].newText;
      } else {
        return this.typedText = "";
      }
    };

    Insert.prototype.execute = function() {
      var cursor, _i, _len, _ref1;
      if (this.typingCompleted) {
        if (!((this.typedText != null) && this.typedText.length > 0)) {
          return;
        }
        this.editor.insertText(this.typedText, {
          normalizeLineEndings: true,
          autoIndent: true
        });
        _ref1 = this.editor.getCursors();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          cursor = _ref1[_i];
          if (!cursor.isAtBeginningOfLine()) {
            cursor.moveLeft();
          }
        }
      } else {
        this.vimState.activateInsertMode();
        this.typingCompleted = true;
      }
    };

    Insert.prototype.inputOperator = function() {
      return true;
    };

    return Insert;

  })(Operator);

  ReplaceMode = (function(_super) {
    __extends(ReplaceMode, _super);

    function ReplaceMode() {
      return ReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ReplaceMode.prototype.execute = function() {
      if (this.typingCompleted) {
        if (!((this.typedText != null) && this.typedText.length > 0)) {
          return;
        }
        return this.editor.transact((function(_this) {
          return function() {
            var count, cursor, selection, toDelete, _i, _j, _len, _len1, _ref1, _ref2, _results;
            _this.editor.insertText(_this.typedText, {
              normalizeLineEndings: true
            });
            toDelete = _this.typedText.length - _this.countChars('\n', _this.typedText);
            _ref1 = _this.editor.getSelections();
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              selection = _ref1[_i];
              count = toDelete;
              while (count-- && !selection.cursor.isAtEndOfLine()) {
                selection["delete"]();
              }
            }
            _ref2 = _this.editor.getCursors();
            _results = [];
            for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
              cursor = _ref2[_j];
              if (!cursor.isAtBeginningOfLine()) {
                _results.push(cursor.moveLeft());
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          };
        })(this));
      } else {
        this.vimState.activateReplaceMode();
        return this.typingCompleted = true;
      }
    };

    ReplaceMode.prototype.countChars = function(char, string) {
      return string.split(char).length - 1;
    };

    return ReplaceMode;

  })(Insert);

  InsertAfter = (function(_super) {
    __extends(InsertAfter, _super);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.prototype.execute = function() {
      if (!this.editor.getLastCursor().isAtEndOfLine()) {
        this.editor.moveRight();
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(Insert);

  InsertAfterEndOfLine = (function(_super) {
    __extends(InsertAfterEndOfLine, _super);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(Insert);

  InsertAtBeginningOfLine = (function(_super) {
    __extends(InsertAtBeginningOfLine, _super);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(Insert);

  InsertAboveWithNewline = (function(_super) {
    __extends(InsertAboveWithNewline, _super);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.prototype.execute = function() {
      if (!this.typingCompleted) {
        this.vimState.setInsertionCheckpoint();
      }
      this.editor.insertNewlineAbove();
      this.editor.getLastCursor().skipLeadingWhitespace();
      if (this.typingCompleted) {
        this.typedText = this.typedText.trimLeft();
        return InsertAboveWithNewline.__super__.execute.apply(this, arguments);
      }
      this.vimState.activateInsertMode();
      return this.typingCompleted = true;
    };

    return InsertAboveWithNewline;

  })(Insert);

  InsertBelowWithNewline = (function(_super) {
    __extends(InsertBelowWithNewline, _super);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.prototype.execute = function() {
      if (!this.typingCompleted) {
        this.vimState.setInsertionCheckpoint();
      }
      this.editor.insertNewlineBelow();
      this.editor.getLastCursor().skipLeadingWhitespace();
      if (this.typingCompleted) {
        this.typedText = this.typedText.trimLeft();
        return InsertBelowWithNewline.__super__.execute.apply(this, arguments);
      }
      this.vimState.activateInsertMode();
      return this.typingCompleted = true;
    };

    return InsertBelowWithNewline;

  })(Insert);

  Change = (function(_super) {
    __extends(Change, _super);

    Change.prototype.standalone = false;

    Change.prototype.register = null;

    function Change(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.register = settings.defaultRegister();
    }

    Change.prototype.execute = function(count) {
      var selection, _base, _i, _j, _len, _len1, _ref1, _ref2;
      if (_.contains(this.motion.select(count, {
        excludeWhitespace: true
      }), true)) {
        if (!this.typingCompleted) {
          this.vimState.setInsertionCheckpoint();
        }
        this.setTextRegister(this.register, this.editor.getSelectedText());
        if ((typeof (_base = this.motion).isLinewise === "function" ? _base.isLinewise() : void 0) && !this.typingCompleted) {
          _ref1 = this.editor.getSelections();
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            selection = _ref1[_i];
            if (selection.getBufferRange().end.row === 0) {
              selection.deleteSelectedText();
            } else {
              selection.insertText("\n", {
                autoIndent: true
              });
            }
            selection.cursor.moveLeft();
          }
        } else {
          _ref2 = this.editor.getSelections();
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            selection = _ref2[_j];
            selection.deleteSelectedText();
          }
        }
        if (this.typingCompleted) {
          return Change.__super__.execute.apply(this, arguments);
        }
        this.vimState.activateInsertMode();
        return this.typingCompleted = true;
      } else {
        return this.vimState.activateNormalMode();
      }
    };

    return Change;

  })(Insert);

  module.exports = {
    Insert: Insert,
    InsertAfter: InsertAfter,
    InsertAfterEndOfLine: InsertAfterEndOfLine,
    InsertAtBeginningOfLine: InsertAtBeginningOfLine,
    InsertAboveWithNewline: InsertAboveWithNewline,
    InsertBelowWithNewline: InsertBelowWithNewline,
    ReplaceMode: ReplaceMode,
    Change: Change
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvb3BlcmF0b3JzL2lucHV0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxTEFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxrQkFBUixDQUFWLENBQUE7O0FBQUEsRUFDQSxPQUFxQixPQUFBLENBQVEscUJBQVIsQ0FBckIsRUFBQyxnQkFBQSxRQUFELEVBQVcsY0FBQSxNQURYLENBQUE7O0FBQUEsRUFFQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBRkosQ0FBQTs7QUFBQSxFQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUhYLENBQUE7O0FBQUEsRUFTTTtBQUNKLDZCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxxQkFBQSxVQUFBLEdBQVksSUFBWixDQUFBOztBQUFBLHFCQUVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsVUFBRCxJQUFlLHdDQUFBLFNBQUEsRUFBbEI7SUFBQSxDQUZaLENBQUE7O0FBQUEscUJBSUEsY0FBQSxHQUFnQixTQUFDLE9BQUQsR0FBQTtBQUNkLE1BQUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtlQUNFLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBRDFCO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FIZjtPQURjO0lBQUEsQ0FKaEIsQ0FBQTs7QUFBQSxxQkFVQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSx1QkFBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsZUFBSjtBQUNFLFFBQUEsSUFBQSxDQUFBLENB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/operators/input.coffee
