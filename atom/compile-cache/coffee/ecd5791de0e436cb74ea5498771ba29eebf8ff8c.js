(function() {
  var AtomBourbonSnippets;

  AtomBourbonSnippets = require('../lib/atom-bourbon-snippets');

  describe("AtomBourbonSnippets", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('atom-bourbon-snippets');
    });
    return describe("when the atom-bourbon-snippets:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.atom-bourbon-snippets')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'atom-bourbon-snippets:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var atomBourbonSnippetsElement, atomBourbonSnippetsPanel;
          expect(workspaceElement.querySelector('.atom-bourbon-snippets')).toExist();
          atomBourbonSnippetsElement = workspaceElement.querySelector('.atom-bourbon-snippets');
          expect(atomBourbonSnippetsElement).toExist();
          atomBourbonSnippetsPanel = atom.workspace.panelForItem(atomBourbonSnippetsElement);
          expect(atomBourbonSnippetsPanel.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'atom-bourbon-snippets:toggle');
          return expect(atomBourbonSnippetsPanel.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.atom-bourbon-snippets')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'atom-bourbon-snippets:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var atomBourbonSnippetsElement;
          atomBourbonSnippetsElement = workspaceElement.querySelector('.atom-bourbon-snippets');
          expect(atomBourbonSnippetsElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'atom-bourbon-snippets:toggle');
          return expect(atomBourbonSnippetsElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9hdG9tLWJvdXJib24tc25pcHBldHMvc3BlYy9hdG9tLWJvdXJib24tc25pcHBldHMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbUJBQUE7O0FBQUEsRUFBQSxtQkFBQSxHQUFzQixPQUFBLENBQVEsOEJBQVIsQ0FBdEIsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsUUFBQSx5Q0FBQTtBQUFBLElBQUEsT0FBd0MsRUFBeEMsRUFBQywwQkFBRCxFQUFtQiwyQkFBbkIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO2FBQ0EsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHVCQUE5QixFQUZYO0lBQUEsQ0FBWCxDQUZBLENBQUE7V0FNQSxRQUFBLENBQVMsMERBQVQsRUFBcUUsU0FBQSxHQUFBO0FBQ25FLE1BQUEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUEsR0FBQTtBQUdwQyxRQUFBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQix3QkFBL0IsQ0FBUCxDQUFnRSxDQUFDLEdBQUcsQ0FBQyxPQUFyRSxDQUFBLENBQUEsQ0FBQTtBQUFBLFFBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyw4QkFBekMsQ0FKQSxDQUFBO0FBQUEsUUFNQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxrQkFEYztRQUFBLENBQWhCLENBTkEsQ0FBQTtlQVNBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxjQUFBLG9EQUFBO0FBQUEsVUFBQSxNQUFBLENBQU8sZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0Isd0JBQS9CLENBQVAsQ0FBZ0UsQ0FBQyxPQUFqRSxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBRUEsMEJBQUEsR0FBNkIsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0Isd0JBQS9CLENBRjdCLENBQUE7QUFBQSxVQUdBLE1BQUEsQ0FBTywwQkFBUCxDQUFrQyxDQUFDLE9BQW5DLENBQUEsQ0FIQSxDQUFBO0FBQUEsVUFLQSx3QkFBQSxHQUEyQixJQUFJLENBQUMsU0FBUyxDQUFDLFlBQWYsQ0FBNEIsMEJBQTVCLENBTDNCLENBQUE7QUFBQSxVQU1BLE1BQUEsQ0FBTyx3QkFBd0IsQ0FBQyxTQUF6QixDQUFBLENBQVAsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxJQUFsRCxDQU5BLENBQUE7QUFBQSxVQU9BLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsOEJBQXpDLENBUEEsQ0FBQTtpQkFRQSxNQUFBLENBQU8sd0JBQXdCLENBQUMsU0FBekIsQ0FBQSxDQUFQLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsS0FBbEQsRUFURztRQUFBLENBQUwsRUFab0M7TUFBQSxDQUF0QyxDQUFBLENBQUE7YUF1QkEsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUEsR0FBQTtBQU83QixRQUFBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQUFBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQix3QkFBL0IsQ0FBUCxDQUFnRSxDQUFDLEdBQUcsQ0FBQyxPQUFyRSxDQUFBLENBRkEsQ0FBQTtBQUFBLFFBTUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyw4QkFBekMsQ0FOQSxDQUFBO0FBQUEsUUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxrQkFEYztRQUFBLENBQWhCLENBUkEsQ0FBQTtlQVdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFFSCxjQUFBLDBCQUFBO0FBQUEsVUFBQSwwQkFBQSxHQUE2QixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQix3QkFBL0IsQ0FBN0IsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLDBCQUFQLENBQWtDLENBQUMsV0FBbkMsQ0FBQSxDQURBLENBQUE7QUFBQSxVQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsRUFBeUMsOEJBQXpDLENBRkEsQ0FBQTtpQkFHQSxNQUFBLENBQU8sMEJBQVAsQ0FBa0MsQ0FBQyxHQUFHLENBQUMsV0FBdkMsQ0FBQSxFQUxHO1FBQUEsQ0FBTCxFQWxCNkI7TUFBQSxDQUEvQixFQXhCbUU7SUFBQSxDQUFyRSxFQVA4QjtFQUFBLENBQWhDLENBUEEsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/atom-bourbon-snippets/spec/atom-bourbon-snippets-spec.coffee
