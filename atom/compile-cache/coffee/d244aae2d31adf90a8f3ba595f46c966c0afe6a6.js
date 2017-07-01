(function() {
  var StatusBarManager, VimState, helpers, _;

  _ = require('underscore-plus');

  helpers = require('./spec-helper');

  VimState = require('../lib/vim-state');

  StatusBarManager = require('../lib/status-bar-manager');

  describe("VimState", function() {
    var editor, editorElement, keydown, normalModeInputKeydown, vimState, _ref;
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
    normalModeInputKeydown = function(key, opts) {
      if (opts == null) {
        opts = {};
      }
      return editor.normalModeInputView.editorElement.getModel().setText(key);
    };
    describe("initialization", function() {
      it("puts the editor in normal-mode initially by default", function() {
        expect(editorElement.classList.contains('vim-mode')).toBe(true);
        return expect(editorElement.classList.contains('normal-mode')).toBe(true);
      });
      return it("puts the editor in insert-mode if startInInsertMode is true", function() {
        atom.config.set('vim-mode.startInInsertMode', true);
        editor.vimState = new VimState(editorElement, new StatusBarManager);
        return expect(editorElement.classList.contains('insert-mode')).toBe(true);
      });
    });
    describe("::destroy", function() {
      it("re-enables text input on the editor", function() {
        expect(editorElement.component.isInputEnabled()).toBeFalsy();
        vimState.destroy();
        return expect(editorElement.component.isInputEnabled()).toBeTruthy();
      });
      it("removes the mode classes from the editor", function() {
        expect(editorElement.classList.contains("normal-mode")).toBeTruthy();
        vimState.destroy();
        return expect(editorElement.classList.contains("normal-mode")).toBeFalsy();
      });
      return it("is a noop when the editor is already destroyed", function() {
        editorElement.getModel().destroy();
        return vimState.destroy();
      });
    });
    describe("normal-mode", function() {
      describe("when entering an insertable character", function() {
        beforeEach(function() {
          return keydown('\\');
        });
        return it("stops propagation", function() {
          return expect(editor.getText()).toEqual('');
        });
      });
      describe("when entering an operator", function() {
        beforeEach(function() {
          return keydown('d');
        });
        describe("with an operator that can't be composed", function() {
          beforeEach(function() {
            return keydown('x');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.opStack.length).toBe(0);
          });
        });
        describe("the escape keybinding", function() {
          beforeEach(function() {
            return keydown('escape');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.opStack.length).toBe(0);
          });
        });
        return describe("the ctrl-c keybinding", function() {
          beforeEach(function() {
            return keydown('c', {
              ctrl: true
            });
          });
          return it("clears the operator stack", function() {
            return expect(vimState.opStack.length).toBe(0);
          });
        });
      });
      describe("the escape keybinding", function() {
        return it("clears any extra cursors", function() {
          editor.setText("one-two-three");
          editor.addCursorAtBufferPosition([0, 3]);
          expect(editor.getCursors().length).toBe(2);
          keydown('escape');
          return expect(editor.getCursors().length).toBe(1);
        });
      });
      describe("the v keybinding", function() {
        beforeEach(function() {
          editor.setText("012345\nabcdef");
          editor.setCursorScreenPosition([0, 0]);
          return keydown('v');
        });
        it("puts the editor into visual characterwise mode", function() {
          expect(editorElement.classList.contains('visual-mode')).toBe(true);
          expect(vimState.submode).toEqual('characterwise');
          return expect(editorElement.classList.contains('normal-mode')).toBe(false);
        });
        return it("selects the current character", function() {
          return expect(editor.getLastSelection().getText()).toEqual('0');
        });
      });
      describe("the V keybinding", function() {
        beforeEach(function() {
          editor.setText("012345\nabcdef");
          editor.setCursorScreenPosition([0, 0]);
          return keydown('V', {
            shift: true
          });
        });
        it("puts the editor into visual linewise mode", function() {
          expect(editorElement.classList.contains('visual-mode')).toBe(true);
          expect(vimState.submode).toEqual('linewise');
          return expect(editorElement.classList.contains('normal-mode')).toBe(false);
        });
        return it("selects the current line", function() {
          return expect(editor.getLastSelection().getText()).toEqual('012345\n');
        });
      });
      describe("the ctrl-v keybinding", function() {
        beforeEach(function() {
          editor.setText("012345\nabcdef");
          editor.setCursorScreenPosition([0, 0]);
          return keydown('v', {
            ctrl: true
          });
        });
        return it("puts the editor into visual blockwise mode", function() {
          expect(editorElement.classList.contains('visual-mode')).toBe(true);
          expect(vimState.submode).toEqual('blockwise');
          return expect(editorElement.classList.contains('normal-mode')).toBe(false);
        });
      });
      describe("selecting text", function() {
        beforeEach(function() {
          editor.setText("abc def");
          return editor.setCursorScreenPosition([0, 0]);
        });
        it("puts the editor into visual mode", function() {
          expect(vimState.mode).toEqual('normal');
          atom.commands.dispatch(editorElement, "core:select-right");
          expect(vimState.mode).toEqual('visual');
          expect(vimState.submode).toEqual('characterwise');
          return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 1]]]);
        });
        it("handles the editor being destroyed shortly after selecting text", function() {
          editor.setSelectedBufferRanges([[[0, 0], [0, 3]]]);
          editor.destroy();
          vimState.destroy();
          return advanceClock(100);
        });
        return it("handles native selection such as core:select-all", function() {
          atom.commands.dispatch(editorElement, "core:select-all");
          return expect(editor.getSelectedBufferRanges()).toEqual([[[0, 0], [0, 7]]]);
        });
      });
      describe("the i keybinding", function() {
        beforeEach(function() {
          return keydown('i');
        });
        return it("puts the editor into insert mode", function() {
          expect(editorElement.classList.contains('insert-mode')).toBe(true);
          return expect(editorElement.classList.contains('normal-mode')).toBe(false);
        });
      });
      describe("the R keybinding", function() {
        beforeEach(function() {
          return keydown('R', {
            shift: true
          });
        });
        return it("puts the editor into replace mode", function() {
          expect(editorElement.classList.contains('insert-mode')).toBe(true);
          expect(editorElement.classList.contains('replace-mode')).toBe(true);
          return expect(editorElement.classList.contains('normal-mode')).toBe(false);
        });
      });
      describe("with content", function() {
        beforeEach(function() {
          editor.setText("012345\n\nabcdef");
          return editor.setCursorScreenPosition([0, 0]);
        });
        describe("on a line with content", function() {
          return it("does not allow atom commands to place the cursor on the \\n character", function() {
            atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
            return expect(editor.getCursorScreenPosition()).toEqual([0, 5]);
          });
        });
        return describe("on an empty line", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([1, 0]);
            return atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
          });
          return it("allows the cursor to be placed on the \\n character", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
      });
      return describe('with character-input operations', function() {
        beforeEach(function() {
          return editor.setText('012345\nabcdef');
        });
        return it('properly clears the opStack', function() {
          keydown('d');
          keydown('r');
          expect(vimState.mode).toBe('normal');
          expect(vimState.opStack.length).toBe(0);
          atom.commands.dispatch(editor.normalModeInputView.editorElement, "core:cancel");
          keydown('d');
          return expect(editor.getText()).toBe('012345\nabcdef');
        });
      });
    });
    describe("insert-mode", function() {
      beforeEach(function() {
        return keydown('i');
      });
      describe("with content", function() {
        beforeEach(function() {
          return editor.setText("012345\n\nabcdef");
        });
        describe("when cursor is in the middle of the line", function() {
          beforeEach(function() {
            return editor.setCursorScreenPosition([0, 3]);
          });
          return it("moves the cursor to the left when exiting insert mode", function() {
            keydown('escape');
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
        describe("when cursor is at the beginning of line", function() {
          beforeEach(function() {
            return editor.setCursorScreenPosition([1, 0]);
          });
          return it("leaves the cursor at the beginning of line", function() {
            keydown('escape');
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
        return describe("on a line with content", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 0]);
            return atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
          });
          return it("allows the cursor to be placed on the \\n character", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        keydown('escape');
        expect(editorElement.classList.contains('normal-mode')).toBe(true);
        expect(editorElement.classList.contains('insert-mode')).toBe(false);
        return expect(editorElement.classList.contains('visual-mode')).toBe(false);
      });
      return it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        helpers.mockPlatform(editorElement, 'platform-darwin');
        keydown('c', {
          ctrl: true
        });
        helpers.unmockPlatform(editorElement);
        expect(editorElement.classList.contains('normal-mode')).toBe(true);
        expect(editorElement.classList.contains('insert-mode')).toBe(false);
        return expect(editorElement.classList.contains('visual-mode')).toBe(false);
      });
    });
    describe("replace-mode", function() {
      describe("with content", function() {
        beforeEach(function() {
          return editor.setText("012345\n\nabcdef");
        });
        describe("when cursor is in the middle of the line", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([0, 3]);
            return keydown('R', {
              shift: true
            });
          });
          return it("moves the cursor to the left when exiting replace mode", function() {
            keydown('escape');
            return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
          });
        });
        describe("when cursor is at the beginning of line", function() {
          beforeEach(function() {
            editor.setCursorScreenPosition([1, 0]);
            return keydown('R', {
              shift: true
            });
          });
          return it("leaves the cursor at the beginning of line", function() {
            keydown('escape');
            return expect(editor.getCursorScreenPosition()).toEqual([1, 0]);
          });
        });
        return describe("on a line with content", function() {
          beforeEach(function() {
            keydown('R', {
              shift: true
            });
            editor.setCursorScreenPosition([0, 0]);
            return atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
          });
          return it("allows the cursor to be placed on the \\n character", function() {
            return expect(editor.getCursorScreenPosition()).toEqual([0, 6]);
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        keydown('R', {
          shift: true
        });
        keydown('escape');
        expect(editorElement.classList.contains('normal-mode')).toBe(true);
        expect(editorElement.classList.contains('insert-mode')).toBe(false);
        expect(editorElement.classList.contains('replace-mode')).toBe(false);
        return expect(editorElement.classList.contains('visual-mode')).toBe(false);
      });
      return it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        keydown('R', {
          shift: true
        });
        helpers.mockPlatform(editorElement, 'platform-darwin');
        keydown('c', {
          ctrl: true
        });
        helpers.unmockPlatform(editorElement);
        expect(editorElement.classList.contains('normal-mode')).toBe(true);
        expect(editorElement.classList.contains('insert-mode')).toBe(false);
        expect(editorElement.classList.contains('replace-mode')).toBe(false);
        return expect(editorElement.classList.contains('visual-mode')).toBe(false);
      });
    });
    describe("visual-mode", function() {
      beforeEach(function() {
        editor.setText("one two three");
        editor.setCursorBufferPosition([0, 4]);
        return keydown('v');
      });
      it("selects the character under the cursor", function() {
        expect(editor.getSelectedBufferRanges()).toEqual([[[0, 4], [0, 5]]]);
        return expect(editor.getSelectedText()).toBe("t");
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        keydown('escape');
        expect(editor.getCursorBufferPositions()).toEqual([[0, 4]]);
        expect(editorElement.classList.contains('normal-mode')).toBe(true);
        return expect(editorElement.classList.contains('visual-mode')).toBe(false);
      });
      it("puts the editor into normal mode when <escape> is pressed on selection is reversed", function() {
        expect(editor.getSelectedText()).toBe("t");
        keydown("h");
        keydown("h");
        expect(editor.getSelectedText()).toBe("e t");
        expect(editor.getLastSelection().isReversed()).toBe(true);
        keydown('escape');
        expect(editorElement.classList.contains('normal-mode')).toBe(true);
        return expect(editor.getCursorBufferPositions()).toEqual([[0, 2]]);
      });
      describe("motions", function() {
        it("transforms the selection", function() {
          keydown('w');
          return expect(editor.getLastSelection().getText()).toEqual('two t');
        });
        return it("always leaves the initially selected character selected", function() {
          keydown("h");
          expect(editor.getSelectedText()).toBe(" t");
          keydown("l");
          expect(editor.getSelectedText()).toBe("t");
          keydown("l");
          return expect(editor.getSelectedText()).toBe("tw");
        });
      });
      describe("operators", function() {
        beforeEach(function() {
          editor.setText("012345\n\nabcdef");
          editor.setCursorScreenPosition([0, 0]);
          editor.selectLinesContainingCursors();
          return keydown('d');
        });
        return it("operate on the current selection", function() {
          return expect(editor.getText()).toEqual("\nabcdef");
        });
      });
      describe("returning to normal-mode", function() {
        beforeEach(function() {
          editor.setText("012345\n\nabcdef");
          editor.selectLinesContainingCursors();
          return keydown('escape');
        });
        return it("operate on the current selection", function() {
          return expect(editor.getLastSelection().getText()).toEqual('');
        });
      });
      describe("the o keybinding", function() {
        it("reversed each selection", function() {
          editor.addCursorAtBufferPosition([0, Infinity]);
          keydown("i");
          keydown("w");
          expect(editor.getSelectedBufferRanges()).toEqual([[[0, 4], [0, 7]], [[0, 8], [0, 13]]]);
          expect(editor.getCursorBufferPositions()).toEqual([[0, 7], [0, 13]]);
          keydown("o");
          expect(editor.getSelectedBufferRanges()).toEqual([[[0, 4], [0, 7]], [[0, 8], [0, 13]]]);
          return expect(editor.getCursorBufferPositions()).toEqual([[0, 4], [0, 8]]);
        });
        return it("harmonizes selection directions", function() {
          keydown("e");
          editor.addCursorAtBufferPosition([0, Infinity]);
          keydown("h");
          keydown("h");
          expect(editor.getSelectedBufferRanges()).toEqual([[[0, 4], [0, 5]], [[0, 11], [0, 13]]]);
          expect(editor.getCursorBufferPositions()).toEqual([[0, 5], [0, 11]]);
          keydown("o");
          expect(editor.getSelectedBufferRanges()).toEqual([[[0, 4], [0, 5]], [[0, 11], [0, 13]]]);
          return expect(editor.getCursorBufferPositions()).toEqual([[0, 5], [0, 13]]);
        });
      });
      return describe("activate visualmode witin visualmode", function() {
        beforeEach(function() {
          keydown('escape');
          expect(vimState.mode).toEqual('normal');
          return expect(editorElement.classList.contains('normal-mode')).toBe(true);
        });
        it("activateVisualMode with same type puts the editor into normal mode", function() {
          keydown('v');
          expect(editorElement.classList.contains('visual-mode')).toBe(true);
          expect(vimState.submode).toEqual('characterwise');
          expect(editorElement.classList.contains('normal-mode')).toBe(false);
          keydown('v');
          expect(vimState.mode).toEqual('normal');
          expect(editorElement.classList.contains('normal-mode')).toBe(true);
          keydown('V', {
            shift: true
          });
          expect(editorElement.classList.contains('visual-mode')).toBe(true);
          expect(vimState.submode).toEqual('linewise');
          expect(editorElement.classList.contains('normal-mode')).toBe(false);
          keydown('V', {
            shift: true
          });
          expect(vimState.mode).toEqual('normal');
          expect(editorElement.classList.contains('normal-mode')).toBe(true);
          keydown('v', {
            ctrl: true
          });
          expect(editorElement.classList.contains('visual-mode')).toBe(true);
          expect(vimState.submode).toEqual('blockwise');
          expect(editorElement.classList.contains('normal-mode')).toBe(false);
          keydown('v', {
            ctrl: true
          });
          expect(vimState.mode).toEqual('normal');
          return expect(editorElement.classList.contains('normal-mode')).toBe(true);
        });
        return describe("change submode within visualmode", function() {
          beforeEach(function() {
            editor.setText("line one\nline two\nline three\n");
            editor.setCursorBufferPosition([0, 5]);
            return editor.addCursorAtBufferPosition([2, 5]);
          });
          it("can change submode within visual mode", function() {
            keydown('v');
            expect(editorElement.classList.contains('visual-mode')).toBe(true);
            expect(vimState.submode).toEqual('characterwise');
            expect(editorElement.classList.contains('normal-mode')).toBe(false);
            keydown('V', {
              shift: true
            });
            expect(editorElement.classList.contains('visual-mode')).toBe(true);
            expect(vimState.submode).toEqual('linewise');
            expect(editorElement.classList.contains('normal-mode')).toBe(false);
            keydown('v', {
              ctrl: true
            });
            expect(editorElement.classList.contains('visual-mode')).toBe(true);
            expect(vimState.submode).toEqual('blockwise');
            expect(editorElement.classList.contains('normal-mode')).toBe(false);
            keydown('v');
            expect(editorElement.classList.contains('visual-mode')).toBe(true);
            expect(vimState.submode).toEqual('characterwise');
            return expect(editorElement.classList.contains('normal-mode')).toBe(false);
          });
          return it("recover original range when shift from linewse to characterwise", function() {
            keydown('v');
            keydown('i');
            keydown('w');
            expect(_.map(editor.getSelections(), function(selection) {
              return selection.getText();
            })).toEqual(['one', 'three']);
            keydown('V', {
              shift: true
            });
            expect(_.map(editor.getSelections(), function(selection) {
              return selection.getText();
            })).toEqual(["line one\n", "line three\n"]);
            keydown('v', {
              ctrl: true
            });
            return expect(_.map(editor.getSelections(), function(selection) {
              return selection.getText();
            })).toEqual(['one', 'three']);
          });
        });
      });
    });
    return describe("marks", function() {
      beforeEach(function() {
        return editor.setText("text in line 1\ntext in line 2\ntext in line 3");
      });
      it("basic marking functionality", function() {
        editor.setCursorScreenPosition([1, 1]);
        keydown('m');
        normalModeInputKeydown('t');
        expect(editor.getText()).toEqual("text in line 1\ntext in line 2\ntext in line 3");
        editor.setCursorScreenPosition([2, 2]);
        keydown('`');
        normalModeInputKeydown('t');
        return expect(editor.getCursorScreenPosition()).toEqual([1, 1]);
      });
      it("real (tracking) marking functionality", function() {
        editor.setCursorScreenPosition([2, 2]);
        keydown('m');
        normalModeInputKeydown('q');
        editor.setCursorScreenPosition([1, 2]);
        keydown('o');
        keydown('escape');
        keydown('`');
        normalModeInputKeydown('q');
        return expect(editor.getCursorScreenPosition()).toEqual([3, 2]);
      });
      return it("real (tracking) marking functionality", function() {
        editor.setCursorScreenPosition([2, 2]);
        keydown('m');
        normalModeInputKeydown('q');
        editor.setCursorScreenPosition([1, 2]);
        keydown('d');
        keydown('d');
        keydown('escape');
        keydown('`');
        normalModeInputKeydown('q');
        return expect(editor.getCursorScreenPosition()).toEqual([1, 2]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9zcGVjL3ZpbS1zdGF0ZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzQ0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsa0JBQVIsQ0FGWCxDQUFBOztBQUFBLEVBR0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLDJCQUFSLENBSG5CLENBQUE7O0FBQUEsRUFLQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxzRUFBQTtBQUFBLElBQUEsT0FBb0MsRUFBcEMsRUFBQyxnQkFBRCxFQUFTLHVCQUFULEVBQXdCLGtCQUF4QixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLFVBQTFCLENBQVYsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLGlCQUFSLENBQUEsQ0FEQSxDQUFBO2FBR0EsT0FBTyxDQUFDLGdCQUFSLENBQXlCLFNBQUMsT0FBRCxHQUFBO0FBQ3ZCLFFBQUEsYUFBQSxHQUFnQixPQUFoQixDQUFBO0FBQUEsUUFDQSxNQUFBLEdBQVMsYUFBYSxDQUFDLFFBQWQsQ0FBQSxDQURULENBQUE7QUFBQSxRQUVBLFFBQUEsR0FBVyxhQUFhLENBQUMsUUFGekIsQ0FBQTtBQUFBLFFBR0EsUUFBUSxDQUFDLGtCQUFULENBQUEsQ0FIQSxDQUFBO2VBSUEsUUFB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/spec/vim-state-spec.coffee
