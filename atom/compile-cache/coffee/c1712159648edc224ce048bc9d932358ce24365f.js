(function() {
  var AdjustIndentation, Autoindent, Indent, Operator, Outdent, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  Operator = require('./general-operators').Operator;

  AdjustIndentation = (function(_super) {
    __extends(AdjustIndentation, _super);

    function AdjustIndentation() {
      return AdjustIndentation.__super__.constructor.apply(this, arguments);
    }

    AdjustIndentation.prototype.execute = function(count) {
      var mode, originalRanges, range, _i, _len;
      mode = this.vimState.mode;
      this.motion.select(count);
      originalRanges = this.editor.getSelectedBufferRanges();
      if (mode === 'visual') {
        this.editor.transact((function(_this) {
          return function() {
            return _.times(count != null ? count : 1, function() {
              return _this.indent();
            });
          };
        })(this));
      } else {
        this.indent();
      }
      this.editor.clearSelections();
      this.editor.getLastCursor().setBufferPosition([originalRanges.shift().start.row, 0]);
      for (_i = 0, _len = originalRanges.length; _i < _len; _i++) {
        range = originalRanges[_i];
        this.editor.addCursorAtBufferPosition([range.start.row, 0]);
      }
      this.editor.moveToFirstCharacterOfLine();
      return this.vimState.activateNormalMode();
    };

    return AdjustIndentation;

  })(Operator);

  Indent = (function(_super) {
    __extends(Indent, _super);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    Indent.prototype.indent = function() {
      return this.editor.indentSelectedRows();
    };

    return Indent;

  })(AdjustIndentation);

  Outdent = (function(_super) {
    __extends(Outdent, _super);

    function Outdent() {
      return Outdent.__super__.constructor.apply(this, arguments);
    }

    Outdent.prototype.indent = function() {
      return this.editor.outdentSelectedRows();
    };

    return Outdent;

  })(AdjustIndentation);

  Autoindent = (function(_super) {
    __extends(Autoindent, _super);

    function Autoindent() {
      return Autoindent.__super__.constructor.apply(this, arguments);
    }

    Autoindent.prototype.indent = function() {
      return this.editor.autoIndentSelectedRows();
    };

    return Autoindent;

  })(AdjustIndentation);

  module.exports = {
    Indent: Indent,
    Outdent: Outdent,
    Autoindent: Autoindent
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvb3BlcmF0b3JzL2luZGVudC1vcGVyYXRvcnMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFdBQVksT0FBQSxDQUFRLHFCQUFSLEVBQVosUUFERCxDQUFBOztBQUFBLEVBR007QUFDSix3Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsZ0NBQUEsT0FBQSxHQUFTLFNBQUMsS0FBRCxHQUFBO0FBQ1AsVUFBQSxxQ0FBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBakIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQWUsS0FBZixDQURBLENBQUE7QUFBQSxNQUVBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBRmpCLENBQUE7QUFJQSxNQUFBLElBQUcsSUFBQSxLQUFRLFFBQVg7QUFDRSxRQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDZixDQUFDLENBQUMsS0FBRixpQkFBUSxRQUFRLENBQWhCLEVBQW1CLFNBQUEsR0FBQTtxQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7WUFBQSxDQUFuQixFQURlO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakIsQ0FBQSxDQURGO09BQUEsTUFBQTtBQUlFLFFBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFBLENBSkY7T0FKQTtBQUFBLE1BVUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUEsQ0FWQSxDQUFBO0FBQUEsTUFXQSxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLGlCQUF4QixDQUEwQyxDQUFDLGNBQWMsQ0FBQyxLQUFmLENBQUEsQ0FBc0IsQ0FBQyxLQUFLLENBQUMsR0FBOUIsRUFBbUMsQ0FBbkMsQ0FBMUMsQ0FYQSxDQUFBO0FBWUEsV0FBQSxxREFBQTttQ0FBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx5QkFBUixDQUFrQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBYixFQUFrQixDQUFsQixDQUFsQyxDQUFBLENBREY7QUFBQSxPQVpBO0FBQUEsTUFjQSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQUEsQ0FkQSxDQUFBO2FBZUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxrQkFBVixDQUFBLEVBaEJPO0lBQUEsQ0FBVCxDQUFBOzs2QkFBQTs7S0FEOEIsU0FIaEMsQ0FBQTs7QUFBQSxFQXNCTTtBQUNKLDZCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxxQkFBQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUFBLEVBRE07SUFBQSxDQUFSLENBQUE7O2tCQUFBOztLQURtQixrQkF0QnJCLENBQUE7O0FBQUEsRUEwQk07QUFDSiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsc0JBQUEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBQSxFQURNO0lBQUEsQ0FBUixDQUFBOzttQkFBQTs7S0FEb0Isa0JBMUJ0QixDQUFBOztBQUFBLEVBOEJNO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHlCQUFBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFDLENBQUEsTUFBTSxDQUFDLHNCQUFSLENBQUEsRUFETTtJQUFBLENBQVIsQ0FBQTs7c0JBQUE7O0tBRHVCLGtCQTlCekIsQ0FBQTs7QUFBQSxFQWtDQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQUMsUUFBQSxNQUFEO0FBQUEsSUFBUyxTQUFBLE9BQVQ7QUFBQSxJQUFrQixZQUFBLFVBQWxCO0dBbENqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/operators/indent-operators.coffee
