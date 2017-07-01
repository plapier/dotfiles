(function() {
  var ExCommandModeInputElement, Input, ViewModel;

  ExCommandModeInputElement = require('./ex-command-mode-input-element');

  ViewModel = (function() {
    function ViewModel(command, opts) {
      var _ref;
      this.command = command;
      if (opts == null) {
        opts = {};
      }
      _ref = this.command, this.editor = _ref.editor, this.exState = _ref.exState;
      this.view = new ExCommandModeInputElement().initialize(this, opts);
      this.editor.commandModeInputView = this.view;
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
