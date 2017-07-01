(function() {
  var OperatorWithInput, Range, Replace, ViewModel, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  OperatorWithInput = require('./general-operators').OperatorWithInput;

  ViewModel = require('../view-models/view-model').ViewModel;

  Range = require('atom').Range;

  module.exports = Replace = (function(_super) {
    __extends(Replace, _super);

    function Replace(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      Replace.__super__.constructor.call(this, this.editor, this.vimState);
      this.viewModel = new ViewModel(this, {
        "class": 'replace',
        hidden: true,
        singleChar: true,
        defaultText: '\n'
      });
    }

    Replace.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      if (this.input.characters === "") {
        if (this.vimState.mode === "visual") {
          this.vimState.resetVisualMode();
        } else {
          this.vimState.activateNormalMode();
        }
        return;
      }
      this.editor.transact((function(_this) {
        return function() {
          var currentRowLength, cursor, point, pos, selection, _i, _j, _len, _len1, _ref, _ref1, _results;
          if (_this.motion != null) {
            if (_.contains(_this.motion.select(), true)) {
              _this.editor.replaceSelectedText(null, function(text) {
                return text.replace(/./g, _this.input.characters);
              });
              _ref = _this.editor.getSelections();
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                selection = _ref[_i];
                point = selection.getBufferRange().start;
                _results.push(selection.setBufferRange(Range.fromPointWithDelta(point, 0, 0)));
              }
              return _results;
            }
          } else {
            _ref1 = _this.editor.getCursors();
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              cursor = _ref1[_j];
              pos = cursor.getBufferPosition();
              currentRowLength = _this.editor.lineTextForBufferRow(pos.row).length;
              if (!(currentRowLength - pos.column >= count)) {
                continue;
              }
              _.times(count, function() {
                point = cursor.getBufferPosition();
                _this.editor.setTextInBufferRange(Range.fromPointWithDelta(point, 0, 1), _this.input.characters);
                return cursor.moveRight();
              });
              cursor.setBufferPosition(pos);
            }
            if (_this.input.characters === "\n") {
              _.times(count, function() {
                return _this.editor.moveDown();
              });
              return _this.editor.moveToFirstCharacterOfLine();
            }
          }
        };
      })(this));
      return this.vimState.activateNormalMode();
    };

    return Replace;

  })(OperatorWithInput);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvb3BlcmF0b3JzL3JlcGxhY2Utb3BlcmF0b3IuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLG9CQUFxQixPQUFBLENBQVEscUJBQVIsRUFBckIsaUJBREQsQ0FBQTs7QUFBQSxFQUVDLFlBQWEsT0FBQSxDQUFRLDJCQUFSLEVBQWIsU0FGRCxDQUFBOztBQUFBLEVBR0MsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBSEQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw4QkFBQSxDQUFBOztBQUFhLElBQUEsaUJBQUUsTUFBRixFQUFXLFFBQVgsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFEcUIsSUFBQyxDQUFBLFdBQUEsUUFDdEIsQ0FBQTtBQUFBLE1BQUEseUNBQU0sSUFBQyxDQUFBLE1BQVAsRUFBZSxJQUFDLENBQUEsUUFBaEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FBVSxJQUFWLEVBQWdCO0FBQUEsUUFBQSxPQUFBLEVBQU8sU0FBUDtBQUFBLFFBQWtCLE1BQUEsRUFBUSxJQUExQjtBQUFBLFFBQWdDLFVBQUEsRUFBWSxJQUE1QztBQUFBLFFBQWtELFdBQUEsRUFBYSxJQUEvRDtPQUFoQixDQURqQixDQURXO0lBQUEsQ0FBYjs7QUFBQSxzQkFJQSxPQUFBLEdBQVMsU0FBQyxLQUFELEdBQUE7O1FBQUMsUUFBTTtPQUNkO0FBQUEs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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/operators/replace-operator.coffee
