(function() {
  var Base, CSON, Delegato, Input, OperationAbortedError, VMP_LOADED_FILES, VMP_LOADING_FILE, __plus, _plus, getEditorState, loadVmpOperationFile, path, ref, selectList, settings, vimStateMethods,
    slice = [].slice,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  __plus = null;

  _plus = function() {
    return __plus != null ? __plus : __plus = require('underscore-plus');
  };

  Delegato = require('delegato');

  settings = require('./settings');

  ref = [], CSON = ref[0], path = ref[1], Input = ref[2], selectList = ref[3], getEditorState = ref[4];

  VMP_LOADING_FILE = null;

  VMP_LOADED_FILES = [];

  loadVmpOperationFile = function(filename) {
    var loaded;
    VMP_LOADING_FILE = filename;
    loaded = require(filename);
    VMP_LOADING_FILE = null;
    VMP_LOADED_FILES.push(filename);
    return loaded;
  };

  OperationAbortedError = null;

  vimStateMethods = ["onDidChangeSearch", "onDidConfirmSearch", "onDidCancelSearch", "onDidCommandSearch", "onDidSetTarget", "emitDidSetTarget", "onWillSelectTarget", "emitWillSelectTarget", "onDidSelectTarget", "emitDidSelectTarget", "onDidFailSelectTarget", "emitDidFailSelectTarget", "onWillFinishMutation", "emitWillFinishMutation", "onDidFinishMutation", "emitDidFinishMutation", "onDidFinishOperation", "onDidResetOperationStack", "onDidSetOperatorModifier", "onWillActivateMode", "onDidActivateMode", "preemptWillDeactivateMode", "onWillDeactivateMode", "onDidDeactivateMode", "onDidCancelSelectList", "subscribe", "isMode", "getBlockwiseSelections", "getLastBlockwiseSelection", "addToClassList", "getConfig"];

  Base = (function() {
    var classRegistry;

    Delegato.includeInto(Base);

    Base.delegatesMethods.apply(Base, slice.call(vimStateMethods).concat([{
      toProperty: 'vimState'
    }]));

    Base.delegatesProperty('mode', 'submode', 'swrap', 'utils', {
      toProperty: 'vimState'
    });

    function Base(vimState1, properties) {
      var ref1;
      this.vimState = vimState1;
      if (properties == null) {
        properties = null;
      }
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement, this.globalState = ref1.globalState, this.swrap = ref1.swrap;
      this.name = this.constructor.name;
      if (properties != null) {
        Object.assign(this, properties);
      }
    }

    Base.prototype.initialize = function() {};

    Base.prototype.isComplete = function() {
      var ref1;
      if (this.requireInput && (this.input == null)) {
        return false;
      } else if (this.requireTarget) {
        return (ref1 = this.target) != null ? typeof ref1.isComplete === "function" ? ref1.isComplete() : void 0 : void 0;
      } else {
        return true;
      }
    };

    Base.prototype.requireTarget = false;

    Base.prototype.requireInput = false;

    Base.prototype.recordable = false;

    Base.prototype.repeated = false;

    Base.prototype.target = null;

    Base.prototype.operator = null;

    Base.prototype.isAsTargetExceptSelect = function() {
      return (this.operator != null) && !this.operator["instanceof"]('Select');
    };

    Base.prototype.abort = function() {
      if (OperationAbortedError == null) {
        OperationAbortedError = require('./errors');
      }
      throw new OperationAbortedError('aborted');
    };

    Base.prototype.count = null;

    Base.prototype.defaultCount = 1;

    Base.prototype.getCount = function(offset) {
      var ref1;
      if (offset == null) {
        offset = 0;
      }
      if (this.count == null) {
        this.count = (ref1 = this.vimState.getCount()) != null ? ref1 : this.defaultCount;
      }
      return this.count + offset;
    };

    Base.prototype.resetCount = function() {
      return this.count = null;
    };

    Base.prototype.isDefaultCount = function() {
      return this.count === this.defaultCount;
    };

    Base.prototype.countTimes = function(last, fn) {
      var count, i, isFinal, ref1, results, stop, stopped;
      if (last < 1) {
        return;
      }
      stopped = false;
      stop = function() {
        return stopped = true;
      };
      results = [];
      for (count = i = 1, ref1 = last; 1 <= ref1 ? i <= ref1 : i >= ref1; count = 1 <= ref1 ? ++i : --i) {
        isFinal = count === last;
        fn({
          count: count,
          isFinal: isFinal,
          stop: stop
        });
        if (stopped) {
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Base.prototype.activateMode = function(mode, submode) {
      return this.onDidFinishOperation((function(_this) {
        return function() {
          return _this.vimState.activate(mode, submode);
        };
      })(this));
    };

    Base.prototype.activateModeIfNecessary = function(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        return this.activateMode(mode, submode);
      }
    };

    Base.prototype["new"] = function(name, properties) {
      var klass;
      klass = Base.getClass(name);
      return new klass(this.vimState, properties);
    };

    Base.prototype.newInputUI = function() {
      if (Input == null) {
        Input = require('./input');
      }
      return new Input(this.vimState);
    };

    Base.prototype.clone = function(vimState) {
      var excludeProperties, key, klass, properties, ref1, value;
      properties = {};
      excludeProperties = ['editor', 'editorElement', 'globalState', 'vimState', 'operator'];
      ref1 = this;
      for (key in ref1) {
        if (!hasProp.call(ref1, key)) continue;
        value = ref1[key];
        if (indexOf.call(excludeProperties, key) < 0) {
          properties[key] = value;
        }
      }
      klass = this.constructor;
      return new klass(vimState, properties);
    };

    Base.prototype.cancelOperation = function() {
      return this.vimState.operationStack.cancel();
    };

    Base.prototype.processOperation = function() {
      return this.vimState.operationStack.process();
    };

    Base.prototype.focusSelectList = function(options) {
      if (options == null) {
        options = {};
      }
      this.onDidCancelSelectList((function(_this) {
        return function() {
          return _this.cancelOperation();
        };
      })(this));
      if (selectList == null) {
        selectList = require('./select-list');
      }
      return selectList.show(this.vimState, options);
    };

    Base.prototype.input = null;

    Base.prototype.focusInput = function(options) {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm((function(_this) {
        return function(input) {
          _this.input = input;
          return _this.processOperation();
        };
      })(this));
      if ((options != null ? options.charsMax : void 0) > 1) {
        inputUI.onDidChange((function(_this) {
          return function(input) {
            return _this.vimState.hover.set(input);
          };
        })(this));
      }
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus(options);
    };

    Base.prototype.getVimEofBufferPosition = function() {
      return this.utils.getVimEofBufferPosition(this.editor);
    };

    Base.prototype.getVimLastBufferRow = function() {
      return this.utils.getVimLastBufferRow(this.editor);
    };

    Base.prototype.getVimLastScreenRow = function() {
      return this.utils.getVimLastScreenRow(this.editor);
    };

    Base.prototype.getWordBufferRangeAndKindAtBufferPosition = function(point, options) {
      return this.utils.getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
    };

    Base.prototype.getFirstCharacterPositionForBufferRow = function(row) {
      return this.utils.getFirstCharacterPositionForBufferRow(this.editor, row);
    };

    Base.prototype.getBufferRangeForRowRange = function(rowRange) {
      return this.utils.getBufferRangeForRowRange(this.editor, rowRange);
    };

    Base.prototype.getIndentLevelForBufferRow = function(row) {
      return this.utils.getIndentLevelForBufferRow(this.editor, row);
    };

    Base.prototype.scanForward = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.utils).scanEditorInDirection.apply(ref1, [this.editor, 'forward'].concat(slice.call(args)));
    };

    Base.prototype.scanBackward = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.utils).scanEditorInDirection.apply(ref1, [this.editor, 'backward'].concat(slice.call(args)));
    };

    Base.prototype["instanceof"] = function(klassName) {
      return this instanceof Base.getClass(klassName);
    };

    Base.prototype.is = function(klassName) {
      return this.constructor === Base.getClass(klassName);
    };

    Base.prototype.isOperator = function() {
      return this.constructor.operationKind === 'operator';
    };

    Base.prototype.isMotion = function() {
      return this.constructor.operationKind === 'motion';
    };

    Base.prototype.isTextObject = function() {
      return this.constructor.operationKind === 'text-object';
    };

    Base.prototype.getCursorBufferPosition = function() {
      if (this.mode === 'visual') {
        return this.getCursorPositionForSelection(this.editor.getLastSelection());
      } else {
        return this.editor.getCursorBufferPosition();
      }
    };

    Base.prototype.getCursorBufferPositions = function() {
      if (this.mode === 'visual') {
        return this.editor.getSelections().map(this.getCursorPositionForSelection.bind(this));
      } else {
        return this.editor.getCursorBufferPositions();
      }
    };

    Base.prototype.getBufferPositionForCursor = function(cursor) {
      if (this.mode === 'visual') {
        return this.getCursorPositionForSelection(cursor.selection);
      } else {
        return cursor.getBufferPosition();
      }
    };

    Base.prototype.getCursorPositionForSelection = function(selection) {
      return this.swrap(selection).getBufferPositionFor('head', {
        from: ['property', 'selection']
      });
    };

    Base.prototype.toString = function() {
      var str;
      str = this.name;
      if (this.target != null) {
        return str += ", target=" + this.target.name + ", target.wise=" + this.target.wise + " ";
      } else if (this.operator != null) {
        return str += ", wise=" + this.wise + " , operator=" + this.operator.name;
      } else {
        return str;
      }
    };

    Base.writeCommandTableOnDisk = function() {
      var _, commandTable, commandTablePath, loadableCSONText;
      commandTable = this.generateCommandTableByEagerLoad();
      _ = _plus();
      if (_.isEqual(this.commandTable, commandTable)) {
        atom.notifications.addInfo("No change commandTable", {
          dismissable: true
        });
        return;
      }
      if (CSON == null) {
        CSON = require('season');
      }
      if (path == null) {
        path = require('path');
      }
      loadableCSONText = "module.exports =\n" + CSON.stringify(commandTable) + "\n";
      commandTablePath = path.join(__dirname, "command-table.coffee");
      return atom.workspace.open(commandTablePath, {
        activateItem: false
      }).then(function(editor) {
        editor.setText(loadableCSONText);
        editor.save();
        editor.destroy();
        return atom.notifications.addInfo("Updated commandTable", {
          dismissable: true
        });
      });
    };

    Base.generateCommandTableByEagerLoad = function() {
      var _, commandTable, file, filesToLoad, i, j, klass, klasses, klassesGroupedByFile, len, len1, ref1;
      filesToLoad = ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './misc-command'];
      filesToLoad.forEach(loadVmpOperationFile);
      _ = _plus();
      klasses = _.values(this.getClassRegistry());
      klassesGroupedByFile = _.groupBy(klasses, function(klass) {
        return klass.VMP_LOADING_FILE;
      });
      commandTable = {};
      for (i = 0, len = filesToLoad.length; i < len; i++) {
        file = filesToLoad[i];
        ref1 = klassesGroupedByFile[file];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          klass = ref1[j];
          commandTable[klass.name] = klass.getSpec();
        }
      }
      return commandTable;
    };

    Base.commandTable = null;

    Base.init = function(_getEditorState) {
      var name, ref1, spec, subscriptions;
      getEditorState = _getEditorState;
      this.commandTable = require('./command-table');
      subscriptions = [];
      ref1 = this.commandTable;
      for (name in ref1) {
        spec = ref1[name];
        if (spec.commandName != null) {
          subscriptions.push(this.registerCommandFromSpec(name, spec));
        }
      }
      return subscriptions;
    };

    classRegistry = {
      Base: Base
    };

    Base.extend = function(command1) {
      this.command = command1 != null ? command1 : true;
      this.VMP_LOADING_FILE = VMP_LOADING_FILE;
      if (this.name in classRegistry) {
        throw new Error("Duplicate constructor " + this.name);
      }
      return classRegistry[this.name] = this;
    };

    Base.getSpec = function() {
      if (this.isCommand()) {
        return {
          file: this.VMP_LOADING_FILE,
          commandName: this.getCommandName(),
          commandScope: this.getCommandScope()
        };
      } else {
        return {
          file: this.VMP_LOADING_FILE
        };
      }
    };

    Base.getClass = function(name) {
      var fileToLoad, klass;
      if ((klass = classRegistry[name])) {
        return klass;
      }
      fileToLoad = this.commandTable[name].file;
      if (indexOf.call(VMP_LOADED_FILES, fileToLoad) < 0) {
        if (atom.inDevMode() && settings.get('debug')) {
          console.log("lazy-require: " + fileToLoad + " for " + name);
        }
        loadVmpOperationFile(fileToLoad);
        if ((klass = classRegistry[name])) {
          return klass;
        }
      }
      throw new Error("class '" + name + "' not found");
    };

    Base.getClassRegistry = function() {
      return classRegistry;
    };

    Base.isCommand = function() {
      return this.command;
    };

    Base.commandPrefix = 'vim-mode-plus';

    Base.getCommandName = function() {
      return this.commandPrefix + ':' + _plus().dasherize(this.name);
    };

    Base.getCommandNameWithoutPrefix = function() {
      return _plus().dasherize(this.name);
    };

    Base.commandScope = 'atom-text-editor';

    Base.getCommandScope = function() {
      return this.commandScope;
    };

    Base.getDesctiption = function() {
      if (this.hasOwnProperty("description")) {
        return this.description;
      } else {
        return null;
      }
    };

    Base.registerCommand = function() {
      var klass;
      klass = this;
      return atom.commands.add(this.getCommandScope(), this.getCommandName(), function(event) {
        var ref1, vimState;
        vimState = (ref1 = getEditorState(this.getModel())) != null ? ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          vimState.operationStack.run(klass);
        }
        return event.stopPropagation();
      });
    };

    Base.registerCommandFromSpec = function(name, spec) {
      var commandName, commandPrefix, commandScope, getClass;
      commandScope = spec.commandScope, commandPrefix = spec.commandPrefix, commandName = spec.commandName, getClass = spec.getClass;
      if (commandScope == null) {
        commandScope = 'atom-text-editor';
      }
      if (commandName == null) {
        commandName = (commandPrefix != null ? commandPrefix : 'vim-mode-plus') + ':' + _plus().dasherize(name);
      }
      return atom.commands.add(commandScope, commandName, function(event) {
        var ref1, vimState;
        vimState = (ref1 = getEditorState(this.getModel())) != null ? ref1 : getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState != null) {
          if (getClass != null) {
            vimState.operationStack.run(getClass(name));
          } else {
            vimState.operationStack.run(name);
          }
        }
        return event.stopPropagation();
      });
    };

    Base.operationKind = null;

    Base.getKindForCommandName = function(command) {
      var _, name;
      _ = _plus();
      name = _.capitalize(_.camelize(command));
      if (name in classRegistry) {
        return classRegistry[name].operationKind;
      }
    };

    return Base;

  })();

  module.exports = Base;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUEsNkxBQUE7SUFBQTs7OztFQUFBLE1BQUEsR0FBUzs7RUFDVCxLQUFBLEdBQVEsU0FBQTs0QkFDTixTQUFBLFNBQVUsT0FBQSxDQUFRLGlCQUFSO0VBREo7O0VBR1IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxNQU1JLEVBTkosRUFDRSxhQURGLEVBRUUsYUFGRixFQUdFLGNBSEYsRUFJRSxtQkFKRixFQUtFOztFQUdGLGdCQUFBLEdBQW1COztFQUNuQixnQkFBQSxHQUFtQjs7RUFFbkIsb0JBQUEsR0FBdUIsU0FBQyxRQUFEO0FBQ3JCLFFBQUE7SUFBQSxnQkFBQSxHQUFtQjtJQUNuQixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7SUFDVCxnQkFBQSxHQUFtQjtJQUNuQixnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQixRQUF0QjtXQUNBO0VBTHFCOztFQU92QixxQkFBQSxHQUF3Qjs7RUFFeEIsZUFBQSxHQUFrQixDQUNoQixtQkFEZ0IsRUFFaEIsb0JBRmdCLEVBR2hCLG1CQUhnQixFQUloQixvQkFKZ0IsRUFPaEIsZ0JBUGdCLEVBT0Usa0JBUEYsRUFRZCxvQkFSYyxFQVFRLHNCQVJSLEVBU2QsbUJBVGMsRUFTTyxxQkFUUCxFQVVkLHVCQVZjLEVBVVcseUJBVlgsRUFZZCxzQkFaYyxFQVlVLHdCQVpWLEVBYWQscUJBYmMsRUFhUyx1QkFiVCxFQWNoQixzQkFkZ0IsRUFlaEIsMEJBZmdCLEVBaUJoQiwwQkFqQmdCLEVBbUJoQixvQkFuQmdCLEVBb0JoQixtQkFwQmdCLEVBcUJoQiwyQkFyQmdCLEVBc0JoQixzQkF0QmdCLEVBdUJoQixxQkF2QmdCLEVBeUJoQix1QkF6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QUFhLENBQUMsQ0FBQyxRQUFGLENBQVcsT0FBWCxDQUFiO01BQ1AsSUFBRyxJQUFBLElBQVEsYUFBWDtlQUNFLGFBQWMsQ0FBQSxJQUFBLENBQUssQ0FBQyxjQUR0Qjs7SUFIc0I7Ozs7OztFQU0xQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXpYakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIFRvIGF2b2lkIGxvYWRpbmcgdW5kZXJzY29yZS1wbHVzIGFuZCBkZXBlbmRpbmcgdW5kZXJzY29yZSBvbiBzdGFydHVwXG5fX3BsdXMgPSBudWxsXG5fcGx1cyA9IC0+XG4gIF9fcGx1cyA/PSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbkRlbGVnYXRvID0gcmVxdWlyZSAnZGVsZWdhdG8nXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbltcbiAgQ1NPTlxuICBwYXRoXG4gIElucHV0XG4gIHNlbGVjdExpc3RcbiAgZ2V0RWRpdG9yU3RhdGUgICMgc2V0IGJ5IEJhc2UuaW5pdCgpXG5dID0gW10gIyBzZXQgbnVsbFxuXG5WTVBfTE9BRElOR19GSUxFID0gbnVsbFxuVk1QX0xPQURFRF9GSUxFUyA9IFtdXG5cbmxvYWRWbXBPcGVyYXRpb25GaWxlID0gKGZpbGVuYW1lKSAtPlxuICBWTVBfTE9BRElOR19GSUxFID0gZmlsZW5hbWVcbiAgbG9hZGVkID0gcmVxdWlyZShmaWxlbmFtZSlcbiAgVk1QX0xPQURJTkdfRklMRSA9IG51bGxcbiAgVk1QX0xPQURFRF9GSUxFUy5wdXNoKGZpbGVuYW1lKVxuICBsb2FkZWRcblxuT3BlcmF0aW9uQWJvcnRlZEVycm9yID0gbnVsbFxuXG52aW1TdGF0ZU1ldGhvZHMgPSBbXG4gIFwib25EaWRDaGFuZ2VTZWFyY2hcIlxuICBcIm9uRGlkQ29uZmlybVNlYXJjaFwiXG4gIFwib25EaWRDYW5jZWxTZWFyY2hcIlxuICBcIm9uRGlkQ29tbWFuZFNlYXJjaFwiXG5cbiAgIyBMaWZlIGN5Y2xlIG9mIG9wZXJhdGlvblN0YWNrXG4gIFwib25EaWRTZXRUYXJnZXRcIiwgXCJlbWl0RGlkU2V0VGFyZ2V0XCJcbiAgICBcIm9uV2lsbFNlbGVjdFRhcmdldFwiLCBcImVtaXRXaWxsU2VsZWN0VGFyZ2V0XCJcbiAgICBcIm9uRGlkU2VsZWN0VGFyZ2V0XCIsIFwiZW1pdERpZFNlbGVjdFRhcmdldFwiXG4gICAgXCJvbkRpZEZhaWxTZWxlY3RUYXJnZXRcIiwgXCJlbWl0RGlkRmFpbFNlbGVjdFRhcmdldFwiXG5cbiAgICBcIm9uV2lsbEZpbmlzaE11dGF0aW9uXCIsIFwiZW1pdFdpbGxGaW5pc2hNdXRhdGlvblwiXG4gICAgXCJvbkRpZEZpbmlzaE11dGF0aW9uXCIsIFwiZW1pdERpZEZpbmlzaE11dGF0aW9uXCJcbiAgXCJvbkRpZEZpbmlzaE9wZXJhdGlvblwiXG4gIFwib25EaWRSZXNldE9wZXJhdGlvblN0YWNrXCJcblxuICBcIm9uRGlkU2V0T3BlcmF0b3JNb2RpZmllclwiXG5cbiAgXCJvbldpbGxBY3RpdmF0ZU1vZGVcIlxuICBcIm9uRGlkQWN0aXZhdGVNb2RlXCJcbiAgXCJwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlXCJcbiAgXCJvbldpbGxEZWFjdGl2YXRlTW9kZVwiXG4gIFwib25EaWREZWFjdGl2YXRlTW9kZVwiXG5cbiAgXCJvbkRpZENhbmNlbFNlbGVjdExpc3RcIlxuICBcInN1YnNjcmliZVwiXG4gIFwiaXNNb2RlXCJcbiAgXCJnZXRCbG9ja3dpc2VTZWxlY3Rpb25zXCJcbiAgXCJnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uXCJcbiAgXCJhZGRUb0NsYXNzTGlzdFwiXG4gIFwiZ2V0Q29uZmlnXCJcbl1cblxuY2xhc3MgQmFzZVxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzTWV0aG9kcyh2aW1TdGF0ZU1ldGhvZHMuLi4sIHRvUHJvcGVydHk6ICd2aW1TdGF0ZScpXG4gIEBkZWxlZ2F0ZXNQcm9wZXJ0eSgnbW9kZScsICdzdWJtb2RlJywgJ3N3cmFwJywgJ3V0aWxzJywgdG9Qcm9wZXJ0eTogJ3ZpbVN0YXRlJylcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgcHJvcGVydGllcz1udWxsKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQGdsb2JhbFN0YXRlLCBAc3dyYXB9ID0gQHZpbVN0YXRlXG4gICAgQG5hbWUgPSBAY29uc3RydWN0b3IubmFtZVxuICAgIE9iamVjdC5hc3NpZ24odGhpcywgcHJvcGVydGllcykgaWYgcHJvcGVydGllcz9cblxuICAjIFRvIG92ZXJyaWRlXG4gIGluaXRpYWxpemU6IC0+XG5cbiAgIyBPcGVyYXRpb24gcHJvY2Vzc29yIGV4ZWN1dGUgb25seSB3aGVuIGlzQ29tcGxldGUoKSByZXR1cm4gdHJ1ZS5cbiAgIyBJZiBmYWxzZSwgb3BlcmF0aW9uIHByb2Nlc3NvciBwb3N0cG9uZSBpdHMgZXhlY3V0aW9uLlxuICBpc0NvbXBsZXRlOiAtPlxuICAgIGlmIEByZXF1aXJlSW5wdXQgYW5kIG5vdCBAaW5wdXQ/XG4gICAgICBmYWxzZVxuICAgIGVsc2UgaWYgQHJlcXVpcmVUYXJnZXRcbiAgICAgICMgV2hlbiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBpbiBCYXNlOjpjb25zdHJ1Y3RvclxuICAgICAgIyB0YWdlcnQgaXMgc3RpbGwgc3RyaW5nIGxpa2UgYE1vdmVUb1JpZ2h0YCwgaW4gdGhpcyBjYXNlIGlzQ29tcGxldGVcbiAgICAgICMgaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgIEB0YXJnZXQ/LmlzQ29tcGxldGU/KClcbiAgICBlbHNlXG4gICAgICB0cnVlXG5cbiAgcmVxdWlyZVRhcmdldDogZmFsc2VcbiAgcmVxdWlyZUlucHV0OiBmYWxzZVxuICByZWNvcmRhYmxlOiBmYWxzZVxuICByZXBlYXRlZDogZmFsc2VcbiAgdGFyZ2V0OiBudWxsICMgU2V0IGluIE9wZXJhdG9yXG4gIG9wZXJhdG9yOiBudWxsICMgU2V0IGluIG9wZXJhdG9yJ3MgdGFyZ2V0KCBNb3Rpb24gb3IgVGV4dE9iamVjdCApXG4gIGlzQXNUYXJnZXRFeGNlcHRTZWxlY3Q6IC0+XG4gICAgQG9wZXJhdG9yPyBhbmQgbm90IEBvcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3QnKVxuXG4gIGFib3J0OiAtPlxuICAgIE9wZXJhdGlvbkFib3J0ZWRFcnJvciA/PSByZXF1aXJlICcuL2Vycm9ycydcbiAgICB0aHJvdyBuZXcgT3BlcmF0aW9uQWJvcnRlZEVycm9yKCdhYm9ydGVkJylcblxuICAjIENvdW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb3VudDogbnVsbFxuICBkZWZhdWx0Q291bnQ6IDFcbiAgZ2V0Q291bnQ6IChvZmZzZXQ9MCkgLT5cbiAgICBAY291bnQgPz0gQHZpbVN0YXRlLmdldENvdW50KCkgPyBAZGVmYXVsdENvdW50XG4gICAgQGNvdW50ICsgb2Zmc2V0XG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSBudWxsXG5cbiAgaXNEZWZhdWx0Q291bnQ6IC0+XG4gICAgQGNvdW50IGlzIEBkZWZhdWx0Q291bnRcblxuICAjIE1pc2NcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvdW50VGltZXM6IChsYXN0LCBmbikgLT5cbiAgICByZXR1cm4gaWYgbGFzdCA8IDFcblxuICAgIHN0b3BwZWQgPSBmYWxzZVxuICAgIHN0b3AgPSAtPiBzdG9wcGVkID0gdHJ1ZVxuICAgIGZvciBjb3VudCBpbiBbMS4ubGFzdF1cbiAgICAgIGlzRmluYWwgPSBjb3VudCBpcyBsYXN0XG4gICAgICBmbih7Y291bnQsIGlzRmluYWwsIHN0b3B9KVxuICAgICAgYnJlYWsgaWYgc3RvcHBlZFxuXG4gIGFjdGl2YXRlTW9kZTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgQG9uRGlkRmluaXNoT3BlcmF0aW9uID0+XG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSlcblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgdW5sZXNzIEB2aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSlcbiAgICAgIEBhY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSlcblxuICBuZXc6IChuYW1lLCBwcm9wZXJ0aWVzKSAtPlxuICAgIGtsYXNzID0gQmFzZS5nZXRDbGFzcyhuYW1lKVxuICAgIG5ldyBrbGFzcyhAdmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgbmV3SW5wdXRVSTogLT5cbiAgICBJbnB1dCA/PSByZXF1aXJlICcuL2lucHV0J1xuICAgIG5ldyBJbnB1dChAdmltU3RhdGUpXG5cbiAgIyBGSVhNRTogVGhpcyBpcyB1c2VkIHRvIGNsb25lIE1vdGlvbjo6U2VhcmNoIHRvIHN1cHBvcnQgYG5gIGFuZCBgTmBcbiAgIyBCdXQgbWFudWFsIHJlc2V0aW5nIGFuZCBvdmVycmlkaW5nIHByb3BlcnR5IGlzIGJ1ZyBwcm9uZS5cbiAgIyBTaG91bGQgZXh0cmFjdCBhcyBzZWFyY2ggc3BlYyBvYmplY3QgYW5kIHVzZSBpdCBieVxuICAjIGNyZWF0aW5nIGNsZWFuIGluc3RhbmNlIG9mIFNlYXJjaC5cbiAgY2xvbmU6ICh2aW1TdGF0ZSkgLT5cbiAgICBwcm9wZXJ0aWVzID0ge31cbiAgICBleGNsdWRlUHJvcGVydGllcyA9IFsnZWRpdG9yJywgJ2VkaXRvckVsZW1lbnQnLCAnZ2xvYmFsU3RhdGUnLCAndmltU3RhdGUnLCAnb3BlcmF0b3InXVxuICAgIGZvciBvd24ga2V5LCB2YWx1ZSBvZiB0aGlzIHdoZW4ga2V5IG5vdCBpbiBleGNsdWRlUHJvcGVydGllc1xuICAgICAgcHJvcGVydGllc1trZXldID0gdmFsdWVcbiAgICBrbGFzcyA9IHRoaXMuY29uc3RydWN0b3JcbiAgICBuZXcga2xhc3ModmltU3RhdGUsIHByb3BlcnRpZXMpXG5cbiAgY2FuY2VsT3BlcmF0aW9uOiAtPlxuICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwoKVxuXG4gIHByb2Nlc3NPcGVyYXRpb246IC0+XG4gICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnByb2Nlc3MoKVxuXG4gIGZvY3VzU2VsZWN0TGlzdDogKG9wdGlvbnM9e30pIC0+XG4gICAgQG9uRGlkQ2FuY2VsU2VsZWN0TGlzdCA9PlxuICAgICAgQGNhbmNlbE9wZXJhdGlvbigpXG4gICAgc2VsZWN0TGlzdCA/PSByZXF1aXJlICcuL3NlbGVjdC1saXN0J1xuICAgIHNlbGVjdExpc3Quc2hvdyhAdmltU3RhdGUsIG9wdGlvbnMpXG5cbiAgaW5wdXQ6IG51bGxcbiAgZm9jdXNJbnB1dDogKG9wdGlvbnMpIC0+XG4gICAgaW5wdXRVSSA9IEBuZXdJbnB1dFVJKClcbiAgICBpbnB1dFVJLm9uRGlkQ29uZmlybSAoaW5wdXQpID0+XG4gICAgICBAaW5wdXQgPSBpbnB1dFxuICAgICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gICAgaWYgb3B0aW9ucz8uY2hhcnNNYXggPiAxXG4gICAgICBpbnB1dFVJLm9uRGlkQ2hhbmdlIChpbnB1dCkgPT5cbiAgICAgICAgQHZpbVN0YXRlLmhvdmVyLnNldChpbnB1dClcblxuICAgIGlucHV0VUkub25EaWRDYW5jZWwoQGNhbmNlbE9wZXJhdGlvbi5iaW5kKHRoaXMpKVxuICAgIGlucHV0VUkuZm9jdXMob3B0aW9ucylcblxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAdXRpbHMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICBnZXRWaW1MYXN0QnVmZmVyUm93OiAtPlxuICAgIEB1dGlscy5nZXRWaW1MYXN0QnVmZmVyUm93KEBlZGl0b3IpXG5cbiAgZ2V0VmltTGFzdFNjcmVlblJvdzogLT5cbiAgICBAdXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyhAZWRpdG9yKVxuXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uOiAocG9pbnQsIG9wdGlvbnMpIC0+XG4gICAgQHV0aWxzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3c6IChyb3cpIC0+XG4gICAgQHV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICBAdXRpbHMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSlcblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdzogKHJvdykgLT5cbiAgICBAdXRpbHMuZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KVxuXG4gIHNjYW5Gb3J3YXJkOiAoYXJncy4uLikgLT5cbiAgICBAdXRpbHMuc2NhbkVkaXRvckluRGlyZWN0aW9uKEBlZGl0b3IsICdmb3J3YXJkJywgYXJncy4uLilcblxuICBzY2FuQmFja3dhcmQ6IChhcmdzLi4uKSAtPlxuICAgIEB1dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24oQGVkaXRvciwgJ2JhY2t3YXJkJywgYXJncy4uLilcblxuICBpbnN0YW5jZW9mOiAoa2xhc3NOYW1lKSAtPlxuICAgIHRoaXMgaW5zdGFuY2VvZiBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcblxuICBpczogKGtsYXNzTmFtZSkgLT5cbiAgICB0aGlzLmNvbnN0cnVjdG9yIGlzIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuXG4gIGlzT3BlcmF0b3I6IC0+XG4gICAgQGNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgaXMgJ29wZXJhdG9yJ1xuXG4gIGlzTW90aW9uOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kIGlzICdtb3Rpb24nXG5cbiAgaXNUZXh0T2JqZWN0OiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kIGlzICd0ZXh0LW9iamVjdCdcblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uczogLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkubWFwKEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbi5iaW5kKHRoaXMpKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgZWxzZVxuICAgICAgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG5cbiAgdG9TdHJpbmc6IC0+XG4gICAgc3RyID0gQG5hbWVcbiAgICBpZiBAdGFyZ2V0P1xuICAgICAgc3RyICs9IFwiLCB0YXJnZXQ9I3tAdGFyZ2V0Lm5hbWV9LCB0YXJnZXQud2lzZT0je0B0YXJnZXQud2lzZX0gXCJcbiAgICBlbHNlIGlmIEBvcGVyYXRvcj9cbiAgICAgIHN0ciArPSBcIiwgd2lzZT0je0B3aXNlfSAsIG9wZXJhdG9yPSN7QG9wZXJhdG9yLm5hbWV9XCJcbiAgICBlbHNlXG4gICAgICBzdHJcblxuICAjIENsYXNzIG1ldGhvZHNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEB3cml0ZUNvbW1hbmRUYWJsZU9uRGlzazogLT5cbiAgICBjb21tYW5kVGFibGUgPSBAZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpXG4gICAgXyA9IF9wbHVzKClcbiAgICBpZiBfLmlzRXF1YWwoQGNvbW1hbmRUYWJsZSwgY29tbWFuZFRhYmxlKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBjaGFuZ2UgY29tbWFuZFRhYmxlXCIsIGRpc21pc3NhYmxlOiB0cnVlKVxuICAgICAgcmV0dXJuXG5cbiAgICBDU09OID89IHJlcXVpcmUgJ3NlYXNvbidcbiAgICBwYXRoID89IHJlcXVpcmUoJ3BhdGgnKVxuXG4gICAgbG9hZGFibGVDU09OVGV4dCA9IFwibW9kdWxlLmV4cG9ydHMgPVxcblwiICsgQ1NPTi5zdHJpbmdpZnkoY29tbWFuZFRhYmxlKSArIFwiXFxuXCJcbiAgICBjb21tYW5kVGFibGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgXCJjb21tYW5kLXRhYmxlLmNvZmZlZVwiKVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oY29tbWFuZFRhYmxlUGF0aCwgYWN0aXZhdGVJdGVtOiBmYWxzZSkudGhlbiAoZWRpdG9yKSAtPlxuICAgICAgZWRpdG9yLnNldFRleHQobG9hZGFibGVDU09OVGV4dClcbiAgICAgIGVkaXRvci5zYXZlKClcbiAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiVXBkYXRlZCBjb21tYW5kVGFibGVcIiwgZGlzbWlzc2FibGU6IHRydWUpXG5cbiAgQGdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQ6IC0+XG4gICAgIyBOT1RFOiBjaGFuZ2luZyBvcmRlciBhZmZlY3RzIG91dHB1dCBvZiBsaWIvY29tbWFuZC10YWJsZS5jb2ZmZWVcbiAgICBmaWxlc1RvTG9hZCA9IFtcbiAgICAgICcuL29wZXJhdG9yJywgJy4vb3BlcmF0b3ItaW5zZXJ0JywgJy4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZycsXG4gICAgICAnLi9tb3Rpb24nLCAnLi9tb3Rpb24tc2VhcmNoJywgJy4vdGV4dC1vYmplY3QnLCAnLi9taXNjLWNvbW1hbmQnXG4gICAgXVxuICAgIGZpbGVzVG9Mb2FkLmZvckVhY2gobG9hZFZtcE9wZXJhdGlvbkZpbGUpXG4gICAgXyA9IF9wbHVzKClcbiAgICBrbGFzc2VzID0gXy52YWx1ZXMoQGdldENsYXNzUmVnaXN0cnkoKSlcbiAgICBrbGFzc2VzR3JvdXBlZEJ5RmlsZSA9IF8uZ3JvdXBCeShrbGFzc2VzLCAoa2xhc3MpIC0+IGtsYXNzLlZNUF9MT0FESU5HX0ZJTEUpXG5cbiAgICBjb21tYW5kVGFibGUgPSB7fVxuICAgIGZvciBmaWxlIGluIGZpbGVzVG9Mb2FkXG4gICAgICBmb3Iga2xhc3MgaW4ga2xhc3Nlc0dyb3VwZWRCeUZpbGVbZmlsZV1cbiAgICAgICAgY29tbWFuZFRhYmxlW2tsYXNzLm5hbWVdID0ga2xhc3MuZ2V0U3BlYygpXG4gICAgY29tbWFuZFRhYmxlXG5cbiAgQGNvbW1hbmRUYWJsZTogbnVsbFxuICBAaW5pdDogKF9nZXRFZGl0b3JTdGF0ZSkgLT5cbiAgICBnZXRFZGl0b3JTdGF0ZSA9IF9nZXRFZGl0b3JTdGF0ZVxuICAgIEBjb21tYW5kVGFibGUgPSByZXF1aXJlKCcuL2NvbW1hbmQtdGFibGUnKVxuICAgIHN1YnNjcmlwdGlvbnMgPSBbXVxuICAgIGZvciBuYW1lLCBzcGVjIG9mIEBjb21tYW5kVGFibGUgd2hlbiBzcGVjLmNvbW1hbmROYW1lP1xuICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKEByZWdpc3RlckNvbW1hbmRGcm9tU3BlYyhuYW1lLCBzcGVjKSlcbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uc1xuXG4gIGNsYXNzUmVnaXN0cnkgPSB7QmFzZX1cbiAgQGV4dGVuZDogKEBjb21tYW5kPXRydWUpIC0+XG4gICAgQFZNUF9MT0FESU5HX0ZJTEUgPSBWTVBfTE9BRElOR19GSUxFXG4gICAgaWYgQG5hbWUgb2YgY2xhc3NSZWdpc3RyeVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlIGNvbnN0cnVjdG9yICN7QG5hbWV9XCIpXG4gICAgY2xhc3NSZWdpc3RyeVtAbmFtZV0gPSB0aGlzXG5cbiAgQGdldFNwZWM6IC0+XG4gICAgaWYgQGlzQ29tbWFuZCgpXG4gICAgICBmaWxlOiBAVk1QX0xPQURJTkdfRklMRVxuICAgICAgY29tbWFuZE5hbWU6IEBnZXRDb21tYW5kTmFtZSgpXG4gICAgICBjb21tYW5kU2NvcGU6IEBnZXRDb21tYW5kU2NvcGUoKVxuICAgIGVsc2VcbiAgICAgIGZpbGU6IEBWTVBfTE9BRElOR19GSUxFXG5cbiAgQGdldENsYXNzOiAobmFtZSkgLT5cbiAgICByZXR1cm4ga2xhc3MgaWYgKGtsYXNzID0gY2xhc3NSZWdpc3RyeVtuYW1lXSlcblxuICAgIGZpbGVUb0xvYWQgPSBAY29tbWFuZFRhYmxlW25hbWVdLmZpbGVcbiAgICBpZiBmaWxlVG9Mb2FkIG5vdCBpbiBWTVBfTE9BREVEX0ZJTEVTXG4gICAgICBpZiBhdG9tLmluRGV2TW9kZSgpIGFuZCBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcbiAgICAgICAgY29uc29sZS5sb2cgXCJsYXp5LXJlcXVpcmU6ICN7ZmlsZVRvTG9hZH0gZm9yICN7bmFtZX1cIlxuICAgICAgbG9hZFZtcE9wZXJhdGlvbkZpbGUoZmlsZVRvTG9hZClcbiAgICAgIHJldHVybiBrbGFzcyBpZiAoa2xhc3MgPSBjbGFzc1JlZ2lzdHJ5W25hbWVdKVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiY2xhc3MgJyN7bmFtZX0nIG5vdCBmb3VuZFwiKVxuXG4gIEBnZXRDbGFzc1JlZ2lzdHJ5OiAtPlxuICAgIGNsYXNzUmVnaXN0cnlcblxuICBAaXNDb21tYW5kOiAtPlxuICAgIEBjb21tYW5kXG5cbiAgQGNvbW1hbmRQcmVmaXg6ICd2aW0tbW9kZS1wbHVzJ1xuICBAZ2V0Q29tbWFuZE5hbWU6IC0+XG4gICAgQGNvbW1hbmRQcmVmaXggKyAnOicgKyBfcGx1cygpLmRhc2hlcml6ZShAbmFtZSlcblxuICBAZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4OiAtPlxuICAgIF9wbHVzKCkuZGFzaGVyaXplKEBuYW1lKVxuXG4gIEBjb21tYW5kU2NvcGU6ICdhdG9tLXRleHQtZWRpdG9yJ1xuICBAZ2V0Q29tbWFuZFNjb3BlOiAtPlxuICAgIEBjb21tYW5kU2NvcGVcblxuICBAZ2V0RGVzY3RpcHRpb246IC0+XG4gICAgaWYgQGhhc093blByb3BlcnR5KFwiZGVzY3JpcHRpb25cIilcbiAgICAgIEBkZXNjcmlwdGlvblxuICAgIGVsc2VcbiAgICAgIG51bGxcblxuICBAcmVnaXN0ZXJDb21tYW5kOiAtPlxuICAgIGtsYXNzID0gdGhpc1xuICAgIGF0b20uY29tbWFuZHMuYWRkIEBnZXRDb21tYW5kU2NvcGUoKSwgQGdldENvbW1hbmROYW1lKCksIChldmVudCkgLT5cbiAgICAgIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoQGdldE1vZGVsKCkpID8gZ2V0RWRpdG9yU3RhdGUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuICAgICAgaWYgdmltU3RhdGU/ICMgUG9zc2libHkgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgICAgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGtsYXNzKVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblxuICBAcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWM6IChuYW1lLCBzcGVjKSAtPlxuICAgIHtjb21tYW5kU2NvcGUsIGNvbW1hbmRQcmVmaXgsIGNvbW1hbmROYW1lLCBnZXRDbGFzc30gPSBzcGVjXG4gICAgY29tbWFuZFNjb3BlID89ICdhdG9tLXRleHQtZWRpdG9yJ1xuICAgIGNvbW1hbmROYW1lID89IChjb21tYW5kUHJlZml4ID8gJ3ZpbS1tb2RlLXBsdXMnKSArICc6JyArIF9wbHVzKCkuZGFzaGVyaXplKG5hbWUpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgY29tbWFuZFNjb3BlLCBjb21tYW5kTmFtZSwgKGV2ZW50KSAtPlxuICAgICAgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZShAZ2V0TW9kZWwoKSkgPyBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiB2aW1TdGF0ZT8gIyBQb3NzaWJseSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgICBpZiBnZXRDbGFzcz9cbiAgICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4oZ2V0Q2xhc3MobmFtZSkpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4obmFtZSlcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgIyBGb3IgZGVtby1tb2RlIHBrZyBpbnRlZ3JhdGlvblxuICBAb3BlcmF0aW9uS2luZDogbnVsbFxuICBAZ2V0S2luZEZvckNvbW1hbmROYW1lOiAoY29tbWFuZCkgLT5cbiAgICBfID0gX3BsdXMoKVxuICAgIG5hbWUgPSBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShjb21tYW5kKSlcbiAgICBpZiBuYW1lIG9mIGNsYXNzUmVnaXN0cnlcbiAgICAgIGNsYXNzUmVnaXN0cnlbbmFtZV0ub3BlcmF0aW9uS2luZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiJdfQ==
