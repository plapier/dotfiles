(function() {
  var CompositeDisposable, Emitter, SearchModel, addCurrentClassForDecoration, getIndex, getVisibleBufferRange, hoverCounterTimeoutID, ref, ref1, removeCurrentClassForDecoration, replaceDecorationClassBy, smartScrollToBufferPosition;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getVisibleBufferRange = ref1.getVisibleBufferRange, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, getIndex = ref1.getIndex, replaceDecorationClassBy = ref1.replaceDecorationClassBy;

  hoverCounterTimeoutID = null;

  removeCurrentClassForDecoration = null;

  addCurrentClassForDecoration = null;

  module.exports = SearchModel = (function() {
    SearchModel.prototype.relativeIndex = 0;

    SearchModel.prototype.lastRelativeIndex = null;

    SearchModel.prototype.onDidChangeCurrentMatch = function(fn) {
      return this.emitter.on('did-change-current-match', fn);
    };

    function SearchModel(vimState, options) {
      var ref2;
      this.vimState = vimState;
      this.options = options;
      this.emitter = new Emitter;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.editorElement.onDidChangeScrollTop(this.refreshMarkers.bind(this)));
      this.disposables.add(this.editorElement.onDidChangeScrollLeft(this.refreshMarkers.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.decoationByRange = {};
      this.onDidChangeCurrentMatch((function(_this) {
        return function() {
          var classList, point, text, timeout;
          _this.vimState.hoverSearchCounter.reset();
          if (_this.currentMatch == null) {
            if (_this.vimState.getConfig('flashScreenOnSearchHasNoMatch')) {
              _this.vimState.flash(getVisibleBufferRange(_this.editor), {
                type: 'screen'
              });
              atom.beep();
            }
            return;
          }
          if (_this.vimState.getConfig('showHoverSearchCounter')) {
            text = String(_this.currentMatchIndex + 1) + '/' + _this.matches.length;
            point = _this.currentMatch.start;
            classList = _this.classNamesForRange(_this.currentMatch);
            _this.resetHover();
            _this.vimState.hoverSearchCounter.set(text, point, {
              classList: classList
            });
            if (!_this.options.incrementalSearch) {
              timeout = _this.vimState.getConfig('showHoverSearchCounterDuration');
              hoverCounterTimeoutID = setTimeout(_this.resetHover.bind(_this), timeout);
            }
          }
          _this.editor.unfoldBufferRow(_this.currentMatch.start.row);
          smartScrollToBufferPosition(_this.editor, _this.currentMatch.start);
          if (_this.vimState.getConfig('flashOnSearch')) {
            return _this.vimState.flash(_this.currentMatch, {
              type: 'search'
            });
          }
        };
      })(this));
    }

    SearchModel.prototype.resetHover = function() {
      var ref2;
      if (hoverCounterTimeoutID != null) {
        clearTimeout(hoverCounterTimeoutID);
        hoverCounterTimeoutID = null;
      }
      return (ref2 = this.vimState.hoverSearchCounter) != null ? ref2.reset() : void 0;
    };

    SearchModel.prototype.destroy = function() {
      this.markerLayer.destroy();
      this.disposables.dispose();
      return this.decoationByRange = null;
    };

    SearchModel.prototype.clearMarkers = function() {
      this.markerLayer.clear();
      return this.decoationByRange = {};
    };

    SearchModel.prototype.classNamesForRange = function(range) {
      var classNames;
      classNames = [];
      if (range === this.firstMatch) {
        classNames.push('first');
      } else if (range === this.lastMatch) {
        classNames.push('last');
      }
      if (range === this.currentMatch) {
        classNames.push('current');
      }
      return classNames;
    };

    SearchModel.prototype.refreshMarkers = function() {
      var i, len, range, ref2, results;
      this.clearMarkers();
      ref2 = this.getVisibleMatchRanges();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        range = ref2[i];
        if (!range.isEmpty()) {
          results.push(this.decoationByRange[range.toString()] = this.decorateRange(range));
        }
      }
      return results;
    };

    SearchModel.prototype.getVisibleMatchRanges = function() {
      var visibleMatchRanges, visibleRange;
      visibleRange = getVisibleBufferRange(this.editor);
      return visibleMatchRanges = this.matches.filter(function(range) {
        return range.intersectsWith(visibleRange);
      });
    };

    SearchModel.prototype.decorateRange = function(range) {
      var classNames, ref2;
      classNames = this.classNamesForRange(range);
      classNames = (ref2 = ['vim-mode-plus-search-match']).concat.apply(ref2, classNames);
      return this.editor.decorateMarker(this.markerLayer.markBufferRange(range), {
        type: 'highlight',
        "class": classNames.join(' ')
      });
    };

    SearchModel.prototype.search = function(fromPoint, pattern, relativeIndex) {
      var currentMatch, i, j, len, range, ref2, ref3, ref4;
      this.pattern = pattern;
      this.matches = [];
      this.editor.scan(this.pattern, (function(_this) {
        return function(arg) {
          var range;
          range = arg.range;
          return _this.matches.push(range);
        };
      })(this));
      ref2 = this.matches, this.firstMatch = ref2[0], this.lastMatch = ref2[ref2.length - 1];
      currentMatch = null;
      if (relativeIndex >= 0) {
        ref3 = this.matches;
        for (i = 0, len = ref3.length; i < len; i++) {
          range = ref3[i];
          if (!(range.start.isGreaterThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.firstMatch;
        }
        relativeIndex--;
      } else {
        ref4 = this.matches;
        for (j = ref4.length - 1; j >= 0; j += -1) {
          range = ref4[j];
          if (!(range.start.isLessThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.lastMatch;
        }
        relativeIndex++;
      }
      this.currentMatchIndex = this.matches.indexOf(currentMatch);
      this.updateCurrentMatch(relativeIndex);
      if (this.options.incrementalSearch) {
        this.refreshMarkers();
      }
      this.initialCurrentMatchIndex = this.currentMatchIndex;
      return this.currentMatch;
    };

    SearchModel.prototype.updateCurrentMatch = function(relativeIndex) {
      this.currentMatchIndex = getIndex(this.currentMatchIndex + relativeIndex, this.matches);
      this.currentMatch = this.matches[this.currentMatchIndex];
      return this.emitter.emit('did-change-current-match');
    };

    SearchModel.prototype.visit = function(relativeIndex) {
      var newDecoration, oldDecoration, ref2;
      if (relativeIndex == null) {
        relativeIndex = null;
      }
      if (relativeIndex != null) {
        this.lastRelativeIndex = relativeIndex;
      } else {
        relativeIndex = (ref2 = this.lastRelativeIndex) != null ? ref2 : +1;
      }
      if (!this.matches.length) {
        return;
      }
      oldDecoration = this.decoationByRange[this.currentMatch.toString()];
      this.updateCurrentMatch(relativeIndex);
      newDecoration = this.decoationByRange[this.currentMatch.toString()];
      if (removeCurrentClassForDecoration == null) {
        removeCurrentClassForDecoration = replaceDecorationClassBy.bind(null, function(text) {
          return text.replace(/\s+current(\s+)?$/, '$1');
        });
      }
      if (addCurrentClassForDecoration == null) {
        addCurrentClassForDecoration = replaceDecorationClassBy.bind(null, function(text) {
          return text.replace(/\s+current(\s+)?$/, '$1') + ' current';
        });
      }
      if (oldDecoration != null) {
        removeCurrentClassForDecoration(oldDecoration);
      }
      if (newDecoration != null) {
        return addCurrentClassForDecoration(newDecoration);
      }
    };

    SearchModel.prototype.getRelativeIndex = function() {
      return this.currentMatchIndex - this.initialCurrentMatchIndex;
    };

    return SearchModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWFyY2gtbW9kZWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLHFCQUFELEVBQVU7O0VBQ1YsT0FLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0Usa0RBREYsRUFFRSw4REFGRixFQUdFLHdCQUhGLEVBSUU7O0VBR0YscUJBQUEsR0FBd0I7O0VBQ3hCLCtCQUFBLEdBQWtDOztFQUNsQyw0QkFBQSxHQUErQjs7RUFFL0IsTUFBTSxDQUFDLE9BQVAsR0FDTTswQkFDSixhQUFBLEdBQWU7OzBCQUNmLGlCQUFBLEdBQW1COzswQkFDbkIsdUJBQUEsR0FBeUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksMEJBQVosRUFBd0MsRUFBeEM7SUFBUjs7SUFFWixxQkFBQyxRQUFELEVBQVksT0FBWjtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUFXLElBQUMsQ0FBQSxVQUFEO01BQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUE7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxhQUFhLENBQUMsb0JBQWYsQ0FBb0MsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQUFwQyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsYUFBYSxDQUFDLHFCQUFmLENBQXFDLElBQUMsQ0FBQSxjQUFjLENBQUMs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QkF1QlAsZ0JBQUEsR0FBa0IsU0FBQTthQUNoQixJQUFDLENBQUEsaUJBQUQsR0FBcUIsSUFBQyxDQUFBO0lBRE47Ozs7O0FBN0pwQiIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57XG4gIGdldFZpc2libGVCdWZmZXJSYW5nZVxuICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0SW5kZXhcbiAgcmVwbGFjZURlY29yYXRpb25DbGFzc0J5XG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuaG92ZXJDb3VudGVyVGltZW91dElEID0gbnVsbFxucmVtb3ZlQ3VycmVudENsYXNzRm9yRGVjb3JhdGlvbiA9IG51bGxcbmFkZEN1cnJlbnRDbGFzc0ZvckRlY29yYXRpb24gPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlYXJjaE1vZGVsXG4gIHJlbGF0aXZlSW5kZXg6IDBcbiAgbGFzdFJlbGF0aXZlSW5kZXg6IG51bGxcbiAgb25EaWRDaGFuZ2VDdXJyZW50TWF0Y2g6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtY3VycmVudC1tYXRjaCcsIGZuXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUsIEBvcHRpb25zKSAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AoQHJlZnJlc2hNYXJrZXJzLmJpbmQodGhpcykpKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KEByZWZyZXNoTWFya2Vycy5iaW5kKHRoaXMpKSlcbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAZGVjb2F0aW9uQnlSYW5nZSA9IHt9XG5cbiAgICBAb25EaWRDaGFuZ2VDdXJyZW50TWF0Y2ggPT5cbiAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgICAgdW5sZXNzIEBjdXJyZW50TWF0Y2g/XG4gICAgICAgIGlmIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2ZsYXNoU2NyZWVuT25TZWFyY2hIYXNOb01hdGNoJylcbiAgICAgICAgICBAdmltU3RhdGUuZmxhc2goZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlKEBlZGl0b3IpLCB0eXBlOiAnc2NyZWVuJylcbiAgICAgICAgICBhdG9tLmJlZXAoKVxuICAgICAgICByZXR1cm5cblxuICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnc2hvd0hvdmVyU2VhcmNoQ291bnRlcicpXG4gICAgICAgIHRleHQgPSBTdHJpbmcoQGN1cnJlbnRNYXRjaEluZGV4ICsgMSkgKyAnLycgKyBAbWF0Y2hlcy5sZW5ndGhcbiAgICAgICAgcG9pbnQgPSBAY3VycmVudE1hdGNoLnN0YXJ0XG4gICAgICAgIGNsYXNzTGlzdCA9IEBjbGFzc05hbWVzRm9yUmFuZ2UoQGN1cnJlbnRNYXRjaClcblxuICAgICAgICBAcmVzZXRIb3ZlcigpXG4gICAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIuc2V0KHRleHQsIHBvaW50LCB7Y2xhc3NMaXN0fSlcblxuICAgICAgICB1bmxlc3MgQG9wdGlvbnMuaW5jcmVtZW50YWxTZWFyY2hcbiAgICAgICAgICB0aW1lb3V0ID0gQHZpbVN0YXRlLmdldENvbmZpZygnc2hvd0hvdmVyU2VhcmNoQ291bnRlckR1cmF0aW9uJylcbiAgICAgICAgICBob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBzZXRUaW1lb3V0KEByZXNldEhvdmVyLmJpbmQodGhpcyksIHRpbWVvdXQpXG5cbiAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KEBjdXJyZW50TWF0Y2guc3RhcnQucm93KVxuICAgICAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIEBjdXJyZW50TWF0Y2guc3RhcnQpXG5cbiAgICAgIGlmIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2ZsYXNoT25TZWFyY2gnKVxuICAgICAgICBAdmltU3RhdGUuZmxhc2goQGN1cnJlbnRNYXRjaCwgdHlwZTogJ3NlYXJjaCcpXG5cbiAgcmVzZXRIb3ZlcjogLT5cbiAgICBpZiBob3ZlckNvdW50ZXJUaW1lb3V0SUQ/XG4gICAgICBjbGVhclRpbWVvdXQoaG92ZXJDb3VudGVyVGltZW91dElEKVxuICAgICAgaG92ZXJDb3VudGVyVGltZW91dElEID0gbnVsbFxuICAgICMgU2VlICM2NzRcbiAgICAjIFRoaXMgbWV0aG9kIGNhbGxlZCB3aXRoIHNldFRpbWVvdXRcbiAgICAjIGhvdmVyU2VhcmNoQ291bnRlciBtaWdodCBub3QgYmUgYXZhaWxhYmxlIHdoZW4gZWRpdG9yIGRlc3Ryb3llZC5cbiAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyPy5yZXNldCgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICAgIEBkZWNvYXRpb25CeVJhbmdlID0gbnVsbFxuXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuICAgIEBkZWNvYXRpb25CeVJhbmdlID0ge31cblxuICBjbGFzc05hbWVzRm9yUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBjbGFzc05hbWVzID0gW11cbiAgICBpZiByYW5nZSBpcyBAZmlyc3RNYXRjaFxuICAgICAgY2xhc3NOYW1lcy5wdXNoKCdmaXJzdCcpXG4gICAgZWxzZSBpZiByYW5nZSBpcyBAbGFzdE1hdGNoXG4gICAgICBjbGFzc05hbWVzLnB1c2goJ2xhc3QnKVxuXG4gICAgaWYgcmFuZ2UgaXMgQGN1cnJlbnRNYXRjaFxuICAgICAgY2xhc3NOYW1lcy5wdXNoKCdjdXJyZW50JylcblxuICAgIGNsYXNzTmFtZXNcblxuICByZWZyZXNoTWFya2VyczogLT5cbiAgICBAY2xlYXJNYXJrZXJzKClcbiAgICBmb3IgcmFuZ2UgaW4gQGdldFZpc2libGVNYXRjaFJhbmdlcygpIHdoZW4gbm90IHJhbmdlLmlzRW1wdHkoKVxuICAgICAgQGRlY29hdGlvbkJ5UmFuZ2VbcmFuZ2UudG9TdHJpbmcoKV0gPSBAZGVjb3JhdGVSYW5nZShyYW5nZSlcblxuICBnZXRWaXNpYmxlTWF0Y2hSYW5nZXM6IC0+XG4gICAgdmlzaWJsZVJhbmdlID0gZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlKEBlZGl0b3IpXG4gICAgdmlzaWJsZU1hdGNoUmFuZ2VzID0gQG1hdGNoZXMuZmlsdGVyIChyYW5nZSkgLT5cbiAgICAgIHJhbmdlLmludGVyc2VjdHNXaXRoKHZpc2libGVSYW5nZSlcblxuICBkZWNvcmF0ZVJhbmdlOiAocmFuZ2UpIC0+XG4gICAgY2xhc3NOYW1lcyA9IEBjbGFzc05hbWVzRm9yUmFuZ2UocmFuZ2UpXG4gICAgY2xhc3NOYW1lcyA9IFsndmltLW1vZGUtcGx1cy1zZWFyY2gtbWF0Y2gnXS5jb25jYXQoY2xhc3NOYW1lcy4uLilcbiAgICBAZWRpdG9yLmRlY29yYXRlTWFya2VyIEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UpLFxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiBjbGFzc05hbWVzLmpvaW4oJyAnKVxuXG4gIHNlYXJjaDogKGZyb21Qb2ludCwgQHBhdHRlcm4sIHJlbGF0aXZlSW5kZXgpIC0+XG4gICAgQG1hdGNoZXMgPSBbXVxuICAgIEBlZGl0b3Iuc2NhbiBAcGF0dGVybiwgKHtyYW5nZX0pID0+XG4gICAgICBAbWF0Y2hlcy5wdXNoKHJhbmdlKVxuXG4gICAgW0BmaXJzdE1hdGNoLCAuLi4sIEBsYXN0TWF0Y2hdID0gQG1hdGNoZXNcblxuICAgIGN1cnJlbnRNYXRjaCA9IG51bGxcbiAgICBpZiByZWxhdGl2ZUluZGV4ID49IDBcbiAgICAgIGZvciByYW5nZSBpbiBAbWF0Y2hlcyB3aGVuIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgICAgICBjdXJyZW50TWF0Y2ggPSByYW5nZVxuICAgICAgICBicmVha1xuICAgICAgY3VycmVudE1hdGNoID89IEBmaXJzdE1hdGNoXG4gICAgICByZWxhdGl2ZUluZGV4LS1cbiAgICBlbHNlXG4gICAgICBmb3IgcmFuZ2UgaW4gQG1hdGNoZXMgYnkgLTEgd2hlbiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludClcbiAgICAgICAgY3VycmVudE1hdGNoID0gcmFuZ2VcbiAgICAgICAgYnJlYWtcbiAgICAgIGN1cnJlbnRNYXRjaCA/PSBAbGFzdE1hdGNoXG4gICAgICByZWxhdGl2ZUluZGV4KytcblxuICAgIEBjdXJyZW50TWF0Y2hJbmRleCA9IEBtYXRjaGVzLmluZGV4T2YoY3VycmVudE1hdGNoKVxuICAgIEB1cGRhdGVDdXJyZW50TWF0Y2gocmVsYXRpdmVJbmRleClcbiAgICBpZiBAb3B0aW9ucy5pbmNyZW1lbnRhbFNlYXJjaFxuICAgICAgQHJlZnJlc2hNYXJrZXJzKClcbiAgICBAaW5pdGlhbEN1cnJlbnRNYXRjaEluZGV4ID0gQGN1cnJlbnRNYXRjaEluZGV4XG4gICAgQGN1cnJlbnRNYXRjaFxuXG4gIHVwZGF0ZUN1cnJlbnRNYXRjaDogKHJlbGF0aXZlSW5kZXgpIC0+XG4gICAgQGN1cnJlbnRNYXRjaEluZGV4ID0gZ2V0SW5kZXgoQGN1cnJlbnRNYXRjaEluZGV4ICsgcmVsYXRpdmVJbmRleCwgQG1hdGNoZXMpXG4gICAgQGN1cnJlbnRNYXRjaCA9IEBtYXRjaGVzW0BjdXJyZW50TWF0Y2hJbmRleF1cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWN1cnJlbnQtbWF0Y2gnKVxuXG4gIHZpc2l0OiAocmVsYXRpdmVJbmRleD1udWxsKSAtPlxuICAgIGlmIHJlbGF0aXZlSW5kZXg/XG4gICAgICBAbGFzdFJlbGF0aXZlSW5kZXggPSByZWxhdGl2ZUluZGV4XG4gICAgZWxzZVxuICAgICAgcmVsYXRpdmVJbmRleCA9IEBsYXN0UmVsYXRpdmVJbmRleCA/ICsxXG5cbiAgICByZXR1cm4gdW5sZXNzIEBtYXRjaGVzLmxlbmd0aFxuICAgIG9sZERlY29yYXRpb24gPSBAZGVjb2F0aW9uQnlSYW5nZVtAY3VycmVudE1hdGNoLnRvU3RyaW5nKCldXG4gICAgQHVwZGF0ZUN1cnJlbnRNYXRjaChyZWxhdGl2ZUluZGV4KVxuICAgIG5ld0RlY29yYXRpb24gPSBAZGVjb2F0aW9uQnlSYW5nZVtAY3VycmVudE1hdGNoLnRvU3RyaW5nKCldXG5cbiAgICByZW1vdmVDdXJyZW50Q2xhc3NGb3JEZWNvcmF0aW9uID89IHJlcGxhY2VEZWNvcmF0aW9uQ2xhc3NCeS5iaW5kIG51bGwgLCAodGV4dCkgLT5cbiAgICAgIHRleHQucmVwbGFjZSgvXFxzK2N1cnJlbnQoXFxzKyk/JC8sICckMScpXG5cbiAgICBhZGRDdXJyZW50Q2xhc3NGb3JEZWNvcmF0aW9uID89IHJlcGxhY2VEZWNvcmF0aW9uQ2xhc3NCeS5iaW5kIG51bGwgLCAodGV4dCkgLT5cbiAgICAgIHRleHQucmVwbGFjZSgvXFxzK2N1cnJlbnQoXFxzKyk/JC8sICckMScpICsgJyBjdXJyZW50J1xuXG4gICAgaWYgb2xkRGVjb3JhdGlvbj9cbiAgICAgIHJlbW92ZUN1cnJlbnRDbGFzc0ZvckRlY29yYXRpb24ob2xkRGVjb3JhdGlvbilcblxuICAgIGlmIG5ld0RlY29yYXRpb24/XG4gICAgICBhZGRDdXJyZW50Q2xhc3NGb3JEZWNvcmF0aW9uKG5ld0RlY29yYXRpb24pXG5cbiAgZ2V0UmVsYXRpdmVJbmRleDogLT5cbiAgICBAY3VycmVudE1hdGNoSW5kZXggLSBAaW5pdGlhbEN1cnJlbnRNYXRjaEluZGV4XG4iXX0=
