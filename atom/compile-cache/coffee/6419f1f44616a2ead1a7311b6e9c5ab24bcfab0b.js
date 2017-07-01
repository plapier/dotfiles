(function() {
  var dispatch, getVimState, inspect, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  inspect = require('util').inspect;

  describe("Operator ActivateInsertMode family", function() {
    var bindEnsureOption, editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], bindEnsureOption = ref1[2], keystroke = ref1[3], editor = ref1[4], editorElement = ref1[5], vimState = ref1[6];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, bindEnsureOption = vim.bindEnsureOption, vim;
      });
    });
    describe("the s keybinding", function() {
      beforeEach(function() {
        return set({
          text: '012345',
          cursor: [0, 1]
        });
      });
      it("deletes the character to the right and enters insert mode", function() {
        return ensure('s', {
          mode: 'insert',
          text: '02345',
          cursor: [0, 1],
          register: {
            '"': {
              text: '1'
            }
          }
        });
      });
      it("is repeatable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        set({
          cursor: [0, 2]
        });
        return ensure('.', {
          text: 'abab'
        });
      });
      it("is undoable", function() {
        set({
          cursor: [0, 0]
        });
        keystroke('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        return ensure('u', {
          text: '012345',
          selectedText: ''
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return keystroke('v l s');
        });
        return it("deletes the selected characters and enters insert mode", function() {
          return ensure({
            mode: 'insert',
            text: '0345',
            cursor: [0, 1],
            register: {
              '"': {
                text: '12'
              }
            }
          });
        });
      });
    });
    describe("the S keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE",
          cursor: [1, 3]
        });
      });
      it("deletes the entire line and enters insert mode", function() {
        return ensure('S', {
          mode: 'insert',
          text: "12345\n\nABCDE",
          register: {
            '"': {
              text: 'abcde\n',
              type: 'linewise'
            }
          }
        });
      });
      it("is repeatable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        set({
          cursor: [2, 3]
        });
        return ensure('.', {
          text: '12345\nabc\nabc'
        });
      });
      it("is undoable", function() {
        keystroke('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        return ensure('u', {
          text: "12345\nabcde\nABCDE",
          selectedText: ''
        });
      });
      it("works when the cursor's goal column is greater than its current column", function() {
        set({
          text: "\n12345",
          cursor: [1, 2e308]
        });
        return ensure('k S', {
          text: '\n12345'
        });
      });
      return xit("respects indentation", function() {});
    });
    describe("the c keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("when followed by a c", function() {
        describe("with autoindent", function() {
          beforeEach(function() {
            set({
              text: "12345\n  abcde\nABCDE\n"
            });
            set({
              cursor: [1, 1]
            });
            spyOn(editor, 'shouldAutoIndent').andReturn(true);
            spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
              return editor.indent();
            });
            return spyOn(editor.languageMode, 'suggestedIndentForLineAtBufferRow').andCallFake(function() {
              return 1;
            });
          });
          it("deletes the current line and enters insert mode", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('c c', {
              text: "12345\n  \nABCDE\n",
              cursor: [1, 2],
              mode: 'insert'
            });
          });
          it("is repeatable", function() {
            keystroke('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            set({
              cursor: [2, 3]
            });
            return ensure('.', {
              text: "12345\n  abc\n  abc\n"
            });
          });
          return it("is undoable", function() {
            keystroke('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            return ensure('u', {
              text: "12345\n  abcde\nABCDE\n",
              selectedText: ''
            });
          });
        });
        describe("when the cursor is on the last line", function() {
          return it("deletes the line's content and enters insert mode on the last line", function() {
            set({
              cursor: [2, 1]
            });
            return ensure('c c', {
              text: "12345\nabcde\n",
              cursor: [2, 0],
              mode: 'insert'
            });
          });
        });
        return describe("when the cursor is on the only line", function() {
          return it("deletes the line's content and enters insert mode", function() {
            set({
              text: "12345",
              cursor: [0, 2]
            });
            return ensure('c c', {
              text: "",
              cursor: [0, 0],
              mode: 'insert'
            });
          });
        });
      });
      describe("when followed by i w", function() {
        it("undo's and redo's completely", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          set({
            text: "12345\nfg\nABCDE"
          });
          ensure('escape', {
            text: "12345\nfg\nABCDE",
            mode: 'normal'
          });
          ensure('u', {
            text: "12345\nabcde\nABCDE"
          });
          return ensure('ctrl-r', {
            text: "12345\nfg\nABCDE"
          });
        });
        return it("repeatable", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          return ensure('escape j .', {
            text: "12345\n\n",
            cursor: [2, 0],
            mode: 'normal'
          });
        });
      });
      describe("when followed by a w", function() {
        return it("changes the word", function() {
          set({
            text: "word1 word2 word3",
            cursor: [0, 7]
          });
          return ensure('c w escape', {
            text: "word1 w word3"
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE\n";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
      });
      return describe("when followed by a goto line G", function() {
        beforeEach(function() {
          return set({
            text: "12345\nabcde\nABCDE"
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
      });
    });
    describe("the C keybinding", function() {
      beforeEach(function() {
        return set({
          cursor: [1, 2],
          text: "0!!!!!!\n1!!!!!!\n2!!!!!!\n3!!!!!!\n"
        });
      });
      describe("in normal-mode", function() {
        return it("deletes till the EOL then enter insert-mode", function() {
          return ensure('C', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0!!!!!!\n1!\n2!!!!!!\n3!!!!!!\n"
          });
        });
      });
      return describe("in visual-mode.characterwise", function() {
        return it("delete whole lines and enter insert-mode", function() {
          return ensure('v j C', {
            cursor: [1, 0],
            mode: 'insert',
            text: "0!!!!!!\n\n3!!!!!!\n"
          });
        });
      });
    });
    describe("dontUpdateRegisterOnChangeOrSubstitute settings", function() {
      var resultTextC;
      resultTextC = null;
      beforeEach(function() {
        set({
          register: {
            '"': {
              text: 'initial-value'
            }
          },
          textC: "0abc\n1|def\n2ghi\n"
        });
        return resultTextC = {
          cl: "0abc\n1|ef\n2ghi\n",
          C: "0abc\n1|\n2ghi\n",
          s: "0abc\n1|ef\n2ghi\n",
          S: "0abc\n|\n2ghi\n"
        };
      });
      describe("when dontUpdateRegisterOnChangeOrSubstitute=false", function() {
        var ensure_;
        ensure_ = null;
        beforeEach(function() {
          ensure_ = bindEnsureOption({
            mode: 'insert'
          });
          return settings.set("dontUpdateRegisterOnChangeOrSubstitute", false);
        });
        it('c mutate register', function() {
          return ensure_('c l', {
            textC: resultTextC.cl,
            register: {
              '"': {
                text: 'd'
              }
            }
          });
        });
        it('C mutate register', function() {
          return ensure_('C', {
            textC: resultTextC.C,
            register: {
              '"': {
                text: 'def'
              }
            }
          });
        });
        it('s mutate register', function() {
          return ensure_('s', {
            textC: resultTextC.s,
            register: {
              '"': {
                text: 'd'
              }
            }
          });
        });
        return it('S mutate register', function() {
          return ensure_('S', {
            textC: resultTextC.S,
            register: {
              '"': {
                text: '1def\n'
              }
            }
          });
        });
      });
      return describe("when dontUpdateRegisterOnChangeOrSubstitute=true", function() {
        var ensure_;
        ensure_ = null;
        beforeEach(function() {
          ensure_ = bindEnsureOption({
            mode: 'insert',
            register: {
              '"': {
                text: 'initial-value'
              }
            }
          });
          return settings.set("dontUpdateRegisterOnChangeOrSubstitute", true);
        });
        it('c mutate register', function() {
          return ensure_('c l', {
            textC: resultTextC.cl
          });
        });
        it('C mutate register', function() {
          return ensure_('C', {
            textC: resultTextC.C
          });
        });
        it('s mutate register', function() {
          return ensure_('s', {
            textC: resultTextC.s
          });
        });
        return it('S mutate register', function() {
          return ensure_('S', {
            textC: resultTextC.S
          });
        });
      });
    });
    describe("the O keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          textC_: "__abc\n_|_012\n"
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        keystroke('O');
        return ensure({
          textC_: "__abc\n__|\n__012\n",
          mode: 'insert'
        });
      });
      it("is repeatable", function() {
        set({
          textC_: "__abc\n__|012\n____4spaces\n"
        });
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          textC_: "__abc\n__de|f\n__012\n____4spaces\n"
        });
        ensure('.', {
          textC_: "__abc\n__de|f\n__def\n__012\n____4spaces\n"
        });
        set({
          cursor: [4, 0]
        });
        return ensure('.', {
          textC_: "__abc\n__def\n__def\n__012\n____de|f\n____4spaces\n"
        });
      });
      return it("is undoable", function() {
        keystroke('O');
        editor.insertText("def");
        ensure('escape', {
          textC_: "__abc\n__def\n__012\n"
        });
        return ensure('u', {
          textC_: "__abc\n__012\n"
        });
      });
    });
    describe("the o keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          text: "abc\n  012\n",
          cursor: [1, 2]
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        return ensure('o', {
          text: "abc\n  012\n  \n",
          mode: 'insert',
          cursor: [2, 2]
        });
      });
      xit("is repeatable", function() {
        set({
          text: "  abc\n  012\n    4spaces\n",
          cursor: [1, 1]
        });
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  012\n  def\n    4spaces\n"
        });
        ensure('.', {
          text: "  abc\n  012\n  def\n  def\n    4spaces\n"
        });
        set({
          cursor: [4, 1]
        });
        return ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    4spaces\n    def\n"
        });
      });
      return it("is undoable", function() {
        keystroke('o');
        editor.insertText("def");
        ensure('escape', {
          text: "abc\n  012\n  def\n"
        });
        return ensure('u', {
          text: "abc\n  012\n"
        });
      });
    });
    describe("undo/redo for `o` and `O`", function() {
      beforeEach(function() {
        return set({
          textC: "----|=="
        });
      });
      it("undo and redo by keeping cursor at o started position", function() {
        ensure('o', {
          mode: 'insert'
        });
        editor.insertText('@@');
        ensure("escape", {
          textC: "----==\n@|@"
        });
        ensure("u", {
          textC: "----|=="
        });
        return ensure("ctrl-r", {
          textC: "----|==\n@@"
        });
      });
      return it("undo and redo by keeping cursor at O started position", function() {
        ensure('O', {
          mode: 'insert'
        });
        editor.insertText('@@');
        ensure("escape", {
          textC: "@|@\n----=="
        });
        ensure("u", {
          textC: "----|=="
        });
        return ensure("ctrl-r", {
          textC: "@@\n----|=="
        });
      });
    });
    describe("the a keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012\n"
        });
      });
      describe("at the beginning of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return keystroke('a');
        });
        return it("switches to insert mode and shifts to the right", function() {
          return ensure({
            cursor: [0, 1],
            mode: 'insert'
          });
        });
      });
      return describe("at the end of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 3]
          });
          return keystroke('a');
        });
        return it("doesn't linewrap", function() {
          return ensure({
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the A keybinding", function() {
      beforeEach(function() {
        return set({
          text: "11\n22\n"
        });
      });
      return describe("at the beginning of a line", function() {
        it("switches to insert mode at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('A', {
            mode: 'insert',
            cursor: [0, 2]
          });
        });
        return it("repeats always as insert at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          keystroke('A');
          editor.insertText("abc");
          keystroke('escape');
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            text: "11abc\n22abc\n",
            mode: 'normal',
            cursor: [1, 4]
          });
        });
      });
    });
    describe("the I keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__0: 3456 890\n1: 3456 890\n__2: 3456 890\n____3: 3456 890"
        });
      });
      describe("in normal-mode", function() {
        describe("I", function() {
          return it("insert at first char of line", function() {
            set({
              cursor: [0, 5]
            });
            ensure('I', {
              cursor: [0, 2],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 5]
            });
            ensure('I', {
              cursor: [1, 0],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 0]
            });
            ensure('I', {
              cursor: [1, 0],
              mode: 'insert'
            });
            return ensure("escape", {
              mode: 'normal'
            });
          });
        });
        return describe("A", function() {
          return it("insert at end of line", function() {
            set({
              cursor: [0, 5]
            });
            ensure('A', {
              cursor: [0, 13],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 5]
            });
            ensure('A', {
              cursor: [1, 11],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 11]
            });
            ensure('A', {
              cursor: [1, 11],
              mode: 'insert'
            });
            return ensure("escape", {
              mode: 'normal'
            });
          });
        });
      });
      describe("visual-mode.linewise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 3]
          });
          return ensure("V 2 j", {
            selectedText: "1: 3456 890\n  2: 3456 890\n    3: 3456 890",
            mode: ['visual', 'linewise']
          });
        });
        describe("I", function() {
          return it("insert at first char of line *of each selected line*", function() {
            return ensure("I", {
              cursor: [[1, 0], [2, 2], [3, 4]],
              mode: "insert"
            });
          });
        });
        return describe("A", function() {
          return it("insert at end of line *of each selected line*", function() {
            return ensure("A", {
              cursor: [[1, 11], [2, 13], [3, 15]],
              mode: "insert"
            });
          });
        });
      });
      describe("visual-mode.blockwise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4]
          });
          return ensure("ctrl-v 2 j", {
            selectedText: ["4", " ", "3"],
            mode: ['visual', 'blockwise']
          });
        });
        describe("I", function() {
          it("insert at column of start of selection for *each selection*", function() {
            return ensure("I", {
              cursor: [[1, 4], [2, 4], [3, 4]],
              mode: "insert"
            });
          });
          return it("can repeat after insert AFTER clearing multiple cursor", function() {
            ensure("escape", {
              mode: 'normal'
            });
            set({
              textC: "|line0\nline1\nline2"
            });
            ensure("ctrl-v j I", {
              textC: "|line0\n|line1\nline2",
              mode: 'insert'
            });
            editor.insertText("ABC");
            ensure("escape", {
              textC: "AB|Cline0\nAB!Cline1\nline2",
              mode: 'normal'
            });
            ensure("escape k", {
              textC: "AB!Cline0\nABCline1\nline2",
              mode: 'normal'
            });
            return ensure("l .", {
              textC: "ABCAB|Cline0\nABCAB!Cline1\nline2",
              mode: 'normal'
            });
          });
        });
        return describe("A", function() {
          return it("insert at column of end of selection for *each selection*", function() {
            return ensure("A", {
              cursor: [[1, 5], [2, 5], [3, 5]],
              mode: "insert"
            });
          });
        });
      });
      describe("visual-mode.characterwise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4]
          });
          return ensure("v 2 j", {
            selectedText: "456 890\n  2: 3456 890\n    3",
            mode: ['visual', 'characterwise']
          });
        });
        describe("I is short hand of `ctrl-v I`", function() {
          return it("insert at colum of start of selection for *each selected lines*", function() {
            return ensure("I", {
              cursor: [[1, 4], [2, 4], [3, 4]],
              mode: "insert"
            });
          });
        });
        return describe("A is short hand of `ctrl-v A`", function() {
          return it("insert at column of end of selection for *each selected lines*", function() {
            return ensure("A", {
              cursor: [[1, 5], [2, 5], [3, 5]],
              mode: "insert"
            });
          });
        });
      });
      return describe("when occurrence marker interselcts I and A no longer behave blockwise in vC/vL", function() {
        beforeEach(function() {
          jasmine.attachToDOM(editorElement);
          set({
            cursor: [1, 3]
          });
          return ensure('g o', {
            occurrenceText: ['3456', '3456', '3456', '3456'],
            cursor: [1, 3]
          });
        });
        describe("vC", function() {
          return describe("I and A NOT behave as `ctrl-v I`", function() {
            it("I insert at start of each vsually selected occurrence", function() {
              return ensure("v j j I", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: !3456 890\n__2: |3456 890\n____3: 3456 890"
              });
            });
            return it("A insert at end of each vsually selected occurrence", function() {
              return ensure("v j j A", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: 3456! 890\n__2: 3456| 890\n____3: 3456 890"
              });
            });
          });
        });
        return describe("vL", function() {
          return describe("I and A NOT behave as `ctrl-v I`", function() {
            it("I insert at start of each vsually selected occurrence", function() {
              return ensure("V j j I", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: |3456 890\n _2: |3456 890\n____3: !3456 890"
              });
            });
            return it("A insert at end of each vsually selected occurrence", function() {
              return ensure("V j j A", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: 3456| 890\n__2: 3456| 890\n____3: 3456! 890"
              });
            });
          });
        });
      });
    });
    describe("the gI keybinding", function() {
      beforeEach(function() {
        return set({
          text: "__this is text"
        });
      });
      describe("in normal-mode.", function() {
        return it("start at insert at column 0 regardless of current column", function() {
          set({
            cursor: [0, 5]
          });
          ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
          ensure("escape", {
            mode: 'normal'
          });
          set({
            cursor: [0, 0]
          });
          ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
          ensure("escape", {
            mode: 'normal'
          });
          set({
            cursor: [0, 13]
          });
          return ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
        });
      });
      return describe("in visual-mode", function() {
        beforeEach(function() {
          return set({
            text_: "__0: 3456 890\n1: 3456 890\n__2: 3456 890\n____3: 3456 890"
          });
        });
        it("[characterwise]", function() {
          set({
            cursor: [1, 4]
          });
          ensure("v 2 j", {
            selectedText: "456 890\n  2: 3456 890\n    3",
            mode: ['visual', 'characterwise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
        it("[linewise]", function() {
          set({
            cursor: [1, 3]
          });
          ensure("V 2 j", {
            selectedText: "1: 3456 890\n  2: 3456 890\n    3: 3456 890",
            mode: ['visual', 'linewise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
        return it("[blockwise]", function() {
          set({
            cursor: [1, 4]
          });
          ensure("ctrl-v 2 j", {
            selectedText: ["4", " ", "3"],
            mode: ['visual', 'blockwise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
      });
    });
    describe("InsertAtPreviousFoldStart and Next", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'g [': 'vim-mode-plus:insert-at-previous-fold-start',
              'g ]': 'vim-mode-plus:insert-at-next-fold-start'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("when cursor is not at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [16, 0]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [9, 2],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
      });
      return describe("when cursor is at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [20, 6]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [22, 6],
            mode: 'insert'
          });
        });
      });
    });
    describe("the i keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "|123\n|4567"
        });
      });
      it("allows undoing an entire batch of typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        keystroke('i');
        editor.insertText("d");
        editor.insertText("e");
        editor.insertText("f");
        ensure('escape', {
          text: "abdefc123\nabdefc4567"
        });
        ensure('u', {
          text: "abc123\nabc4567"
        });
        return ensure('u', {
          text: "123\n4567"
        });
      });
      it("allows repeating typing", function() {
        keystroke('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        ensure('.', {
          text: "ababcc123\nababcc4567"
        });
        return ensure('.', {
          text: "abababccc123\nabababccc4567"
        });
      });
      return describe('with nonlinear input', function() {
        beforeEach(function() {
          return set({
            text: '',
            cursor: [0, 0]
          });
        });
        it('deals with auto-matched brackets', function() {
          keystroke('i');
          editor.insertText('()');
          editor.moveLeft();
          editor.insertText('a');
          editor.moveRight();
          editor.insertText('b\n');
          ensure('escape', {
            cursor: [1, 0]
          });
          return ensure('.', {
            text: '(a)b\n(a)b\n',
            cursor: [2, 0]
          });
        });
        return it('deals with autocomplete', function() {
          keystroke('i');
          editor.insertText('a');
          editor.insertText('d');
          editor.insertText('d');
          editor.setTextInBufferRange([[0, 0], [0, 3]], 'addFoo');
          ensure('escape', {
            cursor: [0, 5],
            text: 'addFoo'
          });
          return ensure('.', {
            text: 'addFoaddFooo',
            cursor: [0, 10]
          });
        });
      });
    });
    describe('the a keybinding', function() {
      beforeEach(function() {
        return set({
          text: '',
          cursor: [0, 0]
        });
      });
      it("can be undone in one go", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc"
        });
        return ensure('u', {
          text: ""
        });
      });
      return it("repeats correctly", function() {
        keystroke('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc",
          cursor: [0, 2]
        });
        return ensure('.', {
          text: "abcabc",
          cursor: [0, 5]
        });
      });
    });
    describe('preserve inserted text', function() {
      var ensureDotRegister;
      ensureDotRegister = null;
      beforeEach(function() {
        ensureDotRegister = function(key, arg) {
          var text;
          text = arg.text;
          ensure(key, {
            mode: 'insert'
          });
          editor.insertText(text);
          return ensure("escape", {
            register: {
              '.': {
                text: text
              }
            }
          });
        };
        return set({
          text: "\n\n",
          cursor: [0, 0]
        });
      });
      it("[case-i]", function() {
        return ensureDotRegister('i', {
          text: 'iabc'
        });
      });
      it("[case-o]", function() {
        return ensureDotRegister('o', {
          text: 'oabc'
        });
      });
      it("[case-c]", function() {
        return ensureDotRegister('c l', {
          text: 'cabc'
        });
      });
      it("[case-C]", function() {
        return ensureDotRegister('C', {
          text: 'Cabc'
        });
      });
      return it("[case-s]", function() {
        return ensureDotRegister('s', {
          text: 'sabc'
        });
      });
    });
    describe("repeat backspace/delete happened in insert-mode", function() {
      describe("single cursor operation", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "123\n123"
          });
        });
        it("can repeat backspace only mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          keystroke('i');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('j .', {
            text: "23\n123"
          });
          return ensure('l .', {
            text: "23\n23"
          });
        });
        it("can repeat backspace only mutation: case-a", function() {
          keystroke('a');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('.', {
            text: "3\n123",
            cursor: [0, 0]
          });
          return ensure('j . .', {
            text: "3\n3"
          });
        });
        it("can repeat delete only mutation: case-i", function() {
          keystroke('i');
          editor["delete"]();
          ensure('escape', {
            text: "23\n123"
          });
          return ensure('j .', {
            text: "23\n23"
          });
        });
        it("can repeat delete only mutation: case-a", function() {
          keystroke('a');
          editor["delete"]();
          ensure('escape', {
            text: "13\n123"
          });
          return ensure('j .', {
            text: "13\n13"
          });
        });
        it("can repeat backspace and insert mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          keystroke('i');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          set({
            cursor: [1, 1]
          });
          return ensure('.', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat backspace and insert mutation: case-a", function() {
          keystroke('a');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat delete and insert mutation: case-i", function() {
          keystroke('i');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        return it("can repeat delete and insert mutation: case-a", function() {
          keystroke('a');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "1!!!3\n123"
          });
          return ensure('j 0 .', {
            text: "1!!!3\n1!!!3"
          });
        });
      });
      return describe("multi-cursors operation", function() {
        beforeEach(function() {
          return set({
            textC: "|123\n\n|1234\n\n|12345"
          });
        });
        it("can repeat backspace only mutation: case-multi-cursors", function() {
          ensure('A', {
            cursor: [[0, 3], [2, 4], [4, 5]],
            mode: 'insert'
          });
          editor.backspace();
          ensure('escape', {
            text: "12\n\n123\n\n1234",
            cursor: [[0, 1], [2, 2], [4, 3]]
          });
          return ensure('.', {
            text: "1\n\n12\n\n123",
            cursor: [[0, 0], [2, 1], [4, 2]]
          });
        });
        return it("can repeat delete only mutation: case-multi-cursors", function() {
          var cursors;
          ensure('I', {
            mode: 'insert'
          });
          editor["delete"]();
          cursors = [[0, 0], [2, 0], [4, 0]];
          ensure('escape', {
            text: "23\n\n234\n\n2345",
            cursor: cursors
          });
          ensure('.', {
            text: "3\n\n34\n\n345",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n4\n\n45",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n\n\n5",
            cursor: cursors
          });
          return ensure('.', {
            text: "\n\n\n\n",
            cursor: cursors
          });
        });
      });
    });
    return describe('specify insertion count', function() {
      var ensureInsertionCount;
      ensureInsertionCount = function(key, arg) {
        var cursor, insert, text;
        insert = arg.insert, text = arg.text, cursor = arg.cursor;
        keystroke(key);
        editor.insertText(insert);
        return ensure("escape", {
          text: text,
          cursor: cursor
        });
      };
      beforeEach(function() {
        var initialText;
        initialText = "*\n*\n";
        set({
          text: "",
          cursor: [0, 0]
        });
        keystroke('i');
        editor.insertText(initialText);
        return ensure("escape g g", {
          text: initialText,
          cursor: [0, 0]
        });
      });
      describe("repeat insertion count times", function() {
        it("[case-i]", function() {
          return ensureInsertionCount('3 i', {
            insert: '=',
            text: "===*\n*\n",
            cursor: [0, 2]
          });
        });
        it("[case-o]", function() {
          return ensureInsertionCount('3 o', {
            insert: '=',
            text: "*\n=\n=\n=\n*\n",
            cursor: [3, 0]
          });
        });
        it("[case-O]", function() {
          return ensureInsertionCount('3 O', {
            insert: '=',
            text: "=\n=\n=\n*\n*\n",
            cursor: [2, 0]
          });
        });
        return describe("children of Change operation won't repeate insertion count times", function() {
          beforeEach(function() {
            set({
              text: "",
              cursor: [0, 0]
            });
            keystroke('i');
            editor.insertText('*');
            return ensure('escape g g', {
              text: '*',
              cursor: [0, 0]
            });
          });
          it("[case-c]", function() {
            return ensureInsertionCount('3 c w', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-C]", function() {
            return ensureInsertionCount('3 C', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-s]", function() {
            return ensureInsertionCount('3 s', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          return it("[case-S]", function() {
            return ensureInsertionCount('3 S', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("throttoling intertion count to 100 at maximum", function() {
        return it("insert 100 times at maximum even if big count was given", function() {
          set({
            text: ''
          });
          expect(editor.getLastBufferRow()).toBe(0);
          ensure('5 5 5 5 5 5 5 i', {
            mode: 'insert'
          });
          editor.insertText("a\n");
          ensure('escape', {
            mode: 'normal'
          });
          return expect(editor.getLastBufferRow()).toBe(101);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItYWN0aXZhdGUtaW5zZXJ0LW1vZGUtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsNkJBQUQsRUFBYzs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUNWLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBRVosUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUE7QUFDN0MsUUFBQTtJQUFBLE9BQThFLEVBQTlFLEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsMEJBQWQsRUFBZ0MsbUJBQWhDLEVBQTJDLGdCQUEzQyxFQUFtRCx1QkFBbkQsRUFBa0U7SUFFbEUsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUF5Qix1Q0FBekIsRUFBNkM7TUFIbkMsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtNQUMzQixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FBSTtVQUFBLElBQUEsRUFBTSxRQUFOO1VBQWdCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXhCO1NBQUo7TUFEUyxDQUFYO01BR0EsRUFBQSxDQUFHLDJEQUFILEVBQWdFLFNBQUE7ZUFDOUQsTUFBQSxDQUFPLEdBQVAsRUFDRTtVQUFBLElBQUEsRUFBTSxRQUFOO1VBQ0EsSUFBQSxFQUFNLE9BRE47VUFFQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUZSO1VBR0EsUUFBQSxFQUFVO1lBQUEsR0FBQSxFQUFLO2NBQUEsSUFBQSxFQUFNLEdBQU47YUFBTDtXQUhWO1NBREY7TUFEOEQsQ0FBaEU7TUFPQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO1FBQ2xCLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtRQUNBLFNBQUEsQ0FBVSxLQUFWO1FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLElBQUEsRUFBTSxPQUFOO1NBQWpCO1FBQ0EsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLElBQUEsRUFBTSxNQUFOO1NBQVo7TUFOa0IsQ0FBcEI7TUFRQSxFQUFBLENBQUcsYUFBSCxFQUFrQixTQUFBO1FBQ2hCLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtRQUNBLFNBQUEsQ0FBVSxLQUFWO1FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLElBQUEsRUFBTSxPQUFOO1NBQWpCO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLElBQUEsRUFBTSxRQUFOO1VBQWdCLFlBQUEsRUFBYyxFQUE5QjtTQUFaO01BTGdCLENBQWxCO2FBT0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7UUFDekIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsU0FBQSxDQUFVLE9BQVY7UUFEUyxDQUFYO2VBR0EsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUE7aUJBQzNELE1BQUEsQ0FDRTtZQUFBLElBQUEsRUFBTSxRQUFOO1lBQ0EsSUFBQSxFQUFNLE1BRE47WUFFQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUZSO1lBR0EsUUFBQSxFQUFVO2NBQUEsR0FBQSxFQUFLO2dCQUFBLElBQUEsRUFBTSxJQUFOO2VBQUw7YUFIVjtXQURGO1FBRDJELENBQTdEO01BSnlCLENBQTNCO0lBMUIyQixDQUE3QjtJQXFDQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtNQUMzQixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxxQkFBTjtVQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7U0FERjtNQURTLENBQVg7TUFLQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQTtlQUNuRCxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47VUFDQSxJQUFBLEVBQU0sZ0JBRE47VUFFQSxRQUFBLEVBQVU7WUFBQyxHQUFBLEVBQUs7Y0FBQSxJQUFBLEVBQU0sU0FBTjtjQUFpQixJQUFBLEVBQU0sVUFBdkI7YUFBTjtXQUZWO1NBREY7TUFEbUQsQ0FBckQ7TUFNQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO1FBQ2xCLFNBQUEsQ0FBVSxHQUFWO1FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLElBQUEsRUFBTSxtQkFBTjtTQUFqQjtRQUNBLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxJQUFBLEVBQU0saUJBQU47U0FBWjtNQUxrQixDQUFwQjtNQU9BLEVBQUEsQ0FBRyxhQUFILEVBQWtCLFNBQUE7UUFDaEIsU0FBQSxDQUFVLEdBQVY7UUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsSUFBQSxFQUFNLG1CQUFOO1NBQWpCO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLElBQUEsRUFBTSxxQkFBTjtVQUE2QixZQUFBLEVBQWMsRUFBM0M7U0FBWjtNQUpnQixDQUFsQjtNQWlCQSxFQUFBLENBQUcsd0VBQUgsRUFBNkUsU0FBQTtRQUMzRSxHQUFBLENBQUk7VUFBQSxJQUFBLEVBQU0sU0FBTjtVQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksS0FBSixDQUF6QjtTQUFKO2VBSUEsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLElBQUEsRUFBTSxTQUFOO1NBQWQ7TUFMMkUsQ0FBN0U7YUFPQSxHQUFBLENBQUksc0JBQUosRUFBNEIsU0FBQSxHQUFBLENBQTVCO0lBM0MyQixDQUE3QjtJQTZDQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtNQUMzQixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FBSTtVQUFBLElBQUEsRUFBTSxxQkFBTjtTQUFKO01BRFMsQ0FBWDtNQU9BLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO1FBQy9CLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBO1VBQzFCLFVBQUEsQ0FBVyxTQUFBO1lBQ1QsR0FBQSxDQUFJO2NBQUEsSUFBQSxFQUFNLHlCQUFOO2FBQUo7WUFDQSxHQUFBLENBQUk7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUo7WUFDQSxLQUFBLENBQU0sTUFBTixFQUFjLGtCQUFkLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsSUFBNUM7WUFDQSxLQUFBLENBQU0sTUFBTixFQUFjLHFCQUFkLENBQW9DLENBQUMsV0FBckMsQ0FBaUQsU0FBQyxJQUFEO3FCQUMvQyxNQUFNLENBQUMsTUFBUCxDQUFBO1lBRCtDLENBQWpEO21CQUVBLEtBQUEsQ0FBTSxNQUFNLENBQUMsWUFBYixFQUEyQixtQ0FBM0IsQ0FBK0QsQ0FBQyxXQUFoRSxDQUE0RSxTQUFBO3FCQUFHO1lBQUgsQ0FBNUU7VUFOUyxDQUFYO1VBUUEsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUE7WUFDcEQsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sb0JBQU47Y0FDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO2NBRUEsSUFBQSxFQUFNLFFBRk47YUFERjtVQUZvRCxDQUF0RDtVQU9BLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUE7WUFDbEIsU0FBQSxDQUFVLEtBQVY7WUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtZQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO2NBQUEsSUFBQSxFQUFNLHVCQUFOO2FBQWpCO1lBQ0EsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7Y0FBQSxJQUFBLEVBQU0sdUJBQU47YUFBWjtVQUxrQixDQUFwQjtpQkFPQSxFQUFBLENBQUcsYUFBSCxFQUFrQixTQUFBO1lBQ2hCLFNBQUEsQ0FBVSxLQUFWO1lBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7WUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtjQUFBLElBQUEsRUFBTSx1QkFBTjthQUFqQjttQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO2NBQUEsSUFBQSxFQUFNLHlCQUFOO2NBQWlDLFlBQUEsRUFBYyxFQUEvQzthQUFaO1VBSmdCLENBQWxCO1FBdkIwQixDQUE1QjtRQTZCQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQTtpQkFDOUMsRUFBQSxDQUFHLG9FQUFILEVBQXlFLFNBQUE7WUFDdkUsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sZ0JBQU47Y0FDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO2NBRUEsSUFBQSxFQUFNLFFBRk47YUFERjtVQUZ1RSxDQUF6RTtRQUQ4QyxDQUFoRDtlQVFBLFFBQUEsQ0FBUyxxQ0FBVCxFQUFnRCxTQUFBO2lCQUM5QyxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQTtZQUN0RCxHQUFBLENBQUk7Y0FBQSxJQUFBLEVBQU0sT0FBTjtjQUFlLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXZCO2FBQUo7bUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtjQUFBLElBQUEsRUFBTSxFQUFOO2NBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtjQUVBLElBQUEsRUFBTSxRQUZOO2FBREY7VUFGc0QsQ0FBeEQ7UUFEOEMsQ0FBaEQ7TUF0QytCLENBQWpDO01BOENBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO1FBQy9CLEVBQUEsQ0FBRyw4QkFBSCxFQUFtQyxTQUFBO1VBQ2pDLEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtVQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sZ0JBQU47WUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1lBRUEsSUFBQSxFQUFNLFFBRk47V0FERjtVQU1BLEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBTSxrQkFBTjtXQUFKO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSxrQkFBTjtZQUNBLElBQUEsRUFBTSxRQUROO1dBREY7VUFHQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLHFCQUFOO1dBQVo7aUJBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sa0JBQU47V0FBakI7UUFiaUMsQ0FBbkM7ZUFlQSxFQUFBLENBQUcsWUFBSCxFQUFpQixTQUFBO1VBQ2YsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO1VBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtZQUFBLElBQUEsRUFBTSxnQkFBTjtZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7WUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGO2lCQUtBLE1BQUEsQ0FBTyxZQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sV0FBTjtZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7WUFFQSxJQUFBLEVBQU0sUUFGTjtXQURGO1FBUGUsQ0FBakI7TUFoQitCLENBQWpDO01BNEJBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO2VBQy9CLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBO1VBQ3JCLEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBTSxtQkFBTjtZQUEyQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFuQztXQUFKO2lCQUNBLE1BQUEsQ0FBTyxZQUFQLEVBQXFCO1lBQUEsSUFBQSxFQUFNLGVBQU47V0FBckI7UUFGcUIsQ0FBdkI7TUFEK0IsQ0FBakM7TUFLQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQTtRQUMvQixVQUFBLENBQVcsU0FBQTtBQUNULGNBQUE7VUFBQSxZQUFBLEdBQWU7aUJBQ2YsR0FBQSxDQUFJO1lBQUEsSUFBQSxFQUFNLFlBQU47V0FBSjtRQUZTLENBQVg7UUFJQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQTtpQkFDOUMsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUE7WUFDakMsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxZQUFQLEVBQXFCO2NBQUEsSUFBQSxFQUFNLFdBQU47YUFBckI7VUFGaUMsQ0FBbkM7UUFEOEMsQ0FBaEQ7ZUFLQSxRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQTtpQkFDM0MsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUE7WUFDakMsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxZQUFQLEVBQXFCO2NBQUEsSUFBQSxFQUFNLFdBQU47YUFBckI7VUFGaUMsQ0FBbkM7UUFEMkMsQ0FBN0M7TUFWK0IsQ0FBakM7YUFlQSxRQUFBLENBQVMsZ0NBQVQsRUFBMkMsU0FBQTtRQUN6QyxVQUFBLENBQVcsU0FBQTtpQkFDVCxHQUFBLENBQUk7WUFBQSxJQUFBLEVBQU0scUJBQU47V0FBSjtRQURTLENBQVg7UUFHQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQTtpQkFDOUMsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUE7WUFDckMsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxjQUFQLEVBQXVCO2NBQUEsSUFBQSxFQUFNLGdCQUFOO2FBQXZCO1VBRnFDLENBQXZDO1FBRDhDLENBQWhEO2VBS0EsUUFBQSxDQUFTLGtDQUFULEVBQTZDLFNBQUE7aUJBQzNDLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBO1lBQ3JDLEdBQUEsQ0FBSTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7YUFBSjttQkFDQSxNQUFBLENBQU8sY0FBUCxFQUF1QjtjQUFBLElBQUEsRUFBTSxnQkFBTjthQUF2QjtVQUZxQyxDQUF2QztRQUQyQyxDQUE3QztNQVR5QyxDQUEzQztJQXRHMkIsQ0FBN0I7SUFvSEEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1VBQ0EsSUFBQSxFQUFNLHNDQUROO1NBREY7TUFEUyxDQUFYO01BU0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7ZUFDekIsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUE7aUJBQ2hELE1BQUEsQ0FBTyxHQUFQLEVBQ0U7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQ0EsSUFBQSxFQUFNLFFBRE47WUFFQSxJQUFBLEVBQU0saUNBRk47V0FERjtRQURnRCxDQUFsRDtNQUR5QixDQUEzQjthQVlBLFFBQUEsQ0FBUyw4QkFBVCxFQUF5QyxTQUFBO2VBQ3ZDLEVBQUEsQ0FBRywwQ0FBSCxFQUErQyxTQUFBO2lCQUM3QyxNQUFBLENBQU8sT0FBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxRQUROO1lBRUEsSUFBQSxFQUFNLHNCQUZOO1dBREY7UUFENkMsQ0FBL0M7TUFEdUMsQ0FBekM7SUF0QjJCLENBQTdCO0lBaUNBLFFBQUEsQ0FBUyxpREFBVCxFQUE0RCxTQUFBO0FBQzFELFVBQUE7TUFBQSxXQUFBLEdBQWM7TUFDZCxVQUFBLENBQVcsU0FBQTtRQUNULEdBQUEsQ0FDRTtVQUFBLFFBQUEsRUFBVTtZQUFBLEdBQUEsRUFBSztjQUFBLElBQUEsRUFBTSxlQUFOO2FBQUw7V0FBVjtVQUNBLEtBQUEsRUFBTyxxQkFEUDtTQURGO2VBT0EsV0FBQSxHQUNFO1VBQUEsRUFBQSxFQUFJLG9CQUFKO1VBS0EsQ0FBQSxFQUFHLGtCQUxIO1VBVUEsQ0FBQSxFQUFHLG9CQVZIO1VBZUEsQ0FBQSxFQUFHLGlCQWZIOztNQVRPLENBQVg7TUE2QkEsUUFBQSxDQUFTLG1EQUFULEVBQThELFNBQUE7QUFDNUQsWUFBQTtRQUFBLE9BQUEsR0FBVTtRQUNWLFVBQUEsQ0FBVyxTQUFBO1VBQ1QsT0FBQSxHQUFVLGdCQUFBLENBQWlCO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBakI7aUJBQ1YsUUFBUSxDQUFDLEdBQVQsQ0FBYSx3Q0FBYixFQUF1RCxLQUF2RDtRQUZTLENBQVg7UUFHQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQTtpQkFBRyxPQUFBLENBQVEsS0FBUixFQUFlO1lBQUEsS0FBQSxFQUFPLFdBQVcsQ0FBQyxFQUFuQjtZQUF1QixRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLEdBQU47ZUFBTjthQUFqQztXQUFmO1FBQUgsQ0FBeEI7UUFDQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQTtpQkFBRyxPQUFBLENBQVEsR0FBUixFQUFhO1lBQUEsS0FBQSxFQUFPLFdBQVcsQ0FBQyxDQUFuQjtZQUFzQixRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLEtBQU47ZUFBTjthQUFoQztXQUFiO1FBQUgsQ0FBeEI7UUFDQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQTtpQkFBRyxPQUFBLENBQVEsR0FBUixFQUFhO1lBQUEsS0FBQSxFQUFPLFdBQVcsQ0FBQyxDQUFuQjtZQUFzQixRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLEdBQU47ZUFBTjthQUFoQztXQUFiO1FBQUgsQ0FBeEI7ZUFDQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQTtpQkFBRyxPQUFBLENBQVEsR0FBUixFQUFhO1lBQUEsS0FBQSxFQUFPLFdBQVcsQ0FBQyxDQUFuQjtZQUFzQixRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLFFBQU47ZUFBTjthQUFoQztXQUFiO1FBQUgsQ0FBeEI7TUFSNEQsQ0FBOUQ7YUFTQSxRQUFBLENBQVMsa0RBQVQsRUFBNkQsU0FBQTtBQUMzRCxZQUFBO1FBQUEsT0FBQSxHQUFVO1FBQ1YsVUFBQSxDQUFXLFNBQUE7VUFDVCxPQUFBLEdBQVUsZ0JBQUEsQ0FBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtZQUFnQixRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLGVBQU47ZUFBTjthQUExQjtXQUFqQjtpQkFDVixRQUFRLENBQUMsR0FBVCxDQUFhLHdDQUFiLEVBQXVELElBQXZEO1FBRlMsQ0FBWDtRQUdBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBO2lCQUFHLE9BQUEsQ0FBUSxLQUFSLEVBQWU7WUFBQSxLQUFBLEVBQU8sV0FBVyxDQUFDLEVBQW5CO1dBQWY7UUFBSCxDQUF4QjtRQUNBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBO2lCQUFHLE9BQUEsQ0FBUSxHQUFSLEVBQWE7WUFBQSxLQUFBLEVBQU8sV0FBVyxDQUFDLENBQW5CO1dBQWI7UUFBSCxDQUF4QjtRQUNBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBO2lCQUFHLE9BQUEsQ0FBUSxHQUFSLEVBQWE7WUFBQSxLQUFBLEVBQU8sV0FBVyxDQUFDLENBQW5CO1dBQWI7UUFBSCxDQUF4QjtlQUNBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBO2lCQUFHLE9BQUEsQ0FBUSxHQUFSLEVBQWE7WUFBQSxLQUFBLEVBQU8sV0FBVyxDQUFDLENBQW5CO1dBQWI7UUFBSCxDQUF4QjtNQVIyRCxDQUE3RDtJQXhDMEQsQ0FBNUQ7SUFrREEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7UUFDVCxLQUFBLENBQU0sTUFBTixFQUFjLGtCQUFkLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsSUFBNUM7UUFDQSxLQUFBLENBQU0sTUFBTixFQUFjLHFCQUFkLENBQW9DLENBQUMsV0FBckMsQ0FBaUQsU0FBQyxJQUFEO2lCQUMvQyxNQUFNLENBQUMsTUFBUCxDQUFBO1FBRCtDLENBQWpEO2VBR0EsR0FBQSxDQUNFO1VBQUEsTUFBQSxFQUFRLGlCQUFSO1NBREY7TUFMUyxDQUFYO01BV0EsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUE7UUFDaEUsU0FBQSxDQUFVLEdBQVY7ZUFDQSxNQUFBLENBQ0U7VUFBQSxNQUFBLEVBQVEscUJBQVI7VUFLQSxJQUFBLEVBQU0sUUFMTjtTQURGO01BRmdFLENBQWxFO01BVUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQTtRQUNsQixHQUFBLENBQ0U7VUFBQSxNQUFBLEVBQVEsOEJBQVI7U0FERjtRQVFBLFNBQUEsQ0FBVSxHQUFWO1FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUNFO1VBQUEsTUFBQSxFQUFRLHFDQUFSO1NBREY7UUFPQSxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsTUFBQSxFQUFRLDRDQUFSO1NBREY7UUFRQSxHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsTUFBQSxFQUFRLHFEQUFSO1NBREY7TUEzQmtCLENBQXBCO2FBcUNBLEVBQUEsQ0FBRyxhQUFILEVBQWtCLFNBQUE7UUFDaEIsU0FBQSxDQUFVLEdBQVY7UUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQ0U7VUFBQSxNQUFBLEVBQVEsdUJBQVI7U0FERjtlQU1BLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7VUFBQSxNQUFBLEVBQVEsZ0JBQVI7U0FERjtNQVRnQixDQUFsQjtJQTNEMkIsQ0FBN0I7SUEwRUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7UUFDVCxLQUFBLENBQU0sTUFBTixFQUFjLGtCQUFkLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsSUFBNUM7UUFDQSxLQUFBLENBQU0sTUFBTixFQUFjLHFCQUFkLENBQW9DLENBQUMsV0FBckMsQ0FBaUQsU0FBQyxJQUFEO2lCQUMvQyxNQUFNLENBQUMsTUFBUCxDQUFBO1FBRCtDLENBQWpEO2VBR0EsR0FBQSxDQUFJO1VBQUEsSUFBQSxFQUFNLGNBQU47VUFBc0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUI7U0FBSjtNQUxTLENBQVg7TUFPQSxFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQTtlQUNoRSxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsSUFBQSxFQUFNLGtCQUFOO1VBQ0EsSUFBQSxFQUFNLFFBRE47VUFFQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUZSO1NBREY7TUFEZ0UsQ0FBbEU7TUFTQSxHQUFBLENBQUksZUFBSixFQUFxQixTQUFBO1FBQ25CLEdBQUEsQ0FBSTtVQUFBLElBQUEsRUFBTSw2QkFBTjtVQUFxQyxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE3QztTQUFKO1FBQ0EsU0FBQSxDQUFVLEdBQVY7UUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsSUFBQSxFQUFNLG9DQUFOO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLElBQUEsRUFBTSwyQ0FBTjtTQUFaO1FBQ0EsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLElBQUEsRUFBTSxvREFBTjtTQUFaO01BUG1CLENBQXJCO2FBU0EsRUFBQSxDQUFHLGFBQUgsRUFBa0IsU0FBQTtRQUNoQixTQUFBLENBQVUsR0FBVjtRQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxJQUFBLEVBQU0scUJBQU47U0FBakI7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsSUFBQSxFQUFNLGNBQU47U0FBWjtNQUpnQixDQUFsQjtJQTFCMkIsQ0FBN0I7SUFnQ0EsUUFBQSxDQUFTLDJCQUFULEVBQXNDLFNBQUE7TUFDcEMsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQUk7VUFBQSxLQUFBLEVBQU8sU0FBUDtTQUFKO01BRFMsQ0FBWDtNQUVBLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxTQUFBO1FBQzFELE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUFaO1FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyxhQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLEtBQUEsRUFBTyxTQUFQO1NBQVo7ZUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyxhQUFQO1NBQWpCO01BTDBELENBQTVEO2FBTUEsRUFBQSxDQUFHLHVEQUFILEVBQTRELFNBQUE7UUFDMUQsTUFBQSxDQUFPLEdBQVAsRUFBWTtVQUFBLElBQUEsRUFBTSxRQUFOO1NBQVo7UUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLGFBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLFNBQVA7U0FBWjtlQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLGFBQVA7U0FBakI7TUFMMEQsQ0FBNUQ7SUFUb0MsQ0FBdEM7SUFnQkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQUk7VUFBQSxJQUFBLEVBQU0sT0FBTjtTQUFKO01BRFMsQ0FBWDtNQUdBLFFBQUEsQ0FBUyw4QkFBVCxFQUF5QyxTQUFBO1FBQ3ZDLFVBQUEsQ0FBVyxTQUFBO1VBQ1QsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUNBLFNBQUEsQ0FBVSxHQUFWO1FBRlMsQ0FBWDtlQUlBLEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBO2lCQUNwRCxNQUFBLENBQU87WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQWdCLElBQUEsRUFBTSxRQUF0QjtXQUFQO1FBRG9ELENBQXREO01BTHVDLENBQXpDO2FBUUEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUE7UUFDakMsVUFBQSxDQUFXLFNBQUE7VUFDVCxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0EsU0FBQSxDQUFVLEdBQVY7UUFGUyxDQUFYO2VBSUEsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUE7aUJBQ3JCLE1BQUEsQ0FBTztZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBUDtRQURxQixDQUF2QjtNQUxpQyxDQUFuQztJQVoyQixDQUE3QjtJQW9CQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtNQUMzQixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FBSTtVQUFBLElBQUEsRUFBTSxVQUFOO1NBQUo7TUFEUyxDQUFYO2FBR0EsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7UUFDckMsRUFBQSxDQUFHLGdEQUFILEVBQXFELFNBQUE7VUFDbkQsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sUUFBTjtZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERjtRQUZtRCxDQUFyRDtlQU1BLEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBO1VBQ3BELEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtVQUNBLFNBQUEsQ0FBVSxHQUFWO1VBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7VUFDQSxTQUFBLENBQVUsUUFBVjtVQUNBLEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtpQkFFQSxNQUFBLENBQU8sR0FBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLGdCQUFOO1lBQ0EsSUFBQSxFQUFNLFFBRE47WUFFQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUZSO1dBREY7UUFQb0QsQ0FBdEQ7TUFQcUMsQ0FBdkM7SUFKMkIsQ0FBN0I7SUF1QkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxLQUFBLEVBQU8sNERBQVA7U0FERjtNQURTLENBQVg7TUFTQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtRQUN6QixRQUFBLENBQVMsR0FBVCxFQUFjLFNBQUE7aUJBQ1osRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUE7WUFDakMsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO1lBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7Y0FBZ0IsSUFBQSxFQUFNLFFBQXRCO2FBQVo7WUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQWpCO1lBRUEsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO1lBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7Y0FBZ0IsSUFBQSxFQUFNLFFBQXRCO2FBQVo7WUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQWpCO1lBRUEsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO1lBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7Y0FBZ0IsSUFBQSxFQUFNLFFBQXRCO2FBQVo7bUJBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7Y0FBQSxJQUFBLEVBQU0sUUFBTjthQUFqQjtVQVhpQyxDQUFuQztRQURZLENBQWQ7ZUFjQSxRQUFBLENBQVMsR0FBVCxFQUFjLFNBQUE7aUJBQ1osRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUE7WUFDMUIsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO1lBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7Y0FBaUIsSUFBQSxFQUFNLFFBQXZCO2FBQVo7WUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQWpCO1lBRUEsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO1lBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7Y0FBaUIsSUFBQSxFQUFNLFFBQXZCO2FBQVo7WUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtjQUFBLElBQUEsRUFBTSxRQUFOO2FBQWpCO1lBRUEsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBUjthQUFKO1lBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7Y0FBaUIsSUFBQSxFQUFNLFFBQXZCO2FBQVo7bUJBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7Y0FBQSxJQUFBLEVBQU0sUUFBTjthQUFqQjtVQVgwQixDQUE1QjtRQURZLENBQWQ7TUFmeUIsQ0FBM0I7TUE2QkEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUE7UUFDL0IsVUFBQSxDQUFXLFNBQUE7VUFDVCxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtZQUFBLFlBQUEsRUFBYyw2Q0FBZDtZQUtBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxVQUFYLENBTE47V0FERjtRQUZTLENBQVg7UUFVQSxRQUFBLENBQVMsR0FBVCxFQUFjLFNBQUE7aUJBQ1osRUFBQSxDQUFHLHNEQUFILEVBQTJELFNBQUE7bUJBQ3pELE1BQUEsQ0FBTyxHQUFQLEVBQVk7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsRUFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixDQUFSO2NBQWtDLElBQUEsRUFBTSxRQUF4QzthQUFaO1VBRHlELENBQTNEO1FBRFksQ0FBZDtlQUdBLFFBQUEsQ0FBUyxHQUFULEVBQWMsU0FBQTtpQkFDWixFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTttQkFDbEQsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBRCxFQUFVLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBVixFQUFtQixDQUFDLENBQUQsRUFBSSxFQUFKLENBQW5CLENBQVI7Y0FBcUMsSUFBQSxFQUFNLFFBQTNDO2FBQVo7VUFEa0QsQ0FBcEQ7UUFEWSxDQUFkO01BZCtCLENBQWpDO01Ba0JBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO1FBQ2hDLFVBQUEsQ0FBVyxTQUFBO1VBQ1QsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUNBLE1BQUEsQ0FBTyxZQUFQLEVBQ0U7WUFBQSxZQUFBLEVBQWMsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FBZDtZQUNBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxXQUFYLENBRE47V0FERjtRQUZTLENBQVg7UUFNQSxRQUFBLENBQVMsR0FBVCxFQUFjLFNBQUE7VUFDWixFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQTttQkFDaEUsTUFBQSxDQUFPLEdBQVAsRUFBWTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxFQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpCLENBQVI7Y0FBa0MsSUFBQSxFQUFNLFFBQXhDO2FBQVo7VUFEZ0UsQ0FBbEU7aUJBR0EsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUE7WUFDM0QsTUFBQSxDQUFPLFFBQVAsRUFBaUI7Y0FBQSxJQUFBLEVBQU0sUUFBTjthQUFqQjtZQUNBLEdBQUEsQ0FDRTtjQUFBLEtBQUEsRUFBTyxzQkFBUDthQURGO1lBT0EsTUFBQSxDQUFPLFlBQVAsRUFDRTtjQUFBLEtBQUEsRUFBTyx1QkFBUDtjQUtBLElBQUEsRUFBTSxRQUxOO2FBREY7WUFRQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtZQUVBLE1BQUEsQ0FBTyxRQUFQLEVBQ0U7Y0FBQSxLQUFBLEVBQU8sNkJBQVA7Y0FLQSxJQUFBLEVBQU0sUUFMTjthQURGO1lBVUEsTUFBQSxDQUFPLFVBQVAsRUFDRTtjQUFBLEtBQUEsRUFBTyw0QkFBUDtjQUtBLElBQUEsRUFBTSxRQUxOO2FBREY7bUJBU0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtjQUFBLEtBQUEsRUFBTyxtQ0FBUDtjQUtBLElBQUEsRUFBTSxRQUxOO2FBREY7VUF0QzJELENBQTdEO1FBSlksQ0FBZDtlQWtEQSxRQUFBLENBQVMsR0FBVCxFQUFjLFNBQUE7aUJBQ1osRUFBQSxDQUFHLDJEQUFILEVBQWdFLFNBQUE7bUJBQzlELE1BQUEsQ0FBTyxHQUFQLEVBQVk7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsRUFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixDQUFSO2NBQWtDLElBQUEsRUFBTSxRQUF4QzthQUFaO1VBRDhELENBQWhFO1FBRFksQ0FBZDtNQXpEZ0MsQ0FBbEM7TUE2REEsUUFBQSxDQUFTLDJCQUFULEVBQXNDLFNBQUE7UUFDcEMsVUFBQSxDQUFXLFNBQUE7VUFDVCxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtZQUFBLFlBQUEsRUFBYywrQkFBZDtZQUtBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBTE47V0FERjtRQUZTLENBQVg7UUFVQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQTtpQkFDeEMsRUFBQSxDQUFHLGlFQUFILEVBQXNFLFNBQUE7bUJBQ3BFLE1BQUEsQ0FBTyxHQUFQLEVBQVk7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsRUFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixDQUFSO2NBQWtDLElBQUEsRUFBTSxRQUF4QzthQUFaO1VBRG9FLENBQXRFO1FBRHdDLENBQTFDO2VBR0EsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUE7aUJBQ3hDLEVBQUEsQ0FBRyxnRUFBSCxFQUFxRSxTQUFBO21CQUNuRSxNQUFBLENBQU8sR0FBUCxFQUFZO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULEVBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakIsQ0FBUjtjQUFrQyxJQUFBLEVBQU0sUUFBeEM7YUFBWjtVQURtRSxDQUFyRTtRQUR3QyxDQUExQztNQWRvQyxDQUF0QzthQWtCQSxRQUFBLENBQVMsZ0ZBQVQsRUFBMkYsU0FBQTtRQUN6RixVQUFBLENBQVcsU0FBQTtVQUNULE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCO1VBQ0EsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxjQUFBLEVBQWdCLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsQ0FBaEI7WUFBa0QsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBMUQ7V0FBZDtRQUhTLENBQVg7UUFJQSxRQUFBLENBQVMsSUFBVCxFQUFlLFNBQUE7aUJBQ2IsUUFBQSxDQUFTLGtDQUFULEVBQTZDLFNBQUE7WUFDM0MsRUFBQSxDQUFHLHVEQUFILEVBQTRELFNBQUE7cUJBQzFELE1BQUEsQ0FBTyxTQUFQLEVBQ0U7Z0JBQUEsSUFBQSxFQUFNLFFBQU47Z0JBQ0EsTUFBQSxFQUFRLDhEQURSO2VBREY7WUFEMEQsQ0FBNUQ7bUJBU0EsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUE7cUJBQ3hELE1BQUEsQ0FBTyxTQUFQLEVBQ0U7Z0JBQUEsSUFBQSxFQUFNLFFBQU47Z0JBQ0EsTUFBQSxFQUFRLDhEQURSO2VBREY7WUFEd0QsQ0FBMUQ7VUFWMkMsQ0FBN0M7UUFEYSxDQUFmO2VBb0JBLFFBQUEsQ0FBUyxJQUFULEVBQWUsU0FBQTtpQkFDYixRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQTtZQUMzQyxFQUFBLENBQUcsdURBQUgsRUFBNEQsU0FBQTtxQkFDMUQsTUFBQSxDQUFPLFNBQVAsRUFDRTtnQkFBQSxJQUFBLEVBQU0sUUFBTjtnQkFDQSxNQUFBLEVBQVEsK0RBRFI7ZUFERjtZQUQwRCxDQUE1RDttQkFTQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtxQkFDeEQsTUFBQSxDQUFPLFNBQVAsRUFDRTtnQkFBQSxJQUFBLEVBQU0sUUFBTjtnQkFDQSxNQUFBLEVBQVEsK0RBRFI7ZUFERjtZQUR3RCxDQUExRDtVQVYyQyxDQUE3QztRQURhLENBQWY7TUF6QnlGLENBQTNGO0lBeEkyQixDQUE3QjtJQXNMQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtNQUM1QixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxnQkFBTjtTQURGO01BRFMsQ0FBWDtNQU1BLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBO2VBQzFCLEVBQUEsQ0FBRywwREFBSCxFQUErRCxTQUFBO1VBQzdELEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQWdCLElBQUEsRUFBTSxRQUF0QjtXQUFkO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFqQjtVQUVBLEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQWdCLElBQUEsRUFBTSxRQUF0QjtXQUFkO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFqQjtVQUVBLEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7V0FBSjtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUFnQixJQUFBLEVBQU0sUUFBdEI7V0FBZDtRQVY2RCxDQUEvRDtNQUQwQixDQUE1QjthQWFBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO1FBQ3pCLFVBQUEsQ0FBVyxTQUFBO2lCQUNULEdBQUEsQ0FDRTtZQUFBLEtBQUEsRUFBTyw0REFBUDtXQURGO1FBRFMsQ0FBWDtRQVNBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO1VBQ3BCLEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtVQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7WUFBQSxZQUFBLEVBQWMsK0JBQWQ7WUFLQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsZUFBWCxDQUxOO1dBREY7aUJBT0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxFQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpCLENBQVI7WUFBa0MsSUFBQSxFQUFNLFFBQXhDO1dBREY7UUFUb0IsQ0FBdEI7UUFZQSxFQUFBLENBQUcsWUFBSCxFQUFpQixTQUFBO1VBQ2YsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO1VBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtZQUFBLFlBQUEsRUFBYyw2Q0FBZDtZQUtBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxVQUFYLENBTE47V0FERjtpQkFPQSxNQUFBLENBQU8sS0FBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULEVBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakIsQ0FBUjtZQUFrQyxJQUFBLEVBQU0sUUFBeEM7V0FERjtRQVRlLENBQWpCO2VBWUEsRUFBQSxDQUFHLGFBQUgsRUFBa0IsU0FBQTtVQUNoQixHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7VUFDQSxNQUFBLENBQU8sWUFBUCxFQUNFO1lBQUEsWUFBQSxFQUFjLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBQWQ7WUFDQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsV0FBWCxDQUROO1dBREY7aUJBR0EsTUFBQSxDQUFPLEtBQVAsRUFDRTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxFQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpCLENBQVI7WUFBa0MsSUFBQSxFQUFNLFFBQXhDO1dBREY7UUFMZ0IsQ0FBbEI7TUFsQ3lCLENBQTNCO0lBcEI0QixDQUE5QjtJQThEQSxRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQTtNQUM3QyxVQUFBLENBQVcsU0FBQTtRQUNULGVBQUEsQ0FBZ0IsU0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCO1FBRGMsQ0FBaEI7UUFFQSxXQUFBLENBQVksZUFBWixFQUE2QixTQUFDLEtBQUQsRUFBUSxHQUFSO1VBQzFCLHFCQUFELEVBQVM7aUJBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMseUJBQWQsRUFBMkI7UUFGQSxDQUE3QjtlQUlBLElBQUEsQ0FBSyxTQUFBO2lCQUNILElBQUksQ0FBQyxPQUFPLENBQUMsR0FBYixDQUFpQixNQUFqQixFQUNFO1lBQUEsNENBQUEsRUFDRTtjQUFBLEtBQUEsRUFBTyw2Q0FBUDtjQUNBLEtBQUEsRUFBTyx5Q0FEUDthQURGO1dBREY7UUFERyxDQUFMO01BUFMsQ0FBWDtNQWFBLFNBQUEsQ0FBVSxTQUFBO2VBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBZCxDQUFnQyx3QkFBaEM7TUFEUSxDQUFWO01BR0EsUUFBQSxDQUFTLHNDQUFULEVBQWlELFNBQUE7UUFDL0MsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtXQUFKO1FBRFMsQ0FBWDtRQUVBLEVBQUEsQ0FBRyxtQ0FBSCxFQUF3QyxTQUFBO2lCQUN0QyxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUFnQixJQUFBLEVBQU0sUUFBdEI7V0FBZDtRQURzQyxDQUF4QztlQUVBLEVBQUEsQ0FBRywrQkFBSCxFQUFvQyxTQUFBO2lCQUNsQyxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsTUFBQSxFQUFRLENBQUMsRUFBRCxFQUFLLENBQUwsQ0FBUjtZQUFpQixJQUFBLEVBQU0sUUFBdkI7V0FBZDtRQURrQyxDQUFwQztNQUwrQyxDQUFqRDthQVFBLFFBQUEsQ0FBUyxrQ0FBVCxFQUE2QyxTQUFBO1FBRzNDLFVBQUEsQ0FBVyxTQUFBO2lCQUNULEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVI7V0FBSjtRQURTLENBQVg7UUFFQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQTtpQkFDdEMsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVI7WUFBaUIsSUFBQSxFQUFNLFFBQXZCO1dBQWQ7UUFEc0MsQ0FBeEM7ZUFFQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQTtpQkFDbEMsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLE1BQUEsRUFBUSxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQVI7WUFBaUIsSUFBQSxFQUFNLFFBQXZCO1dBQWQ7UUFEa0MsQ0FBcEM7TUFQMkMsQ0FBN0M7SUF6QjZDLENBQS9DO0lBbUNBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO01BQzNCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsS0FBQSxFQUFPLGFBQVA7U0FERjtNQURTLENBQVg7TUFPQSxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQTtRQUM3QyxTQUFBLENBQVUsR0FBVjtRQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE9BQWxCO1FBQ0EsTUFBTSxDQUFDLFNBQVAsQ0FBQTtRQUNBLE1BQU0sQ0FBQyxTQUFQLENBQUE7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLElBQUEsRUFBTSxpQkFBTjtTQUFqQjtRQUVBLFNBQUEsQ0FBVSxHQUFWO1FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEI7UUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQjtRQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxJQUFBLEVBQU0sdUJBQU47U0FBakI7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsSUFBQSxFQUFNLGlCQUFOO1NBQVo7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsSUFBQSxFQUFNLFdBQU47U0FBWjtNQWI2QyxDQUEvQztNQWVBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBO1FBQzVCLFNBQUEsQ0FBVSxHQUFWO1FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsT0FBbEI7UUFDQSxNQUFNLENBQUMsU0FBUCxDQUFBO1FBQ0EsTUFBTSxDQUFDLFNBQVAsQ0FBQTtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsSUFBQSxFQUFNLGlCQUFOO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBaUI7VUFBQSxJQUFBLEVBQU0sdUJBQU47U0FBakI7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFpQjtVQUFBLElBQUEsRUFBTSw2QkFBTjtTQUFqQjtNQVA0QixDQUE5QjthQVNBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO1FBQy9CLFVBQUEsQ0FBVyxTQUFBO2lCQUNULEdBQUEsQ0FBSTtZQUFBLElBQUEsRUFBTSxFQUFOO1lBQVUsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBbEI7V0FBSjtRQURTLENBQVg7UUFHQSxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQTtVQUNyQyxTQUFBLENBQVUsR0FBVjtVQUdBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCO1VBQ0EsTUFBTSxDQUFDLFFBQVAsQ0FBQTtVQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCO1VBQ0EsTUFBTSxDQUFDLFNBQVAsQ0FBQTtVQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUssQ0FBTCxDQUFSO1dBQWpCO2lCQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sY0FBTjtZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSyxDQUFMLENBRFI7V0FERjtRQVZxQyxDQUF2QztlQWNBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBO1VBQzVCLFNBQUEsQ0FBVSxHQUFWO1VBRUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEI7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQjtVQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCO1VBQ0EsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBQTVCLEVBQThDLFFBQTlDO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSyxDQUFMLENBQVI7WUFDQSxJQUFBLEVBQU0sUUFETjtXQURGO2lCQUdBLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sY0FBTjtZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSyxFQUFMLENBRFI7V0FERjtRQVY0QixDQUE5QjtNQWxCK0IsQ0FBakM7SUFoQzJCLENBQTdCO0lBZ0VBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO01BQzNCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLEVBQU47VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7TUFEUyxDQUFYO01BS0EsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUE7UUFDNUIsU0FBQSxDQUFVLEdBQVY7UUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsSUFBQSxFQUFNLEtBQU47U0FBakI7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsSUFBQSxFQUFNLEVBQU47U0FBWjtNQUo0QixDQUE5QjthQU1BLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBO1FBQ3RCLFNBQUEsQ0FBVSxHQUFWO1FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUNFO1VBQUEsSUFBQSxFQUFNLEtBQU47VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7ZUFHQSxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsSUFBQSxFQUFNLFFBQU47VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7TUFOc0IsQ0FBeEI7SUFaMkIsQ0FBN0I7SUFzQkEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUE7QUFDakMsVUFBQTtNQUFBLGlCQUFBLEdBQW9CO01BQ3BCLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsaUJBQUEsR0FBb0IsU0FBQyxHQUFELEVBQU0sR0FBTjtBQUNsQixjQUFBO1VBRHlCLE9BQUQ7VUFDeEIsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQVo7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQjtpQkFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLFFBQUEsRUFBVTtjQUFBLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sSUFBTjtlQUFMO2FBQVY7V0FBakI7UUFIa0I7ZUFLcEIsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLE1BQU47VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7TUFOUyxDQUFYO01BVUEsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2VBQUcsaUJBQUEsQ0FBa0IsR0FBbEIsRUFBdUI7VUFBQSxJQUFBLEVBQU0sTUFBTjtTQUF2QjtNQUFILENBQWY7TUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7ZUFBRyxpQkFBQSxDQUFrQixHQUFsQixFQUF1QjtVQUFBLElBQUEsRUFBTSxNQUFOO1NBQXZCO01BQUgsQ0FBZjtNQUNBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQTtlQUFHLGlCQUFBLENBQWtCLEtBQWxCLEVBQXlCO1VBQUEsSUFBQSxFQUFNLE1BQU47U0FBekI7TUFBSCxDQUFmO01BQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2VBQUcsaUJBQUEsQ0FBa0IsR0FBbEIsRUFBdUI7VUFBQSxJQUFBLEVBQU0sTUFBTjtTQUF2QjtNQUFILENBQWY7YUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7ZUFBRyxpQkFBQSxDQUFrQixHQUFsQixFQUF1QjtVQUFBLElBQUEsRUFBTSxNQUFOO1NBQXZCO01BQUgsQ0FBZjtJQWhCaUMsQ0FBbkM7SUFrQkEsUUFBQSxDQUFTLGlEQUFULEVBQTRELFNBQUE7TUFDMUQsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUE7UUFDbEMsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsR0FBQSxDQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxVQUROO1dBREY7UUFEUyxDQUFYO1FBUUEsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUE7VUFDL0MsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO1VBQ0EsU0FBQSxDQUFVLEdBQVY7VUFDQSxNQUFNLENBQUMsU0FBUCxDQUFBO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sU0FBTjtZQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjtXQUFqQjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxJQUFBLEVBQU0sU0FBTjtXQUFkO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFkO1FBTitDLENBQWpEO1FBUUEsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUE7VUFDL0MsU0FBQSxDQUFVLEdBQVY7VUFDQSxNQUFNLENBQUMsU0FBUCxDQUFBO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sU0FBTjtZQUFpQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF6QjtXQUFqQjtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxJQUFBLEVBQU0sUUFBTjtZQUFnQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4QjtXQUFaO2lCQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1lBQUEsSUFBQSxFQUFNLE1BQU47V0FBaEI7UUFMK0MsQ0FBakQ7UUFPQSxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQTtVQUM1QyxTQUFBLENBQVUsR0FBVjtVQUNBLE1BQU0sRUFBQyxNQUFELEVBQU4sQ0FBQTtVQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFNBQU47V0FBakI7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWQ7UUFKNEMsQ0FBOUM7UUFNQSxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQTtVQUM1QyxTQUFBLENBQVUsR0FBVjtVQUNBLE1BQU0sRUFBQyxNQUFELEVBQU4sQ0FBQTtVQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFNBQU47V0FBakI7aUJBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWQ7UUFKNEMsQ0FBOUM7UUFNQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQTtVQUNyRCxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7VUFDQSxTQUFBLENBQVUsR0FBVjtVQUNBLE1BQU0sQ0FBQyxTQUFQLENBQUE7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtVQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFlBQU47V0FBakI7VUFDQSxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxjQUFOO1dBQVo7UUFQcUQsQ0FBdkQ7UUFTQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQTtVQUNyRCxTQUFBLENBQVUsR0FBVjtVQUNBLE1BQU0sQ0FBQyxTQUFQLENBQUE7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFsQjtVQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFlBQU47V0FBakI7aUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7WUFBQSxJQUFBLEVBQU0sY0FBTjtXQUFoQjtRQUxxRCxDQUF2RDtRQU9BLEVBQUEsQ0FBRywrQ0FBSCxFQUFvRCxTQUFBO1VBQ2xELFNBQUEsQ0FBVSxHQUFWO1VBQ0EsTUFBTSxFQUFDLE1BQUQsRUFBTixDQUFBO1VBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7VUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLElBQUEsRUFBTSxZQUFOO1dBQWpCO2lCQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1lBQUEsSUFBQSxFQUFNLGNBQU47V0FBaEI7UUFMa0QsQ0FBcEQ7ZUFPQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTtVQUNsRCxTQUFBLENBQVUsR0FBVjtVQUNBLE1BQU0sRUFBQyxNQUFELEVBQU4sQ0FBQTtVQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQWxCO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sWUFBTjtXQUFqQjtpQkFDQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtZQUFBLElBQUEsRUFBTSxjQUFOO1dBQWhCO1FBTGtELENBQXBEO01BM0RrQyxDQUFwQzthQWtFQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQTtRQUNsQyxVQUFBLENBQVcsU0FBQTtpQkFDVCxHQUFBLENBQ0U7WUFBQSxLQUFBLEVBQU8seUJBQVA7V0FERjtRQURTLENBQVg7UUFVQSxFQUFBLENBQUcsd0RBQUgsRUFBNkQsU0FBQTtVQUMzRCxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULEVBQWlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBakIsQ0FBUjtZQUFrQyxJQUFBLEVBQU0sUUFBeEM7V0FBWjtVQUNBLE1BQU0sQ0FBQyxTQUFQLENBQUE7VUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLElBQUEsRUFBTSxtQkFBTjtZQUEyQixNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsRUFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixDQUFuQztXQUFqQjtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLGdCQUFOO1lBQXdCLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxFQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpCLENBQWhDO1dBQVo7UUFKMkQsQ0FBN0Q7ZUFNQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtBQUN4RCxjQUFBO1VBQUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQVo7VUFDQSxNQUFNLEVBQUMsTUFBRCxFQUFOLENBQUE7VUFDQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsRUFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQjtVQUNWLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLG1CQUFOO1lBQTJCLE1BQUEsRUFBUSxPQUFuQztXQUFqQjtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxJQUFBLEVBQU0sZ0JBQU47WUFBd0IsTUFBQSxFQUFRLE9BQWhDO1dBQVo7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLGFBQU47WUFBcUIsTUFBQSxFQUFRLE9BQTdCO1dBQVo7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLFdBQU47WUFBbUIsTUFBQSxFQUFRLE9BQTNCO1dBQVo7aUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxVQUFOO1lBQWtCLE1BQUEsRUFBUSxPQUExQjtXQUFaO1FBUndELENBQTFEO01BakJrQyxDQUFwQztJQW5FMEQsQ0FBNUQ7V0E4RkEsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUE7QUFDbEMsVUFBQTtNQUFBLG9CQUFBLEdBQXVCLFNBQUMsR0FBRCxFQUFNLEdBQU47QUFDckIsWUFBQTtRQUQ0QixxQkFBUSxpQkFBTTtRQUMxQyxTQUFBLENBQVUsR0FBVjtRQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLE1BQWxCO2VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxJQUFBLEVBQU0sSUFBTjtVQUFZLE1BQUEsRUFBUSxNQUFwQjtTQUFqQjtNQUhxQjtNQUt2QixVQUFBLENBQVcsU0FBQTtBQUNULFlBQUE7UUFBQSxXQUFBLEdBQWM7UUFDZCxHQUFBLENBQUk7VUFBQSxJQUFBLEVBQU0sRUFBTjtVQUFVLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWxCO1NBQUo7UUFDQSxTQUFBLENBQVUsR0FBVjtRQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLFdBQWxCO2VBQ0EsTUFBQSxDQUFPLFlBQVAsRUFBcUI7VUFBQSxJQUFBLEVBQU0sV0FBTjtVQUFtQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEzQjtTQUFyQjtNQUxTLENBQVg7TUFPQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQTtRQUN2QyxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7aUJBQUcsb0JBQUEsQ0FBcUIsS0FBckIsRUFBNEI7WUFBQSxNQUFBLEVBQVEsR0FBUjtZQUFhLElBQUEsRUFBTSxXQUFuQjtZQUFnQyxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4QztXQUE1QjtRQUFILENBQWY7UUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7aUJBQUcsb0JBQUEsQ0FBcUIsS0FBckIsRUFBNEI7WUFBQSxNQUFBLEVBQVEsR0FBUjtZQUFhLElBQUEsRUFBTSxpQkFBbkI7WUFBc0MsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUM7V0FBNUI7UUFBSCxDQUFmO1FBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2lCQUFHLG9CQUFBLENBQXFCLEtBQXJCLEVBQTRCO1lBQUEsTUFBQSxFQUFRLEdBQVI7WUFBYSxJQUFBLEVBQU0saUJBQW5CO1lBQXNDLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQTlDO1dBQTVCO1FBQUgsQ0FBZjtlQUVBLFFBQUEsQ0FBUyxrRUFBVCxFQUE2RSxTQUFBO1VBQzNFLFVBQUEsQ0FBVyxTQUFBO1lBQ1QsR0FBQSxDQUFJO2NBQUEsSUFBQSxFQUFNLEVBQU47Y0FBVSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFsQjthQUFKO1lBQ0EsU0FBQSxDQUFVLEdBQVY7WUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQjttQkFDQSxNQUFBLENBQU8sWUFBUCxFQUFxQjtjQUFBLElBQUEsRUFBTSxHQUFOO2NBQVcsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBbkI7YUFBckI7VUFKUyxDQUFYO1VBTUEsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO21CQUFHLG9CQUFBLENBQXFCLE9BQXJCLEVBQThCO2NBQUEsTUFBQSxFQUFRLEdBQVI7Y0FBYSxJQUFBLEVBQU0sR0FBbkI7Y0FBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7YUFBOUI7VUFBSCxDQUFmO1VBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO21CQUFHLG9CQUFBLENBQXFCLEtBQXJCLEVBQTRCO2NBQUEsTUFBQSxFQUFRLEdBQVI7Y0FBYSxJQUFBLEVBQU0sR0FBbkI7Y0FBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7YUFBNUI7VUFBSCxDQUFmO1VBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO21CQUFHLG9CQUFBLENBQXFCLEtBQXJCLEVBQTRCO2NBQUEsTUFBQSxFQUFRLEdBQVI7Y0FBYSxJQUFBLEVBQU0sR0FBbkI7Y0FBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7YUFBNUI7VUFBSCxDQUFmO2lCQUNBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQTttQkFBRyxvQkFBQSxDQUFxQixLQUFyQixFQUE0QjtjQUFBLE1BQUEsRUFBUSxHQUFSO2NBQWEsSUFBQSxFQUFNLEdBQW5CO2NBQXdCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWhDO2FBQTVCO1VBQUgsQ0FBZjtRQVYyRSxDQUE3RTtNQUx1QyxDQUF6QzthQWlCQSxRQUFBLENBQVMsK0NBQVQsRUFBMEQsU0FBQTtlQUN4RCxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQTtVQUM1RCxHQUFBLENBQUk7WUFBQSxJQUFBLEVBQU0sRUFBTjtXQUFKO1VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQVAsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxDQUF2QztVQUNBLE1BQUEsQ0FBTyxpQkFBUCxFQUEwQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQTFCO1VBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7VUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWpCO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkM7UUFONEQsQ0FBOUQ7TUFEd0QsQ0FBMUQ7SUE5QmtDLENBQXBDO0VBcDZCNkMsQ0FBL0M7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2h9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xue2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcblxuZGVzY3JpYmUgXCJPcGVyYXRvciBBY3RpdmF0ZUluc2VydE1vZGUgZmFtaWx5XCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgYmluZEVuc3VyZU9wdGlvbiwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGJpbmRFbnN1cmVPcHRpb259ID0gdmltXG5cbiAgZGVzY3JpYmUgXCJ0aGUgcyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6ICcwMTIzNDUnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgXCJkZWxldGVzIHRoZSBjaGFyYWN0ZXIgdG8gdGhlIHJpZ2h0IGFuZCBlbnRlcnMgaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAncycsXG4gICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIHRleHQ6ICcwMjM0NSdcbiAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxJ1xuXG4gICAgaXQgXCJpcyByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGtleXN0cm9rZSAnMyBzJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2FiJ1xuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiAnYWIzNDUnXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6ICdhYmFiJ1xuXG4gICAgaXQgXCJpcyB1bmRvYWJsZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBrZXlzdHJva2UgJzMgcydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhYidcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogJ2FiMzQ1J1xuICAgICAgZW5zdXJlICd1JywgdGV4dDogJzAxMjM0NScsIHNlbGVjdGVkVGV4dDogJydcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAga2V5c3Ryb2tlICd2IGwgcydcblxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBzZWxlY3RlZCBjaGFyYWN0ZXJzIGFuZCBlbnRlcnMgaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0OiAnMDM0NSdcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMTInXG5cbiAgZGVzY3JpYmUgXCJ0aGUgUyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcbiAgICAgICAgY3Vyc29yOiBbMSwgM11cblxuICAgIGl0IFwiZGVsZXRlcyB0aGUgZW50aXJlIGxpbmUgYW5kIGVudGVycyBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdTJyxcbiAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgdGV4dDogXCIxMjM0NVxcblxcbkFCQ0RFXCJcbiAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYWJjZGVcXG4nLCB0eXBlOiAnbGluZXdpc2UnfVxuXG4gICAgaXQgXCJpcyByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ1MnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYWJjJ1xuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiAnMTIzNDVcXG5hYmNcXG5BQkNERSdcbiAgICAgIHNldCBjdXJzb3I6IFsyLCAzXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogJzEyMzQ1XFxuYWJjXFxuYWJjJ1xuXG4gICAgaXQgXCJpcyB1bmRvYWJsZVwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdTJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2FiYydcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuYWJjXFxuQUJDREUnXG4gICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiLCBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAjIEhlcmUgaXMgb3JpZ2luYWwgc3BlYyBJIGJlbGlldmUgaXRzIG5vdCBjb3JyZWN0LCBpZiBpdCBzYXlzICd3b3JrcydcbiAgICAjIHRleHQgcmVzdWx0IHNob3VsZCBiZSAnXFxuJyBzaW5jZSBTIGRlbGV0ZSBjdXJyZW50IGxpbmUuXG4gICAgIyBJdHMgb3JpZ25hbGx5IGFkZGVkIGluIGZvbGxvd2luZyBjb21taXQsIGFzIGZpeCBvZiBTKGZyb20gZGVzY3JpcHRpb24pLlxuICAgICMgQnV0IG9yaWdpbmFsIFN1YnN0aXR1dGVMaW5lIHJlcGxhY2VkIHdpdGggQ2hhbmdlIGFuZCBNb3ZlVG9SZWxhdGl2ZUxpbmUgY29tYm8uXG4gICAgIyBJIGJlbGlldmUgdGhpcyBzcGVjIHNob3VsZCBoYXZlIGJlZW4gZmFpbGVkIGF0IHRoYXQgdGltZSwgYnV0IGhhdmVudCcuXG4gICAgIyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS92aW0tbW9kZS9jb21taXQvNmFjZmZkMjU1OWU1NmY3YzE4YTRkNzY2ZjBhZDkyYzllZDYyMTJhZVxuICAgICNcbiAgICAjIGl0IFwid29ya3Mgd2hlbiB0aGUgY3Vyc29yJ3MgZ29hbCBjb2x1bW4gaXMgZ3JlYXRlciB0aGFuIGl0cyBjdXJyZW50IGNvbHVtblwiLCAtPlxuICAgICMgICBzZXQgdGV4dDogXCJcXG4xMjM0NVwiLCBjdXJzb3I6IFsxLCBJbmZpbml0eV1cbiAgICAjICAgZW5zdXJlICdrUycsIHRleHQ6ICdcXG4xMjM0NSdcblxuICAgIGl0IFwid29ya3Mgd2hlbiB0aGUgY3Vyc29yJ3MgZ29hbCBjb2x1bW4gaXMgZ3JlYXRlciB0aGFuIGl0cyBjdXJyZW50IGNvbHVtblwiLCAtPlxuICAgICAgc2V0IHRleHQ6IFwiXFxuMTIzNDVcIiwgY3Vyc29yOiBbMSwgSW5maW5pdHldXG4gICAgICAjIFNob3VsZCBiZSBoZXJlLCBidXQgSSBjb21tZW50ZWQgb3V0IGJlZm9yZSBJIGhhdmUgY29uZmlkZW5jZS5cbiAgICAgICMgZW5zdXJlICdrUycsIHRleHQ6ICdcXG4nXG4gICAgICAjIEZvbG93aW5nIGxpbmUgaW5jbHVkZSBCdWcgaWJlbGlldmUuXG4gICAgICBlbnN1cmUgJ2sgUycsIHRleHQ6ICdcXG4xMjM0NSdcbiAgICAjIENhbid0IGJlIHRlc3RlZCB3aXRob3V0IHNldHRpbmcgZ3JhbW1hciBvZiB0ZXN0IGJ1ZmZlclxuICAgIHhpdCBcInJlc3BlY3RzIGluZGVudGF0aW9uXCIsIC0+XG5cbiAgZGVzY3JpYmUgXCJ0aGUgYyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGNcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBhdXRvaW5kZW50XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCIxMjM0NVxcbiAgYWJjZGVcXG5BQkNERVxcblwiXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgc3B5T24oZWRpdG9yLCAnc2hvdWxkQXV0b0luZGVudCcpLmFuZFJldHVybih0cnVlKVxuICAgICAgICAgIHNweU9uKGVkaXRvciwgJ2F1dG9JbmRlbnRCdWZmZXJSb3cnKS5hbmRDYWxsRmFrZSAobGluZSkgLT5cbiAgICAgICAgICAgIGVkaXRvci5pbmRlbnQoKVxuICAgICAgICAgIHNweU9uKGVkaXRvci5sYW5ndWFnZU1vZGUsICdzdWdnZXN0ZWRJbmRlbnRGb3JMaW5lQXRCdWZmZXJSb3cnKS5hbmRDYWxsRmFrZSAtPiAxXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgYW5kIGVudGVycyBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICAgIGVuc3VyZSAnYyBjJyxcbiAgICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG4gIFxcbkFCQ0RFXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICAgIGl0IFwiaXMgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnYyBjJ1xuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjEyMzQ1XFxuICBhYmNcXG5BQkNERVxcblwiXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDNdXG4gICAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMjM0NVxcbiAgYWJjXFxuICBhYmNcXG5cIlxuXG4gICAgICAgIGl0IFwiaXMgdW5kb2FibGVcIiwgLT5cbiAgICAgICAgICBrZXlzdHJva2UgJ2MgYydcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFiY1wiKVxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxMjM0NVxcbiAgYWJjXFxuQUJDREVcXG5cIlxuICAgICAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiMTIzNDVcXG4gIGFiY2RlXFxuQUJDREVcXG5cIiwgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGhlIGN1cnNvciBpcyBvbiB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbGluZSdzIGNvbnRlbnQgYW5kIGVudGVycyBpbnNlcnQgbW9kZSBvbiB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDFdXG4gICAgICAgICAgZW5zdXJlICdjIGMnLFxuICAgICAgICAgICAgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGhlIGN1cnNvciBpcyBvbiB0aGUgb25seSBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbGluZSdzIGNvbnRlbnQgYW5kIGVudGVycyBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1XCIsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICdjIGMnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgaSB3XCIsIC0+XG4gICAgICBpdCBcInVuZG8ncyBhbmQgcmVkbydzIGNvbXBsZXRlbHlcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnYyBpIHcnLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5cXG5BQkNERVwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICAgICMgSnVzdCBjYW5ub3QgZ2V0IFwidHlwaW5nXCIgdG8gd29yayBjb3JyZWN0bHkgaW4gdGVzdC5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDVcXG5mZ1xcbkFCQ0RFXCJcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5mZ1xcbkFCQ0RFXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG4gICAgICAgIGVuc3VyZSAnY3RybC1yJywgdGV4dDogXCIxMjM0NVxcbmZnXFxuQUJDREVcIlxuXG4gICAgICBpdCBcInJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnYyBpIHcnLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5cXG5BQkNERVwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlIGogLicsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcblxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgd1wiLCAtPlxuICAgICAgaXQgXCJjaGFuZ2VzIHRoZSB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIndvcmQxIHdvcmQyIHdvcmQzXCIsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnYyB3IGVzY2FwZScsIHRleHQ6IFwid29yZDEgdyB3b3JkM1wiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXFxuXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyBHIGVzY2FwZScsIHRleHQ6ICcxMjM0NVxcblxcbidcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2MgRyBlc2NhcGUnLCB0ZXh0OiAnMTIzNDVcXG5cXG4nXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBnb3RvIGxpbmUgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIlxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyBhbGwgdGhlIHRleHQgb24gdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgMiBHIGVzY2FwZScsIHRleHQ6ICcxMjM0NVxcblxcbkFCQ0RFJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBtaWRkbGUgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyBhbGwgdGhlIHRleHQgb24gdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2MgMiBHIGVzY2FwZScsIHRleHQ6ICcxMjM0NVxcblxcbkFCQ0RFJ1xuXG4gIGRlc2NyaWJlIFwidGhlIEMga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICBjdXJzb3I6IFsxLCAyXVxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMCEhISEhIVxuICAgICAgICAxISEhISEhXG4gICAgICAgIDIhISEhISFcbiAgICAgICAgMyEhISEhIVxcblxuICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcImluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICBpdCBcImRlbGV0ZXMgdGlsbCB0aGUgRU9MIHRoZW4gZW50ZXIgaW5zZXJ0LW1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdDJyxcbiAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwISEhISEhXG4gICAgICAgICAgICAxIVxuICAgICAgICAgICAgMiEhISEhIVxuICAgICAgICAgICAgMyEhISEhIVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlIHdob2xlIGxpbmVzIGFuZCBlbnRlciBpbnNlcnQtbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaiBDJyxcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwISEhISEhXG5cbiAgICAgICAgICAgIDMhISEhISFcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGUgc2V0dGluZ3NcIiwgLT5cbiAgICByZXN1bHRUZXh0QyA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdpbml0aWFsLXZhbHVlJ1xuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIDBhYmNcbiAgICAgICAgMXxkZWZcbiAgICAgICAgMmdoaVxcblxuICAgICAgICBcIlwiXCJcbiAgICAgIHJlc3VsdFRleHRDID1cbiAgICAgICAgY2w6IFwiXCJcIlxuICAgICAgICAgIDBhYmNcbiAgICAgICAgICAxfGVmXG4gICAgICAgICAgMmdoaVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBDOiBcIlwiXCJcbiAgICAgICAgICAwYWJjXG4gICAgICAgICAgMXxcbiAgICAgICAgICAyZ2hpXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHM6IFwiXCJcIlxuICAgICAgICAgIDBhYmNcbiAgICAgICAgICAxfGVmXG4gICAgICAgICAgMmdoaVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBTOiBcIlwiXCJcbiAgICAgICAgICAwYWJjXG4gICAgICAgICAgfFxuICAgICAgICAgIDJnaGlcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcIndoZW4gZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGU9ZmFsc2VcIiwgLT5cbiAgICAgIGVuc3VyZV8gPSBudWxsXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVuc3VyZV8gPSBiaW5kRW5zdXJlT3B0aW9uKG1vZGU6ICdpbnNlcnQnKVxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZVwiLCBmYWxzZSlcbiAgICAgIGl0ICdjIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ2MgbCcsIHRleHRDOiByZXN1bHRUZXh0Qy5jbCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnZCd9XG4gICAgICBpdCAnQyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdDJywgdGV4dEM6IHJlc3VsdFRleHRDLkMsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2RlZid9XG4gICAgICBpdCAncyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdzJywgdGV4dEM6IHJlc3VsdFRleHRDLnMsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2QnfVxuICAgICAgaXQgJ1MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnUycsIHRleHRDOiByZXN1bHRUZXh0Qy5TLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICcxZGVmXFxuJ31cbiAgICBkZXNjcmliZSBcIndoZW4gZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGU9dHJ1ZVwiLCAtPlxuICAgICAgZW5zdXJlXyA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZW5zdXJlXyA9IGJpbmRFbnN1cmVPcHRpb24obW9kZTogJ2luc2VydCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2luaXRpYWwtdmFsdWUnfSlcbiAgICAgICAgc2V0dGluZ3Muc2V0KFwiZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGVcIiwgdHJ1ZSlcbiAgICAgIGl0ICdjIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ2MgbCcsIHRleHRDOiByZXN1bHRUZXh0Qy5jbFxuICAgICAgaXQgJ0MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnQycsIHRleHRDOiByZXN1bHRUZXh0Qy5DXG4gICAgICBpdCAncyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdzJywgdGV4dEM6IHJlc3VsdFRleHRDLnNcbiAgICAgIGl0ICdTIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ1MnLCB0ZXh0QzogcmVzdWx0VGV4dEMuU1xuXG4gIGRlc2NyaWJlIFwidGhlIE8ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNweU9uKGVkaXRvciwgJ3Nob3VsZEF1dG9JbmRlbnQnKS5hbmRSZXR1cm4odHJ1ZSlcbiAgICAgIHNweU9uKGVkaXRvciwgJ2F1dG9JbmRlbnRCdWZmZXJSb3cnKS5hbmRDYWxsRmFrZSAobGluZSkgLT5cbiAgICAgICAgZWRpdG9yLmluZGVudCgpXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBffF8wMTJcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcInN3aXRjaGVzIHRvIGluc2VydCBhbmQgYWRkcyBhIG5ld2xpbmUgYWJvdmUgdGhlIGN1cnJlbnQgb25lXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ08nXG4gICAgICBlbnN1cmVcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX198XG4gICAgICAgIF9fMDEyXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgaXQgXCJpcyByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX2FiY1xuICAgICAgICAgIF9ffDAxMlxuICAgICAgICAgIF9fX180c3BhY2VzXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAjIHNldFxuICAgICAgIyAgIHRleHQ6IFwiICBhYmNcXG4gIDAxMlxcbiAgICA0c3BhY2VzXFxuXCIsIGN1cnNvcjogWzEsIDFdXG4gICAgICBrZXlzdHJva2UgJ08nXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImRlZlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19hYmNcbiAgICAgICAgICBfX2RlfGZcbiAgICAgICAgICBfXzAxMlxuICAgICAgICAgIF9fX180c3BhY2VzXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBlbnN1cmUgJy4nLFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBfX2RlfGZcbiAgICAgICAgX19kZWZcbiAgICAgICAgX18wMTJcbiAgICAgICAgX19fXzRzcGFjZXNcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF9fZGVmXG4gICAgICAgIF9fZGVmXG4gICAgICAgIF9fMDEyXG4gICAgICAgIF9fX19kZXxmXG4gICAgICAgIF9fX180c3BhY2VzXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJpcyB1bmRvYWJsZVwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdPJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJkZWZcIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBfX2RlZlxuICAgICAgICBfXzAxMlxcblxuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAndScsXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF9fMDEyXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwidGhlIG8ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNweU9uKGVkaXRvciwgJ3Nob3VsZEF1dG9JbmRlbnQnKS5hbmRSZXR1cm4odHJ1ZSlcbiAgICAgIHNweU9uKGVkaXRvciwgJ2F1dG9JbmRlbnRCdWZmZXJSb3cnKS5hbmRDYWxsRmFrZSAobGluZSkgLT5cbiAgICAgICAgZWRpdG9yLmluZGVudCgpXG5cbiAgICAgIHNldCB0ZXh0OiBcImFiY1xcbiAgMDEyXFxuXCIsIGN1cnNvcjogWzEsIDJdXG5cbiAgICBpdCBcInN3aXRjaGVzIHRvIGluc2VydCBhbmQgYWRkcyBhIG5ld2xpbmUgYWJvdmUgdGhlIGN1cnJlbnQgb25lXCIsIC0+XG4gICAgICBlbnN1cmUgJ28nLFxuICAgICAgICB0ZXh0OiBcImFiY1xcbiAgMDEyXFxuICBcXG5cIlxuICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBjdXJzb3I6IFsyLCAyXVxuXG4gICAgIyBUaGlzIHdvcmtzIGluIHByYWN0aWNlLCBidXQgdGhlIGVkaXRvciBkb2Vzbid0IHJlc3BlY3QgdGhlIGluZGVudGF0aW9uXG4gICAgIyBydWxlcyB3aXRob3V0IGEgc3ludGF4IGdyYW1tYXIuIE5lZWQgdG8gc2V0IHRoZSBlZGl0b3IncyBncmFtbWFyXG4gICAgIyB0byBmaXggaXQuXG4gICAgeGl0IFwiaXMgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgc2V0IHRleHQ6IFwiICBhYmNcXG4gIDAxMlxcbiAgICA0c3BhY2VzXFxuXCIsIGN1cnNvcjogWzEsIDFdXG4gICAgICBrZXlzdHJva2UgJ28nXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImRlZlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiICBhYmNcXG4gIDAxMlxcbiAgZGVmXFxuICAgIDRzcGFjZXNcXG5cIlxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIgIGFiY1xcbiAgMDEyXFxuICBkZWZcXG4gIGRlZlxcbiAgICA0c3BhY2VzXFxuXCJcbiAgICAgIHNldCBjdXJzb3I6IFs0LCAxXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIgIGFiY1xcbiAgZGVmXFxuICBkZWZcXG4gIDAxMlxcbiAgICA0c3BhY2VzXFxuICAgIGRlZlxcblwiXG5cbiAgICBpdCBcImlzIHVuZG9hYmxlXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ28nXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImRlZlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiYWJjXFxuICAwMTJcXG4gIGRlZlxcblwiXG4gICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcImFiY1xcbiAgMDEyXFxuXCJcblxuICBkZXNjcmliZSBcInVuZG8vcmVkbyBmb3IgYG9gIGFuZCBgT2BcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dEM6IFwiLS0tLXw9PVwiXG4gICAgaXQgXCJ1bmRvIGFuZCByZWRvIGJ5IGtlZXBpbmcgY3Vyc29yIGF0IG8gc3RhcnRlZCBwb3NpdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdvJywgbW9kZTogJ2luc2VydCdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdAQCcpXG4gICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgdGV4dEM6IFwiLS0tLT09XFxuQHxAXCJcbiAgICAgIGVuc3VyZSBcInVcIiwgdGV4dEM6IFwiLS0tLXw9PVwiXG4gICAgICBlbnN1cmUgXCJjdHJsLXJcIiwgdGV4dEM6IFwiLS0tLXw9PVxcbkBAXCJcbiAgICBpdCBcInVuZG8gYW5kIHJlZG8gYnkga2VlcGluZyBjdXJzb3IgYXQgTyBzdGFydGVkIHBvc2l0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ08nLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ0BAJylcbiAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCB0ZXh0QzogXCJAfEBcXG4tLS0tPT1cIlxuICAgICAgZW5zdXJlIFwidVwiLCB0ZXh0QzogXCItLS0tfD09XCJcbiAgICAgIGVuc3VyZSBcImN0cmwtclwiLCB0ZXh0QzogXCJAQFxcbi0tLS18PT1cIlxuXG4gIGRlc2NyaWJlIFwidGhlIGEga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIjAxMlxcblwiXG5cbiAgICBkZXNjcmliZSBcImF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGtleXN0cm9rZSAnYSdcblxuICAgICAgaXQgXCJzd2l0Y2hlcyB0byBpbnNlcnQgbW9kZSBhbmQgc2hpZnRzIHRvIHRoZSByaWdodFwiLCAtPlxuICAgICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgMV0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBkZXNjcmliZSBcImF0IHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGtleXN0cm9rZSAnYSdcblxuICAgICAgaXQgXCJkb2Vzbid0IGxpbmV3cmFwXCIsIC0+XG4gICAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCAzXVxuXG4gIGRlc2NyaWJlIFwidGhlIEEga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIjExXFxuMjJcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJhdCB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZVwiLCAtPlxuICAgICAgaXQgXCJzd2l0Y2hlcyB0byBpbnNlcnQgbW9kZSBhdCB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ0EnLFxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgaXQgXCJyZXBlYXRzIGFsd2F5cyBhcyBpbnNlcnQgYXQgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAga2V5c3Ryb2tlICdBJ1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFiY1wiKVxuICAgICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0OiBcIjExYWJjXFxuMjJhYmNcXG5cIlxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgY3Vyc29yOiBbMSwgNF1cblxuICBkZXNjcmliZSBcInRoZSBJIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgIDE6IDM0NTYgODkwXG4gICAgICAgIF9fMjogMzQ1NiA4OTBcbiAgICAgICAgX19fXzM6IDM0NTYgODkwXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJJXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGZpcnN0IGNoYXIgb2YgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgIGVuc3VyZSAnSScsIGN1cnNvcjogWzAsIDJdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICAgICAgZW5zdXJlICdJJywgY3Vyc29yOiBbMSwgMF0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ0knLCBjdXJzb3I6IFsxLCAwXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgZGVzY3JpYmUgXCJBXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGVuZCBvZiBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgZW5zdXJlICdBJywgY3Vyc29yOiBbMCwgMTNdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICAgICAgZW5zdXJlICdBJywgY3Vyc29yOiBbMSwgMTFdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDExXVxuICAgICAgICAgIGVuc3VyZSAnQScsIGN1cnNvcjogWzEsIDExXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUubGluZXdpc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSBcIlYgMiBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAxOiAzNDU2IDg5MFxuICAgICAgICAgICAgMjogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgMzogMzQ1NiA4OTBcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG5cbiAgICAgIGRlc2NyaWJlIFwiSVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBmaXJzdCBjaGFyIG9mIGxpbmUgKm9mIGVhY2ggc2VsZWN0ZWQgbGluZSpcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJJXCIsIGN1cnNvcjogW1sxLCAwXSwgWzIsIDJdLCBbMywgNF1dLCBtb2RlOiBcImluc2VydFwiXG4gICAgICBkZXNjcmliZSBcIkFcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgZW5kIG9mIGxpbmUgKm9mIGVhY2ggc2VsZWN0ZWQgbGluZSpcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJBXCIsIGN1cnNvcjogW1sxLCAxMV0sIFsyLCAxM10sIFszLCAxNV1dLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmJsb2Nrd2lzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgZW5zdXJlIFwiY3RybC12IDIgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wiNFwiLCBcIiBcIiwgXCIzXCJdXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cblxuICAgICAgZGVzY3JpYmUgXCJJXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGNvbHVtbiBvZiBzdGFydCBvZiBzZWxlY3Rpb24gZm9yICplYWNoIHNlbGVjdGlvbipcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJJXCIsIGN1cnNvcjogW1sxLCA0XSwgWzIsIDRdLCBbMywgNF1dLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICAgICAgaXQgXCJjYW4gcmVwZWF0IGFmdGVyIGluc2VydCBBRlRFUiBjbGVhcmluZyBtdWx0aXBsZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxsaW5lMFxuICAgICAgICAgICAgbGluZTFcbiAgICAgICAgICAgIGxpbmUyXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSBcImN0cmwtdiBqIElcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxsaW5lMFxuICAgICAgICAgICAgfGxpbmUxXG4gICAgICAgICAgICBsaW5lMlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJBQkNcIilcblxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgQUJ8Q2xpbmUwXG4gICAgICAgICAgICBBQiFDbGluZTFcbiAgICAgICAgICAgIGxpbmUyXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICAjIEZJWE1FIHNob3VsZCBwdXQgbGFzdC1jdXJzb3IgcG9zaXRpb24gYXQgdG9wIG9mIGJsb2NrU2VsZWN0aW9uXG4gICAgICAgICAgIyAgdG8gcmVtb3ZlIGBrYCBtb3Rpb25cbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGUga1wiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgQUIhQ2xpbmUwXG4gICAgICAgICAgICBBQkNsaW5lMVxuICAgICAgICAgICAgbGluZTJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgICMgVGhpcyBzaG91bGQgc3VjY2Vzc1xuICAgICAgICAgIGVuc3VyZSBcImwgLlwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgQUJDQUJ8Q2xpbmUwXG4gICAgICAgICAgICBBQkNBQiFDbGluZTFcbiAgICAgICAgICAgIGxpbmUyXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwiQVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBjb2x1bW4gb2YgZW5kIG9mIHNlbGVjdGlvbiBmb3IgKmVhY2ggc2VsZWN0aW9uKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIkFcIiwgY3Vyc29yOiBbWzEsIDVdLCBbMiwgNV0sIFszLCA1XV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgZW5zdXJlIFwidiAyIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIDQ1NiA4OTBcbiAgICAgICAgICAgIDI6IDM0NTYgODkwXG4gICAgICAgICAgICAgIDNcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgZGVzY3JpYmUgXCJJIGlzIHNob3J0IGhhbmQgb2YgYGN0cmwtdiBJYFwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBjb2x1bSBvZiBzdGFydCBvZiBzZWxlY3Rpb24gZm9yICplYWNoIHNlbGVjdGVkIGxpbmVzKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIklcIiwgY3Vyc29yOiBbWzEsIDRdLCBbMiwgNF0sIFszLCA0XV0sIG1vZGU6IFwiaW5zZXJ0XCJcbiAgICAgIGRlc2NyaWJlIFwiQSBpcyBzaG9ydCBoYW5kIG9mIGBjdHJsLXYgQWBcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgY29sdW1uIG9mIGVuZCBvZiBzZWxlY3Rpb24gZm9yICplYWNoIHNlbGVjdGVkIGxpbmVzKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIkFcIiwgY3Vyc29yOiBbWzEsIDVdLCBbMiwgNV0sIFszLCA1XV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBvY2N1cnJlbmNlIG1hcmtlciBpbnRlcnNlbGN0cyBJIGFuZCBBIG5vIGxvbmdlciBiZWhhdmUgYmxvY2t3aXNlIGluIHZDL3ZMXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnMzQ1NicsICczNDU2JywgJzM0NTYnLCAnMzQ1NiddLCBjdXJzb3I6IFsxLCAzXVxuICAgICAgZGVzY3JpYmUgXCJ2Q1wiLCAtPlxuICAgICAgICBkZXNjcmliZSBcIkkgYW5kIEEgTk9UIGJlaGF2ZSBhcyBgY3RybC12IElgXCIsIC0+XG4gICAgICAgICAgaXQgXCJJIGluc2VydCBhdCBzdGFydCBvZiBlYWNoIHZzdWFsbHkgc2VsZWN0ZWQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwidiBqIGogSVwiLFxuICAgICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgICAgIF9fMDogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICAxOiAhMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICBfXzI6IHwzNDU2IDg5MFxuICAgICAgICAgICAgICAgIF9fX18zOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGl0IFwiQSBpbnNlcnQgYXQgZW5kIG9mIGVhY2ggdnN1YWxseSBzZWxlY3RlZCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJ2IGogaiBBXCIsXG4gICAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgICAgX18wOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAgIDE6IDM0NTYhIDg5MFxuICAgICAgICAgICAgICAgIF9fMjogMzQ1NnwgODkwXG4gICAgICAgICAgICAgICAgX19fXzM6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcInZMXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiSSBhbmQgQSBOT1QgYmVoYXZlIGFzIGBjdHJsLXYgSWBcIiwgLT5cbiAgICAgICAgICBpdCBcIkkgaW5zZXJ0IGF0IHN0YXJ0IG9mIGVhY2ggdnN1YWxseSBzZWxlY3RlZCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJWIGogaiBJXCIsXG4gICAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgICAgX18wOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAgIDE6IHwzNDU2IDg5MFxuICAgICAgICAgICAgICAgICBfMjogfDM0NTYgODkwXG4gICAgICAgICAgICAgICAgX19fXzM6ICEzNDU2IDg5MFxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGl0IFwiQSBpbnNlcnQgYXQgZW5kIG9mIGVhY2ggdnN1YWxseSBzZWxlY3RlZCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJWIGogaiBBXCIsXG4gICAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgICAgX18wOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAgIDE6IDM0NTZ8IDg5MFxuICAgICAgICAgICAgICAgIF9fMjogMzQ1NnwgODkwXG4gICAgICAgICAgICAgICAgX19fXzM6IDM0NTYhIDg5MFxuICAgICAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwidGhlIGdJIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIF9fdGhpcyBpcyB0ZXh0XG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiBub3JtYWwtbW9kZS5cIiwgLT5cbiAgICAgIGl0IFwic3RhcnQgYXQgaW5zZXJ0IGF0IGNvbHVtbiAwIHJlZ2FyZGxlc3Mgb2YgY3VycmVudCBjb2x1bW5cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDVdXG4gICAgICAgIGVuc3VyZSBcImcgSVwiLCBjdXJzb3I6IFswLCAwXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBcImcgSVwiLCBjdXJzb3I6IFswLCAwXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDEzXVxuICAgICAgICBlbnN1cmUgXCJnIElcIiwgY3Vyc29yOiBbMCwgMF0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgICAgMTogMzQ1NiA4OTBcbiAgICAgICAgICBfXzI6IDM0NTYgODkwXG4gICAgICAgICAgX19fXzM6IDM0NTYgODkwXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiW2NoYXJhY3Rlcndpc2VdXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgXCJ2IDIgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgNDU2IDg5MFxuICAgICAgICAgICAgMjogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgM1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICBlbnN1cmUgXCJnIElcIixcbiAgICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFsyLCAwXSwgWzMsIDBdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgICBpdCBcIltsaW5ld2lzZV1cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSBcIlYgMiBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAxOiAzNDU2IDg5MFxuICAgICAgICAgICAgMjogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgMzogMzQ1NiA4OTBcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgIGVuc3VyZSBcImcgSVwiLFxuICAgICAgICAgIGN1cnNvcjogW1sxLCAwXSwgWzIsIDBdLCBbMywgMF1dLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICAgIGl0IFwiW2Jsb2Nrd2lzZV1cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdXG4gICAgICAgIGVuc3VyZSBcImN0cmwtdiAyIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIjRcIiwgXCIgXCIsIFwiM1wiXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgIGVuc3VyZSBcImcgSVwiLFxuICAgICAgICAgIGN1cnNvcjogW1sxLCAwXSwgWzIsIDBdLCBbMywgMF1dLCBtb2RlOiBcImluc2VydFwiXG5cbiAgZGVzY3JpYmUgXCJJbnNlcnRBdFByZXZpb3VzRm9sZFN0YXJ0IGFuZCBOZXh0XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcbiAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuY29mZmVlJywgKHN0YXRlLCB2aW0pIC0+XG4gICAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gc3RhdGVcbiAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAgICdnIFsnOiAndmltLW1vZGUtcGx1czppbnNlcnQtYXQtcHJldmlvdXMtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICdnIF0nOiAndmltLW1vZGUtcGx1czppbnNlcnQtYXQtbmV4dC1mb2xkLXN0YXJ0J1xuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgbm90IGF0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxNiwgMF1cbiAgICAgIGl0IFwiaW5zZXJ0IGF0IHByZXZpb3VzIGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBbJywgY3Vyc29yOiBbOSwgMl0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICBpdCBcImluc2VydCBhdCBuZXh0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBdJywgY3Vyc29yOiBbMTgsIDRdLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBhdCBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgIyBOb3RoaW5nIHNwZWNpYWwgd2hlbiBjdXJzb3IgaXMgYXQgZm9sZCBzdGFydCByb3csXG4gICAgICAjIG9ubHkgZm9yIHRlc3Qgc2NlbmFyaW8gdGhyb3VnaG5lc3MuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyMCwgNl1cbiAgICAgIGl0IFwiaW5zZXJ0IGF0IHByZXZpb3VzIGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBbJywgY3Vyc29yOiBbMTgsIDRdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgaXQgXCJpbnNlcnQgYXQgbmV4dCBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgXScsIGN1cnNvcjogWzIyLCA2XSwgbW9kZTogJ2luc2VydCdcblxuICBkZXNjcmliZSBcInRoZSBpIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHwxMjNcbiAgICAgICAgICB8NDU2N1xuICAgICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJhbGxvd3MgdW5kb2luZyBhbiBlbnRpcmUgYmF0Y2ggb2YgdHlwaW5nXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ2knXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFiY1hYXCIpXG4gICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcImFiYzEyM1xcbmFiYzQ1NjdcIlxuXG4gICAgICBrZXlzdHJva2UgJ2knXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImRcIlxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJlXCJcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiYWJkZWZjMTIzXFxuYWJkZWZjNDU2N1wiXG4gICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcImFiYzEyM1xcbmFiYzQ1NjdcIlxuICAgICAgZW5zdXJlICd1JywgdGV4dDogXCIxMjNcXG40NTY3XCJcblxuICAgIGl0IFwiYWxsb3dzIHJlcGVhdGluZyB0eXBpbmdcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjWFhcIilcbiAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiYWJjMTIzXFxuYWJjNDU2N1wiXG4gICAgICBlbnN1cmUgJy4nLCAgICAgIHRleHQ6IFwiYWJhYmNjMTIzXFxuYWJhYmNjNDU2N1wiXG4gICAgICBlbnN1cmUgJy4nLCAgICAgIHRleHQ6IFwiYWJhYmFiY2NjMTIzXFxuYWJhYmFiY2NjNDU2N1wiXG5cbiAgICBkZXNjcmliZSAnd2l0aCBub25saW5lYXIgaW5wdXQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogJycsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0ICdkZWFscyB3aXRoIGF1dG8tbWF0Y2hlZCBicmFja2V0cycsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgICAgIyB0aGlzIHNlcXVlbmNlIHNpbXVsYXRlcyB3aGF0IHRoZSBicmFja2V0LW1hdGNoZXIgcGFja2FnZSBkb2VzXG4gICAgICAgICMgd2hlbiB0aGUgdXNlciB0eXBlcyAoYSliPGVudGVyPlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnKCknXG4gICAgICAgIGVkaXRvci5tb3ZlTGVmdCgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhJ1xuICAgICAgICBlZGl0b3IubW92ZVJpZ2h0KClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2JcXG4nXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgY3Vyc29yOiBbMSwgIDBdXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogJyhhKWJcXG4oYSliXFxuJ1xuICAgICAgICAgIGN1cnNvcjogWzIsICAwXVxuXG4gICAgICBpdCAnZGVhbHMgd2l0aCBhdXRvY29tcGxldGUnLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ2knXG4gICAgICAgICMgdGhpcyBzZXF1ZW5jZSBzaW11bGF0ZXMgYXV0b2NvbXBsZXRpb24gb2YgJ2FkZCcgdG8gJ2FkZEZvbydcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2EnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdkJ1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnZCdcbiAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlIFtbMCwgMF0sIFswLCAzXV0sICdhZGRGb28nXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICBjdXJzb3I6IFswLCAgNV1cbiAgICAgICAgICB0ZXh0OiAnYWRkRm9vJ1xuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHQ6ICdhZGRGb2FkZEZvb28nXG4gICAgICAgICAgY3Vyc29yOiBbMCwgIDEwXVxuXG4gIGRlc2NyaWJlICd0aGUgYSBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJydcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiY2FuIGJlIHVuZG9uZSBpbiBvbmUgZ29cIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnYSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiYWJjXCJcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiXCJcblxuICAgIGl0IFwicmVwZWF0cyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnYSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgIHRleHQ6IFwiYWJjXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgIHRleHQ6IFwiYWJjYWJjXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgNV1cblxuICBkZXNjcmliZSAncHJlc2VydmUgaW5zZXJ0ZWQgdGV4dCcsIC0+XG4gICAgZW5zdXJlRG90UmVnaXN0ZXIgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZW5zdXJlRG90UmVnaXN0ZXIgPSAoa2V5LCB7dGV4dH0pIC0+XG4gICAgICAgIGVuc3VyZSBrZXksIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KHRleHQpXG4gICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCByZWdpc3RlcjogJy4nOiB0ZXh0OiB0ZXh0XG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlxcblxcblwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcIltjYXNlLWldXCIsIC0+IGVuc3VyZURvdFJlZ2lzdGVyICdpJywgdGV4dDogJ2lhYmMnXG4gICAgaXQgXCJbY2FzZS1vXVwiLCAtPiBlbnN1cmVEb3RSZWdpc3RlciAnbycsIHRleHQ6ICdvYWJjJ1xuICAgIGl0IFwiW2Nhc2UtY11cIiwgLT4gZW5zdXJlRG90UmVnaXN0ZXIgJ2MgbCcsIHRleHQ6ICdjYWJjJ1xuICAgIGl0IFwiW2Nhc2UtQ11cIiwgLT4gZW5zdXJlRG90UmVnaXN0ZXIgJ0MnLCB0ZXh0OiAnQ2FiYydcbiAgICBpdCBcIltjYXNlLXNdXCIsIC0+IGVuc3VyZURvdFJlZ2lzdGVyICdzJywgdGV4dDogJ3NhYmMnXG5cbiAgZGVzY3JpYmUgXCJyZXBlYXQgYmFja3NwYWNlL2RlbGV0ZSBoYXBwZW5lZCBpbiBpbnNlcnQtbW9kZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwic2luZ2xlIGN1cnNvciBvcGVyYXRpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMjNcbiAgICAgICAgICAxMjNcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGJhY2tzcGFjZSBvbmx5IG11dGF0aW9uOiBjYXNlLWlcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIyM1xcbjEyM1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6IFwiMjNcXG4xMjNcIiAjIG5vdGhpbmcgaGFwcGVuXG4gICAgICAgIGVuc3VyZSAnbCAuJywgdGV4dDogXCIyM1xcbjIzXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGJhY2tzcGFjZSBvbmx5IG11dGF0aW9uOiBjYXNlLWFcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICdhJ1xuICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjIzXFxuMTIzXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiM1xcbjEyM1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2ogLiAuJywgdGV4dDogXCIzXFxuM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBkZWxldGUgb25seSBtdXRhdGlvbjogY2FzZS1pXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgICAgZWRpdG9yLmRlbGV0ZSgpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIyM1xcbjEyM1wiXG4gICAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogXCIyM1xcbjIzXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGRlbGV0ZSBvbmx5IG11dGF0aW9uOiBjYXNlLWFcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICdhJ1xuICAgICAgICBlZGl0b3IuZGVsZXRlKClcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjEzXFxuMTIzXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiBcIjEzXFxuMTNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgYmFja3NwYWNlIGFuZCBpbnNlcnQgbXV0YXRpb246IGNhc2UtaVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAga2V5c3Ryb2tlICdpJ1xuICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIhISFcIilcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIiEhITIzXFxuMTIzXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiISEhMjNcXG4hISEyM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBiYWNrc3BhY2UgYW5kIGluc2VydCBtdXRhdGlvbjogY2FzZS1hXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnYSdcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiISEhXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIhISEyM1xcbjEyM1wiXG4gICAgICAgIGVuc3VyZSAnaiAwIC4nLCB0ZXh0OiBcIiEhITIzXFxuISEhMjNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgZGVsZXRlIGFuZCBpbnNlcnQgbXV0YXRpb246IGNhc2UtaVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ2knXG4gICAgICAgIGVkaXRvci5kZWxldGUoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiEhIVwiKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiISEhMjNcXG4xMjNcIlxuICAgICAgICBlbnN1cmUgJ2ogMCAuJywgdGV4dDogXCIhISEyM1xcbiEhITIzXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGRlbGV0ZSBhbmQgaW5zZXJ0IG11dGF0aW9uOiBjYXNlLWFcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICdhJ1xuICAgICAgICBlZGl0b3IuZGVsZXRlKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIhISFcIilcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjEhISEzXFxuMTIzXCJcbiAgICAgICAgZW5zdXJlICdqIDAgLicsIHRleHQ6IFwiMSEhITNcXG4xISEhM1wiXG5cbiAgICBkZXNjcmliZSBcIm11bHRpLWN1cnNvcnMgb3BlcmF0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8MTIzXG5cbiAgICAgICAgICB8MTIzNFxuXG4gICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBiYWNrc3BhY2Ugb25seSBtdXRhdGlvbjogY2FzZS1tdWx0aS1jdXJzb3JzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnQScsIGN1cnNvcjogW1swLCAzXSwgWzIsIDRdLCBbNCwgNV1dLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjEyXFxuXFxuMTIzXFxuXFxuMTIzNFwiLCBjdXJzb3I6IFtbMCwgMV0sIFsyLCAyXSwgWzQsIDNdXVxuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjFcXG5cXG4xMlxcblxcbjEyM1wiLCBjdXJzb3I6IFtbMCwgMF0sIFsyLCAxXSwgWzQsIDJdXVxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgZGVsZXRlIG9ubHkgbXV0YXRpb246IGNhc2UtbXVsdGktY3Vyc29yc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ0knLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlZGl0b3IuZGVsZXRlKClcbiAgICAgICAgY3Vyc29ycyA9IFtbMCwgMF0sIFsyLCAwXSwgWzQsIDBdXVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMjNcXG5cXG4yMzRcXG5cXG4yMzQ1XCIsIGN1cnNvcjogY3Vyc29yc1xuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjNcXG5cXG4zNFxcblxcbjM0NVwiLCBjdXJzb3I6IGN1cnNvcnNcbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCJcXG5cXG40XFxuXFxuNDVcIiwgY3Vyc29yOiBjdXJzb3JzXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiXFxuXFxuXFxuXFxuNVwiLCBjdXJzb3I6IGN1cnNvcnNcbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCJcXG5cXG5cXG5cXG5cIiwgY3Vyc29yOiBjdXJzb3JzXG5cbiAgZGVzY3JpYmUgJ3NwZWNpZnkgaW5zZXJ0aW9uIGNvdW50JywgLT5cbiAgICBlbnN1cmVJbnNlcnRpb25Db3VudCA9IChrZXksIHtpbnNlcnQsIHRleHQsIGN1cnNvcn0pIC0+XG4gICAgICBrZXlzdHJva2Uga2V5XG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChpbnNlcnQpXG4gICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgdGV4dDogdGV4dCwgY3Vyc29yOiBjdXJzb3JcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGluaXRpYWxUZXh0ID0gXCIqXFxuKlxcblwiXG4gICAgICBzZXQgdGV4dDogXCJcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGluaXRpYWxUZXh0KVxuICAgICAgZW5zdXJlIFwiZXNjYXBlIGcgZ1wiLCB0ZXh0OiBpbml0aWFsVGV4dCwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwicmVwZWF0IGluc2VydGlvbiBjb3VudCB0aW1lc1wiLCAtPlxuICAgICAgaXQgXCJbY2FzZS1pXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBpJywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiPT09KlxcbipcXG5cIiwgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGl0IFwiW2Nhc2Utb11cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgbycsIGluc2VydDogJz0nLCB0ZXh0OiBcIipcXG49XFxuPVxcbj1cXG4qXFxuXCIsIGN1cnNvcjogWzMsIDBdXG4gICAgICBpdCBcIltjYXNlLU9dXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIE8nLCBpbnNlcnQ6ICc9JywgdGV4dDogXCI9XFxuPVxcbj1cXG4qXFxuKlxcblwiLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImNoaWxkcmVuIG9mIENoYW5nZSBvcGVyYXRpb24gd29uJ3QgcmVwZWF0ZSBpbnNlcnRpb24gY291bnQgdGltZXNcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIlwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGtleXN0cm9rZSAnaSdcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnKicpXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUgZyBnJywgdGV4dDogJyonLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIGl0IFwiW2Nhc2UtY11cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgYyB3JywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiPVwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcIltjYXNlLUNdXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIEMnLCBpbnNlcnQ6ICc9JywgdGV4dDogXCI9XCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwiW2Nhc2Utc11cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgcycsIGluc2VydDogJz0nLCB0ZXh0OiBcIj1cIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJbY2FzZS1TXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBTJywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiPVwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ0aHJvdHRvbGluZyBpbnRlcnRpb24gY291bnQgdG8gMTAwIGF0IG1heGltdW1cIiwgLT5cbiAgICAgIGl0IFwiaW5zZXJ0IDEwMCB0aW1lcyBhdCBtYXhpbXVtIGV2ZW4gaWYgYmlnIGNvdW50IHdhcyBnaXZlblwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJydcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkpLnRvQmUoMClcbiAgICAgICAgZW5zdXJlICc1IDUgNSA1IDUgNSA1IGknLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFcXG5cIilcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSkudG9CZSgxMDEpXG4iXX0=
