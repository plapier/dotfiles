(function() {
  var BracketFinder, PairFinder, QuoteFinder, Range, ScopeState, TagFinder, _, collectRangeInBufferRow, getCharacterRangeInformation, getLineTextToBufferPosition, isEscapedCharRange, ref, scanEditorInDirection,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Range = require('atom').Range;

  _ = require('underscore-plus');

  ref = require('./utils'), isEscapedCharRange = ref.isEscapedCharRange, collectRangeInBufferRow = ref.collectRangeInBufferRow, scanEditorInDirection = ref.scanEditorInDirection, getLineTextToBufferPosition = ref.getLineTextToBufferPosition;

  getCharacterRangeInformation = function(editor, point, char) {
    var balanced, left, pattern, ref1, right, total;
    pattern = RegExp("" + (_.escapeRegExp(char)), "g");
    total = collectRangeInBufferRow(editor, point.row, pattern).filter(function(range) {
      return !isEscapedCharRange(editor, range);
    });
    ref1 = _.partition(total, function(arg) {
      var start;
      start = arg.start;
      return start.isLessThan(point);
    }), left = ref1[0], right = ref1[1];
    balanced = (total.length % 2) === 0;
    return {
      total: total,
      left: left,
      right: right,
      balanced: balanced
    };
  };

  ScopeState = (function() {
    function ScopeState(editor1, point) {
      this.editor = editor1;
      this.state = this.getScopeStateForBufferPosition(point);
    }

    ScopeState.prototype.getScopeStateForBufferPosition = function(point) {
      var scopes;
      scopes = this.editor.scopeDescriptorForBufferPosition(point).getScopesArray();
      return {
        inString: scopes.some(function(scope) {
          return scope.startsWith('string.');
        }),
        inComment: scopes.some(function(scope) {
          return scope.startsWith('comment.');
        }),
        inDoubleQuotes: this.isInDoubleQuotes(point)
      };
    };

    ScopeState.prototype.isInDoubleQuotes = function(point) {
      var balanced, left, ref1, total;
      ref1 = getCharacterRangeInformation(this.editor, point, '"'), total = ref1.total, left = ref1.left, balanced = ref1.balanced;
      if (total.length === 0 || !balanced) {
        return false;
      } else {
        return left.length % 2 === 1;
      }
    };

    ScopeState.prototype.isEqual = function(other) {
      return _.isEqual(this.state, other.state);
    };

    ScopeState.prototype.isInNormalCodeArea = function() {
      return !(this.state.inString || this.state.inComment || this.state.inDoubleQuotes);
    };

    return ScopeState;

  })();

  PairFinder = (function() {
    function PairFinder(editor1, options) {
      this.editor = editor1;
      if (options == null) {
        options = {};
      }
      this.allowNextLine = options.allowNextLine, this.allowForwarding = options.allowForwarding, this.pair = options.pair, this.inclusive = options.inclusive;
      if (this.inclusive == null) {
        this.inclusive = true;
      }
      if (this.pair != null) {
        this.setPatternForPair(this.pair);
      }
    }

    PairFinder.prototype.getPattern = function() {
      return this.pattern;
    };

    PairFinder.prototype.filterEvent = function() {
      return true;
    };

    PairFinder.prototype.findPair = function(which, direction, from) {
      var findingNonForwardingClosingQuote, found, scanner, stack;
      stack = [];
      found = null;
      findingNonForwardingClosingQuote = (this instanceof QuoteFinder) && which === 'close' && !this.allowForwarding;
      scanner = scanEditorInDirection.bind(null, this.editor, direction, this.getPattern(), {
        from: from,
        allowNextLine: this.allowNextLine
      });
      scanner((function(_this) {
        return function(event) {
          var eventState, range, stop;
          range = event.range, stop = event.stop;
          if (isEscapedCharRange(_this.editor, range)) {
            return;
          }
          if (!_this.filterEvent(event)) {
            return;
          }
          eventState = _this.getEventState(event);
          if (findingNonForwardingClosingQuote && eventState.state === 'open' && range.start.isGreaterThan(from)) {
            stop();
            return;
          }
          if (eventState.state !== which) {
            return stack.push(eventState);
          } else {
            if (_this.onFound(stack, {
              eventState: eventState,
              from: from
            })) {
              found = range;
              return stop();
            }
          }
        };
      })(this));
      return found;
    };

    PairFinder.prototype.spliceStack = function(stack, eventState) {
      return stack.pop();
    };

    PairFinder.prototype.onFound = function(stack, arg) {
      var eventState, from, openRange, openStart, openState;
      eventState = arg.eventState, from = arg.from;
      switch (eventState.state) {
        case 'open':
          this.spliceStack(stack, eventState);
          return stack.length === 0;
        case 'close':
          openState = this.spliceStack(stack, eventState);
          if (openState == null) {
            return this.inclusive || eventState.range.start.isGreaterThan(from);
          }
          if (stack.length === 0) {
            openRange = openState.range;
            openStart = openRange.start;
            if (this.inclusive) {
              return openStart.isEqual(from) || (this.allowForwarding && openStart.row === from.row);
            } else {
              return openStart.isLessThan(from) || (this.allowForwarding && openStart.isGreaterThan(from) && openStart.row === from.row);
            }
          }
      }
    };

    PairFinder.prototype.findCloseForward = function(from) {
      return this.findPair('close', 'forward', from);
    };

    PairFinder.prototype.findOpenBackward = function(from) {
      return this.findPair('open', 'backward', from);
    };

    PairFinder.prototype.find = function(from) {
      var closeRange, openRange;
      closeRange = this.closeRange = this.findCloseForward(from);
      if (closeRange != null) {
        openRange = this.findOpenBackward(closeRange.end);
      }
      if ((closeRange != null) && (openRange != null)) {
        return {
          aRange: new Range(openRange.start, closeRange.end),
          innerRange: new Range(openRange.end, closeRange.start),
          openRange: openRange,
          closeRange: closeRange
        };
      }
    };

    return PairFinder;

  })();

  BracketFinder = (function(superClass) {
    extend(BracketFinder, superClass);

    function BracketFinder() {
      return BracketFinder.__super__.constructor.apply(this, arguments);
    }

    BracketFinder.prototype.retry = false;

    BracketFinder.prototype.setPatternForPair = function(pair) {
      var close, open;
      open = pair[0], close = pair[1];
      return this.pattern = RegExp("(" + (_.escapeRegExp(open)) + ")|(" + (_.escapeRegExp(close)) + ")", "g");
    };

    BracketFinder.prototype.find = function(from) {
      var found, ref1;
      if (this.initialScope == null) {
        this.initialScope = new ScopeState(this.editor, from);
      }
      if (found = BracketFinder.__super__.find.apply(this, arguments)) {
        return found;
      }
      if (!this.retry) {
        this.retry = true;
        ref1 = [], this.closeRange = ref1[0], this.closeRangeScope = ref1[1];
        return this.find(from);
      }
    };

    BracketFinder.prototype.filterEvent = function(arg) {
      var range, scope;
      range = arg.range;
      scope = new ScopeState(this.editor, range.start);
      if (!this.closeRange) {
        if (!this.retry) {
          return this.initialScope.isEqual(scope);
        } else {
          if (this.initialScope.isInNormalCodeArea()) {
            return !scope.isInNormalCodeArea();
          } else {
            return scope.isInNormalCodeArea();
          }
        }
      } else {
        if (this.closeRangeScope == null) {
          this.closeRangeScope = new ScopeState(this.editor, this.closeRange.start);
        }
        return this.closeRangeScope.isEqual(scope);
      }
    };

    BracketFinder.prototype.getEventState = function(arg) {
      var match, range, state;
      match = arg.match, range = arg.range;
      state = (function() {
        switch (false) {
          case !match[1]:
            return 'open';
          case !match[2]:
            return 'close';
        }
      })();
      return {
        state: state,
        range: range
      };
    };

    return BracketFinder;

  })(PairFinder);

  QuoteFinder = (function(superClass) {
    extend(QuoteFinder, superClass);

    function QuoteFinder() {
      return QuoteFinder.__super__.constructor.apply(this, arguments);
    }

    QuoteFinder.prototype.setPatternForPair = function(pair) {
      this.quoteChar = pair[0];
      return this.pattern = RegExp("(" + (_.escapeRegExp(pair[0])) + ")", "g");
    };

    QuoteFinder.prototype.find = function(from) {
      var balanced, left, nextQuoteIsOpen, onQuoteChar, ref1, ref2, right, total;
      ref1 = getCharacterRangeInformation(this.editor, from, this.quoteChar), total = ref1.total, left = ref1.left, right = ref1.right, balanced = ref1.balanced;
      onQuoteChar = (ref2 = right[0]) != null ? ref2.start.isEqual(from) : void 0;
      if (balanced && onQuoteChar) {
        nextQuoteIsOpen = left.length % 2 === 0;
      } else {
        nextQuoteIsOpen = left.length === 0;
      }
      if (nextQuoteIsOpen) {
        this.pairStates = ['open', 'close', 'close', 'open'];
      } else {
        this.pairStates = ['close', 'close', 'open'];
      }
      return QuoteFinder.__super__.find.apply(this, arguments);
    };

    QuoteFinder.prototype.getEventState = function(arg) {
      var range, state;
      range = arg.range;
      state = this.pairStates.shift();
      return {
        state: state,
        range: range
      };
    };

    return QuoteFinder;

  })(PairFinder);

  TagFinder = (function(superClass) {
    extend(TagFinder, superClass);

    function TagFinder() {
      return TagFinder.__super__.constructor.apply(this, arguments);
    }

    TagFinder.prototype.pattern = /<(\/?)([^\s>]+)[^>]*>/g;

    TagFinder.prototype.lineTextToPointContainsNonWhiteSpace = function(point) {
      return /\S/.test(getLineTextToBufferPosition(this.editor, point));
    };

    TagFinder.prototype.find = function(from) {
      var found, tagStart;
      found = TagFinder.__super__.find.apply(this, arguments);
      if ((found != null) && this.allowForwarding) {
        tagStart = found.aRange.start;
        if (tagStart.isGreaterThan(from) && this.lineTextToPointContainsNonWhiteSpace(tagStart)) {
          this.allowForwarding = false;
          return this.find(from);
        }
      }
      return found;
    };

    TagFinder.prototype.getEventState = function(event) {
      var backslash;
      backslash = event.match[1];
      return {
        state: backslash === '' ? 'open' : 'close',
        name: event.match[2],
        range: event.range
      };
    };

    TagFinder.prototype.findPairState = function(stack, arg) {
      var i, name, state;
      name = arg.name;
      for (i = stack.length - 1; i >= 0; i += -1) {
        state = stack[i];
        if (state.name === name) {
          return state;
        }
      }
    };

    TagFinder.prototype.spliceStack = function(stack, eventState) {
      var pairEventState;
      if (pairEventState = this.findPairState(stack, eventState)) {
        stack.splice(stack.indexOf(pairEventState));
      }
      return pairEventState;
    };

    return TagFinder;

  })(PairFinder);

  module.exports = {
    BracketFinder: BracketFinder,
    QuoteFinder: QuoteFinder,
    TagFinder: TagFinder
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9wYWlyLWZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJNQUFBO0lBQUE7OztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1YsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUtJLE9BQUEsQ0FBUSxTQUFSLENBTEosRUFDRSwyQ0FERixFQUVFLHFEQUZGLEVBR0UsaURBSEYsRUFJRTs7RUFHRiw0QkFBQSxHQUErQixTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLElBQWhCO0FBQzdCLFFBQUE7SUFBQSxPQUFBLEdBQVUsTUFBQSxDQUFBLEVBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZixDQUFELENBQUosRUFBNkIsR0FBN0I7SUFDVixLQUFBLEdBQVEsdUJBQUEsQ0FBd0IsTUFBeEIsRUFBZ0MsS0FBSyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLENBQW1ELENBQUMsTUFBcEQsQ0FBMkQsU0FBQyxLQUFEO2FBQ2pFLENBQUksa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsS0FBM0I7SUFENkQsQ0FBM0Q7SUFFUixPQUFnQixDQUFDLENBQUMsU0FBRixDQUFZLEtBQVosRUFBbUIsU0FBQyxHQUFEO0FBQWEsVUFBQTtNQUFYLFFBQUQ7YUFBWSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtJQUFiLENBQW5CLENBQWhCLEVBQUMsY0FBRCxFQUFPO0lBQ1AsUUFBQSxHQUFXLENBQUMsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFoQixDQUFBLEtBQXNCO1dBQ2pDO01BQUMsT0FBQSxLQUFEO01BQVEsTUFBQSxJQUFSO01BQWMsT0FBQSxLQUFkO01BQXFCLFVBQUEsUUFBckI7O0VBTjZCOztFQVF6QjtJQUNTLG9CQUFDLE9BQUQsRUFBVSxLQUFWO01B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Q0FBQyxLQUFNLENBQUEsQ0FBQTthQUN4QjtRQUNFLEtBQUEsRUFBVyxTQUFBLEtBQWEsRUFBakIsR0FBMEIsTUFBMUIsR0FBc0MsT0FEL0M7UUFFRSxJQUFBLEVBQU0sS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBRnBCO1FBR0UsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQUhmOztJQUZhOzt3QkFRZixhQUFBLEdBQWUsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUNiLFVBQUE7TUFEc0IsT0FBRDtBQUNyQixXQUFBLHFDQUFBOztZQUE4QixLQUFLLENBQUMsSUFBTixLQUFjO0FBQzFDLGlCQUFPOztBQURUO0lBRGE7O3dCQUlmLFdBQUEsR0FBYSxTQUFDLEtBQUQsRUFBUSxVQUFSO0FBQ1gsVUFBQTtNQUFBLElBQUcsY0FBQSxHQUFpQixJQUFDLENBQUEsYUFBRCxDQUFlLEtBQWYsRUFBc0IsVUFBdEIsQ0FBcEI7UUFDRSxLQUFLLENBQUMsTUFBTixDQUFhLEtBQUssQ0FBQyxPQUFOLENBQWMsY0FBZCxDQUFiLEVBREY7O2FBRUE7SUFIVzs7OztLQTdCUzs7RUFrQ3hCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsZUFBQSxhQURlO0lBRWYsYUFBQSxXQUZlO0lBR2YsV0FBQSxTQUhlOztBQS9OakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57XG4gIGlzRXNjYXBlZENoYXJSYW5nZVxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xuICBzY2FuRWRpdG9ySW5EaXJlY3Rpb25cbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uXG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuZ2V0Q2hhcmFjdGVyUmFuZ2VJbmZvcm1hdGlvbiA9IChlZGl0b3IsIHBvaW50LCBjaGFyKSAtPlxuICBwYXR0ZXJuID0gLy8vI3tfLmVzY2FwZVJlZ0V4cChjaGFyKX0vLy9nXG4gIHRvdGFsID0gY29sbGVjdFJhbmdlSW5CdWZmZXJSb3coZWRpdG9yLCBwb2ludC5yb3csIHBhdHRlcm4pLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgbm90IGlzRXNjYXBlZENoYXJSYW5nZShlZGl0b3IsIHJhbmdlKVxuICBbbGVmdCwgcmlnaHRdID0gXy5wYXJ0aXRpb24odG90YWwsICh7c3RhcnR9KSAtPiBzdGFydC5pc0xlc3NUaGFuKHBvaW50KSlcbiAgYmFsYW5jZWQgPSAodG90YWwubGVuZ3RoICUgMikgaXMgMFxuICB7dG90YWwsIGxlZnQsIHJpZ2h0LCBiYWxhbmNlZH1cblxuY2xhc3MgU2NvcGVTdGF0ZVxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIHBvaW50KSAtPlxuICAgIEBzdGF0ZSA9IEBnZXRTY29wZVN0YXRlRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0U2NvcGVTdGF0ZUZvckJ1ZmZlclBvc2l0aW9uOiAocG9pbnQpIC0+XG4gICAgc2NvcGVzID0gQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihwb2ludCkuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIHtcbiAgICAgIGluU3RyaW5nOiBzY29wZXMuc29tZSAoc2NvcGUpIC0+IHNjb3BlLnN0YXJ0c1dpdGgoJ3N0cmluZy4nKVxuICAgICAgaW5Db21tZW50OiBzY29wZXMuc29tZSAoc2NvcGUpIC0+IHNjb3BlLnN0YXJ0c1dpdGgoJ2NvbW1lbnQuJylcbiAgICAgIGluRG91YmxlUXVvdGVzOiBAaXNJbkRvdWJsZVF1b3Rlcyhwb2ludClcbiAgICB9XG5cbiAgaXNJbkRvdWJsZVF1b3RlczogKHBvaW50KSAtPlxuICAgIHt0b3RhbCwgbGVmdCwgYmFsYW5jZWR9ID0gZ2V0Q2hhcmFjdGVyUmFuZ2VJbmZvcm1hdGlvbihAZWRpdG9yLCBwb2ludCwgJ1wiJylcbiAgICBpZiB0b3RhbC5sZW5ndGggaXMgMCBvciBub3QgYmFsYW5jZWRcbiAgICAgIGZhbHNlXG4gICAgZWxzZVxuICAgICAgbGVmdC5sZW5ndGggJSAyIGlzIDFcblxuICBpc0VxdWFsOiAob3RoZXIpIC0+XG4gICAgXy5pc0VxdWFsKEBzdGF0ZSwgb3RoZXIuc3RhdGUpXG5cbiAgaXNJbk5vcm1hbENvZGVBcmVhOiAtPlxuICAgIG5vdCAoQHN0YXRlLmluU3RyaW5nIG9yIEBzdGF0ZS5pbkNvbW1lbnQgb3IgQHN0YXRlLmluRG91YmxlUXVvdGVzKVxuXG5jbGFzcyBQYWlyRmluZGVyXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgb3B0aW9ucz17fSkgLT5cbiAgICB7QGFsbG93TmV4dExpbmUsIEBhbGxvd0ZvcndhcmRpbmcsIEBwYWlyLCBAaW5jbHVzaXZlfSA9IG9wdGlvbnNcbiAgICBAaW5jbHVzaXZlID89IHRydWVcbiAgICBpZiBAcGFpcj9cbiAgICAgIEBzZXRQYXR0ZXJuRm9yUGFpcihAcGFpcilcblxuICBnZXRQYXR0ZXJuOiAtPlxuICAgIEBwYXR0ZXJuXG5cbiAgZmlsdGVyRXZlbnQ6IC0+XG4gICAgdHJ1ZVxuXG4gIGZpbmRQYWlyOiAod2hpY2gsIGRpcmVjdGlvbiwgZnJvbSkgLT5cbiAgICBzdGFjayA9IFtdXG4gICAgZm91bmQgPSBudWxsXG5cbiAgICAjIFF1b3RlIGlzIG5vdCBuZXN0YWJsZS4gU28gd2hlbiB3ZSBlbmNvdW50ZXIgJ29wZW4nIHdoaWxlIGZpbmRpbmcgJ2Nsb3NlJyxcbiAgICAjIGl0IGlzIGZvcndhcmRpbmcgcGFpciwgc28gc3RvcHBhYmxlIHVubGVzcyBAYWxsb3dGb3J3YXJkaW5nXG4gICAgZmluZGluZ05vbkZvcndhcmRpbmdDbG9zaW5nUXVvdGUgPSAodGhpcyBpbnN0YW5jZW9mIFF1b3RlRmluZGVyKSBhbmQgd2hpY2ggaXMgJ2Nsb3NlJyBhbmQgbm90IEBhbGxvd0ZvcndhcmRpbmdcbiAgICBzY2FubmVyID0gc2NhbkVkaXRvckluRGlyZWN0aW9uLmJpbmQobnVsbCwgQGVkaXRvciwgZGlyZWN0aW9uLCBAZ2V0UGF0dGVybigpLCB7ZnJvbSwgQGFsbG93TmV4dExpbmV9KVxuICAgIHNjYW5uZXIgKGV2ZW50KSA9PlxuICAgICAge3JhbmdlLCBzdG9wfSA9IGV2ZW50XG5cbiAgICAgIHJldHVybiBpZiBpc0VzY2FwZWRDaGFyUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG4gICAgICByZXR1cm4gdW5sZXNzIEBmaWx0ZXJFdmVudChldmVudClcblxuICAgICAgZXZlbnRTdGF0ZSA9IEBnZXRFdmVudFN0YXRlKGV2ZW50KVxuXG4gICAgICBpZiBmaW5kaW5nTm9uRm9yd2FyZGluZ0Nsb3NpbmdRdW90ZSBhbmQgZXZlbnRTdGF0ZS5zdGF0ZSBpcyAnb3BlbicgYW5kIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSlcbiAgICAgICAgc3RvcCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBldmVudFN0YXRlLnN0YXRlIGlzbnQgd2hpY2hcbiAgICAgICAgc3RhY2sucHVzaChldmVudFN0YXRlKVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAb25Gb3VuZChzdGFjaywge2V2ZW50U3RhdGUsIGZyb219KVxuICAgICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgICBzdG9wKClcblxuICAgIHJldHVybiBmb3VuZFxuXG4gIHNwbGljZVN0YWNrOiAoc3RhY2ssIGV2ZW50U3RhdGUpIC0+XG4gICAgc3RhY2sucG9wKClcblxuICBvbkZvdW5kOiAoc3RhY2ssIHtldmVudFN0YXRlLCBmcm9tfSkgLT5cbiAgICBzd2l0Y2ggZXZlbnRTdGF0ZS5zdGF0ZVxuICAgICAgd2hlbiAnb3BlbidcbiAgICAgICAgQHNwbGljZVN0YWNrKHN0YWNrLCBldmVudFN0YXRlKVxuICAgICAgICBzdGFjay5sZW5ndGggaXMgMFxuICAgICAgd2hlbiAnY2xvc2UnXG4gICAgICAgIG9wZW5TdGF0ZSA9IEBzcGxpY2VTdGFjayhzdGFjaywgZXZlbnRTdGF0ZSlcbiAgICAgICAgdW5sZXNzIG9wZW5TdGF0ZT9cbiAgICAgICAgICByZXR1cm4gQGluY2x1c2l2ZSBvciBldmVudFN0YXRlLnJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSlcblxuICAgICAgICBpZiBzdGFjay5sZW5ndGggaXMgMFxuICAgICAgICAgIG9wZW5SYW5nZSA9IG9wZW5TdGF0ZS5yYW5nZVxuICAgICAgICAgIG9wZW5TdGFydCA9IG9wZW5SYW5nZS5zdGFydFxuICAgICAgICAgIGlmIEBpbmNsdXNpdmVcbiAgICAgICAgICAgIG9wZW5TdGFydC5pc0VxdWFsKGZyb20pIG9yIChAYWxsb3dGb3J3YXJkaW5nIGFuZCBvcGVuU3RhcnQucm93IGlzIGZyb20ucm93KVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIG9wZW5TdGFydC5pc0xlc3NUaGFuKGZyb20pIG9yIChAYWxsb3dGb3J3YXJkaW5nIGFuZCBvcGVuU3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKSBhbmQgb3BlblN0YXJ0LnJvdyBpcyBmcm9tLnJvdylcblxuICBmaW5kQ2xvc2VGb3J3YXJkOiAoZnJvbSkgLT5cbiAgICBAZmluZFBhaXIoJ2Nsb3NlJywgJ2ZvcndhcmQnLCBmcm9tKVxuXG4gIGZpbmRPcGVuQmFja3dhcmQ6IChmcm9tKSAtPlxuICAgIEBmaW5kUGFpcignb3BlbicsICdiYWNrd2FyZCcsIGZyb20pXG5cbiAgZmluZDogKGZyb20pIC0+XG4gICAgY2xvc2VSYW5nZSA9IEBjbG9zZVJhbmdlID0gQGZpbmRDbG9zZUZvcndhcmQoZnJvbSlcbiAgICBvcGVuUmFuZ2UgPSBAZmluZE9wZW5CYWNrd2FyZChjbG9zZVJhbmdlLmVuZCkgaWYgY2xvc2VSYW5nZT9cblxuICAgIGlmIGNsb3NlUmFuZ2U/IGFuZCBvcGVuUmFuZ2U/XG4gICAgICB7XG4gICAgICAgIGFSYW5nZTogbmV3IFJhbmdlKG9wZW5SYW5nZS5zdGFydCwgY2xvc2VSYW5nZS5lbmQpXG4gICAgICAgIGlubmVyUmFuZ2U6IG5ldyBSYW5nZShvcGVuUmFuZ2UuZW5kLCBjbG9zZVJhbmdlLnN0YXJ0KVxuICAgICAgICBvcGVuUmFuZ2U6IG9wZW5SYW5nZVxuICAgICAgICBjbG9zZVJhbmdlOiBjbG9zZVJhbmdlXG4gICAgICB9XG5cbmNsYXNzIEJyYWNrZXRGaW5kZXIgZXh0ZW5kcyBQYWlyRmluZGVyXG4gIHJldHJ5OiBmYWxzZVxuXG4gIHNldFBhdHRlcm5Gb3JQYWlyOiAocGFpcikgLT5cbiAgICBbb3BlbiwgY2xvc2VdID0gcGFpclxuICAgIEBwYXR0ZXJuID0gLy8vKCN7Xy5lc2NhcGVSZWdFeHAob3Blbil9KXwoI3tfLmVzY2FwZVJlZ0V4cChjbG9zZSl9KS8vL2dcblxuICAjIFRoaXMgbWV0aG9kIGNhbiBiZSBjYWxsZWQgcmVjdXJzaXZlbHlcbiAgZmluZDogKGZyb20pIC0+XG4gICAgQGluaXRpYWxTY29wZSA/PSBuZXcgU2NvcGVTdGF0ZShAZWRpdG9yLCBmcm9tKVxuXG4gICAgcmV0dXJuIGZvdW5kIGlmIGZvdW5kID0gc3VwZXJcblxuICAgIGlmIG5vdCBAcmV0cnlcbiAgICAgIEByZXRyeSA9IHRydWVcbiAgICAgIFtAY2xvc2VSYW5nZSwgQGNsb3NlUmFuZ2VTY29wZV0gPSBbXVxuICAgICAgQGZpbmQoZnJvbSlcblxuICBmaWx0ZXJFdmVudDogKHtyYW5nZX0pIC0+XG4gICAgc2NvcGUgPSBuZXcgU2NvcGVTdGF0ZShAZWRpdG9yLCByYW5nZS5zdGFydClcbiAgICBpZiBub3QgQGNsb3NlUmFuZ2VcbiAgICAgICMgTm93IGZpbmRpbmcgY2xvc2VSYW5nZVxuICAgICAgaWYgbm90IEByZXRyeVxuICAgICAgICBAaW5pdGlhbFNjb3BlLmlzRXF1YWwoc2NvcGUpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIEBpbml0aWFsU2NvcGUuaXNJbk5vcm1hbENvZGVBcmVhKClcbiAgICAgICAgICBub3Qgc2NvcGUuaXNJbk5vcm1hbENvZGVBcmVhKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNjb3BlLmlzSW5Ob3JtYWxDb2RlQXJlYSgpXG4gICAgZWxzZVxuICAgICAgIyBOb3cgZmluZGluZyBvcGVuUmFuZ2U6IHNlYXJjaCBmcm9tIHNhbWUgc2NvcGVcbiAgICAgIEBjbG9zZVJhbmdlU2NvcGUgPz0gbmV3IFNjb3BlU3RhdGUoQGVkaXRvciwgQGNsb3NlUmFuZ2Uuc3RhcnQpXG4gICAgICBAY2xvc2VSYW5nZVNjb3BlLmlzRXF1YWwoc2NvcGUpXG5cbiAgZ2V0RXZlbnRTdGF0ZTogKHttYXRjaCwgcmFuZ2V9KSAtPlxuICAgIHN0YXRlID0gc3dpdGNoXG4gICAgICB3aGVuIG1hdGNoWzFdIHRoZW4gJ29wZW4nXG4gICAgICB3aGVuIG1hdGNoWzJdIHRoZW4gJ2Nsb3NlJ1xuICAgIHtzdGF0ZSwgcmFuZ2V9XG5cbmNsYXNzIFF1b3RlRmluZGVyIGV4dGVuZHMgUGFpckZpbmRlclxuICBzZXRQYXR0ZXJuRm9yUGFpcjogKHBhaXIpIC0+XG4gICAgQHF1b3RlQ2hhciA9IHBhaXJbMF1cbiAgICBAcGF0dGVybiA9IC8vLygje18uZXNjYXBlUmVnRXhwKHBhaXJbMF0pfSkvLy9nXG5cbiAgZmluZDogKGZyb20pIC0+XG4gICAgIyBIQUNLOiBDYW50IGRldGVybWluZSBvcGVuL2Nsb3NlIGZyb20gcXVvdGUgY2hhciBpdHNlbGZcbiAgICAjIFNvIHByZXNldCBvcGVuL2Nsb3NlIHN0YXRlIHRvIGdldCBkZXNpYWJsZSByZXN1bHQuXG4gICAge3RvdGFsLCBsZWZ0LCByaWdodCwgYmFsYW5jZWR9ID0gZ2V0Q2hhcmFjdGVyUmFuZ2VJbmZvcm1hdGlvbihAZWRpdG9yLCBmcm9tLCBAcXVvdGVDaGFyKVxuICAgIG9uUXVvdGVDaGFyID0gcmlnaHRbMF0/LnN0YXJ0LmlzRXF1YWwoZnJvbSkgIyBmcm9tIHBvaW50IGlzIG9uIHF1b3RlIGNoYXJcbiAgICBpZiBiYWxhbmNlZCBhbmQgb25RdW90ZUNoYXJcbiAgICAgIG5leHRRdW90ZUlzT3BlbiA9IGxlZnQubGVuZ3RoICUgMiBpcyAwXG4gICAgZWxzZVxuICAgICAgbmV4dFF1b3RlSXNPcGVuID0gbGVmdC5sZW5ndGggaXMgMFxuXG4gICAgaWYgbmV4dFF1b3RlSXNPcGVuXG4gICAgICBAcGFpclN0YXRlcyA9IFsnb3BlbicsICdjbG9zZScsICdjbG9zZScsICdvcGVuJ11cbiAgICBlbHNlXG4gICAgICBAcGFpclN0YXRlcyA9IFsnY2xvc2UnLCAnY2xvc2UnLCAnb3BlbiddXG5cbiAgICBzdXBlclxuXG4gIGdldEV2ZW50U3RhdGU6ICh7cmFuZ2V9KSAtPlxuICAgIHN0YXRlID0gQHBhaXJTdGF0ZXMuc2hpZnQoKVxuICAgIHtzdGF0ZSwgcmFuZ2V9XG5cbmNsYXNzIFRhZ0ZpbmRlciBleHRlbmRzIFBhaXJGaW5kZXJcbiAgcGF0dGVybjogLzwoXFwvPykoW15cXHM+XSspW14+XSo+L2dcblxuICBsaW5lVGV4dFRvUG9pbnRDb250YWluc05vbldoaXRlU3BhY2U6IChwb2ludCkgLT5cbiAgICAvXFxTLy50ZXN0KGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBwb2ludCkpXG5cbiAgZmluZDogKGZyb20pIC0+XG4gICAgZm91bmQgPSBzdXBlclxuICAgIGlmIGZvdW5kPyBhbmQgQGFsbG93Rm9yd2FyZGluZ1xuICAgICAgdGFnU3RhcnQgPSBmb3VuZC5hUmFuZ2Uuc3RhcnRcbiAgICAgIGlmIHRhZ1N0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSkgYW5kIEBsaW5lVGV4dFRvUG9pbnRDb250YWluc05vbldoaXRlU3BhY2UodGFnU3RhcnQpXG4gICAgICAgICMgV2UgZm91bmQgcmFuZ2UgYnV0IGFsc28gZm91bmQgdGhhdCB3ZSBhcmUgSU4gYW5vdGhlciB0YWcsXG4gICAgICAgICMgc28gd2lsbCByZXRyeSBieSBleGNsdWRpbmcgZm9yd2FyZGluZyByYW5nZS5cbiAgICAgICAgQGFsbG93Rm9yd2FyZGluZyA9IGZhbHNlXG4gICAgICAgIHJldHVybiBAZmluZChmcm9tKSAjIHJldHJ5XG4gICAgZm91bmRcblxuICBnZXRFdmVudFN0YXRlOiAoZXZlbnQpIC0+XG4gICAgYmFja3NsYXNoID0gZXZlbnQubWF0Y2hbMV1cbiAgICB7XG4gICAgICBzdGF0ZTogaWYgKGJhY2tzbGFzaCBpcyAnJykgdGhlbiAnb3BlbicgZWxzZSAnY2xvc2UnXG4gICAgICBuYW1lOiBldmVudC5tYXRjaFsyXVxuICAgICAgcmFuZ2U6IGV2ZW50LnJhbmdlXG4gICAgfVxuXG4gIGZpbmRQYWlyU3RhdGU6IChzdGFjaywge25hbWV9KSAtPlxuICAgIGZvciBzdGF0ZSBpbiBzdGFjayBieSAtMSB3aGVuIHN0YXRlLm5hbWUgaXMgbmFtZVxuICAgICAgcmV0dXJuIHN0YXRlXG5cbiAgc3BsaWNlU3RhY2s6IChzdGFjaywgZXZlbnRTdGF0ZSkgLT5cbiAgICBpZiBwYWlyRXZlbnRTdGF0ZSA9IEBmaW5kUGFpclN0YXRlKHN0YWNrLCBldmVudFN0YXRlKVxuICAgICAgc3RhY2suc3BsaWNlKHN0YWNrLmluZGV4T2YocGFpckV2ZW50U3RhdGUpKVxuICAgIHBhaXJFdmVudFN0YXRlXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBCcmFja2V0RmluZGVyXG4gIFF1b3RlRmluZGVyXG4gIFRhZ0ZpbmRlclxufVxuIl19
