(function() {
  var CompositeDisposable, Disposable, Ex, ExMode, ExState, GlobalExState, _ref;

  GlobalExState = require('./global-ex-state');

  ExState = require('./ex-state');

  Ex = require('./ex');

  _ref = require('event-kit'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = ExMode = {
    activate: function(state) {
      this.globalExState = new GlobalExState;
      this.disposables = new CompositeDisposable;
      this.exStates = new WeakMap;
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var element, exState;
          if (editor.mini) {
            return;
          }
          element = atom.views.getView(editor);
          if (!_this.exStates.get(editor)) {
            exState = new ExState(element, _this.globalExState);
            _this.exStates.set(editor, exState);
            return _this.disposables.add(new Disposable(function() {
              return exState.destroy();
            }));
          }
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    provideEx: function() {
      return {
        registerCommand: Ex.registerCommand.bind(Ex),
        registerAlias: Ex.registerAlias.bind(Ex)
      };
    },
    consumeVim: function(vim) {
      this.vim = vim;
      return this.globalExState.setVim(vim);
    },
    config: {
      splitbelow: {
        title: 'Split below',
        description: 'when splitting, split from below',
        type: 'boolean',
        "default": 'false'
      },
      splitright: {
        title: 'Split right',
        description: 'when splitting, split from right',
        type: 'boolean',
        "default": 'false'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC1tb2RlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5RUFBQTs7QUFBQSxFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSLENBQWhCLENBQUE7O0FBQUEsRUFDQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVIsQ0FEVixDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLE9BQW9DLE9BQUEsQ0FBUSxXQUFSLENBQXBDLEVBQUMsa0JBQUEsVUFBRCxFQUFhLDJCQUFBLG1CQUhiLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUFpQixNQUFBLEdBQ2Y7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLGFBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FBQSxDQUFBLG1CQURmLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFELEdBQVksR0FBQSxDQUFBLE9BRlosQ0FBQTthQUlBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE1BQUQsR0FBQTtBQUNqRCxjQUFBLGdCQUFBO0FBQUEsVUFBQSxJQUFVLE1BQU0sQ0FBQyxJQUFqQjtBQUFBLGtCQUFBLENBQUE7V0FBQTtBQUFBLFVBRUEsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixDQUZWLENBQUE7QUFJQSxVQUFBLElBQUcsQ0FBQSxLQUFLLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLENBQVA7QUFDRSxZQUFBLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FDWixPQURZLEVBRVosS0FBQyxDQUFBLGFBRlcsQ0FBZCxDQUFBO0FBQUEsWUFLQSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLE9BQXRCLENBTEEsQ0FBQTttQkFPQSxLQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBcUIsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO3FCQUM5QixPQUFPLENBQUMsT0FBUixDQUFBLEVBRDhCO1lBQUEsQ0FBWCxDQUFyQixFQVJGO1dBTGlEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBakIsRUFMUTtJQUFBLENBQVY7QUFBQSxJQXFCQSxVQUFBLEVBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsRUFEVTtJQUFBLENBckJaO0FBQUEsSUF3QkEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFBQSxlQUFBLEVBQWlCLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBbkIsQ0FBd0IsRUFBeEIsQ0FBakI7QUFBQSxRQUNBLGFBQUEsRUFBZSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQWpCLENBQXNCLEVBQXRCLENBRGY7UUFEUztJQUFBLENBeEJYO0FBQUEsSUE0QkEsVUFBQSxFQUFZLFNBQUMsR0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLEdBQVAsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixHQUF0QixFQUZVO0lBQUEsQ0E1Qlo7QUFBQSxJQWdDQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFVBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGFBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxrQ0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxPQUhUO09BREY7QUFBQSxNQUtBLFVBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGFBQVA7QUFBQSxRQUNBLFdBQUEsRUFBYSxrQ0FEYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxPQUhUO09BTkY7S0FqQ0Y7R0FORixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/ex-mode.coffee
