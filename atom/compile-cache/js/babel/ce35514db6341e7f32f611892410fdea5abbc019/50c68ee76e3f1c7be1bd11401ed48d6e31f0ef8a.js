var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var Helpers = undefined;
var manifest = undefined;
var ToggleView = undefined;
var UIRegistry = undefined;
var arrayUnique = undefined;
var IndieRegistry = undefined;
var LinterRegistry = undefined;
var EditorsRegistry = undefined;
var MessageRegistry = undefined;

var Linter = (function () {
  function Linter() {
    var _this = this;

    _classCallCheck(this, Linter);

    this.idleCallbacks = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

    this.commands = new _commands2['default']();
    this.subscriptions.add(this.commands);

    this.commands.onShouldLint(function () {
      _this.registryEditorsInit();
      var editorLinter = _this.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorLinter) {
        editorLinter.lint();
      }
    });
    this.commands.onShouldToggleActiveEditor(function () {
      var textEditor = atom.workspace.getActiveTextEditor();
      _this.registryEditorsInit();
      var editor = _this.registryEditors.get(textEditor);
      if (editor) {
        editor.dispose();
      } else if (textEditor) {
        _this.registryEditors.createFromTextEditor(textEditor);
      }
    });
    this.commands.onShouldDebug(_asyncToGenerator(function* () {
      if (!Helpers) {
        Helpers = require('./helpers');
      }
      if (!manifest) {
        manifest = require('../package.json');
      }
      _this.registryLintersInit();
      var linters = _this.registryLinters.getLinters();
      var textEditor = atom.workspace.getActiveTextEditor();
      var textEditorScopes = Helpers.getEditorCursorScopes(textEditor);

      var allLinters = linters.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      }).map(function (linter) {
        return '  - ' + linter.name;
      }).join('\n');
      var matchingLinters = linters.filter(function (linter) {
        return Helpers.shouldTriggerLinter(linter, false, textEditorScopes);
      }).sort(function (a, b) {
        return a.name.localeCompare(b.name);
      }).map(function (linter) {
        return '  - ' + linter.name;
      }).join('\n');
      var humanizedScopes = textEditorScopes.map(function (scope) {
        return '  - ' + scope;
      }).join('\n');
      var disabledLinters = atom.config.get('linter.disabledProviders').map(function (linter) {
        return '  - ' + linter;
      }).join('\n');

      atom.notifications.addInfo('Linter Debug Info', {
        detail: ['Platform: ' + process.platform, 'Atom Version: ' + atom.getVersion(), 'Linter Version: ' + manifest.version, 'All Linter Providers: \n' + allLinters, 'Matching Linter Providers: \n' + matchingLinters, 'Disabled Linter Providers; \n' + disabledLinters, 'Current File scopes: \n' + humanizedScopes].join('\n'),
        dismissable: true
      });
    }));
    this.commands.onShouldToggleLinter(function (action) {
      if (!ToggleView) {
        ToggleView = require('./toggle-view');
      }
      if (!arrayUnique) {
        arrayUnique = require('lodash.uniq');
      }
      _this.registryLintersInit();
      var toggleView = new ToggleView(action, arrayUnique(_this.registryLinters.getLinters().map(function (linter) {
        return linter.name;
      })));
      toggleView.onDidDispose(function () {
        _this.subscriptions.remove(toggleView);
      });
      toggleView.onDidDisable(function (name) {
        var linter = _this.registryLinters.getLinters().find(function (entry) {
          return entry.name === name;
        });
        if (linter) {
          _this.registryMessagesInit();
          _this.registryMessages.deleteByLinter(linter);
        }
      });
      toggleView.show();
      _this.subscriptions.add(toggleView);
    });

    var projectPathChangeCallbackID = window.requestIdleCallback((function projectPathChange() {
      var _this2 = this;

      this.idleCallbacks['delete'](projectPathChangeCallbackID);
      // NOTE: Atom triggers this on boot so wait a while
      this.subscriptions.add(atom.project.onDidChangePaths(function () {
        _this2.commands.lint();
      }));
    }).bind(this));
    this.idleCallbacks.add(projectPathChangeCallbackID);

    var registryEditorsInitCallbackID = window.requestIdleCallback((function registryEditorsIdleInit() {
      this.idleCallbacks['delete'](registryEditorsInitCallbackID);
      // This will be called on the fly if needed, but needs to run on it's
      // own at some point or linting on open or on change will never trigger
      this.registryEditorsInit();
    }).bind(this));
    this.idleCallbacks.add(registryEditorsInitCallbackID);
  }

  _createClass(Linter, [{
    key: 'dispose',
    value: function dispose() {
      this.idleCallbacks.forEach(function (callbackID) {
        return window.cancelIdleCallback(callbackID);
      });
      this.idleCallbacks.clear();
      this.subscriptions.dispose();
    }
  }, {
    key: 'registryEditorsInit',
    value: function registryEditorsInit() {
      var _this3 = this;

      if (this.registryEditors) {
        return;
      }
      if (!EditorsRegistry) {
        EditorsRegistry = require('./editor-registry');
      }
      this.registryEditors = new EditorsRegistry();
      this.subscriptions.add(this.registryEditors);
      this.registryEditors.observe(function (editorLinter) {
        editorLinter.onShouldLint(function (onChange) {
          _this3.registryLintersInit();
          _this3.registryLinters.lint({ onChange: onChange, editor: editorLinter.getEditor() });
        });
        editorLinter.onDidDestroy(function () {
          _this3.registryMessagesInit();
          _this3.registryMessages.deleteByBuffer(editorLinter.getEditor().getBuffer());
        });
      });
      this.registryEditors.activate();
    }
  }, {
    key: 'registryLintersInit',
    value: function registryLintersInit() {
      var _this4 = this;

      if (this.registryLinters) {
        return;
      }
      if (!LinterRegistry) {
        LinterRegistry = require('./linter-registry');
      }
      this.registryLinters = new LinterRegistry();
      this.subscriptions.add(this.registryLinters);
      this.registryLinters.onDidUpdateMessages(function (_ref) {
        var linter = _ref.linter;
        var messages = _ref.messages;
        var buffer = _ref.buffer;

        _this4.registryMessagesInit();
        _this4.registryMessages.set({ linter: linter, messages: messages, buffer: buffer });
      });
      this.registryLinters.onDidBeginLinting(function (_ref2) {
        var linter = _ref2.linter;
        var filePath = _ref2.filePath;

        _this4.registryUIInit();
        _this4.registryUI.didBeginLinting(linter, filePath);
      });
      this.registryLinters.onDidFinishLinting(function (_ref3) {
        var linter = _ref3.linter;
        var filePath = _ref3.filePath;

        _this4.registryUIInit();
        _this4.registryUI.didFinishLinting(linter, filePath);
      });
    }
  }, {
    key: 'registryIndieInit',
    value: function registryIndieInit() {
      var _this5 = this;

      if (this.registryIndie) {
        return;
      }
      if (!IndieRegistry) {
        IndieRegistry = require('./indie-registry');
      }
      this.registryIndie = new IndieRegistry();
      this.subscriptions.add(this.registryIndie);
      this.registryIndie.observe(function (indieLinter) {
        indieLinter.onDidDestroy(function () {
          _this5.registryMessagesInit();
          _this5.registryMessages.deleteByLinter(indieLinter);
        });
      });
      this.registryIndie.onDidUpdate(function (_ref4) {
        var linter = _ref4.linter;
        var messages = _ref4.messages;

        _this5.registryMessagesInit();
        _this5.registryMessages.set({ linter: linter, messages: messages, buffer: null });
      });
    }
  }, {
    key: 'registryMessagesInit',
    value: function registryMessagesInit() {
      var _this6 = this;

      if (this.registryMessages) {
        return;
      }
      if (!MessageRegistry) {
        MessageRegistry = require('./message-registry');
      }
      this.registryMessages = new MessageRegistry();
      this.subscriptions.add(this.registryMessages);
      this.registryMessages.onDidUpdateMessages(function (difference) {
        _this6.registryUIInit();
        _this6.registryUI.render(difference);
      });
    }
  }, {
    key: 'registryUIInit',
    value: function registryUIInit() {
      if (this.registryUI) {
        return;
      }
      if (!UIRegistry) {
        UIRegistry = require('./ui-registry');
      }
      this.registryUI = new UIRegistry();
      this.subscriptions.add(this.registryUI);
    }

    // API methods for providing/consuming services
    // UI
  }, {
    key: 'addUI',
    value: function addUI(ui) {
      this.registryUIInit();
      this.registryUI.add(ui);
      this.registryMessagesInit();
      var messages = this.registryMessages.messages;
      if (messages.length) {
        ui.render({ added: messages, messages: messages, removed: [] });
      }
    }
  }, {
    key: 'deleteUI',
    value: function deleteUI(ui) {
      this.registryUIInit();
      this.registryUI['delete'](ui);
    }

    // Standard Linter
  }, {
    key: 'addLinter',
    value: function addLinter(linter) {
      var legacy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      this.registryLintersInit();
      this.registryLinters.addLinter(linter, legacy);
    }
  }, {
    key: 'deleteLinter',
    value: function deleteLinter(linter) {
      this.registryLintersInit();
      this.registryLinters.deleteLinter(linter);
      this.registryMessagesInit();
      this.registryMessages.deleteByLinter(linter);
    }

    // Indie Linter
  }, {
    key: 'addIndie',
    value: function addIndie(indie) {
      this.registryIndieInit();
      return this.registryIndie.register(indie, 2);
    }
  }, {
    key: 'addLegacyIndie',
    value: function addLegacyIndie(indie) {
      this.registryIndieInit();
      return this.registryIndie.register(indie, 1);
    }
  }]);

  return Linter;
})();

module.exports = Linter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVvQyxNQUFNOzt3QkFFckIsWUFBWTs7OztBQUdqQyxJQUFJLE9BQU8sWUFBQSxDQUFBO0FBQ1gsSUFBSSxRQUFRLFlBQUEsQ0FBQTtBQUNaLElBQUksVUFBVSxZQUFBLENBQUE7QUFDZCxJQUFJLFVBQVUsWUFBQSxDQUFBO0FBQ2QsSUFBSSxXQUFXLFlBQUEsQ0FBQTtBQUNmLElBQUksYUFBYSxZQUFBLENBQUE7QUFDakIsSUFBSSxjQUFjLFlBQUEsQ0FBQTtBQUNsQixJQUFJLGVBQWUsWUFBQSxDQUFBO0FBQ25CLElBQUksZUFBZSxZQUFBLENBQUE7O0lBRWIsTUFBTTtBQVVDLFdBVlAsTUFBTSxHQVVJOzs7MEJBVlYsTUFBTTs7QUFXUixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDOUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLFFBQVEsR0FBRywyQkFBYyxDQUFBO0FBQzlCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFckMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUMvQixZQUFLLG1CQUFtQixFQUFFLENBQUE7QUFDMUIsVUFBTSxZQUFZLEdBQUcsTUFBSyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFBO0FBQ25GLFVBQUksWUFBWSxFQUFFO0FBQ2hCLG9CQUFZLENBQUMsSUFBSSxFQUFFLENBQUE7T0FDcEI7S0FDRixDQUFDLENBQUE7QUFDRixRQUFJLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLFlBQU07QUFDN0MsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMs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QixFQUFFLENBQUE7QUFDeEIsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDN0M7OztXQUNhLHdCQUFDLEtBQWEsRUFBRTtBQUM1QixVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUN4QixhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUM3Qzs7O1NBbFBHLE1BQU07OztBQXFQWixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQSIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgQ29tbWFuZHMgZnJvbSAnLi9jb21tYW5kcydcbmltcG9ydCB0eXBlIHsgVUksIExpbnRlciBhcyBMaW50ZXJQcm92aWRlciB9IGZyb20gJy4vdHlwZXMnXG5cbmxldCBIZWxwZXJzXG5sZXQgbWFuaWZlc3RcbmxldCBUb2dnbGVWaWV3XG5sZXQgVUlSZWdpc3RyeVxubGV0IGFycmF5VW5pcXVlXG5sZXQgSW5kaWVSZWdpc3RyeVxubGV0IExpbnRlclJlZ2lzdHJ5XG5sZXQgRWRpdG9yc1JlZ2lzdHJ5XG5sZXQgTWVzc2FnZVJlZ2lzdHJ5XG5cbmNsYXNzIExpbnRlciB7XG4gIGNvbW1hbmRzOiBDb21tYW5kcztcbiAgcmVnaXN0cnlVSTogVUlSZWdpc3RyeTtcbiAgcmVnaXN0cnlJbmRpZTogSW5kaWVSZWdpc3RyeTtcbiAgcmVnaXN0cnlFZGl0b3JzOiBFZGl0b3JzUmVnaXN0cnk7XG4gIHJlZ2lzdHJ5TGludGVyczogTGludGVyUmVnaXN0cnk7XG4gIHJlZ2lzdHJ5TWVzc2FnZXM6IE1lc3NhZ2VSZWdpc3RyeTtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgaWRsZUNhbGxiYWNrczogU2V0PG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzID0gbmV3IFNldCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5jb21tYW5kcyA9IG5ldyBDb21tYW5kcygpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmNvbW1hbmRzKVxuXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZExpbnQoKCkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeUVkaXRvcnNJbml0KClcbiAgICAgIGNvbnN0IGVkaXRvckxpbnRlciA9IHRoaXMucmVnaXN0cnlFZGl0b3JzLmdldChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiAoZWRpdG9yTGludGVyKSB7XG4gICAgICAgIGVkaXRvckxpbnRlci5saW50KClcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuY29tbWFuZHMub25TaG91bGRUb2dnbGVBY3RpdmVFZGl0b3IoKCkgPT4ge1xuICAgICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgdGhpcy5yZWdpc3RyeUVkaXRvcnNJbml0KClcbiAgICAgIGNvbnN0IGVkaXRvciA9IHRoaXMucmVnaXN0cnlFZGl0b3JzLmdldCh0ZXh0RWRpdG9yKVxuICAgICAgaWYgKGVkaXRvcikge1xuICAgICAgICBlZGl0b3IuZGlzcG9zZSgpXG4gICAgICB9IGVsc2UgaWYgKHRleHRFZGl0b3IpIHtcbiAgICAgICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMuY3JlYXRlRnJvbVRleHRFZGl0b3IodGV4dEVkaXRvcilcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuY29tbWFuZHMub25TaG91bGREZWJ1Zyhhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoIUhlbHBlcnMpIHtcbiAgICAgICAgSGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpXG4gICAgICB9XG4gICAgICBpZiAoIW1hbmlmZXN0KSB7XG4gICAgICAgIG1hbmlmZXN0ID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJylcbiAgICAgIH1cbiAgICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzSW5pdCgpXG4gICAgICBjb25zdCBsaW50ZXJzID0gdGhpcy5yZWdpc3RyeUxpbnRlcnMuZ2V0TGludGVycygpXG4gICAgICBjb25zdCB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBjb25zdCB0ZXh0RWRpdG9yU2NvcGVzID0gSGVscGVycy5nZXRFZGl0b3JDdXJzb3JTY29wZXModGV4dEVkaXRvcilcblxuICAgICAgY29uc3QgYWxsTGludGVycyA9IGxpbnRlcnNcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpXG4gICAgICAgIC5tYXAobGludGVyID0+IGAgIC0gJHtsaW50ZXIubmFtZX1gKS5qb2luKCdcXG4nKVxuICAgICAgY29uc3QgbWF0Y2hpbmdMaW50ZXJzID0gbGludGVyc1xuICAgICAgICAuZmlsdGVyKGxpbnRlciA9PiBIZWxwZXJzLnNob3VsZFRyaWdnZXJMaW50ZXIobGludGVyLCBmYWxzZSwgdGV4dEVkaXRvclNjb3BlcykpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpKVxuICAgICAgICAubWFwKGxpbnRlciA9PiBgICAtICR7bGludGVyLm5hbWV9YCkuam9pbignXFxuJylcbiAgICAgIGNvbnN0IGh1bWFuaXplZFNjb3BlcyA9IHRleHRFZGl0b3JTY29wZXNcbiAgICAgICAgLm1hcChzY29wZSA9PiBgICAtICR7c2NvcGV9YCkuam9pbignXFxuJylcbiAgICAgIGNvbnN0IGRpc2FibGVkTGludGVycyA9IGF0b20uY29uZmlnLmdldCgnbGludGVyLmRpc2FibGVkUHJvdmlkZXJzJylcbiAgICAgICAgLm1hcChsaW50ZXIgPT4gYCAgLSAke2xpbnRlcn1gKS5qb2luKCdcXG4nKVxuXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnTGludGVyIERlYnVnIEluZm8nLCB7XG4gICAgICAgIGRldGFpbDogW1xuICAgICAgICAgIGBQbGF0Zm9ybTogJHtwcm9jZXNzLnBsYXRmb3JtfWAsXG4gICAgICAgICAgYEF0b20gVmVyc2lvbjogJHthdG9tLmdldFZlcnNpb24oKX1gLFxuICAgICAgICAgIGBMaW50ZXIgVmVyc2lvbjogJHttYW5pZmVzdC52ZXJzaW9ufWAsXG4gICAgICAgICAgYEFsbCBMaW50ZXIgUHJvdmlkZXJzOiBcXG4ke2FsbExpbnRlcnN9YCxcbiAgICAgICAgICBgTWF0Y2hpbmcgTGludGVyIFByb3ZpZGVyczogXFxuJHttYXRjaGluZ0xpbnRlcnN9YCxcbiAgICAgICAgICBgRGlzYWJsZWQgTGludGVyIFByb3ZpZGVyczsgXFxuJHtkaXNhYmxlZExpbnRlcnN9YCxcbiAgICAgICAgICBgQ3VycmVudCBGaWxlIHNjb3BlczogXFxuJHtodW1hbml6ZWRTY29wZXN9YCxcbiAgICAgICAgXS5qb2luKCdcXG4nKSxcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5jb21tYW5kcy5vblNob3VsZFRvZ2dsZUxpbnRlcigoYWN0aW9uKSA9PiB7XG4gICAgICBpZiAoIVRvZ2dsZVZpZXcpIHtcbiAgICAgICAgVG9nZ2xlVmlldyA9IHJlcXVpcmUoJy4vdG9nZ2xlLXZpZXcnKVxuICAgICAgfVxuICAgICAgaWYgKCFhcnJheVVuaXF1ZSkge1xuICAgICAgICBhcnJheVVuaXF1ZSA9IHJlcXVpcmUoJ2xvZGFzaC51bmlxJylcbiAgICAgIH1cbiAgICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzSW5pdCgpXG4gICAgICBjb25zdCB0b2dnbGVWaWV3ID0gbmV3IFRvZ2dsZVZpZXcoYWN0aW9uLFxuICAgICAgICBhcnJheVVuaXF1ZSh0aGlzLnJlZ2lzdHJ5TGludGVycy5nZXRMaW50ZXJzKCkubWFwKGxpbnRlciA9PiBsaW50ZXIubmFtZSkpKVxuICAgICAgdG9nZ2xlVmlldy5vbkRpZERpc3Bvc2UoKCkgPT4ge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucmVtb3ZlKHRvZ2dsZVZpZXcpXG4gICAgICB9KVxuICAgICAgdG9nZ2xlVmlldy5vbkRpZERpc2FibGUoKG5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gdGhpcy5yZWdpc3RyeUxpbnRlcnMuZ2V0TGludGVycygpLmZpbmQoZW50cnkgPT4gZW50cnkubmFtZSA9PT0gbmFtZSlcbiAgICAgICAgaWYgKGxpbnRlcikge1xuICAgICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUxpbnRlcihsaW50ZXIpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0b2dnbGVWaWV3LnNob3coKVxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0b2dnbGVWaWV3KVxuICAgIH0pXG5cbiAgICBjb25zdCBwcm9qZWN0UGF0aENoYW5nZUNhbGxiYWNrSUQgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhcbiAgICAgIGZ1bmN0aW9uIHByb2plY3RQYXRoQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLmlkbGVDYWxsYmFja3MuZGVsZXRlKHByb2plY3RQYXRoQ2hhbmdlQ2FsbGJhY2tJRClcbiAgICAgICAgLy8gTk9URTogQXRvbSB0cmlnZ2VycyB0aGlzIG9uIGJvb3Qgc28gd2FpdCBhIHdoaWxlXG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY29tbWFuZHMubGludCgpXG4gICAgICAgIH0pKVxuICAgICAgfS5iaW5kKHRoaXMpKVxuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5hZGQocHJvamVjdFBhdGhDaGFuZ2VDYWxsYmFja0lEKVxuXG4gICAgY29uc3QgcmVnaXN0cnlFZGl0b3JzSW5pdENhbGxiYWNrSUQgPSB3aW5kb3cucmVxdWVzdElkbGVDYWxsYmFjayhcbiAgICAgIGZ1bmN0aW9uIHJlZ2lzdHJ5RWRpdG9yc0lkbGVJbml0KCkge1xuICAgICAgICB0aGlzLmlkbGVDYWxsYmFja3MuZGVsZXRlKHJlZ2lzdHJ5RWRpdG9yc0luaXRDYWxsYmFja0lEKVxuICAgICAgICAvLyBUaGlzIHdpbGwgYmUgY2FsbGVkIG9uIHRoZSBmbHkgaWYgbmVlZGVkLCBidXQgbmVlZHMgdG8gcnVuIG9uIGl0J3NcbiAgICAgICAgLy8gb3duIGF0IHNvbWUgcG9pbnQgb3IgbGludGluZyBvbiBvcGVuIG9yIG9uIGNoYW5nZSB3aWxsIG5ldmVyIHRyaWdnZXJcbiAgICAgICAgdGhpcy5yZWdpc3RyeUVkaXRvcnNJbml0KClcbiAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuYWRkKHJlZ2lzdHJ5RWRpdG9yc0luaXRDYWxsYmFja0lEKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2tJRCA9PiB3aW5kb3cuY2FuY2VsSWRsZUNhbGxiYWNrKGNhbGxiYWNrSUQpKVxuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG5cbiAgcmVnaXN0cnlFZGl0b3JzSW5pdCgpIHtcbiAgICBpZiAodGhpcy5yZWdpc3RyeUVkaXRvcnMpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIUVkaXRvcnNSZWdpc3RyeSkge1xuICAgICAgRWRpdG9yc1JlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9lZGl0b3ItcmVnaXN0cnknKVxuICAgIH1cbiAgICB0aGlzLnJlZ2lzdHJ5RWRpdG9ycyA9IG5ldyBFZGl0b3JzUmVnaXN0cnkoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeUVkaXRvcnMpXG4gICAgdGhpcy5yZWdpc3RyeUVkaXRvcnMub2JzZXJ2ZSgoZWRpdG9yTGludGVyKSA9PiB7XG4gICAgICBlZGl0b3JMaW50ZXIub25TaG91bGRMaW50KChvbkNoYW5nZSkgPT4ge1xuICAgICAgICB0aGlzLnJlZ2lzdHJ5TGludGVyc0luaXQoKVxuICAgICAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5saW50KHsgb25DaGFuZ2UsIGVkaXRvcjogZWRpdG9yTGludGVyLmdldEVkaXRvcigpIH0pXG4gICAgICB9KVxuICAgICAgZWRpdG9yTGludGVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuZGVsZXRlQnlCdWZmZXIoZWRpdG9yTGludGVyLmdldEVkaXRvcigpLmdldEJ1ZmZlcigpKVxuICAgICAgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlFZGl0b3JzLmFjdGl2YXRlKClcbiAgfVxuICByZWdpc3RyeUxpbnRlcnNJbml0KCkge1xuICAgIGlmICh0aGlzLnJlZ2lzdHJ5TGludGVycykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICghTGludGVyUmVnaXN0cnkpIHtcbiAgICAgIExpbnRlclJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9saW50ZXItcmVnaXN0cnknKVxuICAgIH1cbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycyA9IG5ldyBMaW50ZXJSZWdpc3RyeSgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnJlZ2lzdHJ5TGludGVycylcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5vbkRpZFVwZGF0ZU1lc3NhZ2VzKCh7IGxpbnRlciwgbWVzc2FnZXMsIGJ1ZmZlciB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXNJbml0KClcbiAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5zZXQoeyBsaW50ZXIsIG1lc3NhZ2VzLCBidWZmZXIgfSlcbiAgICB9KVxuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzLm9uRGlkQmVnaW5MaW50aW5nKCh7IGxpbnRlciwgZmlsZVBhdGggfSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeVVJSW5pdCgpXG4gICAgICB0aGlzLnJlZ2lzdHJ5VUkuZGlkQmVnaW5MaW50aW5nKGxpbnRlciwgZmlsZVBhdGgpXG4gICAgfSlcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5vbkRpZEZpbmlzaExpbnRpbmcoKHsgbGludGVyLCBmaWxlUGF0aCB9KSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5VUlJbml0KClcbiAgICAgIHRoaXMucmVnaXN0cnlVSS5kaWRGaW5pc2hMaW50aW5nKGxpbnRlciwgZmlsZVBhdGgpXG4gICAgfSlcbiAgfVxuICByZWdpc3RyeUluZGllSW5pdCgpIHtcbiAgICBpZiAodGhpcy5yZWdpc3RyeUluZGllKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFJbmRpZVJlZ2lzdHJ5KSB7XG4gICAgICBJbmRpZVJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9pbmRpZS1yZWdpc3RyeScpXG4gICAgfVxuICAgIHRoaXMucmVnaXN0cnlJbmRpZSA9IG5ldyBJbmRpZVJlZ2lzdHJ5KClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMucmVnaXN0cnlJbmRpZSlcbiAgICB0aGlzLnJlZ2lzdHJ5SW5kaWUub2JzZXJ2ZSgoaW5kaWVMaW50ZXIpID0+IHtcbiAgICAgIGluZGllTGludGVyLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuZGVsZXRlQnlMaW50ZXIoaW5kaWVMaW50ZXIpXG4gICAgICB9KVxuICAgIH0pXG4gICAgdGhpcy5yZWdpc3RyeUluZGllLm9uRGlkVXBkYXRlKCh7IGxpbnRlciwgbWVzc2FnZXMgfSkgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RyeU1lc3NhZ2VzSW5pdCgpXG4gICAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXMuc2V0KHsgbGludGVyLCBtZXNzYWdlcywgYnVmZmVyOiBudWxsIH0pXG4gICAgfSlcbiAgfVxuICByZWdpc3RyeU1lc3NhZ2VzSW5pdCgpIHtcbiAgICBpZiAodGhpcy5yZWdpc3RyeU1lc3NhZ2VzKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFNZXNzYWdlUmVnaXN0cnkpIHtcbiAgICAgIE1lc3NhZ2VSZWdpc3RyeSA9IHJlcXVpcmUoJy4vbWVzc2FnZS1yZWdpc3RyeScpXG4gICAgfVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcyA9IG5ldyBNZXNzYWdlUmVnaXN0cnkoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeU1lc3NhZ2VzKVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5vbkRpZFVwZGF0ZU1lc3NhZ2VzKChkaWZmZXJlbmNlKSA9PiB7XG4gICAgICB0aGlzLnJlZ2lzdHJ5VUlJbml0KClcbiAgICAgIHRoaXMucmVnaXN0cnlVSS5yZW5kZXIoZGlmZmVyZW5jZSlcbiAgICB9KVxuICB9XG4gIHJlZ2lzdHJ5VUlJbml0KCkge1xuICAgIGlmICh0aGlzLnJlZ2lzdHJ5VUkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoIVVJUmVnaXN0cnkpIHtcbiAgICAgIFVJUmVnaXN0cnkgPSByZXF1aXJlKCcuL3VpLXJlZ2lzdHJ5JylcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RyeVVJID0gbmV3IFVJUmVnaXN0cnkoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5yZWdpc3RyeVVJKVxuICB9XG5cbiAgLy8gQVBJIG1ldGhvZHMgZm9yIHByb3ZpZGluZy9jb25zdW1pbmcgc2VydmljZXNcbiAgLy8gVUlcbiAgYWRkVUkodWk6IFVJKSB7XG4gICAgdGhpcy5yZWdpc3RyeVVJSW5pdCgpXG4gICAgdGhpcy5yZWdpc3RyeVVJLmFkZCh1aSlcbiAgICB0aGlzLnJlZ2lzdHJ5TWVzc2FnZXNJbml0KClcbiAgICBjb25zdCBtZXNzYWdlcyA9IHRoaXMucmVnaXN0cnlNZXNzYWdlcy5tZXNzYWdlc1xuICAgIGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgIHVpLnJlbmRlcih7IGFkZGVkOiBtZXNzYWdlcywgbWVzc2FnZXMsIHJlbW92ZWQ6IFtdIH0pXG4gICAgfVxuICB9XG4gIGRlbGV0ZVVJKHVpOiBVSSkge1xuICAgIHRoaXMucmVnaXN0cnlVSUluaXQoKVxuICAgIHRoaXMucmVnaXN0cnlVSS5kZWxldGUodWkpXG4gIH1cbiAgLy8gU3RhbmRhcmQgTGludGVyXG4gIGFkZExpbnRlcihsaW50ZXI6IExpbnRlclByb3ZpZGVyLCBsZWdhY3k6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIHRoaXMucmVnaXN0cnlMaW50ZXJzSW5pdCgpXG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnMuYWRkTGludGVyKGxpbnRlciwgbGVnYWN5KVxuICB9XG4gIGRlbGV0ZUxpbnRlcihsaW50ZXI6IExpbnRlclByb3ZpZGVyKSB7XG4gICAgdGhpcy5yZWdpc3RyeUxpbnRlcnNJbml0KClcbiAgICB0aGlzLnJlZ2lzdHJ5TGludGVycy5kZWxldGVMaW50ZXIobGludGVyKVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgIHRoaXMucmVnaXN0cnlNZXNzYWdlcy5kZWxldGVCeUxpbnRlcihsaW50ZXIpXG4gIH1cbiAgLy8gSW5kaWUgTGludGVyXG4gIGFkZEluZGllKGluZGllOiBPYmplY3QpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5SW5kaWVJbml0KClcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyeUluZGllLnJlZ2lzdGVyKGluZGllLCAyKVxuICB9XG4gIGFkZExlZ2FjeUluZGllKGluZGllOiBPYmplY3QpIHtcbiAgICB0aGlzLnJlZ2lzdHJ5SW5kaWVJbml0KClcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RyeUluZGllLnJlZ2lzdGVyKGluZGllLCAxKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGludGVyXG4iXX0=