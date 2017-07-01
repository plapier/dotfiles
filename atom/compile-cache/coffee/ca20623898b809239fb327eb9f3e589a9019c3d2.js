(function() {
  var Base, CompositeDisposable, Disposable, MoveToRelativeLine, OperationAbortedError, OperationStack, Select, ref, ref1;

  ref = require('atom'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  ref1 = [], OperationAbortedError = ref1[0], Select = ref1[1], MoveToRelativeLine = ref1[2];

  OperationStack = (function() {
    Object.defineProperty(OperationStack.prototype, 'mode', {
      get: function() {
        return this.modeManager.mode;
      }
    });

    Object.defineProperty(OperationStack.prototype, 'submode', {
      get: function() {
        return this.modeManager.submode;
      }
    });

    function OperationStack(vimState) {
      var ref2;
      this.vimState = vimState;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement, this.modeManager = ref2.modeManager, this.swrap = ref2.swrap;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.reset();
    }

    OperationStack.prototype.subscribe = function(handler) {
      this.operationSubscriptions.add(handler);
      return handler;
    };

    OperationStack.prototype.reset = function() {
      var ref2;
      this.resetCount();
      this.stack = [];
      this.processing = false;
      this.vimState.emitDidResetOperationStack();
      if ((ref2 = this.operationSubscriptions) != null) {
        ref2.dispose();
      }
      return this.operationSubscriptions = new CompositeDisposable;
    };

    OperationStack.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      if ((ref2 = this.operationSubscriptions) != null) {
        ref2.dispose();
      }
      return ref3 = {}, this.stack = ref3.stack, this.operationSubscriptions = ref3.operationSubscriptions, ref3;
    };

    OperationStack.prototype.peekTop = function() {
      return this.stack[this.stack.length - 1];
    };

    OperationStack.prototype.isEmpty = function() {
      return this.stack.length === 0;
    };

    OperationStack.prototype.newMoveToRelativeLine = function() {
      if (MoveToRelativeLine == null) {
        MoveToRelativeLine = Base.getClass('MoveToRelativeLine');
      }
      return new MoveToRelativeLine(this.vimState);
    };

    OperationStack.prototype.newSelectWithTarget = function(target) {
      if (Select == null) {
        Select = Base.getClass('Select');
      }
      return new Select(this.vimState).setTarget(target);
    };

    OperationStack.prototype.run = function(klass, properties) {
      var $selection, error, i, len, operation, ref2, ref3, type;
      if (this.mode === 'visual') {
        ref2 = this.swrap.getSelections(this.editor);
        for (i = 0, len = ref2.length; i < len; i++) {
          $selection = ref2[i];
          if (!$selection.hasProperties()) {
            $selection.saveProperties();
          }
        }
      }
      try {
        if (this.isEmpty()) {
          this.vimState.init();
        }
        type = typeof klass;
        if (type === 'object') {
          operation = klass;
        } else {
          if (type === 'string') {
            klass = Base.getClass(klass);
          }
          if (((ref3 = this.peekTop()) != null ? ref3.constructor : void 0) === klass) {
            operation = this.newMoveToRelativeLine();
          } else {
            operation = new klass(this.vimState, properties);
          }
        }
        switch (false) {
          case !this.isEmpty():
            if ((this.mode === 'visual' && operation.isMotion()) || operation.isTextObject()) {
              operation = this.newSelectWithTarget(operation);
            }
            this.stack.push(operation);
            return this.process();
          case !(this.peekTop().isOperator() && (operation.isMotion() || operation.isTextObject())):
            this.stack.push(operation);
            return this.process();
          default:
            this.vimState.emitDidFailToPushToOperationStack();
            return this.vimState.resetNormalMode();
        }
      } catch (error1) {
        error = error1;
        return this.handleError(error);
      }
    };

    OperationStack.prototype.runRecorded = function() {
      var count, operation, ref2;
      if (operation = this.recordedOperation) {
        operation.repeated = true;
        if (this.hasCount()) {
          count = this.getCount();
          operation.count = count;
          if ((ref2 = operation.target) != null) {
            ref2.count = count;
          }
        }
        operation.subscribeResetOccurrencePatternIfNeeded();
        return this.run(operation);
      }
    };

    OperationStack.prototype.runRecordedMotion = function(key, arg) {
      var operation, reverse;
      reverse = (arg != null ? arg : {}).reverse;
      if (!(operation = this.vimState.globalState.get(key))) {
        return;
      }
      operation = operation.clone(this.vimState);
      operation.repeated = true;
      operation.resetCount();
      if (reverse) {
        operation.backwards = !operation.backwards;
      }
      return this.run(operation);
    };

    OperationStack.prototype.runCurrentFind = function(options) {
      return this.runRecordedMotion('currentFind', options);
    };

    OperationStack.prototype.runCurrentSearch = function(options) {
      return this.runRecordedMotion('currentSearch', options);
    };

    OperationStack.prototype.handleError = function(error) {
      this.vimState.reset();
      if (OperationAbortedError == null) {
        OperationAbortedError = require('./errors');
      }
      if (!(error instanceof OperationAbortedError)) {
        throw error;
      }
    };

    OperationStack.prototype.isProcessing = function() {
      return this.processing;
    };

    OperationStack.prototype.process = function() {
      var base, commandName, operation, top;
      this.processing = true;
      if (this.stack.length === 2) {
        if (!this.peekTop().isComplete()) {
          return;
        }
        operation = this.stack.pop();
        this.peekTop().setTarget(operation);
      }
      top = this.peekTop();
      if (top.isComplete()) {
        return this.execute(this.stack.pop());
      } else {
        if (this.mode === 'normal' && top.isOperator()) {
          this.modeManager.activate('operator-pending');
        }
        if (commandName = typeof (base = top.constructor).getCommandNameWithoutPrefix === "function" ? base.getCommandNameWithoutPrefix() : void 0) {
          return this.addToClassList(commandName + "-pending");
        }
      }
    };

    OperationStack.prototype.execute = function(operation) {
      var execution;
      execution = operation.execute();
      if (execution instanceof Promise) {
        return execution.then((function(_this) {
          return function() {
            return _this.finish(operation);
          };
        })(this))["catch"]((function(_this) {
          return function() {
            return _this.handleError();
          };
        })(this));
      } else {
        return this.finish(operation);
      }
    };

    OperationStack.prototype.cancel = function() {
      var ref2;
      if ((ref2 = this.mode) !== 'visual' && ref2 !== 'insert') {
        this.vimState.resetNormalMode();
        this.vimState.restoreOriginalCursorPosition();
      }
      return this.finish();
    };

    OperationStack.prototype.finish = function(operation) {
      if (operation == null) {
        operation = null;
      }
      if (operation != null ? operation.recordable : void 0) {
        this.recordedOperation = operation;
      }
      this.vimState.emitDidFinishOperation();
      if (operation != null ? operation.isOperator() : void 0) {
        operation.resetState();
      }
      if (this.mode === 'normal') {
        this.ensureAllSelectionsAreEmpty(operation);
        this.ensureAllCursorsAreNotAtEndOfLine();
      } else if (this.mode === 'visual') {
        this.modeManager.updateNarrowedState();
        this.vimState.updatePreviousSelection();
      }
      this.vimState.cursorStyleManager.refresh();
      return this.vimState.reset();
    };

    OperationStack.prototype.ensureAllSelectionsAreEmpty = function(operation) {
      this.vimState.clearBlockwiseSelections();
      if (this.vimState.haveSomeNonEmptySelection()) {
        if (this.vimState.getConfig('strictAssertion')) {
          this.vimState.utils.assertWithException(false, "Have some non-empty selection in normal-mode: " + (operation.toString()));
        }
        return this.vimState.clearSelections();
      }
    };

    OperationStack.prototype.ensureAllCursorsAreNotAtEndOfLine = function() {
      var cursor, i, len, ref2, results;
      ref2 = this.editor.getCursors();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        if (cursor.isAtEndOfLine()) {
          results.push(this.vimState.utils.moveCursorLeft(cursor, {
            preserveGoalColumn: true
          }));
        }
      }
      return results;
    };

    OperationStack.prototype.addToClassList = function(className) {
      this.editorElement.classList.add(className);
      return this.subscribe(new Disposable((function(_this) {
        return function() {
          return _this.editorElement.classList.remove(className);
        };
      })(this)));
    };

    OperationStack.prototype.hasCount = function() {
      return (this.count['normal'] != null) || (this.count['operator-pending'] != null);
    };

    OperationStack.prototype.getCount = function() {
      var ref2, ref3;
      if (this.hasCount()) {
        return ((ref2 = this.count['normal']) != null ? ref2 : 1) * ((ref3 = this.count['operator-pending']) != null ? ref3 : 1);
      } else {
        return null;
      }
    };

    OperationStack.prototype.setCount = function(number) {
      var base, mode;
      mode = 'normal';
      if (this.mode === 'operator-pending') {
        mode = this.mode;
      }
      if ((base = this.count)[mode] == null) {
        base[mode] = 0;
      }
      this.count[mode] = (this.count[mode] * 10) + number;
      this.vimState.hover.set(this.buildCountString());
      return this.editorElement.classList.toggle('with-count', true);
    };

    OperationStack.prototype.buildCountString = function() {
      return [this.count['normal'], this.count['operator-pending']].filter(function(count) {
        return count != null;
      }).map(function(count) {
        return String(count);
      }).join('x');
    };

    OperationStack.prototype.resetCount = function() {
      this.count = {};
      return this.editorElement.classList.remove('with-count');
    };

    return OperationStack;

  })();

  module.exports = OperationStack;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRpb24tc3RhY2suY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsTUFBUixDQUFwQyxFQUFDLDJCQUFELEVBQWE7O0VBQ2IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUVQLE9BQXNELEVBQXRELEVBQUMsK0JBQUQsRUFBd0IsZ0JBQXhCLEVBQWdDOztFQVkxQjtJQUNKLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxNQUFsQyxFQUEwQztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQztNQUFoQixDQUFMO0tBQTFDOztJQUNBLE1BQU0sQ0FBQyxjQUFQLENBQXNCLGNBQUMsQ0FBQSxTQUF2QixFQUFrQyxTQUFsQyxFQUE2QztNQUFBLEdBQUEsRUFBSyxTQUFBO2VBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQztNQUFoQixDQUFMO0tBQTdDOztJQUVhLHdCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUFrRCxJQUFDLENBQUEsUUFBbkQsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBLGFBQVgsRUFBMEIsSUFBQyxDQUFBLG1CQUFBLFdBQTNCLEVBQXdDLElBQUMsQ0FBQSxhQUFBO01BRXpDLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQXZCLENBQW5CO01BRUEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQU5XOzs2QkFTYixT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QU8sS0FBUDtNQUFYLENBRlAsQ0FHRSxDQUFDLElBSEgsQ0FHUSxHQUhSO0lBRGdCOzs2QkFNbEIsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsS0FBRCxHQUFTO2FBQ1QsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsWUFBaEM7SUFGVTs7Ozs7O0VBSWQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFqUGpCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5cbltPcGVyYXRpb25BYm9ydGVkRXJyb3IsIFNlbGVjdCwgTW92ZVRvUmVsYXRpdmVMaW5lXSA9IFtdXG5cbiMgb3ByYXRpb24gbGlmZSBpbiBvcGVyYXRpb25TdGFja1xuIyAxLiBydW5cbiMgICAgaW5zdGFudGlhdGVkIGJ5IG5ldy5cbiMgICAgY29tcGxpbWVudCBpbXBsaWNpdCBPcGVyYXRvci5TZWxlY3Qgb3BlcmF0b3IgaWYgbmVjZXNzYXJ5LlxuIyAgICBwdXNoIG9wZXJhdGlvbiB0byBzdGFjay5cbiMgMi4gcHJvY2Vzc1xuIyAgICByZWR1Y2Ugc3RhY2sgYnksIHBvcHBpbmcgdG9wIG9mIHN0YWNrIHRoZW4gc2V0IGl0IGFzIHRhcmdldCBvZiBuZXcgdG9wLlxuIyAgICBjaGVjayBpZiByZW1haW5pbmcgdG9wIG9mIHN0YWNrIGlzIGV4ZWN1dGFibGUgYnkgY2FsbGluZyBpc0NvbXBsZXRlKClcbiMgICAgaWYgZXhlY3V0YWJsZSwgdGhlbiBwb3Agc3RhY2sgdGhlbiBleGVjdXRlKHBvcHBlZE9wZXJhdGlvbilcbiMgICAgaWYgbm90IGV4ZWN1dGFibGUsIGVudGVyIFwib3BlcmF0b3ItcGVuZGluZy1tb2RlXCJcbmNsYXNzIE9wZXJhdGlvblN0YWNrXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBAcHJvdG90eXBlLCAnbW9kZScsIGdldDogLT4gQG1vZGVNYW5hZ2VyLm1vZGVcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEBwcm90b3R5cGUsICdzdWJtb2RlJywgZ2V0OiAtPiBAbW9kZU1hbmFnZXIuc3VibW9kZVxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudCwgQG1vZGVNYW5hZ2VyLCBAc3dyYXB9ID0gQHZpbVN0YXRlXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIEByZXNldCgpXG5cbiAgIyBSZXR1cm4gaGFuZGxlclxuICBzdWJzY3JpYmU6IChoYW5kbGVyKSAtPlxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zLmFkZChoYW5kbGVyKVxuICAgIHJldHVybiBoYW5kbGVyICMgRE9OVCBSRU1PVkVcblxuICByZXNldDogLT5cbiAgICBAcmVzZXRDb3VudCgpXG4gICAgQHN0YWNrID0gW11cbiAgICBAcHJvY2Vzc2luZyA9IGZhbHNlXG5cbiAgICAjIHRoaXMgaGFzIHRvIGJlIEJFRk9SRSBAb3BlcmF0aW9uU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAdmltU3RhdGUuZW1pdERpZFJlc2V0T3BlcmF0aW9uU3RhY2soKVxuXG4gICAgQG9wZXJhdGlvblN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBkZXN0cm95OiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBvcGVyYXRpb25TdWJzY3JpcHRpb25zPy5kaXNwb3NlKClcbiAgICB7QHN0YWNrLCBAb3BlcmF0aW9uU3Vic2NyaXB0aW9uc30gPSB7fVxuXG4gIHBlZWtUb3A6IC0+XG4gICAgQHN0YWNrW0BzdGFjay5sZW5ndGggLSAxXVxuXG4gIGlzRW1wdHk6IC0+XG4gICAgQHN0YWNrLmxlbmd0aCBpcyAwXG5cbiAgbmV3TW92ZVRvUmVsYXRpdmVMaW5lOiAtPlxuICAgIE1vdmVUb1JlbGF0aXZlTGluZSA/PSBCYXNlLmdldENsYXNzKCdNb3ZlVG9SZWxhdGl2ZUxpbmUnKVxuICAgIG5ldyBNb3ZlVG9SZWxhdGl2ZUxpbmUoQHZpbVN0YXRlKVxuXG4gIG5ld1NlbGVjdFdpdGhUYXJnZXQ6ICh0YXJnZXQpIC0+XG4gICAgU2VsZWN0ID89IEJhc2UuZ2V0Q2xhc3MoJ1NlbGVjdCcpXG4gICAgbmV3IFNlbGVjdChAdmltU3RhdGUpLnNldFRhcmdldCh0YXJnZXQpXG5cbiAgIyBNYWluXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBydW46IChrbGFzcywgcHJvcGVydGllcykgLT5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcikgd2hlbiBub3QgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG5cbiAgICB0cnlcbiAgICAgIEB2aW1TdGF0ZS5pbml0KCkgaWYgQGlzRW1wdHkoKVxuICAgICAgdHlwZSA9IHR5cGVvZihrbGFzcylcbiAgICAgIGlmIHR5cGUgaXMgJ29iamVjdCcgIyAuIHJlcGVhdCBjYXNlIHdlIGNhbiBleGVjdXRlIGFzLWl0LWlzLlxuICAgICAgICBvcGVyYXRpb24gPSBrbGFzc1xuICAgICAgZWxzZVxuICAgICAgICBrbGFzcyA9IEJhc2UuZ2V0Q2xhc3Moa2xhc3MpIGlmIHR5cGUgaXMgJ3N0cmluZydcblxuICAgICAgICAjIFJlcGxhY2Ugb3BlcmF0b3Igd2hlbiBpZGVudGljYWwgb25lIHJlcGVhdGVkLCBlLmcuIGBkZGAsIGBjY2AsIGBnVWdVYFxuICAgICAgICBpZiBAcGVla1RvcCgpPy5jb25zdHJ1Y3RvciBpcyBrbGFzc1xuICAgICAgICAgIG9wZXJhdGlvbiA9IEBuZXdNb3ZlVG9SZWxhdGl2ZUxpbmUoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3BlcmF0aW9uID0gbmV3IGtsYXNzKEB2aW1TdGF0ZSwgcHJvcGVydGllcylcblxuICAgICAgc3dpdGNoXG4gICAgICAgIHdoZW4gQGlzRW1wdHkoKVxuICAgICAgICAgIGlmIChAbW9kZSBpcyAndmlzdWFsJyBhbmQgb3BlcmF0aW9uLmlzTW90aW9uKCkpIG9yIG9wZXJhdGlvbi5pc1RleHRPYmplY3QoKVxuICAgICAgICAgICAgb3BlcmF0aW9uID0gQG5ld1NlbGVjdFdpdGhUYXJnZXQob3BlcmF0aW9uKVxuICAgICAgICAgIEBzdGFjay5wdXNoKG9wZXJhdGlvbilcbiAgICAgICAgICBAcHJvY2VzcygpXG4gICAgICAgIHdoZW4gQHBlZWtUb3AoKS5pc09wZXJhdG9yKCkgYW5kIChvcGVyYXRpb24uaXNNb3Rpb24oKSBvciBvcGVyYXRpb24uaXNUZXh0T2JqZWN0KCkpXG4gICAgICAgICAgQHN0YWNrLnB1c2gob3BlcmF0aW9uKVxuICAgICAgICAgIEBwcm9jZXNzKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmFpbFRvUHVzaFRvT3BlcmF0aW9uU3RhY2soKVxuICAgICAgICAgIEB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBAaGFuZGxlRXJyb3IoZXJyb3IpXG5cbiAgcnVuUmVjb3JkZWQ6IC0+XG4gICAgaWYgb3BlcmF0aW9uID0gQHJlY29yZGVkT3BlcmF0aW9uXG4gICAgICBvcGVyYXRpb24ucmVwZWF0ZWQgPSB0cnVlXG4gICAgICBpZiBAaGFzQ291bnQoKVxuICAgICAgICBjb3VudCA9IEBnZXRDb3VudCgpXG4gICAgICAgIG9wZXJhdGlvbi5jb3VudCA9IGNvdW50XG4gICAgICAgIG9wZXJhdGlvbi50YXJnZXQ/LmNvdW50ID0gY291bnQgIyBTb21lIG9wZWFydG9yIGhhdmUgbm8gdGFyZ2V0IGxpa2UgY3RybC1hKGluY3JlYXNlKS5cblxuICAgICAgb3BlcmF0aW9uLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG4gICAgICBAcnVuKG9wZXJhdGlvbilcblxuICBydW5SZWNvcmRlZE1vdGlvbjogKGtleSwge3JldmVyc2V9PXt9KSAtPlxuICAgIHJldHVybiB1bmxlc3Mgb3BlcmF0aW9uID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChrZXkpXG5cbiAgICBvcGVyYXRpb24gPSBvcGVyYXRpb24uY2xvbmUoQHZpbVN0YXRlKVxuICAgIG9wZXJhdGlvbi5yZXBlYXRlZCA9IHRydWVcbiAgICBvcGVyYXRpb24ucmVzZXRDb3VudCgpXG4gICAgaWYgcmV2ZXJzZVxuICAgICAgb3BlcmF0aW9uLmJhY2t3YXJkcyA9IG5vdCBvcGVyYXRpb24uYmFja3dhcmRzXG4gICAgQHJ1bihvcGVyYXRpb24pXG5cbiAgcnVuQ3VycmVudEZpbmQ6IChvcHRpb25zKSAtPlxuICAgIEBydW5SZWNvcmRlZE1vdGlvbignY3VycmVudEZpbmQnLCBvcHRpb25zKVxuXG4gIHJ1bkN1cnJlbnRTZWFyY2g6IChvcHRpb25zKSAtPlxuICAgIEBydW5SZWNvcmRlZE1vdGlvbignY3VycmVudFNlYXJjaCcsIG9wdGlvbnMpXG5cbiAgaGFuZGxlRXJyb3I6IChlcnJvcikgLT5cbiAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgIE9wZXJhdGlvbkFib3J0ZWRFcnJvciA/PSByZXF1aXJlICcuL2Vycm9ycydcbiAgICB1bmxlc3MgZXJyb3IgaW5zdGFuY2VvZiBPcGVyYXRpb25BYm9ydGVkRXJyb3JcbiAgICAgIHRocm93IGVycm9yXG5cbiAgaXNQcm9jZXNzaW5nOiAtPlxuICAgIEBwcm9jZXNzaW5nXG5cbiAgcHJvY2VzczogLT5cbiAgICBAcHJvY2Vzc2luZyA9IHRydWVcbiAgICBpZiBAc3RhY2subGVuZ3RoIGlzIDJcbiAgICAgICMgW0ZJWE1FIGlkZWFsbHldXG4gICAgICAjIElmIHRhcmdldCBpcyBub3QgY29tcGxldGUsIHdlIHBvc3Rwb25lIGNvbXBvc2luZyB0YXJnZXQgd2l0aCBvcGVyYXRvciB0byBrZWVwIHNpdHVhdGlvbiBzaW1wbGUuXG4gICAgICAjIFNvIHRoYXQgd2UgY2FuIGFzc3VtZSB3aGVuIHRhcmdldCBpcyBzZXQgdG8gb3BlcmF0b3IgaXQncyBjb21wbGV0ZS5cbiAgICAgICMgZS5nLiBgeSBzIHQgYScoc3Vycm91bmQgZm9yIHJhbmdlIGZyb20gaGVyZSB0byB0aWxsIGEpXG4gICAgICByZXR1cm4gdW5sZXNzIEBwZWVrVG9wKCkuaXNDb21wbGV0ZSgpXG5cbiAgICAgIG9wZXJhdGlvbiA9IEBzdGFjay5wb3AoKVxuICAgICAgQHBlZWtUb3AoKS5zZXRUYXJnZXQob3BlcmF0aW9uKVxuXG4gICAgdG9wID0gQHBlZWtUb3AoKVxuXG4gICAgaWYgdG9wLmlzQ29tcGxldGUoKVxuICAgICAgQGV4ZWN1dGUoQHN0YWNrLnBvcCgpKVxuICAgIGVsc2VcbiAgICAgIGlmIEBtb2RlIGlzICdub3JtYWwnIGFuZCB0b3AuaXNPcGVyYXRvcigpXG4gICAgICAgIEBtb2RlTWFuYWdlci5hY3RpdmF0ZSgnb3BlcmF0b3ItcGVuZGluZycpXG5cbiAgICAgICMgVGVtcG9yYXJ5IHNldCB3aGlsZSBjb21tYW5kIGlzIHJ1bm5pbmdcbiAgICAgIGlmIGNvbW1hbmROYW1lID0gdG9wLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeD8oKVxuICAgICAgICBAYWRkVG9DbGFzc0xpc3QoY29tbWFuZE5hbWUgKyBcIi1wZW5kaW5nXCIpXG5cbiAgZXhlY3V0ZTogKG9wZXJhdGlvbikgLT5cbiAgICBleGVjdXRpb24gPSBvcGVyYXRpb24uZXhlY3V0ZSgpXG4gICAgaWYgZXhlY3V0aW9uIGluc3RhbmNlb2YgUHJvbWlzZVxuICAgICAgZXhlY3V0aW9uXG4gICAgICAgIC50aGVuID0+IEBmaW5pc2gob3BlcmF0aW9uKVxuICAgICAgICAuY2F0Y2ggPT4gQGhhbmRsZUVycm9yKClcbiAgICBlbHNlXG4gICAgICBAZmluaXNoKG9wZXJhdGlvbilcblxuICBjYW5jZWw6IC0+XG4gICAgaWYgQG1vZGUgbm90IGluIFsndmlzdWFsJywgJ2luc2VydCddXG4gICAgICBAdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICAgIEB2aW1TdGF0ZS5yZXN0b3JlT3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpXG4gICAgQGZpbmlzaCgpXG5cbiAgZmluaXNoOiAob3BlcmF0aW9uPW51bGwpIC0+XG4gICAgQHJlY29yZGVkT3BlcmF0aW9uID0gb3BlcmF0aW9uIGlmIG9wZXJhdGlvbj8ucmVjb3JkYWJsZVxuICAgIEB2aW1TdGF0ZS5lbWl0RGlkRmluaXNoT3BlcmF0aW9uKClcbiAgICBpZiBvcGVyYXRpb24/LmlzT3BlcmF0b3IoKVxuICAgICAgb3BlcmF0aW9uLnJlc2V0U3RhdGUoKVxuXG4gICAgaWYgQG1vZGUgaXMgJ25vcm1hbCdcbiAgICAgIEBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHkob3BlcmF0aW9uKVxuICAgICAgQGVuc3VyZUFsbEN1cnNvcnNBcmVOb3RBdEVuZE9mTGluZSgpXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQG1vZGVNYW5hZ2VyLnVwZGF0ZU5hcnJvd2VkU3RhdGUoKVxuICAgICAgQHZpbVN0YXRlLnVwZGF0ZVByZXZpb3VzU2VsZWN0aW9uKClcblxuICAgIEB2aW1TdGF0ZS5jdXJzb3JTdHlsZU1hbmFnZXIucmVmcmVzaCgpXG4gICAgQHZpbVN0YXRlLnJlc2V0KClcblxuICBlbnN1cmVBbGxTZWxlY3Rpb25zQXJlRW1wdHk6IChvcGVyYXRpb24pIC0+XG4gICAgIyBXaGVuIEB2aW1TdGF0ZS5zZWxlY3RCbG9ja3dpc2UoKSBpcyBjYWxsZWQgaW4gbm9uLXZpc3VhbC1tb2RlLlxuICAgICMgZS5nLiBgLmAgcmVwZWF0IG9mIG9wZXJhdGlvbiB0YXJnZXRlZCBibG9ja3dpc2UgYEN1cnJlbnRTZWxlY3Rpb25gLlxuICAgICMgV2UgbmVlZCB0byBtYW51YWxseSBjbGVhciBibG9ja3dpc2VTZWxlY3Rpb24uXG4gICAgIyBTZWUgIzY0N1xuICAgIEB2aW1TdGF0ZS5jbGVhckJsb2Nrd2lzZVNlbGVjdGlvbnMoKSAjIEZJWE1FLCBzaG91bGQgYmUgcmVtb3ZlZFxuICAgIGlmIEB2aW1TdGF0ZS5oYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uKClcbiAgICAgIGlmIEB2aW1TdGF0ZS5nZXRDb25maWcoJ3N0cmljdEFzc2VydGlvbicpXG4gICAgICAgIEB2aW1TdGF0ZS51dGlscy5hc3NlcnRXaXRoRXhjZXB0aW9uKGZhbHNlLCBcIkhhdmUgc29tZSBub24tZW1wdHkgc2VsZWN0aW9uIGluIG5vcm1hbC1tb2RlOiAje29wZXJhdGlvbi50b1N0cmluZygpfVwiKVxuICAgICAgQHZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG5cbiAgZW5zdXJlQWxsQ3Vyc29yc0FyZU5vdEF0RW5kT2ZMaW5lOiAtPlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkgd2hlbiBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgICBAdmltU3RhdGUudXRpbHMubW92ZUN1cnNvckxlZnQoY3Vyc29yLCBwcmVzZXJ2ZUdvYWxDb2x1bW46IHRydWUpXG5cbiAgYWRkVG9DbGFzc0xpc3Q6IChjbGFzc05hbWUpIC0+XG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpXG4gICAgQHN1YnNjcmliZSBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpXG5cbiAgIyBDb3VudFxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBrZXlzdHJva2UgYDNkMndgIGRlbGV0ZSA2KDMqMikgd29yZHMuXG4gICMgIDJuZCBudW1iZXIoMiBpbiB0aGlzIGNhc2UpIGlzIGFsd2F5cyBlbnRlcmQgaW4gb3BlcmF0b3ItcGVuZGluZy1tb2RlLlxuICAjICBTbyBjb3VudCBoYXZlIHR3byB0aW1pbmcgdG8gYmUgZW50ZXJlZC4gdGhhdCdzIHdoeSBoZXJlIHdlIG1hbmFnZSBjb3VudGVyIGJ5IG1vZGUuXG4gIGhhc0NvdW50OiAtPlxuICAgIEBjb3VudFsnbm9ybWFsJ10/IG9yIEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddP1xuXG4gIGdldENvdW50OiAtPlxuICAgIGlmIEBoYXNDb3VudCgpXG4gICAgICAoQGNvdW50Wydub3JtYWwnXSA/IDEpICogKEBjb3VudFsnb3BlcmF0b3ItcGVuZGluZyddID8gMSlcbiAgICBlbHNlXG4gICAgICBudWxsXG5cbiAgc2V0Q291bnQ6IChudW1iZXIpIC0+XG4gICAgbW9kZSA9ICdub3JtYWwnXG4gICAgbW9kZSA9IEBtb2RlIGlmIEBtb2RlIGlzICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgIEBjb3VudFttb2RlXSA/PSAwXG4gICAgQGNvdW50W21vZGVdID0gKEBjb3VudFttb2RlXSAqIDEwKSArIG51bWJlclxuICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoQGJ1aWxkQ291bnRTdHJpbmcoKSlcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCd3aXRoLWNvdW50JywgdHJ1ZSlcblxuICBidWlsZENvdW50U3RyaW5nOiAtPlxuICAgIFtAY291bnRbJ25vcm1hbCddLCBAY291bnRbJ29wZXJhdG9yLXBlbmRpbmcnXV1cbiAgICAgIC5maWx0ZXIgKGNvdW50KSAtPiBjb3VudD9cbiAgICAgIC5tYXAgKGNvdW50KSAtPiBTdHJpbmcoY291bnQpXG4gICAgICAuam9pbigneCcpXG5cbiAgcmVzZXRDb3VudDogLT5cbiAgICBAY291bnQgPSB7fVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3dpdGgtY291bnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wZXJhdGlvblN0YWNrXG4iXX0=
