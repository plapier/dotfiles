(function() {
  var Ex, ExClass, fs, helpers, os, path, uuid;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  uuid = require('node-uuid');

  helpers = require('./spec-helper');

  ExClass = require('../lib/ex');

  Ex = ExClass.singleton();

  describe("the commands", function() {
    var dir, dir2, editor, editorElement, exState, keydown, normalModeInputKeydown, openEx, projectPath, submitNormalModeInputText, vimState, _ref;
    _ref = [], editor = _ref[0], editorElement = _ref[1], vimState = _ref[2], exState = _ref[3], dir = _ref[4], dir2 = _ref[5];
    projectPath = function(fileName) {
      return path.join(dir, fileName);
    };
    beforeEach(function() {
      var exMode, vimMode;
      vimMode = atom.packages.loadPackage('vim-mode');
      exMode = atom.packages.loadPackage('ex-mode');
      waitsForPromise(function() {
        var activationPromise;
        activationPromise = exMode.activate();
        helpers.activateExMode();
        return activationPromise;
      });
      runs(function() {
        return spyOn(exMode.mainModule.globalExState, 'setVim').andCallThrough();
      });
      waitsForPromise(function() {
        return vimMode.activate();
      });
      waitsFor(function() {
        return exMode.mainModule.globalExState.setVim.calls.length > 0;
      });
      return runs(function() {
        dir = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
        dir2 = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
        fs.makeTreeSync(dir);
        fs.makeTreeSync(dir2);
        atom.project.setPaths([dir, dir2]);
        return helpers.getEditorElement(function(element) {
          atom.commands.dispatch(element, "ex-mode:open");
          atom.commands.dispatch(element.getModel().normalModeInputView.editorElement, "core:cancel");
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
    openEx = function() {
      return atom.commands.dispatch(editorElement, "ex-mode:open");
    };
    describe("as a motion", function() {
      beforeEach(function() {
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("moves the cursor to a specific line", function() {
        openEx();
        submitNormalModeInputText('2');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });
      it("moves to the second address", function() {
        openEx();
        submitNormalModeInputText('1,3');
        return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
      });
      it("works with offsets", function() {
        openEx();
        submitNormalModeInputText('2+1');
        expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
        openEx();
        submitNormalModeInputText('-2');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("doesn't move when the address is the current line", function() {
        openEx();
        submitNormalModeInputText('.');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        openEx();
        submitNormalModeInputText(',');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("moves to the last line", function() {
        openEx();
        submitNormalModeInputText('$');
        return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
      });
      it("moves to a mark's line", function() {
        keydown('l');
        keydown('m');
        normalModeInputKeydown('a');
        keydown('j');
        openEx();
        submitNormalModeInputText("'a");
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      return it("moves to a specified search", function() {
        openEx();
        submitNormalModeInputText('/def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('?def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.setCursorBufferPosition([3, 0]);
        openEx();
        submitNormalModeInputText('/ef');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });
    });
    describe(":write", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          openEx();
          submitNormalModeInputText('write');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('write-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          openEx();
          submitNormalModeInputText('write');
          expect(fs.existsSync(filePath)).toBe(true);
          expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
          return expect(editor.isModified()).toBe(false);
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          openEx();
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
          openEx();
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
            return openEx();
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
          openEx();
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
            openEx();
            submitNormalModeInputText("write " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :write!", function() {
            openEx();
            submitNormalModeInputText("write! " + existsPath);
            expect(atom.notifications.notifications).toEqual([]);
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc\ndef');
          });
        });
      });
    });
    describe(":wall", function() {
      return it("saves all", function() {
        spyOn(atom.workspace, 'saveAll');
        openEx();
        submitNormalModeInputText('wall');
        return expect(atom.workspace.saveAll).toHaveBeenCalled();
      });
    });
    describe(":saveas", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('saveas-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          openEx();
          submitNormalModeInputText('saveas');
          expect(fs.existsSync(filePath)).toBe(true);
          return expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(fs.writeFileSync.calls.length).toBe(0);
        });
      });
      return describe("when editing an existing file", function() {
        var filePath, i;
        filePath = '';
        i = 0;
        beforeEach(function() {
          i++;
          filePath = projectPath("saveas-" + i);
          editor.setText('abc\ndef');
          return editor.saveAs(filePath);
        });
        it("complains if no path given", function() {
          editor.setText('abc');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Argument required');
        });
        describe("with a specified path", function() {
          var newPath;
          newPath = '';
          beforeEach(function() {
            newPath = path.relative(dir, "" + filePath + ".new");
            editor.getBuffer().setText('abc');
            return openEx();
          });
          afterEach(function() {
            submitNormalModeInputText("saveas " + newPath);
            newPath = path.resolve(dir, fs.normalize(newPath));
            expect(fs.existsSync(newPath)).toBe(true);
            expect(fs.readFileSync(newPath, 'utf-8')).toEqual('abc');
            expect(editor.isModified()).toBe(false);
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
          openEx();
          submitNormalModeInputText('saveas path1 path2');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
        return describe("when the file already exists", function() {
          var existsPath;
          existsPath = '';
          beforeEach(function() {
            existsPath = projectPath('saveas-exists');
            return fs.writeFileSync(existsPath, 'abc');
          });
          afterEach(function() {
            return fs.removeSync(existsPath);
          });
          it("throws an error if the file already exists", function() {
            openEx();
            submitNormalModeInputText("saveas " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :saveas!", function() {
            openEx();
            submitNormalModeInputText("saveas! " + existsPath);
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
        openEx();
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
          openEx();
          submitNormalModeInputText('quit');
          return expect(pane.promptToSaveItem).toHaveBeenCalled();
        });
      });
    });
    describe(":quitall", function() {
      return it("closes Atom", function() {
        spyOn(atom, 'close');
        openEx();
        submitNormalModeInputText('quitall');
        return expect(atom.close).toHaveBeenCalled();
      });
    });
    describe(":tabclose", function() {
      return it("acts as an alias to :quit", function() {
        var _ref1;
        spyOn(Ex, 'tabclose').andCallThrough();
        spyOn(Ex, 'quit').andCallThrough();
        openEx();
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
        openEx();
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(2);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(pane.getItems().length - 1);
        openEx();
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
        openEx();
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(0);
        openEx();
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
        openEx();
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
      it("doesn't quit when the file is new and no path is specified in the save dialog", function() {
        var wasNotCalled;
        spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
        openEx();
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
        openEx();
        submitNormalModeInputText('wq wq-2');
        expect(Ex.write).toHaveBeenCalled();
        expect(Ex.write.calls[0].args[0].args.trim()).toEqual('wq-2');
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
    });
    describe(":xit", function() {
      return it("acts as an alias to :wq", function() {
        spyOn(Ex, 'wq');
        openEx();
        submitNormalModeInputText('xit');
        return expect(Ex.wq).toHaveBeenCalled();
      });
    });
    describe(":wqall", function() {
      return it("calls :wall, then :quitall", function() {
        spyOn(Ex, 'wall');
        spyOn(Ex, 'quitall');
        openEx();
        submitNormalModeInputText('wqall');
        expect(Ex.wall).toHaveBeenCalled();
        return expect(Ex.quitall).toHaveBeenCalled();
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
          openEx();
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
          openEx();
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
          openEx();
          submitNormalModeInputText('edit!');
          expect(atom.notifications.notifications.length).toBe(0);
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 50);
        });
        return it("throws an error when editing a new file", function() {
          editor.getBuffer().reload();
          openEx();
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
          openEx();
          submitNormalModeInputText("edit " + filePath);
          return expect(atom.workspace.open).toHaveBeenCalledWith(filePath);
        });
        it("opens a relative path", function() {
          openEx();
          submitNormalModeInputText('edit edit-relative-test');
          return expect(atom.workspace.open).toHaveBeenCalledWith(projectPath('edit-relative-test'));
        });
        return it("throws an error if trying to open more than one file", function() {
          openEx();
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
        openEx();
        submitNormalModeInputText('tabedit tabedit-test');
        return (_ref1 = expect(Ex.edit)).toHaveBeenCalledWith.apply(_ref1, Ex.tabedit.calls[0].args);
      });
      return it("acts as an alias to :tabnew if not supplied with a path", function() {
        var _ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'tabnew');
        openEx();
        submitNormalModeInputText('tabedit  ');
        return (_ref1 = expect(Ex.tabnew)).toHaveBeenCalledWith.apply(_ref1, Ex.tabedit.calls[0].args);
      });
    });
    describe(":tabnew", function() {
      it("opens a new tab", function() {
        spyOn(atom.workspace, 'open');
        openEx();
        submitNormalModeInputText('tabnew');
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
      return it("opens a new tab for editing when provided an argument", function() {
        var _ref1;
        spyOn(Ex, 'tabnew').andCallThrough();
        spyOn(Ex, 'tabedit');
        openEx();
        submitNormalModeInputText('tabnew tabnew-test');
        return (_ref1 = expect(Ex.tabedit)).toHaveBeenCalledWith.apply(_ref1, Ex.tabnew.calls[0].args);
      });
    });
    describe(":split", function() {
      return it("splits the current file upwards/downward", function() {
        var filePath, pane;
        pane = atom.workspace.getActivePane();
        if (atom.config.get('ex-mode.splitbelow')) {
          spyOn(pane, 'splitDown').andCallThrough();
          filePath = projectPath('split');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('split');
          return expect(pane.splitDown).toHaveBeenCalled();
        } else {
          spyOn(pane, 'splitUp').andCallThrough();
          filePath = projectPath('split');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('split');
          return expect(pane.splitUp).toHaveBeenCalled();
        }
      });
    });
    describe(":vsplit", function() {
      return it("splits the current file to the left/right", function() {
        var filePath, pane;
        if (atom.config.get('ex-mode.splitright')) {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'splitRight').andCallThrough();
          filePath = projectPath('vsplit');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('vsplit');
          return expect(pane.splitLeft).toHaveBeenCalled();
        } else {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'splitLeft').andCallThrough();
          filePath = projectPath('vsplit');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('vsplit');
          return expect(pane.splitLeft).toHaveBeenCalled();
        }
      });
    });
    describe(":delete", function() {
      beforeEach(function() {
        editor.setText('abc\ndef\nghi\njkl');
        return editor.setCursorBufferPosition([2, 0]);
      });
      it("deletes the current line", function() {
        openEx();
        submitNormalModeInputText('delete');
        return expect(editor.getText()).toEqual('abc\ndef\njkl');
      });
      it("copies the deleted text", function() {
        openEx();
        submitNormalModeInputText('delete');
        return expect(atom.clipboard.read()).toEqual('ghi\n');
      });
      it("deletes the lines in the given range", function() {
        var processedOpStack;
        processedOpStack = false;
        exState.onDidProcessOpStack(function() {
          return processedOpStack = true;
        });
        openEx();
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
        openEx();
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
        openEx();
        submitNormalModeInputText(':substitute /a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("doesn't need a space before the arguments", function() {
        openEx();
        submitNormalModeInputText(':substitute/a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("respects modifiers passed to it", function() {
        openEx();
        submitNormalModeInputText(':substitute/a/x/g');
        expect(editor.getText()).toEqual('xbcxABC\ndefdDEF\nabcaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':substitute/a/x/gi');
        return expect(editor.getText()).toEqual('xbcxxBC\ndefdDEF\nabcaABC');
      });
      it("replaces on multiple lines", function() {
        openEx();
        submitNormalModeInputText(':%substitute/abc/ghi');
        expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nghiaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':%substitute/abc/ghi/ig');
        return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nghiaghi');
      });
      describe(":yank", function() {
        beforeEach(function() {
          editor.setText('abc\ndef\nghi\njkl');
          return editor.setCursorBufferPosition([2, 0]);
        });
        it("yanks the current line", function() {
          openEx();
          submitNormalModeInputText('yank');
          return expect(atom.clipboard.read()).toEqual('ghi\n');
        });
        return it("yanks the lines in the given range", function() {
          openEx();
          submitNormalModeInputText('1,2yank');
          return expect(atom.clipboard.read()).toEqual('abc\ndef\n');
        });
      });
      describe("illegal delimiters", function() {
        var test;
        test = function(delim) {
          openEx();
          submitNormalModeInputText(":substitute " + delim + "a" + delim + "x" + delim + "gi");
          expect(atom.notifications.notifications[0].message).toEqual("Command error: Regular expressions can't be delimited by alphanumeric characters, '\\', '\"' or '|'");
          return expect(editor.getText()).toEqual('abcaABC\ndefdDEF\nabcaABC');
        };
        it("can't be delimited by letters", function() {
          return test('n');
        });
        it("can't be delimited by numbers", function() {
          return test('3');
        });
        it("can't be delimited by '\\'", function() {
          return test('\\');
        });
        it("can't be delimited by '\"'", function() {
          return test('"');
        });
        return it("can't be delimited by '|'", function() {
          return test('|');
        });
      });
      describe("empty replacement", function() {
        beforeEach(function() {
          return editor.setText('abcabc\nabcabc');
        });
        it("removes the pattern without modifiers", function() {
          openEx();
          submitNormalModeInputText(":substitute/abc//");
          return expect(editor.getText()).toEqual('abc\nabcabc');
        });
        return it("removes the pattern with modifiers", function() {
          openEx();
          submitNormalModeInputText(":substitute/abc//g");
          return expect(editor.getText()).toEqual('\nabcabc');
        });
      });
      describe("replacing with escape sequences", function() {
        var test;
        beforeEach(function() {
          return editor.setText('abc,def,ghi');
        });
        test = function(escapeChar, escaped) {
          openEx();
          submitNormalModeInputText(":substitute/,/\\" + escapeChar + "/g");
          return expect(editor.getText()).toEqual("abc" + escaped + "def" + escaped + "ghi");
        };
        it("replaces with a tab", function() {
          return test('t', '\t');
        });
        it("replaces with a linefeed", function() {
          return test('n', '\n');
        });
        return it("replaces with a carriage return", function() {
          return test('r', '\r');
        });
      });
      describe("case sensitivity", function() {
        describe("respects the smartcase setting", function() {
          beforeEach(function() {
            return editor.setText('abcaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            openEx();
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is on and the pattern is lowercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("uses case sensitive search if smartcase is on and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            openEx();
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
        });
        return describe("\\c and \\C in the pattern", function() {
          beforeEach(function() {
            return editor.setText('abcaABC\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is off and \c is in the pattern", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/abc\\c/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("doesn't matter where in the pattern \\c is", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/a\\cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is on, \\C is in the pattern and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\Cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\C comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\Cb\\cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\c comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\cb\\Cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("overrides an appended /i flag with \\C", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/ab\\Cc/ghi/gi');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
        });
      });
      return describe("capturing groups", function() {
        beforeEach(function() {
          return editor.setText('abcaABC\ndefdDEF\nabcaABC');
        });
        it("replaces \\1 with the first group", function() {
          openEx();
          submitNormalModeInputText(':substitute/bc(.{2})/X\\1X');
          return expect(editor.getText()).toEqual('aXaAXBC\ndefdDEF\nabcaABC');
        });
        it("replaces multiple groups", function() {
          openEx();
          submitNormalModeInputText(':substitute/a([a-z]*)aA([A-Z]*)/X\\1XY\\2Y');
          return expect(editor.getText()).toEqual('XbcXYBCY\ndefdDEF\nabcaABC');
        });
        return it("replaces \\0 with the entire match", function() {
          openEx();
          submitNormalModeInputText(':substitute/ab(ca)AB/X\\0X');
          return expect(editor.getText()).toEqual('XabcaABXC\ndefdDEF\nabcaABC');
        });
      });
    });
    describe(":set", function() {
      it("throws an error without a specified option", function() {
        openEx();
        submitNormalModeInputText(':set');
        return expect(atom.notifications.notifications[0].message).toEqual('Command error: No option specified');
      });
      it("sets multiple options at once", function() {
        atom.config.set('editor.showInvisibles', false);
        atom.config.set('editor.showLineNumbers', false);
        openEx();
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
          openEx();
          submitNormalModeInputText(':set list');
          expect(atom.config.get('editor.showInvisibles')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nolist');
          return expect(atom.config.get('editor.showInvisibles')).toBe(false);
        });
        it("sets (no)nu(mber)", function() {
          openEx();
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
        it("sets (no)sp(lit)r(ight)", function() {
          openEx();
          submitNormalModeInputText(':set spr');
          expect(atom.config.get('ex-mode.splitright')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nospr');
          expect(atom.config.get('ex-mode.splitright')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set splitright');
          expect(atom.config.get('ex-mode.splitright')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosplitright');
          return expect(atom.config.get('ex-mode.splitright')).toBe(false);
        });
        it("sets (no)s(plit)b(elow)", function() {
          openEx();
          submitNormalModeInputText(':set sb');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosb');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set splitbelow');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosplitbelow');
          return expect(atom.config.get('ex-mode.splitbelow')).toBe(false);
        });
        return it("sets (no)s(mart)c(a)s(e)", function() {
          openEx();
          submitNormalModeInputText(':set scs');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(true);
          openEx();
          submitNormalModeInputText(':set noscs');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(false);
          openEx();
          submitNormalModeInputText(':set smartcase');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(true);
          openEx();
          submitNormalModeInputText(':set nosmartcase');
          return expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(false);
        });
      });
    });
    describe("aliases", function() {
      it("calls the aliased function without arguments", function() {
        ExClass.registerAlias('W', 'w');
        spyOn(Ex, 'write');
        openEx();
        submitNormalModeInputText('W');
        return expect(Ex.write).toHaveBeenCalled();
      });
      return it("calls the aliased function with arguments", function() {
        var WArgs, writeArgs;
        ExClass.registerAlias('W', 'write');
        spyOn(Ex, 'W').andCallThrough();
        spyOn(Ex, 'write');
        openEx();
        submitNormalModeInputText('W');
        WArgs = Ex.W.calls[0].args[0];
        writeArgs = Ex.write.calls[0].args[0];
        return expect(WArgs).toBe(writeArgs);
      });
    });
    return describe("with selections", function() {
      it("executes on the selected range", function() {
        spyOn(Ex, 's');
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToBufferPosition([2, 1]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText("'<,'>s/abc/def");
        return expect(Ex.s.calls[0].args[0].range).toEqual([0, 2]);
      });
      return it("calls the functions multiple times if there are multiple selections", function() {
        var calls;
        spyOn(Ex, 's');
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToBufferPosition([2, 1]);
        editor.addCursorAtBufferPosition([3, 0]);
        editor.selectToBufferPosition([3, 2]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText("'<,'>s/abc/def");
        calls = Ex.s.calls;
        expect(calls.length).toEqual(2);
        expect(calls[0].args[0].range).toEqual([0, 2]);
        return expect(calls[1].args[0].range).toEqual([3, 3]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvZXgtY29tbWFuZHMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0NBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBSlYsQ0FBQTs7QUFBQSxFQU1BLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUixDQU5WLENBQUE7O0FBQUEsRUFPQSxFQUFBLEdBQUssT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQVBMLENBQUE7O0FBQUEsRUFTQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSwwSUFBQTtBQUFBLElBQUEsT0FBd0QsRUFBeEQsRUFBQyxnQkFBRCxFQUFTLHVCQUFULEVBQXdCLGtCQUF4QixFQUFrQyxpQkFBbEMsRUFBMkMsYUFBM0MsRUFBZ0QsY0FBaEQsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLFNBQUMsUUFBRCxHQUFBO2FBQWMsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQWUsUUFBZixFQUFkO0lBQUEsQ0FEZCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxlQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLFVB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/spec/ex-commands-spec.coffee
