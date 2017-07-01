(function() {
  var RangeFinder, sortLines, sortLinesInsensitive, sortLinesNatural, sortLinesReversed, sortTextLines, uniqueLines;

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
        },
        'sort-lines:natural': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return sortLinesNatural(editor);
        }
      });
    }
  };

  sortTextLines = function(editor, sorter) {
    var sortableRanges;
    sortableRanges = RangeFinder.rangesFor(editor);
    return sortableRanges.forEach(function(range) {
      var textLines;
      textLines = editor.getTextInBufferRange(range).split(/\r?\n/g);
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

  sortLinesNatural = function(editor) {
    return sortTextLines(editor, function(textLines) {
      var naturalSortRegex;
      naturalSortRegex = /^(\d*)(\D*)(\d*)([\s\S]*)$/;
      return textLines.sort((function(_this) {
        return function(a, b) {
          var aLeadingNum, aRemainder, aTrailingNum, aWord, bLeadingNum, bRemainder, bTrailingNum, bWord, __, _ref, _ref1;
          if (a === b) {
            return 0;
          }
          _ref = naturalSortRegex.exec(a), __ = _ref[0], aLeadingNum = _ref[1], aWord = _ref[2], aTrailingNum = _ref[3], aRemainder = _ref[4];
          _ref1 = naturalSortRegex.exec(b), __ = _ref1[0], bLeadingNum = _ref1[1], bWord = _ref1[2], bTrailingNum = _ref1[3], bRemainder = _ref1[4];
          if (aWord !== bWord) {
            return (a < b ? -1 : 1);
          }
          if (aLeadingNum !== bLeadingNum) {
            return (aLeadingNum < bLeadingNum ? -1 : 1);
          }
          if (aTrailingNum !== bTrailingNum) {
            return (aTrailingNum < bTrailingNum ? -1 : 1);
          }
          return 0;
        };
      })(this));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zb3J0LWxpbmVzL2xpYi9zb3J0LWxpbmVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2R0FBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FBZCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw4QkFBbEIsRUFDRTtBQUFBLFFBQUEsaUJBQUEsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7aUJBQ0EsU0FBQSxDQUFVLE1BQVYsRUFGaUI7UUFBQSxDQUFuQjtBQUFBLFFBR0EseUJBQUEsRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7aUJBQ0EsaUJBQUEsQ0FBa0IsTUFBbEIsRUFGeUI7UUFBQSxDQUgzQjtBQUFBLFFBTUEsbUJBQUEsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFULENBQUE7aUJBQ0EsV0FBQSxDQUFZLE1BQVosRUFGbUI7UUFBQSxDQU5yQjtBQUFBLFFBU0Esa0NBQUEsRUFBb0MsU0FBQSxHQUFBO0FBQ2xDLGNBQUEsTUFBQTtBQUFBLFVBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFT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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/sort-lines/lib/sort-lines.coffee
