(function() {
  var getVimState, settings,
    slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          return set({
            text: "123456789abc",
            cursor: [0, 0]
          });
        });
        it("repeats N times", function() {
          return ensure('3 x', {
            text: '456789abc'
          });
        });
        return it("repeats NN times", function() {
          return ensure('1 0 x', {
            text: 'bc'
          });
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats N times", function() {
          return ensure('d 2 w', {
            text: 'three'
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats movements in visual mode", function() {
          return ensure('v 2 w', {
            cursor: [0, 9]
          });
        });
      });
    });
    describe("Register", function() {
      beforeEach(function() {
        return vimState.globalState.reset('register');
      });
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
        return it("overwrites a value previously in the register", function() {
          set({
            register: {
              a: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
      });
      describe("with yank command", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "aaa bbb ccc"
          });
        });
        it("save to pre specified register", function() {
          ensure('" a y i w', {
            register: {
              a: {
                text: 'aaa'
              }
            }
          });
          ensure('w " b y i w', {
            register: {
              b: {
                text: 'bbb'
              }
            }
          });
          return ensure('w " c y i w', {
            register: {
              c: {
                text: 'ccc'
              }
            }
          });
        });
        return it("work with motion which also require input such as 't'", function() {
          return ensure([
            '" a y t', {
              input: 'c'
            }
          ], {
            register: {
              a: {
                text: 'aaa bbb '
              }
            }
          });
        });
      });
      describe("With p command", function() {
        beforeEach(function() {
          vimState.globalState.reset('register');
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return set({
            text: "abc\ndef",
            cursor: [0, 0]
          });
        });
        describe("when specified register have no text", function() {
          it("can paste from a register", function() {
            ensure({
              mode: "normal"
            });
            return ensure([
              '"', {
                input: 'a'
              }, 'p'
            ], {
              text: "anew contentbc\ndef",
              cursor: [0, 11]
            });
          });
          return it("but do nothing for z register", function() {
            return ensure([
              '"', {
                input: 'z'
              }, 'p'
            ], {
              text: "abc\ndef",
              cursor: [0, 0]
            });
          });
        });
        return describe("blockwise-mode paste just use register have no text", function() {
          return it("paste from a register to each selction", function() {
            return ensure([
              'ctrl-v j "', {
                input: 'a'
              }, 'p'
            ], {
              textC: "!new contentbc\nnew contentef"
            });
          });
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          ensure({
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
        });
        it("appends to a value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'contentnew content'
              }
            }
          });
        });
        it("appends linewise to a linewise value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content\n',
                type: 'linewise'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
        return it("appends linewise to a character value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content\n',
                type: 'linewise'
              }
            }
          });
          return ensure({
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the + register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure({
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the _ register", function() {
        describe("reading", function() {
          return it("is always the empty string", function() {
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '_': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '%': {
                  text: 'new content'
                }
              }
            });
            return ensure({
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
      });
      describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              'a': {
                text: 'abc'
              }
            }
          });
          set({
            register: {
              '*': {
                text: 'abc'
              }
            }
          });
          atom.clipboard.write("clip");
          set({
            text: "012\n",
            cursor: [0, 2]
          });
          return ensure('i', {
            mode: 'insert'
          });
        });
        describe("useClipboardAsDefaultRegister = true", function() {
          beforeEach(function() {
            settings.set('useClipboardAsDefaultRegister', true);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            return atom.clipboard.write("clip");
          });
          return it("inserts contents from clipboard with \"", function() {
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: '01clip2\n'
            });
          });
        });
        describe("useClipboardAsDefaultRegister = false", function() {
          beforeEach(function() {
            settings.set('useClipboardAsDefaultRegister', false);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            return atom.clipboard.write("clip");
          });
          return it("inserts contents from \" with \"", function() {
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: '013452\n'
            });
          });
        });
        it("inserts contents of the 'a' register", function() {
          return ensure([
            'ctrl-r', {
              input: 'a'
            }
          ], {
            text: '01abc2\n'
          });
        });
        return it("is cancelled with the escape key", function() {
          return ensure('ctrl-r escape', {
            text: '012\n',
            mode: 'insert',
            cursor: [0, 2]
          });
        });
      });
      return describe("per selection clipboard", function() {
        var ensurePerSelectionRegister;
        ensurePerSelectionRegister = function() {
          var i, j, len, ref1, results, selection, texts;
          texts = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          ref1 = editor.getSelections();
          results = [];
          for (i = j = 0, len = ref1.length; j < len; i = ++j) {
            selection = ref1[i];
            results.push(ensure({
              register: {
                '*': {
                  text: texts[i],
                  selection: selection
                }
              }
            }));
          }
          return results;
        };
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          return set({
            text: "012:\nabc:\ndef:\n",
            cursor: [[0, 1], [1, 1], [2, 1]]
          });
        });
        describe("on selection destroye", function() {
          return it("remove corresponding subscriptin and clipboard entry", function() {
            var clipboardBySelection, j, len, ref1, ref2, selection, subscriptionBySelection;
            ref1 = vimState.register, clipboardBySelection = ref1.clipboardBySelection, subscriptionBySelection = ref1.subscriptionBySelection;
            expect(clipboardBySelection.size).toBe(0);
            expect(subscriptionBySelection.size).toBe(0);
            keystroke("y i w");
            ensurePerSelectionRegister('012', 'abc', 'def');
            expect(clipboardBySelection.size).toBe(3);
            expect(subscriptionBySelection.size).toBe(3);
            ref2 = editor.getSelections();
            for (j = 0, len = ref2.length; j < len; j++) {
              selection = ref2[j];
              selection.destroy();
            }
            expect(clipboardBySelection.size).toBe(0);
            return expect(subscriptionBySelection.size).toBe(0);
          });
        });
        describe("Yank", function() {
          return it("save text to per selection register", function() {
            keystroke("y i w");
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
        });
        describe("Delete family", function() {
          it("d", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
          it("x", function() {
            ensure("x", {
              text: "02:\nac:\ndf:\n"
            });
            return ensurePerSelectionRegister('1', 'b', 'e');
          });
          it("X", function() {
            ensure("X", {
              text: "12:\nbc:\nef:\n"
            });
            return ensurePerSelectionRegister('0', 'a', 'd');
          });
          return it("D", function() {
            ensure("D", {
              text: "0\na\nd\n"
            });
            return ensurePerSelectionRegister('12:', 'bc:', 'ef:');
          });
        });
        describe("Put family", function() {
          it("p paste text from per selection register", function() {
            return ensure("y i w $ p", {
              text: "012:012\nabc:abc\ndef:def\n"
            });
          });
          return it("P paste text from per selection register", function() {
            return ensure("y i w $ P", {
              text: "012012:\nabcabc:\ndefdef:\n"
            });
          });
        });
        return describe("ctrl-r in insert mode", function() {
          return it("insert from per selection registe", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            ensure('a', {
              mode: 'insert'
            });
            return ensure([
              'ctrl-r', {
                input: '"'
              }
            ], {
              text: ":012\n:abc\n:def\n"
            });
          });
        });
      });
    });
    return describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvcHJlZml4LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBOztFQUFDLGNBQWUsT0FBQSxDQUFRLGVBQVI7O0VBQ2hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQTtBQUNuQixRQUFBO0lBQUEsTUFBNEQsRUFBNUQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGtCQUFkLEVBQXlCLGVBQXpCLEVBQWlDLHNCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHlCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQTtNQUNqQixRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTtRQUMxQixVQUFBLENBQVcsU0FBQTtpQkFDVCxHQUFBLENBQUk7WUFBQSxJQUFBLEVBQU0sY0FBTjtZQUFzQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5QjtXQUFKO1FBRFMsQ0FBWDtRQUdBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO2lCQUNwQixNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsSUFBQSxFQUFNLFdBQU47V0FBZDtRQURvQixDQUF0QjtlQUdBLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBO2lCQUNyQixNQUFBLENBQU8sT0FBUCxFQUFnQjtZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWhCO1FBRHFCLENBQXZCO01BUDBCLENBQTVCO01BVUEsUUFBQSxDQUFTLGNBQVQs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YUFBaEI7WUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO2NBQUEsSUFBQSxFQUFNLFFBQU47YUFBWjttQkFDQSxNQUFBLENBQU87Y0FBQyxRQUFELEVBQVc7Z0JBQUEsS0FBQSxFQUFPLEdBQVA7ZUFBWDthQUFQLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sb0JBQU47YUFERjtVQUhzQyxDQUF4QztRQURnQyxDQUFsQztNQWhFa0MsQ0FBcEM7SUEvS21CLENBQXJCO1dBMFBBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO01BQ3pCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLHlDQUFOO1VBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtTQURGO01BRFMsQ0FBWDtNQUtBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO2VBQ3BCLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1VBQUEsSUFBQSxFQUFNLDZCQUFOO1NBQWhCO01BRG9CLENBQXRCO01BRUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQTtlQUNsQixNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLElBQUEsRUFBTSxpQ0FBTjtTQUFoQjtNQURrQixDQUFwQjthQUVBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO2VBQzVDLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsSUFBQSxFQUFNLGlCQUFOO1NBQWxCO01BRDRDLENBQTlDO0lBVnlCLENBQTNCO0VBNVJtQixDQUFyQjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJQcmVmaXhlc1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwiUmVwZWF0XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aXRoIG9wZXJhdGlvbnNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDU2Nzg5YWJjXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBOIHRpbWVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMyB4JywgdGV4dDogJzQ1Njc4OWFiYydcblxuICAgICAgaXQgXCJyZXBlYXRzIE5OIHRpbWVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMSAwIHgnLCB0ZXh0OiAnYmMnXG5cbiAgICBkZXNjcmliZSBcIndpdGggbW90aW9uc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogJ29uZSB0d28gdGhyZWUnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInJlcGVhdHMgTiB0aW1lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgMiB3JywgdGV4dDogJ3RocmVlJ1xuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogJ29uZSB0d28gdGhyZWUnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInJlcGVhdHMgbW92ZW1lbnRzIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiAyIHcnLCBjdXJzb3I6IFswLCA5XVxuXG4gIGRlc2NyaWJlIFwiUmVnaXN0ZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5yZXNldCgncmVnaXN0ZXInKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgYSByZWdpc3RlclwiLCAtPlxuICAgICAgaXQgXCJzYXZlcyBhIHZhbHVlIGZvciBmdXR1cmUgcmVhZGluZ1wiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgIGl0IFwib3ZlcndyaXRlcyBhIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYTogdGV4dDogJ2NvbnRlbnQnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgIGRlc2NyaWJlIFwid2l0aCB5YW5rIGNvbW1hbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYWEgYmJiIGNjY1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJzYXZlIHRvIHByZSBzcGVjaWZpZWQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdcIiBhIHkgaSB3JywgcmVnaXN0ZXI6IGE6IHRleHQ6ICdhYWEnXG4gICAgICAgIGVuc3VyZSAndyBcIiBiIHkgaSB3JywgcmVnaXN0ZXI6IGI6IHRleHQ6ICdiYmInXG4gICAgICAgIGVuc3VyZSAndyBcIiBjIHkgaSB3JywgcmVnaXN0ZXI6IGM6IHRleHQ6ICdjY2MnXG5cbiAgICAgIGl0IFwid29yayB3aXRoIG1vdGlvbiB3aGljaCBhbHNvIHJlcXVpcmUgaW5wdXQgc3VjaCBhcyAndCdcIiwgLT5cbiAgICAgICAgZW5zdXJlIFsnXCIgYSB5IHQnLCB7aW5wdXQ6ICdjJ31dLCByZWdpc3RlcjogYTogdGV4dDogJ2FhYSBiYmIgJ1xuXG4gICAgZGVzY3JpYmUgXCJXaXRoIHAgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5yZXNldCgncmVnaXN0ZXInKVxuICAgICAgICBzZXQgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZGVmXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHNwZWNpZmllZCByZWdpc3RlciBoYXZlIG5vIHRleHRcIiwgLT5cbiAgICAgICAgaXQgXCJjYW4gcGFzdGUgZnJvbSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICBlbnN1cmUgWydcIicsIGlucHV0OiAnYScsICdwJ10sXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFuZXcgY29udGVudGJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMTFdXG5cbiAgICAgICAgaXQgXCJidXQgZG8gbm90aGluZyBmb3IgeiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBbJ1wiJywgaW5wdXQ6ICd6JywgJ3AnXSxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJibG9ja3dpc2UtbW9kZSBwYXN0ZSBqdXN0IHVzZSByZWdpc3RlciBoYXZlIG5vIHRleHRcIiwgLT5cbiAgICAgICAgaXQgXCJwYXN0ZSBmcm9tIGEgcmVnaXN0ZXIgdG8gZWFjaCBzZWxjdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBbJ2N0cmwtdiBqIFwiJywgaW5wdXQ6ICdhJywgJ3AnXSxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICFuZXcgY29udGVudGJjXG4gICAgICAgICAgICBuZXcgY29udGVudGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwidGhlIEIgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGl0IFwic2F2ZXMgYSB2YWx1ZSBmb3IgZnV0dXJlIHJlYWRpbmdcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgaXQgXCJhcHBlbmRzIHRvIGEgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRuZXcgY29udGVudCdcblxuICAgICAgaXQgXCJhcHBlbmRzIGxpbmV3aXNlIHRvIGEgbGluZXdpc2UgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudFxcbicsIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRcXG5uZXcgY29udGVudFxcbidcblxuICAgICAgaXQgXCJhcHBlbmRzIGxpbmV3aXNlIHRvIGEgY2hhcmFjdGVyIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnQnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50XFxuJywgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50XFxubmV3IGNvbnRlbnRcXG4nXG5cbiAgICBkZXNjcmliZSBcInRoZSAqIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJpcyB0aGUgc2FtZSB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJyonOiB0ZXh0OiAnaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudCcsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJyonOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgICAgaXQgXCJvdmVyd3JpdGVzIHRoZSBjb250ZW50cyBvZiB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwgJ25ldyBjb250ZW50J1xuXG4gICAgIyBGSVhNRTogb25jZSBsaW51eCBzdXBwb3J0IGNvbWVzIG91dCwgdGhpcyBuZWVkcyB0byByZWFkIGZyb21cbiAgICAjIHRoZSBjb3JyZWN0IGNsaXBib2FyZC4gRm9yIG5vdyBpdCBiZWhhdmVzIGp1c3QgbGlrZSB0aGUgKiByZWdpc3RlclxuICAgICMgU2VlIDpoZWxwIHgxMS1jdXQtYnVmZmVyIGFuZCA6aGVscCByZWdpc3RlcnMgZm9yIG1vcmUgZGV0YWlscyBvbiBob3cgdGhlc2VcbiAgICAjIHJlZ2lzdGVycyB3b3JrIG9uIGFuIFgxMSBiYXNlZCBzeXN0ZW0uXG4gICAgZGVzY3JpYmUgXCJ0aGUgKyByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgdGhlIHNhbWUgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6XG4gICAgICAgICAgICAnKic6IHRleHQ6ICdpbml0aWFsIGNsaXBib2FyZCBjb250ZW50JywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnKic6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgICBpdCBcIm92ZXJ3cml0ZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCAnbmV3IGNvbnRlbnQnXG5cbiAgICBkZXNjcmliZSBcInRoZSBfIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJpcyBhbHdheXMgdGhlIGVtcHR5IHN0cmluZ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJ18nOiB0ZXh0OiAnJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYXdheSBhbnl0aGluZyB3cml0dGVuIHRvIGl0XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAgICAnXyc6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICdfJzogdGV4dDogJydcblxuICAgIGRlc2NyaWJlIFwidGhlICUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0VVJJJykuYW5kUmV0dXJuICcvVXNlcnMvYXRvbS9rbm93bl92YWx1ZS50eHQnXG5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcInJldHVybnMgdGhlIGZpbGVuYW1lIG9mIHRoZSBjdXJyZW50IGVkaXRvclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJyUnOiB0ZXh0OiAnL1VzZXJzL2F0b20va25vd25fdmFsdWUudHh0J1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYXdheSBhbnl0aGluZyB3cml0dGVuIHRvIGl0XCIsIC0+XG4gICAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiAnJSc6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICclJzogdGV4dDogJy9Vc2Vycy9hdG9tL2tub3duX3ZhbHVlLnR4dCdcblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwtciBjb21tYW5kIGluIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnYSc6IHRleHQ6ICdhYmMnXG4gICAgICAgIHNldCByZWdpc3RlcjogJyonOiB0ZXh0OiAnYWJjJ1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuICAgICAgICBzZXQgdGV4dDogXCIwMTJcXG5cIiwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcblxuICAgICAgZGVzY3JpYmUgXCJ1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciA9IHRydWVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlXG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIFwiY2xpcFwiXG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGNvbnRlbnRzIGZyb20gY2xpcGJvYXJkIHdpdGggXFxcIlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBbJ2N0cmwtcicsIGlucHV0OiAnXCInXSwgdGV4dDogJzAxY2xpcDJcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgPSBmYWxzZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlXG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIFwiY2xpcFwiXG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGNvbnRlbnRzIGZyb20gXFxcIiB3aXRoIFxcXCJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgWydjdHJsLXInLCBpbnB1dDogJ1wiJ10sIHRleHQ6ICcwMTM0NTJcXG4nXG5cbiAgICAgIGl0IFwiaW5zZXJ0cyBjb250ZW50cyBvZiB0aGUgJ2EnIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBbJ2N0cmwtcicsIGlucHV0OiAnYSddLCB0ZXh0OiAnMDFhYmMyXFxuJ1xuXG4gICAgICBpdCBcImlzIGNhbmNlbGxlZCB3aXRoIHRoZSBlc2NhcGUga2V5XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1yIGVzY2FwZScsXG4gICAgICAgICAgdGV4dDogJzAxMlxcbidcbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcInBlciBzZWxlY3Rpb24gY2xpcGJvYXJkXCIsIC0+XG4gICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlciA9ICh0ZXh0cy4uLikgLT5cbiAgICAgICAgZm9yIHNlbGVjdGlvbiwgaSBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnKic6IHt0ZXh0OiB0ZXh0c1tpXSwgc2VsZWN0aW9uOiBzZWxlY3Rpb259XG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWVcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTI6XG4gICAgICAgICAgICBhYmM6XG4gICAgICAgICAgICBkZWY6XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMV0sIFsxLCAxXSwgWzIsIDFdXVxuXG4gICAgICBkZXNjcmliZSBcIm9uIHNlbGVjdGlvbiBkZXN0cm95ZVwiLCAtPlxuICAgICAgICBpdCBcInJlbW92ZSBjb3JyZXNwb25kaW5nIHN1YnNjcmlwdGluIGFuZCBjbGlwYm9hcmQgZW50cnlcIiwgLT5cbiAgICAgICAgICB7Y2xpcGJvYXJkQnlTZWxlY3Rpb24sIHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9ufSA9IHZpbVN0YXRlLnJlZ2lzdGVyXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuXG4gICAgICAgICAga2V5c3Ryb2tlIFwieSBpIHdcIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG5cbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgzKVxuICAgICAgICAgIGV4cGVjdChzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zaXplKS50b0JlKDMpXG4gICAgICAgICAgc2VsZWN0aW9uLmRlc3Ryb3koKSBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG5cbiAgICAgIGRlc2NyaWJlIFwiWWFua1wiLCAtPlxuICAgICAgICBpdCBcInNhdmUgdGV4dCB0byBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlIFwieSBpIHdcIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG5cbiAgICAgIGRlc2NyaWJlIFwiRGVsZXRlIGZhbWlseVwiLCAtPlxuICAgICAgICBpdCBcImRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgd1wiLCB0ZXh0OiBcIjpcXG46XFxuOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAxMicsICdhYmMnLCAnZGVmJylcbiAgICAgICAgaXQgXCJ4XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieFwiLCB0ZXh0OiBcIjAyOlxcbmFjOlxcbmRmOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzEnLCAnYicsICdlJylcbiAgICAgICAgaXQgXCJYXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiWFwiLCB0ZXh0OiBcIjEyOlxcbmJjOlxcbmVmOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAnLCAnYScsICdkJylcbiAgICAgICAgaXQgXCJEXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiRFwiLCB0ZXh0OiBcIjBcXG5hXFxuZFxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzEyOicsICdiYzonLCAnZWY6JylcblxuICAgICAgZGVzY3JpYmUgXCJQdXQgZmFtaWx5XCIsIC0+XG4gICAgICAgIGl0IFwicCBwYXN0ZSB0ZXh0IGZyb20gcGVyIHNlbGVjdGlvbiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInkgaSB3ICQgcFwiLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDAxMjowMTJcbiAgICAgICAgICAgICAgYWJjOmFiY1xuICAgICAgICAgICAgICBkZWY6ZGVmXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIlAgcGFzdGUgdGV4dCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IGkgdyAkIFBcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAwMTIwMTI6XG4gICAgICAgICAgICAgIGFiY2FiYzpcbiAgICAgICAgICAgICAgZGVmZGVmOlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiY3RybC1yIGluIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGZyb20gcGVyIHNlbGVjdGlvbiByZWdpc3RlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBpIHdcIiwgdGV4dDogXCI6XFxuOlxcbjpcXG5cIlxuICAgICAgICAgIGVuc3VyZSAnYScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFsnY3RybC1yJywgaW5wdXQ6ICdcIiddLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDowMTJcbiAgICAgICAgICAgICAgOmFiY1xuICAgICAgICAgICAgICA6ZGVmXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiQ291bnQgbW9kaWZpZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIwMDAgMTExIDIyMiAzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIHcnLCB0ZXh0OiBcIjMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgbW90aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ2QgMiB3JywgdGV4dDogXCIyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICBpdCBcInJlcGVhdCBvcGVyYXRvciBhbmQgbW90aW9uIHJlc3BlY3RpdmVseVwiLCAtPlxuICAgICAgZW5zdXJlICczIGQgMiB3JywgdGV4dDogXCI2NjYgNzc3IDg4OCA5OTlcIlxuIl19
