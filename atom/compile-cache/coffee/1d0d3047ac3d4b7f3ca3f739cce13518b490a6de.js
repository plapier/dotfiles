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
      this.disposables = new CompositeDisposable;
      this.globalVimState = new GlobalVimState;
      this.statusBarManager = new StatusBarManager;
      this.vimStates = new Set;
      this.vimStatesByEditor = new WeakMap;
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var vimState;
          if (editor.isMini() || _this.getEditorState(editor)) {
            return;
          }
          vimState = new VimState(atom.views.getView(editor), _this.statusBarManager, _this.globalVimState);
          _this.vimStates.add(vimState);
          _this.vimStatesByEditor.set(editor, vimState);
          return vimState.onDidDestroy(function() {
            return _this.vimStates["delete"](vimState);
          });
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem(this.updateToPaneItem.bind(this)));
      return this.disposables.add(new Disposable((function(_this) {
        return function() {
          return _this.vimStates.forEach(function(vimState) {
            return vimState.destroy();
          });
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    getGlobalState: function() {
      return this.globalVimState;
    },
    getEditorState: function(editor) {
      return this.vimStatesByEditor.get(editor);
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.disposables.add(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    },
    updateToPaneItem: function(item) {
      var vimState;
      if (item != null) {
        vimState = this.getEditorState(item);
      }
      if (vimState != null) {
        return vimState.updateStatusBar();
      } else {
        return this.statusBarManager.hide();
      }
    },
    provideVimMode: function() {
      return {
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvdmltLW1vZGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJGQUFBOztBQUFBLEVBQUEsT0FBb0MsT0FBQSxDQUFRLFdBQVIsQ0FBcEMsRUFBQyxrQkFBQSxVQUFELEVBQWEsMkJBQUEsbUJBQWIsQ0FBQTs7QUFBQSxFQUNBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUixDQURuQixDQUFBOztBQUFBLEVBRUEsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVIsQ0FGakIsQ0FBQTs7QUFBQSxFQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUhYLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLFFBQVEsQ0FBQyxNQUFqQjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEdBQUEsQ0FBQSxtQkFBZixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsY0FBRCxHQUFrQixHQUFBLENBQUEsY0FEbEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEdBQUEsQ0FBQSxnQkFGcEIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUFBLENBQUEsR0FKYixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsR0FBQSxDQUFBLE9BTHJCLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsU0FBUyxD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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/vim-mode.coffee
