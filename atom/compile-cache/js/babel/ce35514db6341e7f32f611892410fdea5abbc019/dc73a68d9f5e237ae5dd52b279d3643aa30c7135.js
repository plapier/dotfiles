Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _codeContextBuilder = require('./code-context-builder');

var _codeContextBuilder2 = _interopRequireDefault(_codeContextBuilder);

var _grammarUtils = require('./grammar-utils');

var _grammarUtils2 = _interopRequireDefault(_grammarUtils);

var _runner = require('./runner');

var _runner2 = _interopRequireDefault(_runner);

var _runtime = require('./runtime');

var _runtime2 = _interopRequireDefault(_runtime);

var _scriptOptions = require('./script-options');

var _scriptOptions2 = _interopRequireDefault(_scriptOptions);

var _scriptOptionsView = require('./script-options-view');

var _scriptOptionsView2 = _interopRequireDefault(_scriptOptionsView);

var _scriptProfileRunView = require('./script-profile-run-view');

var _scriptProfileRunView2 = _interopRequireDefault(_scriptProfileRunView);

var _scriptView = require('./script-view');

var _scriptView2 = _interopRequireDefault(_scriptView);

var _viewRuntimeObserver = require('./view-runtime-observer');

var _viewRuntimeObserver2 = _interopRequireDefault(_viewRuntimeObserver);

'use babel';

exports['default'] = {
  config: {
    enableExecTime: {
      title: 'Output the time it took to execute the script',
      type: 'boolean',
      'default': true
    },
    escapeConsoleOutput: {
      title: 'HTML escape console output',
      type: 'boolean',
      'default': true
    },
    ignoreSelection: {
      title: 'Ignore selection (file-based runs only)',
      type: 'boolean',
      'default': false
    },
    scrollWithOutput: {
      title: 'Scroll with output',
      type: 'boolean',
      'default': true
    },
    stopOnRerun: {
      title: 'Stop running process on rerun',
      type: 'boolean',
      'default': false
    },
    cwdBehavior: {
      title: 'Default CWD Behavior',
      description: 'If no Run Options are set, this setting decides how to determine the CWD',
      type: 'string',
      'default': 'First project directory',
      'enum': ['First project directory', 'Project directory of the script', 'Directory of the script']
    }
  },
  // For some reason, the text of these options does not show in package settings view
  // default: 'firstProj'
  // enum: [
  //   {value: 'firstProj', description: 'First project directory (if there is one)'}
  //   {value: 'scriptProj', description: 'Project directory of the script (if there is one)'}
  //   {value: 'scriptDir', description: 'Directory of the script'}
  // ]
  scriptView: null,
  scriptOptionsView: null,
  scriptProfileRunView: null,
  scriptOptions: null,
  scriptProfiles: [],

  activate: function activate(state) {
    var _this = this;

    this.scriptView = new _scriptView2['default'](state.scriptViewState);
    this.scriptOptions = new _scriptOptions2['default']();
    this.scriptOptionsView = new _scriptOptionsView2['default'](this.scriptOptions);

    // profiles loading
    this.scriptProfiles = [];
    if (state.profiles) {
      for (var profile of state.profiles) {
        var so = _scriptOptions2['default'].createFromOptions(profile.name, profile);
        this.scriptProfiles.push(so);
      }
    }

    this.scriptProfileRunView = new _scriptProfileRunView2['default'](this.scriptProfiles);

    var codeContextBuilder = new _codeContextBuilder2['default']();
    var runner = new _runner2['default'](this.scriptOptions);

    var observer = new _viewRuntimeObserver2['default'](this.scriptView);

    this.runtime = new _runtime2['default'](runner, codeContextBuilder, [observer]);

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'core:cancel': function coreCancel() {
        return _this.closeScriptViewAndStopRunner();
      },
      'core:close': function coreClose() {
        return _this.closeScriptViewAndStopRunner();
      },
      'script:close-view': function scriptCloseView() {
        return _this.closeScriptViewAndStopRunner();
      },
      'script:copy-run-results': function scriptCopyRunResults() {
        return _this.scriptView.copyResults();
      },
      'script:kill-process': function scriptKillProcess() {
        return _this.runtime.stop();
      },
      'script:run-by-line-number': function scriptRunByLineNumber() {
        return _this.runtime.execute('Line Number Based');
      },
      'script:run': function scriptRun() {
        return _this.runtime.execute('Selection Based');
      }
    }));

    // profile created
    this.scriptOptionsView.onProfileSave(function (profileData) {
      // create and fill out profile
      var profile = _scriptOptions2['default'].createFromOptions(profileData.name, profileData.options);

      var codeContext = _this.runtime.codeContextBuilder.buildCodeContext(atom.workspace.getActiveTextEditor(), 'Selection Based');
      profile.lang = codeContext.lang;

      // formatting description
      var opts = profile.toObject();
      var desc = 'Language: ' + codeContext.lang;
      if (opts.cmd) {
        desc += ', Command: ' + opts.cmd;
      }
      if (opts.cmdArgs && opts.cmd) {
        desc += ' ' + opts.cmdArgs.join(' ');
      }

      profile.description = desc;
      _this.scriptProfiles.push(profile);

      _this.scriptOptionsView.hide();
      _this.scriptProfileRunView.show();
      _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
    });

    // profile deleted
    this.scriptProfileRunView.onProfileDelete(function (profile) {
      var index = _this.scriptProfiles.indexOf(profile);
      if (index === -1) {
        return;
      }

      if (index !== -1) {
        _this.scriptProfiles.splice(index, 1);
      }
      _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
    });

    // profile renamed
    this.scriptProfileRunView.onProfileChange(function (data) {
      var index = _this.scriptProfiles.indexOf(data.profile);
      if (index === -1 || !_this.scriptProfiles[index][data.key]) {
        return;
      }

      _this.scriptProfiles[index][data.key] = data.value;
      _this.scriptProfileRunView.show();
      _this.scriptProfileRunView.setProfiles(_this.scriptProfiles);
    });

    // profile renamed
    return this.scriptProfileRunView.onProfileRun(function (profile) {
      if (!profile) {
        return;
      }
      _this.runtime.execute('Selection Based', null, profile);
    });
  },

  deactivate: function deactivate() {
    this.runtime.destroy();
    this.scriptView.removePanel();
    this.scriptOptionsView.close();
    this.scriptProfileRunView.close();
    this.subscriptions.dispose();
    _grammarUtils2['default'].deleteTempFiles();
  },

  closeScriptViewAndStopRunner: function closeScriptViewAndStopRunner() {
    this.runtime.stop();
    this.scriptView.removePanel();
  },

  // Public
  //
  // Service method that provides the default runtime that's configurable through Atom editor
  // Use this service if you want to directly show the script's output in the Atom editor
  //
  // **Do not destroy this {Runtime} instance!** By doing so you'll break this plugin!
  //
  // Also note that the Script package isn't activated until you actually try to use it.
  // That's why this service won't be automatically consumed. To be sure you consume it
  // you may need to manually activate the package:
  //
  // atom.packages.loadPackage('script').activateNow() # this code doesn't include error handling!
  //
  // see https://github.com/s1mplex/Atom-Script-Runtime-Consumer-Sample for a full example
  provideDefaultRuntime: function provideDefaultRuntime() {
    return this.runtime;
  },

  // Public
  //
  // Service method that provides a blank runtime. You are free to configure any aspect of it:
  // * Add observer (`runtime.addObserver(observer)`) - see {ViewRuntimeObserver} for an example
  // * configure script options (`runtime.scriptOptions`)
  //
  // In contrast to `provideDefaultRuntime` you should dispose this {Runtime} when
  // you no longer need it.
  //
  // Also note that the Script package isn't activated until you actually try to use it.
  // That's why this service won't be automatically consumed. To be sure you consume it
  // you may need to manually activate the package:
  //
  // atom.packages.loadPackage('script').activateNow() # this code doesn't include error handling!
  //
  // see https://github.com/s1mplex/Atom-Script-Runtime-Consumer-Sample for a full example
  provideBlankRuntime: function provideBlankRuntime() {
    var runner = new _runner2['default'](new _scriptOptions2['default']());
    var codeContextBuilder = new _codeContextBuilder2['default']();

    return new _runtime2['default'](runner, codeContextBuilder, []);
  },

  serialize: function serialize() {
    // TODO: True serialization needs to take the options view into account
    //       and handle deserialization
    var serializedProfiles = [];
    for (var profile of this.scriptProfiles) {
      serializedProfiles.push(profile.toObject());
    }

    return {
      scriptViewState: this.scriptView.serialize(),
      scriptOptionsViewState: this.scriptOptionsView.serialize(),
      profiles: serializedProfiles
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFb0MsTUFBTTs7a0NBRVgsd0JBQXdCOzs7OzRCQUM5QixpQkFBaUI7Ozs7c0JBQ3ZCLFVBQVU7Ozs7dUJBQ1QsV0FBVzs7Ozs2QkFDTCxrQkFBa0I7Ozs7aUNBQ2QsdUJBQXVCOzs7O29DQUNwQiwyQkFBMkI7Ozs7MEJBQ3JDLGVBQWU7Ozs7bUNBQ04seUJBQXlCOzs7O0FBWnpELFdBQVcsQ0FBQzs7cUJBY0c7QUFDYixRQUFNLEVBQUU7QUFDTixrQkFBYyxFQUFFO0FBQ2QsV0FBSyxFQUFFLCtDQUErQztBQUN0RCxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELHVCQUFtQixFQUFFO0FBQ25CLFdBQUssRUFBRSw0QkFBNEI7QUFDbkMsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxtQkFBZSxFQUFFO0FBQ2YsV0FBSyxFQUFFLHlDQUF5QztBQUNoRCxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELG9CQUFnQixFQUFFO0FBQ2hCLFdBQUssRUFBRSxvQkFBb0I7QUFDM0IsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxlQUFXLEVBQUU7QUFDWCxXQUFLLEVBQUUsK0JBQStCO0FBQ3RDLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0QsZUFBVyxFQUFFO0FBQ1gsV0FBSyxFQUFFLHNCQUFzQjtBQUM3QixpQkFBVyxFQUFFLDBFQUEwRTtBQUN2RixVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLHlCQUF5QjtBQUNsQyxjQUFNLENBQ0oseUJBQXlCLEVBQ3pCLGlDQUFpQyxFQUNqQyx5QkFBeUIsQ0FDMUI7S0FDRjtHQUNGOzs7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QkFBRztBQUNwQixRQUFNLE1BQU0sR0FBRyx3QkFBVyxnQ0FBbUIsQ0FBQyxDQUFDO0FBQy9DLFFBQU0sa0JBQWtCLEdBQUcscUNBQXdCLENBQUM7O0FBRXBELFdBQU8seUJBQVksTUFBTSxFQUFFLGtCQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0dBQ3BEOztBQUVELFdBQVMsRUFBQSxxQkFBRzs7O0FBR1YsUUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7QUFDOUIsU0FBSyxJQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQUUsd0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQUU7O0FBRTNGLFdBQU87QUFDTCxxQkFBZSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFO0FBQzVDLDRCQUFzQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUU7QUFDMUQsY0FBUSxFQUFFLGtCQUFrQjtLQUM3QixDQUFDO0dBQ0g7Q0FDRiIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9EZXYvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCBDb2RlQ29udGV4dEJ1aWxkZXIgZnJvbSAnLi9jb2RlLWNvbnRleHQtYnVpbGRlcic7XG5pbXBvcnQgR3JhbW1hclV0aWxzIGZyb20gJy4vZ3JhbW1hci11dGlscyc7XG5pbXBvcnQgUnVubmVyIGZyb20gJy4vcnVubmVyJztcbmltcG9ydCBSdW50aW1lIGZyb20gJy4vcnVudGltZSc7XG5pbXBvcnQgU2NyaXB0T3B0aW9ucyBmcm9tICcuL3NjcmlwdC1vcHRpb25zJztcbmltcG9ydCBTY3JpcHRPcHRpb25zVmlldyBmcm9tICcuL3NjcmlwdC1vcHRpb25zLXZpZXcnO1xuaW1wb3J0IFNjcmlwdFByb2ZpbGVSdW5WaWV3IGZyb20gJy4vc2NyaXB0LXByb2ZpbGUtcnVuLXZpZXcnO1xuaW1wb3J0IFNjcmlwdFZpZXcgZnJvbSAnLi9zY3JpcHQtdmlldyc7XG5pbXBvcnQgVmlld1J1bnRpbWVPYnNlcnZlciBmcm9tICcuL3ZpZXctcnVudGltZS1vYnNlcnZlcic7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY29uZmlnOiB7XG4gICAgZW5hYmxlRXhlY1RpbWU6IHtcbiAgICAgIHRpdGxlOiAnT3V0cHV0IHRoZSB0aW1lIGl0IHRvb2sgdG8gZXhlY3V0ZSB0aGUgc2NyaXB0JyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBlc2NhcGVDb25zb2xlT3V0cHV0OiB7XG4gICAgICB0aXRsZTogJ0hUTUwgZXNjYXBlIGNvbnNvbGUgb3V0cHV0JyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBpZ25vcmVTZWxlY3Rpb246IHtcbiAgICAgIHRpdGxlOiAnSWdub3JlIHNlbGVjdGlvbiAoZmlsZS1iYXNlZCBydW5zIG9ubHkpJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgc2Nyb2xsV2l0aE91dHB1dDoge1xuICAgICAgdGl0bGU6ICdTY3JvbGwgd2l0aCBvdXRwdXQnLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICB9LFxuICAgIHN0b3BPblJlcnVuOiB7XG4gICAgICB0aXRsZTogJ1N0b3AgcnVubmluZyBwcm9jZXNzIG9uIHJlcnVuJyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgY3dkQmVoYXZpb3I6IHtcbiAgICAgIHRpdGxlOiAnRGVmYXVsdCBDV0QgQmVoYXZpb3InLFxuICAgICAgZGVzY3JpcHRpb246ICdJZiBubyBSdW4gT3B0aW9ucyBhcmUgc2V0LCB0aGlzIHNldHRpbmcgZGVjaWRlcyBob3cgdG8gZGV0ZXJtaW5lIHRoZSBDV0QnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnRmlyc3QgcHJvamVjdCBkaXJlY3RvcnknLFxuICAgICAgZW51bTogW1xuICAgICAgICAnRmlyc3QgcHJvamVjdCBkaXJlY3RvcnknLFxuICAgICAgICAnUHJvamVjdCBkaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCcsXG4gICAgICAgICdEaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCcsXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG4gIC8vIEZvciBzb21lIHJlYXNvbiwgdGhlIHRleHQgb2YgdGhlc2Ugb3B0aW9ucyBkb2VzIG5vdCBzaG93IGluIHBhY2thZ2Ugc2V0dGluZ3Mgdmlld1xuICAvLyBkZWZhdWx0OiAnZmlyc3RQcm9qJ1xuICAvLyBlbnVtOiBbXG4gIC8vICAge3ZhbHVlOiAnZmlyc3RQcm9qJywgZGVzY3JpcHRpb246ICdGaXJzdCBwcm9qZWN0IGRpcmVjdG9yeSAoaWYgdGhlcmUgaXMgb25lKSd9XG4gIC8vICAge3ZhbHVlOiAnc2NyaXB0UHJvaicsIGRlc2NyaXB0aW9uOiAnUHJvamVjdCBkaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCAoaWYgdGhlcmUgaXMgb25lKSd9XG4gIC8vICAge3ZhbHVlOiAnc2NyaXB0RGlyJywgZGVzY3JpcHRpb246ICdEaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCd9XG4gIC8vIF1cbiAgc2NyaXB0VmlldzogbnVsbCxcbiAgc2NyaXB0T3B0aW9uc1ZpZXc6IG51bGwsXG4gIHNjcmlwdFByb2ZpbGVSdW5WaWV3OiBudWxsLFxuICBzY3JpcHRPcHRpb25zOiBudWxsLFxuICBzY3JpcHRQcm9maWxlczogW10sXG5cbiAgYWN0aXZhdGUoc3RhdGUpIHtcbiAgICB0aGlzLnNjcmlwdFZpZXcgPSBuZXcgU2NyaXB0VmlldyhzdGF0ZS5zY3JpcHRWaWV3U3RhdGUpO1xuICAgIHRoaXMuc2NyaXB0T3B0aW9ucyA9IG5ldyBTY3JpcHRPcHRpb25zKCk7XG4gICAgdGhpcy5zY3JpcHRPcHRpb25zVmlldyA9IG5ldyBTY3JpcHRPcHRpb25zVmlldyh0aGlzLnNjcmlwdE9wdGlvbnMpO1xuXG4gICAgLy8gcHJvZmlsZXMgbG9hZGluZ1xuICAgIHRoaXMuc2NyaXB0UHJvZmlsZXMgPSBbXTtcbiAgICBpZiAoc3RhdGUucHJvZmlsZXMpIHtcbiAgICAgIGZvciAoY29uc3QgcHJvZmlsZSBvZiBzdGF0ZS5wcm9maWxlcykge1xuICAgICAgICBjb25zdCBzbyA9IFNjcmlwdE9wdGlvbnMuY3JlYXRlRnJvbU9wdGlvbnMocHJvZmlsZS5uYW1lLCBwcm9maWxlKTtcbiAgICAgICAgdGhpcy5zY3JpcHRQcm9maWxlcy5wdXNoKHNvKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3ID0gbmV3IFNjcmlwdFByb2ZpbGVSdW5WaWV3KHRoaXMuc2NyaXB0UHJvZmlsZXMpO1xuXG4gICAgY29uc3QgY29kZUNvbnRleHRCdWlsZGVyID0gbmV3IENvZGVDb250ZXh0QnVpbGRlcigpO1xuICAgIGNvbnN0IHJ1bm5lciA9IG5ldyBSdW5uZXIodGhpcy5zY3JpcHRPcHRpb25zKTtcblxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFZpZXdSdW50aW1lT2JzZXJ2ZXIodGhpcy5zY3JpcHRWaWV3KTtcblxuICAgIHRoaXMucnVudGltZSA9IG5ldyBSdW50aW1lKHJ1bm5lciwgY29kZUNvbnRleHRCdWlsZGVyLCBbb2JzZXJ2ZXJdKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnY29yZTpjYW5jZWwnOiAoKSA9PiB0aGlzLmNsb3NlU2NyaXB0Vmlld0FuZFN0b3BSdW5uZXIoKSxcbiAgICAgICdjb3JlOmNsb3NlJzogKCkgPT4gdGhpcy5jbG9zZVNjcmlwdFZpZXdBbmRTdG9wUnVubmVyKCksXG4gICAgICAnc2NyaXB0OmNsb3NlLXZpZXcnOiAoKSA9PiB0aGlzLmNsb3NlU2NyaXB0Vmlld0FuZFN0b3BSdW5uZXIoKSxcbiAgICAgICdzY3JpcHQ6Y29weS1ydW4tcmVzdWx0cyc6ICgpID0+IHRoaXMuc2NyaXB0Vmlldy5jb3B5UmVzdWx0cygpLFxuICAgICAgJ3NjcmlwdDpraWxsLXByb2Nlc3MnOiAoKSA9PiB0aGlzLnJ1bnRpbWUuc3RvcCgpLFxuICAgICAgJ3NjcmlwdDpydW4tYnktbGluZS1udW1iZXInOiAoKSA9PiB0aGlzLnJ1bnRpbWUuZXhlY3V0ZSgnTGluZSBOdW1iZXIgQmFzZWQnKSxcbiAgICAgICdzY3JpcHQ6cnVuJzogKCkgPT4gdGhpcy5ydW50aW1lLmV4ZWN1dGUoJ1NlbGVjdGlvbiBCYXNlZCcpLFxuICAgIH0pKTtcblxuICAgIC8vIHByb2ZpbGUgY3JlYXRlZFxuICAgIHRoaXMuc2NyaXB0T3B0aW9uc1ZpZXcub25Qcm9maWxlU2F2ZSgocHJvZmlsZURhdGEpID0+IHtcbiAgICAgIC8vIGNyZWF0ZSBhbmQgZmlsbCBvdXQgcHJvZmlsZVxuICAgICAgY29uc3QgcHJvZmlsZSA9IFNjcmlwdE9wdGlvbnMuY3JlYXRlRnJvbU9wdGlvbnMocHJvZmlsZURhdGEubmFtZSwgcHJvZmlsZURhdGEub3B0aW9ucyk7XG5cbiAgICAgIGNvbnN0IGNvZGVDb250ZXh0ID0gdGhpcy5ydW50aW1lLmNvZGVDb250ZXh0QnVpbGRlci5idWlsZENvZGVDb250ZXh0KFxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCksICdTZWxlY3Rpb24gQmFzZWQnKTtcbiAgICAgIHByb2ZpbGUubGFuZyA9IGNvZGVDb250ZXh0Lmxhbmc7XG5cbiAgICAgIC8vIGZvcm1hdHRpbmcgZGVzY3JpcHRpb25cbiAgICAgIGNvbnN0IG9wdHMgPSBwcm9maWxlLnRvT2JqZWN0KCk7XG4gICAgICBsZXQgZGVzYyA9IGBMYW5ndWFnZTogJHtjb2RlQ29udGV4dC5sYW5nfWA7XG4gICAgICBpZiAob3B0cy5jbWQpIHsgZGVzYyArPSBgLCBDb21tYW5kOiAke29wdHMuY21kfWA7IH1cbiAgICAgIGlmIChvcHRzLmNtZEFyZ3MgJiYgb3B0cy5jbWQpIHsgZGVzYyArPSBgICR7b3B0cy5jbWRBcmdzLmpvaW4oJyAnKX1gOyB9XG5cbiAgICAgIHByb2ZpbGUuZGVzY3JpcHRpb24gPSBkZXNjO1xuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xuXG4gICAgICB0aGlzLnNjcmlwdE9wdGlvbnNWaWV3LmhpZGUoKTtcbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuc2hvdygpO1xuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5zZXRQcm9maWxlcyh0aGlzLnNjcmlwdFByb2ZpbGVzKTtcbiAgICB9KTtcblxuICAgIC8vIHByb2ZpbGUgZGVsZXRlZFxuICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcub25Qcm9maWxlRGVsZXRlKChwcm9maWxlKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc2NyaXB0UHJvZmlsZXMuaW5kZXhPZihwcm9maWxlKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHsgcmV0dXJuOyB9XG5cbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHsgdGhpcy5zY3JpcHRQcm9maWxlcy5zcGxpY2UoaW5kZXgsIDEpOyB9XG4gICAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3LnNldFByb2ZpbGVzKHRoaXMuc2NyaXB0UHJvZmlsZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gcHJvZmlsZSByZW5hbWVkXG4gICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5vblByb2ZpbGVDaGFuZ2UoKGRhdGEpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zY3JpcHRQcm9maWxlcy5pbmRleE9mKGRhdGEucHJvZmlsZSk7XG4gICAgICBpZiAoaW5kZXggPT09IC0xIHx8ICF0aGlzLnNjcmlwdFByb2ZpbGVzW2luZGV4XVtkYXRhLmtleV0pIHsgcmV0dXJuOyB9XG5cbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZXNbaW5kZXhdW2RhdGEua2V5XSA9IGRhdGEudmFsdWU7XG4gICAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3LnNob3coKTtcbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuc2V0UHJvZmlsZXModGhpcy5zY3JpcHRQcm9maWxlcyk7XG4gICAgfSk7XG5cbiAgICAvLyBwcm9maWxlIHJlbmFtZWRcbiAgICByZXR1cm4gdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5vblByb2ZpbGVSdW4oKHByb2ZpbGUpID0+IHtcbiAgICAgIGlmICghcHJvZmlsZSkgeyByZXR1cm47IH1cbiAgICAgIHRoaXMucnVudGltZS5leGVjdXRlKCdTZWxlY3Rpb24gQmFzZWQnLCBudWxsLCBwcm9maWxlKTtcbiAgICB9KTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMucnVudGltZS5kZXN0cm95KCk7XG4gICAgdGhpcy5zY3JpcHRWaWV3LnJlbW92ZVBhbmVsKCk7XG4gICAgdGhpcy5zY3JpcHRPcHRpb25zVmlldy5jbG9zZSgpO1xuICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuY2xvc2UoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIEdyYW1tYXJVdGlscy5kZWxldGVUZW1wRmlsZXMoKTtcbiAgfSxcblxuICBjbG9zZVNjcmlwdFZpZXdBbmRTdG9wUnVubmVyKCkge1xuICAgIHRoaXMucnVudGltZS5zdG9wKCk7XG4gICAgdGhpcy5zY3JpcHRWaWV3LnJlbW92ZVBhbmVsKCk7XG4gIH0sXG5cbiAgLy8gUHVibGljXG4gIC8vXG4gIC8vIFNlcnZpY2UgbWV0aG9kIHRoYXQgcHJvdmlkZXMgdGhlIGRlZmF1bHQgcnVudGltZSB0aGF0J3MgY29uZmlndXJhYmxlIHRocm91Z2ggQXRvbSBlZGl0b3JcbiAgLy8gVXNlIHRoaXMgc2VydmljZSBpZiB5b3Ugd2FudCB0byBkaXJlY3RseSBzaG93IHRoZSBzY3JpcHQncyBvdXRwdXQgaW4gdGhlIEF0b20gZWRpdG9yXG4gIC8vXG4gIC8vICoqRG8gbm90IGRlc3Ryb3kgdGhpcyB7UnVudGltZX0gaW5zdGFuY2UhKiogQnkgZG9pbmcgc28geW91J2xsIGJyZWFrIHRoaXMgcGx1Z2luIVxuICAvL1xuICAvLyBBbHNvIG5vdGUgdGhhdCB0aGUgU2NyaXB0IHBhY2thZ2UgaXNuJ3QgYWN0aXZhdGVkIHVudGlsIHlvdSBhY3R1YWxseSB0cnkgdG8gdXNlIGl0LlxuICAvLyBUaGF0J3Mgd2h5IHRoaXMgc2VydmljZSB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IGNvbnN1bWVkLiBUbyBiZSBzdXJlIHlvdSBjb25zdW1lIGl0XG4gIC8vIHlvdSBtYXkgbmVlZCB0byBtYW51YWxseSBhY3RpdmF0ZSB0aGUgcGFja2FnZTpcbiAgLy9cbiAgLy8gYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgnc2NyaXB0JykuYWN0aXZhdGVOb3coKSAjIHRoaXMgY29kZSBkb2Vzbid0IGluY2x1ZGUgZXJyb3IgaGFuZGxpbmchXG4gIC8vXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vczFtcGxleC9BdG9tLVNjcmlwdC1SdW50aW1lLUNvbnN1bWVyLVNhbXBsZSBmb3IgYSBmdWxsIGV4YW1wbGVcbiAgcHJvdmlkZURlZmF1bHRSdW50aW1lKCkge1xuICAgIHJldHVybiB0aGlzLnJ1bnRpbWU7XG4gIH0sXG5cbiAgLy8gUHVibGljXG4gIC8vXG4gIC8vIFNlcnZpY2UgbWV0aG9kIHRoYXQgcHJvdmlkZXMgYSBibGFuayBydW50aW1lLiBZb3UgYXJlIGZyZWUgdG8gY29uZmlndXJlIGFueSBhc3BlY3Qgb2YgaXQ6XG4gIC8vICogQWRkIG9ic2VydmVyIChgcnVudGltZS5hZGRPYnNlcnZlcihvYnNlcnZlcilgKSAtIHNlZSB7Vmlld1J1bnRpbWVPYnNlcnZlcn0gZm9yIGFuIGV4YW1wbGVcbiAgLy8gKiBjb25maWd1cmUgc2NyaXB0IG9wdGlvbnMgKGBydW50aW1lLnNjcmlwdE9wdGlvbnNgKVxuICAvL1xuICAvLyBJbiBjb250cmFzdCB0byBgcHJvdmlkZURlZmF1bHRSdW50aW1lYCB5b3Ugc2hvdWxkIGRpc3Bvc2UgdGhpcyB7UnVudGltZX0gd2hlblxuICAvLyB5b3Ugbm8gbG9uZ2VyIG5lZWQgaXQuXG4gIC8vXG4gIC8vIEFsc28gbm90ZSB0aGF0IHRoZSBTY3JpcHQgcGFja2FnZSBpc24ndCBhY3RpdmF0ZWQgdW50aWwgeW91IGFjdHVhbGx5IHRyeSB0byB1c2UgaXQuXG4gIC8vIFRoYXQncyB3aHkgdGhpcyBzZXJ2aWNlIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgY29uc3VtZWQuIFRvIGJlIHN1cmUgeW91IGNvbnN1bWUgaXRcbiAgLy8geW91IG1heSBuZWVkIHRvIG1hbnVhbGx5IGFjdGl2YXRlIHRoZSBwYWNrYWdlOlxuICAvL1xuICAvLyBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdzY3JpcHQnKS5hY3RpdmF0ZU5vdygpICMgdGhpcyBjb2RlIGRvZXNuJ3QgaW5jbHVkZSBlcnJvciBoYW5kbGluZyFcbiAgLy9cbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9zMW1wbGV4L0F0b20tU2NyaXB0LVJ1bnRpbWUtQ29uc3VtZXItU2FtcGxlIGZvciBhIGZ1bGwgZXhhbXBsZVxuICBwcm92aWRlQmxhbmtSdW50aW1lKCkge1xuICAgIGNvbnN0IHJ1bm5lciA9IG5ldyBSdW5uZXIobmV3IFNjcmlwdE9wdGlvbnMoKSk7XG4gICAgY29uc3QgY29kZUNvbnRleHRCdWlsZGVyID0gbmV3IENvZGVDb250ZXh0QnVpbGRlcigpO1xuXG4gICAgcmV0dXJuIG5ldyBSdW50aW1lKHJ1bm5lciwgY29kZUNvbnRleHRCdWlsZGVyLCBbXSk7XG4gIH0sXG5cbiAgc2VyaWFsaXplKCkge1xuICAgIC8vIFRPRE86IFRydWUgc2VyaWFsaXphdGlvbiBuZWVkcyB0byB0YWtlIHRoZSBvcHRpb25zIHZpZXcgaW50byBhY2NvdW50XG4gICAgLy8gICAgICAgYW5kIGhhbmRsZSBkZXNlcmlhbGl6YXRpb25cbiAgICBjb25zdCBzZXJpYWxpemVkUHJvZmlsZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHByb2ZpbGUgb2YgdGhpcy5zY3JpcHRQcm9maWxlcykgeyBzZXJpYWxpemVkUHJvZmlsZXMucHVzaChwcm9maWxlLnRvT2JqZWN0KCkpOyB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc2NyaXB0Vmlld1N0YXRlOiB0aGlzLnNjcmlwdFZpZXcuc2VyaWFsaXplKCksXG4gICAgICBzY3JpcHRPcHRpb25zVmlld1N0YXRlOiB0aGlzLnNjcmlwdE9wdGlvbnNWaWV3LnNlcmlhbGl6ZSgpLFxuICAgICAgcHJvZmlsZXM6IHNlcmlhbGl6ZWRQcm9maWxlcyxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==