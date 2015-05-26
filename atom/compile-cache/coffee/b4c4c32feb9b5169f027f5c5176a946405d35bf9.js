(function() {
  var ExMode;

  ExMode = require('../lib/ex-mode');

  describe("ExMode", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('ex-mode');
    });
    return describe("when the ex-mode:toggle event is triggered", function() {
      it("hides and shows the modal panel", function() {
        expect(workspaceElement.querySelector('.ex-mode')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'ex-mode:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var exModeElement, exModePanel;
          expect(workspaceElement.querySelector('.ex-mode')).toExist();
          exModeElement = workspaceElement.querySelector('.ex-mode');
          expect(exModeElement).toExist();
          exModePanel = atom.workspace.panelForItem(exModeElement);
          expect(exModePanel.isVisible()).toBe(true);
          atom.commands.dispatch(workspaceElement, 'ex-mode:toggle');
          return expect(exModePanel.isVisible()).toBe(false);
        });
      });
      return it("hides and shows the view", function() {
        jasmine.attachToDOM(workspaceElement);
        expect(workspaceElement.querySelector('.ex-mode')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'ex-mode:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          var exModeElement;
          exModeElement = workspaceElement.querySelector('.ex-mode');
          expect(exModeElement).toBeVisible();
          atom.commands.dispatch(workspaceElement, 'ex-mode:toggle');
          return expect(exModeElement).not.toBeVisible();
        });
      });
    });
  });

}).call(this);
