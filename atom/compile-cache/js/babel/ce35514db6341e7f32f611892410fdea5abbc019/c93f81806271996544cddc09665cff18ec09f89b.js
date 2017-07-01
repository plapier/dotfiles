var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jasmineFix = require('jasmine-fix');

var _libBusySignal = require('../lib/busy-signal');

var _libBusySignal2 = _interopRequireDefault(_libBusySignal);

var _helpers = require('./helpers');

var SignalRegistry = (function () {
  function SignalRegistry() {
    _classCallCheck(this, SignalRegistry);

    this.texts = [];
  }

  _createClass(SignalRegistry, [{
    key: 'clear',
    value: function clear() {
      this.texts = [];
    }
  }, {
    key: 'add',
    value: function add(text) {
      this.texts.push(text);
    }
  }], [{
    key: 'create',
    value: function create() {
      var registry = new SignalRegistry();
      spyOn(registry, 'add').andCallThrough();
      spyOn(registry, 'clear').andCallThrough();
      return registry;
    }
  }]);

  return SignalRegistry;
})();

describe('BusySignal', function () {
  var busySignal = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    yield atom.packages.loadPackage('linter-ui-default');
    busySignal = new _libBusySignal2['default']();
    busySignal.attach(SignalRegistry);
  }));
  afterEach(function () {
    busySignal.dispose();
  });

  it('tells the registry when linting is in progress without adding duplicates', function () {
    var linterA = (0, _helpers.getLinter)();
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
    busySignal.didBeginLinting(linterA, '/');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /']);
    busySignal.didFinishLinting(linterA, '/');
    busySignal.didFinishLinting(linterA, '/');
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
    busySignal.didBeginLinting(linterA, '/');
    busySignal.didBeginLinting(linterA, '/');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /']);
    busySignal.didFinishLinting(linterA, '/');
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
  });
  it('shows one line per file and one for all project scoped ones', function () {
    var linterA = (0, _helpers.getLinter)();
    var linterB = (0, _helpers.getLinter)();
    var linterC = (0, _helpers.getLinter)();
    var linterD = (0, _helpers.getLinter)();
    var linterE = (0, _helpers.getLinter)();
    busySignal.didBeginLinting(linterA, '/a');
    busySignal.didBeginLinting(linterA, '/aa');
    busySignal.didBeginLinting(linterB, '/b');
    busySignal.didBeginLinting(linterC, '/b');
    busySignal.didBeginLinting(linterD);
    busySignal.didBeginLinting(linterE);
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /a', 'some on /aa', 'some, some on /b', 'some, some']);
    busySignal.didFinishLinting(linterA);
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /a', 'some on /aa', 'some, some on /b', 'some, some']);
    busySignal.didFinishLinting(linterA, '/a');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /aa', 'some, some on /b', 'some, some']);
    busySignal.didFinishLinting(linterA, '/aa');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some, some on /b', 'some, some']);
    busySignal.didFinishLinting(linterB, '/b');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /b', 'some, some']);
    busySignal.didFinishLinting(linterC, '/b');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some, some']);
    busySignal.didFinishLinting(linterD, '/b');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some, some']);
    busySignal.didFinishLinting(linterD);
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some']);
    busySignal.didFinishLinting(linterE);
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
  });
  it('clears everything on dispose', function () {
    var linterA = (0, _helpers.getLinter)();
    busySignal.didBeginLinting(linterA, '/a');
    expect(busySignal.provider && busySignal.provider.texts).toEqual(['some on /a']);
    busySignal.dispose();
    expect(busySignal.provider && busySignal.provider.texts).toEqual([]);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvc3BlYy9idXN5LXNpbmdhbC1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OzBCQUUyQixhQUFhOzs2QkFDakIsb0JBQW9COzs7O3VCQUNqQixXQUFXOztJQUUvQixjQUFjO0FBRVAsV0FGUCxjQUFjLEdBRUo7MEJBRlYsY0FBYzs7QUFHaEIsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUE7R0FDaEI7O2VBSkcsY0FBYzs7V0FLYixpQkFBRztBQUNOLFVBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0tBQ2hCOzs7V0FDRSxhQUFDLElBQUksRUFBRTtBQUNSLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ3RCOzs7V0FDWSxrQkFBRztBQUNkLFVBQU0sUUFBUSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUE7QUFDckMsV0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtBQUN2QyxXQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFBO0FBQ3pDLGFBQU8sUUFBUSxDQUFBO0tBQ2hCOzs7U0FoQkcsY0FBYzs7O0FBbUJwQixRQUFRLENBQUMsWUFBWSxFQUFFLFlBQVc7QUFDaEMsTUFBSSxVQUFVLFlBQUEsQ0FBQTs7QUFFZCxnREFBVyxhQUFpQjtBQUMxQixVQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDcEQsY0FBVSxHQUFHLGdDQUFnQixDQUFBO0FBQzdCLGNBQVUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUE7R0FDbEMsRUFBQyxDQUFBO0FBQ0YsV0FBUyxDQUFDLFlBQVc7QUFDbkIsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQ3JCLENBQUMsQ0FBQTs7QUFFRixJ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QUFPLENBQUMsQ0FBQTtBQUNwQyxVQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQTtHQUNyRSxDQUFDLENBQUE7QUFDRixJQUFFLENBQUMsOEJBQThCLEVBQUUsWUFBVztBQUM1QyxRQUFNLE9BQU8sR0FBRyx5QkFBVyxDQUFBO0FBQzNCLGNBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3pDLFVBQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQTtBQUNoRixjQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDcEIsVUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7R0FDckUsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvc3BlYy9idXN5LXNpbmdhbC1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgYmVmb3JlRWFjaCB9IGZyb20gJ2phc21pbmUtZml4J1xuaW1wb3J0IEJ1c3lTaWduYWwgZnJvbSAnLi4vbGliL2J1c3ktc2lnbmFsJ1xuaW1wb3J0IHsgZ2V0TGludGVyIH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5jbGFzcyBTaWduYWxSZWdpc3RyeSB7XG4gIHRleHRzOiBBcnJheTxzdHJpbmc+O1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRleHRzID0gW11cbiAgfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLnRleHRzID0gW11cbiAgfVxuICBhZGQodGV4dCkge1xuICAgIHRoaXMudGV4dHMucHVzaCh0ZXh0KVxuICB9XG4gIHN0YXRpYyBjcmVhdGUoKSB7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBuZXcgU2lnbmFsUmVnaXN0cnkoKVxuICAgIHNweU9uKHJlZ2lzdHJ5LCAnYWRkJykuYW5kQ2FsbFRocm91Z2goKVxuICAgIHNweU9uKHJlZ2lzdHJ5LCAnY2xlYXInKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgcmV0dXJuIHJlZ2lzdHJ5XG4gIH1cbn1cblxuZGVzY3JpYmUoJ0J1c3lTaWduYWwnLCBmdW5jdGlvbigpIHtcbiAgbGV0IGJ1c3lTaWduYWxcblxuICBiZWZvcmVFYWNoKGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIGF3YWl0IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ2xpbnRlci11aS1kZWZhdWx0JylcbiAgICBidXN5U2lnbmFsID0gbmV3IEJ1c3lTaWduYWwoKVxuICAgIGJ1c3lTaWduYWwuYXR0YWNoKFNpZ25hbFJlZ2lzdHJ5KVxuICB9KVxuICBhZnRlckVhY2goZnVuY3Rpb24oKSB7XG4gICAgYnVzeVNpZ25hbC5kaXNwb3NlKClcbiAgfSlcblxuICBpdCgndGVsbHMgdGhlIHJlZ2lzdHJ5IHdoZW4gbGludGluZyBpcyBpbiBwcm9ncmVzcyB3aXRob3V0IGFkZGluZyBkdXBsaWNhdGVzJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgbGludGVyQSA9IGdldExpbnRlcigpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbXSlcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJBLCAnLycpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUgb24gLyddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJBLCAnLycpXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckEsICcvJylcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFtdKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckEsICcvJylcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJBLCAnLycpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUgb24gLyddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJBLCAnLycpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbXSlcbiAgfSlcbiAgaXQoJ3Nob3dzIG9uZSBsaW5lIHBlciBmaWxlIGFuZCBvbmUgZm9yIGFsbCBwcm9qZWN0IHNjb3BlZCBvbmVzJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgbGludGVyQSA9IGdldExpbnRlcigpXG4gICAgY29uc3QgbGludGVyQiA9IGdldExpbnRlcigpXG4gICAgY29uc3QgbGludGVyQyA9IGdldExpbnRlcigpXG4gICAgY29uc3QgbGludGVyRCA9IGdldExpbnRlcigpXG4gICAgY29uc3QgbGludGVyRSA9IGdldExpbnRlcigpXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyQSwgJy9hJylcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJBLCAnL2FhJylcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJCLCAnL2InKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckMsICcvYicpXG4gICAgYnVzeVNpZ25hbC5kaWRCZWdpbkxpbnRpbmcobGludGVyRClcbiAgICBidXN5U2lnbmFsLmRpZEJlZ2luTGludGluZyhsaW50ZXJFKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoWydzb21lIG9uIC9hJywgJ3NvbWUgb24gL2FhJywgJ3NvbWUsIHNvbWUgb24gL2InLCAnc29tZSwgc29tZSddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJBKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoWydzb21lIG9uIC9hJywgJ3NvbWUgb24gL2FhJywgJ3NvbWUsIHNvbWUgb24gL2InLCAnc29tZSwgc29tZSddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJBLCAnL2EnKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoWydzb21lIG9uIC9hYScsICdzb21lLCBzb21lIG9uIC9iJywgJ3NvbWUsIHNvbWUnXSlcbiAgICBidXN5U2lnbmFsLmRpZEZpbmlzaExpbnRpbmcobGludGVyQSwgJy9hYScpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUsIHNvbWUgb24gL2InLCAnc29tZSwgc29tZSddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJCLCAnL2InKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoWydzb21lIG9uIC9iJywgJ3NvbWUsIHNvbWUnXSlcbiAgICBidXN5U2lnbmFsLmRpZEZpbmlzaExpbnRpbmcobGludGVyQywgJy9iJylcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFsnc29tZSwgc29tZSddKVxuICAgIGJ1c3lTaWduYWwuZGlkRmluaXNoTGludGluZyhsaW50ZXJELCAnL2InKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoWydzb21lLCBzb21lJ10pXG4gICAgYnVzeVNpZ25hbC5kaWRGaW5pc2hMaW50aW5nKGxpbnRlckQpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUnXSlcbiAgICBidXN5U2lnbmFsLmRpZEZpbmlzaExpbnRpbmcobGludGVyRSlcbiAgICBleHBlY3QoYnVzeVNpZ25hbC5wcm92aWRlciAmJiBidXN5U2lnbmFsLnByb3ZpZGVyLnRleHRzKS50b0VxdWFsKFtdKVxuICB9KVxuICBpdCgnY2xlYXJzIGV2ZXJ5dGhpbmcgb24gZGlzcG9zZScsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGxpbnRlckEgPSBnZXRMaW50ZXIoKVxuICAgIGJ1c3lTaWduYWwuZGlkQmVnaW5MaW50aW5nKGxpbnRlckEsICcvYScpXG4gICAgZXhwZWN0KGJ1c3lTaWduYWwucHJvdmlkZXIgJiYgYnVzeVNpZ25hbC5wcm92aWRlci50ZXh0cykudG9FcXVhbChbJ3NvbWUgb24gL2EnXSlcbiAgICBidXN5U2lnbmFsLmRpc3Bvc2UoKVxuICAgIGV4cGVjdChidXN5U2lnbmFsLnByb3ZpZGVyICYmIGJ1c3lTaWduYWwucHJvdmlkZXIudGV4dHMpLnRvRXF1YWwoW10pXG4gIH0pXG59KVxuIl19