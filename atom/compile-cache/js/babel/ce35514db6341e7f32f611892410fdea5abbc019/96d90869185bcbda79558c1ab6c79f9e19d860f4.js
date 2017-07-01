Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Java script preparation functions

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';exports['default'] = {
  // Public: Get atom temp file directory
  //
  // Returns {String} containing atom temp file directory
  tempFilesDir: _path2['default'].join(_os2['default'].tmpdir()),

  // Public: Get class name of file in context
  //
  // * `filePath`  {String} containing file path
  //
  // Returns {String} containing class name of file
  getClassName: function getClassName(context) {
    return context.filename.replace(/\.java$/, '');
  },

  // Public: Get project path of context
  //
  // * `context`  {Object} containing current context
  //
  // Returns {String} containing the matching project path
  getProjectPath: function getProjectPath(context) {
    var projectPaths = atom.project.getPaths();
    return projectPaths.find(function (projectPath) {
      return context.filepath.includes(projectPath);
    });
  },

  // Public: Get package of file in context
  //
  // * `context`  {Object} containing current context
  //
  // Returns {String} containing class of contextual file
  getClassPackage: function getClassPackage(context) {
    var projectPath = module.exports.getProjectPath(context);
    var projectRemoved = context.filepath.replace(projectPath + '/', '');
    return projectRemoved.replace('/' + context.filename, '');
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9qYXZhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O2tCQUdlLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztBQUp2QixXQUFXLENBQUMscUJBTUc7Ozs7QUFJYixjQUFZLEVBQUUsa0JBQUssSUFBSSxDQUFDLGdCQUFHLE1BQU0sRUFBRSxDQUFDOzs7Ozs7O0FBT3BDLGNBQVksRUFBQSxzQkFBQyxPQUFPLEVBQUU7QUFDcEIsV0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDaEQ7Ozs7Ozs7QUFPRCxnQkFBYyxFQUFBLHdCQUFDLE9BQU8sRUFBRTtBQUN0QixRQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzdDLFdBQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFBLFdBQVc7YUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDakY7Ozs7Ozs7QUFPRCxpQkFBZSxFQUFBLHlCQUFDLE9BQU8sRUFBRTtBQUN2QixRQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzRCxRQUFNLGNBQWMsR0FBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBSSxXQUFXLFFBQUssRUFBRSxDQUFDLEFBQUMsQ0FBQztBQUN6RSxXQUFPLGNBQWMsQ0FBQyxPQUFPLE9BQUssT0FBTyxDQUFDLFFBQVEsRUFBSSxFQUFFLENBQUMsQ0FBQztHQUMzRDtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9qYXZhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIEphdmEgc2NyaXB0IHByZXBhcmF0aW9uIGZ1bmN0aW9uc1xuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIC8vIFB1YmxpYzogR2V0IGF0b20gdGVtcCBmaWxlIGRpcmVjdG9yeVxuICAvL1xuICAvLyBSZXR1cm5zIHtTdHJpbmd9IGNvbnRhaW5pbmcgYXRvbSB0ZW1wIGZpbGUgZGlyZWN0b3J5XG4gIHRlbXBGaWxlc0RpcjogcGF0aC5qb2luKG9zLnRtcGRpcigpKSxcblxuICAvLyBQdWJsaWM6IEdldCBjbGFzcyBuYW1lIG9mIGZpbGUgaW4gY29udGV4dFxuICAvL1xuICAvLyAqIGBmaWxlUGF0aGAgIHtTdHJpbmd9IGNvbnRhaW5pbmcgZmlsZSBwYXRoXG4gIC8vXG4gIC8vIFJldHVybnMge1N0cmluZ30gY29udGFpbmluZyBjbGFzcyBuYW1lIG9mIGZpbGVcbiAgZ2V0Q2xhc3NOYW1lKGNvbnRleHQpIHtcbiAgICByZXR1cm4gY29udGV4dC5maWxlbmFtZS5yZXBsYWNlKC9cXC5qYXZhJC8sICcnKTtcbiAgfSxcblxuICAvLyBQdWJsaWM6IEdldCBwcm9qZWN0IHBhdGggb2YgY29udGV4dFxuICAvL1xuICAvLyAqIGBjb250ZXh0YCAge09iamVjdH0gY29udGFpbmluZyBjdXJyZW50IGNvbnRleHRcbiAgLy9cbiAgLy8gUmV0dXJucyB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBtYXRjaGluZyBwcm9qZWN0IHBhdGhcbiAgZ2V0UHJvamVjdFBhdGgoY29udGV4dCkge1xuICAgIGNvbnN0IHByb2plY3RQYXRocyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuICAgIHJldHVybiBwcm9qZWN0UGF0aHMuZmluZChwcm9qZWN0UGF0aCA9PiBjb250ZXh0LmZpbGVwYXRoLmluY2x1ZGVzKHByb2plY3RQYXRoKSk7XG4gIH0sXG5cbiAgLy8gUHVibGljOiBHZXQgcGFja2FnZSBvZiBmaWxlIGluIGNvbnRleHRcbiAgLy9cbiAgLy8gKiBgY29udGV4dGAgIHtPYmplY3R9IGNvbnRhaW5pbmcgY3VycmVudCBjb250ZXh0XG4gIC8vXG4gIC8vIFJldHVybnMge1N0cmluZ30gY29udGFpbmluZyBjbGFzcyBvZiBjb250ZXh0dWFsIGZpbGVcbiAgZ2V0Q2xhc3NQYWNrYWdlKGNvbnRleHQpIHtcbiAgICBjb25zdCBwcm9qZWN0UGF0aCA9IG1vZHVsZS5leHBvcnRzLmdldFByb2plY3RQYXRoKGNvbnRleHQpO1xuICAgIGNvbnN0IHByb2plY3RSZW1vdmVkID0gKGNvbnRleHQuZmlsZXBhdGgucmVwbGFjZShgJHtwcm9qZWN0UGF0aH0vYCwgJycpKTtcbiAgICByZXR1cm4gcHJvamVjdFJlbW92ZWQucmVwbGFjZShgLyR7Y29udGV4dC5maWxlbmFtZX1gLCAnJyk7XG4gIH0sXG59O1xuIl19