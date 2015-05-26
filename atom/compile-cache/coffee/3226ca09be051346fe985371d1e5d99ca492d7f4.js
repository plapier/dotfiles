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
        'blackspace:strip-auto-whitespace': (function(_this) {
          return function(e) {
            return _this.strip(e);
          };
        })(this)
      });
    }

    Blackspace.prototype.strip = function(e) {
      var buffer, currentRow, cursor, editor;
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
          return editor.insertText("\n" + rowText, {
            autoIndent: false
          });
        });
      } else {
        return e.abortKeyBinding();
      }
    };

    return Blackspace;

  })();

}).call(this);
