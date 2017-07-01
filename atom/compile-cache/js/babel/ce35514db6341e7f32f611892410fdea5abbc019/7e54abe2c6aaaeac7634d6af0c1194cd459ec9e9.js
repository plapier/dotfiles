Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Require some libs used for creating temporary files

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

// Public: GrammarUtils.MATLAB - a module which assist the creation of MATLAB temporary files
'use babel';exports['default'] = {
  tempFilesDir: _path2['default'].join(_os2['default'].tmpdir(), 'atom_script_tempfiles'),

  // Public: Create a temporary file with the provided MATLAB code
  //
  // * `code`    A {String} containing some MATLAB code
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    try {
      if (!_fs2['default'].existsSync(this.tempFilesDir)) {
        _fs2['default'].mkdirSync(this.tempFilesDir);
      }

      var tempFilePath = this.tempFilesDir + _path2['default'].sep + 'm' + _uuid2['default'].v1().split('-').join('_') + '.m';

      var file = _fs2['default'].openSync(tempFilePath, 'w');
      _fs2['default'].writeSync(file, code);
      _fs2['default'].closeSync(file);

      return tempFilePath;
    } catch (error) {
      throw new Error('Error while creating temporary file (' + error + ')');
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9tYXRsYWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0JBR2UsSUFBSTs7OztrQkFDSixJQUFJOzs7O29CQUNGLE1BQU07Ozs7b0JBQ04sTUFBTTs7Ozs7QUFOdkIsV0FBVyxDQUFDLHFCQVNHO0FBQ2IsY0FBWSxFQUFFLGtCQUFLLElBQUksQ0FBQyxnQkFBRyxNQUFNLEVBQUUsRUFBRSx1QkFBdUIsQ0FBQzs7Ozs7OztBQU83RCx3QkFBc0IsRUFBQSxnQ0FBQyxJQUFJLEVBQUU7QUFDM0IsUUFBSTtBQUNGLFVBQUksQ0FBQyxnQkFBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQUUsd0JBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUFFOztBQUUzRSxVQUFNLFlBQVksR0FBTSxJQUFJLENBQUMsWUFBWSxHQUFHLGtCQUFLLEdBQUcsU0FBSSxrQkFBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFJLENBQUM7O0FBRTNGLFVBQU0sSUFBSSxHQUFHLGdCQUFHLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUMsc0JBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QixzQkFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRW5CLGFBQU8sWUFBWSxDQUFDO0tBQ3JCLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxZQUFNLElBQUksS0FBSywyQ0FBeUMsS0FBSyxPQUFJLENBQUM7S0FDbkU7R0FDRjtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9tYXRsYWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy8gUmVxdWlyZSBzb21lIGxpYnMgdXNlZCBmb3IgY3JlYXRpbmcgdGVtcG9yYXJ5IGZpbGVzXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHV1aWQgZnJvbSAndXVpZCc7XG5cbi8vIFB1YmxpYzogR3JhbW1hclV0aWxzLk1BVExBQiAtIGEgbW9kdWxlIHdoaWNoIGFzc2lzdCB0aGUgY3JlYXRpb24gb2YgTUFUTEFCIHRlbXBvcmFyeSBmaWxlc1xuZXhwb3J0IGRlZmF1bHQge1xuICB0ZW1wRmlsZXNEaXI6IHBhdGguam9pbihvcy50bXBkaXIoKSwgJ2F0b21fc2NyaXB0X3RlbXBmaWxlcycpLFxuXG4gIC8vIFB1YmxpYzogQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpbGUgd2l0aCB0aGUgcHJvdmlkZWQgTUFUTEFCIGNvZGVcbiAgLy9cbiAgLy8gKiBgY29kZWAgICAgQSB7U3RyaW5nfSBjb250YWluaW5nIHNvbWUgTUFUTEFCIGNvZGVcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUge1N0cmluZ30gZmlsZXBhdGggb2YgdGhlIG5ldyBmaWxlXG4gIGNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy50ZW1wRmlsZXNEaXIpKSB7IGZzLm1rZGlyU3luYyh0aGlzLnRlbXBGaWxlc0Rpcik7IH1cblxuICAgICAgY29uc3QgdGVtcEZpbGVQYXRoID0gYCR7dGhpcy50ZW1wRmlsZXNEaXIgKyBwYXRoLnNlcH1tJHt1dWlkLnYxKCkuc3BsaXQoJy0nKS5qb2luKCdfJyl9Lm1gO1xuXG4gICAgICBjb25zdCBmaWxlID0gZnMub3BlblN5bmModGVtcEZpbGVQYXRoLCAndycpO1xuICAgICAgZnMud3JpdGVTeW5jKGZpbGUsIGNvZGUpO1xuICAgICAgZnMuY2xvc2VTeW5jKGZpbGUpO1xuXG4gICAgICByZXR1cm4gdGVtcEZpbGVQYXRoO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGNyZWF0aW5nIHRlbXBvcmFyeSBmaWxlICgke2Vycm9yfSlgKTtcbiAgICB9XG4gIH0sXG59O1xuIl19