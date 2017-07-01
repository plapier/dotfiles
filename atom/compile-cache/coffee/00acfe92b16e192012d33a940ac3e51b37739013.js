(function() {
  module.exports = {
    config: {
      enableForIndentation: {
        type: 'boolean',
        "default": false,
        description: 'Enable highlight for lines containing only indentation'
      },
      enableForCursorLines: {
        type: 'boolean',
        "default": false,
        description: 'Enable highlight for lines containing a cursor'
      }
    },
    activate: function(state) {
      atom.config.observe('trailing-spaces.enableForIndentation', function(enable) {
        if (enable) {
          return document.body.classList.add('trailing-spaces-highlight-indentation');
        } else {
          return document.body.classList.remove('trailing-spaces-highlight-indentation');
        }
      });
      return atom.config.observe('trailing-spaces.enableForCursorLines', function(enable) {
        if (enable) {
          return document.body.classList.add('trailing-spaces-highlight-cursor-lines');
        } else {
          return document.body.classList.remove('trailing-spaces-highlight-cursor-lines');
        }
      });
    }
  };

}).call(this);
