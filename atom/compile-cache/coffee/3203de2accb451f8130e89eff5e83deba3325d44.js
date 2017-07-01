(function() {
  var Ex, fs, helpers, os, path, uuid;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  uuid = require('node-uuid');

  helpers = require('./spec-helper');

  Ex = require('../lib/ex').singleton();

  describe("the commands", function() {
    var dir, dir2, editor, editorElement, exState, keydown, normalModeInputKeydown, projectPath, submitNormalModeInputText, vimState, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], vimState = _ref[2], exState = _ref[3], dir = _ref[4], dir2 = _ref[5];
    projectPath = function(fileName) {
      return path.join(dir, fileName);
    };
    beforeEach(function() {
      var exMode, vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      exMode = atom.packages.loadPackage('ex-mode');
      exMode.activate();
      return waitsForPromise(function() {
        return vimMode.activate().then(function() {
          return helpers.activateExMode().then(function() {
            dir = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
            dir2 = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
            fs.makeTreeSync(dir);
            fs.makeTreeSync(dir2);
            atom.project.setPaths([dir, dir2]);
            return helpers.getEditorElement(function(element) {
              atom.commands.dispatch(element, 'ex-mode:open');
              keydown('escape');
              editorElement = element;
              editor = editorElement.getModel();
              vimState = vimMode.mainModule.getEditorState(editor);
              exState = exMode.mainModule.exStates.get(editor);
              vimState.activateNormalMode();
              vimState.resetNormalMode();
              return editor.setText("abc\ndef\nabc\ndef");
            });
          });
        });
      });
    });
    afterEach(function() {
      fs.removeSync(dir);
      return fs.removeSync(dir2);
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
    submitNormalModeInputText = function(text) {
      var commandEditor;
      commandEditor = editor.normalModeInputView.editorElement;
      commandEditor.getModel().setText(text);
      return atom.commands.dispatch(commandEditor, "core:confirm");
    };
    describe(":write", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          keydown(':');
          submitNormalModeInputText('write');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('write-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          keydown(':');
          submitNormalModeInputText('write');
          expect(fs.existsSync(filePath)).toBe(true);
          return expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          keydown(':');
          submitNormalModeInputText('write');
          return expect(fs.writeFileSync.calls.length).toBe(0);
        });
      });
      return describe("when editing an existing file", function() {
        var filePath, i;
        filePath = '';
        i = 0;
        beforeEach(function() {
          i++;
          filePath = projectPath("write-" + i);
          editor.setText('abc\ndef');
          return editor.saveAs(filePath);
        });
        it("saves the file", function() {
          editor.setText('abc');
          keydown(':');
          submitNormalModeInputText('write');
          expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc');
          return expect(editor.isModified()).toBe(false);
        });
        describe("with a specified path", function() {
          var newPath;
          newPath = '';
          beforeEach(function() {
            newPath = path.relative(dir, "" + filePath + ".new");
            editor.getBuffer().setText('abc');
            return keydown(':');
          });
          afterEach(function() {
            submitNormalModeInputText("write " + newPath);
            newPath = path.resolve(dir, fs.normalize(newPath));
            expect(fs.existsSync(newPath)).toBe(true);
            expect(fs.readFileSync(newPath, 'utf-8')).toEqual('abc');
            expect(editor.isModified()).toBe(true);
            return fs.removeSync(newPath);
          });
          it("saves to the path", function() {});
          it("expands .", function() {
            return newPath = path.join('.', newPath);
          });
          it("expands ..", function() {
            return newPath = path.join('..', newPath);
          });
          return it("expands ~", function() {
            return newPath = path.join('~', newPath);
          });
        });
        it("throws an error with more than one path", function() {
          keydown(':');
          submitNormalModeInputText('write path1 path2');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
        return describe("when the file already exists", function() {
          var existsPath;
          existsPath = '';
          beforeEach(function() {
            existsPath = projectPath('write-exists');
            return fs.writeFileSync(existsPath, 'abc');
          });
          afterEach(function() {
            return fs.removeSync(existsPath);
          });
          it("throws an error if the file already exists", function() {
            keydown(':');
            submitNormalModeInputText("write " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :write!", function() {
            keydown(':');
            submitNormalModeInputText("write! " + existsPath);
            expect(atom.notifications.notifications).toEqual([]);
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc\ndef');
          });
        });
      });
    });
    describe(":quit", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'destroyActiveItem').andCallThrough();
          return atom.workspace.open();
        });
      });
      it("closes the active pane item if not modified", function() {
        keydown(':');
        submitNormalModeInputText('quit');
        expect(pane.destroyActiveItem).toHaveBeenCalled();
        return expect(pane.getItems().length).toBe(1);
      });
      return describe("when the active pane item is modified", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('def');
        });
        return it("opens the prompt to save", function() {
          spyOn(pane, 'promptToSaveItem');
          keydown(':');
          submitNormalModeInputText('quit');
          return expect(pane.promptToSaveItem).toHaveBeenCalled();
        });
      });
    });
    describe(":tabclose", function() {
      return it("acts as an alias to :quit", function() {
        var _ref1;
        spyOn(Ex, 'tabclose').andCallThrough();
        spyOn(Ex, 'quit').andCallThrough();
        keydown(':');
        submitNormalModeInputText('tabclose');
        return (_ref1 = expect(Ex.quit)).toHaveBeenCalledWith.apply(_ref1, Ex.tabclose.calls[0].args);
      });
    });
    describe(":tabnext", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          return atom.workspace.open().then(function() {
            return atom.workspace.open();
          }).then(function() {
            return atom.workspace.open();
          });
        });
      });
      it("switches to the next tab", function() {
        pane.activateItemAtIndex(1);
        keydown(':');
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(2);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(pane.getItems().length - 1);
        keydown(':');
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
    });
    describe(":tabprevious", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          return atom.workspace.open().then(function() {
            return atom.workspace.open();
          }).then(function() {
            return atom.workspace.open();
          });
        });
      });
      it("switches to the previous tab", function() {
        pane.activateItemAtIndex(1);
        keydown(':');
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(0);
        keydown(':');
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(pane.getItems().length - 1);
      });
    });
    describe(":wq", function() {
      beforeEach(function() {
        spyOn(Ex, 'write').andCallThrough();
        return spyOn(Ex, 'quit');
      });
      it("writes the file, then quits", function() {
        spyOn(atom, 'showSaveDialogSync').andReturn(projectPath('wq-1'));
        keydown(':');
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
      it("doesn't quit when the file is new and no path is specified in the save dialog", function() {
        var wasNotCalled;
        spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
        keydown(':');
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        wasNotCalled = false;
        setImmediate((function() {
          return wasNotCalled = !Ex.quit.wasCalled;
        }));
        return waitsFor((function() {
          return wasNotCalled;
        }), 100);
      });
      return it("passes the file name", function() {
        keydown(':');
        submitNormalModeInputText('wq wq-2');
        expect(Ex.write).toHaveBeenCalled();
        expect(Ex.write.calls[0].args[1].trim()).toEqual('wq-2');
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
    });
    describe(":xit", function() {
      return it("acts as an alias to :wq", function() {
        spyOn(Ex, 'wq');
        keydown(':');
        submitNormalModeInputText('xit');
        return expect(Ex.wq).toHaveBeenCalled();
      });
    });
    describe(":edit", function() {
      describe("without a file name", function() {
        it("reloads the file from the disk", function() {
          var filePath;
          filePath = projectPath("edit-1");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          fs.writeFileSync(filePath, 'def');
          keydown(':');
          submitNormalModeInputText('edit');
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 100);
        });
        it("doesn't reload when the file has been modified", function() {
          var filePath, isntDef;
          filePath = projectPath("edit-2");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          editor.getBuffer().setText('abcd');
          fs.writeFileSync(filePath, 'def');
          keydown(':');
          submitNormalModeInputText('edit');
          expect(atom.notifications.notifications[0].message).toEqual('Command error: No write since last change (add ! to override)');
          isntDef = false;
          setImmediate(function() {
            return isntDef = editor.getText() !== 'def';
          });
          return waitsFor((function() {
            return isntDef;
          }), "the editor's content not to change", 50);
        });
        it("reloads when the file has been modified and it is forced", function() {
          var filePath;
          filePath = projectPath("edit-3");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          editor.getBuffer().setText('abcd');
          fs.writeFileSync(filePath, 'def');
          keydown(':');
          submitNormalModeInputText('edit!');
          expect(atom.notifications.notifications.length).toBe(0);
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 50);
        });
        return it("throws an error when editing a new file", function() {
          editor.getBuffer().reload();
          keydown(':');
          submitNormalModeInputText('edit');
          expect(atom.notifications.notifications[0].message).toEqual('Command error: No file name');
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText('edit!');
          return expect(atom.notifications.notifications[1].message).toEqual('Command error: No file name');
        });
      });
      return describe("with a file name", function() {
        beforeEach(function() {
          spyOn(atom.workspace, 'open');
          return editor.getBuffer().reload();
        });
        it("opens the specified path", function() {
          var filePath;
          filePath = projectPath('edit-new-test');
          keydown(':');
          submitNormalModeInputText("edit " + filePath);
          return expect(atom.workspace.open).toHaveBeenCalledWith(filePath);
        });
        it("opens a relative path", function() {
          keydown(':');
          submitNormalModeInputText('edit edit-relative-test');
          return expect(atom.workspace.open).toHaveBeenCalledWith(projectPath('edit-relative-test'));
        });
        return it("throws an error if trying to open more than one file", function() {
          keydown(':');
          submitNormalModeInputText('edit edit-new-test-1 edit-new-test-2');
          expect(atom.workspace.open.callCount).toBe(0);
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
      });
    });
    describe(":tabedit", function() {
      it("acts as an alias to :edit if supplied with a path", function() {
        var _ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'edit');
        keydown(':');
        submitNormalModeInputText('tabedit tabedit-test');
        return (_ref1 = expect(Ex.edit)).toHaveBeenCalledWith.apply(_ref1, Ex.tabedit.calls[0].args);
      });
      return it("acts as an alias to :tabnew if not supplied with a path", function() {
        var _ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'tabnew');
        keydown(':');
        submitNormalModeInputText('tabedit  ');
        return (_ref1 = expect(Ex.tabnew)).toHaveBeenCalledWith.apply(_ref1, Ex.tabedit.calls[0].args);
      });
    });
    describe(":tabnew", function() {
      return it("opens a new tab", function() {
        spyOn(atom.workspace, 'open');
        keydown(':');
        submitNormalModeInputText('tabnew');
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
    });
    describe(":split", function() {
      return it("splits the current file upwards", function() {
        var filePath, pane;
        pane = atom.workspace.getActivePane();
        spyOn(pane, 'splitUp').andCallThrough();
        filePath = projectPath('split');
        editor.saveAs(filePath);
        keydown(':');
        submitNormalModeInputText('split');
        return expect(pane.splitUp).toHaveBeenCalled();
      });
    });
    describe(":vsplit", function() {
      return it("splits the current file to the left", function() {
        var filePath, pane;
        pane = atom.workspace.getActivePane();
        spyOn(pane, 'splitLeft').andCallThrough();
        filePath = projectPath('vsplit');
        editor.saveAs(filePath);
        keydown(':');
        submitNormalModeInputText('vsplit');
        return expect(pane.splitLeft).toHaveBeenCalled();
      });
    });
    describe(":delete", function() {
      beforeEach(function() {
        editor.setText('abc\ndef\nghi\njkl');
        return editor.setCursorBufferPosition([2, 0]);
      });
      it("deletes the current line", function() {
        keydown(':');
        submitNormalModeInputText('delete');
        return expect(editor.getText()).toEqual('abc\ndef\njkl');
      });
      it("deletes the lines in the given range", function() {
        var processedOpStack;
        processedOpStack = false;
        exState.onDidProcessOpStack(function() {
          return processedOpStack = true;
        });
        keydown(':');
        submitNormalModeInputText('1,2delete');
        expect(editor.getText()).toEqual('ghi\njkl');
        waitsFor(function() {
          return processedOpStack;
        });
        editor.setText('abc\ndef\nghi\njkl');
        editor.setCursorBufferPosition([1, 1]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(',/k/delete');
        return expect(editor.getText()).toEqual('abc\n');
      });
      return it("undos deleting several lines at once", function() {
        keydown(':');
        submitNormalModeInputText('-1,.delete');
        expect(editor.getText()).toEqual('abc\njkl');
        atom.commands.dispatch(editorElement, 'core:undo');
        return expect(editor.getText()).toEqual('abc\ndef\nghi\njkl');
      });
    });
    describe(":substitute", function() {
      beforeEach(function() {
        editor.setText('abcaABC\ndefdDEF\nabcaABC');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("replaces a character on the current line", function() {
        keydown(':');
        submitNormalModeInputText(':substitute /a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("doesn't need a space before the arguments", function() {
        keydown(':');
        submitNormalModeInputText(':substitute/a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("respects modifiers passed to it", function() {
        keydown(':');
        submitNormalModeInputText(':substitute/a/x/g');
        expect(editor.getText()).toEqual('xbcxABC\ndefdDEF\nabcaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':substitute/a/x/gi');
        return expect(editor.getText()).toEqual('xbcxxBC\ndefdDEF\nabcaABC');
      });
      it("replaces on multiple lines", function() {
        keydown(':');
        submitNormalModeInputText(':%substitute/abc/ghi');
        expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nghiaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':%substitute/abc/ghi/ig');
        return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nghiaghi');
      });
      it("can't be delimited by letters", function() {
        keydown(':');
        submitNormalModeInputText(':substitute nanxngi');
        expect(atom.notifications.notifications[0].message).toEqual("Command error: Regular expressions can't be delimited by letters");
        return expect(editor.getText()).toEqual('abcaABC\ndefdDEF\nabcaABC');
      });
      return describe("capturing groups", function() {
        beforeEach(function() {
          return editor.setText('abcaABC\ndefdDEF\nabcaABC');
        });
        it("replaces \\1 with the first group", function() {
          keydown(':');
          submitNormalModeInputText(':substitute/bc(.{2})/X\\1X');
          return expect(editor.getText()).toEqual('aXaAXBC\ndefdDEF\nabcaABC');
        });
        it("replaces multiple groups", function() {
          keydown(':');
          submitNormalModeInputText(':substitute/a([a-z]*)aA([A-Z]*)/X\\1XY\\2Y');
          return expect(editor.getText()).toEqual('XbcXYBCY\ndefdDEF\nabcaABC');
        });
        return it("replaces \\0 with the entire match", function() {
          keydown(':');
          submitNormalModeInputText(':substitute/ab(ca)AB/X\\0X');
          return expect(editor.getText()).toEqual('XabcaABXC\ndefdDEF\nabcaABC');
        });
      });
    });
    return describe(":set", function() {
      it("throws an error without a specified option", function() {
        keydown(':');
        submitNormalModeInputText(':set');
        return expect(atom.notifications.notifications[0].message).toEqual('Command error: No option specified');
      });
      it("sets multiple options at once", function() {
        atom.config.set('editor.showInvisibles', false);
        atom.config.set('editor.showLineNumbers', false);
        keydown(':');
        submitNormalModeInputText(':set list number');
        expect(atom.config.get('editor.showInvisibles')).toBe(true);
        return expect(atom.config.get('editor.showLineNumbers')).toBe(true);
      });
      return describe("the options", function() {
        beforeEach(function() {
          atom.config.set('editor.showInvisibles', false);
          return atom.config.set('editor.showLineNumbers', false);
        });
        it("sets (no)list", function() {
          keydown(':');
          submitNormalModeInputText(':set list');
          expect(atom.config.get('editor.showInvisibles')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nolist');
          return expect(atom.config.get('editor.showInvisibles')).toBe(false);
        });
        return it("sets (no)nu(mber)", function() {
          keydown(':');
          submitNormalModeInputText(':set nu');
          expect(atom.config.get('editor.showLineNumbers')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nonu');
          expect(atom.config.get('editor.showLineNumbers')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set number');
          expect(atom.config.get('editor.showLineNumbers')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nonumber');
          return expect(atom.config.get('editor.showLineNumbers')).toBe(false);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvZXgtY29tbWFuZHMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0JBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBSlYsQ0FBQTs7QUFBQSxFQU1BLEVBQUEsR0FBSyxPQUFBLENBQVEsV0FBUixDQUFvQixDQUFDLFNBQXJCLENBQUEsQ0FOTCxDQUFBOztBQUFBLEVBUUEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEsa0lBQUE7QUFBQSxJQUFBLE9BQXdELEVBQXhELEVBQUMsZ0JBQUQsRUFBUyx1QkFBVCxFQUF3QixrQkFBeEIsRUFBa0MsaUJBQWxDLEVBQTJDLGFBQTNDLEVBQWdELGNBQWhELENBQUE7QUFBQSxJQUNBLFdBQUEsR0FBYyxTQUFDLFFBQUQsR0FBQTthQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLFFBQWYsRUFBZDtJQUFBLENBRGQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsZUFBQTtBQUFBLE1BQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixVQUExQixDQUFWLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsU0FBMUIsQ0FEVCxDQUFBO0FBQUEsTUFFQSxNQUFNLENBQUMsUUFBUCxDQUFBLENBRkEsQ0FBQTthQUlBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsT0FBTyxDQUFDLFFBQVIsQ0FBQSxDQUFrQixDQUFDLElBQW5CLENBQXdCLFNBQUEsR0FBQTtpQkFDdEIsT0FBTyxDQUFDLGNBQVIsQ0FBQSxDQUF3QixDQUFDLElBQXpCLENBQThCLFNBQUEsR0FBQTtBQUM1QixZQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVixFQUF3QixvQkFBQSxHQUFtQixDQUFDLElBQUksQ0FBQyxFQUFMLENBQUEsQ0FBRCxDQUEzQyxDQUFOLENBQUE7QUFBQSxZQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVixFQUF3QixvQkFBQSxHQUFtQixDQUFDLElBQUksQ0FBQyxFQUFMLENBQUEsQ0FBRCxDQUEzQyxDQURQLENBQUE7QUFBQSxZQUVBLEVBQUUsQ0FBQyxZQUFILENBQWdCLEdBQWhCLENBRkEsQ0FBQTtBQUFBLFlBR0EsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsSUFBaEIsQ0FIQSxDQUFBO0FBQUEsWUFJQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBc0IsQ0FBQyxHQUFELEVBQU0sSUFBTixDQUF0QixDQUpBLENBQUE7bUJBTUEsT0FBTyxDQUFDLGdCQUFSLENBQXlCLFNBQUMsT0FBRCxHQUFBO0FBQ3ZCLGNBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLE9BQXZCLEVBQWdDLGNBQWhDLENBQUEsQ0FBQTtBQUFBLGNBQ0EsT0FBQSxDQUFRLFFBQVIsQ0FEQSxDQUFBO0FBQUEsY0FFQSxhQUFBLEdBQWdCLE9BRmhCLENBQUE7QUFBQSxjQUdBLE1BQUEsR0FBUyxhQUFhLENBQUMsUUFBZCxDQUFBLENBSFQsQ0FBQTtBQUFBLGNBSUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxVQUFVLENBQUMsY0FBbkIsQ0FBa0MsTUFBbEMsQ0FKWCxDQUFBO0FBQUEsY0FLQSxPQUFBLEdBQVUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBM0IsQ0FBK0IsTUFBL0IsQ0FMVixDQUFBO0FBQUEsY0FNQSxRQUFRLENBQUMsa0JBQVQsQ0FBQSxDQU5BLENBQUE7QUFBQSxjQU9BLFFBQVEsQ0FBQyxlQUFULENBQUEsQ0FQQSxDQUFBO3FCQVFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsb0JBQWYsRUFUdUI7WUFBQSxDQUF6QixFQVA0QjtVQUFBLENBQTlCLEVBRHNCO1FBQUEsQ0FBeEIsRUFEYztNQUFBLENBQWhCLEVBTFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBMkJBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7QUFDUixNQUFBLEVBQUUsQ0FBQyxVQUFILENBQWMsR0FBZCxDQUFBLENBQUE7YUFDQSxFQUFFLENBQUMsVUFBSCxDQUFjLElBQWQsRUFGUTtJQUFBLENBQVYsQ0EzQkEsQ0FBQTtBQUFBLElBK0JBLE9BQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxPQUFOLEdBQUE7O1FBQU0sVUFBUTtPQUN0Qjs7UUFBQSxPQUFPLENBQUMsVUFBVztPQUFuQjthQUNBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEdBQWhCLEVBQXFCLE9BQXJCLEVBRlE7SUFBQSxDQS9CVixDQUFBO0FBQUEsSUFtQ0Esc0JBQUEsR0FBeUIsU0FBQyxHQUFELEVBQU0sSUFBTixHQUFBOztRQUFNLE9BQU87T0FDcEM7YUFBQSxNQUFNLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLFFBQXpDLENBQUEsQ0FBbUQsQ0FBQyxPQUFwRCxDQUE0RCxHQUE1RCxFQUR1QjtJQUFBLENBbkN6QixDQUFBO0FBQUEsSUFzQ0EseUJBQUEsR0FBNEIsU0FBQyxJQUFELEdBQUE7QUFDMUIsVUFBQSxhQUFBO0FBQUEsTUFBQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxhQUEzQyxDQUFBO0FBQUEsTUFDQSxhQUFhLENBQUMsUUFBZCxDQUFBLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsSUFBakMsQ0FEQSxDQUFBO2FBRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLGNBQXRDLEVBSDBCO0lBQUEsQ0F0QzVCLENBQUE7QUFBQSxJQTJDQSxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBLEdBQUE7QUFDakIsTUFBQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsVUFBM0IsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsS0FBQSxDQUFNLElBQU4sRUFBWSxvQkFBWixDQUFBLENBQUE7QUFBQSxVQUNBLE9BQUEsQ0FBUSxHQUFSLENBREEsQ0FBQTtBQUFBLFVBRUEseUJBQUEsQ0FBMEIsT0FBMUIsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxJQUFJLENBQUMsa0JBQVosQ0FBK0IsQ0FBQyxnQkFBaEMsQ0FBQSxFQUowQjtRQUFBLENBQTVCLENBSEEsQ0FBQTtBQUFBLFFBU0EsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUEsR0FBQTtBQUN0RCxjQUFBLFFBQUE7QUFBQSxVQUFBLFFBQUEsR0FBVyxXQUFBLENBQVksd0JBQVosQ0FBWCxDQUFBO0FBQUEsVUFDQSxLQUFBLENBQU0sSUFBTixFQUFZLG9CQUFaLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsUUFBNUMsQ0FEQSxDQUFBO0FBQUEsVUFFQSxPQUFBLENBQVEsR0FBUixDQUZBLENBQUE7QUFBQSxVQUdBLHlCQUFBLENBQTBCLE9BQTFCLENBSEEsQ0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsUUFBZCxDQUFQLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsSUFBckMsQ0FKQSxDQUFBO2lCQUtBLE1BQUEsQ0FBTyxFQUFFLENBQUMsWUFBSCxDQUFnQixRQUFoQixFQUEwQixPQUExQixDQUFQLENBQTBDLENBQUMsT0FBM0MsQ0FBbUQsVUFBbkQsRUFOc0Q7UUFBQSxDQUF4RCxDQVRBLENBQUE7ZUFpQkEsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUEsR0FBQTtBQUN0RCxVQUFBLEtBQUEsQ0FBTSxJQUFOLEVBQVksb0JBQVosQ0FBaUMsQ0FBQyxTQUFsQyxDQUE0QyxNQUE1QyxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsZUFBVixDQURBLENBQUE7QUFBQSxVQUVBLE9BQUEsQ0FBUSxHQUFSLENBRkEsQ0FBQTtBQUFBLFVBR0EseUJBQUEsQ0FBMEIsT0FBMUIsQ0FIQSxDQUFBO2lCQUlBLE1BQUEsQ0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUE5QixDQUFxQyxDQUFDLElBQXRDLENBQTJDLENBQTNDLEVBTHNEO1FBQUEsQ0FBeEQsRUFsQmtDO01BQUEsQ0FBcEMsQ0FBQSxDQUFBO2FBeUJBLFFBQUEsQ0FBUywrQkFBVCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsWUFBQSxXQUFBO0FBQUEsUUFBQSxRQUFBLEdBQVcsRUFBWCxDQUFBO0FBQUEsUUFDQSxDQUFBLEdBQUksQ0FESixDQUFBO0FBQUEsUUFHQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBLFVBQ0EsUUFBQSxHQUFXLFdBQUEsQ0FBYSxRQUFBLEdBQVEsQ0FBckIsQ0FEWCxDQUFBO0FBQUEsVUFFQSxNQUFNLENBQUMsT0FBUCxDQUFlLFVBQWYsQ0FGQSxDQUFBO2lCQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBZCxFQUpTO1FBQUEsQ0FBWCxDQUhBLENBQUE7QUFBQSxRQVNBLEVBQUEsQ0FBRyxnQkFBSCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsVUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLEtBQWYsQ0FBQSxDQUFBO0FBQUEsVUFDQSxPQUFBLENBQVEsR0FBUixDQURBLENBQUE7QUFBQSxVQUVBLHlCQUFBLENBQTBCLE9BQTFCLENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLEVBQTBCLE9BQTFCLENBQVAsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxLQUFuRCxDQUhBLENBQUE7aUJBSUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBUCxDQUEyQixDQUFDLElBQTVCLENBQWlDLEtBQWpDLEVBTG1CO1FBQUEsQ0FBckIsQ0FUQSxDQUFBO0FBQUEsUUFnQkEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxjQUFBLE9BQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxFQUFWLENBQUE7QUFBQSxVQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxZQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBTCxDQUFjLEdBQWQsRUFBbUIsRUFBQSxHQUFHLFFBQUgsR0FBWSxNQUEvQixDQUFWLENBQUE7QUFBQSxZQUNBLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixLQUEzQixDQURBLENBQUE7bUJBRUEsT0FBQSxDQUFRLEdBQVIsRUFIUztVQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsVUFPQSxTQUFBLENBQVUsU0FBQSxHQUFBO0FBQ1IsWUFBQSx5QkFBQSxDQUEyQixRQUFBLEdBQVEsT0FBbkMsQ0FBQSxDQUFBO0FBQUEsWUFDQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxHQUFiLEVBQWtCLEVBQUUsQ0FBQyxTQUFILENBQWEsT0FBYixDQUFsQixDQURWLENBQUE7QUFBQSxZQUVBLE1BQUEsQ0FBTyxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsQ0FBUCxDQUE4QixDQUFDLElBQS9CLENBQW9DLElBQXBDLENBRkEsQ0FBQTtBQUFBLFlBR0EsTUFBQSxDQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLE9BQWhCLEVBQXlCLE9BQXpCLENBQVAsQ0FBeUMsQ0FBQyxPQUExQyxDQUFrRCxLQUFsRCxDQUhBLENBQUE7QUFBQSxZQUlBLE1BQUEsQ0FBTyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQVAsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxJQUFqQyxDQUpBLENBQUE7bUJBS0EsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLEVBTlE7VUFBQSxDQUFWLENBUEEsQ0FBQTtBQUFBLFVBZUEsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUEsR0FBQSxDQUF4QixDQWZBLENBQUE7QUFBQSxVQWlCQSxFQUFBLENBQUcsV0FBSCxFQUFnQixTQUFBLEdBQUE7bUJBQ2QsT0FBQSxHQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLE9BQWYsRUFESTtVQUFBLENBQWhCLENBakJBLENBQUE7QUFBQSxVQW9CQSxFQUFBLENBQUcsWUFBSCxFQUFpQixTQUFBLEdBQUE7bUJBQ2YsT0FBQSxHQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixFQUFnQixPQUFoQixFQURLO1VBQUEsQ0FBakIsQ0FwQkEsQ0FBQTtpQkF1QkEsRUFBQSxDQUFHLFdBQUgsRUFBZ0IsU0FBQSxHQUFBO21CQUNkLE9BQUEsR0FBVSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBZSxPQUFmLEVBREk7VUFBQSxDQUFoQixFQXhCZ0M7UUFBQSxDQUFsQyxDQWhCQSxDQUFBO0FBQUEsUUEyQ0EsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUEsR0FBQTtBQUM1QyxVQUFBLE9BQUEsQ0FBUSxHQUFSLENBQUEsQ0FBQTtBQUFBLFVBQ0EseUJBQUEsQ0FBMEIsbUJBQTFCLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFjLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBM0MsQ0FBbUQsQ0FBQyxPQUFwRCxDQUNFLDJDQURGLEVBSDRDO1FBQUEsQ0FBOUMsQ0EzQ0EsQ0FBQTtlQWtEQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQSxHQUFBO0FBQ3ZDLGNBQUEsVUFBQTtBQUFBLFVBQUEsVUFBQSxHQUFhLEVBQWIsQ0FBQTtBQUFBLFVBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFlBQUEsVUFBQSxHQUFhLFdBQUEsQ0FBWSxjQUFaLENBQWIsQ0FBQTttQkFDQSxFQUFFLENBQUMsYUFBSCxDQUFpQixVQUFqQixFQUE2QixLQUE3QixFQUZTO1VBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxVQU1BLFNBQUEsQ0FBVSxTQUFBLEdBQUE7bUJBQ1IsRUFBRSxDQUFDLFVBQUgsQ0FBYyxVQUFkLEVBRFE7VUFBQSxDQUFWLENBTkEsQ0FBQTtBQUFBLFVBU0EsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUEsR0FBQTtBQUMvQyxZQUFBLE9BQUEsQ0FBUSxHQUFSLENBQUEsQ0FBQTtBQUFBLFlBQ0EseUJBQUEsQ0FBMkIsUUFBQSxHQUFRLFVBQW5DLENBREEsQ0FBQTtBQUFBLFlBRUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQTNDLENBQW1ELENBQUMsT0FBcEQsQ0FDRSxnREFERixDQUZBLENBQUE7bUJBS0EsTUFBQSxDQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLFVBQWhCLEVBQTRCLE9BQTVCLENBQVAsQ0FBNEMsQ0FBQyxPQUE3QyxDQUFxRCxLQUFyRCxFQU4rQztVQUFBLENBQWpELENBVEEsQ0FBQTtpQkFpQkEsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxZQUFBLE9BQUEsQ0FBUSxHQUFSLENBQUEsQ0FBQTtBQUFBLFlBQ0EseUJBQUEsQ0FBMkIsU0FBQSxHQUFTLFVBQXBDLENBREEsQ0FBQTtBQUFBLFlBRUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBMUIsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxFQUFqRCxDQUZBLENBQUE7bUJBR0EsTUFBQSxDQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLFVBQWhCLEVBQTRCLE9BQTVCLENBQVAsQ0FBNEMsQ0FBQyxPQUE3QyxDQUFxRCxVQUFyRCxFQUprQztVQUFBLENBQXBDLEVBbEJ1QztRQUFBLENBQXpDLEVBbkR3QztNQUFBLENBQTFDLEVBMUJpQjtJQUFBLENBQW5CLENBM0NBLENBQUE7QUFBQSxJQWdKQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBLEdBQUE7QUFDaEIsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO0FBQUEsTUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQ1QsZUFBQSxDQUFnQixTQUFBLEdBQUE7QUFDZCxVQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUFQLENBQUE7QUFBQSxVQUNBLEtBQUEsQ0FBTSxJQUFOLEVBQVksbUJBQVosQ0FBZ0MsQ0FBQyxjQUFqQyxDQUFBLENBREEsQ0FBQTtpQkFFQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxFQUhjO1FBQUEsQ0FBaEIsRUFEUztNQUFBLENBQVgsQ0FEQSxDQUFBO0FBQUEsTUFPQSxFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQSxHQUFBO0FBQ2hELFFBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsUUFDQSx5QkFBQSxDQUEwQixNQUExQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsaUJBQVosQ0FBOEIsQ0FBQyxnQkFBL0IsQ0FBQSxDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFlLENBQUMsTUFBdkIsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxDQUFwQyxFQUpnRDtNQUFBLENBQWxELENBUEEsQ0FBQTthQWFBLFFBQUEsQ0FBUyx1Q0FBVCxFQUFrRCxTQUFBLEdBQUE7QUFDaEQsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixLQUEzQixFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7ZUFHQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFVBQUEsS0FBQSxDQUFNLElBQU4sRUFBWSxrQkFBWixDQUFBLENBQUE7QUFBQSxVQUNBLE9BQUEsQ0FBUSxHQUFSLENBREEsQ0FBQTtBQUFBLFVBRUEseUJBQUEsQ0FBMEIsTUFBMUIsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxJQUFJLENBQUMsZ0JBQVosQ0FBNkIsQ0FBQyxnQkFBOUIsQ0FBQSxFQUo2QjtRQUFBLENBQS9CLEVBSmdEO01BQUEsQ0FBbEQsRUFkZ0I7SUFBQSxDQUFsQixDQWhKQSxDQUFBO0FBQUEsSUF3S0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO2FBQ3BCLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsWUFBQSxLQUFBO0FBQUEsUUFBQSxLQUFBLENBQU0sRUFBTixFQUFVLFVBQVYsQ0FBcUIsQ0FBQyxjQUF0QixDQUFBLENBQUEsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxDQUFNLEVBQU4sRUFBVSxNQUFWLENBQWlCLENBQUMsY0FBbEIsQ0FBQSxDQURBLENBQUE7QUFBQSxRQUVBLE9BQUEsQ0FBUSxHQUFSLENBRkEsQ0FBQTtBQUFBLFFBR0EseUJBQUEsQ0FBMEIsVUFBMUIsQ0FIQSxDQUFBO2VBSUEsU0FBQSxNQUFBLENBQU8sRUFBRSxDQUFDLElBQVYsQ0FBQSxDQUFlLENBQUMsb0JBQWhCLGNBQXFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQTFELEVBTDhCO01BQUEsQ0FBaEMsRUFEb0I7SUFBQSxDQUF0QixDQXhLQSxDQUFBO0FBQUEsSUFnTEEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBUCxDQUFBO2lCQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQSxHQUFBO21CQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLEVBQUg7VUFBQSxDQUEzQixDQUNFLENBQUMsSUFESCxDQUNRLFNBQUEsR0FBQTttQkFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxFQUFIO1VBQUEsQ0FEUixFQUZjO1FBQUEsQ0FBaEIsRUFEUztNQUFBLENBQVgsQ0FEQSxDQUFBO0FBQUEsTUFPQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFFBQUEsSUFBSSxDQUFDLG1CQUFMLENBQXlCLENBQXpCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxDQUFRLEdBQVIsQ0FEQSxDQUFBO0FBQUEsUUFFQSx5QkFBQSxDQUEwQixTQUExQixDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLGtCQUFMLENBQUEsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLENBQXZDLEVBSjZCO01BQUEsQ0FBL0IsQ0FQQSxDQUFBO2FBYUEsRUFBQSxDQUFHLGNBQUgsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsSUFBSSxDQUFDLG1CQUFMLENBQXlCLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBZSxDQUFDLE1BQWhCLEdBQXlCLENBQWxELENBQUEsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxDQUFRLEdBQVIsQ0FEQSxDQUFBO0FBQUEsUUFFQSx5QkFBQSxDQUEwQixTQUExQixDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLGtCQUFMLENBQUEsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLENBQXZDLEVBSmlCO01BQUEsQ0FBbkIsRUFkbUI7SUFBQSxDQUFyQixDQWhMQSxDQUFBO0FBQUEsSUFvTUEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQVAsQ0FBQTtBQUFBLE1BQ0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO0FBQ2QsVUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBUCxDQUFBO2lCQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQSxHQUFBO21CQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLEVBQUg7VUFBQSxDQUEzQixDQUNFLENBQUMsSUFESCxDQUNRLFNBQUEsR0FBQTttQkFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxFQUFIO1VBQUEsQ0FEUixFQUZjO1FBQUEsQ0FBaEIsRUFEUztNQUFBLENBQVgsQ0FEQSxDQUFBO0FBQUEsTUFPQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQSxHQUFBO0FBQ2pDLFFBQUEsSUFBSSxDQUFDLG1CQUFMLENBQXlCLENBQXpCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxDQUFRLEdBQVIsQ0FEQSxDQUFBO0FBQUEsUUFFQSx5QkFBQSxDQUEwQixhQUExQixDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLGtCQUFMLENBQUEsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLENBQXZDLEVBSmlDO01BQUEsQ0FBbkMsQ0FQQSxDQUFBO2FBYUEsRUFBQSxDQUFHLGNBQUgsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsSUFBSSxDQUFDLG1CQUFMLENBQXlCLENBQXpCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsT0FBQSxDQUFRLEdBQVIsQ0FEQSxDQUFBO0FBQUEsUUFFQSx5QkFBQSxDQUEwQixhQUExQixDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLGtCQUFMLENBQUEsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBZSxDQUFDLE1BQWhCLEdBQXlCLENBQWhFLEVBSmlCO01BQUEsQ0FBbkIsRUFkdUI7SUFBQSxDQUF6QixDQXBNQSxDQUFBO0FBQUEsSUF3TkEsUUFBQSxDQUFTLEtBQVQsRUFBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxLQUFBLENBQU0sRUFBTixFQUFVLE9BQVYsQ0FBa0IsQ0FBQyxjQUFuQixDQUFBLENBQUEsQ0FBQTtlQUNBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsTUFBVixFQUZTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUlBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsUUFBQSxLQUFBLENBQU0sSUFBTixFQUFZLG9CQUFaLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsV0FBQSxDQUFZLE1BQVosQ0FBNUMsQ0FBQSxDQUFBO0FBQUEsUUFDQSxPQUFBLENBQVEsR0FBUixDQURBLENBQUE7QUFBQSxRQUVBLHlCQUFBLENBQTBCLElBQTFCLENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLEVBQUUsQ0FBQyxLQUFWLENBQWdCLENBQUMsZ0JBQWpCLENBQUEsQ0FIQSxDQUFBO2VBTUEsUUFBQSxDQUFTLENBQUMsU0FBQSxHQUFBO2lCQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBWDtRQUFBLENBQUQsQ0FBVCxFQUFpQyxnQ0FBakMsRUFBbUUsR0FBbkUsRUFQZ0M7TUFBQSxDQUFsQyxDQUpBLENBQUE7QUFBQSxNQWFBLEVBQUEsQ0FBRywrRUFBSCxFQUFvRixTQUFBLEdBQUE7QUFDbEYsWUFBQSxZQUFBO0FBQUEsUUFBQSxLQUFBLENBQU0sSUFBTixFQUFZLG9CQUFaLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsTUFBNUMsQ0FBQSxDQUFBO0FBQUEsUUFDQSxPQUFBLENBQVEsR0FBUixDQURBLENBQUE7QUFBQSxRQUVBLHlCQUFBLENBQTBCLElBQTFCLENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLEVBQUUsQ0FBQyxLQUFWLENBQWdCLENBQUMsZ0JBQWpCLENBQUEsQ0FIQSxDQUFBO0FBQUEsUUFJQSxZQUFBLEdBQWUsS0FKZixDQUFBO0FBQUEsUUFNQSxZQUFBLENBQWEsQ0FBQyxTQUFBLEdBQUE7aUJBQ1osWUFBQSxHQUFlLENBQUEsRUFBTSxDQUFDLElBQUksQ0FBQyxVQURmO1FBQUEsQ0FBRCxDQUFiLENBTkEsQ0FBQTtlQVFBLFFBQUEsQ0FBUyxDQUFDLFNBQUEsR0FBQTtpQkFBRyxhQUFIO1FBQUEsQ0FBRCxDQUFULEVBQTRCLEdBQTVCLEVBVGtGO01BQUEsQ0FBcEYsQ0FiQSxDQUFBO2FBd0JBLEVBQUEsQ0FBRyxzQkFBSCxFQUEyQixTQUFBLEdBQUE7QUFDekIsUUFBQSxPQUFBLENBQVEsR0FBUixDQUFBLENBQUE7QUFBQSxRQUNBLHlCQUFBLENBQTBCLFNBQTFCLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLEVBQUUsQ0FBQyxLQUFWLENBQ0UsQ0FBQyxnQkFESCxDQUFBLENBRkEsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUExQixDQUFBLENBQVAsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxNQUFqRCxDQUpBLENBQUE7ZUFLQSxRQUFBLENBQVMsQ0FBQyxTQUFBLEdBQUE7aUJBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFYO1FBQUEsQ0FBRCxDQUFULEVBQWlDLGdDQUFqQyxFQUFtRSxHQUFuRSxFQU55QjtNQUFBLENBQTNCLEVBekJjO0lBQUEsQ0FBaEIsQ0F4TkEsQ0FBQTtBQUFBLElBeVBBLFFBQUEsQ0FBUyxNQUFULEVBQWlCLFNBQUEsR0FBQTthQUNmLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsUUFBQSxLQUFBLENBQU0sRUFBTixFQUFVLElBQVYsQ0FBQSxDQUFBO0FBQUEsUUFDQSxPQUFBLENBQVEsR0FBUixDQURBLENBQUE7QUFBQSxRQUVBLHlCQUFBLENBQTBCLEtBQTFCLENBRkEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxFQUFFLENBQUMsRUFBVixDQUFhLENBQUMsZ0JBQWQsQ0FBQSxFQUo0QjtNQUFBLENBQTlCLEVBRGU7SUFBQSxDQUFqQixDQXpQQSxDQUFBO0FBQUEsSUFnUUEsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLE1BQUEsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtBQUM5QixRQUFBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsY0FBQSxRQUFBO0FBQUEsVUFBQSxRQUFBLEdBQVcsV0FBQSxDQUFZLFFBQVosQ0FBWCxDQUFBO0FBQUEsVUFDQSxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsS0FBM0IsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFNLENBQUMsTUFBUCxDQUFjLFFBQWQsQ0FGQSxDQUFBO0FBQUEsVUFHQSxFQUFFLENBQUMsYUFBSCxDQUFpQixRQUFqQixFQUEyQixLQUEzQixDQUhBLENBQUE7QUFBQSxVQUlBLE9BQUEsQ0FBUSxHQUFSLENBSkEsQ0FBQTtBQUFBLFVBS0EseUJBQUEsQ0FBMEIsTUFBMUIsQ0FMQSxDQUFBO2lCQU9BLFFBQUEsQ0FBUyxDQUFDLFNBQUEsR0FBQTttQkFBRyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQUEsS0FBb0IsTUFBdkI7VUFBQSxDQUFELENBQVQsRUFDRSxnQ0FERixFQUNvQyxHQURwQyxFQVJtQztRQUFBLENBQXJDLENBQUEsQ0FBQTtBQUFBLFFBV0EsRUFBQSxDQUFHLGdEQUFILEVBQXFELFNBQUEsR0FBQTtBQUNuRCxjQUFBLGlCQUFBO0FBQUEsVUFBQSxRQUFBLEdBQVcsV0FBQSxDQUFZLFFBQVosQ0FBWCxDQUFBO0FBQUEsVUFDQSxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsS0FBM0IsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFNLENBQUMsTUFBUCxDQUFjLFFBQWQsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsTUFBM0IsQ0FIQSxDQUFBO0FBQUEsVUFJQSxFQUFFLENBQUMsYUFBSCxDQUFpQixRQUFqQixFQUEyQixLQUEzQixDQUpBLENBQUE7QUFBQSxVQUtBLE9BQUEsQ0FBUSxHQUFSLENBTEEsQ0FBQTtBQUFBLFVBTUEseUJBQUEsQ0FBMEIsTUFBMUIsQ0FOQSxDQUFBO0FBQUEsVUFPQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFjLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBM0MsQ0FBbUQsQ0FBQyxPQUFwRCxDQUNFLCtEQURGLENBUEEsQ0FBQTtBQUFBLFVBU0EsT0FBQSxHQUFVLEtBVFYsQ0FBQTtBQUFBLFVBVUEsWUFBQSxDQUFhLFNBQUEsR0FBQTttQkFBRyxPQUFBLEdBQVUsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEtBQXNCLE1BQW5DO1VBQUEsQ0FBYixDQVZBLENBQUE7aUJBV0EsUUFBQSxDQUFTLENBQUMsU0FBQSxHQUFBO21CQUFHLFFBQUg7VUFBQSxDQUFELENBQVQsRUFBdUIsb0NBQXZCLEVBQTZELEVBQTdELEVBWm1EO1FBQUEsQ0FBckQsQ0FYQSxDQUFBO0FBQUEsUUF5QkEsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUEsR0FBQTtBQUM3RCxjQUFBLFFBQUE7QUFBQSxVQUFBLFFBQUEsR0FBVyxXQUFBLENBQVksUUFBWixDQUFYLENBQUE7QUFBQSxVQUNBLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixLQUEzQixDQURBLENBQUE7QUFBQSxVQUVBLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBZCxDQUZBLENBQUE7QUFBQSxVQUdBLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBa0IsQ0FBQyxPQUFuQixDQUEyQixNQUEzQixDQUhBLENBQUE7QUFBQSxVQUlBLEVBQUUsQ0FBQyxhQUFILENBQWlCLFFBQWpCLEVBQTJCLEtBQTNCLENBSkEsQ0FBQTtBQUFBLFVBS0EsT0FBQSxDQUFRLEdBQVIsQ0FMQSxDQUFBO0FBQUEsVUFNQSx5QkFBQSxDQUEwQixPQUExQixDQU5BLENBQUE7QUFBQSxVQU9BLE1BQUEsQ0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUF4QyxDQUErQyxDQUFDLElBQWhELENBQXFELENBQXJELENBUEEsQ0FBQTtpQkFRQSxRQUFBLENBQVMsQ0FBQyxTQUFBLEdBQUE7bUJBQUcsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFBLEtBQW9CLE1BQXZCO1VBQUEsQ0FBRCxDQUFULEVBQ0UsZ0NBREYsRUFDb0MsRUFEcEMsRUFUNkQ7UUFBQSxDQUEvRCxDQXpCQSxDQUFBO2VBcUNBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsVUFBQSxNQUFNLENBQUMsU0FBUCxDQUFBLENBQWtCLENBQUMsTUFBbkIsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLE9BQUEsQ0FBUSxHQUFSLENBREEsQ0FBQTtBQUFBLFVBRUEseUJBQUEsQ0FBMEIsTUFBMUIsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFjLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBM0MsQ0FBbUQsQ0FBQyxPQUFwRCxDQUNFLDZCQURGLENBSEEsQ0FBQTtBQUFBLFVBS0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLGNBQXRDLENBTEEsQ0FBQTtBQUFBLFVBTUEseUJBQUEsQ0FBMEIsT0FBMUIsQ0FOQSxDQUFBO2lCQU9BLE1BQUEsQ0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUEzQyxDQUFtRCxDQUFDLE9BQXBELENBQ0UsNkJBREYsRUFSNEM7UUFBQSxDQUE5QyxFQXRDOEI7TUFBQSxDQUFoQyxDQUFBLENBQUE7YUFpREEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUEsR0FBQTtBQUMzQixRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxVQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixNQUF0QixDQUFBLENBQUE7aUJBQ0EsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFrQixDQUFDLE1BQW5CLENBQUEsRUFGUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFJQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLGNBQUEsUUFBQTtBQUFBLFVBQUEsUUFBQSxHQUFXLFdBQUEsQ0FBWSxlQUFaLENBQVgsQ0FBQTtBQUFBLFVBQ0EsT0FBQSxDQUFRLEdBQVIsQ0FEQSxDQUFBO0FBQUEsVUFFQSx5QkFBQSxDQUEyQixPQUFBLEdBQU8sUUFBbEMsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQXRCLENBQTJCLENBQUMsb0JBQTVCLENBQWlELFFBQWpELEVBSjZCO1FBQUEsQ0FBL0IsQ0FKQSxDQUFBO0FBQUEsUUFVQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsVUFDQSx5QkFBQSxDQUEwQix5QkFBMUIsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQXRCLENBQTJCLENBQUMsb0JBQTVCLENBQ0UsV0FBQSxDQUFZLG9CQUFaLENBREYsRUFIMEI7UUFBQSxDQUE1QixDQVZBLENBQUE7ZUFnQkEsRUFBQSxDQUFHLHNEQUFILEVBQTJELFNBQUEsR0FBQTtBQUN6RCxVQUFBLE9BQUEsQ0FBUSxHQUFSLENBQUEsQ0FBQTtBQUFBLFVBQ0EseUJBQUEsQ0FBMEIsc0NBQTFCLENBREEsQ0FBQTtBQUFBLFVBRUEsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQTNCLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsQ0FBM0MsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUEzQyxDQUFtRCxDQUFDLE9BQXBELENBQ0UsMkNBREYsRUFKeUQ7UUFBQSxDQUEzRCxFQWpCMkI7TUFBQSxDQUE3QixFQWxEZ0I7SUFBQSxDQUFsQixDQWhRQSxDQUFBO0FBQUEsSUEwVUEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLE1BQUEsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUEsR0FBQTtBQUN0RCxZQUFBLEtBQUE7QUFBQSxRQUFBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsU0FBVixDQUFvQixDQUFDLGNBQXJCLENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxLQUFBLENBQU0sRUFBTixFQUFVLE1BQVYsQ0FEQSxDQUFBO0FBQUEsUUFFQSxPQUFBLENBQVEsR0FBUixDQUZBLENBQUE7QUFBQSxRQUdBLHlCQUFBLENBQTBCLHNCQUExQixDQUhBLENBQUE7ZUFJQSxTQUFBLE1BQUEsQ0FBTyxFQUFFLENBQUMsSUFBVixDQUFBLENBQWUsQ0FBQyxvQkFBaEIsY0FBcUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBekQsRUFMc0Q7TUFBQSxDQUF4RCxDQUFBLENBQUE7YUFPQSxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQSxHQUFBO0FBQzVELFlBQUEsS0FBQTtBQUFBLFFBQUEsS0FBQSxDQUFNLEVBQU4sRUFBVSxTQUFWLENBQW9CLENBQUMsY0FBckIsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsUUFBVixDQURBLENBQUE7QUFBQSxRQUVBLE9BQUEsQ0FBUSxHQUFSLENBRkEsQ0FBQTtBQUFBLFFBR0EseUJBQUEsQ0FBMEIsV0FBMUIsQ0FIQSxDQUFBO2VBSUEsU0FBQSxNQUFBLENBQU8sRUFBRSxDQUFDLE1BQVYsQ0FBQSxDQUNFLENBQUMsb0JBREgsY0FDd0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFENUMsRUFMNEQ7TUFBQSxDQUE5RCxFQVJtQjtJQUFBLENBQXJCLENBMVVBLENBQUE7QUFBQSxJQTBWQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7YUFDbEIsRUFBQSxDQUFHLGlCQUFILEVBQXNCLFNBQUEsR0FBQTtBQUNwQixRQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixNQUF0QixDQUFBLENBQUE7QUFBQSxRQUNBLE9BQUEsQ0FBUSxHQUFSLENBREEsQ0FBQTtBQUFBLFFBRUEseUJBQUEsQ0FBMEIsUUFBMUIsQ0FGQSxDQUFBO2VBR0EsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBdEIsQ0FBMkIsQ0FBQyxnQkFBNUIsQ0FBQSxFQUpvQjtNQUFBLENBQXRCLEVBRGtCO0lBQUEsQ0FBcEIsQ0ExVkEsQ0FBQTtBQUFBLElBaVdBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUEsR0FBQTthQUNqQixFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQSxHQUFBO0FBQ3BDLFlBQUEsY0FBQTtBQUFBLFFBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQVAsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxDQUFNLElBQU4sRUFBWSxTQUFaLENBQXNCLENBQUMsY0FBdkIsQ0FBQSxDQURBLENBQUE7QUFBQSxRQUVBLFFBQUEsR0FBVyxXQUFBLENBQVksT0FBWixDQUZYLENBQUE7QUFBQSxRQUdBLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBZCxDQUhBLENBQUE7QUFBQSxRQUlBLE9BQUEsQ0FBUSxHQUFSLENBSkEsQ0FBQTtBQUFBLFFBS0EseUJBQUEsQ0FBMEIsT0FBMUIsQ0FMQSxDQUFBO2VBTUEsTUFBQSxDQUFPLElBQUksQ0FBQyxPQUFaLENBQW9CLENBQUMsZ0JBQXJCLENBQUEsRUFQb0M7TUFBQSxDQUF0QyxFQURpQjtJQUFBLENBQW5CLENBaldBLENBQUE7QUFBQSxJQTZXQSxRQUFBLENBQVMsU0FBVCxFQUFvQixTQUFBLEdBQUE7YUFDbEIsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxZQUFBLGNBQUE7QUFBQSxRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUFQLENBQUE7QUFBQSxRQUNBLEtBQUEsQ0FBTSxJQUFOLEVBQVksV0FBWixDQUF3QixDQUFDLGNBQXpCLENBQUEsQ0FEQSxDQUFBO0FBQUEsUUFFQSxRQUFBLEdBQVcsV0FBQSxDQUFZLFFBQVosQ0FGWCxDQUFBO0FBQUEsUUFHQSxNQUFNLENBQUMsTUFBUCxDQUFjLFFBQWQsQ0FIQSxDQUFBO0FBQUEsUUFJQSxPQUFBLENBQVEsR0FBUixDQUpBLENBQUE7QUFBQSxRQUtBLHlCQUFBLENBQTBCLFFBQTFCLENBTEEsQ0FBQTtlQU1BLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBWixDQUFzQixDQUFDLGdCQUF2QixDQUFBLEVBUHdDO01BQUEsQ0FBMUMsRUFEa0I7SUFBQSxDQUFwQixDQTdXQSxDQUFBO0FBQUEsSUF5WEEsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxvQkFBZixDQUFBLENBQUE7ZUFDQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEvQixFQUZTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUlBLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxPQUFBLENBQVEsR0FBUixDQUFBLENBQUE7QUFBQSxRQUNBLHlCQUFBLENBQTBCLFFBQTFCLENBREEsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyxlQUFqQyxFQUg2QjtNQUFBLENBQS9CLENBSkEsQ0FBQTtBQUFBLE1BU0EsRUFBQSxDQUFHLHNDQUFILEVBQTJDLFNBQUEsR0FBQTtBQUN6QyxZQUFBLGdCQUFBO0FBQUEsUUFBQSxnQkFBQSxHQUFtQixLQUFuQixDQUFBO0FBQUEsUUFDQSxPQUFPLENBQUMsbUJBQVIsQ0FBNEIsU0FBQSxHQUFBO2lCQUFHLGdCQUFBLEdBQW1CLEtBQXRCO1FBQUEsQ0FBNUIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxPQUFBLENBQVEsR0FBUixDQUZBLENBQUE7QUFBQSxRQUdBLHlCQUFBLENBQTBCLFdBQTFCLENBSEEsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLE9BQXpCLENBQWlDLFVBQWpDLENBSkEsQ0FBQTtBQUFBLFFBTUEsUUFBQSxDQUFTLFNBQUEsR0FBQTtpQkFBRyxpQkFBSDtRQUFBLENBQVQsQ0FOQSxDQUFBO0FBQUEsUUFPQSxNQUFNLENBQUMsT0FBUCxDQUFlLG9CQUFmLENBUEEsQ0FBQTtBQUFBLFFBUUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0IsQ0FSQSxDQUFBO0FBQUEsUUFVQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsYUFBdkIsRUFBc0MsY0FBdEMsQ0FWQSxDQUFBO0FBQUEsUUFXQSx5QkFBQSxDQUEwQixZQUExQixDQVhBLENBQUE7ZUFZQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsT0FBakMsRUFieUM7TUFBQSxDQUEzQyxDQVRBLENBQUE7YUF3QkEsRUFBQSxDQUFHLHNDQUFILEVBQTJDLFNBQUEsR0FBQTtBQUN6QyxRQUFBLE9BQUEsQ0FBUSxHQUFSLENBQUEsQ0FBQTtBQUFBLFFBQ0EseUJBQUEsQ0FBMEIsWUFBMUIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsVUFBakMsQ0FGQSxDQUFBO0FBQUEsUUFHQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsYUFBdkIsRUFBc0MsV0FBdEMsQ0FIQSxDQUFBO2VBSUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLE9BQXpCLENBQWlDLG9CQUFqQyxFQUx5QztNQUFBLENBQTNDLEVBekJrQjtJQUFBLENBQXBCLENBelhBLENBQUE7QUFBQSxJQXlaQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLDJCQUFmLENBQUEsQ0FBQTtlQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CLEVBRlM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BSUEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUEsR0FBQTtBQUM3QyxRQUFBLE9BQUEsQ0FBUSxHQUFSLENBQUEsQ0FBQTtBQUFBLFFBQ0EseUJBQUEsQ0FBMEIsa0JBQTFCLENBREEsQ0FBQTtlQUVBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQywyQkFBakMsRUFINkM7TUFBQSxDQUEvQyxDQUpBLENBQUE7QUFBQSxNQVNBLEVBQUEsQ0FBRywyQ0FBSCxFQUFnRCxTQUFBLEdBQUE7QUFDOUMsUUFBQSxPQUFBLENBQVEsR0FBUixDQUFBLENBQUE7QUFBQSxRQUNBLHlCQUFBLENBQTBCLGlCQUExQixDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsMkJBQWpDLEVBSDhDO01BQUEsQ0FBaEQsQ0FUQSxDQUFBO0FBQUEsTUFjQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQSxHQUFBO0FBQ3BDLFFBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsUUFDQSx5QkFBQSxDQUEwQixtQkFBMUIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsMkJBQWpDLENBRkEsQ0FBQTtBQUFBLFFBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLGNBQXRDLENBSkEsQ0FBQTtBQUFBLFFBS0EseUJBQUEsQ0FBMEIsb0JBQTFCLENBTEEsQ0FBQTtlQU1BLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQywyQkFBakMsRUFQb0M7TUFBQSxDQUF0QyxDQWRBLENBQUE7QUFBQSxNQXVCQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFFBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsUUFDQSx5QkFBQSxDQUEwQixzQkFBMUIsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsMkJBQWpDLENBRkEsQ0FBQTtBQUFBLFFBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLGNBQXRDLENBSkEsQ0FBQTtBQUFBLFFBS0EseUJBQUEsQ0FBMEIseUJBQTFCLENBTEEsQ0FBQTtlQU1BLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQywyQkFBakMsRUFQK0I7TUFBQSxDQUFqQyxDQXZCQSxDQUFBO0FBQUEsTUFnQ0EsRUFBQSxDQUFHLCtCQUFILEVBQW9DLFNBQUEsR0FBQTtBQUNsQyxRQUFBLE9BQUEsQ0FBUSxHQUFSLENBQUEsQ0FBQTtBQUFBLFFBQ0EseUJBQUEsQ0FBMEIscUJBQTFCLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQTNDLENBQW1ELENBQUMsT0FBcEQsQ0FDRSxrRUFERixDQUZBLENBQUE7ZUFJQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsMkJBQWpDLEVBTGtDO01BQUEsQ0FBcEMsQ0FoQ0EsQ0FBQTthQXVDQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxNQUFNLENBQUMsT0FBUCxDQUFlLDJCQUFmLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBR0EsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxVQUFBLE9BQUEsQ0FBUSxHQUFSLENBQUEsQ0FBQTtBQUFBLFVBQ0EseUJBQUEsQ0FBMEIsNEJBQTFCLENBREEsQ0FBQTtpQkFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsT0FBekIsQ0FBaUMsMkJBQWpDLEVBSHNDO1FBQUEsQ0FBeEMsQ0FIQSxDQUFBO0FBQUEsUUFRQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLFVBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsVUFDQSx5QkFBQSxDQUEwQiw0Q0FBMUIsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyw0QkFBakMsRUFINkI7UUFBQSxDQUEvQixDQVJBLENBQUE7ZUFhQSxFQUFBLENBQUcsb0NBQUgsRUFBeUMsU0FBQSxHQUFBO0FBQ3ZDLFVBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsVUFDQSx5QkFBQSxDQUEwQiw0QkFBMUIsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyw2QkFBakMsRUFIdUM7UUFBQSxDQUF6QyxFQWQyQjtNQUFBLENBQTdCLEVBeENzQjtJQUFBLENBQXhCLENBelpBLENBQUE7V0FvZEEsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxFQUFBLENBQUcsNENBQUgsRUFBaUQsU0FBQSxHQUFBO0FBQy9DLFFBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsUUFDQSx5QkFBQSxDQUEwQixNQUExQixDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFjLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBM0MsQ0FBbUQsQ0FBQyxPQUFwRCxDQUNFLG9DQURGLEVBSCtDO01BQUEsQ0FBakQsQ0FBQSxDQUFBO0FBQUEsTUFNQSxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxLQUF6QyxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsS0FBMUMsQ0FEQSxDQUFBO0FBQUEsUUFFQSxPQUFBLENBQVEsR0FBUixDQUZBLENBQUE7QUFBQSxRQUdBLHlCQUFBLENBQTBCLGtCQUExQixDQUhBLENBQUE7QUFBQSxRQUlBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLENBQVAsQ0FBZ0QsQ0FBQyxJQUFqRCxDQUFzRCxJQUF0RCxDQUpBLENBQUE7ZUFLQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixDQUFQLENBQWlELENBQUMsSUFBbEQsQ0FBdUQsSUFBdkQsRUFOa0M7TUFBQSxDQUFwQyxDQU5BLENBQUE7YUFjQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBLEdBQUE7QUFDdEIsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLEtBQXpDLENBQUEsQ0FBQTtpQkFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLEtBQTFDLEVBRlM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBSUEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFVBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsVUFDQSx5QkFBQSxDQUEwQixXQUExQixDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLENBQVAsQ0FBZ0QsQ0FBQyxJQUFqRCxDQUFzRCxJQUF0RCxDQUZBLENBQUE7QUFBQSxVQUdBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixhQUF2QixFQUFzQyxjQUF0QyxDQUhBLENBQUE7QUFBQSxVQUlBLHlCQUFBLENBQTBCLGFBQTFCLENBSkEsQ0FBQTtpQkFLQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUFQLENBQWdELENBQUMsSUFBakQsQ0FBc0QsS0FBdEQsRUFOa0I7UUFBQSxDQUFwQixDQUpBLENBQUE7ZUFZQSxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFVBQUEsT0FBQSxDQUFRLEdBQVIsQ0FBQSxDQUFBO0FBQUEsVUFDQSx5QkFBQSxDQUEwQixTQUExQixDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLENBQVAsQ0FBaUQsQ0FBQyxJQUFsRCxDQUF1RCxJQUF2RCxDQUZBLENBQUE7QUFBQSxVQUdBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixhQUF2QixFQUFzQyxjQUF0QyxDQUhBLENBQUE7QUFBQSxVQUlBLHlCQUFBLENBQTBCLFdBQTFCLENBSkEsQ0FBQTtBQUFBLFVBS0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsQ0FBUCxDQUFpRCxDQUFDLElBQWxELENBQXVELEtBQXZELENBTEEsQ0FBQTtBQUFBLFVBTUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGFBQXZCLEVBQXNDLGNBQXRDLENBTkEsQ0FBQTtBQUFBLFVBT0EseUJBQUEsQ0FBMEIsYUFBMUIsQ0FQQSxDQUFBO0FBQUEsVUFRQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixDQUFQLENBQWlELENBQUMsSUFBbEQsQ0FBdUQsSUFBdkQsQ0FSQSxDQUFBO0FBQUEsVUFTQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsYUFBdkIsRUFBc0MsY0FBdEMsQ0FUQSxDQUFBO0FBQUEsVUFVQSx5QkFBQSxDQUEwQixlQUExQixDQVZBLENBQUE7aUJBV0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsQ0FBUCxDQUFpRCxDQUFDLElBQWxELENBQXVELEtBQXZELEVBWnNCO1FBQUEsQ0FBeEIsRUFic0I7TUFBQSxDQUF4QixFQWZlO0lBQUEsQ0FBakIsRUFyZHVCO0VBQUEsQ0FBekIsQ0FSQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/spec/ex-commands-spec.coffee
