(function() {
  var MotionWithInput, MoveToFirstCharacterOfLine, MoveToMark, Point, Range, ViewModel, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('./general-motions'), MotionWithInput = _ref.MotionWithInput, MoveToFirstCharacterOfLine = _ref.MoveToFirstCharacterOfLine;

  ViewModel = require('../view-models/view-model').ViewModel;

  _ref1 = require('atom'), Point = _ref1.Point, Range = _ref1.Range;

  module.exports = MoveToMark = (function(_super) {
    __extends(MoveToMark, _super);

    function MoveToMark(editor, vimState, linewise) {
      this.editor = editor;
      this.vimState = vimState;
      this.linewise = linewise != null ? linewise : true;
      MoveToMark.__super__.constructor.call(this, this.editor, this.vimState);
      this.operatesLinewise = this.linewise;
      this.viewModel = new ViewModel(this, {
        "class": 'move-to-mark',
        singleChar: true,
        hidden: true
      });
    }

    MoveToMark.prototype.isLinewise = function() {
      return this.linewise;
    };

    MoveToMark.prototype.moveCursor = function(cursor, count) {
      var markPosition;
      if (count == null) {
        count = 1;
      }
      markPosition = this.vimState.getMark(this.input.characters);
      if (this.input.characters === '`') {
        if (markPosition == null) {
          markPosition = [0, 0];
        }
        this.vimState.setMark('`', cursor.getBufferPosition());
      }
      if (markPosition != null) {
        cursor.setBufferPosition(markPosition);
      }
      if (this.linewise) {
        return cursor.moveToFirstCharacterOfLine();
      }
    };

    return MoveToMark;

  })(MotionWithInput);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvbW90aW9ucy9tb3ZlLXRvLW1hcmstbW90aW9uLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2RkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBZ0QsT0FBQSxDQUFRLG1CQUFSLENBQWhELEVBQUMsdUJBQUEsZUFBRCxFQUFrQixrQ0FBQSwwQkFBbEIsQ0FBQTs7QUFBQSxFQUNDLFlBQWEsT0FBQSxDQUFRLDJCQUFSLEVBQWIsU0FERCxDQUFBOztBQUFBLEVBRUEsUUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxjQUFBLEtBQUQsRUFBUSxjQUFBLEtBRlIsQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixpQ0FBQSxDQUFBOztBQUFhLElBQUEsb0JBQUUsTUFBRixFQUFXLFFBQVgsRUFBc0IsUUFBdEIsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFEcUIsSUFBQyxDQUFBLFdBQUEsUUFDdEIsQ0FBQTtBQUFBLE1BRGdDLElBQUMsQ0FBQSw4QkFBQSxXQUFTLElBQzFDLENBQUE7QUFBQSxNQUFBLDRDQUFNLElBQUMsQ0FBQSxNQUFQLEVBQWUsSUFBQyxDQUFBLFFBQWhCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUMsQ0FBQSxRQURyQixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FBVSxJQUFWLEVBQWdCO0FBQUEsUUFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLFFBQXVCLFVBQUEsRUFBWSxJQUFuQztBQUFBLFFBQXlDLE1BQUEsRUFBUSxJQUFqRDtPQUFoQixDQUZqQixDQURXO0lBQUEsQ0FBYjs7QUFBQSx5QkFLQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFNBQUo7SUFBQSxDQUxaLENBQUE7O0FBQUEseUJBT0EsVUFBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLEtBQVQsR0FBQTtBQUNWLFVBQUEsWUFBQTs7UUFEbUIsUUFBTTtPQUN6QjtBQUFBLE1BQUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixJQUFDLENBQUEsS0FBSyxDQUFDLFVBQXpCLENBQWYsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsS0FBcUIsR0FBeEI7O1VBQ0UsZUFBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSjtTQUFoQjtBQUFBLFFBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQWtCLEdBQWxCLEVBQXVCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQXZCLENBREEsQ0FERjtPQUZBO0FBTUEsTUFBQSxJQUEwQyxvQkFBMUM7QUFBQSxRQUFBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixZQUF6QixDQUFBLENBQUE7T0FOQTtBQU9BLE1BQUEsSUFBRyxJQUFDLENBQUEsUUFBSjtlQUNFLE1BQU0sQ0FBQywwQkFBUCxDQUFBLEVBREY7T0FSVTtJQUFBLENBUFosQ0FBQTs7c0JBQUE7O0tBRHVCLGdCQUx6QixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/motions/move-to-mark-motion.coffee
