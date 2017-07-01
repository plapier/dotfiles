Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _grammarsCoffee = require('./grammars.coffee');

var _grammarsCoffee2 = _interopRequireDefault(_grammarsCoffee);

'use babel';

var CommandContext = (function () {
  function CommandContext() {
    _classCallCheck(this, CommandContext);

    this.command = null;
    this.workingDirectory = null;
    this.args = [];
    this.options = {};
  }

  _createClass(CommandContext, [{
    key: 'quoteArguments',
    value: function quoteArguments(args) {
      return args.map(function (arg) {
        return arg.trim().indexOf(' ') === -1 ? arg.trim() : '\'' + arg + '\'';
      });
    }
  }, {
    key: 'getRepresentation',
    value: function getRepresentation() {
      if (!this.command || !this.args.length) return '';

      // command arguments
      var commandArgs = this.options.cmdArgs ? this.quoteArguments(this.options.cmdArgs).join(' ') : '';

      // script arguments
      var args = this.args.length ? this.quoteArguments(this.args).join(' ') : '';
      var scriptArgs = this.options.scriptArgs ? this.quoteArguments(this.options.scriptArgs).join(' ') : '';

      return this.command.trim() + (commandArgs ? ' ' + commandArgs : '') + (args ? ' ' + args : '') + (scriptArgs ? ' ' + scriptArgs : '');
    }
  }], [{
    key: 'build',
    value: function build(runtime, runOptions, codeContext) {
      var commandContext = new CommandContext();
      commandContext.options = runOptions;
      var buildArgsArray = undefined;

      try {
        if (!runOptions.cmd) {
          // Precondition: lang? and lang of grammarMap
          commandContext.command = codeContext.shebangCommand() || _grammarsCoffee2['default'][codeContext.lang][codeContext.argType].command;
        } else {
          commandContext.command = runOptions.cmd;
        }

        buildArgsArray = _grammarsCoffee2['default'][codeContext.lang][codeContext.argType].args;
      } catch (error) {
        runtime.modeNotSupported(codeContext.argType, codeContext.lang);
        return false;
      }

      try {
        commandContext.args = buildArgsArray(codeContext);
      } catch (errorSendByArgs) {
        runtime.didNotBuildArgs(errorSendByArgs);
        return false;
      }

      if (!runOptions.workingDirectory) {
        // Precondition: lang? and lang of grammarMap
        commandContext.workingDirectory = _grammarsCoffee2['default'][codeContext.lang][codeContext.argType].workingDirectory || '';
      } else {
        commandContext.workingDirectory = runOptions.workingDirectory;
      }

      // Return setup information
      return commandContext;
    }
  }]);

  return CommandContext;
})();

exports['default'] = CommandContext;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvY29tbWFuZC1jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OEJBRXVCLG1CQUFtQjs7OztBQUYxQyxXQUFXLENBQUM7O0lBSVMsY0FBYztBQUN0QixXQURRLGNBQWMsR0FDbkI7MEJBREssY0FBYzs7QUFFL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNmLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0dBQ25COztlQU5rQixjQUFjOztXQThDbkIsd0JBQUMsSUFBSSxFQUFFO0FBQ25CLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7ZUFBSyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsVUFBTyxHQUFHLE9BQUc7T0FBQyxDQUFDLENBQUM7S0FDcEY7OztXQUVnQiw2QkFBRztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDOzs7QUFHbEQsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7OztBQUdwRyxVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzlFLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUV6RyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQ3ZCLFdBQVcsU0FBTyxXQUFXLEdBQUssRUFBRSxDQUFBLEFBQUMsSUFDckMsSUFBSSxTQUFPLElBQUksR0FBSyxFQUFFLENBQUEsQUFBQyxJQUN2QixVQUFVLFNBQU8sVUFBVSxHQUFLLEVBQUUsQ0FBQSxBQUFDLENBQUM7S0FDeEM7OztXQXhEVyxlQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFO0FBQzdDLFVBQU0sY0FBYyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFDNUMsb0JBQWMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO0FBQ3BDLFVBQUksY0FBYyxZQUFBLENBQUM7O0FBRW5CLFVBQUk7QUFDRixZQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTs7QUFFbkIsd0JBQWMsQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLGNBQWMsRUFBRSxJQUNuRCw0QkFBVyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQztTQUM3RCxNQUFNO0FBQ0wsd0JBQWMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQztTQUN6Qzs7QUFFRCxzQkFBYyxHQUFHLDRCQUFXLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO09BQ3pFLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxlQUFPLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEUsZUFBTyxLQUFLLENBQUM7T0FDZDs7QUFFRCxVQUFJO0FBQ0Ysc0JBQWMsQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO09BQ25ELENBQUMsT0FBTyxlQUFlLEVBQUU7QUFDeEIsZUFBTyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN6QyxlQUFPLEtBQUssQ0FBQztPQUNkOztBQUVELFVBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUU7O0FBRWhDLHNCQUFjLENBQUMsZ0JBQWdCLEdBQUcsNEJBQVcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7T0FDNUcsTUFBTTtBQUNMLHNCQUFjLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDO09BQy9EOzs7QUFHRCxhQUFPLGNBQWMsQ0FBQztLQUN2Qjs7O1NBNUNrQixjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9EZXYvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2NvbW1hbmQtY29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgZ3JhbW1hck1hcCBmcm9tICcuL2dyYW1tYXJzLmNvZmZlZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbW1hbmRDb250ZXh0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb21tYW5kID0gbnVsbDtcbiAgICB0aGlzLndvcmtpbmdEaXJlY3RvcnkgPSBudWxsO1xuICAgIHRoaXMuYXJncyA9IFtdO1xuICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgc3RhdGljIGJ1aWxkKHJ1bnRpbWUsIHJ1bk9wdGlvbnMsIGNvZGVDb250ZXh0KSB7XG4gICAgY29uc3QgY29tbWFuZENvbnRleHQgPSBuZXcgQ29tbWFuZENvbnRleHQoKTtcbiAgICBjb21tYW5kQ29udGV4dC5vcHRpb25zID0gcnVuT3B0aW9ucztcbiAgICBsZXQgYnVpbGRBcmdzQXJyYXk7XG5cbiAgICB0cnkge1xuICAgICAgaWYgKCFydW5PcHRpb25zLmNtZCkge1xuICAgICAgICAvLyBQcmVjb25kaXRpb246IGxhbmc/IGFuZCBsYW5nIG9mIGdyYW1tYXJNYXBcbiAgICAgICAgY29tbWFuZENvbnRleHQuY29tbWFuZCA9IGNvZGVDb250ZXh0LnNoZWJhbmdDb21tYW5kKCkgfHxcbiAgICAgICAgICBncmFtbWFyTWFwW2NvZGVDb250ZXh0LmxhbmddW2NvZGVDb250ZXh0LmFyZ1R5cGVdLmNvbW1hbmQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21tYW5kQ29udGV4dC5jb21tYW5kID0gcnVuT3B0aW9ucy5jbWQ7XG4gICAgICB9XG5cbiAgICAgIGJ1aWxkQXJnc0FycmF5ID0gZ3JhbW1hck1hcFtjb2RlQ29udGV4dC5sYW5nXVtjb2RlQ29udGV4dC5hcmdUeXBlXS5hcmdzO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBydW50aW1lLm1vZGVOb3RTdXBwb3J0ZWQoY29kZUNvbnRleHQuYXJnVHlwZSwgY29kZUNvbnRleHQubGFuZyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbW1hbmRDb250ZXh0LmFyZ3MgPSBidWlsZEFyZ3NBcnJheShjb2RlQ29udGV4dCk7XG4gICAgfSBjYXRjaCAoZXJyb3JTZW5kQnlBcmdzKSB7XG4gICAgICBydW50aW1lLmRpZE5vdEJ1aWxkQXJncyhlcnJvclNlbmRCeUFyZ3MpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghcnVuT3B0aW9ucy53b3JraW5nRGlyZWN0b3J5KSB7XG4gICAgICAvLyBQcmVjb25kaXRpb246IGxhbmc/IGFuZCBsYW5nIG9mIGdyYW1tYXJNYXBcbiAgICAgIGNvbW1hbmRDb250ZXh0LndvcmtpbmdEaXJlY3RvcnkgPSBncmFtbWFyTWFwW2NvZGVDb250ZXh0LmxhbmddW2NvZGVDb250ZXh0LmFyZ1R5cGVdLndvcmtpbmdEaXJlY3RvcnkgfHwgJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbW1hbmRDb250ZXh0LndvcmtpbmdEaXJlY3RvcnkgPSBydW5PcHRpb25zLndvcmtpbmdEaXJlY3Rvcnk7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIHNldHVwIGluZm9ybWF0aW9uXG4gICAgcmV0dXJuIGNvbW1hbmRDb250ZXh0O1xuICB9XG5cbiAgcXVvdGVBcmd1bWVudHMoYXJncykge1xuICAgIHJldHVybiBhcmdzLm1hcChhcmcgPT4gKGFyZy50cmltKCkuaW5kZXhPZignICcpID09PSAtMSA/IGFyZy50cmltKCkgOiBgJyR7YXJnfSdgKSk7XG4gIH1cblxuICBnZXRSZXByZXNlbnRhdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuY29tbWFuZCB8fCAhdGhpcy5hcmdzLmxlbmd0aCkgcmV0dXJuICcnO1xuXG4gICAgLy8gY29tbWFuZCBhcmd1bWVudHNcbiAgICBjb25zdCBjb21tYW5kQXJncyA9IHRoaXMub3B0aW9ucy5jbWRBcmdzID8gdGhpcy5xdW90ZUFyZ3VtZW50cyh0aGlzLm9wdGlvbnMuY21kQXJncykuam9pbignICcpIDogJyc7XG5cbiAgICAvLyBzY3JpcHQgYXJndW1lbnRzXG4gICAgY29uc3QgYXJncyA9IHRoaXMuYXJncy5sZW5ndGggPyB0aGlzLnF1b3RlQXJndW1lbnRzKHRoaXMuYXJncykuam9pbignICcpIDogJyc7XG4gICAgY29uc3Qgc2NyaXB0QXJncyA9IHRoaXMub3B0aW9ucy5zY3JpcHRBcmdzID8gdGhpcy5xdW90ZUFyZ3VtZW50cyh0aGlzLm9wdGlvbnMuc2NyaXB0QXJncykuam9pbignICcpIDogJyc7XG5cbiAgICByZXR1cm4gdGhpcy5jb21tYW5kLnRyaW0oKSArXG4gICAgICAoY29tbWFuZEFyZ3MgPyBgICR7Y29tbWFuZEFyZ3N9YCA6ICcnKSArXG4gICAgICAoYXJncyA/IGAgJHthcmdzfWAgOiAnJykgK1xuICAgICAgKHNjcmlwdEFyZ3MgPyBgICR7c2NyaXB0QXJnc31gIDogJycpO1xuICB9XG59XG4iXX0=