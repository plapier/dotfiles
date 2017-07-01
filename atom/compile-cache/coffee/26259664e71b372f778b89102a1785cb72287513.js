(function() {
  var CompositeDisposable, Disposable, Emitter, SearchInput, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  module.exports = SearchInput = (function() {
    SearchInput.prototype.literalModeDeactivator = null;

    SearchInput.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    SearchInput.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    SearchInput.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    SearchInput.prototype.onDidCommand = function(fn) {
      return this.emitter.on('did-command', fn);
    };

    function SearchInput(vimState) {
      var editorContainer, optionsContainer, ref1;
      this.vimState = vimState;
      this.emitter = new Emitter;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.container = document.createElement('div');
      this.container.className = 'vim-mode-plus-search-container';
      this.container.innerHTML = "<div class='options-container'>\n  <span class='inline-block-tight btn btn-primary'>.*</span>\n</div>\n<div class='editor-container'>\n</div>";
      ref1 = this.container.getElementsByTagName('div'), optionsContainer = ref1[0], editorContainer = ref1[1];
      this.regexSearchStatus = optionsContainer.firstElementChild;
      this.editor = atom.workspace.buildTextEditor({
        mini: true
      });
      this.editorElement = this.editor.element;
      this.editorElement.classList.add('vim-mode-plus-search');
      editorContainer.appendChild(this.editorElement);
      this.editor.onDidChange((function(_this) {
        return function() {
          if (_this.finished) {
            return;
          }
          return _this.emitter.emit('did-change', _this.editor.getText());
        };
      })(this));
      this.panel = atom.workspace.addBottomPanel({
        item: this.container,
        visible: false
      });
      this.vimState.onDidFailToPushToOperationStack((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.registerCommands();
    }

    SearchInput.prototype.destroy = function() {
      var ref1, ref2;
      this.disposables.dispose();
      this.editor.destroy();
      if ((ref1 = this.panel) != null) {
        ref1.destroy();
      }
      return ref2 = {}, this.editor = ref2.editor, this.panel = ref2.panel, this.editorElement = ref2.editorElement, this.vimState = ref2.vimState, ref2;
    };

    SearchInput.prototype.handleEvents = function() {
      return atom.commands.add(this.editorElement, {
        'core:confirm': (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        'core:backspace': (function(_this) {
          return function() {
            return _this.backspace();
          };
        })(this),
        'vim-mode-plus:input-cancel': (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this)
      });
    };

    SearchInput.prototype.focus = function(options1) {
      var cancel, ref1;
      this.options = options1 != null ? options1 : {};
      this.finished = false;
      if (this.options.classList != null) {
        (ref1 = this.editorElement.classList).add.apply(ref1, this.options.classList);
      }
      this.panel.show();
      this.editorElement.focus();
      this.focusSubscriptions = new CompositeDisposable;
      this.focusSubscriptions.add(this.handleEvents());
      cancel = this.cancel.bind(this);
      this.vimState.editorElement.addEventListener('click', cancel);
      this.focusSubscriptions.add(new Disposable((function(_this) {
        return function() {
          return _this.vimState.editorElement.removeEventListener('click', cancel);
        };
      })(this)));
      return this.focusSubscriptions.add(atom.workspace.onDidChangeActivePaneItem(cancel));
    };

    SearchInput.prototype.unfocus = function() {
      var ref1, ref2, ref3, ref4, ref5;
      this.finished = true;
      if (((ref1 = this.options) != null ? ref1.classList : void 0) != null) {
        (ref2 = this.editorElement.classList).remove.apply(ref2, this.options.classList);
      }
      this.regexSearchStatus.classList.add('btn-primary');
      if ((ref3 = this.literalModeDeactivator) != null) {
        ref3.dispose();
      }
      if ((ref4 = this.focusSubscriptions) != null) {
        ref4.dispose();
      }
      atom.workspace.getActivePane().activate();
      this.editor.setText('');
      return (ref5 = this.panel) != null ? ref5.hide() : void 0;
    };

    SearchInput.prototype.updateOptionSettings = function(arg) {
      var useRegexp;
      useRegexp = (arg != null ? arg : {}).useRegexp;
      return this.regexSearchStatus.classList.toggle('btn-primary', useRegexp);
    };

    SearchInput.prototype.setCursorWord = function() {
      return this.editor.insertText(this.vimState.editor.getWordUnderCursor());
    };

    SearchInput.prototype.activateLiteralMode = function() {
      if (this.literalModeDeactivator != null) {
        return this.literalModeDeactivator.dispose();
      } else {
        this.literalModeDeactivator = new CompositeDisposable();
        this.editorElement.classList.add('literal-mode');
        return this.literalModeDeactivator.add(new Disposable((function(_this) {
          return function() {
            _this.editorElement.classList.remove('literal-mode');
            return _this.literalModeDeactivator = null;
          };
        })(this)));
      }
    };

    SearchInput.prototype.isVisible = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.isVisible() : void 0;
    };

    SearchInput.prototype.cancel = function() {
      if (this.finished) {
        return;
      }
      this.emitter.emit('did-cancel');
      return this.unfocus();
    };

    SearchInput.prototype.backspace = function() {
      if (this.editor.getText().length === 0) {
        return this.cancel();
      }
    };

    SearchInput.prototype.confirm = function(landingPoint) {
      if (landingPoint == null) {
        landingPoint = null;
      }
      this.emitter.emit('did-confirm', {
        input: this.editor.getText(),
        landingPoint: landingPoint
      });
      return this.unfocus();
    };

    SearchInput.prototype.stopPropagation = function(oldCommands) {
      var fn, fn1, name, newCommands;
      newCommands = {};
      fn1 = function(fn) {
        var commandName;
        if (indexOf.call(name, ':') >= 0) {
          commandName = name;
        } else {
          commandName = "vim-mode-plus:" + name;
        }
        return newCommands[commandName] = function(event) {
          event.stopImmediatePropagation();
          return fn(event);
        };
      };
      for (name in oldCommands) {
        fn = oldCommands[name];
        fn1(fn);
      }
      return newCommands;
    };

    SearchInput.prototype.emitDidCommand = function(name, options) {
      if (options == null) {
        options = {};
      }
      options.name = name;
      options.input = this.editor.getText();
      return this.emitter.emit('did-command', options);
    };

    SearchInput.prototype.registerCommands = function() {
      return atom.commands.add(this.editorElement, this.stopPropagation({
        "search-confirm": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "search-land-to-start": (function(_this) {
          return function() {
            return _this.confirm();
          };
        })(this),
        "search-land-to-end": (function(_this) {
          return function() {
            return _this.confirm('end');
          };
        })(this),
        "search-cancel": (function(_this) {
          return function() {
            return _this.cancel();
          };
        })(this),
        "search-visit-next": (function(_this) {
          return function() {
            return _this.emitDidCommand('visit', {
              direction: 'next'
            });
          };
        })(this),
        "search-visit-prev": (function(_this) {
          return function() {
            return _this.emitDidCommand('visit', {
              direction: 'prev'
            });
          };
        })(this),
        "select-occurrence-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence', {
              operation: 'SelectOccurrence'
            });
          };
        })(this),
        "change-occurrence-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence', {
              operation: 'ChangeOccurrence'
            });
          };
        })(this),
        "add-occurrence-pattern-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('occurrence');
          };
        })(this),
        "project-find-from-search": (function(_this) {
          return function() {
            return _this.emitDidCommand('project-find');
          };
        })(this),
        "search-insert-wild-pattern": (function(_this) {
          return function() {
            return _this.editor.insertText('.*?');
          };
        })(this),
        "search-activate-literal-mode": (function(_this) {
          return function() {
            return _this.activateLiteralMode();
          };
        })(this),
        "search-set-cursor-word": (function(_this) {
          return function() {
            return _this.setCursorWord();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.editor.setText(_this.vimState.searchHistory.get('prev'));
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.editor.setText(_this.vimState.searchHistory.get('next'));
          };
        })(this)
      }));
    };

    return SearchInput;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWFyY2gtaW5wdXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwREFBQTtJQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQjs7RUFFdEIsTUFBTSxDQUFDLE9BQVAsR0FDTTswQkFDSixzQkFBQSxHQUF3Qjs7MEJBRXhCLFdBQUEsR0FBYSxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCO0lBQVI7OzBCQUNiLFlBQUEsR0FBYyxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCO0lBQVI7OzBCQUNkLFdBQUEsR0FBYSxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCO0lBQVI7OzBCQUNiLFlBQUEsR0FBYyxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCO0lBQVI7O0lBRUQscUJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUNaLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBdkIsQ0FBakI7TUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ2IsSUFBQyxDQUFB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QWlCQSxnQkFBQSxFQUFrQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixLQUFDLENBQUEsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUF4QixDQUE0QixNQUE1QixDQUFoQjtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWpCbEI7T0FEZ0MsQ0FBbEM7SUFEZ0I7Ozs7O0FBeElwQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlYXJjaElucHV0XG4gIGxpdGVyYWxNb2RlRGVhY3RpdmF0b3I6IG51bGxcblxuICBvbkRpZENoYW5nZTogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZScsIGZuXG4gIG9uRGlkQ29uZmlybTogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNvbmZpcm0nLCBmblxuICBvbkRpZENhbmNlbDogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNhbmNlbCcsIGZuXG4gIG9uRGlkQ29tbWFuZDogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNvbW1hbmQnLCBmblxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuXG4gICAgQGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgQGNvbnRhaW5lci5jbGFzc05hbWUgPSAndmltLW1vZGUtcGx1cy1zZWFyY2gtY29udGFpbmVyJ1xuICAgIEBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICA8ZGl2IGNsYXNzPSdvcHRpb25zLWNvbnRhaW5lcic+XG4gICAgICAgIDxzcGFuIGNsYXNzPSdpbmxpbmUtYmxvY2stdGlnaHQgYnRuIGJ0bi1wcmltYXJ5Jz4uKjwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nZWRpdG9yLWNvbnRhaW5lcic+XG4gICAgICA8L2Rpdj5cbiAgICAgIFwiXCJcIlxuXG4gICAgW29wdGlvbnNDb250YWluZXIsIGVkaXRvckNvbnRhaW5lcl0gPSBAY29udGFpbmVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdkaXYnKVxuICAgIEByZWdleFNlYXJjaFN0YXR1cyA9IG9wdGlvbnNDb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKG1pbmk6IHRydWUpXG4gICAgQGVkaXRvckVsZW1lbnQgPSBAZWRpdG9yLmVsZW1lbnRcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aW0tbW9kZS1wbHVzLXNlYXJjaCcpXG4gICAgZWRpdG9yQ29udGFpbmVyLmFwcGVuZENoaWxkKEBlZGl0b3JFbGVtZW50KVxuICAgIEBlZGl0b3Iub25EaWRDaGFuZ2UgPT5cbiAgICAgIHJldHVybiBpZiBAZmluaXNoZWRcbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnLCBAZWRpdG9yLmdldFRleHQoKSlcblxuICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IEBjb250YWluZXIsIHZpc2libGU6IGZhbHNlKVxuXG4gICAgQHZpbVN0YXRlLm9uRGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2sgPT5cbiAgICAgIEBjYW5jZWwoKVxuXG4gICAgQHJlZ2lzdGVyQ29tbWFuZHMoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBlZGl0b3IuZGVzdHJveSgpXG4gICAgQHBhbmVsPy5kZXN0cm95KClcbiAgICB7QGVkaXRvciwgQHBhbmVsLCBAZWRpdG9yRWxlbWVudCwgQHZpbVN0YXRlfSA9IHt9XG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlZGl0b3JFbGVtZW50LFxuICAgICAgJ2NvcmU6Y29uZmlybSc6ID0+IEBjb25maXJtKClcbiAgICAgICdjb3JlOmNhbmNlbCc6ID0+IEBjYW5jZWwoKVxuICAgICAgJ2NvcmU6YmFja3NwYWNlJzogPT4gQGJhY2tzcGFjZSgpXG4gICAgICAndmltLW1vZGUtcGx1czppbnB1dC1jYW5jZWwnOiA9PiBAY2FuY2VsKClcblxuICBmb2N1czogKEBvcHRpb25zPXt9KSAtPlxuICAgIEBmaW5pc2hlZCA9IGZhbHNlXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKEBvcHRpb25zLmNsYXNzTGlzdC4uLikgaWYgQG9wdGlvbnMuY2xhc3NMaXN0P1xuICAgIEBwYW5lbC5zaG93KClcbiAgICBAZWRpdG9yRWxlbWVudC5mb2N1cygpXG5cbiAgICBAZm9jdXNTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZm9jdXNTdWJzY3JpcHRpb25zLmFkZCBAaGFuZGxlRXZlbnRzKClcbiAgICBjYW5jZWwgPSBAY2FuY2VsLmJpbmQodGhpcylcbiAgICBAdmltU3RhdGUuZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbmNlbClcbiAgICAjIENhbmNlbCBvbiBtb3VzZSBjbGlja1xuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAdmltU3RhdGUuZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbmNlbClcblxuICAgICMgQ2FuY2VsIG9uIHRhYiBzd2l0Y2hcbiAgICBAZm9jdXNTdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKGNhbmNlbCkpXG5cbiAgdW5mb2N1czogLT5cbiAgICBAZmluaXNoZWQgPSB0cnVlXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShAb3B0aW9ucy5jbGFzc0xpc3QuLi4pIGlmIEBvcHRpb25zPy5jbGFzc0xpc3Q/XG4gICAgQHJlZ2V4U2VhcmNoU3RhdHVzLmNsYXNzTGlzdC5hZGQgJ2J0bi1wcmltYXJ5J1xuICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yPy5kaXNwb3NlKClcblxuICAgIEBmb2N1c1N1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpXG4gICAgQGVkaXRvci5zZXRUZXh0ICcnXG4gICAgQHBhbmVsPy5oaWRlKClcblxuICB1cGRhdGVPcHRpb25TZXR0aW5nczogKHt1c2VSZWdleHB9PXt9KSAtPlxuICAgIEByZWdleFNlYXJjaFN0YXR1cy5jbGFzc0xpc3QudG9nZ2xlKCdidG4tcHJpbWFyeScsIHVzZVJlZ2V4cClcblxuICBzZXRDdXJzb3JXb3JkOiAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChAdmltU3RhdGUuZWRpdG9yLmdldFdvcmRVbmRlckN1cnNvcigpKVxuXG4gIGFjdGl2YXRlTGl0ZXJhbE1vZGU6IC0+XG4gICAgaWYgQGxpdGVyYWxNb2RlRGVhY3RpdmF0b3I/XG4gICAgICBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvci5kaXNwb3NlKClcbiAgICBlbHNlXG4gICAgICBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvciA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2xpdGVyYWwtbW9kZScpXG5cbiAgICAgIEBsaXRlcmFsTW9kZURlYWN0aXZhdG9yLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdsaXRlcmFsLW1vZGUnKVxuICAgICAgICBAbGl0ZXJhbE1vZGVEZWFjdGl2YXRvciA9IG51bGxcblxuICBpc1Zpc2libGU6IC0+XG4gICAgQHBhbmVsPy5pc1Zpc2libGUoKVxuXG4gIGNhbmNlbDogLT5cbiAgICByZXR1cm4gaWYgQGZpbmlzaGVkXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNhbmNlbCcpXG4gICAgQHVuZm9jdXMoKVxuXG4gIGJhY2tzcGFjZTogLT5cbiAgICBAY2FuY2VsKCkgaWYgQGVkaXRvci5nZXRUZXh0KCkubGVuZ3RoIGlzIDBcblxuICBjb25maXJtOiAobGFuZGluZ1BvaW50PW51bGwpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNvbmZpcm0nLCB7aW5wdXQ6IEBlZGl0b3IuZ2V0VGV4dCgpLCBsYW5kaW5nUG9pbnR9KVxuICAgIEB1bmZvY3VzKClcblxuICBzdG9wUHJvcGFnYXRpb246IChvbGRDb21tYW5kcykgLT5cbiAgICBuZXdDb21tYW5kcyA9IHt9XG4gICAgZm9yIG5hbWUsIGZuIG9mIG9sZENvbW1hbmRzXG4gICAgICBkbyAoZm4pIC0+XG4gICAgICAgIGlmICc6JyBpbiBuYW1lXG4gICAgICAgICAgY29tbWFuZE5hbWUgPSBuYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb21tYW5kTmFtZSA9IFwidmltLW1vZGUtcGx1czoje25hbWV9XCJcbiAgICAgICAgbmV3Q29tbWFuZHNbY29tbWFuZE5hbWVdID0gKGV2ZW50KSAtPlxuICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgICAgZm4oZXZlbnQpXG4gICAgbmV3Q29tbWFuZHNcblxuXG4gIGVtaXREaWRDb21tYW5kOiAobmFtZSwgb3B0aW9ucz17fSkgLT5cbiAgICBvcHRpb25zLm5hbWUgPSBuYW1lXG4gICAgb3B0aW9ucy5pbnB1dCA9IEBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNvbW1hbmQnLCBvcHRpb25zKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVkaXRvckVsZW1lbnQsIEBzdG9wUHJvcGFnYXRpb24oXG4gICAgICBcInNlYXJjaC1jb25maXJtXCI6ID0+IEBjb25maXJtKClcbiAgICAgIFwic2VhcmNoLWxhbmQtdG8tc3RhcnRcIjogPT4gQGNvbmZpcm0oKVxuICAgICAgXCJzZWFyY2gtbGFuZC10by1lbmRcIjogPT4gQGNvbmZpcm0oJ2VuZCcpXG4gICAgICBcInNlYXJjaC1jYW5jZWxcIjogPT4gQGNhbmNlbCgpXG5cbiAgICAgIFwic2VhcmNoLXZpc2l0LW5leHRcIjogPT4gQGVtaXREaWRDb21tYW5kKCd2aXNpdCcsIGRpcmVjdGlvbjogJ25leHQnKVxuICAgICAgXCJzZWFyY2gtdmlzaXQtcHJldlwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ3Zpc2l0JywgZGlyZWN0aW9uOiAncHJldicpXG5cbiAgICAgIFwic2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2hcIjogPT4gQGVtaXREaWRDb21tYW5kKCdvY2N1cnJlbmNlJywgb3BlcmF0aW9uOiAnU2VsZWN0T2NjdXJyZW5jZScpXG4gICAgICBcImNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoXCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgnb2NjdXJyZW5jZScsIG9wZXJhdGlvbjogJ0NoYW5nZU9jY3VycmVuY2UnKVxuICAgICAgXCJhZGQtb2NjdXJyZW5jZS1wYXR0ZXJuLWZyb20tc2VhcmNoXCI6ID0+IEBlbWl0RGlkQ29tbWFuZCgnb2NjdXJyZW5jZScpXG4gICAgICBcInByb2plY3QtZmluZC1mcm9tLXNlYXJjaFwiOiA9PiBAZW1pdERpZENvbW1hbmQoJ3Byb2plY3QtZmluZCcpXG5cbiAgICAgIFwic2VhcmNoLWluc2VydC13aWxkLXBhdHRlcm5cIjogPT4gQGVkaXRvci5pbnNlcnRUZXh0KCcuKj8nKVxuICAgICAgXCJzZWFyY2gtYWN0aXZhdGUtbGl0ZXJhbC1tb2RlXCI6ID0+IEBhY3RpdmF0ZUxpdGVyYWxNb2RlKClcbiAgICAgIFwic2VhcmNoLXNldC1jdXJzb3Itd29yZFwiOiA9PiBAc2V0Q3Vyc29yV29yZCgpXG4gICAgICAnY29yZTptb3ZlLXVwJzogPT4gQGVkaXRvci5zZXRUZXh0IEB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldCgncHJldicpXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiA9PiBAZWRpdG9yLnNldFRleHQgQHZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KCduZXh0JylcbiAgICApXG4iXX0=
