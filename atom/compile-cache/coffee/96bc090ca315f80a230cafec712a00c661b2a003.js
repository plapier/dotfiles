(function() {
  describe("VimMode", function() {
    var editor, editorElement, workspaceElement, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], workspaceElement = _ref[2];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      waitsForPromise(function() {
        return atom.workspace.open();
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('vim-mode');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        return editorElement = atom.views.getView(editor);
      });
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        expect(editorElement.classList.contains('vim-mode')).toBe(true);
        return expect(editorElement.classList.contains('normal-mode')).toBe(true);
      });
      it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("Normal");
          atom.commands.dispatch(editorElement, "vim-mode:activate-insert-mode");
          return expect(statusBarTile.textContent).toBe("Insert");
        });
      });
      return it("doesn't register duplicate command listeners for editors", function() {
        var newPane, pane;
        editor.setText("12345");
        editor.setCursorBufferPosition([0, 0]);
        pane = atom.workspace.getActivePane();
        newPane = pane.splitRight();
        pane.removeItem(editor);
        newPane.addItem(editor);
        atom.commands.dispatch(editorElement, "vim-mode:move-right");
        return expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage('vim-mode');
        expect(editorElement.classList.contains("vim-mode")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage('vim-mode');
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9zcGVjL3ZpbS1tb2RlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUEsR0FBQTtBQUNsQixRQUFBLDZDQUFBO0FBQUEsSUFBQSxPQUE0QyxFQUE1QyxFQUFDLGdCQUFELEVBQVMsdUJBQVQsRUFBd0IsMEJBQXhCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBbkIsQ0FBQTtBQUFBLE1BRUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxFQURjO01BQUEsQ0FBaEIsQ0FGQSxDQUFBO0FBQUEsTUFLQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixVQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FMQSxDQUFBO0FBQUEsTUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixZQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FSQSxDQUFBO2FBV0EsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFFBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7ZUFDQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixFQUZiO01BQUEsQ0FBTCxFQVpTO0lBQUEsQ0FBWCxDQUZBLENB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/spec/vim-mode-spec.coffee
