'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CodeContext = (function () {
  // Public: Initializes a new {CodeContext} object for the given file/line
  //
  // @filename   - The {String} filename of the file to execute.
  // @filepath   - The {String} path of the file to execute.
  // @textSource - The {String} text to under "Selection Based". (default: null)
  //
  // Returns a newly created {CodeContext} object.

  function CodeContext(filename, filepath) {
    var textSource = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, CodeContext);

    this.lineNumber = null;
    this.shebang = null;
    this.filename = filename;
    this.filepath = filepath;
    this.textSource = textSource;
  }

  // Public: Creates a {String} representation of the file and line number
  //
  // fullPath - Whether to expand the file path. (default: true)
  //
  // Returns the "file colon line" {String}.

  _createClass(CodeContext, [{
    key: 'fileColonLine',
    value: function fileColonLine() {
      var fullPath = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var fileColonLine = undefined;
      if (fullPath) {
        fileColonLine = this.filepath;
      } else {
        fileColonLine = this.filename;
      }

      if (!this.lineNumber) {
        return fileColonLine;
      }
      return fileColonLine + ':' + this.lineNumber;
    }

    // Public: Retrieves the text from whatever source was given on initialization
    //
    // prependNewlines - Whether to prepend @lineNumber newlines (default: true)
    //
    // Returns the code selection {String}
  }, {
    key: 'getCode',
    value: function getCode() {
      var prependNewlines = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var code = this.textSource ? this.textSource.getText() : null;
      if (!prependNewlines || !this.lineNumber) return code;

      var newlineCount = Number(this.lineNumber);
      var newlines = Array(newlineCount).join('\n');
      return '' + newlines + code;
    }

    // Public: Retrieves the command name from @shebang
    //
    // Returns the {String} name of the command or {undefined} if not applicable.
  }, {
    key: 'shebangCommand',
    value: function shebangCommand() {
      var sections = this.shebangSections();
      if (!sections) return null;

      return sections[0];
    }

    // Public: Retrieves the command arguments (such as flags or arguments to
    // /usr/bin/env) from @shebang
    //
    // Returns the {String} name of the command or {undefined} if not applicable.
  }, {
    key: 'shebangCommandArgs',
    value: function shebangCommandArgs() {
      var sections = this.shebangSections();
      if (!sections) {
        return [];
      }

      return sections.slice(1, sections.length);
    }

    // Public: Splits the shebang string by spaces to extra the command and
    // arguments
    //
    // Returns the {String} name of the command or {undefined} if not applicable.
  }, {
    key: 'shebangSections',
    value: function shebangSections() {
      return this.shebang ? this.shebang.split(' ') : null;
    }
  }]);

  return CodeContext;
})();

exports['default'] = CodeContext;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvY29kZS1jb250ZXh0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztJQUVTLFdBQVc7Ozs7Ozs7OztBQVFuQixXQVJRLFdBQVcsQ0FRbEIsUUFBUSxFQUFFLFFBQVEsRUFBcUI7UUFBbkIsVUFBVSx5REFBRyxJQUFJOzswQkFSOUIsV0FBVzs7QUFTNUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7R0FDOUI7Ozs7Ozs7O2VBZGtCLFdBQVc7O1dBcUJqQix5QkFBa0I7VUFBakIsUUFBUSx5REFBRyxJQUFJOztBQUMzQixVQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLFVBQUksUUFBUSxFQUFFO0FBQ1oscUJBQWEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO09BQy9CLE1BQU07QUFDTCxxQkFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7T0FDL0I7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFBRSxlQUFPLGFBQWEsQ0FBQztPQUFFO0FBQy9DLGFBQVUsYUFBYSxTQUFJLElBQUksQ0FBQyxVQUFVLENBQUc7S0FDOUM7Ozs7Ozs7OztXQU9NLG1CQUF5QjtVQUF4QixlQUFlLHlEQUFHLElBQUk7O0FBQzVCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDaEUsVUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsT0FBTyxJQUFJLENBQUM7O0FBRXRELFVBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDN0MsVUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoRCxrQkFBVSxRQUFRLEdBQUcsSUFBSSxDQUFHO0tBQzdCOzs7Ozs7O1dBS2EsMEJBQUc7QUFDZixVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDeEMsVUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLElBQUksQ0FBQzs7QUFFM0IsYUFBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEI7Ozs7Ozs7O1dBTWlCLDhCQUFHO0FBQ25CLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUN4QyxVQUFJLENBQUMsUUFBUSxFQUFFO0FBQUUsZUFBTyxFQUFFLENBQUM7T0FBRTs7QUFFN0IsYUFBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDM0M7Ozs7Ozs7O1dBTWMsMkJBQUc7QUFDaEIsYUFBTyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUN0RDs7O1NBMUVrQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9EZXYvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2NvZGUtY29udGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlQ29udGV4dCB7XG4gIC8vIFB1YmxpYzogSW5pdGlhbGl6ZXMgYSBuZXcge0NvZGVDb250ZXh0fSBvYmplY3QgZm9yIHRoZSBnaXZlbiBmaWxlL2xpbmVcbiAgLy9cbiAgLy8gQGZpbGVuYW1lICAgLSBUaGUge1N0cmluZ30gZmlsZW5hbWUgb2YgdGhlIGZpbGUgdG8gZXhlY3V0ZS5cbiAgLy8gQGZpbGVwYXRoICAgLSBUaGUge1N0cmluZ30gcGF0aCBvZiB0aGUgZmlsZSB0byBleGVjdXRlLlxuICAvLyBAdGV4dFNvdXJjZSAtIFRoZSB7U3RyaW5nfSB0ZXh0IHRvIHVuZGVyIFwiU2VsZWN0aW9uIEJhc2VkXCIuIChkZWZhdWx0OiBudWxsKVxuICAvL1xuICAvLyBSZXR1cm5zIGEgbmV3bHkgY3JlYXRlZCB7Q29kZUNvbnRleHR9IG9iamVjdC5cbiAgY29uc3RydWN0b3IoZmlsZW5hbWUsIGZpbGVwYXRoLCB0ZXh0U291cmNlID0gbnVsbCkge1xuICAgIHRoaXMubGluZU51bWJlciA9IG51bGw7XG4gICAgdGhpcy5zaGViYW5nID0gbnVsbDtcbiAgICB0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWU7XG4gICAgdGhpcy5maWxlcGF0aCA9IGZpbGVwYXRoO1xuICAgIHRoaXMudGV4dFNvdXJjZSA9IHRleHRTb3VyY2U7XG4gIH1cblxuICAvLyBQdWJsaWM6IENyZWF0ZXMgYSB7U3RyaW5nfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZmlsZSBhbmQgbGluZSBudW1iZXJcbiAgLy9cbiAgLy8gZnVsbFBhdGggLSBXaGV0aGVyIHRvIGV4cGFuZCB0aGUgZmlsZSBwYXRoLiAoZGVmYXVsdDogdHJ1ZSlcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUgXCJmaWxlIGNvbG9uIGxpbmVcIiB7U3RyaW5nfS5cbiAgZmlsZUNvbG9uTGluZShmdWxsUGF0aCA9IHRydWUpIHtcbiAgICBsZXQgZmlsZUNvbG9uTGluZTtcbiAgICBpZiAoZnVsbFBhdGgpIHtcbiAgICAgIGZpbGVDb2xvbkxpbmUgPSB0aGlzLmZpbGVwYXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWxlQ29sb25MaW5lID0gdGhpcy5maWxlbmFtZTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMubGluZU51bWJlcikgeyByZXR1cm4gZmlsZUNvbG9uTGluZTsgfVxuICAgIHJldHVybiBgJHtmaWxlQ29sb25MaW5lfToke3RoaXMubGluZU51bWJlcn1gO1xuICB9XG5cbiAgLy8gUHVibGljOiBSZXRyaWV2ZXMgdGhlIHRleHQgZnJvbSB3aGF0ZXZlciBzb3VyY2Ugd2FzIGdpdmVuIG9uIGluaXRpYWxpemF0aW9uXG4gIC8vXG4gIC8vIHByZXBlbmROZXdsaW5lcyAtIFdoZXRoZXIgdG8gcHJlcGVuZCBAbGluZU51bWJlciBuZXdsaW5lcyAoZGVmYXVsdDogdHJ1ZSlcbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUgY29kZSBzZWxlY3Rpb24ge1N0cmluZ31cbiAgZ2V0Q29kZShwcmVwZW5kTmV3bGluZXMgPSB0cnVlKSB7XG4gICAgY29uc3QgY29kZSA9IHRoaXMudGV4dFNvdXJjZSA/IHRoaXMudGV4dFNvdXJjZS5nZXRUZXh0KCkgOiBudWxsO1xuICAgIGlmICghcHJlcGVuZE5ld2xpbmVzIHx8ICF0aGlzLmxpbmVOdW1iZXIpIHJldHVybiBjb2RlO1xuXG4gICAgY29uc3QgbmV3bGluZUNvdW50ID0gTnVtYmVyKHRoaXMubGluZU51bWJlcik7XG4gICAgY29uc3QgbmV3bGluZXMgPSBBcnJheShuZXdsaW5lQ291bnQpLmpvaW4oJ1xcbicpO1xuICAgIHJldHVybiBgJHtuZXdsaW5lc30ke2NvZGV9YDtcbiAgfVxuXG4gIC8vIFB1YmxpYzogUmV0cmlldmVzIHRoZSBjb21tYW5kIG5hbWUgZnJvbSBAc2hlYmFuZ1xuICAvL1xuICAvLyBSZXR1cm5zIHRoZSB7U3RyaW5nfSBuYW1lIG9mIHRoZSBjb21tYW5kIG9yIHt1bmRlZmluZWR9IGlmIG5vdCBhcHBsaWNhYmxlLlxuICBzaGViYW5nQ29tbWFuZCgpIHtcbiAgICBjb25zdCBzZWN0aW9ucyA9IHRoaXMuc2hlYmFuZ1NlY3Rpb25zKCk7XG4gICAgaWYgKCFzZWN0aW9ucykgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gc2VjdGlvbnNbMF07XG4gIH1cblxuICAvLyBQdWJsaWM6IFJldHJpZXZlcyB0aGUgY29tbWFuZCBhcmd1bWVudHMgKHN1Y2ggYXMgZmxhZ3Mgb3IgYXJndW1lbnRzIHRvXG4gIC8vIC91c3IvYmluL2VudikgZnJvbSBAc2hlYmFuZ1xuICAvL1xuICAvLyBSZXR1cm5zIHRoZSB7U3RyaW5nfSBuYW1lIG9mIHRoZSBjb21tYW5kIG9yIHt1bmRlZmluZWR9IGlmIG5vdCBhcHBsaWNhYmxlLlxuICBzaGViYW5nQ29tbWFuZEFyZ3MoKSB7XG4gICAgY29uc3Qgc2VjdGlvbnMgPSB0aGlzLnNoZWJhbmdTZWN0aW9ucygpO1xuICAgIGlmICghc2VjdGlvbnMpIHsgcmV0dXJuIFtdOyB9XG5cbiAgICByZXR1cm4gc2VjdGlvbnMuc2xpY2UoMSwgc2VjdGlvbnMubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogU3BsaXRzIHRoZSBzaGViYW5nIHN0cmluZyBieSBzcGFjZXMgdG8gZXh0cmEgdGhlIGNvbW1hbmQgYW5kXG4gIC8vIGFyZ3VtZW50c1xuICAvL1xuICAvLyBSZXR1cm5zIHRoZSB7U3RyaW5nfSBuYW1lIG9mIHRoZSBjb21tYW5kIG9yIHt1bmRlZmluZWR9IGlmIG5vdCBhcHBsaWNhYmxlLlxuICBzaGViYW5nU2VjdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2hlYmFuZyA/IHRoaXMuc2hlYmFuZy5zcGxpdCgnICcpIDogbnVsbDtcbiAgfVxufVxuIl19