function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _atomBuildSpecHelpers2 = _interopRequireDefault(_atomBuildSpecHelpers);

var _helpers = require('./helpers');

'use babel';

describe('Linter Integration', function () {
  var directory = null;
  var workspaceElement = null;
  var dummyPackage = null;
  var join = require('path').join;
  var originalHomedirFn = _os2['default'].homedir;

  _temp2['default'].track();

  beforeEach(function () {
    var createdHomeDir = _temp2['default'].mkdirSync('atom-build-spec-home');
    _os2['default'].homedir = function () {
      return createdHomeDir;
    };
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' }));
    atom.project.setPaths([directory]);

    atom.config.set('build.buildOnSave', false);
    atom.config.set('build.panelVisibility', 'Toggle');
    atom.config.set('build.saveOnBuild', false);
    atom.config.set('build.scrollOnError', false);
    atom.config.set('build.notificationOnRefresh', true);
    atom.config.set('editor.fontSize', 14);

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
        return atom.packages.activatePackage(join(__dirname, 'fixture', 'atom-build-spec-linter'));
      }).then(function () {
        return dummyPackage = atom.packages.getActivePackage('atom-build-spec-linter').mainModule;
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

  describe('when error matching and linter is activated', function () {
    it('should push those errors to the linter', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.json'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.error-match-multiple.json')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.json'),
          range: [[2, 7], [2, 7]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: undefined
        }, {
          filePath: join(directory, '.atom-build.json'),
          range: [[1, 4], [1, 4]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: undefined
        }]);
      });
    });

    it('should parse `message` and include that to linter', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.json'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.error-match.message.json')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.json'),
          range: [[2, 7], [2, 7]],
          text: 'very bad things',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: undefined
        }]);
      });
    });

    it('should emit warnings just like errors', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-warning.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[4, 0], [4, 0]],
          text: 'mildly bad things',
          html: undefined,
          type: 'Warning',
          severity: 'warning',
          trace: undefined
        }]);
      });
    });

    it('should attach traces to matches where applicable', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-trace.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[5, 0], [5, 0]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: [{
            text: 'insert great explanation here',
            html: undefined,
            severity: 'info',
            type: 'Explanation',
            range: [[0, 0], [0, 0]],
            filePath: undefined
          }]
        }]);
      });
    });

    it('should clear linter errors when starting a new build', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.json'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.error-match.message.json')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.json'),
          range: [[2, 7], [2, 7]],
          text: 'very bad things',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: undefined
        }]);
        _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.json'), JSON.stringify({
          cmd: '' + (0, _helpers.sleep)(30)
        }));
      });

      waitsForPromise(function () {
        return _atomBuildSpecHelpers2['default'].refreshAwaitTargets();
      });

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && !workspaceElement.querySelector('.build .title').classList.contains('error') && !workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        expect(dummyPackage.getLinter().messages.length).toEqual(0);
      });
    });

    it('should leave text undefined if html is set', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-html.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[4, 0], [4, 0]],
          text: undefined,
          html: 'mildly <b>bad</b> things',
          type: 'Warning',
          severity: 'warning',
          trace: undefined
        }]);
      });
    });

    it('should leave text undefined if html is set in traces', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-trace-html.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[5, 0], [5, 0]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: [{
            text: undefined,
            html: 'insert <i>great</i> explanation here',
            severity: 'info',
            type: 'Explanation',
            range: [[0, 0], [0, 0]],
            filePath: undefined
          }]
        }]);
      });
    });

    it('should give priority to text over html when both are set', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-message-and-html.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('success');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[4, 0], [4, 0]],
          text: 'something happened in plain text',
          html: undefined,
          type: 'Warning',
          severity: 'warning',
          trace: undefined
        }]);
      });
    });

    it('should give priority to text over html when both are set in traces', function () {
      expect(dummyPackage.hasRegistered()).toEqual(true);
      _fsExtra2['default'].writeFileSync(join(directory, '.atom-build.js'), _fsExtra2['default'].readFileSync(join(__dirname, 'fixture', '.atom-build.match-function-trace-message-and-html.js')));

      runs(function () {
        return atom.commands.dispatch(workspaceElement, 'build:trigger');
      });

      waitsFor(function () {
        return workspaceElement.querySelector('.build .title') && workspaceElement.querySelector('.build .title').classList.contains('error');
      });

      runs(function () {
        var linter = dummyPackage.getLinter();
        expect(linter.messages).toEqual([{
          filePath: join(directory, '.atom-build.js'),
          range: [[5, 0], [5, 0]],
          text: 'Error from build',
          html: undefined,
          type: 'Error',
          severity: 'error',
          trace: [{
            text: 'insert plain text explanation here',
            html: undefined,
            severity: 'info',
            type: 'Explanation',
            range: [[0, 0], [0, 0]],
            filePath: undefined
          }]
        }]);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9saW50ZXItaW50ZXJncmF0aW9uLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7a0JBRWUsSUFBSTs7Ozt1QkFDSixVQUFVOzs7O29CQUNSLE1BQU07Ozs7b0NBQ0MseUJBQXlCOzs7O3VCQUMzQixXQUFXOztBQU5qQyxXQUFXLENBQUM7O0FBUVosUUFBUSxDQUFDLG9CQUFvQixFQUFFLFlBQU07QUFDbkMsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLE1BQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzVCLE1BQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2xDLE1BQU0saUJBQWlCLEdBQUcsZ0JBQUcsT0FBTyxDQUFDOztBQUVyQyxvQkFBSyxLQUFLLEVBQUUsQ0FBQzs7QUFFYixZQUFVLENBQUMsWUFBTTtBQUNmLFFBQU0sY0FBYyxHQUFHLGtCQUFLLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzlELG9CQUFHLE9BQU8sR0FBRzthQUFNLGNBQWM7S0FBQSxDQUFDO0FBQ2xDLGFBQVMsR0FBRyxxQkFBRyxZQUFZLENBQUMsa0JBQUssU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVFLFFBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUUsU0FBUyxDQUFFLENBQUMsQ0FBQzs7QUFFckMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDbkQsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUs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LENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUMvRSxDQUFDLENBQUM7O0FBRUgsVUFBSSxDQUFDLFlBQU07QUFDVCxZQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDeEMsY0FBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FDOUI7QUFDRSxrQkFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUM7QUFDM0MsZUFBSyxFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUU7QUFDekIsY0FBSSxFQUFFLGtCQUFrQjtBQUN4QixjQUFJLEVBQUUsU0FBUztBQUNmLGNBQUksRUFBRSxPQUFPO0FBQ2Isa0JBQVEsRUFBRSxPQUFPO0FBQ2pCLGVBQUssRUFBRSxDQUNMO0FBQ0UsZ0JBQUksRUFBRSxvQ0FBb0M7QUFDMUMsZ0JBQUksRUFBRSxTQUFTO0FBQ2Ysb0JBQVEsRUFBRSxNQUFNO0FBQ2hCLGdCQUFJLEVBQUUsYUFBYTtBQUNuQixpQkFBSyxFQUFFLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEIsb0JBQVEsRUFBRSxTQUFTO1dBQ3BCLENBQ0Y7U0FDRixDQUNGLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL2J1aWxkL3NwZWMvbGludGVyLWludGVyZ3JhdGlvbi1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHRlbXAgZnJvbSAndGVtcCc7XG5pbXBvcnQgc3BlY0hlbHBlcnMgZnJvbSAnYXRvbS1idWlsZC1zcGVjLWhlbHBlcnMnO1xuaW1wb3J0IHsgc2xlZXAgfSBmcm9tICcuL2hlbHBlcnMnO1xuXG5kZXNjcmliZSgnTGludGVyIEludGVncmF0aW9uJywgKCkgPT4ge1xuICBsZXQgZGlyZWN0b3J5ID0gbnVsbDtcbiAgbGV0IHdvcmtzcGFjZUVsZW1lbnQgPSBudWxsO1xuICBsZXQgZHVtbXlQYWNrYWdlID0gbnVsbDtcbiAgY29uc3Qgam9pbiA9IHJlcXVpcmUoJ3BhdGgnKS5qb2luO1xuICBjb25zdCBvcmlnaW5hbEhvbWVkaXJGbiA9IG9zLmhvbWVkaXI7XG5cbiAgdGVtcC50cmFjaygpO1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGNvbnN0IGNyZWF0ZWRIb21lRGlyID0gdGVtcC5ta2RpclN5bmMoJ2F0b20tYnVpbGQtc3BlYy1ob21lJyk7XG4gICAgb3MuaG9tZWRpciA9ICgpID0+IGNyZWF0ZWRIb21lRGlyO1xuICAgIGRpcmVjdG9yeSA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYyh7IHByZWZpeDogJ2F0b20tYnVpbGQtc3BlYy0nIH0pKTtcbiAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoWyBkaXJlY3RvcnkgXSk7XG5cbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLmJ1aWxkT25TYXZlJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JywgJ1RvZ2dsZScpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQuc2F2ZU9uQnVpbGQnLCBmYWxzZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdidWlsZC5zY3JvbGxPbkVycm9yJywgZmFsc2UpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQubm90aWZpY2F0aW9uT25SZWZyZXNoJywgdHJ1ZSk7XG4gICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCAxNCk7XG5cbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ3NldFRpbWVvdXQnKTtcbiAgICBqYXNtaW5lLnVuc3B5KHdpbmRvdywgJ2NsZWFyVGltZW91dCcpO1xuXG4gICAgcnVucygoKSA9PiB7XG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudCk7XG4gICAgfSk7XG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIC50aGVuKCgpID0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdidWlsZCcpKVxuICAgICAgICAudGhlbigoKSA9PiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmUnLCAnYXRvbS1idWlsZC1zcGVjLWxpbnRlcicpKSlcbiAgICAgICAgLnRoZW4oKCkgPT4gKGR1bW15UGFja2FnZSA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnYXRvbS1idWlsZC1zcGVjLWxpbnRlcicpLm1haW5Nb2R1bGUpKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICBvcy5ob21lZGlyID0gb3JpZ2luYWxIb21lZGlyRm47XG4gICAgdHJ5IHsgZnMucmVtb3ZlU3luYyhkaXJlY3RvcnkpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUud2FybignRmFpbGVkIHRvIGNsZWFuIHVwOiAnLCBlKTsgfVxuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiBlcnJvciBtYXRjaGluZyBhbmQgbGludGVyIGlzIGFjdGl2YXRlZCcsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIHB1c2ggdGhvc2UgZXJyb3JzIHRvIHRoZSBsaW50ZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZHVtbXlQYWNrYWdlLmhhc1JlZ2lzdGVyZWQoKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qc29uJyksIGZzLnJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmUnLCAnLmF0b20tYnVpbGQuZXJyb3ItbWF0Y2gtbXVsdGlwbGUuanNvbicpKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IGR1bW15UGFja2FnZS5nZXRMaW50ZXIoKTtcbiAgICAgICAgZXhwZWN0KGxpbnRlci5tZXNzYWdlcykudG9FcXVhbChbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanNvbicpLFxuICAgICAgICAgICAgcmFuZ2U6IFsgWzIsIDddLCBbMiwgN10gXSxcbiAgICAgICAgICAgIHRleHQ6ICdFcnJvciBmcm9tIGJ1aWxkJyxcbiAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRyYWNlOiB1bmRlZmluZWRcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZpbGVQYXRoOiBqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzb24nKSxcbiAgICAgICAgICAgIHJhbmdlOiBbIFsxLCA0XSwgWzEsIDRdIF0sXG4gICAgICAgICAgICB0ZXh0OiAnRXJyb3IgZnJvbSBidWlsZCcsXG4gICAgICAgICAgICBodG1sOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICAgICAgICB0cmFjZTogdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBwYXJzZSBgbWVzc2FnZWAgYW5kIGluY2x1ZGUgdGhhdCB0byBsaW50ZXInLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZHVtbXlQYWNrYWdlLmhhc1JlZ2lzdGVyZWQoKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qc29uJyksIGZzLnJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmUnLCAnLmF0b20tYnVpbGQuZXJyb3ItbWF0Y2gubWVzc2FnZS5qc29uJykpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnZXJyb3InKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gZHVtbXlQYWNrYWdlLmdldExpbnRlcigpO1xuICAgICAgICBleHBlY3QobGludGVyLm1lc3NhZ2VzKS50b0VxdWFsKFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlUGF0aDogam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qc29uJyksXG4gICAgICAgICAgICByYW5nZTogWyBbMiwgN10sIFsyLCA3XSBdLFxuICAgICAgICAgICAgdGV4dDogJ3ZlcnkgYmFkIHRoaW5ncycsXG4gICAgICAgICAgICBodG1sOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICAgICAgICB0cmFjZTogdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBlbWl0IHdhcm5pbmdzIGp1c3QgbGlrZSBlcnJvcnMnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoZHVtbXlQYWNrYWdlLmhhc1JlZ2lzdGVyZWQoKSkudG9FcXVhbCh0cnVlKTtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qcycpLCBmcy5yZWFkRmlsZVN5bmMoam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlJywgJy5hdG9tLWJ1aWxkLm1hdGNoLWZ1bmN0aW9uLXdhcm5pbmcuanMnKSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdWNjZXNzJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IGR1bW15UGFja2FnZS5nZXRMaW50ZXIoKTtcbiAgICAgICAgZXhwZWN0KGxpbnRlci5tZXNzYWdlcykudG9FcXVhbChbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSxcbiAgICAgICAgICAgIHJhbmdlOiBbIFs0LCAwXSwgWzQsIDBdIF0sXG4gICAgICAgICAgICB0ZXh0OiAnbWlsZGx5IGJhZCB0aGluZ3MnLFxuICAgICAgICAgICAgaHRtbDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHlwZTogJ1dhcm5pbmcnLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICd3YXJuaW5nJyxcbiAgICAgICAgICAgIHRyYWNlOiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGF0dGFjaCB0cmFjZXMgdG8gbWF0Y2hlcyB3aGVyZSBhcHBsaWNhYmxlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGR1bW15UGFja2FnZS5oYXNSZWdpc3RlcmVkKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSwgZnMucmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICcuYXRvbS1idWlsZC5tYXRjaC1mdW5jdGlvbi10cmFjZS5qcycpKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IGR1bW15UGFja2FnZS5nZXRMaW50ZXIoKTtcbiAgICAgICAgZXhwZWN0KGxpbnRlci5tZXNzYWdlcykudG9FcXVhbChbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSxcbiAgICAgICAgICAgIHJhbmdlOiBbIFs1LCAwXSwgWzUsIDBdIF0sXG4gICAgICAgICAgICB0ZXh0OiAnRXJyb3IgZnJvbSBidWlsZCcsXG4gICAgICAgICAgICBodG1sOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICAgICAgICB0cmFjZTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ2luc2VydCBncmVhdCBleHBsYW5hdGlvbiBoZXJlJyxcbiAgICAgICAgICAgICAgICBodG1sOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnRXhwbGFuYXRpb24nLFxuICAgICAgICAgICAgICAgIHJhbmdlOiBbIFswLCAwXSwgWzAsIDBdXSxcbiAgICAgICAgICAgICAgICBmaWxlUGF0aDogdW5kZWZpbmVkXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGNsZWFyIGxpbnRlciBlcnJvcnMgd2hlbiBzdGFydGluZyBhIG5ldyBidWlsZCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChkdW1teVBhY2thZ2UuaGFzUmVnaXN0ZXJlZCgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzb24nKSwgZnMucmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICcuYXRvbS1idWlsZC5lcnJvci1tYXRjaC5tZXNzYWdlLmpzb24nKSkpO1xuXG4gICAgICBydW5zKCgpID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2god29ya3NwYWNlRWxlbWVudCwgJ2J1aWxkOnRyaWdnZXInKSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpICYmXG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdlcnJvcicpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBsaW50ZXIgPSBkdW1teVBhY2thZ2UuZ2V0TGludGVyKCk7XG4gICAgICAgIGV4cGVjdChsaW50ZXIubWVzc2FnZXMpLnRvRXF1YWwoW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZpbGVQYXRoOiBqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzb24nKSxcbiAgICAgICAgICAgIHJhbmdlOiBbIFsyLCA3XSwgWzIsIDddIF0sXG4gICAgICAgICAgICB0ZXh0OiAndmVyeSBiYWQgdGhpbmdzJyxcbiAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIHRyYWNlOiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanNvbicpLCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgY21kOiBgJHtzbGVlcCgzMCl9YFxuICAgICAgICB9KSk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHNwZWNIZWxwZXJzLnJlZnJlc2hBd2FpdFRhcmdldHMoKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICAhd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdlcnJvcicpICYmXG4gICAgICAgICAgIXdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnc3VjY2VzcycpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoZHVtbXlQYWNrYWdlLmdldExpbnRlcigpLm1lc3NhZ2VzLmxlbmd0aCkudG9FcXVhbCgwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBsZWF2ZSB0ZXh0IHVuZGVmaW5lZCBpZiBodG1sIGlzIHNldCcsICgpID0+IHtcbiAgICAgIGV4cGVjdChkdW1teVBhY2thZ2UuaGFzUmVnaXN0ZXJlZCgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzJyksIGZzLnJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmUnLCAnLmF0b20tYnVpbGQubWF0Y2gtZnVuY3Rpb24taHRtbC5qcycpKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ3N1Y2Nlc3MnKTtcbiAgICAgIH0pO1xuXG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgY29uc3QgbGludGVyID0gZHVtbXlQYWNrYWdlLmdldExpbnRlcigpO1xuICAgICAgICBleHBlY3QobGludGVyLm1lc3NhZ2VzKS50b0VxdWFsKFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlUGF0aDogam9pbihkaXJlY3RvcnksICcuYXRvbS1idWlsZC5qcycpLFxuICAgICAgICAgICAgcmFuZ2U6IFsgWzQsIDBdLCBbNCwgMF0gXSxcbiAgICAgICAgICAgIHRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGh0bWw6ICdtaWxkbHkgPGI+YmFkPC9iPiB0aGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ1dhcm5pbmcnLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICd3YXJuaW5nJyxcbiAgICAgICAgICAgIHRyYWNlOiB1bmRlZmluZWRcbiAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGxlYXZlIHRleHQgdW5kZWZpbmVkIGlmIGh0bWwgaXMgc2V0IGluIHRyYWNlcycsICgpID0+IHtcbiAgICAgIGV4cGVjdChkdW1teVBhY2thZ2UuaGFzUmVnaXN0ZXJlZCgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzJyksIGZzLnJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmUnLCAnLmF0b20tYnVpbGQubWF0Y2gtZnVuY3Rpb24tdHJhY2UtaHRtbC5qcycpKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IGR1bW15UGFja2FnZS5nZXRMaW50ZXIoKTtcbiAgICAgICAgZXhwZWN0KGxpbnRlci5tZXNzYWdlcykudG9FcXVhbChbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSxcbiAgICAgICAgICAgIHJhbmdlOiBbIFs1LCAwXSwgWzUsIDBdIF0sXG4gICAgICAgICAgICB0ZXh0OiAnRXJyb3IgZnJvbSBidWlsZCcsXG4gICAgICAgICAgICBodG1sOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICAgICAgICB0cmFjZTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGh0bWw6ICdpbnNlcnQgPGk+Z3JlYXQ8L2k+IGV4cGxhbmF0aW9uIGhlcmUnLFxuICAgICAgICAgICAgICAgIHNldmVyaXR5OiAnaW5mbycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ0V4cGxhbmF0aW9uJyxcbiAgICAgICAgICAgICAgICByYW5nZTogWyBbMCwgMF0sIFswLCAwXV0sXG4gICAgICAgICAgICAgICAgZmlsZVBhdGg6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBnaXZlIHByaW9yaXR5IHRvIHRleHQgb3ZlciBodG1sIHdoZW4gYm90aCBhcmUgc2V0JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGR1bW15UGFja2FnZS5oYXNSZWdpc3RlcmVkKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSwgZnMucmVhZEZpbGVTeW5jKGpvaW4oX19kaXJuYW1lLCAnZml4dHVyZScsICcuYXRvbS1idWlsZC5tYXRjaC1mdW5jdGlvbi1tZXNzYWdlLWFuZC1odG1sLmpzJykpKTtcblxuICAgICAgcnVucygoKSA9PiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZUVsZW1lbnQsICdidWlsZDp0cmlnZ2VyJykpO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgIHJldHVybiB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKSAmJlxuICAgICAgICAgIHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ1aWxkIC50aXRsZScpLmNsYXNzTGlzdC5jb250YWlucygnc3VjY2VzcycpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBjb25zdCBsaW50ZXIgPSBkdW1teVBhY2thZ2UuZ2V0TGludGVyKCk7XG4gICAgICAgIGV4cGVjdChsaW50ZXIubWVzc2FnZXMpLnRvRXF1YWwoW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZpbGVQYXRoOiBqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzJyksXG4gICAgICAgICAgICByYW5nZTogWyBbNCwgMF0sIFs0LCAwXSBdLFxuICAgICAgICAgICAgdGV4dDogJ3NvbWV0aGluZyBoYXBwZW5lZCBpbiBwbGFpbiB0ZXh0JyxcbiAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHR5cGU6ICdXYXJuaW5nJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnd2FybmluZycsXG4gICAgICAgICAgICB0cmFjZTogdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBnaXZlIHByaW9yaXR5IHRvIHRleHQgb3ZlciBodG1sIHdoZW4gYm90aCBhcmUgc2V0IGluIHRyYWNlcycsICgpID0+IHtcbiAgICAgIGV4cGVjdChkdW1teVBhY2thZ2UuaGFzUmVnaXN0ZXJlZCgpKS50b0VxdWFsKHRydWUpO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhqb2luKGRpcmVjdG9yeSwgJy5hdG9tLWJ1aWxkLmpzJyksIGZzLnJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmUnLCAnLmF0b20tYnVpbGQubWF0Y2gtZnVuY3Rpb24tdHJhY2UtbWVzc2FnZS1hbmQtaHRtbC5qcycpKSk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh3b3Jrc3BhY2VFbGVtZW50LCAnYnVpbGQ6dHJpZ2dlcicpKTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICByZXR1cm4gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnVpbGQgLnRpdGxlJykgJiZcbiAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idWlsZCAudGl0bGUnKS5jbGFzc0xpc3QuY29udGFpbnMoJ2Vycm9yJyk7XG4gICAgICB9KTtcblxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbnRlciA9IGR1bW15UGFja2FnZS5nZXRMaW50ZXIoKTtcbiAgICAgICAgZXhwZWN0KGxpbnRlci5tZXNzYWdlcykudG9FcXVhbChbXG4gICAgICAgICAge1xuICAgICAgICAgICAgZmlsZVBhdGg6IGpvaW4oZGlyZWN0b3J5LCAnLmF0b20tYnVpbGQuanMnKSxcbiAgICAgICAgICAgIHJhbmdlOiBbIFs1LCAwXSwgWzUsIDBdIF0sXG4gICAgICAgICAgICB0ZXh0OiAnRXJyb3IgZnJvbSBidWlsZCcsXG4gICAgICAgICAgICBodG1sOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICAgICAgICB0cmFjZTogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ2luc2VydCBwbGFpbiB0ZXh0IGV4cGxhbmF0aW9uIGhlcmUnLFxuICAgICAgICAgICAgICAgIGh0bWw6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdFeHBsYW5hdGlvbicsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFsgWzAsIDBdLCBbMCwgMF1dLFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==