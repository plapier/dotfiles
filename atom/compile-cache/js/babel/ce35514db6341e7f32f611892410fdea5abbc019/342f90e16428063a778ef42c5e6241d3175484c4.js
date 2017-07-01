var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* eslint-disable import/no-duplicates */

var _atom = require('atom');

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

var _validate = require('./validate');

var Validate = _interopRequireWildcard(_validate);

var LinterRegistry = (function () {
  function LinterRegistry() {
    var _this = this;

    _classCallCheck(this, LinterRegistry);

    this.emitter = new _atom.Emitter();
    this.linters = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.config.observe('linter.lintOnChange', function (lintOnChange) {
      _this.lintOnChange = lintOnChange;
    }));
    this.subscriptions.add(atom.config.observe('core.excludeVcsIgnoredPaths', function (ignoreVCS) {
      _this.ignoreVCS = ignoreVCS;
    }));
    this.subscriptions.add(atom.config.observe('linter.ignoreGlob', function (ignoreGlob) {
      _this.ignoreGlob = ignoreGlob;
    }));
    this.subscriptions.add(atom.config.observe('linter.lintPreviewTabs', function (lintPreviewTabs) {
      _this.lintPreviewTabs = lintPreviewTabs;
    }));
    this.subscriptions.add(atom.config.observe('linter.disabledProviders', function (disabledProviders) {
      _this.disabledProviders = disabledProviders;
    }));
    this.subscriptions.add(this.emitter);
  }

  _createClass(LinterRegistry, [{
    key: 'hasLinter',
    value: function hasLinter(linter) {
      return this.linters.has(linter);
    }
  }, {
    key: 'addLinter',
    value: function addLinter(linter) {
      var legacy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var version = legacy ? 1 : 2;
      if (!Validate.linter(linter, version)) {
        return;
      }
      linter[_helpers.$activated] = true;
      if (typeof linter[_helpers.$requestLatest] === 'undefined') {
        linter[_helpers.$requestLatest] = 0;
      }
      if (typeof linter[_helpers.$requestLastReceived] === 'undefined') {
        linter[_helpers.$requestLastReceived] = 0;
      }
      linter[_helpers.$version] = version;
      this.linters.add(linter);
    }
  }, {
    key: 'getLinters',
    value: function getLinters() {
      return Array.from(this.linters);
    }
  }, {
    key: 'deleteLinter',
    value: function deleteLinter(linter) {
      if (!this.linters.has(linter)) {
        return;
      }
      linter[_helpers.$activated] = false;
      this.linters['delete'](linter);
    }
  }, {
    key: 'lint',
    value: _asyncToGenerator(function* (_ref) {
      var onChange = _ref.onChange;
      var editor = _ref.editor;
      return yield* (function* () {
        var _this2 = this;

        var filePath = editor.getPath();

        if (onChange && !this.lintOnChange || // Lint-on-change mismatch
        !filePath || // Not saved anywhere yet
        Helpers.isPathIgnored(editor.getPath(), this.ignoreGlob, this.ignoreVCS) || // Ignored by VCS or Glob
        !this.lintPreviewTabs && atom.workspace.getActivePane().getPendingItem() === editor // Ignore Preview tabs
        ) {
            return false;
          }

        var scopes = Helpers.getEditorCursorScopes(editor);

        var promises = [];

        var _loop = function (linter) {
          if (!Helpers.shouldTriggerLinter(linter, onChange, scopes)) {
            return 'continue';
          }
          if (_this2.disabledProviders.includes(linter.name)) {
            return 'continue';
          }
          var number = ++linter[_helpers.$requestLatest];
          var statusBuffer = linter.scope === 'file' ? editor.getBuffer() : null;
          var statusFilePath = linter.scope === 'file' ? filePath : null;

          _this2.emitter.emit('did-begin-linting', { number: number, linter: linter, filePath: statusFilePath });
          promises.push(new Promise(function (resolve) {
            // $FlowIgnore: Type too complex, duh
            resolve(linter.lint(editor));
          }).then(function (messages) {
            _this2.emitter.emit('did-finish-linting', { number: number, linter: linter, filePath: statusFilePath });
            if (linter[_helpers.$requestLastReceived] >= number || !linter[_helpers.$activated] || statusBuffer && !statusBuffer.isAlive()) {
              return;
            }
            linter[_helpers.$requestLastReceived] = number;
            if (statusBuffer && !statusBuffer.isAlive()) {
              return;
            }

            if (messages === null) {
              // NOTE: Do NOT update the messages when providers return null
              return;
            }

            var validity = true;
            // NOTE: We are calling it when results are not an array to show a nice notification
            if (atom.inDevMode() || !Array.isArray(messages)) {
              validity = linter[_helpers.$version] === 2 ? Validate.messages(linter.name, messages) : Validate.messagesLegacy(linter.name, messages);
            }
            if (!validity) {
              return;
            }

            if (linter[_helpers.$version] === 2) {
              Helpers.normalizeMessages(linter.name, messages);
            } else {
              Helpers.normalizeMessagesLegacy(linter.name, messages);
            }
            _this2.emitter.emit('did-update-messages', { messages: messages, linter: linter, buffer: statusBuffer });
          }, function (error) {
            _this2.emitter.emit('did-finish-linting', { number: number, linter: linter, filePath: statusFilePath });
            atom.notifications.addError('[Linter] Error running ' + linter.name, {
              detail: 'See Console for more info. (Open View -> Developer -> Toogle Developer Tools)'
            });
            console.error('[Linter] Error running ' + linter.name, error);
          }));
        };

        for (var linter of this.linters) {
          var _ret = _loop(linter);

          if (_ret === 'continue') continue;
        }

        yield Promise.all(promises);
        return true;
      }).apply(this, arguments);
    })
  }, {
    key: 'onDidUpdateMessages',
    value: function onDidUpdateMessages(callback) {
      return this.emitter.on('did-update-messages', callback);
    }
  }, {
    key: 'onDidBeginLinting',
    value: function onDidBeginLinting(callback) {
      return this.emitter.on('did-begin-linting', callback);
    }
  }, {
    key: 'onDidFinishLinting',
    value: function onDidFinishLinting(callback) {
      return this.emitter.on('did-finish-linting', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.linters.clear();
      this.subscriptions.dispose();
    }
  }]);

  return LinterRegistry;
})();

module.exports = LinterRegistry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9saW50ZXItcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFHNkMsTUFBTTs7dUJBRzFCLFdBQVc7O0lBQXhCLE9BQU87O3dCQUNPLFlBQVk7O0lBQTFCLFFBQVE7O0lBSWQsY0FBYztBQVVQLFdBVlAsY0FBYyxHQVVKOzs7MEJBVlYsY0FBYzs7QUFXaEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN4QixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxVQUFDLFlBQVksRUFBSztBQUNsRixZQUFLLFlBQVksR0FBRyxZQUFZLENBQUE7S0FDakMsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxVQUFDLFNBQVMsRUFBSztBQUN2RixZQUFLLFNBQVMsR0FBRyxTQUFTLENBQUE7S0FDM0IsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxVQUFDLFVBQVUsRUFBSztBQUM5RSxZQUFLLFVBQVUsR0FBRyxVQUFVLENBQUE7S0FDN0IsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxVQUFDLGVBQWUsRUFBSztBQUN4RixZQUFLLGVBQWUsR0FBRyxlQUFlLENBQUE7S0FDdkMsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxVQUFDLGlCQUFpQixFQUFLO0FBQzVGLFlBQUssaUJBQWlCLEdBQUcsaUJBQWlCLENBQUE7S0FDM0MsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDckM7O2VBL0JHLGNBQWM7O1dBZ0NULG1CQUFDLE1BQWMsRUFBVztBQUNqQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ2hDOzs7V0FDUSxtQkFBQyxNQUFjLEVBQTJCO1VBQXpCLE1BQWUseURBQUcsS0FBSzs7QUFDL0MsVUFBTSxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDOUIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFFO0FBQ3JDLGVBQU07T0FDUDtBQUNELFlBQU0scUJBQVksR0FBRyxJQUFJLENBQUE7QUFDekIsVUFBSSxPQUFPLE1BQU0seUJBQWdCLEtBQUssV0FBVyxFQUFFO0FBQ2pELGNBQU0seUJBQWdCLEdBQUcsQ0FBQyxDQUFBO09BQzNCO0FBQ0QsVUFBSSxPQUFPLE1BQU0sK0JBQXNCLEtBQUssV0FBVyxFQUFFO0FBQ3ZELGNBQU0sK0JBQXNCLEdBQUcsQ0FBQyxDQUFBO09BQ2pDO0FBQ0QsWUFBTSxtQkFBVSxHQUFHLE9BQU8sQ0FBQTtBQUMxQixVQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUN6Qjs7O1dBQ1Msc0JBQWtCO0FBQzFCLGFBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDaEM7OztXQUNXLHNCQUFDLE1BQWMsRUFBRTtBQUMzQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDN0IsZUFBTTtPQUNQO0FBQ0QsWUFBTSxxQkFBWSxHQUFHLEtBQUssQ0FBQTtBQUMxQixVQUFJLENBQUMsT0FBTyxVQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDNUI7Ozs2QkFDUyxXQUFDLElBQWdFO1VBQTlELFFBQVEsR0FBVixJQUFnRSxDQUE5RCxRQUFRO1VBQUUsTUFBTSxHQUFsQixJQUFnRSxDQUFwRCxNQUFNO2tDQUFrRTs7O0FBQzdGLFlBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTs7QUFFakMsWUFDRSxBQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZO0FBQy9CLFNBQUMsUUFBUTtBQUNULGVBQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUN2RSxTQUFDLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxjQUFjLEVBQUUsS0FBSyxNQUFNLEFBQUM7VUFDckY7QUFDQSxtQkFBTyxLQUFLLENBQUE7V0FDYjs7QUFFRCxZQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRXBELFlBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTs7OEJBQ1IsTUFBTTtBQUNmLGNBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtBQUMxRCw4QkFBUTtXQUNUO0FBQ0QsY0FBSSxPQUFLLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDaEQsOEJBQVE7V0FDVDtBQUNELGNBQU0sTUFBTSxHQUFHLEVBQUUsTUFBTSx5QkFBZ0IsQ0FBQTtBQUN2QyxjQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxLQUFLLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFBO0FBQ3hFLGNBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEtBQUssTUFBTSxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUE7O0FBRWhFLGlCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUE7QUFDcEYsa0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUU7O0FBRTFDLG1CQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1dBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDcEIsbUJBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQTtBQUNyRixnQkFBSSxNQUFNLCtCQUFzQixJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0scUJBQVksSUFBSyxZQUFZLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEFBQUMsRUFBRTtBQUM5RyxxQkFBTTthQUNQO0FBQ0Qsa0JBQU0sK0JBQXNCLEdBQUcsTUFBTSxDQUFBO0FBQ3JDLGdCQUFJLFlBQVksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUMzQyxxQkFBTTthQUNQOztBQUVELGdCQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7O0FBRXJCLHFCQUFNO2FBQ1A7O0FBRUQsZ0JBQUksUUFBUSxHQUFHLElBQUksQ0FBQTs7QUFFbkIsZ0JBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUNoRCxzQkFBUSxHQUFHLE1BQU0sbUJBQVUsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTthQUM5SDtBQUNELGdCQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IscUJBQU07YUFDUDs7QUFFRCxnQkFBSSxNQUFNLG1CQUFVLEtBQUssQ0FBQyxFQUFFO0FBQzFCLHFCQUFPLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTthQUNqRCxNQUFNO0FBQ0wscUJBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO2FBQ3ZEO0FBQ0QsbUJBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQTtXQUNyRixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ1osbUJBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQTtBQUNyRixnQkFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLDZCQUEyQixNQUFNLENBQUMsSUFBSSxFQUFJO0FBQ25FLG9CQUFNLEVBQUUsK0VBQStFO2FBQ3hGLENBQUMsQ0FBQTtBQUNGLG1CQUFPLENBQUMsS0FBSyw2QkFBMkIsTUFBTSxDQUFDLElBQUksRUFBSSxLQUFLLENBQUMsQ0FBQTtXQUM5RCxDQUFDLENBQUMsQ0FBQTs7O0FBbkRMLGFBQUssSUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTsyQkFBeEIsTUFBTTs7bUNBS2IsU0FBUTtTQStDWDs7QUFFRCxjQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsZUFBTyxJQUFJLENBQUE7T0FDWjtLQUFBOzs7V0FDa0IsNkJBQUMsUUFBa0IsRUFBYztBQUNsRCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3hEOzs7V0FDZ0IsMkJBQUMsUUFBa0IsRUFBYztBQUNoRCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3REOzs7V0FDaUIsNEJBQUMsUUFBa0IsRUFBYztBQUNqRCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZEOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDcEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBaEpHLGNBQWM7OztBQW1KcEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUEiLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2xpbnRlci1yZWdpc3RyeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8tZHVwbGljYXRlcyAqL1xuXG5pbXBvcnQgeyBFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgVGV4dEVkaXRvciwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCAqIGFzIEhlbHBlcnMgZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0ICogYXMgVmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZSdcbmltcG9ydCB7ICR2ZXJzaW9uLCAkYWN0aXZhdGVkLCAkcmVxdWVzdExhdGVzdCwgJHJlcXVlc3RMYXN0UmVjZWl2ZWQgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmNsYXNzIExpbnRlclJlZ2lzdHJ5IHtcbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgbGludGVyczogU2V0PExpbnRlcj47XG4gIGxpbnRPbkNoYW5nZTogYm9vbGVhbjtcbiAgaWdub3JlVkNTOiBib29sZWFuO1xuICBpZ25vcmVHbG9iOiBzdHJpbmc7XG4gIGxpbnRQcmV2aWV3VGFiczogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgZGlzYWJsZWRQcm92aWRlcnM6IEFycmF5PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubGludGVycyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmxpbnRPbkNoYW5nZScsIChsaW50T25DaGFuZ2UpID0+IHtcbiAgICAgIHRoaXMubGludE9uQ2hhbmdlID0gbGludE9uQ2hhbmdlXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnLCAoaWdub3JlVkNTKSA9PiB7XG4gICAgICB0aGlzLmlnbm9yZVZDUyA9IGlnbm9yZVZDU1xuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmlnbm9yZUdsb2InLCAoaWdub3JlR2xvYikgPT4ge1xuICAgICAgdGhpcy5pZ25vcmVHbG9iID0gaWdub3JlR2xvYlxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmxpbnRQcmV2aWV3VGFicycsIChsaW50UHJldmlld1RhYnMpID0+IHtcbiAgICAgIHRoaXMubGludFByZXZpZXdUYWJzID0gbGludFByZXZpZXdUYWJzXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuZGlzYWJsZWRQcm92aWRlcnMnLCAoZGlzYWJsZWRQcm92aWRlcnMpID0+IHtcbiAgICAgIHRoaXMuZGlzYWJsZWRQcm92aWRlcnMgPSBkaXNhYmxlZFByb3ZpZGVyc1xuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICB9XG4gIGhhc0xpbnRlcihsaW50ZXI6IExpbnRlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxpbnRlcnMuaGFzKGxpbnRlcilcbiAgfVxuICBhZGRMaW50ZXIobGludGVyOiBMaW50ZXIsIGxlZ2FjeTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgY29uc3QgdmVyc2lvbiA9IGxlZ2FjeSA/IDEgOiAyXG4gICAgaWYgKCFWYWxpZGF0ZS5saW50ZXIobGludGVyLCB2ZXJzaW9uKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxpbnRlclskYWN0aXZhdGVkXSA9IHRydWVcbiAgICBpZiAodHlwZW9mIGxpbnRlclskcmVxdWVzdExhdGVzdF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBsaW50ZXJbJHJlcXVlc3RMYXRlc3RdID0gMFxuICAgIH1cbiAgICBpZiAodHlwZW9mIGxpbnRlclskcmVxdWVzdExhc3RSZWNlaXZlZF0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBsaW50ZXJbJHJlcXVlc3RMYXN0UmVjZWl2ZWRdID0gMFxuICAgIH1cbiAgICBsaW50ZXJbJHZlcnNpb25dID0gdmVyc2lvblxuICAgIHRoaXMubGludGVycy5hZGQobGludGVyKVxuICB9XG4gIGdldExpbnRlcnMoKTogQXJyYXk8TGludGVyPiB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5saW50ZXJzKVxuICB9XG4gIGRlbGV0ZUxpbnRlcihsaW50ZXI6IExpbnRlcikge1xuICAgIGlmICghdGhpcy5saW50ZXJzLmhhcyhsaW50ZXIpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGludGVyWyRhY3RpdmF0ZWRdID0gZmFsc2VcbiAgICB0aGlzLmxpbnRlcnMuZGVsZXRlKGxpbnRlcilcbiAgfVxuICBhc3luYyBsaW50KHsgb25DaGFuZ2UsIGVkaXRvciB9IDogeyBvbkNoYW5nZTogYm9vbGVhbiwgZWRpdG9yOiBUZXh0RWRpdG9yIH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcblxuICAgIGlmIChcbiAgICAgIChvbkNoYW5nZSAmJiAhdGhpcy5saW50T25DaGFuZ2UpIHx8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbnQtb24tY2hhbmdlIG1pc21hdGNoXG4gICAgICAhZmlsZVBhdGggfHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3Qgc2F2ZWQgYW55d2hlcmUgeWV0XG4gICAgICBIZWxwZXJzLmlzUGF0aElnbm9yZWQoZWRpdG9yLmdldFBhdGgoKSwgdGhpcy5pZ25vcmVHbG9iLCB0aGlzLmlnbm9yZVZDUykgfHwgICAgICAgICAgICAgICAvLyBJZ25vcmVkIGJ5IFZDUyBvciBHbG9iXG4gICAgICAoIXRoaXMubGludFByZXZpZXdUYWJzICYmIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRQZW5kaW5nSXRlbSgpID09PSBlZGl0b3IpICAgICAvLyBJZ25vcmUgUHJldmlldyB0YWJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzY29wZXMgPSBIZWxwZXJzLmdldEVkaXRvckN1cnNvclNjb3BlcyhlZGl0b3IpXG5cbiAgICBjb25zdCBwcm9taXNlcyA9IFtdXG4gICAgZm9yIChjb25zdCBsaW50ZXIgb2YgdGhpcy5saW50ZXJzKSB7XG4gICAgICBpZiAoIUhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcihsaW50ZXIsIG9uQ2hhbmdlLCBzY29wZXMpKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5kaXNhYmxlZFByb3ZpZGVycy5pbmNsdWRlcyhsaW50ZXIubmFtZSkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGNvbnN0IG51bWJlciA9ICsrbGludGVyWyRyZXF1ZXN0TGF0ZXN0XVxuICAgICAgY29uc3Qgc3RhdHVzQnVmZmVyID0gbGludGVyLnNjb3BlID09PSAnZmlsZScgPyBlZGl0b3IuZ2V0QnVmZmVyKCkgOiBudWxsXG4gICAgICBjb25zdCBzdGF0dXNGaWxlUGF0aCA9IGxpbnRlci5zY29wZSA9PT0gJ2ZpbGUnID8gZmlsZVBhdGggOiBudWxsXG5cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtYmVnaW4tbGludGluZycsIHsgbnVtYmVyLCBsaW50ZXIsIGZpbGVQYXRoOiBzdGF0dXNGaWxlUGF0aCB9KVxuICAgICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlOiBUeXBlIHRvbyBjb21wbGV4LCBkdWhcbiAgICAgICAgcmVzb2x2ZShsaW50ZXIubGludChlZGl0b3IpKVxuICAgICAgfSkudGhlbigobWVzc2FnZXMpID0+IHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1maW5pc2gtbGludGluZycsIHsgbnVtYmVyLCBsaW50ZXIsIGZpbGVQYXRoOiBzdGF0dXNGaWxlUGF0aCB9KVxuICAgICAgICBpZiAobGludGVyWyRyZXF1ZXN0TGFzdFJlY2VpdmVkXSA+PSBudW1iZXIgfHwgIWxpbnRlclskYWN0aXZhdGVkXSB8fCAoc3RhdHVzQnVmZmVyICYmICFzdGF0dXNCdWZmZXIuaXNBbGl2ZSgpKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGxpbnRlclskcmVxdWVzdExhc3RSZWNlaXZlZF0gPSBudW1iZXJcbiAgICAgICAgaWYgKHN0YXR1c0J1ZmZlciAmJiAhc3RhdHVzQnVmZmVyLmlzQWxpdmUoKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lc3NhZ2VzID09PSBudWxsKSB7XG4gICAgICAgICAgLy8gTk9URTogRG8gTk9UIHVwZGF0ZSB0aGUgbWVzc2FnZXMgd2hlbiBwcm92aWRlcnMgcmV0dXJuIG51bGxcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2YWxpZGl0eSA9IHRydWVcbiAgICAgICAgLy8gTk9URTogV2UgYXJlIGNhbGxpbmcgaXQgd2hlbiByZXN1bHRzIGFyZSBub3QgYW4gYXJyYXkgdG8gc2hvdyBhIG5pY2Ugbm90aWZpY2F0aW9uXG4gICAgICAgIGlmIChhdG9tLmluRGV2TW9kZSgpIHx8ICFBcnJheS5pc0FycmF5KG1lc3NhZ2VzKSkge1xuICAgICAgICAgIHZhbGlkaXR5ID0gbGludGVyWyR2ZXJzaW9uXSA9PT0gMiA/IFZhbGlkYXRlLm1lc3NhZ2VzKGxpbnRlci5uYW1lLCBtZXNzYWdlcykgOiBWYWxpZGF0ZS5tZXNzYWdlc0xlZ2FjeShsaW50ZXIubmFtZSwgbWVzc2FnZXMpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF2YWxpZGl0eSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpbnRlclskdmVyc2lvbl0gPT09IDIpIHtcbiAgICAgICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzKGxpbnRlci5uYW1lLCBtZXNzYWdlcylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KGxpbnRlci5uYW1lLCBtZXNzYWdlcylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZS1tZXNzYWdlcycsIHsgbWVzc2FnZXMsIGxpbnRlciwgYnVmZmVyOiBzdGF0dXNCdWZmZXIgfSlcbiAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWZpbmlzaC1saW50aW5nJywgeyBudW1iZXIsIGxpbnRlciwgZmlsZVBhdGg6IHN0YXR1c0ZpbGVQYXRoIH0pXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgW0xpbnRlcl0gRXJyb3IgcnVubmluZyAke2xpbnRlci5uYW1lfWAsIHtcbiAgICAgICAgICBkZXRhaWw6ICdTZWUgQ29uc29sZSBmb3IgbW9yZSBpbmZvLiAoT3BlbiBWaWV3IC0+IERldmVsb3BlciAtPiBUb29nbGUgRGV2ZWxvcGVyIFRvb2xzKScsXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFtMaW50ZXJdIEVycm9yIHJ1bm5pbmcgJHtsaW50ZXIubmFtZX1gLCBlcnJvcilcbiAgICAgIH0pKVxuICAgIH1cblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgb25EaWRVcGRhdGVNZXNzYWdlcyhjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlLW1lc3NhZ2VzJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRCZWdpbkxpbnRpbmcoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWJlZ2luLWxpbnRpbmcnLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZEZpbmlzaExpbnRpbmcoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWZpbmlzaC1saW50aW5nJywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmxpbnRlcnMuY2xlYXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExpbnRlclJlZ2lzdHJ5XG4iXX0=