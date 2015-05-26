(function() {
  var GlobalExState;

  GlobalExState = (function() {
    function GlobalExState() {}

    GlobalExState.prototype.commandHistory = [];

    GlobalExState.prototype.setVim = function(vim) {
      this.vim = vim;
    };

    return GlobalExState;

  })();

  module.exports = GlobalExState;

}).call(this);
