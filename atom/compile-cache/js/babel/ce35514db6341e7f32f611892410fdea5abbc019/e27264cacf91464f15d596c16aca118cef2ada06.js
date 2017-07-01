'use babel';

/* eslint-disable no-multi-str, prefer-const, func-names */
Object.defineProperty(exports, '__esModule', {
  value: true
});
var linkPaths = undefined;
var regex = new RegExp('((?:\\w:)?/?(?:[-\\w.]+/)*[-\\w.]+):(\\d+)(?::(\\d+))?', 'g');
// ((?:\w:)?/?            # Prefix of the path either '/' or 'C:/' (optional)
// (?:[-\w.]+/)*[-\w.]+)  # The path of the file some/file/path.ext
// :(\d+)                 # Line number prefixed with a colon
// (?::(\d+))?            # Column number prefixed with a colon (optional)

var template = '<a class="-linked-path" data-path="$1" data-line="$2" data-column="$3">$&</a>';

exports['default'] = linkPaths = function (lines) {
  return lines.replace(regex, template);
};

linkPaths.listen = function (parentView) {
  return parentView.on('click', '.-linked-path', function () {
    var el = this;
    var _el$dataset = el.dataset;
    var path = _el$dataset.path;
    var line = _el$dataset.line;
    var column = _el$dataset.column;

    line = Number(line) - 1;
    // column number is optional
    column = column ? Number(column) - 1 : 0;

    atom.workspace.open(path, {
      initialLine: line,
      initialColumn: column
    });
  });
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvbGluay1wYXRocy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7OztBQUdaLElBQUksU0FBUyxZQUFBLENBQUM7QUFDZCxJQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyx3REFBd0QsRUFBRSxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FBTXhGLElBQU0sUUFBUSxHQUFHLCtFQUErRSxDQUFDOztxQkFFbEYsU0FBUyxHQUFHLFVBQUEsS0FBSztTQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztDQUFBOztBQUVsRSxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQUEsVUFBVTtTQUMzQixVQUFVLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsWUFBWTtBQUNsRCxRQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7c0JBQ2EsRUFBRSxDQUFDLE9BQU87UUFBakMsSUFBSSxlQUFKLElBQUk7UUFBRSxJQUFJLGVBQUosSUFBSTtRQUFFLE1BQU0sZUFBTixNQUFNOztBQUN4QixRQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFeEIsVUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFekMsUUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ3hCLGlCQUFXLEVBQUUsSUFBSTtBQUNqQixtQkFBYSxFQUFFLE1BQU07S0FDdEIsQ0FBQyxDQUFDO0dBQ0osQ0FBQztDQUFBLENBQUMiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9saW5rLXBhdGhzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLW11bHRpLXN0ciwgcHJlZmVyLWNvbnN0LCBmdW5jLW5hbWVzICovXG5sZXQgbGlua1BhdGhzO1xuY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCcoKD86XFxcXHc6KT8vPyg/OlstXFxcXHcuXSsvKSpbLVxcXFx3Ll0rKTooXFxcXGQrKSg/OjooXFxcXGQrKSk/JywgJ2cnKTtcbi8vICgoPzpcXHc6KT8vPyAgICAgICAgICAgICMgUHJlZml4IG9mIHRoZSBwYXRoIGVpdGhlciAnLycgb3IgJ0M6LycgKG9wdGlvbmFsKVxuLy8gKD86Wy1cXHcuXSsvKSpbLVxcdy5dKykgICMgVGhlIHBhdGggb2YgdGhlIGZpbGUgc29tZS9maWxlL3BhdGguZXh0XG4vLyA6KFxcZCspICAgICAgICAgICAgICAgICAjIExpbmUgbnVtYmVyIHByZWZpeGVkIHdpdGggYSBjb2xvblxuLy8gKD86OihcXGQrKSk/ICAgICAgICAgICAgIyBDb2x1bW4gbnVtYmVyIHByZWZpeGVkIHdpdGggYSBjb2xvbiAob3B0aW9uYWwpXG5cbmNvbnN0IHRlbXBsYXRlID0gJzxhIGNsYXNzPVwiLWxpbmtlZC1wYXRoXCIgZGF0YS1wYXRoPVwiJDFcIiBkYXRhLWxpbmU9XCIkMlwiIGRhdGEtY29sdW1uPVwiJDNcIj4kJjwvYT4nO1xuXG5leHBvcnQgZGVmYXVsdCBsaW5rUGF0aHMgPSBsaW5lcyA9PiBsaW5lcy5yZXBsYWNlKHJlZ2V4LCB0ZW1wbGF0ZSk7XG5cbmxpbmtQYXRocy5saXN0ZW4gPSBwYXJlbnRWaWV3ID0+XG4gIHBhcmVudFZpZXcub24oJ2NsaWNrJywgJy4tbGlua2VkLXBhdGgnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZWwgPSB0aGlzO1xuICAgIGxldCB7IHBhdGgsIGxpbmUsIGNvbHVtbiB9ID0gZWwuZGF0YXNldDtcbiAgICBsaW5lID0gTnVtYmVyKGxpbmUpIC0gMTtcbiAgICAvLyBjb2x1bW4gbnVtYmVyIGlzIG9wdGlvbmFsXG4gICAgY29sdW1uID0gY29sdW1uID8gTnVtYmVyKGNvbHVtbikgLSAxIDogMDtcblxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aCwge1xuICAgICAgaW5pdGlhbExpbmU6IGxpbmUsXG4gICAgICBpbml0aWFsQ29sdW1uOiBjb2x1bW4sXG4gICAgfSk7XG4gIH0pO1xuIl19