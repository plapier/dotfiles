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

// Public: GrammarUtils - utilities for determining how to run code
'use babel';exports['default'] = {
  tempFilesDir: _path2['default'].join(_os2['default'].tmpdir(), 'atom_script_tempfiles'),

  // Public: Create a temporary file with the provided code
  //
  // * `code`    A {String} containing some code
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    var extension = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    try {
      if (!_fs2['default'].existsSync(this.tempFilesDir)) {
        _fs2['default'].mkdirSync(this.tempFilesDir);
      }

      var tempFilePath = this.tempFilesDir + _path2['default'].sep + _uuid2['default'].v1() + extension;

      var file = _fs2['default'].openSync(tempFilePath, 'w');
      _fs2['default'].writeSync(file, code);
      _fs2['default'].closeSync(file);

      return tempFilePath;
    } catch (error) {
      throw new Error('Error while creating temporary file (' + error + ')');
    }
  },

  // Public: Delete all temporary files and the directory created by
  // {GrammarUtils::createTempFileWithCode}
  deleteTempFiles: function deleteTempFiles() {
    var _this = this;

    try {
      if (_fs2['default'].existsSync(this.tempFilesDir)) {
        var files = _fs2['default'].readdirSync(this.tempFilesDir);
        if (files.length) {
          files.forEach(function (file) {
            return _fs2['default'].unlinkSync(_this.tempFilesDir + _path2['default'].sep + file);
          });
        }
        return _fs2['default'].rmdirSync(this.tempFilesDir);
      }
      return null;
    } catch (error) {
      throw new Error('Error while deleting temporary files (' + error + ')');
    }
  },

  /* eslint-disable global-require */
  // Public: Get the Java helper object
  //
  // Returns an {Object} which assists in preparing java + javac statements
  Java: require('./grammar-utils/java'),

  // Public: Get the Lisp helper object
  //
  // Returns an {Object} which assists in splitting Lisp statements.
  Lisp: require('./grammar-utils/lisp'),

  // Public: Get the MATLAB helper object
  //
  // Returns an {Object} which assists in splitting MATLAB statements.
  MATLAB: require('./grammar-utils/matlab'),

  // Public: Get the OperatingSystem helper object
  //
  // Returns an {Object} which assists in writing OS dependent code.
  OperatingSystem: require('./grammar-utils/operating-system'),

  // Public: Get the R helper object
  //
  // Returns an {Object} which assists in creating temp files containing R code
  R: require('./grammar-utils/R'),

  // Public: Get the Perl helper object
  //
  // Returns an {Object} which assists in creating temp files containing Perl code
  Perl: require('./grammar-utils/perl'),

  // Public: Get the PHP helper object
  //
  // Returns an {Object} which assists in creating temp files containing PHP code
  PHP: require('./grammar-utils/php'),

  // Public: Get the Nim helper object
  //
  // Returns an {Object} which assists in selecting the right project file for Nim code
  Nim: require('./grammar-utils/nim'),

  // Public: Predetermine CoffeeScript compiler
  //
  // Returns an [array] of appropriate command line flags for the active CS compiler.
  CScompiler: require('./grammar-utils/coffee-script-compiler'),

  // Public: Get the D helper object
  //
  // Returns an {Object} which assists in creating temp files containing D code
  D: require('./grammar-utils/d')
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztrQkFHZSxJQUFJOzs7O2tCQUNKLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFDTixNQUFNOzs7OztBQU52QixXQUFXLENBQUMscUJBU0c7QUFDYixjQUFZLEVBQUUsa0JBQUssSUFBSSxDQUFDLGdCQUFHLE1BQU0sRUFBRSxFQUFFLHVCQUF1QixDQUFDOzs7Ozs7O0FBTzdELHdCQUFzQixFQUFBLGdDQUFDLElBQUksRUFBa0I7UUFBaEIsU0FBUyx5REFBRyxFQUFFOztBQUN6QyxRQUFJO0FBQ0YsVUFBSSxDQUFDLGdCQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDckMsd0JBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUNqQzs7QUFFRCxVQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLGtCQUFLLEdBQUcsR0FBRyxrQkFBSyxFQUFFLEVBQUUsR0FBRyxTQUFTLENBQUM7O0FBRTFFLFVBQU0sSUFBSSxHQUFHLGdCQUFHLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUMsc0JBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6QixzQkFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRW5CLGFBQU8sWUFBWSxDQUFDO0tBQ3JCLENBQUMsT0FBTyxLQUFLLEVBQUU7QUFDZCxZQUFNLElBQUksS0FBSywyQ0FBeUMsS0FBSyxPQUFJLENBQUM7S0FDbkU7R0FDRjs7OztBQUlELGlCQUFlLEVBQUEsMkJBQUc7OztBQUNoQixRQUFJO0FBQ0YsVUFBSSxnQkFBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQ3BDLFlBQU0sS0FBSyxHQUFHLGdCQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDaEQsWUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ2hCLGVBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO21CQUFJLGdCQUFHLFVBQVUsQ0FBQyxNQUFLLFlBQVksR0FBRyxrQkFBSyxHQUFHLEdBQUcsSUFBSSxDQUFDO1dBQUEsQ0FBQyxDQUFDO1NBQzNFO0FBQ0QsZUFBTyxnQkFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ3hDO0FBQ0QsYUFBTyxJQUFJLENBQUM7S0FDYixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsWUFBTSxJQUFJLEtBQUssNENBQTBDLEtBQUssT0FBSSxDQUFDO0tBQ3BFO0dBQ0Y7Ozs7OztBQU1ELE1BQUksRUFBRSxPQUFPLENBQUMsc0JBQXNCLENBQUM7Ozs7O0FBS3JDLE1BQUksRUFBRSxPQUFPLENBQUMsc0JBQXNCLENBQUM7Ozs7O0FBS3JDLFFBQU0sRUFBRSxPQUFPLENBQUMsd0JBQXdCLENBQUM7Ozs7O0FBS3pDLGlCQUFlLEVBQUUsT0FBTyxDQUFDLGtDQUFrQyxDQUFDOzs7OztBQUs1RCxHQUFDLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDOzs7OztBQUsvQixNQUFJLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixDQUFDOzs7OztBQUtyQyxLQUFHLEVBQUUsT0FBTyxDQUFDLHFCQUFxQixDQUFDOzs7OztBQUtuQyxLQUFHLEVBQUUsT0FBTyxDQUFDLHFCQUFxQixDQUFDOzs7OztBQUtuQyxZQUFVLEVBQUUsT0FBTyxDQUFDLHdDQUF3QyxDQUFDOzs7OztBQUs3RCxHQUFDLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDO0NBQ2hDIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBSZXF1aXJlIHNvbWUgbGlicyB1c2VkIGZvciBjcmVhdGluZyB0ZW1wb3JhcnkgZmlsZXNcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgdXVpZCBmcm9tICd1dWlkJztcblxuLy8gUHVibGljOiBHcmFtbWFyVXRpbHMgLSB1dGlsaXRpZXMgZm9yIGRldGVybWluaW5nIGhvdyB0byBydW4gY29kZVxuZXhwb3J0IGRlZmF1bHQge1xuICB0ZW1wRmlsZXNEaXI6IHBhdGguam9pbihvcy50bXBkaXIoKSwgJ2F0b21fc2NyaXB0X3RlbXBmaWxlcycpLFxuXG4gIC8vIFB1YmxpYzogQ3JlYXRlIGEgdGVtcG9yYXJ5IGZpbGUgd2l0aCB0aGUgcHJvdmlkZWQgY29kZVxuICAvL1xuICAvLyAqIGBjb2RlYCAgICBBIHtTdHJpbmd9IGNvbnRhaW5pbmcgc29tZSBjb2RlXG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIHtTdHJpbmd9IGZpbGVwYXRoIG9mIHRoZSBuZXcgZmlsZVxuICBjcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsIGV4dGVuc2lvbiA9ICcnKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLnRlbXBGaWxlc0RpcikpIHtcbiAgICAgICAgZnMubWtkaXJTeW5jKHRoaXMudGVtcEZpbGVzRGlyKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGVtcEZpbGVQYXRoID0gdGhpcy50ZW1wRmlsZXNEaXIgKyBwYXRoLnNlcCArIHV1aWQudjEoKSArIGV4dGVuc2lvbjtcblxuICAgICAgY29uc3QgZmlsZSA9IGZzLm9wZW5TeW5jKHRlbXBGaWxlUGF0aCwgJ3cnKTtcbiAgICAgIGZzLndyaXRlU3luYyhmaWxlLCBjb2RlKTtcbiAgICAgIGZzLmNsb3NlU3luYyhmaWxlKTtcblxuICAgICAgcmV0dXJuIHRlbXBGaWxlUGF0aDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciB3aGlsZSBjcmVhdGluZyB0ZW1wb3JhcnkgZmlsZSAoJHtlcnJvcn0pYCk7XG4gICAgfVxuICB9LFxuXG4gIC8vIFB1YmxpYzogRGVsZXRlIGFsbCB0ZW1wb3JhcnkgZmlsZXMgYW5kIHRoZSBkaXJlY3RvcnkgY3JlYXRlZCBieVxuICAvLyB7R3JhbW1hclV0aWxzOjpjcmVhdGVUZW1wRmlsZVdpdGhDb2RlfVxuICBkZWxldGVUZW1wRmlsZXMoKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHRoaXMudGVtcEZpbGVzRGlyKSkge1xuICAgICAgICBjb25zdCBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHRoaXMudGVtcEZpbGVzRGlyKTtcbiAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiBmcy51bmxpbmtTeW5jKHRoaXMudGVtcEZpbGVzRGlyICsgcGF0aC5zZXAgKyBmaWxlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZzLnJtZGlyU3luYyh0aGlzLnRlbXBGaWxlc0Rpcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgZmlsZXMgKCR7ZXJyb3J9KWApO1xuICAgIH1cbiAgfSxcblxuICAvKiBlc2xpbnQtZGlzYWJsZSBnbG9iYWwtcmVxdWlyZSAqL1xuICAvLyBQdWJsaWM6IEdldCB0aGUgSmF2YSBoZWxwZXIgb2JqZWN0XG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge09iamVjdH0gd2hpY2ggYXNzaXN0cyBpbiBwcmVwYXJpbmcgamF2YSArIGphdmFjIHN0YXRlbWVudHNcbiAgSmF2YTogcmVxdWlyZSgnLi9ncmFtbWFyLXV0aWxzL2phdmEnKSxcblxuICAvLyBQdWJsaWM6IEdldCB0aGUgTGlzcCBoZWxwZXIgb2JqZWN0XG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge09iamVjdH0gd2hpY2ggYXNzaXN0cyBpbiBzcGxpdHRpbmcgTGlzcCBzdGF0ZW1lbnRzLlxuICBMaXNwOiByZXF1aXJlKCcuL2dyYW1tYXItdXRpbHMvbGlzcCcpLFxuXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBNQVRMQUIgaGVscGVyIG9iamVjdFxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtPYmplY3R9IHdoaWNoIGFzc2lzdHMgaW4gc3BsaXR0aW5nIE1BVExBQiBzdGF0ZW1lbnRzLlxuICBNQVRMQUI6IHJlcXVpcmUoJy4vZ3JhbW1hci11dGlscy9tYXRsYWInKSxcblxuICAvLyBQdWJsaWM6IEdldCB0aGUgT3BlcmF0aW5nU3lzdGVtIGhlbHBlciBvYmplY3RcbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7T2JqZWN0fSB3aGljaCBhc3Npc3RzIGluIHdyaXRpbmcgT1MgZGVwZW5kZW50IGNvZGUuXG4gIE9wZXJhdGluZ1N5c3RlbTogcmVxdWlyZSgnLi9ncmFtbWFyLXV0aWxzL29wZXJhdGluZy1zeXN0ZW0nKSxcblxuICAvLyBQdWJsaWM6IEdldCB0aGUgUiBoZWxwZXIgb2JqZWN0XG4gIC8vXG4gIC8vIFJldHVybnMgYW4ge09iamVjdH0gd2hpY2ggYXNzaXN0cyBpbiBjcmVhdGluZyB0ZW1wIGZpbGVzIGNvbnRhaW5pbmcgUiBjb2RlXG4gIFI6IHJlcXVpcmUoJy4vZ3JhbW1hci11dGlscy9SJyksXG5cbiAgLy8gUHVibGljOiBHZXQgdGhlIFBlcmwgaGVscGVyIG9iamVjdFxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtPYmplY3R9IHdoaWNoIGFzc2lzdHMgaW4gY3JlYXRpbmcgdGVtcCBmaWxlcyBjb250YWluaW5nIFBlcmwgY29kZVxuICBQZXJsOiByZXF1aXJlKCcuL2dyYW1tYXItdXRpbHMvcGVybCcpLFxuXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBQSFAgaGVscGVyIG9iamVjdFxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtPYmplY3R9IHdoaWNoIGFzc2lzdHMgaW4gY3JlYXRpbmcgdGVtcCBmaWxlcyBjb250YWluaW5nIFBIUCBjb2RlXG4gIFBIUDogcmVxdWlyZSgnLi9ncmFtbWFyLXV0aWxzL3BocCcpLFxuXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBOaW0gaGVscGVyIG9iamVjdFxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtPYmplY3R9IHdoaWNoIGFzc2lzdHMgaW4gc2VsZWN0aW5nIHRoZSByaWdodCBwcm9qZWN0IGZpbGUgZm9yIE5pbSBjb2RlXG4gIE5pbTogcmVxdWlyZSgnLi9ncmFtbWFyLXV0aWxzL25pbScpLFxuXG4gIC8vIFB1YmxpYzogUHJlZGV0ZXJtaW5lIENvZmZlZVNjcmlwdCBjb21waWxlclxuICAvL1xuICAvLyBSZXR1cm5zIGFuIFthcnJheV0gb2YgYXBwcm9wcmlhdGUgY29tbWFuZCBsaW5lIGZsYWdzIGZvciB0aGUgYWN0aXZlIENTIGNvbXBpbGVyLlxuICBDU2NvbXBpbGVyOiByZXF1aXJlKCcuL2dyYW1tYXItdXRpbHMvY29mZmVlLXNjcmlwdC1jb21waWxlcicpLFxuXG4gIC8vIFB1YmxpYzogR2V0IHRoZSBEIGhlbHBlciBvYmplY3RcbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7T2JqZWN0fSB3aGljaCBhc3Npc3RzIGluIGNyZWF0aW5nIHRlbXAgZmlsZXMgY29udGFpbmluZyBEIGNvZGVcbiAgRDogcmVxdWlyZSgnLi9ncmFtbWFyLXV0aWxzL2QnKSxcbn07XG4iXX0=