(function() {
  var copyCharacterFromAbove, copyCharacterFromBelow;

  copyCharacterFromAbove = function(editor, vimState) {
    return editor.transact(function() {
      var column, cursor, range, row, _i, _len, _ref, _ref1, _results;
      _ref = editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cursor = _ref[_i];
        _ref1 = cursor.getScreenPosition(), row = _ref1.row, column = _ref1.column;
        if (row === 0) {
          continue;
        }
        range = [[row - 1, column], [row - 1, column + 1]];
        _results.push(cursor.selection.insertText(editor.getTextInBufferRange(editor.bufferRangeForScreenRange(range))));
      }
      return _results;
    });
  };

  copyCharacterFromBelow = function(editor, vimState) {
    return editor.transact(function() {
      var column, cursor, range, row, _i, _len, _ref, _ref1, _results;
      _ref = editor.getCursors();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cursor = _ref[_i];
        _ref1 = cursor.getScreenPosition(), row = _ref1.row, column = _ref1.column;
        range = [[row + 1, column], [row + 1, column + 1]];
        _results.push(cursor.selection.insertText(editor.getTextInBufferRange(editor.bufferRangeForScreenRange(range))));
      }
      return _results;
    });
  };

  module.exports = {
    copyCharacterFromAbove: copyCharacterFromAbove,
    copyCharacterFromBelow: copyCharacterFromBelow
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvaW5zZXJ0LW1vZGUuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBOztBQUFBLEVBQUEsc0JBQUEsR0FBeUIsU0FBQyxNQUFELEVBQVMsUUFBVCxHQUFBO1dBQ3ZCLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsMkRBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7MEJBQUE7QUFDRSxRQUFBLFFBQWdCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQWhCLEVBQUMsWUFBQSxHQUFELEVBQU0sZUFBQSxNQUFOLENBQUE7QUFDQSxRQUFBLElBQVksR0FBQSxLQUFPLENBQW5CO0FBQUEsbUJBQUE7U0FEQTtBQUFBLFFBRUEsS0FBQSxHQUFRLENBQUMsQ0FBQyxHQUFBLEdBQUksQ0FBTCxFQUFRLE1BQVIsQ0FBRCxFQUFrQixDQUFDLEdBQUEsR0FBSSxDQUFMLEVBQVEsTUFBQSxHQUFPLENBQWYsQ0FBbEIsQ0FGUixDQUFBO0FBQUEsc0JBR0EsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFqQixDQUE0QixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsTUFBTSxDQUFDLHlCQUFQLENBQWlDLEtBQWpDLENBQTVCLENBQTVCLEVBSEEsQ0FERjtBQUFBO3NCQURjO0lBQUEsQ0FBaEIsRUFEdUI7RUFBQSxDQUF6QixDQUFBOztBQUFBLEVBUUEsc0JBQUEsR0FBeUIsU0FBQyxNQUFELEVBQVMsUUFBVCxHQUFBO1dBQ3ZCLE1BQU0sQ0FBQyxRQUFQLENBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsMkRBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7MEJBQUE7QUFDRSxRQUFBLFFBQWdCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQWhCLEVBQUMsWUFBQSxHQUFELEVBQU0sZUFBQSxNQUFOLENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxDQUFDLENBQUMsR0FBQSxHQUFJLENBQUwsRUFBUSxNQUFSLENBQUQsRUFBa0IsQ0FBQyxHQUFBLEdBQUksQ0FBTCxFQUFRLE1BQUEsR0FBTyxDQUFmLENBQWxCLENBRFIsQ0FBQTtBQUFBLHNCQUVBLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBakIsQ0FBNEIsTUFBTSxDQUFDLG9CQUFQLENBQTRCLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxLQUFqQyxDQUE1QixDQUE1QixFQUZBLENBREY7QUFBQTtzQkFEYztJQUFBLENBQWhCLEVBRHVCO0VBQUEsQ0FSekIsQ0FBQTs7QUFBQSxFQWVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFDZix3QkFBQSxzQkFEZTtBQUFBLElBRWYsd0JBQUEsc0JBRmU7R0FmakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/insert-mode.coffee
