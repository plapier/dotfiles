(function() {
  module.exports = {
    isDarwin: function() {
      return this.platform() === 'darwin';
    },
    isWindows: function() {
      return this.platform() === 'win32';
    },
    platform: function() {
      return process.platform;
    }
  };

}).call(this);
