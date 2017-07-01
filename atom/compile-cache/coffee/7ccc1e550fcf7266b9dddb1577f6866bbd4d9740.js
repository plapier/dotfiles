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
    var dir, dir2, editor, editorElement, exState, keydown, normalModeInputKeydown, openEx, projectPath, ref, submitNormalModeInputText, vimState;
    ref = [], editor = ref[0], editorElement = ref[1], vimState = ref[2], exState = ref[3], dir = ref[4], dir2 = ref[5];
    projectPath = function(fileName) {
      return path.join(dir, fileName);
    };
    beforeEach(function() {
      var exMode, vimMode;
      vimMode = atom.packages.loadPackage('vim-mode-plus');
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
      it("limits to the last line", function() {
        openEx();
        submitNormalModeInputText('10');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        editor.setCursorBufferPosition([0, 0]);
        openEx();
        submitNormalModeInputText('3,10');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        editor.setCursorBufferPosition([0, 0]);
        openEx();
        submitNormalModeInputText('$+1000');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("goes to the first line with address 0", function() {
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('0');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('0,0');
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
            newPath = path.relative(dir, filePath + ".new");
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
            newPath = path.relative(dir, filePath + ".new");
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
        var ref1;
        spyOn(Ex, 'tabclose').andCallThrough();
        spyOn(Ex, 'quit').andCallThrough();
        openEx();
        submitNormalModeInputText('tabclose');
        return (ref1 = expect(Ex.quit)).toHaveBeenCalledWith.apply(ref1, Ex.tabclose.calls[0].args);
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
    describe(":x", function() {
      return it("acts as an alias to :xit", function() {
        spyOn(Ex, 'xit');
        openEx();
        submitNormalModeInputText('x');
        return expect(Ex.xit).toHaveBeenCalled();
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
        var ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'edit');
        openEx();
        submitNormalModeInputText('tabedit tabedit-test');
        return (ref1 = expect(Ex.edit)).toHaveBeenCalledWith.apply(ref1, Ex.tabedit.calls[0].args);
      });
      return it("acts as an alias to :tabnew if not supplied with a path", function() {
        var ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'tabnew');
        openEx();
        submitNormalModeInputText('tabedit  ');
        return (ref1 = expect(Ex.tabnew)).toHaveBeenCalledWith.apply(ref1, Ex.tabedit.calls[0].args);
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
        var ref1;
        spyOn(Ex, 'tabnew').andCallThrough();
        spyOn(Ex, 'tabedit');
        openEx();
        submitNormalModeInputText('tabnew tabnew-test');
        return (ref1 = expect(Ex.tabedit)).toHaveBeenCalledWith.apply(ref1, Ex.tabnew.calls[0].args);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvZXgtY29tbWFuZHMtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsV0FBUjs7RUFDUCxPQUFBLEdBQVUsT0FBQSxDQUFRLGVBQVI7O0VBRVYsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUNWLEVBQUEsR0FBSyxPQUFPLENBQUMsU0FBUixDQUFBOztFQUVMLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLE1BQXdELEVBQXhELEVBQUMsZUFBRCxFQUFTLHNCQUFULEVBQXdCLGlCQUF4QixFQUFrQyxnQkFBbEMsRUFBMkMsWUFBM0MsRUFBZ0Q7SUFDaEQsV0FBQSxHQUFjLFNBQUMsUUFBRDthQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLFFBQWY7SUFBZDtJQUNkLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsZUFBMUI7TUFDVixNQUFBLEdBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLFNBQTFCO01BQ1QsZUFBQSxDQUFnQixTQUFBO0FBQ2QsWUFBQTtRQUFBLGlCQUFBLEdBQW9CLE1BQU0sQ0FBQyxRQUFQLENBQUE7UUFDcEIsT0FBTyxDQUFDLGNBQVIsQ0FBQTtlQUNBO01BSGMsQ0FBaEI7TUFLQSxJQUFBLENBQUssU0FBQTtlQUNILEtBQUEsQ0FBTSxNQUFNLENBQUMsVUFBVSxDQUFDLGFBQXhCLEVBQXVDLFFBQXZDLENBQWdELENB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LEVBQUksQ0FBSixDQUF2QztlQUNBLE1BQUEsQ0FBTyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQXhCLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF2QztNQVh3RSxDQUExRTtJQVQwQixDQUE1QjtFQTM3QnVCLENBQXpCO0FBVEEiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbm9zID0gcmVxdWlyZSAnb3MnXG51dWlkID0gcmVxdWlyZSAnbm9kZS11dWlkJ1xuaGVscGVycyA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbkV4Q2xhc3MgPSByZXF1aXJlKCcuLi9saWIvZXgnKVxuRXggPSBFeENsYXNzLnNpbmdsZXRvbigpXG5cbmRlc2NyaWJlIFwidGhlIGNvbW1hbmRzXCIsIC0+XG4gIFtlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlLCBleFN0YXRlLCBkaXIsIGRpcjJdID0gW11cbiAgcHJvamVjdFBhdGggPSAoZmlsZU5hbWUpIC0+IHBhdGguam9pbihkaXIsIGZpbGVOYW1lKVxuICBiZWZvcmVFYWNoIC0+XG4gICAgdmltTW9kZSA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgIGV4TW9kZSA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ2V4LW1vZGUnKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYWN0aXZhdGlvblByb21pc2UgPSBleE1vZGUuYWN0aXZhdGUoKVxuICAgICAgaGVscGVycy5hY3RpdmF0ZUV4TW9kZSgpXG4gICAgICBhY3RpdmF0aW9uUHJvbWlzZVxuXG4gICAgcnVucyAtPlxuICAgICAgc3B5T24oZXhNb2RlLm1haW5Nb2R1bGUuZ2xvYmFsRXhTdGF0ZSwgJ3NldFZpbScpLmFuZENhbGxUaHJvdWdoKClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgdmltTW9kZS5hY3RpdmF0ZSgpXG5cbiAgICB3YWl0c0ZvciAtPlxuICAgICAgZXhNb2RlLm1haW5Nb2R1bGUuZ2xvYmFsRXhTdGF0ZS5zZXRWaW0uY2FsbHMubGVuZ3RoID4gMFxuXG4gICAgcnVucyAtPlxuICAgICAgZGlyID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCBcImF0b20tZXgtbW9kZS1zcGVjLSN7dXVpZC52NCgpfVwiKVxuICAgICAgZGlyMiA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgXCJhdG9tLWV4LW1vZGUtc3BlYy0je3V1aWQudjQoKX1cIilcbiAgICAgIGZzLm1ha2VUcmVlU3luYyhkaXIpXG4gICAgICBmcy5tYWtlVHJlZVN5bmMoZGlyMilcbiAgICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbZGlyLCBkaXIyXSlcblxuICAgICAgaGVscGVycy5nZXRFZGl0b3JFbGVtZW50IChlbGVtZW50KSAtPlxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVsZW1lbnQsIFwiZXgtbW9kZTpvcGVuXCIpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWxlbWVudC5nZXRNb2RlbCgpLm5vcm1hbE1vZGVJbnB1dFZpZXcuZWRpdG9yRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImNvcmU6Y2FuY2VsXCIpXG4gICAgICAgIGVkaXRvckVsZW1lbnQgPSBlbGVtZW50XG4gICAgICAgIGVkaXRvciA9IGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKVxuICAgICAgICB2aW1TdGF0ZSA9IHZpbU1vZGUubWFpbk1vZHVsZS5nZXRFZGl0b3JTdGF0ZShlZGl0b3IpXG4gICAgICAgIGV4U3RhdGUgPSBleE1vZGUubWFpbk1vZHVsZS5leFN0YXRlcy5nZXQoZWRpdG9yKVxuICAgICAgICB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dChcImFiY1xcbmRlZlxcbmFiY1xcbmRlZlwiKVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIGZzLnJlbW92ZVN5bmMoZGlyKVxuICAgIGZzLnJlbW92ZVN5bmMoZGlyMilcblxuICBrZXlkb3duID0gKGtleSwgb3B0aW9ucz17fSkgLT5cbiAgICBvcHRpb25zLmVsZW1lbnQgPz0gZWRpdG9yRWxlbWVudFxuICAgIGhlbHBlcnMua2V5ZG93bihrZXksIG9wdGlvbnMpXG5cbiAgbm9ybWFsTW9kZUlucHV0S2V5ZG93biA9IChrZXksIG9wdHMgPSB7fSkgLT5cbiAgICBlZGl0b3Iubm9ybWFsTW9kZUlucHV0Vmlldy5lZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuc2V0VGV4dChrZXkpXG5cbiAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCA9ICh0ZXh0KSAtPlxuICAgIGNvbW1hbmRFZGl0b3IgPSBlZGl0b3Iubm9ybWFsTW9kZUlucHV0Vmlldy5lZGl0b3JFbGVtZW50XG4gICAgY29tbWFuZEVkaXRvci5nZXRNb2RlbCgpLnNldFRleHQodGV4dClcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGNvbW1hbmRFZGl0b3IsIFwiY29yZTpjb25maXJtXCIpXG5cbiAgb3BlbkV4ID0gLT5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsIFwiZXgtbW9kZTpvcGVuXCIpXG5cbiAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gYSBzcGVjaWZpYyBsaW5lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMidcblxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFsxLCAwXVxuXG4gICAgaXQgXCJtb3ZlcyB0byB0aGUgc2Vjb25kIGFkZHJlc3NcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcxLDMnXG5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMiwgMF1cblxuICAgIGl0IFwid29ya3Mgd2l0aCBvZmZzZXRzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMisxJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFsyLCAwXVxuXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnLTInXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICBpdCBcImxpbWl0cyB0byB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMTAnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzMsIDBdXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMywxMCdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMywgMF1cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICckKzEwMDAnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzMsIDBdXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgaXQgXCJnb2VzIHRvIHRoZSBmaXJzdCBsaW5lIHdpdGggYWRkcmVzcyAwXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzIsIDBdKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJzAnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMCwwJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAwXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgd2hlbiB0aGUgYWRkcmVzcyBpcyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnLidcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMF1cblxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJywnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICBpdCBcIm1vdmVzIHRvIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICckJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFszLCAwXVxuXG4gICAgaXQgXCJtb3ZlcyB0byBhIG1hcmsncyBsaW5lXCIsIC0+XG4gICAgICBrZXlkb3duKCdsJylcbiAgICAgIGtleWRvd24oJ20nKVxuICAgICAgbm9ybWFsTW9kZUlucHV0S2V5ZG93biAnYSdcbiAgICAgIGtleWRvd24oJ2onKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgXCInYVwiXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICBpdCBcIm1vdmVzIHRvIGEgc3BlY2lmaWVkIHNlYXJjaFwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJy9kZWYnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzEsIDBdXG5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnP2RlZidcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMSwgMF1cblxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFszLCAwXSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcvZWYnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzEsIDBdXG5cbiAgZGVzY3JpYmUgXCI6d3JpdGVcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gZWRpdGluZyBhIG5ldyBmaWxlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmNcXG5kZWYnKVxuXG4gICAgICBpdCBcIm9wZW5zIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3JpdGUnKVxuICAgICAgICBleHBlY3QoYXRvbS5zaG93U2F2ZURpYWxvZ1N5bmMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICBpdCBcInNhdmVzIHdoZW4gYSBwYXRoIGlzIHNwZWNpZmllZCBpbiB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aCgnd3JpdGUtZnJvbS1zYXZlLWRpYWxvZycpXG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4oZmlsZVBhdGgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dyaXRlJylcbiAgICAgICAgZXhwZWN0KGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpKS50b0JlKHRydWUpXG4gICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmNcXG5kZWYnKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmlzTW9kaWZpZWQoKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzYXZlcyB3aGVuIGEgcGF0aCBpcyBzcGVjaWZpZWQgaW4gdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4odW5kZWZpbmVkKVxuICAgICAgICBzcHlPbihmcywgJ3dyaXRlRmlsZVN5bmMnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cml0ZScpXG4gICAgICAgIGV4cGVjdChmcy53cml0ZUZpbGVTeW5jLmNhbGxzLmxlbmd0aCkudG9CZSgwKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGVkaXRpbmcgYW4gZXhpc3RpbmcgZmlsZVwiLCAtPlxuICAgICAgZmlsZVBhdGggPSAnJ1xuICAgICAgaSA9IDBcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBpKytcbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aChcIndyaXRlLSN7aX1cIilcbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZicpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG5cbiAgICAgIGl0IFwic2F2ZXMgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiYycpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dyaXRlJylcbiAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiYycpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuaXNNb2RpZmllZCgpKS50b0JlKGZhbHNlKVxuXG4gICAgICBkZXNjcmliZSBcIndpdGggYSBzcGVjaWZpZWQgcGF0aFwiLCAtPlxuICAgICAgICBuZXdQYXRoID0gJydcblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGgucmVsYXRpdmUoZGlyLCBcIiN7ZmlsZVBhdGh9Lm5ld1wiKVxuICAgICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmMnKVxuICAgICAgICAgIG9wZW5FeCgpXG5cbiAgICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIndyaXRlICN7bmV3UGF0aH1cIilcbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5yZXNvbHZlKGRpciwgZnMubm9ybWFsaXplKG5ld1BhdGgpKVxuICAgICAgICAgIGV4cGVjdChmcy5leGlzdHNTeW5jKG5ld1BhdGgpKS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhuZXdQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmlzTW9kaWZpZWQoKSkudG9CZSh0cnVlKVxuICAgICAgICAgIGZzLnJlbW92ZVN5bmMobmV3UGF0aClcblxuICAgICAgICBpdCBcInNhdmVzIHRvIHRoZSBwYXRoXCIsIC0+XG5cbiAgICAgICAgaXQgXCJleHBhbmRzIC5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCcuJywgbmV3UGF0aClcblxuICAgICAgICBpdCBcImV4cGFuZHMgLi5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCcuLicsIG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJleHBhbmRzIH5cIiwgLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5qb2luKCd+JywgbmV3UGF0aClcblxuICAgICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3Igd2l0aCBtb3JlIHRoYW4gb25lIHBhdGhcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3JpdGUgcGF0aDEgcGF0aDInKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogT25seSBvbmUgZmlsZSBuYW1lIGFsbG93ZWQnXG4gICAgICAgIClcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBmaWxlIGFscmVhZHkgZXhpc3RzXCIsIC0+XG4gICAgICAgIGV4aXN0c1BhdGggPSAnJ1xuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBleGlzdHNQYXRoID0gcHJvamVjdFBhdGgoJ3dyaXRlLWV4aXN0cycpXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhleGlzdHNQYXRoLCAnYWJjJylcblxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBmcy5yZW1vdmVTeW5jKGV4aXN0c1BhdGgpXG5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpbGUgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJ3cml0ZSAje2V4aXN0c1BhdGh9XCIpXG4gICAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogRmlsZSBleGlzdHMgKGFkZCAhIHRvIG92ZXJyaWRlKSdcbiAgICAgICAgICApXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhleGlzdHNQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjJylcblxuICAgICAgICBpdCBcIndyaXRlcyBpZiBmb3JjZWQgd2l0aCA6d3JpdGUhXCIsIC0+XG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwid3JpdGUhICN7ZXhpc3RzUGF0aH1cIilcbiAgICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnMpLnRvRXF1YWwoW10pXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhleGlzdHNQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjXFxuZGVmJylcblxuICBkZXNjcmliZSBcIjp3YWxsXCIsIC0+XG4gICAgaXQgXCJzYXZlcyBhbGxcIiwgLT5cbiAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnc2F2ZUFsbCcpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd2FsbCcpXG4gICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2Uuc2F2ZUFsbCkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCI6c2F2ZWFzXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aGVuIGVkaXRpbmcgYSBuZXcgZmlsZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjXFxuZGVmJylcblxuICAgICAgaXQgXCJvcGVucyB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NhdmVhcycpXG4gICAgICAgIGV4cGVjdChhdG9tLnNob3dTYXZlRGlhbG9nU3luYykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwic2F2ZXMgd2hlbiBhIHBhdGggaXMgc3BlY2lmaWVkIGluIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCdzYXZlYXMtZnJvbS1zYXZlLWRpYWxvZycpXG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4oZmlsZVBhdGgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NhdmVhcycpXG4gICAgICAgIGV4cGVjdChmcy5leGlzdHNTeW5jKGZpbGVQYXRoKSkudG9CZSh0cnVlKVxuICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjXFxuZGVmJylcblxuICAgICAgaXQgXCJzYXZlcyB3aGVuIGEgcGF0aCBpcyBzcGVjaWZpZWQgaW4gdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4odW5kZWZpbmVkKVxuICAgICAgICBzcHlPbihmcywgJ3dyaXRlRmlsZVN5bmMnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzYXZlYXMnKVxuICAgICAgICBleHBlY3QoZnMud3JpdGVGaWxlU3luYy5jYWxscy5sZW5ndGgpLnRvQmUoMClcblxuICAgIGRlc2NyaWJlIFwid2hlbiBlZGl0aW5nIGFuIGV4aXN0aW5nIGZpbGVcIiwgLT5cbiAgICAgIGZpbGVQYXRoID0gJydcbiAgICAgIGkgPSAwXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgaSsrXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJzYXZlYXMtI3tpfVwiKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjXFxuZGVmJylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcblxuICAgICAgaXQgXCJjb21wbGFpbnMgaWYgbm8gcGF0aCBnaXZlblwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc2F2ZWFzJylcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IEFyZ3VtZW50IHJlcXVpcmVkJ1xuICAgICAgICApXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBhIHNwZWNpZmllZCBwYXRoXCIsIC0+XG4gICAgICAgIG5ld1BhdGggPSAnJ1xuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5yZWxhdGl2ZShkaXIsIFwiI3tmaWxlUGF0aH0ubmV3XCIpXG4gICAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgICAgb3BlbkV4KClcblxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwic2F2ZWFzICN7bmV3UGF0aH1cIilcbiAgICAgICAgICBuZXdQYXRoID0gcGF0aC5yZXNvbHZlKGRpciwgZnMubm9ybWFsaXplKG5ld1BhdGgpKVxuICAgICAgICAgIGV4cGVjdChmcy5leGlzdHNTeW5jKG5ld1BhdGgpKS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhuZXdQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmlzTW9kaWZpZWQoKSkudG9CZShmYWxzZSlcbiAgICAgICAgICBmcy5yZW1vdmVTeW5jKG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJzYXZlcyB0byB0aGUgcGF0aFwiLCAtPlxuXG4gICAgICAgIGl0IFwiZXhwYW5kcyAuXCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignLicsIG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJleHBhbmRzIC4uXCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignLi4nLCBuZXdQYXRoKVxuXG4gICAgICAgIGl0IFwiZXhwYW5kcyB+XCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignficsIG5ld1BhdGgpXG5cbiAgICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIHdpdGggbW9yZSB0aGFuIG9uZSBwYXRoXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NhdmVhcyBwYXRoMSBwYXRoMicpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBPbmx5IG9uZSBmaWxlIG5hbWUgYWxsb3dlZCdcbiAgICAgICAgKVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGhlIGZpbGUgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgZXhpc3RzUGF0aCA9ICcnXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGV4aXN0c1BhdGggPSBwcm9qZWN0UGF0aCgnc2F2ZWFzLWV4aXN0cycpXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhleGlzdHNQYXRoLCAnYWJjJylcblxuICAgICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgICBmcy5yZW1vdmVTeW5jKGV4aXN0c1BhdGgpXG5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpbGUgYWxyZWFkeSBleGlzdHNcIiwgLT5cbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJzYXZlYXMgI3tleGlzdHNQYXRofVwiKVxuICAgICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IEZpbGUgZXhpc3RzIChhZGQgISB0byBvdmVycmlkZSknXG4gICAgICAgICAgKVxuICAgICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZXhpc3RzUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiYycpXG5cbiAgICAgICAgaXQgXCJ3cml0ZXMgaWYgZm9yY2VkIHdpdGggOnNhdmVhcyFcIiwgLT5cbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJzYXZlYXMhICN7ZXhpc3RzUGF0aH1cIilcbiAgICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnMpLnRvRXF1YWwoW10pXG4gICAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhleGlzdHNQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjXFxuZGVmJylcblxuICBkZXNjcmliZSBcIjpxdWl0XCIsIC0+XG4gICAgcGFuZSA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBzcHlPbihwYW5lLCAnZGVzdHJveUFjdGl2ZUl0ZW0nKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKVxuXG4gICAgaXQgXCJjbG9zZXMgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gaWYgbm90IG1vZGlmaWVkXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgncXVpdCcpXG4gICAgICBleHBlY3QocGFuZS5kZXN0cm95QWN0aXZlSXRlbSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QocGFuZS5nZXRJdGVtcygpLmxlbmd0aCkudG9CZSgxKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGlzIG1vZGlmaWVkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdkZWYnKVxuXG4gICAgICBpdCBcIm9wZW5zIHRoZSBwcm9tcHQgdG8gc2F2ZVwiLCAtPlxuICAgICAgICBzcHlPbihwYW5lLCAncHJvbXB0VG9TYXZlSXRlbScpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3F1aXQnKVxuICAgICAgICBleHBlY3QocGFuZS5wcm9tcHRUb1NhdmVJdGVtKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjpxdWl0YWxsXCIsIC0+XG4gICAgaXQgXCJjbG9zZXMgQXRvbVwiLCAtPlxuICAgICAgc3B5T24oYXRvbSwgJ2Nsb3NlJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdxdWl0YWxsJylcbiAgICAgIGV4cGVjdChhdG9tLmNsb3NlKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjp0YWJjbG9zZVwiLCAtPlxuICAgIGl0IFwiYWN0cyBhcyBhbiBhbGlhcyB0byA6cXVpdFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd0YWJjbG9zZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKEV4LCAncXVpdCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJjbG9zZScpXG4gICAgICBleHBlY3QoRXgucXVpdCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoRXgudGFiY2xvc2UuY2FsbHNbMF0uYXJncy4uLilcblxuICBkZXNjcmliZSBcIjp0YWJuZXh0XCIsIC0+XG4gICAgcGFuZSA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgICAgICAudGhlbiAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKClcblxuICAgIGl0IFwic3dpdGNoZXMgdG8gdGhlIG5leHQgdGFiXCIsIC0+XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXgoMSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJuZXh0JylcbiAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW1JbmRleCgpKS50b0JlKDIpXG5cbiAgICBpdCBcIndyYXBzIGFyb3VuZFwiLCAtPlxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggLSAxKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYm5leHQnKVxuICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KCkpLnRvQmUoMClcblxuICBkZXNjcmliZSBcIjp0YWJwcmV2aW91c1wiLCAtPlxuICAgIHBhbmUgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gLT4gYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICAgICAgLnRoZW4gLT4gYXRvbS53b3Jrc3BhY2Uub3BlbigpXG5cbiAgICBpdCBcInN3aXRjaGVzIHRvIHRoZSBwcmV2aW91cyB0YWJcIiwgLT5cbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCgxKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYnByZXZpb3VzJylcbiAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW1JbmRleCgpKS50b0JlKDApXG5cbiAgICBpdCBcIndyYXBzIGFyb3VuZFwiLCAtPlxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KDApXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndGFicHJldmlvdXMnKVxuICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KCkpLnRvQmUocGFuZS5nZXRJdGVtcygpLmxlbmd0aCAtIDEpXG5cbiAgZGVzY3JpYmUgXCI6d3FcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihFeCwgJ3dyaXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24oRXgsICdxdWl0JylcblxuICAgIGl0IFwid3JpdGVzIHRoZSBmaWxlLCB0aGVuIHF1aXRzXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJykuYW5kUmV0dXJuKHByb2plY3RQYXRoKCd3cS0xJykpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3EnKVxuICAgICAgZXhwZWN0KEV4LndyaXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICMgU2luY2UgYDp3cWAgb25seSBjYWxscyBgOnF1aXRgIGFmdGVyIGA6d3JpdGVgIGlzIGZpbmlzaGVkLCB3ZSBuZWVkIHRvXG4gICAgICAjICB3YWl0IGEgYml0IGZvciB0aGUgYDpxdWl0YCBjYWxsIHRvIG9jY3VyXG4gICAgICB3YWl0c0ZvcigoLT4gRXgucXVpdC53YXNDYWxsZWQpLCBcInRoZSA6cXVpdCBjb21tYW5kIHRvIGJlIGNhbGxlZFwiLCAxMDApXG5cbiAgICBpdCBcImRvZXNuJ3QgcXVpdCB3aGVuIHRoZSBmaWxlIGlzIG5ldyBhbmQgbm8gcGF0aCBpcyBzcGVjaWZpZWQgaW4gdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJykuYW5kUmV0dXJuKHVuZGVmaW5lZClcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cScpXG4gICAgICBleHBlY3QoRXgud3JpdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgd2FzTm90Q2FsbGVkID0gZmFsc2VcbiAgICAgICMgRklYTUU6IFRoaXMgc2VlbXMgZGFuZ2Vyb3VzLCBidXQgc2V0VGltZW91dCBzb21laG93IGRvZXNuJ3Qgd29yay5cbiAgICAgIHNldEltbWVkaWF0ZSgoLT5cbiAgICAgICAgd2FzTm90Q2FsbGVkID0gbm90IEV4LnF1aXQud2FzQ2FsbGVkKSlcbiAgICAgIHdhaXRzRm9yKCgtPiB3YXNOb3RDYWxsZWQpLCAxMDApXG5cbiAgICBpdCBcInBhc3NlcyB0aGUgZmlsZSBuYW1lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3Egd3EtMicpXG4gICAgICBleHBlY3QoRXgud3JpdGUpXG4gICAgICAgIC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChFeC53cml0ZS5jYWxsc1swXS5hcmdzWzBdLmFyZ3MudHJpbSgpKS50b0VxdWFsKCd3cS0yJylcbiAgICAgIHdhaXRzRm9yKCgtPiBFeC5xdWl0Lndhc0NhbGxlZCksIFwidGhlIDpxdWl0IGNvbW1hbmQgdG8gYmUgY2FsbGVkXCIsIDEwMClcblxuICBkZXNjcmliZSBcIjp4aXRcIiwgLT5cbiAgICBpdCBcImFjdHMgYXMgYW4gYWxpYXMgdG8gOndxXCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3dxJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd4aXQnKVxuICAgICAgZXhwZWN0KEV4LndxKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjp4XCIsIC0+XG4gICAgaXQgXCJhY3RzIGFzIGFuIGFsaWFzIHRvIDp4aXRcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAneGl0JylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd4JylcbiAgICAgIGV4cGVjdChFeC54aXQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOndxYWxsXCIsIC0+XG4gICAgaXQgXCJjYWxscyA6d2FsbCwgdGhlbiA6cXVpdGFsbFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd3YWxsJylcbiAgICAgIHNweU9uKEV4LCAncXVpdGFsbCcpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3FhbGwnKVxuICAgICAgZXhwZWN0KEV4LndhbGwpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KEV4LnF1aXRhbGwpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOmVkaXRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGhvdXQgYSBmaWxlIG5hbWVcIiwgLT5cbiAgICAgIGl0IFwicmVsb2FkcyB0aGUgZmlsZSBmcm9tIHRoZSBkaXNrXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJlZGl0LTFcIilcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsICdkZWYnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0JylcbiAgICAgICAgIyBSZWxvYWRpbmcgdGFrZXMgYSBiaXRcbiAgICAgICAgd2FpdHNGb3IoKC0+IGVkaXRvci5nZXRUZXh0KCkgaXMgJ2RlZicpLFxuICAgICAgICAgIFwidGhlIGVkaXRvcidzIGNvbnRlbnQgdG8gY2hhbmdlXCIsIDEwMClcblxuICAgICAgaXQgXCJkb2Vzbid0IHJlbG9hZCB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIG1vZGlmaWVkXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJlZGl0LTJcIilcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmNkJylcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgJ2RlZicpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ2VkaXQnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogTm8gd3JpdGUgc2luY2UgbGFzdCBjaGFuZ2UgKGFkZCAhIHRvIG92ZXJyaWRlKScpXG4gICAgICAgIGlzbnREZWYgPSBmYWxzZVxuICAgICAgICBzZXRJbW1lZGlhdGUoLT4gaXNudERlZiA9IGVkaXRvci5nZXRUZXh0KCkgaXNudCAnZGVmJylcbiAgICAgICAgd2FpdHNGb3IoKC0+IGlzbnREZWYpLCBcInRoZSBlZGl0b3IncyBjb250ZW50IG5vdCB0byBjaGFuZ2VcIiwgNTApXG5cbiAgICAgIGl0IFwicmVsb2FkcyB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBpdCBpcyBmb3JjZWRcIiwgLT5cbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aChcImVkaXQtM1wiKVxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjJylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiY2QnKVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCAnZGVmJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCEnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnMubGVuZ3RoKS50b0JlKDApXG4gICAgICAgIHdhaXRzRm9yKCgtPiBlZGl0b3IuZ2V0VGV4dCgpIGlzICdkZWYnKVxuICAgICAgICAgIFwidGhlIGVkaXRvcidzIGNvbnRlbnQgdG8gY2hhbmdlXCIsIDUwKVxuXG4gICAgICBpdCBcInRocm93cyBhbiBlcnJvciB3aGVuIGVkaXRpbmcgYSBuZXcgZmlsZVwiLCAtPlxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkucmVsb2FkKClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBObyBmaWxlIG5hbWUnKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IScpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1sxXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBObyBmaWxlIG5hbWUnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgZmlsZSBuYW1lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5yZWxvYWQoKVxuXG4gICAgICBpdCBcIm9wZW5zIHRoZSBzcGVjaWZpZWQgcGF0aFwiLCAtPlxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCdlZGl0LW5ldy10ZXN0JylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcImVkaXQgI3tmaWxlUGF0aH1cIilcbiAgICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKGZpbGVQYXRoKVxuXG4gICAgICBpdCBcIm9wZW5zIGEgcmVsYXRpdmUgcGF0aFwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IGVkaXQtcmVsYXRpdmUtdGVzdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5vcGVuKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChcbiAgICAgICAgICBwcm9qZWN0UGF0aCgnZWRpdC1yZWxhdGl2ZS10ZXN0JykpXG5cbiAgICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIGlmIHRyeWluZyB0byBvcGVuIG1vcmUgdGhhbiBvbmUgZmlsZVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0IGVkaXQtbmV3LXRlc3QtMSBlZGl0LW5ldy10ZXN0LTInKVxuICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2Uub3Blbi5jYWxsQ291bnQpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IE9ubHkgb25lIGZpbGUgbmFtZSBhbGxvd2VkJylcblxuICBkZXNjcmliZSBcIjp0YWJlZGl0XCIsIC0+XG4gICAgaXQgXCJhY3RzIGFzIGFuIGFsaWFzIHRvIDplZGl0IGlmIHN1cHBsaWVkIHdpdGggYSBwYXRoXCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3RhYmVkaXQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ2VkaXQnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYmVkaXQgdGFiZWRpdC10ZXN0JylcbiAgICAgIGV4cGVjdChFeC5lZGl0KS50b0hhdmVCZWVuQ2FsbGVkV2l0aChFeC50YWJlZGl0LmNhbGxzWzBdLmFyZ3MuLi4pXG5cbiAgICBpdCBcImFjdHMgYXMgYW4gYWxpYXMgdG8gOnRhYm5ldyBpZiBub3Qgc3VwcGxpZWQgd2l0aCBhIHBhdGhcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAndGFiZWRpdCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKEV4LCAndGFibmV3JylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJlZGl0ICAnKVxuICAgICAgZXhwZWN0KEV4LnRhYm5ldylcbiAgICAgICAgLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKEV4LnRhYmVkaXQuY2FsbHNbMF0uYXJncy4uLilcblxuICBkZXNjcmliZSBcIjp0YWJuZXdcIiwgLT5cbiAgICBpdCBcIm9wZW5zIGEgbmV3IHRhYlwiLCAtPlxuICAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJuZXcnKVxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgaXQgXCJvcGVucyBhIG5ldyB0YWIgZm9yIGVkaXRpbmcgd2hlbiBwcm92aWRlZCBhbiBhcmd1bWVudFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd0YWJuZXcnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ3RhYmVkaXQnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYm5ldyB0YWJuZXctdGVzdCcpXG4gICAgICBleHBlY3QoRXgudGFiZWRpdClcbiAgICAgICAgLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKEV4LnRhYm5ldy5jYWxsc1swXS5hcmdzLi4uKVxuXG4gIGRlc2NyaWJlIFwiOnNwbGl0XCIsIC0+XG4gICAgaXQgXCJzcGxpdHMgdGhlIGN1cnJlbnQgZmlsZSB1cHdhcmRzL2Rvd253YXJkXCIsIC0+XG4gICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdERvd24nKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3NwbGl0JylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc3BsaXQnKVxuICAgICAgICBleHBlY3QocGFuZS5zcGxpdERvd24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBzcHlPbihwYW5lLCAnc3BsaXRVcCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aCgnc3BsaXQnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzcGxpdCcpXG4gICAgICAgIGV4cGVjdChwYW5lLnNwbGl0VXApLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgIyBGSVhNRTogU2hvdWxkIHRlc3Qgd2hldGhlciB0aGUgbmV3IHBhbmUgY29udGFpbnMgYSBUZXh0RWRpdG9yXG4gICAgICAjICAgICAgICBwb2ludGluZyB0byB0aGUgc2FtZSBwYXRoXG5cbiAgZGVzY3JpYmUgXCI6dnNwbGl0XCIsIC0+XG4gICAgaXQgXCJzcGxpdHMgdGhlIGN1cnJlbnQgZmlsZSB0byB0aGUgbGVmdC9yaWdodFwiLCAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKVxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdFJpZ2h0JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCd2c3BsaXQnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd2c3BsaXQnKVxuICAgICAgICBleHBlY3QocGFuZS5zcGxpdExlZnQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHNweU9uKHBhbmUsICdzcGxpdExlZnQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3ZzcGxpdCcpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3ZzcGxpdCcpXG4gICAgICAgIGV4cGVjdChwYW5lLnNwbGl0TGVmdCkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAjIEZJWE1FOiBTaG91bGQgdGVzdCB3aGV0aGVyIHRoZSBuZXcgcGFuZSBjb250YWlucyBhIFRleHRFZGl0b3JcbiAgICAgICMgICAgICAgIHBvaW50aW5nIHRvIHRoZSBzYW1lIHBhdGhcblxuICBkZXNjcmliZSBcIjpkZWxldGVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjXFxuZGVmXFxuZ2hpXFxuamtsJylcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ2RlbGV0ZScpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYWJjXFxuZGVmXFxuamtsJylcblxuICAgIGl0IFwiY29waWVzIHRoZSBkZWxldGVkIHRleHRcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdkZWxldGUnKVxuICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCgnZ2hpXFxuJylcblxuICAgIGl0IFwiZGVsZXRlcyB0aGUgbGluZXMgaW4gdGhlIGdpdmVuIHJhbmdlXCIsIC0+XG4gICAgICBwcm9jZXNzZWRPcFN0YWNrID0gZmFsc2VcbiAgICAgIGV4U3RhdGUub25EaWRQcm9jZXNzT3BTdGFjayAtPiBwcm9jZXNzZWRPcFN0YWNrID0gdHJ1ZVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzEsMmRlbGV0ZScpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpXFxuamtsJylcblxuICAgICAgd2FpdHNGb3IgLT4gcHJvY2Vzc2VkT3BTdGFja1xuICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzEsIDFdKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJywvay9kZWxldGUnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbicpXG5cbiAgICBpdCBcInVuZG9zIGRlbGV0aW5nIHNldmVyYWwgbGluZXMgYXQgb25jZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJy0xLC5kZWxldGUnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbmprbCcpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdjb3JlOnVuZG8nKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG5cbiAgZGVzY3JpYmUgXCI6c3Vic3RpdHV0ZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgIGl0IFwicmVwbGFjZXMgYSBjaGFyYWN0ZXIgb24gdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlIC9hL3gnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICBpdCBcImRvZXNuJ3QgbmVlZCBhIHNwYWNlIGJlZm9yZSB0aGUgYXJndW1lbnRzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94JylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCd4YmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgaXQgXCJyZXNwZWN0cyBtb2RpZmllcnMgcGFzc2VkIHRvIGl0XCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94L2cnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY3hBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hL3gvZ2knKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ3hiY3h4QkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICBpdCBcInJlcGxhY2VzIG9uIG11bHRpcGxlIGxpbmVzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOiVzdWJzdGl0dXRlL2FiYy9naGknKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFBQkNcXG5kZWZkREVGXFxuZ2hpYUFCQycpXG5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6JXN1YnN0aXR1dGUvYWJjL2doaS9pZycpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5naGlhZ2hpJylcblxuICAgIGRlc2NyaWJlIFwiOnlhbmtcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMiwgMF0pXG5cbiAgICAgIGl0IFwieWFua3MgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd5YW5rJylcbiAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCgnZ2hpXFxuJylcblxuICAgICAgaXQgXCJ5YW5rcyB0aGUgbGluZXMgaW4gdGhlIGdpdmVuIHJhbmdlXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzEsMnlhbmsnKVxuICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsKCdhYmNcXG5kZWZcXG4nKVxuXG4gICAgZGVzY3JpYmUgXCJpbGxlZ2FsIGRlbGltaXRlcnNcIiwgLT5cbiAgICAgIHRlc3QgPSAoZGVsaW0pIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCI6c3Vic3RpdHV0ZSAje2RlbGltfWEje2RlbGltfXgje2RlbGltfWdpXCIpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgIFwiQ29tbWFuZCBlcnJvcjogUmVndWxhciBleHByZXNzaW9ucyBjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMsICdcXFxcJywgJ1xcXCInIG9yICd8J1wiKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgaXQgXCJjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgbGV0dGVyc1wiLCAtPiB0ZXN0ICduJ1xuICAgICAgaXQgXCJjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgbnVtYmVyc1wiLCAtPiB0ZXN0ICczJ1xuICAgICAgaXQgXCJjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgJ1xcXFwnXCIsICAgIC0+IHRlc3QgJ1xcXFwnXG4gICAgICBpdCBcImNhbid0IGJlIGRlbGltaXRlZCBieSAnXFxcIidcIiwgICAgLT4gdGVzdCAnXCInXG4gICAgICBpdCBcImNhbid0IGJlIGRlbGltaXRlZCBieSAnfCdcIiwgICAgIC0+IHRlc3QgJ3wnXG5cbiAgICBkZXNjcmliZSBcImVtcHR5IHJlcGxhY2VtZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhYmNcXG5hYmNhYmMnKVxuXG4gICAgICBpdCBcInJlbW92ZXMgdGhlIHBhdHRlcm4gd2l0aG91dCBtb2RpZmllcnNcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIjpzdWJzdGl0dXRlL2FiYy8vXCIpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNcXG5hYmNhYmMnKVxuXG4gICAgICBpdCBcInJlbW92ZXMgdGhlIHBhdHRlcm4gd2l0aCBtb2RpZmllcnNcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIjpzdWJzdGl0dXRlL2FiYy8vZ1wiKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnXFxuYWJjYWJjJylcblxuICAgIGRlc2NyaWJlIFwicmVwbGFjaW5nIHdpdGggZXNjYXBlIHNlcXVlbmNlc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjLGRlZixnaGknKVxuXG4gICAgICB0ZXN0ID0gKGVzY2FwZUNoYXIsIGVzY2FwZWQpIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCI6c3Vic3RpdHV0ZS8sL1xcXFwje2VzY2FwZUNoYXJ9L2dcIilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJhYmMje2VzY2FwZWR9ZGVmI3tlc2NhcGVkfWdoaVwiKVxuXG4gICAgICBpdCBcInJlcGxhY2VzIHdpdGggYSB0YWJcIiwgLT4gdGVzdCgndCcsICdcXHQnKVxuICAgICAgaXQgXCJyZXBsYWNlcyB3aXRoIGEgbGluZWZlZWRcIiwgLT4gdGVzdCgnbicsICdcXG4nKVxuICAgICAgaXQgXCJyZXBsYWNlcyB3aXRoIGEgY2FycmlhZ2UgcmV0dXJuXCIsIC0+IHRlc3QoJ3InLCAnXFxyJylcblxuICAgIGRlc2NyaWJlIFwiY2FzZSBzZW5zaXRpdml0eVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZXNwZWN0cyB0aGUgc21hcnRjYXNlIHNldHRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwidXNlcyBjYXNlIHNlbnNpdGl2ZSBzZWFyY2ggaWYgc21hcnRjYXNlIGlzIG9mZiBhbmQgdGhlIHBhdHRlcm4gaXMgbG93ZXJjYXNlXCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCBmYWxzZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FiYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2Ugc2Vuc2l0aXZlIHNlYXJjaCBpZiBzbWFydGNhc2UgaXMgb2ZmIGFuZCB0aGUgcGF0dGVybiBpcyB1cHBlcmNhc2VcIiwgLT5cbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL0FCQy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY2FnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2UgaW5zZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvbiBhbmQgdGhlIHBhdHRlcm4gaXMgbG93ZXJjYXNlXCIsIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCB0cnVlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYWJjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcInVzZXMgY2FzZSBzZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvbiBhbmQgdGhlIHBhdHRlcm4gaXMgdXBwZXJjYXNlXCIsIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9BQkMvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBkZXNjcmliZSBcIlxcXFxjIGFuZCBcXFxcQyBpbiB0aGUgcGF0dGVyblwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2UgaW5zZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvZmYgYW5kIFxcYyBpcyBpbiB0aGUgcGF0dGVyblwiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgZmFsc2UpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hYmNcXFxcYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJkb2Vzbid0IG1hdHRlciB3aGVyZSBpbiB0aGUgcGF0dGVybiBcXFxcYyBpc1wiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgZmFsc2UpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hXFxcXGNiYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2Ugc2Vuc2l0aXZlIHNlYXJjaCBpZiBzbWFydGNhc2UgaXMgb24sIFxcXFxDIGlzIGluIHRoZSBwYXR0ZXJuIGFuZCB0aGUgcGF0dGVybiBpcyBsb3dlcmNhc2VcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWUpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hXFxcXENiYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJvdmVycmlkZXMgXFxcXEMgd2l0aCBcXFxcYyBpZiBcXFxcQyBjb21lcyBmaXJzdFwiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgdHJ1ZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FcXFxcQ2JcXFxcY2MvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwib3ZlcnJpZGVzIFxcXFxDIHdpdGggXFxcXGMgaWYgXFxcXGMgY29tZXMgZmlyc3RcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWUpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hXFxcXGNiXFxcXENjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcIm92ZXJyaWRlcyBhbiBhcHBlbmRlZCAvaSBmbGFnIHdpdGggXFxcXENcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWUpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hYlxcXFxDYy9naGkvZ2knKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgZGVzY3JpYmUgXCJjYXB0dXJpbmcgZ3JvdXBzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBpdCBcInJlcGxhY2VzIFxcXFwxIHdpdGggdGhlIGZpcnN0IGdyb3VwXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2JjKC57Mn0pL1hcXFxcMVgnKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYVhhQVhCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgaXQgXCJyZXBsYWNlcyBtdWx0aXBsZSBncm91cHNcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYShbYS16XSopYUEoW0EtWl0qKS9YXFxcXDFYWVxcXFwyWScpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdYYmNYWUJDWVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgaXQgXCJyZXBsYWNlcyBcXFxcMCB3aXRoIHRoZSBlbnRpcmUgbWF0Y2hcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYWIoY2EpQUIvWFxcXFwwWCcpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdYYWJjYUFCWENcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgZGVzY3JpYmUgXCI6c2V0XCIsIC0+XG4gICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3Igd2l0aG91dCBhIHNwZWNpZmllZCBvcHRpb25cIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0JylcbiAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAnQ29tbWFuZCBlcnJvcjogTm8gb3B0aW9uIHNwZWNpZmllZCcpXG5cbiAgICBpdCBcInNldHMgbXVsdGlwbGUgb3B0aW9ucyBhdCBvbmNlXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycsIGZhbHNlKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJywgZmFsc2UpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBsaXN0IG51bWJlcicpXG4gICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycpKS50b0JlKHRydWUpXG5cbiAgICBkZXNjcmliZSBcInRoZSBvcHRpb25zXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJywgZmFsc2UpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycsIGZhbHNlKVxuXG4gICAgICBpdCBcInNldHMgKG5vKWxpc3RcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBsaXN0JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub2xpc3QnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzZXRzIChubyludShtYmVyKVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG51JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9udScpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnKSkudG9CZShmYWxzZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBudW1iZXInKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub251bWJlcicpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzZXRzIChubylzcChsaXQpcihpZ2h0KVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNwcicpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRyaWdodCcpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zcHInKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKSkudG9CZShmYWxzZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBzcGxpdHJpZ2h0JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdHJpZ2h0JykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NwbGl0cmlnaHQnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzZXRzIChubylzKHBsaXQpYihlbG93KVwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNiJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdGJlbG93JykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NiJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdGJlbG93JykpLnRvQmUoZmFsc2UpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgc3BsaXRiZWxvdycpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpKS50b0JlKHRydWUpXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zcGxpdGJlbG93JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdGJlbG93JykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGl0IFwic2V0cyAobm8pcyhtYXJ0KWMoYSlzKGUpXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgc2NzJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NjcycpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcpKS50b0JlKGZhbHNlKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNtYXJ0Y2FzZScpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcpKS50b0JlKHRydWUpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbm9zbWFydGNhc2UnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnKSkudG9CZShmYWxzZSlcblxuICBkZXNjcmliZSBcImFsaWFzZXNcIiwgLT5cbiAgICBpdCBcImNhbGxzIHRoZSBhbGlhc2VkIGZ1bmN0aW9uIHdpdGhvdXQgYXJndW1lbnRzXCIsIC0+XG4gICAgICBFeENsYXNzLnJlZ2lzdGVyQWxpYXMoJ1cnLCAndycpXG4gICAgICBzcHlPbihFeCwgJ3dyaXRlJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdXJylcbiAgICAgIGV4cGVjdChFeC53cml0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBpdCBcImNhbGxzIHRoZSBhbGlhc2VkIGZ1bmN0aW9uIHdpdGggYXJndW1lbnRzXCIsIC0+XG4gICAgICBFeENsYXNzLnJlZ2lzdGVyQWxpYXMoJ1cnLCAnd3JpdGUnKVxuICAgICAgc3B5T24oRXgsICdXJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24oRXgsICd3cml0ZScpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnVycpXG4gICAgICBXQXJncyA9IEV4LlcuY2FsbHNbMF0uYXJnc1swXVxuICAgICAgd3JpdGVBcmdzID0gRXgud3JpdGUuY2FsbHNbMF0uYXJnc1swXVxuICAgICAgZXhwZWN0KFdBcmdzKS50b0JlIHdyaXRlQXJnc1xuXG4gIGRlc2NyaWJlIFwid2l0aCBzZWxlY3Rpb25zXCIsIC0+XG4gICAgaXQgXCJleGVjdXRlcyBvbiB0aGUgc2VsZWN0ZWQgcmFuZ2VcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAncycpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuICAgICAgZWRpdG9yLnNlbGVjdFRvQnVmZmVyUG9zaXRpb24oWzIsIDFdKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCInPCwnPnMvYWJjL2RlZlwiKVxuICAgICAgZXhwZWN0KEV4LnMuY2FsbHNbMF0uYXJnc1swXS5yYW5nZSkudG9FcXVhbCBbMCwgMl1cblxuICAgIGl0IFwiY2FsbHMgdGhlIGZ1bmN0aW9ucyBtdWx0aXBsZSB0aW1lcyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgc2VsZWN0aW9uc1wiLCAtPlxuICAgICAgc3B5T24oRXgsICdzJylcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgICBlZGl0b3Iuc2VsZWN0VG9CdWZmZXJQb3NpdGlvbihbMiwgMV0pXG4gICAgICBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihbMywgMF0pXG4gICAgICBlZGl0b3Iuc2VsZWN0VG9CdWZmZXJQb3NpdGlvbihbMywgMl0pXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIic8LCc+cy9hYmMvZGVmXCIpXG4gICAgICBjYWxscyA9IEV4LnMuY2FsbHNcbiAgICAgIGV4cGVjdChjYWxscy5sZW5ndGgpLnRvRXF1YWwgMlxuICAgICAgZXhwZWN0KGNhbGxzWzBdLmFyZ3NbMF0ucmFuZ2UpLnRvRXF1YWwgWzAsIDJdXG4gICAgICBleHBlY3QoY2FsbHNbMV0uYXJnc1swXS5yYW5nZSkudG9FcXVhbCBbMywgM11cbiJdfQ==
