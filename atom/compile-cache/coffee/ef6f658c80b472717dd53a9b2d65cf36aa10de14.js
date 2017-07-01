(function() {
  var Mutation, MutationManager, Point,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Point = require('atom').Point;

  module.exports = MutationManager = (function() {
    function MutationManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.swrap = ref.swrap;
      this.vimState.onDidDestroy(this.destroy);
      this.markerLayer = this.editor.addMarkerLayer();
      this.mutationsBySelection = new Map;
    }

    MutationManager.prototype.destroy = function() {
      this.markerLayer.destroy();
      return this.mutationsBySelection.clear();
    };

    MutationManager.prototype.init = function(arg) {
      this.stayByMarker = arg.stayByMarker;
      return this.reset();
    };

    MutationManager.prototype.reset = function() {
      this.markerLayer.clear();
      return this.mutationsBySelection.clear();
    };

    MutationManager.prototype.setCheckpoint = function(checkpoint) {
      var i, len, ref, results, selection;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        results.push(this.setCheckpointForSelection(selection, checkpoint));
      }
      return results;
    };

    MutationManager.prototype.setCheckpointForSelection = function(selection, checkpoint) {
      var initialPoint, initialPointMarker, marker, options, resetMarker;
      if (this.mutationsBySelection.has(selection)) {
        resetMarker = !selection.getBufferRange().isEmpty();
      } else {
        resetMarker = true;
        initialPoint = this.swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
        if (this.stayByMarker) {
          initialPointMarker = this.markerLayer.markBufferPosition(initialPoint, {
            invalidate: 'never'
          });
        }
        options = {
          selection: selection,
          initialPoint: initialPoint,
          initialPointMarker: initialPointMarker,
          checkpoint: checkpoint,
          swrap: this.swrap
        };
        this.mutationsBySelection.set(selection, new Mutation(options));
      }
      if (resetMarker) {
        marker = this.markerLayer.markBufferRange(selection.getBufferRange(), {
          invalidate: 'never'
        });
      }
      return this.mutationsBySelection.get(selection).update(checkpoint, marker, this.vimState.mode);
    };

    MutationManager.prototype.migrateMutation = function(oldSelection, newSelection) {
      var mutation;
      mutation = this.mutationsBySelection.get(oldSelection);
      this.mutationsBySelection["delete"](oldSelection);
      mutation.selection = newSelection;
      return this.mutationsBySelection.set(newSelection, mutation);
    };

    MutationManager.prototype.getMutatedBufferRangeForSelection = function(selection) {
      if (this.mutationsBySelection.has(selection)) {
        return this.mutationsBySelection.get(selection).marker.getBufferRange();
      }
    };

    MutationManager.prototype.getSelectedBufferRangesForCheckpoint = function(checkpoint) {
      var ranges;
      ranges = [];
      this.mutationsBySelection.forEach(function(mutation) {
        var range;
        if (range = mutation.bufferRangeByCheckpoint[checkpoint]) {
          return ranges.push(range);
        }
      });
      return ranges;
    };

    MutationManager.prototype.restoreCursorPositions = function(arg) {
      var blockwiseSelection, head, i, j, k, len, len1, len2, mutation, point, ref, ref1, ref2, ref3, results, results1, selection, setToFirstCharacterOnLinewise, stay, tail, wise;
      stay = arg.stay, wise = arg.wise, setToFirstCharacterOnLinewise = arg.setToFirstCharacterOnLinewise;
      if (wise === 'blockwise') {
        ref = this.vimState.getBlockwiseSelections();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          blockwiseSelection = ref[i];
          ref1 = blockwiseSelection.getProperties(), head = ref1.head, tail = ref1.tail;
          point = stay ? head : Point.min(head, tail);
          blockwiseSelection.setHeadBufferPosition(point);
          results.push(blockwiseSelection.skipNormalization());
        }
        return results;
      } else {
        ref2 = this.editor.getSelections();
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          selection = ref2[j];
          if (mutation = this.mutationsBySelection.get(selection)) {
            if (mutation.createdAt !== 'will-select') {
              selection.destroy();
            }
          }
        }
        ref3 = this.editor.getSelections();
        results1 = [];
        for (k = 0, len2 = ref3.length; k < len2; k++) {
          selection = ref3[k];
          if (!(mutation = this.mutationsBySelection.get(selection))) {
            continue;
          }
          if (stay) {
            point = this.clipPoint(mutation.getStayPosition(wise));
          } else {
            point = this.clipPoint(mutation.startPositionOnDidSelect);
            if (setToFirstCharacterOnLinewise && wise === 'linewise') {
              point = this.vimState.utils.getFirstCharacterPositionForBufferRow(this.editor, point.row);
            }
          }
          results1.push(selection.cursor.setBufferPosition(point));
        }
        return results1;
      }
    };

    MutationManager.prototype.clipPoint = function(point) {
      point.row = Math.min(this.vimState.utils.getVimLastBufferRow(this.editor), point.row);
      return this.editor.clipBufferPosition(point);
    };

    return MutationManager;

  })();

  Mutation = (function() {
    function Mutation(options) {
      var checkpoint;
      this.selection = options.selection, this.initialPoint = options.initialPoint, this.initialPointMarker = options.initialPointMarker, checkpoint = options.checkpoint, this.swrap = options.swrap;
      this.createdAt = checkpoint;
      this.bufferRangeByCheckpoint = {};
      this.marker = null;
      this.startPositionOnDidSelect = null;
    }

    Mutation.prototype.update = function(checkpoint, marker, mode) {
      var from, ref;
      if (marker != null) {
        if ((ref = this.marker) != null) {
          ref.destroy();
        }
        this.marker = marker;
      }
      this.bufferRangeByCheckpoint[checkpoint] = this.marker.getBufferRange();
      if (checkpoint === 'did-select') {
        if (mode === 'visual' && !this.selection.isReversed()) {
          from = ['selection'];
        } else {
          from = ['property', 'selection'];
        }
        return this.startPositionOnDidSelect = this.swrap(this.selection).getBufferPositionFor('start', {
          from: from
        });
      }
    };

    Mutation.prototype.getStayPosition = function(wise) {
      var end, point, ref, ref1, ref2, ref3, selectedRange, start;
      point = (ref = (ref1 = this.initialPointMarker) != null ? ref1.getHeadBufferPosition() : void 0) != null ? ref : this.initialPoint;
      selectedRange = (ref2 = this.bufferRangeByCheckpoint['did-select-occurrence']) != null ? ref2 : this.bufferRangeByCheckpoint['did-select'];
      if (selectedRange.isEqual(this.marker.getBufferRange())) {
        return point;
      } else {
        ref3 = this.marker.getBufferRange(), start = ref3.start, end = ref3.end;
        end = Point.max(start, end.translate([0, -1]));
        if (wise === 'linewise') {
          point.row = Math.min(end.row, point.row);
          return point;
        } else {
          return Point.min(end, point);
        }
      }
    };

    return Mutation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tdXRhdGlvbi1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7SUFBQTs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyx5QkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOztNQUNaLE1BQW9CLElBQUMsQ0FBQSxRQUFyQixFQUFDLElBQUMsQ0FBQSxhQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsWUFBQTtNQUNYLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEI7TUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO01BQ2YsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUk7SUFMakI7OzhCQU9iLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsb0JBQW9CLENBQUMsS0FBdEIsQ0FBQTtJQUZPOzs4QkFJVCxJQUFBLEdBQU0sU0FBQyxHQUFEO01BQUUsSUFBQyxDQUFBLGVBQUYsSUFBRTthQUNQLElBQUMsQ0FBQSxLQUFELENBQUE7SUFESTs7OEJBR04sS0FBQSxHQUFPLFNBQUE7TUFDTCxJQUFDLENBQUEsV0FBVyxDQUFDLEtBQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUF0QixDQUFBO0lBRks7OzhCQUlQLGFBQUEsR0FBZSxTQUFDLFVBQUQ7QUFDYixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDRSxJQUFDLENBQUEseUJBQUQsQ0FBMkIsU0FBM0IsRUFBc0MsVUFBdEM7QUFERjs7SUFEYTs7OEJBSWYseUJBQUEs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Q0UsTUFERjtPQUFBLE1BQUE7UUFHRSxPQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBLENBQWYsRUFBQyxrQkFBRCxFQUFRO1FBQ1IsR0FBQSxHQUFNLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFpQixHQUFHLENBQUMsU0FBSixDQUFjLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFkLENBQWpCO1FBQ04sSUFBRyxJQUFBLEtBQVEsVUFBWDtVQUNFLEtBQUssQ0FBQyxHQUFOLEdBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxHQUFHLENBQUMsR0FBYixFQUFrQixLQUFLLENBQUMsR0FBeEI7aUJBQ1osTUFGRjtTQUFBLE1BQUE7aUJBSUUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxHQUFWLEVBQWUsS0FBZixFQUpGO1NBTEY7O0lBSGU7Ozs7O0FBbkhuQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNdXRhdGlvbk1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBzd3JhcH0gPSBAdmltU3RhdGVcbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcFxuXG4gIGRlc3Ryb3k6ID0+XG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5jbGVhcigpXG5cbiAgaW5pdDogKHtAc3RheUJ5TWFya2VyfSkgLT5cbiAgICBAcmVzZXQoKVxuXG4gIHJlc2V0OiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG4gICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmNsZWFyKClcblxuICBzZXRDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBAc2V0Q2hlY2twb2ludEZvclNlbGVjdGlvbihzZWxlY3Rpb24sIGNoZWNrcG9pbnQpXG5cbiAgc2V0Q2hlY2twb2ludEZvclNlbGVjdGlvbjogKHNlbGVjdGlvbiwgY2hlY2twb2ludCkgLT5cbiAgICBpZiBAbXV0YXRpb25zQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgICMgQ3VycmVudCBub24tZW1wdHkgc2VsZWN0aW9uIGlzIHByaW9yaXRpemVkIG92ZXIgZXhpc3RpbmcgbWFya2VyJ3MgcmFuZ2UuXG4gICAgICAjIFdlIGludmFsaWRhdGUgb2xkIG1hcmtlciB0byByZS10cmFjayBmcm9tIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgICAgcmVzZXRNYXJrZXIgPSBub3Qgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNFbXB0eSgpXG4gICAgZWxzZVxuICAgICAgcmVzZXRNYXJrZXIgPSB0cnVlXG4gICAgICBpbml0aWFsUG9pbnQgPSBAc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknLCAnc2VsZWN0aW9uJ10pXG4gICAgICBpZiBAc3RheUJ5TWFya2VyXG4gICAgICAgIGluaXRpYWxQb2ludE1hcmtlciA9IEBtYXJrZXJMYXllci5tYXJrQnVmZmVyUG9zaXRpb24oaW5pdGlhbFBvaW50LCBpbnZhbGlkYXRlOiAnbmV2ZXInKVxuXG4gICAgICBvcHRpb25zID0ge3NlbGVjdGlvbiwgaW5pdGlhbFBvaW50LCBpbml0aWFsUG9pbnRNYXJrZXIsIGNoZWNrcG9pbnQsIEBzd3JhcH1cbiAgICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXcgTXV0YXRpb24ob3B0aW9ucykpXG5cbiAgICBpZiByZXNldE1hcmtlclxuICAgICAgbWFya2VyID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSwgaW52YWxpZGF0ZTogJ25ldmVyJylcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikudXBkYXRlKGNoZWNrcG9pbnQsIG1hcmtlciwgQHZpbVN0YXRlLm1vZGUpXG5cbiAgbWlncmF0ZU11dGF0aW9uOiAob2xkU2VsZWN0aW9uLCBuZXdTZWxlY3Rpb24pIC0+XG4gICAgbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KG9sZFNlbGVjdGlvbilcbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZGVsZXRlKG9sZFNlbGVjdGlvbilcbiAgICBtdXRhdGlvbi5zZWxlY3Rpb24gPSBuZXdTZWxlY3Rpb25cbiAgICBAbXV0YXRpb25zQnlTZWxlY3Rpb24uc2V0KG5ld1NlbGVjdGlvbiwgbXV0YXRpb24pXG5cbiAgZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKVxuICAgICAgQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50OiAoY2hlY2twb2ludCkgLT5cbiAgICByYW5nZXMgPSBbXVxuICAgIEBtdXRhdGlvbnNCeVNlbGVjdGlvbi5mb3JFYWNoIChtdXRhdGlvbikgLT5cbiAgICAgIGlmIHJhbmdlID0gbXV0YXRpb24uYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbY2hlY2twb2ludF1cbiAgICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgcmFuZ2VzXG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uczogKHtzdGF5LCB3aXNlLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pIC0+XG4gICAgaWYgd2lzZSBpcyAnYmxvY2t3aXNlJ1xuICAgICAgZm9yIGJsb2Nrd2lzZVNlbGVjdGlvbiBpbiBAdmltU3RhdGUuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpXG4gICAgICAgIHtoZWFkLCB0YWlsfSA9IGJsb2Nrd2lzZVNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICAgICAgcG9pbnQgPSBpZiBzdGF5IHRoZW4gaGVhZCBlbHNlIFBvaW50Lm1pbihoZWFkLCB0YWlsKVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2V0SGVhZEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgIGVsc2VcbiAgICAgICMgTWFrZSBzdXJlIGRlc3Ryb3lpbmcgYWxsIHRlbXBvcmFsIHNlbGVjdGlvbiBCRUZPUkUgc3RhcnRpbmcgdG8gc2V0IGN1cnNvcnMgdG8gZmluYWwgcG9zaXRpb24uXG4gICAgICAjIFRoaXMgaXMgaW1wb3J0YW50IHRvIGF2b2lkIGRlc3Ryb3kgb3JkZXIgZGVwZW5kZW50IGJ1Z3MuXG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpIHdoZW4gbXV0YXRpb24gPSBAbXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcbiAgICAgICAgaWYgbXV0YXRpb24uY3JlYXRlZEF0IGlzbnQgJ3dpbGwtc2VsZWN0J1xuICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KClcblxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSB3aGVuIG11dGF0aW9uID0gQG11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgIGlmIHN0YXlcbiAgICAgICAgICBwb2ludCA9IEBjbGlwUG9pbnQobXV0YXRpb24uZ2V0U3RheVBvc2l0aW9uKHdpc2UpKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcG9pbnQgPSBAY2xpcFBvaW50KG11dGF0aW9uLnN0YXJ0UG9zaXRpb25PbkRpZFNlbGVjdClcbiAgICAgICAgICBpZiBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSBhbmQgd2lzZSBpcyAnbGluZXdpc2UnXG4gICAgICAgICAgICBwb2ludCA9IEB2aW1TdGF0ZS51dGlscy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KEBlZGl0b3IsIHBvaW50LnJvdylcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBjbGlwUG9pbnQ6IChwb2ludCkgLT5cbiAgICBwb2ludC5yb3cgPSBNYXRoLm1pbihAdmltU3RhdGUudXRpbHMuZ2V0VmltTGFzdEJ1ZmZlclJvdyhAZWRpdG9yKSwgcG9pbnQucm93KVxuICAgIEBlZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4jIE11dGF0aW9uIGluZm9ybWF0aW9uIGlzIGNyZWF0ZWQgZXZlbiBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4jIFNvIHRoYXQgd2UgY2FuIGZpbHRlciBzZWxlY3Rpb24gYnkgd2hlbiBpdCB3YXMgY3JlYXRlZC5cbiMgIGUuZy4gU29tZSBzZWxlY3Rpb24gaXMgY3JlYXRlZCBhdCAnd2lsbC1zZWxlY3QnIGNoZWNrcG9pbnQsIG90aGVycyBhdCAnZGlkLXNlbGVjdCcgb3IgJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbmNsYXNzIE11dGF0aW9uXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICB7QHNlbGVjdGlvbiwgQGluaXRpYWxQb2ludCwgQGluaXRpYWxQb2ludE1hcmtlciwgY2hlY2twb2ludCwgQHN3cmFwfSA9IG9wdGlvbnNcbiAgICBAY3JlYXRlZEF0ID0gY2hlY2twb2ludFxuICAgIEBidWZmZXJSYW5nZUJ5Q2hlY2twb2ludCA9IHt9XG4gICAgQG1hcmtlciA9IG51bGxcbiAgICBAc3RhcnRQb3NpdGlvbk9uRGlkU2VsZWN0ID0gbnVsbFxuXG4gIHVwZGF0ZTogKGNoZWNrcG9pbnQsIG1hcmtlciwgbW9kZSkgLT5cbiAgICBpZiBtYXJrZXI/XG4gICAgICBAbWFya2VyPy5kZXN0cm95KClcbiAgICAgIEBtYXJrZXIgPSBtYXJrZXJcbiAgICBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbY2hlY2twb2ludF0gPSBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcbiAgICAjIE5PVEU6IHN0dXBpZGx5IHJlc3BlY3QgcHVyZS1WaW0ncyBiZWhhdmlvciB3aGljaCBpcyBpbmNvbnNpc3RlbnQuXG4gICAgIyBNYXliZSBJJ2xsIHJlbW92ZSB0aGlzIGJsaW5kbHktZm9sbG93aW5nLXRvLXB1cmUtVmltIGNvZGUuXG4gICAgIyAgLSBgViBrIHlgOiBkb24ndCBtb3ZlIGN1cnNvclxuICAgICMgIC0gYFYgaiB5YDogbW92ZSBjdXJvciB0byBzdGFydCBvZiBzZWxlY3RlZCBsaW5lLihJbmNvbnNpc3RlbnQhKVxuICAgIGlmIGNoZWNrcG9pbnQgaXMgJ2RpZC1zZWxlY3QnXG4gICAgICBpZiAobW9kZSBpcyAndmlzdWFsJyBhbmQgbm90IEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpKVxuICAgICAgICBmcm9tID0gWydzZWxlY3Rpb24nXVxuICAgICAgZWxzZVxuICAgICAgICBmcm9tID0gWydwcm9wZXJ0eScsICdzZWxlY3Rpb24nXVxuICAgICAgQHN0YXJ0UG9zaXRpb25PbkRpZFNlbGVjdCA9IEBzd3JhcChAc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignc3RhcnQnLCB7ZnJvbX0pXG5cbiAgZ2V0U3RheVBvc2l0aW9uOiAod2lzZSkgLT5cbiAgICBwb2ludCA9IEBpbml0aWFsUG9pbnRNYXJrZXI/LmdldEhlYWRCdWZmZXJQb3NpdGlvbigpID8gQGluaXRpYWxQb2ludFxuICAgIHNlbGVjdGVkUmFuZ2UgPSBAYnVmZmVyUmFuZ2VCeUNoZWNrcG9pbnRbJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSddID8gQGJ1ZmZlclJhbmdlQnlDaGVja3BvaW50WydkaWQtc2VsZWN0J11cbiAgICBpZiBzZWxlY3RlZFJhbmdlLmlzRXF1YWwoQG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpKSAjIENoZWNrIGlmIG5lZWQgQ2xpcFxuICAgICAgcG9pbnRcbiAgICBlbHNlXG4gICAgICB7c3RhcnQsIGVuZH0gPSBAbWFya2VyLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGVuZCA9IFBvaW50Lm1heChzdGFydCwgZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgIGlmIHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICBwb2ludC5yb3cgPSBNYXRoLm1pbihlbmQucm93LCBwb2ludC5yb3cpXG4gICAgICAgIHBvaW50XG4gICAgICBlbHNlXG4gICAgICAgIFBvaW50Lm1pbihlbmQsIHBvaW50KVxuIl19
