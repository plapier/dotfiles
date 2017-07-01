Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

'use babel';

var EditorLinter = (function () {
  function EditorLinter(editor) {
    var _this = this;

    _classCallCheck(this, EditorLinter);

    if (typeof editor !== 'object' || typeof editor.markBufferRange !== 'function') {
      throw new Error('Given editor is not really an editor');
    }

    this.editor = editor;
    this.emitter = new _atom.Emitter();
    this.messages = new Set();
    this.markers = new Map();
    this.subscriptions = new _atom.CompositeDisposable();
    this.gutter = null;
    this.countLineMessages = 0;

    this.subscriptions.add(atom.config.observe('linter.underlineIssues', function (underlineIssues) {
      return _this.underlineIssues = underlineIssues;
    }));
    this.subscriptions.add(atom.config.observe('linter.showErrorInline', function (showBubble) {
      return _this.showBubble = showBubble;
    }));
    this.subscriptions.add(this.editor.onDidDestroy(function () {
      return _this.dispose();
    }));
    this.subscriptions.add(this.editor.onDidSave(function () {
      return _this.emitter.emit('should-lint', false);
    }));
    this.subscriptions.add(this.editor.onDidChangeCursorPosition(function (_ref) {
      var oldBufferPosition = _ref.oldBufferPosition;
      var newBufferPosition = _ref.newBufferPosition;

      if (newBufferPosition.row !== oldBufferPosition.row) {
        _this.calculateLineMessages(newBufferPosition.row);
      }
      _this.emitter.emit('should-update-bubble');
    }));
    this.subscriptions.add(atom.config.observe('linter.gutterEnabled', function (gutterEnabled) {
      _this.gutterEnabled = gutterEnabled;
      _this.handleGutter();
    }));
    // Using onDidChange instead of observe here 'cause the same function is invoked above
    this.subscriptions.add(atom.config.onDidChange('linter.gutterPosition', function () {
      return _this.handleGutter();
    }));
    this.subscriptions.add(this.onDidMessageAdd(function (message) {
      if (!_this.underlineIssues && !_this.gutterEnabled && !_this.showBubble || !message.range) {
        return; // No-Op
      }
      var marker = _this.editor.markBufferRange(message.range, { invalidate: 'inside' });
      _this.markers.set(message, marker);
      if (_this.underlineIssues) {
        _this.editor.decorateMarker(marker, {
          type: 'highlight',
          'class': 'linter-highlight ' + message['class']
        });
      }
      if (_this.gutterEnabled) {
        var item = document.createElement('span');
        item.className = 'linter-gutter linter-highlight ' + message['class'];
        _this.gutter.decorateMarker(marker, {
          'class': 'linter-row',
          item: item
        });
      }
    }));
    this.subscriptions.add(this.onDidMessageDelete(function (message) {
      if (_this.markers.has(message)) {
        _this.markers.get(message).destroy();
        _this.markers['delete'](message);
      }
    }));

    // TODO: Atom invokes onDid{Change, StopChanging} callbacks immediately. Workaround it
    atom.config.observe('linter.lintOnFlyInterval', function (interval) {
      if (_this.changeSubscription) {
        _this.changeSubscription.dispose();
      }
      _this.changeSubscription = _this.editor.onDidChange(_helpers2['default'].debounce(function () {
        _this.emitter.emit('should-lint', true);
      }, interval));
    });

    this.active = true;
  }

  _createClass(EditorLinter, [{
    key: 'handleGutter',
    value: function handleGutter() {
      if (this.gutter !== null) {
        this.removeGutter();
      }
      if (this.gutterEnabled) {
        this.addGutter();
      }
    }
  }, {
    key: 'addGutter',
    value: function addGutter() {
      var position = atom.config.get('linter.gutterPosition');
      this.gutter = this.editor.addGutter({
        name: 'linter',
        priority: position === 'Left' ? -100 : 100
      });
    }
  }, {
    key: 'removeGutter',
    value: function removeGutter() {
      if (this.gutter !== null) {
        try {
          // Atom throws when we try to remove a gutter container from a closed text editor
          this.gutter.destroy();
        } catch (err) {}
        this.gutter = null;
      }
    }
  }, {
    key: 'getMessages',
    value: function getMessages() {
      return this.messages;
    }
  }, {
    key: 'addMessage',
    value: function addMessage(message) {
      if (!this.messages.has(message)) {
        if (this.active) {
          message.currentFile = true;
        }
        this.messages.add(message);
        this.emitter.emit('did-message-add', message);
        this.emitter.emit('did-message-change', { message: message, type: 'add' });
      }
    }
  }, {
    key: 'deleteMessage',
    value: function deleteMessage(message) {
      if (this.messages.has(message)) {
        this.messages['delete'](message);
        this.emitter.emit('did-message-delete', message);
        this.emitter.emit('did-message-change', { message: message, type: 'delete' });
      }
    }
  }, {
    key: 'calculateLineMessages',
    value: function calculateLineMessages(row) {
      var _this2 = this;

      if (atom.config.get('linter.showErrorTabLine')) {
        if (row === null) {
          row = this.editor.getCursorBufferPosition().row;
        }
        this.countLineMessages = 0;
        this.messages.forEach(function (message) {
          if (message.currentLine = message.range && message.range.intersectsRow(row)) {
            _this2.countLineMessages++;
          }
        });
      } else {
        this.countLineMessages = 0;
      }
      this.emitter.emit('did-calculate-line-messages', this.countLineMessages);
      return this.countLineMessages;
    }
  }, {
    key: 'lint',
    value: function lint() {
      var onChange = arguments[0] === undefined ? false : arguments[0];

      this.emitter.emit('should-lint', onChange);
    }
  }, {
    key: 'onDidMessageAdd',
    value: function onDidMessageAdd(callback) {
      return this.emitter.on('did-message-add', callback);
    }
  }, {
    key: 'onDidMessageDelete',
    value: function onDidMessageDelete(callback) {
      return this.emitter.on('did-message-delete', callback);
    }
  }, {
    key: 'onDidMessageChange',
    value: function onDidMessageChange(callback) {
      return this.emitter.on('did-message-change', callback);
    }
  }, {
    key: 'onDidCalculateLineMessages',
    value: function onDidCalculateLineMessages(callback) {
      return this.emitter.on('did-calculate-line-messages', callback);
    }
  }, {
    key: 'onShouldUpdateBubble',
    value: function onShouldUpdateBubble(callback) {
      return this.emitter.on('should-update-bubble', callback);
    }
  }, {
    key: 'onShouldLint',
    value: function onShouldLint(callback) {
      return this.emitter.on('should-lint', callback);
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-destroy');
      if (this.markers.size) {
        this.markers.forEach(function (marker) {
          return marker.destroy();
        });
        this.markers.clear();
      }
      this.removeGutter();
      this.subscriptions.dispose();
      if (this.changeSubscription) {
        this.changeSubscription.dispose();
      }
      this.emitter.dispose();
      this.messages.clear();
    }
  }, {
    key: 'active',
    set: function set(value) {
      value = Boolean(value);
      if (value !== this._active) {
        this._active = value;
        if (this.messages.size) {
          this.messages.forEach(function (message) {
            return message.currentFile = value;
          });
        }
      }
    },
    get: function get() {
      return this._active;
    }
  }]);

  return EditorLinter;
})();

exports['default'] = EditorLinter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGludGVyL2xpYi9lZGl0b3ItbGludGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRTJDLE1BQU07O3VCQUM3QixXQUFXOzs7O0FBSC9CLFdBQVcsQ0FBQTs7SUFLVSxZQUFZO0FBQ3BCLFdBRFEsWUFBWSxDQUNuQixNQUFNLEVBQUU7OzswQkFERCxZQUFZOztBQUU3QixRQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sQ0FBQyxlQUFlLEtBQUssVUFBVSxFQUFFO0FBQzlFLFlBQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQTtLQUN4RDs7QUFFRCxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLFVBVlgsT0FBTyxFQVVpQixDQUFBO0FBQzVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN6QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxVQWJSLG1CQUFtQixFQWFZLENBQUE7QUFDNUMsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUE7QUFDbEIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQTs7QUFFMUIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsVUFBQSxlQUFlO2FBQ2xGLE1BQUssZUFBZSxHQUFHLGVBQWU7S0FBQSxDQUN2QyxDQUFDLENBQUE7QUFDRixRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxVQUFBLFVBQVU7YUFDN0UsTUFBSyxVQUFV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U0E5SFMsYUFBQyxLQUFLLEVBQUU7QUFDaEIsV0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN0QixVQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQzFCLFlBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO0FBQ3BCLFlBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsY0FBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO21CQUFJLE9BQU8sQ0FBQyxXQUFXLEdBQUcsS0FBSztXQUFBLENBQUMsQ0FBQTtTQUM5RDtPQUNGO0tBQ0Y7U0FDUyxlQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0tBQ3BCOzs7U0E1RmtCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGludGVyL2xpYi9lZGl0b3ItbGludGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJ1xuaW1wb3J0IEhlbHBlcnMgZnJvbSAnLi9oZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0b3JMaW50ZXIge1xuICBjb25zdHJ1Y3RvcihlZGl0b3IpIHtcbiAgICBpZiAodHlwZW9mIGVkaXRvciAhPT0gJ29iamVjdCcgfHwgdHlwZW9mIGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignR2l2ZW4gZWRpdG9yIGlzIG5vdCByZWFsbHkgYW4gZWRpdG9yJylcbiAgICB9XG5cbiAgICB0aGlzLmVkaXRvciA9IGVkaXRvclxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gbmV3IFNldCgpXG4gICAgdGhpcy5tYXJrZXJzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICB0aGlzLmd1dHRlciA9IG51bGxcbiAgICB0aGlzLmNvdW50TGluZU1lc3NhZ2VzID0gMFxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIudW5kZXJsaW5lSXNzdWVzJywgdW5kZXJsaW5lSXNzdWVzID0+XG4gICAgICB0aGlzLnVuZGVybGluZUlzc3VlcyA9IHVuZGVybGluZUlzc3Vlc1xuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuc2hvd0Vycm9ySW5saW5lJywgc2hvd0J1YmJsZSA9PlxuICAgICAgdGhpcy5zaG93QnViYmxlID0gc2hvd0J1YmJsZVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT5cbiAgICAgIHRoaXMuZGlzcG9zZSgpXG4gICAgKSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZWRpdG9yLm9uRGlkU2F2ZSgoKSA9PlxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC1saW50JywgZmFsc2UpXG4gICAgKSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKHtvbGRCdWZmZXJQb3NpdGlvbiwgbmV3QnVmZmVyUG9zaXRpb259KSA9PiB7XG4gICAgICBpZiAobmV3QnVmZmVyUG9zaXRpb24ucm93ICE9PSBvbGRCdWZmZXJQb3NpdGlvbi5yb3cpIHtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVMaW5lTWVzc2FnZXMobmV3QnVmZmVyUG9zaXRpb24ucm93KVxuICAgICAgfVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Nob3VsZC11cGRhdGUtYnViYmxlJylcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci5ndXR0ZXJFbmFibGVkJywgZ3V0dGVyRW5hYmxlZCA9PiB7XG4gICAgICB0aGlzLmd1dHRlckVuYWJsZWQgPSBndXR0ZXJFbmFibGVkXG4gICAgICB0aGlzLmhhbmRsZUd1dHRlcigpXG4gICAgfSkpXG4gICAgLy8gVXNpbmcgb25EaWRDaGFuZ2UgaW5zdGVhZCBvZiBvYnNlcnZlIGhlcmUgJ2NhdXNlIHRoZSBzYW1lIGZ1bmN0aW9uIGlzIGludm9rZWQgYWJvdmVcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdsaW50ZXIuZ3V0dGVyUG9zaXRpb24nLCAoKSA9PlxuICAgICAgdGhpcy5oYW5kbGVHdXR0ZXIoKVxuICAgICkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm9uRGlkTWVzc2FnZUFkZChtZXNzYWdlID0+IHtcbiAgICAgIGlmICghdGhpcy51bmRlcmxpbmVJc3N1ZXMgJiYgIXRoaXMuZ3V0dGVyRW5hYmxlZCAmJiAhdGhpcy5zaG93QnViYmxlIHx8ICFtZXNzYWdlLnJhbmdlKSB7XG4gICAgICAgIHJldHVybiAvLyBOby1PcFxuICAgICAgfVxuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5lZGl0b3IubWFya0J1ZmZlclJhbmdlKG1lc3NhZ2UucmFuZ2UsIHtpbnZhbGlkYXRlOiAnaW5zaWRlJ30pXG4gICAgICB0aGlzLm1hcmtlcnMuc2V0KG1lc3NhZ2UsIG1hcmtlcilcbiAgICAgIGlmICh0aGlzLnVuZGVybGluZUlzc3Vlcykge1xuICAgICAgICB0aGlzLmVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgICBjbGFzczogYGxpbnRlci1oaWdobGlnaHQgJHttZXNzYWdlLmNsYXNzfWBcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmd1dHRlckVuYWJsZWQpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBpdGVtLmNsYXNzTmFtZSA9IGBsaW50ZXItZ3V0dGVyIGxpbnRlci1oaWdobGlnaHQgJHttZXNzYWdlLmNsYXNzfWBcbiAgICAgICAgdGhpcy5ndXR0ZXIuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgICAgY2xhc3M6ICdsaW50ZXItcm93JyxcbiAgICAgICAgICBpdGVtXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLm9uRGlkTWVzc2FnZURlbGV0ZShtZXNzYWdlID0+IHtcbiAgICAgIGlmICh0aGlzLm1hcmtlcnMuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICAgIHRoaXMubWFya2Vycy5nZXQobWVzc2FnZSkuZGVzdHJveSgpXG4gICAgICAgIHRoaXMubWFya2Vycy5kZWxldGUobWVzc2FnZSlcbiAgICAgIH1cbiAgICB9KSlcblxuICAgIC8vIFRPRE86IEF0b20gaW52b2tlcyBvbkRpZHtDaGFuZ2UsIFN0b3BDaGFuZ2luZ30gY2FsbGJhY2tzIGltbWVkaWF0ZWx5LiBXb3JrYXJvdW5kIGl0XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmxpbnRPbkZseUludGVydmFsJywgKGludGVydmFsKSA9PiB7XG4gICAgICBpZiAodGhpcy5jaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy5jaGFuZ2VTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgICB0aGlzLmNoYW5nZVN1YnNjcmlwdGlvbiA9IHRoaXMuZWRpdG9yLm9uRGlkQ2hhbmdlKEhlbHBlcnMuZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWxpbnQnLCB0cnVlKVxuICAgICAgfSwgaW50ZXJ2YWwpKVxuICAgIH0pXG5cbiAgICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgfVxuXG4gIHNldCBhY3RpdmUodmFsdWUpIHtcbiAgICB2YWx1ZSA9IEJvb2xlYW4odmFsdWUpXG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9hY3RpdmUpIHtcbiAgICAgIHRoaXMuX2FjdGl2ZSA9IHZhbHVlXG4gICAgICBpZiAodGhpcy5tZXNzYWdlcy5zaXplKSB7XG4gICAgICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlID0+IG1lc3NhZ2UuY3VycmVudEZpbGUgPSB2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0IGFjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlXG4gIH1cblxuICBoYW5kbGVHdXR0ZXIoKSB7XG4gICAgaWYgKHRoaXMuZ3V0dGVyICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnJlbW92ZUd1dHRlcigpXG4gICAgfVxuICAgIGlmICh0aGlzLmd1dHRlckVuYWJsZWQpIHtcbiAgICAgIHRoaXMuYWRkR3V0dGVyKClcbiAgICB9XG4gIH1cblxuICBhZGRHdXR0ZXIoKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci5ndXR0ZXJQb3NpdGlvbicpXG4gICAgdGhpcy5ndXR0ZXIgPSB0aGlzLmVkaXRvci5hZGRHdXR0ZXIoe1xuICAgICAgbmFtZTogJ2xpbnRlcicsXG4gICAgICBwcmlvcml0eTogcG9zaXRpb24gPT09ICdMZWZ0JyA/IC0xMDAgOiAxMDBcbiAgICB9KVxuICB9XG5cbiAgcmVtb3ZlR3V0dGVyKCkge1xuICAgIGlmICh0aGlzLmd1dHRlciAhPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQXRvbSB0aHJvd3Mgd2hlbiB3ZSB0cnkgdG8gcmVtb3ZlIGEgZ3V0dGVyIGNvbnRhaW5lciBmcm9tIGEgY2xvc2VkIHRleHQgZWRpdG9yXG4gICAgICAgIHRoaXMuZ3V0dGVyLmRlc3Ryb3koKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7fVxuICAgICAgdGhpcy5ndXR0ZXIgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgZ2V0TWVzc2FnZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMubWVzc2FnZXNcbiAgfVxuXG4gIGFkZE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmICghdGhpcy5tZXNzYWdlcy5oYXMobWVzc2FnZSkpIHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgICBtZXNzYWdlLmN1cnJlbnRGaWxlID0gdHJ1ZVxuICAgICAgfVxuICAgICAgdGhpcy5tZXNzYWdlcy5hZGQobWVzc2FnZSlcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtbWVzc2FnZS1hZGQnLCBtZXNzYWdlKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1tZXNzYWdlLWNoYW5nZScsIHttZXNzYWdlLCB0eXBlOiAnYWRkJ30pXG4gICAgfVxuICB9XG5cbiAgZGVsZXRlTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgaWYgKHRoaXMubWVzc2FnZXMuaGFzKG1lc3NhZ2UpKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLmRlbGV0ZShtZXNzYWdlKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1tZXNzYWdlLWRlbGV0ZScsIG1lc3NhZ2UpXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLW1lc3NhZ2UtY2hhbmdlJywge21lc3NhZ2UsIHR5cGU6ICdkZWxldGUnfSlcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVMaW5lTWVzc2FnZXMocm93KSB7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnbGludGVyLnNob3dFcnJvclRhYkxpbmUnKSkge1xuICAgICAgaWYgKHJvdyA9PT0gbnVsbCkge1xuICAgICAgICByb3cgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgICAgfVxuICAgICAgdGhpcy5jb3VudExpbmVNZXNzYWdlcyA9IDBcbiAgICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaChtZXNzYWdlID0+IHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuY3VycmVudExpbmUgPSBtZXNzYWdlLnJhbmdlICYmIG1lc3NhZ2UucmFuZ2UuaW50ZXJzZWN0c1Jvdyhyb3cpKSB7XG4gICAgICAgICAgdGhpcy5jb3VudExpbmVNZXNzYWdlcysrXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY291bnRMaW5lTWVzc2FnZXMgPSAwXG4gICAgfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2FsY3VsYXRlLWxpbmUtbWVzc2FnZXMnLCB0aGlzLmNvdW50TGluZU1lc3NhZ2VzKVxuICAgIHJldHVybiB0aGlzLmNvdW50TGluZU1lc3NhZ2VzXG4gIH1cblxuICBsaW50KG9uQ2hhbmdlID0gZmFsc2UpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnc2hvdWxkLWxpbnQnLCBvbkNoYW5nZSlcbiAgfVxuXG4gIG9uRGlkTWVzc2FnZUFkZChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1tZXNzYWdlLWFkZCcsIGNhbGxiYWNrKVxuICB9XG5cbiAgb25EaWRNZXNzYWdlRGVsZXRlKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLW1lc3NhZ2UtZGVsZXRlJywgY2FsbGJhY2spXG4gIH1cblxuICBvbkRpZE1lc3NhZ2VDaGFuZ2UoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtbWVzc2FnZS1jaGFuZ2UnLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2FsY3VsYXRlTGluZU1lc3NhZ2VzKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNhbGN1bGF0ZS1saW5lLW1lc3NhZ2VzJywgY2FsbGJhY2spXG4gIH1cblxuICBvblNob3VsZFVwZGF0ZUJ1YmJsZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Nob3VsZC11cGRhdGUtYnViYmxlJywgY2FsbGJhY2spXG4gIH1cblxuICBvblNob3VsZExpbnQoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdzaG91bGQtbGludCcsIGNhbGxiYWNrKVxuICB9XG5cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjaylcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcbiAgICBpZiAodGhpcy5tYXJrZXJzLnNpemUpIHtcbiAgICAgIHRoaXMubWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiBtYXJrZXIuZGVzdHJveSgpKVxuICAgICAgdGhpcy5tYXJrZXJzLmNsZWFyKClcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVHdXR0ZXIoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBpZiAodGhpcy5jaGFuZ2VTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuY2hhbmdlU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLmVtaXR0ZXIuZGlzcG9zZSgpXG4gICAgdGhpcy5tZXNzYWdlcy5jbGVhcigpXG4gIH1cbn1cbiJdfQ==