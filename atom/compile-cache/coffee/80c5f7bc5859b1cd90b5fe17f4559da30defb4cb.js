(function() {
  var Input, ViewModel, VimNormalModeInputElement;

  VimNormalModeInputElement = require('./vim-normal-mode-input-element');

  ViewModel = (function() {
    function ViewModel(operation, opts) {
      var _ref;
      this.operation = operation;
      if (opts == null) {
        opts = {};
      }
      _ref = this.operation, this.editor = _ref.editor, this.vimState = _ref.vimState;
      this.view = new VimNormalModeInputElement().initialize(this, atom.views.getView(this.editor), opts);
      this.editor.normalModeInputView = this.view;
      this.vimState.onDidFailToCompose((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
    }

    ViewModel.prototype.confirm = function(view) {
      return this.vimState.pushOperations(new Input(this.view.value));
    };

    ViewModel.prototype.cancel = function(view) {
      if (this.vimState.isOperatorPending()) {
        this.vimState.pushOperations(new Input(''));
      }
      return delete this.editor.normalModeInputView;
    };

    return ViewModel;

  })();

  Input = (function() {
    function Input(characters) {
      this.characters = characters;
    }

    Input.prototype.isComplete = function() {
      return true;
    };

    Input.prototype.isRecordable = function() {
      return true;
    };

    return Input;

  })();

  module.exports = {
    ViewModel: ViewModel,
    Input: Input
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvdmlldy1tb2RlbHMvdmlldy1tb2RlbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkNBQUE7O0FBQUEsRUFBQSx5QkFBQSxHQUE0QixPQUFBLENBQVEsaUNBQVIsQ0FBNUIsQ0FBQTs7QUFBQSxFQUVNO0FBQ1MsSUFBQSxtQkFBRSxTQUFGLEVBQWEsSUFBYixHQUFBO0FBQ1gsVUFBQSxJQUFBO0FBQUEsTUFEWSxJQUFDLENBQUEsWUFBQSxTQUNiLENBQUE7O1FBRHdCLE9BQUs7T0FDN0I7QUFBQSxNQUFBLE9BQXVCLElBQUMsQ0FBQSxTQUF4QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsZ0JBQUEsUUFBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEseUJBQUEsQ0FBQSxDQUEyQixDQUFDLFVBQTVCLENBQXVDLElBQXZDLEVBQTZDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFDLENBQUEsTUFBcEIsQ0FBN0MsRUFBMEUsSUFBMUUsQ0FEWixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLEdBQThCLElBQUMsQ0FBQSxJQUYvQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFWLENBQTZCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdCLENBSEEsQ0FEVztJQUFBLENBQWI7O0FBQUEsd0JBTUEsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO2FBQ1AsSUFBQyxDQUFBLFFBQVEsQ0FBQyxjQUFWLENBQTZCLElBQUEsS0FBQSxDQUFNLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBWixDQUE3QixFQURPO0lBQUEsQ0FOVCxDQUFBOztBQUFBLHdCQVNBLE1BQUEsR0FBUSxTQUFDLElBQUQsR0FBQTtBQUNOLE1BQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFWLENBQUEsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxjQUFWLENBQTZCLElBQUEsS0FBQSxDQUFNLEVBQU4sQ0FBN0IsQ0FBQSxDQURGO09BQUE7YUFFQSxNQUFBLENBQUEsSUFBUSxDQUFBLE1BQU0sQ0FBQyxvQkFIVDtJQUFBLENBVFIsQ0FBQTs7cUJBQUE7O01BSEYsQ0FBQTs7QUFBQSxFQWlCTTtBQUNTLElBQUEsZUFBRSxVQUFGLEdBQUE7QUFBZSxNQUFkLElBQUMsQ0FBQSxhQUFBLFVBQWEsQ0FBZjtJQUFBLENBQWI7O0FBQUEsb0JBQ0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQURaLENBQUE7O0FBQUEsb0JBRUEsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQUZkLENBQUE7O2lCQUFBOztNQWxCRixDQUFBOztBQUFBLEVBc0JBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZixXQUFBLFNBRGU7QUFBQSxJQUNKLE9BQUEsS0FESTtHQXRCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/view-models/view-model.coffee
