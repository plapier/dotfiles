(function() {
  var TextData, getVimState, ref,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, TextData = ref.TextData;

  describe("Visual Blockwise", function() {
    var blockTexts, editor, editorElement, ensure, ensureBlockwiseSelection, keystroke, ref1, selectBlockwise, selectBlockwiseReversely, set, textAfterDeleted, textAfterInserted, textData, textInitial, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    textInitial = "01234567890123456789\n1-------------------\n2----A---------B----\n3----***********---\n4----+++++++++++--\n5----C---------D-\n6-------------------";
    textAfterDeleted = "01234567890123456789\n1-------------------\n2----\n3----\n4----\n5----\n6-------------------";
    textAfterInserted = "01234567890123456789\n1-------------------\n2----!!!\n3----!!!\n4----!!!\n5----!!!\n6-------------------";
    blockTexts = ['56789012345', '-----------', 'A---------B', '***********', '+++++++++++', 'C---------D', '-----------'];
    textData = new TextData(textInitial);
    selectBlockwise = function() {
      set({
        cursor: [2, 5]
      });
      return ensure('v 3 j 1 0 l ctrl-v', {
        mode: ['visual', 'blockwise'],
        selectedBufferRange: [[[2, 5], [2, 16]], [[3, 5], [3, 16]], [[4, 5], [4, 16]], [[5, 5], [5, 16]]],
        selectedText: blockTexts.slice(2, 6)
      });
    };
    selectBlockwiseReversely = function() {
      set({
        cursor: [2, 15]
      });
      return ensure('v 3 j 1 0 h ctrl-v', {
        mode: ['visual', 'blockwise'],
        selectedBufferRange: [[[2, 5], [2, 16]], [[3, 5], [3, 16]], [[4, 5], [4, 16]], [[5, 5], [5, 16]]],
        selectedText: blockTexts.slice(2, 6)
      });
    };
    ensureBlockwiseSelection = function(o) {
      var bs, first, head, i, j, k, last, len, len1, others, ref2, results, s, selections, tail;
      selections = editor.getSelectionsOrderedByBufferPosition();
      if (selections.length === 1) {
        first = last = selections[0];
      } else {
        first = selections[0], others = 3 <= selections.length ? slice.call(selections, 1, i = selections.length - 1) : (i = 1, []), last = selections[i++];
      }
      head = (function() {
        switch (o.head) {
          case 'top':
            return first;
          case 'bottom':
            return last;
        }
      })();
      bs = vimState.getLastBlockwiseSelection();
      expect(bs.getHeadSelection()).toBe(head);
      tail = (function() {
        switch (o.tail) {
          case 'top':
            return first;
          case 'bottom':
            return last;
        }
      })();
      expect(bs.getTailSelection()).toBe(tail);
      ref2 = others != null ? others : [];
      for (j = 0, len = ref2.length; j < len; j++) {
        s = ref2[j];
        expect(bs.getHeadSelection()).not.toBe(s);
        expect(bs.getTailSelection()).not.toBe(s);
      }
      if (o.reversed != null) {
        expect(bs.isReversed()).toBe(o.reversed);
      }
      if (o.headReversed != null) {
        results = [];
        for (k = 0, len1 = selections.length; k < len1; k++) {
          s = selections[k];
          results.push(expect(s.isReversed()).toBe(o.headReversed));
        }
        return results;
      }
    };
    beforeEach(function() {
      getVimState(function(state, vimEditor) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
      });
      return runs(function() {
        return set({
          text: textInitial
        });
      });
    });
    describe("j", function() {
      beforeEach(function() {
        set({
          cursor: [3, 5]
        });
        return ensure('v 1 0 l ctrl-v', {
          selectedText: blockTexts[3],
          mode: ['visual', 'blockwise']
        });
      });
      it("add selection to down direction", function() {
        ensure('j', {
          selectedText: blockTexts.slice(3, 5)
        });
        return ensure('j', {
          selectedText: blockTexts.slice(3, 6)
        });
      });
      it("delete selection when blocwise is reversed", function() {
        ensure('3 k', {
          selectedTextOrdered: blockTexts.slice(0, 4)
        });
        ensure('j', {
          selectedTextOrdered: blockTexts.slice(1, 4)
        });
        return ensure('2 j', {
          selectedTextOrdered: blockTexts[3]
        });
      });
      return it("keep tail row when reversed status changed", function() {
        ensure('j', {
          selectedText: blockTexts.slice(3, 5)
        });
        return ensure('2 k', {
          selectedTextOrdered: blockTexts.slice(2, 4)
        });
      });
    });
    describe("k", function() {
      beforeEach(function() {
        set({
          cursor: [3, 5]
        });
        return ensure('v 1 0 l ctrl-v', {
          selectedText: blockTexts[3],
          mode: ['visual', 'blockwise']
        });
      });
      it("add selection to up direction", function() {
        ensure('k', {
          selectedTextOrdered: blockTexts.slice(2, 4)
        });
        return ensure('k', {
          selectedTextOrdered: blockTexts.slice(1, 4)
        });
      });
      return it("delete selection when blocwise is reversed", function() {
        ensure('3 j', {
          selectedTextOrdered: blockTexts.slice(3, 7)
        });
        ensure('k', {
          selectedTextOrdered: blockTexts.slice(3, 6)
        });
        return ensure('2 k', {
          selectedTextOrdered: blockTexts[3]
        });
      });
    });
    describe("C", function() {
      var ensureChange;
      ensureChange = function() {
        ensure('C', {
          mode: 'insert',
          cursor: [[2, 5], [3, 5], [4, 5], [5, 5]],
          text: textAfterDeleted
        });
        editor.insertText("!!!");
        return ensure({
          mode: 'insert',
          cursor: [[2, 8], [3, 8], [4, 8], [5, 8]],
          text: textAfterInserted
        });
      };
      it("change-to-last-character-of-line for each selection", function() {
        selectBlockwise();
        return ensureChange();
      });
      return it("[selection reversed] change-to-last-character-of-line for each selection", function() {
        selectBlockwiseReversely();
        return ensureChange();
      });
    });
    describe("D", function() {
      var ensureDelete;
      ensureDelete = function() {
        return ensure('D', {
          text: textAfterDeleted,
          cursor: [2, 4],
          mode: 'normal'
        });
      };
      it("delete-to-last-character-of-line for each selection", function() {
        selectBlockwise();
        return ensureDelete();
      });
      return it("[selection reversed] delete-to-last-character-of-line for each selection", function() {
        selectBlockwiseReversely();
        return ensureDelete();
      });
    });
    describe("I", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("enter insert mode with each cursors position set to start of selection", function() {
        keystroke('I');
        editor.insertText("!!!");
        return ensure({
          text: "01234567890123456789\n1-------------------\n2----!!!A---------B----\n3----!!!***********---\n4----!!!+++++++++++--\n5----!!!C---------D-\n6-------------------",
          cursor: [[2, 8], [3, 8], [4, 8], [5, 8]],
          mode: 'insert'
        });
      });
    });
    describe("A", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      return it("enter insert mode with each cursors position set to end of selection", function() {
        keystroke('A');
        editor.insertText("!!!");
        return ensure({
          text: "01234567890123456789\n1-------------------\n2----A---------B!!!----\n3----***********!!!---\n4----+++++++++++!!!--\n5----C---------D!!!-\n6-------------------",
          cursor: [[2, 19], [3, 19], [4, 19], [5, 19]]
        });
      });
    });
    describe("o and O keybinding", function() {
      beforeEach(function() {
        return selectBlockwise();
      });
      describe('o', function() {
        return it("change blockwiseHead to opposite side and reverse selection", function() {
          keystroke('o');
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: true
          });
          keystroke('o');
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
      });
      return describe('capital O', function() {
        return it("reverse each selection", function() {
          keystroke('O');
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: true
          });
          keystroke('O');
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
      });
    });
    describe("shift from characterwise to blockwise", function() {
      describe("when selection is not reversed", function() {
        beforeEach(function() {
          set({
            cursor: [2, 5]
          });
          return ensure('v', {
            selectedText: 'A',
            mode: ['visual', 'characterwise']
          });
        });
        it('case-1', function() {
          ensure('3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A', '*', '+', 'C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
        it('case-2', function() {
          ensure('h 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['-A', '-*', '-+', '-C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: true
          });
        });
        it('case-3', function() {
          ensure('2 h 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['--A', '--*', '--+', '--C']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: true
          });
        });
        it('case-4', function() {
          ensure('l 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A-', '**', '++', 'C-']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
        return it('case-5', function() {
          ensure('2 l 3 j ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A--', '***', '+++', 'C--']
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            headReversed: false
          });
        });
      });
      return describe("when selection is reversed", function() {
        beforeEach(function() {
          set({
            cursor: [5, 5]
          });
          return ensure('v', {
            selectedText: 'C',
            mode: ['visual', 'characterwise']
          });
        });
        it('case-1', function() {
          ensure('3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A', '*', '+', 'C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: true
          });
        });
        it('case-2', function() {
          ensure('h 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['-A', '-*', '-+', '-C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: true
          });
        });
        it('case-3', function() {
          ensure('2 h 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['--A', '--*', '--+', '--C']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: true
          });
        });
        it('case-4', function() {
          ensure('l 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A-', '**', '++', 'C-']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: false
          });
        });
        return it('case-5', function() {
          ensure('2 l 3 k ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['A--', '***', '+++', 'C--']
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            headReversed: false
          });
        });
      });
    });
    describe("shift from blockwise to characterwise", function() {
      var ensureCharacterwiseWasRestored, preserveSelection;
      preserveSelection = function() {
        var cursor, mode, selectedBufferRange, selectedText;
        selectedText = editor.getSelectedText();
        selectedBufferRange = editor.getSelectedBufferRange();
        cursor = editor.getCursorBufferPosition();
        mode = [vimState.mode, vimState.submode];
        return {
          selectedText: selectedText,
          selectedBufferRange: selectedBufferRange,
          cursor: cursor,
          mode: mode
        };
      };
      ensureCharacterwiseWasRestored = function(keystroke) {
        var characterwiseState;
        ensure(keystroke, {
          mode: ['visual', 'characterwise']
        });
        characterwiseState = preserveSelection();
        ensure('ctrl-v', {
          mode: ['visual', 'blockwise']
        });
        return ensure('v', characterwiseState);
      };
      describe("when selection is not reversed", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 5]
          });
        });
        it('case-1', function() {
          return ensureCharacterwiseWasRestored('v');
        });
        it('case-2', function() {
          return ensureCharacterwiseWasRestored('v 3 j');
        });
        it('case-3', function() {
          return ensureCharacterwiseWasRestored('v h 3 j');
        });
        it('case-4', function() {
          return ensureCharacterwiseWasRestored('v 2 h 3 j');
        });
        it('case-5', function() {
          return ensureCharacterwiseWasRestored('v l 3 j');
        });
        return it('case-6', function() {
          return ensureCharacterwiseWasRestored('v 2 l 3 j');
        });
      });
      return describe("when selection is reversed", function() {
        beforeEach(function() {
          return set({
            cursor: [5, 5]
          });
        });
        it('case-1', function() {
          return ensureCharacterwiseWasRestored('v');
        });
        it('case-2', function() {
          return ensureCharacterwiseWasRestored('v 3 k');
        });
        it('case-3', function() {
          return ensureCharacterwiseWasRestored('v h 3 k');
        });
        it('case-4', function() {
          return ensureCharacterwiseWasRestored('v 2 h 3 k');
        });
        it('case-5', function() {
          return ensureCharacterwiseWasRestored('v l 3 k');
        });
        it('case-6', function() {
          return ensureCharacterwiseWasRestored('v 2 l 3 k');
        });
        return it('case-7', function() {
          set({
            cursor: [5, 0]
          });
          return ensureCharacterwiseWasRestored('v 5 l 3 k');
        });
      });
    });
    describe("keep goalColumn", function() {
      describe("when passing through blank row", function() {
        beforeEach(function() {
          return set({
            text: "012345678\n\nABCDEFGHI\n"
          });
        });
        it("when [reversed = false, headReversed = false]", function() {
          set({
            cursor: [0, 3]
          });
          ensure("ctrl-v l l l", {
            cursor: [[0, 7]],
            selectedTextOrdered: ["3456"]
          });
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: false
          });
          ensure("j", {
            cursor: [[0, 0], [1, 0]],
            selectedTextOrdered: ["0123", ""]
          });
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: true
          });
          ensure("j", {
            cursor: [[0, 7], [1, 0], [2, 7]],
            selectedTextOrdered: ["3456", "", "DEFG"]
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: false
          });
        });
        it("when [reversed = true, headReversed = true]", function() {
          set({
            cursor: [2, 6]
          });
          ensure("ctrl-v h h h", {
            cursor: [[2, 3]],
            selectedTextOrdered: ["DEFG"]
          });
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: true
          });
          ensure("k", {
            cursor: [[1, 0], [2, 0]],
            selectedTextOrdered: ["", "ABCDEFG"]
          });
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: true
          });
          ensure("k", {
            cursor: [[0, 3], [1, 0], [2, 3]],
            selectedTextOrdered: ["3456", "", "DEFG"]
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: true
          });
        });
        it("when [reversed = false, headReversed = true]", function() {
          set({
            cursor: [0, 6]
          });
          ensure("ctrl-v h h h", {
            cursor: [[0, 3]],
            selectedTextOrdered: ["3456"]
          });
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: true,
            headReversed: true
          });
          ensure("j", {
            cursor: [[0, 0], [1, 0]],
            selectedTextOrdered: ["0123456", ""]
          });
          ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: true
          });
          ensure("j", {
            cursor: [[0, 3], [1, 0], [2, 3]],
            selectedTextOrdered: ["3456", "", "DEFG"]
          });
          return ensureBlockwiseSelection({
            head: 'bottom',
            tail: 'top',
            reversed: false,
            headReversed: true
          });
        });
        return it("when [reversed = true, headReversed = false]", function() {
          set({
            cursor: [2, 3]
          });
          ensure("ctrl-v l l l", {
            cursor: [[2, 7]],
            selectedTextOrdered: ["DEFG"]
          });
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: false,
            headReversed: false
          });
          ensure("k", {
            cursor: [[1, 0], [2, 0]],
            selectedTextOrdered: ["", "ABCD"]
          });
          ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: true
          });
          ensure("k", {
            cursor: [[0, 7], [1, 0], [2, 7]],
            selectedTextOrdered: ["3456", "", "DEFG"]
          });
          return ensureBlockwiseSelection({
            head: 'top',
            tail: 'bottom',
            reversed: true,
            headReversed: false
          });
        });
      });
      return describe("when head cursor position is less than original goal column", function() {
        beforeEach(function() {
          return set({
            text: "012345678901234567890123\n       xxx01234\n012345678901234567890123\n"
          });
        });
        describe("[tailColumn < headColum], goalColumn isnt Infinity", function() {
          it("shrinks block till head column by keeping goalColumn", function() {
            set({
              cursor: [0, 10]
            });
            ensure("ctrl-v 1 0 l", {
              selectedTextOrdered: ["01234567890"],
              cursor: [[0, 21]]
            });
            ensure("j", {
              selectedTextOrdered: ["012345", "01234"],
              cursor: [[0, 16], [1, 15]]
            });
            return ensure("j", {
              selectedTextOrdered: ["01234567890", "01234", "01234567890"],
              cursor: [[0, 21], [1, 15], [2, 21]]
            });
          });
          return it("shrinks block till head column by keeping goalColumn", function() {
            set({
              cursor: [2, 10]
            });
            ensure("ctrl-v 1 0 l", {
              selectedTextOrdered: ["01234567890"],
              cursor: [[2, 21]]
            });
            ensure("k", {
              selectedTextOrdered: ["01234", "012345"],
              cursor: [[1, 15], [2, 16]]
            });
            return ensure("k", {
              selectedTextOrdered: ["01234567890", "01234", "01234567890"],
              cursor: [[0, 21], [1, 15], [2, 21]]
            });
          });
        });
        describe("[tailColumn < headColum], goalColumn is Infinity", function() {
          it("keep each member selection selected till end-of-line( No shrink )", function() {
            set({
              cursor: [0, 10]
            });
            ensure("ctrl-v $", {
              selectedTextOrdered: ["01234567890123"],
              cursor: [[0, 24]]
            });
            ensure("j", {
              selectedTextOrdered: ["01234567890123", "01234"],
              cursor: [[0, 24], [1, 15]]
            });
            return ensure("j", {
              selectedTextOrdered: ["01234567890123", "01234", "01234567890123"],
              cursor: [[0, 24], [1, 15], [2, 24]]
            });
          });
          return it("keep each member selection selected till end-of-line( No shrink )", function() {
            set({
              cursor: [2, 10]
            });
            ensure("ctrl-v $", {
              selectedTextOrdered: ["01234567890123"],
              cursor: [[2, 24]]
            });
            ensure("k", {
              selectedTextOrdered: ["01234", "01234567890123"],
              cursor: [[1, 15], [2, 24]]
            });
            return ensure("k", {
              selectedTextOrdered: ["01234567890123", "01234", "01234567890123"],
              cursor: [[0, 24], [1, 15], [2, 24]]
            });
          });
        });
        describe("[tailColumn > headColum], goalColumn isnt Infinity", function() {
          it("Respect actual head column over goalColumn", function() {
            set({
              cursor: [0, 20]
            });
            ensure("ctrl-v l l", {
              selectedTextOrdered: ["012"],
              cursor: [[0, 23]]
            });
            ensure("j", {
              selectedTextOrdered: ["567890", ""],
              cursor: [[0, 15], [1, 15]]
            });
            return ensure("j", {
              selectedTextOrdered: ["012", "", "012"],
              cursor: [[0, 23], [1, 15], [2, 23]]
            });
          });
          return it("Respect actual head column over goalColumn", function() {
            set({
              cursor: [2, 20]
            });
            ensure("ctrl-v l l", {
              selectedTextOrdered: ["012"],
              cursor: [[2, 23]]
            });
            ensure("k", {
              selectedTextOrdered: ["", "567890"],
              cursor: [[1, 15], [2, 15]]
            });
            return ensure("k", {
              selectedTextOrdered: ["012", "", "012"],
              cursor: [[0, 23], [1, 15], [2, 23]]
            });
          });
        });
        return describe("[tailColumn > headColum], goalColumn is Infinity", function() {
          it("Respect actual head column over goalColumn", function() {
            set({
              cursor: [0, 20]
            });
            ensure("ctrl-v $", {
              selectedTextOrdered: ["0123"],
              cursor: [[0, 24]]
            });
            ensure("j", {
              selectedTextOrdered: ["567890", ""],
              cursor: [[0, 15], [1, 15]]
            });
            return ensure("j", {
              selectedTextOrdered: ["0123", "", "0123"],
              cursor: [[0, 24], [1, 15], [2, 24]]
            });
          });
          return it("Respect actual head column over goalColumn", function() {
            set({
              cursor: [2, 20]
            });
            ensure("ctrl-v $", {
              selectedTextOrdered: ["0123"],
              cursor: [[2, 24]]
            });
            ensure("k", {
              selectedTextOrdered: ["", "567890"],
              cursor: [[1, 15], [2, 15]]
            });
            return ensure("k", {
              selectedTextOrdered: ["0123", "", "0123"],
              cursor: [[0, 24], [1, 15], [2, 24]]
            });
          });
        });
      });
    });
    return describe("gv feature", function() {
      var ensureRestored, preserveSelection;
      preserveSelection = function() {
        var cursor, mode, s, selectedBufferRangeOrdered, selectedTextOrdered, selections;
        selections = editor.getSelectionsOrderedByBufferPosition();
        selectedTextOrdered = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = selections.length; i < len; i++) {
            s = selections[i];
            results.push(s.getText());
          }
          return results;
        })();
        selectedBufferRangeOrdered = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = selections.length; i < len; i++) {
            s = selections[i];
            results.push(s.getBufferRange());
          }
          return results;
        })();
        cursor = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = selections.length; i < len; i++) {
            s = selections[i];
            results.push(s.getHeadScreenPosition());
          }
          return results;
        })();
        mode = [vimState.mode, vimState.submode];
        return {
          selectedTextOrdered: selectedTextOrdered,
          selectedBufferRangeOrdered: selectedBufferRangeOrdered,
          cursor: cursor,
          mode: mode
        };
      };
      ensureRestored = function(keystroke, spec) {
        var preserved;
        ensure(keystroke, spec);
        preserved = preserveSelection();
        ensure('escape j j', {
          mode: 'normal',
          selectedText: ''
        });
        return ensure('g v', preserved);
      };
      describe("linewise selection", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("immediately after V", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V', {
              selectedText: textData.getLines([2]),
              mode: ['visual', 'linewise']
            });
          });
        });
        describe("selection is not reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V j', {
              selectedText: textData.getLines([2, 3]),
              mode: ['visual', 'linewise']
            });
          });
        });
        return describe("selection is reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('V k', {
              selectedText: textData.getLines([1, 2]),
              mode: ['visual', 'linewise']
            });
          });
        });
      });
      describe("characterwise selection", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("immediately after v", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v', {
              selectedText: "2",
              mode: ['visual', 'characterwise']
            });
          });
        });
        describe("selection is not reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v j', {
              selectedText: "2----A---------B----\n3",
              mode: ['visual', 'characterwise']
            });
          });
        });
        return describe("selection is reversed", function() {
          return it('restore previous selection', function() {
            return ensureRestored('v k', {
              selectedText: "1-------------------\n2",
              mode: ['visual', 'characterwise']
            });
          });
        });
      });
      return describe("blockwise selection", function() {
        describe("immediately after ctrl-v", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          return it('restore previous selection', function() {
            return ensureRestored('ctrl-v', {
              selectedText: "2",
              mode: ['visual', 'blockwise']
            });
          });
        });
        describe("selection is not reversed", function() {
          it('restore previous selection case-1', function() {
            set({
              cursor: [2, 5]
            });
            keystroke('ctrl-v 1 0 l');
            return ensureRestored('3 j', {
              selectedText: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
          return it('restore previous selection case-2', function() {
            set({
              cursor: [5, 5]
            });
            keystroke('ctrl-v 1 0 l');
            return ensureRestored('3 k', {
              selectedTextOrdered: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
        });
        return describe("selection is reversed", function() {
          it('restore previous selection case-1', function() {
            set({
              cursor: [2, 15]
            });
            keystroke('ctrl-v 1 0 h');
            return ensureRestored('3 j', {
              selectedText: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
          return it('restore previous selection case-2', function() {
            set({
              cursor: [5, 15]
            });
            keystroke('ctrl-v 1 0 h');
            return ensureRestored('3 k', {
              selectedTextOrdered: blockTexts.slice(2, 6),
              mode: ['visual', 'blockwise']
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdmlzdWFsLWJsb2Nrd2lzZS1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMEJBQUE7SUFBQTs7RUFBQSxNQUEwQixPQUFBLENBQVEsZUFBUixDQUExQixFQUFDLDZCQUFELEVBQWM7O0VBRWQsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7QUFDM0IsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUNoRCxXQUFBLEdBQWM7SUFVZCxnQkFBQSxHQUFtQjtJQVVuQixpQkFBQSxHQUFvQjtJQVVwQixVQUFBLEdBQWEsQ0FDWCxhQURXLEVBRVgsYUFGVyxFQUdYLGFBSFcsRUFJWCxhQUpXLEVBS1gsYUFMVyxFQU1YLGFBTlcsRUFPWCxhQVBXO0lBVWIsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTLFdBQVQ7SUFFZixlQUFBLEdBQWtCLFNBQUE7TUFDaEIsR0FBQSxDQUFJO1FBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtPQUFKO2FBQ0EsTUFBQSxDQUFPLG9CQUFQLEVBQ0U7UUFBQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsV0FBWCxDQUFOO1FBQ0EsbUJBQUEsRUFBcUIsQ0FDbkIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVQsQ0FEbUIsRUFFbkIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVQsQ0FGbUIsRUFHbkIsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVQs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SHNDLENBQXhDO2lCQU1BLEVBQUEsQ0FBRyxtQ0FBSCxFQUF3QyxTQUFBO1lBQ3RDLEdBQUEsQ0FBSTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7YUFBSjtZQUNBLFNBQUEsQ0FBVSxjQUFWO21CQUNBLGNBQUEsQ0FBZSxLQUFmLEVBQ0U7Y0FBQSxtQkFBQSxFQUFxQixVQUFXLFlBQWhDO2NBQ0EsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLFdBQVgsQ0FETjthQURGO1VBSHNDLENBQXhDO1FBUGdDLENBQWxDO01BckI4QixDQUFoQztJQTNEcUIsQ0FBdkI7RUE3ZjJCLENBQTdCO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIFRleHREYXRhfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbmRlc2NyaWJlIFwiVmlzdWFsIEJsb2Nrd2lzZVwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuICB0ZXh0SW5pdGlhbCA9IFwiXCJcIlxuICAgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5XG4gICAgMS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAyLS0tLUEtLS0tLS0tLS1CLS0tLVxuICAgIDMtLS0tKioqKioqKioqKiotLS1cbiAgICA0LS0tLSsrKysrKysrKysrLS1cbiAgICA1LS0tLUMtLS0tLS0tLS1ELVxuICAgIDYtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgXCJcIlwiXG5cbiAgdGV4dEFmdGVyRGVsZXRlZCA9IFwiXCJcIlxuICAgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5XG4gICAgMS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAyLS0tLVxuICAgIDMtLS0tXG4gICAgNC0tLS1cbiAgICA1LS0tLVxuICAgIDYtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgXCJcIlwiXG5cbiAgdGV4dEFmdGVySW5zZXJ0ZWQgPSBcIlwiXCJcbiAgICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgIDEtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgMi0tLS0hISFcbiAgICAzLS0tLSEhIVxuICAgIDQtLS0tISEhXG4gICAgNS0tLS0hISFcbiAgICA2LS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFwiXCJcIlxuXG4gIGJsb2NrVGV4dHMgPSBbXG4gICAgJzU2Nzg5MDEyMzQ1JyAjIDBcbiAgICAnLS0tLS0tLS0tLS0nICMgMVxuICAgICdBLS0tLS0tLS0tQicgIyAyXG4gICAgJyoqKioqKioqKioqJyAjIDNcbiAgICAnKysrKysrKysrKysnICMgNFxuICAgICdDLS0tLS0tLS0tRCcgIyA1XG4gICAgJy0tLS0tLS0tLS0tJyAjIDZcbiAgXVxuXG4gIHRleHREYXRhID0gbmV3IFRleHREYXRhKHRleHRJbml0aWFsKVxuXG4gIHNlbGVjdEJsb2Nrd2lzZSA9IC0+XG4gICAgc2V0IGN1cnNvcjogWzIsIDVdXG4gICAgZW5zdXJlICd2IDMgaiAxIDAgbCBjdHJsLXYnLFxuICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgW1syLCA1XSwgWzIsIDE2XV1cbiAgICAgICAgW1szLCA1XSwgWzMsIDE2XV1cbiAgICAgICAgW1s0LCA1XSwgWzQsIDE2XV1cbiAgICAgICAgW1s1LCA1XSwgWzUsIDE2XV1cbiAgICAgIF1cbiAgICAgIHNlbGVjdGVkVGV4dDogYmxvY2tUZXh0c1syLi41XVxuXG4gIHNlbGVjdEJsb2Nrd2lzZVJldmVyc2VseSA9IC0+XG4gICAgc2V0IGN1cnNvcjogWzIsIDE1XVxuICAgIGVuc3VyZSAndiAzIGogMSAwIGggY3RybC12JyxcbiAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbXG4gICAgICAgIFtbMiwgNV0sIFsyLCAxNl1dXG4gICAgICAgIFtbMywgNV0sIFszLCAxNl1dXG4gICAgICAgIFtbNCwgNV0sIFs0LCAxNl1dXG4gICAgICAgIFtbNSwgNV0sIFs1LCAxNl1dXG4gICAgICBdXG4gICAgICBzZWxlY3RlZFRleHQ6IGJsb2NrVGV4dHNbMi4uNV1cblxuICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gPSAobykgLT5cbiAgICBzZWxlY3Rpb25zID0gZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgc2VsZWN0aW9ucy5sZW5ndGggaXMgMVxuICAgICAgZmlyc3QgPSBsYXN0ID0gc2VsZWN0aW9uc1swXVxuICAgIGVsc2VcbiAgICAgIFtmaXJzdCwgb3RoZXJzLi4uLCBsYXN0XSA9IHNlbGVjdGlvbnNcblxuICAgIGhlYWQgPSBzd2l0Y2ggby5oZWFkXG4gICAgICB3aGVuICd0b3AnIHRoZW4gZmlyc3RcbiAgICAgIHdoZW4gJ2JvdHRvbScgdGhlbiBsYXN0XG4gICAgYnMgPSB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKClcblxuICAgIGV4cGVjdChicy5nZXRIZWFkU2VsZWN0aW9uKCkpLnRvQmUgaGVhZFxuICAgIHRhaWwgPSBzd2l0Y2ggby50YWlsXG4gICAgICB3aGVuICd0b3AnIHRoZW4gZmlyc3RcbiAgICAgIHdoZW4gJ2JvdHRvbScgdGhlbiBsYXN0XG4gICAgZXhwZWN0KGJzLmdldFRhaWxTZWxlY3Rpb24oKSkudG9CZSB0YWlsXG5cbiAgICBmb3IgcyBpbiBvdGhlcnMgPyBbXVxuICAgICAgZXhwZWN0KGJzLmdldEhlYWRTZWxlY3Rpb24oKSkubm90LnRvQmUgc1xuICAgICAgZXhwZWN0KGJzLmdldFRhaWxTZWxlY3Rpb24oKSkubm90LnRvQmUgc1xuXG4gICAgaWYgby5yZXZlcnNlZD9cbiAgICAgIGV4cGVjdChicy5pc1JldmVyc2VkKCkpLnRvQmUgby5yZXZlcnNlZFxuXG4gICAgaWYgby5oZWFkUmV2ZXJzZWQ/XG4gICAgICBmb3IgcyBpbiBzZWxlY3Rpb25zXG4gICAgICAgIGV4cGVjdChzLmlzUmV2ZXJzZWQoKSkudG9CZSBvLmhlYWRSZXZlcnNlZFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbUVkaXRvcikgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbUVkaXRvclxuXG4gICAgcnVucyAtPlxuICAgICAgc2V0IHRleHQ6IHRleHRJbml0aWFsXG5cbiAgZGVzY3JpYmUgXCJqXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzMsIDVdXG4gICAgICBlbnN1cmUgJ3YgMSAwIGwgY3RybC12JyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiBibG9ja1RleHRzWzNdXG4gICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG5cbiAgICBpdCBcImFkZCBzZWxlY3Rpb24gdG8gZG93biBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogYmxvY2tUZXh0c1szLi40XVxuICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiBibG9ja1RleHRzWzMuLjVdXG5cbiAgICBpdCBcImRlbGV0ZSBzZWxlY3Rpb24gd2hlbiBibG9jd2lzZSBpcyByZXZlcnNlZFwiLCAtPlxuICAgICAgZW5zdXJlICczIGsnLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBibG9ja1RleHRzWzAuLjNdXG4gICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBibG9ja1RleHRzWzEuLjNdXG4gICAgICBlbnN1cmUgJzIgaicsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IGJsb2NrVGV4dHNbM11cblxuICAgIGl0IFwia2VlcCB0YWlsIHJvdyB3aGVuIHJldmVyc2VkIHN0YXR1cyBjaGFuZ2VkXCIsIC0+XG4gICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IGJsb2NrVGV4dHNbMy4uNF1cbiAgICAgIGVuc3VyZSAnMiBrJywgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1syLi4zXVxuXG4gIGRlc2NyaWJlIFwia1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCBjdXJzb3I6IFszLCA1XVxuICAgICAgZW5zdXJlICd2IDEgMCBsIGN0cmwtdicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogYmxvY2tUZXh0c1szXVxuICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuXG4gICAgaXQgXCJhZGQgc2VsZWN0aW9uIHRvIHVwIGRpcmVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1syLi4zXVxuICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1sxLi4zXVxuXG4gICAgaXQgXCJkZWxldGUgc2VsZWN0aW9uIHdoZW4gYmxvY3dpc2UgaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBqJywgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1szLi42XVxuICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1szLi41XVxuICAgICAgZW5zdXJlICcyIGsnLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBibG9ja1RleHRzWzNdXG5cbiAgIyBGSVhNRSBhZGQgQywgRCBzcGVjIGZvciBzZWxlY3RCbG9ja3dpc2VSZXZlcnNlbHkoKSBzaXR1YXRpb25cbiAgZGVzY3JpYmUgXCJDXCIsIC0+XG4gICAgZW5zdXJlQ2hhbmdlID0gLT5cbiAgICAgIGVuc3VyZSAnQycsXG4gICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGN1cnNvcjogW1syLCA1XSwgWzMsIDVdLCBbNCwgNV0sIFs1LCA1XSBdXG4gICAgICAgIHRleHQ6IHRleHRBZnRlckRlbGV0ZWRcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiISEhXCIpXG4gICAgICBlbnN1cmVcbiAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgY3Vyc29yOiBbWzIsIDhdLCBbMywgOF0sIFs0LCA4XSwgWzUsIDhdXVxuICAgICAgICB0ZXh0OiB0ZXh0QWZ0ZXJJbnNlcnRlZFxuXG4gICAgaXQgXCJjaGFuZ2UtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZSBmb3IgZWFjaCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIHNlbGVjdEJsb2Nrd2lzZSgpXG4gICAgICBlbnN1cmVDaGFuZ2UoKVxuXG4gICAgaXQgXCJbc2VsZWN0aW9uIHJldmVyc2VkXSBjaGFuZ2UtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZSBmb3IgZWFjaCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIHNlbGVjdEJsb2Nrd2lzZVJldmVyc2VseSgpXG4gICAgICBlbnN1cmVDaGFuZ2UoKVxuXG4gIGRlc2NyaWJlIFwiRFwiLCAtPlxuICAgIGVuc3VyZURlbGV0ZSA9IC0+XG4gICAgICBlbnN1cmUgJ0QnLFxuICAgICAgICB0ZXh0OiB0ZXh0QWZ0ZXJEZWxldGVkXG4gICAgICAgIGN1cnNvcjogWzIsIDRdXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcImRlbGV0ZS10by1sYXN0LWNoYXJhY3Rlci1vZi1saW5lIGZvciBlYWNoIHNlbGVjdGlvblwiLCAtPlxuICAgICAgc2VsZWN0QmxvY2t3aXNlKClcbiAgICAgIGVuc3VyZURlbGV0ZSgpXG4gICAgaXQgXCJbc2VsZWN0aW9uIHJldmVyc2VkXSBkZWxldGUtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZSBmb3IgZWFjaCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIHNlbGVjdEJsb2Nrd2lzZVJldmVyc2VseSgpXG4gICAgICBlbnN1cmVEZWxldGUoKVxuXG4gIGRlc2NyaWJlIFwiSVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNlbGVjdEJsb2Nrd2lzZSgpXG4gICAgaXQgXCJlbnRlciBpbnNlcnQgbW9kZSB3aXRoIGVhY2ggY3Vyc29ycyBwb3NpdGlvbiBzZXQgdG8gc3RhcnQgb2Ygc2VsZWN0aW9uXCIsIC0+XG4gICAgICBrZXlzdHJva2UgJ0knXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcIiEhIVwiXG4gICAgICBlbnN1cmVcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMDEyMzQ1Njc4OTAxMjM0NTY3ODlcbiAgICAgICAgICAxLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgIDItLS0tISEhQS0tLS0tLS0tLUItLS0tXG4gICAgICAgICAgMy0tLS0hISEqKioqKioqKioqKi0tLVxuICAgICAgICAgIDQtLS0tISEhKysrKysrKysrKystLVxuICAgICAgICAgIDUtLS0tISEhQy0tLS0tLS0tLUQtXG4gICAgICAgICAgNi0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbXG4gICAgICAgICAgICBbMiwgOF0sXG4gICAgICAgICAgICBbMywgOF0sXG4gICAgICAgICAgICBbNCwgOF0sXG4gICAgICAgICAgICBbNSwgOF0sXG4gICAgICAgICAgXVxuICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuXG4gIGRlc2NyaWJlIFwiQVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNlbGVjdEJsb2Nrd2lzZSgpXG4gICAgaXQgXCJlbnRlciBpbnNlcnQgbW9kZSB3aXRoIGVhY2ggY3Vyc29ycyBwb3NpdGlvbiBzZXQgdG8gZW5kIG9mIHNlbGVjdGlvblwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdBJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCIhISFcIlxuICAgICAgZW5zdXJlXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5XG4gICAgICAgICAgMS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAyLS0tLUEtLS0tLS0tLS1CISEhLS0tLVxuICAgICAgICAgIDMtLS0tKioqKioqKioqKiohISEtLS1cbiAgICAgICAgICA0LS0tLSsrKysrKysrKysrISEhLS1cbiAgICAgICAgICA1LS0tLUMtLS0tLS0tLS1EISEhLVxuICAgICAgICAgIDYtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogW1xuICAgICAgICAgICAgWzIsIDE5XSxcbiAgICAgICAgICAgIFszLCAxOV0sXG4gICAgICAgICAgICBbNCwgMTldLFxuICAgICAgICAgICAgWzUsIDE5XSxcbiAgICAgICAgICBdXG5cbiAgZGVzY3JpYmUgXCJvIGFuZCBPIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZWxlY3RCbG9ja3dpc2UoKVxuXG4gICAgZGVzY3JpYmUgJ28nLCAtPlxuICAgICAgaXQgXCJjaGFuZ2UgYmxvY2t3aXNlSGVhZCB0byBvcHBvc2l0ZSBzaWRlIGFuZCByZXZlcnNlIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ28nXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAndG9wJywgdGFpbDogJ2JvdHRvbScsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICAgIGtleXN0cm9rZSAnbydcbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgaGVhZFJldmVyc2VkOiBmYWxzZVxuICAgIGRlc2NyaWJlICdjYXBpdGFsIE8nLCAtPlxuICAgICAgaXQgXCJyZXZlcnNlIGVhY2ggc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAnTydcbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgaGVhZFJldmVyc2VkOiB0cnVlXG4gICAgICAgIGtleXN0cm9rZSAnTydcbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgaGVhZFJldmVyc2VkOiBmYWxzZVxuXG4gIGRlc2NyaWJlIFwic2hpZnQgZnJvbSBjaGFyYWN0ZXJ3aXNlIHRvIGJsb2Nrd2lzZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3Rpb24gaXMgbm90IHJldmVyc2VkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCA1XVxuICAgICAgICBlbnN1cmUgJ3YnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJ0EnXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgIGl0ICdjYXNlLTEnLCAtPlxuICAgICAgICBlbnN1cmUgJzMgaiBjdHJsLXYnLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1xuICAgICAgICAgICAgJ0EnXG4gICAgICAgICAgICAnKidcbiAgICAgICAgICAgICcrJ1xuICAgICAgICAgICAgJ0MnXG4gICAgICAgICAgXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCBoZWFkUmV2ZXJzZWQ6IGZhbHNlXG5cbiAgICAgIGl0ICdjYXNlLTInLCAtPlxuICAgICAgICBlbnN1cmUgJ2ggMyBqIGN0cmwtdicsXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXG4gICAgICAgICAgICAnLUEnXG4gICAgICAgICAgICAnLSonXG4gICAgICAgICAgICAnLSsnXG4gICAgICAgICAgICAnLUMnXG4gICAgICAgICAgXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgaXQgJ2Nhc2UtMycsIC0+XG4gICAgICAgIGVuc3VyZSAnMiBoIDMgaiBjdHJsLXYnLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1xuICAgICAgICAgICAgJy0tQSdcbiAgICAgICAgICAgICctLSonXG4gICAgICAgICAgICAnLS0rJ1xuICAgICAgICAgICAgJy0tQydcbiAgICAgICAgICBdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAnYm90dG9tJywgdGFpbDogJ3RvcCcsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICBpdCAnY2FzZS00JywgLT5cbiAgICAgICAgZW5zdXJlICdsIDMgaiBjdHJsLXYnLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1xuICAgICAgICAgICAgJ0EtJ1xuICAgICAgICAgICAgJyoqJ1xuICAgICAgICAgICAgJysrJ1xuICAgICAgICAgICAgJ0MtJ1xuICAgICAgICAgIF1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgaGVhZFJldmVyc2VkOiBmYWxzZVxuICAgICAgaXQgJ2Nhc2UtNScsIC0+XG4gICAgICAgIGVuc3VyZSAnMiBsIDMgaiBjdHJsLXYnLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1xuICAgICAgICAgICAgJ0EtLSdcbiAgICAgICAgICAgICcqKionXG4gICAgICAgICAgICAnKysrJ1xuICAgICAgICAgICAgJ0MtLSdcbiAgICAgICAgICBdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAnYm90dG9tJywgdGFpbDogJ3RvcCcsIGhlYWRSZXZlcnNlZDogZmFsc2VcblxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3Rpb24gaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzUsIDVdXG4gICAgICAgIGVuc3VyZSAndicsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnQydcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgaXQgJ2Nhc2UtMScsIC0+XG4gICAgICAgIGVuc3VyZSAnMyBrIGN0cmwtdicsXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXG4gICAgICAgICAgICAnQSdcbiAgICAgICAgICAgICcqJ1xuICAgICAgICAgICAgJysnXG4gICAgICAgICAgICAnQydcbiAgICAgICAgICBdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAndG9wJywgdGFpbDogJ2JvdHRvbScsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICBpdCAnY2FzZS0yJywgLT5cbiAgICAgICAgZW5zdXJlICdoIDMgayBjdHJsLXYnLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1xuICAgICAgICAgICAgJy1BJ1xuICAgICAgICAgICAgJy0qJ1xuICAgICAgICAgICAgJy0rJ1xuICAgICAgICAgICAgJy1DJ1xuICAgICAgICAgIF1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICd0b3AnLCB0YWlsOiAnYm90dG9tJywgaGVhZFJldmVyc2VkOiB0cnVlXG5cbiAgICAgIGl0ICdjYXNlLTMnLCAtPlxuICAgICAgICBlbnN1cmUgJzIgaCAzIGsgY3RybC12JyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgICctLUEnXG4gICAgICAgICAgICAnLS0qJ1xuICAgICAgICAgICAgJy0tKydcbiAgICAgICAgICAgICctLUMnXG4gICAgICAgICAgXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgaXQgJ2Nhc2UtNCcsIC0+XG4gICAgICAgIGVuc3VyZSAnbCAzIGsgY3RybC12JyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgICdBLSdcbiAgICAgICAgICAgICcqKidcbiAgICAgICAgICAgICcrKydcbiAgICAgICAgICAgICdDLSdcbiAgICAgICAgICBdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAndG9wJywgdGFpbDogJ2JvdHRvbScsIGhlYWRSZXZlcnNlZDogZmFsc2VcblxuICAgICAgaXQgJ2Nhc2UtNScsIC0+XG4gICAgICAgIGVuc3VyZSAnMiBsIDMgayBjdHJsLXYnLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1xuICAgICAgICAgICAgJ0EtLSdcbiAgICAgICAgICAgICcqKionXG4gICAgICAgICAgICAnKysrJ1xuICAgICAgICAgICAgJ0MtLSdcbiAgICAgICAgICBdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAndG9wJywgdGFpbDogJ2JvdHRvbScsIGhlYWRSZXZlcnNlZDogZmFsc2VcblxuICBkZXNjcmliZSBcInNoaWZ0IGZyb20gYmxvY2t3aXNlIHRvIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICBwcmVzZXJ2ZVNlbGVjdGlvbiA9IC0+XG4gICAgICBzZWxlY3RlZFRleHQgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2UgPSBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXG4gICAgICBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgbW9kZSA9IFt2aW1TdGF0ZS5tb2RlLCB2aW1TdGF0ZS5zdWJtb2RlXVxuICAgICAge3NlbGVjdGVkVGV4dCwgc2VsZWN0ZWRCdWZmZXJSYW5nZSwgY3Vyc29yLCBtb2RlfVxuXG4gICAgZW5zdXJlQ2hhcmFjdGVyd2lzZVdhc1Jlc3RvcmVkID0gKGtleXN0cm9rZSkgLT5cbiAgICAgIGVuc3VyZSBrZXlzdHJva2UsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgY2hhcmFjdGVyd2lzZVN0YXRlID0gcHJlc2VydmVTZWxlY3Rpb24oKVxuICAgICAgZW5zdXJlICdjdHJsLXYnLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgZW5zdXJlICd2JywgY2hhcmFjdGVyd2lzZVN0YXRlXG5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0aW9uIGlzIG5vdCByZXZlcnNlZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgNV1cbiAgICAgIGl0ICdjYXNlLTEnLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YnKVxuICAgICAgaXQgJ2Nhc2UtMicsIC0+IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndiAzIGonKVxuICAgICAgaXQgJ2Nhc2UtMycsIC0+IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndiBoIDMgaicpXG4gICAgICBpdCAnY2FzZS00JywgLT4gZW5zdXJlQ2hhcmFjdGVyd2lzZVdhc1Jlc3RvcmVkKCd2IDIgaCAzIGonKVxuICAgICAgaXQgJ2Nhc2UtNScsIC0+IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndiBsIDMgaicpXG4gICAgICBpdCAnY2FzZS02JywgLT4gZW5zdXJlQ2hhcmFjdGVyd2lzZVdhc1Jlc3RvcmVkKCd2IDIgbCAzIGonKVxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3Rpb24gaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzUsIDVdXG4gICAgICBpdCAnY2FzZS0xJywgLT4gZW5zdXJlQ2hhcmFjdGVyd2lzZVdhc1Jlc3RvcmVkKCd2JylcbiAgICAgIGl0ICdjYXNlLTInLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgMyBrJylcbiAgICAgIGl0ICdjYXNlLTMnLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgaCAzIGsnKVxuICAgICAgaXQgJ2Nhc2UtNCcsIC0+IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndiAyIGggMyBrJylcbiAgICAgIGl0ICdjYXNlLTUnLCAtPiBlbnN1cmVDaGFyYWN0ZXJ3aXNlV2FzUmVzdG9yZWQoJ3YgbCAzIGsnKVxuICAgICAgaXQgJ2Nhc2UtNicsIC0+IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndiAyIGwgMyBrJylcbiAgICAgIGl0ICdjYXNlLTcnLCAtPiBzZXQgY3Vyc29yOiBbNSwgMF07IGVuc3VyZUNoYXJhY3Rlcndpc2VXYXNSZXN0b3JlZCgndiA1IGwgMyBrJylcblxuICBkZXNjcmliZSBcImtlZXAgZ29hbENvbHVtblwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBwYXNzaW5nIHRocm91Z2ggYmxhbmsgcm93XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAxMjM0NTY3OFxuXG4gICAgICAgICAgQUJDREVGR0hJXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwid2hlbiBbcmV2ZXJzZWQgPSBmYWxzZSwgaGVhZFJldmVyc2VkID0gZmFsc2VdXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgbCBsIGxcIiwgY3Vyc29yOiBbWzAsIDddXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMzQ1NlwiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCByZXZlcnNlZDogZmFsc2UsIGhlYWRSZXZlcnNlZDogZmFsc2VcblxuICAgICAgICBlbnN1cmUgXCJqXCIsIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyM1wiLCBcIlwiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCByZXZlcnNlZDogZmFsc2UsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICAgIGVuc3VyZSBcImpcIiwgY3Vyc29yOiBbWzAsIDddLCBbMSwgMF0sIFsyLCA3XV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjM0NTZcIiwgXCJcIiwgXCJERUZHXCJdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAnYm90dG9tJywgdGFpbDogJ3RvcCcsIHJldmVyc2VkOiBmYWxzZSwgaGVhZFJldmVyc2VkOiBmYWxzZVxuXG4gICAgICBpdCBcIndoZW4gW3JldmVyc2VkID0gdHJ1ZSwgaGVhZFJldmVyc2VkID0gdHJ1ZV1cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDZdXG4gICAgICAgIGVuc3VyZSBcImN0cmwtdiBoIGggaFwiLCBjdXJzb3I6IFtbMiwgM11dLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCJERUZHXCJdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAndG9wJywgdGFpbDogJ2JvdHRvbScsIHJldmVyc2VkOiB0cnVlLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgICBlbnN1cmUgXCJrXCIsIGN1cnNvcjogW1sxLCAwXSwgWzIsIDBdXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiXCIsIFwiQUJDREVGR1wiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCByZXZlcnNlZDogdHJ1ZSwgaGVhZFJldmVyc2VkOiB0cnVlXG5cbiAgICAgICAgZW5zdXJlIFwia1wiLCBjdXJzb3I6IFtbMCwgM10sIFsxLCAwXSwgWzIsIDNdXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMzQ1NlwiLCBcIlwiLCBcIkRFRkdcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICd0b3AnLCB0YWlsOiAnYm90dG9tJywgcmV2ZXJzZWQ6IHRydWUsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICBpdCBcIndoZW4gW3JldmVyc2VkID0gZmFsc2UsIGhlYWRSZXZlcnNlZCA9IHRydWVdXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgaCBoIGhcIiwgY3Vyc29yOiBbWzAsIDNdXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMzQ1NlwiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCByZXZlcnNlZDogdHJ1ZSwgaGVhZFJldmVyc2VkOiB0cnVlXG5cbiAgICAgICAgZW5zdXJlIFwialwiLCBjdXJzb3I6IFtbMCwgMF0sIFsxLCAwXV0sIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0NTZcIiwgXCJcIl1cbiAgICAgICAgZW5zdXJlQmxvY2t3aXNlU2VsZWN0aW9uIGhlYWQ6ICdib3R0b20nLCB0YWlsOiAndG9wJywgcmV2ZXJzZWQ6IGZhbHNlLCBoZWFkUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgICBlbnN1cmUgXCJqXCIsIGN1cnNvcjogW1swLCAzXSwgWzEsIDBdLCBbMiwgM11dLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIzNDU2XCIsIFwiXCIsIFwiREVGR1wiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ2JvdHRvbScsIHRhaWw6ICd0b3AnLCByZXZlcnNlZDogZmFsc2UsIGhlYWRSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICBpdCBcIndoZW4gW3JldmVyc2VkID0gdHJ1ZSwgaGVhZFJldmVyc2VkID0gZmFsc2VdXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAzXVxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgbCBsIGxcIiwgY3Vyc29yOiBbWzIsIDddXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiREVGR1wiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCByZXZlcnNlZDogZmFsc2UsIGhlYWRSZXZlcnNlZDogZmFsc2VcblxuICAgICAgICBlbnN1cmUgXCJrXCIsIGN1cnNvcjogW1sxLCAwXSwgWzIsIDBdXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiXCIsIFwiQUJDRFwiXVxuICAgICAgICBlbnN1cmVCbG9ja3dpc2VTZWxlY3Rpb24gaGVhZDogJ3RvcCcsIHRhaWw6ICdib3R0b20nLCByZXZlcnNlZDogdHJ1ZSwgaGVhZFJldmVyc2VkOiB0cnVlXG5cbiAgICAgICAgZW5zdXJlIFwia1wiLCBjdXJzb3I6IFtbMCwgN10sIFsxLCAwXSwgWzIsIDddXSwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogIFtcIjM0NTZcIiwgXCJcIiwgXCJERUZHXCJdXG4gICAgICAgIGVuc3VyZUJsb2Nrd2lzZVNlbGVjdGlvbiBoZWFkOiAndG9wJywgdGFpbDogJ2JvdHRvbScsIHJldmVyc2VkOiB0cnVlLCBoZWFkUmV2ZXJzZWQ6IGZhbHNlXG5cbiAgICBkZXNjcmliZSBcIndoZW4gaGVhZCBjdXJzb3IgcG9zaXRpb24gaXMgbGVzcyB0aGFuIG9yaWdpbmFsIGdvYWwgY29sdW1uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyM1xuICAgICAgICAgICAgICAgICB4eHgwMTIzNFxuICAgICAgICAgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyM1xcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIlt0YWlsQ29sdW1uIDwgaGVhZENvbHVtXSwgZ29hbENvbHVtbiBpc250IEluZmluaXR5XCIsIC0+XG4gICAgICAgIGl0IFwic2hyaW5rcyBibG9jayB0aWxsIGhlYWQgY29sdW1uIGJ5IGtlZXBpbmcgZ29hbENvbHVtblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxMF0gIyBqLCBrIG1vdGlvbiBrZWVwIGdvYWxDb2x1bW4gc28gc3RhcnRpbmcgYDEwYCBjb2x1bW4gbWVhbnMgZ29hbENvbHVtbiBpcyAxMC5cbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLXYgMSAwIGxcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyMzQ1Njc4OTBcIl0sIGN1cnNvcjogW1swLCAyMV1dXG4gICAgICAgICAgZW5zdXJlIFwialwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNDVcIiwgXCIwMTIzNFwiXSwgY3Vyc29yOiBbWzAsIDE2XSwgWzEsIDE1XV1cbiAgICAgICAgICBlbnN1cmUgXCJqXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0NTY3ODkwXCIsIFwiMDEyMzRcIiwgXCIwMTIzNDU2Nzg5MFwiXSwgY3Vyc29yOiBbWzAsIDIxXSwgWzEsIDE1XSwgWzIsIDIxXV1cbiAgICAgICAgaXQgXCJzaHJpbmtzIGJsb2NrIHRpbGwgaGVhZCBjb2x1bW4gYnkga2VlcGluZyBnb2FsQ29sdW1uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDEwXVxuICAgICAgICAgIGVuc3VyZSBcImN0cmwtdiAxIDAgbFwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNDU2Nzg5MFwiXSwgY3Vyc29yOiBbWzIsIDIxXV1cbiAgICAgICAgICBlbnN1cmUgXCJrXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0XCIsIFwiMDEyMzQ1XCJdLCBjdXJzb3I6IFtbMSwgMTVdLCBbMiwgMTZdXVxuICAgICAgICAgIGVuc3VyZSBcImtcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyMzQ1Njc4OTBcIiwgXCIwMTIzNFwiLCBcIjAxMjM0NTY3ODkwXCJdLCBjdXJzb3I6IFtbMCwgMjFdLCBbMSwgMTVdLCBbMiwgMjFdXVxuICAgICAgZGVzY3JpYmUgXCJbdGFpbENvbHVtbiA8IGhlYWRDb2x1bV0sIGdvYWxDb2x1bW4gaXMgSW5maW5pdHlcIiwgLT5cbiAgICAgICAgaXQgXCJrZWVwIGVhY2ggbWVtYmVyIHNlbGVjdGlvbiBzZWxlY3RlZCB0aWxsIGVuZC1vZi1saW5lKCBObyBzaHJpbmsgKVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxMF0gIyAkIG1vdGlvbiBzZXQgZ29hbENvbHVtbiB0byBJbmZpbml0eVxuICAgICAgICAgIGVuc3VyZSBcImN0cmwtdiAkXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0NTY3ODkwMTIzXCJdLCBjdXJzb3I6IFtbMCwgMjRdXVxuICAgICAgICAgIGVuc3VyZSBcImpcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyMzQ1Njc4OTAxMjNcIiwgXCIwMTIzNFwiXSwgY3Vyc29yOiBbWzAsIDI0XSwgWzEsIDE1XV1cbiAgICAgICAgICBlbnN1cmUgXCJqXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0NTY3ODkwMTIzXCIsIFwiMDEyMzRcIiwgXCIwMTIzNDU2Nzg5MDEyM1wiXSwgY3Vyc29yOiBbWzAsIDI0XSwgWzEsIDE1XSwgWzIsIDI0XV1cbiAgICAgICAgaXQgXCJrZWVwIGVhY2ggbWVtYmVyIHNlbGVjdGlvbiBzZWxlY3RlZCB0aWxsIGVuZC1vZi1saW5lKCBObyBzaHJpbmsgKVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLXYgJFwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNDU2Nzg5MDEyM1wiXSwgY3Vyc29yOiBbWzIsIDI0XV1cbiAgICAgICAgICBlbnN1cmUgXCJrXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjM0XCIsIFwiMDEyMzQ1Njc4OTAxMjNcIl0sIGN1cnNvcjogW1sxLCAxNV0sIFsyLCAyNF1dXG4gICAgICAgICAgZW5zdXJlIFwia1wiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzNDU2Nzg5MDEyM1wiLCBcIjAxMjM0XCIsIFwiMDEyMzQ1Njc4OTAxMjNcIl0sIGN1cnNvcjogW1swLCAyNF0sIFsxLCAxNV0sIFsyLCAyNF1dXG4gICAgICBkZXNjcmliZSBcIlt0YWlsQ29sdW1uID4gaGVhZENvbHVtXSwgZ29hbENvbHVtbiBpc250IEluZmluaXR5XCIsIC0+XG4gICAgICAgIGl0IFwiUmVzcGVjdCBhY3R1YWwgaGVhZCBjb2x1bW4gb3ZlciBnb2FsQ29sdW1uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDIwXSAjIGosIGsgbW90aW9uIGtlZXAgZ29hbENvbHVtbiBzbyBzdGFydGluZyBgMTBgIGNvbHVtbiBtZWFucyBnb2FsQ29sdW1uIGlzIDEwLlxuICAgICAgICAgIGVuc3VyZSBcImN0cmwtdiBsIGxcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyXCJdLCBjdXJzb3I6IFtbMCwgMjNdXVxuICAgICAgICAgIGVuc3VyZSBcImpcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiNTY3ODkwXCIsIFwiXCJdLCBjdXJzb3I6IFtbMCwgMTVdLCBbMSwgMTVdXVxuICAgICAgICAgIGVuc3VyZSBcImpcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyXCIsIFwiXCIsIFwiMDEyXCJdLCBjdXJzb3I6IFtbMCwgMjNdLCBbMSwgMTVdLCBbMiwgMjNdXVxuICAgICAgICBpdCBcIlJlc3BlY3QgYWN0dWFsIGhlYWQgY29sdW1uIG92ZXIgZ29hbENvbHVtblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAyMF0gIyBqLCBrIG1vdGlvbiBrZWVwIGdvYWxDb2x1bW4gc28gc3RhcnRpbmcgYDEwYCBjb2x1bW4gbWVhbnMgZ29hbENvbHVtbiBpcyAxMC5cbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLXYgbCBsXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMlwiXSwgY3Vyc29yOiBbWzIsIDIzXV1cbiAgICAgICAgICBlbnN1cmUgXCJrXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIlwiLCBcIjU2Nzg5MFwiXSwgY3Vyc29yOiBbWzEsIDE1XSwgWzIsIDE1XV1cbiAgICAgICAgICBlbnN1cmUgXCJrXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMlwiLCBcIlwiLCBcIjAxMlwiXSwgY3Vyc29yOiBbWzAsIDIzXSwgWzEsIDE1XSwgWzIsIDIzXV1cbiAgICAgIGRlc2NyaWJlIFwiW3RhaWxDb2x1bW4gPiBoZWFkQ29sdW1dLCBnb2FsQ29sdW1uIGlzIEluZmluaXR5XCIsIC0+XG4gICAgICAgIGl0IFwiUmVzcGVjdCBhY3R1YWwgaGVhZCBjb2x1bW4gb3ZlciBnb2FsQ29sdW1uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDIwXSAjIGosIGsgbW90aW9uIGtlZXAgZ29hbENvbHVtbiBzbyBzdGFydGluZyBgMTBgIGNvbHVtbiBtZWFucyBnb2FsQ29sdW1uIGlzIDEwLlxuICAgICAgICAgIGVuc3VyZSBcImN0cmwtdiAkXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjNcIl0sIGN1cnNvcjogW1swLCAyNF1dXG4gICAgICAgICAgZW5zdXJlIFwialwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCI1Njc4OTBcIiwgXCJcIl0sIGN1cnNvcjogW1swLCAxNV0sIFsxLCAxNV1dXG4gICAgICAgICAgZW5zdXJlIFwialwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIwMTIzXCIsIFwiXCIsIFwiMDEyM1wiXSwgY3Vyc29yOiBbWzAsIDI0XSwgWzEsIDE1XSwgWzIsIDI0XV1cbiAgICAgICAgaXQgXCJSZXNwZWN0IGFjdHVhbCBoZWFkIGNvbHVtbiBvdmVyIGdvYWxDb2x1bW5cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMjBdICMgaiwgayBtb3Rpb24ga2VlcCBnb2FsQ29sdW1uIHNvIHN0YXJ0aW5nIGAxMGAgY29sdW1uIG1lYW5zIGdvYWxDb2x1bW4gaXMgMTAuXG4gICAgICAgICAgZW5zdXJlIFwiY3RybC12ICRcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMDEyM1wiXSwgY3Vyc29yOiBbWzIsIDI0XV1cbiAgICAgICAgICBlbnN1cmUgXCJrXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIlwiLCBcIjU2Nzg5MFwiXSwgY3Vyc29yOiBbWzEsIDE1XSwgWzIsIDE1XV1cbiAgICAgICAgICBlbnN1cmUgXCJrXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjAxMjNcIiwgXCJcIiwgXCIwMTIzXCJdLCBjdXJzb3I6IFtbMCwgMjRdLCBbMSwgMTVdLCBbMiwgMjRdXVxuXG4gICMgW0ZJWE1FXSBub3QgYXBwcm9wcmlhdGUgcHV0IGhlcmUsIHJlLWNvbnNpZGVyIGFsbCBzcGVjIGZpbGUgbGF5b3V0IGxhdGVyLlxuICBkZXNjcmliZSBcImd2IGZlYXR1cmVcIiwgLT5cbiAgICBwcmVzZXJ2ZVNlbGVjdGlvbiA9IC0+XG4gICAgICBzZWxlY3Rpb25zID0gZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgICBzZWxlY3RlZFRleHRPcmRlcmVkID0gKHMuZ2V0VGV4dCgpIGZvciBzIGluIHNlbGVjdGlvbnMpXG4gICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZCA9IChzLmdldEJ1ZmZlclJhbmdlKCkgZm9yIHMgaW4gc2VsZWN0aW9ucylcbiAgICAgIGN1cnNvciA9IChzLmdldEhlYWRTY3JlZW5Qb3NpdGlvbigpIGZvciBzIGluIHNlbGVjdGlvbnMpXG4gICAgICBtb2RlID0gW3ZpbVN0YXRlLm1vZGUsIHZpbVN0YXRlLnN1Ym1vZGVdXG4gICAgICB7c2VsZWN0ZWRUZXh0T3JkZXJlZCwgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQsIGN1cnNvciwgbW9kZX1cblxuICAgIGVuc3VyZVJlc3RvcmVkID0gKGtleXN0cm9rZSwgc3BlYykgLT5cbiAgICAgIGVuc3VyZSBrZXlzdHJva2UsIHNwZWNcbiAgICAgIHByZXNlcnZlZCA9IHByZXNlcnZlU2VsZWN0aW9uKClcbiAgICAgIGVuc3VyZSAnZXNjYXBlIGogaicsIG1vZGU6ICdub3JtYWwnLCBzZWxlY3RlZFRleHQ6ICcnXG4gICAgICBlbnN1cmUgJ2cgdicsIHByZXNlcnZlZFxuXG4gICAgZGVzY3JpYmUgXCJsaW5ld2lzZSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICBkZXNjcmliZSBcImltbWVkaWF0ZWx5IGFmdGVyIFZcIiwgLT5cbiAgICAgICAgaXQgJ3Jlc3RvcmUgcHJldmlvdXMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBlbnN1cmVSZXN0b3JlZCAnVicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHREYXRhLmdldExpbmVzKFsyXSlcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIGlzIG5vdCByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCAncmVzdG9yZSBwcmV2aW91cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIGVuc3VyZVJlc3RvcmVkICdWIGonLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbMiwgM10pXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCAncmVzdG9yZSBwcmV2aW91cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIGVuc3VyZVJlc3RvcmVkICdWIGsnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbMSwgMl0pXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG5cbiAgICBkZXNjcmliZSBcImNoYXJhY3Rlcndpc2Ugc2VsZWN0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgZGVzY3JpYmUgXCJpbW1lZGlhdGVseSBhZnRlciB2XCIsIC0+XG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgZW5zdXJlUmVzdG9yZWQgJ3YnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjJcIlxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyBub3QgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgJ3Jlc3RvcmUgcHJldmlvdXMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBlbnN1cmVSZXN0b3JlZCAndiBqJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgICAyLS0tLUEtLS0tLS0tLS1CLS0tLVxuICAgICAgICAgICAgM1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgZW5zdXJlUmVzdG9yZWQgJ3YgaycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICBkZXNjcmliZSBcImJsb2Nrd2lzZSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiaW1tZWRpYXRlbHkgYWZ0ZXIgY3RybC12XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaXQgJ3Jlc3RvcmUgcHJldmlvdXMgc2VsZWN0aW9uJywgLT5cbiAgICAgICAgICBlbnN1cmVSZXN0b3JlZCAnY3RybC12JyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIyXCJcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyBub3QgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgJ3Jlc3RvcmUgcHJldmlvdXMgc2VsZWN0aW9uIGNhc2UtMScsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDVdXG4gICAgICAgICAga2V5c3Ryb2tlICdjdHJsLXYgMSAwIGwnXG4gICAgICAgICAgZW5zdXJlUmVzdG9yZWQgJzMgaicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IGJsb2NrVGV4dHNbMi4uNV1cbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbiBjYXNlLTInLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFs1LCA1XVxuICAgICAgICAgIGtleXN0cm9rZSAnY3RybC12IDEgMCBsJ1xuICAgICAgICAgIGVuc3VyZVJlc3RvcmVkICczIGsnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1syLi41XVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0ICdyZXN0b3JlIHByZXZpb3VzIHNlbGVjdGlvbiBjYXNlLTEnLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxNV1cbiAgICAgICAgICBrZXlzdHJva2UgJ2N0cmwtdiAxIDAgaCdcbiAgICAgICAgICBlbnN1cmVSZXN0b3JlZCAnMyBqJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogYmxvY2tUZXh0c1syLi41XVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgaXQgJ3Jlc3RvcmUgcHJldmlvdXMgc2VsZWN0aW9uIGNhc2UtMicsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzUsIDE1XVxuICAgICAgICAgIGtleXN0cm9rZSAnY3RybC12IDEgMCBoJ1xuICAgICAgICAgIGVuc3VyZVJlc3RvcmVkICczIGsnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogYmxvY2tUZXh0c1syLi41XVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiJdfQ==
