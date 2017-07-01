(function() {
  var Point, TextData, dispatch, getView, getVimState, ref, settings;

  Point = require('atom').Point;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Motion general", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    describe("simple motions", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = new TextData("12345\nabcd\nABCDE\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      describe("the h keybinding", function() {
        describe("as a motion", function() {
          it("moves the cursor left, but not to the previous line", function() {
            ensure('h', {
              cursor: [1, 0]
            });
            return ensure('h', {
              cursor: [1, 0]
            });
          });
          return it("moves the cursor to the previous line if wrapLeftRightMotion is true", function() {
            settings.set('wrapLeftRightMotion', true);
            return ensure('h h', {
              cursor: [0, 4]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects the character to the left", function() {
            return ensure('y h', {
              cursor: [1, 0],
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
      });
      describe("the j keybinding", function() {
        it("moves the cursor down, but not to the end of the last line", function() {
          ensure('j', {
            cursor: [2, 1]
          });
          return ensure('j', {
            cursor: [2, 1]
          });
        });
        it("moves the cursor to the end of the line, not past it", function() {
          set({
            cursor: [0, 4]
          });
          return ensure('j', {
            cursor: [1, 3]
          });
        });
        it("remembers the column it was in after moving to shorter line", function() {
          set({
            cursor: [0, 4]
          });
          ensure('j', {
            cursor: [1, 3]
          });
          return ensure('j', {
            cursor: [2, 4]
          });
        });
        it("never go past last newline", function() {
          return ensure('1 0 j', {
            cursor: [2, 1]
          });
        });
        return describe("when visual mode", function() {
          beforeEach(function() {
            return ensure('v', {
              cursor: [1, 2],
              selectedText: 'b'
            });
          });
          it("moves the cursor down", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("doesn't go over after the last line", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("keep same column(goalColumn) even after across the empty line", function() {
            keystroke('escape');
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [0, 3]
            });
            ensure('v', {
              cursor: [0, 4]
            });
            return ensure('j j', {
              cursor: [2, 4],
              selectedText: "defg\n\nabcd"
            });
          });
          return it("original visual line remains when jk across orignal selection", function() {
            text = new TextData("line0\nline1\nline2\n");
            set({
              text: text.getRaw(),
              cursor: [1, 1]
            });
            ensure('V', {
              selectedText: text.getLines([1])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([1])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([1])
            });
            return ensure('j', {
              selectedText: text.getLines([1, 2])
            });
          });
        });
      });
      describe("move-down-wrap, move-up-wrap", function() {
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'k': 'vim-mode-plus:move-up-wrap',
              'j': 'vim-mode-plus:move-down-wrap'
            }
          });
          return set({
            text: "hello\nhello\nhello\nhello\n"
          });
        });
        describe('move-down-wrap', function() {
          beforeEach(function() {
            return set({
              cursor: [3, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('j', {
              cursor: [0, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('2 j', {
              cursor: [1, 1]
            });
          });
          return it("move down with wrawp", function() {
            return ensure('4 j', {
              cursor: [3, 1]
            });
          });
        });
        return describe('move-up-wrap', function() {
          beforeEach(function() {
            return set({
              cursor: [0, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('k', {
              cursor: [3, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('2 k', {
              cursor: [2, 1]
            });
          });
          return it("move down with wrawp", function() {
            return ensure('4 k', {
              cursor: [0, 1]
            });
          });
        });
      });
      xdescribe("with big count was given", function() {
        var BIG_NUMBER, ensureBigCountMotion;
        BIG_NUMBER = Number.MAX_SAFE_INTEGER;
        ensureBigCountMotion = function(keystrokes, options) {
          var count;
          count = String(BIG_NUMBER).split('').join(' ');
          keystrokes = keystrokes.split('').join(' ');
          return ensure(count + " " + keystrokes, options);
        };
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g {': 'vim-mode-plus:move-to-previous-fold-start',
              'g }': 'vim-mode-plus:move-to-next-fold-start',
              ', N': 'vim-mode-plus:move-to-previous-number',
              ', n': 'vim-mode-plus:move-to-next-number'
            }
          });
          return set({
            text: "0000\n1111\n2222\n",
            cursor: [1, 2]
          });
        });
        it("by `j`", function() {
          return ensureBigCountMotion('j', {
            cursor: [2, 2]
          });
        });
        it("by `k`", function() {
          return ensureBigCountMotion('k', {
            cursor: [0, 2]
          });
        });
        it("by `h`", function() {
          return ensureBigCountMotion('h', {
            cursor: [1, 0]
          });
        });
        it("by `l`", function() {
          return ensureBigCountMotion('l', {
            cursor: [1, 3]
          });
        });
        it("by `[`", function() {
          return ensureBigCountMotion('[', {
            cursor: [0, 2]
          });
        });
        it("by `]`", function() {
          return ensureBigCountMotion(']', {
            cursor: [2, 2]
          });
        });
        it("by `w`", function() {
          return ensureBigCountMotion('w', {
            cursor: [2, 3]
          });
        });
        it("by `W`", function() {
          return ensureBigCountMotion('W', {
            cursor: [2, 3]
          });
        });
        it("by `b`", function() {
          return ensureBigCountMotion('b', {
            cursor: [0, 0]
          });
        });
        it("by `B`", function() {
          return ensureBigCountMotion('B', {
            cursor: [0, 0]
          });
        });
        it("by `e`", function() {
          return ensureBigCountMotion('e', {
            cursor: [2, 3]
          });
        });
        it("by `(`", function() {
          return ensureBigCountMotion('(', {
            cursor: [0, 0]
          });
        });
        it("by `)`", function() {
          return ensureBigCountMotion(')', {
            cursor: [2, 3]
          });
        });
        it("by `{`", function() {
          return ensureBigCountMotion('{', {
            cursor: [0, 0]
          });
        });
        it("by `}`", function() {
          return ensureBigCountMotion('}', {
            cursor: [2, 3]
          });
        });
        it("by `-`", function() {
          return ensureBigCountMotion('-', {
            cursor: [0, 0]
          });
        });
        it("by `_`", function() {
          return ensureBigCountMotion('_', {
            cursor: [2, 0]
          });
        });
        it("by `g {`", function() {
          return ensureBigCountMotion('g {', {
            cursor: [1, 2]
          });
        });
        it("by `g }`", function() {
          return ensureBigCountMotion('g }', {
            cursor: [1, 2]
          });
        });
        it("by `, N`", function() {
          return ensureBigCountMotion(', N', {
            cursor: [1, 2]
          });
        });
        return it("by `, n`", function() {
          return ensureBigCountMotion(', n', {
            cursor: [1, 2]
          });
        });
      });
      describe("the k keybinding", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 1]
          });
        });
        it("moves the cursor up", function() {
          return ensure('k', {
            cursor: [1, 1]
          });
        });
        it("moves the cursor up and remember column it was in", function() {
          set({
            cursor: [2, 4]
          });
          ensure('k', {
            cursor: [1, 3]
          });
          return ensure('k', {
            cursor: [0, 4]
          });
        });
        it("moves the cursor up, but not to the beginning of the first line", function() {
          return ensure('1 0 k', {
            cursor: [0, 1]
          });
        });
        return describe("when visual mode", function() {
          return it("keep same column(goalColumn) even after across the empty line", function() {
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [2, 3]
            });
            ensure('v', {
              cursor: [2, 4],
              selectedText: 'd'
            });
            return ensure('k k', {
              cursor: [0, 3],
              selectedText: "defg\n\nabcd"
            });
          });
        });
      });
      describe("gj gk in softwrap", function() {
        text = [][0];
        beforeEach(function() {
          editor.setSoftWrapped(true);
          editor.setEditorWidthInChars(10);
          editor.setDefaultCharWidth(1);
          text = new TextData("1st line of buffer\n2nd line of buffer, Very long line\n3rd line of buffer\n\n5th line of buffer\n");
          return set({
            text: text.getRaw(),
            cursor: [0, 0]
          });
        });
        describe("selection is not reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('g j', {
              cursorScreen: [1, 0],
              cursor: [0, 9]
            });
            ensure('g j', {
              cursorScreen: [2, 0],
              cursor: [1, 0]
            });
            ensure('g j', {
              cursorScreen: [3, 0],
              cursor: [1, 9]
            });
            return ensure('g j', {
              cursorScreen: [4, 0],
              cursor: [1, 12]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            ensure('V', {
              selectedText: text.getLines([0])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('k', {
              selectedText: text.getLines([0])
            });
            return ensure('k', {
              selectedText: text.getLines([0])
            });
          });
        });
        return describe("selection is reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('g j', {
              cursorScreen: [1, 0],
              cursor: [0, 9]
            });
            ensure('g j', {
              cursorScreen: [2, 0],
              cursor: [1, 0]
            });
            ensure('g j', {
              cursorScreen: [3, 0],
              cursor: [1, 9]
            });
            return ensure('g j', {
              cursorScreen: [4, 0],
              cursor: [1, 12]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            set({
              cursor: [4, 0]
            });
            ensure('V', {
              selectedText: text.getLines([4])
            });
            ensure('k', {
              selectedText: text.getLines([3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([4])
            });
            return ensure('j', {
              selectedText: text.getLines([4])
            });
          });
        });
      });
      describe("the l keybinding", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 2]
          });
        });
        it("moves the cursor right, but not to the next line", function() {
          ensure('l', {
            cursor: [1, 3]
          });
          return ensure('l', {
            cursor: [1, 3]
          });
        });
        it("moves the cursor to the next line if wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('l l', {
            cursor: [2, 0]
          });
        });
        return describe("on a blank line", function() {
          return it("doesn't move the cursor", function() {
            set({
              text: "\n\n\n",
              cursor: [1, 0]
            });
            return ensure('l', {
              cursor: [1, 0]
            });
          });
        });
      });
      return describe("move-(up/down)-to-edge", function() {
        text = null;
        beforeEach(function() {
          text = new TextData("0:  4 67  01234567890123456789\n1:         1234567890123456789\n2:    6 890         0123456789\n3:    6 890         0123456789\n4:   56 890         0123456789\n5:                  0123456789\n6:                  0123456789\n7:  4 67            0123456789\n");
          return set({
            text: text.getRaw(),
            cursor: [4, 3]
          });
        });
        describe("edgeness of first-line and last-line", function() {
          beforeEach(function() {
            return set({
              text_: "____this is line 0\n____this is text of line 1\n____this is text of line 2\n______hello line 3\n______hello line 4",
              cursor: [2, 2]
            });
          });
          describe("when column is leading spaces", function() {
            return it("doesn't move cursor", function() {
              ensure('[', {
                cursor: [2, 2]
              });
              return ensure(']', {
                cursor: [2, 2]
              });
            });
          });
          return describe("when column is trailing spaces", function() {
            return it("doesn't move cursor", function() {
              set({
                cursor: [1, 20]
              });
              ensure(']', {
                cursor: [2, 20]
              });
              ensure(']', {
                cursor: [2, 20]
              });
              ensure('[', {
                cursor: [1, 20]
              });
              return ensure('[', {
                cursor: [1, 20]
              });
            });
          });
        });
        it("move to non-blank-char on both first and last row", function() {
          set({
            cursor: [4, 4]
          });
          ensure('[', {
            cursor: [0, 4]
          });
          return ensure(']', {
            cursor: [7, 4]
          });
        });
        it("move to white space char when both side column is non-blank char", function() {
          set({
            cursor: [4, 5]
          });
          ensure('[', {
            cursor: [0, 5]
          });
          ensure(']', {
            cursor: [4, 5]
          });
          return ensure(']', {
            cursor: [7, 5]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-1", function() {
          set({
            cursor: [4, 6]
          });
          ensure('[', {
            cursor: [2, 6]
          });
          ensure('[', {
            cursor: [0, 6]
          });
          ensure(']', {
            cursor: [2, 6]
          });
          ensure(']', {
            cursor: [4, 6]
          });
          return ensure(']', {
            cursor: [7, 6]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-2", function() {
          set({
            cursor: [4, 7]
          });
          ensure('[', {
            cursor: [2, 7]
          });
          ensure('[', {
            cursor: [0, 7]
          });
          ensure(']', {
            cursor: [2, 7]
          });
          ensure(']', {
            cursor: [4, 7]
          });
          return ensure(']', {
            cursor: [7, 7]
          });
        });
        it("support count", function() {
          set({
            cursor: [4, 6]
          });
          ensure('2 [', {
            cursor: [0, 6]
          });
          return ensure('3 ]', {
            cursor: [7, 6]
          });
        });
        return describe('editor for hardTab', function() {
          var pack;
          pack = 'language-go';
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage(pack);
            });
            getVimState('sample.go', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
            });
            return runs(function() {
              set({
                cursorScreen: [8, 2]
              });
              return ensure({
                cursor: [8, 1]
              });
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage(pack);
          });
          return it("move up/down to next edge of same *screen* column", function() {
            ensure('[', {
              cursorScreen: [5, 2]
            });
            ensure('[', {
              cursorScreen: [3, 2]
            });
            ensure('[', {
              cursorScreen: [2, 2]
            });
            ensure('[', {
              cursorScreen: [0, 2]
            });
            ensure(']', {
              cursorScreen: [2, 2]
            });
            ensure(']', {
              cursorScreen: [3, 2]
            });
            ensure(']', {
              cursorScreen: [5, 2]
            });
            ensure(']', {
              cursorScreen: [9, 2]
            });
            ensure(']', {
              cursorScreen: [11, 2]
            });
            ensure(']', {
              cursorScreen: [14, 2]
            });
            ensure(']', {
              cursorScreen: [17, 2]
            });
            ensure('[', {
              cursorScreen: [14, 2]
            });
            ensure('[', {
              cursorScreen: [11, 2]
            });
            ensure('[', {
              cursorScreen: [9, 2]
            });
            ensure('[', {
              cursorScreen: [5, 2]
            });
            ensure('[', {
              cursorScreen: [3, 2]
            });
            ensure('[', {
              cursorScreen: [2, 2]
            });
            return ensure('[', {
              cursorScreen: [0, 2]
            });
          });
        });
      });
    });
    describe('moveSuccessOnLinewise behaviral characteristic', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        settings.set('useClipboardAsDefaultRegister', false);
        set({
          text: "000\n111\n222\n"
        });
        originalText = editor.getText();
        return ensure({
          register: {
            '"': {
              text: void 0
            }
          }
        });
      });
      describe("moveSuccessOnLinewise=false motion", function() {
        describe("when it can move", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 0]
            });
          });
          it("delete by j", function() {
            return ensure("d j", {
              text: "000\n",
              mode: 'normal'
            });
          });
          it("yank by j", function() {
            return ensure("y j", {
              text: originalText,
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'normal'
            });
          });
          it("change by j", function() {
            return ensure("c j", {
              textC: "000\n|\n",
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'insert'
            });
          });
          it("delete by k", function() {
            return ensure("d k", {
              text: "222\n",
              mode: 'normal'
            });
          });
          it("yank by k", function() {
            return ensure("y k", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by k", function() {
            return ensure("c k", {
              textC: "|\n222\n",
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        describe("when it can not move-up", function() {
          beforeEach(function() {
            return set({
              cursor: [0, 0]
            });
          });
          it("delete by dk", function() {
            return ensure("d k", {
              text: originalText,
              mode: 'normal'
            });
          });
          it("yank by yk", function() {
            return ensure("y k", {
              text: originalText,
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
          return it("change by ck", function() {
            return ensure("c k", {
              textC: "|000\n111\n222\n",
              register: {
                '"': {
                  text: "\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        return describe("when it can not move-down", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          it("delete by dj", function() {
            return ensure("d j", {
              text: originalText,
              mode: 'normal'
            });
          });
          it("yank by yj", function() {
            return ensure("y j", {
              text: originalText,
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
          return it("change by cj", function() {
            return ensure("c j", {
              textC: "000\n111\n|222\n",
              register: {
                '"': {
                  text: "\n"
                }
              },
              mode: 'insert'
            });
          });
        });
      });
      return describe("moveSuccessOnLinewise=true motion", function() {
        describe("when it can move", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 0]
            });
          });
          it("delete by G", function() {
            return ensure("d G", {
              text: "000\n",
              mode: 'normal'
            });
          });
          it("yank by G", function() {
            return ensure("y G", {
              text: originalText,
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'normal'
            });
          });
          it("change by G", function() {
            return ensure("c G", {
              textC: "000\n|\n",
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'insert'
            });
          });
          it("delete by gg", function() {
            return ensure("d g g", {
              text: "222\n",
              mode: 'normal'
            });
          });
          it("yank by gg", function() {
            return ensure("y g g", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by gg", function() {
            return ensure("c g g", {
              textC: "|\n222\n",
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        describe("when it can not move-up", function() {
          beforeEach(function() {
            return set({
              cursor: [0, 0]
            });
          });
          it("delete by gg", function() {
            return ensure("d g g", {
              text: "111\n222\n",
              mode: 'normal'
            });
          });
          it("yank by gg", function() {
            return ensure("y g g", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by gg", function() {
            return ensure("c g g", {
              textC: "|\n111\n222\n",
              register: {
                '"': {
                  text: "000\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        return describe("when it can not move-down", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          it("delete by G", function() {
            return ensure("d G", {
              text: "000\n111\n",
              mode: 'normal'
            });
          });
          it("yank by G", function() {
            return ensure("y G", {
              text: originalText,
              register: {
                '"': {
                  text: "222\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by G", function() {
            return ensure("c G", {
              textC: "000\n111\n|\n",
              register: {
                '"': {
                  text: "222\n"
                }
              },
              mode: 'insert'
            });
          });
        });
      });
    });
    describe("the w keybinding", function() {
      var baseText;
      baseText = "ab cde1+-\n xyz\n\nzip";
      beforeEach(function() {
        return set({
          text: baseText
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the beginning of the next word", function() {
          ensure('w', {
            cursor: [0, 3]
          });
          ensure('w', {
            cursor: [0, 7]
          });
          ensure('w', {
            cursor: [1, 1]
          });
          ensure('w', {
            cursor: [2, 0]
          });
          ensure('w', {
            cursor: [3, 0]
          });
          ensure('w', {
            cursor: [3, 2]
          });
          return ensure('w', {
            cursor: [3, 2]
          });
        });
        it("moves the cursor to the end of the word if last word in file", function() {
          set({
            text: 'abc',
            cursor: [0, 0]
          });
          return ensure('w', {
            cursor: [0, 2]
          });
        });
        it("move to next word by skipping trailing white spaces", function() {
          set({
            textC_: "012|___\n  234"
          });
          return ensure('w', {
            textC_: "012___\n  |234"
          });
        });
        it("move to next word from EOL", function() {
          set({
            textC_: "|\n__234\""
          });
          return ensure('w', {
            textC_: "\n__|234\""
          });
        });
        return describe("for CRLF buffer", function() {
          beforeEach(function() {
            return set({
              text: baseText.replace(/\n/g, "\r\n")
            });
          });
          return describe("as a motion", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 0]
              });
            });
            return it("moves the cursor to the beginning of the next word", function() {
              ensure('w', {
                cursor: [0, 3]
              });
              ensure('w', {
                cursor: [0, 7]
              });
              ensure('w', {
                cursor: [1, 1]
              });
              ensure('w', {
                cursor: [2, 0]
              });
              ensure('w', {
                cursor: [3, 0]
              });
              ensure('w', {
                cursor: [3, 2]
              });
              return ensure('w', {
                cursor: [3, 2]
              });
            });
          });
        });
      });
      describe("when used by Change operator", function() {
        beforeEach(function() {
          return set({
            text_: "__var1 = 1\n__var2 = 2\n"
          });
        });
        describe("when cursor is on word", function() {
          return it("not eat whitespace", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('c w', {
              text_: "__v = 1\n__var2 = 2\n",
              cursor: [0, 3]
            });
          });
        });
        describe("when cursor is on white space", function() {
          return it("only eat white space", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('c w', {
              text_: "var1 = 1\n__var2 = 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("when text to EOL is all white space", function() {
          it("wont eat new line character", function() {
            set({
              text_: "abc__\ndef\n",
              cursor: [0, 3]
            });
            return ensure('c w', {
              text: "abc\ndef\n",
              cursor: [0, 3]
            });
          });
          return it("cant eat new line when count is specified", function() {
            set({
              text: "\n\n\n\n\nline6\n",
              cursor: [0, 0]
            });
            return ensure('5 c w', {
              text: "\nline6\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y w', {
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects the whitespace", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y w', {
              register: {
                '"': {
                  text: ' '
                }
              }
            });
          });
        });
      });
    });
    describe("the W keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab \n xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the beginning of the next word", function() {
          ensure('W', {
            cursor: [0, 7]
          });
          ensure('W', {
            cursor: [1, 1]
          });
          ensure('W', {
            cursor: [2, 0]
          });
          return ensure('W', {
            cursor: [3, 0]
          });
        });
        it("moves the cursor to beginning of the next word of next line when all remaining text is white space.", function() {
          set({
            text_: "012___\n__234",
            cursor: [0, 3]
          });
          return ensure('W', {
            cursor: [1, 2]
          });
        });
        return it("moves the cursor to beginning of the next word of next line when cursor is at EOL.", function() {
          set({
            text_: "\n__234",
            cursor: [0, 0]
          });
          return ensure('W', {
            cursor: [1, 2]
          });
        });
      });
      describe("when used by Change operator", function() {
        beforeEach(function() {
          return set({
            text_: "__var1 = 1\n__var2 = 2\n"
          });
        });
        describe("when cursor is on word", function() {
          return it("not eat whitespace", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('c W', {
              text_: "__v = 1\n__var2 = 2\n",
              cursor: [0, 3]
            });
          });
        });
        describe("when cursor is on white space", function() {
          return it("only eat white space", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('c W', {
              text_: "var1 = 1\n__var2 = 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("when text to EOL is all white space", function() {
          it("wont eat new line character", function() {
            set({
              text: "abc  \ndef\n",
              cursor: [0, 3]
            });
            return ensure('c W', {
              text: "abc\ndef\n",
              cursor: [0, 3]
            });
          });
          return it("cant eat new line when count is specified", function() {
            set({
              text: "\n\n\n\n\nline6\n",
              cursor: [0, 0]
            });
            return ensure('5 c W', {
              text: "\nline6\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the whole word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y W', {
              register: {
                '"': {
                  text: 'cde1+- '
                }
              }
            });
          });
        });
        it("continues past blank lines", function() {
          set({
            cursor: [2, 0]
          });
          return ensure('d W', {
            text_: "cde1+- ab_\n_xyz\nzip",
            register: {
              '"': {
                text: "\n"
              }
            }
          });
        });
        return it("doesn't go past the end of the file", function() {
          set({
            cursor: [3, 0]
          });
          return ensure('d W', {
            text_: "cde1+- ab_\n_xyz\n\n",
            register: {
              '"': {
                text: 'zip'
              }
            }
          });
        });
      });
    });
    describe("the e keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "ab cde1+-_\n_xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the end of the current word", function() {
          ensure('e', {
            cursor: [0, 1]
          });
          ensure('e', {
            cursor: [0, 6]
          });
          ensure('e', {
            cursor: [0, 8]
          });
          ensure('e', {
            cursor: [1, 3]
          });
          return ensure('e', {
            cursor: [3, 2]
          });
        });
        return it("skips whitespace until EOF", function() {
          set({
            text: "012\n\n\n012\n\n",
            cursor: [0, 0]
          });
          ensure('e', {
            cursor: [0, 2]
          });
          ensure('e', {
            cursor: [3, 2]
          });
          return ensure('e', {
            cursor: [4, 0]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y e', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y e', {
              register: {
                '"': {
                  text: ' cde1'
                }
              }
            });
          });
        });
      });
    });
    describe("the ge keybinding", function() {
      describe("as a motion", function() {
        it("moves the cursor to the end of the previous word", function() {
          set({
            text: "1234 5678 wordword"
          });
          set({
            cursor: [0, 16]
          });
          ensure('g e', {
            cursor: [0, 8]
          });
          ensure('g e', {
            cursor: [0, 3]
          });
          ensure('g e', {
            cursor: [0, 0]
          });
          return ensure('g e', {
            cursor: [0, 0]
          });
        });
        it("moves corrently when starting between words", function() {
          set({
            text: "1 leading     end"
          });
          set({
            cursor: [0, 12]
          });
          return ensure('g e', {
            cursor: [0, 8]
          });
        });
        it("takes a count", function() {
          set({
            text: "vim mode plus is getting there"
          });
          set({
            cursor: [0, 28]
          });
          return ensure('5 g e', {
            cursor: [0, 2]
          });
        });
        xit("handles non-words inside words like vim", function() {
          set({
            text: "1234 5678 word-word"
          });
          set({
            cursor: [0, 18]
          });
          ensure('g e', {
            cursor: [0, 14]
          });
          ensure('g e', {
            cursor: [0, 13]
          });
          return ensure('g e', {
            cursor: [0, 8]
          });
        });
        return xit("handles newlines like vim", function() {
          set({
            text: "1234\n\n\n\n5678"
          });
          set({
            cursor: [5, 2]
          });
          ensure('g e', {
            cursor: [4, 0]
          });
          ensure('g e', {
            cursor: [3, 0]
          });
          ensure('g e', {
            cursor: [2, 0]
          });
          ensure('g e', {
            cursor: [1, 0]
          });
          ensure('g e', {
            cursor: [1, 0]
          });
          ensure('g e', {
            cursor: [0, 3]
          });
          return ensure('g e', {
            cursor: [0, 0]
          });
        });
      });
      describe("when used by Change operator", function() {
        it("changes word fragments", function() {
          set({
            text: "cet document"
          });
          set({
            cursor: [0, 7]
          });
          return ensure('c g e', {
            cursor: [0, 2],
            text: "cement",
            mode: 'insert'
          });
        });
        return it("changes whitespace properly", function() {
          set({
            text: "ce    doc"
          });
          set({
            cursor: [0, 4]
          });
          return ensure('c g e', {
            cursor: [0, 1],
            text: "c doc",
            mode: 'insert'
          });
        });
      });
      return describe("in characterwise visual mode", function() {
        return it("selects word fragments", function() {
          set({
            text: "cet document"
          });
          set({
            cursor: [0, 7]
          });
          return ensure('v g e', {
            cursor: [0, 2],
            selectedText: "t docu"
          });
        });
      });
    });
    describe("the E keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "ab  cde1+-_\n_xyz_\n\nzip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("moves the cursor to the end of the current word", function() {
          ensure('E', {
            cursor: [0, 1]
          });
          ensure('E', {
            cursor: [0, 9]
          });
          ensure('E', {
            cursor: [1, 3]
          });
          ensure('E', {
            cursor: [3, 2]
          });
          return ensure('E', {
            cursor: [3, 2]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y E', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y E', {
              register: {
                '"': {
                  text: '  cde1+-'
                }
              }
            });
          });
        });
        return describe("press more than once", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('v E E y', {
              register: {
                '"': {
                  text: 'ab  cde1+-'
                }
              }
            });
          });
        });
      });
    });
    describe("the gE keybinding", function() {
      return describe("as a motion", function() {
        return it("moves the cursor to the end of the previous word", function() {
          set({
            text: "12.4 5~7- word-word"
          });
          set({
            cursor: [0, 16]
          });
          ensure('g E', {
            cursor: [0, 8]
          });
          ensure('g E', {
            cursor: [0, 3]
          });
          ensure('g E', {
            cursor: [0, 0]
          });
          return ensure('g E', {
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the (,) sentence keybinding", function() {
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "sentence one.])'\"    sen.tence .two.\nhere.  sentence three\nmore three\n\n   sentence four\n\n\nsentence five.\nmore five\nmore six\n\n last sentence\nall done seven"
          });
        });
        it("moves the cursor to the end of the sentence", function() {
          ensure(')', {
            cursor: [0, 21]
          });
          ensure(')', {
            cursor: [1, 0]
          });
          ensure(')', {
            cursor: [1, 7]
          });
          ensure(')', {
            cursor: [3, 0]
          });
          ensure(')', {
            cursor: [4, 3]
          });
          ensure(')', {
            cursor: [5, 0]
          });
          ensure(')', {
            cursor: [7, 0]
          });
          ensure(')', {
            cursor: [8, 0]
          });
          ensure(')', {
            cursor: [10, 0]
          });
          ensure(')', {
            cursor: [11, 1]
          });
          ensure(')', {
            cursor: [12, 13]
          });
          ensure(')', {
            cursor: [12, 13]
          });
          ensure('(', {
            cursor: [11, 1]
          });
          ensure('(', {
            cursor: [10, 0]
          });
          ensure('(', {
            cursor: [8, 0]
          });
          ensure('(', {
            cursor: [7, 0]
          });
          ensure('(', {
            cursor: [6, 0]
          });
          ensure('(', {
            cursor: [4, 3]
          });
          ensure('(', {
            cursor: [3, 0]
          });
          ensure('(', {
            cursor: [1, 7]
          });
          ensure('(', {
            cursor: [1, 0]
          });
          ensure('(', {
            cursor: [0, 21]
          });
          ensure('(', {
            cursor: [0, 0]
          });
          return ensure('(', {
            cursor: [0, 0]
          });
        });
        it("skips to beginning of sentence", function() {
          set({
            cursor: [4, 15]
          });
          return ensure('(', {
            cursor: [4, 3]
          });
        });
        it("supports a count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 )', {
            cursor: [1, 7]
          });
          return ensure('3 (', {
            cursor: [0, 0]
          });
        });
        it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('2 0 )', {
            cursor: [12, 13]
          });
          return ensure('2 0 (', {
            cursor: [0, 0]
          });
        });
        return describe("sentence motion with skip-blank-row", function() {
          beforeEach(function() {
            return atom.keymaps.add("test", {
              'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
                'g )': 'vim-mode-plus:move-to-next-sentence-skip-blank-row',
                'g (': 'vim-mode-plus:move-to-previous-sentence-skip-blank-row'
              }
            });
          });
          return it("moves the cursor to the end of the sentence", function() {
            ensure('g )', {
              cursor: [0, 21]
            });
            ensure('g )', {
              cursor: [1, 0]
            });
            ensure('g )', {
              cursor: [1, 7]
            });
            ensure('g )', {
              cursor: [4, 3]
            });
            ensure('g )', {
              cursor: [7, 0]
            });
            ensure('g )', {
              cursor: [8, 0]
            });
            ensure('g )', {
              cursor: [11, 1]
            });
            ensure('g )', {
              cursor: [12, 13]
            });
            ensure('g )', {
              cursor: [12, 13]
            });
            ensure('g (', {
              cursor: [11, 1]
            });
            ensure('g (', {
              cursor: [8, 0]
            });
            ensure('g (', {
              cursor: [7, 0]
            });
            ensure('g (', {
              cursor: [4, 3]
            });
            ensure('g (', {
              cursor: [1, 7]
            });
            ensure('g (', {
              cursor: [1, 0]
            });
            ensure('g (', {
              cursor: [0, 21]
            });
            ensure('g (', {
              cursor: [0, 0]
            });
            return ensure('g (', {
              cursor: [0, 0]
            });
          });
        });
      });
      describe("moving inside a blank document", function() {
        beforeEach(function() {
          return set({
            text_: "_____\n_____"
          });
        });
        return it("moves without crashing", function() {
          set({
            cursor: [0, 0]
          });
          ensure(')', {
            cursor: [1, 4]
          });
          ensure(')', {
            cursor: [1, 4]
          });
          ensure('(', {
            cursor: [0, 0]
          });
          return ensure('(', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          return set({
            text: "sentence one. sentence two.\n  sentence three."
          });
        });
        it('selects to the end of the current sentence', function() {
          set({
            cursor: [0, 20]
          });
          return ensure('y )', {
            register: {
              '"': {
                text: "ce two.\n  "
              }
            }
          });
        });
        return it('selects to the beginning of the current sentence', function() {
          set({
            cursor: [0, 20]
          });
          return ensure('y (', {
            register: {
              '"': {
                text: "senten"
              }
            }
          });
        });
      });
    });
    describe("the {,} keybinding", function() {
      beforeEach(function() {
        return set({
          text: "\n\n\n3: paragraph-1\n4: paragraph-1\n\n\n\n8: paragraph-2\n\n\n\n12: paragraph-3\n13: paragraph-3\n\n\n16: paragprah-4\n",
          cursor: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the paragraph", function() {
          set({
            cursor: [0, 0]
          });
          ensure('}', {
            cursor: [5, 0]
          });
          ensure('}', {
            cursor: [9, 0]
          });
          ensure('}', {
            cursor: [14, 0]
          });
          ensure('{', {
            cursor: [11, 0]
          });
          ensure('{', {
            cursor: [7, 0]
          });
          return ensure('{', {
            cursor: [2, 0]
          });
        });
        it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 }', {
            cursor: [14, 0]
          });
          return ensure('3 {', {
            cursor: [2, 0]
          });
        });
        return it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('1 0 }', {
            cursor: [16, 14]
          });
          return ensure('1 0 {', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it('selects to the end of the current paragraph', function() {
          set({
            cursor: [3, 3]
          });
          return ensure('y }', {
            register: {
              '"': {
                text: "paragraph-1\n4: paragraph-1\n"
              }
            }
          });
        });
        return it('selects to the end of the current paragraph', function() {
          set({
            cursor: [4, 3]
          });
          return ensure('y {', {
            register: {
              '"': {
                text: "\n3: paragraph-1\n4: "
              }
            }
          });
        });
      });
    });
    describe("the b keybinding", function() {
      beforeEach(function() {
        return set({
          text: " ab cde1+- \n xyz\n\nzip }\n last"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [4, 1]
          });
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('b', {
            cursor: [3, 4]
          });
          ensure('b', {
            cursor: [3, 0]
          });
          ensure('b', {
            cursor: [2, 0]
          });
          ensure('b', {
            cursor: [1, 1]
          });
          ensure('b', {
            cursor: [0, 8]
          });
          ensure('b', {
            cursor: [0, 4]
          });
          ensure('b', {
            cursor: [0, 1]
          });
          ensure('b', {
            cursor: [0, 0]
          });
          return ensure('b', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the beginning of the current word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y b', {
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the beginning of the last word", function() {
            set({
              cursor: [0, 4]
            });
            return ensure('y b', {
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
      });
    });
    describe("the B keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab\n\t xyz-123\n\n zip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [4, 0]
          });
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('B', {
            cursor: [3, 1]
          });
          ensure('B', {
            cursor: [2, 0]
          });
          ensure('B', {
            cursor: [1, 2]
          });
          ensure('B', {
            cursor: [0, 7]
          });
          return ensure('B', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it("selects to the beginning of the whole word", function() {
          set({
            cursor: [1, 8]
          });
          return ensure('y B', {
            register: {
              '"': {
                text: 'xyz-12'
              }
            }
          });
        });
        return it("doesn't go past the beginning of the file", function() {
          set({
            cursor: [0, 0],
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
          return ensure('y B', {
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
        });
      });
    });
    describe("the ^ keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "|  abcde"
        });
      });
      describe("from the beginning of the line", function() {
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          it('selects to the first character of the line', function() {
            return ensure('d ^', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
          return it('selects to the first character of the line', function() {
            return ensure('d I', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
        });
      });
      describe("from the first character of the line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("stays put", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("does nothing", function() {
            return ensure('d ^', {
              text: '  abcde',
              cursor: [0, 2]
            });
          });
        });
      });
      return describe("from the middle of a word", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 4]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          it('selects to the first character of the line', function() {
            return ensure('d ^', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
          return it('selects to the first character of the line', function() {
            return ensure('d I', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde",
          cursor: [0, 4]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the first column", function() {
          return ensure('0', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        return it('selects to the first column of the line', function() {
          return ensure('d 0', {
            text: 'cde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the | keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde",
          cursor: [0, 4]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the number column", function() {
          ensure('|', {
            cursor: [0, 0]
          });
          ensure('1 |', {
            cursor: [0, 0]
          });
          ensure('3 |', {
            cursor: [0, 2]
          });
          return ensure('4 |', {
            cursor: [0, 3]
          });
        });
      });
      return describe("as operator's target", function() {
        return it('behave exclusively', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('d 4 |', {
            text: 'bcde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the $ keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde\n\n1234567890",
          cursor: [0, 4]
        });
      });
      describe("as a motion from empty line", function() {
        return it("moves the cursor to the end of the line", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('$', {
            cursor: [1, 0]
          });
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the line", function() {
          return ensure('$', {
            cursor: [0, 6]
          });
        });
        it("set goalColumn Infinity", function() {
          expect(editor.getLastCursor().goalColumn).toBe(null);
          ensure('$', {
            cursor: [0, 6]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(2e308);
        });
        it("should remain in the last column when moving down", function() {
          ensure('$ j', {
            cursor: [1, 0]
          });
          return ensure('j', {
            cursor: [2, 9]
          });
        });
        return it("support count", function() {
          return ensure('3 $', {
            cursor: [2, 9]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the end of the lines", function() {
          return ensure('d $', {
            text: "  ab\n\n1234567890",
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  a\n",
          cursor: [0, 2]
        });
      });
      return describe("as a motion", function() {
        return it("moves the cursor to the beginning of the line", function() {
          return ensure('0', {
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the - keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abcdefg\n  abc\n  abc\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the last character of the previous line", function() {
            return ensure('-', {
              cursor: [0, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and previous line", function() {
            return ensure('d -', {
              text: "  abc\n",
              cursor: [0, 2]
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the previous one", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the previous line (directly above)", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line (directly above)", function() {
            return ensure('d -', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line preceded by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the previous line", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line", function() {
            return ensure('d -', {
              text: "abcdefg\n"
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [4, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines previous", function() {
            return ensure('3 -', {
              cursor: [1, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many previous lines", function() {
            return ensure('d 3 -', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the + keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__abc\n__abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [2, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and next line", function() {
            return ensure('d +', {
              text: "  abc\n"
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the next one", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the next line (directly below)", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line (directly below)", function() {
            return ensure('d +', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line followed by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line", function() {
            return ensure('d +', {
              text: "abcdefg\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3 +', {
              cursor: [4, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d 3 +', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the _ keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__abc\n__abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the current line", function() {
            return ensure('_', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line", function() {
            return ensure('d _', {
              text_: "__abc\nabcdefg\n",
              cursor: [1, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3 _', {
              cursor: [3, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d 3 _', {
              text: "1\n5\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the enter keybinding", function() {
      var startingText;
      startingText = "  abc\n  abc\nabcdefg\n";
      return describe("from the middle of a line", function() {
        var startingCursorPosition;
        startingCursorPosition = [1, 3];
        describe("as a motion", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            keystroke('+');
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure('enter', {
              cursor: referenceCursorPosition
            });
          });
        });
        return describe("as a selection", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition, referenceText;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            keystroke('d +');
            referenceText = editor.getText();
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure('d enter', {
              text: referenceText,
              cursor: referenceCursorPosition
            });
          });
        });
      });
    });
    describe("the gg keybinding", function() {
      beforeEach(function() {
        return set({
          text: " 1abc\n 2\n3\n",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        describe("in normal mode", function() {
          it("moves the cursor to the beginning of the first line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('g g', {
              cursor: [0, 1]
            });
          });
          return it("move to same position if its on first line and first char", function() {
            return ensure('g g', {
              cursor: [0, 1]
            });
          });
        });
        describe("in linewise visual mode", function() {
          return it("selects to the first line in the file", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('V g g', {
              selectedText: " 1abc\n 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("in characterwise visual mode", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 1]
            });
          });
          return it("selects to the first line in the file", function() {
            return ensure('v g g', {
              selectedText: "1abc\n 2",
              cursor: [0, 1]
            });
          });
        });
      });
      return describe("when count specified", function() {
        describe("in normal mode", function() {
          return it("moves the cursor to first char of a specified line", function() {
            return ensure('2 g g', {
              cursor: [1, 1]
            });
          });
        });
        describe("in linewise visual motion", function() {
          return it("selects to a specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('V 2 g g', {
              selectedText: " 2\n3\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("in characterwise visual motion", function() {
          return it("selects to a first character of specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('v 2 g g', {
              selectedText: "2\n3",
              cursor: [1, 1]
            });
          });
        });
      });
    });
    describe("the g_ keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "1__\n    2__\n 3abc\n_"
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the last nonblank character", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('g _', {
            cursor: [1, 4]
          });
        });
        return it("will move the cursor to the beginning of the line if necessary", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('g _', {
            cursor: [0, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor downward and outward", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('2 g _', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects the current line excluding whitespace", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('v 2 g _', {
            selectedText: "  2  \n 3abc"
          });
        });
      });
    });
    describe("the G keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "1\n____2\n_3abc\n_",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the last line after whitespace", function() {
          return ensure('G', {
            cursor: [3, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor to a specified line", function() {
          return ensure('2 G', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the last line in the file", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v G', {
            selectedText: "    2\n 3abc\n ",
            cursor: [3, 1]
          });
        });
      });
    });
    describe("the N% keybinding", function() {
      beforeEach(function() {
        var i, results;
        return set({
          text: (function() {
            results = [];
            for (i = 0; i <= 999; i++){ results.push(i); }
            return results;
          }).apply(this).join("\n"),
          cursor: [0, 0]
        });
      });
      return describe("put cursor on line specified by percent", function() {
        it("50%", function() {
          return ensure('5 0 %', {
            cursor: [499, 0]
          });
        });
        it("30%", function() {
          return ensure('3 0 %', {
            cursor: [299, 0]
          });
        });
        it("100%", function() {
          return ensure('1 0 0 %', {
            cursor: [999, 0]
          });
        });
        return it("120%", function() {
          return ensure('1 2 0 %', {
            cursor: [999, 0]
          });
        });
      });
    });
    describe("the H, M, L keybinding", function() {
      var eel;
      eel = [][0];
      beforeEach(function() {
        eel = editorElement;
        return set({
          text: "  1\n2\n3\n4\n  5\n6\n7\n8\n9\n  10",
          cursor: [8, 0]
        });
      });
      describe("the H keybinding", function() {
        it("moves the cursor to the non-blank-char on first row if visible", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('H', {
            cursor: [0, 2]
          });
        });
        it("moves the cursor to the non-blank-char on first visible row plus scroll offset", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(2);
          return ensure('H', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('4 H', {
            cursor: [3, 0]
          });
        });
      });
      describe("the L keybinding", function() {
        it("moves the cursor to non-blank-char on last row if visible", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('L', {
            cursor: [9, 2]
          });
        });
        it("moves the cursor to the first visible row plus offset", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(7);
          return ensure('L', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('3 L', {
            cursor: [7, 0]
          });
        });
      });
      return describe("the M keybinding", function() {
        beforeEach(function() {
          spyOn(eel, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(10);
        });
        return it("moves the cursor to the non-blank-char of middle of screen", function() {
          return ensure('M', {
            cursor: [4, 2]
          });
        });
      });
    });
    describe("moveToFirstCharacterOnVerticalMotion setting", function() {
      beforeEach(function() {
        settings.set('moveToFirstCharacterOnVerticalMotion', false);
        return set({
          text: "  0 000000000000\n  1 111111111111\n2 222222222222\n",
          cursor: [2, 10]
        });
      });
      describe("gg, G, N%", function() {
        return it("go to row with keep column and respect cursor.goalColum", function() {
          ensure('g g', {
            cursor: [0, 10]
          });
          ensure('$', {
            cursor: [0, 15]
          });
          ensure('G', {
            cursor: [2, 13]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('1 %', {
            cursor: [0, 15]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('1 0 h', {
            cursor: [0, 5]
          });
          ensure('5 0 %', {
            cursor: [1, 5]
          });
          return ensure('1 0 0 %', {
            cursor: [2, 5]
          });
        });
      });
      return describe("H, M, L", function() {
        beforeEach(function() {
          spyOn(editorElement, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(3);
        });
        return it("go to row with keep column and respect cursor.goalColum", function() {
          ensure('H', {
            cursor: [0, 10]
          });
          ensure('M', {
            cursor: [1, 10]
          });
          ensure('L', {
            cursor: [2, 10]
          });
          ensure('$', {
            cursor: [2, 13]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('H', {
            cursor: [0, 15]
          });
          ensure('M', {
            cursor: [1, 15]
          });
          ensure('L', {
            cursor: [2, 13]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(2e308);
        });
      });
    });
    describe('the mark keybindings', function() {
      beforeEach(function() {
        return set({
          text: "  12\n    34\n56\n",
          cursor: [0, 1]
        });
      });
      it('moves to the beginning of the line of a mark', function() {
        set({
          cursor: [1, 1]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure("' a", {
          cursor: [1, 4]
        });
      });
      it('moves literally to a mark', function() {
        set({
          cursor: [1, 2]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure('` a', {
          cursor: [1, 2]
        });
      });
      it('deletes to a mark by line', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure("d ' a", {
          text: '56\n'
        });
      });
      it('deletes before to a mark literally', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [0, 2]
        });
        return ensure('d ` a', {
          text: '  4\n56\n'
        });
      });
      it('deletes after to a mark literally', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [2, 1]
        });
        return ensure('d ` a', {
          text: '  12\n    36\n'
        });
      });
      return it('moves back to previous', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('` `');
        set({
          cursor: [2, 1]
        });
        return ensure('` `', {
          cursor: [1, 5]
        });
      });
    });
    describe("jump command update ` and ' mark", function() {
      var ensureJumpAndBack, ensureJumpAndBackLinewise, ensureMark;
      ensureMark = function(_keystroke, option) {
        keystroke(_keystroke);
        ensure({
          cursor: option.cursor
        });
        ensure({
          mark: {
            "`": option.mark
          }
        });
        return ensure({
          mark: {
            "'": option.mark
          }
        });
      };
      ensureJumpAndBack = function(keystroke, option) {
        var afterMove, initial;
        initial = editor.getCursorBufferPosition();
        ensureMark(keystroke, {
          cursor: option.cursor,
          mark: initial
        });
        afterMove = editor.getCursorBufferPosition();
        expect(initial.isEqual(afterMove)).toBe(false);
        return ensureMark("` `", {
          cursor: initial,
          mark: option.cursor
        });
      };
      ensureJumpAndBackLinewise = function(keystroke, option) {
        var afterMove, initial;
        initial = editor.getCursorBufferPosition();
        expect(initial.column).not.toBe(0);
        ensureMark(keystroke, {
          cursor: option.cursor,
          mark: initial
        });
        afterMove = editor.getCursorBufferPosition();
        expect(initial.isEqual(afterMove)).toBe(false);
        return ensureMark("' '", {
          cursor: [initial.row, 0],
          mark: option.cursor
        });
      };
      beforeEach(function() {
        var i, len, mark, ref2, ref3;
        ref2 = "`'";
        for (i = 0, len = ref2.length; i < len; i++) {
          mark = ref2[i];
          if ((ref3 = vimState.mark.marks[mark]) != null) {
            ref3.destroy();
          }
          vimState.mark.marks[mark] = null;
        }
        return set({
          text: "0: oo 0\n1: 1111\n2: 2222\n3: oo 3\n4: 4444\n5: oo 5",
          cursor: [1, 0]
        });
      });
      describe("initial state", function() {
        return it("return [0, 0]", function() {
          ensure({
            mark: {
              "'": [0, 0]
            }
          });
          return ensure({
            mark: {
              "`": [0, 0]
            }
          });
        });
      });
      return describe("jump motion in normal-mode", function() {
        var initial;
        initial = [3, 3];
        beforeEach(function() {
          jasmine.attachToDOM(getView(atom.workspace));
          ensure({
            mark: {
              "'": [0, 0]
            }
          });
          ensure({
            mark: {
              "`": [0, 0]
            }
          });
          return set({
            cursor: initial
          });
        });
        it("G jump&back", function() {
          return ensureJumpAndBack('G', {
            cursor: [5, 0]
          });
        });
        it("g g jump&back", function() {
          return ensureJumpAndBack("g g", {
            cursor: [0, 0]
          });
        });
        it("100 % jump&back", function() {
          return ensureJumpAndBack("1 0 0 %", {
            cursor: [5, 0]
          });
        });
        it(") jump&back", function() {
          return ensureJumpAndBack(")", {
            cursor: [5, 6]
          });
        });
        it("( jump&back", function() {
          return ensureJumpAndBack("(", {
            cursor: [0, 0]
          });
        });
        it("] jump&back", function() {
          return ensureJumpAndBack("]", {
            cursor: [5, 3]
          });
        });
        it("[ jump&back", function() {
          return ensureJumpAndBack("[", {
            cursor: [0, 3]
          });
        });
        it("} jump&back", function() {
          return ensureJumpAndBack("}", {
            cursor: [5, 6]
          });
        });
        it("{ jump&back", function() {
          return ensureJumpAndBack("{", {
            cursor: [0, 0]
          });
        });
        it("L jump&back", function() {
          return ensureJumpAndBack("L", {
            cursor: [5, 0]
          });
        });
        it("H jump&back", function() {
          return ensureJumpAndBack("H", {
            cursor: [0, 0]
          });
        });
        it("M jump&back", function() {
          return ensureJumpAndBack("M", {
            cursor: [2, 0]
          });
        });
        it("* jump&back", function() {
          return ensureJumpAndBack("*", {
            cursor: [5, 3]
          });
        });
        it("Sharp(#) jump&back", function() {
          return ensureJumpAndBack('#', {
            cursor: [0, 3]
          });
        });
        it("/ jump&back", function() {
          return ensureJumpAndBack([
            "/", {
              search: 'oo'
            }
          ], {
            cursor: [5, 3]
          });
        });
        it("? jump&back", function() {
          return ensureJumpAndBack([
            "?", {
              search: 'oo'
            }
          ], {
            cursor: [0, 3]
          });
        });
        it("n jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure([
            '/', {
              search: 'oo'
            }
          ], {
            cursor: [0, 3]
          });
          ensureJumpAndBack("n", {
            cursor: [3, 3]
          });
          return ensureJumpAndBack("N", {
            cursor: [5, 3]
          });
        });
        it("N jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure([
            '?', {
              search: 'oo'
            }
          ], {
            cursor: [5, 3]
          });
          ensureJumpAndBack("n", {
            cursor: [3, 3]
          });
          return ensureJumpAndBack("N", {
            cursor: [0, 3]
          });
        });
        it("G jump&back linewise", function() {
          return ensureJumpAndBackLinewise('G', {
            cursor: [5, 0]
          });
        });
        it("g g jump&back linewise", function() {
          return ensureJumpAndBackLinewise("g g", {
            cursor: [0, 0]
          });
        });
        it("100 % jump&back linewise", function() {
          return ensureJumpAndBackLinewise("1 0 0 %", {
            cursor: [5, 0]
          });
        });
        it(") jump&back linewise", function() {
          return ensureJumpAndBackLinewise(")", {
            cursor: [5, 6]
          });
        });
        it("( jump&back linewise", function() {
          return ensureJumpAndBackLinewise("(", {
            cursor: [0, 0]
          });
        });
        it("] jump&back linewise", function() {
          return ensureJumpAndBackLinewise("]", {
            cursor: [5, 3]
          });
        });
        it("[ jump&back linewise", function() {
          return ensureJumpAndBackLinewise("[", {
            cursor: [0, 3]
          });
        });
        it("} jump&back linewise", function() {
          return ensureJumpAndBackLinewise("}", {
            cursor: [5, 6]
          });
        });
        it("{ jump&back linewise", function() {
          return ensureJumpAndBackLinewise("{", {
            cursor: [0, 0]
          });
        });
        it("L jump&back linewise", function() {
          return ensureJumpAndBackLinewise("L", {
            cursor: [5, 0]
          });
        });
        it("H jump&back linewise", function() {
          return ensureJumpAndBackLinewise("H", {
            cursor: [0, 0]
          });
        });
        it("M jump&back linewise", function() {
          return ensureJumpAndBackLinewise("M", {
            cursor: [2, 0]
          });
        });
        return it("* jump&back linewise", function() {
          return ensureJumpAndBackLinewise("*", {
            cursor: [5, 3]
          });
        });
      });
    });
    describe('the V keybinding', function() {
      var text;
      text = [][0];
      beforeEach(function() {
        text = new TextData("01\n002\n0003\n00004\n000005\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      it("selects down a line", function() {
        return ensure('V j j', {
          selectedText: text.getLines([1, 2, 3])
        });
      });
      return it("selects up a line", function() {
        return ensure('V k', {
          selectedText: text.getLines([0, 1])
        });
      });
    });
    describe('MoveTo(Previous|Next)Fold(Start|End)', function() {
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
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              '[ [': 'vim-mode-plus:move-to-previous-fold-start',
              '] [': 'vim-mode-plus:move-to-next-fold-start',
              '[ ]': 'vim-mode-plus:move-to-previous-fold-end',
              '] ]': 'vim-mode-plus:move-to-next-fold-end'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("MoveToPreviousFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold start row", function() {
          ensure('[ [', {
            cursor: [22, 6]
          });
          ensure('[ [', {
            cursor: [20, 6]
          });
          ensure('[ [', {
            cursor: [18, 4]
          });
          ensure('[ [', {
            cursor: [9, 2]
          });
          return ensure('[ [', {
            cursor: [8, 0]
          });
        });
      });
      describe("MoveToNextFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold start row", function() {
          ensure('] [', {
            cursor: [8, 0]
          });
          ensure('] [', {
            cursor: [9, 2]
          });
          ensure('] [', {
            cursor: [18, 4]
          });
          ensure('] [', {
            cursor: [20, 6]
          });
          return ensure('] [', {
            cursor: [22, 6]
          });
        });
      });
      describe("MoveToPrevisFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold end row", function() {
          ensure('[ ]', {
            cursor: [28, 2]
          });
          ensure('[ ]', {
            cursor: [25, 4]
          });
          ensure('[ ]', {
            cursor: [23, 8]
          });
          return ensure('[ ]', {
            cursor: [21, 8]
          });
        });
      });
      return describe("MoveToNextFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold end row", function() {
          ensure('] ]', {
            cursor: [21, 8]
          });
          ensure('] ]', {
            cursor: [23, 8]
          });
          ensure('] ]', {
            cursor: [25, 4]
          });
          return ensure('] ]', {
            cursor: [28, 2]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)String', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g s': 'vim-mode-plus:move-to-next-string',
            'g S': 'vim-mode-plus:move-to-previous-string'
          }
        });
      });
      describe('editor for softTab', function() {
        var pack;
        pack = 'language-coffee-script';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return runs(function() {
            return set({
              text: "disposable?.dispose()\ndisposable = atom.commands.add 'atom-workspace',\n  'check-up': -> fun('backward')\n  'check-down': -> fun('forward')\n\n",
              grammar: 'source.coffee'
            });
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursor: [0, 0]
          });
          ensure('g s', {
            cursor: [1, 31]
          });
          ensure('g s', {
            cursor: [2, 2]
          });
          ensure('g s', {
            cursor: [2, 21]
          });
          ensure('g s', {
            cursor: [3, 2]
          });
          return ensure('g s', {
            cursor: [3, 23]
          });
        });
        it("move to previous string", function() {
          set({
            cursor: [4, 0]
          });
          ensure('g S', {
            cursor: [3, 23]
          });
          ensure('g S', {
            cursor: [3, 2]
          });
          ensure('g S', {
            cursor: [2, 21]
          });
          ensure('g S', {
            cursor: [2, 2]
          });
          return ensure('g S', {
            cursor: [1, 31]
          });
        });
        return it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 g s', {
            cursor: [2, 21]
          });
          return ensure('3 g S', {
            cursor: [1, 31]
          });
        });
      });
      return describe('editor for hardTab', function() {
        var pack;
        pack = 'language-go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return getVimState('sample.go', function(state, vimEditor) {
            editor = state.editor, editorElement = state.editorElement;
            return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursorScreen: [0, 0]
          });
          ensure('g s', {
            cursorScreen: [2, 7]
          });
          ensure('g s', {
            cursorScreen: [3, 7]
          });
          ensure('g s', {
            cursorScreen: [8, 8]
          });
          ensure('g s', {
            cursorScreen: [9, 8]
          });
          ensure('g s', {
            cursorScreen: [11, 20]
          });
          ensure('g s', {
            cursorScreen: [12, 15]
          });
          ensure('g s', {
            cursorScreen: [13, 15]
          });
          ensure('g s', {
            cursorScreen: [15, 15]
          });
          return ensure('g s', {
            cursorScreen: [16, 15]
          });
        });
        return it("move to previous string", function() {
          set({
            cursorScreen: [18, 0]
          });
          ensure('g S', {
            cursorScreen: [16, 15]
          });
          ensure('g S', {
            cursorScreen: [15, 15]
          });
          ensure('g S', {
            cursorScreen: [13, 15]
          });
          ensure('g S', {
            cursorScreen: [12, 15]
          });
          ensure('g S', {
            cursorScreen: [11, 20]
          });
          ensure('g S', {
            cursorScreen: [9, 8]
          });
          ensure('g S', {
            cursorScreen: [8, 8]
          });
          ensure('g S', {
            cursorScreen: [3, 7]
          });
          return ensure('g S', {
            cursorScreen: [2, 7]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)Number', function() {
      var pack;
      pack = 'language-coffee-script';
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g n': 'vim-mode-plus:move-to-next-number',
            'g N': 'vim-mode-plus:move-to-previous-number'
          }
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage(pack);
        });
        runs(function() {
          return set({
            grammar: 'source.coffee'
          });
        });
        return set({
          text: "num1 = 1\narr1 = [1, 101, 1001]\narr2 = [\"1\", \"2\", \"3\"]\nnum2 = 2\nfun(\"1\", 2, 3)\n\n"
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage(pack);
      });
      it("move to next number", function() {
        set({
          cursor: [0, 0]
        });
        ensure('g n', {
          cursor: [0, 7]
        });
        ensure('g n', {
          cursor: [1, 8]
        });
        ensure('g n', {
          cursor: [1, 11]
        });
        ensure('g n', {
          cursor: [1, 16]
        });
        ensure('g n', {
          cursor: [3, 7]
        });
        ensure('g n', {
          cursor: [4, 9]
        });
        return ensure('g n', {
          cursor: [4, 12]
        });
      });
      it("move to previous number", function() {
        set({
          cursor: [5, 0]
        });
        ensure('g N', {
          cursor: [4, 12]
        });
        ensure('g N', {
          cursor: [4, 9]
        });
        ensure('g N', {
          cursor: [3, 7]
        });
        ensure('g N', {
          cursor: [1, 16]
        });
        ensure('g N', {
          cursor: [1, 11]
        });
        ensure('g N', {
          cursor: [1, 8]
        });
        return ensure('g N', {
          cursor: [0, 7]
        });
      });
      return it("support count", function() {
        set({
          cursor: [0, 0]
        });
        ensure('5 g n', {
          cursor: [3, 7]
        });
        return ensure('3 g N', {
          cursor: [1, 8]
        });
      });
    });
    return describe('subword motion', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'q': 'vim-mode-plus:move-to-next-subword',
            'Q': 'vim-mode-plus:move-to-previous-subword',
            'ctrl-e': 'vim-mode-plus:move-to-end-of-subword'
          }
        });
      });
      it("move to next/previous subword", function() {
        set({
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camel|Case => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase| => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase =>| (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (|with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with |special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) |ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaR|ActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActer|Rs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\n|dash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-|case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\n|snake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake|_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case|_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_wor|d\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case|_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake|_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\n|snake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-|case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\n|dash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActer|Rs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaR|ActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) |ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with |special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (|with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase =>| (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase| => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camel|Case => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        return ensure('Q', {
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
      });
      return it("move-to-end-of-subword", function() {
        set({
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "came|lCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCas|e => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase =|> (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => |(with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (wit|h special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with specia|l) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) Ch|aRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActe|rRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerR|s\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndas|h-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-cas|e\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnak|e_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_cas|e_word\n"
        });
        return ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_wor|d\n"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvbW90aW9uLWdlbmVyYWwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1YsTUFBNkMsT0FBQSxDQUFRLGVBQVIsQ0FBN0MsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCLHVCQUF4QixFQUFrQzs7RUFDbEMsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtBQUN6QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsY0FBRCxFQUFNLG9CQUFOLEVBQWMsMEJBQWQsRUFBMkI7TUFIakIsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtBQUN6QixVQUFBO01BQUEsSUFBQSxHQUFPO01BQ1AsVUFBQSxDQUFXLFNBQUE7UUFDVCxJQUFBLEdBQVcsSUFBQSxRQUFBLENBQVMsc0JBQVQ7ZUFNWCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0sSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFOO1VBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtTQURGO01BUFMsQ0FBWDtNQVdBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO1FBQzNCLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7VUFDdEIsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUE7WUFDeEQsTUFB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QSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7TUFuQ2tDLENBQXBDO2FBb0NBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBO1FBQzNCLEdBQUEsQ0FBSTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFKO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7ZUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtNQWxCMkIsQ0FBN0I7SUE1Q3lCLENBQTNCO0VBeDREeUIsQ0FBM0I7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xue2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGEsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBnZW5lcmFsXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IF92aW1cblxuICBkZXNjcmliZSBcInNpbXBsZSBtb3Rpb25zXCIsIC0+XG4gICAgdGV4dCA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkXG4gICAgICAgIEFCQ0RFXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgaCBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciBsZWZ0LCBidXQgbm90IHRvIHRoZSBwcmV2aW91cyBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdoJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2gnLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgcHJldmlvdXMgbGluZSBpZiB3cmFwTGVmdFJpZ2h0TW90aW9uIGlzIHRydWVcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICAgIGVuc3VyZSAnaCBoJywgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdGhlIGNoYXJhY3RlciB0byB0aGUgbGVmdFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAneSBoJyxcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2EnXG5cbiAgICBkZXNjcmliZSBcInRoZSBqIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciBkb3duLCBidXQgbm90IHRvIHRoZSBlbmQgb2YgdGhlIGxhc3QgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCAxXVxuICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCAxXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgbGluZSwgbm90IHBhc3QgaXRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzEsIDNdXG5cbiAgICAgIGl0IFwicmVtZW1iZXJzIHRoZSBjb2x1bW4gaXQgd2FzIGluIGFmdGVyIG1vdmluZyB0byBzaG9ydGVyIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDRdXG5cbiAgICAgIGl0IFwibmV2ZXIgZ28gcGFzdCBsYXN0IG5ld2xpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICcxIDAgaicsIGN1cnNvcjogWzIsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZW5zdXJlICd2JywgY3Vyc29yOiBbMSwgMl0sIHNlbGVjdGVkVGV4dDogJ2InXG5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGRvd25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCAyXSwgc2VsZWN0ZWRUZXh0OiBcImJjZFxcbkFCXCJcblxuICAgICAgICBpdCBcImRvZXNuJ3QgZ28gb3ZlciBhZnRlciB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgMl0sIHNlbGVjdGVkVGV4dDogXCJiY2RcXG5BQlwiXG5cbiAgICAgICAgaXQgXCJrZWVwIHNhbWUgY29sdW1uKGdvYWxDb2x1bW4pIGV2ZW4gYWZ0ZXIgYWNyb3NzIHRoZSBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlICdlc2NhcGUnXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgYWJjZGVmZ1xuXG4gICAgICAgICAgICAgIGFiY2RlZmdcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGVuc3VyZSAndicsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgZW5zdXJlICdqIGonLCBjdXJzb3I6IFsyLCA0XSwgc2VsZWN0ZWRUZXh0OiBcImRlZmdcXG5cXG5hYmNkXCJcblxuICAgICAgICAjIFtGSVhNRV0gdGhlIHBsYWNlIG9mIHRoaXMgc3BlYyBpcyBub3QgYXBwcm9wcmlhdGUuXG4gICAgICAgIGl0IFwib3JpZ2luYWwgdmlzdWFsIGxpbmUgcmVtYWlucyB3aGVuIGprIGFjcm9zcyBvcmlnbmFsIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgICAgICBsaW5lMFxuICAgICAgICAgICAgbGluZTFcbiAgICAgICAgICAgIGxpbmUyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IHRleHQuZ2V0UmF3KClcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgICAgICAgICBlbnN1cmUgJ1YnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMSwgMl0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAsIDFdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLCAyXSlcblxuICAgIGRlc2NyaWJlIFwibW92ZS1kb3duLXdyYXAsIG1vdmUtdXAtd3JhcFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2snOiAndmltLW1vZGUtcGx1czptb3ZlLXVwLXdyYXAnXG4gICAgICAgICAgICAnaic6ICd2aW0tbW9kZS1wbHVzOm1vdmUtZG93bi13cmFwJ1xuXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgaGVsbG9cbiAgICAgICAgICBoZWxsb1xuICAgICAgICAgIGhlbGxvXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSAnbW92ZS1kb3duLXdyYXAnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDFdXG4gICAgICAgIGl0IFwibW92ZSBkb3duIHdpdGggd3Jhd3BcIiwgLT4gZW5zdXJlICdqJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJzIgaicsIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGl0IFwibW92ZSBkb3duIHdpdGggd3Jhd3BcIiwgLT4gZW5zdXJlICc0IGonLCBjdXJzb3I6IFszLCAxXVxuXG4gICAgICBkZXNjcmliZSAnbW92ZS11cC13cmFwJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGl0IFwibW92ZSBkb3duIHdpdGggd3Jhd3BcIiwgLT4gZW5zdXJlICdrJywgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJzIgaycsIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGl0IFwibW92ZSBkb3duIHdpdGggd3Jhd3BcIiwgLT4gZW5zdXJlICc0IGsnLCBjdXJzb3I6IFswLCAxXVxuXG5cbiAgICAjIFtOT1RFXSBTZWUgIzU2MFxuICAgICMgVGhpcyBzcGVjIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgaW4gbG9jYWwgdGVzdCwgbm90IGF0IENJIHNlcnZpY2UuXG4gICAgIyBTYWZlIHRvIGV4ZWN1dGUgaWYgaXQgcGFzc2VzLCBidXQgZnJlZXplIGVkaXRvciB3aGVuIGl0IGZhaWwuXG4gICAgIyBTbyBleHBsaWNpdGx5IGRpc2FibGVkIGJlY2F1c2UgSSBkb24ndCB3YW50IGJlIGJhbm5lZCBieSBDSSBzZXJ2aWNlLlxuICAgICMgRW5hYmxlIHRoaXMgb24gZGVtbWFuZCB3aGVuIGZyZWV6aW5nIGhhcHBlbnMgYWdhaW4hXG4gICAgeGRlc2NyaWJlIFwid2l0aCBiaWcgY291bnQgd2FzIGdpdmVuXCIsIC0+XG4gICAgICBCSUdfTlVNQkVSID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcbiAgICAgIGVuc3VyZUJpZ0NvdW50TW90aW9uID0gKGtleXN0cm9rZXMsIG9wdGlvbnMpIC0+XG4gICAgICAgIGNvdW50ID0gU3RyaW5nKEJJR19OVU1CRVIpLnNwbGl0KCcnKS5qb2luKCcgJylcbiAgICAgICAga2V5c3Ryb2tlcyA9IGtleXN0cm9rZXMuc3BsaXQoJycpLmpvaW4oJyAnKVxuICAgICAgICBlbnN1cmUoXCIje2NvdW50fSAje2tleXN0cm9rZXN9XCIsIG9wdGlvbnMpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdnIHsnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLWZvbGQtc3RhcnQnXG4gICAgICAgICAgICAnZyB9JzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LWZvbGQtc3RhcnQnXG4gICAgICAgICAgICAnLCBOJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1udW1iZXInXG4gICAgICAgICAgICAnLCBuJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LW51bWJlcidcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMDAwMFxuICAgICAgICAgIDExMTFcbiAgICAgICAgICAyMjIyXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgaXQgXCJieSBgamBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2onLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgaXQgXCJieSBga2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2snLCBjdXJzb3I6IFswLCAyXVxuICAgICAgaXQgXCJieSBgaGBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2gnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgaXQgXCJieSBgbGBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2wnLCBjdXJzb3I6IFsxLCAzXVxuICAgICAgaXQgXCJieSBgW2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ1snLCBjdXJzb3I6IFswLCAyXVxuICAgICAgaXQgXCJieSBgXWBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ10nLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgaXQgXCJieSBgd2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ3cnLCBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBgV2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ1cnLCBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBgYmBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2InLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgQmBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ0InLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgZWBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2UnLCBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBgKGBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJygnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgKWBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJyknLCBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBge2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ3snLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgfWBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ30nLCBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBgLWBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJy0nLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgX2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ18nLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgaXQgXCJieSBgZyB7YFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnZyB7JywgY3Vyc29yOiBbMSwgMl0gIyBObyBmb2xkIG5vIG1vdmUgYnV0IHdvbid0IGZyZWV6ZS5cbiAgICAgIGl0IFwiYnkgYGcgfWBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2cgfScsIGN1cnNvcjogWzEsIDJdICMgTm8gZm9sZCBubyBtb3ZlIGJ1dCB3b24ndCBmcmVlemUuXG4gICAgICBpdCBcImJ5IGAsIE5gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICcsIE4nLCBjdXJzb3I6IFsxLCAyXSAjIE5vIGdyYW1tYXIsIG5vIG1vdmUgYnV0IHdvbid0IGZyZWV6ZS5cbiAgICAgIGl0IFwiYnkgYCwgbmBcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJywgbicsIGN1cnNvcjogWzEsIDJdICMgTm8gZ3JhbW1hciwgbm8gbW92ZSBidXQgd29uJ3QgZnJlZXplLlxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgayBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdXBcIiwgLT5cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHVwIGFuZCByZW1lbWJlciBjb2x1bW4gaXQgd2FzIGluXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCA0XVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2snLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdXAsIGJ1dCBub3QgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlyc3QgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJzEgMCBrJywgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGl0IFwia2VlcCBzYW1lIGNvbHVtbihnb2FsQ29sdW1uKSBldmVuIGFmdGVyIGFjcm9zcyB0aGUgZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIGFiY2RlZmdcblxuICAgICAgICAgICAgICBhYmNkZWZnXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMiwgM11cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBjdXJzb3I6IFsyLCA0XSwgc2VsZWN0ZWRUZXh0OiAnZCdcbiAgICAgICAgICBlbnN1cmUgJ2sgaycsIGN1cnNvcjogWzAsIDNdLCBzZWxlY3RlZFRleHQ6IFwiZGVmZ1xcblxcbmFiY2RcIlxuXG4gICAgZGVzY3JpYmUgXCJnaiBnayBpbiBzb2Z0d3JhcFwiLCAtPlxuICAgICAgW3RleHRdID0gW11cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0U29mdFdyYXBwZWQodHJ1ZSlcbiAgICAgICAgZWRpdG9yLnNldEVkaXRvcldpZHRoSW5DaGFycygxMClcbiAgICAgICAgZWRpdG9yLnNldERlZmF1bHRDaGFyV2lkdGgoMSlcbiAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAxc3QgbGluZSBvZiBidWZmZXJcbiAgICAgICAgICAybmQgbGluZSBvZiBidWZmZXIsIFZlcnkgbG9uZyBsaW5lXG4gICAgICAgICAgM3JkIGxpbmUgb2YgYnVmZmVyXG5cbiAgICAgICAgICA1dGggbGluZSBvZiBidWZmZXJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IHRleHQuZ2V0UmF3KCksIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIGlzIG5vdCByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCBcInNjcmVlbiBwb3NpdGlvbiBhbmQgYnVmZmVyIHBvc2l0aW9uIGlzIGRpZmZlcmVudFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMSwgMF0sIGN1cnNvcjogWzAsIDldXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFsyLCAwXSwgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzMsIDBdLCBjdXJzb3I6IFsxLCA5XVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbNCwgMF0sIGN1cnNvcjogWzEsIDEyXVxuXG4gICAgICAgIGl0IFwiamsgbW92ZSBzZWxlY3Rpb24gYnVmZmVyLWxpbmUgd2lzZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnVicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4xXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjJdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uM10pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjNdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMl0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4xXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjBdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMF0pICMgZG8gbm90aGluZ1xuXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCBcInNjcmVlbiBwb3NpdGlvbiBhbmQgYnVmZmVyIHBvc2l0aW9uIGlzIGRpZmZlcmVudFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMSwgMF0sIGN1cnNvcjogWzAsIDldXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFsyLCAwXSwgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzMsIDBdLCBjdXJzb3I6IFsxLCA5XVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbNCwgMF0sIGN1cnNvcjogWzEsIDEyXVxuXG4gICAgICAgIGl0IFwiamsgbW92ZSBzZWxlY3Rpb24gYnVmZmVyLWxpbmUgd2lzZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICAgIGVuc3VyZSAnVicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNC4uNF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFszLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzIuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMS4uNF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMi4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFszLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNC4uNF0pICMgZG8gbm90aGluZ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgbCBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgcmlnaHQsIGJ1dCBub3QgdG8gdGhlIG5leHQgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2wnLCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2wnLCBjdXJzb3I6IFsxLCAzXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIG5leHQgbGluZSBpZiB3cmFwTGVmdFJpZ2h0TW90aW9uIGlzIHRydWVcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgZW5zdXJlICdsIGwnLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIm9uIGEgYmxhbmsgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRvZXNuJ3QgbW92ZSB0aGUgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiXFxuXFxuXFxuXCIsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwibW92ZS0odXAvZG93biktdG8tZWRnZVwiLCAtPlxuICAgICAgdGV4dCA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAwOiAgNCA2NyAgMDEyMzQ1Njc4OTAxMjM0NTY3ODlcbiAgICAgICAgICAxOiAgICAgICAgIDEyMzQ1Njc4OTAxMjM0NTY3ODlcbiAgICAgICAgICAyOiAgICA2IDg5MCAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICAzOiAgICA2IDg5MCAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICA0OiAgIDU2IDg5MCAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICA1OiAgICAgICAgICAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICA2OiAgICAgICAgICAgICAgICAgIDAxMjM0NTY3ODlcbiAgICAgICAgICA3OiAgNCA2NyAgICAgICAgICAgIDAxMjM0NTY3ODlcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IHRleHQuZ2V0UmF3KCksIGN1cnNvcjogWzQsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwiZWRnZW5lc3Mgb2YgZmlyc3QtbGluZSBhbmQgbGFzdC1saW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIF9fX190aGlzIGlzIGxpbmUgMFxuICAgICAgICAgICAgX19fX3RoaXMgaXMgdGV4dCBvZiBsaW5lIDFcbiAgICAgICAgICAgIF9fX190aGlzIGlzIHRleHQgb2YgbGluZSAyXG4gICAgICAgICAgICBfX19fX19oZWxsbyBsaW5lIDNcbiAgICAgICAgICAgIF9fX19fX2hlbGxvIGxpbmUgNFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsyLCAyXVxuXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBjb2x1bW4gaXMgbGVhZGluZyBzcGFjZXNcIiwgLT5cbiAgICAgICAgICBpdCBcImRvZXNuJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCAyXVxuXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBjb2x1bW4gaXMgdHJhaWxpbmcgc3BhY2VzXCIsIC0+XG4gICAgICAgICAgaXQgXCJkb2Vzbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMjBdXG4gICAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCAyMF1cbiAgICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzIsIDIwXVxuICAgICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMSwgMjBdXG4gICAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFsxLCAyMF1cblxuICAgICAgaXQgXCJtb3ZlIHRvIG5vbi1ibGFuay1jaGFyIG9uIGJvdGggZmlyc3QgYW5kIGxhc3Qgcm93XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCA0XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs3LCA0XVxuICAgICAgaXQgXCJtb3ZlIHRvIHdoaXRlIHNwYWNlIGNoYXIgd2hlbiBib3RoIHNpZGUgY29sdW1uIGlzIG5vbi1ibGFuayBjaGFyXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCA1XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs0LCA1XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs3LCA1XVxuICAgICAgaXQgXCJvbmx5IHN0b3BzIG9uIHJvdyBvbmUgb2YgW2ZpcnN0IHJvdywgbGFzdCByb3csIHVwLW9yLWRvd24tcm93IGlzIGJsYW5rXSBjYXNlLTFcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDZdXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzIsIDZdXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzAsIDZdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzIsIDZdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzQsIDZdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzcsIDZdXG4gICAgICBpdCBcIm9ubHkgc3RvcHMgb24gcm93IG9uZSBvZiBbZmlyc3Qgcm93LCBsYXN0IHJvdywgdXAtb3ItZG93bi1yb3cgaXMgYmxhbmtdIGNhc2UtMlwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgN11cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMiwgN11cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMiwgN11cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNCwgN11cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNywgN11cbiAgICAgIGl0IFwic3VwcG9ydCBjb3VudFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNl1cbiAgICAgICAgZW5zdXJlICcyIFsnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICBlbnN1cmUgJzMgXScsIGN1cnNvcjogWzcsIDZdXG5cbiAgICAgIGRlc2NyaWJlICdlZGl0b3IgZm9yIGhhcmRUYWInLCAtPlxuICAgICAgICBwYWNrID0gJ2xhbmd1YWdlLWdvJ1xuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5nbycsIChzdGF0ZSwgdmltRWRpdG9yKSAtPlxuICAgICAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltRWRpdG9yXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbOCwgMl1cbiAgICAgICAgICAgICMgSW4gaGFyZFRhYiBpbmRlbnQgYnVmZmVyUG9zaXRpb24gaXMgbm90IHNhbWUgYXMgc2NyZWVuUG9zaXRpb25cbiAgICAgICAgICAgIGVuc3VyZSBjdXJzb3I6IFs4LCAxXVxuXG4gICAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgICBpdCBcIm1vdmUgdXAvZG93biB0byBuZXh0IGVkZ2Ugb2Ygc2FtZSAqc2NyZWVuKiBjb2x1bW5cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFs1LCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzMsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFswLCAyXVxuXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFszLCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzUsIDJdXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbOSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFsxMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFsxNCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFsxNywgMl1cblxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzE0LCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzExLCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzksIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbNSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFszLCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzIsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMCwgMl1cblxuICBkZXNjcmliZSAnbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlIGJlaGF2aXJhbCBjaGFyYWN0ZXJpc3RpYycsIC0+XG4gICAgb3JpZ2luYWxUZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZSlcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMDBcbiAgICAgICAgICAxMTFcbiAgICAgICAgICAyMjJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIG9yaWdpbmFsVGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGVuc3VyZSByZWdpc3RlcjogeydcIic6IHRleHQ6IHVuZGVmaW5lZH1cblxuICAgIGRlc2NyaWJlIFwibW92ZVN1Y2Nlc3NPbkxpbmV3aXNlPWZhbHNlIG1vdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBtb3ZlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGpcIiwgLT4gZW5zdXJlIFwiZCBqXCIsIHRleHQ6IFwiMDAwXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBqXCIsIC0+IGVuc3VyZSBcInkgalwiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIxMTFcXG4yMjJcXG5cIn0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IGpcIiwgLT4gZW5zdXJlIFwiYyBqXCIsIHRleHRDOiBcIjAwMFxcbnxcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjExMVxcbjIyMlxcblwifSwgbW9kZTogJ2luc2VydCdcblxuICAgICAgICBpdCBcImRlbGV0ZSBieSBrXCIsIC0+IGVuc3VyZSBcImQga1wiLCB0ZXh0OiBcIjIyMlxcblwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkga1wiLCAtPiBlbnN1cmUgXCJ5IGtcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuMTExXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBrXCIsIC0+IGVuc3VyZSBcImMga1wiLCB0ZXh0QzogXCJ8XFxuMjIyXFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG4xMTFcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbm90IG1vdmUtdXBcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgZGtcIiwgLT4gZW5zdXJlIFwiZCBrXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IHlrXCIsIC0+IGVuc3VyZSBcInkga1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogdW5kZWZpbmVkfSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgY2tcIiwgLT4gZW5zdXJlIFwiYyBrXCIsIHRleHRDOiBcInwwMDBcXG4xMTFcXG4yMjJcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIlxcblwifSwgbW9kZTogJ2luc2VydCcgIyBGSVhNRSwgaW5jb21wYXRpYmxlOiBzaG91ZCByZW1haW4gaW4gbm9ybWFsLlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG5vdCBtb3ZlLWRvd25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgZGpcIiwgLT4gZW5zdXJlIFwiZCBqXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IHlqXCIsIC0+IGVuc3VyZSBcInkgalwiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogdW5kZWZpbmVkfSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgY2pcIiwgLT4gZW5zdXJlIFwiYyBqXCIsIHRleHRDOiBcIjAwMFxcbjExMVxcbnwyMjJcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIlxcblwifSwgbW9kZTogJ2luc2VydCcgIyBGSVhNRSwgaW5jb21wYXRpYmxlOiBzaG91ZCByZW1haW4gaW4gbm9ybWFsLlxuXG4gICAgZGVzY3JpYmUgXCJtb3ZlU3VjY2Vzc09uTGluZXdpc2U9dHJ1ZSBtb3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbW92ZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZSBieSBHXCIsIC0+IGVuc3VyZSBcImQgR1wiLCB0ZXh0OiBcIjAwMFxcblwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgR1wiLCAtPiBlbnN1cmUgXCJ5IEdcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMTExXFxuMjIyXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBHXCIsIC0+IGVuc3VyZSBcImMgR1wiLCB0ZXh0QzogXCIwMDBcXG58XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIxMTFcXG4yMjJcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgZ2dcIiwgLT4gZW5zdXJlIFwiZCBnIGdcIiwgdGV4dDogXCIyMjJcXG5cIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IGdnXCIsIC0+IGVuc3VyZSBcInkgZyBnXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcbjExMVxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgZ2dcIiwgLT4gZW5zdXJlIFwiYyBnIGdcIiwgdGV4dEM6IFwifFxcbjIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuMTExXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG5vdCBtb3ZlLXVwXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGdnXCIsIC0+IGVuc3VyZSBcImQgZyBnXCIsIHRleHQ6IFwiMTExXFxuMjIyXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBnZ1wiLCAtPiBlbnN1cmUgXCJ5IGcgZ1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMDBcXG5cIn0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwiY2hhbmdlIGJ5IGdnXCIsIC0+IGVuc3VyZSBcImMgZyBnXCIsIHRleHRDOiBcInxcXG4xMTFcXG4yMjJcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcblwifSwgbW9kZTogJ2luc2VydCdcbiAgICAgIGRlc2NyaWJlIFwid2hlbiBpdCBjYW4gbm90IG1vdmUtZG93blwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZSBieSBHXCIsIC0+IGVuc3VyZSBcImQgR1wiLCB0ZXh0OiBcIjAwMFxcbjExMVxcblwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgR1wiLCAtPiBlbnN1cmUgXCJ5IEdcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMjIyXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBHXCIsIC0+IGVuc3VyZSBcImMgR1wiLCB0ZXh0QzogXCIwMDBcXG4xMTFcXG58XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIyMjJcXG5cIn0sIG1vZGU6ICdpbnNlcnQnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgdyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmFzZVRleHQgPSBcIlwiXCJcbiAgICAgIGFiIGNkZTErLVxuICAgICAgIHh5elxuXG4gICAgICB6aXBcbiAgICAgIFwiXCJcIlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBiYXNlVGV4dFxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICAjIFdoZW4gdGhlIGN1cnNvciBnZXRzIHRvIHRoZSBFT0YsIGl0IHNob3VsZCBzdGF5IHRoZXJlLlxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgd29yZCBpZiBsYXN0IHdvcmQgaW4gZmlsZVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2FiYycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGl0IFwibW92ZSB0byBuZXh0IHdvcmQgYnkgc2tpcHBpbmcgdHJhaWxpbmcgd2hpdGUgc3BhY2VzXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAwMTJ8X19fXG4gICAgICAgICAgICAgIDIzNFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndycsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMl9fX1xuICAgICAgICAgICAgICB8MjM0XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJtb3ZlIHRvIG5leHQgd29yZCBmcm9tIEVPTFwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgfFxuICAgICAgICAgICAgX18yMzRcIlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndycsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcblxuICAgICAgICAgICAgX198MjM0XCJcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAjIFtGSVhNRV0gaW1wcm92ZSBzcGVjIHRvIGxvb3Agc2FtZSBzZWN0aW9uIHdpdGggZGlmZmVyZW50IHRleHRcbiAgICAgIGRlc2NyaWJlIFwiZm9yIENSTEYgYnVmZmVyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogYmFzZVRleHQucmVwbGFjZSgvXFxuL2csIFwiXFxyXFxuXCIpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDddXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICAgICAgIyBXaGVuIHRoZSBjdXJzb3IgZ2V0cyB0byB0aGUgRU9GLCBpdCBzaG91bGQgc3RheSB0aGVyZS5cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzMsIDJdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdXNlZCBieSBDaGFuZ2Ugb3BlcmF0b3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fdmFyMSA9IDFcbiAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gd29yZFwiLCAtPlxuICAgICAgICBpdCBcIm5vdCBlYXQgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGVuc3VyZSAnYyB3JyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIF9fdiA9IDFcbiAgICAgICAgICAgIF9fdmFyMiA9IDJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICBpdCBcIm9ubHkgZWF0IHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIHcnLFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgdmFyMSA9IDFcbiAgICAgICAgICAgIF9fdmFyMiA9IDJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRleHQgdG8gRU9MIGlzIGFsbCB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICBpdCBcIndvbnQgZWF0IG5ldyBsaW5lIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgYWJjX19cbiAgICAgICAgICAgIGRlZlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGVuc3VyZSAnYyB3JyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkZWZcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cblxuICAgICAgICBpdCBcImNhbnQgZWF0IG5ldyBsaW5lIHdoZW4gY291bnQgaXMgc3BlY2lmaWVkXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiXFxuXFxuXFxuXFxuXFxubGluZTZcXG5cIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJzUgYyB3JywgdGV4dDogXCJcXG5saW5lNlxcblwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoaW4gYSB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICd5IHcnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiICdcblxuICAgICAgZGVzY3JpYmUgXCJiZXR3ZWVuIHdvcmRzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0aGUgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSAneSB3JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcgJ1xuXG4gIGRlc2NyaWJlIFwidGhlIFcga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcImNkZTErLSBhYiBcXG4geHl6XFxuXFxuemlwXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdXJywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICdXJywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICdXJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdXJywgY3Vyc29yOiBbMywgMF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkIG9mIG5leHQgbGluZSB3aGVuIGFsbCByZW1haW5pbmcgdGV4dCBpcyB3aGl0ZSBzcGFjZS5cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgMDEyX19fXG4gICAgICAgICAgICBfXzIzNFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICdXJywgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkIG9mIG5leHQgbGluZSB3aGVuIGN1cnNvciBpcyBhdCBFT0wuXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcblxuICAgICAgICAgIF9fMjM0XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdXJywgY3Vyc29yOiBbMSwgMl1cblxuICAgICMgVGhpcyBzcGVjIGlzIHJlZHVuZGFudCBzaW5jZSBXKE1vdmVUb05leHRXaG9sZVdvcmQpIGlzIGNoaWxkIG9mIHcoTW92ZVRvTmV4dFdvcmQpLlxuICAgIGRlc2NyaWJlIFwid2hlbiB1c2VkIGJ5IENoYW5nZSBvcGVyYXRvclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBfX3ZhcjEgPSAxXG4gICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwibm90IGVhdCB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICdjIFcnLFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgICBfX3YgPSAxXG4gICAgICAgICAgICAgIF9fdmFyMiA9IDJcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgIGl0IFwib25seSBlYXQgd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2MgVycsXG4gICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAgIHZhcjEgPSAxXG4gICAgICAgICAgICAgIF9fdmFyMiA9IDJcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGV4dCB0byBFT0wgaXMgYWxsIHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgIGl0IFwid29udCBlYXQgbmV3IGxpbmUgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiYWJjICBcXG5kZWZcXG5cIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2MgVycsIHRleHQ6IFwiYWJjXFxuZGVmXFxuXCIsIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgICAgaXQgXCJjYW50IGVhdCBuZXcgbGluZSB3aGVuIGNvdW50IGlzIHNwZWNpZmllZFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIlxcblxcblxcblxcblxcbmxpbmU2XFxuXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICc1IGMgVycsIHRleHQ6IFwiXFxubGluZTZcXG5cIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aGluIGEgd29yZFwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgd2hvbGUgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAneSBXJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdjZGUxKy0gJ1xuXG4gICAgICBpdCBcImNvbnRpbnVlcyBwYXN0IGJsYW5rIGxpbmVzXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgVycsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIGNkZTErLSBhYl9cbiAgICAgICAgICBfeHl6XG4gICAgICAgICAgemlwXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiXFxuXCJcblxuICAgICAgaXQgXCJkb2Vzbid0IGdvIHBhc3QgdGhlIGVuZCBvZiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICdkIFcnLFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBjZGUxKy0gYWJfXG4gICAgICAgICAgX3h5elxcblxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnemlwJ1xuXG4gIGRlc2NyaWJlIFwidGhlIGUga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICBhYiBjZGUxKy1fXG4gICAgICBfeHl6XG5cbiAgICAgIHppcFxuICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZScsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnZScsIGN1cnNvcjogWzAsIDZdXG4gICAgICAgIGVuc3VyZSAnZScsIGN1cnNvcjogWzAsIDhdXG4gICAgICAgIGVuc3VyZSAnZScsIGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnZScsIGN1cnNvcjogWzMsIDJdXG5cbiAgICAgIGl0IFwic2tpcHMgd2hpdGVzcGFjZSB1bnRpbCBFT0ZcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIwMTJcXG5cXG5cXG4wMTJcXG5cXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZScsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnZScsIGN1cnNvcjogWzMsIDJdXG4gICAgICAgIGVuc3VyZSAnZScsIGN1cnNvcjogWzQsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoaW4gYSB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3kgZScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWInXG5cbiAgICAgIGRlc2NyaWJlIFwiYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICd5IGUnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJyBjZGUxJ1xuXG4gIGRlc2NyaWJlIFwidGhlIGdlIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgcHJldmlvdXMgd29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0IDU2Nzggd29yZHdvcmRcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTZdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJtb3ZlcyBjb3JyZW50bHkgd2hlbiBzdGFydGluZyBiZXR3ZWVuIHdvcmRzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEgbGVhZGluZyAgICAgZW5kXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDEyXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDhdXG5cbiAgICAgIGl0IFwidGFrZXMgYSBjb3VudFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJ2aW0gbW9kZSBwbHVzIGlzIGdldHRpbmcgdGhlcmVcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjhdXG4gICAgICAgIGVuc3VyZSAnNSBnIGUnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICAjIHRlc3Qgd2lsbCBmYWlsIHVudGlsIHRoZSBjb2RlIGlzIGZpeGVkXG4gICAgICB4aXQgXCJoYW5kbGVzIG5vbi13b3JkcyBpbnNpZGUgd29yZHMgbGlrZSB2aW1cIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNCA1Njc4IHdvcmQtd29yZFwiXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxOF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCAxNF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCAxM11cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgICAjIHRlc3Qgd2lsbCBmYWlsIHVudGlsIHRoZSBjb2RlIGlzIGZpeGVkXG4gICAgICB4aXQgXCJoYW5kbGVzIG5ld2xpbmVzIGxpa2UgdmltXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzRcXG5cXG5cXG5cXG41Njc4XCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzUsIDJdXG4gICAgICAgICMgdmltIHNlZW1zIHRvIHRoaW5rIGFuIGVuZC1vZi13b3JkIGlzIGF0IGV2ZXJ5IGJsYW5rIGxpbmVcbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVzZWQgYnkgQ2hhbmdlIG9wZXJhdG9yXCIsIC0+XG4gICAgICBpdCBcImNoYW5nZXMgd29yZCBmcmFnbWVudHNcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiY2V0IGRvY3VtZW50XCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnYyBnIGUnLCBjdXJzb3I6IFswLCAyXSwgdGV4dDogXCJjZW1lbnRcIiwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgIyBUT0RPOiBJJ20gbm90IHN1cmUgaG93IHRvIGNoZWNrIHRoZSByZWdpc3RlciBhZnRlciBjaGVja2luZyB0aGUgZG9jdW1lbnRcbiAgICAgICAgIyBlbnN1cmUgcmVnaXN0ZXI6ICdcIicsIHRleHQ6ICd0IGRvY3UnXG5cbiAgICAgIGl0IFwiY2hhbmdlcyB3aGl0ZXNwYWNlIHByb3Blcmx5XCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImNlICAgIGRvY1wiXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJ2MgZyBlJywgY3Vyc29yOiBbMCwgMV0sIHRleHQ6IFwiYyBkb2NcIiwgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwiaW4gY2hhcmFjdGVyd2lzZSB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHdvcmQgZnJhZ21lbnRzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImNldCBkb2N1bWVudFwiXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ3YgZyBlJywgY3Vyc29yOiBbMCwgMl0sIHNlbGVjdGVkVGV4dDogXCJ0IGRvY3VcIlxuXG4gIGRlc2NyaWJlIFwidGhlIEUga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICBhYiAgY2RlMSstX1xuICAgICAgX3h5el9cblxuICAgICAgemlwXFxuXG4gICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMCwgOV1cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgZW5zdXJlICdFJywgY3Vyc29yOiBbMywgMl1cblxuICAgIGRlc2NyaWJlIFwiYXMgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhpbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAneSBFJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYidcblxuICAgICAgZGVzY3JpYmUgXCJiZXR3ZWVuIHdvcmRzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ3kgRScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnICBjZGUxKy0nXG5cbiAgICAgIGRlc2NyaWJlIFwicHJlc3MgbW9yZSB0aGFuIG9uY2VcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAndiBFIEUgeScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWIgIGNkZTErLSdcblxuICBkZXNjcmliZSBcInRoZSBnRSBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHByZXZpb3VzIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIuNCA1fjctIHdvcmQtd29yZFwiXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxNl1cbiAgICAgICAgZW5zdXJlICdnIEUnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgICBlbnN1cmUgJ2cgRScsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAnZyBFJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIEUnLCBjdXJzb3I6IFswLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlICgsKSBzZW50ZW5jZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIHNlbnRlbmNlIG9uZS5dKSdcIiAgICBzZW4udGVuY2UgLnR3by5cbiAgICAgICAgICBoZXJlLiAgc2VudGVuY2UgdGhyZWVcbiAgICAgICAgICBtb3JlIHRocmVlXG5cbiAgICAgICAgICAgICBzZW50ZW5jZSBmb3VyXG5cblxuICAgICAgICAgIHNlbnRlbmNlIGZpdmUuXG4gICAgICAgICAgbW9yZSBmaXZlXG4gICAgICAgICAgbW9yZSBzaXhcblxuICAgICAgICAgICBsYXN0IHNlbnRlbmNlXG4gICAgICAgICAgYWxsIGRvbmUgc2V2ZW5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzAsIDIxXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFs0LCAzXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFs1LCAwXSAjIGJvdW5kYXJ5IGlzIGRpZmZlcmVudCBieSBkaXJlY3Rpb25cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMTAsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzExLCAxXVxuXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEyLCAxM11cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMTIsIDEzXVxuXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzExLCAxXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxMCwgMF1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbNiwgMF0gIyBib3VuZGFyeSBpcyBkaWZmZXJlbnQgYnkgZGlyZWN0aW9uXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzQsIDNdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzEsIDddXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzAsIDIxXVxuXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwic2tpcHMgdG8gYmVnaW5uaW5nIG9mIHNlbnRlbmNlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAxNV1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbNCwgM11cblxuICAgICAgaXQgXCJzdXBwb3J0cyBhIGNvdW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzMgKScsIGN1cnNvcjogWzEsIDddXG4gICAgICAgIGVuc3VyZSAnMyAoJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJjYW4gbW92ZSBzdGFydCBvZiBidWZmZXIgb3IgZW5kIG9mIGJ1ZmZlciBhdCBtYXhpbXVtXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzIgMCApJywgY3Vyc29yOiBbMTIsIDEzXVxuICAgICAgICBlbnN1cmUgJzIgMCAoJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJzZW50ZW5jZSBtb3Rpb24gd2l0aCBza2lwLWJsYW5rLXJvd1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgICAnZyApJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LXNlbnRlbmNlLXNraXAtYmxhbmstcm93J1xuICAgICAgICAgICAgICAnZyAoJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1zZW50ZW5jZS1za2lwLWJsYW5rLXJvdydcblxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgc2VudGVuY2VcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzAsIDIxXVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEsIDddXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFs0LCAzXVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFsxMSwgMV1cblxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbMTIsIDEzXVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbMTIsIDEzXVxuXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFsxMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFs3LCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzEsIDddXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMCwgMjFdXG5cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJtb3ZpbmcgaW5zaWRlIGEgYmxhbmsgZG9jdW1lbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fX19fXG4gICAgICAgICAgX19fX19cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJtb3ZlcyB3aXRob3V0IGNyYXNoaW5nXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJzZW50ZW5jZSBvbmUuIHNlbnRlbmNlIHR3by5cXG4gIHNlbnRlbmNlIHRocmVlLlwiXG5cbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgc2VudGVuY2UnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjBdXG4gICAgICAgIGVuc3VyZSAneSApJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiY2UgdHdvLlxcbiAgXCJcblxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgY3VycmVudCBzZW50ZW5jZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyMF1cbiAgICAgICAgZW5zdXJlICd5ICgnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJzZW50ZW5cIlxuXG4gIGRlc2NyaWJlIFwidGhlIHssfSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuXG5cblxuICAgICAgICAzOiBwYXJhZ3JhcGgtMVxuICAgICAgICA0OiBwYXJhZ3JhcGgtMVxuXG5cblxuICAgICAgICA4OiBwYXJhZ3JhcGgtMlxuXG5cblxuICAgICAgICAxMjogcGFyYWdyYXBoLTNcbiAgICAgICAgMTM6IHBhcmFncmFwaC0zXG5cblxuICAgICAgICAxNjogcGFyYWdwcmFoLTRcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ30nLCBjdXJzb3I6IFs1LCAwXVxuICAgICAgICBlbnN1cmUgJ30nLCBjdXJzb3I6IFs5LCAwXVxuICAgICAgICBlbnN1cmUgJ30nLCBjdXJzb3I6IFsxNCwgMF1cbiAgICAgICAgZW5zdXJlICd7JywgY3Vyc29yOiBbMTEsIDBdXG4gICAgICAgIGVuc3VyZSAneycsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgIGVuc3VyZSAneycsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGl0IFwic3VwcG9ydCBjb3VudFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczIH0nLCBjdXJzb3I6IFsxNCwgMF1cbiAgICAgICAgZW5zdXJlICczIHsnLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcImNhbiBtb3ZlIHN0YXJ0IG9mIGJ1ZmZlciBvciBlbmQgb2YgYnVmZmVyIGF0IG1heGltdW1cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMSAwIH0nLCBjdXJzb3I6IFsxNiwgMTRdXG4gICAgICAgIGVuc3VyZSAnMSAwIHsnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCBwYXJhZ3JhcGgnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZW5zdXJlICd5IH0nLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJwYXJhZ3JhcGgtMVxcbjQ6IHBhcmFncmFwaC0xXFxuXCJcbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgcGFyYWdyYXBoJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDNdXG4gICAgICAgIGVuc3VyZSAneSB7JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiXFxuMzogcGFyYWdyYXBoLTFcXG40OiBcIlxuXG4gIGRlc2NyaWJlIFwidGhlIGIga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIiBhYiBjZGUxKy0gXFxuIHh5elxcblxcbnppcCB9XFxuIGxhc3RcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMV1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHByZXZpb3VzIHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdiJywgY3Vyc29yOiBbMywgNF1cbiAgICAgICAgZW5zdXJlICdiJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICdiJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdiJywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICdiJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgICAgZW5zdXJlICdiJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdiJywgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICAjIEdvIHRvIHN0YXJ0IG9mIHRoZSBmaWxlLCBhZnRlciBtb3ZpbmcgcGFzdCB0aGUgZmlyc3Qgd29yZFxuICAgICAgICBlbnN1cmUgJ2InLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAjIFN0YXkgYXQgdGhlIHN0YXJ0IG9mIHRoZSBmaWxlXG4gICAgICAgIGVuc3VyZSAnYicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhpbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSAneSBiJywgY3Vyc29yOiBbMCwgMV0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYSdcblxuICAgICAgZGVzY3JpYmUgXCJiZXR3ZWVuIHdvcmRzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsYXN0IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJ3kgYicsIGN1cnNvcjogWzAsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiICdcblxuICBkZXNjcmliZSBcInRoZSBCIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgY2RlMSstIGFiXG4gICAgICAgICAgXFx0IHh5ei0xMjNcblxuICAgICAgICAgICB6aXBcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBwcmV2aW91cyB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzMsIDFdXG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnQicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgd2hvbGUgd29yZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgOF1cbiAgICAgICAgZW5zdXJlICd5IEInLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ3h5ei0xMicgIyBiZWNhdXNlIGN1cnNvciBpcyBvbiB0aGUgYDNgXG5cbiAgICAgIGl0IFwiZG9lc24ndCBnbyBwYXN0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiYydcbiAgICAgICAgZW5zdXJlICd5IEInLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiYydcblxuICBkZXNjcmliZSBcInRoZSBeIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dEM6IFwifCAgYWJjZGVcIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ14nLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBeJyxcbiAgICAgICAgICAgIHRleHQ6ICdhYmNkZSdcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBJJywgdGV4dDogJ2FiY2RlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic3RheXMgcHV0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdeJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRvZXMgbm90aGluZ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBeJyxcbiAgICAgICAgICAgIHRleHQ6ICcgIGFiY2RlJ1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgd29yZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXicsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZScsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIF4nLFxuICAgICAgICAgICAgdGV4dDogJyAgY2RlJ1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZScsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIEknLCB0ZXh0OiAnICBjZGUnLCBjdXJzb3I6IFswLCAyXSxcblxuICBkZXNjcmliZSBcInRoZSAwIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCIgIGFiY2RlXCIsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNvbHVtblwiLCAtPlxuICAgICAgICBlbnN1cmUgJzAnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGZpcnN0IGNvbHVtbiBvZiB0aGUgbGluZScsIC0+XG4gICAgICAgIGVuc3VyZSAnZCAwJywgdGV4dDogJ2NkZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgfCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiICBhYmNkZVwiLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBudW1iZXIgY29sdW1uXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnfCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMSB8JywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczIHwnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJzQgfCcsIGN1cnNvcjogWzAsIDNdXG5cbiAgICBkZXNjcmliZSBcImFzIG9wZXJhdG9yJ3MgdGFyZ2V0XCIsIC0+XG4gICAgICBpdCAnYmVoYXZlIGV4Y2x1c2l2ZWx5JywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZCA0IHwnLCB0ZXh0OiAnYmNkZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgJCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiICBhYmNkZVxcblxcbjEyMzQ1Njc4OTBcIlxuICAgICAgICBjdXJzb3I6IFswLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvbiBmcm9tIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgIyBGSVhNRTogU2VlIGF0b20vdmltLW1vZGUjMlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbMCwgNl1cblxuICAgICAgaXQgXCJzZXQgZ29hbENvbHVtbiBJbmZpbml0eVwiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKG51bGwpXG4gICAgICAgIGVuc3VyZSAnJCcsIGN1cnNvcjogWzAsIDZdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG5cbiAgICAgIGl0IFwic2hvdWxkIHJlbWFpbiBpbiB0aGUgbGFzdCBjb2x1bW4gd2hlbiBtb3ZpbmcgZG93blwiLCAtPlxuICAgICAgICBlbnN1cmUgJyQgaicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDldXG5cbiAgICAgIGl0IFwic3VwcG9ydCBjb3VudFwiLCAtPlxuICAgICAgICBlbnN1cmUgJzMgJCcsIGN1cnNvcjogWzIsIDldXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgbGluZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkICQnLFxuICAgICAgICAgIHRleHQ6IFwiICBhYlxcblxcbjEyMzQ1Njc4OTBcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgMCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiICBhXFxuXCIsIGN1cnNvcjogWzAsIDJdLFxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICcwJywgY3Vyc29yOiBbMCwgMF1cblxuICBkZXNjcmliZSBcInRoZSAtIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgIGFiY2RlZmdcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBhYmNcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIG1pZGRsZSBvZiBhIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBsYXN0IGNoYXJhY3RlciBvZiB0aGUgcHJldmlvdXMgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnLScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGFuZCBwcmV2aW91cyBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIC0nLCB0ZXh0OiBcIiAgYWJjXFxuXCIsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBhIGxpbmUgaW5kZW50ZWQgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzIG9uZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmUgKGRpcmVjdGx5IGFib3ZlKVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnLScsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmUgKGRpcmVjdGx5IGFib3ZlKVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAtJywgdGV4dDogXCJhYmNkZWZnXFxuXCJcbiAgICAgICAgICAjIGNvbW1lbnRlZCBvdXQgYmVjYXVzZSB0aGUgY29sdW1uIGlzIHdyb25nIGR1ZSB0byBhIGJ1ZyBpbiBga2A7IHJlLWVuYWJsZSB3aGVuIGBrYCBpcyBmaXhlZFxuICAgICAgICAgICNleHBlY3QoZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGJlZ2lubmluZyBvZiBhIGxpbmUgcHJlY2VkZWQgYnkgYW4gaW5kZW50ZWQgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgcHJldmlvdXMgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnLScsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgLScsIHRleHQ6IFwiYWJjZGVmZ1xcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSBjb3VudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjFcXG4yXFxuM1xcbjRcXG41XFxuNlxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGF0IG1hbnkgbGluZXMgcHJldmlvdXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzMgLScsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgcGx1cyB0aGF0IG1hbnkgcHJldmlvdXMgbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgMyAtJyxcbiAgICAgICAgICAgIHRleHQ6IFwiMVxcbjZcXG5cIixcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdLFxuXG4gIGRlc2NyaWJlIFwidGhlICsga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICBfX2FiY1xuICAgICAgX19hYmNcbiAgICAgIGFiY2RlZmdcXG5cbiAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBtaWRkbGUgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJysnLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBhbmQgbmV4dCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkICsnLCB0ZXh0OiBcIiAgYWJjXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIGEgbGluZSBpbmRlbnRlZCB0aGUgc2FtZSBhcyB0aGUgbmV4dCBvbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmUgKGRpcmVjdGx5IGJlbG93KVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnKycsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIG5leHQgbGluZSAoZGlyZWN0bHkgYmVsb3cpXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkICsnLCB0ZXh0OiBcImFiY2RlZmdcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lIGZvbGxvd2VkIGJ5IGFuIGluZGVudGVkIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnKycsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCArJyxcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjZGVmZ1xcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxXFxuMlxcbjNcXG40XFxuNVxcbjZcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhhdCBtYW55IGxpbmVzIGZvbGxvd2luZ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnMyArJywgY3Vyc29yOiBbNCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZSBwbHVzIHRoYXQgbWFueSBmb2xsb3dpbmcgbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgMyArJyxcbiAgICAgICAgICAgIHRleHQ6IFwiMVxcbjZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICBkZXNjcmliZSBcInRoZSBfIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBfX2FiY1xuICAgICAgICBhYmNkZWZnXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBtaWRkbGUgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFsxLCAzXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ18nLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIF8nLFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgX19hYmNcbiAgICAgICAgICAgIGFiY2RlZmdcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMVxcbjJcXG4zXFxuNFxcbjVcXG42XFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoYXQgbWFueSBsaW5lcyBmb2xsb3dpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzMgXycsIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgcGx1cyB0aGF0IG1hbnkgZm9sbG93aW5nIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIDMgXycsXG4gICAgICAgICAgICB0ZXh0OiBcIjFcXG41XFxuNlxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIGVudGVyIGtleWJpbmRpbmdcIiwgLT5cbiAgICAjIFtGSVhNRV0gRGlydHkgdGVzdCwgd2hhdHMgdGhpcyE/XG4gICAgc3RhcnRpbmdUZXh0ID0gXCIgIGFiY1xcbiAgYWJjXFxuYWJjZGVmZ1xcblwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIG1pZGRsZSBvZiBhIGxpbmVcIiwgLT5cbiAgICAgIHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb24gPSBbMSwgM11cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcImFjdHMgdGhlIHNhbWUgYXMgdGhlICsga2V5YmluZGluZ1wiLCAtPlxuICAgICAgICAgICMgZG8gaXQgd2l0aCArIGFuZCBzYXZlIHRoZSByZXN1bHRzXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBzdGFydGluZ1RleHRcbiAgICAgICAgICAgIGN1cnNvcjogc3RhcnRpbmdDdXJzb3JQb3NpdGlvblxuICAgICAgICAgIGtleXN0cm9rZSAnKydcbiAgICAgICAgICByZWZlcmVuY2VDdXJzb3JQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBzdGFydGluZ1RleHRcbiAgICAgICAgICAgIGN1cnNvcjogc3RhcnRpbmdDdXJzb3JQb3NpdGlvblxuICAgICAgICAgIGVuc3VyZSAnZW50ZXInLFxuICAgICAgICAgICAgY3Vyc29yOiByZWZlcmVuY2VDdXJzb3JQb3NpdGlvblxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiYWN0cyB0aGUgc2FtZSBhcyB0aGUgKyBrZXliaW5kaW5nXCIsIC0+XG4gICAgICAgICAgIyBkbyBpdCB3aXRoICsgYW5kIHNhdmUgdGhlIHJlc3VsdHNcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IHN0YXJ0aW5nVGV4dFxuICAgICAgICAgICAgY3Vyc29yOiBzdGFydGluZ0N1cnNvclBvc2l0aW9uXG5cbiAgICAgICAgICBrZXlzdHJva2UgJ2QgKydcbiAgICAgICAgICByZWZlcmVuY2VUZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgICAgICAgIHJlZmVyZW5jZUN1cnNvclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcblxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogc3RhcnRpbmdUZXh0XG4gICAgICAgICAgICBjdXJzb3I6IHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb25cbiAgICAgICAgICBlbnN1cmUgJ2QgZW50ZXInLFxuICAgICAgICAgICAgdGV4dDogcmVmZXJlbmNlVGV4dFxuICAgICAgICAgICAgY3Vyc29yOiByZWZlcmVuY2VDdXJzb3JQb3NpdGlvblxuXG4gIGRlc2NyaWJlIFwidGhlIGdnIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgIDFhYmNcbiAgICAgICAgICAgMlxuICAgICAgICAgIDNcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsIG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpcnN0IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgZycsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgaXQgXCJtb3ZlIHRvIHNhbWUgcG9zaXRpb24gaWYgaXRzIG9uIGZpcnN0IGxpbmUgYW5kIGZpcnN0IGNoYXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgZycsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbGluZXdpc2UgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBsaW5lIGluIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIGcgZycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiIDFhYmNcXG4gMlxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImluIGNoYXJhY3Rlcndpc2UgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGZpcnN0IGxpbmUgaW4gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgZyBnJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIxYWJjXFxuIDJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBjb3VudCBzcGVjaWZpZWRcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsIG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGZpcnN0IGNoYXIgb2YgYSBzcGVjaWZpZWQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnMiBnIGcnLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBkZXNjcmliZSBcImluIGxpbmV3aXNlIHZpc3VhbCBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIGEgc3BlY2lmaWVkIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1YgMiBnIGcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIiAyXFxuM1xcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImluIGNoYXJhY3Rlcndpc2UgdmlzdWFsIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gYSBmaXJzdCBjaGFyYWN0ZXIgb2Ygc3BlY2lmaWVkIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3YgMiBnIGcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjJcXG4zXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZ18ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICAgIDFfX1xuICAgICAgICAgICAgMl9fXG4gICAgICAgICAzYWJjXG4gICAgICAgIF9cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGxhc3Qgbm9uYmxhbmsgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgXycsIGN1cnNvcjogWzEsIDRdXG5cbiAgICAgIGl0IFwid2lsbCBtb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZSBpZiBuZWNlc3NhcnlcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBfJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSByZXBlYXRlZCBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciBkb3dud2FyZCBhbmQgb3V0d2FyZFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcyIGcgXycsIGN1cnNvcjogWzEsIDRdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdHMgdGhlIGN1cnJlbnQgbGluZSBleGNsdWRpbmcgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgZW5zdXJlICd2IDIgZyBfJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiICAyICBcXG4gM2FiY1wiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgRyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgMVxuICAgICAgICBfX19fMlxuICAgICAgICBfM2FiY1xuICAgICAgICBfXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBsYXN0IGxpbmUgYWZ0ZXIgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0cnLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHJlcGVhdGVkIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGEgc3BlY2lmaWVkIGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICcyIEcnLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBsYXN0IGxpbmUgaW4gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAndiBHJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiICAgIDJcXG4gM2FiY1xcbiBcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDFdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgTiUga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBbMC4uOTk5XS5qb2luKFwiXFxuXCIpXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcInB1dCBjdXJzb3Igb24gbGluZSBzcGVjaWZpZWQgYnkgcGVyY2VudFwiLCAtPlxuICAgICAgaXQgXCI1MCVcIiwgLT4gZW5zdXJlICc1IDAgJScsIGN1cnNvcjogWzQ5OSwgMF1cbiAgICAgIGl0IFwiMzAlXCIsIC0+IGVuc3VyZSAnMyAwICUnLCBjdXJzb3I6IFsyOTksIDBdXG4gICAgICBpdCBcIjEwMCVcIiwgLT4gZW5zdXJlICcxIDAgMCAlJywgY3Vyc29yOiBbOTk5LCAwXVxuICAgICAgaXQgXCIxMjAlXCIsIC0+IGVuc3VyZSAnMSAyIDAgJScsIGN1cnNvcjogWzk5OSwgMF1cblxuICBkZXNjcmliZSBcInRoZSBILCBNLCBMIGtleWJpbmRpbmdcIiwgLT5cbiAgICBbZWVsXSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWVsID0gZWRpdG9yRWxlbWVudFxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMVxuICAgICAgICAgIDJcbiAgICAgICAgICAzXG4gICAgICAgICAgNFxuICAgICAgICAgICAgNVxuICAgICAgICAgIDZcbiAgICAgICAgICA3XG4gICAgICAgICAgOFxuICAgICAgICAgIDlcbiAgICAgICAgICAgIDEwXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzgsIDBdXG5cbiAgICBkZXNjcmliZSBcInRoZSBIIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbm9uLWJsYW5rLWNoYXIgb24gZmlyc3Qgcm93IGlmIHZpc2libGVcIiwgLT5cbiAgICAgICAgc3B5T24oZWVsLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDApXG4gICAgICAgIGVuc3VyZSAnSCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbm9uLWJsYW5rLWNoYXIgb24gZmlyc3QgdmlzaWJsZSByb3cgcGx1cyBzY3JvbGwgb2Zmc2V0XCIsIC0+XG4gICAgICAgIHNweU9uKGVlbCwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigyKVxuICAgICAgICBlbnN1cmUgJ0gnLCBjdXJzb3I6IFs0LCAyXVxuXG4gICAgICBpdCBcInJlc3BlY3RzIGNvdW50c1wiLCAtPlxuICAgICAgICBzcHlPbihlZWwsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMClcbiAgICAgICAgZW5zdXJlICc0IEgnLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgTCBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gbm9uLWJsYW5rLWNoYXIgb24gbGFzdCByb3cgaWYgdmlzaWJsZVwiLCAtPlxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybig5KVxuICAgICAgICBlbnN1cmUgJ0wnLCBjdXJzb3I6IFs5LCAyXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IHZpc2libGUgcm93IHBsdXMgb2Zmc2V0XCIsIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDcpXG4gICAgICAgIGVuc3VyZSAnTCcsIGN1cnNvcjogWzQsIDJdXG5cbiAgICAgIGl0IFwicmVzcGVjdHMgY291bnRzXCIsIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDkpXG4gICAgICAgIGVuc3VyZSAnMyBMJywgY3Vyc29yOiBbNywgMF1cblxuICAgIGRlc2NyaWJlIFwidGhlIE0ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihlZWwsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMClcbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMTApXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbm9uLWJsYW5rLWNoYXIgb2YgbWlkZGxlIG9mIHNjcmVlblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ00nLCBjdXJzb3I6IFs0LCAyXVxuXG4gIGRlc2NyaWJlIFwibW92ZVRvRmlyc3RDaGFyYWN0ZXJPblZlcnRpY2FsTW90aW9uIHNldHRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXR0aW5ncy5zZXQoJ21vdmVUb0ZpcnN0Q2hhcmFjdGVyT25WZXJ0aWNhbE1vdGlvbicsIGZhbHNlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAgMDAwMDAwMDAwMDAwXG4gICAgICAgICAgMSAxMTExMTExMTExMTFcbiAgICAgICAgMiAyMjIyMjIyMjIyMjJcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzIsIDEwXVxuXG4gICAgZGVzY3JpYmUgXCJnZywgRywgTiVcIiwgLT5cbiAgICAgIGl0IFwiZ28gdG8gcm93IHdpdGgga2VlcCBjb2x1bW4gYW5kIHJlc3BlY3QgY3Vyc29yLmdvYWxDb2x1bVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgZycsIGN1cnNvcjogWzAsIDEwXVxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFswLCAxNV1cbiAgICAgICAgZW5zdXJlICdHJywgY3Vyc29yOiBbMiwgMTNdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICAgIGVuc3VyZSAnMSAlJywgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICAgIGVuc3VyZSAnMSAwIGgnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJzUgMCAlJywgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgZW5zdXJlICcxIDAgMCAlJywgY3Vyc29yOiBbMiwgNV1cblxuICAgIGRlc2NyaWJlIFwiSCwgTSwgTFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDApXG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDMpXG5cbiAgICAgIGl0IFwiZ28gdG8gcm93IHdpdGgga2VlcCBjb2x1bW4gYW5kIHJlc3BlY3QgY3Vyc29yLmdvYWxDb2x1bVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0gnLCBjdXJzb3I6IFswLCAxMF1cbiAgICAgICAgZW5zdXJlICdNJywgY3Vyc29yOiBbMSwgMTBdXG4gICAgICAgIGVuc3VyZSAnTCcsIGN1cnNvcjogWzIsIDEwXVxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFsyLCAxM11cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcbiAgICAgICAgZW5zdXJlICdIJywgY3Vyc29yOiBbMCwgMTVdXG4gICAgICAgIGVuc3VyZSAnTScsIGN1cnNvcjogWzEsIDE1XVxuICAgICAgICBlbnN1cmUgJ0wnLCBjdXJzb3I6IFsyLCAxM11cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcblxuICBkZXNjcmliZSAndGhlIG1hcmsga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMlxuICAgICAgICAgICAgMzRcbiAgICAgICAgNTZcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCAnbW92ZXMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZSBvZiBhIG1hcmsnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlIFwiJyBhXCIsIGN1cnNvcjogWzEsIDRdXG5cbiAgICBpdCAnbW92ZXMgbGl0ZXJhbGx5IHRvIGEgbWFyaycsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgIGtleXN0cm9rZSAnbSBhJ1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2AgYScsIGN1cnNvcjogWzEsIDJdXG5cbiAgICBpdCAnZGVsZXRlcyB0byBhIG1hcmsgYnkgbGluZScsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgIGtleXN0cm9rZSAnbSBhJ1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgXCJkICcgYVwiLCB0ZXh0OiAnNTZcXG4nXG5cbiAgICBpdCAnZGVsZXRlcyBiZWZvcmUgdG8gYSBtYXJrIGxpdGVyYWxseScsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgIGtleXN0cm9rZSAnbSBhJ1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJ2QgYCBhJywgdGV4dDogJyAgNFxcbjU2XFxuJ1xuXG4gICAgaXQgJ2RlbGV0ZXMgYWZ0ZXIgdG8gYSBtYXJrIGxpdGVyYWxseScsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgIGtleXN0cm9rZSAnbSBhJ1xuICAgICAgc2V0IGN1cnNvcjogWzIsIDFdXG4gICAgICBlbnN1cmUgJ2QgYCBhJywgdGV4dDogJyAgMTJcXG4gICAgMzZcXG4nXG5cbiAgICBpdCAnbW92ZXMgYmFjayB0byBwcmV2aW91cycsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgIGtleXN0cm9rZSAnYCBgJ1xuICAgICAgc2V0IGN1cnNvcjogWzIsIDFdXG4gICAgICBlbnN1cmUgJ2AgYCcsIGN1cnNvcjogWzEsIDVdXG5cbiAgZGVzY3JpYmUgXCJqdW1wIGNvbW1hbmQgdXBkYXRlIGAgYW5kICcgbWFya1wiLCAtPlxuICAgIGVuc3VyZU1hcmsgPSAoX2tleXN0cm9rZSwgb3B0aW9uKSAtPlxuICAgICAga2V5c3Ryb2tlKF9rZXlzdHJva2UpXG4gICAgICBlbnN1cmUgY3Vyc29yOiBvcHRpb24uY3Vyc29yXG4gICAgICBlbnN1cmUgbWFyazogXCJgXCI6IG9wdGlvbi5tYXJrXG4gICAgICBlbnN1cmUgbWFyazogXCInXCI6IG9wdGlvbi5tYXJrXG5cbiAgICBlbnN1cmVKdW1wQW5kQmFjayA9IChrZXlzdHJva2UsIG9wdGlvbikgLT5cbiAgICAgIGluaXRpYWwgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgZW5zdXJlTWFyayBrZXlzdHJva2UsIGN1cnNvcjogb3B0aW9uLmN1cnNvciwgbWFyazogaW5pdGlhbFxuICAgICAgYWZ0ZXJNb3ZlID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGV4cGVjdChpbml0aWFsLmlzRXF1YWwoYWZ0ZXJNb3ZlKSkudG9CZShmYWxzZSlcbiAgICAgIGVuc3VyZU1hcmsgXCJgIGBcIiwgY3Vyc29yOiBpbml0aWFsLCBtYXJrOiBvcHRpb24uY3Vyc29yXG5cbiAgICBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlID0gKGtleXN0cm9rZSwgb3B0aW9uKSAtPlxuICAgICAgaW5pdGlhbCA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBleHBlY3QoaW5pdGlhbC5jb2x1bW4pLm5vdC50b0JlKDApXG4gICAgICBlbnN1cmVNYXJrIGtleXN0cm9rZSwgY3Vyc29yOiBvcHRpb24uY3Vyc29yLCBtYXJrOiBpbml0aWFsXG4gICAgICBhZnRlck1vdmUgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgZXhwZWN0KGluaXRpYWwuaXNFcXVhbChhZnRlck1vdmUpKS50b0JlKGZhbHNlKVxuICAgICAgZW5zdXJlTWFyayBcIicgJ1wiLCBjdXJzb3I6IFtpbml0aWFsLnJvdywgMF0sIG1hcms6IG9wdGlvbi5jdXJzb3JcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGZvciBtYXJrIGluIFwiYCdcIlxuICAgICAgICB2aW1TdGF0ZS5tYXJrLm1hcmtzW21hcmtdPy5kZXN0cm95KClcbiAgICAgICAgdmltU3RhdGUubWFyay5tYXJrc1ttYXJrXSA9IG51bGxcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAwOiBvbyAwXG4gICAgICAgIDE6IDExMTFcbiAgICAgICAgMjogMjIyMlxuICAgICAgICAzOiBvbyAzXG4gICAgICAgIDQ6IDQ0NDRcbiAgICAgICAgNTogb28gNVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwiaW5pdGlhbCBzdGF0ZVwiLCAtPlxuICAgICAgaXQgXCJyZXR1cm4gWzAsIDBdXCIsIC0+XG4gICAgICAgIGVuc3VyZSBtYXJrOiBcIidcIjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSBtYXJrOiBcImBcIjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImp1bXAgbW90aW9uIGluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICBpbml0aWFsID0gWzMsIDNdXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZ2V0VmlldyhhdG9tLndvcmtzcGFjZSkpICMgZm9yIEwsIE0sIEhcbiAgICAgICAgZW5zdXJlIG1hcms6IFwiJ1wiOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlIG1hcms6IFwiYFwiOiBbMCwgMF1cbiAgICAgICAgc2V0IGN1cnNvcjogaW5pdGlhbFxuXG4gICAgICBpdCBcIkcganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrICdHJywgY3Vyc29yOiBbNSwgMF1cbiAgICAgIGl0IFwiZyBnIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcImcgZ1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCIxMDAgJSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCIxIDAgMCAlXCIsIGN1cnNvcjogWzUsIDBdXG4gICAgICBpdCBcIikganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiKVwiLCBjdXJzb3I6IFs1LCA2XVxuICAgICAgaXQgXCIoIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIihcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiXSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJdXCIsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIlsganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiW1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCJ9IGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIn1cIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwieyBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJ7XCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIkwganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiTFwiLCBjdXJzb3I6IFs1LCAwXVxuICAgICAgaXQgXCJIIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIkhcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiTSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJNXCIsIGN1cnNvcjogWzIsIDBdXG4gICAgICBpdCBcIioganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiKlwiLCBjdXJzb3I6IFs1LCAzXVxuXG4gICAgICAjIFtCVUddIFN0cmFuZ2UgYnVnIG9mIGphc21pbmUgb3IgYXRvbSdzIGphc21pbmUgZW5oYW5jbWVudD9cbiAgICAgICMgVXNpbmcgc3ViamVjdCBcIiMganVtcCAmIGJhY2tcIiBza2lwcyBzcGVjLlxuICAgICAgIyBOb3RlIGF0IEF0b20gdjEuMTEuMlxuICAgICAgaXQgXCJTaGFycCgjKSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2soJyMnLCBjdXJzb3I6IFswLCAzXSlcblxuICAgICAgaXQgXCIvIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBbXCIvXCIsIHNlYXJjaDogJ29vJ10sIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIj8ganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFtcIj9cIiwgc2VhcmNoOiAnb28nXSwgY3Vyc29yOiBbMCwgM11cblxuICAgICAgaXQgXCJuIGp1bXAmYmFja1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlIFsnLycsIHNlYXJjaDogJ29vJ10sIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZUp1bXBBbmRCYWNrIFwiblwiLCBjdXJzb3I6IFszLCAzXVxuICAgICAgICBlbnN1cmVKdW1wQW5kQmFjayBcIk5cIiwgY3Vyc29yOiBbNSwgM11cblxuICAgICAgaXQgXCJOIGp1bXAmYmFja1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlIFsnPycsIHNlYXJjaDogJ29vJ10sIGN1cnNvcjogWzUsIDNdXG4gICAgICAgIGVuc3VyZUp1bXBBbmRCYWNrIFwiblwiLCBjdXJzb3I6IFszLCAzXVxuICAgICAgICBlbnN1cmVKdW1wQW5kQmFjayBcIk5cIiwgY3Vyc29yOiBbMCwgM11cblxuICAgICAgaXQgXCJHIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlICdHJywgY3Vyc29yOiBbNSwgMF1cbiAgICAgIGl0IFwiZyBnIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiZyBnXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIjEwMCAlIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiMSAwIDAgJVwiLCBjdXJzb3I6IFs1LCAwXVxuICAgICAgaXQgXCIpIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiKVwiLCBjdXJzb3I6IFs1LCA2XVxuICAgICAgaXQgXCIoIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiKFwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJdIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiXVwiLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCJbIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiW1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCJ9IGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwifVwiLCBjdXJzb3I6IFs1LCA2XVxuICAgICAgaXQgXCJ7IGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwie1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJMIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiTFwiLCBjdXJzb3I6IFs1LCAwXVxuICAgICAgaXQgXCJIIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiSFwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJNIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiTVwiLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgaXQgXCIqIGp1bXAmYmFjayBsaW5ld2lzZVwiLCAtPiBlbnN1cmVKdW1wQW5kQmFja0xpbmV3aXNlIFwiKlwiLCBjdXJzb3I6IFs1LCAzXVxuXG4gIGRlc2NyaWJlICd0aGUgViBrZXliaW5kaW5nJywgLT5cbiAgICBbdGV4dF0gPSBbXVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgIDAxXG4gICAgICAgIDAwMlxuICAgICAgICAwMDAzXG4gICAgICAgIDAwMDA0XG4gICAgICAgIDAwMDAwNVxcblxuICAgICAgICBcIlwiXCJcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiB0ZXh0LmdldFJhdygpXG4gICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgICBpdCBcInNlbGVjdHMgZG93biBhIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBqIGonLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEuLjNdKVxuXG4gICAgaXQgXCJzZWxlY3RzIHVwIGEgbGluZVwiLCAtPlxuICAgICAgZW5zdXJlICdWIGsnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjFdKVxuXG4gIGRlc2NyaWJlICdNb3ZlVG8oUHJldmlvdXN8TmV4dClGb2xkKFN0YXJ0fEVuZCknLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG4gICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmNvZmZlZScsIChzdGF0ZSwgdmltKSAtPlxuICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnWyBbJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1mb2xkLXN0YXJ0J1xuICAgICAgICAgICAgJ10gWyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1mb2xkLXN0YXJ0J1xuICAgICAgICAgICAgJ1sgXSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtZm9sZC1lbmQnXG4gICAgICAgICAgICAnXSBdJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LWZvbGQtZW5kJ1xuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzMwLCAwXVxuICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0IGNoYXIgb2YgcHJldmlvdXMgZm9sZCBzdGFydCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFsyMiwgNl1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFsyMCwgNl1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFsxOCwgNF1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFs5LCAyXVxuICAgICAgICBlbnN1cmUgJ1sgWycsIGN1cnNvcjogWzgsIDBdXG5cbiAgICBkZXNjcmliZSBcIk1vdmVUb05leHRGb2xkU3RhcnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBuZXh0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbOCwgMF1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFs5LCAyXVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzE4LCA0XVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzIwLCA2XVxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzIyLCA2XVxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9QcmV2aXNGb2xkRW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszMCwgMF1cbiAgICAgIGl0IFwibW92ZSB0byBmaXJzdCBjaGFyIG9mIHByZXZpb3VzIGZvbGQgZW5kIHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzI4LCAyXVxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzI1LCA0XVxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzIzLCA4XVxuICAgICAgICBlbnN1cmUgJ1sgXScsIGN1cnNvcjogWzIxLCA4XVxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9OZXh0Rm9sZEVuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwibW92ZSB0byBmaXJzdCBjaGFyIG9mIG5leHQgZm9sZCBlbmQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMjEsIDhdXG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMjMsIDhdXG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMjUsIDRdXG4gICAgICAgIGVuc3VyZSAnXSBdJywgY3Vyc29yOiBbMjgsIDJdXG5cbiAgZGVzY3JpYmUgJ01vdmVUbyhQcmV2aW91c3xOZXh0KVN0cmluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgcyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1zdHJpbmcnXG4gICAgICAgICAgJ2cgUyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtc3RyaW5nJ1xuXG4gICAgZGVzY3JpYmUgJ2VkaXRvciBmb3Igc29mdFRhYicsIC0+XG4gICAgICBwYWNrID0gJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBkaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICAgICAgICAgIGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgICAgICAgICAnY2hlY2stdXAnOiAtPiBmdW4oJ2JhY2t3YXJkJylcbiAgICAgICAgICAgICAgJ2NoZWNrLWRvd24nOiAtPiBmdW4oJ2ZvcndhcmQnKVxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGdyYW1tYXI6ICdzb3VyY2UuY29mZmVlJ1xuXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBpdCBcIm1vdmUgdG8gbmV4dCBzdHJpbmdcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMSwgMzFdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3I6IFsyLCAyMV1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvcjogWzMsIDIzXVxuICAgICAgaXQgXCJtb3ZlIHRvIHByZXZpb3VzIHN0cmluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFszLCAyM11cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvcjogWzIsIDIxXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yOiBbMSwgMzFdXG4gICAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMyBnIHMnLCBjdXJzb3I6IFsyLCAyMV1cbiAgICAgICAgZW5zdXJlICczIGcgUycsIGN1cnNvcjogWzEsIDMxXVxuXG4gICAgZGVzY3JpYmUgJ2VkaXRvciBmb3IgaGFyZFRhYicsIC0+XG4gICAgICBwYWNrID0gJ2xhbmd1YWdlLWdvJ1xuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgIGdldFZpbVN0YXRlICdzYW1wbGUuZ28nLCAoc3RhdGUsIHZpbUVkaXRvcikgLT5cbiAgICAgICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHN0YXRlXG4gICAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltRWRpdG9yXG5cbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIGl0IFwibW92ZSB0byBuZXh0IHN0cmluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsyLCA3XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzMsIDddXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbOCwgOF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFs5LCA4XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzExLCAyMF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxMiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMTMsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzE1LCAxNV1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxNiwgMTVdXG4gICAgICBpdCBcIm1vdmUgdG8gcHJldmlvdXMgc3RyaW5nXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFsxOCwgMF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsxNiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTUsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzEzLCAxNV1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsxMiwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTEsIDIwXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzksIDhdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbOCwgOF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFszLCA3XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzIsIDddXG5cbiAgZGVzY3JpYmUgJ01vdmVUbyhQcmV2aW91c3xOZXh0KU51bWJlcicsIC0+XG4gICAgcGFjayA9ICdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0J1xuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIG4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtbnVtYmVyJ1xuICAgICAgICAgICdnIE4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLW51bWJlcidcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0IGdyYW1tYXI6ICdzb3VyY2UuY29mZmVlJ1xuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIG51bTEgPSAxXG4gICAgICAgIGFycjEgPSBbMSwgMTAxLCAxMDAxXVxuICAgICAgICBhcnIyID0gW1wiMVwiLCBcIjJcIiwgXCIzXCJdXG4gICAgICAgIG51bTIgPSAyXG4gICAgICAgIGZ1bihcIjFcIiwgMiwgMylcbiAgICAgICAgXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2spXG5cbiAgICBpdCBcIm1vdmUgdG8gbmV4dCBudW1iZXJcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFswLCA3XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFsxLCA4XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFsxLCAxMV1cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMSwgMTZdXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzMsIDddXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzQsIDldXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzQsIDEyXVxuICAgIGl0IFwibW92ZSB0byBwcmV2aW91cyBudW1iZXJcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFs1LCAwXVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFs0LCAxMl1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbNCwgOV1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMywgN11cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMSwgMTZdXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzEsIDExXVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFsxLCA4XVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFswLCA3XVxuICAgIGl0IFwic3VwcG9ydCBjb3VudFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJzUgZyBuJywgY3Vyc29yOiBbMywgN11cbiAgICAgIGVuc3VyZSAnMyBnIE4nLCBjdXJzb3I6IFsxLCA4XVxuXG4gIGRlc2NyaWJlICdzdWJ3b3JkIG1vdGlvbicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ3EnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtc3Vid29yZCdcbiAgICAgICAgICAnUSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtc3Vid29yZCdcbiAgICAgICAgICAnY3RybC1lJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1lbmQtb2Ytc3Vid29yZCdcblxuICAgIGl0IFwibW92ZSB0byBuZXh0L3ByZXZpb3VzIHN1YndvcmRcIiwgLT5cbiAgICAgIHNldCB0ZXh0QzogXCJ8Y2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsfENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlfCA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT58ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAofHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHxzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbHwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSB8Q2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYXxSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUnxBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJ8UnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxufGRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNofC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtfGNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxufHNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZXxfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2V8X3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3J8ZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlfF93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlfF9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxufHNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLXxjYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2h8LWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxufGRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyfFJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSfEFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYXxSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgfENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsfCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHxzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHx3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PnwgKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlfCA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbHxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcInxjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgIGl0IFwibW92ZS10by1lbmQtb2Ytc3Vid29yZFwiLCAtPlxuICAgICAgc2V0IHRleHRDOiBcInxjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lfGxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXN8ZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9fD4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gfCh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXR8aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWF8bCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbHwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENofGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGF8UkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGV8clJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJ8c1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc3xoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNofC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXN8ZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWt8ZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXN8ZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3J8ZFxcblwiXG4iXX0=
