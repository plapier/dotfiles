(function() {
  var AtomBourbonSnippets, AtomBourbonSnippetsView, CompositeDisposable;

  AtomBourbonSnippetsView = require('./atom-bourbon-snippets-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = AtomBourbonSnippets = {
    atomBourbonSnippetsView: null,
    modalPanel: null,
    subscriptions: null,
    activate: function(state) {
      this.atomBourbonSnippetsView = new AtomBourbonSnippetsView(state.atomBourbonSnippetsViewState);
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.atomBourbonSnippetsView.getElement(),
        visible: false
      });
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-bourbon-snippets:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.modalPanel.destroy();
      this.subscriptions.dispose();
      return this.atomBourbonSnippetsView.destroy();
    },
    serialize: function() {
      return {
        atomBourbonSnippetsViewState: this.atomBourbonSnippetsView.serialize()
      };
    },
    toggle: function() {
      console.log('AtomBourbonSnippets was toggled!');
      if (this.modalPanel.isVisible()) {
        return this.modalPanel.hide();
      } else {
        return this.modalPanel.show();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9hdG9tLWJvdXJib24tc25pcHBldHMvbGliL2F0b20tYm91cmJvbi1zbmlwcGV0cy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUVBQUE7O0FBQUEsRUFBQSx1QkFBQSxHQUEwQixPQUFBLENBQVEsOEJBQVIsQ0FBMUIsQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsbUJBQUEsR0FDZjtBQUFBLElBQUEsdUJBQUEsRUFBeUIsSUFBekI7QUFBQSxJQUNBLFVBQUEsRUFBWSxJQURaO0FBQUEsSUFFQSxhQUFBLEVBQWUsSUFGZjtBQUFBLElBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsdUJBQUQsR0FBK0IsSUFBQSx1QkFBQSxDQUF3QixLQUFLLENBQUMsNEJBQTlCLENBQS9CLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLHVCQUF1QixDQUFDLFVBQXpCLENBQUEsQ0FBTjtBQUFBLFFBQTZDLE9BQUEsRUFBUyxLQUF0RDtPQUE3QixDQURkLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFKakIsQ0FBQTthQU9BLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO0FBQUEsUUFBQSw4QkFBQSxFQUFnQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQztPQUFwQyxDQUFuQixFQVJRO0lBQUEsQ0FKVjtBQUFBLElBY0EsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsdUJBQXVCLENBQUMsT0FBekIsQ0FBQSxFQUhVO0lBQUEsQ0FkWjtBQUFBLElBbUJBLFNBQUEsRUFBVyxTQUFBLEdBQUE7YUFDVDtBQUFBLFFBQUEsNEJBQUEsRUFBOEIsSUFBQyxDQUFBLHVCQUF1QixDQUFDLFNBQXpCLENBQUEsQ0FBOUI7UUFEUztJQUFBLENBbkJYO0FBQUEsSUFzQkEsTUFBQSxFQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxrQ0FBWixDQUFBLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQUEsRUFIRjtPQUhNO0lBQUEsQ0F0QlI7R0FKRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/atom-bourbon-snippets/lib/atom-bourbon-snippets.coffee
