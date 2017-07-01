Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _commandContext = require('./command-context');

var _commandContext2 = _interopRequireDefault(_commandContext);

'use babel';

var Runtime = (function () {
  // Public: Initializes a new {Runtime} instance
  //
  // This class is responsible for properly configuring {Runner}

  function Runtime(runner, codeContextBuilder) {
    var _this = this;

    var observers = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    _classCallCheck(this, Runtime);

    this.runner = runner;
    this.codeContextBuilder = codeContextBuilder;
    this.observers = observers;
    this.emitter = new _atom.Emitter();
    this.scriptOptions = this.runner.scriptOptions;
    _underscore2['default'].each(this.observers, function (observer) {
      return observer.observe(_this);
    });
  }

  // Public: Adds a new observer and asks it to listen for {Runner} events
  //
  // An observer should have two methods:
  // * `observe(runtime)` - in which you can subscribe to {Runtime} events
  // (see {ViewRuntimeObserver} for what you are expected to handle)
  // * `destroy` - where you can do your cleanup

  _createClass(Runtime, [{
    key: 'addObserver',
    value: function addObserver(observer) {
      this.observers.push(observer);
      observer.observe(this);
    }

    // Public: disposes dependencies
    //
    // This should be called when you no longer need to use this class
  }, {
    key: 'destroy',
    value: function destroy() {
      this.stop();
      this.runner.destroy();
      _underscore2['default'].each(this.observers, function (observer) {
        return observer.destroy();
      });
      this.emitter.dispose();
      this.codeContextBuilder.destroy();
    }

    // Public: Executes code
    //
    // argType (Optional) - {String} One of the three:
    // * "Selection Based" (default)
    // * "Line Number Based"
    // * "File Based"
    // input (Optional) - {String} that'll be provided to the `stdin` of the new process
  }, {
    key: 'execute',
    value: function execute() {
      var argType = arguments.length <= 0 || arguments[0] === undefined ? 'Selection Based' : arguments[0];
      var input = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
      var options = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      if (atom.config.get('script.stopOnRerun')) this.stop();
      this.emitter.emit('start');

      var codeContext = this.codeContextBuilder.buildCodeContext(atom.workspace.getActiveTextEditor(), argType);

      // In the future we could handle a runner without the language being part
      // of the grammar map, using the options runner
      if (!codeContext || !codeContext.lang) return;

      var executionOptions = !options ? this.scriptOptions : options;
      var commandContext = _commandContext2['default'].build(this, executionOptions, codeContext);

      if (!commandContext) return;

      if (commandContext.workingDirectory) {
        executionOptions.workingDirectory = commandContext.workingDirectory;
      }

      this.emitter.emit('did-context-create', {
        lang: codeContext.lang,
        filename: codeContext.filename,
        lineNumber: codeContext.lineNumber
      });

      this.runner.scriptOptions = executionOptions;
      this.runner.run(commandContext.command, commandContext.args, codeContext, input);
      this.emitter.emit('started', commandContext);
    }

    // Public: stops execution of the current fork
  }, {
    key: 'stop',
    value: function stop() {
      this.emitter.emit('stop');
      this.runner.stop();
      this.emitter.emit('stopped');
    }

    // Public: Dispatched when the execution is starting
  }, {
    key: 'onStart',
    value: function onStart(callback) {
      return this.emitter.on('start', callback);
    }

    // Public: Dispatched when the execution is started
  }, {
    key: 'onStarted',
    value: function onStarted(callback) {
      return this.emitter.on('started', callback);
    }

    // Public: Dispatched when the execution is stopping
  }, {
    key: 'onStop',
    value: function onStop(callback) {
      return this.emitter.on('stop', callback);
    }

    // Public: Dispatched when the execution is stopped
  }, {
    key: 'onStopped',
    value: function onStopped(callback) {
      return this.emitter.on('stopped', callback);
    }

    // Public: Dispatched when the language is not specified
  }, {
    key: 'onDidNotSpecifyLanguage',
    value: function onDidNotSpecifyLanguage(callback) {
      return this.codeContextBuilder.onDidNotSpecifyLanguage(callback);
    }

    // Public: Dispatched when the language is not supported
    // lang  - {String} with the language name
  }, {
    key: 'onDidNotSupportLanguage',
    value: function onDidNotSupportLanguage(callback) {
      return this.codeContextBuilder.onDidNotSupportLanguage(callback);
    }

    // Public: Dispatched when the mode is not supported
    // lang  - {String} with the language name
    // argType  - {String} with the run mode specified
  }, {
    key: 'onDidNotSupportMode',
    value: function onDidNotSupportMode(callback) {
      return this.emitter.on('did-not-support-mode', callback);
    }

    // Public: Dispatched when building run arguments resulted in an error
    // error - {Error}
  }, {
    key: 'onDidNotBuildArgs',
    value: function onDidNotBuildArgs(callback) {
      return this.emitter.on('did-not-build-args', callback);
    }

    // Public: Dispatched when the {CodeContext} is successfully created
    // lang  - {String} with the language name
    // filename  - {String} with the filename
    // lineNumber  - {Number} with the line number (may be null)
  }, {
    key: 'onDidContextCreate',
    value: function onDidContextCreate(callback) {
      return this.emitter.on('did-context-create', callback);
    }

    // Public: Dispatched when the process you run writes something to stdout
    // message - {String} with the output
  }, {
    key: 'onDidWriteToStdout',
    value: function onDidWriteToStdout(callback) {
      return this.runner.onDidWriteToStdout(callback);
    }

    // Public: Dispatched when the process you run writes something to stderr
    // message - {String} with the output
  }, {
    key: 'onDidWriteToStderr',
    value: function onDidWriteToStderr(callback) {
      return this.runner.onDidWriteToStderr(callback);
    }

    // Public: Dispatched when the process you run exits
    // returnCode  - {Number} with the process' exit code
    // executionTime  - {Number} with the process' exit code
  }, {
    key: 'onDidExit',
    value: function onDidExit(callback) {
      return this.runner.onDidExit(callback);
    }

    // Public: Dispatched when the code you run did not manage to run
    // command - {String} with the run command
  }, {
    key: 'onDidNotRun',
    value: function onDidNotRun(callback) {
      return this.runner.onDidNotRun(callback);
    }
  }, {
    key: 'modeNotSupported',
    value: function modeNotSupported(argType, lang) {
      this.emitter.emit('did-not-support-mode', { argType: argType, lang: lang });
    }
  }, {
    key: 'didNotBuildArgs',
    value: function didNotBuildArgs(error) {
      this.emitter.emit('did-not-build-args', { error: error });
    }
  }]);

  return Runtime;
})();

exports['default'] = Runtime;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvcnVudGltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUV3QixNQUFNOzswQkFFaEIsWUFBWTs7Ozs4QkFFQyxtQkFBbUI7Ozs7QUFOOUMsV0FBVyxDQUFDOztJQVFTLE9BQU87Ozs7O0FBSWYsV0FKUSxPQUFPLENBSWQsTUFBTSxFQUFFLGtCQUFrQixFQUFrQjs7O1FBQWhCLFNBQVMseURBQUcsRUFBRTs7MEJBSm5DLE9BQU87O0FBS3hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztBQUM3QyxRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUMzQixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUM7QUFDN0IsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUMvQyw0QkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFBLFFBQVE7YUFBSSxRQUFRLENBQUMsT0FBTyxPQUFNO0tBQUEsQ0FBQyxDQUFDO0dBQzVEOzs7Ozs7Ozs7ZUFYa0IsT0FBTzs7V0FtQmYscUJBQUMsUUFBUSxFQUFFO0FBQ3BCLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlCLGNBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDeEI7Ozs7Ozs7V0FLTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNaLFVBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdEIsOEJBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBQSxRQUFRO2VBQUksUUFBUSxDQUFDLE9BQU8s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QUssRUFBRTtBQUNyQixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEtBQUssRUFBTCxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3BEOzs7U0FuS2tCLE9BQU87OztxQkFBUCxPQUFPIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvcnVudGltZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBFbWl0dGVyIH0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnO1xuXG5pbXBvcnQgQ29tbWFuZENvbnRleHQgZnJvbSAnLi9jb21tYW5kLWNvbnRleHQnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSdW50aW1lIHtcbiAgLy8gUHVibGljOiBJbml0aWFsaXplcyBhIG5ldyB7UnVudGltZX0gaW5zdGFuY2VcbiAgLy9cbiAgLy8gVGhpcyBjbGFzcyBpcyByZXNwb25zaWJsZSBmb3IgcHJvcGVybHkgY29uZmlndXJpbmcge1J1bm5lcn1cbiAgY29uc3RydWN0b3IocnVubmVyLCBjb2RlQ29udGV4dEJ1aWxkZXIsIG9ic2VydmVycyA9IFtdKSB7XG4gICAgdGhpcy5ydW5uZXIgPSBydW5uZXI7XG4gICAgdGhpcy5jb2RlQ29udGV4dEJ1aWxkZXIgPSBjb2RlQ29udGV4dEJ1aWxkZXI7XG4gICAgdGhpcy5vYnNlcnZlcnMgPSBvYnNlcnZlcnM7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLnNjcmlwdE9wdGlvbnMgPSB0aGlzLnJ1bm5lci5zY3JpcHRPcHRpb25zO1xuICAgIF8uZWFjaCh0aGlzLm9ic2VydmVycywgb2JzZXJ2ZXIgPT4gb2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzKSk7XG4gIH1cblxuICAvLyBQdWJsaWM6IEFkZHMgYSBuZXcgb2JzZXJ2ZXIgYW5kIGFza3MgaXQgdG8gbGlzdGVuIGZvciB7UnVubmVyfSBldmVudHNcbiAgLy9cbiAgLy8gQW4gb2JzZXJ2ZXIgc2hvdWxkIGhhdmUgdHdvIG1ldGhvZHM6XG4gIC8vICogYG9ic2VydmUocnVudGltZSlgIC0gaW4gd2hpY2ggeW91IGNhbiBzdWJzY3JpYmUgdG8ge1J1bnRpbWV9IGV2ZW50c1xuICAvLyAoc2VlIHtWaWV3UnVudGltZU9ic2VydmVyfSBmb3Igd2hhdCB5b3UgYXJlIGV4cGVjdGVkIHRvIGhhbmRsZSlcbiAgLy8gKiBgZGVzdHJveWAgLSB3aGVyZSB5b3UgY2FuIGRvIHlvdXIgY2xlYW51cFxuICBhZGRPYnNlcnZlcihvYnNlcnZlcikge1xuICAgIHRoaXMub2JzZXJ2ZXJzLnB1c2gob2JzZXJ2ZXIpO1xuICAgIG9ic2VydmVyLm9ic2VydmUodGhpcyk7XG4gIH1cblxuICAvLyBQdWJsaWM6IGRpc3Bvc2VzIGRlcGVuZGVuY2llc1xuICAvL1xuICAvLyBUaGlzIHNob3VsZCBiZSBjYWxsZWQgd2hlbiB5b3Ugbm8gbG9uZ2VyIG5lZWQgdG8gdXNlIHRoaXMgY2xhc3NcbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLnJ1bm5lci5kZXN0cm95KCk7XG4gICAgXy5lYWNoKHRoaXMub2JzZXJ2ZXJzLCBvYnNlcnZlciA9PiBvYnNlcnZlci5kZXN0cm95KCkpO1xuICAgIHRoaXMuZW1pdHRlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5jb2RlQ29udGV4dEJ1aWxkZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgLy8gUHVibGljOiBFeGVjdXRlcyBjb2RlXG4gIC8vXG4gIC8vIGFyZ1R5cGUgKE9wdGlvbmFsKSAtIHtTdHJpbmd9IE9uZSBvZiB0aGUgdGhyZWU6XG4gIC8vICogXCJTZWxlY3Rpb24gQmFzZWRcIiAoZGVmYXVsdClcbiAgLy8gKiBcIkxpbmUgTnVtYmVyIEJhc2VkXCJcbiAgLy8gKiBcIkZpbGUgQmFzZWRcIlxuICAvLyBpbnB1dCAoT3B0aW9uYWwpIC0ge1N0cmluZ30gdGhhdCdsbCBiZSBwcm92aWRlZCB0byB0aGUgYHN0ZGluYCBvZiB0aGUgbmV3IHByb2Nlc3NcbiAgZXhlY3V0ZShhcmdUeXBlID0gJ1NlbGVjdGlvbiBCYXNlZCcsIGlucHV0ID0gbnVsbCwgb3B0aW9ucyA9IG51bGwpIHtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdzY3JpcHQuc3RvcE9uUmVydW4nKSkgdGhpcy5zdG9wKCk7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3N0YXJ0Jyk7XG5cbiAgICBjb25zdCBjb2RlQ29udGV4dCA9IHRoaXMuY29kZUNvbnRleHRCdWlsZGVyLmJ1aWxkQ29kZUNvbnRleHQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCksIGFyZ1R5cGUpO1xuXG4gICAgLy8gSW4gdGhlIGZ1dHVyZSB3ZSBjb3VsZCBoYW5kbGUgYSBydW5uZXIgd2l0aG91dCB0aGUgbGFuZ3VhZ2UgYmVpbmcgcGFydFxuICAgIC8vIG9mIHRoZSBncmFtbWFyIG1hcCwgdXNpbmcgdGhlIG9wdGlvbnMgcnVubmVyXG4gICAgaWYgKCFjb2RlQ29udGV4dCB8fCAhY29kZUNvbnRleHQubGFuZykgcmV0dXJuO1xuXG4gICAgY29uc3QgZXhlY3V0aW9uT3B0aW9ucyA9ICFvcHRpb25zID8gdGhpcy5zY3JpcHRPcHRpb25zIDogb3B0aW9ucztcbiAgICBjb25zdCBjb21tYW5kQ29udGV4dCA9IENvbW1hbmRDb250ZXh0LmJ1aWxkKHRoaXMsIGV4ZWN1dGlvbk9wdGlvbnMsIGNvZGVDb250ZXh0KTtcblxuICAgIGlmICghY29tbWFuZENvbnRleHQpIHJldHVybjtcblxuICAgIGlmIChjb21tYW5kQ29udGV4dC53b3JraW5nRGlyZWN0b3J5KSB7XG4gICAgICBleGVjdXRpb25PcHRpb25zLndvcmtpbmdEaXJlY3RvcnkgPSBjb21tYW5kQ29udGV4dC53b3JraW5nRGlyZWN0b3J5O1xuICAgIH1cblxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY29udGV4dC1jcmVhdGUnLCB7XG4gICAgICBsYW5nOiBjb2RlQ29udGV4dC5sYW5nLFxuICAgICAgZmlsZW5hbWU6IGNvZGVDb250ZXh0LmZpbGVuYW1lLFxuICAgICAgbGluZU51bWJlcjogY29kZUNvbnRleHQubGluZU51bWJlcixcbiAgICB9KTtcblxuICAgIHRoaXMucnVubmVyLnNjcmlwdE9wdGlvbnMgPSBleGVjdXRpb25PcHRpb25zO1xuICAgIHRoaXMucnVubmVyLnJ1bihjb21tYW5kQ29udGV4dC5jb21tYW5kLCBjb21tYW5kQ29udGV4dC5hcmdzLCBjb2RlQ29udGV4dCwgaW5wdXQpO1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzdGFydGVkJywgY29tbWFuZENvbnRleHQpO1xuICB9XG5cbiAgLy8gUHVibGljOiBzdG9wcyBleGVjdXRpb24gb2YgdGhlIGN1cnJlbnQgZm9ya1xuICBzdG9wKCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzdG9wJyk7XG4gICAgdGhpcy5ydW5uZXIuc3RvcCgpO1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdzdG9wcGVkJyk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiB0aGUgZXhlY3V0aW9uIGlzIHN0YXJ0aW5nXG4gIG9uU3RhcnQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzdGFydCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSBleGVjdXRpb24gaXMgc3RhcnRlZFxuICBvblN0YXJ0ZWQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzdGFydGVkJywgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gUHVibGljOiBEaXNwYXRjaGVkIHdoZW4gdGhlIGV4ZWN1dGlvbiBpcyBzdG9wcGluZ1xuICBvblN0b3AoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzdG9wJywgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gUHVibGljOiBEaXNwYXRjaGVkIHdoZW4gdGhlIGV4ZWN1dGlvbiBpcyBzdG9wcGVkXG4gIG9uU3RvcHBlZChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3N0b3BwZWQnLCBjYWxsYmFjayk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiB0aGUgbGFuZ3VhZ2UgaXMgbm90IHNwZWNpZmllZFxuICBvbkRpZE5vdFNwZWNpZnlMYW5ndWFnZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmNvZGVDb250ZXh0QnVpbGRlci5vbkRpZE5vdFNwZWNpZnlMYW5ndWFnZShjYWxsYmFjayk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiB0aGUgbGFuZ3VhZ2UgaXMgbm90IHN1cHBvcnRlZFxuICAvLyBsYW5nICAtIHtTdHJpbmd9IHdpdGggdGhlIGxhbmd1YWdlIG5hbWVcbiAgb25EaWROb3RTdXBwb3J0TGFuZ3VhZ2UoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5jb2RlQ29udGV4dEJ1aWxkZXIub25EaWROb3RTdXBwb3J0TGFuZ3VhZ2UoY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gUHVibGljOiBEaXNwYXRjaGVkIHdoZW4gdGhlIG1vZGUgaXMgbm90IHN1cHBvcnRlZFxuICAvLyBsYW5nICAtIHtTdHJpbmd9IHdpdGggdGhlIGxhbmd1YWdlIG5hbWVcbiAgLy8gYXJnVHlwZSAgLSB7U3RyaW5nfSB3aXRoIHRoZSBydW4gbW9kZSBzcGVjaWZpZWRcbiAgb25EaWROb3RTdXBwb3J0TW9kZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1ub3Qtc3VwcG9ydC1tb2RlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgLy8gUHVibGljOiBEaXNwYXRjaGVkIHdoZW4gYnVpbGRpbmcgcnVuIGFyZ3VtZW50cyByZXN1bHRlZCBpbiBhbiBlcnJvclxuICAvLyBlcnJvciAtIHtFcnJvcn1cbiAgb25EaWROb3RCdWlsZEFyZ3MoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtbm90LWJ1aWxkLWFyZ3MnLCBjYWxsYmFjayk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiB0aGUge0NvZGVDb250ZXh0fSBpcyBzdWNjZXNzZnVsbHkgY3JlYXRlZFxuICAvLyBsYW5nICAtIHtTdHJpbmd9IHdpdGggdGhlIGxhbmd1YWdlIG5hbWVcbiAgLy8gZmlsZW5hbWUgIC0ge1N0cmluZ30gd2l0aCB0aGUgZmlsZW5hbWVcbiAgLy8gbGluZU51bWJlciAgLSB7TnVtYmVyfSB3aXRoIHRoZSBsaW5lIG51bWJlciAobWF5IGJlIG51bGwpXG4gIG9uRGlkQ29udGV4dENyZWF0ZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jb250ZXh0LWNyZWF0ZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSBwcm9jZXNzIHlvdSBydW4gd3JpdGVzIHNvbWV0aGluZyB0byBzdGRvdXRcbiAgLy8gbWVzc2FnZSAtIHtTdHJpbmd9IHdpdGggdGhlIG91dHB1dFxuICBvbkRpZFdyaXRlVG9TdGRvdXQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uZXIub25EaWRXcml0ZVRvU3Rkb3V0KGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSBwcm9jZXNzIHlvdSBydW4gd3JpdGVzIHNvbWV0aGluZyB0byBzdGRlcnJcbiAgLy8gbWVzc2FnZSAtIHtTdHJpbmd9IHdpdGggdGhlIG91dHB1dFxuICBvbkRpZFdyaXRlVG9TdGRlcnIoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uZXIub25EaWRXcml0ZVRvU3RkZXJyKGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogRGlzcGF0Y2hlZCB3aGVuIHRoZSBwcm9jZXNzIHlvdSBydW4gZXhpdHNcbiAgLy8gcmV0dXJuQ29kZSAgLSB7TnVtYmVyfSB3aXRoIHRoZSBwcm9jZXNzJyBleGl0IGNvZGVcbiAgLy8gZXhlY3V0aW9uVGltZSAgLSB7TnVtYmVyfSB3aXRoIHRoZSBwcm9jZXNzJyBleGl0IGNvZGVcbiAgb25EaWRFeGl0KGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMucnVubmVyLm9uRGlkRXhpdChjYWxsYmFjayk7XG4gIH1cblxuICAvLyBQdWJsaWM6IERpc3BhdGNoZWQgd2hlbiB0aGUgY29kZSB5b3UgcnVuIGRpZCBub3QgbWFuYWdlIHRvIHJ1blxuICAvLyBjb21tYW5kIC0ge1N0cmluZ30gd2l0aCB0aGUgcnVuIGNvbW1hbmRcbiAgb25EaWROb3RSdW4oY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uZXIub25EaWROb3RSdW4oY2FsbGJhY2spO1xuICB9XG5cbiAgbW9kZU5vdFN1cHBvcnRlZChhcmdUeXBlLCBsYW5nKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1ub3Qtc3VwcG9ydC1tb2RlJywgeyBhcmdUeXBlLCBsYW5nIH0pO1xuICB9XG5cbiAgZGlkTm90QnVpbGRBcmdzKGVycm9yKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1ub3QtYnVpbGQtYXJncycsIHsgZXJyb3IgfSk7XG4gIH1cbn1cbiJdfQ==