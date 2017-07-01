function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _jasmineFix = require('jasmine-fix');

var _libEditorRegistry = require('../lib/editor-registry');

var _libEditorRegistry2 = _interopRequireDefault(_libEditorRegistry);

describe('EditorRegistry', function () {
  var editorRegistry = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    yield atom.workspace.open(__filename);
    editorRegistry = new _libEditorRegistry2['default']();
  }));
  afterEach(function () {
    atom.workspace.destroyActivePane();
    editorRegistry.dispose();
  });

  describe('::constructor', function () {
    (0, _jasmineFix.it)('is a saint', function () {
      expect(function () {
        return new _libEditorRegistry2['default']();
      }).not.toThrow();
    });
  });

  describe('::activate && ::createFromTextEditor', function () {
    (0, _jasmineFix.it)('adds current open editors to registry', function () {
      expect(editorRegistry.editorLinters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorLinters.size).toBe(1);
    });
    (0, _jasmineFix.it)('adds editors as they are opened', _asyncToGenerator(function* () {
      expect(editorRegistry.editorLinters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorLinters.size).toBe(1);
      yield atom.workspace.open();
      expect(editorRegistry.editorLinters.size).toBe(2);
    }));
    (0, _jasmineFix.it)('removes the editor as it is closed', _asyncToGenerator(function* () {
      expect(editorRegistry.editorLinters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorLinters.size).toBe(1);
      yield atom.workspace.open();
      expect(editorRegistry.editorLinters.size).toBe(2);
      atom.workspace.destroyActivePaneItem();
      expect(editorRegistry.editorLinters.size).toBe(1);
      atom.workspace.destroyActivePane();
      expect(editorRegistry.editorLinters.size).toBe(0);
    }));
    (0, _jasmineFix.it)('does not lint instantly if lintOnOpen is off', _asyncToGenerator(function* () {
      editorRegistry.activate();
      atom.config.set('linter.lintOnOpen', false);
      var lintCalls = 0;
      editorRegistry.observe(function (editorLinter) {
        editorLinter.onShouldLint(function () {
          return ++lintCalls;
        });
      });
      expect(lintCalls).toBe(0);
      yield atom.workspace.open();
      expect(lintCalls).toBe(0);
    }));
    (0, _jasmineFix.it)('invokes lint instantly if lintOnOpen is on', _asyncToGenerator(function* () {
      editorRegistry.activate();
      atom.config.set('linter.lintOnOpen', true);
      var lintCalls = 0;
      editorRegistry.observe(function (editorLinter) {
        editorLinter.onShouldLint(function () {
          return ++lintCalls;
        });
      });
      expect(lintCalls).toBe(0);
      yield atom.workspace.open();
      expect(lintCalls).toBe(1);
    }));
  });
  describe('::observe', function () {
    (0, _jasmineFix.it)('calls with current editors and updates as new are opened', _asyncToGenerator(function* () {
      var timesCalled = 0;
      editorRegistry.observe(function () {
        timesCalled++;
      });
      expect(timesCalled).toBe(0);
      editorRegistry.activate();
      expect(timesCalled).toBe(1);
      yield atom.workspace.open();
      expect(timesCalled).toBe(2);
    }));
  });
  describe('::dispose', function () {
    (0, _jasmineFix.it)('disposes all the editors on dispose', _asyncToGenerator(function* () {
      var timesDisposed = 0;
      editorRegistry.observe(function (editorLinter) {
        editorLinter.onDidDestroy(function () {
          timesDisposed++;
        });
      });
      expect(timesDisposed).toBe(0);
      editorRegistry.activate();
      expect(timesDisposed).toBe(0);
      atom.workspace.destroyActivePaneItem();
      expect(timesDisposed).toBe(1);
      yield atom.workspace.open();
      expect(timesDisposed).toBe(1);
      atom.workspace.destroyActivePaneItem();
      expect(timesDisposed).toBe(2);
      yield atom.workspace.open();
      yield atom.workspace.open();
      editorRegistry.dispose();
      expect(timesDisposed).toBe(4);
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvZWRpdG9yLXJlZ2lzdHJ5LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OzswQkFFK0IsYUFBYTs7aUNBQ2pCLHdCQUF3Qjs7OztBQUVuRCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBVztBQUNwQyxNQUFJLGNBQWMsWUFBQSxDQUFBOztBQUVsQixnREFBVyxhQUFpQjtBQUMxQixVQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ3JDLGtCQUFjLEdBQUcsb0NBQW9CLENBQUE7R0FDdEMsRUFBQyxDQUFBO0FBQ0YsV0FBUyxDQUFDLFlBQVc7QUFDbkIsUUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0FBQ2xDLGtCQUFjLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDekIsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxlQUFlLEVBQUUsWUFBVztBQUNuQyx3QkFBRyxZQUFZLEVBQUUsWUFBVztBQUMxQixZQUFNLENBQUMsWUFBVztBQUNoQixlQUFPLG9DQUFvQixDQUFBO09BQzVCLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDakIsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxzQ0FBc0MsRUFBRSxZQUFXO0FBQzFELHdCQUFHLHVDQUF1QyxFQUFFLFlBQVc7QUFDckQsWUFBTSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pELG9CQUFjLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDekIsWUFBTSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2xELENBQUMsQ0FBQTtBQUNGLHdCQUFHLGlDQUFpQyxvQkFBRSxh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Q0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM3QixZQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDM0IsWUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM3QixVQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUE7QUFDdEMsWUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM3QixZQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDM0IsWUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzNCLG9CQUFjLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDeEIsWUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUM5QixFQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9lZGl0b3ItcmVnaXN0cnktc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IGl0LCBiZWZvcmVFYWNoIH0gZnJvbSAnamFzbWluZS1maXgnXG5pbXBvcnQgRWRpdG9yUmVnaXN0cnkgZnJvbSAnLi4vbGliL2VkaXRvci1yZWdpc3RyeSdcblxuZGVzY3JpYmUoJ0VkaXRvclJlZ2lzdHJ5JywgZnVuY3Rpb24oKSB7XG4gIGxldCBlZGl0b3JSZWdpc3RyeVxuXG4gIGJlZm9yZUVhY2goYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihfX2ZpbGVuYW1lKVxuICAgIGVkaXRvclJlZ2lzdHJ5ID0gbmV3IEVkaXRvclJlZ2lzdHJ5KClcbiAgfSlcbiAgYWZ0ZXJFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICBlZGl0b3JSZWdpc3RyeS5kaXNwb3NlKClcbiAgfSlcblxuICBkZXNjcmliZSgnOjpjb25zdHJ1Y3RvcicsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdpcyBhIHNhaW50JywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3QoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBuZXcgRWRpdG9yUmVnaXN0cnkoKVxuICAgICAgfSkubm90LnRvVGhyb3coKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJzo6YWN0aXZhdGUgJiYgOjpjcmVhdGVGcm9tVGV4dEVkaXRvcicsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdhZGRzIGN1cnJlbnQgb3BlbiBlZGl0b3JzIHRvIHJlZ2lzdHJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDApXG4gICAgICBlZGl0b3JSZWdpc3RyeS5hY3RpdmF0ZSgpXG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnYWRkcyBlZGl0b3JzIGFzIHRoZXkgYXJlIG9wZW5lZCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KGVkaXRvclJlZ2lzdHJ5LmVkaXRvckxpbnRlcnMuc2l6ZSkudG9CZSgwKVxuICAgICAgZWRpdG9yUmVnaXN0cnkuYWN0aXZhdGUoKVxuICAgICAgZXhwZWN0KGVkaXRvclJlZ2lzdHJ5LmVkaXRvckxpbnRlcnMuc2l6ZSkudG9CZSgxKVxuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDIpXG4gICAgfSlcbiAgICBpdCgncmVtb3ZlcyB0aGUgZWRpdG9yIGFzIGl0IGlzIGNsb3NlZCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KGVkaXRvclJlZ2lzdHJ5LmVkaXRvckxpbnRlcnMuc2l6ZSkudG9CZSgwKVxuICAgICAgZWRpdG9yUmVnaXN0cnkuYWN0aXZhdGUoKVxuICAgICAgZXhwZWN0KGVkaXRvclJlZ2lzdHJ5LmVkaXRvckxpbnRlcnMuc2l6ZSkudG9CZSgxKVxuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICBleHBlY3QoZWRpdG9yUmVnaXN0cnkuZWRpdG9yTGludGVycy5zaXplKS50b0JlKDIpXG4gICAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZUl0ZW0oKVxuICAgICAgZXhwZWN0KGVkaXRvclJlZ2lzdHJ5LmVkaXRvckxpbnRlcnMuc2l6ZSkudG9CZSgxKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgICAgZXhwZWN0KGVkaXRvclJlZ2lzdHJ5LmVkaXRvckxpbnRlcnMuc2l6ZSkudG9CZSgwKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IGxpbnQgaW5zdGFudGx5IGlmIGxpbnRPbk9wZW4gaXMgb2ZmJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBlZGl0b3JSZWdpc3RyeS5hY3RpdmF0ZSgpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci5saW50T25PcGVuJywgZmFsc2UpXG4gICAgICBsZXQgbGludENhbGxzID0gMFxuICAgICAgZWRpdG9yUmVnaXN0cnkub2JzZXJ2ZShmdW5jdGlvbihlZGl0b3JMaW50ZXIpIHtcbiAgICAgICAgZWRpdG9yTGludGVyLm9uU2hvdWxkTGludCgoKSA9PiArK2xpbnRDYWxscylcbiAgICAgIH0pXG4gICAgICBleHBlY3QobGludENhbGxzKS50b0JlKDApXG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgIGV4cGVjdChsaW50Q2FsbHMpLnRvQmUoMClcbiAgICB9KVxuICAgIGl0KCdpbnZva2VzIGxpbnQgaW5zdGFudGx5IGlmIGxpbnRPbk9wZW4gaXMgb24nLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGVkaXRvclJlZ2lzdHJ5LmFjdGl2YXRlKClcbiAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmxpbnRPbk9wZW4nLCB0cnVlKVxuICAgICAgbGV0IGxpbnRDYWxscyA9IDBcbiAgICAgIGVkaXRvclJlZ2lzdHJ5Lm9ic2VydmUoZnVuY3Rpb24oZWRpdG9yTGludGVyKSB7XG4gICAgICAgIGVkaXRvckxpbnRlci5vblNob3VsZExpbnQoKCkgPT4gKytsaW50Q2FsbHMpXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGxpbnRDYWxscykudG9CZSgwKVxuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICBleHBlY3QobGludENhbGxzKS50b0JlKDEpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJzo6b2JzZXJ2ZScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdjYWxscyB3aXRoIGN1cnJlbnQgZWRpdG9ycyBhbmQgdXBkYXRlcyBhcyBuZXcgYXJlIG9wZW5lZCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzQ2FsbGVkID0gMFxuICAgICAgZWRpdG9yUmVnaXN0cnkub2JzZXJ2ZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNDYWxsZWQrK1xuICAgICAgfSlcbiAgICAgIGV4cGVjdCh0aW1lc0NhbGxlZCkudG9CZSgwKVxuICAgICAgZWRpdG9yUmVnaXN0cnkuYWN0aXZhdGUoKVxuICAgICAgZXhwZWN0KHRpbWVzQ2FsbGVkKS50b0JlKDEpXG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgIGV4cGVjdCh0aW1lc0NhbGxlZCkudG9CZSgyKVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCc6OmRpc3Bvc2UnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnZGlzcG9zZXMgYWxsIHRoZSBlZGl0b3JzIG9uIGRpc3Bvc2UnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc0Rpc3Bvc2VkID0gMFxuICAgICAgZWRpdG9yUmVnaXN0cnkub2JzZXJ2ZShmdW5jdGlvbihlZGl0b3JMaW50ZXIpIHtcbiAgICAgICAgZWRpdG9yTGludGVyLm9uRGlkRGVzdHJveShmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aW1lc0Rpc3Bvc2VkKytcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICBleHBlY3QodGltZXNEaXNwb3NlZCkudG9CZSgwKVxuICAgICAgZWRpdG9yUmVnaXN0cnkuYWN0aXZhdGUoKVxuICAgICAgZXhwZWN0KHRpbWVzRGlzcG9zZWQpLnRvQmUoMClcbiAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lSXRlbSgpXG4gICAgICBleHBlY3QodGltZXNEaXNwb3NlZCkudG9CZSgxKVxuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICBleHBlY3QodGltZXNEaXNwb3NlZCkudG9CZSgxKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKClcbiAgICAgIGV4cGVjdCh0aW1lc0Rpc3Bvc2VkKS50b0JlKDIpXG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oKVxuICAgICAgZWRpdG9yUmVnaXN0cnkuZGlzcG9zZSgpXG4gICAgICBleHBlY3QodGltZXNEaXNwb3NlZCkudG9CZSg0KVxuICAgIH0pXG4gIH0pXG59KVxuIl19