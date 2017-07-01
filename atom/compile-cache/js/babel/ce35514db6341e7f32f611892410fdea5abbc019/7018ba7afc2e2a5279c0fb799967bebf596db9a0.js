Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

var Runner = (function () {

  // Public: Creates a Runner instance
  //
  // * `scriptOptions` a {ScriptOptions} object instance
  // * `emitter` Atom's {Emitter} instance. You probably don't need to overwrite it

  function Runner(scriptOptions) {
    _classCallCheck(this, Runner);

    this.bufferedProcess = null;
    this.stdoutFunc = this.stdoutFunc.bind(this);
    this.stderrFunc = this.stderrFunc.bind(this);
    this.onExit = this.onExit.bind(this);
    this.createOnErrorFunc = this.createOnErrorFunc.bind(this);
    this.scriptOptions = scriptOptions;
    this.emitter = new _atom.Emitter();
  }

  _createClass(Runner, [{
    key: 'run',
    value: function run(command, extraArgs, codeContext) {
      var inputString = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

      this.startTime = new Date();

      var args = this.args(codeContext, extraArgs);
      var options = this.options();
      var stdout = this.stdoutFunc;
      var stderr = this.stderrFunc;
      var exit = this.onExit;

      this.bufferedProcess = new _atom.BufferedProcess({
        command: command, args: args, options: options, stdout: stdout, stderr: stderr, exit: exit
      });

      if (inputString) {
        this.bufferedProcess.process.stdin.write(inputString);
        this.bufferedProcess.process.stdin.end();
      }

      this.bufferedProcess.onWillThrowError(this.createOnErrorFunc(command));
    }
  }, {
    key: 'stdoutFunc',
    value: function stdoutFunc(output) {
      this.emitter.emit('did-write-to-stdout', { message: output });
    }
  }, {
    key: 'onDidWriteToStdout',
    value: function onDidWriteToStdout(callback) {
      return this.emitter.on('did-write-to-stdout', callback);
    }
  }, {
    key: 'stderrFunc',
    value: function stderrFunc(output) {
      this.emitter.emit('did-write-to-stderr', { message: output });
    }
  }, {
    key: 'onDidWriteToStderr',
    value: function onDidWriteToStderr(callback) {
      return this.emitter.on('did-write-to-stderr', callback);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.emitter.dispose();
    }
  }, {
    key: 'getCwd',
    value: function getCwd() {
      var cwd = this.scriptOptions.workingDirectory;

      if (!cwd) {
        switch (atom.config.get('script.cwdBehavior')) {
          case 'First project directory':
            {
              var paths = atom.project.getPaths();
              if (paths && paths.length > 0) {
                try {
                  cwd = _fs2['default'].statSync(paths[0]).isDirectory() ? paths[0] : _path2['default'].join(paths[0], '..');
                } catch (error) {/* Don't throw */}
              }
              break;
            }
          case 'Project directory of the script':
            {
              cwd = this.getProjectPath();
              break;
            }
          case 'Directory of the script':
            {
              var pane = atom.workspace.getActivePaneItem();
              cwd = pane && pane.buffer && pane.buffer.file && pane.buffer.file.getParent && pane.buffer.file.getParent() && pane.buffer.file.getParent().getPath && pane.buffer.file.getParent().getPath() || '';
              break;
            }
        }
      }
      return cwd;
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this.bufferedProcess) {
        this.bufferedProcess.kill();
        this.bufferedProcess = null;
      }
    }
  }, {
    key: 'onExit',
    value: function onExit(returnCode) {
      this.bufferedProcess = null;
      var executionTime = undefined;

      if (atom.config.get('script.enableExecTime') === true && this.startTime) {
        executionTime = (new Date().getTime() - this.startTime.getTime()) / 1000;
      }

      this.emitter.emit('did-exit', { executionTime: executionTime, returnCode: returnCode });
    }
  }, {
    key: 'onDidExit',
    value: function onDidExit(callback) {
      return this.emitter.on('did-exit', callback);
    }
  }, {
    key: 'createOnErrorFunc',
    value: function createOnErrorFunc(command) {
      var _this = this;

      return function (nodeError) {
        _this.bufferedProcess = null;
        _this.emitter.emit('did-not-run', { command: command });
        nodeError.handle();
      };
    }
  }, {
    key: 'onDidNotRun',
    value: function onDidNotRun(callback) {
      return this.emitter.on('did-not-run', callback);
    }
  }, {
    key: 'options',
    value: function options() {
      return {
        cwd: this.getCwd(),
        env: this.scriptOptions.mergedEnv(process.env)
      };
    }
  }, {
    key: 'fillVarsInArg',
    value: function fillVarsInArg(arg, codeContext, projectPath) {
      if (codeContext.filepath) {
        arg = arg.replace(/{FILE_ACTIVE}/g, codeContext.filepath);
        arg = arg.replace(/{FILE_ACTIVE_PATH}/g, _path2['default'].join(codeContext.filepath, '..'));
      }
      if (codeContext.filename) {
        arg = arg.replace(/{FILE_ACTIVE_NAME}/g, codeContext.filename);
        arg = arg.replace(/{FILE_ACTIVE_NAME_BASE}/g, _path2['default'].basename(codeContext.filename, _path2['default'].extname(codeContext.filename)));
      }
      if (projectPath) {
        arg = arg.replace(/{PROJECT_PATH}/g, projectPath);
      }

      return arg;
    }
  }, {
    key: 'args',
    value: function args(codeContext, extraArgs) {
      var _this2 = this;

      var args = this.scriptOptions.cmdArgs.concat(extraArgs).concat(this.scriptOptions.scriptArgs);
      var projectPath = this.getProjectPath || '';
      args = args.map(function (arg) {
        return _this2.fillVarsInArg(arg, codeContext, projectPath);
      });

      if (!this.scriptOptions.cmd) {
        args = codeContext.shebangCommandArgs().concat(args);
      }
      return args;
    }
  }, {
    key: 'getProjectPath',
    value: function getProjectPath() {
      var filePath = atom.workspace.getActiveTextEditor().getPath();
      var projectPaths = atom.project.getPaths();
      for (var projectPath of projectPaths) {
        if (filePath.indexOf(projectPath) > -1) {
          if (_fs2['default'].statSync(projectPath).isDirectory()) {
            return projectPath;
          }
          return _path2['default'].join(projectPath, '..');
        }
      }
      return null;
    }
  }]);

  return Runner;
})();

exports['default'] = Runner;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvcnVubmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXlDLE1BQU07O2tCQUNoQyxJQUFJOzs7O29CQUNGLE1BQU07Ozs7QUFKdkIsV0FBVyxDQUFDOztJQU1TLE1BQU07Ozs7Ozs7QUFNZCxXQU5RLE1BQU0sQ0FNYixhQUFhLEVBQUU7MEJBTlIsTUFBTTs7QUFPdkIsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsUUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0QsUUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDbkMsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFDO0dBQzlCOztlQWRrQixNQUFNOztXQWdCdEIsYUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBc0I7VUFBcEIsV0FBVyx5REFBRyxJQUFJOztBQUNyRCxVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7O0FBRTVCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQy9DLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztB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QUFPLFdBQVcsQ0FBQztXQUNwQjtBQUNELGlCQUFPLGtCQUFLLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDckM7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztTQXZLa0IsTUFBTTs7O3FCQUFOLE1BQU0iLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ydW5uZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgRW1pdHRlciwgQnVmZmVyZWRQcm9jZXNzIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bm5lciB7XG5cbiAgLy8gUHVibGljOiBDcmVhdGVzIGEgUnVubmVyIGluc3RhbmNlXG4gIC8vXG4gIC8vICogYHNjcmlwdE9wdGlvbnNgIGEge1NjcmlwdE9wdGlvbnN9IG9iamVjdCBpbnN0YW5jZVxuICAvLyAqIGBlbWl0dGVyYCBBdG9tJ3Mge0VtaXR0ZXJ9IGluc3RhbmNlLiBZb3UgcHJvYmFibHkgZG9uJ3QgbmVlZCB0byBvdmVyd3JpdGUgaXRcbiAgY29uc3RydWN0b3Ioc2NyaXB0T3B0aW9ucykge1xuICAgIHRoaXMuYnVmZmVyZWRQcm9jZXNzID0gbnVsbDtcbiAgICB0aGlzLnN0ZG91dEZ1bmMgPSB0aGlzLnN0ZG91dEZ1bmMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnN0ZGVyckZ1bmMgPSB0aGlzLnN0ZGVyckZ1bmMuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uRXhpdCA9IHRoaXMub25FeGl0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5jcmVhdGVPbkVycm9yRnVuYyA9IHRoaXMuY3JlYXRlT25FcnJvckZ1bmMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNjcmlwdE9wdGlvbnMgPSBzY3JpcHRPcHRpb25zO1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gIH1cblxuICBydW4oY29tbWFuZCwgZXh0cmFBcmdzLCBjb2RlQ29udGV4dCwgaW5wdXRTdHJpbmcgPSBudWxsKSB7XG4gICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuXG4gICAgY29uc3QgYXJncyA9IHRoaXMuYXJncyhjb2RlQ29udGV4dCwgZXh0cmFBcmdzKTtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5vcHRpb25zKCk7XG4gICAgY29uc3Qgc3Rkb3V0ID0gdGhpcy5zdGRvdXRGdW5jO1xuICAgIGNvbnN0IHN0ZGVyciA9IHRoaXMuc3RkZXJyRnVuYztcbiAgICBjb25zdCBleGl0ID0gdGhpcy5vbkV4aXQ7XG5cbiAgICB0aGlzLmJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moe1xuICAgICAgY29tbWFuZCwgYXJncywgb3B0aW9ucywgc3Rkb3V0LCBzdGRlcnIsIGV4aXQsXG4gICAgfSk7XG5cbiAgICBpZiAoaW5wdXRTdHJpbmcpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4ud3JpdGUoaW5wdXRTdHJpbmcpO1xuICAgICAgdGhpcy5idWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQoKTtcbiAgICB9XG5cbiAgICB0aGlzLmJ1ZmZlcmVkUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yKHRoaXMuY3JlYXRlT25FcnJvckZ1bmMoY29tbWFuZCkpO1xuICB9XG5cbiAgc3Rkb3V0RnVuYyhvdXRwdXQpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXdyaXRlLXRvLXN0ZG91dCcsIHsgbWVzc2FnZTogb3V0cHV0IH0pO1xuICB9XG5cbiAgb25EaWRXcml0ZVRvU3Rkb3V0KGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXdyaXRlLXRvLXN0ZG91dCcsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHN0ZGVyckZ1bmMob3V0cHV0KSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC13cml0ZS10by1zdGRlcnInLCB7IG1lc3NhZ2U6IG91dHB1dCB9KTtcbiAgfVxuXG4gIG9uRGlkV3JpdGVUb1N0ZGVycihjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC13cml0ZS10by1zdGRlcnInLCBjYWxsYmFjayk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZW1pdHRlci5kaXNwb3NlKCk7XG4gIH1cblxuICBnZXRDd2QoKSB7XG4gICAgbGV0IGN3ZCA9IHRoaXMuc2NyaXB0T3B0aW9ucy53b3JraW5nRGlyZWN0b3J5O1xuXG4gICAgaWYgKCFjd2QpIHtcbiAgICAgIHN3aXRjaCAoYXRvbS5jb25maWcuZ2V0KCdzY3JpcHQuY3dkQmVoYXZpb3InKSkge1xuICAgICAgICBjYXNlICdGaXJzdCBwcm9qZWN0IGRpcmVjdG9yeSc6IHtcbiAgICAgICAgICBjb25zdCBwYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgICAgICAgIGlmIChwYXRocyAmJiBwYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjd2QgPSBmcy5zdGF0U3luYyhwYXRoc1swXSkuaXNEaXJlY3RvcnkoKSA/IHBhdGhzWzBdIDogcGF0aC5qb2luKHBhdGhzWzBdLCAnLi4nKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7IC8qIERvbid0IHRocm93ICovIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnUHJvamVjdCBkaXJlY3Rvcnkgb2YgdGhlIHNjcmlwdCc6IHtcbiAgICAgICAgICBjd2QgPSB0aGlzLmdldFByb2plY3RQYXRoKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnRGlyZWN0b3J5IG9mIHRoZSBzY3JpcHQnOiB7XG4gICAgICAgICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgICAgICAgY3dkID0gKHBhbmUgJiYgcGFuZS5idWZmZXIgJiYgcGFuZS5idWZmZXIuZmlsZSAmJiBwYW5lLmJ1ZmZlci5maWxlLmdldFBhcmVudCAmJlxuICAgICAgICAgICAgICAgICBwYW5lLmJ1ZmZlci5maWxlLmdldFBhcmVudCgpICYmIHBhbmUuYnVmZmVyLmZpbGUuZ2V0UGFyZW50KCkuZ2V0UGF0aCAmJlxuICAgICAgICAgICAgICAgICBwYW5lLmJ1ZmZlci5maWxlLmdldFBhcmVudCgpLmdldFBhdGgoKSkgfHwgJyc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN3ZDtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyZWRQcm9jZXNzKSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkUHJvY2Vzcy5raWxsKCk7XG4gICAgICB0aGlzLmJ1ZmZlcmVkUHJvY2VzcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgb25FeGl0KHJldHVybkNvZGUpIHtcbiAgICB0aGlzLmJ1ZmZlcmVkUHJvY2VzcyA9IG51bGw7XG4gICAgbGV0IGV4ZWN1dGlvblRpbWU7XG5cbiAgICBpZiAoKGF0b20uY29uZmlnLmdldCgnc2NyaXB0LmVuYWJsZUV4ZWNUaW1lJykgPT09IHRydWUpICYmIHRoaXMuc3RhcnRUaW1lKSB7XG4gICAgICBleGVjdXRpb25UaW1lID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5zdGFydFRpbWUuZ2V0VGltZSgpKSAvIDEwMDA7XG4gICAgfVxuXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1leGl0JywgeyBleGVjdXRpb25UaW1lLCByZXR1cm5Db2RlIH0pO1xuICB9XG5cbiAgb25EaWRFeGl0KGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWV4aXQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBjcmVhdGVPbkVycm9yRnVuYyhjb21tYW5kKSB7XG4gICAgcmV0dXJuIChub2RlRXJyb3IpID0+IHtcbiAgICAgIHRoaXMuYnVmZmVyZWRQcm9jZXNzID0gbnVsbDtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtbm90LXJ1bicsIHsgY29tbWFuZCB9KTtcbiAgICAgIG5vZGVFcnJvci5oYW5kbGUoKTtcbiAgICB9O1xuICB9XG5cbiAgb25EaWROb3RSdW4oY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtbm90LXJ1bicsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGN3ZDogdGhpcy5nZXRDd2QoKSxcbiAgICAgIGVudjogdGhpcy5zY3JpcHRPcHRpb25zLm1lcmdlZEVudihwcm9jZXNzLmVudiksXG4gICAgfTtcbiAgfVxuXG4gIGZpbGxWYXJzSW5BcmcoYXJnLCBjb2RlQ29udGV4dCwgcHJvamVjdFBhdGgpIHtcbiAgICBpZiAoY29kZUNvbnRleHQuZmlsZXBhdGgpIHtcbiAgICAgIGFyZyA9IGFyZy5yZXBsYWNlKC97RklMRV9BQ1RJVkV9L2csIGNvZGVDb250ZXh0LmZpbGVwYXRoKTtcbiAgICAgIGFyZyA9IGFyZy5yZXBsYWNlKC97RklMRV9BQ1RJVkVfUEFUSH0vZywgcGF0aC5qb2luKGNvZGVDb250ZXh0LmZpbGVwYXRoLCAnLi4nKSk7XG4gICAgfVxuICAgIGlmIChjb2RlQ29udGV4dC5maWxlbmFtZSkge1xuICAgICAgYXJnID0gYXJnLnJlcGxhY2UoL3tGSUxFX0FDVElWRV9OQU1FfS9nLCBjb2RlQ29udGV4dC5maWxlbmFtZSk7XG4gICAgICBhcmcgPSBhcmcucmVwbGFjZSgve0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0vZywgcGF0aC5iYXNlbmFtZShjb2RlQ29udGV4dC5maWxlbmFtZSwgcGF0aC5leHRuYW1lKGNvZGVDb250ZXh0LmZpbGVuYW1lKSkpO1xuICAgIH1cbiAgICBpZiAocHJvamVjdFBhdGgpIHtcbiAgICAgIGFyZyA9IGFyZy5yZXBsYWNlKC97UFJPSkVDVF9QQVRIfS9nLCBwcm9qZWN0UGF0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZztcbiAgfVxuXG4gIGFyZ3MoY29kZUNvbnRleHQsIGV4dHJhQXJncykge1xuICAgIGxldCBhcmdzID0gKHRoaXMuc2NyaXB0T3B0aW9ucy5jbWRBcmdzLmNvbmNhdChleHRyYUFyZ3MpKS5jb25jYXQodGhpcy5zY3JpcHRPcHRpb25zLnNjcmlwdEFyZ3MpO1xuICAgIGNvbnN0IHByb2plY3RQYXRoID0gdGhpcy5nZXRQcm9qZWN0UGF0aCB8fCAnJztcbiAgICBhcmdzID0gKGFyZ3MubWFwKGFyZyA9PiB0aGlzLmZpbGxWYXJzSW5BcmcoYXJnLCBjb2RlQ29udGV4dCwgcHJvamVjdFBhdGgpKSk7XG5cbiAgICBpZiAoIXRoaXMuc2NyaXB0T3B0aW9ucy5jbWQpIHtcbiAgICAgIGFyZ3MgPSBjb2RlQ29udGV4dC5zaGViYW5nQ29tbWFuZEFyZ3MoKS5jb25jYXQoYXJncyk7XG4gICAgfVxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgZ2V0UHJvamVjdFBhdGgoKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0UGF0aCgpO1xuICAgIGNvbnN0IHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIGZvciAoY29uc3QgcHJvamVjdFBhdGggb2YgcHJvamVjdFBhdGhzKSB7XG4gICAgICBpZiAoZmlsZVBhdGguaW5kZXhPZihwcm9qZWN0UGF0aCkgPiAtMSkge1xuICAgICAgICBpZiAoZnMuc3RhdFN5bmMocHJvamVjdFBhdGgpLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICByZXR1cm4gcHJvamVjdFBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGguam9pbihwcm9qZWN0UGF0aCwgJy4uJyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=