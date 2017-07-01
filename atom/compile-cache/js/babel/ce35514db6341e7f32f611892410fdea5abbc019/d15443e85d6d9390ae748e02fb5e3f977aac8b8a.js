function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _helpers = require('./helpers');

'use babel';

describe('BuildView', function () {
  var originalHomedirFn = _os2['default'].homedir;
  var directory = null;
  var workspaceElement = null;

  _temp2['default'].track();

  beforeEach(function () {
    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.stealFocus', true);
    atom.config.set('build.notificationOnRefresh', true);
    atom.config.set('editor.fontSize', 14);
    atom.notifications.clear();

    workspaceElement = atom.views.getView(atom.workspace);
    workspaceElement.setAttribute('style', 'width:9999px');
    jasmine.attachToDOM(workspaceElement);
    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');

    runs(function () {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
    });

    waitsForPromise(function () {
      return _atomBuildSpecHelpers2['default'].vouch(_temp2['default'].mkdir, { prefix: 'atom-build-spec-' }).then(function (dir) {
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].realpath, dir);
      }).then(function (dir) {
        directory = dir + '/';
        atom.project.setPaths([directory]);
        return _atomBuildSpecHelpers2['default'].vouch(_temp2['default'].mkdir, 'atom-build-spec-home');
      }).then(function (dir) {
        return _atomBuildSpecHelpers2['default'].vouch(_fsExtra2['default'].realpath, dir);
      }).then(function (dir) {
        _os2['default'].homedir = function () {
          return dir;
        };
        return atom.packages.activatePackage('build');
      });
    });
  });

  afterEach(function () {
    _os2['default'].homedir = originalHomedirFn;
    try {
      _fsExtra2['default'].removeSync(directory);
    } catch (e) {
      console.warn('Failed to clean up: ', e);
    }
  });

  describe('when output from build command should be viewed', function () {
    it('should output data even if no line break exists', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'node',
        args: ['-e', 'process.stdout.write(\'data without linebreak\');'],
        sh: false
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/data without linebreak/);
      });
    });

    it('should escape HTML chars so the output is not garbled or missing', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo "<tag>"'
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.build')).toExist();
        expect(workspaceElement.querySelector('.terminal').terminal.getContent()).toMatch(/<tag>/);
      });
    });
  });

  describe('when a build is triggered', function () {
    it('should include a timer of the build', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo "Building, this will take some time..." && ' + (0, _helpers.sleep)(30) + ' && echo "Done!"'
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      // Let build run for 1.5 second. This should set the timer at "at least" 1.5
      // which is expected below. If this waits longer than 2000 ms, we're in trouble.
      waits(1500);

      runs(function () {
        expect(workspaceElement.querySelector('.build-timer').textContent).toMatch(/1.\d/);

        // stop twice to abort the build
        atom.commands.dispatch(workspaceElement, 'build:stop');
        atom.commands.dispatch(workspaceElement, 'build:stop');
      });
    });
  });

  describe('when panel orientation is altered', function () {
    it('should show the panel at the bottom spot', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();
      atom.config.set('build.panelOrientation', 'Bottom');

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo this will fail && exit 1'
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var bottomPanels = atom.workspace.getBottomPanels();
        expect(bottomPanels.length).toEqual(1);
        expect(bottomPanels[0].item.constructor.name).toEqual('BuildView');
      });
    });

    it('should show the panel at the top spot', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();
      atom.config.set('build.panelOrientation', 'Top');

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo this will fail && exit 1'
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var panels = atom.workspace.getTopPanels();
        expect(panels.length).toEqual(1);
        expect(panels[0].item.constructor.name).toEqual('BuildView');
      });
    });
  });

  describe('when build fails', function () {
    it('should keep the build scrolled to bottom', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo a && echo b && echo c && echo d && echo e && echo f && echo g && echo h && exit 1'
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.terminal').terminal.ydisp).toBeGreaterThan(0);
      });
    });
  });

  describe('when hidePanelHeading is set', function () {
    beforeEach(function () {
      atom.config.set('build.hidePanelHeading', true);
    });

    afterEach(function () {
      atom.config.set('build.hidePanelHeading', false);
    });

    it('should not show the panel heading', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo hello && exit 1'
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.build .heading')).toBeHidden();
      });
    });

    it('should show the heading when hidden is disabled', function () {
      expect(workspaceElement.querySelector('.build')).not.toExist();

      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', JSON.stringify({
        cmd: 'echo hello && exit 1'
      }));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build');
      });

      runs(function () {
        expect(workspaceElement.querySelector('.build .heading')).toBeHidden();
        atom.config.set('build.hidePanelHeading', false);
        expect(workspaceElement.querySelector('.build .heading')).toBeVisible();
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC12aWV3LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7dUJBRWUsVUFBVTs7OztvQkFDUixNQUFNOzs7O29DQUNDLHlCQUF5Qjs7OztrQkFDbEMsSUFBSTs7Ozt1QkFDRyxXQUFXOztBQU5qQyxXQUFXLENBQUM7O0FBUVosUUFBUSxDQUFDLFdBQVcsRUFBRSxZQUFNO0FBQzFCLE1BQU0saUJBQWlCLEdBQUcsZ0JBQUcsT0FBTyxDQUFDO0FBQ3JDLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQztBQUNyQixNQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQzs7QUFFNUIsb0JBQUssS0FBSyxFQUFFLENBQUM7O0FBRWIsWUFBVSxDQUFDLFlBQU07QUFDZixRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMxQyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyRCxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN2QyxRQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUzQixvQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEQsb0JBQWdCLENBQUMsWUFBWSxDQUFD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LENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsaURBQWlELEVBQUUsWUFBTTtBQUMxRCxZQUFNLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUUvRCwyQkFBRyxhQUFhLENBQUMsU0FBUyxHQUFHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDOUQsV0FBRyxFQUFFLHNCQUFzQjtPQUM1QixDQUFDLENBQUMsQ0FBQzs7QUFFSixVQUFJLENBQUM7ZUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7T0FBQSxDQUFDLENBQUM7O0FBRXRFLGNBQVEsQ0FBQyxZQUFNO0FBQ2IsZUFBTyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDakQsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxZQUFNO0FBQ1QsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDdkUsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakQsY0FBTSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDekUsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9idWlsZC12aWV3LXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnO1xuaW1wb3J0IHNwZWNIZWxwZXJzIGZyb20gJ2F0b20tYnVpbGQtc3BlYy1oZWxwZXJzJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gJy4vaGVscGVycyc7XG5cbmRlc2NyaWJlKCdCdWlsZFZpZXcnLCAoKSA9PiB7XG4gIGNvbnN0IG9yaWdpbmFsSG9tZWRpckZuID0gb3MuaG9tZWRpcjtcbiAgbGV0IGRpcmVjdG9yeSA9IG51bGw7XG4gIGxldCB3b3Jrc3BhY2VFbGVtZW50ID0gbnVsbDtcblxuICB0ZW1wLnRyYWNrKCk7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5idWlsZE9uU2F2ZScsIGZhbHNlKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLnBhbmVsVmlzaWJpbGl0eScsICdUb2dnbGUnKTtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLnNhdmVPbkJ1aWxkJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuc3RlYWxGb2N1cycsIHRydWUpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQubm90aWZpY2F0aW9uT25SZWZyZXNoJywgdHJ1ZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCAxNCk7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmNsZWFyKCk7XG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICB3b3Jrc3BhY2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAnd2lkdGg6OTk5OXB4Jyk7XG4gICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KTtcbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ3NldFRpbWVvdXQnKTtcbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ2NsZWFyVGltZW91dCcpO1xuXG4gICAgcnVucygoKSA9PiB7XG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIHNwZWNIZWxwZXJzLnZvdWNoKHRlbXAubWtkaXIsIHsgcHJlZml4OiAnYXRvbS1idWlsZC1zcGVjLScgfSkudGhlbiggKGRpcikgPT4ge1xuICAgICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2goZnMucmVhbHBhdGgsIGRpcik7XG4gICAgICB9KS50aGVuKCAoZGlyKSA9PiB7XG4gICAgICAgIGRpcmVjdG9yeSA9IGRpciArICcvJztcbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFsgZGlyZWN0b3J5IF0pO1xuICAgICAgICByZXR1cm4gc3BlY0hlbHBlcnMudm91Y2godGVtcC5ta2RpciwgJ2F0b20tYnVpbGQtc3BlYy1ob21lJyk7XG4gICAgICB9KS50aGVuKCAoZGlyKSA9PiB7XG4gICAgICAgIHJldHVybiBzcGVjSGVscGVycy52b3VjaChmcy5yZWFscGF0aCwgZGlyKTtcbiAgICAgIH0pLnRoZW4oIChkaXIpID0+IHtcbiAgICAgICAgb3MuaG9tZWRpciA9ICgpID0+IGRpcjtcbiAgICAgICAgcmV0dXJuIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdidWlsZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgb3MuaG9tZWRpciA9IG9yaWdpbmFsSG9tZWRpckZuO1xuICAgIHRyeSB7IGZzLnJlbW92ZVN5bmMoZGlyZWN0b3J5KTsgfSBjYXRjaCAoZSkgeyBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBjbGVhbiB1cDogJywgZSk7IH1cbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gb3V0cHV0IGZyb20gYnVpbGQgY29tbWFuZCBzaG91bGQgYmUgdmlld2VkJywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgb3V0cHV0IGRhdGEgZXZlbiBpZiBubyBsaW5lIGJyZWFrIGV4aXN0cycsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy5hdG9tLWJ1aWxkLmpzb24nLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNtZDogJ25vZGUnLFxuICAgICAgICBhcmdzOiBbICctZScsICdwcm9jZXNzLnN0ZG91dC53cml0ZShcXCdkYXRhIHdpdGhvdXQgbGluZWJyZWFrXFwnKTsnIF0sXG4gICAgICAgIHNoOiBmYWxzZVxuICAgICAgfSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy50ZXJtaW5hbCcpLnRlcm1pbmFsLmdldENvbnRlbnQoKSkudG9NYXRjaCgvZGF0YSB3aXRob3V0IGxpbmVicmVhay8pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGVzY2FwZSBIVE1MIGNoYXJzIHNvIHRoZSBvdXRwdXQgaXMgbm90IGdhcmJsZWQgb3IgbWlzc2luZycsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCcpKS5ub3QudG9FeGlzdCgpO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjbWQ6ICdlY2hvIFwiPHRhZz5cIidcbiAgICAgIH0pKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnc3VjY2VzcycpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKSkudG9FeGlzdCgpO1xuICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcudGVybWluYWwnKS50ZXJtaW5hbC5nZXRDb250ZW50KCkpLnRvTWF0Y2goLzx0YWc+Lyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gYSBidWlsZCBpcyB0cmlnZ2VyZWQnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBpbmNsdWRlIGEgdGltZXIgb2YgdGhlIGJ1aWxkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJykpLm5vdC50b0V4aXN0KCk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy5hdG9tLWJ1aWxkLmpzb24nLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNtZDogYGVjaG8gXCJCdWlsZGluZywgdGhpcyB3aWxsIHRha2Ugc29tZSB0aW1lLi4uXCIgJiYgJHtzbGVlcCgzMCl9ICYmIGVjaG8gXCJEb25lIVwiYFxuICAgICAgfSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIC8vIExldCBidWlsZCBydW4gZm9yIDEuNSBzZWNvbmQuIFRoaXMgc2hvdWxkIHNldCB0aGUgdGltZXIgYXQgXCJhdCBsZWFzdFwiIDEuNVxuICAgICAgLy8gd2hpY2ggaXMgZXhwZWN0ZWQgYmVsb3cuIElmIHRoaXMgd2FpdHMgbG9uZ2VyIHRoYW4gMjAwMCBtcywgd2UncmUgaW4gdHJvdWJsZS5cbiAgICAgIHdhaXRzKDE1MDApO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkLXRpbWVyJykudGV4dENvbnRlbnQpLnRvTWF0Y2goLzEuXFxkLyk7XG5cbiAgICAgICAgLy8gc3RvcCB0d2ljZSB0byBhYm9ydCB0aGUgYnVpbGRcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6c3RvcCcpO1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDpzdG9wJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gcGFuZWwgb3JpZW50YXRpb24gaXMgYWx0ZXJlZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHNob3cgdGhlIHBhbmVsIGF0IHRoZSBib3R0b20gc3BvdCcsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCcpKS5ub3QudG9FeGlzdCgpO1xuICAgICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5wYW5lbE9yaWVudGF0aW9uJywgJ0JvdHRvbScpO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjbWQ6ICdlY2hvIHRoaXMgd2lsbCBmYWlsICYmIGV4aXQgMSdcbiAgICAgIH0pKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgYm90dG9tUGFuZWxzID0gYXRvbS53b3Jrc3BhY2UuZ2V0Qm90dG9tUGFuZWxzKCk7XG4gICAgICAgIGV4cGVjdChib3R0b21QYW5lbHMubGVuZ3RoKS50b0VxdWFsKDEpO1xuICAgICAgICBleHBlY3QoYm90dG9tUGFuZWxzWzBdLml0ZW0uY29uc3RydWN0b3IubmFtZSkudG9FcXVhbCgnQnVpbGRWaWV3Jyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgc2hvdyB0aGUgcGFuZWwgYXQgdGhlIHRvcCBzcG90JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJykpLm5vdC50b0V4aXN0KCk7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLnBhbmVsT3JpZW50YXRpb24nLCAnVG9wJyk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy5hdG9tLWJ1aWxkLmpzb24nLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNtZDogJ2VjaG8gdGhpcyB3aWxsIGZhaWwgJiYgZXhpdCAxJ1xuICAgICAgfSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdlcnJvcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBwYW5lbHMgPSBhdG9tLndvcmtzcGFjZS5nZXRUb3BQYW5lbHMoKTtcbiAgICAgICAgZXhwZWN0KHBhbmVscy5sZW5ndGgpLnRvRXF1YWwoMSk7XG4gICAgICAgIGV4cGVjdChwYW5lbHNbMF0uaXRlbS5jb25zdHJ1Y3Rvci5uYW1lKS50b0VxdWFsKCdCdWlsZFZpZXcnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiBidWlsZCBmYWlscycsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGtlZXAgdGhlIGJ1aWxkIHNjcm9sbGVkIHRvIGJvdHRvbScsICgpID0+IHtcbiAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCcpKS5ub3QudG9FeGlzdCgpO1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcuYXRvbS1idWlsZC5qc29uJywgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjbWQ6ICdlY2hvIGEgJiYgZWNobyBiICYmIGVjaG8gYyAmJiBlY2hvIGQgJiYgZWNobyBlICYmIGVjaG8gZiAmJiBlY2hvIGcgJiYgZWNobyBoICYmIGV4aXQgMSdcbiAgICAgIH0pKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnRlcm1pbmFsJykudGVybWluYWwueWRpc3ApLnRvQmVHcmVhdGVyVGhhbigwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiBoaWRlUGFuZWxIZWFkaW5nIGlzIHNldCcsICgpID0+IHtcbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuaGlkZVBhbmVsSGVhZGluZycsIHRydWUpO1xuICAgIH0pO1xuXG4gICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuaGlkZVBhbmVsSGVhZGluZycsIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbm90IHNob3cgdGhlIHBhbmVsIGhlYWRpbmcnLCAoKSA9PiB7XG4gICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKSkubm90LnRvRXhpc3QoKTtcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuanNvbicsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY21kOiAnZWNobyBoZWxsbyAmJiBleGl0IDEnXG4gICAgICB9KSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC5oZWFkaW5nJykpLnRvQmVIaWRkZW4oKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBzaG93IHRoZSBoZWFkaW5nIHdoZW4gaGlkZGVuIGlzIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJykpLm5vdC50b0V4aXN0KCk7XG5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy5hdG9tLWJ1aWxkLmpzb24nLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNtZDogJ2VjaG8gaGVsbG8gJiYgZXhpdCAxJ1xuICAgICAgfSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAuaGVhZGluZycpKS50b0JlSGlkZGVuKCk7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuaGlkZVBhbmVsSGVhZGluZycsIGZhbHNlKTtcbiAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC5oZWFkaW5nJykpLnRvQmVWaXNpYmxlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==