Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.satisfyDependencies = satisfyDependencies;
exports.provideBuilder = provideBuilder;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _os = require('os');

// Package settings

var _packageJson = require('../package.json');

var _packageJson2 = _interopRequireDefault(_packageJson);

'use babel';

var config = {
  manageDependencies: {
    title: 'Manage Dependencies',
    description: 'When enabled, third-party dependencies will be installed automatically',
    type: 'boolean',
    'default': true,
    order: 0
  },
  alwaysEligible: {
    title: 'Always Eligible',
    description: 'The build provider will be available in your project, even when not eligible',
    type: 'boolean',
    'default': false,
    order: 1
  }
};

exports.config = config;
// This package depends on build, make sure it's installed

function activate() {
  if (atom.config.get(_packageJson2['default'].name + '.manageDependencies') === true) {
    this.satisfyDependencies();
  }
}

function satisfyDependencies() {
  var k = undefined;
  var v = undefined;

  require('atom-package-deps').install(_packageJson2['default'].name);

  var ref = _packageJson2['default']['package-deps'];
  var results = [];

  for (k in ref) {
    if (typeof ref !== 'undefined' && ref !== null) {
      v = ref[k];
      if (atom.packages.isPackageDisabled(v)) {
        if (atom.inDevMode()) {
          console.log('Enabling package \'' + v + '\'');
        }
        results.push(atom.packages.enablePackage(v));
      } else {
        results.push(void 0);
      }
    }
  }
  return results;
}

function provideBuilder() {
  return (function () {
    function OsaProvider(cwd) {
      _classCallCheck(this, OsaProvider);

      this.cwd = cwd;
    }

    _createClass(OsaProvider, [{
      key: 'getNiceName',
      value: function getNiceName() {
        return 'AppleScript';
      }
    }, {
      key: 'isEligible',
      value: function isEligible() {
        if (atom.config.get(_packageJson2['default'].name + '.alwaysEligible') === true) {
          return true;
        }

        if ((0, _os.platform)() === 'darwin') {
          return true;
        }
        return false;
      }
    }, {
      key: 'settings',
      value: function settings() {
        // const errorMatch = [
        //   '(?<file>(?:[^ !$`&*()+]|(?:\\[ !$`&*()+]))+):(\d+):(?<line>\\d+):(?<col>\\d+)'
        // ];

        return [{
          name: 'AppleScript: Run Script',
          exec: 'osascript',
          args: ['{FILE_ACTIVE}'],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          atomCommandName: 'AppleScript:run-script'
        }, {
          name: 'AppleScript: Compile Script',
          exec: 'osacompile',
          args: ['-o', '{FILE_ACTIVE_NAME_BASE}.scpt', '{FILE_ACTIVE}'],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          atomCommandName: 'AppleScript:compile-script'
        }, {
          name: 'AppleScript: Compile Script bundle',
          exec: 'osacompile',
          args: ['-o', '{FILE_ACTIVE_NAME_BASE}.scptd', '{FILE_ACTIVE}'],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          atomCommandName: 'AppleScript:compile-script-bundle'
        }, {
          name: 'AppleScript: Compile Application',
          exec: 'osacompile',
          args: ['-o', '{FILE_ACTIVE_NAME_BASE}.app', '{FILE_ACTIVE}'],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          atomCommandName: 'AppleScript:compile-application'
        }, {
          name: 'JXA: Run Script',
          exec: 'osascript',
          args: ['-l', 'JavaScript', '{FILE_ACTIVE}'],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          atomCommandName: 'JXA:run-script'
        }, {
          name: 'JXA: Compile Script',
          exec: 'osacompile',
          args: ['-l', 'JavaScript', '-o', '{FILE_ACTIVE_NAME_BASE}.scpt', '{FILE_ACTIVE}'],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          atomCommandName: 'JXA:compile-script'
        }, {
          name: 'JXA: Compile Script bundle',
          exec: 'osacompile',
          args: ['-l', 'JavaScript', '-o', '{FILE_ACTIVE_NAME_BASE}.scptd', '{FILE_ACTIVE}'],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          atomCommandName: 'JXA:compile-script-bundle'
        }, {
          name: 'JXA: Compile Application',
          exec: 'osacompile',
          args: ['-l', 'JavaScript', '-o', '{FILE_ACTIVE_NAME_BASE}.app', '{FILE_ACTIVE}'],
          cwd: '{FILE_ACTIVE_PATH}',
          sh: false,
          atomCommandName: 'JXA:compile-application'
        }];
      }
    }]);

    return OsaProvider;
  })();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQtb3NhL2xpYi9wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztrQkFFeUIsSUFBSTs7OzsyQkFHWixpQkFBaUI7Ozs7QUFMbEMsV0FBVyxDQUFDOztBQU9MLElBQU0sTUFBTSxHQUFHO0FBQ3BCLG9CQUFrQixFQUFFO0FBQ2xCLFNBQUssRUFBRSxxQkFBcUI7QUFDNUIsZUFBVyxFQUFFLHdFQUF3RTtBQUNyRixRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsSUFBSTtBQUNiLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxnQkFBYyxFQUFFO0FBQ2QsU0FBSyxFQUFFLGlCQUFpQjtBQUN4QixlQUFXLEVBQUUsOEVBQThFO0FBQzNGLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLENBQUM7R0FDVDtDQUNGLENBQUM7Ozs7O0FBR0ssU0FBUyxRQUFRLEdBQUc7QUFDekIsTUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBSyxJQUFJLEdBQUcscUJBQXFCLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDL0QsUUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7R0FDNUI7Q0FDRjs7QUFFTSxTQUFTLG1CQUFtQixHQUFHO0FBQ3BDLE1BQUksQ0FBQyxZQUFBLENBQUM7QUFDTixNQUFJLENBQUMsWUFBQSxDQUFDOztBQUVOLFNBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5QkFBSyxJQUFJLENBQUMsQ0FBQzs7QUFFaEQsTUFBTSxHQUFHLEdBQUcseUJBQUssY0FBYyxDQUFDLENBQUM7QUFDakMsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVuQixPQUFLLENBQUMsSUFBSSxHQUFHLEVBQUU7QUFDYixRQUFJLE9BQU8sR0FBRyxLQUFLLFdBQVcsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO0FBQzlD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O1NBQ3RDLEVBQ0Q7QUFDRSxjQUFJLEVBQUUsNEJBQTRCO0FBQ2xDLGNBQUksRUFBRSxZQUFZO0FBQ2xCLGNBQUksRUFBRSxDQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLCtCQUErQixFQUFFLGVBQWUsQ0FBRTtBQUNwRixhQUFHLEVBQUUsb0JBQW9CO0FBQ3pCLFlBQUUsRUFBRSxLQUFLO0FBQ1QseUJBQWUsRUFBRSwyQkFBMkI7U0FDN0MsRUFDRDtBQUNFLGNBQUksRUFBRSwwQkFBMEI7QUFDaEMsY0FBSSxFQUFFLFlBQVk7QUFDbEIsY0FBSSxFQUFFLENBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsNkJBQTZCLEVBQUUsZUFBZSxDQUFFO0FBQ2xGLGFBQUcsRUFBRSxvQkFBb0I7QUFDekIsWUFBRSxFQUFFLEtBQUs7QUFDVCx5QkFBZSxFQUFFLHlCQUF5QjtTQUMzQyxDQUNGLENBQUM7T0FDSDs7O1dBM0ZVLFdBQVc7T0E0RnRCO0NBQ0giLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9idWlsZC1vc2EvbGliL3Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XHJcblxyXG5pbXBvcnQgeyBwbGF0Zm9ybSB9IGZyb20gJ29zJztcclxuXHJcbi8vIFBhY2thZ2Ugc2V0dGluZ3NcclxuaW1wb3J0IG1ldGEgZnJvbSAnLi4vcGFja2FnZS5qc29uJztcclxuXHJcbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XHJcbiAgbWFuYWdlRGVwZW5kZW5jaWVzOiB7XHJcbiAgICB0aXRsZTogJ01hbmFnZSBEZXBlbmRlbmNpZXMnLFxyXG4gICAgZGVzY3JpcHRpb246ICdXaGVuIGVuYWJsZWQsIHRoaXJkLXBhcnR5IGRlcGVuZGVuY2llcyB3aWxsIGJlIGluc3RhbGxlZCBhdXRvbWF0aWNhbGx5JyxcclxuICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgIGRlZmF1bHQ6IHRydWUsXHJcbiAgICBvcmRlcjogMFxyXG4gIH0sXHJcbiAgYWx3YXlzRWxpZ2libGU6IHtcclxuICAgIHRpdGxlOiAnQWx3YXlzIEVsaWdpYmxlJyxcclxuICAgIGRlc2NyaXB0aW9uOiAnVGhlIGJ1aWxkIHByb3ZpZGVyIHdpbGwgYmUgYXZhaWxhYmxlIGluIHlvdXIgcHJvamVjdCwgZXZlbiB3aGVuIG5vdCBlbGlnaWJsZScsXHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICBkZWZhdWx0OiBmYWxzZSxcclxuICAgIG9yZGVyOiAxXHJcbiAgfVxyXG59O1xyXG5cclxuLy8gVGhpcyBwYWNrYWdlIGRlcGVuZHMgb24gYnVpbGQsIG1ha2Ugc3VyZSBpdCdzIGluc3RhbGxlZFxyXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XHJcbiAgaWYgKGF0b20uY29uZmlnLmdldChtZXRhLm5hbWUgKyAnLm1hbmFnZURlcGVuZGVuY2llcycpID09PSB0cnVlKSB7XHJcbiAgICB0aGlzLnNhdGlzZnlEZXBlbmRlbmNpZXMoKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzYXRpc2Z5RGVwZW5kZW5jaWVzKCkge1xyXG4gIGxldCBrO1xyXG4gIGxldCB2O1xyXG5cclxuICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwobWV0YS5uYW1lKTtcclxuXHJcbiAgY29uc3QgcmVmID0gbWV0YVsncGFja2FnZS1kZXBzJ107XHJcbiAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG5cclxuICBmb3IgKGsgaW4gcmVmKSB7XHJcbiAgICBpZiAodHlwZW9mIHJlZiAhPT0gJ3VuZGVmaW5lZCcgJiYgcmVmICE9PSBudWxsKSB7XHJcbiAgICAgIHYgPSByZWZba107XHJcbiAgICAgIGlmIChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZURpc2FibGVkKHYpKSB7XHJcbiAgICAgICAgaWYgKGF0b20uaW5EZXZNb2RlKCkpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdFbmFibGluZyBwYWNrYWdlIFxcJycgKyB2ICsgJ1xcJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHRzLnB1c2goYXRvbS5wYWNrYWdlcy5lbmFibGVQYWNrYWdlKHYpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0cztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVCdWlsZGVyKCkge1xyXG4gIHJldHVybiBjbGFzcyBPc2FQcm92aWRlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcihjd2QpIHtcclxuICAgICAgdGhpcy5jd2QgPSBjd2Q7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TmljZU5hbWUoKSB7XHJcbiAgICAgIHJldHVybiAnQXBwbGVTY3JpcHQnO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRWxpZ2libGUoKSB7XHJcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQobWV0YS5uYW1lICsgJy5hbHdheXNFbGlnaWJsZScpID09PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChwbGF0Zm9ybSgpID09PSAnZGFyd2luJykge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXR0aW5ncygpIHtcclxuICAgICAgLy8gY29uc3QgZXJyb3JNYXRjaCA9IFtcclxuICAgICAgLy8gICAnKD88ZmlsZT4oPzpbXiAhJGAmKigpK118KD86XFxcXFsgISRgJiooKStdKSkrKTooXFxkKyk6KD88bGluZT5cXFxcZCspOig/PGNvbD5cXFxcZCspJ1xyXG4gICAgICAvLyBdO1xyXG5cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiAnQXBwbGVTY3JpcHQ6IFJ1biBTY3JpcHQnLFxyXG4gICAgICAgICAgZXhlYzogJ29zYXNjcmlwdCcsXHJcbiAgICAgICAgICBhcmdzOiBbICd7RklMRV9BQ1RJVkV9JyBdLFxyXG4gICAgICAgICAgY3dkOiAne0ZJTEVfQUNUSVZFX1BBVEh9JyxcclxuICAgICAgICAgIHNoOiBmYWxzZSxcclxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ0FwcGxlU2NyaXB0OnJ1bi1zY3JpcHQnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiAnQXBwbGVTY3JpcHQ6IENvbXBpbGUgU2NyaXB0JyxcclxuICAgICAgICAgIGV4ZWM6ICdvc2Fjb21waWxlJyxcclxuICAgICAgICAgIGFyZ3M6IFsgJy1vJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9LnNjcHQnLCAne0ZJTEVfQUNUSVZFfScgXSxcclxuICAgICAgICAgIGN3ZDogJ3tGSUxFX0FDVElWRV9QQVRIfScsXHJcbiAgICAgICAgICBzaDogZmFsc2UsXHJcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdBcHBsZVNjcmlwdDpjb21waWxlLXNjcmlwdCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6ICdBcHBsZVNjcmlwdDogQ29tcGlsZSBTY3JpcHQgYnVuZGxlJyxcclxuICAgICAgICAgIGV4ZWM6ICdvc2Fjb21waWxlJyxcclxuICAgICAgICAgIGFyZ3M6IFsgJy1vJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9LnNjcHRkJywgJ3tGSUxFX0FDVElWRX0nIF0sXHJcbiAgICAgICAgICBjd2Q6ICd7RklMRV9BQ1RJVkVfUEFUSH0nLFxyXG4gICAgICAgICAgc2g6IGZhbHNlLFxyXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnQXBwbGVTY3JpcHQ6Y29tcGlsZS1zY3JpcHQtYnVuZGxlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogJ0FwcGxlU2NyaXB0OiBDb21waWxlIEFwcGxpY2F0aW9uJyxcclxuICAgICAgICAgIGV4ZWM6ICdvc2Fjb21waWxlJyxcclxuICAgICAgICAgIGFyZ3M6IFsgJy1vJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9LmFwcCcsICd7RklMRV9BQ1RJVkV9JyBdLFxyXG4gICAgICAgICAgY3dkOiAne0ZJTEVfQUNUSVZFX1BBVEh9JyxcclxuICAgICAgICAgIHNoOiBmYWxzZSxcclxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ0FwcGxlU2NyaXB0OmNvbXBpbGUtYXBwbGljYXRpb24nXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiAnSlhBOiBSdW4gU2NyaXB0JyxcclxuICAgICAgICAgIGV4ZWM6ICdvc2FzY3JpcHQnLFxyXG4gICAgICAgICAgYXJnczogWyAnLWwnLCAnSmF2YVNjcmlwdCcsICd7RklMRV9BQ1RJVkV9JyBdLFxyXG4gICAgICAgICAgY3dkOiAne0ZJTEVfQUNUSVZFX1BBVEh9JyxcclxuICAgICAgICAgIHNoOiBmYWxzZSxcclxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ0pYQTpydW4tc2NyaXB0J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogJ0pYQTogQ29tcGlsZSBTY3JpcHQnLFxyXG4gICAgICAgICAgZXhlYzogJ29zYWNvbXBpbGUnLFxyXG4gICAgICAgICAgYXJnczogWyAnLWwnLCAnSmF2YVNjcmlwdCcsICctbycsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfS5zY3B0JywgJ3tGSUxFX0FDVElWRX0nIF0sXHJcbiAgICAgICAgICBjd2Q6ICd7RklMRV9BQ1RJVkVfUEFUSH0nLFxyXG4gICAgICAgICAgc2g6IGZhbHNlLFxyXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnSlhBOmNvbXBpbGUtc2NyaXB0J1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogJ0pYQTogQ29tcGlsZSBTY3JpcHQgYnVuZGxlJyxcclxuICAgICAgICAgIGV4ZWM6ICdvc2Fjb21waWxlJyxcclxuICAgICAgICAgIGFyZ3M6IFsgJy1sJywgJ0phdmFTY3JpcHQnLCAnLW8nLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0uc2NwdGQnLCAne0ZJTEVfQUNUSVZFfScgXSxcclxuICAgICAgICAgIGN3ZDogJ3tGSUxFX0FDVElWRV9QQVRIfScsXHJcbiAgICAgICAgICBzaDogZmFsc2UsXHJcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdKWEE6Y29tcGlsZS1zY3JpcHQtYnVuZGxlJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogJ0pYQTogQ29tcGlsZSBBcHBsaWNhdGlvbicsXHJcbiAgICAgICAgICBleGVjOiAnb3NhY29tcGlsZScsXHJcbiAgICAgICAgICBhcmdzOiBbICctbCcsICdKYXZhU2NyaXB0JywgJy1vJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9LmFwcCcsICd7RklMRV9BQ1RJVkV9JyBdLFxyXG4gICAgICAgICAgY3dkOiAne0ZJTEVfQUNUSVZFX1BBVEh9JyxcclxuICAgICAgICAgIHNoOiBmYWxzZSxcclxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ0pYQTpjb21waWxlLWFwcGxpY2F0aW9uJ1xyXG4gICAgICAgIH1cclxuICAgICAgXTtcclxuICAgIH1cclxuICB9O1xyXG59XHJcbiJdfQ==