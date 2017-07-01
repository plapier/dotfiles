(function() {
  var helpers;

  helpers = require('./spec-helper');

  describe("Insert mode commands", function() {
    var editor, editorElement, keydown, vimState, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], vimState = _ref[2];
    beforeEach(function() {
      var vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      vimMode.activateResources();
      return helpers.getEditorElement(function(element) {
        editorElement = element;
        editor = editorElement.getModel();
        vimState = editorElement.vimState;
        vimState.activateNormalMode();
        return vimState.resetNormalMode();
      });
    });
    keydown = function(key, options) {
      if (options == null) {
        options = {};
      }
      if (options.element == null) {
        options.element = editorElement;
      }
      return helpers.keydown(key, options);
    };
    return describe("Copy from line above/below", function() {
      beforeEach(function() {
        editor.setText("12345\n\nabcd\nefghi");
        editor.setCursorBufferPosition([1, 0]);
        editor.addCursorAtBufferPosition([3, 0]);
        return keydown('i');
      });
      describe("the ctrl-y command", function() {
        it("copies from the line above", function() {
          keydown('y', {
            ctrl: true
          });
          expect(editor.getText()).toBe('12345\n1\nabcd\naefghi');
          editor.insertText(' ');
          keydown('y', {
            ctrl: true
          });
          return expect(editor.getText()).toBe('12345\n1 3\nabcd\na cefghi');
        });
        it("does nothing if there's nothing above the cursor", function() {
          editor.insertText('fill');
          keydown('y', {
            ctrl: true
          });
          expect(editor.getText()).toBe('12345\nfill5\nabcd\nfillefghi');
          keydown('y', {
            ctrl: true
          });
          return expect(editor.getText()).toBe('12345\nfill5\nabcd\nfillefghi');
        });
        return it("does nothing on the first line", function() {
          editor.setCursorBufferPosition([0, 2]);
          editor.addCursorAtBufferPosition([3, 2]);
          editor.insertText('a');
          expect(editor.getText()).toBe('12a345\n\nabcd\nefaghi');
          keydown('y', {
            ctrl: true
          });
          return expect(editor.getText()).toBe('12a345\n\nabcd\nefadghi');
        });
      });
      return describe("the ctrl-e command", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode.insert-mode': {
              'ctrl-e': 'vim-mode:copy-from-line-below'
            }
          });
        });
        it("copies from the line below", function() {
          keydown('e', {
            ctrl: true
          });
          expect(editor.getText()).toBe('12345\na\nabcd\nefghi');
          editor.insertText(' ');
          keydown('e', {
            ctrl: true
          });
          return expect(editor.getText()).toBe('12345\na c\nabcd\n efghi');
        });
        return it("does nothing if there's nothing below the cursor", function() {
          editor.insertText('foo');
          keydown('e', {
            ctrl: true
          });
          expect(editor.getText()).toBe('12345\nfood\nabcd\nfooefghi');
          keydown('e', {
            ctrl: true
          });
          return expect(editor.getText()).toBe('12345\nfood\nabcd\nfooefghi');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9zcGVjL2luc2VydC1tb2RlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLE9BQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGVBQVIsQ0FBVixDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtBQUMvQixRQUFBLDhDQUFBO0FBQUEsSUFBQSxPQUFvQyxFQUFwQyxFQUFDLGdCQUFELEVBQVMsdUJBQVQsRUFBd0Isa0JBQXhCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsVUFBMUIsQ0FBVixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsaUJBQVIsQ0FBQSxDQURBLENBQUE7YUFHQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsU0FBQyxPQUFELEdBQUE7QUFDdkIsUUFBQSxhQUFBLEdBQWdCLE9BQWhCLENBQUE7QUFBQSxRQUNBLE1BQUEsR0FBUyxhQUFhLENBQUMsUUFBZCxDQUFBLENBRFQsQ0FBQTtBQUFBLFFBRUEsUUFBQSxHQUFXLGFBQWEsQ0FBQyxRQUZ6QixDQUFBO0FBQUEsUUFHQSxRQUFRLENBQUMsa0JBQVQsQ0FBQSxDQUhBLENBQUE7ZUFJQSxRQUFRLENBQUMsZUFBVCxDQUFBLEVBTHVCO01BQUEsQ0FBekIsRUFKUztJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFhQSxPQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sT0FBTixHQUFBOztRQUFNLFVBQVE7T0FDdEI7O1FBQUEsT0FBTyxDQUFDLFVBQVc7T0FBbkI7YUFDQSxPQUFPLENBQUMsT0FBUixDQUFnQixHQUFoQixFQUFxQixPQUFyQixFQUZRO0lBQUEsQ0FiVixDQUFBO1dBaUJBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLHNCQUFmLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0IsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFNLENBQUMseUJBQVAsQ0FBaUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQyxDQUZBLENBQUE7ZUFHQSxPQUFBLENBQVEsR0FBUixFQUpTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQU1BLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFVBQUEsT0FBQSxDQUFRLEdBQVIsRUFBYTtBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47V0FBYixDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4Qix3QkFBOUIsQ0FEQSxDQUFBO0FBQUEsVUFHQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixDQUhBLENBQUE7QUFBQSxVQUlBLE9BQUEsQ0FBUSxHQUFSLEVBQWE7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWIsQ0FKQSxDQUFBO2lCQUtBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4Qiw0QkFBOUIsRUFOK0I7UUFBQSxDQUFqQyxDQUFBLENBQUE7QUFBQSxRQVFBLEVBQUEsQ0FBRyxrREFBSCxFQUF1RCxTQUFBLEdBQUE7QUFDckQsVUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQixDQUFBLENBQUE7QUFBQSxVQUNBLE9BQUEsQ0FBUSxHQUFSLEVBQWE7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWIsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsK0JBQTlCLENBRkEsQ0FBQTtBQUFBLFVBSUEsT0FBQSxDQUFRLEdBQVIsRUFBYTtBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47V0FBYixDQUpBLENBQUE7aUJBS0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLCtCQUE5QixFQU5xRDtRQUFBLENBQXZELENBUkEsQ0FBQTtlQWdCQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQSxHQUFBO0FBQ25DLFVBQUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0IsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFNLENBQUMseUJBQVAsQ0FBaUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQyxDQURBLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLHdCQUE5QixDQUhBLENBQUE7QUFBQSxVQUlBLE9BQUEsQ0FBUSxHQUFSLEVBQWE7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWIsQ0FKQSxDQUFBO2lCQUtBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4Qix5QkFBOUIsRUFObUM7UUFBQSxDQUFyQyxFQWpCNkI7TUFBQSxDQUEvQixDQU5BLENBQUE7YUErQkEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFiLENBQWlCLE1BQWpCLEVBQ0U7QUFBQSxZQUFBLHVDQUFBLEVBQ0U7QUFBQSxjQUFBLFFBQUEsRUFBVSwrQkFBVjthQURGO1dBREYsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFLQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFVBQUEsT0FBQSxDQUFRLEdBQVIsRUFBYTtBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47V0FBYixDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4Qix1QkFBOUIsQ0FEQSxDQUFBO0FBQUEsVUFHQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQixDQUhBLENBQUE7QUFBQSxVQUlBLE9BQUEsQ0FBUSxHQUFSLEVBQWE7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWIsQ0FKQSxDQUFBO2lCQUtBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QiwwQkFBOUIsRUFOK0I7UUFBQSxDQUFqQyxDQUxBLENBQUE7ZUFhQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQSxHQUFBO0FBQ3JELFVBQUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxPQUFBLENBQVEsR0FBUixFQUFhO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFiLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLDZCQUE5QixDQUZBLENBQUE7QUFBQSxVQUlBLE9BQUEsQ0FBUSxHQUFSLEVBQWE7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWIsQ0FKQSxDQUFBO2lCQUtBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4Qiw2QkFBOUIsRUFOcUQ7UUFBQSxDQUF2RCxFQWQ2QjtNQUFBLENBQS9CLEVBaENxQztJQUFBLENBQXZDLEVBbEIrQjtFQUFBLENBQWpDLENBRkEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/spec/insert-mode-spec.coffee
