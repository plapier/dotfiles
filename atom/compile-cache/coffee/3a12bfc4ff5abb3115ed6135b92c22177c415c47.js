(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Scroll", function() {
    var editor, editorElement, ensure, keystroke, lines, n, ref1, set, text, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    lines = ((function() {
      var i, results;
      results = [];
      for (n = i = 0; i < 100; n = ++i) {
        results.push(n + " " + 'X'.repeat(10));
      }
      return results;
    })()).join("\n");
    text = new TextData(lines);
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        jasmine.attachToDOM(editorElement);
        set({
          text: text.getRaw()
        });
        editorElement.setHeight(20 * 10);
        editorElement.style.lineHeight = "10px";
        atom.views.performDocumentPoll();
        editorElement.setScrollTop(40 * 10);
        return set({
          cursor: [42, 0]
        });
      });
    });
    describe("the ctrl-u keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41]) + "42"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-u', {
          selectedText: text.getLines([32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-b keybinding", function() {
      it("moves screen up one page", function() {
        return ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41]) + "42"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-b', {
          selectedText: text.getLines([22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42])
        });
      });
    });
    describe("the ctrl-d keybinding", function() {
      it("moves the screen down by half screen size and keeps cursor onscreen", function() {
        return ensure('ctrl-d', {
          scrollTop: 500,
          cursor: [52, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51]).slice(1) + "5"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-d', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52])
        });
      });
    });
    describe("the ctrl-f keybinding", function() {
      it("moves screen down one page", function() {
        return ensure('ctrl-f', {
          scrollTop: 600,
          cursor: [62, 0]
        });
      });
      it("selects on visual mode", function() {
        set({
          cursor: [42, 1]
        });
        return ensure('v ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]).slice(1) + "6"
        });
      });
      return it("selects on linewise mode", function() {
        return ensure('V ctrl-f', {
          selectedText: text.getLines([42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62])
        });
      });
    });
    return describe("ctrl-f, ctrl-b, ctrl-d, ctrl-u", function() {
      beforeEach(function() {
        settings.set('moveToFirstCharacterOnVerticalMotion', false);
        set({
          cursor: [42, 10]
        });
        return ensure({
          scrollTop: 400
        });
      });
      return it("go to row with keep column and respect cursor.goalColum", function() {
        ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 10]
        });
        ensure('ctrl-f', {
          scrollTop: 400,
          cursor: [42, 10]
        });
        ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 10]
        });
        ensure('ctrl-d', {
          scrollTop: 400,
          cursor: [42, 10]
        });
        ensure('$', {
          cursor: [42, 12]
        });
        expect(editor.getLastCursor().goalColumn).toBe(2e308);
        ensure('ctrl-b', {
          scrollTop: 200,
          cursor: [22, 12]
        });
        ensure('ctrl-b', {
          scrollTop: 0,
          cursor: [2, 11]
        });
        ensure('ctrl-f', {
          scrollTop: 200,
          cursor: [22, 12]
        });
        ensure('ctrl-f', {
          scrollTop: 400,
          cursor: [42, 12]
        });
        ensure('ctrl-u', {
          scrollTop: 300,
          cursor: [32, 12]
        });
        ensure('ctrl-d', {
          scrollTop: 400,
          cursor: [42, 12]
        });
        return expect(editor.getLastCursor().goalColumn).toBe(2e308);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvbW90aW9uLXNjcm9sbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCOztFQUN4QixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7QUFDeEIsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUNoRCxLQUFBLEdBQVE7O0FBQUM7V0FBa0MsMkJBQWxDO3FCQUFBLENBQUEsR0FBSSxHQUFKLEdBQVUsR0FBRyxDQUFDLE1BQUosQ0FBVyxFQUFYO0FBQVY7O1FBQUQsQ0FBNkMsQ0FBQyxJQUE5QyxDQUFtRCxJQUFuRDtJQUNSLElBQUEsR0FBVyxJQUFBLFFBQUEsQ0FBUyxLQUFUO0lBRVgsVUFBQSxDQUFXLFNBQUE7TUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixjQUFELEVBQU0sb0JBQU4sRUFBYywwQkFBZCxFQUEyQjtNQUhqQixDQUFaO2FBS0EsSUFBQSxDQUFLLFNBQUE7UUFDSCxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQjtRQUNBLEdBQUEsQ0FBSTtVQUFBLElBQUEsRUFBTSxJQUFJLENBQUMsTUFBTCxDQUFBLENBQU47U0FBSjtRQUNBLGFBQWEsQ0FBQyxTQUFkLENBQXdCLEVBQUEsR0FBSyxFQUE3QjtRQUNBLGFBQWEsQ0FBQyxLQUFLLENBQUMsVUFBcEIsR0FBaUM7UUFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFB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aEZ3QixDQUExQjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk1vdGlvbiBTY3JvbGxcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cbiAgbGluZXMgPSAobiArIFwiIFwiICsgJ1gnLnJlcGVhdCgxMCkgZm9yIG4gaW4gWzAuLi4xMDBdKS5qb2luKFwiXFxuXCIpXG4gIHRleHQgPSBuZXcgVGV4dERhdGEobGluZXMpXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IF92aW1cblxuICAgIHJ1bnMgLT5cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcbiAgICAgIHNldCB0ZXh0OiB0ZXh0LmdldFJhdygpXG4gICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCgyMCAqIDEwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5saW5lSGVpZ2h0ID0gXCIxMHB4XCJcbiAgICAgIGF0b20udmlld3MucGVyZm9ybURvY3VtZW50UG9sbCgpXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCg0MCAqIDEwKVxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIGN0cmwtdSBrZXliaW5kaW5nXCIsIC0+XG4gICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIGRvd24gYnkgaGFsZiBzY3JlZW4gc2l6ZSBhbmQga2VlcHMgY3Vyc29yIG9uc2NyZWVuXCIsIC0+XG4gICAgICBlbnN1cmUgJ2N0cmwtdScsXG4gICAgICAgIHNjcm9sbFRvcDogMzAwXG4gICAgICAgIGN1cnNvcjogWzMyLCAwXVxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbNDIsIDFdXG4gICAgICBlbnN1cmUgJ3YgY3RybC11JyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFszMi4uNDFdKSArIFwiNDJcIlxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIGxpbmV3aXNlIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBjdHJsLXUnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzMyLi40Ml0pXG5cbiAgZGVzY3JpYmUgXCJ0aGUgY3RybC1iIGtleWJpbmRpbmdcIiwgLT5cbiAgICBpdCBcIm1vdmVzIHNjcmVlbiB1cCBvbmUgcGFnZVwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLWInLFxuICAgICAgICBzY3JvbGxUb3A6IDIwMFxuICAgICAgICBjdXJzb3I6IFsyMiwgMF1cblxuICAgIGl0IFwic2VsZWN0cyBvbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzQyLCAxXVxuICAgICAgZW5zdXJlICd2IGN0cmwtYicsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMjIuLjQxXSkgKyBcIjQyXCJcblxuICAgIGl0IFwic2VsZWN0cyBvbiBsaW5ld2lzZSBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgY3RybC1iJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsyMi4uNDJdKVxuXG4gIGRlc2NyaWJlIFwidGhlIGN0cmwtZCBrZXliaW5kaW5nXCIsIC0+XG4gICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIGRvd24gYnkgaGFsZiBzY3JlZW4gc2l6ZSBhbmQga2VlcHMgY3Vyc29yIG9uc2NyZWVuXCIsIC0+XG4gICAgICBlbnN1cmUgJ2N0cmwtZCcsXG4gICAgICAgIHNjcm9sbFRvcDogNTAwXG4gICAgICAgIGN1cnNvcjogWzUyLCAwXVxuXG4gICAgaXQgXCJzZWxlY3RzIG9uIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbNDIsIDFdXG4gICAgICBlbnN1cmUgJ3YgY3RybC1kJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Mi4uNTFdKS5zbGljZSgxKSArIFwiNVwiXG5cbiAgICBpdCBcInNlbGVjdHMgb24gbGluZXdpc2UgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdWIGN0cmwtZCcsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbNDIuLjUyXSlcblxuICBkZXNjcmliZSBcInRoZSBjdHJsLWYga2V5YmluZGluZ1wiLCAtPlxuICAgIGl0IFwibW92ZXMgc2NyZWVuIGRvd24gb25lIHBhZ2VcIiwgLT5cbiAgICAgIGVuc3VyZSAnY3RybC1mJyxcbiAgICAgICAgc2Nyb2xsVG9wOiA2MDBcbiAgICAgICAgY3Vyc29yOiBbNjIsIDBdXG5cbiAgICBpdCBcInNlbGVjdHMgb24gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFs0MiwgMV1cbiAgICAgIGVuc3VyZSAndiBjdHJsLWYnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQyLi42MV0pLnNsaWNlKDEpICsgXCI2XCJcblxuICAgIGl0IFwic2VsZWN0cyBvbiBsaW5ld2lzZSBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgY3RybC1mJyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Mi4uNjJdKVxuXG4gIGRlc2NyaWJlIFwiY3RybC1mLCBjdHJsLWIsIGN0cmwtZCwgY3RybC11XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb24nLCBmYWxzZSlcbiAgICAgIHNldCBjdXJzb3I6IFs0MiwgMTBdXG4gICAgICBlbnN1cmUgc2Nyb2xsVG9wOiA0MDBcblxuICAgIGl0IFwiZ28gdG8gcm93IHdpdGgga2VlcCBjb2x1bW4gYW5kIHJlc3BlY3QgY3Vyc29yLmdvYWxDb2x1bVwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLWInLCBzY3JvbGxUb3A6IDIwMCwgY3Vyc29yOiBbMjIsIDEwXVxuICAgICAgZW5zdXJlICdjdHJsLWYnLCBzY3JvbGxUb3A6IDQwMCwgY3Vyc29yOiBbNDIsIDEwXVxuICAgICAgZW5zdXJlICdjdHJsLXUnLCBzY3JvbGxUb3A6IDMwMCwgY3Vyc29yOiBbMzIsIDEwXVxuICAgICAgZW5zdXJlICdjdHJsLWQnLCBzY3JvbGxUb3A6IDQwMCwgY3Vyc29yOiBbNDIsIDEwXVxuICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbNDIsIDEyXVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ29hbENvbHVtbikudG9CZShJbmZpbml0eSlcbiAgICAgIGVuc3VyZSAnY3RybC1iJywgc2Nyb2xsVG9wOiAyMDAsIGN1cnNvcjogWzIyLCAxMl1cbiAgICAgIGVuc3VyZSAnY3RybC1iJywgc2Nyb2xsVG9wOiAgIDAsIGN1cnNvcjogWyAyLCAxMV1cbiAgICAgIGVuc3VyZSAnY3RybC1mJywgc2Nyb2xsVG9wOiAyMDAsIGN1cnNvcjogWzIyLCAxMl1cbiAgICAgIGVuc3VyZSAnY3RybC1mJywgc2Nyb2xsVG9wOiA0MDAsIGN1cnNvcjogWzQyLCAxMl1cbiAgICAgIGVuc3VyZSAnY3RybC11Jywgc2Nyb2xsVG9wOiAzMDAsIGN1cnNvcjogWzMyLCAxMl1cbiAgICAgIGVuc3VyZSAnY3RybC1kJywgc2Nyb2xsVG9wOiA0MDAsIGN1cnNvcjogWzQyLCAxMl1cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4iXX0=
