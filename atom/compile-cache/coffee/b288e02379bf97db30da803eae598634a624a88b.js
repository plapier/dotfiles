(function() {
  var RangeFinder, sortLines, sortLinesInsensitive, sortLinesReversed, sortTextLines, uniqueLines;

  RangeFinder = require('./range-finder');

  module.exports = {
    activate: function() {
      return atom.commands.add('atom-text-editor:not([mini])', {
        'sort-lines:sort': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return sortLines(editor);
        },
        'sort-lines:reverse-sort': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return sortLinesReversed(editor);
        },
        'sort-lines:unique': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return uniqueLines(editor);
        },
        'sort-lines:case-insensitive-sort': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return sortLinesInsensitive(editor);
        }
      });
    }
  };

  sortTextLines = function(editor, sorter) {
    var sortableRanges;
    sortableRanges = RangeFinder.rangesFor(editor);
    return sortableRanges.forEach(function(range) {
      var textLines;
      textLines = editor.getTextInBufferRange(range).split("\n");
      textLines = sorter(textLines);
      return editor.setTextInBufferRange(range, textLines.join("\n"));
    });
  };

  sortLines = function(editor) {
    return sortTextLines(editor, function(textLines) {
      return textLines.sort(function(a, b) {
        return a.localeCompare(b);
      });
    });
  };

  sortLinesReversed = function(editor) {
    return sortTextLines(editor, function(textLines) {
      return textLines.sort(function(a, b) {
        return b.localeCompare(a);
      });
    });
  };

  uniqueLines = function(editor) {
    return sortTextLines(editor, function(textLines) {
      return textLines.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    });
  };

  sortLinesInsensitive = function(editor) {
    return sortTextLines(editor, function(textLines) {
      return textLines.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zb3J0LWxpbmVzL2xpYi9zb3J0LWxpbmVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyRkFBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FBZCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw4QkFBbEIsRUFDRTtBQUFBLFFBQUEsaUJBQUEsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7aUJBQ0EsU0FBQSxDQUFVLE1BQVYsRUFGaUI7UUFBQSxDQUFuQjtBQUFBLFFBR0EseUJBQUEsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7aUJBQ0EsaUJBQUEsQ0FBa0IsTUFBbEIsRUFGeUI7UUFBQSxDQUgzQjtBQUFBLFFBTUEsbUJBQUEsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7aUJBQ0EsV0FBQSxDQUFZLE1BQVosRUFGbUI7UUFBQSxDQU5yQjtBQUFBLFFBU0Esa0NBQUEsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7aUJBQ0Esb0JBQUEsQ0FBcUIsTUFBckIsRUFGa0M7UUFBQSxDQVRwQztPQURGLEVBRFE7SUFBQSxDQUFWO0dBSEYsQ0FBQTs7QUFBQSxFQWtCQSxhQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUNkLFFBQUEsY0FBQTtBQUFBLElBQUEsY0FBQSxHQUFpQixXQUFXLENBQUMsU0FBWixDQUFzQixNQUF0QixDQUFqQixDQUFBO1dBQ0EsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsU0FBQyxLQUFELEdBQUE7QUFDckIsVUFBQSxTQUFBO0FBQUEsTUFBQSxTQUFBLEdBQVksTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCLENBQWtDLENBQUMsS0FBbkMsQ0FBeUMsSUFBekMsQ0FBWixDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksTUFBQSxDQUFPLFNBQVAsQ0FEWixDQUFBO2FBRUEsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCLEVBQW1DLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBZixDQUFuQyxFQUhxQjtJQUFBLENBQXZCLEVBRmM7RUFBQSxDQWxCaEIsQ0FBQTs7QUFBQSxFQXlCQSxTQUFBLEdBQVksU0FBQyxNQUFELEdBQUE7V0FDVixhQUFBLENBQWMsTUFBZCxFQUFzQixTQUFDLFNBQUQsR0FBQTthQUNwQixTQUFTLENBQUMsSUFBVixDQUFlLFNBQUMsQ0FBRCxFQUFJLENBQUosR0FBQTtlQUFVLENBQUMsQ0FBQyxhQUFGLENBQWdCLENBQWhCLEVBQVY7TUFBQSxDQUFmLEVBRG9CO0lBQUEsQ0FBdEIsRUFEVTtFQUFBLENBekJaLENBQUE7O0FBQUEsRUE2QkEsaUJBQUEsR0FBb0IsU0FBQyxNQUFELEdBQUE7V0FDbEIsYUFBQSxDQUFjLE1BQWQsRUFBc0IsU0FBQyxTQUFELEdBQUE7YUFDcEIsU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7ZUFBVSxDQUFDLENBQUMsYUFBRixDQUFnQixDQUFoQixFQUFWO01BQUEsQ0FBZixFQURvQjtJQUFBLENBQXRCLEVBRGtCO0VBQUEsQ0E3QnBCLENBQUE7O0FBQUEsRUFpQ0EsV0FBQSxHQUFjLFNBQUMsTUFBRCxHQUFBO1dBQ1osYUFBQSxDQUFjLE1BQWQsRUFBc0IsU0FBQyxTQUFELEdBQUE7YUFDcEIsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsU0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLElBQWYsR0FBQTtlQUF3QixJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsQ0FBQSxLQUF1QixNQUEvQztNQUFBLENBQWpCLEVBRG9CO0lBQUEsQ0FBdEIsRUFEWTtFQUFBLENBakNkLENBQUE7O0FBQUEsRUFxQ0Esb0JBQUEsR0FBdUIsU0FBQyxNQUFELEdBQUE7V0FDckIsYUFBQSxDQUFjLE1BQWQsRUFBc0IsU0FBQyxTQUFELEdBQUE7YUFDcEIsU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7ZUFBVSxDQUFDLENBQUMsV0FBRixDQUFBLENBQWUsQ0FBQyxhQUFoQixDQUE4QixDQUFDLENBQUMsV0FBRixDQUFBLENBQTlCLEVBQVY7TUFBQSxDQUFmLEVBRG9CO0lBQUEsQ0FBdEIsRUFEcUI7RUFBQSxDQXJDdkIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/sort-lines/lib/sort-lines.coffee
