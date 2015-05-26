(function() {
  var CommandError;

  CommandError = (function() {
    function CommandError(message) {
      this.message = message;
      this.name = 'Command Error';
    }

    return CommandError;

  })();

  module.exports = CommandError;

}).call(this);
