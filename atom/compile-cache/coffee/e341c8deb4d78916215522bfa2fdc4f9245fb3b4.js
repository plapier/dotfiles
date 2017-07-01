(function() {
  var Blackspace;

  module.exports = {
    activate: function(state) {
      return this.blackspace = new Blackspace(atom);
    }
  };

  Blackspace = (function() {
    function Blackspace(atom) {
      this.atom = atom;
      this.atom.commands.add('atom-text-editor', {
        'blackspace:newline': (function(_this) {
          return function(e) {
            return _this.newline(e);
          };
        })(this),
        'blackspace:newline-above': (function(_this) {
          return function(e) {
            return _this.newline(e, {
              above: true
            });
          };
        })(this)
      });
    }

    Blackspace.prototype.newline = function(e, _arg) {
      var above, buffer, currentRow, cursor, editor;
      above = (_arg != null ? _arg : {}).above;
      editor = this.atom.workspace.getActiveTextEditor();
      buffer = editor.getBuffer();
      cursor = editor.getLastCursor();
      currentRow = cursor.getBufferRow();
      if (buffer.isRowBlank(currentRow)) {
        return editor.transact(function() {
          var rowRange, rowText;
          rowRange = buffer.rangeForRow(currentRow, false);
          rowText = editor.getTextInBufferRange(rowRange);
          editor.setTextInBufferRange(rowRange, '');
          if (above) {
            editor.insertText(rowText + "\n", {
              autoIndent: false
            });
            cursor.moveUp();
            return cursor.moveToEndOfLine();
          } else {
            return editor.insertText("\n" + rowText, {
              autoIndent: false
            });
          }
        });
      } else {
        return e.abortKeyBinding();
      }
    };

    return Blackspace;

  })();

}).call(this);
