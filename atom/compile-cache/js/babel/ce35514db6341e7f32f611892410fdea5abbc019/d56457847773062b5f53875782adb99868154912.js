Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var ViewRuntimeObserver = (function () {
  function ViewRuntimeObserver(view) {
    var subscriptions = arguments.length <= 1 || arguments[1] === undefined ? new _atom.CompositeDisposable() : arguments[1];

    _classCallCheck(this, ViewRuntimeObserver);

    this.view = view;
    this.subscriptions = subscriptions;
  }

  _createClass(ViewRuntimeObserver, [{
    key: 'observe',
    value: function observe(runtime) {
      var _this = this;

      this.subscriptions.add(runtime.onStart(function () {
        return _this.view.resetView();
      }));
      this.subscriptions.add(runtime.onStarted(function (ev) {
        _this.view.commandContext = ev;
      }));
      this.subscriptions.add(runtime.onStopped(function () {
        return _this.view.stop();
      }));
      this.subscriptions.add(runtime.onDidWriteToStderr(function (ev) {
        return _this.view.display('stderr', ev.message);
      }));
      this.subscriptions.add(runtime.onDidWriteToStdout(function (ev) {
        return _this.view.display('stdout', ev.message);
      }));
      this.subscriptions.add(runtime.onDidExit(function (ev) {
        return _this.view.setHeaderAndShowExecutionTime(ev.returnCode, ev.executionTime);
      }));
      this.subscriptions.add(runtime.onDidNotRun(function (ev) {
        return _this.view.showUnableToRunError(ev.command);
      }));
      this.subscriptions.add(runtime.onDidContextCreate(function (ev) {
        var title = ev.lang + ' - ' + ev.filename + (ev.lineNumber ? ':' + ev.lineNumber : '');
        _this.view.setHeaderTitle(title);
      }));
      this.subscriptions.add(runtime.onDidNotSpecifyLanguage(function () {
        return _this.view.showNoLanguageSpecified();
      }));
      this.subscriptions.add(runtime.onDidNotSupportLanguage(function (ev) {
        return _this.view.showLanguageNotSupported(ev.lang);
      }));
      this.subscriptions.add(runtime.onDidNotSupportMode(function (ev) {
        return _this.view.createGitHubIssueLink(ev.argType, ev.lang);
      }));
      this.subscriptions.add(runtime.onDidNotBuildArgs(function (ev) {
        return _this.view.handleError(ev.error);
      }));
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.subscriptions) this.subscriptions.dispose();
    }
  }]);

  return ViewRuntimeObserver;
})();

exports['default'] = ViewRuntimeObserver;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvdmlldy1ydW50aW1lLW9ic2VydmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVvQyxNQUFNOztBQUYxQyxXQUFXLENBQUM7O0lBSVMsbUJBQW1CO0FBQzNCLFdBRFEsbUJBQW1CLENBQzFCLElBQUksRUFBNkM7UUFBM0MsYUFBYSx5REFBRywrQkFBeUI7OzBCQUR4QyxtQkFBbUI7O0FBRXBDLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0dBQ3BDOztlQUprQixtQkFBbUI7O1dBTS9CLGlCQUFDLE9BQU8sRUFBRTs7O0FBQ2YsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztlQUFNLE1BQUssSUFBSSxDQUFDLFNBQVMsRUFBRTtPQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBQyxFQUFFLEVBQUs7QUFBRSxjQUFLLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO09BQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEYsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztlQUFNLE1BQUssSUFBSSxDQUFDLElBQUksRUFBRTtPQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ2xFLFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLEVBQUU7ZUFBSSxNQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQztBQUNsRyxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsVUFBQSxFQUFFO2VBQUksTUFBSyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7QUFDbEcsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFBLEVBQUU7ZUFDekMsTUFBSyxJQUFJLENBQUMsNkJBQTZCLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7QUFDN0UsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxVQUFBLEVBQUU7ZUFBSSxNQUFLLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUM7QUFDOUYsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFVBQUMsRUFBRSxFQUFLO0FBQ3hELFlBQU0sS0FBSyxHQUFNLEVBQUUsQ0FBQyxJQUFJLFdBQU0sRUFBRSxDQUFDLFFBQVEsSUFBRyxFQUFFLENBQUMsVUFBVSxTQUFPLEVBQUUsQ0FBQyxVQUFVLEdBQUssRUFBRSxDQUFBLEFBQUUsQ0FBQztBQUN2RixjQUFLLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDakMsQ0FBQyxDQUFDLENBQUM7QUFDSixVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUM7ZUFDckQsTUFBSyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7T0FBQSxDQUFDLENBQUMsQ0FBQztBQUN4QyxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsVUFBQSxFQUFFO2VBQ3ZELE1BQUssSUFBSSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQztBQUNoRCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsVUFBQSxFQUFFO2VBQ25ELE1BQUssSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ3pELFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFBLEVBQUU7ZUFBSSxNQUFLLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFDO0tBQzFGOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3REOzs7U0E5QmtCLG1CQUFtQjs7O3FCQUFuQixtQkFBbUIiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvc2NyaXB0L2xpYi92aWV3LXJ1bnRpbWUtb2JzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWaWV3UnVudGltZU9ic2VydmVyIHtcbiAgY29uc3RydWN0b3Iodmlldywgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCkpIHtcbiAgICB0aGlzLnZpZXcgPSB2aWV3O1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG4gIH1cblxuICBvYnNlcnZlKHJ1bnRpbWUpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHJ1bnRpbWUub25TdGFydCgoKSA9PiB0aGlzLnZpZXcucmVzZXRWaWV3KCkpKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHJ1bnRpbWUub25TdGFydGVkKChldikgPT4geyB0aGlzLnZpZXcuY29tbWFuZENvbnRleHQgPSBldjsgfSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocnVudGltZS5vblN0b3BwZWQoKCkgPT4gdGhpcy52aWV3LnN0b3AoKSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocnVudGltZS5vbkRpZFdyaXRlVG9TdGRlcnIoZXYgPT4gdGhpcy52aWV3LmRpc3BsYXkoJ3N0ZGVycicsIGV2Lm1lc3NhZ2UpKSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChydW50aW1lLm9uRGlkV3JpdGVUb1N0ZG91dChldiA9PiB0aGlzLnZpZXcuZGlzcGxheSgnc3Rkb3V0JywgZXYubWVzc2FnZSkpKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHJ1bnRpbWUub25EaWRFeGl0KGV2ID0+XG4gICAgICB0aGlzLnZpZXcuc2V0SGVhZGVyQW5kU2hvd0V4ZWN1dGlvblRpbWUoZXYucmV0dXJuQ29kZSwgZXYuZXhlY3V0aW9uVGltZSkpKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHJ1bnRpbWUub25EaWROb3RSdW4oZXYgPT4gdGhpcy52aWV3LnNob3dVbmFibGVUb1J1bkVycm9yKGV2LmNvbW1hbmQpKSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChydW50aW1lLm9uRGlkQ29udGV4dENyZWF0ZSgoZXYpID0+IHtcbiAgICAgIGNvbnN0IHRpdGxlID0gYCR7ZXYubGFuZ30gLSAke2V2LmZpbGVuYW1lfSR7ZXYubGluZU51bWJlciA/IGA6JHtldi5saW5lTnVtYmVyfWAgOiAnJ31gO1xuICAgICAgdGhpcy52aWV3LnNldEhlYWRlclRpdGxlKHRpdGxlKTtcbiAgICB9KSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChydW50aW1lLm9uRGlkTm90U3BlY2lmeUxhbmd1YWdlKCgpID0+XG4gICAgICB0aGlzLnZpZXcuc2hvd05vTGFuZ3VhZ2VTcGVjaWZpZWQoKSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocnVudGltZS5vbkRpZE5vdFN1cHBvcnRMYW5ndWFnZShldiA9PlxuICAgICAgdGhpcy52aWV3LnNob3dMYW5ndWFnZU5vdFN1cHBvcnRlZChldi5sYW5nKSkpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQocnVudGltZS5vbkRpZE5vdFN1cHBvcnRNb2RlKGV2ID0+XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlR2l0SHViSXNzdWVMaW5rKGV2LmFyZ1R5cGUsIGV2LmxhbmcpKSk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChydW50aW1lLm9uRGlkTm90QnVpbGRBcmdzKGV2ID0+IHRoaXMudmlldy5oYW5kbGVFcnJvcihldi5lcnJvcikpKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19