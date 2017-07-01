function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _jasmineFix = require('jasmine-fix');

var _libHelpers = require('../lib/helpers');

var Helpers = _interopRequireWildcard(_libHelpers);

var _common = require('./common');

describe('Helpers', function () {
  // NOTE: Did *not* add specs for messageKey and messageKeyLegacy on purpose
  describe('shouldTriggerLinter', function () {
    function shouldTriggerLinter(a, b, c) {
      return Helpers.shouldTriggerLinter(a, b, c);
    }

    (0, _jasmineFix.it)('works does not trigger non-fly ones on fly', function () {
      expect(shouldTriggerLinter({
        lintOnFly: false,
        grammarScopes: ['source.js']
      }, true, ['source.js'])).toBe(false);
    });
    (0, _jasmineFix.it)('triggers on fly ones on fly', function () {
      expect(shouldTriggerLinter({
        lintOnFly: true,
        grammarScopes: ['source.js', 'source.coffee']
      }, true, ['source.js', 'source.js.emebdded'])).toBe(true);
    });
    (0, _jasmineFix.it)('triggers all on non-fly', function () {
      expect(shouldTriggerLinter({
        lintOnFly: false,
        grammarScopes: ['source.js']
      }, false, ['source.js'])).toBe(true);
      expect(shouldTriggerLinter({
        lintOnFly: true,
        grammarScopes: ['source.js']
      }, false, ['source.js'])).toBe(true);
    });
    (0, _jasmineFix.it)('does not trigger if grammarScopes does not match', function () {
      expect(shouldTriggerLinter({
        lintOnFly: true,
        grammarScopes: ['source.coffee']
      }, true, ['source.js'])).toBe(false);
      expect(shouldTriggerLinter({
        lintOnFly: true,
        grammarScopes: ['source.coffee', 'source.go']
      }, false, ['source.js'])).toBe(false);
      expect(shouldTriggerLinter({
        lintOnFly: false,
        grammarScopes: ['source.coffee', 'source.rust']
      }, false, ['source.js', 'source.hell'])).toBe(false);
    });
  });
  describe('isPathIgnored', function () {
    function isPathIgnored(a, b, c) {
      return Helpers.isPathIgnored(a, b || '**/*.min.{js,css}', c || false);
    }

    (0, _jasmineFix.it)('returns false if path does not match glob', function () {
      expect(isPathIgnored('a.js')).toBe(false);
      expect(isPathIgnored('a.css')).toBe(false);
      expect(isPathIgnored('/a.js')).toBe(false);
      expect(isPathIgnored('/a.css')).toBe(false);
    });
    (0, _jasmineFix.it)('returns false correctly for windows styled paths', function () {
      expect(isPathIgnored('a.js')).toBe(false);
      expect(isPathIgnored('a.css')).toBe(false);
      expect(isPathIgnored('\\a.js')).toBe(false);
      expect(isPathIgnored('\\a.css')).toBe(false);
    });
    (0, _jasmineFix.it)('returns true if path matches glob', function () {
      expect(isPathIgnored('a.min.js')).toBe(true);
      expect(isPathIgnored('a.min.css')).toBe(true);
      expect(isPathIgnored('/a.min.js')).toBe(true);
      expect(isPathIgnored('/a.min.css')).toBe(true);
    });
    (0, _jasmineFix.it)('returns true correctly for windows styled paths', function () {
      expect(isPathIgnored('a.min.js')).toBe(true);
      expect(isPathIgnored('a.min.css')).toBe(true);
      expect(isPathIgnored('\\a.min.js')).toBe(true);
      expect(isPathIgnored('\\a.min.css')).toBe(true);
    });
    (0, _jasmineFix.it)('returns true if the path is ignored by VCS', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open(__filename);
        expect(isPathIgnored((0, _common.getFixturesPath)('ignored.txt'), null, true)).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('returns false if the path is not ignored by VCS', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open(__filename);
        expect(isPathIgnored((0, _common.getFixturesPath)('file.txt'), null, true)).toBe(false);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
  });
  describe('subscriptiveObserve', function () {
    (0, _jasmineFix.it)('activates synchronously', function () {
      var activated = false;
      Helpers.subscriptiveObserve({
        observe: function observe(eventName, callback) {
          activated = true;
          expect(eventName).toBe('someEvent');
          expect(typeof callback).toBe('function');
        }
      }, 'someEvent', function () {});
      expect(activated).toBe(true);
    });
    (0, _jasmineFix.it)('clears last subscription when value changes', function () {
      var disposed = 0;
      var activated = false;
      Helpers.subscriptiveObserve({
        observe: function observe(eventName, callback) {
          activated = true;
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(1);
          callback();
          expect(disposed).toBe(2);
        }
      }, 'someEvent', function () {
        return new _atom.Disposable(function () {
          disposed++;
        });
      });
      expect(activated).toBe(true);
    });
    (0, _jasmineFix.it)('clears both subscriptions at the end', function () {
      var disposed = 0;
      var observeDisposed = 0;
      var activated = false;
      var subscription = Helpers.subscriptiveObserve({
        observe: function observe(eventName, callback) {
          activated = true;
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(0);
          return new _atom.Disposable(function () {
            observeDisposed++;
          });
        }
      }, 'someEvent', function () {
        return new _atom.Disposable(function () {
          disposed++;
        });
      });
      expect(activated).toBe(true);
      subscription.dispose();
      expect(disposed).toBe(1);
      expect(observeDisposed).toBe(1);
    });
  });
  describe('normalizeMessages', function () {
    (0, _jasmineFix.it)('adds a key to the message', function () {
      var message = (0, _common.getMessage)(false);
      expect(typeof message.key).toBe('undefined');
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(typeof message.key).toBe('string');
    });
    (0, _jasmineFix.it)('adds a version to the message', function () {
      var message = (0, _common.getMessage)(false);
      expect(typeof message.version).toBe('undefined');
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(typeof message.version).toBe('number');
      expect(message.version).toBe(2);
    });
    (0, _jasmineFix.it)('adds a name to the message', function () {
      var message = (0, _common.getMessage)(false);
      expect(typeof message.linterName).toBe('undefined');
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(typeof message.linterName).toBe('string');
      expect(message.linterName).toBe('Some Linter');
    });
    (0, _jasmineFix.it)('converts arrays in location->position to ranges', function () {
      var message = (0, _common.getMessage)(false);
      message.location.position = [[0, 0], [0, 0]];
      expect(Array.isArray(message.location.position)).toBe(true);
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(Array.isArray(message.location.position)).toBe(false);
      expect(message.location.position.constructor.name).toBe('Range');
    });
    (0, _jasmineFix.it)('converts arrays in source->position to points', function () {
      var message = (0, _common.getMessage)(false);
      message.reference = { file: __dirname, position: [0, 0] };
      expect(Array.isArray(message.reference.position)).toBe(true);
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(Array.isArray(message.reference.position)).toBe(false);
      expect(message.reference.position.constructor.name).toBe('Point');
    });
    (0, _jasmineFix.it)('converts arrays in solution[index]->position to ranges', function () {
      var message = (0, _common.getMessage)(false);
      message.solutions = [{ position: [[0, 0], [0, 0]], apply: function apply() {} }];
      expect(Array.isArray(message.solutions[0].position)).toBe(true);
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(Array.isArray(message.solutions[0].position)).toBe(false);
      expect(message.solutions[0].position.constructor.name).toBe('Range');
    });
  });
  describe('normalizeMessagesLegacy', function () {
    (0, _jasmineFix.it)('adds a key to the message', function () {
      var message = (0, _common.getMessageLegacy)(false);
      expect(typeof message.key).toBe('undefined');
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(typeof message.key).toBe('string');
    });
    (0, _jasmineFix.it)('adds a version to the message', function () {
      var message = (0, _common.getMessageLegacy)(false);
      expect(typeof message.version).toBe('undefined');
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(typeof message.version).toBe('number');
      expect(message.version).toBe(1);
    });
    (0, _jasmineFix.it)('adds a linterName to the message', function () {
      var message = (0, _common.getMessageLegacy)(false);
      expect(typeof message.linterName).toBe('undefined');
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(typeof message.linterName).toBe('string');
      expect(message.linterName).toBe('Some Linter');
    });
    describe('adds a severity to the message', function () {
      (0, _jasmineFix.it)('adds info correctly', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'Info';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('info');
      });
      (0, _jasmineFix.it)('adds info and is not case sensitive', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'info';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('info');
      });
      (0, _jasmineFix.it)('adds warning correctly', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'Warning';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('warning');
      });
      (0, _jasmineFix.it)('adds warning and is not case sensitive', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'warning';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('warning');
      });
      (0, _jasmineFix.it)('adds info to traces', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'Trace';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('info');
      });
      (0, _jasmineFix.it)('adds error for anything else', function () {
        {
          var message = (0, _common.getMessageLegacy)(false);
          message.type = 'asdasd';
          expect(typeof message.severity).toBe('undefined');
          Helpers.normalizeMessagesLegacy('Some Linter', [message]);
          expect(typeof message.severity).toBe('string');
          expect(message.severity).toBe('error');
        }
        {
          var message = (0, _common.getMessageLegacy)(false);
          message.type = 'AsdSDasdasd';
          expect(typeof message.severity).toBe('undefined');
          Helpers.normalizeMessagesLegacy('Some Linter', [message]);
          expect(typeof message.severity).toBe('string');
          expect(message.severity).toBe('error');
        }
      });
    });
    (0, _jasmineFix.it)('converts arrays in range to Range', function () {
      var message = (0, _common.getMessageLegacy)(false);
      message.range = [[0, 0], [0, 0]];
      expect(Array.isArray(message.range)).toBe(true);
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(Array.isArray(message.range)).toBe(false);
      expect(message.range.constructor.name).toBe('Range');
    });
    (0, _jasmineFix.it)('converts arrays in fix->range to Range', function () {
      var message = (0, _common.getMessageLegacy)(false);
      message.fix = { range: [[0, 0], [0, 0]], newText: 'fair' };
      expect(Array.isArray(message.fix.range)).toBe(true);
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(Array.isArray(message.fix.range)).toBe(false);
      expect(message.fix.range.constructor.name).toBe('Range');
    });
    (0, _jasmineFix.it)('processes traces on messages', function () {
      var message = (0, _common.getMessageLegacy)(false);
      message.type = 'asdasd';
      var trace = (0, _common.getMessageLegacy)(false);
      trace.type = 'Trace';
      message.trace = [trace];
      expect(typeof trace.severity).toBe('undefined');
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(typeof trace.severity).toBe('string');
      expect(trace.severity).toBe('info');
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvaGVscGVycy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRTJCLE1BQU07OzBCQUNkLGFBQWE7OzBCQUNQLGdCQUFnQjs7SUFBN0IsT0FBTzs7c0JBQzJDLFVBQVU7O0FBRXhFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBVzs7QUFFN0IsVUFBUSxDQUFDLHFCQUFxQixFQUFFLFlBQVc7QUFDekMsYUFBUyxtQkFBbUIsQ0FBQyxDQUFNLEVBQUUsQ0FBTSxFQUFFLENBQU0sRUFBRTtBQUNuRCxhQUFPLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQzVDOztBQUVELHdCQUFHLDRDQUE0QyxFQUFFLFlBQVc7QUFDMUQsWUFBTSxDQUFDLG1CQUFtQixDQUFDO0FBQ3pCLGlCQUFTLEVBQUUsS0FBSztBQUNoQixxQkFBYSxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNyQyxDQUFDLENBQUE7QUFDRix3QkFBRyw2QkFBNkIsRUFBRSxZQUFXO0FBQzNDLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQztBQUN6QixpQkFBUyxFQUFFLElBQUk7QUFDZixxQkFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQztPQUM5QyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDMUQsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcseUJBQXlCLEVBQUUsWUFBVztBQUN2QyxZQUFNLENBQUMsbUJBQW1CLENBQUM7QUFDekIsaUJBQVMsRUFBRSxLQUFLO0FBQ2hCLHFCQUFhLEVBQUUsQ0FBQyxXQUFXLENB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R0FBRyxPQUFPLENBQUE7QUFDcEIsYUFBTyxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3ZCLFlBQU0sQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDL0MsYUFBTyxDQUFDLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekQsWUFBTSxDQUFDLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM1QyxZQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtLQUNwQyxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9oZWxwZXJzLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IGl0IH0gZnJvbSAnamFzbWluZS1maXgnXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4uL2xpYi9oZWxwZXJzJ1xuaW1wb3J0IHsgZ2V0Rml4dHVyZXNQYXRoLCBnZXRNZXNzYWdlLCBnZXRNZXNzYWdlTGVnYWN5IH0gZnJvbSAnLi9jb21tb24nXG5cbmRlc2NyaWJlKCdIZWxwZXJzJywgZnVuY3Rpb24oKSB7XG4gIC8vIE5PVEU6IERpZCAqbm90KiBhZGQgc3BlY3MgZm9yIG1lc3NhZ2VLZXkgYW5kIG1lc3NhZ2VLZXlMZWdhY3kgb24gcHVycG9zZVxuICBkZXNjcmliZSgnc2hvdWxkVHJpZ2dlckxpbnRlcicsIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHNob3VsZFRyaWdnZXJMaW50ZXIoYTogYW55LCBiOiBhbnksIGM6IGFueSkge1xuICAgICAgcmV0dXJuIEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcihhLCBiLCBjKVxuICAgIH1cblxuICAgIGl0KCd3b3JrcyBkb2VzIG5vdCB0cmlnZ2VyIG5vbi1mbHkgb25lcyBvbiBmbHknLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChzaG91bGRUcmlnZ2VyTGludGVyKHtcbiAgICAgICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuanMnXSxcbiAgICAgIH0sIHRydWUsIFsnc291cmNlLmpzJ10pKS50b0JlKGZhbHNlKVxuICAgIH0pXG4gICAgaXQoJ3RyaWdnZXJzIG9uIGZseSBvbmVzIG9uIGZseScsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KHNob3VsZFRyaWdnZXJMaW50ZXIoe1xuICAgICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmpzJywgJ3NvdXJjZS5jb2ZmZWUnXSxcbiAgICAgIH0sIHRydWUsIFsnc291cmNlLmpzJywgJ3NvdXJjZS5qcy5lbWViZGRlZCddKSkudG9CZSh0cnVlKVxuICAgIH0pXG4gICAgaXQoJ3RyaWdnZXJzIGFsbCBvbiBub24tZmx5JywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogZmFsc2UsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmpzJ10sXG4gICAgICB9LCBmYWxzZSwgWydzb3VyY2UuanMnXSkpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChzaG91bGRUcmlnZ2VyTGludGVyKHtcbiAgICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qcyddLFxuICAgICAgfSwgZmFsc2UsIFsnc291cmNlLmpzJ10pKS50b0JlKHRydWUpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgdHJpZ2dlciBpZiBncmFtbWFyU2NvcGVzIGRvZXMgbm90IG1hdGNoJywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuY29mZmVlJ10sXG4gICAgICB9LCB0cnVlLCBbJ3NvdXJjZS5qcyddKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChzaG91bGRUcmlnZ2VyTGludGVyKHtcbiAgICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5jb2ZmZWUnLCAnc291cmNlLmdvJ10sXG4gICAgICB9LCBmYWxzZSwgWydzb3VyY2UuanMnXSkpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogZmFsc2UsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmNvZmZlZScsICdzb3VyY2UucnVzdCddLFxuICAgICAgfSwgZmFsc2UsIFsnc291cmNlLmpzJywgJ3NvdXJjZS5oZWxsJ10pKS50b0JlKGZhbHNlKVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdpc1BhdGhJZ25vcmVkJywgZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gaXNQYXRoSWdub3JlZChhOiBhbnksIGI6IGFueSwgYzogYW55KSB7XG4gICAgICByZXR1cm4gSGVscGVycy5pc1BhdGhJZ25vcmVkKGEsIGIgfHwgJyoqLyoubWluLntqcyxjc3N9JywgYyB8fCBmYWxzZSlcbiAgICB9XG5cbiAgICBpdCgncmV0dXJucyBmYWxzZSBpZiBwYXRoIGRvZXMgbm90IG1hdGNoIGdsb2InLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLmpzJykpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnYS5jc3MnKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCcvYS5qcycpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJy9hLmNzcycpKS50b0JlKGZhbHNlKVxuICAgIH0pXG4gICAgaXQoJ3JldHVybnMgZmFsc2UgY29ycmVjdGx5IGZvciB3aW5kb3dzIHN0eWxlZCBwYXRocycsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ2EuanMnKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLmNzcycpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ1xcXFxhLmpzJykpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnXFxcXGEuY3NzJykpLnRvQmUoZmFsc2UpXG4gICAgfSlcbiAgICBpdCgncmV0dXJucyB0cnVlIGlmIHBhdGggbWF0Y2hlcyBnbG9iJywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnYS5taW4uanMnKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ2EubWluLmNzcycpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnL2EubWluLmpzJykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCcvYS5taW4uY3NzJykpLnRvQmUodHJ1ZSlcbiAgICB9KVxuICAgIGl0KCdyZXR1cm5zIHRydWUgY29ycmVjdGx5IGZvciB3aW5kb3dzIHN0eWxlZCBwYXRocycsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ2EubWluLmpzJykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLm1pbi5jc3MnKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ1xcXFxhLm1pbi5qcycpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnXFxcXGEubWluLmNzcycpKS50b0JlKHRydWUpXG4gICAgfSlcbiAgICBpdCgncmV0dXJucyB0cnVlIGlmIHRoZSBwYXRoIGlzIGlnbm9yZWQgYnkgVkNTJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKF9fZmlsZW5hbWUpXG4gICAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKGdldEZpeHR1cmVzUGF0aCgnaWdub3JlZC50eHQnKSwgbnVsbCwgdHJ1ZSkpLnRvQmUodHJ1ZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGl0KCdyZXR1cm5zIGZhbHNlIGlmIHRoZSBwYXRoIGlzIG5vdCBpZ25vcmVkIGJ5IFZDUycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihfX2ZpbGVuYW1lKVxuICAgICAgICBleHBlY3QoaXNQYXRoSWdub3JlZChnZXRGaXh0dXJlc1BhdGgoJ2ZpbGUudHh0JyksIG51bGwsIHRydWUpKS50b0JlKGZhbHNlKVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdzdWJzY3JpcHRpdmVPYnNlcnZlJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2FjdGl2YXRlcyBzeW5jaHJvbm91c2x5JywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2VcbiAgICAgIEhlbHBlcnMuc3Vic2NyaXB0aXZlT2JzZXJ2ZSh7XG4gICAgICAgIG9ic2VydmUoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgIGFjdGl2YXRlZCA9IHRydWVcbiAgICAgICAgICBleHBlY3QoZXZlbnROYW1lKS50b0JlKCdzb21lRXZlbnQnKVxuICAgICAgICAgIGV4cGVjdCh0eXBlb2YgY2FsbGJhY2spLnRvQmUoJ2Z1bmN0aW9uJylcbiAgICAgICAgfSxcbiAgICAgIH0sICdzb21lRXZlbnQnLCBmdW5jdGlvbigpIHsgfSlcbiAgICAgIGV4cGVjdChhY3RpdmF0ZWQpLnRvQmUodHJ1ZSlcbiAgICB9KVxuICAgIGl0KCdjbGVhcnMgbGFzdCBzdWJzY3JpcHRpb24gd2hlbiB2YWx1ZSBjaGFuZ2VzJywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgZGlzcG9zZWQgPSAwXG4gICAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2VcbiAgICAgIEhlbHBlcnMuc3Vic2NyaXB0aXZlT2JzZXJ2ZSh7XG4gICAgICAgIG9ic2VydmUoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgIGFjdGl2YXRlZCA9IHRydWVcbiAgICAgICAgICBleHBlY3QoZGlzcG9zZWQpLnRvQmUoMClcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKDApXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgIGV4cGVjdChkaXNwb3NlZCkudG9CZSgxKVxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICBleHBlY3QoZGlzcG9zZWQpLnRvQmUoMilcbiAgICAgICAgfSxcbiAgICAgIH0sICdzb21lRXZlbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGRpc3Bvc2VkKytcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICBleHBlY3QoYWN0aXZhdGVkKS50b0JlKHRydWUpXG4gICAgfSlcbiAgICBpdCgnY2xlYXJzIGJvdGggc3Vic2NyaXB0aW9ucyBhdCB0aGUgZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgZGlzcG9zZWQgPSAwXG4gICAgICBsZXQgb2JzZXJ2ZURpc3Bvc2VkID0gMFxuICAgICAgbGV0IGFjdGl2YXRlZCA9IGZhbHNlXG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBIZWxwZXJzLnN1YnNjcmlwdGl2ZU9ic2VydmUoe1xuICAgICAgICBvYnNlcnZlKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICBhY3RpdmF0ZWQgPSB0cnVlXG4gICAgICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKDApXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgIGV4cGVjdChkaXNwb3NlZCkudG9CZSgwKVxuICAgICAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG9ic2VydmVEaXNwb3NlZCsrXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0sICdzb21lRXZlbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGRpc3Bvc2VkKytcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICBleHBlY3QoYWN0aXZhdGVkKS50b0JlKHRydWUpXG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICBleHBlY3QoZGlzcG9zZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChvYnNlcnZlRGlzcG9zZWQpLnRvQmUoMSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnbm9ybWFsaXplTWVzc2FnZXMnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnYWRkcyBhIGtleSB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uua2V5KS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uua2V5KS50b0JlKCdzdHJpbmcnKVxuICAgIH0pXG4gICAgaXQoJ2FkZHMgYSB2ZXJzaW9uIHRvIHRoZSBtZXNzYWdlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZShmYWxzZSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS52ZXJzaW9uKS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UudmVyc2lvbikudG9CZSgnbnVtYmVyJylcbiAgICAgIGV4cGVjdChtZXNzYWdlLnZlcnNpb24pLnRvQmUoMilcbiAgICB9KVxuICAgIGl0KCdhZGRzIGEgbmFtZSB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UubGludGVyTmFtZSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXMoJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmxpbnRlck5hbWUpLnRvQmUoJ3N0cmluZycpXG4gICAgICBleHBlY3QobWVzc2FnZS5saW50ZXJOYW1lKS50b0JlKCdTb21lIExpbnRlcicpXG4gICAgfSlcbiAgICBpdCgnY29udmVydHMgYXJyYXlzIGluIGxvY2F0aW9uLT5wb3NpdGlvbiB0byByYW5nZXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlKGZhbHNlKVxuICAgICAgbWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiA9IFtbMCwgMF0sIFswLCAwXV1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pKS50b0JlKHRydWUpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzKCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24uY29uc3RydWN0b3IubmFtZSkudG9CZSgnUmFuZ2UnKVxuICAgIH0pXG4gICAgaXQoJ2NvbnZlcnRzIGFycmF5cyBpbiBzb3VyY2UtPnBvc2l0aW9uIHRvIHBvaW50cycsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBtZXNzYWdlLnJlZmVyZW5jZSA9IHsgZmlsZTogX19kaXJuYW1lLCBwb3NpdGlvbjogWzAsIDBdIH1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UucmVmZXJlbmNlLnBvc2l0aW9uKSkudG9CZSh0cnVlKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLnJlZmVyZW5jZS5wb3NpdGlvbikpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QobWVzc2FnZS5yZWZlcmVuY2UucG9zaXRpb24uY29uc3RydWN0b3IubmFtZSkudG9CZSgnUG9pbnQnKVxuICAgIH0pXG4gICAgaXQoJ2NvbnZlcnRzIGFycmF5cyBpbiBzb2x1dGlvbltpbmRleF0tPnBvc2l0aW9uIHRvIHJhbmdlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBtZXNzYWdlLnNvbHV0aW9ucyA9IFt7IHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dLCBhcHBseSgpIHsgfSB9XVxuICAgICAgZXhwZWN0KEFycmF5LmlzQXJyYXkobWVzc2FnZS5zb2x1dGlvbnNbMF0ucG9zaXRpb24pKS50b0JlKHRydWUpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzKCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2Uuc29sdXRpb25zWzBdLnBvc2l0aW9uKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChtZXNzYWdlLnNvbHV0aW9uc1swXS5wb3NpdGlvbi5jb25zdHJ1Y3Rvci5uYW1lKS50b0JlKCdSYW5nZScpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ25vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2FkZHMgYSBrZXkgdG8gdGhlIG1lc3NhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmtleSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmtleSkudG9CZSgnc3RyaW5nJylcbiAgICB9KVxuICAgIGl0KCdhZGRzIGEgdmVyc2lvbiB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UudmVyc2lvbikudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnZlcnNpb24pLnRvQmUoJ251bWJlcicpXG4gICAgICBleHBlY3QobWVzc2FnZS52ZXJzaW9uKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnYWRkcyBhIGxpbnRlck5hbWUgdG8gdGhlIG1lc3NhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmxpbnRlck5hbWUpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5saW50ZXJOYW1lKS50b0JlKCdzdHJpbmcnKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UubGludGVyTmFtZSkudG9CZSgnU29tZSBMaW50ZXInKVxuICAgIH0pXG4gICAgZGVzY3JpYmUoJ2FkZHMgYSBzZXZlcml0eSB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgaXQoJ2FkZHMgaW5mbyBjb3JyZWN0bHknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgIG1lc3NhZ2UudHlwZSA9ICdJbmZvJ1xuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdpbmZvJylcbiAgICAgIH0pXG4gICAgICBpdCgnYWRkcyBpbmZvIGFuZCBpcyBub3QgY2FzZSBzZW5zaXRpdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgIG1lc3NhZ2UudHlwZSA9ICdpbmZvJ1xuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdpbmZvJylcbiAgICAgIH0pXG4gICAgICBpdCgnYWRkcyB3YXJuaW5nIGNvcnJlY3RseScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgICAgbWVzc2FnZS50eXBlID0gJ1dhcm5pbmcnXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3dhcm5pbmcnKVxuICAgICAgfSlcbiAgICAgIGl0KCdhZGRzIHdhcm5pbmcgYW5kIGlzIG5vdCBjYXNlIHNlbnNpdGl2ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgICAgbWVzc2FnZS50eXBlID0gJ3dhcm5pbmcnXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3dhcm5pbmcnKVxuICAgICAgfSlcbiAgICAgIGl0KCdhZGRzIGluZm8gdG8gdHJhY2VzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgICBtZXNzYWdlLnR5cGUgPSAnVHJhY2UnXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ2luZm8nKVxuICAgICAgfSlcbiAgICAgIGl0KCdhZGRzIGVycm9yIGZvciBhbnl0aGluZyBlbHNlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgICAgICBtZXNzYWdlLnR5cGUgPSAnYXNkYXNkJ1xuICAgICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgICAgfVxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgICAgbWVzc2FnZS50eXBlID0gJ0FzZFNEYXNkYXNkJ1xuICAgICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICAgIGl0KCdjb252ZXJ0cyBhcnJheXMgaW4gcmFuZ2UgdG8gUmFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgbWVzc2FnZS5yYW5nZSA9IFtbMCwgMF0sIFswLCAwXV1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UucmFuZ2UpKS50b0JlKHRydWUpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UucmFuZ2UpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UucmFuZ2UuY29uc3RydWN0b3IubmFtZSkudG9CZSgnUmFuZ2UnKVxuICAgIH0pXG4gICAgaXQoJ2NvbnZlcnRzIGFycmF5cyBpbiBmaXgtPnJhbmdlIHRvIFJhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgIG1lc3NhZ2UuZml4ID0geyByYW5nZTogW1swLCAwXSwgWzAsIDBdXSwgbmV3VGV4dDogJ2ZhaXInIH1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UuZml4LnJhbmdlKSkudG9CZSh0cnVlKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLmZpeC5yYW5nZSkpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QobWVzc2FnZS5maXgucmFuZ2UuY29uc3RydWN0b3IubmFtZSkudG9CZSgnUmFuZ2UnKVxuICAgIH0pXG4gICAgaXQoJ3Byb2Nlc3NlcyB0cmFjZXMgb24gbWVzc2FnZXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgbWVzc2FnZS50eXBlID0gJ2FzZGFzZCdcbiAgICAgIGNvbnN0IHRyYWNlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgIHRyYWNlLnR5cGUgPSAnVHJhY2UnXG4gICAgICBtZXNzYWdlLnRyYWNlID0gW3RyYWNlXVxuICAgICAgZXhwZWN0KHR5cGVvZiB0cmFjZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiB0cmFjZS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgIGV4cGVjdCh0cmFjZS5zZXZlcml0eSkudG9CZSgnaW5mbycpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=