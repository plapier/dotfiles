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

// Public: GrammarUtils.D - a module which assist the creation of D temporary files
'use babel';exports['default'] = {
  tempFilesDir: _path2['default'].join(_os2['default'].tmpdir(), 'atom_script_tempfiles'),

  // Public: Create a temporary file with the provided D code
  //
  // * `code`    A {String} containing some D code
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    try {
      if (!_fs2['default'].existsSync(this.tempFilesDir)) {
        _fs2['default'].mkdirSync(this.tempFilesDir);
      }

      var tempFilePath = this.tempFilesDir + _path2['default'].sep + 'm' + _uuid2['default'].v1().split('-').join('_') + '.d';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O2tCQUdlLElBQUk7Ozs7a0JBQ0osSUFBSTs7OztvQkFDRixNQUFNOzs7O29CQUNOLE1BQU07Ozs7O0FBTnZCLFdBQVcsQ0FBQyxxQkFTRztBQUNiLGNBQVksRUFBRSxrQkFBSyxJQUFJLENBQUMsZ0JBQUcsTUFBTSxFQUFFLEVBQUUsdUJBQXVCLENBQUM7Ozs7Ozs7QUFPN0Qsd0JBQXNCLEVBQUEsZ0NBQUMsSUFBSSxFQUFFO0FBQzNCLFFBQUk7QUFDRixVQUFJLENBQUMsZ0JBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtBQUFFLHdCQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7T0FBRTs7QUFFM0UsVUFBTSxZQUFZLEdBQU0sSUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBSyxHQUFHLFNBQUksa0JBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBSSxDQUFDOztBQUUzRixVQUFNLElBQUksR0FBRyxnQkFBRyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLHNCQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDekIsc0JBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVuQixhQUFPLFlBQVksQ0FBQztLQUNyQixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsWUFBTSxJQUFJLEtBQUssMkNBQXlDLEtBQUssT0FBSSxDQUFDO0tBQ25FO0dBQ0Y7Q0FDRiIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9EZXYvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBSZXF1aXJlIHNvbWUgbGlicyB1c2VkIGZvciBjcmVhdGluZyB0ZW1wb3JhcnkgZmlsZXNcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdXVpZCBmcm9tICd1dWlkJztcblxuLy8gUHVibGljOiBHcmFtbWFyVXRpbHMuRCAtIGEgbW9kdWxlIHdoaWNoIGFzc2lzdCB0aGUgY3JlYXRpb24gb2YgRCB0ZW1wb3JhcnkgZmlsZXNcbmV4cG9ydCBkZWZhdWx0IHtcbiAgdGVtcEZpbGVzRGlyOiBwYXRoLmpvaW4ob3MudG1wZGlyKCksICdhdG9tX3NjcmlwdF90ZW1wZmlsZXMnKSxcblxuICAvLyBQdWJsaWM6IENyZWF0ZSBhIHRlbXBvcmFyeSBmaWxlIHdpdGggdGhlIHByb3ZpZGVkIEQgY29kZVxuICAvL1xuICAvLyAqIGBjb2RlYCAgICBBIHtTdHJpbmd9IGNvbnRhaW5pbmcgc29tZSBEIGNvZGVcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUge1N0cmluZ30gZmlsZXBhdGggb2YgdGhlIG5ldyBmaWxlXG4gIGNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmModGhpcy50ZW1wRmlsZXNEaXIpKSB7IGZzLm1rZGlyU3luYyh0aGlzLnRlbXBGaWxlc0Rpcik7IH1cblxuICAgICAgY29uc3QgdGVtcEZpbGVQYXRoID0gYCR7dGhpcy50ZW1wRmlsZXNEaXIgKyBwYXRoLnNlcH1tJHt1dWlkLnYxKCkuc3BsaXQoJy0nKS5qb2luKCdfJyl9LmRgO1xuXG4gICAgICBjb25zdCBmaWxlID0gZnMub3BlblN5bmModGVtcEZpbGVQYXRoLCAndycpO1xuICAgICAgZnMud3JpdGVTeW5jKGZpbGUsIGNvZGUpO1xuICAgICAgZnMuY2xvc2VTeW5jKGZpbGUpO1xuXG4gICAgICByZXR1cm4gdGVtcEZpbGVQYXRoO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGNyZWF0aW5nIHRlbXBvcmFyeSBmaWxlICgke2Vycm9yfSlgKTtcbiAgICB9XG4gIH0sXG59O1xuIl19