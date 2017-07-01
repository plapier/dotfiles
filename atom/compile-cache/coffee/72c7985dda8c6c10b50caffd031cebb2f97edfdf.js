(function() {
  var Range;

  Range = require('atom').Range;

  module.exports = {
    copyType: function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'character';
      }
    },
    mergeRanges: function(oldRange, newRange) {
      oldRange = Range.fromObject(oldRange);
      newRange = Range.fromObject(newRange);
      if (oldRange.isEmpty()) {
        return newRange;
      } else {
        return oldRange.union(newRange);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvdXRpbHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLEtBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FPRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsTUFBQSxJQUFHLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLENBQUEsS0FBMEIsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUEzQztlQUNFLFdBREY7T0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakIsQ0FBQSxLQUEwQixJQUFJLENBQUMsTUFBTCxHQUFjLENBQTNDO2VBQ0gsV0FERztPQUFBLE1BQUE7ZUFHSCxZQUhHO09BSEc7SUFBQSxDQUFWO0FBQUEsSUFXQSxXQUFBLEVBQWEsU0FBQyxRQUFELEVBQVcsUUFBWCxHQUFBO0FBQ1gsTUFBQSxRQUFBLEdBQVcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsUUFBakIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsUUFBakIsQ0FEWCxDQUFBO0FBRUEsTUFBQSxJQUFHLFFBQVEsQ0FBQyxPQUFULENBQUEsQ0FBSDtlQUNFLFNBREY7T0FBQSxNQUFBO2VBR0UsUUFBUSxDQUFDLEtBQVQsQ0FBZSxRQUFmLEVBSEY7T0FIVztJQUFBLENBWGI7R0FURixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/utils.coffee
