(function() {
  var ExCommandModeInputView, Input, ViewModel;

  ExCommandModeInputView = require('./ex-command-mode-input-view');

  ViewModel = (function() {
    function ViewModel(command, opts) {
      var _ref;
      this.command = command;
      if (opts == null) {
        opts = {};
      }
      _ref = this.command, this.editor = _ref.editor, this.exState = _ref.exState;
      this.view = new ExCommandModeInputView(this, opts);
      this.editor.commandModeInputView = this.view;
      this.exState.onDidFailToExecute((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
    }

    ViewModel.prototype.confirm = function(view) {
      return this.exState.pushOperations(new Input(this.view.value));
    };

    ViewModel.prototype.cancel = function(view) {
      return this.exState.pushOperations(new Input(''));
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
