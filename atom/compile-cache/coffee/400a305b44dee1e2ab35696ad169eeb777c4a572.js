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
    var dir, dir2, editor, editorElement, exState, keydown, normalModeInputKeydown, projectPath, submitNormalModeInputText, vimState, _ref;
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
    describe(":wall", function() {
      return it("saves all", function() {
        spyOn(atom.workspace, 'saveAll');
        keydown(':');
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
          keydown(':');
          submitNormalModeInputText('saveas');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('saveas-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          keydown(':');
          submitNormalModeInputText('saveas');
          expect(fs.existsSync(filePath)).toBe(true);
          return expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          keydown(':');
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
          keydown(':');
          submitNormalModeInputText('saveas');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Argument required');
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
          keydown(':');
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
            keydown(':');
            submitNormalModeInputText("saveas " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :saveas!", function() {
            keydown(':');
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
    describe(":quitall", function() {
      return it("closes Atom", function() {
        spyOn(atom, 'close');
        keydown(':');
        submitNormalModeInputText('quitall');
        return expect(atom.close).toHaveBeenCalled();
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
        expect(Ex.write.calls[0].args[0].args.trim()).toEqual('wq-2');
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
    describe(":wqall", function() {
      return it("calls :wall, then :quitall", function() {
        spyOn(Ex, 'wall');
        spyOn(Ex, 'quitall');
        keydown(':');
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
      describe("illegal delimiters", function() {
        var test;
        test = function(delim) {
          keydown(':');
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
          keydown(':');
          submitNormalModeInputText(":substitute/abc//");
          return expect(editor.getText()).toEqual('abc\nabcabc');
        });
        return it("removes the pattern with modifiers", function() {
          keydown(':');
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
          keydown(':');
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
            keydown(':');
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            keydown(':');
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is on and the pattern is lowercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            keydown(':');
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("uses case sensitive search if smartcase is on and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            keydown(':');
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
            keydown(':');
            submitNormalModeInputText(':substitute/abc\\c/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("doesn't matter where in the pattern \\c is", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            keydown(':');
            submitNormalModeInputText(':substitute/a\\cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is on, \\C is in the pattern and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            keydown(':');
            submitNormalModeInputText(':substitute/a\\Cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\C comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            keydown(':');
            submitNormalModeInputText(':substitute/a\\Cb\\cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\c comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            keydown(':');
            submitNormalModeInputText(':substitute/a\\cb\\Cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("overrides an appended /i flag with \\C", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            keydown(':');
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
    describe(":set", function() {
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
    return describe("aliases", function() {
      it("calls the aliased function without arguments", function() {
        ExClass.registerAlias('W', 'w');
        spyOn(Ex, 'write');
        keydown(':');
        submitNormalModeInputText('W');
        return expect(Ex.write).toHaveBeenCalled();
      });
      return it("calls the aliased function with arguments", function() {
        var WArgs, writeArgs;
        ExClass.registerAlias('W', 'write');
        spyOn(Ex, 'W').andCallThrough();
        spyOn(Ex, 'write');
        keydown(':');
        submitNormalModeInputText('W');
        WArgs = Ex.W.calls[0].args[0];
        writeArgs = Ex.write.calls[0].args[0];
        return expect(WArgs).toBe(writeArgs);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvZXgtY29tbWFuZHMtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0NBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVIsQ0FIUCxDQUFBOztBQUFBLEVBSUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSLENBSlYsQ0FBQTs7QUFBQSxFQU1BLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUixDQU5WLENBQUE7O0FBQUEsRUFPQSxFQUFBLEdBQUssT0FBTyxDQUFDLFNBQVIsQ0FBQSxDQVBMLENBQUE7O0FBQUEsRUFTQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsUUFBQSxrSUFBQTtBQUFBLElBQUEsT0FBd0QsRUFBeEQsRUFBQyxnQkFBRCxFQUFTLHVCQUFULEVBQXdCLGtCQUF4QixFQUFrQyxpQkFBbEMsRUFBMkMsYUFBM0MsRUFBZ0QsY0FBaEQsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLFNBQUMsUUFBRCxHQUFBO2FBQWMsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQWUsUUFBZixFQUFkO0lBQUEsQ0FEZCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxlQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLFVB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/spec/ex-commands-spec.coffee
