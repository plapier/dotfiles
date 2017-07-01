(function() {
  var ContentsByMode, StatusBarManager;

  ContentsByMode = {
    'insert': ["status-bar-vim-mode-insert", "Insert"],
    'insert.replace': ["status-bar-vim-mode-insert", "Replace"],
    'normal': ["status-bar-vim-mode-normal", "Normal"],
    'visual': ["status-bar-vim-mode-visual", "Visual"],
    'visual.characterwise': ["status-bar-vim-mode-visual", "Visual"],
    'visual.linewise': ["status-bar-vim-mode-visual", "Visual Line"],
    'visual.blockwise': ["status-bar-vim-mode-visual", "Visual Block"]
  };

  module.exports = StatusBarManager = (function() {
    function StatusBarManager() {
      this.element = document.createElement("div");
      this.element.id = "status-bar-vim-mode";
      this.container = document.createElement("div");
      this.container.className = "inline-block";
      this.container.appendChild(this.element);
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(currentMode, currentSubmode) {
      var klass, newContents, text;
      if (currentSubmode != null) {
        currentMode = currentMode + "." + currentSubmode;
      }
      if (newContents = ContentsByMode[currentMode]) {
        klass = newContents[0], text = newContents[1];
        this.element.className = klass;
        return this.element.textContent = text;
      } else {
        return this.hide();
      }
    };

    StatusBarManager.prototype.hide = function() {
      return this.element.className = 'hidden';
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvc3RhdHVzLWJhci1tYW5hZ2VyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQ0FBQTs7QUFBQSxFQUFBLGNBQUEsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLENBQUMsNEJBQUQsRUFBK0IsUUFBL0IsQ0FBVjtBQUFBLElBQ0EsZ0JBQUEsRUFBa0IsQ0FBQyw0QkFBRCxFQUErQixTQUEvQixDQURsQjtBQUFBLElBRUEsUUFBQSxFQUFVLENBQUMsNEJBQUQsRUFBK0IsUUFBL0IsQ0FGVjtBQUFBLElBR0EsUUFBQSxFQUFVLENBQUMsNEJBQUQsRUFBK0IsUUFBL0IsQ0FIVjtBQUFBLElBSUEsc0JBQUEsRUFBd0IsQ0FBQyw0QkFBRCxFQUErQixRQUEvQixDQUp4QjtBQUFBLElBS0EsaUJBQUEsRUFBbUIsQ0FBQyw0QkFBRCxFQUErQixhQUEvQixDQUxuQjtBQUFBLElBTUEsa0JBQUEsRUFBb0IsQ0FBQyw0QkFBRCxFQUErQixjQUEvQixDQU5wQjtHQURGLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSwwQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULEdBQWMscUJBRGQsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUhiLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxHQUF1QixjQUp2QixDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsU0FBUyxDQUFDLFdBQVgsQ0FBdUIsSUFBQyxDQUFBLE9BQXhCLENBTEEsQ0FEVztJQUFBLENBQWI7O0FBQUEsK0JBUUEsVUFBQSxHQUFZLFNBQUUsU0FBRixHQUFBO0FBQWMsTUFBYixJQUFDLENBQUEsWUFBQSxTQUFZLENBQWQ7SUFBQSxDQVJaLENBQUE7O0FBQUEsK0JBVUEsTUFBQSxHQUFRLFNBQUMsV0FBRCxFQUFjLGNBQWQsR0FBQTtBQUNOLFVBQUEsd0JBQUE7QUFBQSxNQUFBLElBQW9ELHNCQUFwRDtBQUFBLFFBQUEsV0FBQSxHQUFjLFdBQUEsR0FBYyxHQUFkLEdBQW9CLGNBQWxDLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBRyxXQUFBLEdBQWMsY0FBZSxDQUFBLFdBQUEsQ0FBaEM7QUFDRSxRQUFDLHNCQUFELEVBQVEscUJBQVIsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXFCLEtBRHJCLENBQUE7ZUFFQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUIsS0FIekI7T0FBQSxNQUFBO2VBS0UsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUxGO09BRk07SUFBQSxDQVZSLENBQUE7O0FBQUEsK0JBbUJBLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFDSixJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsR0FBcUIsU0FEakI7SUFBQSxDQW5CTixDQUFBOztBQUFBLCtCQXdCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0I7QUFBQSxRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBUDtBQUFBLFFBQWtCLFFBQUEsRUFBVSxFQUE1QjtPQUF4QixFQURGO0lBQUEsQ0F4QlIsQ0FBQTs7QUFBQSwrQkEyQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBLEVBRE07SUFBQSxDQTNCUixDQUFBOzs0QkFBQTs7TUFYRixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/status-bar-manager.coffee
