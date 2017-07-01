(function() {
  var VimOption,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  VimOption = (function() {
    function VimOption() {
      this.noscs = __bind(this.noscs, this);
      this.nosmartcase = __bind(this.nosmartcase, this);
      this.scs = __bind(this.scs, this);
      this.smartcase = __bind(this.smartcase, this);
      this.nosb = __bind(this.nosb, this);
      this.nosplitbelow = __bind(this.nosplitbelow, this);
      this.sb = __bind(this.sb, this);
      this.splitbelow = __bind(this.splitbelow, this);
      this.nospr = __bind(this.nospr, this);
      this.nosplitright = __bind(this.nosplitright, this);
      this.spr = __bind(this.spr, this);
      this.splitright = __bind(this.splitright, this);
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

    VimOption.prototype.splitright = function() {
      return atom.config.set("ex-mode.splitright", true);
    };

    VimOption.prototype.spr = function() {
      return this.splitright();
    };

    VimOption.prototype.nosplitright = function() {
      return atom.config.set("ex-mode.splitright", false);
    };

    VimOption.prototype.nospr = function() {
      return this.nosplitright();
    };

    VimOption.prototype.splitbelow = function() {
      return atom.config.set("ex-mode.splitbelow", true);
    };

    VimOption.prototype.sb = function() {
      return this.splitbelow();
    };

    VimOption.prototype.nosplitbelow = function() {
      return atom.config.set("ex-mode.splitbelow", false);
    };

    VimOption.prototype.nosb = function() {
      return this.nosplitbelow();
    };

    VimOption.prototype.smartcase = function() {
      return atom.config.set("vim-mode.useSmartcaseForSearch", true);
    };

    VimOption.prototype.scs = function() {
      return this.smartcase();
    };

    VimOption.prototype.nosmartcase = function() {
      return atom.config.set("vim-mode.useSmartcaseForSearch", false);
    };

    VimOption.prototype.noscs = function() {
      return this.nosmartcase();
    };

    return VimOption;

  })();

  module.exports = VimOption;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi92aW0tb3B0aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxTQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FDSjs7QUFBQSxJQUFBLFNBQUMsQ0FBQSxTQUFELEdBQVksU0FBQSxHQUFBO2FBQ1YsU0FBQyxDQUFBLFdBQUQsU0FBQyxDQUFBLFNBQVcsR0FBQSxDQUFBLFdBREY7SUFBQSxDQUFaLENBQUE7O0FBQUEsd0JBR0EsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsSUFBekMsRUFESTtJQUFBLENBSE4sQ0FBQTs7QUFBQSx3QkFNQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxLQUF6QyxFQURNO0lBQUEsQ0FOUixDQUFBOztBQUFBLHdCQVNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLElBQTFDLEVBRE07SUFBQSxDQVRSLENBQUE7O0FBQUEsd0JBWUEsRUFBQSxHQUFJLFNBQUEsR0FBQTthQUNGLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERTtJQUFBLENBWkosQ0FBQTs7QUFBQSx3QkFlQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxLQUExQyxFQURRO0lBQUEsQ0FmVixDQUFBOztBQUFBLHdCQWtCQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQURJO0lBQUEsQ0FsQk4sQ0FBQTs7QUFBQSx3QkFxQkEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsSUFBdEMsRUFEVTtJQUFBLENBckJaLENBQUE7O0FBQUEsd0JBd0JBLEdBQUEsR0FBSyxTQUFBLEdBQUE7YUFDSCxJQUFDLENBQUEsVUFBRCxDQUFBLEVBREc7SUFBQSxDQXhCTCxDQUFBOztBQUFBLHdCQTJCQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxLQUF0QyxFQURZO0lBQUEsQ0EzQmQsQ0FBQTs7QUFBQSx3QkE4QkEsS0FBQSxHQUFPLFNBQUEsR0FBQTthQUNMLElBQUMsQ0FBQSxZQUFELENBQUEsRUFESztJQUFBLENBOUJQLENBQUE7O0FBQUEsd0JBaUNBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLElBQXRDLEVBRFU7SUFBQSxDQWpDWixDQUFBOztBQUFBLHdCQW9DQSxFQUFBLEdBQUksU0FBQSxHQUFBO2FBQ0YsSUFBQyxDQUFBLFVBQUQsQ0FBQSxFQURFO0lBQUEsQ0FwQ0osQ0FBQTs7QUFBQSx3QkF1Q0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsS0FBdEMsRUFEWTtJQUFBLENBdkNkLENBQUE7O0FBQUEsd0JBMENBLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFDSixJQUFDLENBQUEsWUFBRCxDQUFBLEVBREk7SUFBQSxDQTFDTixDQUFBOztBQUFBLHdCQTZDQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixFQUFrRCxJQUFsRCxFQURTO0lBQUEsQ0E3Q1gsQ0FBQTs7QUFBQSx3QkFnREEsR0FBQSxHQUFLLFNBQUEsR0FBQTthQUNILElBQUMsQ0FBQSxTQUFELENBQUEsRUFERztJQUFBLENBaERMLENBQUE7O0FBQUEsd0JBbURBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLEVBQWtELEtBQWxELEVBRFc7SUFBQSxDQW5EYixDQUFBOztBQUFBLHdCQXNEQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsSUFBQyxDQUFBLFdBQUQsQ0FBQSxFQURLO0lBQUEsQ0F0RFAsQ0FBQTs7cUJBQUE7O01BREYsQ0FBQTs7QUFBQSxFQTBEQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQTFEakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/vim-option.coffee
