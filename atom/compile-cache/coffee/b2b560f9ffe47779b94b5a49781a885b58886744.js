(function() {
  module.exports = {
    createTempFileWithCode: (function(_this) {
      return function(code) {
        if (!/^[\s]*<\?php/.test(code)) {
          code = "<?php " + code;
        }
        return module.parent.exports.createTempFileWithCode(code);
      };
    })(this)
  };

}).call(this);
