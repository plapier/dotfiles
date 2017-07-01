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

    Blackspace.prototype.newline = function(e, arg) {
      var above, buffer, currentRow, cursor, editor;
      above = (arg != null ? arg : {}).above;
      editor = this.atom.workspace.getActiveTextEditor();
      if (editor) {
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
      } else {
        return e.abortKeyBinding();
      }
    };

    return Blackspace;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9ibGFja3NwYWNlL2xpYi9ibGFja3NwYWNlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFDUixJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FBVyxJQUFYO0lBRFYsQ0FBVjs7O0VBR0k7SUFDUyxvQkFBQyxJQUFEO01BQ1gsSUFBQyxDQUFBLElBQUQsR0FBUTtNQUNSLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWYsQ0FBbUIsa0JBQW5CLEVBQ0U7UUFBQSxvQkFBQSxFQUFzQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLENBQUQ7bUJBQU8sS0FBQyxDQUFBLE9BQUQsQ0FBUyxDQUFUO1VBQVA7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO1FBQ0EsMEJBQUEsRUFBNEIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxDQUFEO21CQUFPLEtBQUMsQ0FBQSxPQUFELENBQVMsQ0FBVCxFQUFZO2NBQUMsS0FBQSxFQUFPLElBQVI7YUFBWjtVQUFQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUQ1QjtPQURGO0lBRlc7O3lCQU1iLE9BQUEsR0FBUyxTQUFDLENBQUQsRUFBSSxHQUFKO0FBQ1AsVUFBQTtNQURZLHVCQUFELE1BQVE7TUFDbkIsTUFBQSxHQUFTLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFoQixDQUFBO01BQ1QsSUFBRyxNQUFIO1FBQ0UsTUFBQSxHQUFTLE1BQU0sQ0FBQyxTQUFQLENBQUE7UUFDVCxNQUFBLEdBQVMsTUFBTSxDQUFDLGFBQVAsQ0FBQTtRQUNULFVBQUEsR0FBYSxNQUFNLENBQUMsWUFBUCxDQUFBO1FBQ2IsSUFBRyxNQUFNLENBQUMsVUFBUCxDQUFrQixVQUFsQixDQUFIO2lCQUNFLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFNBQUE7QUFDZCxnQkFBQTtZQUFBLFFBQUEsR0FBVyxNQUFNLENBQUMsV0FBUCxDQUFtQixVQUFuQixFQUErQixLQUEvQjtZQUNYLE9BQUEsR0FBVSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsUUFBNUI7WUFDVixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsUUFBNUIsRUFBc0MsRUFBdEM7WUFDQSxJQUFHLEtBQUg7Y0FDRSxNQUFNLENBQUMsVUFBUCxDQUFrQixPQUFBLEdBQVUsSUFBNUIsRUFBa0M7Z0JBQUMsVUFBQSxFQUFZLEtBQWI7ZUFBbEM7Y0FDQSxNQUFNLENBQUMsTUFBUCxDQUFBO3FCQUNBLE1BQU0sQ0FBQyxlQUFQLENBQUEsRUFIRjthQUFBLE1BQUE7cUJBS0UsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBQSxHQUFPLE9BQXpCLEVBQWtDO2dCQUFDLFVBQUEsRUFBWSxLQUFiO2VBQWxDLEVBTEY7O1VBSmMsQ0FBaEIsRUFERjtTQUFBLE1BQUE7aUJBWUUsQ0FBQyxDQUFDLGVBQUYsQ0FBQSxFQVpGO1NBSkY7T0FBQSxNQUFBO2VBa0JFLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFsQkY7O0lBRk87Ozs7O0FBWFgiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGJsYWNrc3BhY2UgPSBuZXcgQmxhY2tzcGFjZShhdG9tKVxuXG5jbGFzcyBCbGFja3NwYWNlXG4gIGNvbnN0cnVjdG9yOiAoYXRvbSkgLT5cbiAgICBAYXRvbSA9IGF0b21cbiAgICBAYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2JsYWNrc3BhY2U6bmV3bGluZSc6IChlKSA9PiBAbmV3bGluZShlKVxuICAgICAgJ2JsYWNrc3BhY2U6bmV3bGluZS1hYm92ZSc6IChlKSA9PiBAbmV3bGluZShlLCB7YWJvdmU6IHRydWV9KVxuXG4gIG5ld2xpbmU6IChlLCB7YWJvdmV9PXt9KSAtPlxuICAgIGVkaXRvciA9IEBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBlZGl0b3JcbiAgICAgIGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgICAgY3VycmVudFJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgICAgaWYgYnVmZmVyLmlzUm93QmxhbmsoY3VycmVudFJvdylcbiAgICAgICAgZWRpdG9yLnRyYW5zYWN0IC0+XG4gICAgICAgICAgcm93UmFuZ2UgPSBidWZmZXIucmFuZ2VGb3JSb3coY3VycmVudFJvdywgZmFsc2UpXG4gICAgICAgICAgcm93VGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyb3dSYW5nZSlcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2Uocm93UmFuZ2UsICcnKVxuICAgICAgICAgIGlmIGFib3ZlXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChyb3dUZXh0ICsgXCJcXG5cIiwge2F1dG9JbmRlbnQ6IGZhbHNlfSlcbiAgICAgICAgICAgIGN1cnNvci5tb3ZlVXAoKVxuICAgICAgICAgICAgY3Vyc29yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJcXG5cIiArIHJvd1RleHQsIHthdXRvSW5kZW50OiBmYWxzZX0pXG4gICAgICBlbHNlXG4gICAgICAgIGUuYWJvcnRLZXlCaW5kaW5nKClcbiAgICBlbHNlXG4gICAgICBlLmFib3J0S2V5QmluZGluZygpXG4iXX0=
