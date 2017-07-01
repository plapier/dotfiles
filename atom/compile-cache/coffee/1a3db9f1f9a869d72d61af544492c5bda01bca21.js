(function() {
  var Command, CommandError, CompositeDisposable, Disposable, Emitter, ExState, _ref;

  _ref = require('event-kit'), Emitter = _ref.Emitter, Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  Command = require('./command');

  CommandError = require('./command-error');

  ExState = (function() {
    function ExState(editorElement, globalExState) {
      this.editorElement = editorElement;
      this.globalExState = globalExState;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.editorElement.getModel();
      this.opStack = [];
      this.history = [];
      this.registerOperationCommands({
        open: (function(_this) {
          return function(e) {
            return new Command(_this.editor, _this);
          };
        })(this)
      });
    }

    ExState.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    ExState.prototype.getExHistoryItem = function(index) {
      return this.globalExState.commandHistory[index];
    };

    ExState.prototype.pushExHistory = function(command) {
      return this.globalExState.commandHistory.unshift(command);
    };

    ExState.prototype.registerOperationCommands = function(commands) {
      var commandName, fn, _results;
      _results = [];
      for (commandName in commands) {
        fn = commands[commandName];
        _results.push((function(_this) {
          return function(fn) {
            var pushFn;
            pushFn = function(e) {
              return _this.pushOperations(fn(e));
            };
            return _this.subscriptions.add(atom.commands.add(_this.editorElement, "ex-mode:" + commandName, pushFn));
          };
        })(this)(fn));
      }
      return _results;
    };

    ExState.prototype.onDidFailToExecute = function(fn) {
      return this.emitter.on('failed-to-execute', fn);
    };

    ExState.prototype.onDidProcessOpStack = function(fn) {
      return this.emitter.on('processed-op-stack', fn);
    };

    ExState.prototype.pushOperations = function(operations) {
      this.opStack.push(operations);
      if (this.opStack.length === 2) {
        return this.processOpStack();
      }
    };

    ExState.prototype.clearOpStack = function() {
      return this.opStack = [];
    };

    ExState.prototype.processOpStack = function() {
      var command, e, input, _ref1;
      _ref1 = this.opStack, command = _ref1[0], input = _ref1[1];
      if (input.characters.length > 0) {
        this.history.unshift(command);
        try {
          command.execute(input);
        } catch (_error) {
          e = _error;
          if (e instanceof CommandError) {
            atom.notifications.addError("Command error: " + e.message);
            this.emitter.emit('failed-to-execute');
          } else {
            throw e;
          }
        }
      }
      this.clearOpStack();
      return this.emitter.emit('processed-op-stack');
    };

    return ExState;

  })();

  module.exports = ExState;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC1zdGF0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEVBQUE7O0FBQUEsRUFBQSxPQUE2QyxPQUFBLENBQVEsV0FBUixDQUE3QyxFQUFDLGVBQUEsT0FBRCxFQUFVLGtCQUFBLFVBQVYsRUFBc0IsMkJBQUEsbUJBQXRCLENBQUE7O0FBQUEsRUFFQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVIsQ0FGVixDQUFBOztBQUFBLEVBR0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUhmLENBQUE7O0FBQUEsRUFLTTtBQUNTLElBQUEsaUJBQUUsYUFBRixFQUFrQixhQUFsQixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsZ0JBQUEsYUFDYixDQUFBO0FBQUEsTUFENEIsSUFBQyxDQUFBLGdCQUFBLGFBQzdCLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsR0FBQSxDQUFBLG1CQURqQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxhQUFhLENBQUMsUUFBZixDQUFBLENBRlYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUhYLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxPQUFELEdBQVcsRUFKWCxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEseUJBQUQsQ0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxDQUFELEdBQUE7bUJBQVcsSUFBQSxPQUFBLENBQVEsS0FBQyxDQUFBLE1BQVQsRUFBaUIsS0FBakIsRUFBWDtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQU47T0FERixDQU5BLENBRFc7SUFBQSxDQUFiOztBQUFBLHNCQVVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURPO0lBQUEsQ0FWVCxDQUFBOztBQUFBLHNCQWFBLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxHQUFBO2FBQ2hCLElBQUMsQ0FBQSxhQUFhLENBQUMsY0FBZSxDQUFBLEtBQUEsRUFEZDtJQUFBLENBYmxCLENBQUE7O0FBQUEsc0JBZ0JBLGFBQUEsR0FBZSxTQUFDLE9BQUQsR0FBQTthQUNiLElBQUMsQ0FBQSxhQUFhLENBQUMsY0FBYyxDQUFDLE9BQTlCLENBQXNDLE9BQXRDLEVBRGE7SUFBQSxDQWhCZixDQUFBOztBQUFBLHNCQW1CQSx5QkFBQSxHQUEyQixTQUFDLFFBQUQsR0FBQTtBQUN6QixVQUFBLHlCQUFBO0FBQUE7V0FBQSx1QkFBQTttQ0FBQTtBQUNFLHNCQUFHLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxFQUFELEdBQUE7QUFDRCxnQkFBQSxNQUFBO0FBQUEsWUFBQSxNQUFBLEdBQVMsU0FBQyxDQUFELEdBQUE7cUJBQU8sS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsRUFBQSxDQUFHLENBQUgsQ0FBaEIsRUFBUDtZQUFBLENBQVQsQ0FBQTttQkFDQSxLQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FDRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsS0FBQyxDQUFBLGFBQW5CLEVBQW1DLFVBQUEsR0FBVSxXQUE3QyxFQUE0RCxNQUE1RCxDQURGLEVBRkM7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFILENBQUksRUFBSixFQUFBLENBREY7QUFBQTtzQkFEeUI7SUFBQSxDQW5CM0IsQ0FBQTs7QUFBQSxzQkEyQkEsa0JBQUEsR0FBb0IsU0FBQyxFQUFELEdBQUE7YUFDbEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksbUJBQVosRUFBaUMsRUFBakMsRUFEa0I7SUFBQSxDQTNCcEIsQ0FBQTs7QUFBQSxzQkE4QkEsbUJBQUEsR0FBcUIsU0FBQyxFQUFELEdBQUE7YUFDbkIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksb0JBQVosRUFBa0MsRUFBbEMsRUFEbUI7SUFBQSxDQTlCckIsQ0FBQTs7QUFBQSxzQkFpQ0EsY0FBQSxHQUFnQixTQUFDLFVBQUQsR0FBQTtBQUNkLE1BQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsVUFBZCxDQUFBLENBQUE7QUFFQSxNQUFBLElBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxLQUFtQixDQUF4QztlQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsRUFBQTtPQUhjO0lBQUEsQ0FqQ2hCLENBQUE7O0FBQUEsc0JBc0NBLFlBQUEsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFDLENBQUEsT0FBRCxHQUFXLEdBREM7SUFBQSxDQXRDZCxDQUFBOztBQUFBLHNCQXlDQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsd0JBQUE7QUFBQSxNQUFBLFFBQW1CLElBQUMsQ0FBQSxPQUFwQixFQUFDLGtCQUFELEVBQVUsZ0JBQVYsQ0FBQTtBQUNBLE1BQUEsSUFBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWpCLEdBQTBCLENBQTdCO0FBQ0UsUUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsT0FBakIsQ0FBQSxDQUFBO0FBQ0E7QUFDRSxVQUFBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEtBQWhCLENBQUEsQ0FERjtTQUFBLGNBQUE7QUFHRSxVQURJLFVBQ0osQ0FBQTtBQUFBLFVBQUEsSUFBSSxDQUFBLFlBQWEsWUFBakI7QUFDRSxZQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNkIsaUJBQUEsR0FBaUIsQ0FBQyxDQUFDLE9BQWhELENBQUEsQ0FBQTtBQUFBLFlBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsbUJBQWQsQ0FEQSxDQURGO1dBQUEsTUFBQTtBQUlFLGtCQUFNLENBQU4sQ0FKRjtXQUhGO1NBRkY7T0FEQTtBQUFBLE1BV0EsSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQVhBLENBQUE7YUFZQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxvQkFBZCxFQWJjO0lBQUEsQ0F6Q2hCLENBQUE7O21CQUFBOztNQU5GLENBQUE7O0FBQUEsRUE4REEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsT0E5RGpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/ex-state.coffee
