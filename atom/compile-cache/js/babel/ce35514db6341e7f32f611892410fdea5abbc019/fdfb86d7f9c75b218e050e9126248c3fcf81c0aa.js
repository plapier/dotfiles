var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _sbDebounce = require('sb-debounce');

var _sbDebounce2 = _interopRequireDefault(_sbDebounce);

var _disposableEvent = require('disposable-event');

var _disposableEvent2 = _interopRequireDefault(_disposableEvent);

var _helpers = require('./helpers');

var TreeView = (function () {
  function TreeView() {
    var _this = this;

    _classCallCheck(this, TreeView);

    this.emitter = new _atom.Emitter();
    this.messages = [];
    this.decorations = {};
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.decorateOnTreeView', function (decorateOnTreeView) {
      if (typeof _this.decorateOnTreeView === 'undefined') {
        _this.decorateOnTreeView = decorateOnTreeView;
      } else if (decorateOnTreeView === 'None') {
        _this.update([]);
        _this.decorateOnTreeView = decorateOnTreeView;
      } else {
        var messages = _this.messages;
        _this.decorateOnTreeView = decorateOnTreeView;
        _this.update(messages);
      }
    }));

    setTimeout(function () {
      var element = TreeView.getElement();
      if (!element) {
        return;
      }
      // Subscription is only added if the CompositeDisposable hasn't been disposed
      _this.subscriptions.add((0, _disposableEvent2['default'])(element, 'click', (0, _sbDebounce2['default'])(function () {
        _this.update();
      })));
    }, 100);
  }

  _createClass(TreeView, [{
    key: 'update',
    value: function update() {
      var givenMessages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (Array.isArray(givenMessages)) {
        this.messages = givenMessages;
      }
      var messages = this.messages;

      var element = TreeView.getElement();
      var decorateOnTreeView = this.decorateOnTreeView;
      if (!element || decorateOnTreeView === 'None') {
        return;
      }

      this.applyDecorations((0, _helpers.calculateDecorations)(decorateOnTreeView, messages));
    }
  }, {
    key: 'applyDecorations',
    value: function applyDecorations(decorations) {
      var treeViewElement = TreeView.getElement();
      if (!treeViewElement) {
        return;
      }

      var elementCache = {};
      var appliedDecorations = {};

      for (var filePath in this.decorations) {
        if (!({}).hasOwnProperty.call(this.decorations, filePath)) {
          continue;
        }
        if (!decorations[filePath]) {
          // Removed
          var element = elementCache[filePath] || (elementCache[filePath] = TreeView.getElementByPath(treeViewElement, filePath));
          if (element) {
            this.removeDecoration(element);
          }
        }
      }

      for (var filePath in decorations) {
        if (!({}).hasOwnProperty.call(decorations, filePath)) {
          continue;
        }
        var element = elementCache[filePath] || (elementCache[filePath] = TreeView.getElementByPath(treeViewElement, filePath));
        if (element) {
          this.handleDecoration(element, !!this.decorations[filePath], decorations[filePath]);
          appliedDecorations[filePath] = decorations[filePath];
        }
      }
      this.decorations = appliedDecorations;
    }
  }, {
    key: 'handleDecoration',
    value: function handleDecoration(element, update, highlights) {
      if (update === undefined) update = false;

      var decoration = undefined;
      if (update) {
        decoration = element.querySelector('linter-decoration');
      }
      if (decoration) {
        decoration.className = '';
      } else {
        decoration = document.createElement('linter-decoration');
        element.appendChild(decoration);
      }
      if (highlights.error) {
        decoration.classList.add('linter-error');
      } else if (highlights.warning) {
        decoration.classList.add('linter-warning');
      } else if (highlights.info) {
        decoration.classList.add('linter-info');
      }
    }
  }, {
    key: 'removeDecoration',
    value: function removeDecoration(element) {
      var decoration = element.querySelector('linter-decoration');
      if (decoration) {
        decoration.remove();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }], [{
    key: 'getElement',
    value: function getElement() {
      return document.querySelector('.tree-view');
    }
  }, {
    key: 'getElementByPath',
    value: function getElementByPath(parent, filePath) {
      return parent.querySelector('[data-path=' + CSS.escape(filePath) + ']');
    }
  }]);

  return TreeView;
})();

module.exports = TreeView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3RyZWUtdmlldy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRTZDLE1BQU07OzBCQUM5QixhQUFhOzs7OytCQUNOLGtCQUFrQjs7Ozt1QkFDVCxXQUFXOztJQUcxQyxRQUFRO0FBT0QsV0FQUCxRQUFRLEdBT0U7OzswQkFQVixRQUFROztBQVFWLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUNyQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsc0NBQXNDLEVBQUUsVUFBQyxrQkFBa0IsRUFBSztBQUN6RyxVQUFJLE9BQU8sTUFBSyxrQkFBa0IsS0FBSyxXQUFXLEVBQUU7QUFDbEQsY0FBSyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQTtPQUM3QyxNQUFNLElBQUksa0JBQWtCLEtBQUssTUFBTSxFQUFFO0FBQ3hDLGNBQUssTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ2YsY0FBSyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQTtPQUM3QyxNQUFNO0FBQ0wsWUFBTSxRQUFRLEdBQUcsTUFBSyxRQUFRLENBQUE7QUFDOUIsY0FBSyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQTtBQUM1QyxjQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQTtPQUN0QjtLQUNGLENBQUMsQ0FBQyxDQUFBOztBQUVILGNBQVUsQ0FBQyxZQUFNO0FBQ2YsVUFBTSxPQUFPLEdBQUcs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Q25FOzs7U0F2SEcsUUFBUTs7O0FBMEhkLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3RyZWUtdmlldy9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IGRlYm91bmNlIGZyb20gJ3NiLWRlYm91bmNlJ1xuaW1wb3J0IGRpc3Bvc2FibGVFdmVudCBmcm9tICdkaXNwb3NhYmxlLWV2ZW50J1xuaW1wb3J0IHsgY2FsY3VsYXRlRGVjb3JhdGlvbnMgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UsIFRyZWVWaWV3SGlnaGxpZ2h0IH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIFRyZWVWaWV3IHtcbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgbWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+O1xuICBkZWNvcmF0aW9uczogT2JqZWN0O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBkZWNvcmF0ZU9uVHJlZVZpZXc6ICdGaWxlcyBhbmQgRGlyZWN0b3JpZXMnIHwgJ0ZpbGVzJyB8ICdOb25lJztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5kZWNvcmF0aW9ucyA9IHt9XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5kZWNvcmF0ZU9uVHJlZVZpZXcnLCAoZGVjb3JhdGVPblRyZWVWaWV3KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuZGVjb3JhdGVPblRyZWVWaWV3ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLmRlY29yYXRlT25UcmVlVmlldyA9IGRlY29yYXRlT25UcmVlVmlld1xuICAgICAgfSBlbHNlIGlmIChkZWNvcmF0ZU9uVHJlZVZpZXcgPT09ICdOb25lJykge1xuICAgICAgICB0aGlzLnVwZGF0ZShbXSlcbiAgICAgICAgdGhpcy5kZWNvcmF0ZU9uVHJlZVZpZXcgPSBkZWNvcmF0ZU9uVHJlZVZpZXdcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlc1xuICAgICAgICB0aGlzLmRlY29yYXRlT25UcmVlVmlldyA9IGRlY29yYXRlT25UcmVlVmlld1xuICAgICAgICB0aGlzLnVwZGF0ZShtZXNzYWdlcylcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgZWxlbWVudCA9IFRyZWVWaWV3LmdldEVsZW1lbnQoKVxuICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgLy8gU3Vic2NyaXB0aW9uIGlzIG9ubHkgYWRkZWQgaWYgdGhlIENvbXBvc2l0ZURpc3Bvc2FibGUgaGFzbid0IGJlZW4gZGlzcG9zZWRcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoZGlzcG9zYWJsZUV2ZW50KGVsZW1lbnQsICdjbGljaycsIGRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgdGhpcy51cGRhdGUoKVxuICAgICAgfSkpKVxuICAgIH0sIDEwMClcbiAgfVxuICB1cGRhdGUoZ2l2ZW5NZXNzYWdlczogP0FycmF5PExpbnRlck1lc3NhZ2U+ID0gbnVsbCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGdpdmVuTWVzc2FnZXMpKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzID0gZ2l2ZW5NZXNzYWdlc1xuICAgIH1cbiAgICBjb25zdCBtZXNzYWdlcyA9IHRoaXMubWVzc2FnZXNcblxuICAgIGNvbnN0IGVsZW1lbnQgPSBUcmVlVmlldy5nZXRFbGVtZW50KClcbiAgICBjb25zdCBkZWNvcmF0ZU9uVHJlZVZpZXcgPSB0aGlzLmRlY29yYXRlT25UcmVlVmlld1xuICAgIGlmICghZWxlbWVudCB8fCBkZWNvcmF0ZU9uVHJlZVZpZXcgPT09ICdOb25lJykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5hcHBseURlY29yYXRpb25zKGNhbGN1bGF0ZURlY29yYXRpb25zKGRlY29yYXRlT25UcmVlVmlldywgbWVzc2FnZXMpKVxuICB9XG4gIGFwcGx5RGVjb3JhdGlvbnMoZGVjb3JhdGlvbnM6IE9iamVjdCkge1xuICAgIGNvbnN0IHRyZWVWaWV3RWxlbWVudCA9IFRyZWVWaWV3LmdldEVsZW1lbnQoKVxuICAgIGlmICghdHJlZVZpZXdFbGVtZW50KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50Q2FjaGUgPSB7fVxuICAgIGNvbnN0IGFwcGxpZWREZWNvcmF0aW9ucyA9IHt9XG5cbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIHRoaXMuZGVjb3JhdGlvbnMpIHtcbiAgICAgIGlmICghe30uaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmRlY29yYXRpb25zLCBmaWxlUGF0aCkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICghZGVjb3JhdGlvbnNbZmlsZVBhdGhdKSB7XG4gICAgICAgIC8vIFJlbW92ZWRcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRDYWNoZVtmaWxlUGF0aF0gfHwgKGVsZW1lbnRDYWNoZVtmaWxlUGF0aF0gPSBUcmVlVmlldy5nZXRFbGVtZW50QnlQYXRoKHRyZWVWaWV3RWxlbWVudCwgZmlsZVBhdGgpKVxuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlRGVjb3JhdGlvbihlbGVtZW50KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiBkZWNvcmF0aW9ucykge1xuICAgICAgaWYgKCF7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGRlY29yYXRpb25zLCBmaWxlUGF0aCkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50Q2FjaGVbZmlsZVBhdGhdIHx8IChlbGVtZW50Q2FjaGVbZmlsZVBhdGhdID0gVHJlZVZpZXcuZ2V0RWxlbWVudEJ5UGF0aCh0cmVlVmlld0VsZW1lbnQsIGZpbGVQYXRoKSlcbiAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRGVjb3JhdGlvbihlbGVtZW50LCAhIXRoaXMuZGVjb3JhdGlvbnNbZmlsZVBhdGhdLCBkZWNvcmF0aW9uc1tmaWxlUGF0aF0pXG4gICAgICAgIGFwcGxpZWREZWNvcmF0aW9uc1tmaWxlUGF0aF0gPSBkZWNvcmF0aW9uc1tmaWxlUGF0aF1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5kZWNvcmF0aW9ucyA9IGFwcGxpZWREZWNvcmF0aW9uc1xuICB9XG4gIGhhbmRsZURlY29yYXRpb24oZWxlbWVudDogSFRNTEVsZW1lbnQsIHVwZGF0ZTogYm9vbGVhbiA9IGZhbHNlLCBoaWdobGlnaHRzOiBUcmVlVmlld0hpZ2hsaWdodCkge1xuICAgIGxldCBkZWNvcmF0aW9uXG4gICAgaWYgKHVwZGF0ZSkge1xuICAgICAgZGVjb3JhdGlvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignbGludGVyLWRlY29yYXRpb24nKVxuICAgIH1cbiAgICBpZiAoZGVjb3JhdGlvbikge1xuICAgICAgZGVjb3JhdGlvbi5jbGFzc05hbWUgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWNvcmF0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGludGVyLWRlY29yYXRpb24nKVxuICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChkZWNvcmF0aW9uKVxuICAgIH1cbiAgICBpZiAoaGlnaGxpZ2h0cy5lcnJvcikge1xuICAgICAgZGVjb3JhdGlvbi5jbGFzc0xpc3QuYWRkKCdsaW50ZXItZXJyb3InKVxuICAgIH0gZWxzZSBpZiAoaGlnaGxpZ2h0cy53YXJuaW5nKSB7XG4gICAgICBkZWNvcmF0aW9uLmNsYXNzTGlzdC5hZGQoJ2xpbnRlci13YXJuaW5nJylcbiAgICB9IGVsc2UgaWYgKGhpZ2hsaWdodHMuaW5mbykge1xuICAgICAgZGVjb3JhdGlvbi5jbGFzc0xpc3QuYWRkKCdsaW50ZXItaW5mbycpXG4gICAgfVxuICB9XG4gIHJlbW92ZURlY29yYXRpb24oZWxlbWVudDogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBkZWNvcmF0aW9uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaW50ZXItZGVjb3JhdGlvbicpXG4gICAgaWYgKGRlY29yYXRpb24pIHtcbiAgICAgIGRlY29yYXRpb24ucmVtb3ZlKClcbiAgICB9XG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbiAgc3RhdGljIGdldEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50cmVlLXZpZXcnKVxuICB9XG4gIHN0YXRpYyBnZXRFbGVtZW50QnlQYXRoKHBhcmVudDogSFRNTEVsZW1lbnQsIGZpbGVQYXRoKTogP0hUTUxFbGVtZW50IHtcbiAgICByZXR1cm4gcGFyZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXBhdGg9JHtDU1MuZXNjYXBlKGZpbGVQYXRoKX1dYClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWVWaWV3XG4iXX0=