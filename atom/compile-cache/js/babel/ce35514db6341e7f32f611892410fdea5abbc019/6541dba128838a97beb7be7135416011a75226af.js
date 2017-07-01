function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _jasmineFix = require('jasmine-fix');

var _libHelpers = require('../lib/helpers');

var Helpers = _interopRequireWildcard(_libHelpers);

var _libLinterRegistry = require('../lib/linter-registry');

var _libLinterRegistry2 = _interopRequireDefault(_libLinterRegistry);

var _common = require('./common');

describe('LinterRegistry', function () {
  var linterRegistry = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    atom.packages.loadPackage('linter');
    atom.packages.loadPackage('language-javascript');
    linterRegistry = new _libLinterRegistry2['default']();
    yield atom.packages.activatePackage('language-javascript');
    yield atom.workspace.open(__filename);
  }));
  afterEach(function () {
    linterRegistry.dispose();
    atom.workspace.destroyActivePane();
  });

  describe('life cycle', function () {
    (0, _jasmineFix.it)('works', function () {
      var linter = (0, _common.getLinter)();
      expect(linterRegistry.hasLinter(linter)).toBe(false);
      linterRegistry.addLinter(linter);
      expect(linterRegistry.hasLinter(linter)).toBe(true);
      linterRegistry.deleteLinter(linter);
      expect(linterRegistry.hasLinter(linter)).toBe(false);
    });
    (0, _jasmineFix.it)('sets props on add', function () {
      var linter = (0, _common.getLinter)();
      expect(typeof linter[Helpers.$version]).toBe('undefined');
      expect(typeof linter[Helpers.$requestLatest]).toBe('undefined');
      expect(typeof linter[Helpers.$requestLastReceived]).toBe('undefined');
      linterRegistry.addLinter(linter);
      expect(typeof linter[Helpers.$version]).toBe('number');
      expect(typeof linter[Helpers.$requestLatest]).toBe('number');
      expect(typeof linter[Helpers.$requestLastReceived]).toBe('number');
      expect(linter[Helpers.$version]).toBe(2);
      expect(linter[Helpers.$requestLatest]).toBe(0);
      expect(linter[Helpers.$requestLastReceived]).toBe(0);
    });
    (0, _jasmineFix.it)('sets version based on legacy param', function () {
      {
        // scenario: 2
        var linter = (0, _common.getLinter)();
        linterRegistry.addLinter(linter);
        expect(linter[Helpers.$version]).toBe(2);
      }
      {
        // scenario: 1
        var linter = (0, _common.getLinter)();
        linter.lintOnFly = linter.lintsOnChange;
        linterRegistry.addLinter(linter, true);
        expect(linter[Helpers.$version]).toBe(1);
      }
    });
    (0, _jasmineFix.it)('deactivates the attributes on delete', function () {
      var linter = (0, _common.getLinter)();
      linterRegistry.addLinter(linter);
      expect(linter[Helpers.$activated]).toBe(true);
      linterRegistry.deleteLinter(linter);
      expect(linter[Helpers.$activated]).toBe(false);
    });
  });
  describe('::lint', function () {
    (0, _jasmineFix.it)('does not lint if editor is not saved on disk', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open();
        var editor = atom.workspace.getActiveTextEditor();
        expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(false);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('does not lint if editor is ignored by VCS', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open((0, _common.getFixturesPath)('ignored.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(false);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('does not lint onChange if onChange is disabled by config', _asyncToGenerator(function* () {
      try {
        atom.config.set('linter.lintOnChange', false);
        yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        expect((yield linterRegistry.lint({ editor: editor, onChange: true }))).toBe(false);
      } finally {
        atom.config.set('linter.lintOnChange', true);
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('lints onChange if allowed by config', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        expect((yield linterRegistry.lint({ editor: editor, onChange: true }))).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('does not lint preview tabs if disallowed by config', _asyncToGenerator(function* () {
      try {
        yield* (function* () {
          atom.config.set('linter.lintPreviewTabs', false);
          yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
          var editor = atom.workspace.getActiveTextEditor();
          var activePane = atom.workspace.getActivePane();
          spyOn(activePane, 'getPendingItem').andCallFake(function () {
            return editor;
          });
          expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(false);
        })();
      } finally {
        atom.config.set('linter.lintPreviewTabs', true);
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('does lint preview tabs if allowed by config', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        editor.hasTerminatedPendingState = false;
        expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('lints the editor even if its not the active one', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open((0, _common.getFixturesPath)('file.txt'));
        var editor = atom.workspace.getActiveTextEditor();
        yield atom.workspace.open(__filename);
        expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('triggers providers if scopes match', _asyncToGenerator(function* () {
      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      spyOn(Helpers, 'shouldTriggerLinter').andCallThrough();
      spyOn(linter, 'lint').andCallThrough();
      expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(true);
      expect(Helpers.shouldTriggerLinter).toHaveBeenCalled();
      // $FlowIgnore: It's a magic property, duh
      expect(Helpers.shouldTriggerLinter.calls.length).toBe(1);
      expect(linter.lint).toHaveBeenCalled();
      expect(linter.lint.calls.length).toBe(1);
    }));
    (0, _jasmineFix.it)('does not match if scopes dont match', _asyncToGenerator(function* () {
      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linter.grammarScopes = ['source.coffee'];
      linterRegistry.addLinter(linter);
      spyOn(Helpers, 'shouldTriggerLinter').andCallThrough();
      spyOn(linter, 'lint').andCallThrough();
      expect((yield linterRegistry.lint({ editor: editor, onChange: false }))).toBe(true);
      expect(Helpers.shouldTriggerLinter).toHaveBeenCalled();
      // $FlowIgnore: It's a magic property, duh
      expect(Helpers.shouldTriggerLinter.calls.length).toBe(1);
      expect(linter.lint).not.toHaveBeenCalled();
      expect(linter.lint.calls.length).toBe(0);
    }));
    (0, _jasmineFix.it)('emits events properly', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesUpdated).toBe(0);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does not update if the buffer it was associated to was destroyed', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesUpdated).toBe(0);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linter.scope = 'file';
      linterRegistry.addLinter(linter);
      editor.destroy();
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(0);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does update if buffer was destroyed if its project scoped', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesUpdated).toBe(0);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      editor.destroy();
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does not update if null is returned', _asyncToGenerator(function* () {
      var promise = undefined;
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesBegan - 1).toBe(timesFinished);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesFinished - 1).toBe(timesUpdated);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      linter.lint = _asyncToGenerator(function* () {
        yield (0, _jasmineFix.wait)(50);
        if (timesBegan === 2) {
          return null;
        }
        return [];
      });

      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(2);
    }));
    (0, _jasmineFix.it)('shows error notification if response is not array and is non-null', _asyncToGenerator(function* () {
      var promise = undefined;
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesBegan - 1).toBe(timesFinished);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        // NOTE: Not adding a timesUpdated assertion here on purpose
        // Because we're testing invalid return values and they don't
        // update linter result
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      linter.lint = _asyncToGenerator(function* () {
        yield (0, _jasmineFix.wait)(50);
        if (timesBegan === 2) {
          return false;
        } else if (timesBegan === 3) {
          return null;
        } else if (timesBegan === 4) {
          return undefined;
        }
        return [];
      });

      // with array
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
      expect(atom.notifications.getNotifications().length).toBe(0);

      // with false
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(2);
      expect(atom.notifications.getNotifications().length).toBe(1);

      // with null
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(3);
      expect(atom.notifications.getNotifications().length).toBe(1);

      // with undefined
      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(4);
      expect(atom.notifications.getNotifications().length).toBe(2);
    }));
    (0, _jasmineFix.it)('triggers the finish event even when the provider crashes', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesUpdated).toBe(0);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      linter.lint = _asyncToGenerator(function* () {
        yield (0, _jasmineFix.wait)(50);throw new Error('Boom');
      });
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(0);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('gives buffer for file scoped linters on update event', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesBegan).toBe(1);
      });
      linterRegistry.onDidUpdateMessages(function (_ref) {
        var buffer = _ref.buffer;

        timesUpdated++;
        expect(buffer.constructor.name).toBe('TextBuffer');
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linter.scope = 'file';
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does not give a buffer for project scoped linters on update event', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        timesBegan++;
        expect(timesFinished).toBe(0);
      });
      linterRegistry.onDidFinishLinting(function () {
        timesFinished++;
        expect(timesBegan).toBe(1);
      });
      linterRegistry.onDidUpdateMessages(function (_ref2) {
        var buffer = _ref2.buffer;

        timesUpdated++;
        expect(buffer).toBe(null);
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('gives a filepath for file scoped linters on start and finish events', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function (_ref3) {
        var filePath = _ref3.filePath;

        timesBegan++;
        expect(timesFinished).toBe(0);
        expect(filePath).toBe(__filename);
      });
      linterRegistry.onDidFinishLinting(function (_ref4) {
        var filePath = _ref4.filePath;

        timesFinished++;
        expect(timesBegan).toBe(1);
        expect(filePath).toBe(__filename);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linter.scope = 'file';
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)('does not give a file path for project scoped linters on start and finish events', _asyncToGenerator(function* () {
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function (_ref5) {
        var filePath = _ref5.filePath;

        timesBegan++;
        expect(timesFinished).toBe(0);
        expect(filePath).toBe(null);
      });
      linterRegistry.onDidFinishLinting(function (_ref6) {
        var filePath = _ref6.filePath;

        timesFinished++;
        expect(timesBegan).toBe(1);
        expect(filePath).toBe(null);
      });
      linterRegistry.onDidUpdateMessages(function () {
        timesUpdated++;
        expect(timesFinished).toBe(1);
      });

      var linter = (0, _common.getLinter)();
      var editor = atom.workspace.getActiveTextEditor();
      linterRegistry.addLinter(linter);
      var promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    }));
    (0, _jasmineFix.it)("does not invoke a linter if it's ignored", _asyncToGenerator(function* () {
      var promise = undefined;
      var timesBegan = 0;
      var timesUpdated = 0;
      var timesFinished = 0;

      linterRegistry.onDidBeginLinting(function () {
        return timesBegan++;
      });
      linterRegistry.onDidFinishLinting(function () {
        return timesFinished++;
      });
      linterRegistry.onDidUpdateMessages(function () {
        return timesUpdated++;
      });

      var linter = (0, _common.getLinter)();
      atom.config.set('linter.disabledProviders', []);
      var editor = atom.workspace.getActiveTextEditor();
      linter.name = 'Some Linter';
      linterRegistry.addLinter(linter);

      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);

      atom.config.set('linter.disabledProviders', [linter.name]);
      yield (0, _jasmineFix.wait)(100);

      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);

      atom.config.set('linter.disabledProviders', []);
      yield (0, _jasmineFix.wait)(100);

      promise = linterRegistry.lint({ editor: editor, onChange: false });
      expect((yield promise)).toBe(true);
      expect(timesBegan).toBe(2);
      expect(timesUpdated).toBe(2);
      expect(timesFinished).toBe(2);
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvbGludGVyLXJlZ2lzdHJ5LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzBCQUVxQyxhQUFhOzswQkFDekIsZ0JBQWdCOztJQUE3QixPQUFPOztpQ0FDUSx3QkFBd0I7Ozs7c0JBQ1IsVUFBVTs7QUFFckQsUUFBUSxDQUFDLGdCQUFnQixFQUFFLFlBQVc7QUFDcEMsTUFBSSxjQUFjLFlBQUEsQ0FBQTs7QUFFbEIsZ0RBQVcsYUFBaUI7QUFDMUIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDbkMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQTtBQUNoRCxrQkFBYyxHQUFHLG9DQUFvQixDQUFBO0FBQ3JDLFVBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsQ0FBQTtBQUMxRCxVQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0dBQ3RDLEVBQUMsQ0FBQTtBQUNGLFdBQVMsQ0FBQyxZQUFXO0FBQ25CLGtCQUFjLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0dBQ25DLENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsWUFBWSxFQUFFLFlBQVc7QUFDaEMsd0JBQUcsT0FBTyxFQUFFLFlBQVc7QUFDckIsVUFBTSxNQUFNLEdBQUcsd0JBQVcsQ0FBQTtBQUMxQixZQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNwRCxvQkFBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNoQyxZQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMs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QUMsQ0FBQTtBQUMxRCxZQUFNLHNCQUFLLEdBQUcsQ0FBQyxDQUFBOztBQUVmLGFBQU8sR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtBQUMxRCxZQUFNLEVBQUMsTUFBTSxPQUFPLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNoQyxZQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzFCLFlBQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDNUIsWUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTs7QUFFN0IsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDL0MsWUFBTSxzQkFBSyxHQUFHLENBQUMsQ0FBQTs7QUFFZixhQUFPLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7QUFDMUQsWUFBTSxFQUFDLE1BQU0sT0FBTyxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsWUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMxQixZQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVCLFlBQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDOUIsRUFBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvbGludGVyLXJlZ2lzdHJ5LXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBpdCwgd2FpdCwgYmVmb3JlRWFjaCB9IGZyb20gJ2phc21pbmUtZml4J1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuLi9saWIvaGVscGVycydcbmltcG9ydCBMaW50ZXJSZWdpc3RyeSBmcm9tICcuLi9saWIvbGludGVyLXJlZ2lzdHJ5J1xuaW1wb3J0IHsgZ2V0TGludGVyLCBnZXRGaXh0dXJlc1BhdGggfSBmcm9tICcuL2NvbW1vbidcblxuZGVzY3JpYmUoJ0xpbnRlclJlZ2lzdHJ5JywgZnVuY3Rpb24oKSB7XG4gIGxldCBsaW50ZXJSZWdpc3RyeVxuXG4gIGJlZm9yZUVhY2goYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgnbGludGVyJylcbiAgICBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICBsaW50ZXJSZWdpc3RyeSA9IG5ldyBMaW50ZXJSZWdpc3RyeSgpXG4gICAgYXdhaXQgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oX19maWxlbmFtZSlcbiAgfSlcbiAgYWZ0ZXJFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGxpbnRlclJlZ2lzdHJ5LmRpc3Bvc2UoKVxuICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgfSlcblxuICBkZXNjcmliZSgnbGlmZSBjeWNsZScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCd3b3JrcycsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGV4cGVjdChsaW50ZXJSZWdpc3RyeS5oYXNMaW50ZXIobGludGVyKSkudG9CZShmYWxzZSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBleHBlY3QobGludGVyUmVnaXN0cnkuaGFzTGludGVyKGxpbnRlcikpLnRvQmUodHJ1ZSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmRlbGV0ZUxpbnRlcihsaW50ZXIpXG4gICAgICBleHBlY3QobGludGVyUmVnaXN0cnkuaGFzTGludGVyKGxpbnRlcikpLnRvQmUoZmFsc2UpXG4gICAgfSlcbiAgICBpdCgnc2V0cyBwcm9wcyBvbiBhZGQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBleHBlY3QodHlwZW9mIGxpbnRlcltIZWxwZXJzLiR2ZXJzaW9uXSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIGV4cGVjdCh0eXBlb2YgbGludGVyW0hlbHBlcnMuJHJlcXVlc3RMYXRlc3RdKS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgZXhwZWN0KHR5cGVvZiBsaW50ZXJbSGVscGVycy4kcmVxdWVzdExhc3RSZWNlaXZlZF0pLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgZXhwZWN0KHR5cGVvZiBsaW50ZXJbSGVscGVycy4kdmVyc2lvbl0pLnRvQmUoJ251bWJlcicpXG4gICAgICBleHBlY3QodHlwZW9mIGxpbnRlcltIZWxwZXJzLiRyZXF1ZXN0TGF0ZXN0XSkudG9CZSgnbnVtYmVyJylcbiAgICAgIGV4cGVjdCh0eXBlb2YgbGludGVyW0hlbHBlcnMuJHJlcXVlc3RMYXN0UmVjZWl2ZWRdKS50b0JlKCdudW1iZXInKVxuICAgICAgZXhwZWN0KGxpbnRlcltIZWxwZXJzLiR2ZXJzaW9uXSkudG9CZSgyKVxuICAgICAgZXhwZWN0KGxpbnRlcltIZWxwZXJzLiRyZXF1ZXN0TGF0ZXN0XSkudG9CZSgwKVxuICAgICAgZXhwZWN0KGxpbnRlcltIZWxwZXJzLiRyZXF1ZXN0TGFzdFJlY2VpdmVkXSkudG9CZSgwKVxuICAgIH0pXG4gICAgaXQoJ3NldHMgdmVyc2lvbiBiYXNlZCBvbiBsZWdhY3kgcGFyYW0nLCBmdW5jdGlvbigpIHtcbiAgICAgIHtcbiAgICAgICAgLy8gc2NlbmFyaW86IDJcbiAgICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgICAgZXhwZWN0KGxpbnRlcltIZWxwZXJzLiR2ZXJzaW9uXSkudG9CZSgyKVxuICAgICAgfVxuICAgICAge1xuICAgICAgICAvLyBzY2VuYXJpbzogMVxuICAgICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgICBsaW50ZXIubGludE9uRmx5ID0gbGludGVyLmxpbnRzT25DaGFuZ2VcbiAgICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlciwgdHJ1ZSlcbiAgICAgICAgZXhwZWN0KGxpbnRlcltIZWxwZXJzLiR2ZXJzaW9uXSkudG9CZSgxKVxuICAgICAgfVxuICAgIH0pXG4gICAgaXQoJ2RlYWN0aXZhdGVzIHRoZSBhdHRyaWJ1dGVzIG9uIGRlbGV0ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBleHBlY3QobGludGVyW0hlbHBlcnMuJGFjdGl2YXRlZF0pLnRvQmUodHJ1ZSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmRlbGV0ZUxpbnRlcihsaW50ZXIpXG4gICAgICBleHBlY3QobGludGVyW0hlbHBlcnMuJGFjdGl2YXRlZF0pLnRvQmUoZmFsc2UpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJzo6bGludCcsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdkb2VzIG5vdCBsaW50IGlmIGVkaXRvciBpcyBub3Qgc2F2ZWQgb24gZGlzaycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBleHBlY3QoYXdhaXQgbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pKS50b0JlKGZhbHNlKVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgICAgfVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IGxpbnQgaWYgZWRpdG9yIGlzIGlnbm9yZWQgYnkgVkNTJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGdldEZpeHR1cmVzUGF0aCgnaWdub3JlZC50eHQnKSlcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGV4cGVjdChhd2FpdCBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSkpLnRvQmUoZmFsc2UpXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZSgpXG4gICAgICB9XG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgbGludCBvbkNoYW5nZSBpZiBvbkNoYW5nZSBpcyBkaXNhYmxlZCBieSBjb25maWcnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmxpbnRPbkNoYW5nZScsIGZhbHNlKVxuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGdldEZpeHR1cmVzUGF0aCgnZmlsZS50eHQnKSlcbiAgICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIGV4cGVjdChhd2FpdCBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogdHJ1ZSB9KSkudG9CZShmYWxzZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmxpbnRPbkNoYW5nZScsIHRydWUpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGl0KCdsaW50cyBvbkNoYW5nZSBpZiBhbGxvd2VkIGJ5IGNvbmZpZycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihnZXRGaXh0dXJlc1BhdGgoJ2ZpbGUudHh0JykpXG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBleHBlY3QoYXdhaXQgbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IHRydWUgfSkpLnRvQmUodHJ1ZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGl0KCdkb2VzIG5vdCBsaW50IHByZXZpZXcgdGFicyBpZiBkaXNhbGxvd2VkIGJ5IGNvbmZpZycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXIubGludFByZXZpZXdUYWJzJywgZmFsc2UpXG4gICAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZ2V0Rml4dHVyZXNQYXRoKCdmaWxlLnR4dCcpKVxuICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgY29uc3QgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBzcHlPbihhY3RpdmVQYW5lLCAnZ2V0UGVuZGluZ0l0ZW0nKS5hbmRDYWxsRmFrZSgoKSA9PiBlZGl0b3IpXG4gICAgICAgIGV4cGVjdChhd2FpdCBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSkpLnRvQmUoZmFsc2UpXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci5saW50UHJldmlld1RhYnMnLCB0cnVlKVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZSgpXG4gICAgICB9XG4gICAgfSlcbiAgICBpdCgnZG9lcyBsaW50IHByZXZpZXcgdGFicyBpZiBhbGxvd2VkIGJ5IGNvbmZpZycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihnZXRGaXh0dXJlc1BhdGgoJ2ZpbGUudHh0JykpXG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBlZGl0b3IuaGFzVGVybWluYXRlZFBlbmRpbmdTdGF0ZSA9IGZhbHNlXG4gICAgICAgIGV4cGVjdChhd2FpdCBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSkpLnRvQmUodHJ1ZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGl0KCdsaW50cyB0aGUgZWRpdG9yIGV2ZW4gaWYgaXRzIG5vdCB0aGUgYWN0aXZlIG9uZScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihnZXRGaXh0dXJlc1BhdGgoJ2ZpbGUudHh0JykpXG4gICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKF9fZmlsZW5hbWUpXG4gICAgICAgIGV4cGVjdChhd2FpdCBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSkpLnRvQmUodHJ1ZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGl0KCd0cmlnZ2VycyBwcm92aWRlcnMgaWYgc2NvcGVzIG1hdGNoJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgc3B5T24oSGVscGVycywgJ3Nob3VsZFRyaWdnZXJMaW50ZXInKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihsaW50ZXIsICdsaW50JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgZXhwZWN0KGF3YWl0IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAvLyAkRmxvd0lnbm9yZTogSXQncyBhIG1hZ2ljIHByb3BlcnR5LCBkdWhcbiAgICAgIGV4cGVjdChIZWxwZXJzLnNob3VsZFRyaWdnZXJMaW50ZXIuY2FsbHMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QobGludGVyLmxpbnQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KGxpbnRlci5saW50LmNhbGxzLmxlbmd0aCkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IG1hdGNoIGlmIHNjb3BlcyBkb250IG1hdGNoJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXIuZ3JhbW1hclNjb3BlcyA9IFsnc291cmNlLmNvZmZlZSddXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgc3B5T24oSGVscGVycywgJ3Nob3VsZFRyaWdnZXJMaW50ZXInKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihsaW50ZXIsICdsaW50JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgZXhwZWN0KGF3YWl0IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcikudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAvLyAkRmxvd0lnbm9yZTogSXQncyBhIG1hZ2ljIHByb3BlcnR5LCBkdWhcbiAgICAgIGV4cGVjdChIZWxwZXJzLnNob3VsZFRyaWdnZXJMaW50ZXIuY2FsbHMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QobGludGVyLmxpbnQpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChsaW50ZXIubGludC5jYWxscy5sZW5ndGgpLnRvQmUoMClcbiAgICB9KVxuICAgIGl0KCdlbWl0cyBldmVudHMgcHJvcGVybHknLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNCZWdhbisrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDApXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRGaW5pc2hMaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0ZpbmlzaGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgwKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzVXBkYXRlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgY29uc3QgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IHVwZGF0ZSBpZiB0aGUgYnVmZmVyIGl0IHdhcyBhc3NvY2lhdGVkIHRvIHdhcyBkZXN0cm95ZWQnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNCZWdhbisrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDApXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRGaW5pc2hMaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0ZpbmlzaGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgwKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzVXBkYXRlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXIuc2NvcGUgPSAnZmlsZSdcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBlZGl0b3IuZGVzdHJveSgpXG4gICAgICBjb25zdCBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMClcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnZG9lcyB1cGRhdGUgaWYgYnVmZmVyIHdhcyBkZXN0cm95ZWQgaWYgaXRzIHByb2plY3Qgc2NvcGVkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNCZWdhbiA9IDBcbiAgICAgIGxldCB0aW1lc1VwZGF0ZWQgPSAwXG4gICAgICBsZXQgdGltZXNGaW5pc2hlZCA9IDBcblxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRCZWdpbkxpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzQmVnYW4rK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgwKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkRmluaXNoTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNGaW5pc2hlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1VwZGF0ZWQrK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgIGNvbnN0IHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KCdkb2VzIG5vdCB1cGRhdGUgaWYgbnVsbCBpcyByZXR1cm5lZCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHByb21pc2VcbiAgICAgIGxldCB0aW1lc0JlZ2FuID0gMFxuICAgICAgbGV0IHRpbWVzVXBkYXRlZCA9IDBcbiAgICAgIGxldCB0aW1lc0ZpbmlzaGVkID0gMFxuXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEJlZ2luTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNCZWdhbisrXG4gICAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuIC0gMSkudG9CZSh0aW1lc0ZpbmlzaGVkKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkRmluaXNoTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNGaW5pc2hlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkIC0gMSkudG9CZSh0aW1lc1VwZGF0ZWQpXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNVcGRhdGVkKytcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBsaW50ZXIubGludCA9IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBhd2FpdCB3YWl0KDUwKVxuICAgICAgICBpZiAodGltZXNCZWdhbiA9PT0gMikge1xuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9XG5cbiAgICAgIHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgICAgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDIpXG4gICAgfSlcbiAgICBpdCgnc2hvd3MgZXJyb3Igbm90aWZpY2F0aW9uIGlmIHJlc3BvbnNlIGlzIG5vdCBhcnJheSBhbmQgaXMgbm9uLW51bGwnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBwcm9taXNlXG4gICAgICBsZXQgdGltZXNCZWdhbiA9IDBcbiAgICAgIGxldCB0aW1lc1VwZGF0ZWQgPSAwXG4gICAgICBsZXQgdGltZXNGaW5pc2hlZCA9IDBcblxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRCZWdpbkxpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzQmVnYW4rK1xuICAgICAgICBleHBlY3QodGltZXNCZWdhbiAtIDEpLnRvQmUodGltZXNGaW5pc2hlZClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEZpbmlzaExpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzRmluaXNoZWQrK1xuICAgICAgICAvLyBOT1RFOiBOb3QgYWRkaW5nIGEgdGltZXNVcGRhdGVkIGFzc2VydGlvbiBoZXJlIG9uIHB1cnBvc2VcbiAgICAgICAgLy8gQmVjYXVzZSB3ZSdyZSB0ZXN0aW5nIGludmFsaWQgcmV0dXJuIHZhbHVlcyBhbmQgdGhleSBkb24ndFxuICAgICAgICAvLyB1cGRhdGUgbGludGVyIHJlc3VsdFxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzVXBkYXRlZCsrXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsaW50ZXIgPSBnZXRMaW50ZXIoKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgbGludGVyLmxpbnQgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgYXdhaXQgd2FpdCg1MClcbiAgICAgICAgaWYgKHRpbWVzQmVnYW4gPT09IDIpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSBlbHNlIGlmICh0aW1lc0JlZ2FuID09PSAzKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfSBlbHNlIGlmICh0aW1lc0JlZ2FuID09PSA0KSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfVxuXG4gICAgICAvLyB3aXRoIGFycmF5XG4gICAgICBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpLmxlbmd0aCkudG9CZSgwKVxuXG4gICAgICAvLyB3aXRoIGZhbHNlXG4gICAgICBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMilcbiAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpLmxlbmd0aCkudG9CZSgxKVxuXG4gICAgICAvLyB3aXRoIG51bGxcbiAgICAgIHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgzKVxuICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5nZXROb3RpZmljYXRpb25zKCkubGVuZ3RoKS50b0JlKDEpXG5cbiAgICAgIC8vIHdpdGggdW5kZWZpbmVkXG4gICAgICBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoNClcbiAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpLmxlbmd0aCkudG9CZSgyKVxuICAgIH0pXG4gICAgaXQoJ3RyaWdnZXJzIHRoZSBmaW5pc2ggZXZlbnQgZXZlbiB3aGVuIHRoZSBwcm92aWRlciBjcmFzaGVzJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNCZWdhbiA9IDBcbiAgICAgIGxldCB0aW1lc1VwZGF0ZWQgPSAwXG4gICAgICBsZXQgdGltZXNGaW5pc2hlZCA9IDBcblxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRCZWdpbkxpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzQmVnYW4rK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgwKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkRmluaXNoTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNGaW5pc2hlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1VwZGF0ZWQrK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGxpbnRlci5saW50ID0gYXN5bmMgZnVuY3Rpb24oKSB7IGF3YWl0IHdhaXQoNTApOyB0aHJvdyBuZXcgRXJyb3IoJ0Jvb20nKSB9XG4gICAgICBjb25zdCBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMClcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnZ2l2ZXMgYnVmZmVyIGZvciBmaWxlIHNjb3BlZCBsaW50ZXJzIG9uIHVwZGF0ZSBldmVudCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzQmVnYW4gPSAwXG4gICAgICBsZXQgdGltZXNVcGRhdGVkID0gMFxuICAgICAgbGV0IHRpbWVzRmluaXNoZWQgPSAwXG5cbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkQmVnaW5MaW50aW5nKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0JlZ2FuKytcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEZpbmlzaExpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzRmluaXNoZWQrK1xuICAgICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oeyBidWZmZXIgfSkge1xuICAgICAgICB0aW1lc1VwZGF0ZWQrK1xuICAgICAgICBleHBlY3QoYnVmZmVyLmNvbnN0cnVjdG9yLm5hbWUpLnRvQmUoJ1RleHRCdWZmZXInKVxuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgbGludGVyLnNjb3BlID0gJ2ZpbGUnXG4gICAgICBsaW50ZXJSZWdpc3RyeS5hZGRMaW50ZXIobGludGVyKVxuICAgICAgY29uc3QgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IGdpdmUgYSBidWZmZXIgZm9yIHByb2plY3Qgc2NvcGVkIGxpbnRlcnMgb24gdXBkYXRlIGV2ZW50JywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNCZWdhbiA9IDBcbiAgICAgIGxldCB0aW1lc1VwZGF0ZWQgPSAwXG4gICAgICBsZXQgdGltZXNGaW5pc2hlZCA9IDBcblxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRCZWdpbkxpbnRpbmcoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzQmVnYW4rK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgwKVxuICAgICAgfSlcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkRmluaXNoTGludGluZyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNGaW5pc2hlZCsrXG4gICAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDEpXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbih7IGJ1ZmZlciB9KSB7XG4gICAgICAgIHRpbWVzVXBkYXRlZCsrXG4gICAgICAgIGV4cGVjdChidWZmZXIpLnRvQmUobnVsbClcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG4gICAgICBjb25zdCBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnZ2l2ZXMgYSBmaWxlcGF0aCBmb3IgZmlsZSBzY29wZWQgbGludGVycyBvbiBzdGFydCBhbmQgZmluaXNoIGV2ZW50cycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzQmVnYW4gPSAwXG4gICAgICBsZXQgdGltZXNVcGRhdGVkID0gMFxuICAgICAgbGV0IHRpbWVzRmluaXNoZWQgPSAwXG5cbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkQmVnaW5MaW50aW5nKGZ1bmN0aW9uKHsgZmlsZVBhdGggfSkge1xuICAgICAgICB0aW1lc0JlZ2FuKytcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KGZpbGVQYXRoKS50b0JlKF9fZmlsZW5hbWUpXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRGaW5pc2hMaW50aW5nKGZ1bmN0aW9uKHsgZmlsZVBhdGggfSkge1xuICAgICAgICB0aW1lc0ZpbmlzaGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KGZpbGVQYXRoKS50b0JlKF9fZmlsZW5hbWUpXG4gICAgICB9KVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNVcGRhdGVkKytcbiAgICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGxpbnRlci5zY29wZSA9ICdmaWxlJ1xuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGNvbnN0IHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KCdkb2VzIG5vdCBnaXZlIGEgZmlsZSBwYXRoIGZvciBwcm9qZWN0IHNjb3BlZCBsaW50ZXJzIG9uIHN0YXJ0IGFuZCBmaW5pc2ggZXZlbnRzJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNCZWdhbiA9IDBcbiAgICAgIGxldCB0aW1lc1VwZGF0ZWQgPSAwXG4gICAgICBsZXQgdGltZXNGaW5pc2hlZCA9IDBcblxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRCZWdpbkxpbnRpbmcoZnVuY3Rpb24oeyBmaWxlUGF0aCB9KSB7XG4gICAgICAgIHRpbWVzQmVnYW4rK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgwKVxuICAgICAgICBleHBlY3QoZmlsZVBhdGgpLnRvQmUobnVsbClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZEZpbmlzaExpbnRpbmcoZnVuY3Rpb24oeyBmaWxlUGF0aCB9KSB7XG4gICAgICAgIHRpbWVzRmluaXNoZWQrK1xuICAgICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgICBleHBlY3QoZmlsZVBhdGgpLnRvQmUobnVsbClcbiAgICAgIH0pXG4gICAgICBsaW50ZXJSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1VwZGF0ZWQrK1xuICAgICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgxKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgbGludGVyID0gZ2V0TGludGVyKClcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgbGludGVyUmVnaXN0cnkuYWRkTGludGVyKGxpbnRlcilcbiAgICAgIGNvbnN0IHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzVXBkYXRlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzRmluaXNoZWQpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KFwiZG9lcyBub3QgaW52b2tlIGEgbGludGVyIGlmIGl0J3MgaWdub3JlZFwiLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBwcm9taXNlXG4gICAgICBsZXQgdGltZXNCZWdhbiA9IDBcbiAgICAgIGxldCB0aW1lc1VwZGF0ZWQgPSAwXG4gICAgICBsZXQgdGltZXNGaW5pc2hlZCA9IDBcblxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRCZWdpbkxpbnRpbmcoKCkgPT4gdGltZXNCZWdhbisrKVxuICAgICAgbGludGVyUmVnaXN0cnkub25EaWRGaW5pc2hMaW50aW5nKCgpID0+IHRpbWVzRmluaXNoZWQrKylcbiAgICAgIGxpbnRlclJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoKCkgPT4gdGltZXNVcGRhdGVkKyspXG5cbiAgICAgIGNvbnN0IGxpbnRlciA9IGdldExpbnRlcigpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci5kaXNhYmxlZFByb3ZpZGVycycsIFtdKVxuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBsaW50ZXIubmFtZSA9ICdTb21lIExpbnRlcidcbiAgICAgIGxpbnRlclJlZ2lzdHJ5LmFkZExpbnRlcihsaW50ZXIpXG5cbiAgICAgIHByb21pc2UgPSBsaW50ZXJSZWdpc3RyeS5saW50KHsgZWRpdG9yLCBvbkNoYW5nZTogZmFsc2UgfSlcbiAgICAgIGV4cGVjdChhd2FpdCBwcm9taXNlKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNCZWdhbikudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmRpc2FibGVkUHJvdmlkZXJzJywgW2xpbnRlci5uYW1lXSlcbiAgICAgIGF3YWl0IHdhaXQoMTAwKVxuXG4gICAgICBwcm9taXNlID0gbGludGVyUmVnaXN0cnkubGludCh7IGVkaXRvciwgb25DaGFuZ2U6IGZhbHNlIH0pXG4gICAgICBleHBlY3QoYXdhaXQgcHJvbWlzZSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KHRpbWVzQmVnYW4pLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc1VwZGF0ZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0ZpbmlzaGVkKS50b0JlKDEpXG5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmRpc2FibGVkUHJvdmlkZXJzJywgW10pXG4gICAgICBhd2FpdCB3YWl0KDEwMClcblxuICAgICAgcHJvbWlzZSA9IGxpbnRlclJlZ2lzdHJ5LmxpbnQoeyBlZGl0b3IsIG9uQ2hhbmdlOiBmYWxzZSB9KVxuICAgICAgZXhwZWN0KGF3YWl0IHByb21pc2UpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdCh0aW1lc0JlZ2FuKS50b0JlKDIpXG4gICAgICBleHBlY3QodGltZXNVcGRhdGVkKS50b0JlKDIpXG4gICAgICBleHBlY3QodGltZXNGaW5pc2hlZCkudG9CZSgyKVxuICAgIH0pXG4gIH0pXG59KVxuIl19