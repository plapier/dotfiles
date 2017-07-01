function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

'use babel';

describe('Hooks', function () {
  var directory = null;
  var workspaceElement = null;
  var succeedingCommandName = 'build:hook-test:succeeding';
  var failingCommandName = 'build:hook-test:failing';
  var dummyPackageName = 'atom-build-hooks-dummy-package';
  var dummyPackagePath = __dirname + '/fixture/' + dummyPackageName;

  _temp2['default'].track();

  beforeEach(function () {
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' }));
    atom.project.setPaths([directory]);

    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.notificationOnRefresh', true);

    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');

    runs(function () {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
    });

    waitsForPromise(function () {
      return Promise.resolve().then(function () {
        return atom.packages.activatePackage('build');
      }).then(function () {
        return atom.packages.activatePackage(dummyPackagePath);
      });
    });

    waitsForPromise(function () {
      return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
    });
  });

  afterEach(function () {
    try {
      _fsExtra2['default'].removeSync(directory);
    } catch (e) {
      console.warn('Failed to clean up: ', e);
    }
  });

  it('should call preBuild', function () {
    var pkg = undefined;

    runs(function () {
      pkg = atom.packages.getActivePackage(dummyPackageName).mainModule;
      spyOn(pkg.hooks, 'preBuild');

      atom.commands.dispatch(workspaceElement, succeedingCommandName);
    });

    waitsFor(function () {
      return workspaceElement.querySelector('.build .title');
    });

    runs(function () {
      expect(pkg.hooks.preBuild).toHaveBeenCalled();
    });
  });

  describe('postBuild', function () {
    it('should be called with `true` as an argument when build succeded', function () {
      var pkg = undefined;

      runs(function () {
        pkg = atom.packages.getActivePackage(dummyPackageName).mainModule;
        spyOn(pkg.hooks, 'postBuild');

        atom.commands.dispatch(workspaceElement, succeedingCommandName);
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(pkg.hooks.postBuild).toHaveBeenCalledWith(true);
      });
    });

    it('should be called with `false` as an argument when build failed', function () {
      var pkg = undefined;

      runs(function () {
        pkg = atom.packages.getActivePackage(dummyPackageName).mainModule;
        spyOn(pkg.hooks, 'postBuild');

        atom.commands.dispatch(workspaceElement, failingCommandName);
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        expect(pkg.hooks.postBuild).toHaveBeenCalledWith(false);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC1ob29rcy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O3VCQUVlLFVBQVU7Ozs7b0JBQ1IsTUFBTTs7OztvQ0FDQyx5QkFBeUI7Ozs7QUFKakQsV0FBVyxDQUFDOztBQU1aLFFBQVEsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUN0QixNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDNUIsTUFBTSxxQkFBcUIsR0FBRyw0QkFBNEIsQ0FBQztBQUMzRCxNQUFNLGtCQUFrQixHQUFHLHlCQUF5QixDQUFDO0FBQ3JELE1BQU0sZ0JBQWdCLEdBQUcsZ0NBQWdDLENBQUM7QUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLGdCQUFnQixDQUFDOztBQUVwRSxvQkFBSyxLQUFLLEVBQUUsQ0FBQzs7QUFFYixZQUFVLENBQUMsWUFBTTtBQUNmLGFBQVMsR0FBRyxxQkFBRyxZQUFZLENBQUMsa0JBQUssU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVFLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUUsU0FBUyxDQUFFLENBQUMsQ0FBQzs7QUFFckMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXJELFdBQU8sQ0FBQyxLQUFL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RUFBZ0UsRUFBRSxZQUFNO0FBQ3pFLFVBQUksR0FBRyxZQUFBLENBQUM7O0FBRVIsVUFBSSxDQUFDLFlBQU07QUFDVCxXQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUNsRSxhQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFOUIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztPQUM5RCxDQUFDLENBQUM7O0FBRUgsY0FBUSxDQUFDLFlBQU07QUFDYixlQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFDcEQsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDL0UsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDekQsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC1ob29rcy1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJztcbmltcG9ydCBzcGVjSGVscGVycyBmcm9tICdhdG9tLWJ1aWxkLXNwZWMtaGVscGVycyc7XG5cbmRlc2NyaWJlKCdIb29rcycsICgpID0+IHtcbiAgbGV0IGRpcmVjdG9yeSA9IG51bGw7XG4gIGxldCB3b3Jrc3BhY2VFbGVtZW50ID0gbnVsbDtcbiAgY29uc3Qgc3VjY2VlZGluZ0NvbW1hbmROYW1lID0gJ2J1aWxkOmhvb2stdGVzdDpzdWNjZWVkaW5nJztcbiAgY29uc3QgZmFpbGluZ0NvbW1hbmROYW1lID0gJ2J1aWxkOmhvb2stdGVzdDpmYWlsaW5nJztcbiAgY29uc3QgZHVtbXlQYWNrYWdlTmFtZSA9ICdhdG9tLWJ1aWxkLWhvb2tzLWR1bW15LXBhY2thZ2UnO1xuICBjb25zdCBkdW1teVBhY2thZ2VQYXRoID0gX19kaXJuYW1lICsgJy9maXh0dXJlLycgKyBkdW1teVBhY2thZ2VOYW1lO1xuXG4gIHRlbXAudHJhY2soKTtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBkaXJlY3RvcnkgPSBmcy5yZWFscGF0aFN5bmModGVtcC5ta2RpclN5bmMoeyBwcmVmaXg6ICdhdG9tLWJ1aWxkLXNwZWMtJyB9KSk7XG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFsgZGlyZWN0b3J5IF0pO1xuXG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5idWlsZE9uU2F2ZScsIGZhbHNlKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLnBhbmVsVmlzaWJpbGl0eScsICdUb2dnbGUnKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLnNhdmVPbkJ1aWxkJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQubm90aWZpY2F0aW9uT25SZWZyZXNoJywgdHJ1ZSk7XG5cbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ3NldFRpbWVvdXQnKTtcbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ2NsZWFyVGltZW91dCcpO1xuXG4gICAgcnVucygoKSA9PiB7XG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIC50aGVuKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdidWlsZCcpKVxuICAgICAgICAudGhlbigoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShkdW1teVBhY2thZ2VQYXRoKSk7XG4gICAgfSk7XG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gc3BlY0hlbHBlcnMucmVmcmVzaEF3YWl0VGFyZ2V0cygpKTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICB0cnkgeyBmcy5yZW1vdmVTeW5jKGRpcmVjdG9yeSk7IH0gY2F0Y2ggKGUpIHsgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gY2xlYW4gdXA6ICcsIGUpOyB9XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgY2FsbCBwcmVCdWlsZCcsICgpID0+IHtcbiAgICBsZXQgcGtnO1xuXG4gICAgcnVucygoKSA9PiB7XG4gICAgICBwa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoZHVtbXlQYWNrYWdlTmFtZSkubWFpbk1vZHVsZTtcbiAgICAgIHNweU9uKHBrZy5ob29rcywgJ3ByZUJ1aWxkJyk7XG5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgc3VjY2VlZGluZ0NvbW1hbmROYW1lKTtcbiAgICB9KTtcblxuICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKTtcbiAgICB9KTtcblxuICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgZXhwZWN0KHBrZy5ob29rcy5wcmVCdWlsZCkudG9IYXZlQmVlbkNhbGxlZCgpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgncG9zdEJ1aWxkJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgYmUgY2FsbGVkIHdpdGggYHRydWVgIGFzIGFuIGFyZ3VtZW50IHdoZW4gYnVpbGQgc3VjY2VkZWQnLCAoKSA9PiB7XG4gICAgICBsZXQgcGtnO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgcGtnID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKGR1bW15UGFja2FnZU5hbWUpLm1haW5Nb2R1bGU7XG4gICAgICAgIHNweU9uKHBrZy5ob29rcywgJ3Bvc3RCdWlsZCcpO1xuXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgc3VjY2VlZGluZ0NvbW1hbmROYW1lKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnc3VjY2VzcycpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QocGtnLmhvb2tzLnBvc3RCdWlsZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYmUgY2FsbGVkIHdpdGggYGZhbHNlYCBhcyBhbiBhcmd1bWVudCB3aGVuIGJ1aWxkIGZhaWxlZCcsICgpID0+IHtcbiAgICAgIGxldCBwa2c7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBwa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoZHVtbXlQYWNrYWdlTmFtZSkubWFpbk1vZHVsZTtcbiAgICAgICAgc3B5T24ocGtnLmhvb2tzLCAncG9zdEJ1aWxkJyk7XG5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCBmYWlsaW5nQ29tbWFuZE5hbWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdlcnJvcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QocGtnLmhvb2tzLnBvc3RCdWlsZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=