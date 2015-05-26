(function() {
  var CompositeDisposable, Disposable, GlobalVimState, StatusBarManager, VimState, settings, _ref;

  _ref = require('event-kit'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  StatusBarManager = require('./status-bar-manager');

  GlobalVimState = require('./global-vim-state');

  VimState = require('./vim-state');

  settings = require('./settings');

  module.exports = {
    config: settings.config,
    activate: function(state) {
      var globalVimState, vimStates;
      this.disposables = new CompositeDisposable;
      globalVimState = new GlobalVimState;
      this.statusBarManager = new StatusBarManager;
      vimStates = new WeakMap;
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var element, vimState;
          if (editor.mini) {
            return;
          }
          element = atom.views.getView(editor);
          if (!vimStates.get(editor)) {
            vimState = new VimState(element, _this.statusBarManager, globalVimState);
            vimStates.set(editor, vimState);
            return _this.disposables.add(new Disposable(function() {
              return vimState.destroy();
            }));
          }
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.disposables.add(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    }
  };

}).call(this);
