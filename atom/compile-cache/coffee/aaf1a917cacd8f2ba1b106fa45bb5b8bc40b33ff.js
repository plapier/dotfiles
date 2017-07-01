(function() {
  var TextData, _, getVimState, ref, settings, withMockPlatform;

  _ = require('underscore-plus');

  ref = require('./spec-helper'), getVimState = ref.getVimState, TextData = ref.TextData, withMockPlatform = ref.withMockPlatform;

  settings = require('../lib/settings');

  describe("VimState", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    describe("initialization", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure({
          mode: 'normal'
        });
      });
      return it("puts the editor in insert-mode if startInInsertMode is true", function() {
        settings.set('startInInsertMode', true);
        return getVimState(function(state, vim) {
          return vim.ensure({
            mode: 'insert'
          });
        });
      });
    });
    describe("::destroy", function() {
      it("re-enables text input on the editor", function() {
        expect(editorElement.component.isInputEnabled()).toBeFalsy();
        vimState.destroy();
        return expect(editorElement.component.isInputEnabled()).toBeTruthy();
      });
      it("removes the mode classes from the editor", function() {
        ensure({
          mode: 'normal'
        });
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
          return keystroke('\\');
        });
        return it("stops propagation", function() {
          return ensure({
            text: ''
          });
        });
      });
      describe("when entering an operator", function() {
        beforeEach(function() {
          return keystroke('d');
        });
        describe("with an operator that can't be composed", function() {
          beforeEach(function() {
            return keystroke('x');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        describe("the escape keybinding", function() {
          beforeEach(function() {
            return keystroke('escape');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        return describe("the ctrl-c keybinding", function() {
          beforeEach(function() {
            return keystroke('ctrl-c');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
      });
      describe("the escape keybinding", function() {
        return it("clears any extra cursors", function() {
          set({
            text: "one-two-three",
            addCursor: [0, 3]
          });
          ensure({
            numCursors: 2
          });
          return ensure('escape', {
            numCursors: 1
          });
        });
      });
      describe("the v keybinding", function() {
        beforeEach(function() {
          set({
            text: "abc",
            cursor: [0, 0]
          });
          return keystroke('v');
        });
        return it("puts the editor into visual characterwise mode", function() {
          return ensure({
            mode: ['visual', 'characterwise']
          });
        });
      });
      describe("the V keybinding", function() {
        beforeEach(function() {
          return set({
            text: "012345\nabcdef",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual linewise mode", function() {
          return ensure('V', {
            mode: ['visual', 'linewise']
          });
        });
        return it("selects the current line", function() {
          return ensure('V', {
            selectedText: '012345\n'
          });
        });
      });
      describe("the ctrl-v keybinding", function() {
        return it("puts the editor into visual blockwise mode", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('ctrl-v', {
            mode: ['visual', 'blockwise']
          });
        });
      });
      describe("selecting text", function() {
        beforeEach(function() {
          spyOn(_._, "now").andCallFake(function() {
            return window.now;
          });
          return set({
            text: "abc def",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual mode", function() {
          ensure({
            mode: 'normal'
          });
          advanceClock(200);
          atom.commands.dispatch(editorElement, "core:select-right");
          return ensure({
            mode: ['visual', 'characterwise'],
            selectedBufferRange: [[0, 0], [0, 1]]
          });
        });
        it("handles the editor being destroyed shortly after selecting text", function() {
          set({
            selectedBufferRange: [[0, 0], [0, 3]]
          });
          editor.destroy();
          vimState.destroy();
          return advanceClock(100);
        });
        return it('handles native selection such as core:select-all', function() {
          atom.commands.dispatch(editorElement, 'core:select-all');
          return ensure({
            selectedBufferRange: [[0, 0], [0, 7]]
          });
        });
      });
      describe("the i keybinding", function() {
        return it("puts the editor into insert mode", function() {
          return ensure('i', {
            mode: 'insert'
          });
        });
      });
      describe("the R keybinding", function() {
        return it("puts the editor into replace mode", function() {
          return ensure('R', {
            mode: ['insert', 'replace']
          });
        });
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
        });
        describe("on a line with content", function() {
          return it("[Changed] won't adjust cursor position if outer command place the cursor on end of line('\\n') character", function() {
            ensure({
              mode: 'normal'
            });
            atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
            return ensure({
              cursor: [0, 6]
            });
          });
        });
        return describe("on an empty line", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [1, 0]
            });
            return ensure({
              cursor: [1, 0]
            });
          });
        });
      });
      return describe('with character-input operations', function() {
        beforeEach(function() {
          return set({
            text: '012345\nabcdef'
          });
        });
        return it('properly clears the operations', function() {
          ensure('d', {
            mode: 'operator-pending'
          });
          expect(vimState.operationStack.isEmpty()).toBe(false);
          ensure('r', {
            mode: 'normal'
          });
          expect(vimState.operationStack.isEmpty()).toBe(true);
          ensure('d', {
            mode: 'operator-pending'
          });
          expect(vimState.operationStack.isEmpty()).toBe(false);
          ensure('escape', {
            mode: 'normal',
            text: '012345\nabcdef'
          });
          return expect(vimState.operationStack.isEmpty()).toBe(true);
        });
      });
    });
    describe("activate-normal-mode-once command", function() {
      beforeEach(function() {
        set({
          text: "0 23456\n1 23456",
          cursor: [0, 2]
        });
        return ensure('i', {
          mode: 'insert',
          cursor: [0, 2]
        });
      });
      return it("activate normal mode without moving cursors left, then back to insert-mode once some command executed", function() {
        ensure('ctrl-o', {
          cursor: [0, 2],
          mode: 'normal'
        });
        return ensure('l', {
          cursor: [0, 3],
          mode: 'insert'
        });
      });
    });
    describe("insert-mode", function() {
      beforeEach(function() {
        return keystroke('i');
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting insert mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [0, 6]
            });
            return ensure({
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return escape('escape', {
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('ctrl-c', {
            mode: 'normal'
          });
        });
      });
      describe("clearMultipleCursorsOnEscapeInsertMode setting", function() {
        beforeEach(function() {
          return set({
            text: 'abc',
            cursor: [[0, 1], [0, 2]]
          });
        });
        describe("when enabled, clear multiple cursors on escaping insert-mode", function() {
          beforeEach(function() {
            return settings.set('clearMultipleCursorsOnEscapeInsertMode', true);
          });
          it("clear multiple cursors by respecting last cursor's position", function() {
            return ensure('escape', {
              mode: 'normal',
              numCursors: 1,
              cursor: [0, 1]
            });
          });
          return it("clear multiple cursors by respecting last cursor's position", function() {
            set({
              cursor: [[0, 2], [0, 1]]
            });
            return ensure('escape', {
              mode: 'normal',
              numCursors: 1,
              cursor: [0, 0]
            });
          });
        });
        return describe("when disabled", function() {
          beforeEach(function() {
            return settings.set('clearMultipleCursorsOnEscapeInsertMode', false);
          });
          return it("keep multiple cursors", function() {
            return ensure('escape', {
              mode: 'normal',
              numCursors: 2,
              cursor: [[0, 0], [0, 1]]
            });
          });
        });
      });
      return describe("automaticallyEscapeInsertModeOnActivePaneItemChange setting", function() {
        var otherEditor, otherVim, pane, ref2;
        ref2 = [], otherVim = ref2[0], otherEditor = ref2[1], pane = ref2[2];
        beforeEach(function() {
          getVimState(function(otherVimState, _other) {
            otherVim = _other;
            return otherEditor = otherVimState.editor;
          });
          return runs(function() {
            pane = atom.workspace.getActivePane();
            pane.activateItem(editor);
            set({
              textC: "|editor-1"
            });
            otherVim.set({
              textC: "|editor-2"
            });
            ensure('i', {
              mode: 'insert'
            });
            otherVim.ensure('i', {
              mode: 'insert'
            });
            return expect(pane.getActiveItem()).toBe(editor);
          });
        });
        describe("default behavior", function() {
          return it("remain in insert-mode on paneItem change by default", function() {
            pane.activateItem(otherEditor);
            expect(pane.getActiveItem()).toBe(otherEditor);
            ensure({
              mode: 'insert'
            });
            return otherVim.ensure({
              mode: 'insert'
            });
          });
        });
        return describe("automaticallyEscapeInsertModeOnActivePaneItemChange = true", function() {
          beforeEach(function() {
            return settings.set('automaticallyEscapeInsertModeOnActivePaneItemChange', true);
          });
          return it("return to escape mode for all vimEditors", function() {
            pane.activateItem(otherEditor);
            expect(pane.getActiveItem()).toBe(otherEditor);
            ensure({
              mode: 'normal'
            });
            return otherVim.ensure({
              mode: 'normal'
            });
          });
        });
      });
    });
    describe("replace-mode", function() {
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting replace mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('R escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          beforeEach(function() {});
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('R escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            keystroke('R');
            set({
              cursor: [0, 6]
            });
            return ensure({
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('R escape', {
          mode: 'normal'
        });
      });
      return it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('R ctrl-c', {
            mode: 'normal'
          });
        });
      });
    });
    describe("visual-mode", function() {
      beforeEach(function() {
        set({
          text: "one two three",
          cursor: [0, 4]
        });
        return keystroke('v');
      });
      it("selects the character under the cursor", function() {
        return ensure({
          selectedBufferRange: [[0, 4], [0, 5]],
          selectedText: 't'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('escape', {
          cursor: [0, 4],
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed on selection is reversed", function() {
        ensure({
          selectedText: 't'
        });
        ensure('h h', {
          selectedText: 'e t',
          selectionIsReversed: true
        });
        return ensure('escape', {
          mode: 'normal',
          cursor: [0, 2]
        });
      });
      describe("motions", function() {
        it("transforms the selection", function() {
          return ensure('w', {
            selectedText: 'two t'
          });
        });
        return it("always leaves the initially selected character selected", function() {
          ensure('h', {
            selectedText: ' t'
          });
          ensure('l', {
            selectedText: 't'
          });
          return ensure('l', {
            selectedText: 'tw'
          });
        });
      });
      describe("operators", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('V d', {
            text: "\nabcdef"
          });
        });
      });
      describe("returning to normal-mode", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef"
          });
          return ensure('V escape', {
            selectedText: ''
          });
        });
      });
      describe("the o keybinding", function() {
        it("reversed each selection", function() {
          set({
            addCursor: [0, 12]
          });
          ensure('i w', {
            selectedText: ["two", "three"],
            selectionIsReversed: false
          });
          return ensure('o', {
            selectionIsReversed: true
          });
        });
        return xit("harmonizes selection directions", function() {
          set({
            cursor: [0, 0]
          });
          keystroke('e e');
          set({
            addCursor: [0, 2e308]
          });
          ensure('h h', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursor: [[0, 5], [0, 11]]
          });
          return ensure('o', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursor: [[0, 5], [0, 13]]
          });
        });
      });
      describe("activate visualmode within visualmode", function() {
        var cursorPosition;
        cursorPosition = null;
        beforeEach(function() {
          cursorPosition = [0, 4];
          set({
            text: "line one\nline two\nline three\n",
            cursor: cursorPosition
          });
          return ensure('escape', {
            mode: 'normal'
          });
        });
        describe("restore characterwise from linewise", function() {
          beforeEach(function() {
            ensure('v', {
              mode: ['visual', 'characterwise']
            });
            ensure('2 j V', {
              selectedText: "line one\nline two\nline three\n",
              mode: ['visual', 'linewise'],
              selectionIsReversed: false
            });
            return ensure('o', {
              selectedText: "line one\nline two\nline three\n",
              mode: ['visual', 'linewise'],
              selectionIsReversed: true
            });
          });
          it("v after o", function() {
            return ensure('v', {
              selectedText: " one\nline two\nline ",
              mode: ['visual', 'characterwise'],
              selectionIsReversed: true
            });
          });
          return it("escape after o", function() {
            return ensure('escape', {
              cursor: [0, 4],
              mode: 'normal'
            });
          });
        });
        describe("activateVisualMode with same type puts the editor into normal mode", function() {
          describe("characterwise: vv", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('v', {
                mode: ['visual', 'characterwise']
              });
              return ensure('v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          describe("linewise: VV", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('V', {
                mode: ['visual', 'linewise']
              });
              return ensure('V', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          return describe("blockwise: ctrl-v twice", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('ctrl-v', {
                mode: ['visual', 'blockwise']
              });
              return ensure('ctrl-v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
        });
        describe("change submode within visualmode", function() {
          beforeEach(function() {
            return set({
              text: "line one\nline two\nline three\n",
              cursor: [[0, 5], [2, 5]]
            });
          });
          it("can change submode within visual mode", function() {
            ensure('v', {
              mode: ['visual', 'characterwise']
            });
            ensure('V', {
              mode: ['visual', 'linewise']
            });
            ensure('ctrl-v', {
              mode: ['visual', 'blockwise']
            });
            return ensure('v', {
              mode: ['visual', 'characterwise']
            });
          });
          return it("recover original range when shift from linewise to characterwise", function() {
            ensure('v i w', {
              selectedText: ['one', 'three']
            });
            ensure('V', {
              selectedText: ["line one\n", "line three\n"]
            });
            return ensure('v', {
              selectedText: ["one", "three"]
            });
          });
        });
        return describe("keep goalColum when submode change in visual-mode", function() {
          var text;
          text = null;
          beforeEach(function() {
            text = new TextData("0_34567890ABCDEF\n1_34567890\n2_34567\n3_34567890A\n4_34567890ABCDEF\n");
            return set({
              text: text.getRaw(),
              cursor: [0, 0]
            });
          });
          return it("keep goalColumn when shift linewise to characterwise", function() {
            ensure('V', {
              selectedText: text.getLines([0]),
              propertyHead: [0, 0],
              mode: ['visual', 'linewise']
            });
            ensure('$', {
              selectedText: text.getLines([0]),
              propertyHead: [0, 16],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1]),
              propertyHead: [1, 10],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2]),
              propertyHead: [2, 7],
              mode: ['visual', 'linewise']
            });
            ensure('v', {
              selectedText: text.getLines([0, 1, 2]),
              propertyHead: [2, 7],
              mode: ['visual', 'characterwise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3]),
              propertyHead: [3, 11],
              mode: ['visual', 'characterwise']
            });
            ensure('v', {
              cursor: [3, 10],
              mode: 'normal'
            });
            return ensure('j', {
              cursor: [4, 15],
              mode: 'normal'
            });
          });
        });
      });
      describe("deactivating visual mode", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "line one\nline two\nline three\n",
            cursor: [0, 7]
          });
        });
        it("can put cursor at in visual char mode", function() {
          return ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [0, 8]
          });
        });
        it("adjust cursor position 1 column left when deactivated", function() {
          return ensure('v escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
        return it("can select new line in visual mode", function() {
          ensure('v', {
            cursor: [0, 8],
            propertyHead: [0, 7]
          });
          ensure('l', {
            cursor: [1, 0],
            propertyHead: [0, 8]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
      });
      return describe("deactivating visual mode on blank line", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "0: abc\n\n2: abc",
            cursor: [1, 0]
          });
        });
        it("v case-1", function() {
          ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("v case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('v j', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0],
            selectedText: ": abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-1", function() {
          ensure('V', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('V j', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0],
            selectedText: "0: abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("ctrl-v", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedBufferRange: [[1, 0], [1, 0]]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        return it("ctrl-v and move over empty line", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[1, 0], [1, 0]]
          });
          ensure('k', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[[0, 0], [0, 1]], [[1, 0], [1, 0]]]
          });
          ensure('j', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[1, 0], [1, 0]]
          });
          return ensure('j', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[[1, 0], [1, 0]], [[2, 0], [2, 1]]]
          });
        });
      });
    });
    describe("marks", function() {
      beforeEach(function() {
        return set({
          text: "text in line 1\ntext in line 2\ntext in line 3"
        });
      });
      it("basic marking functionality", function() {
        set({
          cursor: [1, 1]
        });
        keystroke('m t');
        set({
          cursor: [2, 2]
        });
        return ensure('` t', {
          cursor: [1, 1]
        });
      });
      it("real (tracking) marking functionality", function() {
        set({
          cursor: [2, 2]
        });
        keystroke('m q');
        set({
          cursor: [1, 2]
        });
        return ensure('o escape ` q', {
          cursor: [3, 2]
        });
      });
      return it("real (tracking) marking functionality", function() {
        set({
          cursor: [2, 2]
        });
        keystroke('m q');
        set({
          cursor: [1, 2]
        });
        return ensure('d d escape ` q', {
          cursor: [1, 2]
        });
      });
    });
    return describe("is-narrowed attribute", function() {
      var ensureNormalModeState;
      ensureNormalModeState = function() {
        return ensure("escape", {
          mode: 'normal',
          selectedText: '',
          selectionIsNarrowed: false
        });
      };
      beforeEach(function() {
        return set({
          text: "1:-----\n2:-----\n3:-----\n4:-----",
          cursor: [0, 0]
        });
      });
      describe("normal-mode", function() {
        return it("is not narrowed", function() {
          return ensure({
            mode: ['normal'],
            selectionIsNarrowed: false
          });
        });
      });
      describe("visual-mode.characterwise", function() {
        it("[single row] is narrowed", function() {
          ensure('v $', {
            selectedText: '1:-----\n',
            mode: ['visual', 'characterwise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('v j', {
            selectedText: "1:-----\n2",
            mode: ['visual', 'characterwise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
      describe("visual-mode.linewise", function() {
        it("[single row] is narrowed", function() {
          ensure('V', {
            selectedText: "1:-----\n",
            mode: ['visual', 'linewise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('V j', {
            selectedText: "1:-----\n2:-----\n",
            mode: ['visual', 'linewise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
      return describe("visual-mode.blockwise", function() {
        it("[single row] is narrowed", function() {
          ensure('ctrl-v l', {
            selectedText: "1:",
            mode: ['visual', 'blockwise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('ctrl-v l j', {
            selectedText: ["1:", "2:"],
            mode: ['visual', 'blockwise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdmltLXN0YXRlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTRDLE9BQUEsQ0FBUSxlQUFSLENBQTVDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qjs7RUFDeEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0FBQ25CLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO01BQ3pCLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBO2VBQ3hELE1BQUEsQ0FBTztVQUFBLElBQUEsRUFBTSxRQUFOO1NBQVA7TUFEd0QsQ0FBMUQ7YUFHQSxFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQTtRQUNoRSxRQUFRLENBQUMsR0FBVCxDQUFhLG1CQUFiLEVBQWtDLElBQWxDO2VBQ0EsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7aUJBQ1YsR0FBRyxDQUFDLE1BQUosQ0FBVztZQUFBLElBQUEsRUFBTSxRQUFOO1dBQVg7UUFEVSxDQUFaO01BRmdFLENBQWxFO0lBSnlCLENBQTNCO0lBU0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FB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QUgsRUFBOEIsU0FBQTtVQUM1QixNQUFBLENBQU8sWUFBUCxFQUNFO1lBQUEsWUFBQSxFQUFjLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FBZDtZQUNBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxXQUFYLENBRE47WUFFQSxtQkFBQSxFQUFxQixJQUZyQjtXQURGO2lCQUlBLHFCQUFBLENBQUE7UUFMNEIsQ0FBOUI7TUFQZ0MsQ0FBbEM7SUFyRGdDLENBQWxDO0VBOWlCbUIsQ0FBckI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57Z2V0VmltU3RhdGUsIFRleHREYXRhLCB3aXRoTW9ja1BsYXRmb3JtfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJWaW1TdGF0ZVwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwiaW5pdGlhbGl6YXRpb25cIiwgLT5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbiBub3JtYWwtbW9kZSBpbml0aWFsbHkgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgZW5zdXJlIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbiBpbnNlcnQtbW9kZSBpZiBzdGFydEluSW5zZXJ0TW9kZSBpcyB0cnVlXCIsIC0+XG4gICAgICBzZXR0aW5ncy5zZXQgJ3N0YXJ0SW5JbnNlcnRNb2RlJywgdHJ1ZVxuICAgICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICAgIHZpbS5lbnN1cmUgbW9kZTogJ2luc2VydCdcblxuICBkZXNjcmliZSBcIjo6ZGVzdHJveVwiLCAtPlxuICAgIGl0IFwicmUtZW5hYmxlcyB0ZXh0IGlucHV0IG9uIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5pc0lucHV0RW5hYmxlZCgpKS50b0JlRmFsc3koKVxuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jb21wb25lbnQuaXNJbnB1dEVuYWJsZWQoKSkudG9CZVRydXRoeSgpXG5cbiAgICBpdCBcInJlbW92ZXMgdGhlIG1vZGUgY2xhc3NlcyBmcm9tIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgIGVuc3VyZSBtb2RlOiAnbm9ybWFsJ1xuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJub3JtYWwtbW9kZVwiKSkudG9CZUZhbHN5KClcblxuICAgIGl0IFwiaXMgYSBub29wIHdoZW4gdGhlIGVkaXRvciBpcyBhbHJlYWR5IGRlc3Ryb3llZFwiLCAtPlxuICAgICAgZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmRlc3Ryb3koKVxuICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG5cbiAgZGVzY3JpYmUgXCJub3JtYWwtbW9kZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBlbnRlcmluZyBhbiBpbnNlcnRhYmxlIGNoYXJhY3RlclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBrZXlzdHJva2UgJ1xcXFwnXG5cbiAgICAgIGl0IFwic3RvcHMgcHJvcGFnYXRpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlIHRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZW50ZXJpbmcgYW4gb3BlcmF0b3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAga2V5c3Ryb2tlICdkJ1xuXG4gICAgICBkZXNjcmliZSBcIndpdGggYW4gb3BlcmF0b3IgdGhhdCBjYW4ndCBiZSBjb21wb3NlZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICd4J1xuXG4gICAgICAgIGl0IFwiY2xlYXJzIHRoZSBvcGVyYXRvciBzdGFja1wiLCAtPlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUodHJ1ZSlcblxuICAgICAgZGVzY3JpYmUgXCJ0aGUgZXNjYXBlIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnZXNjYXBlJ1xuXG4gICAgICAgIGl0IFwiY2xlYXJzIHRoZSBvcGVyYXRvciBzdGFja1wiLCAtPlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUodHJ1ZSlcblxuICAgICAgZGVzY3JpYmUgXCJ0aGUgY3RybC1jIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnY3RybC1jJ1xuXG4gICAgICAgIGl0IFwiY2xlYXJzIHRoZSBvcGVyYXRvciBzdGFja1wiLCAtPlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUodHJ1ZSlcblxuICAgIGRlc2NyaWJlIFwidGhlIGVzY2FwZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcImNsZWFycyBhbnkgZXh0cmEgY3Vyc29yc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIm9uZS10d28tdGhyZWVcIlxuICAgICAgICAgIGFkZEN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSBudW1DdXJzb3JzOiAyXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbnVtQ3Vyc29yczogMVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgdiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBrZXlzdHJva2UgJ3YnXG5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gdmlzdWFsIGNoYXJhY3Rlcndpc2UgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgIGRlc2NyaWJlIFwidGhlIFYga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjAxMjM0NVxcbmFiY2RlZlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byB2aXN1YWwgbGluZXdpc2UgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG5cbiAgICAgIGl0IFwic2VsZWN0cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnVicsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnMDEyMzQ1XFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC12IGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gdmlzdWFsIGJsb2Nrd2lzZSBtb2RlXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2N0cmwtdicsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG5cbiAgICBkZXNjcmliZSBcInNlbGVjdGluZyB0ZXh0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKF8uXywgXCJub3dcIikuYW5kQ2FsbEZha2UgLT4gd2luZG93Lm5vd1xuICAgICAgICBzZXQgdGV4dDogXCJhYmMgZGVmXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgYWR2YW5jZUNsb2NrKDIwMClcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCBcImNvcmU6c2VsZWN0LXJpZ2h0XCIpXG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMF0sIFswLCAxXV1cblxuICAgICAgaXQgXCJoYW5kbGVzIHRoZSBlZGl0b3IgYmVpbmcgZGVzdHJveWVkIHNob3J0bHkgYWZ0ZXIgc2VsZWN0aW5nIHRleHRcIiwgLT5cbiAgICAgICAgc2V0IHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMF0sIFswLCAzXV1cbiAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuICAgICAgICB2aW1TdGF0ZS5kZXN0cm95KClcbiAgICAgICAgYWR2YW5jZUNsb2NrKDEwMClcblxuICAgICAgaXQgJ2hhbmRsZXMgbmF0aXZlIHNlbGVjdGlvbiBzdWNoIGFzIGNvcmU6c2VsZWN0LWFsbCcsIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2NvcmU6c2VsZWN0LWFsbCcpXG4gICAgICAgIGVuc3VyZSBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMCwgN11dXG5cbiAgICBkZXNjcmliZSBcInRoZSBpIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwidGhlIFIga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byByZXBsYWNlIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG5cbiAgICBkZXNjcmliZSBcIndpdGggY29udGVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIwMTIzNDVcXG5cXG5hYmNkZWZcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICAgIGl0IFwiW0NoYW5nZWRdIHdvbid0IGFkanVzdCBjdXJzb3IgcG9zaXRpb24gaWYgb3V0ZXIgY29tbWFuZCBwbGFjZSB0aGUgY3Vyc29yIG9uIGVuZCBvZiBsaW5lKCdcXFxcbicpIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgXCJlZGl0b3I6bW92ZS10by1lbmQtb2YtbGluZVwiKVxuICAgICAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCA2XVxuXG4gICAgICBkZXNjcmliZSBcIm9uIGFuIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJhbGxvd3MgdGhlIGN1cnNvciB0byBiZSBwbGFjZWQgb24gdGhlIFxcbiBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlICd3aXRoIGNoYXJhY3Rlci1pbnB1dCBvcGVyYXRpb25zJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6ICcwMTIzNDVcXG5hYmNkZWYnXG5cbiAgICAgIGl0ICdwcm9wZXJseSBjbGVhcnMgdGhlIG9wZXJhdGlvbnMnLCAtPlxuXG4gICAgICAgIGVuc3VyZSAnZCcsIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKGZhbHNlKVxuICAgICAgICBlbnN1cmUgJ3InLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKHRydWUpXG5cbiAgICAgICAgZW5zdXJlICdkJywgbW9kZTogJ29wZXJhdG9yLXBlbmRpbmcnXG4gICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUoZmFsc2UpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIHRleHQ6ICcwMTIzNDVcXG5hYmNkZWYnXG4gICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUodHJ1ZSlcblxuICBkZXNjcmliZSBcImFjdGl2YXRlLW5vcm1hbC1tb2RlLW9uY2UgY29tbWFuZFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMCAyMzQ1NlxuICAgICAgICAxIDIzNDU2XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCBcImFjdGl2YXRlIG5vcm1hbCBtb2RlIHdpdGhvdXQgbW92aW5nIGN1cnNvcnMgbGVmdCwgdGhlbiBiYWNrIHRvIGluc2VydC1tb2RlIG9uY2Ugc29tZSBjb21tYW5kIGV4ZWN1dGVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ2N0cmwtbycsIGN1cnNvcjogWzAsIDJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMCwgM10sIG1vZGU6ICdpbnNlcnQnXG5cbiAgZGVzY3JpYmUgXCJpbnNlcnQtbW9kZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4ga2V5c3Ryb2tlICdpJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBpbiB0aGUgbWlkZGxlIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGVmdCB3aGVuIGV4aXRpbmcgaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgYXQgdGhlIGJlZ2lubmluZyBvZiBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwibGVhdmVzIHRoZSBjdXJzb3IgYXQgdGhlIGJlZ2lubmluZyBvZiBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIm9uIGEgbGluZSB3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgaXQgXCJhbGxvd3MgdGhlIGN1cnNvciB0byBiZSBwbGFjZWQgb24gdGhlIFxcbiBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gbm9ybWFsIG1vZGUgd2hlbiA8ZXNjYXBlPiBpcyBwcmVzc2VkXCIsIC0+XG4gICAgICBlc2NhcGUgJ2VzY2FwZScsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIG5vcm1hbCBtb2RlIHdoZW4gPGN0cmwtYz4gaXMgcHJlc3NlZFwiLCAtPlxuICAgICAgd2l0aE1vY2tQbGF0Zm9ybSBlZGl0b3JFbGVtZW50LCAncGxhdGZvcm0tZGFyd2luJyAsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1jJywgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUgc2V0dGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAnYWJjJ1xuICAgICAgICAgIGN1cnNvcjogW1swLCAxXSwgWzAsIDJdXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gZW5hYmxlZCwgY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBvbiBlc2NhcGluZyBpbnNlcnQtbW9kZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScsIHRydWUpXG4gICAgICAgIGl0IFwiY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBieSByZXNwZWN0aW5nIGxhc3QgY3Vyc29yJ3MgcG9zaXRpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBudW1DdXJzb3JzOiAxLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGl0IFwiY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBieSByZXNwZWN0aW5nIGxhc3QgY3Vyc29yJ3MgcG9zaXRpb25cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbWzAsIDJdLCBbMCwgMV1dXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgbnVtQ3Vyc29yczogMSwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGRpc2FibGVkXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJywgZmFsc2UpXG4gICAgICAgIGl0IFwia2VlcCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgbnVtQ3Vyc29yczogMiwgY3Vyc29yOiBbWzAsIDBdLCBbMCwgMV1dXG5cbiAgICBkZXNjcmliZSBcImF1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZSBzZXR0aW5nXCIsIC0+XG4gICAgICBbb3RoZXJWaW0sIG90aGVyRWRpdG9yLCBwYW5lXSA9IFtdXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZ2V0VmltU3RhdGUgKG90aGVyVmltU3RhdGUsIF9vdGhlcikgLT5cbiAgICAgICAgICBvdGhlclZpbSA9IF9vdGhlclxuICAgICAgICAgIG90aGVyRWRpdG9yID0gb3RoZXJWaW1TdGF0ZS5lZGl0b3JcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcblxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ8ZWRpdG9yLTFcIlxuICAgICAgICAgIG90aGVyVmltLnNldCB0ZXh0QzogXCJ8ZWRpdG9yLTJcIlxuXG4gICAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBvdGhlclZpbS5lbnN1cmUgJ2knLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW0oKSkudG9CZShlZGl0b3IpXG5cbiAgICAgIGRlc2NyaWJlIFwiZGVmYXVsdCBiZWhhdmlvclwiLCAtPlxuICAgICAgICBpdCBcInJlbWFpbiBpbiBpbnNlcnQtbW9kZSBvbiBwYW5lSXRlbSBjaGFuZ2UgYnkgZGVmYXVsdFwiLCAtPlxuXG4gICAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG4gICAgICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbSgpKS50b0JlKG90aGVyRWRpdG9yKVxuXG4gICAgICAgICAgZW5zdXJlIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgb3RoZXJWaW0uZW5zdXJlIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwiYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlID0gdHJ1ZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2UnLCB0cnVlKVxuXG4gICAgICAgIGl0IFwicmV0dXJuIHRvIGVzY2FwZSBtb2RlIGZvciBhbGwgdmltRWRpdG9yc1wiLCAtPlxuICAgICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG90aGVyRWRpdG9yKVxuICAgICAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW0oKSkudG9CZShvdGhlckVkaXRvcilcbiAgICAgICAgICBlbnN1cmUgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBvdGhlclZpbS5lbnN1cmUgbW9kZTogJ25vcm1hbCdcblxuICBkZXNjcmliZSBcInJlcGxhY2UtbW9kZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aCBjb250ZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGxlZnQgd2hlbiBleGl0aW5nIHJlcGxhY2UgbW9kZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGVuc3VyZSAnUiBlc2NhcGUnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIGF0IHRoZSBiZWdpbm5pbmcgb2YgbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG5cbiAgICAgICAgaXQgXCJsZWF2ZXMgdGhlIGN1cnNvciBhdCB0aGUgYmVnaW5uaW5nIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1IgZXNjYXBlJywgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICAgIGl0IFwiYWxsb3dzIHRoZSBjdXJzb3IgdG8gYmUgcGxhY2VkIG9uIHRoZSBcXG4gY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICdSJ1xuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byBub3JtYWwgbW9kZSB3aGVuIDxlc2NhcGU+IGlzIHByZXNzZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnUiBlc2NhcGUnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byBub3JtYWwgbW9kZSB3aGVuIDxjdHJsLWM+IGlzIHByZXNzZWRcIiwgLT5cbiAgICAgIHdpdGhNb2NrUGxhdGZvcm0gZWRpdG9yRWxlbWVudCwgJ3BsYXRmb3JtLWRhcndpbicgLCAtPlxuICAgICAgICBlbnN1cmUgJ1IgY3RybC1jJywgbW9kZTogJ25vcm1hbCdcblxuICBkZXNjcmliZSBcInZpc3VhbC1tb2RlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBvbmUgdHdvIHRocmVlXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAga2V5c3Ryb2tlICd2J1xuXG4gICAgaXQgXCJzZWxlY3RzIHRoZSBjaGFyYWN0ZXIgdW5kZXIgdGhlIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlXG4gICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgNF0sIFswLCA1XV1cbiAgICAgICAgc2VsZWN0ZWRUZXh0OiAndCdcblxuICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gbm9ybWFsIG1vZGUgd2hlbiA8ZXNjYXBlPiBpcyBwcmVzc2VkXCIsIC0+XG4gICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIG5vcm1hbCBtb2RlIHdoZW4gPGVzY2FwZT4gaXMgcHJlc3NlZCBvbiBzZWxlY3Rpb24gaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgIGVuc3VyZSBzZWxlY3RlZFRleHQ6ICd0J1xuICAgICAgZW5zdXJlICdoIGgnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6ICdlIHQnXG4gICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGRlc2NyaWJlIFwibW90aW9uc1wiLCAtPlxuICAgICAgaXQgXCJ0cmFuc2Zvcm1zIHRoZSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlICd3Jywgc2VsZWN0ZWRUZXh0OiAndHdvIHQnXG5cbiAgICAgIGl0IFwiYWx3YXlzIGxlYXZlcyB0aGUgaW5pdGlhbGx5IHNlbGVjdGVkIGNoYXJhY3RlciBzZWxlY3RlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2gnLCBzZWxlY3RlZFRleHQ6ICcgdCdcbiAgICAgICAgZW5zdXJlICdsJywgc2VsZWN0ZWRUZXh0OiAndCdcbiAgICAgICAgZW5zdXJlICdsJywgc2VsZWN0ZWRUZXh0OiAndHcnXG5cbiAgICBkZXNjcmliZSBcIm9wZXJhdG9yc1wiLCAtPlxuICAgICAgaXQgXCJvcGVyYXRlIG9uIHRoZSBjdXJyZW50IHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdWIGQnLCB0ZXh0OiBcIlxcbmFiY2RlZlwiXG5cbiAgICBkZXNjcmliZSBcInJldHVybmluZyB0byBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgaXQgXCJvcGVyYXRlIG9uIHRoZSBjdXJyZW50IHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIwMTIzNDVcXG5cXG5hYmNkZWZcIlxuICAgICAgICBlbnN1cmUgJ1YgZXNjYXBlJywgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgbyBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcInJldmVyc2VkIGVhY2ggc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldCBhZGRDdXJzb3I6IFswLCAxMl1cbiAgICAgICAgZW5zdXJlICdpIHcnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1widHdvXCIsIFwidGhyZWVcIl1cbiAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiBmYWxzZVxuICAgICAgICBlbnN1cmUgJ28nLFxuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgeGl0IFwiaGFybW9uaXplcyBzZWxlY3Rpb24gZGlyZWN0aW9uc1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAga2V5c3Ryb2tlICdlIGUnXG4gICAgICAgIHNldCBhZGRDdXJzb3I6IFswLCBJbmZpbml0eV1cbiAgICAgICAgZW5zdXJlICdoIGgnLFxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgMF0sIFswLCA1XV0sXG4gICAgICAgICAgICBbWzAsIDExXSwgWzAsIDEzXV1cbiAgICAgICAgICBdXG4gICAgICAgICAgY3Vyc29yOiBbXG4gICAgICAgICAgICBbMCwgNV1cbiAgICAgICAgICAgIFswLCAxMV1cbiAgICAgICAgICBdXG5cbiAgICAgICAgZW5zdXJlICdvJyxcbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbXG4gICAgICAgICAgICBbWzAsIDBdLCBbMCwgNV1dLFxuICAgICAgICAgICAgW1swLCAxMV0sIFswLCAxM11dXG4gICAgICAgICAgXVxuICAgICAgICAgIGN1cnNvcjogW1xuICAgICAgICAgICAgWzAsIDVdXG4gICAgICAgICAgICBbMCwgMTNdXG4gICAgICAgICAgXVxuXG4gICAgZGVzY3JpYmUgXCJhY3RpdmF0ZSB2aXN1YWxtb2RlIHdpdGhpbiB2aXN1YWxtb2RlXCIsIC0+XG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBbMCwgNF1cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBsaW5lIG9uZVxuICAgICAgICAgICAgbGluZSB0d29cbiAgICAgICAgICAgIGxpbmUgdGhyZWVcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogY3Vyc29yUG9zaXRpb25cblxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwicmVzdG9yZSBjaGFyYWN0ZXJ3aXNlIGZyb20gbGluZXdpc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnMiBqIFYnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgbGluZSBvbmVcbiAgICAgICAgICAgICAgbGluZSB0d29cbiAgICAgICAgICAgICAgbGluZSB0aHJlZVxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IGZhbHNlXG4gICAgICAgICAgZW5zdXJlICdvJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIGxpbmUgb25lXG4gICAgICAgICAgICAgIGxpbmUgdHdvXG4gICAgICAgICAgICAgIGxpbmUgdGhyZWVcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG5cbiAgICAgICAgaXQgXCJ2IGFmdGVyIG9cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIiBvbmVcXG5saW5lIHR3b1xcbmxpbmUgXCJcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogdHJ1ZVxuICAgICAgICBpdCBcImVzY2FwZSBhZnRlciBvXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwiYWN0aXZhdGVWaXN1YWxNb2RlIHdpdGggc2FtZSB0eXBlIHB1dHMgdGhlIGVkaXRvciBpbnRvIG5vcm1hbCBtb2RlXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiY2hhcmFjdGVyd2lzZTogdnZcIiwgLT5cbiAgICAgICAgICBpdCBcImFjdGl2YXRpbmcgdHdpY2UgbWFrZSBlZGl0b3IgcmV0dXJuIHRvIG5vcm1hbCBtb2RlIFwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBjdXJzb3JQb3NpdGlvblxuXG4gICAgICAgIGRlc2NyaWJlIFwibGluZXdpc2U6IFZWXCIsIC0+XG4gICAgICAgICAgaXQgXCJhY3RpdmF0aW5nIHR3aWNlIG1ha2UgZWRpdG9yIHJldHVybiB0byBub3JtYWwgbW9kZSBcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnVicsIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICAgIGVuc3VyZSAnVicsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IGN1cnNvclBvc2l0aW9uXG5cbiAgICAgICAgZGVzY3JpYmUgXCJibG9ja3dpc2U6IGN0cmwtdiB0d2ljZVwiLCAtPlxuICAgICAgICAgIGl0IFwiYWN0aXZhdGluZyB0d2ljZSBtYWtlIGVkaXRvciByZXR1cm4gdG8gbm9ybWFsIG1vZGUgXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ2N0cmwtdicsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgICBlbnN1cmUgJ2N0cmwtdicsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IGN1cnNvclBvc2l0aW9uXG5cbiAgICAgIGRlc2NyaWJlIFwiY2hhbmdlIHN1Ym1vZGUgd2l0aGluIHZpc3VhbG1vZGVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJsaW5lIG9uZVxcbmxpbmUgdHdvXFxubGluZSB0aHJlZVxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFtbMCwgNV0sIFsyLCA1XV1cblxuICAgICAgICBpdCBcImNhbiBjaGFuZ2Ugc3VibW9kZSB3aXRoaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YnICAgICAgICAsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnVicgICAgICAgICwgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnY3RybC12JywgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ3YnICAgICAgICAsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGl0IFwicmVjb3ZlciBvcmlnaW5hbCByYW5nZSB3aGVuIHNoaWZ0IGZyb20gbGluZXdpc2UgdG8gY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBpIHcnLCBzZWxlY3RlZFRleHQ6IFsnb25lJywgJ3RocmVlJ11cbiAgICAgICAgICBlbnN1cmUgJ1YnLCBzZWxlY3RlZFRleHQ6IFtcImxpbmUgb25lXFxuXCIsIFwibGluZSB0aHJlZVxcblwiXVxuICAgICAgICAgIGVuc3VyZSAndicsIHNlbGVjdGVkVGV4dDogW1wib25lXCIsIFwidGhyZWVcIl1cblxuICAgICAgZGVzY3JpYmUgXCJrZWVwIGdvYWxDb2x1bSB3aGVuIHN1Ym1vZGUgY2hhbmdlIGluIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIHRleHQgPSBudWxsXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAgIDBfMzQ1Njc4OTBBQkNERUZcbiAgICAgICAgICAxXzM0NTY3ODkwXG4gICAgICAgICAgMl8zNDU2N1xuICAgICAgICAgIDNfMzQ1Njc4OTBBXG4gICAgICAgICAgNF8zNDU2Nzg5MEFCQ0RFRlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBpdCBcImtlZXAgZ29hbENvbHVtbiB3aGVuIHNoaWZ0IGxpbmV3aXNlIHRvIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1YnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzBdKSwgcHJvcGVydHlIZWFkOiBbMCwgMF0sIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJyQnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzBdKSwgcHJvcGVydHlIZWFkOiBbMCwgMTZdLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLCAxXSksIHByb3BlcnR5SGVhZDogWzEsIDEwXSwgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMl0pLCBwcm9wZXJ0eUhlYWQ6IFsyLCA3XSwgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIGVuc3VyZSAndicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMl0pLCBwcm9wZXJ0eUhlYWQ6IFsyLCA3XSwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4zXSksIHByb3BlcnR5SGVhZDogWzMsIDExXSwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgZW5zdXJlICd2JywgY3Vyc29yOiBbMywgMTBdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzQsIDE1XSwgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiZGVhY3RpdmF0aW5nIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBsaW5lIG9uZVxuICAgICAgICAgICAgbGluZSB0d29cbiAgICAgICAgICAgIGxpbmUgdGhyZWVcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDddXG4gICAgICBpdCBcImNhbiBwdXQgY3Vyc29yIGF0IGluIHZpc3VhbCBjaGFyIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFswLCA4XVxuICAgICAgaXQgXCJhZGp1c3QgY3Vyc29yIHBvc2l0aW9uIDEgY29sdW1uIGxlZnQgd2hlbiBkZWFjdGl2YXRlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzAsIDddXG4gICAgICBpdCBcImNhbiBzZWxlY3QgbmV3IGxpbmUgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2JywgY3Vyc29yOiBbMCwgOF0sIHByb3BlcnR5SGVhZDogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzEsIDBdLCBwcm9wZXJ0eUhlYWQ6IFswLCA4XVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFswLCA3XVxuXG4gICAgZGVzY3JpYmUgXCJkZWFjdGl2YXRpbmcgdmlzdWFsIG1vZGUgb24gYmxhbmsgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDogYWJjXG5cbiAgICAgICAgICAgIDI6IGFiY1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgIGl0IFwidiBjYXNlLTFcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgaXQgXCJ2IGNhc2UtMiBzZWxlY3Rpb24gaGVhZCBpcyBibGFuayBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ3YgaicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbMiwgMF0sIHNlbGVjdGVkVGV4dDogXCI6IGFiY1xcblxcblwiXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcIlYgY2FzZS0xXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnVicsIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ10sIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcIlYgY2FzZS0yIHNlbGVjdGlvbiBoZWFkIGlzIGJsYW5rIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnViBqJywgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXSwgY3Vyc29yOiBbMiwgMF0sIHNlbGVjdGVkVGV4dDogXCIwOiBhYmNcXG5cXG5cIlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgaXQgXCJjdHJsLXZcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLXYnLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXSwgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1sxLCAwXSwgWzEsIDBdXVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgaXQgXCJjdHJsLXYgYW5kIG1vdmUgb3ZlciBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC12JywgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ10sIHNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiBbWzEsIDBdLCBbMSwgMF1dXG4gICAgICAgIGVuc3VyZSAnaycsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddLCBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogW1tbMCwgMF0sIFswLCAxXV0sIFtbMSwgMF0sIFsxLCAwXV1dXG4gICAgICAgIGVuc3VyZSAnaicsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddLCBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogW1sxLCAwXSwgWzEsIDBdXVxuICAgICAgICBlbnN1cmUgJ2onLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXSwgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtbWzEsIDBdLCBbMSwgMF1dLCBbWzIsIDBdLCBbMiwgMV1dXVxuXG4gIGRlc2NyaWJlIFwibWFya3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+IHNldCB0ZXh0OiBcInRleHQgaW4gbGluZSAxXFxudGV4dCBpbiBsaW5lIDJcXG50ZXh0IGluIGxpbmUgM1wiXG5cbiAgICBpdCBcImJhc2ljIG1hcmtpbmcgZnVuY3Rpb25hbGl0eVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICBrZXlzdHJva2UgJ20gdCdcbiAgICAgIHNldCBjdXJzb3I6IFsyLCAyXVxuICAgICAgZW5zdXJlICdgIHQnLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgaXQgXCJyZWFsICh0cmFja2luZykgbWFya2luZyBmdW5jdGlvbmFsaXR5XCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMiwgMl1cbiAgICAgIGtleXN0cm9rZSAnbSBxJ1xuICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICBlbnN1cmUgJ28gZXNjYXBlIGAgcScsIGN1cnNvcjogWzMsIDJdXG5cbiAgICBpdCBcInJlYWwgKHRyYWNraW5nKSBtYXJraW5nIGZ1bmN0aW9uYWxpdHlcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsyLCAyXVxuICAgICAga2V5c3Ryb2tlICdtIHEnXG4gICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgIGVuc3VyZSAnZCBkIGVzY2FwZSBgIHEnLCBjdXJzb3I6IFsxLCAyXVxuXG4gIGRlc2NyaWJlIFwiaXMtbmFycm93ZWQgYXR0cmlidXRlXCIsIC0+XG4gICAgZW5zdXJlTm9ybWFsTW9kZVN0YXRlID0gLT5cbiAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG4gICAgICAgIHNlbGVjdGlvbklzTmFycm93ZWQ6IGZhbHNlXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAxOi0tLS0tXG4gICAgICAgIDI6LS0tLS1cbiAgICAgICAgMzotLS0tLVxuICAgICAgICA0Oi0tLS0tXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgaXQgXCJpcyBub3QgbmFycm93ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlXG4gICAgICAgICAgbW9kZTogWydub3JtYWwnXVxuICAgICAgICAgIHNlbGVjdGlvbklzTmFycm93ZWQ6IGZhbHNlXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICBpdCBcIltzaW5nbGUgcm93XSBpcyBuYXJyb3dlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgJCcsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnMTotLS0tLVxcbidcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc05hcnJvd2VkOiBmYWxzZVxuICAgICAgICBlbnN1cmVOb3JtYWxNb2RlU3RhdGUoKVxuICAgICAgaXQgXCJbbXVsdGktcm93XSBpcyBuYXJyb3dlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaicsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAxOi0tLS0tXG4gICAgICAgICAgMlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGlvbklzTmFycm93ZWQ6IHRydWVcbiAgICAgICAgZW5zdXJlTm9ybWFsTW9kZVN0YXRlKClcbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmxpbmV3aXNlXCIsIC0+XG4gICAgICBpdCBcIltzaW5nbGUgcm93XSBpcyBuYXJyb3dlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1YnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIxOi0tLS0tXFxuXCJcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgc2VsZWN0aW9uSXNOYXJyb3dlZDogZmFsc2VcbiAgICAgICAgZW5zdXJlTm9ybWFsTW9kZVN0YXRlKClcbiAgICAgIGl0IFwiW211bHRpLXJvd10gaXMgbmFycm93ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdWIGonLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgMTotLS0tLVxuICAgICAgICAgIDI6LS0tLS1cXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgc2VsZWN0aW9uSXNOYXJyb3dlZDogdHJ1ZVxuICAgICAgICBlbnN1cmVOb3JtYWxNb2RlU3RhdGUoKVxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUuYmxvY2t3aXNlXCIsIC0+XG4gICAgICBpdCBcIltzaW5nbGUgcm93XSBpcyBuYXJyb3dlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtdiBsJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMTpcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0aW9uSXNOYXJyb3dlZDogZmFsc2VcbiAgICAgICAgZW5zdXJlTm9ybWFsTW9kZVN0YXRlKClcbiAgICAgIGl0IFwiW211bHRpLXJvd10gaXMgbmFycm93ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLXYgbCBqJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIjE6XCIsIFwiMjpcIl1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGlvbklzTmFycm93ZWQ6IHRydWVcbiAgICAgICAgZW5zdXJlTm9ybWFsTW9kZVN0YXRlKClcbiJdfQ==
