(function() {
  module.exports = function() {
    return {
      Parent: null,
      SmartColor: (require('./modules/SmartColor'))(),
      SmartVariable: (require('./modules/SmartVariable'))(),
      Emitter: (require('./modules/Emitter'))(),
      extensions: {},
      getExtension: function(extensionName) {
        return this.extensions[extensionName];
      },
      isFirstOpen: true,
      canOpen: true,
      element: null,
      selection: null,
      listeners: [],
      activate: function() {
        var _workspace, _workspaceView, onMouseDown, onMouseMove, onMouseUp, onMouseWheel, onResize;
        _workspace = atom.workspace;
        _workspaceView = atom.views.getView(_workspace);
        this.element = {
          el: (function() {
            var _el;
            _el = document.createElement('div');
            _el.classList.add('ColorPicker');
            return _el;
          })(),
          remove: function() {
            return this.el.parentNode.removeChild(this.el);
          },
          addClass: function(className) {
            this.el.classList.add(className);
            return this;
          },
          removeClass: function(className) {
            this.el.classList.remove(className);
            return this;
          },
          hasClass: function(className) {
            return this.el.classList.contains(className);
          },
          width: function() {
            return this.el.offsetWidth;
          },
          height: function() {
            return this.el.offsetHeight;
          },
          setHeight: function(height) {
            return this.el.style.height = height + "px";
          },
          hasChild: function(child) {
            var _parent;
            if (child && (_parent = child.parentNode)) {
              if (child === this.el) {
                return true;
              } else {
                return this.hasChild(_parent);
              }
            }
            return false;
          },
          isOpen: function() {
            return this.hasClass('is--open');
          },
          open: function() {
            return this.addClass('is--open');
          },
          close: function() {
            return this.removeClass('is--open');
          },
          isFlipped: function() {
            return this.hasClass('is--flipped');
          },
          flip: function() {
            return this.addClass('is--flipped');
          },
          unflip: function() {
            return this.removeClass('is--flipped');
          },
          setPosition: function(x, y) {
            this.el.style.left = x + "px";
            this.el.style.top = y + "px";
            return this;
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          }
        };
        this.loadExtensions();
        this.listeners.push([
          'mousedown', onMouseDown = (function(_this) {
            return function(e) {
              var _isPickerEvent;
              if (!_this.element.isOpen()) {
                return;
              }
              _isPickerEvent = _this.element.hasChild(e.target);
              _this.emitMouseDown(e, _isPickerEvent);
              if (!_isPickerEvent) {
                return _this.close();
              }
            };
          })(this)
        ]);
        window.addEventListener('mousedown', onMouseDown, true);
        this.listeners.push([
          'mousemove', onMouseMove = (function(_this) {
            return function(e) {
              var _isPickerEvent;
              if (!_this.element.isOpen()) {
                return;
              }
              _isPickerEvent = _this.element.hasChild(e.target);
              return _this.emitMouseMove(e, _isPickerEvent);
            };
          })(this)
        ]);
        window.addEventListener('mousemove', onMouseMove, true);
        this.listeners.push([
          'mouseup', onMouseUp = (function(_this) {
            return function(e) {
              var _isPickerEvent;
              if (!_this.element.isOpen()) {
                return;
              }
              _isPickerEvent = _this.element.hasChild(e.target);
              return _this.emitMouseUp(e, _isPickerEvent);
            };
          })(this)
        ]);
        window.addEventListener('mouseup', onMouseUp, true);
        this.listeners.push([
          'mousewheel', onMouseWheel = (function(_this) {
            return function(e) {
              var _isPickerEvent;
              if (!_this.element.isOpen()) {
                return;
              }
              _isPickerEvent = _this.element.hasChild(e.target);
              return _this.emitMouseWheel(e, _isPickerEvent);
            };
          })(this)
        ]);
        window.addEventListener('mousewheel', onMouseWheel);
        _workspaceView.addEventListener('keydown', (function(_this) {
          return function(e) {
            var _isPickerEvent;
            if (!_this.element.isOpen()) {
              return;
            }
            _isPickerEvent = _this.element.hasChild(e.target);
            _this.emitKeyDown(e, _isPickerEvent);
            return _this.close();
          };
        })(this));
        atom.workspace.observeTextEditors((function(_this) {
          return function(editor) {
            var _editorView, _subscriptionLeft, _subscriptionTop;
            _editorView = atom.views.getView(editor);
            _subscriptionTop = _editorView.onDidChangeScrollTop(function() {
              return _this.close();
            });
            _subscriptionLeft = _editorView.onDidChangeScrollLeft(function() {
              return _this.close();
            });
            editor.onDidDestroy(function() {
              _subscriptionTop.dispose();
              return _subscriptionLeft.dispose();
            });
            _this.onBeforeDestroy(function() {
              _subscriptionTop.dispose();
              return _subscriptionLeft.dispose();
            });
          };
        })(this));
        this.listeners.push([
          'resize', onResize = (function(_this) {
            return function() {
              return _this.close();
            };
          })(this)
        ]);
        window.addEventListener('resize', onResize);
        _workspace.getActivePane().onDidChangeActiveItem((function(_this) {
          return function() {
            return _this.close();
          };
        })(this));
        this.close();
        this.canOpen = true;
        (this.Parent = (atom.views.getView(atom.workspace)).querySelector('.vertical')).appendChild(this.element.el);
        return this;
      },
      destroy: function() {
        var _event, _listener, i, len, ref, ref1;
        this.emitBeforeDestroy();
        ref = this.listeners;
        for (i = 0, len = ref.length; i < len; i++) {
          ref1 = ref[i], _event = ref1[0], _listener = ref1[1];
          window.removeEventListener(_event, _listener);
        }
        this.element.remove();
        return this.canOpen = false;
      },
      loadExtensions: function() {
        var _extension, _requiredExtension, i, len, ref;
        ref = ['Arrow', 'Color', 'Body', 'Saturation', 'Alpha', 'Hue', 'Definition', 'Return', 'Format'];
        for (i = 0, len = ref.length; i < len; i++) {
          _extension = ref[i];
          _requiredExtension = (require("./extensions/" + _extension))(this);
          this.extensions[_extension] = _requiredExtension;
          if (typeof _requiredExtension.activate === "function") {
            _requiredExtension.activate();
          }
        }
      },
      emitMouseDown: function(e, isOnPicker) {
        return this.Emitter.emit('mouseDown', e, isOnPicker);
      },
      onMouseDown: function(callback) {
        return this.Emitter.on('mouseDown', callback);
      },
      emitMouseMove: function(e, isOnPicker) {
        return this.Emitter.emit('mouseMove', e, isOnPicker);
      },
      onMouseMove: function(callback) {
        return this.Emitter.on('mouseMove', callback);
      },
      emitMouseUp: function(e, isOnPicker) {
        return this.Emitter.emit('mouseUp', e, isOnPicker);
      },
      onMouseUp: function(callback) {
        return this.Emitter.on('mouseUp', callback);
      },
      emitMouseWheel: function(e, isOnPicker) {
        return this.Emitter.emit('mouseWheel', e, isOnPicker);
      },
      onMouseWheel: function(callback) {
        return this.Emitter.on('mouseWheel', callback);
      },
      emitKeyDown: function(e, isOnPicker) {
        return this.Emitter.emit('keyDown', e, isOnPicker);
      },
      onKeyDown: function(callback) {
        return this.Emitter.on('keyDown', callback);
      },
      emitPositionChange: function(position, colorPickerPosition) {
        return this.Emitter.emit('positionChange', position, colorPickerPosition);
      },
      onPositionChange: function(callback) {
        return this.Emitter.on('positionChange', callback);
      },
      emitOpen: function() {
        return this.Emitter.emit('open');
      },
      onOpen: function(callback) {
        return this.Emitter.on('open', callback);
      },
      emitBeforeOpen: function() {
        return this.Emitter.emit('beforeOpen');
      },
      onBeforeOpen: function(callback) {
        return this.Emitter.on('beforeOpen', callback);
      },
      emitClose: function() {
        return this.Emitter.emit('close');
      },
      onClose: function(callback) {
        return this.Emitter.on('close', callback);
      },
      emitBeforeDestroy: function() {
        return this.Emitter.emit('beforeDestroy');
      },
      onBeforeDestroy: function(callback) {
        return this.Emitter.on('beforeDestroy', callback);
      },
      emitInputColor: function(smartColor, wasFound) {
        if (wasFound == null) {
          wasFound = true;
        }
        return this.Emitter.emit('inputColor', smartColor, wasFound);
      },
      onInputColor: function(callback) {
        return this.Emitter.on('inputColor', callback);
      },
      emitInputVariable: function(match) {
        return this.Emitter.emit('inputVariable', match);
      },
      onInputVariable: function(callback) {
        return this.Emitter.on('inputVariable', callback);
      },
      emitInputVariableColor: function(smartColor, pointer) {
        return this.Emitter.emit('inputVariableColor', smartColor, pointer);
      },
      onInputVariableColor: function(callback) {
        return this.Emitter.on('inputVariableColor', callback);
      },
      open: function(Editor, Cursor) {
        var EditorElement, EditorRoot, EditorView, PaneView, _colorMatches, _colorPickerPosition, _convertedColor, _cursorBufferRow, _cursorColumn, _cursorPosition, _cursorScreenRow, _editorOffsetLeft, _editorOffsetTop, _editorScrollTop, _lineContent, _lineHeight, _lineOffsetLeft, _match, _matches, _paneOffsetLeft, _paneOffsetTop, _position, _preferredFormat, _randomColor, _rect, _redColor, _right, _selection, _totalOffsetLeft, _totalOffsetTop, _variableMatches, _visibleRowRange;
        if (Editor == null) {
          Editor = null;
        }
        if (Cursor == null) {
          Cursor = null;
        }
        if (!this.canOpen) {
          return;
        }
        this.emitBeforeOpen();
        if (!Editor) {
          Editor = atom.workspace.getActiveTextEditor();
        }
        EditorView = atom.views.getView(Editor);
        EditorElement = Editor.getElement();
        if (!EditorView) {
          return;
        }
        EditorRoot = EditorView.shadowRoot || EditorView;
        this.selection = null;
        if (!Cursor) {
          Cursor = Editor.getLastCursor();
        }
        _visibleRowRange = EditorView.getVisibleRowRange();
        _cursorScreenRow = Cursor.getScreenRow();
        _cursorBufferRow = Cursor.getBufferRow();
        if ((_cursorScreenRow < _visibleRowRange[0]) || (_cursorScreenRow > _visibleRowRange[1])) {
          return;
        }
        _lineContent = Cursor.getCurrentBufferLine();
        _colorMatches = this.SmartColor.find(_lineContent);
        _variableMatches = this.SmartVariable.find(_lineContent, Editor.getPath());
        _matches = _colorMatches.concat(_variableMatches);
        _cursorPosition = EditorElement.pixelPositionForScreenPosition(Cursor.getScreenPosition());
        _cursorColumn = Cursor.getBufferColumn();
        _match = (function() {
          var i, len;
          for (i = 0, len = _matches.length; i < len; i++) {
            _match = _matches[i];
            if (_match.start <= _cursorColumn && _match.end >= _cursorColumn) {
              return _match;
            }
          }
        })();
        if (_match) {
          Editor.clearSelections();
          _selection = Editor.addSelectionForBufferRange([[_cursorBufferRow, _match.start], [_cursorBufferRow, _match.end]]);
          this.selection = {
            match: _match,
            row: _cursorBufferRow
          };
        } else {
          this.selection = {
            column: _cursorColumn,
            row: _cursorBufferRow
          };
        }
        if (_match) {
          if (_match.isVariable != null) {
            _match.getDefinition().then((function(_this) {
              return function(definition) {
                var _smartColor;
                _smartColor = (_this.SmartColor.find(definition.value))[0].getSmartColor();
                return _this.emitInputVariableColor(_smartColor, definition.pointer);
              };
            })(this))["catch"]((function(_this) {
              return function(error) {
                return _this.emitInputVariableColor(false);
              };
            })(this));
            this.emitInputVariable(_match);
          } else {
            this.emitInputColor(_match.getSmartColor());
          }
        } else if (atom.config.get('color-picker.randomColor')) {
          _randomColor = this.SmartColor.RGBArray([((Math.random() * 255) + .5) << 0, ((Math.random() * 255) + .5) << 0, ((Math.random() * 255) + .5) << 0]);
          _preferredFormat = atom.config.get('color-picker.preferredFormat');
          _convertedColor = _randomColor["to" + _preferredFormat]();
          _randomColor = this.SmartColor[_preferredFormat](_convertedColor);
          this.emitInputColor(_randomColor, false);
        } else if (this.isFirstOpen) {
          _redColor = this.SmartColor.HEX('#f00');
          _preferredFormat = atom.config.get('color-picker.preferredFormat');
          if (_redColor.format !== _preferredFormat) {
            _convertedColor = _redColor["to" + _preferredFormat]();
            _redColor = this.SmartColor[_preferredFormat](_convertedColor);
          }
          this.isFirstOpen = false;
          this.emitInputColor(_redColor, false);
        }
        PaneView = atom.views.getView(atom.workspace.getActivePane());
        _paneOffsetTop = PaneView.offsetTop;
        _paneOffsetLeft = PaneView.offsetLeft;
        _editorOffsetTop = EditorView.parentNode.offsetTop;
        _editorOffsetLeft = EditorRoot.querySelector('.scroll-view').offsetLeft;
        _editorScrollTop = EditorView.getScrollTop();
        _lineHeight = Editor.getLineHeightInPixels();
        _lineOffsetLeft = EditorRoot.querySelector('.line').offsetLeft;
        if (_match) {
          _rect = EditorElement.pixelRectForScreenRange(_selection.getScreenRange());
          _right = _rect.left + _rect.width;
          _cursorPosition.left = _right - (_rect.width / 2);
        }
        _totalOffsetTop = _paneOffsetTop + _lineHeight - _editorScrollTop + _editorOffsetTop;
        _totalOffsetLeft = _paneOffsetLeft + _editorOffsetLeft + _lineOffsetLeft;
        _position = {
          x: _cursorPosition.left + _totalOffsetLeft,
          y: _cursorPosition.top + _totalOffsetTop
        };
        _colorPickerPosition = {
          x: (function(_this) {
            return function() {
              var _colorPickerWidth, _halfColorPickerWidth, _x;
              _colorPickerWidth = _this.element.width();
              _halfColorPickerWidth = (_colorPickerWidth / 2) << 0;
              _x = Math.max(10, _position.x - _halfColorPickerWidth);
              _x = Math.min(_this.Parent.offsetWidth - _colorPickerWidth - 10, _x);
              return _x;
            };
          })(this)(),
          y: (function(_this) {
            return function() {
              _this.element.unflip();
              if (_this.element.height() + _position.y > _this.Parent.offsetHeight - 32) {
                _this.element.flip();
                return _position.y - _lineHeight - _this.element.height();
              } else {
                return _position.y;
              }
            };
          })(this)()
        };
        this.element.setPosition(_colorPickerPosition.x, _colorPickerPosition.y);
        this.emitPositionChange(_position, _colorPickerPosition);
        requestAnimationFrame((function(_this) {
          return function() {
            _this.element.open();
            return _this.emitOpen();
          };
        })(this));
        return true;
      },
      canReplace: true,
      replace: function(color) {
        var Editor, _cursorEnd, _cursorStart;
        if (!this.canReplace) {
          return;
        }
        this.canReplace = false;
        Editor = atom.workspace.getActiveTextEditor();
        Editor.clearSelections();
        if (this.selection.match) {
          _cursorStart = this.selection.match.start;
          _cursorEnd = this.selection.match.end;
        } else {
          _cursorStart = _cursorEnd = this.selection.column;
        }
        Editor.addSelectionForBufferRange([[this.selection.row, _cursorStart], [this.selection.row, _cursorEnd]]);
        Editor.replaceSelectedText(null, (function(_this) {
          return function() {
            return color;
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var ref;
            Editor.setCursorBufferPosition([_this.selection.row, _cursorStart]);
            Editor.clearSelections();
            if ((ref = _this.selection.match) != null) {
              ref.end = _cursorStart + color.length;
            }
            Editor.addSelectionForBufferRange([[_this.selection.row, _cursorStart], [_this.selection.row, _cursorStart + color.length]]);
            return setTimeout((function() {
              return _this.canReplace = true;
            }), 100);
          };
        })(this));
      },
      close: function() {
        this.element.close();
        return this.emitClose();
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9jb2xvci1waWNrZXIvbGliL0NvbG9yUGlja2VyLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlJO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQTtXQUNiO01BQUEsTUFBQSxFQUFRLElBQVI7TUFFQSxVQUFBLEVBQVksQ0FBQyxPQUFBLENBQVEsc0JBQVIsQ0FBRCxDQUFBLENBQUEsQ0FGWjtNQUdBLGFBQUEsRUFBZSxDQUFDLE9BQUEsQ0FBUSx5QkFBUixDQUFELENBQUEsQ0FBQSxDQUhmO01BSUEsT0FBQSxFQUFTLENBQUMsT0FBQSxDQUFRLG1CQUFSLENBQUQsQ0FBQSxDQUFBLENBSlQ7TUFNQSxVQUFBLEVBQVksRUFOWjtNQU9BLFlBQUEsRUFBYyxTQUFDLGFBQUQ7ZUFBbUIsSUFBQyxDQUFBLFVBQVcsQ0FBQSxhQUFBO01BQS9CLENBUGQ7TUFTQSxXQUFBLEVBQWEsSUFUYjtNQVVBLE9BQUEsRUFBUyxJQVZUO01BV0EsT0FBQSxFQUFTLElBWFQ7TUFZQSxTQUFBLEVBQVcsSUFaWDtNQWNBLFNBQUEsRUFBVyxFQWRYO01BbUJBLFFBQUEsRUFBVSxTQUFBO0FBQ04sWUFBQTtRQUFBLFVBQUEsR0FBYSxJQUFJLENBQUM7UUFDbEIsY0FBQSxHQUFpQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsVUFBbkI7UUFJakIsSUFBQyxDQUFBLE9BQUQsR0FDSTtVQUFBLEVBQUEsRUFBTyxDQUFBLFNBQUE7QUFDSCxnQkFBQTtZQUFBLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtZQUNOLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBZCxDQUFrQixhQUFsQjtBQUVBLG1CQUFPO1VBSkosQ0FBQSxDQUFILENBQUEsQ0FBSjtVQU1BLE1BQUEsRUFBUSxTQUFB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Q0FBQyxHQUFaLEVBQWlCLFlBQWpCLENBRDhCLEVBRTlCLENBQUMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFaLEVBQWlCLFVBQWpCLENBRjhCLENBQWxDO1FBR0EsTUFBTSxDQUFDLG1CQUFQLENBQTJCLElBQTNCLEVBQWlDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUc7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakM7UUFHQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNQLGdCQUFBO1lBQUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQzNCLEtBQUMsQ0FBQSxTQUFTLENBQUMsR0FEZ0IsRUFDWCxZQURXLENBQS9CO1lBRUEsTUFBTSxDQUFDLGVBQVAsQ0FBQTs7aUJBR2dCLENBQUUsR0FBbEIsR0FBd0IsWUFBQSxHQUFlLEtBQUssQ0FBQzs7WUFFN0MsTUFBTSxDQUFDLDBCQUFQLENBQWtDLENBQzlCLENBQUMsS0FBQyxDQUFBLFNBQVMsQ0FBQyxHQUFaLEVBQWlCLFlBQWpCLENBRDhCLEVBRTlCLENBQUMsS0FBQyxDQUFBLFNBQVMsQ0FBQyxHQUFaLEVBQWlCLFlBQUEsR0FBZSxLQUFLLENBQUMsTUFBdEMsQ0FGOEIsQ0FBbEM7QUFHQSxtQkFBTyxVQUFBLENBQVcsQ0FBRSxTQUFBO3FCQUFHLEtBQUMsQ0FBQSxVQUFELEdBQWM7WUFBakIsQ0FBRixDQUFYLEVBQW9DLEdBQXBDO1VBWEE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7TUFuQkssQ0E1WlQ7TUFnY0EsS0FBQSxFQUFPLFNBQUE7UUFDSCxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBQTtlQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7TUFGRyxDQWhjUDs7RUFEYTtBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgQ29sb3IgUGlja2VyOiB2aWV3XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gLT5cbiAgICAgICAgUGFyZW50OiBudWxsXG5cbiAgICAgICAgU21hcnRDb2xvcjogKHJlcXVpcmUgJy4vbW9kdWxlcy9TbWFydENvbG9yJykoKVxuICAgICAgICBTbWFydFZhcmlhYmxlOiAocmVxdWlyZSAnLi9tb2R1bGVzL1NtYXJ0VmFyaWFibGUnKSgpXG4gICAgICAgIEVtaXR0ZXI6IChyZXF1aXJlICcuL21vZHVsZXMvRW1pdHRlcicpKClcblxuICAgICAgICBleHRlbnNpb25zOiB7fVxuICAgICAgICBnZXRFeHRlbnNpb246IChleHRlbnNpb25OYW1lKSAtPiBAZXh0ZW5zaW9uc1tleHRlbnNpb25OYW1lXVxuXG4gICAgICAgIGlzRmlyc3RPcGVuOiB5ZXNcbiAgICAgICAgY2FuT3BlbjogeWVzXG4gICAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICAgICAgc2VsZWN0aW9uOiBudWxsXG5cbiAgICAgICAgbGlzdGVuZXJzOiBbXVxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgQ3JlYXRlIGFuZCBhY3RpdmF0ZSBDb2xvciBQaWNrZXIgdmlld1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBhY3RpdmF0ZTogLT5cbiAgICAgICAgICAgIF93b3Jrc3BhY2UgPSBhdG9tLndvcmtzcGFjZVxuICAgICAgICAgICAgX3dvcmtzcGFjZVZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcgX3dvcmtzcGFjZVxuXG4gICAgICAgICMgIENyZWF0ZSBlbGVtZW50XG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBAZWxlbWVudCA9XG4gICAgICAgICAgICAgICAgZWw6IGRvIC0+XG4gICAgICAgICAgICAgICAgICAgIF9lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgICAgICAgICAgICAgX2VsLmNsYXNzTGlzdC5hZGQgJ0NvbG9yUGlja2VyJ1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfZWxcbiAgICAgICAgICAgICAgICAjIFV0aWxpdHkgZnVuY3Rpb25zXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiAtPiBAZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCBAZWxcblxuICAgICAgICAgICAgICAgIGFkZENsYXNzOiAoY2xhc3NOYW1lKSAtPiBAZWwuY2xhc3NMaXN0LmFkZCBjbGFzc05hbWU7IHJldHVybiB0aGlzXG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3M6IChjbGFzc05hbWUpIC0+IEBlbC5jbGFzc0xpc3QucmVtb3ZlIGNsYXNzTmFtZTsgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgICAgICBoYXNDbGFzczogKGNsYXNzTmFtZSkgLT4gQGVsLmNsYXNzTGlzdC5jb250YWlucyBjbGFzc05hbWVcblxuICAgICAgICAgICAgICAgIHdpZHRoOiAtPiBAZWwub2Zmc2V0V2lkdGhcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IC0+IEBlbC5vZmZzZXRIZWlnaHRcblxuICAgICAgICAgICAgICAgIHNldEhlaWdodDogKGhlaWdodCkgLT4gQGVsLnN0eWxlLmhlaWdodCA9IFwiI3sgaGVpZ2h0IH1weFwiXG5cbiAgICAgICAgICAgICAgICBoYXNDaGlsZDogKGNoaWxkKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBjaGlsZCBhbmQgX3BhcmVudCA9IGNoaWxkLnBhcmVudE5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoaWxkIGlzIEBlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBAaGFzQ2hpbGQgX3BhcmVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICAgICAgICAgICMgT3BlbiAmIENsb3NlIHRoZSBDb2xvciBQaWNrZXJcbiAgICAgICAgICAgICAgICBpc09wZW46IC0+IEBoYXNDbGFzcyAnaXMtLW9wZW4nXG4gICAgICAgICAgICAgICAgb3BlbjogLT4gQGFkZENsYXNzICdpcy0tb3BlbidcbiAgICAgICAgICAgICAgICBjbG9zZTogLT4gQHJlbW92ZUNsYXNzICdpcy0tb3BlbidcblxuICAgICAgICAgICAgICAgICMgRmxpcCAmIFVuZmxpcCB0aGUgQ29sb3IgUGlja2VyXG4gICAgICAgICAgICAgICAgaXNGbGlwcGVkOiAtPiBAaGFzQ2xhc3MgJ2lzLS1mbGlwcGVkJ1xuICAgICAgICAgICAgICAgIGZsaXA6IC0+IEBhZGRDbGFzcyAnaXMtLWZsaXBwZWQnXG4gICAgICAgICAgICAgICAgdW5mbGlwOiAtPiBAcmVtb3ZlQ2xhc3MgJ2lzLS1mbGlwcGVkJ1xuXG4gICAgICAgICAgICAgICAgIyBTZXQgQ29sb3IgUGlja2VyIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgIyAtIHgge051bWJlcn1cbiAgICAgICAgICAgICAgICAjIC0geSB7TnVtYmVyfVxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uOiAoeCwgeSkgLT5cbiAgICAgICAgICAgICAgICAgICAgQGVsLnN0eWxlLmxlZnQgPSBcIiN7IHggfXB4XCJcbiAgICAgICAgICAgICAgICAgICAgQGVsLnN0eWxlLnRvcCA9IFwiI3sgeSB9cHhcIlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1xuXG4gICAgICAgICAgICAgICAgIyBBZGQgYSBjaGlsZCBvbiB0aGUgQ29sb3JQaWNrZXIgZWxlbWVudFxuICAgICAgICAgICAgICAgIGFkZDogKGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIEBlbC5hcHBlbmRDaGlsZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgICAgICBAbG9hZEV4dGVuc2lvbnMoKVxuXG4gICAgICAgICMgIENsb3NlIHRoZSBDb2xvciBQaWNrZXIgb24gYW55IGFjdGl2aXR5IHVucmVsYXRlZCB0byBpdFxuICAgICAgICAjICBidXQgYWxzbyBlbWl0IGV2ZW50cyBvbiB0aGUgQ29sb3IgUGlja2VyXG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBAbGlzdGVuZXJzLnB1c2ggWydtb3VzZWRvd24nLCBvbk1vdXNlRG93biA9IChlKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGVsZW1lbnQuaXNPcGVuKClcblxuICAgICAgICAgICAgICAgIF9pc1BpY2tlckV2ZW50ID0gQGVsZW1lbnQuaGFzQ2hpbGQgZS50YXJnZXRcbiAgICAgICAgICAgICAgICBAZW1pdE1vdXNlRG93biBlLCBfaXNQaWNrZXJFdmVudFxuICAgICAgICAgICAgICAgIHJldHVybiBAY2xvc2UoKSB1bmxlc3MgX2lzUGlja2VyRXZlbnRdXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgb25Nb3VzZURvd24sIHRydWVcblxuICAgICAgICAgICAgQGxpc3RlbmVycy5wdXNoIFsnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUgPSAoZSkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBlbGVtZW50LmlzT3BlbigpXG5cbiAgICAgICAgICAgICAgICBfaXNQaWNrZXJFdmVudCA9IEBlbGVtZW50Lmhhc0NoaWxkIGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgQGVtaXRNb3VzZU1vdmUgZSwgX2lzUGlja2VyRXZlbnRdXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIHRydWVcblxuICAgICAgICAgICAgQGxpc3RlbmVycy5wdXNoIFsnbW91c2V1cCcsIG9uTW91c2VVcCA9IChlKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGVsZW1lbnQuaXNPcGVuKClcblxuICAgICAgICAgICAgICAgIF9pc1BpY2tlckV2ZW50ID0gQGVsZW1lbnQuaGFzQ2hpbGQgZS50YXJnZXRcbiAgICAgICAgICAgICAgICBAZW1pdE1vdXNlVXAgZSwgX2lzUGlja2VyRXZlbnRdXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIG9uTW91c2VVcCwgdHJ1ZVxuXG4gICAgICAgICAgICBAbGlzdGVuZXJzLnB1c2ggWydtb3VzZXdoZWVsJywgb25Nb3VzZVdoZWVsID0gKGUpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBAZWxlbWVudC5pc09wZW4oKVxuXG4gICAgICAgICAgICAgICAgX2lzUGlja2VyRXZlbnQgPSBAZWxlbWVudC5oYXNDaGlsZCBlLnRhcmdldFxuICAgICAgICAgICAgICAgIEBlbWl0TW91c2VXaGVlbCBlLCBfaXNQaWNrZXJFdmVudF1cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJywgb25Nb3VzZVdoZWVsXG5cbiAgICAgICAgICAgIF93b3Jrc3BhY2VWaWV3LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAoZSkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBlbGVtZW50LmlzT3BlbigpXG5cbiAgICAgICAgICAgICAgICBfaXNQaWNrZXJFdmVudCA9IEBlbGVtZW50Lmhhc0NoaWxkIGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgQGVtaXRLZXlEb3duIGUsIF9pc1BpY2tlckV2ZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbG9zZSgpXG5cbiAgICAgICAgICAgICMgQ2xvc2UgaXQgb24gc2Nyb2xsIGFsc29cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgICAgIF9lZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3IGVkaXRvclxuICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25Ub3AgPSBfZWRpdG9yVmlldy5vbkRpZENoYW5nZVNjcm9sbFRvcCA9PiBAY2xvc2UoKVxuICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25MZWZ0ID0gX2VkaXRvclZpZXcub25EaWRDaGFuZ2VTY3JvbGxMZWZ0ID0+IEBjbG9zZSgpXG5cbiAgICAgICAgICAgICAgICBlZGl0b3Iub25EaWREZXN0cm95IC0+XG4gICAgICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25Ub3AuZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25MZWZ0LmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgIEBvbkJlZm9yZURlc3Ryb3kgLT5cbiAgICAgICAgICAgICAgICAgICAgX3N1YnNjcmlwdGlvblRvcC5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICAgICAgX3N1YnNjcmlwdGlvbkxlZnQuZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgICMgQ2xvc2UgaXQgd2hlbiB0aGUgd2luZG93IHJlc2l6ZXNcbiAgICAgICAgICAgIEBsaXN0ZW5lcnMucHVzaCBbJ3Jlc2l6ZScsIG9uUmVzaXplID0gPT5cbiAgICAgICAgICAgICAgICBAY2xvc2UoKV1cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCBvblJlc2l6ZVxuXG4gICAgICAgICAgICAjIENsb3NlIGl0IHdoZW4gdGhlIGFjdGl2ZSBpdGVtIGlzIGNoYW5nZWRcbiAgICAgICAgICAgIF93b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLm9uRGlkQ2hhbmdlQWN0aXZlSXRlbSA9PiBAY2xvc2UoKVxuXG4gICAgICAgICMgIFBsYWNlIHRoZSBDb2xvciBQaWNrZXIgZWxlbWVudFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgQGNsb3NlKClcbiAgICAgICAgICAgIEBjYW5PcGVuID0geWVzXG5cbiAgICAgICAgICAgICMgVE9ETzogSXMgdGhpcyByZWFsbHkgdGhlIGJlc3Qgd2F5IHRvIGRvIHRoaXM/IEhpbnQ6IFByb2JhYmx5IG5vdFxuICAgICAgICAgICAgKEBQYXJlbnQgPSAoYXRvbS52aWV3cy5nZXRWaWV3IGF0b20ud29ya3NwYWNlKS5xdWVyeVNlbGVjdG9yICcudmVydGljYWwnKVxuICAgICAgICAgICAgICAgIC5hcHBlbmRDaGlsZCBAZWxlbWVudC5lbFxuICAgICAgICAgICAgcmV0dXJuIHRoaXNcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIERlc3Ryb3kgdGhlIHZpZXcgYW5kIHVuYmluZCBldmVudHNcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgZGVzdHJveTogLT5cbiAgICAgICAgICAgIEBlbWl0QmVmb3JlRGVzdHJveSgpXG5cbiAgICAgICAgICAgIGZvciBbX2V2ZW50LCBfbGlzdGVuZXJdIGluIEBsaXN0ZW5lcnNcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciBfZXZlbnQsIF9saXN0ZW5lclxuXG4gICAgICAgICAgICBAZWxlbWVudC5yZW1vdmUoKVxuICAgICAgICAgICAgQGNhbk9wZW4gPSBub1xuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgTG9hZCBDb2xvciBQaWNrZXIgZXh0ZW5zaW9ucyAvLyBtb3JlIGxpa2UgZGVwZW5kZW5jaWVzXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIGxvYWRFeHRlbnNpb25zOiAtPlxuICAgICAgICAgICAgIyBUT0RPOiBUaGlzIGlzIHJlYWxseSBzdHVwaWQuIFNob3VsZCB0aGlzIGJlIGRvbmUgd2l0aCBgZnNgIG9yIHNvbWV0aGluZz9cbiAgICAgICAgICAgICMgVE9ETzogRXh0ZW5zaW9uIGZpbGVzIGhhdmUgcHJldHR5IG11Y2ggdGhlIHNhbWUgYmFzZS4gU2ltcGxpZnk/XG4gICAgICAgICAgICBmb3IgX2V4dGVuc2lvbiBpbiBbJ0Fycm93JywgJ0NvbG9yJywgJ0JvZHknLCAnU2F0dXJhdGlvbicsICdBbHBoYScsICdIdWUnLCAnRGVmaW5pdGlvbicsICdSZXR1cm4nLCAnRm9ybWF0J11cbiAgICAgICAgICAgICAgICBfcmVxdWlyZWRFeHRlbnNpb24gPSAocmVxdWlyZSBcIi4vZXh0ZW5zaW9ucy8jeyBfZXh0ZW5zaW9uIH1cIikodGhpcylcbiAgICAgICAgICAgICAgICBAZXh0ZW5zaW9uc1tfZXh0ZW5zaW9uXSA9IF9yZXF1aXJlZEV4dGVuc2lvblxuICAgICAgICAgICAgICAgIF9yZXF1aXJlZEV4dGVuc2lvbi5hY3RpdmF0ZT8oKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBTZXQgdXAgZXZlbnRzIGFuZCBoYW5kbGluZ1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAjIE1vdXNlIGV2ZW50c1xuICAgICAgICBlbWl0TW91c2VEb3duOiAoZSwgaXNPblBpY2tlcikgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ21vdXNlRG93bicsIGUsIGlzT25QaWNrZXJcbiAgICAgICAgb25Nb3VzZURvd246IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdtb3VzZURvd24nLCBjYWxsYmFja1xuXG4gICAgICAgIGVtaXRNb3VzZU1vdmU6IChlLCBpc09uUGlja2VyKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnbW91c2VNb3ZlJywgZSwgaXNPblBpY2tlclxuICAgICAgICBvbk1vdXNlTW92ZTogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ21vdXNlTW92ZScsIGNhbGxiYWNrXG5cbiAgICAgICAgZW1pdE1vdXNlVXA6IChlLCBpc09uUGlja2VyKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnbW91c2VVcCcsIGUsIGlzT25QaWNrZXJcbiAgICAgICAgb25Nb3VzZVVwOiAoY2FsbGJhY2spIC0+XG4gICAgICAgICAgICBARW1pdHRlci5vbiAnbW91c2VVcCcsIGNhbGxiYWNrXG5cbiAgICAgICAgZW1pdE1vdXNlV2hlZWw6IChlLCBpc09uUGlja2VyKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnbW91c2VXaGVlbCcsIGUsIGlzT25QaWNrZXJcbiAgICAgICAgb25Nb3VzZVdoZWVsOiAoY2FsbGJhY2spIC0+XG4gICAgICAgICAgICBARW1pdHRlci5vbiAnbW91c2VXaGVlbCcsIGNhbGxiYWNrXG5cbiAgICAgICAgIyBLZXkgZXZlbnRzXG4gICAgICAgIGVtaXRLZXlEb3duOiAoZSwgaXNPblBpY2tlcikgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ2tleURvd24nLCBlLCBpc09uUGlja2VyXG4gICAgICAgIG9uS2V5RG93bjogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2tleURvd24nLCBjYWxsYmFja1xuXG4gICAgICAgICMgUG9zaXRpb24gQ2hhbmdlXG4gICAgICAgIGVtaXRQb3NpdGlvbkNoYW5nZTogKHBvc2l0aW9uLCBjb2xvclBpY2tlclBvc2l0aW9uKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAncG9zaXRpb25DaGFuZ2UnLCBwb3NpdGlvbiwgY29sb3JQaWNrZXJQb3NpdGlvblxuICAgICAgICBvblBvc2l0aW9uQ2hhbmdlOiAoY2FsbGJhY2spIC0+XG4gICAgICAgICAgICBARW1pdHRlci5vbiAncG9zaXRpb25DaGFuZ2UnLCBjYWxsYmFja1xuXG4gICAgICAgICMgT3BlbmluZ1xuICAgICAgICBlbWl0T3BlbjogLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ29wZW4nXG4gICAgICAgIG9uT3BlbjogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ29wZW4nLCBjYWxsYmFja1xuXG4gICAgICAgICMgQmVmb3JlIG9wZW5pbmdcbiAgICAgICAgZW1pdEJlZm9yZU9wZW46IC0+XG4gICAgICAgICAgICBARW1pdHRlci5lbWl0ICdiZWZvcmVPcGVuJ1xuICAgICAgICBvbkJlZm9yZU9wZW46IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdiZWZvcmVPcGVuJywgY2FsbGJhY2tcblxuICAgICAgICAjIENsb3NpbmdcbiAgICAgICAgZW1pdENsb3NlOiAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnY2xvc2UnXG4gICAgICAgIG9uQ2xvc2U6IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdjbG9zZScsIGNhbGxiYWNrXG5cbiAgICAgICAgIyBCZWZvcmUgZGVzdHJveWluZ1xuICAgICAgICBlbWl0QmVmb3JlRGVzdHJveTogLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ2JlZm9yZURlc3Ryb3knXG4gICAgICAgIG9uQmVmb3JlRGVzdHJveTogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2JlZm9yZURlc3Ryb3knLCBjYWxsYmFja1xuXG4gICAgICAgICMgSW5wdXQgQ29sb3JcbiAgICAgICAgZW1pdElucHV0Q29sb3I6IChzbWFydENvbG9yLCB3YXNGb3VuZD10cnVlKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnaW5wdXRDb2xvcicsIHNtYXJ0Q29sb3IsIHdhc0ZvdW5kXG4gICAgICAgIG9uSW5wdXRDb2xvcjogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2lucHV0Q29sb3InLCBjYWxsYmFja1xuXG4gICAgICAgICMgSW5wdXQgVmFyaWFibGVcbiAgICAgICAgZW1pdElucHV0VmFyaWFibGU6IChtYXRjaCkgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ2lucHV0VmFyaWFibGUnLCBtYXRjaFxuICAgICAgICBvbklucHV0VmFyaWFibGU6IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdpbnB1dFZhcmlhYmxlJywgY2FsbGJhY2tcblxuICAgICAgICAjIElucHV0IFZhcmlhYmxlIENvbG9yXG4gICAgICAgIGVtaXRJbnB1dFZhcmlhYmxlQ29sb3I6IChzbWFydENvbG9yLCBwb2ludGVyKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnaW5wdXRWYXJpYWJsZUNvbG9yJywgc21hcnRDb2xvciwgcG9pbnRlclxuICAgICAgICBvbklucHV0VmFyaWFibGVDb2xvcjogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2lucHV0VmFyaWFibGVDb2xvcicsIGNhbGxiYWNrXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBPcGVuIHRoZSBDb2xvciBQaWNrZXJcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgb3BlbjogKEVkaXRvcj1udWxsLCBDdXJzb3I9bnVsbCkgLT5cbiAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGNhbk9wZW5cbiAgICAgICAgICAgIEBlbWl0QmVmb3JlT3BlbigpXG5cbiAgICAgICAgICAgIEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSB1bmxlc3MgRWRpdG9yXG4gICAgICAgICAgICBFZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3IEVkaXRvclxuICAgICAgICAgICAgRWRpdG9yRWxlbWVudCA9IEVkaXRvci5nZXRFbGVtZW50KClcblxuICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBFZGl0b3JWaWV3XG4gICAgICAgICAgICBFZGl0b3JSb290ID0gRWRpdG9yVmlldy5zaGFkb3dSb290IG9yIEVkaXRvclZpZXdcblxuICAgICAgICAgICAgIyBSZXNldCBzZWxlY3Rpb25cbiAgICAgICAgICAgIEBzZWxlY3Rpb24gPSBudWxsXG5cbiAgICAgICAgIyAgRmluZCB0aGUgY3VycmVudCBjdXJzb3JcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIEN1cnNvciA9IEVkaXRvci5nZXRMYXN0Q3Vyc29yKCkgdW5sZXNzIEN1cnNvclxuXG4gICAgICAgICAgICAjIEZhaWwgaWYgdGhlIGN1cnNvciBpc24ndCB2aXNpYmxlXG4gICAgICAgICAgICBfdmlzaWJsZVJvd1JhbmdlID0gRWRpdG9yVmlldy5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICAgICAgICAgICAgX2N1cnNvclNjcmVlblJvdyA9IEN1cnNvci5nZXRTY3JlZW5Sb3coKVxuICAgICAgICAgICAgX2N1cnNvckJ1ZmZlclJvdyA9IEN1cnNvci5nZXRCdWZmZXJSb3coKVxuXG4gICAgICAgICAgICByZXR1cm4gaWYgKF9jdXJzb3JTY3JlZW5Sb3cgPCBfdmlzaWJsZVJvd1JhbmdlWzBdKSBvciAoX2N1cnNvclNjcmVlblJvdyA+IF92aXNpYmxlUm93UmFuZ2VbMV0pXG5cbiAgICAgICAgICAgICMgVHJ5IG1hdGNoaW5nIHRoZSBjb250ZW50cyBvZiB0aGUgY3VycmVudCBsaW5lIHRvIGNvbG9yIHJlZ2V4ZXNcbiAgICAgICAgICAgIF9saW5lQ29udGVudCA9IEN1cnNvci5nZXRDdXJyZW50QnVmZmVyTGluZSgpXG5cbiAgICAgICAgICAgIF9jb2xvck1hdGNoZXMgPSBAU21hcnRDb2xvci5maW5kIF9saW5lQ29udGVudFxuICAgICAgICAgICAgX3ZhcmlhYmxlTWF0Y2hlcyA9IEBTbWFydFZhcmlhYmxlLmZpbmQgX2xpbmVDb250ZW50LCBFZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgICBfbWF0Y2hlcyA9IF9jb2xvck1hdGNoZXMuY29uY2F0IF92YXJpYWJsZU1hdGNoZXNcblxuICAgICAgICAgICAgIyBGaWd1cmUgb3V0IHdoaWNoIG9mIHRoZSBtYXRjaGVzIGlzIHRoZSBvbmUgdGhlIHVzZXIgd2FudHNcbiAgICAgICAgICAgIF9jdXJzb3JQb3NpdGlvbiA9IEVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uIEN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpXG4gICAgICAgICAgICBfY3Vyc29yQ29sdW1uID0gQ3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpXG5cbiAgICAgICAgICAgIF9tYXRjaCA9IGRvIC0+IGZvciBfbWF0Y2ggaW4gX21hdGNoZXNcbiAgICAgICAgICAgICAgICByZXR1cm4gX21hdGNoIGlmIF9tYXRjaC5zdGFydCA8PSBfY3Vyc29yQ29sdW1uIGFuZCBfbWF0Y2guZW5kID49IF9jdXJzb3JDb2x1bW5cblxuICAgICAgICAgICAgIyBJZiB3ZSd2ZSBnb3QgYSBtYXRjaCwgd2Ugc2hvdWxkIHNlbGVjdCBpdFxuICAgICAgICAgICAgaWYgX21hdGNoXG4gICAgICAgICAgICAgICAgRWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgICAgICAgICAgICBfc2VsZWN0aW9uID0gRWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlIFtcbiAgICAgICAgICAgICAgICAgICAgW19jdXJzb3JCdWZmZXJSb3csIF9tYXRjaC5zdGFydF1cbiAgICAgICAgICAgICAgICAgICAgW19jdXJzb3JCdWZmZXJSb3csIF9tYXRjaC5lbmRdXVxuICAgICAgICAgICAgICAgIEBzZWxlY3Rpb24gPSBtYXRjaDogX21hdGNoLCByb3c6IF9jdXJzb3JCdWZmZXJSb3dcbiAgICAgICAgICAgICMgQnV0IGlmIHdlIGRvbid0IGhhdmUgYSBtYXRjaCwgY2VudGVyIHRoZSBDb2xvciBQaWNrZXIgb24gbGFzdCBjdXJzb3JcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAc2VsZWN0aW9uID0gY29sdW1uOiBfY3Vyc29yQ29sdW1uLCByb3c6IF9jdXJzb3JCdWZmZXJSb3dcblxuICAgICAgICAjICBFbWl0XG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBpZiBfbWF0Y2hcbiAgICAgICAgICAgICAgICAjIFRoZSBtYXRjaCBpcyBhIHZhcmlhYmxlLiBMb29rIHVwIHRoZSBkZWZpbml0aW9uXG4gICAgICAgICAgICAgICAgaWYgX21hdGNoLmlzVmFyaWFibGU/XG4gICAgICAgICAgICAgICAgICAgIF9tYXRjaC5nZXREZWZpbml0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuIChkZWZpbml0aW9uKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9zbWFydENvbG9yID0gKEBTbWFydENvbG9yLmZpbmQgZGVmaW5pdGlvbi52YWx1ZSlbMF0uZ2V0U21hcnRDb2xvcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGVtaXRJbnB1dFZhcmlhYmxlQ29sb3IgX3NtYXJ0Q29sb3IsIGRlZmluaXRpb24ucG9pbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZW1pdElucHV0VmFyaWFibGVDb2xvciBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBAZW1pdElucHV0VmFyaWFibGUgX21hdGNoXG4gICAgICAgICAgICAgICAgIyBUaGUgbWF0Y2ggaXMgYSBjb2xvclxuICAgICAgICAgICAgICAgIGVsc2UgQGVtaXRJbnB1dENvbG9yIF9tYXRjaC5nZXRTbWFydENvbG9yKClcbiAgICAgICAgICAgICMgTm8gbWF0Y2gsIGJ1dCBgcmFuZG9tQ29sb3JgIG9wdGlvbiBpcyBzZXRcbiAgICAgICAgICAgIGVsc2UgaWYgYXRvbS5jb25maWcuZ2V0ICdjb2xvci1waWNrZXIucmFuZG9tQ29sb3InXG4gICAgICAgICAgICAgICAgX3JhbmRvbUNvbG9yID0gQFNtYXJ0Q29sb3IuUkdCQXJyYXkgW1xuICAgICAgICAgICAgICAgICAgICAoKE1hdGgucmFuZG9tKCkgKiAyNTUpICsgLjUpIDw8IDBcbiAgICAgICAgICAgICAgICAgICAgKChNYXRoLnJhbmRvbSgpICogMjU1KSArIC41KSA8PCAwXG4gICAgICAgICAgICAgICAgICAgICgoTWF0aC5yYW5kb20oKSAqIDI1NSkgKyAuNSkgPDwgMF1cblxuICAgICAgICAgICAgICAgICMgQ29udmVydCB0byBgcHJlZmVycmVkQ29sb3JgLCBhbmQgdGhlbiBlbWl0IGl0XG4gICAgICAgICAgICAgICAgX3ByZWZlcnJlZEZvcm1hdCA9IGF0b20uY29uZmlnLmdldCAnY29sb3ItcGlja2VyLnByZWZlcnJlZEZvcm1hdCdcbiAgICAgICAgICAgICAgICBfY29udmVydGVkQ29sb3IgPSBfcmFuZG9tQ29sb3JbXCJ0byN7IF9wcmVmZXJyZWRGb3JtYXQgfVwiXSgpXG4gICAgICAgICAgICAgICAgX3JhbmRvbUNvbG9yID0gQFNtYXJ0Q29sb3JbX3ByZWZlcnJlZEZvcm1hdF0oX2NvbnZlcnRlZENvbG9yKVxuXG4gICAgICAgICAgICAgICAgQGVtaXRJbnB1dENvbG9yIF9yYW5kb21Db2xvciwgZmFsc2VcbiAgICAgICAgICAgICMgTm8gbWF0Y2gsIGFuZCBpdCdzIHRoZSBmaXJzdCBvcGVuXG4gICAgICAgICAgICBlbHNlIGlmIEBpc0ZpcnN0T3BlblxuICAgICAgICAgICAgICAgIF9yZWRDb2xvciA9IEBTbWFydENvbG9yLkhFWCAnI2YwMCdcblxuICAgICAgICAgICAgICAgICMgQ29udmVydCB0byBgcHJlZmVycmVkQ29sb3JgLCBhbmQgdGhlbiBlbWl0IGl0XG4gICAgICAgICAgICAgICAgX3ByZWZlcnJlZEZvcm1hdCA9IGF0b20uY29uZmlnLmdldCAnY29sb3ItcGlja2VyLnByZWZlcnJlZEZvcm1hdCdcblxuICAgICAgICAgICAgICAgIGlmIF9yZWRDb2xvci5mb3JtYXQgaXNudCBfcHJlZmVycmVkRm9ybWF0XG4gICAgICAgICAgICAgICAgICAgIF9jb252ZXJ0ZWRDb2xvciA9IF9yZWRDb2xvcltcInRvI3sgX3ByZWZlcnJlZEZvcm1hdCB9XCJdKClcbiAgICAgICAgICAgICAgICAgICAgX3JlZENvbG9yID0gQFNtYXJ0Q29sb3JbX3ByZWZlcnJlZEZvcm1hdF0oX2NvbnZlcnRlZENvbG9yKVxuICAgICAgICAgICAgICAgIEBpc0ZpcnN0T3BlbiA9IG5vXG5cbiAgICAgICAgICAgICAgICBAZW1pdElucHV0Q29sb3IgX3JlZENvbG9yLCBmYWxzZVxuXG4gICAgICAgICMgIEFmdGVyICgmIGlmKSBoYXZpbmcgc2VsZWN0ZWQgdGV4dCAoYXMgdGhpcyBtaWdodCBjaGFuZ2UgdGhlIHNjcm9sbFxuICAgICAgICAjICBwb3NpdGlvbikgZ2F0aGVyIGluZm9ybWF0aW9uIGFib3V0IHRoZSBFZGl0b3JcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIFBhbmVWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICAgICAgX3BhbmVPZmZzZXRUb3AgPSBQYW5lVmlldy5vZmZzZXRUb3BcbiAgICAgICAgICAgIF9wYW5lT2Zmc2V0TGVmdCA9IFBhbmVWaWV3Lm9mZnNldExlZnRcblxuICAgICAgICAgICAgX2VkaXRvck9mZnNldFRvcCA9IEVkaXRvclZpZXcucGFyZW50Tm9kZS5vZmZzZXRUb3BcbiAgICAgICAgICAgIF9lZGl0b3JPZmZzZXRMZWZ0ID0gRWRpdG9yUm9vdC5xdWVyeVNlbGVjdG9yKCcuc2Nyb2xsLXZpZXcnKS5vZmZzZXRMZWZ0XG4gICAgICAgICAgICBfZWRpdG9yU2Nyb2xsVG9wID0gRWRpdG9yVmlldy5nZXRTY3JvbGxUb3AoKVxuXG4gICAgICAgICAgICBfbGluZUhlaWdodCA9IEVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuICAgICAgICAgICAgX2xpbmVPZmZzZXRMZWZ0ID0gRWRpdG9yUm9vdC5xdWVyeVNlbGVjdG9yKCcubGluZScpLm9mZnNldExlZnRcblxuICAgICAgICAgICAgIyBDZW50ZXIgaXQgb24gdGhlIG1pZGRsZSBvZiB0aGUgc2VsZWN0aW9uIHJhbmdlXG4gICAgICAgICAgICAjIFRPRE86IFRoZXJlIGNhbiBiZSBsaW5lcyBvdmVyIG1vcmUgdGhhbiBvbmUgcm93XG4gICAgICAgICAgICBpZiBfbWF0Y2hcbiAgICAgICAgICAgICAgICBfcmVjdCA9IEVkaXRvckVsZW1lbnQucGl4ZWxSZWN0Rm9yU2NyZWVuUmFuZ2UoX3NlbGVjdGlvbi5nZXRTY3JlZW5SYW5nZSgpKVxuICAgICAgICAgICAgICAgIF9yaWdodCA9IF9yZWN0LmxlZnQgKyBfcmVjdC53aWR0aFxuICAgICAgICAgICAgICAgIF9jdXJzb3JQb3NpdGlvbi5sZWZ0ID0gX3JpZ2h0IC0gKF9yZWN0LndpZHRoIC8gMilcblxuICAgICAgICAjICBGaWd1cmUgb3V0IHdoZXJlIHRvIHBsYWNlIHRoZSBDb2xvciBQaWNrZXJcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIF90b3RhbE9mZnNldFRvcCA9IF9wYW5lT2Zmc2V0VG9wICsgX2xpbmVIZWlnaHQgLSBfZWRpdG9yU2Nyb2xsVG9wICsgX2VkaXRvck9mZnNldFRvcFxuICAgICAgICAgICAgX3RvdGFsT2Zmc2V0TGVmdCA9IF9wYW5lT2Zmc2V0TGVmdCArIF9lZGl0b3JPZmZzZXRMZWZ0ICsgX2xpbmVPZmZzZXRMZWZ0XG5cbiAgICAgICAgICAgIF9wb3NpdGlvbiA9XG4gICAgICAgICAgICAgICAgeDogX2N1cnNvclBvc2l0aW9uLmxlZnQgKyBfdG90YWxPZmZzZXRMZWZ0XG4gICAgICAgICAgICAgICAgeTogX2N1cnNvclBvc2l0aW9uLnRvcCArIF90b3RhbE9mZnNldFRvcFxuXG4gICAgICAgICMgIEZpZ3VyZSBvdXQgd2hlcmUgdG8gYWN0dWFsbHkgcGxhY2UgdGhlIENvbG9yIFBpY2tlciBieVxuICAgICAgICAjICBzZXR0aW5nIHVwIGJvdW5kYXJpZXMgYW5kIGZsaXBwaW5nIGl0IGlmIG5lY2Vzc2FyeVxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgX2NvbG9yUGlja2VyUG9zaXRpb24gPVxuICAgICAgICAgICAgICAgIHg6IGRvID0+XG4gICAgICAgICAgICAgICAgICAgIF9jb2xvclBpY2tlcldpZHRoID0gQGVsZW1lbnQud2lkdGgoKVxuICAgICAgICAgICAgICAgICAgICBfaGFsZkNvbG9yUGlja2VyV2lkdGggPSAoX2NvbG9yUGlja2VyV2lkdGggLyAyKSA8PCAwXG5cbiAgICAgICAgICAgICAgICAgICAgIyBNYWtlIHN1cmUgdGhlIENvbG9yIFBpY2tlciBpc24ndCB0b28gZmFyIHRvIHRoZSBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIF94ID0gTWF0aC5tYXggMTAsIF9wb3NpdGlvbi54IC0gX2hhbGZDb2xvclBpY2tlcldpZHRoXG4gICAgICAgICAgICAgICAgICAgICMgTWFrZSBzdXJlIHRoZSBDb2xvciBQaWNrZXIgaXNuJ3QgdG9vIGZhciB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgX3ggPSBNYXRoLm1pbiAoQFBhcmVudC5vZmZzZXRXaWR0aCAtIF9jb2xvclBpY2tlcldpZHRoIC0gMTApLCBfeFxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfeFxuICAgICAgICAgICAgICAgIHk6IGRvID0+XG4gICAgICAgICAgICAgICAgICAgIEBlbGVtZW50LnVuZmxpcCgpXG5cbiAgICAgICAgICAgICAgICAgICAgIyBUT0RPOiBJdCdzIG5vdCByZWFsbHkgd29ya2luZyBvdXQgZ3JlYXRcblxuICAgICAgICAgICAgICAgICAgICAjIElmIHRoZSBjb2xvciBwaWNrZXIgaXMgdG9vIGZhciBkb3duLCBmbGlwIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmIEBlbGVtZW50LmhlaWdodCgpICsgX3Bvc2l0aW9uLnkgPiBAUGFyZW50Lm9mZnNldEhlaWdodCAtIDMyXG4gICAgICAgICAgICAgICAgICAgICAgICBAZWxlbWVudC5mbGlwKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcG9zaXRpb24ueSAtIF9saW5lSGVpZ2h0IC0gQGVsZW1lbnQuaGVpZ2h0KClcbiAgICAgICAgICAgICAgICAgICAgIyBCdXQgaWYgaXQncyBmaW5lLCBrZWVwIHRoZSBZIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgcmV0dXJuIF9wb3NpdGlvbi55XG5cbiAgICAgICAgICAgICMgU2V0IENvbG9yIFBpY2tlciBwb3NpdGlvbiBhbmQgZW1pdCBldmVudHNcbiAgICAgICAgICAgIEBlbGVtZW50LnNldFBvc2l0aW9uIF9jb2xvclBpY2tlclBvc2l0aW9uLngsIF9jb2xvclBpY2tlclBvc2l0aW9uLnlcbiAgICAgICAgICAgIEBlbWl0UG9zaXRpb25DaGFuZ2UgX3Bvc2l0aW9uLCBfY29sb3JQaWNrZXJQb3NpdGlvblxuXG4gICAgICAgICAgICAjIE9wZW4gdGhlIENvbG9yIFBpY2tlclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+ICMgd2FpdCBmb3IgY2xhc3MgZGVsYXlcbiAgICAgICAgICAgICAgICBAZWxlbWVudC5vcGVuKClcbiAgICAgICAgICAgICAgICBAZW1pdE9wZW4oKVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIFJlcGxhY2Ugc2VsZWN0ZWQgY29sb3JcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgY2FuUmVwbGFjZTogeWVzXG4gICAgICAgIHJlcGxhY2U6IChjb2xvcikgLT5cbiAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGNhblJlcGxhY2VcbiAgICAgICAgICAgIEBjYW5SZXBsYWNlID0gbm9cblxuICAgICAgICAgICAgRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgICAgICBFZGl0b3IuY2xlYXJTZWxlY3Rpb25zKClcblxuICAgICAgICAgICAgaWYgQHNlbGVjdGlvbi5tYXRjaFxuICAgICAgICAgICAgICAgIF9jdXJzb3JTdGFydCA9IEBzZWxlY3Rpb24ubWF0Y2guc3RhcnRcbiAgICAgICAgICAgICAgICBfY3Vyc29yRW5kID0gQHNlbGVjdGlvbi5tYXRjaC5lbmRcbiAgICAgICAgICAgIGVsc2UgX2N1cnNvclN0YXJ0ID0gX2N1cnNvckVuZCA9IEBzZWxlY3Rpb24uY29sdW1uXG5cbiAgICAgICAgICAgICMgU2VsZWN0IHRoZSBjb2xvciB3ZSdyZSBnb2luZyB0byByZXBsYWNlXG4gICAgICAgICAgICBFZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UgW1xuICAgICAgICAgICAgICAgIFtAc2VsZWN0aW9uLnJvdywgX2N1cnNvclN0YXJ0XVxuICAgICAgICAgICAgICAgIFtAc2VsZWN0aW9uLnJvdywgX2N1cnNvckVuZF1dXG4gICAgICAgICAgICBFZGl0b3IucmVwbGFjZVNlbGVjdGVkVGV4dCBudWxsLCA9PiBjb2xvclxuXG4gICAgICAgICAgICAjIFNlbGVjdCB0aGUgbmV3bHkgaW5zZXJ0ZWQgY29sb3IgYW5kIG1vdmUgdGhlIGN1cnNvciB0byBpdFxuICAgICAgICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICAgICAgICAgIEVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBbXG4gICAgICAgICAgICAgICAgICAgIEBzZWxlY3Rpb24ucm93LCBfY3Vyc29yU3RhcnRdXG4gICAgICAgICAgICAgICAgRWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgICAgICAgICAgICAjIFVwZGF0ZSBzZWxlY3Rpb24gbGVuZ3RoXG4gICAgICAgICAgICAgICAgQHNlbGVjdGlvbi5tYXRjaD8uZW5kID0gX2N1cnNvclN0YXJ0ICsgY29sb3IubGVuZ3RoXG5cbiAgICAgICAgICAgICAgICBFZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UgW1xuICAgICAgICAgICAgICAgICAgICBbQHNlbGVjdGlvbi5yb3csIF9jdXJzb3JTdGFydF1cbiAgICAgICAgICAgICAgICAgICAgW0BzZWxlY3Rpb24ucm93LCBfY3Vyc29yU3RhcnQgKyBjb2xvci5sZW5ndGhdXVxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0ICggPT4gQGNhblJlcGxhY2UgPSB5ZXMpLCAxMDBcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgQ2xvc2UgdGhlIENvbG9yIFBpY2tlclxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBjbG9zZTogLT5cbiAgICAgICAgICAgIEBlbGVtZW50LmNsb3NlKClcbiAgICAgICAgICAgIEBlbWl0Q2xvc2UoKVxuIl19
