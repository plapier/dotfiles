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
    (0, _jasmineFix.it)('preserves linterName if provided', function () {
      var message = (0, _common.getMessage)(false);
      message.linterName = 'Some Linter 2';
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(typeof message.linterName).toBe('string');
      expect(message.linterName).toBe('Some Linter 2');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvaGVscGVycy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7b0JBRTJCLE1BQU07OzBCQUNkLGFBQWE7OzBCQUNQLGdCQUFnQjs7SUFBN0IsT0FBTzs7c0JBQzJDLFVBQVU7O0FBRXhFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsWUFBVzs7QUFFN0IsVUFBUSxDQUFDLHFCQUFxQixFQUFFLFlBQVc7QUFDekMsYUFBUyxtQkFBbUIsQ0FBQyxDQUFNLEVBQUUsQ0FBTSxFQUFFLENBQU0sRUFBRTtBQUNuRCxhQUFPLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQzVDOztBQUVELHdCQUFHLDRDQUE0QyxFQUFFLFlBQVc7QUFDMUQsWUFBTSxDQUFDLG1CQUFtQixDQUFDO0FBQ3pCLGlCQUFTLEVBQUUsS0FBSztBQUNoQixxQkFBYSxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNyQyxDQUFDLENBQUE7QUFDRix3QkFBRyw2QkFBNkIsRUFBRSxZQUFXO0FBQzNDLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQztBQUN6QixpQkFBUyxFQUFFLElBQUk7QUFDZixxQkFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQztPQUM5QyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDMUQsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcseUJBQXlCLEVBQUUsWUFBVztBQUN2QyxZQUFNLENBQUMsbUJBQW1CLENBQUM7QUFDekIsaUJBQVMsRUFBRSxLQUFLO0FBQ2hCLHFCQUFhLEVBQUUsQ0FBQyxXQUFXLENBQUM7T0FDN0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3BDLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQztBQUN6QixpQkFBUyxFQUFFLElBQUk7QUFDZixxQkFBYSxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLEVBQUUsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUNyQyxDQUFDLENBQUE7QUFDRix3QkFBRyxrREFBa0QsRUFBRSxZQUFXO0FBQ2hFLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQztBQUN6QixpQkFBUyxFQUFFLElBQUk7QUFDZixxQkFBYSxFQUFFLENBQUMsZUFBZSxDQUFDO09BQ2pDLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNwQyxZQUFNLENBQUMsbUJBQW1CLENBQUM7QUFDekIsaUJBQVMsRUFBRSxJQUFJO0FBQ2YscUJBQWEsRUFBRSxDQUFDLGVBQWUsRUFBRSxXQUFXLENBQUM7T0FDOUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3JDLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQztBQUN6QixpQkFBUyxFQUFFLEtBQUs7QUFDaEIscUJBQWEsRUFBRSxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUM7T0FDaEQsRUFBRSxLQUFLLEVBQUUsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNyRCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7QUFDRixVQUFRLENBQUMsZUFBZSxFQUFFLFlBQVc7QUFDbkMsYUFBUyxhQUFhLENBQUMsQ0FBTSxFQUFFLENBQU0sRUFBRSxDQUFNLEVBQUU7QUFDN0MsYUFBTyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksbUJBQW1CLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFBO0tBQ3RFOztBQUVELHdCQUFHLDJDQUEyQyxFQUFFLFlBQVc7QUFDekQsWUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN6QyxZQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzFDLFlBQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDMUMsWUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUM1QyxDQUFDLENBQUE7QUFDRix3QkFBRyxrREFBa0QsRUFBRSxZQUFXO0FBQ2hFLFlBQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDekMsWUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUMxQyxZQUFNLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzNDLFlBQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDN0MsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsbUNBQW1DLEVBQUUsWUFBVztBQUNqRCxZQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzVDLFlBQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDN0MsWUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM3QyxZQUFNLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQy9DLENBQUMsQ0FBQTtBQUNGLHdCQUFHLGlEQUFpRCxFQUFFLFlBQVc7QUFDL0QsWUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM1QyxZQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzdDLFlBQU0sQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDOUMsWUFBTSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUNoRCxDQUFDLENBQUE7QUFDRix3QkFBRyw0Q0FBNEMsb0JBQUUsYUFBaUI7QUFDaEUsVUFBSTtBQUNGLGNBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDckMsY0FBTSxDQUFDLGFBQWEsQ0FBQyw2QkFBZ0IsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQzdFLFNBQVM7QUFDUixZQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUE7T0FDbkM7S0FDRixFQUFDLENBQUE7QUFDRix3QkFBRyxpREFBaUQsb0JBQUUsYUFBaUI7QUFDckUsVUFBSTtBQUNGLGNBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDckMsY0FBTSxDQUFDLGFBQWEsQ0FBQyw2QkFBZ0IsVUFBVSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzNFLFNBQVM7QUFDUixZQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUE7T0FDbkM7S0FDRixFQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7QUFDRixVQUFRLENBQUMscUJBQXFCLEVBQUUsWUFBVztBQUN6Qyx3QkFBRyx5QkFBeUIsRUFBRSxZQUFXO0FBQ3ZDLFVBQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUNyQixhQUFPLENBQUMsbUJBQW1CLENBQUM7QUFDMUIsZUFBTyxFQUFBLGlCQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDM0IsbUJBQVMsR0FBRyxJQUFJLENBQUE7QUFDaEIsZ0JBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDbkMsZ0JBQU0sQ0FBQyxPQUFPLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUN6QztPQUNGLEVBQUUsV0FBVyxFQUFFLFlBQVcsRUFBRyxDQUFDLENBQUE7QUFDL0IsWUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUM3QixDQUFDLENBQUE7QUFDRix3QkFBRyw2Q0FBNkMsRUFBRSxZQUFXO0FBQzNELFVBQUksUUFBUSxHQUFHLENBQUMsQ0FBQTtBQUNoQixVQUFJLFNBQVMsR0FBRyxLQUFLLENBQUE7QUFDckIsYUFBTyxDQUFDLG1CQUFtQixDQUFDO0FBQzFCLGVBQU8sRUFBQSxpQkFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQzNCLG1CQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLGtCQUFRLEVBQUUsQ0FBQTtBQUNWLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLGtCQUFRLEVBQUUsQ0FBQTtBQUNWLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLGtCQUFRLEVBQUUsQ0FBQTtBQUNWLGdCQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ3pCO09BQ0YsRUFBRSxXQUFXLEVBQUUsWUFBVztBQUN6QixlQUFPLHFCQUFlLFlBQVc7QUFDL0Isa0JBQVEsRUFBRSxDQUFBO1NBQ1gsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0FBQ0YsWUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUM3QixDQUFDLENBQUE7QUFDRix3QkFBRyxzQ0FBc0MsRUFBRSxZQUFXO0FBQ3BELFVBQUksUUFBUSxHQUFHLENBQUMsQ0FBQTtBQUNoQixVQUFJLGVBQWUsR0FBRyxDQUFDLENBQUE7QUFDdkIsVUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztBQUMvQyxlQUFPLEVBQUEsaUJBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUMzQixtQkFBUyxHQUFHLElBQUksQ0FBQTtBQUNoQixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4QixrQkFBUSxFQUFFLENBQUE7QUFDVixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4QixpQkFBTyxxQkFBZSxZQUFXO0FBQy9CLDJCQUFlLEVBQUUsQ0FBQTtXQUNsQixDQUFDLENBQUE7U0FDSDtPQUNGLEVBQUUsV0FBVyxFQUFFLFlBQVc7QUFDekIsZUFBTyxxQkFBZSxZQUFXO0FBQy9CLGtCQUFRLEVBQUUsQ0FBQTtTQUNYLENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtBQUNGLFlBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDNUIsa0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN0QixZQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLFlBQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEMsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0FBQ0YsVUFBUSxDQUFDLG1CQUFtQixFQUFFLFlBQVc7QUFDdkMsd0JBQUcsMkJBQTJCLEVBQUUsWUFBVztBQUN6QyxVQUFNLE9BQU8sR0FBRyx3QkFBVyxLQUFLLENBQUMsQ0FBQTtBQUNqQyxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQzVDLGFBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ25ELFlBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDMUMsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsK0JBQStCLEVBQUUsWUFBVztBQUM3QyxVQUFNLE9BQU8sR0FBRyx3QkFBVyxLQUFLLENBQUMsQ0FBQTtBQUNqQyxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2hELGFBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ25ELFlBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDN0MsWUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEMsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsNEJBQTRCLEVBQUUsWUFBVztBQUMxQyxVQUFNLE9BQU8sR0FBRyx3QkFBVyxLQUFLLENBQUMsQ0FBQTtBQUNqQyxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ25ELGFBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ25ELFlBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDaEQsWUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7S0FDL0MsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsa0NBQWtDLEVBQUUsWUFBVztBQUNoRCxVQUFNLE9BQU8sR0FBRyx3QkFBVyxLQUFLLENBQUMsQ0FBQTtBQUNqQyxhQUFPLENBQUMsVUFBVSxHQUFHLGVBQWUsQ0FBQTtBQUNwQyxhQUFPLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ2hELFlBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0tBQ2pELENBQUMsQ0FBQTtBQUNGLHdCQUFHLGlEQUFpRCxFQUFFLFlBQVc7QUFDL0QsVUFBTSxPQUFPLEdBQUcsd0JBQVcsS0FBSyxDQUFDLENBQUE7QUFDakMsYUFBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVDLFlBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDM0QsYUFBTyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDbkQsWUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1RCxZQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNqRSxDQUFDLENBQUE7QUFDRix3QkFBRywrQ0FBK0MsRUFBRSxZQUFXO0FBQzdELFVBQU0sT0FBTyxHQUFHLHdCQUFXLEtBQUssQ0FBQyxDQUFBO0FBQ2pDLGFBQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ3pELFlBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDNUQsYUFBTyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDbkQsWUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM3RCxZQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNsRSxDQUFDLENBQUE7QUFDRix3QkFBRyx3REFBd0QsRUFBRSxZQUFXO0FBQ3RFLFVBQU0sT0FBTyxHQUFHLHdCQUFXLEtBQUssQ0FBQyxDQUFBO0FBQ2pDLGFBQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFBLGlCQUFHLEVBQUcsRUFBRSxDQUFDLENBQUE7QUFDakUsWUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMvRCxhQUFPLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxZQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ2hFLFlBQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3JFLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtBQUNGLFVBQVEsQ0FBQyx5QkFBeUIsRUFBRSxZQUFXO0FBQzdDLHdCQUFHLDJCQUEyQixFQUFFLFlBQVc7QUFDekMsVUFBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLFlBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDNUMsYUFBTyxDQUFDLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekQsWUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMxQyxDQUFDLENBQUE7QUFDRix3QkFBRywrQkFBK0IsRUFBRSxZQUFXO0FBQzdDLFVBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2hELGFBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFlBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDN0MsWUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDaEMsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsa0NBQWtDLEVBQUUsWUFBVztBQUNoRCxVQUFNLE9BQU8sR0FBRyw4QkFBaUIsS0FBSyxDQUFDLENBQUE7QUFDdkMsWUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNuRCxhQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ2hELFlBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0tBQy9DLENBQUMsQ0FBQTtBQUNGLFlBQVEsQ0FBQyxnQ0FBZ0MsRUFBRSxZQUFXO0FBQ3BELDBCQUFHLHFCQUFxQixFQUFFLFlBQVc7QUFDbkMsWUFBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLGVBQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFBO0FBQ3JCLGNBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDakQsZUFBTyxDQUFDLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekQsY0FBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QyxjQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUN0QyxDQUFDLENBQUE7QUFDRiwwQkFBRyxxQ0FBcUMsRUFBRSxZQUFXO0FBQ25ELFlBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxlQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtBQUNyQixjQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2pELGVBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELGNBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUMsY0FBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7T0FDdEMsQ0FBQyxDQUFBO0FBQ0YsMEJBQUcsd0JBQXdCLEVBQUUsWUFBVztBQUN0QyxZQUFNLE9BQU8sR0FBRyw4QkFBaUIsS0FBSyxDQUFDLENBQUE7QUFDdkMsZUFBTyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUE7QUFDeEIsY0FBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNqRCxlQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxjQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLGNBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO09BQ3pDLENBQUMsQ0FBQTtBQUNGLDBCQUFHLHdDQUF3QyxFQUFFLFlBQVc7QUFDdEQsWUFBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLGVBQU8sQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFBO0FBQ3hCLGNBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDakQsZUFBTyxDQUFDLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekQsY0FBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QyxjQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtPQUN6QyxDQUFDLENBQUE7QUFDRiwwQkFBRyxxQkFBcUIsRUFBRSxZQUFXO0FBQ25DLFlBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxlQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQTtBQUN0QixjQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2pELGVBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELGNBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUMsY0FBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7T0FDdEMsQ0FBQyxDQUFBO0FBQ0YsMEJBQUcsOEJBQThCLEVBQUUsWUFBVztBQUM1QztBQUNFLGNBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxpQkFBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUE7QUFDdkIsZ0JBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDakQsaUJBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELGdCQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLGdCQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUN2QztBQUNEO0FBQ0UsY0FBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLGlCQUFPLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQTtBQUM1QixnQkFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNqRCxpQkFBTyxDQUFDLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekQsZ0JBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUMsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1NBQ3ZDO09BQ0YsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsbUNBQW1DLEVBQUUsWUFBVztBQUNqRCxVQUFNLE9BQU8sR0FBRyw4QkFBaUIsS0FBSyxDQUFDLENBQUE7QUFDdkMsYUFBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDaEMsWUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQy9DLGFBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFlBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNoRCxZQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3JELENBQUMsQ0FBQTtBQUNGLHdCQUFHLHdDQUF3QyxFQUFFLFlBQVc7QUFDdEQsVUFBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLGFBQU8sQ0FBQyxHQUFHLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQTtBQUMxRCxZQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25ELGFBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFlBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDcEQsWUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDekQsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsOEJBQThCLEVBQUUsWUFBVztBQUM1QyxVQUFNLE9BQU8sR0FBRyw4QkFBaUIsS0FBSyxDQUFDLENBQUE7QUFDdkMsYUFBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUE7QUFDdkIsVUFBTSxLQUFLLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3JDLFdBQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO0FBQ3BCLGFBQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN2QixZQUFNLENBQUMsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQy9DLGFBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFlBQU0sQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDNUMsWUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDcEMsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvaGVscGVycy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBpdCB9IGZyb20gJ2phc21pbmUtZml4J1xuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuLi9saWIvaGVscGVycydcbmltcG9ydCB7IGdldEZpeHR1cmVzUGF0aCwgZ2V0TWVzc2FnZSwgZ2V0TWVzc2FnZUxlZ2FjeSB9IGZyb20gJy4vY29tbW9uJ1xuXG5kZXNjcmliZSgnSGVscGVycycsIGZ1bmN0aW9uKCkge1xuICAvLyBOT1RFOiBEaWQgKm5vdCogYWRkIHNwZWNzIGZvciBtZXNzYWdlS2V5IGFuZCBtZXNzYWdlS2V5TGVnYWN5IG9uIHB1cnBvc2VcbiAgZGVzY3JpYmUoJ3Nob3VsZFRyaWdnZXJMaW50ZXInLCBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBzaG91bGRUcmlnZ2VyTGludGVyKGE6IGFueSwgYjogYW55LCBjOiBhbnkpIHtcbiAgICAgIHJldHVybiBIZWxwZXJzLnNob3VsZFRyaWdnZXJMaW50ZXIoYSwgYiwgYylcbiAgICB9XG5cbiAgICBpdCgnd29ya3MgZG9lcyBub3QgdHJpZ2dlciBub24tZmx5IG9uZXMgb24gZmx5JywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogZmFsc2UsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmpzJ10sXG4gICAgICB9LCB0cnVlLCBbJ3NvdXJjZS5qcyddKSkudG9CZShmYWxzZSlcbiAgICB9KVxuICAgIGl0KCd0cmlnZ2VycyBvbiBmbHkgb25lcyBvbiBmbHknLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChzaG91bGRUcmlnZ2VyTGludGVyKHtcbiAgICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qcycsICdzb3VyY2UuY29mZmVlJ10sXG4gICAgICB9LCB0cnVlLCBbJ3NvdXJjZS5qcycsICdzb3VyY2UuanMuZW1lYmRkZWQnXSkpLnRvQmUodHJ1ZSlcbiAgICB9KVxuICAgIGl0KCd0cmlnZ2VycyBhbGwgb24gbm9uLWZseScsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KHNob3VsZFRyaWdnZXJMaW50ZXIoe1xuICAgICAgICBsaW50T25GbHk6IGZhbHNlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qcyddLFxuICAgICAgfSwgZmFsc2UsIFsnc291cmNlLmpzJ10pKS50b0JlKHRydWUpXG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuanMnXSxcbiAgICAgIH0sIGZhbHNlLCBbJ3NvdXJjZS5qcyddKSkudG9CZSh0cnVlKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IHRyaWdnZXIgaWYgZ3JhbW1hclNjb3BlcyBkb2VzIG5vdCBtYXRjaCcsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KHNob3VsZFRyaWdnZXJMaW50ZXIoe1xuICAgICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmNvZmZlZSddLFxuICAgICAgfSwgdHJ1ZSwgWydzb3VyY2UuanMnXSkpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuY29mZmVlJywgJ3NvdXJjZS5nbyddLFxuICAgICAgfSwgZmFsc2UsIFsnc291cmNlLmpzJ10pKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KHNob3VsZFRyaWdnZXJMaW50ZXIoe1xuICAgICAgICBsaW50T25GbHk6IGZhbHNlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5jb2ZmZWUnLCAnc291cmNlLnJ1c3QnXSxcbiAgICAgIH0sIGZhbHNlLCBbJ3NvdXJjZS5qcycsICdzb3VyY2UuaGVsbCddKSkudG9CZShmYWxzZSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnaXNQYXRoSWdub3JlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIGlzUGF0aElnbm9yZWQoYTogYW55LCBiOiBhbnksIGM6IGFueSkge1xuICAgICAgcmV0dXJuIEhlbHBlcnMuaXNQYXRoSWdub3JlZChhLCBiIHx8ICcqKi8qLm1pbi57anMsY3NzfScsIGMgfHwgZmFsc2UpXG4gICAgfVxuXG4gICAgaXQoJ3JldHVybnMgZmFsc2UgaWYgcGF0aCBkb2VzIG5vdCBtYXRjaCBnbG9iJywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnYS5qcycpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ2EuY3NzJykpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnL2EuanMnKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCcvYS5jc3MnKSkudG9CZShmYWxzZSlcbiAgICB9KVxuICAgIGl0KCdyZXR1cm5zIGZhbHNlIGNvcnJlY3RseSBmb3Igd2luZG93cyBzdHlsZWQgcGF0aHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLmpzJykpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnYS5jc3MnKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdcXFxcYS5qcycpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ1xcXFxhLmNzcycpKS50b0JlKGZhbHNlKVxuICAgIH0pXG4gICAgaXQoJ3JldHVybnMgdHJ1ZSBpZiBwYXRoIG1hdGNoZXMgZ2xvYicsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ2EubWluLmpzJykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLm1pbi5jc3MnKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJy9hLm1pbi5qcycpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnL2EubWluLmNzcycpKS50b0JlKHRydWUpXG4gICAgfSlcbiAgICBpdCgncmV0dXJucyB0cnVlIGNvcnJlY3RseSBmb3Igd2luZG93cyBzdHlsZWQgcGF0aHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLm1pbi5qcycpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnYS5taW4uY3NzJykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdcXFxcYS5taW4uanMnKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ1xcXFxhLm1pbi5jc3MnKSkudG9CZSh0cnVlKVxuICAgIH0pXG4gICAgaXQoJ3JldHVybnMgdHJ1ZSBpZiB0aGUgcGF0aCBpcyBpZ25vcmVkIGJ5IFZDUycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihfX2ZpbGVuYW1lKVxuICAgICAgICBleHBlY3QoaXNQYXRoSWdub3JlZChnZXRGaXh0dXJlc1BhdGgoJ2lnbm9yZWQudHh0JyksIG51bGwsIHRydWUpKS50b0JlKHRydWUpXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZSgpXG4gICAgICB9XG4gICAgfSlcbiAgICBpdCgncmV0dXJucyBmYWxzZSBpZiB0aGUgcGF0aCBpcyBub3QgaWdub3JlZCBieSBWQ1MnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oX19maWxlbmFtZSlcbiAgICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoZ2V0Rml4dHVyZXNQYXRoKCdmaWxlLnR4dCcpLCBudWxsLCB0cnVlKSkudG9CZShmYWxzZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnc3Vic2NyaXB0aXZlT2JzZXJ2ZScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdhY3RpdmF0ZXMgc3luY2hyb25vdXNseScsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGFjdGl2YXRlZCA9IGZhbHNlXG4gICAgICBIZWxwZXJzLnN1YnNjcmlwdGl2ZU9ic2VydmUoe1xuICAgICAgICBvYnNlcnZlKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICBhY3RpdmF0ZWQgPSB0cnVlXG4gICAgICAgICAgZXhwZWN0KGV2ZW50TmFtZSkudG9CZSgnc29tZUV2ZW50JylcbiAgICAgICAgICBleHBlY3QodHlwZW9mIGNhbGxiYWNrKS50b0JlKCdmdW5jdGlvbicpXG4gICAgICAgIH0sXG4gICAgICB9LCAnc29tZUV2ZW50JywgZnVuY3Rpb24oKSB7IH0pXG4gICAgICBleHBlY3QoYWN0aXZhdGVkKS50b0JlKHRydWUpXG4gICAgfSlcbiAgICBpdCgnY2xlYXJzIGxhc3Qgc3Vic2NyaXB0aW9uIHdoZW4gdmFsdWUgY2hhbmdlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGRpc3Bvc2VkID0gMFxuICAgICAgbGV0IGFjdGl2YXRlZCA9IGZhbHNlXG4gICAgICBIZWxwZXJzLnN1YnNjcmlwdGl2ZU9ic2VydmUoe1xuICAgICAgICBvYnNlcnZlKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICBhY3RpdmF0ZWQgPSB0cnVlXG4gICAgICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKDApXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgIGV4cGVjdChkaXNwb3NlZCkudG9CZSgwKVxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICBleHBlY3QoZGlzcG9zZWQpLnRvQmUoMSlcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKDIpXG4gICAgICAgIH0sXG4gICAgICB9LCAnc29tZUV2ZW50JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBkaXNwb3NlZCsrXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGFjdGl2YXRlZCkudG9CZSh0cnVlKVxuICAgIH0pXG4gICAgaXQoJ2NsZWFycyBib3RoIHN1YnNjcmlwdGlvbnMgYXQgdGhlIGVuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGRpc3Bvc2VkID0gMFxuICAgICAgbGV0IG9ic2VydmVEaXNwb3NlZCA9IDBcbiAgICAgIGxldCBhY3RpdmF0ZWQgPSBmYWxzZVxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gSGVscGVycy5zdWJzY3JpcHRpdmVPYnNlcnZlKHtcbiAgICAgICAgb2JzZXJ2ZShldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgYWN0aXZhdGVkID0gdHJ1ZVxuICAgICAgICAgIGV4cGVjdChkaXNwb3NlZCkudG9CZSgwKVxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICBleHBlY3QoZGlzcG9zZWQpLnRvQmUoMClcbiAgICAgICAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvYnNlcnZlRGlzcG9zZWQrK1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICB9LCAnc29tZUV2ZW50JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBkaXNwb3NlZCsrXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGFjdGl2YXRlZCkudG9CZSh0cnVlKVxuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKDEpXG4gICAgICBleHBlY3Qob2JzZXJ2ZURpc3Bvc2VkKS50b0JlKDEpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ25vcm1hbGl6ZU1lc3NhZ2VzJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2FkZHMgYSBrZXkgdG8gdGhlIG1lc3NhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlKGZhbHNlKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmtleSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXMoJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmtleSkudG9CZSgnc3RyaW5nJylcbiAgICB9KVxuICAgIGl0KCdhZGRzIGEgdmVyc2lvbiB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UudmVyc2lvbikudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXMoJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnZlcnNpb24pLnRvQmUoJ251bWJlcicpXG4gICAgICBleHBlY3QobWVzc2FnZS52ZXJzaW9uKS50b0JlKDIpXG4gICAgfSlcbiAgICBpdCgnYWRkcyBhIG5hbWUgdG8gdGhlIG1lc3NhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlKGZhbHNlKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmxpbnRlck5hbWUpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzKCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5saW50ZXJOYW1lKS50b0JlKCdzdHJpbmcnKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UubGludGVyTmFtZSkudG9CZSgnU29tZSBMaW50ZXInKVxuICAgIH0pXG4gICAgaXQoJ3ByZXNlcnZlcyBsaW50ZXJOYW1lIGlmIHByb3ZpZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZShmYWxzZSlcbiAgICAgIG1lc3NhZ2UubGludGVyTmFtZSA9ICdTb21lIExpbnRlciAyJ1xuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UubGludGVyTmFtZSkudG9CZSgnc3RyaW5nJylcbiAgICAgIGV4cGVjdChtZXNzYWdlLmxpbnRlck5hbWUpLnRvQmUoJ1NvbWUgTGludGVyIDInKVxuICAgIH0pXG4gICAgaXQoJ2NvbnZlcnRzIGFycmF5cyBpbiBsb2NhdGlvbi0+cG9zaXRpb24gdG8gcmFuZ2VzJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZShmYWxzZSlcbiAgICAgIG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24gPSBbWzAsIDBdLCBbMCwgMF1dXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uKSkudG9CZSh0cnVlKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uLmNvbnN0cnVjdG9yLm5hbWUpLnRvQmUoJ1JhbmdlJylcbiAgICB9KVxuICAgIGl0KCdjb252ZXJ0cyBhcnJheXMgaW4gc291cmNlLT5wb3NpdGlvbiB0byBwb2ludHMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlKGZhbHNlKVxuICAgICAgbWVzc2FnZS5yZWZlcmVuY2UgPSB7IGZpbGU6IF9fZGlybmFtZSwgcG9zaXRpb246IFswLCAwXSB9XG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLnJlZmVyZW5jZS5wb3NpdGlvbikpLnRvQmUodHJ1ZSlcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXMoJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KEFycmF5LmlzQXJyYXkobWVzc2FnZS5yZWZlcmVuY2UucG9zaXRpb24pKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UucmVmZXJlbmNlLnBvc2l0aW9uLmNvbnN0cnVjdG9yLm5hbWUpLnRvQmUoJ1BvaW50JylcbiAgICB9KVxuICAgIGl0KCdjb252ZXJ0cyBhcnJheXMgaW4gc29sdXRpb25baW5kZXhdLT5wb3NpdGlvbiB0byByYW5nZXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlKGZhbHNlKVxuICAgICAgbWVzc2FnZS5zb2x1dGlvbnMgPSBbeyBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSwgYXBwbHkoKSB7IH0gfV1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2Uuc29sdXRpb25zWzBdLnBvc2l0aW9uKSkudG9CZSh0cnVlKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLnNvbHV0aW9uc1swXS5wb3NpdGlvbikpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QobWVzc2FnZS5zb2x1dGlvbnNbMF0ucG9zaXRpb24uY29uc3RydWN0b3IubmFtZSkudG9CZSgnUmFuZ2UnKVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdub3JtYWxpemVNZXNzYWdlc0xlZ2FjeScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdhZGRzIGEga2V5IHRvIHRoZSBtZXNzYWdlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5rZXkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5rZXkpLnRvQmUoJ3N0cmluZycpXG4gICAgfSlcbiAgICBpdCgnYWRkcyBhIHZlcnNpb24gdG8gdGhlIG1lc3NhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnZlcnNpb24pLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS52ZXJzaW9uKS50b0JlKCdudW1iZXInKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UudmVyc2lvbikudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ2FkZHMgYSBsaW50ZXJOYW1lIHRvIHRoZSBtZXNzYWdlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5saW50ZXJOYW1lKS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UubGludGVyTmFtZSkudG9CZSgnc3RyaW5nJylcbiAgICAgIGV4cGVjdChtZXNzYWdlLmxpbnRlck5hbWUpLnRvQmUoJ1NvbWUgTGludGVyJylcbiAgICB9KVxuICAgIGRlc2NyaWJlKCdhZGRzIGEgc2V2ZXJpdHkgdG8gdGhlIG1lc3NhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGl0KCdhZGRzIGluZm8gY29ycmVjdGx5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgICBtZXNzYWdlLnR5cGUgPSAnSW5mbydcbiAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnNldmVyaXR5KS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICBleHBlY3QobWVzc2FnZS5zZXZlcml0eSkudG9CZSgnaW5mbycpXG4gICAgICB9KVxuICAgICAgaXQoJ2FkZHMgaW5mbyBhbmQgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgICBtZXNzYWdlLnR5cGUgPSAnaW5mbydcbiAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnNldmVyaXR5KS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICBleHBlY3QobWVzc2FnZS5zZXZlcml0eSkudG9CZSgnaW5mbycpXG4gICAgICB9KVxuICAgICAgaXQoJ2FkZHMgd2FybmluZyBjb3JyZWN0bHknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgIG1lc3NhZ2UudHlwZSA9ICdXYXJuaW5nJ1xuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCd3YXJuaW5nJylcbiAgICAgIH0pXG4gICAgICBpdCgnYWRkcyB3YXJuaW5nIGFuZCBpcyBub3QgY2FzZSBzZW5zaXRpdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgIG1lc3NhZ2UudHlwZSA9ICd3YXJuaW5nJ1xuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCd3YXJuaW5nJylcbiAgICAgIH0pXG4gICAgICBpdCgnYWRkcyBpbmZvIHRvIHRyYWNlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgICAgbWVzc2FnZS50eXBlID0gJ1RyYWNlJ1xuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdpbmZvJylcbiAgICAgIH0pXG4gICAgICBpdCgnYWRkcyBlcnJvciBmb3IgYW55dGhpbmcgZWxzZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgICAgbWVzc2FnZS50eXBlID0gJ2FzZGFzZCdcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICAgIH1cbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgICAgIG1lc3NhZ2UudHlwZSA9ICdBc2RTRGFzZGFzZCdcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdlcnJvcicpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgICBpdCgnY29udmVydHMgYXJyYXlzIGluIHJhbmdlIHRvIFJhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgIG1lc3NhZ2UucmFuZ2UgPSBbWzAsIDBdLCBbMCwgMF1dXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLnJhbmdlKSkudG9CZSh0cnVlKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLnJhbmdlKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChtZXNzYWdlLnJhbmdlLmNvbnN0cnVjdG9yLm5hbWUpLnRvQmUoJ1JhbmdlJylcbiAgICB9KVxuICAgIGl0KCdjb252ZXJ0cyBhcnJheXMgaW4gZml4LT5yYW5nZSB0byBSYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICBtZXNzYWdlLmZpeCA9IHsgcmFuZ2U6IFtbMCwgMF0sIFswLCAwXV0sIG5ld1RleHQ6ICdmYWlyJyB9XG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLmZpeC5yYW5nZSkpLnRvQmUodHJ1ZSlcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KEFycmF5LmlzQXJyYXkobWVzc2FnZS5maXgucmFuZ2UpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UuZml4LnJhbmdlLmNvbnN0cnVjdG9yLm5hbWUpLnRvQmUoJ1JhbmdlJylcbiAgICB9KVxuICAgIGl0KCdwcm9jZXNzZXMgdHJhY2VzIG9uIG1lc3NhZ2VzJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgIG1lc3NhZ2UudHlwZSA9ICdhc2Rhc2QnXG4gICAgICBjb25zdCB0cmFjZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICB0cmFjZS50eXBlID0gJ1RyYWNlJ1xuICAgICAgbWVzc2FnZS50cmFjZSA9IFt0cmFjZV1cbiAgICAgIGV4cGVjdCh0eXBlb2YgdHJhY2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgdHJhY2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICBleHBlY3QodHJhY2Uuc2V2ZXJpdHkpLnRvQmUoJ2luZm8nKVxuICAgIH0pXG4gIH0pXG59KVxuIl19