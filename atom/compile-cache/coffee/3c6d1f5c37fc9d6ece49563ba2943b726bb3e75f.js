(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, _, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, collectCharPositionsInText, collectIndexInText, dispatch, getView, getVimState, globalState, inspect, isPoint, isRange, normalizeKeystrokes, rawKeystroke, ref, semver, supportedModeClass, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  semver = require('semver');

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  inspect = require('util').inspect;

  globalState = require('../lib/global-state');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.config.resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  beforeEach(function() {
    return globalState.reset();
  });

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  withMockPlatform = function(target, platform, fn) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    wrapper.appendChild(target);
    fn();
    return target.parentNode.removeChild(target);
  };

  buildKeydownEvent = function(key, options) {
    return KeymapManager.buildKeydownEvent(key, options);
  };

  buildKeydownEventFromKeystroke = function(keystroke, target) {
    var j, key, len, modifier, options, part, parts;
    modifier = ['ctrl', 'alt', 'shift', 'cmd'];
    parts = keystroke === '-' ? ['-'] : keystroke.split('-');
    options = {
      target: target
    };
    key = null;
    for (j = 0, len = parts.length; j < len; j++) {
      part = parts[j];
      if (indexOf.call(modifier, part) >= 0) {
        options[part] = true;
      } else {
        key = part;
      }
    }
    if (semver.satisfies(atom.getVersion(), '< 1.12')) {
      if (key === 'space') {
        key = ' ';
      }
    }
    return buildKeydownEvent(key, options);
  };

  buildTextInputEvent = function(key) {
    var event, eventArgs;
    eventArgs = [true, true, window, key];
    event = document.createEvent('TextEvent');
    event.initTextEvent.apply(event, ["textInput"].concat(slice.call(eventArgs)));
    return event;
  };

  rawKeystroke = function(keystrokes, target) {
    var event, j, key, len, ref1, results;
    ref1 = normalizeKeystrokes(keystrokes).split(/\s+/);
    results = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      key = ref1[j];
      event = buildKeydownEventFromKeystroke(key, target);
      results.push(atom.keymaps.handleKeyboardEvent(event));
    }
    return results;
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, ref1;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ref1 = [], editor = ref1[0], file = ref1[1], callback = ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage('vim-mode-plus');
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var main, vimState;
      main = atom.packages.getActivePackage('vim-mode-plus').mainModule;
      vimState = main.getEditorState(editor);
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(rawData) {
      this.rawData = rawData;
      this.lines = this.rawData.split("\n");
    }

    TextData.prototype.getLines = function(lines, arg) {
      var chomp, line, text;
      chomp = (arg != null ? arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
          results.push(this.lines[line]);
        }
        return results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getRaw = function() {
      return this.rawData;
    };

    return TextData;

  })();

  collectIndexInText = function(char, text) {
    var fromIndex, index, indexes;
    indexes = [];
    fromIndex = 0;
    while ((index = text.indexOf(char, fromIndex)) >= 0) {
      fromIndex = index + 1;
      indexes.push(index);
    }
    return indexes;
  };

  collectCharPositionsInText = function(char, text) {
    var i, index, j, l, len, len1, lineText, positions, ref1, ref2, rowNumber;
    positions = [];
    ref1 = text.split(/\n/);
    for (rowNumber = j = 0, len = ref1.length; j < len; rowNumber = ++j) {
      lineText = ref1[rowNumber];
      ref2 = collectIndexInText(char, lineText);
      for (i = l = 0, len1 = ref2.length; l < len1; i = ++l) {
        index = ref2[i];
        positions.push([rowNumber, index - i]);
      }
    }
    return positions;
  };

  VimEditor = (function() {
    var ensureExclusiveRules, ensureOptionsOrdered, setExclusiveRules, setOptionsOrdered;

    function VimEditor(vimState1) {
      var ref1;
      this.vimState = vimState1;
      this.keystroke = bind(this.keystroke, this);
      this.ensureByDispatch = bind(this.ensureByDispatch, this);
      this.bindEnsureOption = bind(this.bindEnsureOption, this);
      this.ensure = bind(this.ensure, this);
      this.set = bind(this.set, this);
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new Error(message + ": " + (inspect(invalidOptions)));
      }
    };

    VimEditor.prototype.validateExclusiveOptions = function(options, rules) {
      var allOptions, exclusiveOptions, option, results, violatingOptions;
      allOptions = Object.keys(options);
      results = [];
      for (option in rules) {
        exclusiveOptions = rules[option];
        if (!(option in options)) {
          continue;
        }
        violatingOptions = exclusiveOptions.filter(function(exclusiveOption) {
          return indexOf.call(allOptions, exclusiveOption) >= 0;
        });
        if (violatingOptions.length) {
          throw new Error(option + " is exclusive with [" + violatingOptions + "]");
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    setOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'grammar', 'cursor', 'cursorScreen', 'addCursor', 'cursorScreen', 'register', 'selectedBufferRange'];

    setExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.set = function(options) {
      var j, len, method, name, results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      this.validateExclusiveOptions(options, setExclusiveRules);
      results = [];
      for (j = 0, len = setOptionsOrdered.length; j < len; j++) {
        name = setOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setText_ = function(text) {
      return this.setText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      this.setText(text.replace(/[\|!]/g, ''));
      cursors = cursors.concat(lastCursor);
      if (cursors.length) {
        return this.setCursor(cursors);
      }
    };

    VimEditor.prototype.setTextC_ = function(text) {
      return this.setTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setCursorScreen = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var j, len, point, ref1, results;
      ref1 = toArrayOfPoint(points);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        point = ref1[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, results, value;
      results = [];
      for (name in register) {
        value = register[name];
        results.push(this.vimState.register.set(name, value));
      }
      return results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'selectedText', 'selectedText_', 'selectedTextOrdered', "selectionIsNarrowed", 'cursor', 'cursorScreen', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'persistentSelectionBufferRange', 'persistentSelectionCount', 'occurrenceCount', 'occurrenceText', 'propertyHead', 'propertyTail', 'scrollTop', 'mark', 'mode'];

    ensureExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.getAndDeleteKeystrokeOptions = function(options) {
      var partialMatchTimeout;
      partialMatchTimeout = options.partialMatchTimeout;
      delete options.partialMatchTimeout;
      return {
        partialMatchTimeout: partialMatchTimeout
      };
    };

    VimEditor.prototype.ensure = function() {
      var args, j, keystroke, keystrokeOptions, len, method, name, options, results;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          options = args[0];
          break;
        case 2:
          keystroke = args[0], options = args[1];
      }
      if (typeof options !== 'object') {
        throw new Error("Invalid options for 'ensure': must be 'object' but got '" + (typeof options) + "'");
      }
      if ((keystroke != null) && !(typeof keystroke === 'string' || Array.isArray(keystroke))) {
        throw new Error("Invalid keystroke for 'ensure': must be 'string' or 'array' but got '" + (typeof keystroke) + "'");
      }
      keystrokeOptions = this.getAndDeleteKeystrokeOptions(options);
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      this.validateExclusiveOptions(options, ensureExclusiveRules);
      if (!_.isEmpty(keystroke)) {
        this.keystroke(keystroke, keystrokeOptions);
      }
      results = [];
      for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
        name = ensureOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.bindEnsureOption = function(optionsBase) {
      return (function(_this) {
        return function(keystroke, options) {
          var intersectingOptions;
          intersectingOptions = _.intersection(_.keys(options), _.keys(optionsBase));
          if (intersectingOptions.length) {
            throw new Error("conflict with bound options " + (inspect(intersectingOptions)));
          }
          return _this.ensure(keystroke, _.defaults(_.clone(options), optionsBase));
        };
      })(this);
    };

    VimEditor.prototype.ensureByDispatch = function(command, options) {
      var j, len, method, name, results;
      dispatch(atom.views.getView(this.editor), command);
      results = [];
      for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
        name = ensureOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureText_ = function(text) {
      return this.ensureText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      cursors = cursors.concat(lastCursor);
      cursors = cursors.map(function(point) {
        return Point.fromObject(point);
      }).sort(function(a, b) {
        return a.compare(b);
      });
      this.ensureText(text.replace(/[\|!]/g, ''));
      if (cursors.length) {
        this.ensureCursor(cursors, true);
      }
      if (lastCursor.length) {
        return expect(this.editor.getCursorBufferPosition()).toEqual(lastCursor[0]);
      }
    };

    VimEditor.prototype.ensureTextC_ = function(text) {
      return this.ensureTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(s.getText());
        }
        return results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectedText_ = function(text, ordered) {
      return this.ensureSelectedText(text.replace(/_/g, ' '), ordered);
    };

    VimEditor.prototype.ensureSelectionIsNarrowed = function(isNarrowed) {
      var actual;
      actual = this.vimState.modeManager.isNarrowed();
      return expect(actual).toEqual(isNarrowed);
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points, ordered) {
      var actual;
      if (ordered == null) {
        ordered = false;
      }
      actual = this.editor.getCursorBufferPositions();
      actual = actual.sort(function(a, b) {
        if (ordered) {
          return a.compare(b);
        }
      });
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorScreen = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var _value, ensure, name, property, reg, results, selection;
      results = [];
      for (name in register) {
        ensure = register[name];
        selection = ensure.selection;
        delete ensure.selection;
        reg = this.vimState.register.get(name, selection);
        results.push((function() {
          var results1;
          results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            results1.push(expect(reg[property]).toEqual(_value));
          }
          return results1;
        })());
      }
      return results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(fn(s));
        }
        return results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual, j, len, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        actual = selection.isReversed();
        results.push(expect(actual).toBe(reversed));
      }
      return results;
    };

    VimEditor.prototype.ensurePersistentSelectionBufferRange = function(range) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerBufferRanges();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensurePersistentSelectionCount = function(number) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceCount = function(number) {
      var actual;
      actual = this.vimState.occurrenceManager.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceText = function(text) {
      var actual, markers, r, ranges;
      markers = this.vimState.occurrenceManager.getMarkers();
      ranges = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = markers.length; j < len; j++) {
          r = markers[j];
          results.push(r.getBufferRange());
        }
        return results;
      })();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = ranges.length; j < len; j++) {
          r = ranges[j];
          results.push(this.editor.getTextInBufferRange(r));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensurePropertyHead = function(points) {
      var actual, getHeadProperty, s;
      getHeadProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('head', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getHeadProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensurePropertyTail = function(points) {
      var actual, getTailProperty, s;
      getTailProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('tail', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getTailProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMark = function(mark) {
      var actual, name, point, results;
      results = [];
      for (name in mark) {
        point = mark[name];
        actual = this.vimState.mark.get(name);
        results.push(expect(actual).toEqual(point));
      }
      return results;
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var j, l, len, len1, m, ref1, results, shouldNotContainClasses;
      mode = toArray(mode).slice();
      expect((ref1 = this.vimState).isMode.apply(ref1, mode)).toBe(true);
      mode[0] = mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (j = 0, len = mode.length; j < len; j++) {
        m = mode[j];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      results = [];
      for (l = 0, len1 = shouldNotContainClasses.length; l < len1; l++) {
        m = shouldNotContainClasses[l];
        results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return results;
    };

    VimEditor.prototype.keystroke = function(keys, options) {
      var _key, finished, j, k, l, len, len1, ref1, ref2, target;
      if (options == null) {
        options = {};
      }
      if (options.waitsForFinish) {
        finished = false;
        this.vimState.onDidFinishOperation(function() {
          return finished = true;
        });
        delete options.waitsForFinish;
        this.keystroke(keys, options);
        waitsFor(function() {
          return finished;
        });
        return;
      }
      target = this.editorElement;
      ref1 = toArray(keys);
      for (j = 0, len = ref1.length; j < len; j++) {
        k = ref1[j];
        if (_.isString(k)) {
          rawKeystroke(k, target);
        } else {
          switch (false) {
            case k.input == null:
              ref2 = k.input.split('');
              for (l = 0, len1 = ref2.length; l < len1; l++) {
                _key = ref2[l];
                rawKeystroke(_key, target);
              }
              break;
            case k.search == null:
              if (k.search) {
                this.vimState.searchInput.editor.insertText(k.search);
              }
              atom.commands.dispatch(this.vimState.searchInput.editorElement, 'core:confirm');
              break;
            default:
              rawKeystroke(k, target);
          }
        }
      }
      if (options.partialMatchTimeout) {
        return advanceClock(atom.keymaps.getPartialMatchTimeout());
      }
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData,
    withMockPlatform: withMockPlatform,
    rawKeystroke: rawKeystroke
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvc3BlYy1oZWxwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4WEFBQTtJQUFBOzs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWU7O0VBQ2QsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFDWixXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUVkLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7RUFDNUIsc0JBQXVCLE9BQUEsQ0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVosR0FBMkIsdUNBQW5DOztFQUV4QixrQkFBQSxHQUFxQixDQUNuQixhQURtQixFQUVuQixhQUZtQixFQUduQixhQUhtQixFQUluQixTQUptQixFQUtuQixVQUxtQixFQU1uQixXQU5tQixFQU9uQixlQVBtQjs7RUFZckIsVUFBQSxDQUFXLFNBQUE7V0FDVCxXQUFXLENBQUMsS0FBWixDQUFBO0VBRFMsQ0FBWDs7RUFLQSxPQUFBLEdBQVUsU0FBQyxLQUFEO1dBQ1IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLEtBQW5CO0VBRFE7O0VBR1YsUUFBQSxHQUFXLFNBQUMsTUFBRCxFQUFTLE9BQVQ7V0FDVCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsTUFBdkIsRUFBK0IsT0FBL0I7RUFEUzs7RUFHWCxnQkFBQSxHQUFtQixTQUFDLE1BQUQsRUFBUyxRQUFULEVBQW1CLEVBQW5CO0FBQ2pCLFFBQUE7SUFBQSxPQUFBLEdBQVUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7SUFDVixPQUFPLENBQUMsU0FBUixHQUFvQjtJQUNwQixPQUFPLENBQUMsV0FBUixDQUFvQixNQUFwQjtJQUNBLEVBQUEsQ0FBQTtXQUNBLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBbEIsQ0FBOEIsTUFBOUI7RUFMaUI7O0VBT25CLGlCQUFBLEdBQW9CLFNBQUMsR0FBRCxFQUFNLE9BQU47V0FDbEIsYUFBYSxDQUFDLGlCQUFkLENBQWdDLEdBQWhDLEVBQXFDLE9BQXJDO0VBRGtCOztFQUdwQiw4QkFBQSxHQUFpQyxTQUFDLFNBQUQsRUFBWSxNQUFaO0FBQy9CLFFBQUE7SUFBQSxRQUFBLEdBQVcsQ0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixPQUFoQixFQUF5QixLQUF6QjtJQUNYLEtBQUEsR0FBVyxTQUFBLEtBQWEsR0FBaEIsR0FDTixDQUFDLEdBQUQsQ0FETSxHQUdOLFNBQVMsQ0FBQyxLQUFWLENBQWdCLEdBQWhCO0lBRUYsT0FBQSxHQUFVO01BQUMsUUFBQSxNQUFEOztJQUNWLEdBQUEsR0FBTTtBQUNOLFNBQUEsdUNBQUE7O01BQ0UsSUFBRyxhQUFRLFFBQVIsRUFBQSxJQUFBLE1BQUg7UUFDRSxPQUFRLENBQUEsSUFBQSxDQUFSLEdBQWdCLEtBRGxCO09BQUEsTUFBQTtRQUdFLEdBQUEsR0FBTSxLQUhSOztBQURGO0lBTUEsSUFBRyxNQUFNLENBQUMsU0FBUCxDQUFpQixJQUFJLENBQUMsVUFBTCxDQUFBLENBQWpCLEVBQW9DLFFBQXBDLENBQUg7TUFDRSxJQUFhLEdBQUEsS0FBTyxPQUFwQjtRQUFBLEdBQUEsR0FBTSxJQUFOO09BREY7O1dBRUEsaUJBQUEsQ0FBa0IsR0FBbEIsRUFBdUIsT0FBdkI7RUFqQitCOztFQW1CakMsbUJBQUEsR0FBc0IsU0FBQyxHQUFEO0FBQ3BCLFFBQUE7SUFBQSxTQUFBLEdBQVksQ0FDVixJQURVLEVBRVYsSUFGVSxFQUdWLE1BSFUsRUFJVixHQUpVO0lBTVosS0FBQSxHQUFRLFFBQVEsQ0FBQyxXQUFULENBQXFCLFdBQXJCO0lBQ1IsS0FBSyxDQUFDLGFBQU4sY0FBb0IsQ0FBQSxXQUFhLFNBQUEsV0FBQSxTQUFBLENBQUEsQ0FBakM7V0FDQTtFQVRvQjs7RUFXdEIsWUFBQSxHQUFlLFNBQUMsVUFBRCxFQUFhLE1BQWI7QUFDYixRQUFBO0FBQUE7QUFBQTtTQUFBLHNDQUFBOztNQUNFLEtBQUEsR0FBUSw4QkFBQSxDQUErQixHQUEvQixFQUFvQyxNQUFwQzttQkFDUixJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFiLENBQWlDLEtBQWpDO0FBRkY7O0VBRGE7O0VBS2YsT0FBQSxHQUFVLFNBQUMsR0FBRDtJQUNSLElBQUcsR0FBQSxZQUFlLEtBQWxCO2FBQ0UsS0FERjtLQUFBLE1BQUE7YUFHRSxHQUFHLENBQUMsTUFBSixLQUFjLENBQWQsSUFBb0IsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxHQUFJLENBQUEsQ0FBQSxDQUFmLENBQXBCLElBQTJDLENBQUMsQ0FBQyxRQUFGLENBQVcsR0FBSSxDQUFBLENBQUEsQ0FBZixFQUg3Qzs7RUFEUTs7RUFNVixPQUFBLEdBQVUsU0FBQyxHQUFEO0lBQ1IsSUFBRyxHQUFBLFlBQWUsS0FBbEI7YUFDRSxLQURGO0tBQUEsTUFBQTthQUdFLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FDSixDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsQ0FESSxFQUVILEdBQUcsQ0FBQyxNQUFKLEtBQWMsQ0FGWCxFQUdKLE9BQUEsQ0FBUSxHQUFJLENBQUEsQ0FBQSxDQUFaLENBSEksRUFJSixPQUFBLENBQVEsR0FBSSxDQUFBLENBQUEsQ0FBWixDQUpJLENBQU4sRUFIRjs7RUFEUTs7RUFXVixPQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sSUFBTjs7TUFBTSxPQUFLOztJQUNuQixJQUFHLENBQUMsQ0FBQyxPQUFGLGdCQUFVLE9BQU8sR0FBakIsQ0FBSDthQUE4QixJQUE5QjtLQUFBLE1BQUE7YUFBdUMsQ0FBQyxHQUFELEVBQXZDOztFQURROztFQUdWLGNBQUEsR0FBaUIsU0FBQyxHQUFEO0lBQ2YsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsQ0FBQSxJQUFtQixPQUFBLENBQVEsR0FBSSxDQUFBLENBQUEsQ0FBWixDQUF0QjthQUNFLElBREY7S0FBQSxNQUFBO2FBR0UsQ0FBQyxHQUFELEVBSEY7O0VBRGU7O0VBTWpCLGNBQUEsR0FBaUIsU0FBQyxHQUFEO0lBQ2YsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsQ0FBQSxJQUFtQixDQUFDLENBQUMsR0FBRixDQUFNLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBQyxDQUFEO2FBQU8sT0FBQSxDQUFRLENBQVI7SUFBUCxDQUFSLENBQU4sQ0FBdEI7YUFDRSxJQURGO0tBQUEsTUFBQTthQUdFLENBQUMsR0FBRCxFQUhGOztFQURlOztFQVFqQixXQUFBLEdBQWMsU0FBQTtBQUNaLFFBQUE7SUFEYTtJQUNiLE9BQTJCLEVBQTNCLEVBQUMsZ0JBQUQsRUFBUyxjQUFULEVBQWU7QUFDZixZQUFPLElBQUksQ0FBQyxNQUFaO0FBQUEsV0FDTyxDQURQO1FBQ2UsV0FBWTtBQUFwQjtBQURQLFdBRU8sQ0FGUDtRQUVlLGNBQUQsRUFBTztBQUZyQjtJQUlBLGVBQUEsQ0FBZ0IsU0FBQTthQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixlQUE5QjtJQURjLENBQWhCO0lBR0EsZUFBQSxDQUFnQixTQUFBO01BQ2QsSUFBeUMsSUFBekM7UUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFiLENBQXlCLElBQXpCLEVBQVA7O2FBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLElBQXBCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsU0FBQyxDQUFEO2VBQU8sTUFBQSxHQUFTO01BQWhCLENBQS9CO0lBRmMsQ0FBaEI7V0FJQSxJQUFBLENBQUssU0FBQTtBQUNILFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixlQUEvQixDQUErQyxDQUFDO01BQ3ZELFFBQUEsR0FBVyxJQUFJLENBQUMsY0FBTCxDQUFvQixNQUFwQjthQUNYLFFBQUEsQ0FBUyxRQUFULEVBQXVCLElBQUEsU0FBQSxDQUFVLFFBQVYsQ0FBdkI7SUFIRyxDQUFMO0VBYlk7O0VBa0JSO0lBQ1Msa0JBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO01BQ1osSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBZSxJQUFmO0lBREU7O3VCQUdiLFFBQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBQ1IsVUFBQTtNQURpQix1QkFBRCxNQUFROztRQUN4QixRQUFTOztNQUNULElBQUEsR0FBTzs7QUFBQzthQUFBLHVDQUFBOzt1QkFBQSxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUE7QUFBUDs7bUJBQUQsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxJQUF0QztNQUNQLElBQUcsS0FBSDtlQUNFLEtBREY7T0FBQSxNQUFBO2VBR0UsSUFBQSxHQUFPLEtBSFQ7O0lBSFE7O3VCQVFWLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBO0lBREs7Ozs7OztFQUdWLGtCQUFBLEdBQXFCLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFDbkIsUUFBQTtJQUFBLE9BQUEsR0FBVTtJQUNWLFNBQUEsR0FBWTtBQUNaLFdBQU0sQ0FBQyxLQUFBLEdBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLFNBQW5CLENBQVQsQ0FBQSxJQUEyQyxDQUFqRDtNQUNFLFNBQUEsR0FBWSxLQUFBLEdBQVE7TUFDcEIsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFiO0lBRkY7V0FHQTtFQU5tQjs7RUFRckIsMEJBQUEsR0FBNkIsU0FBQyxJQUFELEVBQU8sSUFBUDtBQUMzQixRQUFBO0lBQUEsU0FBQSxHQUFZO0FBQ1o7QUFBQSxTQUFBLDhEQUFBOztBQUNFO0FBQUEsV0FBQSxnREFBQTs7UUFDRSxTQUFTLENBQUMsSUFBVixDQUFlLENBQUMsU0FBRCxFQUFZLEtBQUEsR0FBUSxDQUFwQixDQUFmO0FBREY7QUFERjtXQUdBO0VBTDJCOztFQU92QjtBQUNKLFFBQUE7O0lBQWEsbUJBQUMsU0FBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7Ozs7O01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtJQURBOzt3QkFHYixlQUFBLEdBQWlCLFNBQUMsT0FBRCxFQUFVLFlBQVYsRUFBd0IsT0FBeEI7QUFDZixVQUFBO01BQUEsY0FBQSxHQUFpQixDQUFDLENBQUMsT0FBRixVQUFVLENBQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFQLENBQWlCLFNBQUEsV0FBQSxZQUFBLENBQUEsQ0FBM0I7TUFDakIsSUFBRyxjQUFjLENBQUMsTUFBbEI7QUFDRSxjQUFVLElBQUEsS0FBQSxDQUFTLE9BQUQsR0FBUyxJQUFULEdBQVksQ0FBQyxPQUFBLENBQVEsY0FBUixDQUFELENBQXBCLEVBRFo7O0lBRmU7O3dCQUtqQix3QkFBQSxHQUEwQixTQUFDLE9BQUQsRUFBVSxLQUFWO0FBQ3hCLFVBQUE7TUFBQSxVQUFBLEdBQWEsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaO0FBQ2I7V0FBQSxlQUFBOztjQUEyQyxNQUFBLElBQVU7OztRQUNuRCxnQkFBQSxHQUFtQixnQkFBZ0IsQ0FBQyxNQUFqQixDQUF3QixTQUFDLGVBQUQ7aUJBQXFCLGFBQW1CLFVBQW5CLEVBQUEsZUFBQTtRQUFyQixDQUF4QjtRQUNuQixJQUFHLGdCQUFnQixDQUFDLE1BQXBCO0FBQ0UsZ0JBQVUsSUFBQSxLQUFBLENBQVMsTUFBRCxHQUFRLHNCQUFSLEdBQThCLGdCQUE5QixHQUErQyxHQUF2RCxFQURaO1NBQUEsTUFBQTsrQkFBQTs7QUFGRjs7SUFGd0I7O0lBTzFCLGlCQUFBLEdBQW9CLENBQ2xCLE1BRGtCLEVBQ1YsT0FEVSxFQUVsQixPQUZrQixFQUVULFFBRlMsRUFHbEIsU0FIa0IsRUFJbEIsUUFKa0IsRUFJUixjQUpRLEVBS2xCLFdBTGtCLEVBS0wsY0FMSyxFQU1sQixVQU5rQixFQU9sQixxQkFQa0I7O0lBVXBCLGlCQUFBLEdBQ0U7TUFBQSxLQUFBLEVBQU8sQ0FBQyxRQUFELEVBQVcsY0FBWCxDQUFQO01BQ0EsTUFBQSxFQUFRLENBQUMsUUFBRCxFQUFXLGNBQVgsQ0FEUjs7O3dCQUlGLEdBQUEsR0FBSyxTQUFDLE9BQUQ7QUFDSCxVQUFBO01BQUEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsT0FBakIsRUFBMEIsaUJBQTFCLEVBQTZDLHFCQUE3QztNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixPQUExQixFQUFtQyxpQkFBbkM7QUFFQTtXQUFBLG1EQUFBOztjQUFtQzs7O1FBQ2pDLE1BQUEsR0FBUyxLQUFBLEdBQVEsQ0FBQyxDQUFDLFVBQUYsQ0FBYSxDQUFDLENBQUMsUUFBRixDQUFXLElBQVgsQ0FBYjtxQkFDakIsSUFBSyxDQUFBLE1BQUEsQ0FBTCxDQUFhLE9BQVEsQ0FBQSxJQUFBLENBQXJCO0FBRkY7O0lBSkc7O3dCQVFMLE9BQUEsR0FBUyxTQUFDLElBQUQ7YUFDUCxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7SUFETzs7d0JBR1QsUUFBQSxHQUFVLFNBQUMsSUFBRDthQUNSLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLEdBQW5CLENBQVQ7SUFEUTs7d0JBR1YsUUFBQSxHQUFVLFNBQUMsSUFBRDtBQUNSLFVBQUE7TUFBQSxPQUFBLEdBQVUsMEJBQUEsQ0FBMkIsR0FBM0IsRUFBZ0MsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLEVBQW5CLENBQWhDO01BQ1YsVUFBQSxHQUFhLDBCQUFBLENBQTJCLEdBQTNCLEVBQWdDLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQixDQUFoQztNQUNiLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLEVBQXVCLEVBQXZCLENBQVQ7TUFDQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxVQUFmO01BQ1YsSUFBRyxPQUFPLENBQUMsTUFBWDtlQUNFLElBQUMsQ0FBQSxTQUFELENBQVcsT0FBWCxFQURGOztJQUxROzt3QkFRVixTQUFBLEdBQVcsU0FBQyxJQUFEO2FBQ1QsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsRUFBbUIsR0FBbkIsQ0FBVjtJQURTOzt3QkFHWCxVQUFBLEdBQVksU0FBQyxLQUFEO2FBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQWQsQ0FBa0MsS0FBbEMsQ0FBbkI7SUFEVTs7d0JBR1osU0FBQSxHQUFXLFNBQUMsTUFBRDtBQUNULFVBQUE7TUFBQSxNQUFBLEdBQVMsY0FBQSxDQUFlLE1BQWY7TUFDVCxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLE1BQU0sQ0FBQyxLQUFQLENBQUEsQ0FBaEM7QUFDQTtXQUFBLHdDQUFBOztxQkFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLHlCQUFSLENBQWtDLEtBQWxDO0FBREY7O0lBSFM7O3dCQU1YLGVBQUEsR0FBaUIsU0FBQyxNQUFEO0FBQ2YsVUFBQTtNQUFBLE1BQUEsR0FBUyxjQUFBLENBQWUsTUFBZjtNQUNULElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsTUFBTSxDQUFDLEtBQVAsQ0FBQSxDQUFoQztBQUNBO1dBQUEsd0NBQUE7O3FCQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMseUJBQVIsQ0FBa0MsS0FBbEM7QUFERjs7SUFIZTs7d0JBTWpCLFlBQUEsR0FBYyxTQUFDLE1BQUQ7QUFDWixVQUFBO0FBQUE7QUFBQTtXQUFBLHNDQUFBOztxQkFDRSxJQUFDLENBQUEsTUFBTSxDQUFDLHlCQUFSLENBQWtDLEtBQWxDO0FBREY7O0lBRFk7O3dCQUlkLFdBQUEsR0FBYSxTQUFDLFFBQUQ7QUFDWCxVQUFBO0FBQUE7V0FBQSxnQkFBQTs7cUJBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsSUFBdkIsRUFBNkIsS0FBN0I7QUFERjs7SUFEVzs7d0JBSWIsc0JBQUEsR0FBd0IsU0FBQyxLQUFEO2FBQ3RCLElBQUMsQ0FBQSxNQUFNLENBQUMsc0JBQVIsQ0FBK0IsS0FBL0I7SUFEc0I7O0lBR3hCLG9CQUFBLEdBQXVCLENBQ3JCLE1BRHFCLEVBQ2IsT0FEYSxFQUVyQixPQUZxQixFQUVaLFFBRlksRUFHckIsY0FIcUIsRUFHTCxlQUhLLEVBR1kscUJBSFosRUFHbUMscUJBSG5DLEVBSXJCLFFBSnFCLEVBSVgsY0FKVyxFQUtyQixZQUxxQixFQU1yQixVQU5xQixFQU9yQixxQkFQcUIsRUFPRSw0QkFQRixFQVFyQixxQkFScUIsRUFRRSw0QkFSRixFQVNyQixxQkFUcUIsRUFVckIsZ0NBVnFCLEVBVWEsMEJBVmIsRUFXckIsaUJBWHFCLEVBV0YsZ0JBWEUsRUFZckIsY0FacUIsRUFhckIsY0FicUIsRUFjckIsV0FkcUIsRUFlckIsTUFmcUIsRUFnQnJCLE1BaEJxQjs7SUFrQnZCLG9CQUFBLEdBQ0U7TUFBQSxLQUFBLEVBQU8sQ0FBQyxRQUFELEVBQVcsY0FBWCxDQUFQO01BQ0EsTUFBQSxFQUFRLENBQUMsUUFBRCxFQUFXLGNBQVgsQ0FEUjs7O3dCQUdGLDRCQUFBLEdBQThCLFNBQUMsT0FBRDtBQUM1QixVQUFBO01BQUMsc0JBQXVCO01BQ3hCLE9BQU8sT0FBTyxDQUFDO2FBQ2Y7UUFBQyxxQkFBQSxtQkFBRDs7SUFINEI7O3dCQU05QixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFETztBQUNQLGNBQU8sSUFBSSxDQUFDLE1BQVo7QUFBQSxhQUNPLENBRFA7VUFDZSxVQUFXO0FBQW5CO0FBRFAsYUFFTyxDQUZQO1VBRWUsbUJBQUQsRUFBWTtBQUYxQjtNQUlBLElBQU8sT0FBTyxPQUFQLEtBQW1CLFFBQTFCO0FBQ0UsY0FBVSxJQUFBLEtBQUEsQ0FBTSwwREFBQSxHQUEwRCxDQUFDLE9BQU8sT0FBUixDQUExRCxHQUEyRSxHQUFqRixFQURaOztNQUVBLElBQUcsbUJBQUEsSUFBZSxDQUFJLENBQUMsT0FBTyxTQUFQLEtBQXFCLFFBQXJCLElBQWlDLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBZCxDQUFsQyxDQUF0QjtBQUNFLGNBQVUsSUFBQSxLQUFBLENBQU0sdUVBQUEsR0FBdUUsQ0FBQyxPQUFPLFNBQVIsQ0FBdkUsR0FBMEYsR0FBaEcsRUFEWjs7TUFHQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsNEJBQUQsQ0FBOEIsT0FBOUI7TUFFbkIsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsT0FBakIsRUFBMEIsb0JBQTFCLEVBQWdELHVCQUFoRDtNQUNBLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixPQUExQixFQUFtQyxvQkFBbkM7TUFHQSxJQUFBLENBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxTQUFWLENBQVA7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLFNBQVgsRUFBc0IsZ0JBQXRCLEVBREY7O0FBR0E7V0FBQSxzREFBQTs7Y0FBc0M7OztRQUNwQyxNQUFBLEdBQVMsUUFBQSxHQUFXLENBQUMsQ0FBQyxVQUFGLENBQWEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFYLENBQWI7cUJBQ3BCLElBQUssQ0FBQSxNQUFBLENBQUwsQ0FBYSxPQUFRLENBQUEsSUFBQSxDQUFyQjtBQUZGOztJQW5CTTs7d0JBdUJSLGdCQUFBLEdBQWtCLFNBQUMsV0FBRDthQUNoQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsU0FBRCxFQUFZLE9BQVo7QUFDRSxjQUFBO1VBQUEsbUJBQUEsR0FBc0IsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQVAsQ0FBZixFQUFnQyxDQUFDLENBQUMsSUFBRixDQUFPLFdBQVAsQ0FBaEM7VUFDdEIsSUFBRyxtQkFBbUIsQ0FBQyxNQUF2QjtBQUNFLGtCQUFVLElBQUEsS0FBQSxDQUFNLDhCQUFBLEdBQThCLENBQUMsT0FBQSxDQUFRLG1CQUFSLENBQUQsQ0FBcEMsRUFEWjs7aUJBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxTQUFSLEVBQW1CLENBQUMsQ0FBQyxRQUFGLENBQVcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxPQUFSLENBQVgsRUFBNkIsV0FBN0IsQ0FBbkI7UUFMRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUFEZ0I7O3dCQVFsQixnQkFBQSxHQUFrQixTQUFDLE9BQUQsRUFBVSxPQUFWO0FBQ2hCLFVBQUE7TUFBQSxRQUFBLENBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUMsQ0FBQSxNQUFwQixDQUFULEVBQXNDLE9BQXRDO0FBQ0E7V0FBQSxzREFBQTs7Y0FBc0M7OztRQUNwQyxNQUFBLEdBQVMsUUFBQSxHQUFXLENBQUMsQ0FBQyxVQUFGLENBQWEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFYLENBQWI7cUJBQ3BCLElBQUssQ0FBQSxNQUFBLENBQUwsQ0FBYSxPQUFRLENBQUEsSUFBQSxDQUFyQjtBQUZGOztJQUZnQjs7d0JBTWxCLFVBQUEsR0FBWSxTQUFDLElBQUQ7YUFDVixNQUFBLENBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FBUCxDQUF5QixDQUFDLE9BQTFCLENBQWtDLElBQWxDO0lBRFU7O3dCQUdaLFdBQUEsR0FBYSxTQUFDLElBQUQ7YUFDWCxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixFQUFtQixHQUFuQixDQUFaO0lBRFc7O3dCQUdiLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDWCxVQUFBO01BQUEsT0FBQSxHQUFVLDBCQUFBLENBQTJCLEdBQTNCLEVBQWdDLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixFQUFtQixFQUFuQixDQUFoQztNQUNWLFVBQUEsR0FBYSwwQkFBQSxDQUEyQixHQUEzQixFQUFnQyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEIsQ0FBaEM7TUFDYixPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxVQUFmO01BQ1YsT0FBQSxHQUFVLE9BQ1IsQ0FBQyxHQURPLENBQ0gsU0FBQyxLQUFEO2VBQVcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7TUFBWCxDQURHLENBRVIsQ0FBQyxJQUZPLENBRUYsU0FBQyxDQUFELEVBQUksQ0FBSjtlQUFVLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBVjtNQUFWLENBRkU7TUFHVixJQUFDLENBQUEsVUFBRCxDQUFZLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixFQUF1QixFQUF2QixDQUFaO01BQ0EsSUFBRyxPQUFPLENBQUMsTUFBWDtRQUNFLElBQUMsQ0FBQSxZQUFELENBQWMsT0FBZCxFQUF1QixJQUF2QixFQURGOztNQUdBLElBQUcsVUFBVSxDQUFDLE1BQWQ7ZUFDRSxNQUFBLENBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxPQUExQyxDQUFrRCxVQUFXLENBQUEsQ0FBQSxDQUE3RCxFQURGOztJQVhXOzt3QkFjYixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQ1osSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsRUFBbUIsR0FBbkIsQ0FBYjtJQURZOzt3QkFHZCxrQkFBQSxHQUFvQixTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ2xCLFVBQUE7O1FBRHlCLFVBQVE7O01BQ2pDLFVBQUEsR0FBZ0IsT0FBSCxHQUNYLElBQUMsQ0FBQSxNQUFNLENBQUMsb0NBQVIsQ0FBQSxDQURXLEdBR1gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUE7TUFDRixNQUFBOztBQUFVO2FBQUEsNENBQUE7O3VCQUFBLENBQUMsQ0FBQyxPQUFGLENBQUE7QUFBQTs7O2FBQ1YsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBdUIsT0FBQSxDQUFRLElBQVIsQ0FBdkI7SUFOa0I7O3dCQVFwQixtQkFBQSxHQUFxQixTQUFDLElBQUQsRUFBTyxPQUFQO2FBQ25CLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsRUFBbUIsR0FBbkIsQ0FBcEIsRUFBNkMsT0FBN0M7SUFEbUI7O3dCQUdyQix5QkFBQSxHQUEyQixTQUFDLFVBQUQ7QUFDekIsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxVQUF0QixDQUFBO2FBQ1QsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBdUIsVUFBdkI7SUFGeUI7O3dCQUkzQix5QkFBQSxHQUEyQixTQUFDLElBQUQ7YUFDekIsSUFBQyxDQUFBLGtCQUFELENBQW9CLElBQXBCLEVBQTBCLElBQTFCO0lBRHlCOzt3QkFHM0IsWUFBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDWixVQUFBOztRQURxQixVQUFROztNQUM3QixNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyx3QkFBUixDQUFBO01BQ1QsTUFBQSxHQUFTLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBQyxDQUFELEVBQUksQ0FBSjtRQUFVLElBQWdCLE9BQWhCO2lCQUFBLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBVixFQUFBOztNQUFWLENBQVo7YUFDVCxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsT0FBZixDQUF1QixjQUFBLENBQWUsTUFBZixDQUF2QjtJQUhZOzt3QkFLZCxrQkFBQSxHQUFvQixTQUFDLE1BQUQ7QUFDbEIsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLHdCQUFSLENBQUE7YUFDVCxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsT0FBZixDQUF1QixjQUFBLENBQWUsTUFBZixDQUF2QjtJQUZrQjs7d0JBSXBCLGNBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ2QsVUFBQTtBQUFBO1dBQUEsZ0JBQUE7O1FBQ0csWUFBYTtRQUNkLE9BQU8sTUFBTSxDQUFDO1FBQ2QsR0FBQSxHQUFNLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLElBQXZCLEVBQTZCLFNBQTdCOzs7QUFDTjtlQUFBLGtCQUFBOzswQkFDRSxNQUFBLENBQU8sR0FBSSxDQUFBLFFBQUEsQ0FBWCxDQUFxQixDQUFDLE9BQXRCLENBQThCLE1BQTlCO0FBREY7OztBQUpGOztJQURjOzt3QkFRaEIsZ0JBQUEsR0FBa0IsU0FBQyxNQUFEO2FBQ2hCLE1BQUEsQ0FBTyxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQSxDQUFQLENBQTRCLENBQUMsWUFBN0IsQ0FBMEMsTUFBMUM7SUFEZ0I7O3dCQUdsQixzQkFBQSxHQUF3QixTQUFDLEtBQUQsRUFBUSxPQUFSLEVBQXVCLEVBQXZCO0FBQ3RCLFVBQUE7O1FBRDhCLFVBQVE7O01BQ3RDLFVBQUEsR0FBZ0IsT0FBSCxHQUNYLElBQUMsQ0FBQSxNQUFNLENBQUMsb0NBQVIsQ0FBQSxDQURXLEdBR1gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUE7TUFDRixNQUFBOztBQUFVO2FBQUEsNENBQUE7O3VCQUFBLEVBQUEsQ0FBRyxDQUFIO0FBQUE7OzthQUNWLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLGNBQUEsQ0FBZSxLQUFmLENBQXZCO0lBTnNCOzt3QkFReEIseUJBQUEsR0FBMkIsU0FBQyxLQUFELEVBQVEsT0FBUjs7UUFBUSxVQUFROzthQUN6QyxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsS0FBeEIsRUFBK0IsT0FBL0IsRUFBd0MsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLGNBQUYsQ0FBQTtNQUFQLENBQXhDO0lBRHlCOzt3QkFHM0IsZ0NBQUEsR0FBa0MsU0FBQyxLQUFEO2FBQ2hDLElBQUMsQ0FBQSx5QkFBRCxDQUEyQixLQUEzQixFQUFrQyxJQUFsQztJQURnQzs7d0JBR2xDLHlCQUFBLEdBQTJCLFNBQUMsS0FBRCxFQUFRLE9BQVI7O1FBQVEsVUFBUTs7YUFDekMsSUFBQyxDQUFBLHNCQUFELENBQXdCLEtBQXhCLEVBQStCLE9BQS9CLEVBQXdDLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxjQUFGLENBQUE7TUFBUCxDQUF4QztJQUR5Qjs7d0JBRzNCLGdDQUFBLEdBQWtDLFNBQUMsS0FBRDthQUNoQyxJQUFDLENBQUEseUJBQUQsQ0FBMkIsS0FBM0IsRUFBa0MsSUFBbEM7SUFEZ0M7O3dCQUdsQyx5QkFBQSxHQUEyQixTQUFDLFFBQUQ7QUFDekIsVUFBQTtBQUFBO0FBQUE7V0FBQSxzQ0FBQTs7UUFDRSxNQUFBLEdBQVMsU0FBUyxDQUFDLFVBQVYsQ0FBQTtxQkFDVCxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsSUFBZixDQUFvQixRQUFwQjtBQUZGOztJQUR5Qjs7d0JBSzNCLG9DQUFBLEdBQXNDLFNBQUMsS0FBRDtBQUNwQyxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFRLENBQUMsbUJBQW1CLENBQUMscUJBQTlCLENBQUE7YUFDVCxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsT0FBZixDQUF1QixjQUFBLENBQWUsS0FBZixDQUF2QjtJQUZvQzs7d0JBSXRDLDhCQUFBLEdBQWdDLFNBQUMsTUFBRDtBQUM5QixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxRQUFRLENBQUMsbUJBQW1CLENBQUMsY0FBOUIsQ0FBQTthQUNULE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxJQUFmLENBQW9CLE1BQXBCO0lBRjhCOzt3QkFJaEMscUJBQUEsR0FBdUIsU0FBQyxNQUFEO0FBQ3JCLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxjQUE1QixDQUFBO2FBQ1QsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsTUFBcEI7SUFGcUI7O3dCQUl2QixvQkFBQSxHQUFzQixTQUFDLElBQUQ7QUFDcEIsVUFBQTtNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFpQixDQUFDLFVBQTVCLENBQUE7TUFDVixNQUFBOztBQUFVO2FBQUEseUNBQUE7O3VCQUFBLENBQUMsQ0FBQyxjQUFGLENBQUE7QUFBQTs7O01BQ1YsTUFBQTs7QUFBVTthQUFBLHdDQUFBOzt1QkFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLENBQTdCO0FBQUE7OzthQUNWLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLE9BQUEsQ0FBUSxJQUFSLENBQXZCO0lBSm9COzt3QkFNdEIsa0JBQUEsR0FBb0IsU0FBQyxNQUFEO0FBQ2xCLFVBQUE7TUFBQSxlQUFBLEdBQWtCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUNoQixLQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBQyxvQkFBM0IsQ0FBZ0QsTUFBaEQsRUFBd0Q7WUFBQSxJQUFBLEVBQU0sQ0FBQyxVQUFELENBQU47V0FBeEQ7UUFEZ0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BRWxCLE1BQUE7O0FBQVU7QUFBQTthQUFBLHNDQUFBOzt1QkFBQSxlQUFBLENBQWdCLENBQWhCO0FBQUE7OzthQUNWLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLGNBQUEsQ0FBZSxNQUFmLENBQXZCO0lBSmtCOzt3QkFNcEIsa0JBQUEsR0FBb0IsU0FBQyxNQUFEO0FBQ2xCLFVBQUE7TUFBQSxlQUFBLEdBQWtCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxTQUFEO2lCQUNoQixLQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBQyxvQkFBM0IsQ0FBZ0QsTUFBaEQsRUFBd0Q7WUFBQSxJQUFBLEVBQU0sQ0FBQyxVQUFELENBQU47V0FBeEQ7UUFEZ0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BRWxCLE1BQUE7O0FBQVU7QUFBQTthQUFBLHNDQUFBOzt1QkFBQSxlQUFBLENBQWdCLENBQWhCO0FBQUE7OzthQUNWLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLGNBQUEsQ0FBZSxNQUFmLENBQXZCO0lBSmtCOzt3QkFNcEIsZUFBQSxHQUFpQixTQUFDLFNBQUQ7QUFDZixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFhLENBQUMsWUFBZixDQUFBO2FBQ1QsTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLE9BQWYsQ0FBdUIsU0FBdkI7SUFGZTs7d0JBSWpCLFVBQUEsR0FBWSxTQUFDLElBQUQ7QUFDVixVQUFBO0FBQUE7V0FBQSxZQUFBOztRQUNFLE1BQUEsR0FBUyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFmLENBQW1CLElBQW5CO3FCQUNULE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLEtBQXZCO0FBRkY7O0lBRFU7O3dCQUtaLFVBQUEsR0FBWSxTQUFDLElBQUQ7QUFDVixVQUFBO01BQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSLENBQWEsQ0FBQyxLQUFkLENBQUE7TUFDUCxNQUFBLENBQU8sUUFBQSxJQUFDLENBQUEsUUFBRCxDQUFTLENBQUMsTUFBVixhQUFpQixJQUFqQixDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsSUFBdkM7TUFFQSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQWEsSUFBSyxDQUFBLENBQUEsQ0FBTixHQUFTO01BQ3JCLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTCxDQUFZLFNBQUMsQ0FBRDtlQUFPO01BQVAsQ0FBWjtNQUNQLE1BQUEsQ0FBTyxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF6QixDQUFrQyxlQUFsQyxDQUFQLENBQTBELENBQUMsSUFBM0QsQ0FBZ0UsSUFBaEU7QUFDQSxXQUFBLHNDQUFBOztRQUNFLE1BQUEsQ0FBTyxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF6QixDQUFrQyxDQUFsQyxDQUFQLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsSUFBbEQ7QUFERjtNQUVBLHVCQUFBLEdBQTBCLENBQUMsQ0FBQyxVQUFGLENBQWEsa0JBQWIsRUFBaUMsSUFBakM7QUFDMUI7V0FBQSwyREFBQTs7cUJBQ0UsTUFBQSxDQUFPLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBUyxDQUFDLFFBQXpCLENBQWtDLENBQWxDLENBQVAsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxLQUFsRDtBQURGOztJQVZVOzt3QkFnQlosU0FBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDVCxVQUFBOztRQURnQixVQUFROztNQUN4QixJQUFHLE9BQU8sQ0FBQyxjQUFYO1FBQ0UsUUFBQSxHQUFXO1FBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxvQkFBVixDQUErQixTQUFBO2lCQUFHLFFBQUEsR0FBVztRQUFkLENBQS9CO1FBQ0EsT0FBTyxPQUFPLENBQUM7UUFDZixJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsT0FBakI7UUFDQSxRQUFBLENBQVMsU0FBQTtpQkFBRztRQUFILENBQVQ7QUFDQSxlQU5GOztNQVVBLE1BQUEsR0FBUyxJQUFDLENBQUE7QUFFVjtBQUFBLFdBQUEsc0NBQUE7O1FBQ0UsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLENBQVgsQ0FBSDtVQUNFLFlBQUEsQ0FBYSxDQUFiLEVBQWdCLE1BQWhCLEVBREY7U0FBQSxNQUFBO0FBR0Usa0JBQUEsS0FBQTtBQUFBLGlCQUNPLGVBRFA7QUFHSTtBQUFBLG1CQUFBLHdDQUFBOztnQkFBQSxZQUFBLENBQWEsSUFBYixFQUFtQixNQUFuQjtBQUFBO0FBRkc7QUFEUCxpQkFJTyxnQkFKUDtjQUtJLElBQXFELENBQUMsQ0FBQyxNQUF2RDtnQkFBQSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBN0IsQ0FBd0MsQ0FBQyxDQUFDLE1BQTFDLEVBQUE7O2NBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLElBQUMsQ0FBQSxRQUFRLENBQUMsV0FBVyxDQUFDLGFBQTdDLEVBQTRELGNBQTVEO0FBRkc7QUFKUDtjQVFJLFlBQUEsQ0FBYSxDQUFiLEVBQWdCLE1BQWhCO0FBUkosV0FIRjs7QUFERjtNQWNBLElBQUcsT0FBTyxDQUFDLG1CQUFYO2VBQ0UsWUFBQSxDQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQWIsQ0FBQSxDQUFiLEVBREY7O0lBM0JTOzs7Ozs7RUE4QmIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQyxhQUFBLFdBQUQ7SUFBYyxTQUFBLE9BQWQ7SUFBdUIsVUFBQSxRQUF2QjtJQUFpQyxVQUFBLFFBQWpDO0lBQTJDLGtCQUFBLGdCQUEzQztJQUE2RCxjQUFBLFlBQTdEOztBQTdkakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuc2VtdmVyID0gcmVxdWlyZSAnc2VtdmVyJ1xue1JhbmdlLCBQb2ludCwgRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcbmdsb2JhbFN0YXRlID0gcmVxdWlyZSAnLi4vbGliL2dsb2JhbC1zdGF0ZSdcblxuS2V5bWFwTWFuYWdlciA9IGF0b20ua2V5bWFwcy5jb25zdHJ1Y3Rvclxue25vcm1hbGl6ZUtleXN0cm9rZXN9ID0gcmVxdWlyZShhdG9tLmNvbmZpZy5yZXNvdXJjZVBhdGggKyBcIi9ub2RlX21vZHVsZXMvYXRvbS1rZXltYXAvbGliL2hlbHBlcnNcIilcblxuc3VwcG9ydGVkTW9kZUNsYXNzID0gW1xuICAnbm9ybWFsLW1vZGUnXG4gICd2aXN1YWwtbW9kZSdcbiAgJ2luc2VydC1tb2RlJ1xuICAncmVwbGFjZSdcbiAgJ2xpbmV3aXNlJ1xuICAnYmxvY2t3aXNlJ1xuICAnY2hhcmFjdGVyd2lzZSdcbl1cblxuIyBJbml0IHNwZWMgc3RhdGVcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYmVmb3JlRWFjaCAtPlxuICBnbG9iYWxTdGF0ZS5yZXNldCgpXG5cbiMgVXRpbHNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0VmlldyA9IChtb2RlbCkgLT5cbiAgYXRvbS52aWV3cy5nZXRWaWV3KG1vZGVsKVxuXG5kaXNwYXRjaCA9ICh0YXJnZXQsIGNvbW1hbmQpIC0+XG4gIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCBjb21tYW5kKVxuXG53aXRoTW9ja1BsYXRmb3JtID0gKHRhcmdldCwgcGxhdGZvcm0sIGZuKSAtPlxuICB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgd3JhcHBlci5jbGFzc05hbWUgPSBwbGF0Zm9ybVxuICB3cmFwcGVyLmFwcGVuZENoaWxkKHRhcmdldClcbiAgZm4oKVxuICB0YXJnZXQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0YXJnZXQpXG5cbmJ1aWxkS2V5ZG93bkV2ZW50ID0gKGtleSwgb3B0aW9ucykgLT5cbiAgS2V5bWFwTWFuYWdlci5idWlsZEtleWRvd25FdmVudChrZXksIG9wdGlvbnMpXG5cbmJ1aWxkS2V5ZG93bkV2ZW50RnJvbUtleXN0cm9rZSA9IChrZXlzdHJva2UsIHRhcmdldCkgLT5cbiAgbW9kaWZpZXIgPSBbJ2N0cmwnLCAnYWx0JywgJ3NoaWZ0JywgJ2NtZCddXG4gIHBhcnRzID0gaWYga2V5c3Ryb2tlIGlzICctJ1xuICAgIFsnLSddXG4gIGVsc2VcbiAgICBrZXlzdHJva2Uuc3BsaXQoJy0nKVxuXG4gIG9wdGlvbnMgPSB7dGFyZ2V0fVxuICBrZXkgPSBudWxsXG4gIGZvciBwYXJ0IGluIHBhcnRzXG4gICAgaWYgcGFydCBpbiBtb2RpZmllclxuICAgICAgb3B0aW9uc1twYXJ0XSA9IHRydWVcbiAgICBlbHNlXG4gICAgICBrZXkgPSBwYXJ0XG5cbiAgaWYgc2VtdmVyLnNhdGlzZmllcyhhdG9tLmdldFZlcnNpb24oKSwgJzwgMS4xMicpXG4gICAga2V5ID0gJyAnIGlmIGtleSBpcyAnc3BhY2UnXG4gIGJ1aWxkS2V5ZG93bkV2ZW50KGtleSwgb3B0aW9ucylcblxuYnVpbGRUZXh0SW5wdXRFdmVudCA9IChrZXkpIC0+XG4gIGV2ZW50QXJncyA9IFtcbiAgICB0cnVlICMgYnViYmxlc1xuICAgIHRydWUgIyBjYW5jZWxhYmxlXG4gICAgd2luZG93ICMgdmlld1xuICAgIGtleSAgIyBrZXkgY2hhclxuICBdXG4gIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ1RleHRFdmVudCcpXG4gIGV2ZW50LmluaXRUZXh0RXZlbnQoXCJ0ZXh0SW5wdXRcIiwgZXZlbnRBcmdzLi4uKVxuICBldmVudFxuXG5yYXdLZXlzdHJva2UgPSAoa2V5c3Ryb2tlcywgdGFyZ2V0KSAtPlxuICBmb3Iga2V5IGluIG5vcm1hbGl6ZUtleXN0cm9rZXMoa2V5c3Ryb2tlcykuc3BsaXQoL1xccysvKVxuICAgIGV2ZW50ID0gYnVpbGRLZXlkb3duRXZlbnRGcm9tS2V5c3Ryb2tlKGtleSwgdGFyZ2V0KVxuICAgIGF0b20ua2V5bWFwcy5oYW5kbGVLZXlib2FyZEV2ZW50KGV2ZW50KVxuXG5pc1BvaW50ID0gKG9iaikgLT5cbiAgaWYgb2JqIGluc3RhbmNlb2YgUG9pbnRcbiAgICB0cnVlXG4gIGVsc2VcbiAgICBvYmoubGVuZ3RoIGlzIDIgYW5kIF8uaXNOdW1iZXIob2JqWzBdKSBhbmQgXy5pc051bWJlcihvYmpbMV0pXG5cbmlzUmFuZ2UgPSAob2JqKSAtPlxuICBpZiBvYmogaW5zdGFuY2VvZiBSYW5nZVxuICAgIHRydWVcbiAgZWxzZVxuICAgIF8uYWxsKFtcbiAgICAgIF8uaXNBcnJheShvYmopLFxuICAgICAgKG9iai5sZW5ndGggaXMgMiksXG4gICAgICBpc1BvaW50KG9ialswXSksXG4gICAgICBpc1BvaW50KG9ialsxXSlcbiAgICBdKVxuXG50b0FycmF5ID0gKG9iaiwgY29uZD1udWxsKSAtPlxuICBpZiBfLmlzQXJyYXkoY29uZCA/IG9iaikgdGhlbiBvYmogZWxzZSBbb2JqXVxuXG50b0FycmF5T2ZQb2ludCA9IChvYmopIC0+XG4gIGlmIF8uaXNBcnJheShvYmopIGFuZCBpc1BvaW50KG9ialswXSlcbiAgICBvYmpcbiAgZWxzZVxuICAgIFtvYmpdXG5cbnRvQXJyYXlPZlJhbmdlID0gKG9iaikgLT5cbiAgaWYgXy5pc0FycmF5KG9iaikgYW5kIF8uYWxsKG9iai5tYXAgKGUpIC0+IGlzUmFuZ2UoZSkpXG4gICAgb2JqXG4gIGVsc2VcbiAgICBbb2JqXVxuXG4jIE1haW5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0VmltU3RhdGUgPSAoYXJncy4uLikgLT5cbiAgW2VkaXRvciwgZmlsZSwgY2FsbGJhY2tdID0gW11cbiAgc3dpdGNoIGFyZ3MubGVuZ3RoXG4gICAgd2hlbiAxIHRoZW4gW2NhbGxiYWNrXSA9IGFyZ3NcbiAgICB3aGVuIDIgdGhlbiBbZmlsZSwgY2FsbGJhY2tdID0gYXJnc1xuXG4gIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJylcblxuICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICBmaWxlID0gYXRvbS5wcm9qZWN0LnJlc29sdmVQYXRoKGZpbGUpIGlmIGZpbGVcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGUpLnRoZW4gKGUpIC0+IGVkaXRvciA9IGVcblxuICBydW5zIC0+XG4gICAgbWFpbiA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgndmltLW1vZGUtcGx1cycpLm1haW5Nb2R1bGVcbiAgICB2aW1TdGF0ZSA9IG1haW4uZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKVxuICAgIGNhbGxiYWNrKHZpbVN0YXRlLCBuZXcgVmltRWRpdG9yKHZpbVN0YXRlKSlcblxuY2xhc3MgVGV4dERhdGFcbiAgY29uc3RydWN0b3I6IChAcmF3RGF0YSkgLT5cbiAgICBAbGluZXMgPSBAcmF3RGF0YS5zcGxpdChcIlxcblwiKVxuXG4gIGdldExpbmVzOiAobGluZXMsIHtjaG9tcH09e30pIC0+XG4gICAgY2hvbXAgPz0gZmFsc2VcbiAgICB0ZXh0ID0gKEBsaW5lc1tsaW5lXSBmb3IgbGluZSBpbiBsaW5lcykuam9pbihcIlxcblwiKVxuICAgIGlmIGNob21wXG4gICAgICB0ZXh0XG4gICAgZWxzZVxuICAgICAgdGV4dCArIFwiXFxuXCJcblxuICBnZXRSYXc6IC0+XG4gICAgQHJhd0RhdGFcblxuY29sbGVjdEluZGV4SW5UZXh0ID0gKGNoYXIsIHRleHQpIC0+XG4gIGluZGV4ZXMgPSBbXVxuICBmcm9tSW5kZXggPSAwXG4gIHdoaWxlIChpbmRleCA9IHRleHQuaW5kZXhPZihjaGFyLCBmcm9tSW5kZXgpKSA+PSAwXG4gICAgZnJvbUluZGV4ID0gaW5kZXggKyAxXG4gICAgaW5kZXhlcy5wdXNoKGluZGV4KVxuICBpbmRleGVzXG5cbmNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0ID0gKGNoYXIsIHRleHQpIC0+XG4gIHBvc2l0aW9ucyA9IFtdXG4gIGZvciBsaW5lVGV4dCwgcm93TnVtYmVyIGluIHRleHQuc3BsaXQoL1xcbi8pXG4gICAgZm9yIGluZGV4LCBpIGluIGNvbGxlY3RJbmRleEluVGV4dChjaGFyLCBsaW5lVGV4dClcbiAgICAgIHBvc2l0aW9ucy5wdXNoKFtyb3dOdW1iZXIsIGluZGV4IC0gaV0pXG4gIHBvc2l0aW9uc1xuXG5jbGFzcyBWaW1FZGl0b3JcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuXG4gIHZhbGlkYXRlT3B0aW9uczogKG9wdGlvbnMsIHZhbGlkT3B0aW9ucywgbWVzc2FnZSkgLT5cbiAgICBpbnZhbGlkT3B0aW9ucyA9IF8ud2l0aG91dChfLmtleXMob3B0aW9ucyksIHZhbGlkT3B0aW9ucy4uLilcbiAgICBpZiBpbnZhbGlkT3B0aW9ucy5sZW5ndGhcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIiN7bWVzc2FnZX06ICN7aW5zcGVjdChpbnZhbGlkT3B0aW9ucyl9XCIpXG5cbiAgdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zOiAob3B0aW9ucywgcnVsZXMpIC0+XG4gICAgYWxsT3B0aW9ucyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpXG4gICAgZm9yIG9wdGlvbiwgZXhjbHVzaXZlT3B0aW9ucyBvZiBydWxlcyB3aGVuIG9wdGlvbiBvZiBvcHRpb25zXG4gICAgICB2aW9sYXRpbmdPcHRpb25zID0gZXhjbHVzaXZlT3B0aW9ucy5maWx0ZXIgKGV4Y2x1c2l2ZU9wdGlvbikgLT4gZXhjbHVzaXZlT3B0aW9uIGluIGFsbE9wdGlvbnNcbiAgICAgIGlmIHZpb2xhdGluZ09wdGlvbnMubGVuZ3RoXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIiN7b3B0aW9ufSBpcyBleGNsdXNpdmUgd2l0aCBbI3t2aW9sYXRpbmdPcHRpb25zfV1cIilcblxuICBzZXRPcHRpb25zT3JkZXJlZCA9IFtcbiAgICAndGV4dCcsICd0ZXh0XycsXG4gICAgJ3RleHRDJywgJ3RleHRDXycsXG4gICAgJ2dyYW1tYXInLFxuICAgICdjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ1xuICAgICdhZGRDdXJzb3InLCAnY3Vyc29yU2NyZWVuJ1xuICAgICdyZWdpc3RlcicsXG4gICAgJ3NlbGVjdGVkQnVmZmVyUmFuZ2UnXG4gIF1cblxuICBzZXRFeGNsdXNpdmVSdWxlcyA9XG4gICAgdGV4dEM6IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG4gICAgdGV4dENfOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuXG4gICMgUHVibGljXG4gIHNldDogKG9wdGlvbnMpID0+XG4gICAgQHZhbGlkYXRlT3B0aW9ucyhvcHRpb25zLCBzZXRPcHRpb25zT3JkZXJlZCwgJ0ludmFsaWQgc2V0IG9wdGlvbnMnKVxuICAgIEB2YWxpZGF0ZUV4Y2x1c2l2ZU9wdGlvbnMob3B0aW9ucywgc2V0RXhjbHVzaXZlUnVsZXMpXG5cbiAgICBmb3IgbmFtZSBpbiBzZXRPcHRpb25zT3JkZXJlZCB3aGVuIG9wdGlvbnNbbmFtZV0/XG4gICAgICBtZXRob2QgPSAnc2V0JyArIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKG5hbWUpKVxuICAgICAgdGhpc1ttZXRob2RdKG9wdGlvbnNbbmFtZV0pXG5cbiAgc2V0VGV4dDogKHRleHQpIC0+XG4gICAgQGVkaXRvci5zZXRUZXh0KHRleHQpXG5cbiAgc2V0VGV4dF86ICh0ZXh0KSAtPlxuICAgIEBzZXRUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIHNldFRleHRDOiAodGV4dCkgLT5cbiAgICBjdXJzb3JzID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJ3wnLCB0ZXh0LnJlcGxhY2UoLyEvZywgJycpKVxuICAgIGxhc3RDdXJzb3IgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnIScsIHRleHQucmVwbGFjZSgvXFx8L2csICcnKSlcbiAgICBAc2V0VGV4dCh0ZXh0LnJlcGxhY2UoL1tcXHwhXS9nLCAnJykpXG4gICAgY3Vyc29ycyA9IGN1cnNvcnMuY29uY2F0KGxhc3RDdXJzb3IpXG4gICAgaWYgY3Vyc29ycy5sZW5ndGhcbiAgICAgIEBzZXRDdXJzb3IoY3Vyc29ycylcblxuICBzZXRUZXh0Q186ICh0ZXh0KSAtPlxuICAgIEBzZXRUZXh0Qyh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBzZXRHcmFtbWFyOiAoc2NvcGUpIC0+XG4gICAgQGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZSkpXG5cbiAgc2V0Q3Vyc29yOiAocG9pbnRzKSAtPlxuICAgIHBvaW50cyA9IHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50cy5zaGlmdCgpKVxuICAgIGZvciBwb2ludCBpbiBwb2ludHNcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBzZXRDdXJzb3JTY3JlZW46IChwb2ludHMpIC0+XG4gICAgcG9pbnRzID0gdG9BcnJheU9mUG9pbnQocG9pbnRzKVxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24ocG9pbnRzLnNoaWZ0KCkpXG4gICAgZm9yIHBvaW50IGluIHBvaW50c1xuICAgICAgQGVkaXRvci5hZGRDdXJzb3JBdFNjcmVlblBvc2l0aW9uKHBvaW50KVxuXG4gIHNldEFkZEN1cnNvcjogKHBvaW50cykgLT5cbiAgICBmb3IgcG9pbnQgaW4gdG9BcnJheU9mUG9pbnQocG9pbnRzKVxuICAgICAgQGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHNldFJlZ2lzdGVyOiAocmVnaXN0ZXIpIC0+XG4gICAgZm9yIG5hbWUsIHZhbHVlIG9mIHJlZ2lzdGVyXG4gICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KG5hbWUsIHZhbHVlKVxuXG4gIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgZW5zdXJlT3B0aW9uc09yZGVyZWQgPSBbXG4gICAgJ3RleHQnLCAndGV4dF8nLFxuICAgICd0ZXh0QycsICd0ZXh0Q18nLFxuICAgICdzZWxlY3RlZFRleHQnLCAnc2VsZWN0ZWRUZXh0XycsICdzZWxlY3RlZFRleHRPcmRlcmVkJywgXCJzZWxlY3Rpb25Jc05hcnJvd2VkXCJcbiAgICAnY3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAnbnVtQ3Vyc29ycydcbiAgICAncmVnaXN0ZXInLFxuICAgICdzZWxlY3RlZFNjcmVlblJhbmdlJywgJ3NlbGVjdGVkU2NyZWVuUmFuZ2VPcmRlcmVkJ1xuICAgICdzZWxlY3RlZEJ1ZmZlclJhbmdlJywgJ3NlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkJ1xuICAgICdzZWxlY3Rpb25Jc1JldmVyc2VkJyxcbiAgICAncGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlJywgJ3BlcnNpc3RlbnRTZWxlY3Rpb25Db3VudCdcbiAgICAnb2NjdXJyZW5jZUNvdW50JywgJ29jY3VycmVuY2VUZXh0J1xuICAgICdwcm9wZXJ0eUhlYWQnXG4gICAgJ3Byb3BlcnR5VGFpbCdcbiAgICAnc2Nyb2xsVG9wJyxcbiAgICAnbWFyaydcbiAgICAnbW9kZScsXG4gIF1cbiAgZW5zdXJlRXhjbHVzaXZlUnVsZXMgPVxuICAgIHRleHRDOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuICAgIHRleHRDXzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cblxuICBnZXRBbmREZWxldGVLZXlzdHJva2VPcHRpb25zOiAob3B0aW9ucykgLT5cbiAgICB7cGFydGlhbE1hdGNoVGltZW91dH0gPSBvcHRpb25zXG4gICAgZGVsZXRlIG9wdGlvbnMucGFydGlhbE1hdGNoVGltZW91dFxuICAgIHtwYXJ0aWFsTWF0Y2hUaW1lb3V0fVxuXG4gICMgUHVibGljXG4gIGVuc3VyZTogKGFyZ3MuLi4pID0+XG4gICAgc3dpdGNoIGFyZ3MubGVuZ3RoXG4gICAgICB3aGVuIDEgdGhlbiBbb3B0aW9uc10gPSBhcmdzXG4gICAgICB3aGVuIDIgdGhlbiBba2V5c3Ryb2tlLCBvcHRpb25zXSA9IGFyZ3NcblxuICAgIHVubGVzcyB0eXBlb2Yob3B0aW9ucykgaXMgJ29iamVjdCdcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3B0aW9ucyBmb3IgJ2Vuc3VyZSc6IG11c3QgYmUgJ29iamVjdCcgYnV0IGdvdCAnI3t0eXBlb2Yob3B0aW9ucyl9J1wiKVxuICAgIGlmIGtleXN0cm9rZT8gYW5kIG5vdCAodHlwZW9mKGtleXN0cm9rZSkgaXMgJ3N0cmluZycgb3IgQXJyYXkuaXNBcnJheShrZXlzdHJva2UpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBrZXlzdHJva2UgZm9yICdlbnN1cmUnOiBtdXN0IGJlICdzdHJpbmcnIG9yICdhcnJheScgYnV0IGdvdCAnI3t0eXBlb2Yoa2V5c3Ryb2tlKX0nXCIpXG5cbiAgICBrZXlzdHJva2VPcHRpb25zID0gQGdldEFuZERlbGV0ZUtleXN0cm9rZU9wdGlvbnMob3B0aW9ucylcblxuICAgIEB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgZW5zdXJlT3B0aW9uc09yZGVyZWQsICdJbnZhbGlkIGVuc3VyZSBvcHRpb24nKVxuICAgIEB2YWxpZGF0ZUV4Y2x1c2l2ZU9wdGlvbnMob3B0aW9ucywgZW5zdXJlRXhjbHVzaXZlUnVsZXMpXG5cbiAgICAjIElucHV0XG4gICAgdW5sZXNzIF8uaXNFbXB0eShrZXlzdHJva2UpXG4gICAgICBAa2V5c3Ryb2tlKGtleXN0cm9rZSwga2V5c3Ryb2tlT3B0aW9ucylcblxuICAgIGZvciBuYW1lIGluIGVuc3VyZU9wdGlvbnNPcmRlcmVkIHdoZW4gb3B0aW9uc1tuYW1lXT9cbiAgICAgIG1ldGhvZCA9ICdlbnN1cmUnICsgXy5jYXBpdGFsaXplKF8uY2FtZWxpemUobmFtZSkpXG4gICAgICB0aGlzW21ldGhvZF0ob3B0aW9uc1tuYW1lXSlcblxuICBiaW5kRW5zdXJlT3B0aW9uOiAob3B0aW9uc0Jhc2UpID0+XG4gICAgKGtleXN0cm9rZSwgb3B0aW9ucykgPT5cbiAgICAgIGludGVyc2VjdGluZ09wdGlvbnMgPSBfLmludGVyc2VjdGlvbihfLmtleXMob3B0aW9ucyksIF8ua2V5cyhvcHRpb25zQmFzZSkpXG4gICAgICBpZiBpbnRlcnNlY3RpbmdPcHRpb25zLmxlbmd0aFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb25mbGljdCB3aXRoIGJvdW5kIG9wdGlvbnMgI3tpbnNwZWN0KGludGVyc2VjdGluZ09wdGlvbnMpfVwiKVxuXG4gICAgICBAZW5zdXJlKGtleXN0cm9rZSwgXy5kZWZhdWx0cyhfLmNsb25lKG9wdGlvbnMpLCBvcHRpb25zQmFzZSkpXG5cbiAgZW5zdXJlQnlEaXNwYXRjaDogKGNvbW1hbmQsIG9wdGlvbnMpID0+XG4gICAgZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KEBlZGl0b3IpLCBjb21tYW5kKVxuICAgIGZvciBuYW1lIGluIGVuc3VyZU9wdGlvbnNPcmRlcmVkIHdoZW4gb3B0aW9uc1tuYW1lXT9cbiAgICAgIG1ldGhvZCA9ICdlbnN1cmUnICsgXy5jYXBpdGFsaXplKF8uY2FtZWxpemUobmFtZSkpXG4gICAgICB0aGlzW21ldGhvZF0ob3B0aW9uc1tuYW1lXSlcblxuICBlbnN1cmVUZXh0OiAodGV4dCkgLT5cbiAgICBleHBlY3QoQGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwodGV4dClcblxuICBlbnN1cmVUZXh0XzogKHRleHQpIC0+XG4gICAgQGVuc3VyZVRleHQodGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgZW5zdXJlVGV4dEM6ICh0ZXh0KSAtPlxuICAgIGN1cnNvcnMgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnfCcsIHRleHQucmVwbGFjZSgvIS9nLCAnJykpXG4gICAgbGFzdEN1cnNvciA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCchJywgdGV4dC5yZXBsYWNlKC9cXHwvZywgJycpKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzLmNvbmNhdChsYXN0Q3Vyc29yKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzXG4gICAgICAubWFwIChwb2ludCkgLT4gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgICAgIC5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYilcbiAgICBAZW5zdXJlVGV4dCh0ZXh0LnJlcGxhY2UoL1tcXHwhXS9nLCAnJykpXG4gICAgaWYgY3Vyc29ycy5sZW5ndGhcbiAgICAgIEBlbnN1cmVDdXJzb3IoY3Vyc29ycywgdHJ1ZSlcblxuICAgIGlmIGxhc3RDdXJzb3IubGVuZ3RoXG4gICAgICBleHBlY3QoQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKGxhc3RDdXJzb3JbMF0pXG5cbiAgZW5zdXJlVGV4dENfOiAodGV4dCkgLT5cbiAgICBAZW5zdXJlVGV4dEModGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgZW5zdXJlU2VsZWN0ZWRUZXh0OiAodGV4dCwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBzZWxlY3Rpb25zID0gaWYgb3JkZXJlZFxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgYWN0dWFsID0gKHMuZ2V0VGV4dCgpIGZvciBzIGluIHNlbGVjdGlvbnMpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5KHRleHQpKVxuXG4gIGVuc3VyZVNlbGVjdGVkVGV4dF86ICh0ZXh0LCBvcmRlcmVkKSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZFRleHQodGV4dC5yZXBsYWNlKC9fL2csICcgJyksIG9yZGVyZWQpXG5cbiAgZW5zdXJlU2VsZWN0aW9uSXNOYXJyb3dlZDogKGlzTmFycm93ZWQpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwoaXNOYXJyb3dlZClcblxuICBlbnN1cmVTZWxlY3RlZFRleHRPcmRlcmVkOiAodGV4dCkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRUZXh0KHRleHQsIHRydWUpXG5cbiAgZW5zdXJlQ3Vyc29yOiAocG9pbnRzLCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcbiAgICBhY3R1YWwgPSBhY3R1YWwuc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpIGlmIG9yZGVyZWRcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlQ3Vyc29yU2NyZWVuOiAocG9pbnRzKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb25zKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlUmVnaXN0ZXI6IChyZWdpc3RlcikgLT5cbiAgICBmb3IgbmFtZSwgZW5zdXJlIG9mIHJlZ2lzdGVyXG4gICAgICB7c2VsZWN0aW9ufSA9IGVuc3VyZVxuICAgICAgZGVsZXRlIGVuc3VyZS5zZWxlY3Rpb25cbiAgICAgIHJlZyA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobmFtZSwgc2VsZWN0aW9uKVxuICAgICAgZm9yIHByb3BlcnR5LCBfdmFsdWUgb2YgZW5zdXJlXG4gICAgICAgIGV4cGVjdChyZWdbcHJvcGVydHldKS50b0VxdWFsKF92YWx1ZSlcblxuICBlbnN1cmVOdW1DdXJzb3JzOiAobnVtYmVyKSAtPlxuICAgIGV4cGVjdChAZWRpdG9yLmdldEN1cnNvcnMoKSkudG9IYXZlTGVuZ3RoIG51bWJlclxuXG4gIF9lbnN1cmVTZWxlY3RlZFJhbmdlQnk6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSwgZm4pIC0+XG4gICAgc2VsZWN0aW9ucyA9IGlmIG9yZGVyZWRcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIGFjdHVhbCA9IChmbihzKSBmb3IgcyBpbiBzZWxlY3Rpb25zKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUmFuZ2UocmFuZ2UpKVxuXG4gIGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2U6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBAX2Vuc3VyZVNlbGVjdGVkUmFuZ2VCeSByYW5nZSwgb3JkZXJlZCwgKHMpIC0+IHMuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gIGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2VPcmRlcmVkOiAocmFuZ2UpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2UocmFuZ2UsIHRydWUpXG5cbiAgZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZTogKHJhbmdlLCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIEBfZW5zdXJlU2VsZWN0ZWRSYW5nZUJ5IHJhbmdlLCBvcmRlcmVkLCAocykgLT4gcy5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IChyYW5nZSkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSwgdHJ1ZSlcblxuICBlbnN1cmVTZWxlY3Rpb25Jc1JldmVyc2VkOiAocmV2ZXJzZWQpIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgYWN0dWFsID0gc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgZXhwZWN0KGFjdHVhbCkudG9CZShyZXZlcnNlZClcblxuICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUmFuZ2UocmFuZ2UpKVxuXG4gIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogKG51bWJlcikgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJDb3VudCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9CZSBudW1iZXJcblxuICBlbnN1cmVPY2N1cnJlbmNlQ291bnQ6IChudW1iZXIpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckNvdW50KClcbiAgICBleHBlY3QoYWN0dWFsKS50b0JlIG51bWJlclxuXG4gIGVuc3VyZU9jY3VycmVuY2VUZXh0OiAodGV4dCkgLT5cbiAgICBtYXJrZXJzID0gQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlcnMoKVxuICAgIHJhbmdlcyA9IChyLmdldEJ1ZmZlclJhbmdlKCkgZm9yIHIgaW4gbWFya2VycylcbiAgICBhY3R1YWwgPSAoQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyKSBmb3IgciBpbiByYW5nZXMpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5KHRleHQpKVxuXG4gIGVuc3VyZVByb3BlcnR5SGVhZDogKHBvaW50cykgLT5cbiAgICBnZXRIZWFkUHJvcGVydHkgPSAoc2VsZWN0aW9uKSA9PlxuICAgICAgQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgYWN0dWFsID0gKGdldEhlYWRQcm9wZXJ0eShzKSBmb3IgcyBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSlcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlUHJvcGVydHlUYWlsOiAocG9pbnRzKSAtPlxuICAgIGdldFRhaWxQcm9wZXJ0eSA9IChzZWxlY3Rpb24pID0+XG4gICAgICBAdmltU3RhdGUuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcigndGFpbCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBhY3R1YWwgPSAoZ2V0VGFpbFByb3BlcnR5KHMpIGZvciBzIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVTY3JvbGxUb3A6IChzY3JvbGxUb3ApIC0+XG4gICAgYWN0dWFsID0gQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsIHNjcm9sbFRvcFxuXG4gIGVuc3VyZU1hcms6IChtYXJrKSAtPlxuICAgIGZvciBuYW1lLCBwb2ludCBvZiBtYXJrXG4gICAgICBhY3R1YWwgPSBAdmltU3RhdGUubWFyay5nZXQobmFtZSlcbiAgICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwocG9pbnQpXG5cbiAgZW5zdXJlTW9kZTogKG1vZGUpIC0+XG4gICAgbW9kZSA9IHRvQXJyYXkobW9kZSkuc2xpY2UoKVxuICAgIGV4cGVjdChAdmltU3RhdGUuaXNNb2RlKG1vZGUuLi4pKS50b0JlKHRydWUpXG5cbiAgICBtb2RlWzBdID0gXCIje21vZGVbMF19LW1vZGVcIlxuICAgIG1vZGUgPSBtb2RlLmZpbHRlcigobSkgLT4gbSlcbiAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd2aW0tbW9kZS1wbHVzJykpLnRvQmUodHJ1ZSlcbiAgICBmb3IgbSBpbiBtb2RlXG4gICAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKG0pKS50b0JlKHRydWUpXG4gICAgc2hvdWxkTm90Q29udGFpbkNsYXNzZXMgPSBfLmRpZmZlcmVuY2Uoc3VwcG9ydGVkTW9kZUNsYXNzLCBtb2RlKVxuICAgIGZvciBtIGluIHNob3VsZE5vdENvbnRhaW5DbGFzc2VzXG4gICAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKG0pKS50b0JlKGZhbHNlKVxuXG4gICMgUHVibGljXG4gICMgb3B0aW9uc1xuICAjIC0gd2FpdHNGb3JGaW5pc2hcbiAga2V5c3Ryb2tlOiAoa2V5cywgb3B0aW9ucz17fSkgPT5cbiAgICBpZiBvcHRpb25zLndhaXRzRm9yRmluaXNoXG4gICAgICBmaW5pc2hlZCA9IGZhbHNlXG4gICAgICBAdmltU3RhdGUub25EaWRGaW5pc2hPcGVyYXRpb24gLT4gZmluaXNoZWQgPSB0cnVlXG4gICAgICBkZWxldGUgb3B0aW9ucy53YWl0c0ZvckZpbmlzaFxuICAgICAgQGtleXN0cm9rZShrZXlzLCBvcHRpb25zKVxuICAgICAgd2FpdHNGb3IgLT4gZmluaXNoZWRcbiAgICAgIHJldHVyblxuXG4gICAgIyBrZXlzIG11c3QgYmUgU3RyaW5nIG9yIEFycmF5XG4gICAgIyBOb3Qgc3VwcG9ydCBPYmplY3QgZm9yIGtleXMgdG8gYXZvaWQgYW1iaWd1aXR5LlxuICAgIHRhcmdldCA9IEBlZGl0b3JFbGVtZW50XG5cbiAgICBmb3IgayBpbiB0b0FycmF5KGtleXMpXG4gICAgICBpZiBfLmlzU3RyaW5nKGspXG4gICAgICAgIHJhd0tleXN0cm9rZShrLCB0YXJnZXQpXG4gICAgICBlbHNlXG4gICAgICAgIHN3aXRjaFxuICAgICAgICAgIHdoZW4gay5pbnB1dD9cbiAgICAgICAgICAgICMgVE9ETyBubyBsb25nZXIgbmVlZCB0byB1c2UgW2lucHV0OiAnY2hhciddIHN0eWxlLlxuICAgICAgICAgICAgcmF3S2V5c3Ryb2tlKF9rZXksIHRhcmdldCkgZm9yIF9rZXkgaW4gay5pbnB1dC5zcGxpdCgnJylcbiAgICAgICAgICB3aGVuIGsuc2VhcmNoP1xuICAgICAgICAgICAgQHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvci5pbnNlcnRUZXh0KGsuc2VhcmNoKSBpZiBrLnNlYXJjaFxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChAdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yRWxlbWVudCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmF3S2V5c3Ryb2tlKGssIHRhcmdldClcblxuICAgIGlmIG9wdGlvbnMucGFydGlhbE1hdGNoVGltZW91dFxuICAgICAgYWR2YW5jZUNsb2NrKGF0b20ua2V5bWFwcy5nZXRQYXJ0aWFsTWF0Y2hUaW1lb3V0KCkpXG5cbm1vZHVsZS5leHBvcnRzID0ge2dldFZpbVN0YXRlLCBnZXRWaWV3LCBkaXNwYXRjaCwgVGV4dERhdGEsIHdpdGhNb2NrUGxhdGZvcm0sIHJhd0tleXN0cm9rZX1cbiJdfQ==
