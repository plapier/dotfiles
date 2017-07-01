Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var EditorLinter = require('./editor-linter');

var EditorRegistry = (function () {
  function EditorRegistry() {
    _classCallCheck(this, EditorRegistry);

    this.emitter = new _atom.Emitter();
    this.subscriptions = new _atom.CompositeDisposable();
    this.editorLinters = new Map();

    this.subscriptions.add(this.emitter);
  }

  _createClass(EditorRegistry, [{
    key: 'create',
    value: function create(textEditor) {
      var _this = this;

      var editorLinter = new EditorLinter(textEditor);
      this.editorLinters.set(textEditor, editorLinter);
      this.emitter.emit('observe', editorLinter);
      editorLinter.onDidDestroy(function () {
        return _this.editorLinters['delete'](textEditor);
      });
      this.subscriptions.add(editorLinter);
      return editorLinter;
    }
  }, {
    key: 'has',
    value: function has(textEditor) {
      return this.editorLinters.has(textEditor);
    }
  }, {
    key: 'forEach',
    value: function forEach(textEditor) {
      this.editorLinters.forEach(textEditor);
    }
  }, {
    key: 'ofPath',
    value: function ofPath(path) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.editorLinters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var editorLinter = _step.value;

          if (editorLinter[0].getPath() === path) {
            return editorLinter[1];
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'ofTextEditor',
    value: function ofTextEditor(textEditor) {
      return this.editorLinters.get(textEditor);
    }
  }, {
    key: 'ofActiveTextEditor',
    value: function ofActiveTextEditor() {
      return this.ofTextEditor(atom.workspace.getActiveTextEditor());
    }
  }, {
    key: 'observe',
    value: function observe(callback) {
      this.forEach(callback);
      return this.emitter.on('observe', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      this.editorLinters.clear();
    }
  }]);

  return EditorRegistry;
})();

exports['default'] = EditorRegistry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGludGVyL2xpYi9lZGl0b3ItcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRTJDLE1BQU07O0FBRmpELFdBQVcsQ0FBQTs7QUFHWCxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7SUFFMUIsY0FBYztBQUN0QixXQURRLGNBQWMsR0FDbkI7MEJBREssY0FBYzs7QUFFL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxVQUxYLE9BQU8sRUFLaUIsQ0FBQTtBQUM1QixRQUFJLENBQUMsYUFBYSxHQUFHLFVBTlIsbUJBQW1CLEVBTWMsQ0FBQTtBQUM5QyxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7O0FBRTlCLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUNyQzs7ZUFQa0IsY0FBYzs7V0FTM0IsZ0JBQUMsVUFBVSxFQUFFOzs7QUFDakIsVUFBTSxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDakQsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFBO0FBQ2hELFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQTtBQUMxQyxrQkFBWSxDQUFDLFlBQVksQ0FBQztlQUN4QixNQUFLLGFBQWEsVUFBTyxDQUFDLFVBQVUsQ0FBQztPQUFBLENBQ3RDLENBQUE7QUFDRCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUNwQyxhQUFPLFlBQVksQ0FBQTtLQUNwQjs7O1dBRUUsYUFBQyxVQUFVLEVBQUU7QUFDZCxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzFDOzs7V0FFTSxpQkFBQyxVQUFVLEVBQUU7QUFDbEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7S0FDdkM7OztXQUVLLGdCQUFDLElBQUksRUFBRTs7Ozs7O0FBQ1gsNkJBQXlCLElBQUksQ0FBQyxhQUFhLDhIQUFFO2NBQXBDLFlBQVk7O0FBQ25CLGNBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksRUFBRTtBQUN0QyxtQkFBTyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7V0FDdkI7U0FDRjs7Ozs7Ozs7Ozs7Ozs7O0tBQ0Y7OztXQUVXLHNCQUFDLFVBQVUsRUFBRTtBQUN2QixhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0tBQzFDOzs7V0FFaUIsOEJBQUc7QUFDbkIsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFBO0tBQy9EOzs7V0FFTSxpQkFBQyxRQUFRLEVBQUU7QUFDaEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUN0QixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUM1Qzs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDM0I7OztTQXBEa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2VkaXRvci1yZWdpc3RyeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7RW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSdcbmNvbnN0IEVkaXRvckxpbnRlciA9IHJlcXVpcmUoJy4vZWRpdG9yLWxpbnRlcicpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVkaXRvclJlZ2lzdHJ5IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmVkaXRvckxpbnRlcnMgPSBuZXcgTWFwKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICB9XG5cbiAgY3JlYXRlKHRleHRFZGl0b3IpIHtcbiAgICBjb25zdCBlZGl0b3JMaW50ZXIgPSBuZXcgRWRpdG9yTGludGVyKHRleHRFZGl0b3IpXG4gICAgdGhpcy5lZGl0b3JMaW50ZXJzLnNldCh0ZXh0RWRpdG9yLCBlZGl0b3JMaW50ZXIpXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ29ic2VydmUnLCBlZGl0b3JMaW50ZXIpXG4gICAgZWRpdG9yTGludGVyLm9uRGlkRGVzdHJveSgoKSA9PlxuICAgICAgdGhpcy5lZGl0b3JMaW50ZXJzLmRlbGV0ZSh0ZXh0RWRpdG9yKVxuICAgIClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvckxpbnRlcilcbiAgICByZXR1cm4gZWRpdG9yTGludGVyXG4gIH1cblxuICBoYXModGV4dEVkaXRvcikge1xuICAgIHJldHVybiB0aGlzLmVkaXRvckxpbnRlcnMuaGFzKHRleHRFZGl0b3IpXG4gIH1cblxuICBmb3JFYWNoKHRleHRFZGl0b3IpIHtcbiAgICB0aGlzLmVkaXRvckxpbnRlcnMuZm9yRWFjaCh0ZXh0RWRpdG9yKVxuICB9XG5cbiAgb2ZQYXRoKHBhdGgpIHtcbiAgICBmb3IgKGxldCBlZGl0b3JMaW50ZXIgb2YgdGhpcy5lZGl0b3JMaW50ZXJzKSB7XG4gICAgICBpZiAoZWRpdG9yTGludGVyWzBdLmdldFBhdGgoKSA9PT0gcGF0aCkge1xuICAgICAgICByZXR1cm4gZWRpdG9yTGludGVyWzFdXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb2ZUZXh0RWRpdG9yKHRleHRFZGl0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3JMaW50ZXJzLmdldCh0ZXh0RWRpdG9yKVxuICB9XG5cbiAgb2ZBY3RpdmVUZXh0RWRpdG9yKCkge1xuICAgIHJldHVybiB0aGlzLm9mVGV4dEVkaXRvcihhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gIH1cblxuICBvYnNlcnZlKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5mb3JFYWNoKGNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29ic2VydmUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWRpdG9yTGludGVycy5jbGVhcigpXG4gIH1cbn1cbiJdfQ==