(function() {
  var CompositeDisposable, Emitter, Input, ref;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  module.exports = Input = (function() {
    Input.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    Input.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    Input.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    function Input(vimState) {
      this.vimState = vimState;
      this.editorElement = this.vimState.editorElement;
      this.vimState.onDidFailToPushToOperationStack((function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
      this.emitter = new Emitter;
    }

    Input.prototype.destroy = function() {
      var ref1;
      return ref1 = {}, this.vimState = ref1.vimState, ref1;
    };

    Input.prototype.focus = function(options) {
      var chars, charsMax, classNames, hideCursor, ref1;
      if (options == null) {
        options = {};
      }
      charsMax = options.charsMax, hideCursor = options.hideCursor;
      if (charsMax == null) {
        charsMax = 1;
      }
      chars = [];
      this.disposables = new CompositeDisposable();
      classNames = ["vim-mode-plus-input-char-waiting", "is-focused"];
      if (hideCursor) {
        classNames.push('hide-cursor');
      }
      this.disposables.add((ref1 = this.vimState).swapClassName.apply(ref1, classNames));
      this.disposables.add(this.vimState.onDidSetInputChar((function(_this) {
        return function(char) {
          var text;
          if (charsMax === 1) {
            return _this.confirm(char);
          } else {
            chars.push(char);
            text = chars.join('');
            _this.emitter.emit('did-change', text);
            if (chars.length >= charsMax) {
              return _this.confirm(text);
            }
          }
        };
      })(this)));
      return this.disposables.add(atom.commands.add(this.editorElement, {
        'core:cancel': (function(_this) {
          return function(event) {
            event.stopImmediatePropagation();
            return _this.cancel();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function(event) {
            event.stopImmediatePropagation();
            return _this.confirm(chars.join(''));
          };
        })(this)
      }));
    };

    Input.prototype.confirm = function(char) {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.emitter.emit('did-confirm', char);
    };

    Input.prototype.cancel = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.emitter.emit('did-cancel');
    };

    return Input;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9pbnB1dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMscUJBQUQsRUFBVTs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUNNO29CQUNKLFdBQUEsR0FBYSxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCO0lBQVI7O29CQUNiLFlBQUEsR0FBYyxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxhQUFaLEVBQTJCLEVBQTNCO0lBQVI7O29CQUNkLFdBQUEsR0FBYSxTQUFDLEVBQUQ7YUFBUSxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCO0lBQVI7O0lBRUEsZUFBQyxRQUFEO01BQUMsSUFBQyxDQUFBLFdBQUQ7TUFDWCxJQUFDLENBQUEsZ0JBQWlCLElBQUMsQ0FBQSxTQUFsQjtNQUNGLElBQUMsQ0FBQSxRQUFRLENBQUMsK0JBQVYsQ0FBMEMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUN4QyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBRHdDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQztNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtJQUpKOztvQkFNYixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7YUFBQSxPQUFjLEVBQWQsRUFBQyxJQUFDLENBQUEsZ0JBQUEsUUFBRixFQUFBO0lBRE87O29CQUdULEtBQUEsR0FBTyxTQUFDLE9BQUQ7QUFDTCxVQUFBOztRQURNLFVBQVE7O01BQ2IsMkJBQUQsRUFBVzs7UUFDWCxXQUFZOztNQUNaLEtBQUEsR0FBUTtNQUVSLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsbUJBQUEsQ0FBQTtNQUNuQixVQUFBLEdBQWEsQ0FBQyxrQ0FBRCxFQUFzQyxZQUF0QztNQUNiLElBQWtDLFVBQWxDO1FBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsYUFBaEIsRUFBQTs7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsUUFBQSxJQUFDLENBQUEsUUFBRCxDQUFTLENBQUMsYUFBVixhQUF3QixVQUF4QixDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFWLENBQTRCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO0FBQzNDLGNBQUE7VUFBQSxJQUFHLFFBQUEsS0FBWSxDQUFmO21CQUNFLEtBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxFQURGO1dBQUEsTUFBQTtZQUdFLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtZQUNBLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLEVBQVg7WUFDUCxLQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkLEVBQTRCLElBQTVCO1lBQ0EsSUFBRyxLQUFLLENBQUMsTUFBTixJQUFnQixRQUFuQjtxQkFDRSxLQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsRUFERjthQU5GOztRQUQyQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUIsQ0FBakI7YUFVQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxhQUFuQixFQUNmO1FBQUEsYUFBQSxFQUFlLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsS0FBRDtZQUNiLEtBQUssQ0FBQyx3QkFBTixDQUFBO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFGYTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtRQUdBLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO1lBQ2QsS0FBSyxDQUFDLHdCQUFOLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxLQUFLLENBQUMsSUFBTixDQUFXLEVBQVgsQ0FBVDtVQUZjO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhoQjtPQURlLENBQWpCO0lBbkJLOztvQkEyQlAsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUNQLFVBQUE7O1lBQVksQ0FBRSxPQUFkLENBQUE7O2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsYUFBZCxFQUE2QixJQUE3QjtJQUZPOztvQkFJVCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7O1lBQVksQ0FBRSxPQUFkLENBQUE7O2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZDtJQUZNOzs7OztBQWhEViIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIElucHV0XG4gIG9uRGlkQ2hhbmdlOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlJywgZm5cbiAgb25EaWRDb25maXJtOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY29uZmlybScsIGZuXG4gIG9uRGlkQ2FuY2VsOiAoZm4pIC0+IEBlbWl0dGVyLm9uICdkaWQtY2FuY2VsJywgZm5cblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQHZpbVN0YXRlLm9uRGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2sgPT5cbiAgICAgIEBjYW5jZWwoKVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICBkZXN0cm95OiAtPlxuICAgIHtAdmltU3RhdGV9ID0ge31cblxuICBmb2N1czogKG9wdGlvbnM9e30pIC0+XG4gICAge2NoYXJzTWF4LCBoaWRlQ3Vyc29yfSA9IG9wdGlvbnNcbiAgICBjaGFyc01heCA/PSAxXG4gICAgY2hhcnMgPSBbXVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIGNsYXNzTmFtZXMgPSBbXCJ2aW0tbW9kZS1wbHVzLWlucHV0LWNoYXItd2FpdGluZ1wiLCAgXCJpcy1mb2N1c2VkXCJdXG4gICAgY2xhc3NOYW1lcy5wdXNoKCdoaWRlLWN1cnNvcicpIGlmIGhpZGVDdXJzb3JcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5zd2FwQ2xhc3NOYW1lKGNsYXNzTmFtZXMuLi4pXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBAdmltU3RhdGUub25EaWRTZXRJbnB1dENoYXIgKGNoYXIpID0+XG4gICAgICBpZiBjaGFyc01heCBpcyAxXG4gICAgICAgIEBjb25maXJtKGNoYXIpXG4gICAgICBlbHNlXG4gICAgICAgIGNoYXJzLnB1c2goY2hhcilcbiAgICAgICAgdGV4dCA9IGNoYXJzLmpvaW4oJycpXG4gICAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnLCB0ZXh0KVxuICAgICAgICBpZiBjaGFycy5sZW5ndGggPj0gY2hhcnNNYXhcbiAgICAgICAgICBAY29uZmlybSh0ZXh0KVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBAZWRpdG9yRWxlbWVudCxcbiAgICAgICdjb3JlOmNhbmNlbCc6IChldmVudCkgPT5cbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgQGNhbmNlbCgpXG4gICAgICAnY29yZTpjb25maXJtJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICBAY29uZmlybShjaGFycy5qb2luKCcnKSlcblxuICBjb25maXJtOiAoY2hhcikgLT5cbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jb25maXJtJywgY2hhcilcblxuICBjYW5jZWw6IC0+XG4gICAgQGRpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2FuY2VsJylcbiJdfQ==
