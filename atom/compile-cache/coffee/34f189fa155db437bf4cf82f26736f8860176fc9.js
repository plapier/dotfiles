(function() {
  var getView, getVimState, packageName, ref;

  ref = require('./spec-helper'), getVimState = ref.getVimState, getView = ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState, workspaceElement;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5], workspaceElement = ref1[6];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      return it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("N");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("I");
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdmltLW1vZGUtcGx1cy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLGVBQVIsQ0FBekIsRUFBQyw2QkFBRCxFQUFjOztFQUVkLFdBQUEsR0FBYzs7RUFDZCxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0FBQ3hCLFFBQUE7SUFBQSxPQUE4RSxFQUE5RSxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Qsa0JBQWhELEVBQTBEO0lBRTFELFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsU0FBRCxFQUFZLEdBQVo7UUFDVixRQUFBLEdBQVc7UUFDVix5QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMseUJBQWQsRUFBMkI7TUFIakIsQ0FBWjtNQUtBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxJQUFJLENBQUMsU0FBYjthQUVuQixlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsWUFBOUI7TUFEYyxDQUFoQjtJQVJTLENBQVg7SUFXQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBO01BQ3BCLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBO2VBQ3hELE1BQUEsQ0FBTztVQUFBLElBQUEsRUFBTSxRQUFOO1NBQVA7TUFEd0QsQ0FBMUQ7YUFHQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQTtBQUNqRCxZQUFBO1FBQUEsYUFBQSxHQUFnQjtRQUVoQixRQUFBLENBQVMsU0FBQTtpQkFDUCxhQUFBLEdBQWdCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLDJCQUEvQjtRQURULENBQVQ7ZUFHQSxJQUFBLENBQUssU0FBQTtVQUNILE1BQUEsQ0FBTyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxHQUF2QztVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFaO2lCQUNBLE1BQUEsQ0FBTyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxHQUF2QztRQUhHLENBQUw7TUFOaUQsQ0FBbkQ7SUFKb0IsQ0FBdEI7V0FlQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO01BQ3RCLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO1FBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWQsQ0FBZ0MsV0FBaEM7UUFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF4QixDQUFpQyxlQUFqQyxDQUFQLENBQXlELENBQUMsSUFBMUQsQ0FBK0QsS0FBL0Q7ZUFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF4QixDQUFpQyxhQUFqQyxDQUFQLENBQXVELENBQUMsSUFBeEQsQ0FBNkQsS0FBN0Q7TUFINEMsQ0FBOUM7YUFLQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQTtBQUNyRCxZQUFBO1FBQUEsV0FBQSxHQUFjLFNBQUE7aUJBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFkLENBQTJCO1lBQUEsTUFBQSxFQUFRLGFBQVI7V0FBM0IsQ0FBaUQsQ0FBQyxNQUFsRCxDQUF5RCxTQUFDLEdBQUQ7bUJBQ3ZELEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVCxDQUFvQixnQkFBcEI7VUFEdUQsQ0FBekQ7UUFEWTtRQUlkLE1BQUEsQ0FBTyxXQUFBLENBQUEsQ0FBYSxDQUFDLE1BQXJCLENBQTRCLENBQUMsZUFBN0IsQ0FBNkMsQ0FBN0M7UUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQWdDLFdBQWhDO2VBQ0EsTUFBQSxDQUFPLFdBQUEsQ0FBQSxDQUFhLENBQUMsTUFBckIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxDQUFsQztNQVBxRCxDQUF2RDtJQU5zQixDQUF4QjtFQTdCd0IsQ0FBMUI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZ2V0Vmlld30gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5wYWNrYWdlTmFtZSA9ICd2aW0tbW9kZS1wbHVzJ1xuZGVzY3JpYmUgXCJ2aW0tbW9kZS1wbHVzXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlLCB3b3Jrc3BhY2VFbGVtZW50XSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChfdmltU3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gX3ZpbVN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IF92aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3N0YXR1cy1iYXInKVxuXG4gIGRlc2NyaWJlIFwiLmFjdGl2YXRlXCIsIC0+XG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW4gbm9ybWFsLW1vZGUgaW5pdGlhbGx5IGJ5IGRlZmF1bHRcIiwgLT5cbiAgICAgIGVuc3VyZSBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJzaG93cyB0aGUgY3VycmVudCB2aW0gbW9kZSBpbiB0aGUgc3RhdHVzIGJhclwiLCAtPlxuICAgICAgc3RhdHVzQmFyVGlsZSA9IG51bGxcblxuICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgc3RhdHVzQmFyVGlsZSA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXMtYmFyLXZpbS1tb2RlLXBsdXNcIilcblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3Qoc3RhdHVzQmFyVGlsZS50ZXh0Q29udGVudCkudG9CZShcIk5cIilcbiAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZXhwZWN0KHN0YXR1c0JhclRpbGUudGV4dENvbnRlbnQpLnRvQmUoXCJJXCIpXG5cbiAgZGVzY3JpYmUgXCIuZGVhY3RpdmF0ZVwiLCAtPlxuICAgIGl0IFwicmVtb3ZlcyB0aGUgdmltIGNsYXNzZXMgZnJvbSB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2thZ2VOYW1lKVxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwidmltLW1vZGUtcGx1c1wiKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm5vcm1hbC1tb2RlXCIpKS50b0JlKGZhbHNlKVxuXG4gICAgaXQgXCJyZW1vdmVzIHRoZSB2aW0gY29tbWFuZHMgZnJvbSB0aGUgZWRpdG9yIGVsZW1lbnRcIiwgLT5cbiAgICAgIHZpbUNvbW1hbmRzID0gLT5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5maW5kQ29tbWFuZHModGFyZ2V0OiBlZGl0b3JFbGVtZW50KS5maWx0ZXIgKGNtZCkgLT5cbiAgICAgICAgICBjbWQubmFtZS5zdGFydHNXaXRoKFwidmltLW1vZGUtcGx1czpcIilcblxuICAgICAgZXhwZWN0KHZpbUNvbW1hbmRzKCkubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMClcbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFja2FnZU5hbWUpXG4gICAgICBleHBlY3QodmltQ29tbWFuZHMoKS5sZW5ndGgpLnRvQmUoMClcbiJdfQ==
