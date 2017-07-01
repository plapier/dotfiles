(function() {
  var AutoComplete, Ex, ExViewModel, Input, ViewModel, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('./view-model'), ViewModel = _ref.ViewModel, Input = _ref.Input;

  AutoComplete = require('./autocomplete');

  Ex = require('./ex');

  module.exports = ExViewModel = (function(_super) {
    __extends(ExViewModel, _super);

    function ExViewModel(exCommand, withSelection) {
      this.exCommand = exCommand;
      this.confirm = __bind(this.confirm, this);
      this.decreaseHistoryEx = __bind(this.decreaseHistoryEx, this);
      this.increaseHistoryEx = __bind(this.increaseHistoryEx, this);
      this.tabAutocomplete = __bind(this.tabAutocomplete, this);
      ExViewModel.__super__.constructor.call(this, this.exCommand, {
        "class": 'command'
      });
      this.historyIndex = -1;
      if (withSelection) {
        this.view.editorElement.getModel().setText("'<,'>");
      }
      this.view.editorElement.addEventListener('keydown', this.tabAutocomplete);
      atom.commands.add(this.view.editorElement, 'core:move-up', this.increaseHistoryEx);
      atom.commands.add(this.view.editorElement, 'core:move-down', this.decreaseHistoryEx);
      this.autoComplete = new AutoComplete(Ex.getCommands());
    }

    ExViewModel.prototype.restoreHistory = function(index) {
      return this.view.editorElement.getModel().setText(this.history(index).value);
    };

    ExViewModel.prototype.history = function(index) {
      return this.exState.getExHistoryItem(index);
    };

    ExViewModel.prototype.tabAutocomplete = function(event) {
      var completed;
      if (event.keyCode === 9) {
        event.stopPropagation();
        event.preventDefault();
        completed = this.autoComplete.getAutocomplete(this.view.editorElement.getModel().getText());
        if (completed) {
          this.view.editorElement.getModel().setText(completed);
        }
        return false;
      } else {
        return this.autoComplete.resetCompletion();
      }
    };

    ExViewModel.prototype.increaseHistoryEx = function() {
      if (this.history(this.historyIndex + 1) != null) {
        this.historyIndex += 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    ExViewModel.prototype.decreaseHistoryEx = function() {
      if (this.historyIndex <= 0) {
        this.historyIndex = -1;
        return this.view.editorElement.getModel().setText('');
      } else {
        this.historyIndex -= 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    ExViewModel.prototype.confirm = function(view) {
      this.value = this.view.value;
      this.exState.pushExHistory(this);
      return ExViewModel.__super__.confirm.call(this, view);
    };

    return ExViewModel;

  })(ViewModel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC12aWV3LW1vZGVsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxxREFBQTtJQUFBOzttU0FBQTs7QUFBQSxFQUFBLE9BQXFCLE9BQUEsQ0FBUSxjQUFSLENBQXJCLEVBQUMsaUJBQUEsU0FBRCxFQUFZLGFBQUEsS0FBWixDQUFBOztBQUFBLEVBQ0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxnQkFBUixDQURmLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLE1BQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGtDQUFBLENBQUE7O0FBQWEsSUFBQSxxQkFBRSxTQUFGLEVBQWEsYUFBYixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsWUFBQSxTQUNiLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLG1FQUFBLENBQUE7QUFBQSwrREFBQSxDQUFBO0FBQUEsTUFBQSw2Q0FBTSxJQUFDLENBQUEsU0FBUCxFQUFrQjtBQUFBLFFBQUEsT0FBQSxFQUFPLFNBQVA7T0FBbEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUFBLENBRGhCLENBQUE7QUFHQSxNQUFBLElBQUcsYUFBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBcEIsQ0FBQSxDQUE4QixDQUFDLE9BQS9CLENBQXVDLE9BQXZDLENBQUEsQ0FERjtPQUhBO0FBQUEsTUFNQSxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBcEIsQ0FBcUMsU0FBckMsRUFBZ0QsSUFBQyxDQUFBLGVBQWpE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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/ex-view-model.coffee
