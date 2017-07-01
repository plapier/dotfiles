'use babel';

// Public: GrammarUtils.PHP - a module which assist the creation of PHP temporary files
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  // Public: Create a temporary file with the provided PHP code
  //
  // * `code`    A {String} containing some PHP code without <?php header
  //
  // Returns the {String} filepath of the new file
  createTempFileWithCode: function createTempFileWithCode(code) {
    if (!/^[\s]*<\?php/.test(code)) {
      code = '<?php ' + code;
    }
    return module.parent.exports.createTempFileWithCode(code);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9waHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7cUJBR0c7Ozs7OztBQU1iLHdCQUFzQixFQUFBLGdDQUFDLElBQUksRUFBRTtBQUMzQixRQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUFFLFVBQUksY0FBWSxJQUFJLEFBQUUsQ0FBQztLQUFFO0FBQzNELFdBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDM0Q7Q0FDRiIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9EZXYvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXItdXRpbHMvcGhwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vIFB1YmxpYzogR3JhbW1hclV0aWxzLlBIUCAtIGEgbW9kdWxlIHdoaWNoIGFzc2lzdCB0aGUgY3JlYXRpb24gb2YgUEhQIHRlbXBvcmFyeSBmaWxlc1xuZXhwb3J0IGRlZmF1bHQge1xuICAvLyBQdWJsaWM6IENyZWF0ZSBhIHRlbXBvcmFyeSBmaWxlIHdpdGggdGhlIHByb3ZpZGVkIFBIUCBjb2RlXG4gIC8vXG4gIC8vICogYGNvZGVgICAgIEEge1N0cmluZ30gY29udGFpbmluZyBzb21lIFBIUCBjb2RlIHdpdGhvdXQgPD9waHAgaGVhZGVyXG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIHtTdHJpbmd9IGZpbGVwYXRoIG9mIHRoZSBuZXcgZmlsZVxuICBjcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpIHtcbiAgICBpZiAoIS9eW1xcc10qPFxcP3BocC8udGVzdChjb2RlKSkgeyBjb2RlID0gYDw/cGhwICR7Y29kZX1gOyB9XG4gICAgcmV0dXJuIG1vZHVsZS5wYXJlbnQuZXhwb3J0cy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpO1xuICB9LFxufTtcbiJdfQ==