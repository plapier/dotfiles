Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _codeContext = require('./code-context');

var _codeContext2 = _interopRequireDefault(_codeContext);

var _grammarsCoffee = require('./grammars.coffee');

var _grammarsCoffee2 = _interopRequireDefault(_grammarsCoffee);

'use babel';

var CodeContextBuilder = (function () {
  function CodeContextBuilder() {
    var emitter = arguments.length <= 0 || arguments[0] === undefined ? new _atom.Emitter() : arguments[0];

    _classCallCheck(this, CodeContextBuilder);

    this.emitter = emitter;
  }

  _createClass(CodeContextBuilder, [{
    key: 'destroy',
    value: function destroy() {
      this.emitter.dispose();
    }

    // Public: Builds code context for specified argType
    //
    // editor - Atom's {TextEditor} instance
    // argType - {String} with one of the following values:
    //
    // * "Selection Based" (default)
    // * "Line Number Based",
    // * "File Based"
    //
    // returns a {CodeContext} object
  }, {
    key: 'buildCodeContext',
    value: function buildCodeContext(editor) {
      var argType = arguments.length <= 1 || arguments[1] === undefined ? 'Selection Based' : arguments[1];

      if (!editor) return null;

      var codeContext = this.initCodeContext(editor);

      codeContext.argType = argType;

      if (argType === 'Line Number Based') {
        editor.save();
      } else if (codeContext.selection.isEmpty() && codeContext.filepath) {
        codeContext.argType = 'File Based';
        if (editor && editor.isModified()) editor.save();
      }

      // Selection and Line Number Based runs both benefit from knowing the current line
      // number
      if (argType !== 'File Based') {
        var cursor = editor.getLastCursor();
        codeContext.lineNumber = cursor.getScreenRow() + 1;
      }

      return codeContext;
    }
  }, {
    key: 'initCodeContext',
    value: function initCodeContext(editor) {
      var filename = editor.getTitle();
      var filepath = editor.getPath();
      var selection = editor.getLastSelection();
      var ignoreSelection = atom.config.get('script.ignoreSelection');

      // If the selection was empty or if ignore selection is on, then "select" ALL
      // of the text
      // This allows us to run on new files
      var textSource = undefined;
      if (selection.isEmpty() || ignoreSelection) {
        textSource = editor;
      } else {
        textSource = selection;
      }

      var codeContext = new _codeContext2['default'](filename, filepath, textSource);
      codeContext.selection = selection;
      codeContext.shebang = this.getShebang(editor);

      var lang = this.getLang(editor);

      if (this.validateLang(lang)) {
        codeContext.lang = lang;
      }

      return codeContext;
    }
  }, {
    key: 'getShebang',
    value: function getShebang(editor) {
      if (process.platform === 'win32') return null;
      var text = editor.getText();
      var lines = text.split('\n');
      var firstLine = lines[0];
      if (!firstLine.match(/^#!/)) return null;

      return firstLine.replace(/^#!\s*/, '');
    }
  }, {
    key: 'getLang',
    value: function getLang(editor) {
      return editor.getGrammar().name;
    }
  }, {
    key: 'validateLang',
    value: function validateLang(lang) {
      var valid = true;

      // Determine if no language is selected.
      if (lang === 'Null Grammar' || lang === 'Plain Text') {
        this.emitter.emit('did-not-specify-language');
        valid = false;

        // Provide them a dialog to submit an issue on GH, prepopulated with their
        // language of choice.
      } else if (!(lang in _grammarsCoffee2['default'])) {
          this.emitter.emit('did-not-support-language', { lang: lang });
          valid = false;
        }

      return valid;
    }
  }, {
    key: 'onDidNotSpecifyLanguage',
    value: function onDidNotSpecifyLanguage(callback) {
      return this.emitter.on('did-not-specify-language', callback);
    }
  }, {
    key: 'onDidNotSupportLanguage',
    value: function onDidNotSupportLanguage(callback) {
      return this.emitter.on('did-not-support-language', callback);
    }
  }]);

  return CodeContextBuilder;
})();

exports['default'] = CodeContextBuilder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvY29kZS1jb250ZXh0LWJ1aWxkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFd0IsTUFBTTs7MkJBRU4sZ0JBQWdCOzs7OzhCQUNqQixtQkFBbUI7Ozs7QUFMMUMsV0FBVyxDQUFDOztJQU9TLGtCQUFrQjtBQUMxQixXQURRLGtCQUFrQixHQUNBO1FBQXpCLE9BQU8seURBQUcsbUJBQWE7OzBCQURoQixrQkFBa0I7O0FBRW5DLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0dBQ3hCOztlQUhrQixrQkFBa0I7O1dBSzlCLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qjs7Ozs7Ozs7Ozs7Ozs7V0FZZSwwQkFBQyxNQUFNLEVBQStCO1VBQTdCLE9BQU8seURBQUcsaUJBQWlCOztBQUNsRCxVQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sSUFBSSxDQUFDOztBQUV6QixVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVqRCxpQkFBVyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRTlCLFVBQUksT0FBTyxLQUFLLG1CQUFtQixFQUFFO0FBQ25DLGNBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNmLE1BQU0sSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUU7QUFDbEUsbUJBQVcsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO0FBQ25DLFlBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDbEQ7Ozs7QUFJRCxVQUFJLE9BQU8sS0FBSyxZQUFZLEVBQUU7QUFDNUIsWUFBTSxNQUFN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LDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzlEOzs7U0E5R2tCLGtCQUFrQjs7O3FCQUFsQixrQkFBa0IiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9jb2RlLWNvbnRleHQtYnVpbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBFbWl0dGVyIH0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCBDb2RlQ29udGV4dCBmcm9tICcuL2NvZGUtY29udGV4dCc7XG5pbXBvcnQgZ3JhbW1hck1hcCBmcm9tICcuL2dyYW1tYXJzLmNvZmZlZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvZGVDb250ZXh0QnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gZW1pdHRlcjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogQnVpbGRzIGNvZGUgY29udGV4dCBmb3Igc3BlY2lmaWVkIGFyZ1R5cGVcbiAgLy9cbiAgLy8gZWRpdG9yIC0gQXRvbSdzIHtUZXh0RWRpdG9yfSBpbnN0YW5jZVxuICAvLyBhcmdUeXBlIC0ge1N0cmluZ30gd2l0aCBvbmUgb2YgdGhlIGZvbGxvd2luZyB2YWx1ZXM6XG4gIC8vXG4gIC8vICogXCJTZWxlY3Rpb24gQmFzZWRcIiAoZGVmYXVsdClcbiAgLy8gKiBcIkxpbmUgTnVtYmVyIEJhc2VkXCIsXG4gIC8vICogXCJGaWxlIEJhc2VkXCJcbiAgLy9cbiAgLy8gcmV0dXJucyBhIHtDb2RlQ29udGV4dH0gb2JqZWN0XG4gIGJ1aWxkQ29kZUNvbnRleHQoZWRpdG9yLCBhcmdUeXBlID0gJ1NlbGVjdGlvbiBCYXNlZCcpIHtcbiAgICBpZiAoIWVkaXRvcikgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBjb2RlQ29udGV4dCA9IHRoaXMuaW5pdENvZGVDb250ZXh0KGVkaXRvcik7XG5cbiAgICBjb2RlQ29udGV4dC5hcmdUeXBlID0gYXJnVHlwZTtcblxuICAgIGlmIChhcmdUeXBlID09PSAnTGluZSBOdW1iZXIgQmFzZWQnKSB7XG4gICAgICBlZGl0b3Iuc2F2ZSgpO1xuICAgIH0gZWxzZSBpZiAoY29kZUNvbnRleHQuc2VsZWN0aW9uLmlzRW1wdHkoKSAmJiBjb2RlQ29udGV4dC5maWxlcGF0aCkge1xuICAgICAgY29kZUNvbnRleHQuYXJnVHlwZSA9ICdGaWxlIEJhc2VkJztcbiAgICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmlzTW9kaWZpZWQoKSkgZWRpdG9yLnNhdmUoKTtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3Rpb24gYW5kIExpbmUgTnVtYmVyIEJhc2VkIHJ1bnMgYm90aCBiZW5lZml0IGZyb20ga25vd2luZyB0aGUgY3VycmVudCBsaW5lXG4gICAgLy8gbnVtYmVyXG4gICAgaWYgKGFyZ1R5cGUgIT09ICdGaWxlIEJhc2VkJykge1xuICAgICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKTtcbiAgICAgIGNvZGVDb250ZXh0LmxpbmVOdW1iZXIgPSBjdXJzb3IuZ2V0U2NyZWVuUm93KCkgKyAxO1xuICAgIH1cblxuICAgIHJldHVybiBjb2RlQ29udGV4dDtcbiAgfVxuXG4gIGluaXRDb2RlQ29udGV4dChlZGl0b3IpIHtcbiAgICBjb25zdCBmaWxlbmFtZSA9IGVkaXRvci5nZXRUaXRsZSgpO1xuICAgIGNvbnN0IGZpbGVwYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBjb25zdCBzZWxlY3Rpb24gPSBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpO1xuICAgIGNvbnN0IGlnbm9yZVNlbGVjdGlvbiA9IGF0b20uY29uZmlnLmdldCgnc2NyaXB0Lmlnbm9yZVNlbGVjdGlvbicpO1xuXG4gICAgLy8gSWYgdGhlIHNlbGVjdGlvbiB3YXMgZW1wdHkgb3IgaWYgaWdub3JlIHNlbGVjdGlvbiBpcyBvbiwgdGhlbiBcInNlbGVjdFwiIEFMTFxuICAgIC8vIG9mIHRoZSB0ZXh0XG4gICAgLy8gVGhpcyBhbGxvd3MgdXMgdG8gcnVuIG9uIG5ldyBmaWxlc1xuICAgIGxldCB0ZXh0U291cmNlO1xuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpIHx8IGlnbm9yZVNlbGVjdGlvbikge1xuICAgICAgdGV4dFNvdXJjZSA9IGVkaXRvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGV4dFNvdXJjZSA9IHNlbGVjdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBjb2RlQ29udGV4dCA9IG5ldyBDb2RlQ29udGV4dChmaWxlbmFtZSwgZmlsZXBhdGgsIHRleHRTb3VyY2UpO1xuICAgIGNvZGVDb250ZXh0LnNlbGVjdGlvbiA9IHNlbGVjdGlvbjtcbiAgICBjb2RlQ29udGV4dC5zaGViYW5nID0gdGhpcy5nZXRTaGViYW5nKGVkaXRvcik7XG5cbiAgICBjb25zdCBsYW5nID0gdGhpcy5nZXRMYW5nKGVkaXRvcik7XG5cbiAgICBpZiAodGhpcy52YWxpZGF0ZUxhbmcobGFuZykpIHtcbiAgICAgIGNvZGVDb250ZXh0LmxhbmcgPSBsYW5nO1xuICAgIH1cblxuICAgIHJldHVybiBjb2RlQ29udGV4dDtcbiAgfVxuXG4gIGdldFNoZWJhbmcoZWRpdG9yKSB7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuICAgIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgZmlyc3RMaW5lID0gbGluZXNbMF07XG4gICAgaWYgKCFmaXJzdExpbmUubWF0Y2goL14jIS8pKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiBmaXJzdExpbmUucmVwbGFjZSgvXiMhXFxzKi8sICcnKTtcbiAgfVxuXG4gIGdldExhbmcoZWRpdG9yKSB7XG4gICAgcmV0dXJuIGVkaXRvci5nZXRHcmFtbWFyKCkubmFtZTtcbiAgfVxuXG4gIHZhbGlkYXRlTGFuZyhsYW5nKSB7XG4gICAgbGV0IHZhbGlkID0gdHJ1ZTtcblxuICAgIC8vIERldGVybWluZSBpZiBubyBsYW5ndWFnZSBpcyBzZWxlY3RlZC5cbiAgICBpZiAobGFuZyA9PT0gJ051bGwgR3JhbW1hcicgfHwgbGFuZyA9PT0gJ1BsYWluIFRleHQnKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLW5vdC1zcGVjaWZ5LWxhbmd1YWdlJyk7XG4gICAgICB2YWxpZCA9IGZhbHNlO1xuXG4gICAgLy8gUHJvdmlkZSB0aGVtIGEgZGlhbG9nIHRvIHN1Ym1pdCBhbiBpc3N1ZSBvbiBHSCwgcHJlcG9wdWxhdGVkIHdpdGggdGhlaXJcbiAgICAvLyBsYW5ndWFnZSBvZiBjaG9pY2UuXG4gICAgfSBlbHNlIGlmICghKGxhbmcgaW4gZ3JhbW1hck1hcCkpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtbm90LXN1cHBvcnQtbGFuZ3VhZ2UnLCB7IGxhbmcgfSk7XG4gICAgICB2YWxpZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZDtcbiAgfVxuXG4gIG9uRGlkTm90U3BlY2lmeUxhbmd1YWdlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLW5vdC1zcGVjaWZ5LWxhbmd1YWdlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWROb3RTdXBwb3J0TGFuZ3VhZ2UoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtbm90LXN1cHBvcnQtbGFuZ3VhZ2UnLCBjYWxsYmFjayk7XG4gIH1cbn1cbiJdfQ==