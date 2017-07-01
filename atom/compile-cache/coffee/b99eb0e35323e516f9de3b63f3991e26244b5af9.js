(function() {
  var settings;

  settings = {
    config: {
      startInInsertMode: {
        type: 'boolean',
        "default": false
      },
      useSmartcaseForSearch: {
        type: 'boolean',
        "default": false
      },
      wrapLeftRightMotion: {
        type: 'boolean',
        "default": false
      },
      useClipboardAsDefaultRegister: {
        type: 'boolean',
        "default": true
      },
      numberRegex: {
        type: 'string',
        "default": '-?[0-9]+',
        description: 'Use this to control how Ctrl-A/Ctrl-X finds numbers; use "(?:\\B-)?[0-9]+" to treat numbers as positive if the minus is preceded by a character, e.g. in "identifier-1".'
      }
    }
  };

  Object.keys(settings.config).forEach(function(k) {
    return settings[k] = function() {
      return atom.config.get('vim-mode.' + k);
    };
  });

  settings.defaultRegister = function() {
    if (settings.useClipboardAsDefaultRegister()) {
      return '*';
    } else {
      return '"';
    }
  };

  module.exports = settings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvc2V0dGluZ3MuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQ0E7QUFBQSxNQUFBLFFBQUE7O0FBQUEsRUFBQSxRQUFBLEdBQ0U7QUFBQSxJQUFBLE1BQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BREY7QUFBQSxNQUdBLHFCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQUpGO0FBQUEsTUFNQSxtQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FQRjtBQUFBLE1BU0EsNkJBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxJQURUO09BVkY7QUFBQSxNQVlBLFdBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxVQURUO0FBQUEsUUFFQSxXQUFBLEVBQWEsMEtBRmI7T0FiRjtLQURGO0dBREYsQ0FBQTs7QUFBQSxFQW1CQSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVEsQ0FBQyxNQUFyQixDQUE0QixDQUFDLE9BQTdCLENBQXFDLFNBQUMsQ0FBRCxHQUFBO1dBQ25DLFFBQVMsQ0FBQSxDQUFBLENBQVQsR0FBYyxTQUFBLEdBQUE7YUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsV0FBQSxHQUFZLENBQTVCLEVBRFk7SUFBQSxFQURxQjtFQUFBLENBQXJDLENBbkJBLENBQUE7O0FBQUEsRUF1QkEsUUFBUSxDQUFDLGVBQVQsR0FBMkIsU0FBQSxHQUFBO0FBQ3pCLElBQUEsSUFBRyxRQUFRLENBQUMsNkJBQVQsQ0FBQSxDQUFIO2FBQWlELElBQWpEO0tBQUEsTUFBQTthQUEwRCxJQUExRDtLQUR5QjtFQUFBLENBdkIzQixDQUFBOztBQUFBLEVBMEJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBMUJqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/settings.coffee
