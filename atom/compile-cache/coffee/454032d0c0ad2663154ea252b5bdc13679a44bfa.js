(function() {
  var CompositeDisposable, ScssSort, ScssSortView;

  ScssSortView = require('./scss-sort-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = ScssSort = {
    scssSortView: null,
    modalPanel: null,
    subscriptions: null,
    activate: function(state) {
      return atom.commands.add('atom-workspace', "scss-sort:sort", (function(_this) {
        return function() {
          return _this.sort();
        };
      })(this));
    },
    sort: function() {
      var editor, selection, sortedText, text, textArray;
      editor = atom.workspace.getActivePaneItem();
      selection = editor.getLastSelection();
      text = selection.getText();
      textArray = text.split('\n');
      sortedText = textArray.sort(function(a, b) {
        var newA, newB;
        newA = a.replace(/@include/i, '').replace(/-webkit-/i).replace(/-moz-/i);
        newB = b.replace(/@include/i, '').replace(/-webkit-/i).replace(/-moz-/i);
        if (newA > newB) {
          return 1;
        }
        if (newA < newB) {
          return -1;
        }
        return 0;
      });
      console.log(sortedText);
      return selection.insertText(sortedText.toString());
    },
    deactivate: function() {
      this.modalPanel.destroy();
      this.subscriptions.dispose();
      return this.scssSortView.destroy();
    },
    serialize: function() {
      return {
        scssSortViewState: this.scssSortView.serialize()
      };
    },
    toggle: function() {
      console.log('ScssSort was toggled!');
      if (this.modalPanel.isVisible()) {
        return this.modalPanel.hide();
      } else {
        return this.modalPanel.show();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUFmLENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDZjtBQUFBLElBQUEsWUFBQSxFQUFjLElBQWQ7QUFBQSxJQUNBLFVBQUEsRUFBWSxJQURaO0FBQUEsSUFFQSxhQUFBLEVBQWUsSUFGZjtBQUFBLElBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxnQkFBcEMsRUFBc0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RCxFQURRO0lBQUEsQ0FKVjtBQUFBLElBT0EsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsOENBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FEWixDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUZQLENBQUE7QUFBQSxNQUdBLFNBQUEsR0FBWSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FIWixDQUFBO0FBQUEsTUFJQSxVQUFBLEdBQWEsU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7QUFDMUIsWUFBQSxVQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxXQUFWLEVBQXVCLEVBQXZCLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsV0FBbkMsQ0FBK0MsQ0FBQyxPQUFoRCxDQUF3RCxRQUF4RCxDQUFQLENBQUE7QUFBQSxRQUNBLElBQUEsR0FBTyxDQUFDLENBQUMsT0FBRixDQUFVLFdBQVYsRUFBdUIsRUFBdkIsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxXQUFuQyxDQUErQyxDQUFDLE9BQWhELENBQXdELFFBQXhELENBRFAsQ0FBQTtBQUVBLFFBQUEsSUFBSSxJQUFBLEdBQU8sSUFBWDtBQUNFLGlCQUFPLENBQVAsQ0FERjtTQUZBO0FBSUEsUUFBQSxJQUFJLElBQUEsR0FBTyxJQUFYO0FBQ0UsaUJBQU8sQ0FBQSxDQUFQLENBREY7U0FKQTtBQU1BLGVBQU8sQ0FBUCxDQVAwQjtNQUFBLENBQWYsQ0FKYixDQUFBO0FBQUEsTUFZQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosQ0FaQSxDQUFBO2FBYUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsVUFBVSxDQUFDLFFBQVgsQ0FBQSxDQUFyQixFQWRJO0lBQUEsQ0FQTjtBQUFBLElBeUJBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQUEsRUFIVTtJQUFBLENBekJaO0FBQUEsSUE4QkEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFBQSxpQkFBQSxFQUFtQixJQUFDLENBQUEsWUFBWSxDQUFDLFNBQWQsQ0FBQSxDQUFuQjtRQURTO0lBQUEsQ0E5Qlg7QUFBQSxJQWlDQSxNQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLHVCQUFaLENBQUEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosQ0FBQSxDQUFIO2VBQ0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBQSxFQUhGO09BSE07SUFBQSxDQWpDUjtHQUpGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/lapier/github/scss-sort/lib/scss-sort.coffee