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
        var EditorElement, EditorView, PaneView, _colorMatches, _colorPickerPosition, _convertedColor, _cursorBufferRow, _cursorColumn, _cursorPosition, _cursorScreenRow, _editorOffsetLeft, _editorOffsetTop, _editorScrollTop, _lineContent, _lineHeight, _lineOffsetLeft, _match, _matches, _paneOffsetLeft, _paneOffsetTop, _position, _preferredFormat, _randomColor, _rect, _redColor, _right, _selection, _totalOffsetLeft, _totalOffsetTop, _variableMatches, _visibleRowRange;
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
        _editorOffsetLeft = EditorView.querySelector('.scroll-view').offsetLeft;
        _editorScrollTop = EditorView.getScrollTop();
        _lineHeight = Editor.getLineHeightInPixels();
        _lineOffsetLeft = EditorView.querySelector('.line').offsetLeft;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvY29sb3ItcGlja2VyL2xpYi9Db2xvclBpY2tlci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJSTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUE7V0FDYjtNQUFBLE1BQUEsRUFBUSxJQUFSO01BRUEsVUFBQSxFQUFZLENBQUMsT0FBQSxDQUFRLHNCQUFSLENBQUQsQ0FBQSxDQUFBLENBRlo7TUFHQSxhQUFBLEVBQWUsQ0FBQyxPQUFBLENBQVEseUJBQVIsQ0FBRCxDQUFBLENBQUEsQ0FIZjtNQUlBLE9BQUEsRUFBUyxDQUFDLE9BQUEsQ0FBUSxtQkFBUixDQUFELENBQUEsQ0FBQSxDQUpUO01BTUEsVUFBQSxFQUFZLEVBTlo7TUFPQSxZQUFBLEVBQWMsU0FBQyxhQUFEO2VBQW1CLElBQUMsQ0FBQSxVQUFXLENBQUEsYUFBQTtNQUEvQixDQVBkO01BU0EsV0FBQSxFQUFhLElBVGI7TUFVQSxPQUFBLEVBQVMsSUFWVDtNQVdBLE9BQUEsRUFBUyxJQVhUO01BWUEsU0FBQSxFQUFXLElBWlg7TUFjQSxTQUFBLEVBQVcsRUFkWDtNQW1CQSxRQUFBLEVBQVUsU0FBQTtBQUNOLFlBQUE7UUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDO1FBQ2xCLGNBQUEsR0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFVBQW5CO1FBSWpCLElBQUMsQ0FBQSxPQUFELEdBQ0k7VUFBQSxFQUFBLEVBQU8sQ0FBQSxTQUFBO0FBQ0gsZ0JBQUE7WUFBQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7WUFDTixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsYUFBbEI7QUFFQSxtQkFBTztVQUpKLENBQUEsQ0FBSCxDQUFBLENBQUo7VUFNQSxNQUFBLEVBQVEsU0FBQTttQkFBRyxJQUFDLENBQUEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFmLENBQTJCLElBQUMsQ0FBQSxFQUE1QjtVQUFILENBTlI7VUFRQSxRQUFBLEVBQVUsU0FBQyxTQUFEO1lBQWUsSUFBQyxDQUFBLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBZCxDQUFrQixTQUFsQjtBQUE2QixtQkFBTztVQUFuRCxDQVJWO1VBU0EsV0FBQSxFQUFhLFNBQUMsU0FBRDtZQUFlLElBQUMsQ0FBQSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQWQsQ0FBcUIsU0FBckI7QUFBZ0MsbUJBQU87VUFBdEQsQ0FUYjtVQVVBLFFBQUEsRUFBVSxTQUFDLFNBQUQ7bUJBQWUsSUFBQyxDQUFBLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBZCxDQUF1QixTQUF2QjtVQUFmLENBVlY7VUFZQSxLQUFBLEVBQU8sU0FBQTttQkFBRyxJQUFDLENBQUEsRUFBRSxDQUFDO1VBQVAsQ0FaUDtVQWFBLE1BQUEsRUFBUSxTQUFBO21CQUFHLElBQUMsQ0FBQSxFQUFFLENBQUM7VUFBUCxDQWJSO1VBZUEsU0FBQSxFQUFXLFNBQUMsTUFBRDttQkFBWSxJQUFDLENBQUEsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFWLEdBQXVCLE1BQUYsR0FBVTtVQUEzQyxDQWZYO1VBaUJBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDTixnQkFBQTtZQUFBLElBQUcsS0FBQSxJQUFVLENBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxVQUFoQixDQUFiO2NBQ0ksSUFBRyxLQUFBLEtBQVMsSUFBQyxDQUFBLEVBQWI7QUFDSSx1QkFBTyxLQURYO2VBQUEsTUFBQTtBQUVLLHVCQUFPLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUZaO2VBREo7O0FBSUEsbUJBQU87VUFMRCxDQWpCVjtVQXlCQSxNQUFBLEVBQVEsU0FBQTttQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVY7VUFBSCxDQXpCUjtVQTBCQSxJQUFBLEVBQU0sU0FBQTttQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVY7VUFBSCxDQTFCTjtVQTJCQSxLQUFBLEVBQU8sU0FBQTttQkFBRyxJQUFDLENBQUEsV0FBRCxDQUFhLFVBQWI7VUFBSCxDQTNCUDtVQThCQSxTQUFBLEVBQVcsU0FBQTttQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLGFBQVY7VUFBSCxDQTlCWDtVQStCQSxJQUFBLEVBQU0sU0FBQTttQkFBRyxJQUFDLENBQUEsUUFBRCxDQUFVLGFBQVY7VUFBSCxDQS9CTjtVQWdDQSxNQUFBLEVBQVEsU0FBQTttQkFBRyxJQUFDLENBQUEsV0FBRCxDQUFhLGFBQWI7VUFBSCxDQWhDUjtVQXFDQSxXQUFBLEVBQWEsU0FBQyxDQUFELEVBQUksQ0FBSjtZQUNULElBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQVYsR0FBcUIsQ0FBRixHQUFLO1lBQ3hCLElBQUMsQ0FBQSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQVYsR0FBb0IsQ0FBRixHQUFLO0FBQ3ZCLG1CQUFPO1VBSEUsQ0FyQ2I7VUEyQ0EsR0FBQSxFQUFLLFNBQUMsT0FBRDtZQUNELElBQUMsQ0FBQSxFQUFFLENBQUMsV0FBSixDQUFnQixPQUFoQjtBQUNBLG1CQUFPO1VBRk4sQ0EzQ0w7O1FBOENKLElBQUMsQ0FBQSxjQUFELENBQUE7UUFLQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0I7VUFBQyxXQUFELEVBQWMsV0FBQSxHQUFjLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDtBQUN4QyxrQkFBQTtjQUFBLElBQUEsQ0FBYyxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxDQUFkO0FBQUEsdUJBQUE7O2NBRUEsY0FBQSxHQUFpQixLQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsQ0FBa0IsQ0FBQyxDQUFDLE1BQXBCO2NBQ2pCLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFrQixjQUFsQjtjQUNBLElBQUEsQ0FBdUIsY0FBdkI7QUFBQSx1QkFBTyxLQUFDLENBQUEsS0FBRCxDQUFBLEVBQVA7O1lBTHdDO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtTQUFoQjtRQU1BLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixXQUF4QixFQUFxQyxXQUFyQyxFQUFrRCxJQUFsRDtRQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQjtVQUFDLFdBQUQsRUFBYyxXQUFBLEdBQWMsQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQyxDQUFEO0FBQ3hDLGtCQUFBO2NBQUEsSUFBQSxDQUFjLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBLENBQWQ7QUFBQSx1QkFBQTs7Y0FFQSxjQUFBLEdBQWlCLEtBQUMsQ0FBQSxPQUFPLENBQUMsUUFBVCxDQUFrQixDQUFDLENBQUMsTUFBcEI7cUJBQ2pCLEtBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFrQixjQUFsQjtZQUp3QztVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7U0FBaEI7UUFLQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsV0FBeEIsRUFBcUMsV0FBckMsRUFBa0QsSUFBbEQ7UUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0I7VUFBQyxTQUFELEVBQVksU0FBQSxHQUFZLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDtBQUNwQyxrQkFBQTtjQUFBLElBQUEsQ0FBYyxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxDQUFkO0FBQUEsdUJBQUE7O2NBRUEsY0FBQSxHQUFpQixLQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsQ0FBa0IsQ0FBQyxDQUFDLE1BQXBCO3FCQUNqQixLQUFDLENBQUEsV0FBRCxDQUFhLENBQWIsRUFBZ0IsY0FBaEI7WUFKb0M7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCO1NBQWhCO1FBS0EsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLFNBQW5DLEVBQThDLElBQTlDO1FBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCO1VBQUMsWUFBRCxFQUFlLFlBQUEsR0FBZSxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7QUFDMUMsa0JBQUE7Y0FBQSxJQUFBLENBQWMsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsQ0FBZDtBQUFBLHVCQUFBOztjQUVBLGNBQUEsR0FBaUIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULENBQWtCLENBQUMsQ0FBQyxNQUFwQjtxQkFDakIsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsQ0FBaEIsRUFBbUIsY0FBbkI7WUFKMEM7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCO1NBQWhCO1FBS0EsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFlBQXhCLEVBQXNDLFlBQXRDO1FBRUEsY0FBYyxDQUFDLGdCQUFmLENBQWdDLFNBQWhDLEVBQTJDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDtBQUN2QyxnQkFBQTtZQUFBLElBQUEsQ0FBYyxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxDQUFkO0FBQUEscUJBQUE7O1lBRUEsY0FBQSxHQUFpQixLQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsQ0FBa0IsQ0FBQyxDQUFDLE1BQXBCO1lBQ2pCLEtBQUMsQ0FBQSxXQUFELENBQWEsQ0FBYixFQUFnQixjQUFoQjtBQUNBLG1CQUFPLEtBQUMsQ0FBQSxLQUFELENBQUE7VUFMZ0M7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDO1FBUUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE1BQUQ7QUFDOUIsZ0JBQUE7WUFBQSxXQUFBLEdBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CO1lBQ2QsZ0JBQUEsR0FBbUIsV0FBVyxDQUFDLG9CQUFaLENBQWlDLFNBQUE7cUJBQUcsS0FBQyxDQUFBLEtBQUQsQ0FBQTtZQUFILENBQWpDO1lBQ25CLGlCQUFBLEdBQW9CLFdBQVcsQ0FBQyxxQkFBWixDQUFrQyxTQUFBO3FCQUFHLEtBQUMsQ0FBQSxLQUFELENBQUE7WUFBSCxDQUFsQztZQUVwQixNQUFNLENBQUMsWUFBUCxDQUFvQixTQUFBO2NBQ2hCLGdCQUFnQixDQUFDLE9BQWpCLENBQUE7cUJBQ0EsaUJBQWlCLENBQUMsT0FBbEIsQ0FBQTtZQUZnQixDQUFwQjtZQUdBLEtBQUMsQ0FBQSxlQUFELENBQWlCLFNBQUE7Y0FDYixnQkFBZ0IsQ0FBQyxPQUFqQixDQUFBO3FCQUNBLGlCQUFpQixDQUFDLE9BQWxCLENBQUE7WUFGYSxDQUFqQjtVQVI4QjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEM7UUFjQSxJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0I7VUFBQyxRQUFELEVBQVcsUUFBQSxHQUFXLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7cUJBQ2xDLEtBQUMsQ0FBQSxLQUFELENBQUE7WUFEa0M7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRCO1NBQWhCO1FBRUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFFBQXhCLEVBQWtDLFFBQWxDO1FBR0EsVUFBVSxDQUFDLGFBQVgsQ0FBQSxDQUEwQixDQUFDLHFCQUEzQixDQUFpRCxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxLQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakQ7UUFJQSxJQUFDLENBQUEsS0FBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztRQUdYLENBQUMsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBRCxDQUFtQyxDQUFDLGFBQXBDLENBQWtELFdBQWxELENBQVgsQ0FDSSxDQUFDLFdBREwsQ0FDaUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUQxQjtBQUVBLGVBQU87TUE1SEQsQ0FuQlY7TUFvSkEsT0FBQSxFQUFTLFNBQUE7QUFDTCxZQUFBO1FBQUEsSUFBQyxDQUFBLGlCQUFELENBQUE7QUFFQTtBQUFBLGFBQUEscUNBQUE7eUJBQUssa0JBQVE7VUFDVCxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsTUFBM0IsRUFBbUMsU0FBbkM7QUFESjtRQUdBLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBO2VBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztNQVBOLENBcEpUO01BZ0tBLGNBQUEsRUFBZ0IsU0FBQTtBQUdaLFlBQUE7QUFBQTtBQUFBLGFBQUEscUNBQUE7O1VBQ0ksa0JBQUEsR0FBcUIsQ0FBQyxPQUFBLENBQVEsZUFBQSxHQUFpQixVQUF6QixDQUFELENBQUEsQ0FBeUMsSUFBekM7VUFDckIsSUFBQyxDQUFBLFVBQVcsQ0FBQSxVQUFBLENBQVosR0FBMEI7O1lBQzFCLGtCQUFrQixDQUFDOztBQUh2QjtNQUhZLENBaEtoQjtNQTZLQSxhQUFBLEVBQWUsU0FBQyxDQUFELEVBQUksVUFBSjtlQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFdBQWQsRUFBMkIsQ0FBM0IsRUFBOEIsVUFBOUI7TUFEVyxDQTdLZjtNQStLQSxXQUFBLEVBQWEsU0FBQyxRQUFEO2VBQ1QsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksV0FBWixFQUF5QixRQUF6QjtNQURTLENBL0tiO01Ba0xBLGFBQUEsRUFBZSxTQUFDLENBQUQsRUFBSSxVQUFKO2VBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsV0FBZCxFQUEyQixDQUEzQixFQUE4QixVQUE5QjtNQURXLENBbExmO01Bb0xBLFdBQUEsRUFBYSxTQUFDLFFBQUQ7ZUFDVCxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxXQUFaLEVBQXlCLFFBQXpCO01BRFMsQ0FwTGI7TUF1TEEsV0FBQSxFQUFhLFNBQUMsQ0FBRCxFQUFJLFVBQUo7ZUFDVCxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxTQUFkLEVBQXlCLENBQXpCLEVBQTRCLFVBQTVCO01BRFMsQ0F2TGI7TUF5TEEsU0FBQSxFQUFXLFNBQUMsUUFBRDtlQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFNBQVosRUFBdUIsUUFBdkI7TUFETyxDQXpMWDtNQTRMQSxjQUFBLEVBQWdCLFNBQUMsQ0FBRCxFQUFJLFVBQUo7ZUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkLEVBQTRCLENBQTVCLEVBQStCLFVBQS9CO01BRFksQ0E1TGhCO01BOExBLFlBQUEsRUFBYyxTQUFDLFFBQUQ7ZUFDVixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLFFBQTFCO01BRFUsQ0E5TGQ7TUFrTUEsV0FBQSxFQUFhLFNBQUMsQ0FBRCxFQUFJLFVBQUo7ZUFDVCxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxTQUFkLEVBQXlCLENBQXpCLEVBQTRCLFVBQTVCO01BRFMsQ0FsTWI7TUFvTUEsU0FBQSxFQUFXLFNBQUMsUUFBRDtlQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFNBQVosRUFBdUIsUUFBdkI7TUFETyxDQXBNWDtNQXdNQSxrQkFBQSxFQUFvQixTQUFDLFFBQUQsRUFBVyxtQkFBWDtlQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxnQkFBZCxFQUFnQyxRQUFoQyxFQUEwQyxtQkFBMUM7TUFEZ0IsQ0F4TXBCO01BME1BLGdCQUFBLEVBQWtCLFNBQUMsUUFBRDtlQUNkLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGdCQUFaLEVBQThCLFFBQTlCO01BRGMsQ0ExTWxCO01BOE1BLFFBQUEsRUFBVSxTQUFBO2VBQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsTUFBZDtNQURNLENBOU1WO01BZ05BLE1BQUEsRUFBUSxTQUFDLFFBQUQ7ZUFDSixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxNQUFaLEVBQW9CLFFBQXBCO01BREksQ0FoTlI7TUFvTkEsY0FBQSxFQUFnQixTQUFBO2VBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZDtNQURZLENBcE5oQjtNQXNOQSxZQUFBLEVBQWMsU0FBQyxRQUFEO2VBQ1YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixRQUExQjtNQURVLENBdE5kO01BME5BLFNBQUEsRUFBVyxTQUFBO2VBQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsT0FBZDtNQURPLENBMU5YO01BNE5BLE9BQUEsRUFBUyxTQUFDLFFBQUQ7ZUFDTCxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxPQUFaLEVBQXFCLFFBQXJCO01BREssQ0E1TlQ7TUFnT0EsaUJBQUEsRUFBbUIsU0FBQTtlQUNmLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGVBQWQ7TUFEZSxDQWhPbkI7TUFrT0EsZUFBQSxFQUFpQixTQUFDLFFBQUQ7ZUFDYixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxlQUFaLEVBQTZCLFFBQTdCO01BRGEsQ0FsT2pCO01Bc09BLGNBQUEsRUFBZ0IsU0FBQyxVQUFELEVBQWEsUUFBYjs7VUFBYSxXQUFTOztlQUNsQyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkLEVBQTRCLFVBQTVCLEVBQXdDLFFBQXhDO01BRFksQ0F0T2hCO01Bd09BLFlBQUEsRUFBYyxTQUFDLFFBQUQ7ZUFDVixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLFFBQTFCO01BRFUsQ0F4T2Q7TUE0T0EsaUJBQUEsRUFBbUIsU0FBQyxLQUFEO2VBQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsZUFBZCxFQUErQixLQUEvQjtNQURlLENBNU9uQjtNQThPQSxlQUFBLEVBQWlCLFNBQUMsUUFBRDtlQUNiLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLGVBQVosRUFBNkIsUUFBN0I7TUFEYSxDQTlPakI7TUFrUEEsc0JBQUEsRUFBd0IsU0FBQyxVQUFELEVBQWEsT0FBYjtlQUNwQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxvQkFBZCxFQUFvQyxVQUFwQyxFQUFnRCxPQUFoRDtNQURvQixDQWxQeEI7TUFvUEEsb0JBQUEsRUFBc0IsU0FBQyxRQUFEO2VBQ2xCLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG9CQUFaLEVBQWtDLFFBQWxDO01BRGtCLENBcFB0QjtNQTBQQSxJQUFBLEVBQU0sU0FBQyxNQUFELEVBQWMsTUFBZDtBQUNGLFlBQUE7O1VBREcsU0FBTzs7O1VBQU0sU0FBTzs7UUFDdkIsSUFBQSxDQUFjLElBQUMsQ0FBQSxPQUFmO0FBQUEsaUJBQUE7O1FBQ0EsSUFBQyxDQUFBLGNBQUQsQ0FBQTtRQUVBLElBQUEsQ0FBcUQsTUFBckQ7VUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLEVBQVQ7O1FBQ0EsVUFBQSxHQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjtRQUNiLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLFVBQVAsQ0FBQTtRQUVoQixJQUFBLENBQWMsVUFBZDtBQUFBLGlCQUFBOztRQUdBLElBQUMsQ0FBQSxTQUFELEdBQWE7UUFJYixJQUFBLENBQXVDLE1BQXZDO1VBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxhQUFQLENBQUEsRUFBVDs7UUFHQSxnQkFBQSxHQUFtQixVQUFVLENBQUMsa0JBQVgsQ0FBQTtRQUNuQixnQkFBQSxHQUFtQixNQUFNLENBQUMsWUFBUCxDQUFBO1FBQ25CLGdCQUFBLEdBQW1CLE1BQU0sQ0FBQyxZQUFQLENBQUE7UUFFbkIsSUFBVSxDQUFDLGdCQUFBLEdBQW1CLGdCQUFpQixDQUFBLENBQUEsQ0FBckMsQ0FBQSxJQUE0QyxDQUFDLGdCQUFBLEdBQW1CLGdCQUFpQixDQUFBLENBQUEsQ0FBckMsQ0FBdEQ7QUFBQSxpQkFBQTs7UUFHQSxZQUFBLEdBQWUsTUFBTSxDQUFDLG9CQUFQLENBQUE7UUFFZixhQUFBLEdBQWdCLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixZQUFqQjtRQUNoQixnQkFBQSxHQUFtQixJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBb0IsWUFBcEIsRUFBa0MsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFsQztRQUNuQixRQUFBLEdBQVcsYUFBYSxDQUFDLE1BQWQsQ0FBcUIsZ0JBQXJCO1FBR1gsZUFBQSxHQUFrQixhQUFhLENBQUMsOEJBQWQsQ0FBNkMsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBN0M7UUFDbEIsYUFBQSxHQUFnQixNQUFNLENBQUMsZUFBUCxDQUFBO1FBRWhCLE1BQUEsR0FBWSxDQUFBLFNBQUE7QUFBRyxjQUFBO0FBQUEsZUFBQSwwQ0FBQTs7WUFDWCxJQUFpQixNQUFNLENBQUMsS0FBUCxJQUFnQixhQUFoQixJQUFrQyxNQUFNLENBQUMsR0FBUCxJQUFjLGFBQWpFO0FBQUEscUJBQU8sT0FBUDs7QUFEVztRQUFILENBQUEsQ0FBSCxDQUFBO1FBSVQsSUFBRyxNQUFIO1VBQ0ksTUFBTSxDQUFDLGVBQVAsQ0FBQTtVQUVBLFVBQUEsR0FBYSxNQUFNLENBQUMsMEJBQVAsQ0FBa0MsQ0FDM0MsQ0FBQyxnQkFBRCxFQUFtQixNQUFNLENBQUMsS0FBMUIsQ0FEMkMsRUFFM0MsQ0FBQyxnQkFBRCxFQUFtQixNQUFNLENBQUMsR0FBMUIsQ0FGMkMsQ0FBbEM7VUFHYixJQUFDLENBQUEsU0FBRCxHQUFhO1lBQUEsS0FBQSxFQUFPLE1BQVA7WUFBZSxHQUFBLEVBQUssZ0JBQXBCO1lBTmpCO1NBQUEsTUFBQTtVQVNJLElBQUMsQ0FBQSxTQUFELEdBQWE7WUFBQSxNQUFBLEVBQVEsYUFBUjtZQUF1QixHQUFBLEVBQUssZ0JBQTVCO1lBVGpCOztRQWFBLElBQUcsTUFBSDtVQUVJLElBQUcseUJBQUg7WUFDSSxNQUFNLENBQUMsYUFBUCxDQUFBLENBQ0ksQ0FBQyxJQURMLENBQ1UsQ0FBQSxTQUFBLEtBQUE7cUJBQUEsU0FBQyxVQUFEO0FBQ0Ysb0JBQUE7Z0JBQUEsV0FBQSxHQUFjLENBQUMsS0FBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLFVBQVUsQ0FBQyxLQUE1QixDQUFELENBQW9DLENBQUEsQ0FBQSxDQUFFLENBQUMsYUFBdkMsQ0FBQTt1QkFDZCxLQUFDLENBQUEsc0JBQUQsQ0FBd0IsV0FBeEIsRUFBcUMsVUFBVSxDQUFDLE9BQWhEO2NBRkU7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFYsQ0FJSSxFQUFDLEtBQUQsRUFKSixDQUlXLENBQUEsU0FBQSxLQUFBO3FCQUFBLFNBQUMsS0FBRDt1QkFDSCxLQUFDLENBQUEsc0JBQUQsQ0FBd0IsS0FBeEI7Y0FERztZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKWDtZQU1BLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQixFQVBKO1dBQUEsTUFBQTtZQVNLLElBQUMsQ0FBQSxjQUFELENBQWdCLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBaEIsRUFUTDtXQUZKO1NBQUEsTUFhSyxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQkFBaEIsQ0FBSDtVQUNELFlBQUEsR0FBZSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBcUIsQ0FDaEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBQSxHQUFnQixHQUFqQixDQUFBLEdBQXdCLEVBQXpCLENBQUEsSUFBZ0MsQ0FEQSxFQUVoQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFBLEdBQWdCLEdBQWpCLENBQUEsR0FBd0IsRUFBekIsQ0FBQSxJQUFnQyxDQUZBLEVBR2hDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUEsR0FBZ0IsR0FBakIsQ0FBQSxHQUF3QixFQUF6QixDQUFBLElBQWdDLENBSEEsQ0FBckI7VUFNZixnQkFBQSxHQUFtQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsOEJBQWhCO1VBQ25CLGVBQUEsR0FBa0IsWUFBYSxDQUFBLElBQUEsR0FBTSxnQkFBTixDQUFiLENBQUE7VUFDbEIsWUFBQSxHQUFlLElBQUMsQ0FBQSxVQUFXLENBQUEsZ0JBQUEsQ0FBWixDQUE4QixlQUE5QjtVQUVmLElBQUMsQ0FBQSxjQUFELENBQWdCLFlBQWhCLEVBQThCLEtBQTlCLEVBWEM7U0FBQSxNQWFBLElBQUcsSUFBQyxDQUFBLFdBQUo7VUFDRCxTQUFBLEdBQVksSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLE1BQWhCO1VBR1osZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDhCQUFoQjtVQUVuQixJQUFHLFNBQVMsQ0FBQyxNQUFWLEtBQXNCLGdCQUF6QjtZQUNJLGVBQUEsR0FBa0IsU0FBVSxDQUFBLElBQUEsR0FBTSxnQkFBTixDQUFWLENBQUE7WUFDbEIsU0FBQSxHQUFZLElBQUMsQ0FBQSxVQUFXLENBQUEsZ0JBQUEsQ0FBWixDQUE4QixlQUE5QixFQUZoQjs7VUFHQSxJQUFDLENBQUEsV0FBRCxHQUFlO1VBRWYsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsU0FBaEIsRUFBMkIsS0FBM0IsRUFYQzs7UUFnQkwsUUFBQSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUFuQjtRQUNYLGNBQUEsR0FBaUIsUUFBUSxDQUFDO1FBQzFCLGVBQUEsR0FBa0IsUUFBUSxDQUFDO1FBRTNCLGdCQUFBLEdBQW1CLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDekMsaUJBQUEsR0FBb0IsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsY0FBekIsQ0FBd0MsQ0FBQztRQUM3RCxnQkFBQSxHQUFtQixVQUFVLENBQUMsWUFBWCxDQUFBO1FBRW5CLFdBQUEsR0FBYyxNQUFNLENBQUMscUJBQVAsQ0FBQTtRQUNkLGVBQUEsR0FBa0IsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsT0FBekIsQ0FBaUMsQ0FBQztRQUlwRCxJQUFHLE1BQUg7VUFDSSxLQUFBLEdBQVEsYUFBYSxDQUFDLHVCQUFkLENBQXNDLFVBQVUsQ0FBQyxjQUFYLENBQUEsQ0FBdEM7VUFDUixNQUFBLEdBQVMsS0FBSyxDQUFDLElBQU4sR0FBYSxLQUFLLENBQUM7VUFDNUIsZUFBZSxDQUFDLElBQWhCLEdBQXVCLE1BQUEsR0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFOLEdBQWMsQ0FBZixFQUhwQzs7UUFPQSxlQUFBLEdBQWtCLGNBQUEsR0FBaUIsV0FBakIsR0FBK0IsZ0JBQS9CLEdBQWtEO1FBQ3BFLGdCQUFBLEdBQW1CLGVBQUEsR0FBa0IsaUJBQWxCLEdBQXNDO1FBRXpELFNBQUEsR0FDSTtVQUFBLENBQUEsRUFBRyxlQUFlLENBQUMsSUFBaEIsR0FBdUIsZ0JBQTFCO1VBQ0EsQ0FBQSxFQUFHLGVBQWUsQ0FBQyxHQUFoQixHQUFzQixlQUR6Qjs7UUFNSixvQkFBQSxHQUNJO1VBQUEsQ0FBQSxFQUFNLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUE7QUFDRixrQkFBQTtjQUFBLGlCQUFBLEdBQW9CLEtBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxDQUFBO2NBQ3BCLHFCQUFBLEdBQXdCLENBQUMsaUJBQUEsR0FBb0IsQ0FBckIsQ0FBQSxJQUEyQjtjQUduRCxFQUFBLEdBQUssSUFBSSxDQUFDLEdBQUwsQ0FBUyxFQUFULEVBQWEsU0FBUyxDQUFDLENBQVYsR0FBYyxxQkFBM0I7Y0FFTCxFQUFBLEdBQUssSUFBSSxDQUFDLEdBQUwsQ0FBVSxLQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsR0FBc0IsaUJBQXRCLEdBQTBDLEVBQXBELEVBQXlELEVBQXpEO0FBRUwscUJBQU87WUFUTDtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBSCxDQUFBLENBQUg7VUFVQSxDQUFBLEVBQU0sQ0FBQSxTQUFBLEtBQUE7bUJBQUEsU0FBQTtjQUNGLEtBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBO2NBS0EsSUFBRyxLQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQSxDQUFBLEdBQW9CLFNBQVMsQ0FBQyxDQUE5QixHQUFrQyxLQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsR0FBdUIsRUFBNUQ7Z0JBQ0ksS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUE7QUFDQSx1QkFBTyxTQUFTLENBQUMsQ0FBVixHQUFjLFdBQWQsR0FBNEIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFGdkM7ZUFBQSxNQUFBO0FBSUssdUJBQU8sU0FBUyxDQUFDLEVBSnRCOztZQU5FO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFILENBQUEsQ0FWSDs7UUF1QkosSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLG9CQUFvQixDQUFDLENBQTFDLEVBQTZDLG9CQUFvQixDQUFDLENBQWxFO1FBQ0EsSUFBQyxDQUFBLGtCQUFELENBQW9CLFNBQXBCLEVBQStCLG9CQUEvQjtRQUdBLHFCQUFBLENBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDbEIsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUE7bUJBQ0EsS0FBQyxDQUFBLFFBQUQsQ0FBQTtVQUZrQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7QUFHQSxlQUFPO01BM0pMLENBMVBOO01BMFpBLFVBQUEsRUFBWSxJQTFaWjtNQTJaQSxPQUFBLEVBQVMsU0FBQyxLQUFEO0FBQ0wsWUFBQTtRQUFBLElBQUEsQ0FBYyxJQUFDLENBQUEsVUFBZjtBQUFBLGlCQUFBOztRQUNBLElBQUMsQ0FBQSxVQUFELEdBQWM7UUFFZCxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO1FBQ1QsTUFBTSxDQUFDLGVBQVAsQ0FBQTtRQUVBLElBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFkO1VBQ0ksWUFBQSxHQUFlLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBSyxDQUFDO1VBQ2hDLFVBQUEsR0FBYSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUZsQztTQUFBLE1BQUE7VUFHSyxZQUFBLEdBQWUsVUFBQSxHQUFhLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FINUM7O1FBTUEsTUFBTSxDQUFDLDBCQUFQLENBQWtDLENBQzlCLENBQUMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFaLEVBQWlCLFlBQWpCLENBRDhCLEVBRTlCLENBQUMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFaLEVBQWlCLFVBQWpCLENBRjhCLENBQWxDO1FBR0EsTUFBTSxDQUFDLG1CQUFQLENBQTJCLElBQTNCLEVBQWlDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUc7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakM7UUFHQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNQLGdCQUFBO1lBQUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQzNCLEtBQUMsQ0FBQSxTQUFTLENBQUMsR0FEZ0IsRUFDWCxZQURXLENBQS9CO1lBRUEsTUFBTSxDQUFDLGVBQVAsQ0FBQTs7aUJBR2dCLENBQUUsR0FBbEIsR0FBd0IsWUFBQSxHQUFlLEtBQUssQ0FBQzs7WUFFN0MsTUFBTSxDQUFDLDBCQUFQLENBQWtDLENBQzlCLENBQUMsS0FBQyxDQUFBLFNBQVMsQ0FBQyxHQUFaLEVBQWlCLFlBQWpCLENBRDhCLEVBRTlCLENBQUMsS0FBQyxDQUFBLFNBQVMsQ0FBQyxHQUFaLEVBQWlCLFlBQUEsR0FBZSxLQUFLLENBQUMsTUFBdEMsQ0FGOEIsQ0FBbEM7QUFHQSxtQkFBTyxVQUFBLENBQVcsQ0FBRSxTQUFBO3FCQUFHLEtBQUMsQ0FBQSxVQUFELEdBQWM7WUFBakIsQ0FBRixDQUFYLEVBQW9DLEdBQXBDO1VBWEE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVg7TUFuQkssQ0EzWlQ7TUErYkEsS0FBQSxFQUFPLFNBQUE7UUFDSCxJQUFDLENBQUEsT0FBTyxDQUFDLEtBQVQsQ0FBQTtlQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7TUFGRyxDQS9iUDs7RUFEYTtBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgQ29sb3IgUGlja2VyOiB2aWV3XG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gLT5cbiAgICAgICAgUGFyZW50OiBudWxsXG5cbiAgICAgICAgU21hcnRDb2xvcjogKHJlcXVpcmUgJy4vbW9kdWxlcy9TbWFydENvbG9yJykoKVxuICAgICAgICBTbWFydFZhcmlhYmxlOiAocmVxdWlyZSAnLi9tb2R1bGVzL1NtYXJ0VmFyaWFibGUnKSgpXG4gICAgICAgIEVtaXR0ZXI6IChyZXF1aXJlICcuL21vZHVsZXMvRW1pdHRlcicpKClcblxuICAgICAgICBleHRlbnNpb25zOiB7fVxuICAgICAgICBnZXRFeHRlbnNpb246IChleHRlbnNpb25OYW1lKSAtPiBAZXh0ZW5zaW9uc1tleHRlbnNpb25OYW1lXVxuXG4gICAgICAgIGlzRmlyc3RPcGVuOiB5ZXNcbiAgICAgICAgY2FuT3BlbjogeWVzXG4gICAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICAgICAgc2VsZWN0aW9uOiBudWxsXG5cbiAgICAgICAgbGlzdGVuZXJzOiBbXVxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgQ3JlYXRlIGFuZCBhY3RpdmF0ZSBDb2xvciBQaWNrZXIgdmlld1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBhY3RpdmF0ZTogLT5cbiAgICAgICAgICAgIF93b3Jrc3BhY2UgPSBhdG9tLndvcmtzcGFjZVxuICAgICAgICAgICAgX3dvcmtzcGFjZVZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcgX3dvcmtzcGFjZVxuXG4gICAgICAgICMgIENyZWF0ZSBlbGVtZW50XG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBAZWxlbWVudCA9XG4gICAgICAgICAgICAgICAgZWw6IGRvIC0+XG4gICAgICAgICAgICAgICAgICAgIF9lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgICAgICAgICAgICAgX2VsLmNsYXNzTGlzdC5hZGQgJ0NvbG9yUGlja2VyJ1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfZWxcbiAgICAgICAgICAgICAgICAjIFV0aWxpdHkgZnVuY3Rpb25zXG4gICAgICAgICAgICAgICAgcmVtb3ZlOiAtPiBAZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCBAZWxcblxuICAgICAgICAgICAgICAgIGFkZENsYXNzOiAoY2xhc3NOYW1lKSAtPiBAZWwuY2xhc3NMaXN0LmFkZCBjbGFzc05hbWU7IHJldHVybiB0aGlzXG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3M6IChjbGFzc05hbWUpIC0+IEBlbC5jbGFzc0xpc3QucmVtb3ZlIGNsYXNzTmFtZTsgcmV0dXJuIHRoaXNcbiAgICAgICAgICAgICAgICBoYXNDbGFzczogKGNsYXNzTmFtZSkgLT4gQGVsLmNsYXNzTGlzdC5jb250YWlucyBjbGFzc05hbWVcblxuICAgICAgICAgICAgICAgIHdpZHRoOiAtPiBAZWwub2Zmc2V0V2lkdGhcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IC0+IEBlbC5vZmZzZXRIZWlnaHRcblxuICAgICAgICAgICAgICAgIHNldEhlaWdodDogKGhlaWdodCkgLT4gQGVsLnN0eWxlLmhlaWdodCA9IFwiI3sgaGVpZ2h0IH1weFwiXG5cbiAgICAgICAgICAgICAgICBoYXNDaGlsZDogKGNoaWxkKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBjaGlsZCBhbmQgX3BhcmVudCA9IGNoaWxkLnBhcmVudE5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoaWxkIGlzIEBlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBAaGFzQ2hpbGQgX3BhcmVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICAgICAgICAgICMgT3BlbiAmIENsb3NlIHRoZSBDb2xvciBQaWNrZXJcbiAgICAgICAgICAgICAgICBpc09wZW46IC0+IEBoYXNDbGFzcyAnaXMtLW9wZW4nXG4gICAgICAgICAgICAgICAgb3BlbjogLT4gQGFkZENsYXNzICdpcy0tb3BlbidcbiAgICAgICAgICAgICAgICBjbG9zZTogLT4gQHJlbW92ZUNsYXNzICdpcy0tb3BlbidcblxuICAgICAgICAgICAgICAgICMgRmxpcCAmIFVuZmxpcCB0aGUgQ29sb3IgUGlja2VyXG4gICAgICAgICAgICAgICAgaXNGbGlwcGVkOiAtPiBAaGFzQ2xhc3MgJ2lzLS1mbGlwcGVkJ1xuICAgICAgICAgICAgICAgIGZsaXA6IC0+IEBhZGRDbGFzcyAnaXMtLWZsaXBwZWQnXG4gICAgICAgICAgICAgICAgdW5mbGlwOiAtPiBAcmVtb3ZlQ2xhc3MgJ2lzLS1mbGlwcGVkJ1xuXG4gICAgICAgICAgICAgICAgIyBTZXQgQ29sb3IgUGlja2VyIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgIyAtIHgge051bWJlcn1cbiAgICAgICAgICAgICAgICAjIC0geSB7TnVtYmVyfVxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uOiAoeCwgeSkgLT5cbiAgICAgICAgICAgICAgICAgICAgQGVsLnN0eWxlLmxlZnQgPSBcIiN7IHggfXB4XCJcbiAgICAgICAgICAgICAgICAgICAgQGVsLnN0eWxlLnRvcCA9IFwiI3sgeSB9cHhcIlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1xuXG4gICAgICAgICAgICAgICAgIyBBZGQgYSBjaGlsZCBvbiB0aGUgQ29sb3JQaWNrZXIgZWxlbWVudFxuICAgICAgICAgICAgICAgIGFkZDogKGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIEBlbC5hcHBlbmRDaGlsZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgICAgICBAbG9hZEV4dGVuc2lvbnMoKVxuXG4gICAgICAgICMgIENsb3NlIHRoZSBDb2xvciBQaWNrZXIgb24gYW55IGFjdGl2aXR5IHVucmVsYXRlZCB0byBpdFxuICAgICAgICAjICBidXQgYWxzbyBlbWl0IGV2ZW50cyBvbiB0aGUgQ29sb3IgUGlja2VyXG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBAbGlzdGVuZXJzLnB1c2ggWydtb3VzZWRvd24nLCBvbk1vdXNlRG93biA9IChlKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGVsZW1lbnQuaXNPcGVuKClcblxuICAgICAgICAgICAgICAgIF9pc1BpY2tlckV2ZW50ID0gQGVsZW1lbnQuaGFzQ2hpbGQgZS50YXJnZXRcbiAgICAgICAgICAgICAgICBAZW1pdE1vdXNlRG93biBlLCBfaXNQaWNrZXJFdmVudFxuICAgICAgICAgICAgICAgIHJldHVybiBAY2xvc2UoKSB1bmxlc3MgX2lzUGlja2VyRXZlbnRdXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vkb3duJywgb25Nb3VzZURvd24sIHRydWVcblxuICAgICAgICAgICAgQGxpc3RlbmVycy5wdXNoIFsnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUgPSAoZSkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBlbGVtZW50LmlzT3BlbigpXG5cbiAgICAgICAgICAgICAgICBfaXNQaWNrZXJFdmVudCA9IEBlbGVtZW50Lmhhc0NoaWxkIGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgQGVtaXRNb3VzZU1vdmUgZSwgX2lzUGlja2VyRXZlbnRdXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUsIHRydWVcblxuICAgICAgICAgICAgQGxpc3RlbmVycy5wdXNoIFsnbW91c2V1cCcsIG9uTW91c2VVcCA9IChlKSA9PlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGVsZW1lbnQuaXNPcGVuKClcblxuICAgICAgICAgICAgICAgIF9pc1BpY2tlckV2ZW50ID0gQGVsZW1lbnQuaGFzQ2hpbGQgZS50YXJnZXRcbiAgICAgICAgICAgICAgICBAZW1pdE1vdXNlVXAgZSwgX2lzUGlja2VyRXZlbnRdXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V1cCcsIG9uTW91c2VVcCwgdHJ1ZVxuXG4gICAgICAgICAgICBAbGlzdGVuZXJzLnB1c2ggWydtb3VzZXdoZWVsJywgb25Nb3VzZVdoZWVsID0gKGUpID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBAZWxlbWVudC5pc09wZW4oKVxuXG4gICAgICAgICAgICAgICAgX2lzUGlja2VyRXZlbnQgPSBAZWxlbWVudC5oYXNDaGlsZCBlLnRhcmdldFxuICAgICAgICAgICAgICAgIEBlbWl0TW91c2VXaGVlbCBlLCBfaXNQaWNrZXJFdmVudF1cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJywgb25Nb3VzZVdoZWVsXG5cbiAgICAgICAgICAgIF93b3Jrc3BhY2VWaWV3LmFkZEV2ZW50TGlzdGVuZXIgJ2tleWRvd24nLCAoZSkgPT5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBlbGVtZW50LmlzT3BlbigpXG5cbiAgICAgICAgICAgICAgICBfaXNQaWNrZXJFdmVudCA9IEBlbGVtZW50Lmhhc0NoaWxkIGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgQGVtaXRLZXlEb3duIGUsIF9pc1BpY2tlckV2ZW50XG4gICAgICAgICAgICAgICAgcmV0dXJuIEBjbG9zZSgpXG5cbiAgICAgICAgICAgICMgQ2xvc2UgaXQgb24gc2Nyb2xsIGFsc29cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICAgICAgICAgIF9lZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3IGVkaXRvclxuICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25Ub3AgPSBfZWRpdG9yVmlldy5vbkRpZENoYW5nZVNjcm9sbFRvcCA9PiBAY2xvc2UoKVxuICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25MZWZ0ID0gX2VkaXRvclZpZXcub25EaWRDaGFuZ2VTY3JvbGxMZWZ0ID0+IEBjbG9zZSgpXG5cbiAgICAgICAgICAgICAgICBlZGl0b3Iub25EaWREZXN0cm95IC0+XG4gICAgICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25Ub3AuZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgICAgIF9zdWJzY3JpcHRpb25MZWZ0LmRpc3Bvc2UoKVxuICAgICAgICAgICAgICAgIEBvbkJlZm9yZURlc3Ryb3kgLT5cbiAgICAgICAgICAgICAgICAgICAgX3N1YnNjcmlwdGlvblRvcC5kaXNwb3NlKClcbiAgICAgICAgICAgICAgICAgICAgX3N1YnNjcmlwdGlvbkxlZnQuZGlzcG9zZSgpXG4gICAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgICMgQ2xvc2UgaXQgd2hlbiB0aGUgd2luZG93IHJlc2l6ZXNcbiAgICAgICAgICAgIEBsaXN0ZW5lcnMucHVzaCBbJ3Jlc2l6ZScsIG9uUmVzaXplID0gPT5cbiAgICAgICAgICAgICAgICBAY2xvc2UoKV1cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdyZXNpemUnLCBvblJlc2l6ZVxuXG4gICAgICAgICAgICAjIENsb3NlIGl0IHdoZW4gdGhlIGFjdGl2ZSBpdGVtIGlzIGNoYW5nZWRcbiAgICAgICAgICAgIF93b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLm9uRGlkQ2hhbmdlQWN0aXZlSXRlbSA9PiBAY2xvc2UoKVxuXG4gICAgICAgICMgIFBsYWNlIHRoZSBDb2xvciBQaWNrZXIgZWxlbWVudFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgQGNsb3NlKClcbiAgICAgICAgICAgIEBjYW5PcGVuID0geWVzXG5cbiAgICAgICAgICAgICMgVE9ETzogSXMgdGhpcyByZWFsbHkgdGhlIGJlc3Qgd2F5IHRvIGRvIHRoaXM/IEhpbnQ6IFByb2JhYmx5IG5vdFxuICAgICAgICAgICAgKEBQYXJlbnQgPSAoYXRvbS52aWV3cy5nZXRWaWV3IGF0b20ud29ya3NwYWNlKS5xdWVyeVNlbGVjdG9yICcudmVydGljYWwnKVxuICAgICAgICAgICAgICAgIC5hcHBlbmRDaGlsZCBAZWxlbWVudC5lbFxuICAgICAgICAgICAgcmV0dXJuIHRoaXNcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIERlc3Ryb3kgdGhlIHZpZXcgYW5kIHVuYmluZCBldmVudHNcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgZGVzdHJveTogLT5cbiAgICAgICAgICAgIEBlbWl0QmVmb3JlRGVzdHJveSgpXG5cbiAgICAgICAgICAgIGZvciBbX2V2ZW50LCBfbGlzdGVuZXJdIGluIEBsaXN0ZW5lcnNcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciBfZXZlbnQsIF9saXN0ZW5lclxuXG4gICAgICAgICAgICBAZWxlbWVudC5yZW1vdmUoKVxuICAgICAgICAgICAgQGNhbk9wZW4gPSBub1xuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgTG9hZCBDb2xvciBQaWNrZXIgZXh0ZW5zaW9ucyAvLyBtb3JlIGxpa2UgZGVwZW5kZW5jaWVzXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIGxvYWRFeHRlbnNpb25zOiAtPlxuICAgICAgICAgICAgIyBUT0RPOiBUaGlzIGlzIHJlYWxseSBzdHVwaWQuIFNob3VsZCB0aGlzIGJlIGRvbmUgd2l0aCBgZnNgIG9yIHNvbWV0aGluZz9cbiAgICAgICAgICAgICMgVE9ETzogRXh0ZW5zaW9uIGZpbGVzIGhhdmUgcHJldHR5IG11Y2ggdGhlIHNhbWUgYmFzZS4gU2ltcGxpZnk/XG4gICAgICAgICAgICBmb3IgX2V4dGVuc2lvbiBpbiBbJ0Fycm93JywgJ0NvbG9yJywgJ0JvZHknLCAnU2F0dXJhdGlvbicsICdBbHBoYScsICdIdWUnLCAnRGVmaW5pdGlvbicsICdSZXR1cm4nLCAnRm9ybWF0J11cbiAgICAgICAgICAgICAgICBfcmVxdWlyZWRFeHRlbnNpb24gPSAocmVxdWlyZSBcIi4vZXh0ZW5zaW9ucy8jeyBfZXh0ZW5zaW9uIH1cIikodGhpcylcbiAgICAgICAgICAgICAgICBAZXh0ZW5zaW9uc1tfZXh0ZW5zaW9uXSA9IF9yZXF1aXJlZEV4dGVuc2lvblxuICAgICAgICAgICAgICAgIF9yZXF1aXJlZEV4dGVuc2lvbi5hY3RpdmF0ZT8oKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBTZXQgdXAgZXZlbnRzIGFuZCBoYW5kbGluZ1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAjIE1vdXNlIGV2ZW50c1xuICAgICAgICBlbWl0TW91c2VEb3duOiAoZSwgaXNPblBpY2tlcikgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ21vdXNlRG93bicsIGUsIGlzT25QaWNrZXJcbiAgICAgICAgb25Nb3VzZURvd246IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdtb3VzZURvd24nLCBjYWxsYmFja1xuXG4gICAgICAgIGVtaXRNb3VzZU1vdmU6IChlLCBpc09uUGlja2VyKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnbW91c2VNb3ZlJywgZSwgaXNPblBpY2tlclxuICAgICAgICBvbk1vdXNlTW92ZTogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ21vdXNlTW92ZScsIGNhbGxiYWNrXG5cbiAgICAgICAgZW1pdE1vdXNlVXA6IChlLCBpc09uUGlja2VyKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnbW91c2VVcCcsIGUsIGlzT25QaWNrZXJcbiAgICAgICAgb25Nb3VzZVVwOiAoY2FsbGJhY2spIC0+XG4gICAgICAgICAgICBARW1pdHRlci5vbiAnbW91c2VVcCcsIGNhbGxiYWNrXG5cbiAgICAgICAgZW1pdE1vdXNlV2hlZWw6IChlLCBpc09uUGlja2VyKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnbW91c2VXaGVlbCcsIGUsIGlzT25QaWNrZXJcbiAgICAgICAgb25Nb3VzZVdoZWVsOiAoY2FsbGJhY2spIC0+XG4gICAgICAgICAgICBARW1pdHRlci5vbiAnbW91c2VXaGVlbCcsIGNhbGxiYWNrXG5cbiAgICAgICAgIyBLZXkgZXZlbnRzXG4gICAgICAgIGVtaXRLZXlEb3duOiAoZSwgaXNPblBpY2tlcikgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ2tleURvd24nLCBlLCBpc09uUGlja2VyXG4gICAgICAgIG9uS2V5RG93bjogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2tleURvd24nLCBjYWxsYmFja1xuXG4gICAgICAgICMgUG9zaXRpb24gQ2hhbmdlXG4gICAgICAgIGVtaXRQb3NpdGlvbkNoYW5nZTogKHBvc2l0aW9uLCBjb2xvclBpY2tlclBvc2l0aW9uKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAncG9zaXRpb25DaGFuZ2UnLCBwb3NpdGlvbiwgY29sb3JQaWNrZXJQb3NpdGlvblxuICAgICAgICBvblBvc2l0aW9uQ2hhbmdlOiAoY2FsbGJhY2spIC0+XG4gICAgICAgICAgICBARW1pdHRlci5vbiAncG9zaXRpb25DaGFuZ2UnLCBjYWxsYmFja1xuXG4gICAgICAgICMgT3BlbmluZ1xuICAgICAgICBlbWl0T3BlbjogLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ29wZW4nXG4gICAgICAgIG9uT3BlbjogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ29wZW4nLCBjYWxsYmFja1xuXG4gICAgICAgICMgQmVmb3JlIG9wZW5pbmdcbiAgICAgICAgZW1pdEJlZm9yZU9wZW46IC0+XG4gICAgICAgICAgICBARW1pdHRlci5lbWl0ICdiZWZvcmVPcGVuJ1xuICAgICAgICBvbkJlZm9yZU9wZW46IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdiZWZvcmVPcGVuJywgY2FsbGJhY2tcblxuICAgICAgICAjIENsb3NpbmdcbiAgICAgICAgZW1pdENsb3NlOiAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnY2xvc2UnXG4gICAgICAgIG9uQ2xvc2U6IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdjbG9zZScsIGNhbGxiYWNrXG5cbiAgICAgICAgIyBCZWZvcmUgZGVzdHJveWluZ1xuICAgICAgICBlbWl0QmVmb3JlRGVzdHJveTogLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ2JlZm9yZURlc3Ryb3knXG4gICAgICAgIG9uQmVmb3JlRGVzdHJveTogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2JlZm9yZURlc3Ryb3knLCBjYWxsYmFja1xuXG4gICAgICAgICMgSW5wdXQgQ29sb3JcbiAgICAgICAgZW1pdElucHV0Q29sb3I6IChzbWFydENvbG9yLCB3YXNGb3VuZD10cnVlKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnaW5wdXRDb2xvcicsIHNtYXJ0Q29sb3IsIHdhc0ZvdW5kXG4gICAgICAgIG9uSW5wdXRDb2xvcjogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2lucHV0Q29sb3InLCBjYWxsYmFja1xuXG4gICAgICAgICMgSW5wdXQgVmFyaWFibGVcbiAgICAgICAgZW1pdElucHV0VmFyaWFibGU6IChtYXRjaCkgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ2lucHV0VmFyaWFibGUnLCBtYXRjaFxuICAgICAgICBvbklucHV0VmFyaWFibGU6IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdpbnB1dFZhcmlhYmxlJywgY2FsbGJhY2tcblxuICAgICAgICAjIElucHV0IFZhcmlhYmxlIENvbG9yXG4gICAgICAgIGVtaXRJbnB1dFZhcmlhYmxlQ29sb3I6IChzbWFydENvbG9yLCBwb2ludGVyKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnaW5wdXRWYXJpYWJsZUNvbG9yJywgc21hcnRDb2xvciwgcG9pbnRlclxuICAgICAgICBvbklucHV0VmFyaWFibGVDb2xvcjogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2lucHV0VmFyaWFibGVDb2xvcicsIGNhbGxiYWNrXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBPcGVuIHRoZSBDb2xvciBQaWNrZXJcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgb3BlbjogKEVkaXRvcj1udWxsLCBDdXJzb3I9bnVsbCkgLT5cbiAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGNhbk9wZW5cbiAgICAgICAgICAgIEBlbWl0QmVmb3JlT3BlbigpXG5cbiAgICAgICAgICAgIEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSB1bmxlc3MgRWRpdG9yXG4gICAgICAgICAgICBFZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3IEVkaXRvclxuICAgICAgICAgICAgRWRpdG9yRWxlbWVudCA9IEVkaXRvci5nZXRFbGVtZW50KClcblxuICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBFZGl0b3JWaWV3XG5cbiAgICAgICAgICAgICMgUmVzZXQgc2VsZWN0aW9uXG4gICAgICAgICAgICBAc2VsZWN0aW9uID0gbnVsbFxuXG4gICAgICAgICMgIEZpbmQgdGhlIGN1cnJlbnQgY3Vyc29yXG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBDdXJzb3IgPSBFZGl0b3IuZ2V0TGFzdEN1cnNvcigpIHVubGVzcyBDdXJzb3JcblxuICAgICAgICAgICAgIyBGYWlsIGlmIHRoZSBjdXJzb3IgaXNuJ3QgdmlzaWJsZVxuICAgICAgICAgICAgX3Zpc2libGVSb3dSYW5nZSA9IEVkaXRvclZpZXcuZ2V0VmlzaWJsZVJvd1JhbmdlKClcbiAgICAgICAgICAgIF9jdXJzb3JTY3JlZW5Sb3cgPSBDdXJzb3IuZ2V0U2NyZWVuUm93KClcbiAgICAgICAgICAgIF9jdXJzb3JCdWZmZXJSb3cgPSBDdXJzb3IuZ2V0QnVmZmVyUm93KClcblxuICAgICAgICAgICAgcmV0dXJuIGlmIChfY3Vyc29yU2NyZWVuUm93IDwgX3Zpc2libGVSb3dSYW5nZVswXSkgb3IgKF9jdXJzb3JTY3JlZW5Sb3cgPiBfdmlzaWJsZVJvd1JhbmdlWzFdKVxuXG4gICAgICAgICAgICAjIFRyeSBtYXRjaGluZyB0aGUgY29udGVudHMgb2YgdGhlIGN1cnJlbnQgbGluZSB0byBjb2xvciByZWdleGVzXG4gICAgICAgICAgICBfbGluZUNvbnRlbnQgPSBDdXJzb3IuZ2V0Q3VycmVudEJ1ZmZlckxpbmUoKVxuXG4gICAgICAgICAgICBfY29sb3JNYXRjaGVzID0gQFNtYXJ0Q29sb3IuZmluZCBfbGluZUNvbnRlbnRcbiAgICAgICAgICAgIF92YXJpYWJsZU1hdGNoZXMgPSBAU21hcnRWYXJpYWJsZS5maW5kIF9saW5lQ29udGVudCwgRWRpdG9yLmdldFBhdGgoKVxuICAgICAgICAgICAgX21hdGNoZXMgPSBfY29sb3JNYXRjaGVzLmNvbmNhdCBfdmFyaWFibGVNYXRjaGVzXG5cbiAgICAgICAgICAgICMgRmlndXJlIG91dCB3aGljaCBvZiB0aGUgbWF0Y2hlcyBpcyB0aGUgb25lIHRoZSB1c2VyIHdhbnRzXG4gICAgICAgICAgICBfY3Vyc29yUG9zaXRpb24gPSBFZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbiBDdXJzb3IuZ2V0U2NyZWVuUG9zaXRpb24oKVxuICAgICAgICAgICAgX2N1cnNvckNvbHVtbiA9IEN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKVxuXG4gICAgICAgICAgICBfbWF0Y2ggPSBkbyAtPiBmb3IgX21hdGNoIGluIF9tYXRjaGVzXG4gICAgICAgICAgICAgICAgcmV0dXJuIF9tYXRjaCBpZiBfbWF0Y2guc3RhcnQgPD0gX2N1cnNvckNvbHVtbiBhbmQgX21hdGNoLmVuZCA+PSBfY3Vyc29yQ29sdW1uXG5cbiAgICAgICAgICAgICMgSWYgd2UndmUgZ290IGEgbWF0Y2gsIHdlIHNob3VsZCBzZWxlY3QgaXRcbiAgICAgICAgICAgIGlmIF9tYXRjaFxuICAgICAgICAgICAgICAgIEVkaXRvci5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgICAgICAgICAgICAgX3NlbGVjdGlvbiA9IEVkaXRvci5hZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZSBbXG4gICAgICAgICAgICAgICAgICAgIFtfY3Vyc29yQnVmZmVyUm93LCBfbWF0Y2guc3RhcnRdXG4gICAgICAgICAgICAgICAgICAgIFtfY3Vyc29yQnVmZmVyUm93LCBfbWF0Y2guZW5kXV1cbiAgICAgICAgICAgICAgICBAc2VsZWN0aW9uID0gbWF0Y2g6IF9tYXRjaCwgcm93OiBfY3Vyc29yQnVmZmVyUm93XG4gICAgICAgICAgICAjIEJ1dCBpZiB3ZSBkb24ndCBoYXZlIGEgbWF0Y2gsIGNlbnRlciB0aGUgQ29sb3IgUGlja2VyIG9uIGxhc3QgY3Vyc29yXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHNlbGVjdGlvbiA9IGNvbHVtbjogX2N1cnNvckNvbHVtbiwgcm93OiBfY3Vyc29yQnVmZmVyUm93XG5cbiAgICAgICAgIyAgRW1pdFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgaWYgX21hdGNoXG4gICAgICAgICAgICAgICAgIyBUaGUgbWF0Y2ggaXMgYSB2YXJpYWJsZS4gTG9vayB1cCB0aGUgZGVmaW5pdGlvblxuICAgICAgICAgICAgICAgIGlmIF9tYXRjaC5pc1ZhcmlhYmxlP1xuICAgICAgICAgICAgICAgICAgICBfbWF0Y2guZ2V0RGVmaW5pdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiAoZGVmaW5pdGlvbikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfc21hcnRDb2xvciA9IChAU21hcnRDb2xvci5maW5kIGRlZmluaXRpb24udmFsdWUpWzBdLmdldFNtYXJ0Q29sb3IoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBlbWl0SW5wdXRWYXJpYWJsZUNvbG9yIF9zbWFydENvbG9yLCBkZWZpbml0aW9uLnBvaW50ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGVtaXRJbnB1dFZhcmlhYmxlQ29sb3IgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgQGVtaXRJbnB1dFZhcmlhYmxlIF9tYXRjaFxuICAgICAgICAgICAgICAgICMgVGhlIG1hdGNoIGlzIGEgY29sb3JcbiAgICAgICAgICAgICAgICBlbHNlIEBlbWl0SW5wdXRDb2xvciBfbWF0Y2guZ2V0U21hcnRDb2xvcigpXG4gICAgICAgICAgICAjIE5vIG1hdGNoLCBidXQgYHJhbmRvbUNvbG9yYCBvcHRpb24gaXMgc2V0XG4gICAgICAgICAgICBlbHNlIGlmIGF0b20uY29uZmlnLmdldCAnY29sb3ItcGlja2VyLnJhbmRvbUNvbG9yJ1xuICAgICAgICAgICAgICAgIF9yYW5kb21Db2xvciA9IEBTbWFydENvbG9yLlJHQkFycmF5IFtcbiAgICAgICAgICAgICAgICAgICAgKChNYXRoLnJhbmRvbSgpICogMjU1KSArIC41KSA8PCAwXG4gICAgICAgICAgICAgICAgICAgICgoTWF0aC5yYW5kb20oKSAqIDI1NSkgKyAuNSkgPDwgMFxuICAgICAgICAgICAgICAgICAgICAoKE1hdGgucmFuZG9tKCkgKiAyNTUpICsgLjUpIDw8IDBdXG5cbiAgICAgICAgICAgICAgICAjIENvbnZlcnQgdG8gYHByZWZlcnJlZENvbG9yYCwgYW5kIHRoZW4gZW1pdCBpdFxuICAgICAgICAgICAgICAgIF9wcmVmZXJyZWRGb3JtYXQgPSBhdG9tLmNvbmZpZy5nZXQgJ2NvbG9yLXBpY2tlci5wcmVmZXJyZWRGb3JtYXQnXG4gICAgICAgICAgICAgICAgX2NvbnZlcnRlZENvbG9yID0gX3JhbmRvbUNvbG9yW1widG8jeyBfcHJlZmVycmVkRm9ybWF0IH1cIl0oKVxuICAgICAgICAgICAgICAgIF9yYW5kb21Db2xvciA9IEBTbWFydENvbG9yW19wcmVmZXJyZWRGb3JtYXRdKF9jb252ZXJ0ZWRDb2xvcilcblxuICAgICAgICAgICAgICAgIEBlbWl0SW5wdXRDb2xvciBfcmFuZG9tQ29sb3IsIGZhbHNlXG4gICAgICAgICAgICAjIE5vIG1hdGNoLCBhbmQgaXQncyB0aGUgZmlyc3Qgb3BlblxuICAgICAgICAgICAgZWxzZSBpZiBAaXNGaXJzdE9wZW5cbiAgICAgICAgICAgICAgICBfcmVkQ29sb3IgPSBAU21hcnRDb2xvci5IRVggJyNmMDAnXG5cbiAgICAgICAgICAgICAgICAjIENvbnZlcnQgdG8gYHByZWZlcnJlZENvbG9yYCwgYW5kIHRoZW4gZW1pdCBpdFxuICAgICAgICAgICAgICAgIF9wcmVmZXJyZWRGb3JtYXQgPSBhdG9tLmNvbmZpZy5nZXQgJ2NvbG9yLXBpY2tlci5wcmVmZXJyZWRGb3JtYXQnXG5cbiAgICAgICAgICAgICAgICBpZiBfcmVkQ29sb3IuZm9ybWF0IGlzbnQgX3ByZWZlcnJlZEZvcm1hdFxuICAgICAgICAgICAgICAgICAgICBfY29udmVydGVkQ29sb3IgPSBfcmVkQ29sb3JbXCJ0byN7IF9wcmVmZXJyZWRGb3JtYXQgfVwiXSgpXG4gICAgICAgICAgICAgICAgICAgIF9yZWRDb2xvciA9IEBTbWFydENvbG9yW19wcmVmZXJyZWRGb3JtYXRdKF9jb252ZXJ0ZWRDb2xvcilcbiAgICAgICAgICAgICAgICBAaXNGaXJzdE9wZW4gPSBub1xuXG4gICAgICAgICAgICAgICAgQGVtaXRJbnB1dENvbG9yIF9yZWRDb2xvciwgZmFsc2VcblxuICAgICAgICAjICBBZnRlciAoJiBpZikgaGF2aW5nIHNlbGVjdGVkIHRleHQgKGFzIHRoaXMgbWlnaHQgY2hhbmdlIHRoZSBzY3JvbGxcbiAgICAgICAgIyAgcG9zaXRpb24pIGdhdGhlciBpbmZvcm1hdGlvbiBhYm91dCB0aGUgRWRpdG9yXG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBQYW5lVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgICAgIF9wYW5lT2Zmc2V0VG9wID0gUGFuZVZpZXcub2Zmc2V0VG9wXG4gICAgICAgICAgICBfcGFuZU9mZnNldExlZnQgPSBQYW5lVmlldy5vZmZzZXRMZWZ0XG5cbiAgICAgICAgICAgIF9lZGl0b3JPZmZzZXRUb3AgPSBFZGl0b3JWaWV3LnBhcmVudE5vZGUub2Zmc2V0VG9wXG4gICAgICAgICAgICBfZWRpdG9yT2Zmc2V0TGVmdCA9IEVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLnNjcm9sbC12aWV3Jykub2Zmc2V0TGVmdFxuICAgICAgICAgICAgX2VkaXRvclNjcm9sbFRvcCA9IEVkaXRvclZpZXcuZ2V0U2Nyb2xsVG9wKClcblxuICAgICAgICAgICAgX2xpbmVIZWlnaHQgPSBFZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcbiAgICAgICAgICAgIF9saW5lT2Zmc2V0TGVmdCA9IEVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmxpbmUnKS5vZmZzZXRMZWZ0XG5cbiAgICAgICAgICAgICMgQ2VudGVyIGl0IG9uIHRoZSBtaWRkbGUgb2YgdGhlIHNlbGVjdGlvbiByYW5nZVxuICAgICAgICAgICAgIyBUT0RPOiBUaGVyZSBjYW4gYmUgbGluZXMgb3ZlciBtb3JlIHRoYW4gb25lIHJvd1xuICAgICAgICAgICAgaWYgX21hdGNoXG4gICAgICAgICAgICAgICAgX3JlY3QgPSBFZGl0b3JFbGVtZW50LnBpeGVsUmVjdEZvclNjcmVlblJhbmdlKF9zZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKSlcbiAgICAgICAgICAgICAgICBfcmlnaHQgPSBfcmVjdC5sZWZ0ICsgX3JlY3Qud2lkdGhcbiAgICAgICAgICAgICAgICBfY3Vyc29yUG9zaXRpb24ubGVmdCA9IF9yaWdodCAtIChfcmVjdC53aWR0aCAvIDIpXG5cbiAgICAgICAgIyAgRmlndXJlIG91dCB3aGVyZSB0byBwbGFjZSB0aGUgQ29sb3IgUGlja2VyXG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBfdG90YWxPZmZzZXRUb3AgPSBfcGFuZU9mZnNldFRvcCArIF9saW5lSGVpZ2h0IC0gX2VkaXRvclNjcm9sbFRvcCArIF9lZGl0b3JPZmZzZXRUb3BcbiAgICAgICAgICAgIF90b3RhbE9mZnNldExlZnQgPSBfcGFuZU9mZnNldExlZnQgKyBfZWRpdG9yT2Zmc2V0TGVmdCArIF9saW5lT2Zmc2V0TGVmdFxuXG4gICAgICAgICAgICBfcG9zaXRpb24gPVxuICAgICAgICAgICAgICAgIHg6IF9jdXJzb3JQb3NpdGlvbi5sZWZ0ICsgX3RvdGFsT2Zmc2V0TGVmdFxuICAgICAgICAgICAgICAgIHk6IF9jdXJzb3JQb3NpdGlvbi50b3AgKyBfdG90YWxPZmZzZXRUb3BcblxuICAgICAgICAjICBGaWd1cmUgb3V0IHdoZXJlIHRvIGFjdHVhbGx5IHBsYWNlIHRoZSBDb2xvciBQaWNrZXIgYnlcbiAgICAgICAgIyAgc2V0dGluZyB1cCBib3VuZGFyaWVzIGFuZCBmbGlwcGluZyBpdCBpZiBuZWNlc3NhcnlcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIF9jb2xvclBpY2tlclBvc2l0aW9uID1cbiAgICAgICAgICAgICAgICB4OiBkbyA9PlxuICAgICAgICAgICAgICAgICAgICBfY29sb3JQaWNrZXJXaWR0aCA9IEBlbGVtZW50LndpZHRoKClcbiAgICAgICAgICAgICAgICAgICAgX2hhbGZDb2xvclBpY2tlcldpZHRoID0gKF9jb2xvclBpY2tlcldpZHRoIC8gMikgPDwgMFxuXG4gICAgICAgICAgICAgICAgICAgICMgTWFrZSBzdXJlIHRoZSBDb2xvciBQaWNrZXIgaXNuJ3QgdG9vIGZhciB0byB0aGUgbGVmdFxuICAgICAgICAgICAgICAgICAgICBfeCA9IE1hdGgubWF4IDEwLCBfcG9zaXRpb24ueCAtIF9oYWxmQ29sb3JQaWNrZXJXaWR0aFxuICAgICAgICAgICAgICAgICAgICAjIE1ha2Ugc3VyZSB0aGUgQ29sb3IgUGlja2VyIGlzbid0IHRvbyBmYXIgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIF94ID0gTWF0aC5taW4gKEBQYXJlbnQub2Zmc2V0V2lkdGggLSBfY29sb3JQaWNrZXJXaWR0aCAtIDEwKSwgX3hcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3hcbiAgICAgICAgICAgICAgICB5OiBkbyA9PlxuICAgICAgICAgICAgICAgICAgICBAZWxlbWVudC51bmZsaXAoKVxuXG4gICAgICAgICAgICAgICAgICAgICMgVE9ETzogSXQncyBub3QgcmVhbGx5IHdvcmtpbmcgb3V0IGdyZWF0XG5cbiAgICAgICAgICAgICAgICAgICAgIyBJZiB0aGUgY29sb3IgcGlja2VyIGlzIHRvbyBmYXIgZG93biwgZmxpcCBpdFxuICAgICAgICAgICAgICAgICAgICBpZiBAZWxlbWVudC5oZWlnaHQoKSArIF9wb3NpdGlvbi55ID4gQFBhcmVudC5vZmZzZXRIZWlnaHQgLSAzMlxuICAgICAgICAgICAgICAgICAgICAgICAgQGVsZW1lbnQuZmxpcCgpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3Bvc2l0aW9uLnkgLSBfbGluZUhlaWdodCAtIEBlbGVtZW50LmhlaWdodCgpXG4gICAgICAgICAgICAgICAgICAgICMgQnV0IGlmIGl0J3MgZmluZSwga2VlcCB0aGUgWSBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICBlbHNlIHJldHVybiBfcG9zaXRpb24ueVxuXG4gICAgICAgICAgICAjIFNldCBDb2xvciBQaWNrZXIgcG9zaXRpb24gYW5kIGVtaXQgZXZlbnRzXG4gICAgICAgICAgICBAZWxlbWVudC5zZXRQb3NpdGlvbiBfY29sb3JQaWNrZXJQb3NpdGlvbi54LCBfY29sb3JQaWNrZXJQb3NpdGlvbi55XG4gICAgICAgICAgICBAZW1pdFBvc2l0aW9uQ2hhbmdlIF9wb3NpdGlvbiwgX2NvbG9yUGlja2VyUG9zaXRpb25cblxuICAgICAgICAgICAgIyBPcGVuIHRoZSBDb2xvciBQaWNrZXJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PiAjIHdhaXQgZm9yIGNsYXNzIGRlbGF5XG4gICAgICAgICAgICAgICAgQGVsZW1lbnQub3BlbigpXG4gICAgICAgICAgICAgICAgQGVtaXRPcGVuKClcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBSZXBsYWNlIHNlbGVjdGVkIGNvbG9yXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIGNhblJlcGxhY2U6IHllc1xuICAgICAgICByZXBsYWNlOiAoY29sb3IpIC0+XG4gICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBjYW5SZXBsYWNlXG4gICAgICAgICAgICBAY2FuUmVwbGFjZSA9IG5vXG5cbiAgICAgICAgICAgIEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICAgICAgRWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgICAgICAgICAgIGlmIEBzZWxlY3Rpb24ubWF0Y2hcbiAgICAgICAgICAgICAgICBfY3Vyc29yU3RhcnQgPSBAc2VsZWN0aW9uLm1hdGNoLnN0YXJ0XG4gICAgICAgICAgICAgICAgX2N1cnNvckVuZCA9IEBzZWxlY3Rpb24ubWF0Y2guZW5kXG4gICAgICAgICAgICBlbHNlIF9jdXJzb3JTdGFydCA9IF9jdXJzb3JFbmQgPSBAc2VsZWN0aW9uLmNvbHVtblxuXG4gICAgICAgICAgICAjIFNlbGVjdCB0aGUgY29sb3Igd2UncmUgZ29pbmcgdG8gcmVwbGFjZVxuICAgICAgICAgICAgRWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlIFtcbiAgICAgICAgICAgICAgICBbQHNlbGVjdGlvbi5yb3csIF9jdXJzb3JTdGFydF1cbiAgICAgICAgICAgICAgICBbQHNlbGVjdGlvbi5yb3csIF9jdXJzb3JFbmRdXVxuICAgICAgICAgICAgRWRpdG9yLnJlcGxhY2VTZWxlY3RlZFRleHQgbnVsbCwgPT4gY29sb3JcblxuICAgICAgICAgICAgIyBTZWxlY3QgdGhlIG5ld2x5IGluc2VydGVkIGNvbG9yIGFuZCBtb3ZlIHRoZSBjdXJzb3IgdG8gaXRcbiAgICAgICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICAgICAgICBFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24gW1xuICAgICAgICAgICAgICAgICAgICBAc2VsZWN0aW9uLnJvdywgX2N1cnNvclN0YXJ0XVxuICAgICAgICAgICAgICAgIEVkaXRvci5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgICAgICAgICAgICAgIyBVcGRhdGUgc2VsZWN0aW9uIGxlbmd0aFxuICAgICAgICAgICAgICAgIEBzZWxlY3Rpb24ubWF0Y2g/LmVuZCA9IF9jdXJzb3JTdGFydCArIGNvbG9yLmxlbmd0aFxuXG4gICAgICAgICAgICAgICAgRWRpdG9yLmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlIFtcbiAgICAgICAgICAgICAgICAgICAgW0BzZWxlY3Rpb24ucm93LCBfY3Vyc29yU3RhcnRdXG4gICAgICAgICAgICAgICAgICAgIFtAc2VsZWN0aW9uLnJvdywgX2N1cnNvclN0YXJ0ICsgY29sb3IubGVuZ3RoXV1cbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dCAoID0+IEBjYW5SZXBsYWNlID0geWVzKSwgMTAwXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIENsb3NlIHRoZSBDb2xvciBQaWNrZXJcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgY2xvc2U6IC0+XG4gICAgICAgICAgICBAZWxlbWVudC5jbG9zZSgpXG4gICAgICAgICAgICBAZW1pdENsb3NlKClcbiJdfQ==
