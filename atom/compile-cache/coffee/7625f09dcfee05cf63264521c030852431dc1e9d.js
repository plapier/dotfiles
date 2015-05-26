(function() {
  var CodeContext;

  module.exports = CodeContext = (function() {
    CodeContext.prototype.filename = null;

    CodeContext.prototype.filepath = null;

    CodeContext.prototype.lineNumber = null;

    CodeContext.prototype.shebang = null;

    CodeContext.prototype.textSource = null;

    function CodeContext(filename, filepath, textSource) {
      this.filename = filename;
      this.filepath = filepath;
      this.textSource = textSource != null ? textSource : null;
    }

    CodeContext.prototype.fileColonLine = function(fullPath) {
      var fileColonLine;
      if (fullPath == null) {
        fullPath = true;
      }
      if (fullPath) {
        fileColonLine = this.filepath;
      } else {
        fileColonLine = this.filename;
      }
      if (!this.lineNumber) {
        return fileColonLine;
      }
      return "" + fileColonLine + ":" + this.lineNumber;
    };

    CodeContext.prototype.getCode = function(prependNewlines) {
      var code, newlineCount, newlines, _ref;
      if (prependNewlines == null) {
        prependNewlines = true;
      }
      code = (_ref = this.textSource) != null ? _ref.getText() : void 0;
      if (!(prependNewlines && this.lineNumber)) {
        return code;
      }
      newlineCount = Number(this.lineNumber);
      newlines = Array(newlineCount).join("\n");
      return "" + newlines + code;
    };

    CodeContext.prototype.shebangCommand = function() {
      var sections;
      sections = this.shebangSections();
      if (!sections) {
        return;
      }
      return sections[0];
    };

    CodeContext.prototype.shebangCommandArgs = function() {
      var sections;
      sections = this.shebangSections();
      if (!sections) {
        return [];
      }
      return sections.slice(1, +(sections.length - 1) + 1 || 9e9);
    };

    CodeContext.prototype.shebangSections = function() {
      var _ref;
      return (_ref = this.shebang) != null ? _ref.split(' ') : void 0;
    };

    return CodeContext;

  })();

}).call(this);
