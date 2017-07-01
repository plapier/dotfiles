Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

// Public: GrammarUtils.OperatingSystem - a module which exposes different
// platform related helper functions.
'use babel';

exports['default'] = {
  isDarwin: function isDarwin() {
    return this.platform() === 'darwin';
  },

  isWindows: function isWindows() {
    return this.platform() === 'win32';
  },

  isLinux: function isLinux() {
    return this.platform() === 'linux';
  },

  platform: function platform() {
    return _os2['default'].platform();
  },

  release: function release() {
    return _os2['default'].release();
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9vcGVyYXRpbmctc3lzdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztrQkFFZSxJQUFJOzs7Ozs7QUFGbkIsV0FBVyxDQUFDOztxQkFNRztBQUNiLFVBQVEsRUFBQSxvQkFBRztBQUNULFdBQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQztHQUNyQzs7QUFFRCxXQUFTLEVBQUEscUJBQUc7QUFDVixXQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLENBQUM7R0FDcEM7O0FBRUQsU0FBTyxFQUFBLG1CQUFHO0FBQ1IsV0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDO0dBQ3BDOztBQUVELFVBQVEsRUFBQSxvQkFBRztBQUNULFdBQU8sZ0JBQUcsUUFBUSxFQUFFLENBQUM7R0FDdEI7O0FBRUQsU0FBTyxFQUFBLG1CQUFHO0FBQ1IsV0FBTyxnQkFBRyxPQUFPLEVBQUUsQ0FBQztHQUNyQjtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9vcGVyYXRpbmctc3lzdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBvcyBmcm9tICdvcyc7XG5cbi8vIFB1YmxpYzogR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbSAtIGEgbW9kdWxlIHdoaWNoIGV4cG9zZXMgZGlmZmVyZW50XG4vLyBwbGF0Zm9ybSByZWxhdGVkIGhlbHBlciBmdW5jdGlvbnMuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGlzRGFyd2luKCkge1xuICAgIHJldHVybiB0aGlzLnBsYXRmb3JtKCkgPT09ICdkYXJ3aW4nO1xuICB9LFxuXG4gIGlzV2luZG93cygpIHtcbiAgICByZXR1cm4gdGhpcy5wbGF0Zm9ybSgpID09PSAnd2luMzInO1xuICB9LFxuXG4gIGlzTGludXgoKSB7XG4gICAgcmV0dXJuIHRoaXMucGxhdGZvcm0oKSA9PT0gJ2xpbnV4JztcbiAgfSxcblxuICBwbGF0Zm9ybSgpIHtcbiAgICByZXR1cm4gb3MucGxhdGZvcm0oKTtcbiAgfSxcblxuICByZWxlYXNlKCkge1xuICAgIHJldHVybiBvcy5yZWxlYXNlKCk7XG4gIH0sXG59O1xuIl19