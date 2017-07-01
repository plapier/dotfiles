(function() {
  var AtomBourbonSnippetsView;

  module.exports = AtomBourbonSnippetsView = (function() {
    function AtomBourbonSnippetsView(serializedState) {
      var message;
      this.element = document.createElement('div');
      this.element.classList.add('atom-bourbon-snippets');
      message = document.createElement('div');
      message.textContent = "The AtomBourbonSnippets package is Alive! It's ALIVE!";
      message.classList.add('message');
      this.element.appendChild(message);
    }

    AtomBourbonSnippetsView.prototype.serialize = function() {};

    AtomBourbonSnippetsView.prototype.destroy = function() {
      return this.element.remove();
    };

    AtomBourbonSnippetsView.prototype.getElement = function() {
      return this.element;
    };

    return AtomBourbonSnippetsView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9hdG9tLWJvdXJib24tc25pcHBldHMvbGliL2F0b20tYm91cmJvbi1zbmlwcGV0cy12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx1QkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDUyxJQUFBLGlDQUFDLGVBQUQsR0FBQTtBQUVYLFVBQUEsT0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLHVCQUF2QixDQURBLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUpWLENBQUE7QUFBQSxNQUtBLE9BQU8sQ0FBQyxXQUFSLEdBQXNCLHVEQUx0QixDQUFBO0FBQUEsTUFNQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENBQXNCLFNBQXRCLENBTkEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLE9BQXJCLENBUEEsQ0FGVztJQUFBLENBQWI7O0FBQUEsc0NBWUEsU0FBQSxHQUFXLFNBQUEsR0FBQSxDQVpYLENBQUE7O0FBQUEsc0NBZUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBLEVBRE87SUFBQSxDQWZULENBQUE7O0FBQUEsc0NBa0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsUUFEUztJQUFBLENBbEJaLENBQUE7O21DQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/atom-bourbon-snippets/lib/atom-bourbon-snippets-view.coffee
