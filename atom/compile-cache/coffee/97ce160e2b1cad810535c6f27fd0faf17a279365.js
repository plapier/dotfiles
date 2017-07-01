(function() {
  var CompositeDisposable, Delegato, Disposable, Emitter, LazyLoadedLibs, ModeManager, Range, VimState, jQuery, lazyRequire, ref, settings,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Delegato = require('delegato');

  jQuery = null;

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable, Range = ref.Range;

  settings = require('./settings');

  ModeManager = require('./mode-manager');

  LazyLoadedLibs = {};

  lazyRequire = function(file) {
    if (!(file in LazyLoadedLibs)) {
      if (atom.inDevMode() && settings.get('debug')) {
        console.log("# lazy-require: " + file);
      }
      LazyLoadedLibs[file] = require(file);
    }
    return LazyLoadedLibs[file];
  };

  module.exports = VimState = (function() {
    var fileToLoad, propName, ref1;

    VimState.vimStatesByEditor = new Map;

    VimState.getByEditor = function(editor) {
      return this.vimStatesByEditor.get(editor);
    };

    VimState.has = function(editor) {
      return this.vimStatesByEditor.has(editor);
    };

    VimState["delete"] = function(editor) {
      return this.vimStatesByEditor["delete"](editor);
    };

    VimState.forEach = function(fn) {
      return this.vimStatesByEditor.forEach(fn);
    };

    VimState.clear = function() {
      return this.vimStatesByEditor.clear();
    };

    Delegato.includeInto(VimState);

    VimState.delegatesProperty('mode', 'submode', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('isMode', 'activate', {
      toProperty: 'modeManager'
    });

    VimState.delegatesMethods('flash', 'flashScreenRange', {
      toProperty: 'flashManager'
    });

    VimState.delegatesMethods('subscribe', 'getCount', 'setCount', 'hasCount', 'addToClassList', {
      toProperty: 'operationStack'
    });

    VimState.defineLazyProperty = function(name, fileToLoad, instantiate) {
      if (instantiate == null) {
        instantiate = true;
      }
      return Object.defineProperty(this.prototype, name, {
        get: function() {
          var name1;
          return this[name1 = "__" + name] != null ? this[name1] : this[name1] = (function(_this) {
            return function() {
              if (instantiate) {
                return new (lazyRequire(fileToLoad))(_this);
              } else {
                return lazyRequire(fileToLoad);
              }
            };
          })(this)();
        }
      });
    };

    VimState.prototype.getProp = function(name) {
      if (this["__" + name] != null) {
        return this[name];
      }
    };

    VimState.defineLazyProperty('swrap', './selection-wrapper', false);

    VimState.defineLazyProperty('utils', './utils', false);

    VimState.lazyProperties = {
      mark: './mark-manager',
      register: './register-manager',
      hover: './hover-manager',
      hoverSearchCounter: './hover-manager',
      searchHistory: './search-history-manager',
      highlightSearch: './highlight-search-manager',
      persistentSelection: './persistent-selection-manager',
      occurrenceManager: './occurrence-manager',
      mutationManager: './mutation-manager',
      flashManager: './flash-manager',
      searchInput: './search-input',
      operationStack: './operation-stack',
      cursorStyleManager: './cursor-style-manager'
    };

    ref1 = VimState.lazyProperties;
    for (propName in ref1) {
      fileToLoad = ref1[propName];
      VimState.defineLazyProperty(propName, fileToLoad);
    }

    VimState.prototype.reportRequireCache = function(arg) {
      var cachedPath, cachedPaths, excludeNodModules, focus, i, inspect, len, packPath, path, results;
      focus = arg.focus, excludeNodModules = arg.excludeNodModules;
      inspect = require('util').inspect;
      path = require('path');
      packPath = atom.packages.getLoadedPackage("vim-mode-plus").path;
      cachedPaths = Object.keys(require.cache).filter(function(p) {
        return p.startsWith(packPath + path.sep);
      }).map(function(p) {
        return p.replace(packPath, '');
      });
      results = [];
      for (i = 0, len = cachedPaths.length; i < len; i++) {
        cachedPath = cachedPaths[i];
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(RegExp("" + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        results.push(console.log(cachedPath));
      }
      return results;
    };

    function VimState(editor1, statusBarManager, globalState) {
      var startInsertScopes;
      this.editor = editor1;
      this.statusBarManager = statusBarManager;
      this.globalState = globalState;
      this.destroy = bind(this.destroy, this);
      this.editorElement = this.editor.element;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.modeManager = new ModeManager(this);
      this.previousSelection = {};
      this.observeSelections();
      this.editorElement.classList.add('vim-mode-plus');
      startInsertScopes = this.getConfig('startInInsertModeScopes');
      if (this.getConfig('startInInsertMode') || startInsertScopes.length && this.utils.matchScopes(this.editorElement, startInsertScopes)) {
        this.activate('insert');
      } else {
        this.activate('normal');
      }
      this.editor.onDidDestroy(this.destroy);
      this.constructor.vimStatesByEditor.set(this.editor, this);
    }

    VimState.prototype.getConfig = function(param) {
      return settings.get(param);
    };

    VimState.prototype.getBlockwiseSelections = function() {
      return this.swrap.getBlockwiseSelections(this.editor);
    };

    VimState.prototype.getLastBlockwiseSelection = function() {
      return this.swrap.getLastBlockwiseSelections(this.editor);
    };

    VimState.prototype.getBlockwiseSelectionsOrderedByBufferPosition = function() {
      return this.swrap.getBlockwiseSelectionsOrderedByBufferPosition(this.editor);
    };

    VimState.prototype.clearBlockwiseSelections = function() {
      var ref2;
      return (ref2 = this.getProp('swrap')) != null ? ref2.clearBlockwiseSelections(this.editor) : void 0;
    };

    VimState.prototype.swapClassName = function() {
      var classNames, oldMode, ref2;
      classNames = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      oldMode = this.mode;
      this.editorElement.classList.remove('vim-mode-plus', oldMode + "-mode");
      (ref2 = this.editorElement.classList).add.apply(ref2, classNames);
      return new Disposable((function(_this) {
        return function() {
          var classToAdd, ref3, ref4;
          (ref3 = _this.editorElement.classList).remove.apply(ref3, classNames);
          classToAdd = ['vim-mode-plus', 'is-focused'];
          if (_this.mode === oldMode) {
            classToAdd.push(oldMode + "-mode");
          }
          return (ref4 = _this.editorElement.classList).add.apply(ref4, classToAdd);
        };
      })(this));
    };

    VimState.prototype.onDidChangeSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidChange(fn));
    };

    VimState.prototype.onDidConfirmSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidConfirm(fn));
    };

    VimState.prototype.onDidCancelSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCancel(fn));
    };

    VimState.prototype.onDidCommandSearch = function(fn) {
      return this.subscribe(this.searchInput.onDidCommand(fn));
    };

    VimState.prototype.onDidSetTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-set-target', fn));
    };

    VimState.prototype.emitDidSetTarget = function(operator) {
      return this.emitter.emit('did-set-target', operator);
    };

    VimState.prototype.onWillSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('will-select-target', fn));
    };

    VimState.prototype.emitWillSelectTarget = function() {
      return this.emitter.emit('will-select-target');
    };

    VimState.prototype.onDidSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-select-target', fn));
    };

    VimState.prototype.emitDidSelectTarget = function() {
      return this.emitter.emit('did-select-target');
    };

    VimState.prototype.onDidFailSelectTarget = function(fn) {
      return this.subscribe(this.emitter.on('did-fail-select-target', fn));
    };

    VimState.prototype.emitDidFailSelectTarget = function() {
      return this.emitter.emit('did-fail-select-target');
    };

    VimState.prototype.onWillFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-will-finish-mutation', fn));
    };

    VimState.prototype.emitWillFinishMutation = function() {
      return this.emitter.emit('on-will-finish-mutation');
    };

    VimState.prototype.onDidFinishMutation = function(fn) {
      return this.subscribe(this.emitter.on('on-did-finish-mutation', fn));
    };

    VimState.prototype.emitDidFinishMutation = function() {
      return this.emitter.emit('on-did-finish-mutation');
    };

    VimState.prototype.onDidSetOperatorModifier = function(fn) {
      return this.subscribe(this.emitter.on('did-set-operator-modifier', fn));
    };

    VimState.prototype.emitDidSetOperatorModifier = function(options) {
      return this.emitter.emit('did-set-operator-modifier', options);
    };

    VimState.prototype.onDidFinishOperation = function(fn) {
      return this.subscribe(this.emitter.on('did-finish-operation', fn));
    };

    VimState.prototype.emitDidFinishOperation = function() {
      return this.emitter.emit('did-finish-operation');
    };

    VimState.prototype.onDidResetOperationStack = function(fn) {
      return this.subscribe(this.emitter.on('did-reset-operation-stack', fn));
    };

    VimState.prototype.emitDidResetOperationStack = function() {
      return this.emitter.emit('did-reset-operation-stack');
    };

    VimState.prototype.onDidConfirmSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-confirm-select-list', fn));
    };

    VimState.prototype.onDidCancelSelectList = function(fn) {
      return this.subscribe(this.emitter.on('did-cancel-select-list', fn));
    };

    VimState.prototype.onWillActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillActivateMode(fn));
    };

    VimState.prototype.onDidActivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidActivateMode(fn));
    };

    VimState.prototype.onWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onWillDeactivateMode(fn));
    };

    VimState.prototype.preemptWillDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.preemptWillDeactivateMode(fn));
    };

    VimState.prototype.onDidDeactivateMode = function(fn) {
      return this.subscribe(this.modeManager.onDidDeactivateMode(fn));
    };

    VimState.prototype.onDidFailToPushToOperationStack = function(fn) {
      return this.emitter.on('did-fail-to-push-to-operation-stack', fn);
    };

    VimState.prototype.emitDidFailToPushToOperationStack = function() {
      return this.emitter.emit('did-fail-to-push-to-operation-stack');
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.onDidSetMark = function(fn) {
      return this.emitter.on('did-set-mark', fn);
    };

    VimState.prototype.onDidSetInputChar = function(fn) {
      return this.emitter.on('did-set-input-char', fn);
    };

    VimState.prototype.emitDidSetInputChar = function(char) {
      return this.emitter.emit('did-set-input-char', char);
    };

    VimState.prototype.isAlive = function() {
      return this.constructor.has(this.editor);
    };

    VimState.prototype.destroy = function() {
      var ref2, ref3;
      if (!this.isAlive()) {
        return;
      }
      this.constructor["delete"](this.editor);
      this.subscriptions.dispose();
      if (this.editor.isAlive()) {
        this.resetNormalMode();
        this.reset();
        if ((ref2 = this.editorElement.component) != null) {
          ref2.setInputEnabled(true);
        }
        this.editorElement.classList.remove('vim-mode-plus', 'normal-mode');
      }
      ref3 = {}, this.hover = ref3.hover, this.hoverSearchCounter = ref3.hoverSearchCounter, this.operationStack = ref3.operationStack, this.searchHistory = ref3.searchHistory, this.cursorStyleManager = ref3.cursorStyleManager, this.modeManager = ref3.modeManager, this.register = ref3.register, this.editor = ref3.editor, this.editorElement = ref3.editorElement, this.subscriptions = ref3.subscriptions, this.occurrenceManager = ref3.occurrenceManager, this.previousSelection = ref3.previousSelection, this.persistentSelection = ref3.persistentSelection;
      return this.emitter.emit('did-destroy');
    };

    VimState.prototype.haveSomeNonEmptySelection = function() {
      return this.editor.getSelections().some(function(selection) {
        return !selection.isEmpty();
      });
    };

    VimState.prototype.checkSelection = function(event) {
      var $selection, i, len, ref2, ref3, ref4, wise;
      if (atom.workspace.getActiveTextEditor() !== this.editor) {
        return;
      }
      if ((ref2 = this.getProp('operationStack')) != null ? ref2.isProcessing() : void 0) {
        return;
      }
      if (this.mode === 'insert') {
        return;
      }
      if (this.editorElement !== ((ref3 = event.target) != null ? typeof ref3.closest === "function" ? ref3.closest('atom-text-editor') : void 0 : void 0)) {
        return;
      }
      if (event.type.startsWith('vim-mode-plus')) {
        return;
      }
      if (this.haveSomeNonEmptySelection()) {
        this.editorElement.component.updateSync();
        wise = this.swrap.detectWise(this.editor);
        if (this.isMode('visual', wise)) {
          ref4 = this.swrap.getSelections(this.editor);
          for (i = 0, len = ref4.length; i < len; i++) {
            $selection = ref4[i];
            $selection.saveProperties();
          }
          return this.cursorStyleManager.refresh();
        } else {
          return this.activate('visual', wise);
        }
      } else {
        if (this.mode === 'visual') {
          return this.activate('normal');
        }
      }
    };

    VimState.prototype.observeSelections = function() {
      var checkSelection;
      checkSelection = this.checkSelection.bind(this);
      this.editorElement.addEventListener('mouseup', checkSelection);
      this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('mouseup', checkSelection);
        };
      })(this)));
      this.subscriptions.add(atom.commands.onDidDispatch(checkSelection));
      this.editorElement.addEventListener('focus', checkSelection);
      return this.subscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.removeEventListener('focus', checkSelection);
        };
      })(this)));
    };

    VimState.prototype.clearSelections = function() {
      return this.editor.setCursorBufferPosition(this.editor.getCursorBufferPosition());
    };

    VimState.prototype.resetNormalMode = function(arg) {
      var ref2, userInvocation;
      userInvocation = (arg != null ? arg : {}).userInvocation;
      this.clearBlockwiseSelections();
      if (userInvocation != null ? userInvocation : false) {
        switch (false) {
          case !this.editor.hasMultipleCursors():
            this.clearSelections();
            break;
          case !(this.hasPersistentSelections() && this.getConfig('clearPersistentSelectionOnResetNormalMode')):
            this.clearPersistentSelections();
            break;
          case !((ref2 = this.getProp('occurrenceManager')) != null ? ref2.hasPatterns() : void 0):
            this.occurrenceManager.resetPatterns();
        }
        if (this.getConfig('clearHighlightSearchOnResetNormalMode')) {
          this.globalState.set('highlightSearchPattern', null);
        }
      } else {
        this.clearSelections();
      }
      return this.activate('normal');
    };

    VimState.prototype.init = function() {
      return this.saveOriginalCursorPosition();
    };

    VimState.prototype.reset = function() {
      var ref2, ref3, ref4, ref5, ref6;
      if ((ref2 = this.getProp('register')) != null) {
        ref2.reset();
      }
      if ((ref3 = this.getProp('searchHistory')) != null) {
        ref3.reset();
      }
      if ((ref4 = this.getProp('hover')) != null) {
        ref4.reset();
      }
      if ((ref5 = this.getProp('operationStack')) != null) {
        ref5.reset();
      }
      return (ref6 = this.getProp('mutationManager')) != null ? ref6.reset() : void 0;
    };

    VimState.prototype.isVisible = function() {
      var ref2;
      return ref2 = this.editor, indexOf.call(this.utils.getVisibleEditors(), ref2) >= 0;
    };

    VimState.prototype.updatePreviousSelection = function() {
      var end, head, properties, ref2, ref3, ref4, start, tail;
      if (this.isMode('visual', 'blockwise')) {
        properties = (ref2 = this.getLastBlockwiseSelection()) != null ? ref2.getProperties() : void 0;
      } else {
        properties = this.swrap(this.editor.getLastSelection()).getProperties();
      }
      if (!properties) {
        return;
      }
      head = properties.head, tail = properties.tail;
      if (head.isGreaterThanOrEqual(tail)) {
        ref3 = [tail, head], start = ref3[0], end = ref3[1];
        head = end = this.utils.translatePointAndClip(this.editor, end, 'forward');
      } else {
        ref4 = [head, tail], start = ref4[0], end = ref4[1];
        tail = end = this.utils.translatePointAndClip(this.editor, end, 'forward');
      }
      this.mark.set('<', start);
      this.mark.set('>', end);
      return this.previousSelection = {
        properties: {
          head: head,
          tail: tail
        },
        submode: this.submode
      };
    };

    VimState.prototype.hasPersistentSelections = function() {
      var ref2;
      return (ref2 = this.getProp('persistentSelection')) != null ? ref2.hasMarkers() : void 0;
    };

    VimState.prototype.getPersistentSelectionBufferRanges = function() {
      var ref2, ref3;
      return (ref2 = (ref3 = this.getProp('persistentSelection')) != null ? ref3.getMarkerBufferRanges() : void 0) != null ? ref2 : [];
    };

    VimState.prototype.clearPersistentSelections = function() {
      var ref2;
      return (ref2 = this.getProp('persistentSelection')) != null ? ref2.clearMarkers() : void 0;
    };

    VimState.prototype.scrollAnimationEffect = null;

    VimState.prototype.requestScrollAnimation = function(from, to, options) {
      if (jQuery == null) {
        jQuery = require('atom-space-pen-views').jQuery;
      }
      return this.scrollAnimationEffect = jQuery(from).animate(to, options);
    };

    VimState.prototype.finishScrollAnimation = function() {
      var ref2;
      if ((ref2 = this.scrollAnimationEffect) != null) {
        ref2.finish();
      }
      return this.scrollAnimationEffect = null;
    };

    VimState.prototype.saveOriginalCursorPosition = function() {
      var point, ref2, selection;
      this.originalCursorPosition = null;
      if ((ref2 = this.originalCursorPositionByMarker) != null) {
        ref2.destroy();
      }
      if (this.mode === 'visual') {
        selection = this.editor.getLastSelection();
        point = this.swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      } else {
        point = this.editor.getCursorBufferPosition();
      }
      this.originalCursorPosition = point;
      return this.originalCursorPositionByMarker = this.editor.markBufferPosition(point, {
        invalidate: 'never'
      });
    };

    VimState.prototype.restoreOriginalCursorPosition = function() {
      return this.editor.setCursorBufferPosition(this.getOriginalCursorPosition());
    };

    VimState.prototype.getOriginalCursorPosition = function() {
      return this.originalCursorPosition;
    };

    VimState.prototype.getOriginalCursorPositionByMarker = function() {
      return this.originalCursorPositionByMarker.getStartBufferPosition();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi92aW0tc3RhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvSUFBQTtJQUFBOzs7O0VBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztFQUNYLE1BQUEsR0FBUzs7RUFFVCxNQUFvRCxPQUFBLENBQVEsTUFBUixDQUFwRCxFQUFDLHFCQUFELEVBQVUsMkJBQVYsRUFBc0IsNkNBQXRCLEVBQTJDOztFQUUzQyxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFFZCxjQUFBLEdBQWlCOztFQUVqQixXQUFBLEdBQWMsU0FBQyxJQUFEO0lBQ1osSUFBQSxDQUFBLENBQU8sSUFBQSxJQUFRLGNBQWYsQ0FBQTtNQUVFLElBQUcsSUFBSSxDQUFDLFNBQUwsQ0FBQSxDQUFBLElBQXFCLFFBQVEsQ0FBQyxHQUFULENBQWEsT0FBYixDQUF4QjtRQUNFLE9BQU8sQ0FBQyxHQUFSLENBQVksa0JBQUEsR0FBbUIsSUFBL0IsRUFERjs7TUFJQSxjQUFlLENBQUEsSUFBQSxDQUFmLEdBQXVCLE9BQUEsQ0FBUSxJQUFSLEVBTnpCOztXQU9BLGNBQWUsQ0FBQSxJQUFBO0VBUkg7O0VBVWQsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLFFBQUE7O0lBQUEsUUFBQyxDQUFBLGlCQUFELEdBQW9CLElBQUk7O0lBRXhCLFFBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxNQUFEO2FBQVksSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLE1BQXZCO0lBQVo7O0lBQ2QsUUFBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLE1BQUQ7YUFBWSxJQUFDLENBQUEsaUJBQWlCLENBQUMsR0FBbkIsQ0FBdUIsTUFBdkI7SUFBWjs7SUFDTixRQUFDLEVBQUEsTUFBQSxF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Ozt1QkFHL0IseUJBQUEsR0FBMkIsU0FBQTthQUN6QixJQUFDLENBQUE7SUFEd0I7O3VCQUczQixpQ0FBQSxHQUFtQyxTQUFBO2FBQ2pDLElBQUMsQ0FBQSw4QkFBOEIsQ0FBQyxzQkFBaEMsQ0FBQTtJQURpQzs7Ozs7QUE5V3JDIiwic291cmNlc0NvbnRlbnQiOlsiRGVsZWdhdG8gPSByZXF1aXJlICdkZWxlZ2F0bydcbmpRdWVyeSA9IG51bGxcblxue0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGUsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcbk1vZGVNYW5hZ2VyID0gcmVxdWlyZSAnLi9tb2RlLW1hbmFnZXInXG5cbkxhenlMb2FkZWRMaWJzID0ge31cblxubGF6eVJlcXVpcmUgPSAoZmlsZSkgLT5cbiAgdW5sZXNzIGZpbGUgb2YgTGF6eUxvYWRlZExpYnNcblxuICAgIGlmIGF0b20uaW5EZXZNb2RlKCkgYW5kIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICAgICAgY29uc29sZS5sb2cgXCIjIGxhenktcmVxdWlyZTogI3tmaWxlfVwiXG4gICAgICAjIGNvbnNvbGUudHJhY2UoKVxuXG4gICAgTGF6eUxvYWRlZExpYnNbZmlsZV0gPSByZXF1aXJlKGZpbGUpXG4gIExhenlMb2FkZWRMaWJzW2ZpbGVdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFZpbVN0YXRlXG4gIEB2aW1TdGF0ZXNCeUVkaXRvcjogbmV3IE1hcFxuXG4gIEBnZXRCeUVkaXRvcjogKGVkaXRvcikgLT4gQHZpbVN0YXRlc0J5RWRpdG9yLmdldChlZGl0b3IpXG4gIEBoYXM6IChlZGl0b3IpIC0+IEB2aW1TdGF0ZXNCeUVkaXRvci5oYXMoZWRpdG9yKVxuICBAZGVsZXRlOiAoZWRpdG9yKSAtPiBAdmltU3RhdGVzQnlFZGl0b3IuZGVsZXRlKGVkaXRvcilcbiAgQGZvckVhY2g6IChmbikgLT4gQHZpbVN0YXRlc0J5RWRpdG9yLmZvckVhY2goZm4pXG4gIEBjbGVhcjogLT4gQHZpbVN0YXRlc0J5RWRpdG9yLmNsZWFyKClcblxuICBEZWxlZ2F0by5pbmNsdWRlSW50byh0aGlzKVxuICBAZGVsZWdhdGVzUHJvcGVydHkoJ21vZGUnLCAnc3VibW9kZScsIHRvUHJvcGVydHk6ICdtb2RlTWFuYWdlcicpXG4gIEBkZWxlZ2F0ZXNNZXRob2RzKCdpc01vZGUnLCAnYWN0aXZhdGUnLCB0b1Byb3BlcnR5OiAnbW9kZU1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnZmxhc2gnLCAnZmxhc2hTY3JlZW5SYW5nZScsIHRvUHJvcGVydHk6ICdmbGFzaE1hbmFnZXInKVxuICBAZGVsZWdhdGVzTWV0aG9kcygnc3Vic2NyaWJlJywgJ2dldENvdW50JywgJ3NldENvdW50JywgJ2hhc0NvdW50JywgJ2FkZFRvQ2xhc3NMaXN0JywgdG9Qcm9wZXJ0eTogJ29wZXJhdGlvblN0YWNrJylcblxuICBAZGVmaW5lTGF6eVByb3BlcnR5OiAobmFtZSwgZmlsZVRvTG9hZCwgaW5zdGFudGlhdGU9dHJ1ZSkgLT5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgQHByb3RvdHlwZSwgbmFtZSxcbiAgICAgIGdldDogLT4gdGhpc1tcIl9fI3tuYW1lfVwiXSA/PSBkbyA9PlxuICAgICAgICBpZiBpbnN0YW50aWF0ZVxuICAgICAgICAgIG5ldyAobGF6eVJlcXVpcmUoZmlsZVRvTG9hZCkpKHRoaXMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsYXp5UmVxdWlyZShmaWxlVG9Mb2FkKVxuXG4gIGdldFByb3A6IChuYW1lKSAtPlxuICAgIHRoaXNbbmFtZV0gaWYgdGhpc1tcIl9fI3tuYW1lfVwiXT9cblxuICBAZGVmaW5lTGF6eVByb3BlcnR5KCdzd3JhcCcsICcuL3NlbGVjdGlvbi13cmFwcGVyJywgZmFsc2UpXG4gIEBkZWZpbmVMYXp5UHJvcGVydHkoJ3V0aWxzJywgJy4vdXRpbHMnLCBmYWxzZSlcblxuICBAbGF6eVByb3BlcnRpZXMgPVxuICAgIG1hcms6ICcuL21hcmstbWFuYWdlcidcbiAgICByZWdpc3RlcjogJy4vcmVnaXN0ZXItbWFuYWdlcidcbiAgICBob3ZlcjogJy4vaG92ZXItbWFuYWdlcidcbiAgICBob3ZlclNlYXJjaENvdW50ZXI6ICcuL2hvdmVyLW1hbmFnZXInXG4gICAgc2VhcmNoSGlzdG9yeTogJy4vc2VhcmNoLWhpc3RvcnktbWFuYWdlcidcbiAgICBoaWdobGlnaHRTZWFyY2g6ICcuL2hpZ2hsaWdodC1zZWFyY2gtbWFuYWdlcidcbiAgICBwZXJzaXN0ZW50U2VsZWN0aW9uOiAnLi9wZXJzaXN0ZW50LXNlbGVjdGlvbi1tYW5hZ2VyJ1xuICAgIG9jY3VycmVuY2VNYW5hZ2VyOiAnLi9vY2N1cnJlbmNlLW1hbmFnZXInXG4gICAgbXV0YXRpb25NYW5hZ2VyOiAnLi9tdXRhdGlvbi1tYW5hZ2VyJ1xuICAgIGZsYXNoTWFuYWdlcjogJy4vZmxhc2gtbWFuYWdlcidcbiAgICBzZWFyY2hJbnB1dDogJy4vc2VhcmNoLWlucHV0J1xuICAgIG9wZXJhdGlvblN0YWNrOiAnLi9vcGVyYXRpb24tc3RhY2snXG4gICAgY3Vyc29yU3R5bGVNYW5hZ2VyOiAnLi9jdXJzb3Itc3R5bGUtbWFuYWdlcidcblxuICBmb3IgcHJvcE5hbWUsIGZpbGVUb0xvYWQgb2YgQGxhenlQcm9wZXJ0aWVzXG4gICAgQGRlZmluZUxhenlQcm9wZXJ0eShwcm9wTmFtZSwgZmlsZVRvTG9hZClcblxuICByZXBvcnRSZXF1aXJlQ2FjaGU6ICh7Zm9jdXMsIGV4Y2x1ZGVOb2RNb2R1bGVzfSkgLT5cbiAgICB7aW5zcGVjdH0gPSByZXF1aXJlICd1dGlsJ1xuICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuICAgIHBhY2tQYXRoID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKFwidmltLW1vZGUtcGx1c1wiKS5wYXRoXG4gICAgY2FjaGVkUGF0aHMgPSBPYmplY3Qua2V5cyhyZXF1aXJlLmNhY2hlKVxuICAgICAgLmZpbHRlciAocCkgLT4gcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgcGF0aC5zZXApXG4gICAgICAubWFwIChwKSAtPiBwLnJlcGxhY2UocGFja1BhdGgsICcnKVxuXG4gICAgZm9yIGNhY2hlZFBhdGggaW4gY2FjaGVkUGF0aHNcbiAgICAgIGlmIGV4Y2x1ZGVOb2RNb2R1bGVzIGFuZCBjYWNoZWRQYXRoLnNlYXJjaCgvbm9kZV9tb2R1bGVzLykgPj0gMFxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgZm9jdXMgYW5kIGNhY2hlZFBhdGguc2VhcmNoKC8vLyN7Zm9jdXN9Ly8vKSA+PSAwXG4gICAgICAgIGNhY2hlZFBhdGggPSAnKicgKyBjYWNoZWRQYXRoXG5cbiAgICAgIGNvbnNvbGUubG9nIGNhY2hlZFBhdGhcblxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIsIEBnbG9iYWxTdGF0ZSkgLT5cbiAgICBAZWRpdG9yRWxlbWVudCA9IEBlZGl0b3IuZWxlbWVudFxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQG1vZGVNYW5hZ2VyID0gbmV3IE1vZGVNYW5hZ2VyKHRoaXMpXG4gICAgQHByZXZpb3VzU2VsZWN0aW9uID0ge31cbiAgICBAb2JzZXJ2ZVNlbGVjdGlvbnMoKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgndmltLW1vZGUtcGx1cycpXG4gICAgc3RhcnRJbnNlcnRTY29wZXMgPSBAZ2V0Q29uZmlnKCdzdGFydEluSW5zZXJ0TW9kZVNjb3BlcycpXG5cbiAgICBpZiBAZ2V0Q29uZmlnKCdzdGFydEluSW5zZXJ0TW9kZScpIG9yIHN0YXJ0SW5zZXJ0U2NvcGVzLmxlbmd0aCBhbmQgQHV0aWxzLm1hdGNoU2NvcGVzKEBlZGl0b3JFbGVtZW50LCBzdGFydEluc2VydFNjb3BlcylcbiAgICAgIEBhY3RpdmF0ZSgnaW5zZXJ0JylcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGUoJ25vcm1hbCcpXG5cbiAgICBAZWRpdG9yLm9uRGlkRGVzdHJveShAZGVzdHJveSlcbiAgICBAY29uc3RydWN0b3IudmltU3RhdGVzQnlFZGl0b3Iuc2V0KEBlZGl0b3IsIHRoaXMpXG5cbiAgZ2V0Q29uZmlnOiAocGFyYW0pIC0+XG4gICAgc2V0dGluZ3MuZ2V0KHBhcmFtKVxuXG4gICMgQmxvY2t3aXNlU2VsZWN0aW9uc1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uczogLT5cbiAgICBAc3dyYXAuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gIGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb246IC0+XG4gICAgQHN3cmFwLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb25zKEBlZGl0b3IpXG5cbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEBzd3JhcC5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oQGVkaXRvcilcblxuICBjbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnM6IC0+XG4gICAgQGdldFByb3AoJ3N3cmFwJyk/LmNsZWFyQmxvY2t3aXNlU2VsZWN0aW9ucyhAZWRpdG9yKVxuXG4gICMgT3RoZXJcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgRklYTUU6IEkgd2FudCB0byByZW1vdmUgdGhpcyBkZW5nZXJpb3VzIGFwcHJvYWNoLCBidXQgSSBjb3VsZG4ndCBmaW5kIHRoZSBiZXR0ZXIgd2F5LlxuICBzd2FwQ2xhc3NOYW1lOiAoY2xhc3NOYW1lcy4uLikgLT5cbiAgICBvbGRNb2RlID0gQG1vZGVcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCd2aW0tbW9kZS1wbHVzJywgb2xkTW9kZSArIFwiLW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZXMuLi4pXG5cbiAgICBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWVzLi4uKVxuICAgICAgY2xhc3NUb0FkZCA9IFsndmltLW1vZGUtcGx1cycsICdpcy1mb2N1c2VkJ11cbiAgICAgIGlmIEBtb2RlIGlzIG9sZE1vZGVcbiAgICAgICAgY2xhc3NUb0FkZC5wdXNoKG9sZE1vZGUgKyBcIi1tb2RlXCIpXG4gICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzVG9BZGQuLi4pXG5cbiAgIyBBbGwgc3Vic2NyaXB0aW9ucyBoZXJlIGlzIGNlbGFyZWQgb24gZWFjaCBvcGVyYXRpb24gZmluaXNoZWQuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbkRpZENoYW5nZVNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENoYW5nZShmbilcbiAgb25EaWRDb25maXJtU2VhcmNoOiAoZm4pIC0+IEBzdWJzY3JpYmUgQHNlYXJjaElucHV0Lm9uRGlkQ29uZmlybShmbilcbiAgb25EaWRDYW5jZWxTZWFyY2g6IChmbikgLT4gQHN1YnNjcmliZSBAc2VhcmNoSW5wdXQub25EaWRDYW5jZWwoZm4pXG4gIG9uRGlkQ29tbWFuZFNlYXJjaDogKGZuKSAtPiBAc3Vic2NyaWJlIEBzZWFyY2hJbnB1dC5vbkRpZENvbW1hbmQoZm4pXG5cbiAgIyBTZWxlY3QgYW5kIHRleHQgbXV0YXRpb24oQ2hhbmdlKVxuICBvbkRpZFNldFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2V0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2V0VGFyZ2V0OiAob3BlcmF0b3IpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtdGFyZ2V0Jywgb3BlcmF0b3IpXG5cbiAgb25XaWxsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ3dpbGwtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldDogLT4gQGVtaXR0ZXIuZW1pdCgnd2lsbC1zZWxlY3QtdGFyZ2V0JylcblxuICBvbkRpZFNlbGVjdFRhcmdldDogKGZuKSAtPiBAc3Vic2NyaWJlIEBlbWl0dGVyLm9uKCdkaWQtc2VsZWN0LXRhcmdldCcsIGZuKVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0OiAtPiBAZW1pdHRlci5lbWl0KCdkaWQtc2VsZWN0LXRhcmdldCcpXG5cbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnLCBmbilcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQ6IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1mYWlsLXNlbGVjdC10YXJnZXQnKVxuXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJywgZm4pXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ29uLXdpbGwtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZEZpbmlzaE11dGF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ29uLWRpZC1maW5pc2gtbXV0YXRpb24nLCBmbilcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uOiAtPiBAZW1pdHRlci5lbWl0KCdvbi1kaWQtZmluaXNoLW11dGF0aW9uJylcblxuICBvbkRpZFNldE9wZXJhdG9yTW9kaWZpZXI6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXNldC1vcGVyYXRvci1tb2RpZmllcicsIGZuKVxuICBlbWl0RGlkU2V0T3BlcmF0b3JNb2RpZmllcjogKG9wdGlvbnMpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtb3BlcmF0b3ItbW9kaWZpZXInLCBvcHRpb25zKVxuXG4gIG9uRGlkRmluaXNoT3BlcmF0aW9uOiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1maW5pc2gtb3BlcmF0aW9uJywgZm4pXG4gIGVtaXREaWRGaW5pc2hPcGVyYXRpb246IC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1maW5pc2gtb3BlcmF0aW9uJylcblxuICBvbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2s6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLXJlc2V0LW9wZXJhdGlvbi1zdGFjaycsIGZuKVxuICBlbWl0RGlkUmVzZXRPcGVyYXRpb25TdGFjazogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLXJlc2V0LW9wZXJhdGlvbi1zdGFjaycpXG5cbiAgIyBTZWxlY3QgbGlzdCB2aWV3XG4gIG9uRGlkQ29uZmlybVNlbGVjdExpc3Q6IChmbikgLT4gQHN1YnNjcmliZSBAZW1pdHRlci5vbignZGlkLWNvbmZpcm0tc2VsZWN0LWxpc3QnLCBmbilcbiAgb25EaWRDYW5jZWxTZWxlY3RMaXN0OiAoZm4pIC0+IEBzdWJzY3JpYmUgQGVtaXR0ZXIub24oJ2RpZC1jYW5jZWwtc2VsZWN0LWxpc3QnLCBmbilcblxuICAjIFByb3h5aW5nIG1vZGVNYW5nZXIncyBldmVudCBob29rIHdpdGggc2hvcnQtbGlmZSBzdWJzY3JpcHRpb24uXG4gIG9uV2lsbEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbldpbGxBY3RpdmF0ZU1vZGUoZm4pXG4gIG9uRGlkQWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uRGlkQWN0aXZhdGVNb2RlKGZuKVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5vbldpbGxEZWFjdGl2YXRlTW9kZShmbilcbiAgcHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAc3Vic2NyaWJlIEBtb2RlTWFuYWdlci5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKGZuKVxuICBvbkRpZERlYWN0aXZhdGVNb2RlOiAoZm4pIC0+IEBzdWJzY3JpYmUgQG1vZGVNYW5hZ2VyLm9uRGlkRGVhY3RpdmF0ZU1vZGUoZm4pXG5cbiAgIyBFdmVudHNcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9uRGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2s6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1mYWlsLXRvLXB1c2gtdG8tb3BlcmF0aW9uLXN0YWNrJywgZm4pXG4gIGVtaXREaWRGYWlsVG9QdXNoVG9PcGVyYXRpb25TdGFjazogLT4gQGVtaXR0ZXIuZW1pdCgnZGlkLWZhaWwtdG8tcHVzaC10by1vcGVyYXRpb24tc3RhY2snKVxuXG4gIG9uRGlkRGVzdHJveTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBmbilcblxuICAjICogYGZuYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIG1hcmsgd2FzIHNldC5cbiAgIyAgICogYG5hbWVgIE5hbWUgb2YgbWFyayBzdWNoIGFzICdhJy5cbiAgIyAgICogYGJ1ZmZlclBvc2l0aW9uYDogYnVmZmVyUG9zaXRpb24gd2hlcmUgbWFyayB3YXMgc2V0LlxuICAjICAgKiBgZWRpdG9yYDogZWRpdG9yIHdoZXJlIG1hcmsgd2FzIHNldC5cbiAgIyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICAjXG4gICMgIFVzYWdlOlxuICAjICAgb25EaWRTZXRNYXJrICh7bmFtZSwgYnVmZmVyUG9zaXRpb259KSAtPiBkbyBzb21ldGhpbmcuLlxuICBvbkRpZFNldE1hcms6IChmbikgLT4gQGVtaXR0ZXIub24oJ2RpZC1zZXQtbWFyaycsIGZuKVxuXG4gIG9uRGlkU2V0SW5wdXRDaGFyOiAoZm4pIC0+IEBlbWl0dGVyLm9uKCdkaWQtc2V0LWlucHV0LWNoYXInLCBmbilcbiAgZW1pdERpZFNldElucHV0Q2hhcjogKGNoYXIpIC0+IEBlbWl0dGVyLmVtaXQoJ2RpZC1zZXQtaW5wdXQtY2hhcicsIGNoYXIpXG5cbiAgaXNBbGl2ZTogLT5cbiAgICBAY29uc3RydWN0b3IuaGFzKEBlZGl0b3IpXG5cbiAgZGVzdHJveTogPT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc0FsaXZlKClcbiAgICBAY29uc3RydWN0b3IuZGVsZXRlKEBlZGl0b3IpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBpZiBAZWRpdG9yLmlzQWxpdmUoKVxuICAgICAgQHJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICBAcmVzZXQoKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50Py5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3ZpbS1tb2RlLXBsdXMnLCAnbm9ybWFsLW1vZGUnKVxuXG4gICAge1xuICAgICAgQGhvdmVyLCBAaG92ZXJTZWFyY2hDb3VudGVyLCBAb3BlcmF0aW9uU3RhY2ssXG4gICAgICBAc2VhcmNoSGlzdG9yeSwgQGN1cnNvclN0eWxlTWFuYWdlclxuICAgICAgQG1vZGVNYW5hZ2VyLCBAcmVnaXN0ZXJcbiAgICAgIEBlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAc3Vic2NyaXB0aW9ucyxcbiAgICAgIEBvY2N1cnJlbmNlTWFuYWdlclxuICAgICAgQHByZXZpb3VzU2VsZWN0aW9uXG4gICAgICBAcGVyc2lzdGVudFNlbGVjdGlvblxuICAgIH0gPSB7fVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1kZXN0cm95J1xuXG4gIGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb246IC0+XG4gICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuc29tZSgoc2VsZWN0aW9uKSAtPiBub3Qgc2VsZWN0aW9uLmlzRW1wdHkoKSlcblxuICBjaGVja1NlbGVjdGlvbjogKGV2ZW50KSAtPlxuICAgIHJldHVybiB1bmxlc3MgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpIGlzIEBlZGl0b3JcbiAgICByZXR1cm4gaWYgQGdldFByb3AoJ29wZXJhdGlvblN0YWNrJyk/LmlzUHJvY2Vzc2luZygpICMgRG9uJ3QgcG9wdWxhdGUgbGF6eS1wcm9wIG9uIHN0YXJ0dXBcbiAgICByZXR1cm4gaWYgQG1vZGUgaXMgJ2luc2VydCdcbiAgICAjIEludGVudGlvbmFsbHkgdXNpbmcgdGFyZ2V0LmNsb3Nlc3QoJ2F0b20tdGV4dC1lZGl0b3InKVxuICAgICMgRG9uJ3QgdXNlIHRhcmdldC5nZXRNb2RlbCgpIHdoaWNoIGlzIHdvcmsgZm9yIEN1c3RvbUV2ZW50IGJ1dCBub3Qgd29yayBmb3IgbW91c2UgZXZlbnQuXG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yRWxlbWVudCBpcyBldmVudC50YXJnZXQ/LmNsb3Nlc3Q/KCdhdG9tLXRleHQtZWRpdG9yJylcbiAgICByZXR1cm4gaWYgZXZlbnQudHlwZS5zdGFydHNXaXRoKCd2aW0tbW9kZS1wbHVzJykgIyB0byBtYXRjaCB2aW0tbW9kZS1wbHVzOiBhbmQgdmltLW1vZGUtcGx1cy11c2VyOlxuXG4gICAgaWYgQGhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24oKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuICAgICAgd2lzZSA9IEBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpXG4gICAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCB3aXNlKVxuICAgICAgICBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyLnJlZnJlc2goKVxuICAgICAgZWxzZVxuICAgICAgICBAYWN0aXZhdGUoJ3Zpc3VhbCcsIHdpc2UpXG4gICAgZWxzZVxuICAgICAgQGFjdGl2YXRlKCdub3JtYWwnKSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuXG4gIG9ic2VydmVTZWxlY3Rpb25zOiAtPlxuICAgIGNoZWNrU2VsZWN0aW9uID0gQGNoZWNrU2VsZWN0aW9uLmJpbmQodGhpcylcbiAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgY2hlY2tTZWxlY3Rpb24pXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoKGNoZWNrU2VsZWN0aW9uKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBjaGVja1NlbGVjdGlvbilcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgbmV3IERpc3Bvc2FibGUgPT5cbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgY2hlY2tTZWxlY3Rpb24pXG5cbiAgIyBXaGF0J3MgdGhpcz9cbiAgIyBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKCkgZG9lc24ndCByZXNwZWN0IGxhc3RDdXJzb3IgcG9zaXRvaW4uXG4gICMgVGhpcyBtZXRob2Qgd29ya3MgaW4gc2FtZSB3YXkgYXMgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpIGJ1dCByZXNwZWN0IGxhc3QgY3Vyc29yIHBvc2l0aW9uLlxuICBjbGVhclNlbGVjdGlvbnM6IC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgcmVzZXROb3JtYWxNb2RlOiAoe3VzZXJJbnZvY2F0aW9ufT17fSkgLT5cbiAgICBAY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zKClcblxuICAgIGlmIHVzZXJJbnZvY2F0aW9uID8gZmFsc2VcbiAgICAgIHN3aXRjaFxuICAgICAgICB3aGVuIEBlZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKClcbiAgICAgICAgICBAY2xlYXJTZWxlY3Rpb25zKClcbiAgICAgICAgd2hlbiBAaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKSBhbmQgQGdldENvbmZpZygnY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGUnKVxuICAgICAgICAgIEBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zKClcbiAgICAgICAgd2hlbiBAZ2V0UHJvcCgnb2NjdXJyZW5jZU1hbmFnZXInKT8uaGFzUGF0dGVybnMoKVxuICAgICAgICAgIEBvY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcblxuICAgICAgaWYgQGdldENvbmZpZygnY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZScpXG4gICAgICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBudWxsKVxuICAgIGVsc2VcbiAgICAgIEBjbGVhclNlbGVjdGlvbnMoKVxuICAgIEBhY3RpdmF0ZSgnbm9ybWFsJylcblxuICBpbml0OiAtPlxuICAgIEBzYXZlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpXG5cbiAgcmVzZXQ6IC0+XG4gICAgIyBEb24ndCBwb3B1bGF0ZSBsYXp5LXByb3Agb24gc3RhcnR1cFxuICAgIEBnZXRQcm9wKCdyZWdpc3RlcicpPy5yZXNldCgpXG4gICAgQGdldFByb3AoJ3NlYXJjaEhpc3RvcnknKT8ucmVzZXQoKVxuICAgIEBnZXRQcm9wKCdob3ZlcicpPy5yZXNldCgpXG4gICAgQGdldFByb3AoJ29wZXJhdGlvblN0YWNrJyk/LnJlc2V0KClcbiAgICBAZ2V0UHJvcCgnbXV0YXRpb25NYW5hZ2VyJyk/LnJlc2V0KClcblxuICBpc1Zpc2libGU6IC0+XG4gICAgQGVkaXRvciBpbiBAdXRpbHMuZ2V0VmlzaWJsZUVkaXRvcnMoKVxuXG4gICMgRklYTUU6IG5hbWluZywgdXBkYXRlTGFzdFNlbGVjdGVkSW5mbyA/XG4gIHVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uOiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgcHJvcGVydGllcyA9IEBnZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCk/LmdldFByb3BlcnRpZXMoKVxuICAgIGVsc2VcbiAgICAgIHByb3BlcnRpZXMgPSBAc3dyYXAoQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLmdldFByb3BlcnRpZXMoKVxuXG4gICAgIyBUT0RPIzcwNCB3aGVuIGN1cnNvciBpcyBhZGRlZCBpbiB2aXN1YWwtbW9kZSwgY29ycmVzcG9uZGluZyBzZWxlY3Rpb24gcHJvcCB5ZXQgbm90IGV4aXN0cy5cbiAgICByZXR1cm4gdW5sZXNzIHByb3BlcnRpZXNcblxuICAgIHtoZWFkLCB0YWlsfSA9IHByb3BlcnRpZXNcblxuICAgIGlmIGhlYWQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodGFpbClcbiAgICAgIFtzdGFydCwgZW5kXSA9IFt0YWlsLCBoZWFkXVxuICAgICAgaGVhZCA9IGVuZCA9IEB1dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZW5kLCAnZm9yd2FyZCcpXG4gICAgZWxzZVxuICAgICAgW3N0YXJ0LCBlbmRdID0gW2hlYWQsIHRhaWxdXG4gICAgICB0YWlsID0gZW5kID0gQHV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBlbmQsICdmb3J3YXJkJylcblxuICAgIEBtYXJrLnNldCgnPCcsIHN0YXJ0KVxuICAgIEBtYXJrLnNldCgnPicsIGVuZClcbiAgICBAcHJldmlvdXNTZWxlY3Rpb24gPSB7cHJvcGVydGllczoge2hlYWQsIHRhaWx9LCBAc3VibW9kZX1cblxuICAjIFBlcnNpc3RlbnQgc2VsZWN0aW9uXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNQZXJzaXN0ZW50U2VsZWN0aW9uczogLT5cbiAgICBAZ2V0UHJvcCgncGVyc2lzdGVudFNlbGVjdGlvbicpPy5oYXNNYXJrZXJzKClcblxuICBnZXRQZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2VzOiAtPlxuICAgIEBnZXRQcm9wKCdwZXJzaXN0ZW50U2VsZWN0aW9uJyk/LmdldE1hcmtlckJ1ZmZlclJhbmdlcygpID8gW11cblxuICBjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25zOiAtPlxuICAgIEBnZXRQcm9wKCdwZXJzaXN0ZW50U2VsZWN0aW9uJyk/LmNsZWFyTWFya2VycygpXG5cbiAgIyBBbmltYXRpb24gbWFuYWdlbWVudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2Nyb2xsQW5pbWF0aW9uRWZmZWN0OiBudWxsXG4gIHJlcXVlc3RTY3JvbGxBbmltYXRpb246IChmcm9tLCB0bywgb3B0aW9ucykgLT5cbiAgICBqUXVlcnkgPz0gcmVxdWlyZSgnYXRvbS1zcGFjZS1wZW4tdmlld3MnKS5qUXVlcnlcbiAgICBAc2Nyb2xsQW5pbWF0aW9uRWZmZWN0ID0galF1ZXJ5KGZyb20pLmFuaW1hdGUodG8sIG9wdGlvbnMpXG5cbiAgZmluaXNoU2Nyb2xsQW5pbWF0aW9uOiAtPlxuICAgIEBzY3JvbGxBbmltYXRpb25FZmZlY3Q/LmZpbmlzaCgpXG4gICAgQHNjcm9sbEFuaW1hdGlvbkVmZmVjdCA9IG51bGxcblxuICAjIE90aGVyXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzYXZlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IG51bGxcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyPy5kZXN0cm95KClcblxuICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgICAgcG9pbnQgPSBAc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG4gICAgZWxzZVxuICAgICAgcG9pbnQgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBAb3JpZ2luYWxDdXJzb3JQb3NpdGlvbiA9IHBvaW50XG4gICAgQG9yaWdpbmFsQ3Vyc29yUG9zaXRpb25CeU1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHBvaW50LCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuXG4gIHJlc3RvcmVPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oQGdldE9yaWdpbmFsQ3Vyc29yUG9zaXRpb24oKSlcblxuICBnZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uXG5cbiAgZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbkJ5TWFya2VyOiAtPlxuICAgIEBvcmlnaW5hbEN1cnNvclBvc2l0aW9uQnlNYXJrZXIuZ2V0U3RhcnRCdWZmZXJQb3NpdGlvbigpXG4iXX0=
