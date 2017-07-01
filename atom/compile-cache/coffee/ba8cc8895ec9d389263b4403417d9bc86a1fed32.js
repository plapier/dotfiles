(function() {
  var Delete, Join, LowerCase, Mark, Operator, OperatorError, OperatorWithInput, Point, Range, Repeat, ToggleCase, UpperCase, Utils, ViewModel, Yank, settings, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  ViewModel = require('../view-models/view-model').ViewModel;

  Utils = require('../utils');

  settings = require('../settings');

  OperatorError = (function() {
    function OperatorError(message) {
      this.message = message;
      this.name = 'Operator Error';
    }

    return OperatorError;

  })();

  Operator = (function() {
    Operator.prototype.vimState = null;

    Operator.prototype.motion = null;

    Operator.prototype.complete = null;

    function Operator(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = false;
    }

    Operator.prototype.isComplete = function() {
      return this.complete;
    };

    Operator.prototype.isRecordable = function() {
      return true;
    };

    Operator.prototype.compose = function(motion) {
      if (!motion.select) {
        throw new OperatorError('Must compose with a motion');
      }
      this.motion = motion;
      return this.complete = true;
    };

    Operator.prototype.canComposeWith = function(operation) {
      return operation.select != null;
    };

    Operator.prototype.setTextRegister = function(register, text) {
      var type, _ref1;
      if ((_ref1 = this.motion) != null ? typeof _ref1.isLinewise === "function" ? _ref1.isLinewise() : void 0 : void 0) {
        type = 'linewise';
        if (text.slice(-1) !== '\n') {
          text += '\n';
        }
      } else {
        type = Utils.copyType(text);
      }
      if (text !== '') {
        return this.vimState.setRegister(register, {
          text: text,
          type: type
        });
      }
    };

    return Operator;

  })();

  OperatorWithInput = (function(_super) {
    __extends(OperatorWithInput, _super);

    function OperatorWithInput(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.editor = this.editor;
      this.complete = false;
    }

    OperatorWithInput.prototype.canComposeWith = function(operation) {
      return (operation.characters != null) || (operation.select != null);
    };

    OperatorWithInput.prototype.compose = function(operation) {
      if (operation.select != null) {
        this.motion = operation;
      }
      if (operation.characters != null) {
        this.input = operation;
        return this.complete = true;
      }
    };

    return OperatorWithInput;

  })(Operator);

  Delete = (function(_super) {
    __extends(Delete, _super);

    Delete.prototype.register = null;

    function Delete(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = false;
      this.register = settings.defaultRegister();
    }

    Delete.prototype.execute = function(count) {
      var cursor, _base, _i, _len, _ref1;
      if (_.contains(this.motion.select(count), true)) {
        this.setTextRegister(this.register, this.editor.getSelectedText());
        this.editor.transact((function(_this) {
          return function() {
            var selection, _i, _len, _ref1, _results;
            _ref1 = _this.editor.getSelections();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              selection = _ref1[_i];
              _results.push(selection.deleteSelectedText());
            }
            return _results;
          };
        })(this));
        _ref1 = this.editor.getCursors();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          cursor = _ref1[_i];
          if (typeof (_base = this.motion).isLinewise === "function" ? _base.isLinewise() : void 0) {
            cursor.skipLeadingWhitespace();
          } else {
            if (cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine()) {
              cursor.moveLeft();
            }
          }
        }
      }
      return this.vimState.activateNormalMode();
    };

    return Delete;

  })(Operator);

  ToggleCase = (function(_super) {
    __extends(ToggleCase, _super);

    function ToggleCase(editor, vimState, _arg) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = (_arg != null ? _arg : {}).complete;
    }

    ToggleCase.prototype.execute = function(count) {
      if (this.motion != null) {
        if (_.contains(this.motion.select(count), true)) {
          this.editor.replaceSelectedText({}, function(text) {
            return text.split('').map(function(char) {
              var lower;
              lower = char.toLowerCase();
              if (char === lower) {
                return char.toUpperCase();
              } else {
                return lower;
              }
            }).join('');
          });
        }
      } else {
        this.editor.transact((function(_this) {
          return function() {
            var cursor, cursorCount, lineLength, point, _i, _len, _ref1, _results;
            _ref1 = _this.editor.getCursors();
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              cursor = _ref1[_i];
              point = cursor.getBufferPosition();
              lineLength = _this.editor.lineTextForBufferRow(point.row).length;
              cursorCount = Math.min(count != null ? count : 1, lineLength - point.column);
              _results.push(_.times(cursorCount, function() {
                var char, range;
                point = cursor.getBufferPosition();
                range = Range.fromPointWithDelta(point, 0, 1);
                char = _this.editor.getTextInBufferRange(range);
                if (char === char.toLowerCase()) {
                  _this.editor.setTextInBufferRange(range, char.toUpperCase());
                } else {
                  _this.editor.setTextInBufferRange(range, char.toLowerCase());
                }
                if (!(point.column >= lineLength - 1)) {
                  return cursor.moveRight();
                }
              }));
            }
            return _results;
          };
        })(this));
      }
      return this.vimState.activateNormalMode();
    };

    return ToggleCase;

  })(Operator);

  UpperCase = (function(_super) {
    __extends(UpperCase, _super);

    function UpperCase(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = false;
    }

    UpperCase.prototype.execute = function(count) {
      if (_.contains(this.motion.select(count), true)) {
        this.editor.replaceSelectedText({}, function(text) {
          return text.toUpperCase();
        });
      }
      return this.vimState.activateNormalMode();
    };

    return UpperCase;

  })(Operator);

  LowerCase = (function(_super) {
    __extends(LowerCase, _super);

    function LowerCase(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = false;
    }

    LowerCase.prototype.execute = function(count) {
      if (_.contains(this.motion.select(count), true)) {
        this.editor.replaceSelectedText({}, function(text) {
          return text.toLowerCase();
        });
      }
      return this.vimState.activateNormalMode();
    };

    return LowerCase;

  })(Operator);

  Yank = (function(_super) {
    __extends(Yank, _super);

    Yank.prototype.register = null;

    function Yank(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.editorElement = atom.views.getView(this.editor);
      this.register = settings.defaultRegister();
    }

    Yank.prototype.execute = function(count) {
      var i, newPositions, oldLastCursorPosition, oldLeft, oldTop, originalPosition, originalPositions, position, startPositions, text;
      oldTop = this.editorElement.getScrollTop();
      oldLeft = this.editorElement.getScrollLeft();
      oldLastCursorPosition = this.editor.getCursorBufferPosition();
      originalPositions = this.editor.getCursorBufferPositions();
      if (_.contains(this.motion.select(count), true)) {
        text = this.editor.getSelectedText();
        startPositions = _.pluck(this.editor.getSelectedBufferRanges(), "start");
        newPositions = (function() {
          var _base, _i, _len, _results;
          _results = [];
          for (i = _i = 0, _len = originalPositions.length; _i < _len; i = ++_i) {
            originalPosition = originalPositions[i];
            if (startPositions[i]) {
              position = Point.min(startPositions[i], originalPositions[i]);
              if (this.vimState.mode !== 'visual' && (typeof (_base = this.motion).isLinewise === "function" ? _base.isLinewise() : void 0)) {
                position = new Point(position.row, originalPositions[i].column);
              }
              _results.push(position);
            } else {
              _results.push(originalPosition);
            }
          }
          return _results;
        }).call(this);
      } else {
        text = '';
        newPositions = originalPositions;
      }
      this.setTextRegister(this.register, text);
      this.editor.setSelectedBufferRanges(newPositions.map(function(p) {
        return new Range(p, p);
      }));
      if (oldLastCursorPosition.isEqual(this.editor.getCursorBufferPosition())) {
        this.editorElement.setScrollLeft(oldLeft);
        this.editorElement.setScrollTop(oldTop);
      }
      return this.vimState.activateNormalMode();
    };

    return Yank;

  })(Operator);

  Join = (function(_super) {
    __extends(Join, _super);

    function Join(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = true;
    }

    Join.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      this.editor.transact((function(_this) {
        return function() {
          return _.times(count, function() {
            return _this.editor.joinLines();
          });
        };
      })(this));
      return this.vimState.activateNormalMode();
    };

    return Join;

  })(Operator);

  Repeat = (function(_super) {
    __extends(Repeat, _super);

    function Repeat(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = true;
    }

    Repeat.prototype.isRecordable = function() {
      return false;
    };

    Repeat.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      return this.editor.transact((function(_this) {
        return function() {
          return _.times(count, function() {
            var cmd;
            cmd = _this.vimState.history[0];
            return cmd != null ? cmd.execute() : void 0;
          });
        };
      })(this));
    };

    return Repeat;

  })(Operator);

  Mark = (function(_super) {
    __extends(Mark, _super);

    function Mark(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      Mark.__super__.constructor.call(this, this.editor, this.vimState);
      this.viewModel = new ViewModel(this, {
        "class": 'mark',
        singleChar: true,
        hidden: true
      });
    }

    Mark.prototype.execute = function() {
      this.vimState.setMark(this.input.characters, this.editor.getCursorBufferPosition());
      return this.vimState.activateNormalMode();
    };

    return Mark;

  })(OperatorWithInput);

  module.exports = {
    Operator: Operator,
    OperatorWithInput: OperatorWithInput,
    OperatorError: OperatorError,
    Delete: Delete,
    ToggleCase: ToggleCase,
    UpperCase: UpperCase,
    LowerCase: LowerCase,
    Yank: Yank,
    Join: Join,
    Repeat: Repeat,
    Mark: Mark
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvb3BlcmF0b3JzL2dlbmVyYWwtb3BlcmF0b3JzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpS0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBRUMsWUFBYSxPQUFBLENBQVEsMkJBQVIsRUFBYixTQUZELENBQUE7O0FBQUEsRUFHQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVIsQ0FIUixDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBSlgsQ0FBQTs7QUFBQSxFQU1NO0FBQ1MsSUFBQSx1QkFBRSxPQUFGLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxVQUFBLE9BQ2IsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLElBQUQsR0FBUSxnQkFBUixDQURXO0lBQUEsQ0FBYjs7eUJBQUE7O01BUEYsQ0FBQTs7QUFBQSxFQVVNO0FBQ0osdUJBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFBQSx1QkFDQSxNQUFBLEdBQVEsSUFEUixDQUFBOztBQUFBLHVCQUVBLFFBQUEsR0FBVSxJQUZWLENBQUE7O0FBSWEsSUFBQSxrQkFBRSxNQUFGLEVBQVcsUUFBWCxHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQURxQixJQUFDLENBQUEsV0FBQSxRQUN0QixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLEtBQVosQ0FEVztJ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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/operators/general-operators.coffee
