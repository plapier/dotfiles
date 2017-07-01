(function() {
  var ExNormalModeInputElement, Input, ViewModel;

  ExNormalModeInputElement = require('./ex-normal-mode-input-element');

  ViewModel = (function() {
    function ViewModel(command, opts) {
      var _ref;
      this.command = command;
      if (opts == null) {
        opts = {};
      }
      _ref = this.command, this.editor = _ref.editor, this.exState = _ref.exState;
      this.view = new ExNormalModeInputElement().initialize(this, opts);
      this.editor.normalModeInputView = this.view;
      this.exState.onDidFailToExecute((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
      this.done = false;
    }

    ViewModel.prototype.confirm = function(view) {
      this.exState.pushOperations(new Input(this.view.value));
      return this.done = true;
    };

    ViewModel.prototype.cancel = function(view) {
      if (!this.done) {
        this.exState.pushOperations(new Input(''));
        return this.done = true;
      }
    };

    return ViewModel;

  })();

  Input = (function() {
    function Input(characters) {
      this.characters = characters;
    }

    return Input;

  })();

  module.exports = {
    ViewModel: ViewModel,
    Input: Input
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi92aWV3LW1vZGVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwQ0FBQTs7QUFBQSxFQUFBLHdCQUFBLEdBQTJCLE9BQUEsQ0FBUSxnQ0FBUixDQUEzQixDQUFBOztBQUFBLEVBRU07QUFDUyxJQUFBLG1CQUFFLE9BQUYsRUFBVyxJQUFYLEdBQUE7QUFDWCxVQUFBLElBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxVQUFBLE9BQ2IsQ0FBQTs7UUFEc0IsT0FBSztPQUMzQjtBQUFBLE1BQUEsT0FBc0IsSUFBQyxDQUFBLE9BQXZCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxlQUFBLE9BQVgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLHdCQUFBLENBQUEsQ0FBMEIsQ0FBQyxVQUEzQixDQUFzQyxJQUF0QyxFQUF5QyxJQUF6QyxDQUZaLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsR0FBOEIsSUFBQyxDQUFBLElBSC9CLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFPLENBQUMsa0JBQVQsQ0FBNEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsSUFBRCxHQUFRLEtBTFIsQ0FEVztJQUFBLENBQWI7O0FBQUEsd0JBUUEsT0FBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBNEIsSUFBQSxLQUFBLENBQU0sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFaLENBQTVCLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FGRDtJQUFBLENBUlQsQ0FBQTs7QUFBQSx3QkFZQSxNQUFBLEdBQVEsU0FBQyxJQUFELEdBQUE7QUFDTixNQUFBLElBQUEsQ0FBQSxJQUFRLENBQUEsSUFBUjtBQUNFLFFBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQTRCLElBQUEsS0FBQSxDQUFNLEVBQU4sQ0FBNUIsQ0FBQSxDQUFBO2VBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxLQUZWO09BRE07SUFBQSxDQVpSLENBQUE7O3FCQUFBOztNQUhGLENBQUE7O0FBQUEsRUFvQk07QUFDUyxJQUFBLGVBQUUsVUFBRixHQUFBO0FBQWUsTUFBZCxJQUFDLENBQUEsYUFBQSxVQUFhLENBQWY7SUFBQSxDQUFiOztpQkFBQTs7TUFyQkYsQ0FBQTs7QUFBQSxFQXVCQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQ2YsV0FBQSxTQURlO0FBQUEsSUFDSixPQUFBLEtBREk7R0F2QmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/view-model.coffee
