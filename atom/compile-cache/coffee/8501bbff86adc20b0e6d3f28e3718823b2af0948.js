(function() {
  var Operator, Put, settings, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Operator = require('./general-operators').Operator;

  settings = require('../settings');

  module.exports = Put = (function(_super) {
    __extends(Put, _super);

    Put.prototype.register = null;

    function Put(editor, vimState, _arg) {
      this.editor = editor;
      this.vimState = vimState;
      this.location = (_arg != null ? _arg : {}).location;
      if (this.location == null) {
        this.location = 'after';
      }
      this.complete = true;
      this.register = settings.defaultRegister();
    }

    Put.prototype.execute = function(count) {
      var originalPosition, selection, text, textToInsert, type, _ref;
      if (count == null) {
        count = 1;
      }
      _ref = this.vimState.getRegister(this.register) || {}, text = _ref.text, type = _ref.type;
      if (!text) {
        return;
      }
      textToInsert = _.times(count, function() {
        return text;
      }).join('');
      selection = this.editor.getSelectedBufferRange();
      if (selection.isEmpty()) {
        if (type === 'linewise') {
          textToInsert = textToInsert.replace(/\n$/, '');
          if (this.location === 'after' && this.onLastRow()) {
            textToInsert = "\n" + textToInsert;
          } else {
            textToInsert = "" + textToInsert + "\n";
          }
        }
        if (this.location === 'after') {
          if (type === 'linewise') {
            if (this.onLastRow()) {
              this.editor.moveToEndOfLine();
              originalPosition = this.editor.getCursorScreenPosition();
              originalPosition.row += 1;
            } else {
              this.editor.moveDown();
            }
          } else {
            if (!this.onLastColumn()) {
              this.editor.moveRight();
            }
          }
        }
        if (type === 'linewise' && (originalPosition == null)) {
          this.editor.moveToBeginningOfLine();
          originalPosition = this.editor.getCursorScreenPosition();
        }
      }
      this.editor.insertText(textToInsert);
      if (originalPosition != null) {
        this.editor.setCursorScreenPosition(originalPosition);
        this.editor.moveToFirstCharacterOfLine();
      }
      if (type !== 'linewise') {
        this.editor.moveLeft();
      }
      return this.vimState.activateNormalMode();
    };

    Put.prototype.onLastRow = function() {
      var column, row, _ref;
      _ref = this.editor.getCursorBufferPosition(), row = _ref.row, column = _ref.column;
      return row === this.editor.getBuffer().getLastRow();
    };

    Put.prototype.onLastColumn = function() {
      return this.editor.getLastCursor().isAtEndOfLine();
    };

    return Put;

  })(Operator);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvb3BlcmF0b3JzL3B1dC1vcGVyYXRvci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMEJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0MsV0FBWSxPQUFBLENBQVEscUJBQVIsRUFBWixRQURELENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FGWCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FJTTtBQUNKLDBCQUFBLENBQUE7O0FBQUEsa0JBQUEsUUFBQSxHQUFVLElBQVYsQ0FBQTs7QUFFYSxJQUFBLGFBQUUsTUFBRixFQUFXLFFBQVgsRUFBcUIsSUFBckIsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFEcUIsSUFBQyxDQUFBLFdBQUEsUUFDdEIsQ0FBQTtBQUFBLE1BRGlDLElBQUMsQ0FBQSwyQkFBRixPQUFZLElBQVYsUUFDbEMsQ0FBQTs7UUFBQSxJQUFDLENBQUEsV0FBWTtPQUFiO0FBQUEsTUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBRFosQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxRQUFRLENBQUMsZUFBVCxDQUFBLENBRlosQ0FEVztJQUFBLENBRmI7O0FBQUEsa0JBWUEsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBO0FBQ1AsVUFBQSwyREFBQTs7UUFEUSxRQUFNO09BQ2Q7QUFBQSxNQUFBLE9BQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFWLENBQXNCLElBQUMsQ0FBQSxRQUF2QixDQUFBLElB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/operators/put-operator.coffee
