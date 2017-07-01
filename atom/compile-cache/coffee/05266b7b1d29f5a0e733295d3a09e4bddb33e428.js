(function() {
  var BlockwiseSelection, Disposable, Point, Range, SelectionWrapper, assertWithException, getBufferRangeForRowRange, getEndOfLineForBufferRow, getRangeByTranslatePointAndClip, isLinewiseRange, limitNumber, propertyStore, ref, ref1, settings, swrap, translatePointAndClip;

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  ref1 = require('./utils'), translatePointAndClip = ref1.translatePointAndClip, getRangeByTranslatePointAndClip = ref1.getRangeByTranslatePointAndClip, getEndOfLineForBufferRow = ref1.getEndOfLineForBufferRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, limitNumber = ref1.limitNumber, isLinewiseRange = ref1.isLinewiseRange, assertWithException = ref1.assertWithException;

  settings = require('./settings');

  BlockwiseSelection = require('./blockwise-selection');

  propertyStore = new Map;

  SelectionWrapper = (function() {
    function SelectionWrapper(selection1) {
      this.selection = selection1;
    }

    SelectionWrapper.prototype.hasProperties = function() {
      return propertyStore.has(this.selection);
    };

    SelectionWrapper.prototype.getProperties = function() {
      return propertyStore.get(this.selection);
    };

    SelectionWrapper.prototype.setProperties = function(prop) {
      return propertyStore.set(this.selection, prop);
    };

    SelectionWrapper.prototype.clearProperties = function() {
      return propertyStore["delete"](this.selection);
    };

    SelectionWrapper.prototype.setBufferRangeSafely = function(range, options) {
      if (range) {
        return this.setBufferRange(range, options);
      }
    };

    SelectionWrapper.prototype.getBufferRange = function() {
      return this.selection.getBufferRange();
    };

    SelectionWrapper.prototype.getBufferPositionFor = function(which, arg) {
      var _from, from, i, len, properties, ref2;
      from = (arg != null ? arg : {}).from;
      ref2 = from != null ? from : ['selection'];
      for (i = 0, len = ref2.length; i < len; i++) {
        _from = ref2[i];
        switch (_from) {
          case 'property':
            if (!this.hasProperties()) {
              continue;
            }
            properties = this.getProperties();
            switch (which) {
              case 'start':
                if (this.selection.isReversed()) {
                  return properties.head;
                } else {
                  return properties.tail;
                }
              case 'end':
                if (this.selection.isReversed()) {
                  return properties.tail;
                } else {
                  return properties.head;
                }
              case 'head':
                return properties.head;
              case 'tail':
                return properties.tail;
            }
          case 'selection':
            switch (which) {
              case 'start':
                return this.selection.getBufferRange().start;
              case 'end':
                return this.selection.getBufferRange().end;
              case 'head':
                return this.selection.getHeadBufferPosition();
              case 'tail':
                return this.selection.getTailBufferPosition();
            }
        }
      }
      return null;
    };

    SelectionWrapper.prototype.setBufferPositionTo = function(which) {
      return this.selection.cursor.setBufferPosition(this.getBufferPositionFor(which));
    };

    SelectionWrapper.prototype.setReversedState = function(isReversed) {
      var head, ref2, tail;
      if (this.selection.isReversed() === isReversed) {
        return;
      }
      assertWithException(this.hasProperties(), "trying to reverse selection which is non-empty and property-lesss");
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      this.setProperties({
        head: tail,
        tail: head
      });
      return this.setBufferRange(this.getBufferRange(), {
        autoscroll: true,
        reversed: isReversed,
        keepGoalColumn: false
      });
    };

    SelectionWrapper.prototype.getRows = function() {
      var endRow, i, ref2, results, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return (function() {
        results = [];
        for (var i = startRow; startRow <= endRow ? i <= endRow : i >= endRow; startRow <= endRow ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this);
    };

    SelectionWrapper.prototype.getRowCount = function() {
      return this.getRows().length;
    };

    SelectionWrapper.prototype.getTailBufferRange = function() {
      var editor, point, tailPoint;
      editor = this.selection.editor;
      tailPoint = this.selection.getTailBufferPosition();
      if (this.selection.isReversed()) {
        point = translatePointAndClip(editor, tailPoint, 'backward');
        return new Range(point, tailPoint);
      } else {
        point = translatePointAndClip(editor, tailPoint, 'forward');
        return new Range(tailPoint, point);
      }
    };

    SelectionWrapper.prototype.saveProperties = function(isNormalized) {
      var end, head, properties, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      if (this.selection.isEmpty() || isNormalized) {
        properties = {
          head: head,
          tail: tail
        };
      } else {
        end = translatePointAndClip(this.selection.editor, this.getBufferRange().end, 'backward');
        if (this.selection.isReversed()) {
          properties = {
            head: head,
            tail: end
          };
        } else {
          properties = {
            head: end,
            tail: tail
          };
        }
      }
      return this.setProperties(properties);
    };

    SelectionWrapper.prototype.fixPropertyRowToRowRange = function() {
      var head, ref2, ref3, ref4, tail;
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      if (this.selection.isReversed()) {
        return ref3 = this.selection.getBufferRowRange(), head.row = ref3[0], tail.row = ref3[1], ref3;
      } else {
        return ref4 = this.selection.getBufferRowRange(), tail.row = ref4[0], head.row = ref4[1], ref4;
      }
    };

    SelectionWrapper.prototype.applyWise = function(wise) {
      var end, ref2, start;
      switch (wise) {
        case 'characterwise':
          return this.translateSelectionEndAndClip('forward');
        case 'linewise':
          ref2 = this.getBufferRange(), start = ref2.start, end = ref2.end;
          return this.setBufferRange(getBufferRangeForRowRange(this.selection.editor, [start.row, end.row]));
        case 'blockwise':
          return new BlockwiseSelection(this.selection);
      }
    };

    SelectionWrapper.prototype.selectByProperties = function(arg) {
      var head, tail;
      head = arg.head, tail = arg.tail;
      return this.setBufferRange([tail, head], {
        autoscroll: true,
        reversed: head.isLessThan(tail),
        keepGoalColumn: false
      });
    };

    SelectionWrapper.prototype.setBufferRange = function(range, options) {
      var goalColumn, ref2;
      if (options == null) {
        options = {};
      }
      if ((ref2 = options.keepGoalColumn) != null ? ref2 : true) {
        goalColumn = this.selection.cursor.goalColumn;
      }
      delete options.keepGoalColumn;
      if (options.autoscroll == null) {
        options.autoscroll = false;
      }
      if (options.preserveFolds == null) {
        options.preserveFolds = true;
      }
      this.selection.setBufferRange(range, options);
      if (goalColumn != null) {
        return this.selection.cursor.goalColumn = goalColumn;
      }
    };

    SelectionWrapper.prototype.isSingleRow = function() {
      var endRow, ref2, startRow;
      ref2 = this.selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
      return startRow === endRow;
    };

    SelectionWrapper.prototype.isLinewiseRange = function() {
      return isLinewiseRange(this.getBufferRange());
    };

    SelectionWrapper.prototype.detectWise = function() {
      if (this.isLinewiseRange()) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    SelectionWrapper.prototype.translateSelectionEndAndClip = function(direction) {
      var newRange;
      newRange = getRangeByTranslatePointAndClip(this.selection.editor, this.getBufferRange(), "end", direction);
      return this.setBufferRange(newRange);
    };

    SelectionWrapper.prototype.getBlockwiseSelectionExtent = function() {
      var head, tail;
      head = this.selection.getHeadBufferPosition();
      tail = this.selection.getTailBufferPosition();
      return new Point(head.row - tail.row, head.column - tail.column);
    };

    SelectionWrapper.prototype.normalize = function() {
      var head, ref2, tail;
      if (this.selection.isEmpty()) {
        return;
      }
      if (!this.hasProperties()) {
        if (settings.get('strictAssertion')) {
          assertWithException(false, "attempted to normalize but no properties to restore");
        }
        this.saveProperties();
      }
      ref2 = this.getProperties(), head = ref2.head, tail = ref2.tail;
      return this.setBufferRange([tail, head]);
    };

    return SelectionWrapper;

  })();

  swrap = function(selection) {
    return new SelectionWrapper(selection);
  };

  swrap.getBlockwiseSelections = function(editor) {
    return BlockwiseSelection.getSelections(editor);
  };

  swrap.getLastBlockwiseSelections = function(editor) {
    return BlockwiseSelection.getLastSelection(editor);
  };

  swrap.getBlockwiseSelectionsOrderedByBufferPosition = function(editor) {
    return BlockwiseSelection.getSelectionsOrderedByBufferPosition(editor);
  };

  swrap.clearBlockwiseSelections = function(editor) {
    return BlockwiseSelection.clearSelections(editor);
  };

  swrap.getSelections = function(editor) {
    return editor.getSelections(editor).map(swrap);
  };

  swrap.setReversedState = function(editor, reversed) {
    var $selection, i, len, ref2, results;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      results.push($selection.setReversedState(reversed));
    }
    return results;
  };

  swrap.detectWise = function(editor) {
    if (this.getSelections(editor).every(function($selection) {
      return $selection.detectWise() === 'linewise';
    })) {
      return 'linewise';
    } else {
      return 'characterwise';
    }
  };

  swrap.clearProperties = function(editor) {
    var $selection, i, len, ref2, results;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      results.push($selection.clearProperties());
    }
    return results;
  };

  swrap.dumpProperties = function(editor) {
    var $selection, i, inspect, len, ref2, results;
    inspect = require('util').inspect;
    ref2 = this.getSelections(editor);
    results = [];
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      if ($selection.hasProperties()) {
        results.push(console.log(inspect($selection.getProperties())));
      }
    }
    return results;
  };

  swrap.normalize = function(editor) {
    var $selection, blockwiseSelection, i, j, len, len1, ref2, ref3, results;
    if (BlockwiseSelection.has(editor)) {
      ref2 = BlockwiseSelection.getSelections(editor);
      for (i = 0, len = ref2.length; i < len; i++) {
        blockwiseSelection = ref2[i];
        blockwiseSelection.normalize();
      }
      return BlockwiseSelection.clearSelections(editor);
    } else {
      ref3 = this.getSelections(editor);
      results = [];
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        $selection = ref3[j];
        results.push($selection.normalize());
      }
      return results;
    }
  };

  swrap.hasProperties = function(editor) {
    return this.getSelections(editor).every(function($selection) {
      return $selection.hasProperties();
    });
  };

  swrap.switchToLinewise = function(editor) {
    var $selection, i, len, ref2;
    ref2 = swrap.getSelections(editor);
    for (i = 0, len = ref2.length; i < len; i++) {
      $selection = ref2[i];
      $selection.saveProperties();
      $selection.applyWise('linewise');
    }
    return new Disposable(function() {
      var j, len1, ref3, results;
      ref3 = swrap.getSelections(editor);
      results = [];
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        $selection = ref3[j];
        $selection.normalize();
        results.push($selection.applyWise('characterwise'));
      }
      return results;
    });
  };

  swrap.getPropertyStore = function() {
    return propertyStore;
  };

  module.exports = swrap;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWxlY3Rpb24td3JhcHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNmLE9BUUksT0FBQSxDQUFRLFNBQVIsQ0FSSixFQUNFLGtEQURGLEVBRUUsc0VBRkYsRUFHRSx3REFIRixFQUlFLDBEQUpGLEVBS0UsOEJBTEYsRUFNRSxzQ0FORixFQU9FOztFQUVGLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVI7O0VBRXJCLGFBQUEsR0FBZ0IsSUFBSTs7RUFFZDtJQUNTLDBCQUFDLFVBQUQ7TUFBQyxJQUFDLENBQUEsWUFBRDtJQUFEOzsrQkFDYixhQUFBLEdBQWUsU0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUFIOzsrQkFDZixhQUFBLEdBQWUsU0FBQTthQUFHLGFBQWEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxTQUFuQjtJQUFIOzsrQkFDZixhQUFBLEdBQWUsU0FBQyxJQUFEO2FBQVUsYUFBYSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLFNBQW5CLEVBQThCLElBQTlCO0lBQVY7OytCQUNmLGVBQUEsR0FBaUIsU0FBQTthQUFHLGFBQWEsRUFBQyxNQUFELEVBQWIsQ0FBcUIsSUFBQyxDQUFBLFNBQXRCO0lBQUg7OytCQUVqQixvQkFBQSxHQUFzQixTQUFDLEtBQUQsRUFBUSxPQUFSO01BQ3BCLElBQUcsS0FBSDtlQUNFLElBQUMsQ0FBQSxjQUFELENBQWdCLEtBQWhCLEVBQXVCLE9BQXZCLEVBREY7O0lBRG9COzsrQkFJdEIsY0FBQSxHQUFnQixTQUFBO2FBQ2Qs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VUFBRDthQUFnQixVQUFVLENBQUMsYUFBWCxDQUFBO0lBQWhCLENBQTdCO0VBRG9COztFQUt0QixLQUFLLENBQUMsZ0JBQU4sR0FBeUIsU0FBQyxNQUFEO0FBQ3ZCLFFBQUE7QUFBQTtBQUFBLFNBQUEsc0NBQUE7O01BQ0UsVUFBVSxDQUFDLGNBQVgsQ0FBQTtNQUNBLFVBQVUsQ0FBQyxTQUFYLENBQXFCLFVBQXJCO0FBRkY7V0FHSSxJQUFBLFVBQUEsQ0FBVyxTQUFBO0FBQ2IsVUFBQTtBQUFBO0FBQUE7V0FBQSx3Q0FBQTs7UUFDRSxVQUFVLENBQUMsU0FBWCxDQUFBO3FCQUNBLFVBQVUsQ0FBQyxTQUFYLENBQXFCLGVBQXJCO0FBRkY7O0lBRGEsQ0FBWDtFQUptQjs7RUFTekIsS0FBSyxDQUFDLGdCQUFOLEdBQXlCLFNBQUE7V0FDdkI7RUFEdUI7O0VBR3pCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBM09qQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnQsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgbGltaXROdW1iZXJcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIGFzc2VydFdpdGhFeGNlcHRpb25cbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuQmxvY2t3aXNlU2VsZWN0aW9uID0gcmVxdWlyZSAnLi9ibG9ja3dpc2Utc2VsZWN0aW9uJ1xuXG5wcm9wZXJ0eVN0b3JlID0gbmV3IE1hcFxuXG5jbGFzcyBTZWxlY3Rpb25XcmFwcGVyXG4gIGNvbnN0cnVjdG9yOiAoQHNlbGVjdGlvbikgLT5cbiAgaGFzUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5oYXMoQHNlbGVjdGlvbilcbiAgZ2V0UHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5nZXQoQHNlbGVjdGlvbilcbiAgc2V0UHJvcGVydGllczogKHByb3ApIC0+IHByb3BlcnR5U3RvcmUuc2V0KEBzZWxlY3Rpb24sIHByb3ApXG4gIGNsZWFyUHJvcGVydGllczogLT4gcHJvcGVydHlTdG9yZS5kZWxldGUoQHNlbGVjdGlvbilcblxuICBzZXRCdWZmZXJSYW5nZVNhZmVseTogKHJhbmdlLCBvcHRpb25zKSAtPlxuICAgIGlmIHJhbmdlXG4gICAgICBAc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG5cbiAgZ2V0QnVmZmVyUmFuZ2U6IC0+XG4gICAgQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3I6ICh3aGljaCwge2Zyb219PXt9KSAtPlxuICAgIGZvciBfZnJvbSBpbiBmcm9tID8gWydzZWxlY3Rpb24nXVxuICAgICAgc3dpdGNoIF9mcm9tXG4gICAgICAgIHdoZW4gJ3Byb3BlcnR5J1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG5cbiAgICAgICAgICBwcm9wZXJ0aWVzID0gQGdldFByb3BlcnRpZXMoKVxuICAgICAgICAgIHJldHVybiBzd2l0Y2ggd2hpY2hcbiAgICAgICAgICAgIHdoZW4gJ3N0YXJ0JyB0aGVuIChpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSB0aGVuIHByb3BlcnRpZXMuaGVhZCBlbHNlIHByb3BlcnRpZXMudGFpbClcbiAgICAgICAgICAgIHdoZW4gJ2VuZCcgdGhlbiAoaWYgQHNlbGVjdGlvbi5pc1JldmVyc2VkKCkgdGhlbiBwcm9wZXJ0aWVzLnRhaWwgZWxzZSBwcm9wZXJ0aWVzLmhlYWQpXG4gICAgICAgICAgICB3aGVuICdoZWFkJyB0aGVuIHByb3BlcnRpZXMuaGVhZFxuICAgICAgICAgICAgd2hlbiAndGFpbCcgdGhlbiBwcm9wZXJ0aWVzLnRhaWxcblxuICAgICAgICB3aGVuICdzZWxlY3Rpb24nXG4gICAgICAgICAgcmV0dXJuIHN3aXRjaCB3aGljaFxuICAgICAgICAgICAgd2hlbiAnc3RhcnQnIHRoZW4gQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICAgICAgICB3aGVuICdlbmQnIHRoZW4gQHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgICAgICAgICAgd2hlbiAnaGVhZCcgdGhlbiBAc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgICAgICB3aGVuICd0YWlsJyB0aGVuIEBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgICBudWxsXG5cbiAgc2V0QnVmZmVyUG9zaXRpb25UbzogKHdoaWNoKSAtPlxuICAgIEBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKEBnZXRCdWZmZXJQb3NpdGlvbkZvcih3aGljaCkpXG5cbiAgc2V0UmV2ZXJzZWRTdGF0ZTogKGlzUmV2ZXJzZWQpIC0+XG4gICAgcmV0dXJuIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIGlzIGlzUmV2ZXJzZWRcbiAgICBhc3NlcnRXaXRoRXhjZXB0aW9uKEBoYXNQcm9wZXJ0aWVzKCksIFwidHJ5aW5nIHRvIHJldmVyc2Ugc2VsZWN0aW9uIHdoaWNoIGlzIG5vbi1lbXB0eSBhbmQgcHJvcGVydHktbGVzc3NcIilcblxuICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBAc2V0UHJvcGVydGllcyhoZWFkOiB0YWlsLCB0YWlsOiBoZWFkKVxuXG4gICAgQHNldEJ1ZmZlclJhbmdlIEBnZXRCdWZmZXJSYW5nZSgpLFxuICAgICAgYXV0b3Njcm9sbDogdHJ1ZVxuICAgICAgcmV2ZXJzZWQ6IGlzUmV2ZXJzZWRcbiAgICAgIGtlZXBHb2FsQ29sdW1uOiBmYWxzZVxuXG4gIGdldFJvd3M6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgW3N0YXJ0Um93Li5lbmRSb3ddXG5cbiAgZ2V0Um93Q291bnQ6IC0+XG4gICAgQGdldFJvd3MoKS5sZW5ndGhcblxuICBnZXRUYWlsQnVmZmVyUmFuZ2U6IC0+XG4gICAge2VkaXRvcn0gPSBAc2VsZWN0aW9uXG4gICAgdGFpbFBvaW50ID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBwb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHRhaWxQb2ludCwgJ2JhY2t3YXJkJylcbiAgICAgIG5ldyBSYW5nZShwb2ludCwgdGFpbFBvaW50KVxuICAgIGVsc2VcbiAgICAgIHBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKGVkaXRvciwgdGFpbFBvaW50LCAnZm9yd2FyZCcpXG4gICAgICBuZXcgUmFuZ2UodGFpbFBvaW50LCBwb2ludClcblxuICBzYXZlUHJvcGVydGllczogKGlzTm9ybWFsaXplZCkgLT5cbiAgICBoZWFkID0gQHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWwgPSBAc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgQHNlbGVjdGlvbi5pc0VtcHR5KCkgb3IgaXNOb3JtYWxpemVkXG4gICAgICBwcm9wZXJ0aWVzID0ge2hlYWQsIHRhaWx9XG4gICAgZWxzZVxuICAgICAgIyBXZSBzZWxlY3RSaWdodC1lZCBpbiB2aXN1YWwtbW9kZSwgdGhpcyB0cmFuc2xhdGlvbiBkZS1lZmZlY3Qgc2VsZWN0LXJpZ2h0LWVmZmVjdFxuICAgICAgIyBTbyB0aGF0IHdlIGNhbiBhY3RpdmF0ZS12aXN1YWwtbW9kZSB3aXRob3V0IHNwZWNpYWwgdHJhbnNsYXRpb24gYWZ0ZXIgcmVzdG9yZWluZyBwcm9wZXJ0aWVzLlxuICAgICAgZW5kID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBzZWxlY3Rpb24uZWRpdG9yLCBAZ2V0QnVmZmVyUmFuZ2UoKS5lbmQsICdiYWNrd2FyZCcpXG4gICAgICBpZiBAc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBwcm9wZXJ0aWVzID0ge2hlYWQ6IGhlYWQsIHRhaWw6IGVuZH1cbiAgICAgIGVsc2VcbiAgICAgICAgcHJvcGVydGllcyA9IHtoZWFkOiBlbmQsIHRhaWw6IHRhaWx9XG4gICAgQHNldFByb3BlcnRpZXMocHJvcGVydGllcylcblxuICBmaXhQcm9wZXJ0eVJvd1RvUm93UmFuZ2U6IC0+XG4gICAge2hlYWQsIHRhaWx9ID0gQGdldFByb3BlcnRpZXMoKVxuICAgIGlmIEBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBbaGVhZC5yb3csIHRhaWwucm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIGVsc2VcbiAgICAgIFt0YWlsLnJvdywgaGVhZC5yb3ddID0gQHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG5cbiAgIyBOT1RFOlxuICAjICd3aXNlJyBtdXN0IGJlICdjaGFyYWN0ZXJ3aXNlJyBvciAnbGluZXdpc2UnXG4gICMgVXNlIHRoaXMgZm9yIG5vcm1hbGl6ZWQobm9uLXNlbGVjdC1yaWdodC1lZCkgc2VsZWN0aW9uLlxuICBhcHBseVdpc2U6ICh3aXNlKSAtPlxuICAgIHN3aXRjaCB3aXNlXG4gICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICBAdHJhbnNsYXRlU2VsZWN0aW9uRW5kQW5kQ2xpcCgnZm9yd2FyZCcpICMgZXF1aXZhbGVudCB0byBjb3JlIHNlbGVjdGlvbi5zZWxlY3RSaWdodCBidXQga2VlcCBnb2FsQ29sdW1uXG4gICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgIyBFdmVuIGlmIGVuZC5jb2x1bW4gaXMgMCwgZXhwYW5kIG92ZXIgdGhhdCBlbmQucm93KCBkb24ndCB1c2Ugc2VsZWN0aW9uLmdldFJvd1JhbmdlKCkgKVxuICAgICAgICB7c3RhcnQsIGVuZH0gPSBAZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICBAc2V0QnVmZmVyUmFuZ2UoZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAc2VsZWN0aW9uLmVkaXRvciwgW3N0YXJ0LnJvdywgZW5kLnJvd10pKVxuICAgICAgd2hlbiAnYmxvY2t3aXNlJ1xuICAgICAgICBuZXcgQmxvY2t3aXNlU2VsZWN0aW9uKEBzZWxlY3Rpb24pXG5cbiAgc2VsZWN0QnlQcm9wZXJ0aWVzOiAoe2hlYWQsIHRhaWx9KSAtPlxuICAgICMgTm8gcHJvYmxlbSBpZiBoZWFkIGlzIGdyZWF0ZXIgdGhhbiB0YWlsLCBSYW5nZSBjb25zdHJ1Y3RvciBzd2FwIHN0YXJ0L2VuZC5cbiAgICBAc2V0QnVmZmVyUmFuZ2UgW3RhaWwsIGhlYWRdLFxuICAgICAgYXV0b3Njcm9sbDogdHJ1ZVxuICAgICAgcmV2ZXJzZWQ6IGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuICAgICAga2VlcEdvYWxDb2x1bW46IGZhbHNlXG5cbiAgIyBzZXQgc2VsZWN0aW9ucyBidWZmZXJSYW5nZSB3aXRoIGRlZmF1bHQgb3B0aW9uIHthdXRvc2Nyb2xsOiBmYWxzZSwgcHJlc2VydmVGb2xkczogdHJ1ZX1cbiAgc2V0QnVmZmVyUmFuZ2U6IChyYW5nZSwgb3B0aW9ucz17fSkgLT5cbiAgICBpZiBvcHRpb25zLmtlZXBHb2FsQ29sdW1uID8gdHJ1ZVxuICAgICAgZ29hbENvbHVtbiA9IEBzZWxlY3Rpb24uY3Vyc29yLmdvYWxDb2x1bW5cbiAgICBkZWxldGUgb3B0aW9ucy5rZWVwR29hbENvbHVtblxuICAgIG9wdGlvbnMuYXV0b3Njcm9sbCA/PSBmYWxzZVxuICAgIG9wdGlvbnMucHJlc2VydmVGb2xkcyA/PSB0cnVlXG4gICAgQHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSwgb3B0aW9ucylcbiAgICBAc2VsZWN0aW9uLmN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtbiBpZiBnb2FsQ29sdW1uP1xuXG4gIGlzU2luZ2xlUm93OiAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IEBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgIHN0YXJ0Um93IGlzIGVuZFJvd1xuXG4gIGlzTGluZXdpc2VSYW5nZTogLT5cbiAgICBpc0xpbmV3aXNlUmFuZ2UoQGdldEJ1ZmZlclJhbmdlKCkpXG5cbiAgZGV0ZWN0V2lzZTogLT5cbiAgICBpZiBAaXNMaW5ld2lzZVJhbmdlKClcbiAgICAgICdsaW5ld2lzZSdcbiAgICBlbHNlXG4gICAgICAnY2hhcmFjdGVyd2lzZSdcblxuICAjIGRpcmVjdGlvbiBtdXN0IGJlIG9uZSBvZiBbJ2ZvcndhcmQnLCAnYmFja3dhcmQnXVxuICB0cmFuc2xhdGVTZWxlY3Rpb25FbmRBbmRDbGlwOiAoZGlyZWN0aW9uKSAtPlxuICAgIG5ld1JhbmdlID0gZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAc2VsZWN0aW9uLmVkaXRvciwgQGdldEJ1ZmZlclJhbmdlKCksIFwiZW5kXCIsIGRpcmVjdGlvbilcbiAgICBAc2V0QnVmZmVyUmFuZ2UobmV3UmFuZ2UpXG5cbiAgIyBSZXR1cm4gc2VsZWN0aW9uIGV4dGVudCB0byByZXBsYXkgYmxvY2t3aXNlIHNlbGVjdGlvbiBvbiBgLmAgcmVwZWF0aW5nLlxuICBnZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQ6IC0+XG4gICAgaGVhZCA9IEBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gQHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICAgIG5ldyBQb2ludChoZWFkLnJvdyAtIHRhaWwucm93LCBoZWFkLmNvbHVtbiAtIHRhaWwuY29sdW1uKVxuXG4gICMgV2hhdCdzIHRoZSBub3JtYWxpemU/XG4gICMgTm9ybWFsaXphdGlvbiBpcyByZXN0b3JlIHNlbGVjdGlvbiByYW5nZSBmcm9tIHByb3BlcnR5LlxuICAjIEFzIGEgcmVzdWx0IGl0IHJhbmdlIGJlY2FtZSByYW5nZSB3aGVyZSBlbmQgb2Ygc2VsZWN0aW9uIG1vdmVkIHRvIGxlZnQuXG4gICMgVGhpcyBlbmQtbW92ZS10by1sZWZ0IGRlLWVmZWN0IG9mIGVuZC1tb2RlLXRvLXJpZ2h0IGVmZmVjdCggdGhpcyBpcyB2aXN1YWwtbW9kZSBvcmllbnRhdGlvbiApXG4gIG5vcm1hbGl6ZTogLT5cbiAgICAjIGVtcHR5IHNlbGVjdGlvbiBJUyBhbHJlYWR5ICdub3JtYWxpemVkJ1xuICAgIHJldHVybiBpZiBAc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgIHVubGVzcyBAaGFzUHJvcGVydGllcygpXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ3N0cmljdEFzc2VydGlvbicpXG4gICAgICAgIGFzc2VydFdpdGhFeGNlcHRpb24oZmFsc2UsIFwiYXR0ZW1wdGVkIHRvIG5vcm1hbGl6ZSBidXQgbm8gcHJvcGVydGllcyB0byByZXN0b3JlXCIpXG4gICAgICBAc2F2ZVByb3BlcnRpZXMoKVxuICAgIHtoZWFkLCB0YWlsfSA9IEBnZXRQcm9wZXJ0aWVzKClcbiAgICBAc2V0QnVmZmVyUmFuZ2UoW3RhaWwsIGhlYWRdKVxuXG5zd3JhcCA9IChzZWxlY3Rpb24pIC0+XG4gIG5ldyBTZWxlY3Rpb25XcmFwcGVyKHNlbGVjdGlvbilcblxuIyBCbG9ja3dpc2VTZWxlY3Rpb24gcHJveHlcbnN3cmFwLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG5cbnN3cmFwLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb25zID0gKGVkaXRvcikgLT5cbiAgQmxvY2t3aXNlU2VsZWN0aW9uLmdldExhc3RTZWxlY3Rpb24oZWRpdG9yKVxuXG5zd3JhcC5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBCbG9ja3dpc2VTZWxlY3Rpb24uZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKGVkaXRvcilcblxuc3dyYXAuY2xlYXJCbG9ja3dpc2VTZWxlY3Rpb25zID0gKGVkaXRvcikgLT5cbiAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhlZGl0b3IpXG5cbnN3cmFwLmdldFNlbGVjdGlvbnMgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3IuZ2V0U2VsZWN0aW9ucyhlZGl0b3IpLm1hcChzd3JhcClcblxuc3dyYXAuc2V0UmV2ZXJzZWRTdGF0ZSA9IChlZGl0b3IsIHJldmVyc2VkKSAtPlxuICAkc2VsZWN0aW9uLnNldFJldmVyc2VkU3RhdGUocmV2ZXJzZWQpIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcilcblxuc3dyYXAuZGV0ZWN0V2lzZSA9IChlZGl0b3IpIC0+XG4gIGlmIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikuZXZlcnkoKCRzZWxlY3Rpb24pIC0+ICRzZWxlY3Rpb24uZGV0ZWN0V2lzZSgpIGlzICdsaW5ld2lzZScpXG4gICAgJ2xpbmV3aXNlJ1xuICBlbHNlXG4gICAgJ2NoYXJhY3Rlcndpc2UnXG5cbnN3cmFwLmNsZWFyUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gICRzZWxlY3Rpb24uY2xlYXJQcm9wZXJ0aWVzKCkgZm9yICRzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoZWRpdG9yKVxuXG5zd3JhcC5kdW1wUHJvcGVydGllcyA9IChlZGl0b3IpIC0+XG4gIHtpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG4gIGZvciAkc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKGVkaXRvcikgd2hlbiAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgIGNvbnNvbGUubG9nIGluc3BlY3QoJHNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKCkpXG5cbnN3cmFwLm5vcm1hbGl6ZSA9IChlZGl0b3IpIC0+XG4gIGlmIEJsb2Nrd2lzZVNlbGVjdGlvbi5oYXMoZWRpdG9yKVxuICAgIGZvciBibG9ja3dpc2VTZWxlY3Rpb24gaW4gQmxvY2t3aXNlU2VsZWN0aW9uLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgQmxvY2t3aXNlU2VsZWN0aW9uLmNsZWFyU2VsZWN0aW9ucyhlZGl0b3IpXG4gIGVsc2VcbiAgICBmb3IgJHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG5cbnN3cmFwLmhhc1Byb3BlcnRpZXMgPSAoZWRpdG9yKSAtPlxuICBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpLmV2ZXJ5ICgkc2VsZWN0aW9uKSAtPiAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuXG4jIFJldHVybiBmdW5jdGlvbiB0byByZXN0b3JlXG4jIFVzZWQgaW4gdm1wLW1vdmUtc2VsZWN0ZWQtdGV4dFxuc3dyYXAuc3dpdGNoVG9MaW5ld2lzZSA9IChlZGl0b3IpIC0+XG4gIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoZWRpdG9yKVxuICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdsaW5ld2lzZScpXG4gIG5ldyBEaXNwb3NhYmxlIC0+XG4gICAgZm9yICRzZWxlY3Rpb24gaW4gc3dyYXAuZ2V0U2VsZWN0aW9ucyhlZGl0b3IpXG4gICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSgnY2hhcmFjdGVyd2lzZScpXG5cbnN3cmFwLmdldFByb3BlcnR5U3RvcmUgPSAtPlxuICBwcm9wZXJ0eVN0b3JlXG5cbm1vZHVsZS5leHBvcnRzID0gc3dyYXBcbiJdfQ==
