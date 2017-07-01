Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _coscript = require('coscript');

var _coscript2 = _interopRequireDefault(_coscript);

'use babel';

exports['default'] = {

  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sketchapp-scripter:runScript': function sketchappScripterRunScript() {
        return _this.runScript();
      }
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  runScript: function runScript() {

    var packageDir = atom.packages.getLoadedPackage('sketchapp-scripter').path;
    var editor = atom.workspace.getActiveTextEditor();

    if (editor) {
      var userCode = editor.getText();
      _fs2['default'].writeFile(packageDir + '/scripting/run.sketchplugin', userCode);
      _child_process2['default'].exec(_coscript2['default'] + ' -e "[[[COScript app:\\\"Sketch\\\"] delegate] runPluginAtURL:[NSURL fileURLWithPath:\\\"' + packageDir + '/scripting/run.sketchplugin\\\"]]"', function (error, stdout, stderr) {
        console.log(error);
        console.log(stdout);
        console.log(stderr);
      });
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NrZXRjaGFwcC1zY3JpcHRlci9saWIvc2tldGNoYXBwLXNjcmlwdGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFb0MsTUFBTTs7a0JBQzNCLElBQUk7Ozs7NkJBQ08sZUFBZTs7Ozt3QkFDcEIsVUFBVTs7OztBQUwvQixXQUFXLENBQUM7O3FCQU9HOztBQUViLGVBQWEsRUFBRSxJQUFJOztBQUVuQixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELG9DQUE4QixFQUFFO2VBQU0sTUFBSyxTQUFTLEVBQUU7T0FBQTtLQUN2RCxDQUFDLENBQUMsQ0FBQTtHQUNKOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDN0I7O0FBRUQsV0FBUyxFQUFBLHFCQUFHOztBQUVWLFFBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDN0UsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOztBQUVsRCxRQUFHLE1BQU0sRUFBQztBQUNSLFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxzQkFBRyxTQUFTLENBQUMsVUFBVSxHQUFDLDZCQUE2QixFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ2hFLGlDQUFjLElBQUksQ0FBQyx3QkFBVywyRkFBMkYsR0FBRSxVQUFVLEdBQUUsb0NBQW9DLEVBQUUsVUFBVSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUM1TSxlQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ2xCLGVBQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbkIsZUFBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUNwQixDQUFDLENBQUM7S0FDSjtHQUNGO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvc2tldGNoYXBwLXNjcmlwdGVyL2xpYi9za2V0Y2hhcHAtc2NyaXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IGNvc2NyaXB0IGZyb20gJ2Nvc2NyaXB0J1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdza2V0Y2hhcHAtc2NyaXB0ZXI6cnVuU2NyaXB0JzogKCkgPT4gdGhpcy5ydW5TY3JpcHQoKVxuICAgIH0pKVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9LFxuXG4gIHJ1blNjcmlwdCgpIHtcblxuICAgIGNvbnN0IHBhY2thZ2VEaXIgPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ3NrZXRjaGFwcC1zY3JpcHRlcicpLnBhdGg7XG4gICAgbGV0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcblxuICAgIGlmKGVkaXRvcil7XG4gICAgICBjb25zdCB1c2VyQ29kZSA9IGVkaXRvci5nZXRUZXh0KCk7XG4gICAgICBmcy53cml0ZUZpbGUocGFja2FnZURpcisnL3NjcmlwdGluZy9ydW4uc2tldGNocGx1Z2luJywgdXNlckNvZGUpXG4gICAgICBjaGlsZF9wcm9jZXNzLmV4ZWMoY29zY3JpcHQgKyAnIC1lIFwiW1tbQ09TY3JpcHQgYXBwOlxcXFxcXFwiU2tldGNoXFxcXFxcXCJdIGRlbGVnYXRlXSBydW5QbHVnaW5BdFVSTDpbTlNVUkwgZmlsZVVSTFdpdGhQYXRoOlxcXFxcXFwiJysgcGFja2FnZURpciArJy9zY3JpcHRpbmcvcnVuLnNrZXRjaHBsdWdpblxcXFxcXFwiXV1cIicsIGZ1bmN0aW9uIChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICAgIGNvbnNvbGUubG9nKHN0ZG91dClcbiAgICAgICAgY29uc29sZS5sb2coc3RkZXJyKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59O1xuIl19