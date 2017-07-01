(function() {
  var helpers;

  helpers = require('./spec-helper');

  describe("Prefixes", function() {
    var editor, editorElement, keydown, vimState, _ref;
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
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          editor.setText("123456789abc");
          return editor.setCursorScreenPosition([0, 0]);
        });
        it("repeats N times", function() {
          keydown('3');
          keydown('x');
          return expect(editor.getText()).toBe('456789abc');
        });
        return it("repeats NN times", function() {
          keydown('1');
          keydown('0');
          keydown('x');
          return expect(editor.getText()).toBe('bc');
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          editor.setText('one two three');
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it("repeats N times", function() {
          keydown('d');
          keydown('2');
          keydown('w');
          return expect(editor.getText()).toBe('three');
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          editor.setText('one two three');
          return editor.setCursorScreenPosition([0, 0]);
        });
        return it("repeats movements in visual mode", function() {
          keydown("v");
          keydown("2");
          keydown("w");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 9]);
        });
      });
    });
    return describe("Register", function() {
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          vimState.setRegister('a', {
            text: 'new content'
          });
          return expect(vimState.getRegister("a").text).toEqual('new content');
        });
        return it("overwrites a value previously in the register", function() {
          vimState.setRegister('a', {
            text: 'content'
          });
          vimState.setRegister('a', {
            text: 'new content'
          });
          return expect(vimState.getRegister("a").text).toEqual('new content');
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          vimState.setRegister('B', {
            text: 'new content'
          });
          expect(vimState.getRegister("b").text).toEqual('new content');
          return expect(vimState.getRegister("B").text).toEqual('new content');
        });
        it("appends to a value previously in the register", function() {
          vimState.setRegister('b', {
            text: 'content'
          });
          vimState.setRegister('B', {
            text: 'new content'
          });
          return expect(vimState.getRegister("b").text).toEqual('contentnew content');
        });
        it("appends linewise to a linewise value previously in the register", function() {
          vimState.setRegister('b', {
            type: 'linewise',
            text: 'content\n'
          });
          vimState.setRegister('B', {
            text: 'new content'
          });
          return expect(vimState.getRegister("b").text).toEqual('content\nnew content\n');
        });
        return it("appends linewise to a character value previously in the register", function() {
          vimState.setRegister('b', {
            text: 'content'
          });
          vimState.setRegister('B', {
            type: 'linewise',
            text: 'new content\n'
          });
          return expect(vimState.getRegister("b").text).toEqual('content\nnew content\n');
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            expect(vimState.getRegister('*').text).toEqual('initial clipboard content');
            return expect(vimState.getRegister('*').type).toEqual('character');
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return vimState.setRegister('*', {
              text: 'new content'
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
            expect(vimState.getRegister('*').text).toEqual('initial clipboard content');
            return expect(vimState.getRegister('*').type).toEqual('character');
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return vimState.setRegister('*', {
              text: 'new content'
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
            return expect(vimState.getRegister("_").text).toEqual('');
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            vimState.setRegister('_', {
              text: 'new content'
            });
            return expect(vimState.getRegister("_").text).toEqual('');
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return expect(vimState.getRegister('%').text).toEqual('/Users/atom/known_value.txt');
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            vimState.setRegister('%', "new content");
            return expect(vimState.getRegister('%').text).toEqual('/Users/atom/known_value.txt');
          });
        });
      });
      return describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
          editor.setText("02\n");
          editor.setCursorScreenPosition([0, 0]);
          vimState.setRegister('"', {
            text: '345'
          });
          vimState.setRegister('a', {
            text: 'abc'
          });
          atom.clipboard.write("clip");
          keydown('a');
          return editor.insertText('1');
        });
        it("inserts contents of the unnamed register with \"", function() {
          keydown('r', {
            ctrl: true
          });
          keydown('"');
          return expect(editor.getText()).toBe('013452\n');
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard with \"", function() {
            atom.config.set('vim-mode.useClipboardAsDefaultRegister', true);
            keydown('r', {
              ctrl: true
            });
            keydown('"');
            return expect(editor.getText()).toBe('01clip2\n');
          });
        });
        it("inserts contents of the 'a' register", function() {
          keydown('r', {
            ctrl: true
          });
          keydown('a');
          return expect(editor.getText()).toBe('01abc2\n');
        });
        return it("is cancelled with the escape key", function() {
          keydown('r', {
            ctrl: true
          });
          keydown('escape');
          expect(editor.getText()).toBe('012\n');
          expect(vimState.mode).toBe("insert");
          return expect(editor.getCursorScreenPosition()).toEqual([0, 2]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9zcGVjL3ByZWZpeGVzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLE9BQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGVBQVIsQ0FBVixDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFFBQUEsOENBQUE7QUFBQSxJQUFBLE9BQW9DLEVBQXBDLEVBQUMsZ0JBQUQsRUFBUyx1QkFBVCxFQUF3QixrQkFBeEIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsT0FBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixVQUExQixDQUFWLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxpQkFBUixDQUFBLENBREEsQ0FBQTthQUdBLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixTQUFDLE9BQUQsR0FBQTtBQUN2QixRQUFBLGFBQUEsR0FBZ0IsT0FBaEIsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxHQUFTLGFBQWEsQ0FBQyxRQUFkLENBQUEsQ0FEVCxDQUFBO0FBQUEsUUFFQSxRQUFBLEdBQVcsYUFBYSxDQUFDLFFBRnpCLENBQUE7QUFBQSxRQUdBLFFBQVEsQ0FBQyxrQkFBVCxDQUFBLENBSEEsQ0FBQTtlQUlBLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFMdUI7TUFBQSxDQUF6QixFQUpTO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQWFBLE9BQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxPQUFOLEdBQUE7O1FBQU0sVUFBUTtPQUN0Qjs7UUFBQSxPQUFPLENBQUMsVUFBVztPQUFu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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/spec/prefixes-spec.coffee
