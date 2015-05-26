(function() {
  var ScssSortView;

  module.exports = ScssSortView = (function() {
    function ScssSortView(serializedState) {
      var message;
      this.element = document.createElement('div');
      this.element.classList.add('scss-sort');
      message = document.createElement('div');
      message.textContent = "The ScssSort package is Alive! It's ALIVE!";
      message.classList.add('message');
      this.element.appendChild(message);
    }

    ScssSortView.prototype.serialize = function() {};

    ScssSortView.prototype.destroy = function() {
      return this.element.remove();
    };

    ScssSortView.prototype.getElement = function() {
      return this.element;
    };

    return ScssSortView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFlBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSxzQkFBQyxlQUFELEdBQUE7QUFFWCxVQUFBLE9BQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixXQUF2QixDQURBLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUpWLENBQUE7QUFBQSxNQUtBLE9BQU8sQ0FBQyxXQUFSLEdBQXNCLDRDQUx0QixDQUFBO0FBQUEsTUFNQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENBQXNCLFNBQXRCLENBTkEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLE9BQXJCLENBUEEsQ0FGVztJQUFBLENBQWI7O0FBQUEsMkJBWUEsU0FBQSxHQUFXLFNBQUEsR0FBQSxDQVpYLENBQUE7O0FBQUEsMkJBZUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBLEVBRE87SUFBQSxDQWZULENBQUE7O0FBQUEsMkJBa0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsUUFEUztJQUFBLENBbEJaLENBQUE7O3dCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/lapier/github/scss-sort/lib/scss-sort-view.coffee