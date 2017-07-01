(function() {
  var BlockwiseSelection, _, __swrap, assertWithException, ref, settings, sortRanges, swrap, trimRange,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('./utils'), sortRanges = ref.sortRanges, assertWithException = ref.assertWithException, trimRange = ref.trimRange;

  settings = require('./settings');

  __swrap = null;

  swrap = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (__swrap == null) {
      __swrap = require('./selection-wrapper');
    }
    return __swrap.apply(null, args);
  };

  BlockwiseSelection = (function() {
    BlockwiseSelection.prototype.editor = null;

    BlockwiseSelection.prototype.selections = null;

    BlockwiseSelection.prototype.goalColumn = null;

    BlockwiseSelection.prototype.reversed = false;

    BlockwiseSelection.blockwiseSelectionsByEditor = new Map();

    BlockwiseSelection.clearSelections = function(editor) {
      return this.blockwiseSelectionsByEditor["delete"](editor);
    };

    BlockwiseSelection.has = function(editor) {
      return this.blockwiseSelectionsByEditor.has(editor);
    };

    BlockwiseSelection.getSelections = function(editor) {
      var ref1;
      return (ref1 = this.blockwiseSelectionsByEditor.get(editor)) != null ? ref1 : [];
    };

    BlockwiseSelection.getSelectionsOrderedByBufferPosition = function(editor) {
      return this.getSelections(editor).sort(function(a, b) {
        return a.getStartSelection().compare(b.getStartSelection());
      });
    };

    BlockwiseSelection.getLastSelection = function(editor) {
      return _.last(this.blockwiseSelectionsByEditor.get(editor));
    };

    BlockwiseSelection.saveSelection = function(blockwiseSelection) {
      var editor;
      editor = blockwiseSelection.editor;
      if (!this.has(editor)) {
        this.blockwiseSelectionsByEditor.set(editor, []);
      }
      return this.blockwiseSelectionsByEditor.get(editor).push(blockwiseSelection);
    };

    function BlockwiseSelection(selection) {
      var $memberSelection, $selection, end, endColumn, headColumn, i, j, k, len, len1, memberReversed, memberSelection, range, ranges, ref1, ref2, ref3, ref4, ref5, ref6, results, start, startColumn, tailColumn;
      this.needSkipNormalization = false;
      this.properties = {};
      this.editor = selection.editor;
      $selection = swrap(selection);
      if (!$selection.hasProperties()) {
        if (settings.get('strictAssertion')) {
          assertWithException(false, "Trying to instantiate vB from properties-less selection");
        }
        $selection.saveProperties();
      }
      this.goalColumn = selection.cursor.goalColumn;
      this.reversed = memberReversed = selection.isReversed();
      ref1 = $selection.getProperties(), (ref2 = ref1.head, headColumn = ref2.column), (ref3 = ref1.tail, tailColumn = ref3.column);
      start = $selection.getBufferPositionFor('start', {
        from: ['property']
      });
      end = $selection.getBufferPositionFor('end', {
        from: ['property']
      });
      if ((this.goalColumn === 2e308) && headColumn >= tailColumn) {
        if (selection.isReversed()) {
          start.column = this.goalColumn;
        } else {
          end.column = this.goalColumn;
        }
      }
      if (start.column > end.column) {
        memberReversed = !memberReversed;
        startColumn = end.column;
        endColumn = start.column + 1;
      } else {
        startColumn = start.column;
        endColumn = end.column + 1;
      }
      ranges = (function() {
        results = [];
        for (var i = ref4 = start.row, ref5 = end.row; ref4 <= ref5 ? i <= ref5 : i >= ref5; ref4 <= ref5 ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this).map(function(row) {
        return [[row, startColumn], [row, endColumn]];
      });
      selection.setBufferRange(ranges.shift(), {
        reversed: memberReversed
      });
      this.selections = [selection];
      for (j = 0, len = ranges.length; j < len; j++) {
        range = ranges[j];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: memberReversed
        }));
      }
      this.updateGoalColumn();
      ref6 = this.getSelections();
      for (k = 0, len1 = ref6.length; k < len1; k++) {
        memberSelection = ref6[k];
        if (!($memberSelection = swrap(memberSelection))) {
          continue;
        }
        $memberSelection.saveProperties();
        $memberSelection.getProperties().head.column = headColumn;
        $memberSelection.getProperties().tail.column = tailColumn;
      }
      this.constructor.saveSelection(this);
    }

    BlockwiseSelection.prototype.getSelections = function() {
      return this.selections;
    };

    BlockwiseSelection.prototype.extendMemberSelectionsToEndOfLine = function() {
      var end, i, len, ref1, ref2, results, selection, start;
      ref1 = this.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        ref2 = selection.getBufferRange(), start = ref2.start, end = ref2.end;
        end.column = 2e308;
        results.push(selection.setBufferRange([start, end]));
      }
      return results;
    };

    BlockwiseSelection.prototype.expandMemberSelectionsOverLineWithTrimRange = function() {
      var i, len, range, ref1, results, selection, start;
      ref1 = this.getSelections();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        start = selection.getBufferRange().start;
        range = trimRange(this.editor, this.editor.bufferRangeForBufferRow(start.row));
        results.push(selection.setBufferRange(range));
      }
      return results;
    };

    BlockwiseSelection.prototype.isReversed = function() {
      return this.reversed;
    };

    BlockwiseSelection.prototype.reverse = function() {
      return this.reversed = !this.reversed;
    };

    BlockwiseSelection.prototype.getProperties = function() {
      return {
        head: swrap(this.getHeadSelection()).getProperties().head,
        tail: swrap(this.getTailSelection()).getProperties().tail
      };
    };

    BlockwiseSelection.prototype.updateGoalColumn = function() {
      var i, len, ref1, results, selection;
      if (this.goalColumn != null) {
        ref1 = this.selections;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          selection = ref1[i];
          results.push(selection.cursor.goalColumn = this.goalColumn);
        }
        return results;
      }
    };

    BlockwiseSelection.prototype.isSingleRow = function() {
      return this.selections.length === 1;
    };

    BlockwiseSelection.prototype.getHeight = function() {
      var endRow, ref1, startRow;
      ref1 = this.getBufferRowRange(), startRow = ref1[0], endRow = ref1[1];
      return (endRow - startRow) + 1;
    };

    BlockwiseSelection.prototype.getStartSelection = function() {
      return this.selections[0];
    };

    BlockwiseSelection.prototype.getEndSelection = function() {
      return _.last(this.selections);
    };

    BlockwiseSelection.prototype.getHeadSelection = function() {
      if (this.isReversed()) {
        return this.getStartSelection();
      } else {
        return this.getEndSelection();
      }
    };

    BlockwiseSelection.prototype.getTailSelection = function() {
      if (this.isReversed()) {
        return this.getEndSelection();
      } else {
        return this.getStartSelection();
      }
    };

    BlockwiseSelection.prototype.getBufferRowRange = function() {
      var endRow, startRow;
      startRow = this.getStartSelection().getBufferRowRange()[0];
      endRow = this.getEndSelection().getBufferRowRange()[0];
      return [startRow, endRow];
    };

    BlockwiseSelection.prototype.setSelectedBufferRanges = function(ranges, arg) {
      var base, goalColumn, head, i, len, range, reversed;
      reversed = arg.reversed;
      sortRanges(ranges);
      range = ranges.shift();
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      head.setBufferRange(range, {
        reversed: reversed
      });
      if (goalColumn != null) {
        if ((base = head.cursor).goalColumn == null) {
          base.goalColumn = goalColumn;
        }
      }
      for (i = 0, len = ranges.length; i < len; i++) {
        range = ranges[i];
        this.selections.push(this.editor.addSelectionForBufferRange(range, {
          reversed: reversed
        }));
      }
      return this.updateGoalColumn();
    };

    BlockwiseSelection.prototype.removeSelections = function(arg) {
      var except, i, len, ref1, results, selection;
      except = (arg != null ? arg : {}).except;
      ref1 = this.selections.slice();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        if (!(selection !== except)) {
          continue;
        }
        swrap(selection).clearProperties();
        _.remove(this.selections, selection);
        results.push(selection.destroy());
      }
      return results;
    };

    BlockwiseSelection.prototype.setHeadBufferPosition = function(point) {
      var head;
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      return head.cursor.setBufferPosition(point);
    };

    BlockwiseSelection.prototype.skipNormalization = function() {
      return this.needSkipNormalization = true;
    };

    BlockwiseSelection.prototype.normalize = function() {
      var $selection, base, goalColumn, head, properties;
      if (this.needSkipNormalization) {
        return;
      }
      properties = this.getProperties();
      head = this.getHeadSelection();
      this.removeSelections({
        except: head
      });
      goalColumn = head.cursor.goalColumn;
      $selection = swrap(head);
      $selection.selectByProperties(properties);
      $selection.saveProperties(true);
      if (goalColumn) {
        return (base = head.cursor).goalColumn != null ? base.goalColumn : base.goalColumn = goalColumn;
      }
    };

    BlockwiseSelection.prototype.autoscroll = function() {
      return this.getHeadSelection().autoscroll();
    };

    return BlockwiseSelection;

  })();

  module.exports = BlockwiseSelection;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9ibG9ja3dpc2Utc2VsZWN0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0dBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE1BQStDLE9BQUEsQ0FBUSxTQUFSLENBQS9DLEVBQUMsMkJBQUQsRUFBYSw2Q0FBYixFQUFrQzs7RUFDbEMsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE9BQUEsR0FBVTs7RUFDVixLQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFETzs7TUFDUCxVQUFXLE9BQUEsQ0FBUSxxQkFBUjs7V0FDWCxPQUFBLGFBQVEsSUFBUjtFQUZNOztFQUlGO2lDQUNKLE1BQUEsR0FBUTs7aUNBQ1IsVUFBQSxHQUFZOztpQ0FDWixVQUFBLEdBQVk7O2lDQUNaLFFBQUEsR0FBVTs7SUFFVixrQkFBQyxDQUFBLDJCQUFELEdBQW1DLElBQUEsR0FBQSxDQUFBOztJQUVuQyxrQkFBQyxDQUFBLGVBQUQsR0FBa0IsU0FBQyxNQUFEO2FBQ2hCLElBQUMsQ0FBQSwyQkFBMkIsRUFBQyxNQUFELEVBQTVCLENBQW9DLE1BQXBDO0lBRGdCOztJQUdsQixrQkFBQyxDQUFBLEdBQUQsR0FBTSxTQUFDLE1BQUQ7YUFDSixJQUFDLENBQUEsMkJBQTJCLENBQUMsR0FBN0IsQ0FBaUMsTUFBakM7SUFESTs7SUFHTixrQkFBQyxDQUFBLGFBQUQsR0FBZ0IsU0FBQyxNQUFEO0FBQ2QsVUFBQTtvRkFBMkM7SUFEN0I7O0lBR2hCLGtCQUFDLENBQUEsb0NBQUQsR0FBdUMsU0FBQyxNQUFEO2FBQ3JDLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixDQUFzQixDQUFDLElBQXZCLENBQTRCLFNBQUMsQ0FBRCxFQUFJLENBQUo7ZUFDMUIsQ0FBQyxDQUFDLGlC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O0FBeE1qQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntzb3J0UmFuZ2VzLCBhc3NlcnRXaXRoRXhjZXB0aW9uLCB0cmltUmFuZ2V9ID0gcmVxdWlyZSAnLi91dGlscydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuX19zd3JhcCA9IG51bGxcbnN3cmFwID0gKGFyZ3MuLi4pIC0+XG4gIF9fc3dyYXAgPz0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbiAgX19zd3JhcChhcmdzLi4uKVxuXG5jbGFzcyBCbG9ja3dpc2VTZWxlY3Rpb25cbiAgZWRpdG9yOiBudWxsXG4gIHNlbGVjdGlvbnM6IG51bGxcbiAgZ29hbENvbHVtbjogbnVsbFxuICByZXZlcnNlZDogZmFsc2VcblxuICBAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yID0gbmV3IE1hcCgpXG5cbiAgQGNsZWFyU2VsZWN0aW9uczogKGVkaXRvcikgLT5cbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yLmRlbGV0ZShlZGl0b3IpXG5cbiAgQGhhczogKGVkaXRvcikgLT5cbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yLmhhcyhlZGl0b3IpXG5cbiAgQGdldFNlbGVjdGlvbnM6IChlZGl0b3IpIC0+XG4gICAgQGJsb2Nrd2lzZVNlbGVjdGlvbnNCeUVkaXRvci5nZXQoZWRpdG9yKSA/IFtdXG5cbiAgQGdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbjogKGVkaXRvcikgLT5cbiAgICBAZ2V0U2VsZWN0aW9ucyhlZGl0b3IpLnNvcnQgKGEsIGIpIC0+XG4gICAgICBhLmdldFN0YXJ0U2VsZWN0aW9uKCkuY29tcGFyZShiLmdldFN0YXJ0U2VsZWN0aW9uKCkpXG5cbiAgQGdldExhc3RTZWxlY3Rpb246IChlZGl0b3IpIC0+XG4gICAgXy5sYXN0KEBibG9ja3dpc2VTZWxlY3Rpb25zQnlFZGl0b3IuZ2V0KGVkaXRvcikpXG5cbiAgQHNhdmVTZWxlY3Rpb246IChibG9ja3dpc2VTZWxlY3Rpb24pIC0+XG4gICAgZWRpdG9yID0gYmxvY2t3aXNlU2VsZWN0aW9uLmVkaXRvclxuICAgIEBibG9ja3dpc2VTZWxlY3Rpb25zQnlFZGl0b3Iuc2V0KGVkaXRvciwgW10pIHVubGVzcyBAaGFzKGVkaXRvcilcbiAgICBAYmxvY2t3aXNlU2VsZWN0aW9uc0J5RWRpdG9yLmdldChlZGl0b3IpLnB1c2goYmxvY2t3aXNlU2VsZWN0aW9uKVxuXG4gIGNvbnN0cnVjdG9yOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBuZWVkU2tpcE5vcm1hbGl6YXRpb24gPSBmYWxzZVxuICAgIEBwcm9wZXJ0aWVzID0ge31cbiAgICBAZWRpdG9yID0gc2VsZWN0aW9uLmVkaXRvclxuICAgICRzZWxlY3Rpb24gPSBzd3JhcChzZWxlY3Rpb24pXG4gICAgdW5sZXNzICRzZWxlY3Rpb24uaGFzUHJvcGVydGllcygpXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ3N0cmljdEFzc2VydGlvbicpXG4gICAgICAgIGFzc2VydFdpdGhFeGNlcHRpb24oZmFsc2UsIFwiVHJ5aW5nIHRvIGluc3RhbnRpYXRlIHZCIGZyb20gcHJvcGVydGllcy1sZXNzIHNlbGVjdGlvblwiKVxuICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG5cbiAgICBAZ29hbENvbHVtbiA9IHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtblxuICAgIEByZXZlcnNlZCA9IG1lbWJlclJldmVyc2VkID0gc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuXG4gICAge2hlYWQ6IHtjb2x1bW46IGhlYWRDb2x1bW59LCB0YWlsOiB7Y29sdW1uOiB0YWlsQ29sdW1ufX0gPSAkc2VsZWN0aW9uLmdldFByb3BlcnRpZXMoKVxuICAgIHN0YXJ0ID0gJHNlbGVjdGlvbi5nZXRCdWZmZXJQb3NpdGlvbkZvcignc3RhcnQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgZW5kID0gJHNlbGVjdGlvbi5nZXRCdWZmZXJQb3NpdGlvbkZvcignZW5kJywgZnJvbTogWydwcm9wZXJ0eSddKVxuXG4gICAgIyBSZXNwZWN0IGdvYWxDb2x1bW4gb25seSB3aGVuIGl0J3MgdmFsdWUgaXMgSW5maW5pdHkgYW5kIHNlbGVjdGlvbidzIGhlYWQtY29sdW1uIGlzIGJpZ2dlciB0aGFuIHRhaWwtY29sdW1uXG4gICAgaWYgKEBnb2FsQ29sdW1uIGlzIEluZmluaXR5KSBhbmQgaGVhZENvbHVtbiA+PSB0YWlsQ29sdW1uXG4gICAgICBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIHN0YXJ0LmNvbHVtbiA9IEBnb2FsQ29sdW1uXG4gICAgICBlbHNlXG4gICAgICAgIGVuZC5jb2x1bW4gPSBAZ29hbENvbHVtblxuXG4gICAgaWYgc3RhcnQuY29sdW1uID4gZW5kLmNvbHVtblxuICAgICAgbWVtYmVyUmV2ZXJzZWQgPSBub3QgbWVtYmVyUmV2ZXJzZWRcbiAgICAgIHN0YXJ0Q29sdW1uID0gZW5kLmNvbHVtblxuICAgICAgZW5kQ29sdW1uID0gc3RhcnQuY29sdW1uICsgMVxuICAgIGVsc2VcbiAgICAgIHN0YXJ0Q29sdW1uID0gc3RhcnQuY29sdW1uXG4gICAgICBlbmRDb2x1bW4gPSBlbmQuY29sdW1uICsgMVxuXG4gICAgcmFuZ2VzID0gW3N0YXJ0LnJvdy4uZW5kLnJvd10ubWFwIChyb3cpIC0+XG4gICAgICBbW3Jvdywgc3RhcnRDb2x1bW5dLCBbcm93LCBlbmRDb2x1bW5dXVxuXG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlcy5zaGlmdCgpLCByZXZlcnNlZDogbWVtYmVyUmV2ZXJzZWQpXG4gICAgQHNlbGVjdGlvbnMgPSBbc2VsZWN0aW9uXVxuICAgIGZvciByYW5nZSBpbiByYW5nZXNcbiAgICAgIEBzZWxlY3Rpb25zLnB1c2goQGVkaXRvci5hZGRTZWxlY3Rpb25Gb3JCdWZmZXJSYW5nZShyYW5nZSwgcmV2ZXJzZWQ6IG1lbWJlclJldmVyc2VkKSlcbiAgICBAdXBkYXRlR29hbENvbHVtbigpXG5cbiAgICBmb3IgbWVtYmVyU2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKCkgd2hlbiAkbWVtYmVyU2VsZWN0aW9uID0gc3dyYXAobWVtYmVyU2VsZWN0aW9uKVxuICAgICAgJG1lbWJlclNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpICMgVE9ETyM2OTggIHJlbW92ZSB0aGlzP1xuICAgICAgJG1lbWJlclNlbGVjdGlvbi5nZXRQcm9wZXJ0aWVzKCkuaGVhZC5jb2x1bW4gPSBoZWFkQ29sdW1uXG4gICAgICAkbWVtYmVyU2VsZWN0aW9uLmdldFByb3BlcnRpZXMoKS50YWlsLmNvbHVtbiA9IHRhaWxDb2x1bW5cblxuICAgIEBjb25zdHJ1Y3Rvci5zYXZlU2VsZWN0aW9uKHRoaXMpXG5cbiAgZ2V0U2VsZWN0aW9uczogLT5cbiAgICBAc2VsZWN0aW9uc1xuXG4gIGV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZTogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKClcbiAgICAgIHtzdGFydCwgZW5kfSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBlbmQuY29sdW1uID0gSW5maW5pdHlcbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShbc3RhcnQsIGVuZF0pXG5cbiAgZXhwYW5kTWVtYmVyU2VsZWN0aW9uc092ZXJMaW5lV2l0aFRyaW1SYW5nZTogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKClcbiAgICAgIHN0YXJ0ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgIHJhbmdlID0gdHJpbVJhbmdlKEBlZGl0b3IsIEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coc3RhcnQucm93KSlcbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSlcblxuICBpc1JldmVyc2VkOiAtPlxuICAgIEByZXZlcnNlZFxuXG4gIHJldmVyc2U6IC0+XG4gICAgQHJldmVyc2VkID0gbm90IEByZXZlcnNlZFxuXG4gIGdldFByb3BlcnRpZXM6IC0+XG4gICAge1xuICAgICAgaGVhZDogc3dyYXAoQGdldEhlYWRTZWxlY3Rpb24oKSkuZ2V0UHJvcGVydGllcygpLmhlYWRcbiAgICAgIHRhaWw6IHN3cmFwKEBnZXRUYWlsU2VsZWN0aW9uKCkpLmdldFByb3BlcnRpZXMoKS50YWlsXG4gICAgfVxuXG4gIHVwZGF0ZUdvYWxDb2x1bW46IC0+XG4gICAgaWYgQGdvYWxDb2x1bW4/XG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBzZWxlY3Rpb25zXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IuZ29hbENvbHVtbiA9IEBnb2FsQ29sdW1uXG5cbiAgaXNTaW5nbGVSb3c6IC0+XG4gICAgQHNlbGVjdGlvbnMubGVuZ3RoIGlzIDFcblxuICBnZXRIZWlnaHQ6IC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gQGdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICAoZW5kUm93IC0gc3RhcnRSb3cpICsgMVxuXG4gIGdldFN0YXJ0U2VsZWN0aW9uOiAtPlxuICAgIEBzZWxlY3Rpb25zWzBdXG5cbiAgZ2V0RW5kU2VsZWN0aW9uOiAtPlxuICAgIF8ubGFzdChAc2VsZWN0aW9ucylcblxuICBnZXRIZWFkU2VsZWN0aW9uOiAtPlxuICAgIGlmIEBpc1JldmVyc2VkKClcbiAgICAgIEBnZXRTdGFydFNlbGVjdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGdldEVuZFNlbGVjdGlvbigpXG5cbiAgZ2V0VGFpbFNlbGVjdGlvbjogLT5cbiAgICBpZiBAaXNSZXZlcnNlZCgpXG4gICAgICBAZ2V0RW5kU2VsZWN0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZ2V0U3RhcnRTZWxlY3Rpb24oKVxuXG4gIGdldEJ1ZmZlclJvd1JhbmdlOiAtPlxuICAgIHN0YXJ0Um93ID0gQGdldFN0YXJ0U2VsZWN0aW9uKCkuZ2V0QnVmZmVyUm93UmFuZ2UoKVswXVxuICAgIGVuZFJvdyA9IEBnZXRFbmRTZWxlY3Rpb24oKS5nZXRCdWZmZXJSb3dSYW5nZSgpWzBdXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiAgIyBbTk9URV0gVXNlZCBieSBwbHVnaW4gcGFja2FnZSB2bXA6bW92ZS1zZWxlY3RlZC10ZXh0XG4gIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzOiAocmFuZ2VzLCB7cmV2ZXJzZWR9KSAtPlxuICAgIHNvcnRSYW5nZXMocmFuZ2VzKVxuICAgIHJhbmdlID0gcmFuZ2VzLnNoaWZ0KClcblxuICAgIGhlYWQgPSBAZ2V0SGVhZFNlbGVjdGlvbigpXG4gICAgQHJlbW92ZVNlbGVjdGlvbnMoZXhjZXB0OiBoZWFkKVxuICAgIHtnb2FsQ29sdW1ufSA9IGhlYWQuY3Vyc29yXG4gICAgIyBXaGVuIHJldmVyc2VkIHN0YXRlIG9mIHNlbGVjdGlvbiBjaGFuZ2UsIGdvYWxDb2x1bW4gaXMgY2xlYXJlZC5cbiAgICAjIEJ1dCBoZXJlIGZvciBibG9ja3dpc2UsIEkgd2FudCB0byBrZWVwIGdvYWxDb2x1bW4gdW5jaGFuZ2VkLlxuICAgICMgVGhpcyBiZWhhdmlvciBpcyBub3QgY29tcGF0aWJsZSB3aXRoIHB1cmUtVmltIEkga25vdy5cbiAgICAjIEJ1dCBJIGJlbGlldmUgdGhpcyBpcyBtb3JlIHVubm9pc3kgYW5kIGxlc3MgY29uZnVzaW9uIHdoaWxlIG1vdmluZ1xuICAgICMgY3Vyc29yIGluIHZpc3VhbC1ibG9jayBtb2RlLlxuICAgIGhlYWQuc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZH0pXG4gICAgaGVhZC5jdXJzb3IuZ29hbENvbHVtbiA/PSBnb2FsQ29sdW1uIGlmIGdvYWxDb2x1bW4/XG5cbiAgICBmb3IgcmFuZ2UgaW4gcmFuZ2VzXG4gICAgICBAc2VsZWN0aW9ucy5wdXNoIEBlZGl0b3IuYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZH0pXG4gICAgQHVwZGF0ZUdvYWxDb2x1bW4oKVxuXG4gIHJlbW92ZVNlbGVjdGlvbnM6ICh7ZXhjZXB0fT17fSkgLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBzZWxlY3Rpb25zLnNsaWNlKCkgd2hlbiAoc2VsZWN0aW9uIGlzbnQgZXhjZXB0KVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5jbGVhclByb3BlcnRpZXMoKVxuICAgICAgXy5yZW1vdmUoQHNlbGVjdGlvbnMsIHNlbGVjdGlvbilcbiAgICAgIHNlbGVjdGlvbi5kZXN0cm95KClcblxuICBzZXRIZWFkQnVmZmVyUG9zaXRpb246IChwb2ludCkgLT5cbiAgICBoZWFkID0gQGdldEhlYWRTZWxlY3Rpb24oKVxuICAgIEByZW1vdmVTZWxlY3Rpb25zKGV4Y2VwdDogaGVhZClcbiAgICBoZWFkLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBza2lwTm9ybWFsaXphdGlvbjogLT5cbiAgICBAbmVlZFNraXBOb3JtYWxpemF0aW9uID0gdHJ1ZVxuXG4gIG5vcm1hbGl6ZTogLT5cbiAgICByZXR1cm4gaWYgQG5lZWRTa2lwTm9ybWFsaXphdGlvblxuXG4gICAgcHJvcGVydGllcyA9IEBnZXRQcm9wZXJ0aWVzKCkgIyBTYXZlIHByb3AgQkVGT1JFIHJlbW92aW5nIG1lbWJlciBzZWxlY3Rpb25zLlxuXG4gICAgaGVhZCA9IEBnZXRIZWFkU2VsZWN0aW9uKClcbiAgICBAcmVtb3ZlU2VsZWN0aW9ucyhleGNlcHQ6IGhlYWQpXG5cbiAgICB7Z29hbENvbHVtbn0gPSBoZWFkLmN1cnNvciAjIEZJWE1FIHRoaXMgc2hvdWxkIG5vdCBiZSBuZWNlc3NhcnlcbiAgICAkc2VsZWN0aW9uID0gc3dyYXAoaGVhZClcbiAgICAkc2VsZWN0aW9uLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXModHJ1ZSlcbiAgICBoZWFkLmN1cnNvci5nb2FsQ29sdW1uID89IGdvYWxDb2x1bW4gaWYgZ29hbENvbHVtbiAjIEZJWE1FIHRoaXMgc2hvdWxkIG5vdCBiZSBuZWNlc3NhcnlcblxuICBhdXRvc2Nyb2xsOiAtPlxuICAgIEBnZXRIZWFkU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpXG5cbm1vZHVsZS5leHBvcnRzID0gQmxvY2t3aXNlU2VsZWN0aW9uXG4iXX0=
