function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _libAtomBuildJs = require('../lib/atom-build.js');

var _libAtomBuildJs2 = _interopRequireDefault(_libAtomBuildJs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

'use babel';

describe('custom provider', function () {
  var originalHomedirFn = _os2['default'].homedir;
  var builder = undefined;
  var directory = null;
  var createdHomeDir = undefined;

  _temp2['default'].track();

  beforeEach(function () {
    createdHomeDir = _temp2['default'].mkdirSync('atom-build-spec-home');
    _os2['default'].homedir = function () {
      return createdHomeDir;
    };
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' })) + '/';
    atom.project.setPaths([directory]);
    builder = new _libAtomBuildJs2['default'](directory);
  });

  afterEach(function () {
    _os2['default'].homedir = originalHomedirFn;
    try {
      _fsExtra2['default'].removeSync(directory);
    } catch (e) {
      console.warn('Failed to clean up: ', e);
    }
  });

  describe('when there is no .atom-build config file in any elegible directory', function () {
    it('should not be eligible', function () {
      expect(builder.isEligible()).toEqual(false);
    });
  });

  describe('when .atom-build config is on home directory', function () {
    it('should find json file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find cson file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find yml file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);
    });
  });

  describe('when .atom-build config is on project directory', function () {
    it('should find json file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find cson file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find yml file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);
    });
  });

  describe('when .atom-build.cson exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['arg1', 'arg2']);
          expect(s.name).toEqual('Custom: Compose masterpiece');
          expect(s.sh).toEqual(false);
          expect(s.cwd).toEqual('/some/directory');
          expect(s.errorMatch).toEqual('(?<file>\\w+.js):(?<row>\\d+)');
        });
      });
    });
  });

  describe('when .atom-build.json exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('dd');
          expect(s.args).toEqual(['if=.atom-build.json']);
          expect(s.name).toEqual('Custom: Fly to moon');
        });
      });
    });
  });

  describe('when .atom-build.yml exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['hello', 'world', 'from', 'yaml']);
          expect(s.name).toEqual('Custom: yaml conf');
        });
      });
    });
  });

  describe('when .atom-build.js exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.js', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.js'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['hello', 'world', 'from', 'js']);
          expect(s.name).toEqual('Custom: from js');
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9jdXN0b20tcHJvdmlkZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzt1QkFFZSxVQUFVOzs7O29CQUNSLE1BQU07Ozs7OEJBQ0Esc0JBQXNCOzs7O2tCQUM5QixJQUFJOzs7O0FBTG5CLFdBQVcsQ0FBQzs7QUFPWixRQUFRLENBQUMsaUJBQWlCLEVBQUUsWUFBTTtBQUNoQyxNQUFNLGlCQUFpQixHQUFHLGdCQUFHLE9BQU8sQ0FBQztBQUNyQyxNQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLE1BQUksY0FBYyxZQUFBLENBQUM7O0FBRW5CLG9CQUFLLEtBQUssRUFBRSxDQUFDOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2Ysa0JBQWMsR0FBRyxrQkFBSyxTQUFTLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUN4RCxvQkFBRyxPQUFPLEdBQUc7YUFBTSxjQUFjO0tBQUEsQ0FBQztBQUNsQyxhQUFTLEdBQUcscUJBQUcsWUFBWSxDQUFDLGtCQUFLLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDbEYsUUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBRSxTQUFTLENBQUUsQ0FBQyxDQUFDO0FBQ3JDLFdBQU8sR0FBRyxnQ0FBZSxTQUFTLENBQUMsQ0FBQztHQUNyQyxDQUFDLENBQUM7O0FBRUgsV0FBUyxDQUFDLFlBQU07QUFDZCxvQkFBRyxPQUFPLEdBQUcsaUJBQWlCLENBQUM7QUFDL0IsUUFBSTtBQUFFLDJCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUFFLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFBRSxhQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQUU7R0FDekYsQ0FBQyxDQUFDOztB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QUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUM3QyxDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLDRCQUE0QixFQUFFLFlBQU07QUFDM0MsTUFBRSxDQUFDLDJCQUEyQixFQUFFLFlBQU07QUFDcEMsMkJBQUcsYUFBYSxDQUFJLFNBQVMscUJBQWtCLHFCQUFHLFlBQVksQ0FBSSxTQUFTLDZCQUEwQixDQUFDLENBQUM7QUFDdkcsWUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFM0MscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDMUQsY0FBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLGdCQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMvQixnQkFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUUsQ0FBQyxDQUFDO0FBQzNELGdCQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNDLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL2J1aWxkL3NwZWMvY3VzdG9tLXByb3ZpZGVyLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB0ZW1wIGZyb20gJ3RlbXAnO1xuaW1wb3J0IEN1c3RvbUZpbGUgZnJvbSAnLi4vbGliL2F0b20tYnVpbGQuanMnO1xuaW1wb3J0IG9zIGZyb20gJ29zJztcblxuZGVzY3JpYmUoJ2N1c3RvbSBwcm92aWRlcicsICgpID0+IHtcbiAgY29uc3Qgb3JpZ2luYWxIb21lZGlyRm4gPSBvcy5ob21lZGlyO1xuICBsZXQgYnVpbGRlcjtcbiAgbGV0IGRpcmVjdG9yeSA9IG51bGw7XG4gIGxldCBjcmVhdGVkSG9tZURpcjtcblxuICB0ZW1wLnRyYWNrKCk7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgY3JlYXRlZEhvbWVEaXIgPSB0ZW1wLm1rZGlyU3luYygnYXRvbS1idWlsZC1zcGVjLWhvbWUnKTtcbiAgICBvcy5ob21lZGlyID0gKCkgPT4gY3JlYXRlZEhvbWVEaXI7XG4gICAgZGlyZWN0b3J5ID0gZnMucmVhbHBhdGhTeW5jKHRlbXAubWtkaXJTeW5jKHsgcHJlZml4OiAnYXRvbS1idWlsZC1zcGVjLScgfSkpICsgJy8nO1xuICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbIGRpcmVjdG9yeSBdKTtcbiAgICBidWlsZGVyID0gbmV3IEN1c3RvbUZpbGUoZGlyZWN0b3J5KTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICBvcy5ob21lZGlyID0gb3JpZ2luYWxIb21lZGlyRm47XG4gICAgdHJ5IHsgZnMucmVtb3ZlU3luYyhkaXJlY3RvcnkpOyB9IGNhdGNoIChlKSB7IGNvbnNvbGUud2FybignRmFpbGVkIHRvIGNsZWFuIHVwOiAnLCBlKTsgfVxuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiB0aGVyZSBpcyBubyAuYXRvbS1idWlsZCBjb25maWcgZmlsZSBpbiBhbnkgZWxlZ2libGUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgbm90IGJlIGVsaWdpYmxlJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKGZhbHNlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gLmF0b20tYnVpbGQgY29uZmlnIGlzIG9uIGhvbWUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZmluZCBqc29uIGZpbGUgaW4gaG9tZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGNyZWF0ZWRIb21lRGlyICsgJy8uYXRvbS1idWlsZC5qc29uJywgZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC5qc29uJykpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgZmluZCBjc29uIGZpbGUgaW4gaG9tZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGNyZWF0ZWRIb21lRGlyICsgJy8uYXRvbS1idWlsZC5jc29uJywgZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC5jc29uJykpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgZmluZCB5bWwgZmlsZSBpbiBob21lIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoY3JlYXRlZEhvbWVEaXIgKyAnLy5hdG9tLWJ1aWxkLnltbCcsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQueW1sJykpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiAuYXRvbS1idWlsZCBjb25maWcgaXMgb24gcHJvamVjdCBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBmaW5kIGpzb24gZmlsZSBpbiBob21lIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy8uYXRvbS1idWlsZC5qc29uJywgZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC5qc29uJykpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgZmluZCBjc29uIGZpbGUgaW4gaG9tZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcvLmF0b20tYnVpbGQuY3NvbicsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuY3NvbicpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIGZpbmQgeW1sIGZpbGUgaW4gaG9tZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcvLmF0b20tYnVpbGQueW1sJywgZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArICcvZml4dHVyZS8uYXRvbS1idWlsZC55bWwnKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIC5hdG9tLWJ1aWxkLmNzb24gZXhpc3RzJywgKCkgPT4ge1xuICAgIGl0KCdpdCBzaG91bGQgcHJvdmlkZSB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLmF0b20tYnVpbGQuY3NvbicsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuY3NvbicpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShidWlsZGVyLnNldHRpbmdzKCkpLnRoZW4oc2V0dGluZ3MgPT4ge1xuICAgICAgICAgIGNvbnN0IHMgPSBzZXR0aW5nc1swXTtcbiAgICAgICAgICBleHBlY3Qocy5leGVjKS50b0VxdWFsKCdlY2hvJyk7XG4gICAgICAgICAgZXhwZWN0KHMuYXJncykudG9FcXVhbChbICdhcmcxJywgJ2FyZzInIF0pO1xuICAgICAgICAgIGV4cGVjdChzLm5hbWUpLnRvRXF1YWwoJ0N1c3RvbTogQ29tcG9zZSBtYXN0ZXJwaWVjZScpO1xuICAgICAgICAgIGV4cGVjdChzLnNoKS50b0VxdWFsKGZhbHNlKTtcbiAgICAgICAgICBleHBlY3Qocy5jd2QpLnRvRXF1YWwoJy9zb21lL2RpcmVjdG9yeScpO1xuICAgICAgICAgIGV4cGVjdChzLmVycm9yTWF0Y2gpLnRvRXF1YWwoJyg/PGZpbGU+XFxcXHcrLmpzKTooPzxyb3c+XFxcXGQrKScpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiAuYXRvbS1idWlsZC5qc29uIGV4aXN0cycsICgpID0+IHtcbiAgICBpdCgnaXQgc2hvdWxkIHByb3ZpZGUgdGFyZ2V0cycsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoYCR7ZGlyZWN0b3J5fS5hdG9tLWJ1aWxkLmpzb25gLCBmcy5yZWFkRmlsZVN5bmMoYCR7X19kaXJuYW1lfS9maXh0dXJlLy5hdG9tLWJ1aWxkLmpzb25gKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYnVpbGRlci5zZXR0aW5ncygpKS50aGVuKHNldHRpbmdzID0+IHtcbiAgICAgICAgICBjb25zdCBzID0gc2V0dGluZ3NbMF07XG4gICAgICAgICAgZXhwZWN0KHMuZXhlYykudG9FcXVhbCgnZGQnKTtcbiAgICAgICAgICBleHBlY3Qocy5hcmdzKS50b0VxdWFsKFsgJ2lmPS5hdG9tLWJ1aWxkLmpzb24nIF0pO1xuICAgICAgICAgIGV4cGVjdChzLm5hbWUpLnRvRXF1YWwoJ0N1c3RvbTogRmx5IHRvIG1vb24nKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gLmF0b20tYnVpbGQueW1sIGV4aXN0cycsICgpID0+IHtcbiAgICBpdCgnaXQgc2hvdWxkIHByb3ZpZGUgdGFyZ2V0cycsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoYCR7ZGlyZWN0b3J5fS5hdG9tLWJ1aWxkLnltbGAsIGZzLnJlYWRGaWxlU3luYyhgJHtfX2Rpcm5hbWV9L2ZpeHR1cmUvLmF0b20tYnVpbGQueW1sYCkpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJ1aWxkZXIuc2V0dGluZ3MoKSkudGhlbihzZXR0aW5ncyA9PiB7XG4gICAgICAgICAgY29uc3QgcyA9IHNldHRpbmdzWzBdO1xuICAgICAgICAgIGV4cGVjdChzLmV4ZWMpLnRvRXF1YWwoJ2VjaG8nKTtcbiAgICAgICAgICBleHBlY3Qocy5hcmdzKS50b0VxdWFsKFsgJ2hlbGxvJywgJ3dvcmxkJywgJ2Zyb20nLCAneWFtbCcgXSk7XG4gICAgICAgICAgZXhwZWN0KHMubmFtZSkudG9FcXVhbCgnQ3VzdG9tOiB5YW1sIGNvbmYnKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gLmF0b20tYnVpbGQuanMgZXhpc3RzJywgKCkgPT4ge1xuICAgIGl0KCdpdCBzaG91bGQgcHJvdmlkZSB0YXJnZXRzJywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhgJHtkaXJlY3Rvcnl9LmF0b20tYnVpbGQuanNgLCBmcy5yZWFkRmlsZVN5bmMoYCR7X19kaXJuYW1lfS9maXh0dXJlLy5hdG9tLWJ1aWxkLmpzYCkpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJ1aWxkZXIuc2V0dGluZ3MoKSkudGhlbihzZXR0aW5ncyA9PiB7XG4gICAgICAgICAgY29uc3QgcyA9IHNldHRpbmdzWzBdO1xuICAgICAgICAgIGV4cGVjdChzLmV4ZWMpLnRvRXF1YWwoJ2VjaG8nKTtcbiAgICAgICAgICBleHBlY3Qocy5hcmdzKS50b0VxdWFsKFsgJ2hlbGxvJywgJ3dvcmxkJywgJ2Zyb20nLCAnanMnIF0pO1xuICAgICAgICAgIGV4cGVjdChzLm5hbWUpLnRvRXF1YWwoJ0N1c3RvbTogZnJvbSBqcycpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19