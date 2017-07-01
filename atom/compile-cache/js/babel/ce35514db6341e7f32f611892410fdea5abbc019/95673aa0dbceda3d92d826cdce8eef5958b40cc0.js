function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libMain = require('../lib/main');

var _libMain2 = _interopRequireDefault(_libMain);

var _common = require('./common');

describe('Atom Linter', function () {
  var atomLinter = undefined;

  beforeEach(function () {
    atomLinter = new _libMain2['default']();
  });
  afterEach(function () {
    atomLinter.dispose();
  });

  it('feeds old messages to newly added ui providers', function () {
    var patchCalled = 0;

    var message = (0, _common.getMessage)(true);
    var uiProvider = {
      name: 'test',
      didBeginLinting: function didBeginLinting() {},
      didFinishLinting: function didFinishLinting() {},
      render: function render(patch) {
        expect(patch.added).toEqual([message]);
        expect(patch.messages).toEqual([message]);
        expect(patch.removed).toEqual([]);
        patchCalled++;
      },
      dispose: function dispose() {}
    };
    // Force the MessageRegistry to initialze, note that this is handled under
    // normal usage!
    atomLinter.registryMessagesInit();
    atomLinter.registryMessages.messages.push(message);
    atomLinter.addUI(uiProvider);
    expect(patchCalled).toBe(1);
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvbWFpbi1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O3VCQUV1QixhQUFhOzs7O3NCQUNULFVBQVU7O0FBRXJDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsWUFBVztBQUNqQyxNQUFJLFVBQVUsWUFBQSxDQUFBOztBQUVkLFlBQVUsQ0FBQyxZQUFXO0FBQ3BCLGNBQVUsR0FBRywwQkFBZ0IsQ0FBQTtHQUM5QixDQUFDLENBQUE7QUFDRixXQUFTLENBQUMsWUFBVztBQUNuQixjQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDckIsQ0FBQyxDQUFBOztBQUVGLElBQUUsQ0FBQyxnREFBZ0QsRUFBRSxZQUFXO0FBQzlELFFBQUksV0FBVyxHQUFHLENBQUMsQ0FBQTs7QUFFbkIsUUFBTSxPQUFPLEdBQUcsd0JBQVcsSUFBSSxDQUFDLENBQUE7QUFDaEMsUUFBTSxVQUFVLEdBQUc7QUFDakIsVUFBSSxFQUFFLE1BQU07QUFDWixxQkFBZSxFQUFBLDJCQUFHLEVBQUU7QUFDcEIsc0JBQWdCLEVBQUEsNEJBQUcsRUFBRTtBQUNyQixZQUFNLEVBQUEsZ0JBQUMsS0FBSyxFQUFFO0FBQ1osY0FBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3RDLGNBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6QyxjQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNqQyxtQkFBVyxFQUFFLENBQUE7T0FDZDtBQUNELGFBQU8sRUFBQSxtQkFBRyxFQUFFO0tBQ2IsQ0FBQTs7O0FBR0QsY0FBVSxDQUFDLG9CQUFvQixFQUFFLENBQUE7QUFDakMsY0FBVSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDbEQsY0FBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUM1QixVQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQzVCLENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL21haW4tc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBBdG9tTGludGVyIGZyb20gJy4uL2xpYi9tYWluJ1xuaW1wb3J0IHsgZ2V0TWVzc2FnZSB9IGZyb20gJy4vY29tbW9uJ1xuXG5kZXNjcmliZSgnQXRvbSBMaW50ZXInLCBmdW5jdGlvbigpIHtcbiAgbGV0IGF0b21MaW50ZXJcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGF0b21MaW50ZXIgPSBuZXcgQXRvbUxpbnRlcigpXG4gIH0pXG4gIGFmdGVyRWFjaChmdW5jdGlvbigpIHtcbiAgICBhdG9tTGludGVyLmRpc3Bvc2UoKVxuICB9KVxuXG4gIGl0KCdmZWVkcyBvbGQgbWVzc2FnZXMgdG8gbmV3bHkgYWRkZWQgdWkgcHJvdmlkZXJzJywgZnVuY3Rpb24oKSB7XG4gICAgbGV0IHBhdGNoQ2FsbGVkID0gMFxuXG4gICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UodHJ1ZSlcbiAgICBjb25zdCB1aVByb3ZpZGVyID0ge1xuICAgICAgbmFtZTogJ3Rlc3QnLFxuICAgICAgZGlkQmVnaW5MaW50aW5nKCkge30sXG4gICAgICBkaWRGaW5pc2hMaW50aW5nKCkge30sXG4gICAgICByZW5kZXIocGF0Y2gpIHtcbiAgICAgICAgZXhwZWN0KHBhdGNoLmFkZGVkKS50b0VxdWFsKFttZXNzYWdlXSlcbiAgICAgICAgZXhwZWN0KHBhdGNoLm1lc3NhZ2VzKS50b0VxdWFsKFttZXNzYWdlXSlcbiAgICAgICAgZXhwZWN0KHBhdGNoLnJlbW92ZWQpLnRvRXF1YWwoW10pXG4gICAgICAgIHBhdGNoQ2FsbGVkKytcbiAgICAgIH0sXG4gICAgICBkaXNwb3NlKCkge30sXG4gICAgfVxuICAgIC8vIEZvcmNlIHRoZSBNZXNzYWdlUmVnaXN0cnkgdG8gaW5pdGlhbHplLCBub3RlIHRoYXQgdGhpcyBpcyBoYW5kbGVkIHVuZGVyXG4gICAgLy8gbm9ybWFsIHVzYWdlIVxuICAgIGF0b21MaW50ZXIucmVnaXN0cnlNZXNzYWdlc0luaXQoKVxuICAgIGF0b21MaW50ZXIucmVnaXN0cnlNZXNzYWdlcy5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpXG4gICAgYXRvbUxpbnRlci5hZGRVSSh1aVByb3ZpZGVyKVxuICAgIGV4cGVjdChwYXRjaENhbGxlZCkudG9CZSgxKVxuICB9KVxufSlcbiJdfQ==