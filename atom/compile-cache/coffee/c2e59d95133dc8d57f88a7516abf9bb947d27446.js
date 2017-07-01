(function() {
  var Find, MotionWithInput, Point, Range, Till, ViewModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MotionWithInput = require('./general-motions').MotionWithInput;

  ViewModel = require('../view-models/view-model').ViewModel;

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  Find = (function(_super) {
    __extends(Find, _super);

    Find.prototype.operatesInclusively = true;

    function Find(editor, vimState, opts) {
      var orig;
      this.editor = editor;
      this.vimState = vimState;
      if (opts == null) {
        opts = {};
      }
      Find.__super__.constructor.call(this, this.editor, this.vimState);
      this.offset = 0;
      if (!opts.repeated) {
        this.viewModel = new ViewModel(this, {
          "class": 'find',
          singleChar: true,
          hidden: true
        });
        this.backwards = false;
        this.repeated = false;
        this.vimState.globalVimState.currentFind = this;
      } else {
        this.repeated = true;
        orig = this.vimState.globalVimState.currentFind;
        this.backwards = orig.backwards;
        this.complete = orig.complete;
        this.input = orig.input;
        if (opts.reverse) {
          this.reverse();
        }
      }
    }

    Find.prototype.match = function(cursor, count) {
      var currentPosition, i, index, line, _i, _j, _ref1, _ref2;
      currentPosition = cursor.getBufferPosition();
      line = this.editor.lineTextForBufferRow(currentPosition.row);
      if (this.backwards) {
        index = currentPosition.column;
        for (i = _i = 0, _ref1 = count - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
          if (index <= 0) {
            return;
          }
          index = line.lastIndexOf(this.input.characters, index - 1 - (this.offset * this.repeated));
        }
        if (index >= 0) {
          return new Point(currentPosition.row, index + this.offset);
        }
      } else {
        index = currentPosition.column;
        for (i = _j = 0, _ref2 = count - 1; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = 0 <= _ref2 ? ++_j : --_j) {
          index = line.indexOf(this.input.characters, index + 1 + (this.offset * this.repeated));
          if (index < 0) {
            return;
          }
        }
        if (index >= 0) {
          return new Point(currentPosition.row, index - this.offset);
        }
      }
    };

    Find.prototype.reverse = function() {
      this.backwards = !this.backwards;
      return this;
    };

    Find.prototype.moveCursor = function(cursor, count) {
      var match;
      if (count == null) {
        count = 1;
      }
      if ((match = this.match(cursor, count)) != null) {
        return cursor.setBufferPosition(match);
      }
    };

    return Find;

  })(MotionWithInput);

  Till = (function(_super) {
    __extends(Till, _super);

    function Till(editor, vimState, opts) {
      this.editor = editor;
      this.vimState = vimState;
      if (opts == null) {
        opts = {};
      }
      Till.__super__.constructor.call(this, this.editor, this.vimState, opts);
      this.offset = 1;
    }

    Till.prototype.match = function() {
      var retval;
      this.selectAtLeastOne = false;
      retval = Till.__super__.match.apply(this, arguments);
      if ((retval != null) && !this.backwards) {
        this.selectAtLeastOne = true;
      }
      return retval;
    };

    Till.prototype.moveSelectionInclusively = function(selection, count, options) {
      Till.__super__.moveSelectionInclusively.apply(this, arguments);
      if (selection.isEmpty() && this.selectAtLeastOne) {
        return selection.modifySelection(function() {
          return selection.cursor.moveRight();
        });
      }
    };

    return Till;

  })(Find);

  module.exports = {
    Find: Find,
    Till: Till
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvbW90aW9ucy9maW5kLW1vdGlvbi5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMERBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLGtCQUFtQixPQUFBLENBQVEsbUJBQVIsRUFBbkIsZUFBRCxDQUFBOztBQUFBLEVBQ0MsWUFBYSxPQUFBLENBQVEsMkJBQVIsRUFBYixTQURELENBQUE7O0FBQUEsRUFFQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FGUixDQUFBOztBQUFBLEVBSU07QUFDSiwyQkFBQSxDQUFBOztBQUFBLG1CQUFBLG1CQUFBLEdBQXFCLElBQXJCLENBQUE7O0FBRWEsSUFBQSxjQUFFLE1BQUYsRUFBVyxRQUFYLEVBQXFCLElBQXJCLEdBQUE7QUFDWCxVQUFBLElBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BRHFCLElBQUMsQ0FBQSxXQUFBLFFBQ3RCLENBQUE7O1FBRGdDLE9BQUs7T0FDckM7QUFBQSxNQUFBLHNDQUFNLElBQUMsQ0FBQSxNQUFQLEVBQWUsSUFBQyxDQUFBLFFBQWhCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQURWLENBQUE7QUFHQSxNQUFBLElBQUcsQ0FBQSxJQUFRLENBQUMsUUFBWjtBQUNFLFFBQUEsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxTQUFBLENBQVUsSUFBVixFQUFnQjtBQUFBLFVBQUEsT0FBQSxFQUFPLE1BQVA7QUFBQSxVQUFlLFVBQUEsRUFBWSxJQUEzQjtBQUFBLFVBQWlDLE1BQUEsRUFBUSxJQUF6QztTQUFoQixD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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/motions/find-motion.coffee
