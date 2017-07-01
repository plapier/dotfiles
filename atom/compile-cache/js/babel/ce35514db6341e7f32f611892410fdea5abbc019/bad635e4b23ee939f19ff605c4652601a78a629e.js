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
      title: 'Default Current Working Directory (CWD) Behavior',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9zY3JpcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVvQyxNQUFNOztrQ0FFWCx3QkFBd0I7Ozs7NEJBQzlCLGlCQUFpQjs7OztzQkFDdkIsVUFBVTs7Ozt1QkFDVCxXQUFXOzs7OzZCQUNMLGtCQUFrQjs7OztpQ0FDZCx1QkFBdUI7Ozs7b0NBQ3BCLDJCQUEyQjs7OzswQkFDckMsZUFBZTs7OzttQ0FDTix5QkFBeUI7Ozs7QUFaekQsV0FBVyxDQUFDOztxQkFjRztBQUNiLFFBQU0sRUFBRTtBQUNOLGtCQUFjLEVBQUU7QUFDZCxXQUFLLEVBQUUsK0NBQStDO0FBQ3RELFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsdUJBQW1CLEVBQUU7QUFDbkIsV0FBSyxFQUFFLDRCQUE0QjtBQUNuQyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELG1CQUFlLEVBQUU7QUFDZixXQUFLLEVBQUUseUNBQXlDO0FBQ2hELFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0Qsb0JBQWdCLEVBQUU7QUFDaEIsV0FBSyxFQUFFLG9CQUFvQjtBQUMzQixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELGVBQVcsRUFBRTtBQUNYLFdBQUssRUFBRSwrQkFBK0I7QUFDdEMsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxlQUFXLEVBQUU7QUFDWCxXQUFLLEVBQUUsa0RBQWtEO0FBQ3pELGlCQUFXLEVBQUUsMEVBQTBFO0FBQ3ZGLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMseUJBQXlCO0FBQ2xDLGNBQU0sQ0FDSix5QkFBeUIsRUFDekIsaUNBQWlDLEVBQ2pDLHlCQUF5QixDQUMxQjtLQUNGO0dBQ0Y7Ozs7Ozs7O0FBUUQsWUFBVSxFQUFFLElBQUk7QUFDaEIs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LGdDQUFtQixDQUFDLENBQUM7QUFDL0MsUUFBTSxrQkFBa0IsR0FBRyxxQ0FBd0IsQ0FBQzs7QUFFcEQsV0FBTyx5QkFBWSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDcEQ7O0FBRUQsV0FBUyxFQUFBLHFCQUFHOzs7QUFHVixRQUFNLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztBQUM5QixTQUFLLElBQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFBRSx3QkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7S0FBRTs7QUFFM0YsV0FBTztBQUNMLHFCQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUU7QUFDNUMsNEJBQXNCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRTtBQUMxRCxjQUFRLEVBQUUsa0JBQWtCO0tBQzdCLENBQUM7R0FDSDtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9zY3JpcHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQgQ29kZUNvbnRleHRCdWlsZGVyIGZyb20gJy4vY29kZS1jb250ZXh0LWJ1aWxkZXInO1xuaW1wb3J0IEdyYW1tYXJVdGlscyBmcm9tICcuL2dyYW1tYXItdXRpbHMnO1xuaW1wb3J0IFJ1bm5lciBmcm9tICcuL3J1bm5lcic7XG5pbXBvcnQgUnVudGltZSBmcm9tICcuL3J1bnRpbWUnO1xuaW1wb3J0IFNjcmlwdE9wdGlvbnMgZnJvbSAnLi9zY3JpcHQtb3B0aW9ucyc7XG5pbXBvcnQgU2NyaXB0T3B0aW9uc1ZpZXcgZnJvbSAnLi9zY3JpcHQtb3B0aW9ucy12aWV3JztcbmltcG9ydCBTY3JpcHRQcm9maWxlUnVuVmlldyBmcm9tICcuL3NjcmlwdC1wcm9maWxlLXJ1bi12aWV3JztcbmltcG9ydCBTY3JpcHRWaWV3IGZyb20gJy4vc2NyaXB0LXZpZXcnO1xuaW1wb3J0IFZpZXdSdW50aW1lT2JzZXJ2ZXIgZnJvbSAnLi92aWV3LXJ1bnRpbWUtb2JzZXJ2ZXInO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNvbmZpZzoge1xuICAgIGVuYWJsZUV4ZWNUaW1lOiB7XG4gICAgICB0aXRsZTogJ091dHB1dCB0aGUgdGltZSBpdCB0b29rIHRvIGV4ZWN1dGUgdGhlIHNjcmlwdCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgZXNjYXBlQ29uc29sZU91dHB1dDoge1xuICAgICAgdGl0bGU6ICdIVE1MIGVzY2FwZSBjb25zb2xlIG91dHB1dCcsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgaWdub3JlU2VsZWN0aW9uOiB7XG4gICAgICB0aXRsZTogJ0lnbm9yZSBzZWxlY3Rpb24gKGZpbGUtYmFzZWQgcnVucyBvbmx5KScsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIHNjcm9sbFdpdGhPdXRwdXQ6IHtcbiAgICAgIHRpdGxlOiAnU2Nyb2xsIHdpdGggb3V0cHV0JyxcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBzdG9wT25SZXJ1bjoge1xuICAgICAgdGl0bGU6ICdTdG9wIHJ1bm5pbmcgcHJvY2VzcyBvbiByZXJ1bicsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICAgIGN3ZEJlaGF2aW9yOiB7XG4gICAgICB0aXRsZTogJ0RlZmF1bHQgQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeSAoQ1dEKSBCZWhhdmlvcicsXG4gICAgICBkZXNjcmlwdGlvbjogJ0lmIG5vIFJ1biBPcHRpb25zIGFyZSBzZXQsIHRoaXMgc2V0dGluZyBkZWNpZGVzIGhvdyB0byBkZXRlcm1pbmUgdGhlIENXRCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICdGaXJzdCBwcm9qZWN0IGRpcmVjdG9yeScsXG4gICAgICBlbnVtOiBbXG4gICAgICAgICdGaXJzdCBwcm9qZWN0IGRpcmVjdG9yeScsXG4gICAgICAgICdQcm9qZWN0IGRpcmVjdG9yeSBvZiB0aGUgc2NyaXB0JyxcbiAgICAgICAgJ0RpcmVjdG9yeSBvZiB0aGUgc2NyaXB0JyxcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbiAgLy8gRm9yIHNvbWUgcmVhc29uLCB0aGUgdGV4dCBvZiB0aGVzZSBvcHRpb25zIGRvZXMgbm90IHNob3cgaW4gcGFja2FnZSBzZXR0aW5ncyB2aWV3XG4gIC8vIGRlZmF1bHQ6ICdmaXJzdFByb2onXG4gIC8vIGVudW06IFtcbiAgLy8gICB7dmFsdWU6ICdmaXJzdFByb2onLCBkZXNjcmlwdGlvbjogJ0ZpcnN0IHByb2plY3QgZGlyZWN0b3J5IChpZiB0aGVyZSBpcyBvbmUpJ31cbiAgLy8gICB7dmFsdWU6ICdzY3JpcHRQcm9qJywgZGVzY3JpcHRpb246ICdQcm9qZWN0IGRpcmVjdG9yeSBvZiB0aGUgc2NyaXB0IChpZiB0aGVyZSBpcyBvbmUpJ31cbiAgLy8gICB7dmFsdWU6ICdzY3JpcHREaXInLCBkZXNjcmlwdGlvbjogJ0RpcmVjdG9yeSBvZiB0aGUgc2NyaXB0J31cbiAgLy8gXVxuICBzY3JpcHRWaWV3OiBudWxsLFxuICBzY3JpcHRPcHRpb25zVmlldzogbnVsbCxcbiAgc2NyaXB0UHJvZmlsZVJ1blZpZXc6IG51bGwsXG4gIHNjcmlwdE9wdGlvbnM6IG51bGwsXG4gIHNjcmlwdFByb2ZpbGVzOiBbXSxcblxuICBhY3RpdmF0ZShzdGF0ZSkge1xuICAgIHRoaXMuc2NyaXB0VmlldyA9IG5ldyBTY3JpcHRWaWV3KHN0YXRlLnNjcmlwdFZpZXdTdGF0ZSk7XG4gICAgdGhpcy5zY3JpcHRPcHRpb25zID0gbmV3IFNjcmlwdE9wdGlvbnMoKTtcbiAgICB0aGlzLnNjcmlwdE9wdGlvbnNWaWV3ID0gbmV3IFNjcmlwdE9wdGlvbnNWaWV3KHRoaXMuc2NyaXB0T3B0aW9ucyk7XG5cbiAgICAvLyBwcm9maWxlcyBsb2FkaW5nXG4gICAgdGhpcy5zY3JpcHRQcm9maWxlcyA9IFtdO1xuICAgIGlmIChzdGF0ZS5wcm9maWxlcykge1xuICAgICAgZm9yIChjb25zdCBwcm9maWxlIG9mIHN0YXRlLnByb2ZpbGVzKSB7XG4gICAgICAgIGNvbnN0IHNvID0gU2NyaXB0T3B0aW9ucy5jcmVhdGVGcm9tT3B0aW9ucyhwcm9maWxlLm5hbWUsIHByb2ZpbGUpO1xuICAgICAgICB0aGlzLnNjcmlwdFByb2ZpbGVzLnB1c2goc28pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcgPSBuZXcgU2NyaXB0UHJvZmlsZVJ1blZpZXcodGhpcy5zY3JpcHRQcm9maWxlcyk7XG5cbiAgICBjb25zdCBjb2RlQ29udGV4dEJ1aWxkZXIgPSBuZXcgQ29kZUNvbnRleHRCdWlsZGVyKCk7XG4gICAgY29uc3QgcnVubmVyID0gbmV3IFJ1bm5lcih0aGlzLnNjcmlwdE9wdGlvbnMpO1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgVmlld1J1bnRpbWVPYnNlcnZlcih0aGlzLnNjcmlwdFZpZXcpO1xuXG4gICAgdGhpcy5ydW50aW1lID0gbmV3IFJ1bnRpbWUocnVubmVyLCBjb2RlQ29udGV4dEJ1aWxkZXIsIFtvYnNlcnZlcl0pO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdjb3JlOmNhbmNlbCc6ICgpID0+IHRoaXMuY2xvc2VTY3JpcHRWaWV3QW5kU3RvcFJ1bm5lcigpLFxuICAgICAgJ2NvcmU6Y2xvc2UnOiAoKSA9PiB0aGlzLmNsb3NlU2NyaXB0Vmlld0FuZFN0b3BSdW5uZXIoKSxcbiAgICAgICdzY3JpcHQ6Y2xvc2Utdmlldyc6ICgpID0+IHRoaXMuY2xvc2VTY3JpcHRWaWV3QW5kU3RvcFJ1bm5lcigpLFxuICAgICAgJ3NjcmlwdDpjb3B5LXJ1bi1yZXN1bHRzJzogKCkgPT4gdGhpcy5zY3JpcHRWaWV3LmNvcHlSZXN1bHRzKCksXG4gICAgICAnc2NyaXB0OmtpbGwtcHJvY2Vzcyc6ICgpID0+IHRoaXMucnVudGltZS5zdG9wKCksXG4gICAgICAnc2NyaXB0OnJ1bi1ieS1saW5lLW51bWJlcic6ICgpID0+IHRoaXMucnVudGltZS5leGVjdXRlKCdMaW5lIE51bWJlciBCYXNlZCcpLFxuICAgICAgJ3NjcmlwdDpydW4nOiAoKSA9PiB0aGlzLnJ1bnRpbWUuZXhlY3V0ZSgnU2VsZWN0aW9uIEJhc2VkJyksXG4gICAgfSkpO1xuXG4gICAgLy8gcHJvZmlsZSBjcmVhdGVkXG4gICAgdGhpcy5zY3JpcHRPcHRpb25zVmlldy5vblByb2ZpbGVTYXZlKChwcm9maWxlRGF0YSkgPT4ge1xuICAgICAgLy8gY3JlYXRlIGFuZCBmaWxsIG91dCBwcm9maWxlXG4gICAgICBjb25zdCBwcm9maWxlID0gU2NyaXB0T3B0aW9ucy5jcmVhdGVGcm9tT3B0aW9ucyhwcm9maWxlRGF0YS5uYW1lLCBwcm9maWxlRGF0YS5vcHRpb25zKTtcblxuICAgICAgY29uc3QgY29kZUNvbnRleHQgPSB0aGlzLnJ1bnRpbWUuY29kZUNvbnRleHRCdWlsZGVyLmJ1aWxkQ29kZUNvbnRleHQoXG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSwgJ1NlbGVjdGlvbiBCYXNlZCcpO1xuICAgICAgcHJvZmlsZS5sYW5nID0gY29kZUNvbnRleHQubGFuZztcblxuICAgICAgLy8gZm9ybWF0dGluZyBkZXNjcmlwdGlvblxuICAgICAgY29uc3Qgb3B0cyA9IHByb2ZpbGUudG9PYmplY3QoKTtcbiAgICAgIGxldCBkZXNjID0gYExhbmd1YWdlOiAke2NvZGVDb250ZXh0Lmxhbmd9YDtcbiAgICAgIGlmIChvcHRzLmNtZCkgeyBkZXNjICs9IGAsIENvbW1hbmQ6ICR7b3B0cy5jbWR9YDsgfVxuICAgICAgaWYgKG9wdHMuY21kQXJncyAmJiBvcHRzLmNtZCkgeyBkZXNjICs9IGAgJHtvcHRzLmNtZEFyZ3Muam9pbignICcpfWA7IH1cblxuICAgICAgcHJvZmlsZS5kZXNjcmlwdGlvbiA9IGRlc2M7XG4gICAgICB0aGlzLnNjcmlwdFByb2ZpbGVzLnB1c2gocHJvZmlsZSk7XG5cbiAgICAgIHRoaXMuc2NyaXB0T3B0aW9uc1ZpZXcuaGlkZSgpO1xuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5zaG93KCk7XG4gICAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3LnNldFByb2ZpbGVzKHRoaXMuc2NyaXB0UHJvZmlsZXMpO1xuICAgIH0pO1xuXG4gICAgLy8gcHJvZmlsZSBkZWxldGVkXG4gICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5vblByb2ZpbGVEZWxldGUoKHByb2ZpbGUpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zY3JpcHRQcm9maWxlcy5pbmRleE9mKHByb2ZpbGUpO1xuICAgICAgaWYgKGluZGV4ID09PSAtMSkgeyByZXR1cm47IH1cblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkgeyB0aGlzLnNjcmlwdFByb2ZpbGVzLnNwbGljZShpbmRleCwgMSk7IH1cbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuc2V0UHJvZmlsZXModGhpcy5zY3JpcHRQcm9maWxlcyk7XG4gICAgfSk7XG5cbiAgICAvLyBwcm9maWxlIHJlbmFtZWRcbiAgICB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3Lm9uUHJvZmlsZUNoYW5nZSgoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnNjcmlwdFByb2ZpbGVzLmluZGV4T2YoZGF0YS5wcm9maWxlKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEgfHwgIXRoaXMuc2NyaXB0UHJvZmlsZXNbaW5kZXhdW2RhdGEua2V5XSkgeyByZXR1cm47IH1cblxuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlc1tpbmRleF1bZGF0YS5rZXldID0gZGF0YS52YWx1ZTtcbiAgICAgIHRoaXMuc2NyaXB0UHJvZmlsZVJ1blZpZXcuc2hvdygpO1xuICAgICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5zZXRQcm9maWxlcyh0aGlzLnNjcmlwdFByb2ZpbGVzKTtcbiAgICB9KTtcblxuICAgIC8vIHByb2ZpbGUgcmVuYW1lZFxuICAgIHJldHVybiB0aGlzLnNjcmlwdFByb2ZpbGVSdW5WaWV3Lm9uUHJvZmlsZVJ1bigocHJvZmlsZSkgPT4ge1xuICAgICAgaWYgKCFwcm9maWxlKSB7IHJldHVybjsgfVxuICAgICAgdGhpcy5ydW50aW1lLmV4ZWN1dGUoJ1NlbGVjdGlvbiBCYXNlZCcsIG51bGwsIHByb2ZpbGUpO1xuICAgIH0pO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5ydW50aW1lLmRlc3Ryb3koKTtcbiAgICB0aGlzLnNjcmlwdFZpZXcucmVtb3ZlUGFuZWwoKTtcbiAgICB0aGlzLnNjcmlwdE9wdGlvbnNWaWV3LmNsb3NlKCk7XG4gICAgdGhpcy5zY3JpcHRQcm9maWxlUnVuVmlldy5jbG9zZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgR3JhbW1hclV0aWxzLmRlbGV0ZVRlbXBGaWxlcygpO1xuICB9LFxuXG4gIGNsb3NlU2NyaXB0Vmlld0FuZFN0b3BSdW5uZXIoKSB7XG4gICAgdGhpcy5ydW50aW1lLnN0b3AoKTtcbiAgICB0aGlzLnNjcmlwdFZpZXcucmVtb3ZlUGFuZWwoKTtcbiAgfSxcblxuICAvLyBQdWJsaWNcbiAgLy9cbiAgLy8gU2VydmljZSBtZXRob2QgdGhhdCBwcm92aWRlcyB0aGUgZGVmYXVsdCBydW50aW1lIHRoYXQncyBjb25maWd1cmFibGUgdGhyb3VnaCBBdG9tIGVkaXRvclxuICAvLyBVc2UgdGhpcyBzZXJ2aWNlIGlmIHlvdSB3YW50IHRvIGRpcmVjdGx5IHNob3cgdGhlIHNjcmlwdCdzIG91dHB1dCBpbiB0aGUgQXRvbSBlZGl0b3JcbiAgLy9cbiAgLy8gKipEbyBub3QgZGVzdHJveSB0aGlzIHtSdW50aW1lfSBpbnN0YW5jZSEqKiBCeSBkb2luZyBzbyB5b3UnbGwgYnJlYWsgdGhpcyBwbHVnaW4hXG4gIC8vXG4gIC8vIEFsc28gbm90ZSB0aGF0IHRoZSBTY3JpcHQgcGFja2FnZSBpc24ndCBhY3RpdmF0ZWQgdW50aWwgeW91IGFjdHVhbGx5IHRyeSB0byB1c2UgaXQuXG4gIC8vIFRoYXQncyB3aHkgdGhpcyBzZXJ2aWNlIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgY29uc3VtZWQuIFRvIGJlIHN1cmUgeW91IGNvbnN1bWUgaXRcbiAgLy8geW91IG1heSBuZWVkIHRvIG1hbnVhbGx5IGFjdGl2YXRlIHRoZSBwYWNrYWdlOlxuICAvL1xuICAvLyBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdzY3JpcHQnKS5hY3RpdmF0ZU5vdygpICMgdGhpcyBjb2RlIGRvZXNuJ3QgaW5jbHVkZSBlcnJvciBoYW5kbGluZyFcbiAgLy9cbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9zMW1wbGV4L0F0b20tU2NyaXB0LVJ1bnRpbWUtQ29uc3VtZXItU2FtcGxlIGZvciBhIGZ1bGwgZXhhbXBsZVxuICBwcm92aWRlRGVmYXVsdFJ1bnRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMucnVudGltZTtcbiAgfSxcblxuICAvLyBQdWJsaWNcbiAgLy9cbiAgLy8gU2VydmljZSBtZXRob2QgdGhhdCBwcm92aWRlcyBhIGJsYW5rIHJ1bnRpbWUuIFlvdSBhcmUgZnJlZSB0byBjb25maWd1cmUgYW55IGFzcGVjdCBvZiBpdDpcbiAgLy8gKiBBZGQgb2JzZXJ2ZXIgKGBydW50aW1lLmFkZE9ic2VydmVyKG9ic2VydmVyKWApIC0gc2VlIHtWaWV3UnVudGltZU9ic2VydmVyfSBmb3IgYW4gZXhhbXBsZVxuICAvLyAqIGNvbmZpZ3VyZSBzY3JpcHQgb3B0aW9ucyAoYHJ1bnRpbWUuc2NyaXB0T3B0aW9uc2ApXG4gIC8vXG4gIC8vIEluIGNvbnRyYXN0IHRvIGBwcm92aWRlRGVmYXVsdFJ1bnRpbWVgIHlvdSBzaG91bGQgZGlzcG9zZSB0aGlzIHtSdW50aW1lfSB3aGVuXG4gIC8vIHlvdSBubyBsb25nZXIgbmVlZCBpdC5cbiAgLy9cbiAgLy8gQWxzbyBub3RlIHRoYXQgdGhlIFNjcmlwdCBwYWNrYWdlIGlzbid0IGFjdGl2YXRlZCB1bnRpbCB5b3UgYWN0dWFsbHkgdHJ5IHRvIHVzZSBpdC5cbiAgLy8gVGhhdCdzIHdoeSB0aGlzIHNlcnZpY2Ugd29uJ3QgYmUgYXV0b21hdGljYWxseSBjb25zdW1lZC4gVG8gYmUgc3VyZSB5b3UgY29uc3VtZSBpdFxuICAvLyB5b3UgbWF5IG5lZWQgdG8gbWFudWFsbHkgYWN0aXZhdGUgdGhlIHBhY2thZ2U6XG4gIC8vXG4gIC8vIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ3NjcmlwdCcpLmFjdGl2YXRlTm93KCkgIyB0aGlzIGNvZGUgZG9lc24ndCBpbmNsdWRlIGVycm9yIGhhbmRsaW5nIVxuICAvL1xuICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3MxbXBsZXgvQXRvbS1TY3JpcHQtUnVudGltZS1Db25zdW1lci1TYW1wbGUgZm9yIGEgZnVsbCBleGFtcGxlXG4gIHByb3ZpZGVCbGFua1J1bnRpbWUoKSB7XG4gICAgY29uc3QgcnVubmVyID0gbmV3IFJ1bm5lcihuZXcgU2NyaXB0T3B0aW9ucygpKTtcbiAgICBjb25zdCBjb2RlQ29udGV4dEJ1aWxkZXIgPSBuZXcgQ29kZUNvbnRleHRCdWlsZGVyKCk7XG5cbiAgICByZXR1cm4gbmV3IFJ1bnRpbWUocnVubmVyLCBjb2RlQ29udGV4dEJ1aWxkZXIsIFtdKTtcbiAgfSxcblxuICBzZXJpYWxpemUoKSB7XG4gICAgLy8gVE9ETzogVHJ1ZSBzZXJpYWxpemF0aW9uIG5lZWRzIHRvIHRha2UgdGhlIG9wdGlvbnMgdmlldyBpbnRvIGFjY291bnRcbiAgICAvLyAgICAgICBhbmQgaGFuZGxlIGRlc2VyaWFsaXphdGlvblxuICAgIGNvbnN0IHNlcmlhbGl6ZWRQcm9maWxlcyA9IFtdO1xuICAgIGZvciAoY29uc3QgcHJvZmlsZSBvZiB0aGlzLnNjcmlwdFByb2ZpbGVzKSB7IHNlcmlhbGl6ZWRQcm9maWxlcy5wdXNoKHByb2ZpbGUudG9PYmplY3QoKSk7IH1cblxuICAgIHJldHVybiB7XG4gICAgICBzY3JpcHRWaWV3U3RhdGU6IHRoaXMuc2NyaXB0Vmlldy5zZXJpYWxpemUoKSxcbiAgICAgIHNjcmlwdE9wdGlvbnNWaWV3U3RhdGU6IHRoaXMuc2NyaXB0T3B0aW9uc1ZpZXcuc2VyaWFsaXplKCksXG4gICAgICBwcm9maWxlczogc2VyaWFsaXplZFByb2ZpbGVzLFxuICAgIH07XG4gIH0sXG59O1xuIl19