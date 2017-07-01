(function() {
  var CompositeDisposable, Disposable, Emitter, ModeManager, Range, moveCursorLeft, ref;

  ref = require('atom'), Emitter = ref.Emitter, Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable;

  moveCursorLeft = null;

  ModeManager = (function() {
    ModeManager.prototype.mode = 'insert';

    ModeManager.prototype.submode = null;

    ModeManager.prototype.replacedCharsBySelection = null;

    function ModeManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.emitter = new Emitter;
      this.vimState.onDidDestroy(this.destroy.bind(this));
    }

    ModeManager.prototype.destroy = function() {};

    ModeManager.prototype.isMode = function(mode, submode) {
      if (submode == null) {
        submode = null;
      }
      return (mode === this.mode) && (submode === this.submode);
    };

    ModeManager.prototype.onWillActivateMode = function(fn) {
      return this.emitter.on('will-activate-mode', fn);
    };

    ModeManager.prototype.onDidActivateMode = function(fn) {
      return this.emitter.on('did-activate-mode', fn);
    };

    ModeManager.prototype.onWillDeactivateMode = function(fn) {
      return this.emitter.on('will-deactivate-mode', fn);
    };

    ModeManager.prototype.preemptWillDeactivateMode = function(fn) {
      return this.emitter.preempt('will-deactivate-mode', fn);
    };

    ModeManager.prototype.onDidDeactivateMode = function(fn) {
      return this.emitter.on('did-deactivate-mode', fn);
    };

    ModeManager.prototype.activate = function(newMode, newSubmode) {
      var ref1, ref2, ref3, ref4;
      if (newSubmode == null) {
        newSubmode = null;
      }
      if ((newMode === 'visual') && this.editor.isEmpty()) {
        return;
      }
      this.emitter.emit('will-activate-mode', {
        mode: newMode,
        submode: newSubmode
      });
      if ((newMode === 'visual') && (this.submode != null) && (newSubmode === this.submode)) {
        ref1 = ['normal', null], newMode = ref1[0], newSubmode = ref1[1];
      }
      if (newMode !== this.mode) {
        this.deactivate();
      }
      this.deactivator = (function() {
        switch (newMode) {
          case 'normal':
            return this.activateNormalMode();
          case 'operator-pending':
            return this.activateOperatorPendingMode();
          case 'insert':
            return this.activateInsertMode(newSubmode);
          case 'visual':
            return this.activateVisualMode(newSubmode);
        }
      }).call(this);
      this.editorElement.classList.remove(this.mode + "-mode");
      this.editorElement.classList.remove(this.submode);
      ref2 = [newMode, newSubmode], this.mode = ref2[0], this.submode = ref2[1];
      if (this.mode === 'visual') {
        this.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      } else {
        if ((ref3 = this.vimState.getProp('swrap')) != null) {
          ref3.clearProperties(this.editor);
        }
      }
      this.editorElement.classList.add(this.mode + "-mode");
      if (this.submode != null) {
        this.editorElement.classList.add(this.submode);
      }
      this.vimState.statusBarManager.update(this.mode, this.submode);
      if (this.mode === 'visual') {
        this.vimState.cursorStyleManager.refresh();
      } else {
        if ((ref4 = this.vimState.getProp('cursorStyleManager')) != null) {
          ref4.refresh();
        }
      }
      return this.emitter.emit('did-activate-mode', {
        mode: this.mode,
        submode: this.submode
      });
    };

    ModeManager.prototype.deactivate = function() {
      var ref1, ref2;
      if (!((ref1 = this.deactivator) != null ? ref1.disposed : void 0)) {
        this.emitter.emit('will-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
        if ((ref2 = this.deactivator) != null) {
          ref2.dispose();
        }
        this.editorElement.classList.remove(this.mode + "-mode");
        this.editorElement.classList.remove(this.submode);
        return this.emitter.emit('did-deactivate-mode', {
          mode: this.mode,
          submode: this.submode
        });
      }
    };

    ModeManager.prototype.activateNormalMode = function() {
      var cursor, goalColumn, i, len, ref1, ref2;
      this.vimState.reset();
      if ((ref1 = this.editorElement.component) != null) {
        ref1.setInputEnabled(false);
      }
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (!(cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine())) {
          continue;
        }
        goalColumn = cursor.goalColumn;
        cursor.moveLeft();
        if (goalColumn != null) {
          cursor.goalColumn = goalColumn;
        }
      }
      return new Disposable;
    };

    ModeManager.prototype.activateOperatorPendingMode = function() {
      return new Disposable;
    };

    ModeManager.prototype.activateInsertMode = function(submode) {
      var replaceModeDeactivator;
      if (submode == null) {
        submode = null;
      }
      this.editorElement.component.setInputEnabled(true);
      if (submode === 'replace') {
        replaceModeDeactivator = this.activateReplaceMode();
      }
      return new Disposable((function(_this) {
        return function() {
          var cursor, i, len, needSpecialCareToPreventWrapLine, ref1, results;
          if (moveCursorLeft == null) {
            moveCursorLeft = require('./utils').moveCursorLeft;
          }
          if (replaceModeDeactivator != null) {
            replaceModeDeactivator.dispose();
          }
          replaceModeDeactivator = null;
          needSpecialCareToPreventWrapLine = _this.editor.hasAtomicSoftTabs();
          ref1 = _this.editor.getCursors();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            cursor = ref1[i];
            results.push(moveCursorLeft(cursor, {
              needSpecialCareToPreventWrapLine: needSpecialCareToPreventWrapLine
            }));
          }
          return results;
        };
      })(this));
    };

    ModeManager.prototype.activateReplaceMode = function() {
      var subs;
      this.replacedCharsBySelection = new WeakMap;
      subs = new CompositeDisposable;
      subs.add(this.editor.onWillInsertText((function(_this) {
        return function(arg) {
          var cancel, text;
          text = arg.text, cancel = arg.cancel;
          cancel();
          return _this.editor.getSelections().forEach(function(selection) {
            var char, i, len, ref1, ref2, results, selectedText;
            ref2 = (ref1 = text.split('')) != null ? ref1 : [];
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              char = ref2[i];
              if ((char !== "\n") && (!selection.cursor.isAtEndOfLine())) {
                selection.selectRight();
              }
              selectedText = selection.getText();
              selection.insertText(char);
              if (!_this.replacedCharsBySelection.has(selection)) {
                _this.replacedCharsBySelection.set(selection, []);
              }
              results.push(_this.replacedCharsBySelection.get(selection).push(selectedText));
            }
            return results;
          });
        };
      })(this)));
      subs.add(new Disposable((function(_this) {
        return function() {
          return _this.replacedCharsBySelection = null;
        };
      })(this)));
      return subs;
    };

    ModeManager.prototype.getReplacedCharForSelection = function(selection) {
      var ref1;
      return (ref1 = this.replacedCharsBySelection.get(selection)) != null ? ref1.pop() : void 0;
    };

    ModeManager.prototype.activateVisualMode = function(submode) {
      var $selection, i, j, len, len1, ref1, ref2, swrap;
      swrap = this.vimState.swrap;
      ref1 = swrap.getSelections(this.editor);
      for (i = 0, len = ref1.length; i < len; i++) {
        $selection = ref1[i];
        if (!$selection.hasProperties()) {
          $selection.saveProperties();
        }
      }
      swrap.normalize(this.editor);
      ref2 = swrap.getSelections(this.editor);
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        $selection = ref2[j];
        $selection.applyWise(submode);
      }
      if (submode === 'blockwise') {
        this.vimState.getLastBlockwiseSelection().autoscroll();
      }
      return new Disposable((function(_this) {
        return function() {
          var k, len2, ref3, selection;
          swrap.normalize(_this.editor);
          if (_this.submode === 'blockwise') {
            swrap.setReversedState(_this.editor, true);
          }
          ref3 = _this.editor.getSelections();
          for (k = 0, len2 = ref3.length; k < len2; k++) {
            selection = ref3[k];
            selection.clear({
              autoscroll: false
            });
          }
          return _this.updateNarrowedState(false);
        };
      })(this));
    };

    ModeManager.prototype.hasMultiLineSelection = function() {
      var ref1;
      if (this.isMode('visual', 'blockwise')) {
        return !((ref1 = this.vimState.getLastBlockwiseSelection()) != null ? ref1.isSingleRow() : void 0);
      } else {
        return !this.vimState.swrap(this.editor.getLastSelection()).isSingleRow();
      }
    };

    ModeManager.prototype.updateNarrowedState = function(value) {
      if (value == null) {
        value = null;
      }
      return this.editorElement.classList.toggle('is-narrowed', value != null ? value : this.hasMultiLineSelection());
    };

    ModeManager.prototype.isNarrowed = function() {
      return this.editorElement.classList.contains('is-narrowed');
    };

    return ModeManager;

  })();

  module.exports = ModeManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb2RlLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvRCxPQUFBLENBQVEsTUFBUixDQUFwRCxFQUFDLHFCQUFELEVBQVUsaUJBQVYsRUFBaUIsNkNBQWpCLEVBQXNDOztFQUN0QyxjQUFBLEdBQWlCOztFQUVYOzBCQUNKLElBQUEsR0FBTTs7MEJBQ04sT0FBQSxHQUFTOzswQkFDVCx3QkFBQSxHQUEwQjs7SUFFYixxQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEO01BQ1osT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLGNBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxxQkFBQTtNQUVYLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCO0lBSlc7OzBCQU1iLE9BQUEsR0FBUyxTQUFBLEdBQUE7OzBCQUVULE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxPQUFQOztRQUFPLFVBQVE7O2FBQ3JCLENBQUMsSUFBQSxLQUFRLElBQUMsQ0FBQSxJQUFWLENBQUEsSUFBb0IsQ0FBQyxPQUFBLEtBQVcsSUFBQyxDQUFBLE9BQWI7SUFEZDs7MEJBS1Isa0JBQUEsR0FBb0IsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksb0JBQVosRUFBa0MsRUFBbEM7SUFBUjs7MEJBQ3BCLGlCQUFBLEdBQW1CLFNBQUMsRUFBRDthQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLG1CQUFaLEVBQWlDLEVBQWpDO0lBQVI7OzBCQUNuQixvQkFBQSxHQUFzQixTQUFDLEVB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QUEsT0FBRCxLQUFZLFdBQWY7WUFDRSxLQUFLLENBQUMsZ0JBQU4sQ0FBdUIsS0FBQyxDQUFBLE1BQXhCLEVBQWdDLElBQWhDLEVBREY7O0FBRUE7QUFBQSxlQUFBLHdDQUFBOztZQUFBLFNBQVMsQ0FBQyxLQUFWLENBQWdCO2NBQUEsVUFBQSxFQUFZLEtBQVo7YUFBaEI7QUFBQTtpQkFDQSxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsS0FBckI7UUFOYTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWDtJQVhjOzswQkFxQnBCLHFCQUFBLEdBQXVCLFNBQUE7QUFDckIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLE1BQUQsQ0FBUSxRQUFSLEVBQWtCLFdBQWxCLENBQUg7ZUFFRSxtRUFBeUMsQ0FBRSxXQUF2QyxDQUFBLFlBRk47T0FBQSxNQUFBO2VBSUUsQ0FBSSxJQUFDLENBQUEsUUFBUSxDQUFDLEtBQVYsQ0FBZ0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBQWhCLENBQTJDLENBQUMsV0FBNUMsQ0FBQSxFQUpOOztJQURxQjs7MEJBT3ZCLG1CQUFBLEdBQXFCLFNBQUMsS0FBRDs7UUFBQyxRQUFNOzthQUMxQixJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxNQUF6QixDQUFnQyxhQUFoQyxrQkFBK0MsUUFBUSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUF2RDtJQURtQjs7MEJBR3JCLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBekIsQ0FBa0MsYUFBbEM7SUFEVTs7Ozs7O0VBR2QsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUEvTGpCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIFJhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5tb3ZlQ3Vyc29yTGVmdCA9IG51bGxcblxuY2xhc3MgTW9kZU1hbmFnZXJcbiAgbW9kZTogJ2luc2VydCcgIyBOYXRpdmUgYXRvbSBpcyBub3QgbW9kYWwgZWRpdG9yIGFuZCBpdHMgZGVmYXVsdCBpcyAnaW5zZXJ0J1xuICBzdWJtb2RlOiBudWxsXG4gIHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbjogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcblxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG5cbiAgZGVzdHJveTogLT5cblxuICBpc01vZGU6IChtb2RlLCBzdWJtb2RlPW51bGwpIC0+XG4gICAgKG1vZGUgaXMgQG1vZGUpIGFuZCAoc3VibW9kZSBpcyBAc3VibW9kZSlcblxuICAjIEV2ZW50XG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvbldpbGxBY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ3dpbGwtYWN0aXZhdGUtbW9kZScsIGZuKVxuICBvbkRpZEFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25XaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIub24oJ3dpbGwtZGVhY3RpdmF0ZS1tb2RlJywgZm4pXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGU6IChmbikgLT4gQGVtaXR0ZXIucHJlZW1wdCgnd2lsbC1kZWFjdGl2YXRlLW1vZGUnLCBmbilcbiAgb25EaWREZWFjdGl2YXRlTW9kZTogKGZuKSAtPiBAZW1pdHRlci5vbignZGlkLWRlYWN0aXZhdGUtbW9kZScsIGZuKVxuXG4gICMgYWN0aXZhdGU6IFB1YmxpY1xuICAjICBVc2UgdGhpcyBtZXRob2QgdG8gY2hhbmdlIG1vZGUsIERPTlQgdXNlIG90aGVyIGRpcmVjdCBtZXRob2QuXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhY3RpdmF0ZTogKG5ld01vZGUsIG5ld1N1Ym1vZGU9bnVsbCkgLT5cbiAgICAjIEF2b2lkIG9kZCBzdGF0ZSg9dmlzdWFsLW1vZGUgYnV0IHNlbGVjdGlvbiBpcyBlbXB0eSlcbiAgICByZXR1cm4gaWYgKG5ld01vZGUgaXMgJ3Zpc3VhbCcpIGFuZCBAZWRpdG9yLmlzRW1wdHkoKVxuXG4gICAgQGVtaXR0ZXIuZW1pdCgnd2lsbC1hY3RpdmF0ZS1tb2RlJywgbW9kZTogbmV3TW9kZSwgc3VibW9kZTogbmV3U3VibW9kZSlcblxuICAgIGlmIChuZXdNb2RlIGlzICd2aXN1YWwnKSBhbmQgQHN1Ym1vZGU/IGFuZCAobmV3U3VibW9kZSBpcyBAc3VibW9kZSlcbiAgICAgIFtuZXdNb2RlLCBuZXdTdWJtb2RlXSA9IFsnbm9ybWFsJywgbnVsbF1cblxuICAgIEBkZWFjdGl2YXRlKCkgaWYgKG5ld01vZGUgaXNudCBAbW9kZSlcblxuICAgIEBkZWFjdGl2YXRvciA9IHN3aXRjaCBuZXdNb2RlXG4gICAgICB3aGVuICdub3JtYWwnIHRoZW4gQGFjdGl2YXRlTm9ybWFsTW9kZSgpXG4gICAgICB3aGVuICdvcGVyYXRvci1wZW5kaW5nJyB0aGVuIEBhY3RpdmF0ZU9wZXJhdG9yUGVuZGluZ01vZGUoKVxuICAgICAgd2hlbiAnaW5zZXJ0JyB0aGVuIEBhY3RpdmF0ZUluc2VydE1vZGUobmV3U3VibW9kZSlcbiAgICAgIHdoZW4gJ3Zpc3VhbCcgdGhlbiBAYWN0aXZhdGVWaXN1YWxNb2RlKG5ld1N1Ym1vZGUpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiI3tAbW9kZX0tbW9kZVwiKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQHN1Ym1vZGUpXG5cbiAgICBbQG1vZGUsIEBzdWJtb2RlXSA9IFtuZXdNb2RlLCBuZXdTdWJtb2RlXVxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEB1cGRhdGVOYXJyb3dlZFN0YXRlKClcbiAgICAgIEB2aW1TdGF0ZS51cGRhdGVQcmV2aW91c1NlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgIyBQcmV2ZW50IHN3cmFwIGZyb20gbG9hZGVkIG9uIGluaXRpYWwgbW9kZS1zZXR1cCBvbiBzdGFydHVwLlxuICAgICAgQHZpbVN0YXRlLmdldFByb3AoJ3N3cmFwJyk/LmNsZWFyUHJvcGVydGllcyhAZWRpdG9yKVxuXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIiN7QG1vZGV9LW1vZGVcIilcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKEBzdWJtb2RlKSBpZiBAc3VibW9kZT9cblxuICAgIEB2aW1TdGF0ZS5zdGF0dXNCYXJNYW5hZ2VyLnVwZGF0ZShAbW9kZSwgQHN1Ym1vZGUpXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIEB2aW1TdGF0ZS5jdXJzb3JTdHlsZU1hbmFnZXIucmVmcmVzaCgpXG4gICAgZWxzZVxuICAgICAgQHZpbVN0YXRlLmdldFByb3AoJ2N1cnNvclN0eWxlTWFuYWdlcicpPy5yZWZyZXNoKClcblxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1hY3RpdmF0ZS1tb2RlJywge0Btb2RlLCBAc3VibW9kZX0pXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICB1bmxlc3MgQGRlYWN0aXZhdG9yPy5kaXNwb3NlZFxuICAgICAgQGVtaXR0ZXIuZW1pdCgnd2lsbC1kZWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcbiAgICAgIEBkZWFjdGl2YXRvcj8uZGlzcG9zZSgpXG4gICAgICAjIFJlbW92ZSBjc3MgY2xhc3MgaGVyZSBpbi1jYXNlIEBkZWFjdGl2YXRlKCkgY2FsbGVkIHNvbGVseShvY2N1cnJlbmNlIGluIHZpc3VhbC1tb2RlKVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIiN7QG1vZGV9LW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoQHN1Ym1vZGUpXG5cbiAgICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1kZWFjdGl2YXRlLW1vZGUnLCB7QG1vZGUsIEBzdWJtb2RlfSlcblxuICAjIE5vcm1hbFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVOb3JtYWxNb2RlOiAtPlxuICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgIyBDb21wb25lbnQgaXMgbm90IG5lY2Vzc2FyeSBhdmFpYWJsZSBzZWUgIzk4LlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKGZhbHNlKVxuXG4gICAgIyBJbiB2aXN1YWwtbW9kZSwgY3Vyc29yIGNhbiBwbGFjZSBhdCBFT0wuIG1vdmUgbGVmdCBpZiBjdXJzb3IgaXMgYXQgRU9MXG4gICAgIyBXZSBzaG91bGQgbm90IGRvIHRoaXMgaW4gdmlzdWFsLW1vZGUgZGVhY3RpdmF0aW9uIHBoYXNlLlxuICAgICMgZS5nLiBgQWAgZGlyZWN0bHkgc2hpZnQgZnJvbSB2aXN1YS1tb2RlIHRvIGBpbnNlcnQtbW9kZWAsIGFuZCBjdXJzb3Igc2hvdWxkIHJlbWFpbiBhdCBFT0wuXG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKSB3aGVuIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgYW5kIG5vdCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgICAjIERvbid0IHVzZSB1dGlscyBtb3ZlQ3Vyc29yTGVmdCB0byBza2lwIHJlcXVpcmUoJy4vdXRpbHMnKSBmb3IgZmFzdGVyIHN0YXJ0dXAuXG4gICAgICB7Z29hbENvbHVtbn0gPSBjdXJzb3JcbiAgICAgIGN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICBjdXJzb3IuZ29hbENvbHVtbiA9IGdvYWxDb2x1bW4gaWYgZ29hbENvbHVtbj9cbiAgICBuZXcgRGlzcG9zYWJsZVxuXG4gICMgT3BlcmF0b3IgUGVuZGluZ1xuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYWN0aXZhdGVPcGVyYXRvclBlbmRpbmdNb2RlOiAtPlxuICAgIG5ldyBEaXNwb3NhYmxlXG5cbiAgIyBJbnNlcnRcbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFjdGl2YXRlSW5zZXJ0TW9kZTogKHN1Ym1vZGU9bnVsbCkgLT5cbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQuc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvciA9IEBhY3RpdmF0ZVJlcGxhY2VNb2RlKCkgaWYgc3VibW9kZSBpcyAncmVwbGFjZSdcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBtb3ZlQ3Vyc29yTGVmdCA/PSByZXF1aXJlKCcuL3V0aWxzJykubW92ZUN1cnNvckxlZnRcblxuICAgICAgcmVwbGFjZU1vZGVEZWFjdGl2YXRvcj8uZGlzcG9zZSgpXG4gICAgICByZXBsYWNlTW9kZURlYWN0aXZhdG9yID0gbnVsbFxuXG4gICAgICAjIFdoZW4gZXNjYXBlIGZyb20gaW5zZXJ0LW1vZGUsIGN1cnNvciBtb3ZlIExlZnQuXG4gICAgICBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZSA9IEBlZGl0b3IuaGFzQXRvbWljU29mdFRhYnMoKVxuICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgICBtb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHtuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZX0pXG5cbiAgYWN0aXZhdGVSZXBsYWNlTW9kZTogLT5cbiAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0gbmV3IFdlYWtNYXBcbiAgICBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBzdWJzLmFkZCBAZWRpdG9yLm9uV2lsbEluc2VydFRleHQgKHt0ZXh0LCBjYW5jZWx9KSA9PlxuICAgICAgY2FuY2VsKClcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgPT5cbiAgICAgICAgZm9yIGNoYXIgaW4gdGV4dC5zcGxpdCgnJykgPyBbXVxuICAgICAgICAgIGlmIChjaGFyIGlzbnQgXCJcXG5cIikgYW5kIChub3Qgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpXG4gICAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgICAgICAgIHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKVxuXG4gICAgICAgICAgdW5sZXNzIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgICAgICAgIEByZXBsYWNlZENoYXJzQnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgW10pXG4gICAgICAgICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKS5wdXNoKHNlbGVjdGVkVGV4dClcblxuICAgIHN1YnMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uID0gbnVsbFxuICAgIHN1YnNcblxuICBnZXRSZXBsYWNlZENoYXJGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKT8ucG9wKClcblxuICAjIFZpc3VhbFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBXZSB0cmVhdCBhbGwgc2VsZWN0aW9uIGlzIGluaXRpYWxseSBOT1Qgbm9ybWFsaXplZFxuICAjXG4gICMgMS4gRmlyc3Qgd2Ugbm9ybWFsaXplIHNlbGVjdGlvblxuICAjIDIuIFRoZW4gdXBkYXRlIHNlbGVjdGlvbiBvcmllbnRhdGlvbig9d2lzZSkuXG4gICNcbiAgIyBSZWdhcmRsZXNzIG9mIHNlbGVjdGlvbiBpcyBtb2RpZmllZCBieSB2bXAtY29tbWFuZCBvciBvdXRlci12bXAtY29tbWFuZCBsaWtlIGBjbWQtbGAuXG4gICMgV2hlbiBub3JtYWxpemUsIHdlIG1vdmUgY3Vyc29yIHRvIGxlZnQoc2VsZWN0TGVmdCBlcXVpdmFsZW50KS5cbiAgIyBTaW5jZSBWaW0ncyB2aXN1YWwtbW9kZSBpcyBhbHdheXMgc2VsZWN0UmlnaHRlZC5cbiAgI1xuICAjIC0gdW4tbm9ybWFsaXplZCBzZWxlY3Rpb246IFRoaXMgaXMgdGhlIHJhbmdlIHdlIHNlZSBpbiB2aXN1YWwtbW9kZS4oIFNvIG5vcm1hbCB2aXN1YWwtbW9kZSByYW5nZSBpbiB1c2VyIHBlcnNwZWN0aXZlICkuXG4gICMgLSBub3JtYWxpemVkIHNlbGVjdGlvbjogT25lIGNvbHVtbiBsZWZ0IHNlbGN0ZWQgYXQgc2VsZWN0aW9uIGVuZCBwb3NpdGlvblxuICAjIC0gV2hlbiBzZWxlY3RSaWdodCBhdCBlbmQgcG9zaXRpb24gb2Ygbm9ybWFsaXplZC1zZWxlY3Rpb24sIGl0IGJlY29tZSB1bi1ub3JtYWxpemVkIHNlbGVjdGlvblxuICAjICAgd2hpY2ggaXMgdGhlIHJhbmdlIGluIHZpc3VhbC1tb2RlLlxuICBhY3RpdmF0ZVZpc3VhbE1vZGU6IChzdWJtb2RlKSAtPlxuICAgIHN3cmFwID0gQHZpbVN0YXRlLnN3cmFwXG4gICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKSB3aGVuIG5vdCAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG5cbiAgICBzd3JhcC5ub3JtYWxpemUoQGVkaXRvcilcblxuICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKHN1Ym1vZGUpIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcblxuICAgIEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpIGlmIHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcblxuICAgIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBzd3JhcC5ub3JtYWxpemUoQGVkaXRvcilcblxuICAgICAgaWYgQHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgICAgc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZShAZWRpdG9yLCB0cnVlKVxuICAgICAgc2VsZWN0aW9uLmNsZWFyKGF1dG9zY3JvbGw6IGZhbHNlKSBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBAdXBkYXRlTmFycm93ZWRTdGF0ZShmYWxzZSlcblxuICAjIE5hcnJvdyB0byBzZWxlY3Rpb25cbiAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhhc011bHRpTGluZVNlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgICMgW0ZJWE1FXSB3aHkgSSBuZWVkIG51bGwgZ3VhcmQgaGVyZVxuICAgICAgbm90IEB2aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCk/LmlzU2luZ2xlUm93KClcbiAgICBlbHNlXG4gICAgICBub3QgQHZpbVN0YXRlLnN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5pc1NpbmdsZVJvdygpXG5cbiAgdXBkYXRlTmFycm93ZWRTdGF0ZTogKHZhbHVlPW51bGwpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtbmFycm93ZWQnLCB2YWx1ZSA/IEBoYXNNdWx0aUxpbmVTZWxlY3Rpb24oKSlcblxuICBpc05hcnJvd2VkOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnaXMtbmFycm93ZWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZGVNYW5hZ2VyXG4iXX0=
