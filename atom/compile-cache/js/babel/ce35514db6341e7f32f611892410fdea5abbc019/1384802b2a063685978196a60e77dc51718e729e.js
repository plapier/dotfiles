function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _jasmineFix = require('jasmine-fix');

var _libEditorLinter = require('../lib/editor-linter');

var _libEditorLinter2 = _interopRequireDefault(_libEditorLinter);

'use babel';

describe('EditorLinter', function () {
  var textEditor = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    yield atom.workspace.open(__dirname + '/fixtures/file.txt');
    textEditor = atom.workspace.getActiveTextEditor();
  }));
  afterEach(function () {
    atom.workspace.destroyActivePaneItem();
  });

  (0, _jasmineFix.it)('cries when constructor argument is not a text editor', function () {
    expect(function () {
      return new _libEditorLinter2['default']();
    }).toThrow('EditorLinter expects a valid TextEditor');
    expect(function () {
      return new _libEditorLinter2['default'](1);
    }).toThrow('EditorLinter expects a valid TextEditor');
    expect(function () {
      return new _libEditorLinter2['default']({});
    }).toThrow('EditorLinter expects a valid TextEditor');
    expect(function () {
      return new _libEditorLinter2['default']('');
    }).toThrow('EditorLinter expects a valid TextEditor');
  });

  describe('onDidDestroy', function () {
    (0, _jasmineFix.it)('is called when text editor is destroyed', function () {
      var triggered = false;
      var editor = new _libEditorLinter2['default'](textEditor);
      editor.onDidDestroy(function () {
        triggered = true;
      });
      expect(triggered).toBe(false);
      textEditor.destroy();
      expect(triggered).toBe(true);
    });
  });

  describe('onShouldLint', function () {
    (0, _jasmineFix.it)('is triggered on save', _asyncToGenerator(function* () {
      var timesTriggered = 0;
      function waitForShouldLint() {
        // Register on the textEditor
        var editorLinter = new _libEditorLinter2['default'](textEditor);
        // Trigger a (async) save
        textEditor.save();
        return new Promise(function (resolve) {
          editorLinter.onShouldLint(function () {
            timesTriggered++;
            // Dispose of the current registration as it is finished
            editorLinter.dispose();
            resolve();
          });
        });
      }
      expect(timesTriggered).toBe(0);
      yield waitForShouldLint();
      yield waitForShouldLint();
      expect(timesTriggered).toBe(2);
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvZWRpdG9yLWxpbnRlci1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7MEJBRStCLGFBQWE7OytCQUNuQixzQkFBc0I7Ozs7QUFIL0MsV0FBVyxDQUFBOztBQUtYLFFBQVEsQ0FBQyxjQUFjLEVBQUUsWUFBVztBQUNsQyxNQUFJLFVBQVUsWUFBQSxDQUFBOztBQUVkLGdEQUFXLGFBQWlCO0FBQzFCLFVBQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUksU0FBUyx3QkFBcUIsQ0FBQTtBQUMzRCxjQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0dBQ2xELEVBQUMsQ0FBQTtBQUNGLFdBQVMsQ0FBQyxZQUFXO0FBQ25CLFFBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtHQUN2QyxDQUFDLENBQUE7O0FBRUYsc0JBQUcsc0RBQXNELEVBQUUsWUFBVztBQUNwRSxVQUFNLENBQUMsWUFBVztBQUNoQixhQUFPLGtDQUFrQixDQUFBO0tBQzFCLENBQUMsQ0FBQyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQTtBQUNyRCxVQUFNLENBQUMsWUFBVztBQUNoQixhQUFPLGlDQUFpQixDQUFDLENBQUMsQ0FBQTtLQUMzQixDQUFDLENBQUMsT0FBTyxDQUFDLHlDQUF5QyxDQUFDLENBQUE7QUFDckQsVUFBTSxDQUFDLFlBQVc7QUFDaEIsYUFBTyxpQ0FBaUIsRUFBRSxDQUFDLENBQUE7S0FDNUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO0FBQ3JELFVBQU0sQ0FBQyxZQUFXO0FBQ2hCLGFBQU8saUNBQWlCLEVBQUUsQ0FBQyxDQUFBO0tBQzVCLENBQUMsQ0FBQyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQTtHQUN0RCxDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLGNBQWMsRUFBRSxZQUFXO0FBQ2xDLHdCQUFHLHlDQUF5QyxFQUFFLFlBQVc7QUFDdkQsVUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLFVBQU0sTUFBTSxHQUFHLGlDQUFpQixVQUFVLENBQUMsQ0FBQTtBQUMzQyxZQUFNLENBQUMsWUFBWSxDQUFDLFlBQVc7QUFDN0IsaUJBQVMsR0FBRyxJQUFJLENBQUE7T0FDakIsQ0FBQyxDQUFBO0FBQ0YsWUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM3QixnQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3BCLFlBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDN0IsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxjQUFjLEVBQUUsWUFBVztBQUNsQyx3QkFBRyxzQkFBc0Isb0JBQUUsYUFBaUI7QUFDMUMsVUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFBO0FBQ3RCLGVBQVMsaUJBQWlCLEdBQUc7O0FBRTNCLFlBQU0sWUFBWSxHQUFHLGlDQUFpQixVQUFVLENBQUMsQ0FBQTs7QUFFakQsa0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNqQixlQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQzlCLHNCQUFZLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDOUIsMEJBQWMsRUFBRSxDQUFBOztBQUVoQix3QkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3RCLG1CQUFPLEVBQUUsQ0FBQTtXQUNWLENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTtPQUNIO0FBQ0QsWUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM5QixZQUFNLGlCQUFpQixFQUFFLENBQUE7QUFDekIsWUFBTSxpQkFBaUIsRUFBRSxDQUFBO0FBQ3pCLFlBQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDL0IsRUFBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvZWRpdG9yLWxpbnRlci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgaXQsIGJlZm9yZUVhY2ggfSBmcm9tICdqYXNtaW5lLWZpeCdcbmltcG9ydCBFZGl0b3JMaW50ZXIgZnJvbSAnLi4vbGliL2VkaXRvci1saW50ZXInXG5cbmRlc2NyaWJlKCdFZGl0b3JMaW50ZXInLCBmdW5jdGlvbigpIHtcbiAgbGV0IHRleHRFZGl0b3JcblxuICBiZWZvcmVFYWNoKGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oYCR7X19kaXJuYW1lfS9maXh0dXJlcy9maWxlLnR4dGApXG4gICAgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICB9KVxuICBhZnRlckVhY2goZnVuY3Rpb24oKSB7XG4gICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKClcbiAgfSlcblxuICBpdCgnY3JpZXMgd2hlbiBjb25zdHJ1Y3RvciBhcmd1bWVudCBpcyBub3QgYSB0ZXh0IGVkaXRvcicsIGZ1bmN0aW9uKCkge1xuICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRWRpdG9yTGludGVyKClcbiAgICB9KS50b1Rocm93KCdFZGl0b3JMaW50ZXIgZXhwZWN0cyBhIHZhbGlkIFRleHRFZGl0b3InKVxuICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRWRpdG9yTGludGVyKDEpXG4gICAgfSkudG9UaHJvdygnRWRpdG9yTGludGVyIGV4cGVjdHMgYSB2YWxpZCBUZXh0RWRpdG9yJylcbiAgICBleHBlY3QoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVkaXRvckxpbnRlcih7fSlcbiAgICB9KS50b1Rocm93KCdFZGl0b3JMaW50ZXIgZXhwZWN0cyBhIHZhbGlkIFRleHRFZGl0b3InKVxuICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRWRpdG9yTGludGVyKCcnKVxuICAgIH0pLnRvVGhyb3coJ0VkaXRvckxpbnRlciBleHBlY3RzIGEgdmFsaWQgVGV4dEVkaXRvcicpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ29uRGlkRGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdpcyBjYWxsZWQgd2hlbiB0ZXh0IGVkaXRvciBpcyBkZXN0cm95ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0cmlnZ2VyZWQgPSBmYWxzZVxuICAgICAgY29uc3QgZWRpdG9yID0gbmV3IEVkaXRvckxpbnRlcih0ZXh0RWRpdG9yKVxuICAgICAgZWRpdG9yLm9uRGlkRGVzdHJveShmdW5jdGlvbigpIHtcbiAgICAgICAgdHJpZ2dlcmVkID0gdHJ1ZVxuICAgICAgfSlcbiAgICAgIGV4cGVjdCh0cmlnZ2VyZWQpLnRvQmUoZmFsc2UpXG4gICAgICB0ZXh0RWRpdG9yLmRlc3Ryb3koKVxuICAgICAgZXhwZWN0KHRyaWdnZXJlZCkudG9CZSh0cnVlKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ29uU2hvdWxkTGludCcsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdpcyB0cmlnZ2VyZWQgb24gc2F2ZScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzVHJpZ2dlcmVkID0gMFxuICAgICAgZnVuY3Rpb24gd2FpdEZvclNob3VsZExpbnQoKSB7XG4gICAgICAgIC8vIFJlZ2lzdGVyIG9uIHRoZSB0ZXh0RWRpdG9yXG4gICAgICAgIGNvbnN0IGVkaXRvckxpbnRlciA9IG5ldyBFZGl0b3JMaW50ZXIodGV4dEVkaXRvcilcbiAgICAgICAgLy8gVHJpZ2dlciBhIChhc3luYykgc2F2ZVxuICAgICAgICB0ZXh0RWRpdG9yLnNhdmUoKVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICBlZGl0b3JMaW50ZXIub25TaG91bGRMaW50KCgpID0+IHtcbiAgICAgICAgICAgIHRpbWVzVHJpZ2dlcmVkKytcbiAgICAgICAgICAgIC8vIERpc3Bvc2Ugb2YgdGhlIGN1cnJlbnQgcmVnaXN0cmF0aW9uIGFzIGl0IGlzIGZpbmlzaGVkXG4gICAgICAgICAgICBlZGl0b3JMaW50ZXIuZGlzcG9zZSgpXG4gICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgZXhwZWN0KHRpbWVzVHJpZ2dlcmVkKS50b0JlKDApXG4gICAgICBhd2FpdCB3YWl0Rm9yU2hvdWxkTGludCgpXG4gICAgICBhd2FpdCB3YWl0Rm9yU2hvdWxkTGludCgpXG4gICAgICBleHBlY3QodGltZXNUcmlnZ2VyZWQpLnRvQmUoMilcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==