(function() {
  var VimOption,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  VimOption = (function() {
    function VimOption() {
      this.nonu = __bind(this.nonu, this);
      this.nonumber = __bind(this.nonumber, this);
      this.nu = __bind(this.nu, this);
      this.number = __bind(this.number, this);
      this.nolist = __bind(this.nolist, this);
      this.list = __bind(this.list, this);
    }

    VimOption.singleton = function() {
      return VimOption.option || (VimOption.option = new VimOption);
    };

    VimOption.prototype.list = function() {
      return atom.config.set("editor.showInvisibles", true);
    };

    VimOption.prototype.nolist = function() {
      return atom.config.set("editor.showInvisibles", false);
    };

    VimOption.prototype.number = function() {
      return atom.config.set("editor.showLineNumbers", true);
    };

    VimOption.prototype.nu = function() {
      return this.number();
    };

    VimOption.prototype.nonumber = function() {
      return atom.config.set("editor.showLineNumbers", false);
    };

    VimOption.prototype.nonu = function() {
      return this.nonumber();
    };

    return VimOption;

  })();

  module.exports = VimOption;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi92aW0tb3B0aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxTQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBTTs7Ozs7Ozs7S0FDSjs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxTQUFELEdBQVksU0FBQSxHQUFBO2FBQ1YsU0FBQyxDQUFBLFdBQUQsU0FBQyxDQUFBLFNBQVcsR0FBQSxDQUFBLFdBREY7SUFBQSxDQUFaLENBQUE7O0FBQUEsd0JBR0EsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsSUFBekMsRUFESTtJQUFBLENBSE4sQ0FBQTs7QUFBQSx3QkFNQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxLQUF6QyxFQURNO0lBQUEsQ0FOUixDQUFBOztBQUFBLHdCQVNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLElBQTFDLEVBRE07SUFBQSxDQVRSLENBQUE7O0FBQUEsd0JBWUEsRUFBQSxHQUFJLFNBQUEsR0FBQTthQUNGLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERTtJQUFBLENBWkosQ0FBQTs7QUFBQSx3QkFlQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxLQUExQyxFQURRO0lBQUEsQ0FmVixDQUFBOztBQUFBLHdCQWtCQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQURJO0lBQUEsQ0FsQk4sQ0FBQTs7cUJBQUE7O01BREYsQ0FBQTs7QUFBQSxFQXNCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQXRCakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/vim-option.coffee
