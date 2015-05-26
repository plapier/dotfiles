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
      sortedText = textArray.sort((function(_this) {
        return function(a, b) {
          var newA, newB;
          newA = a.str.replace(/@include/i, '');
          newB = b.str.replace(/@include/i, '');
          if (newA > newB) {
            return 1;
          }
          if (newA < newB) {
            return -1;
          }
          return 0;
        };
      })(this));
      return console.log(sortedText);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUFmLENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDZjtBQUFBLElBQUEsWUFBQSxFQUFjLElBQWQ7QUFBQSxJQUNBLFVBQUEsRUFBWSxJQURaO0FBQUEsSUFFQSxhQUFBLEVBQWUsSUFGZjtBQUFBLElBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxnQkFBcEMsRUFBc0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RCxFQURRO0lBQUEsQ0FKVjtBQUFBLElBT0EsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsOENBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FEWixDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUZQLENBQUE7QUFBQSxNQUdBLFNBQUEsR0FBWSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FIWixDQUFBO0FBQUEsTUFJQSxVQUFBLEdBQWEsU0FBUyxDQUFDLElBQVYsQ0FBZSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxDQUFELEVBQUksQ0FBSixHQUFBO0FBQzFCLGNBQUEsVUFBQTtBQUFBLFVBQUEsSUFBQSxHQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTixDQUFjLFdBQWQsRUFBMkIsRUFBM0IsQ0FBUCxDQUFBO0FBQUEsVUFDQSxJQUFBLEdBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFOLENBQWMsV0FBZCxFQUEyQixFQUEzQixDQURQLENBQUE7QUFFQSxVQUFBLElBQUksSUFBQSxHQUFPLElBQVg7QUFDRSxtQkFBTyxDQUFQLENBREY7V0FGQTtBQUlBLFVBQUEsSUFBSSxJQUFBLEdBQU8sSUFBWDtBQUNFLG1CQUFPLENBQUEsQ0FBUCxDQURGO1dBSkE7QUFNQSxpQkFBTyxDQUFQLENBUDBCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZixDQUpiLENBQUE7YUFhQSxPQUFPLENBQUMsR0FBUixDQUFZLFVBQVosRUFkSTtJQUFBLENBUE47QUFBQSxJQXlCQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBLEVBSFU7SUFBQSxDQXpCWjtBQUFBLElBOEJBLFNBQUEsRUFBVyxTQUFBLEdBQUE7YUFDVDtBQUFBLFFBQUEsaUJBQUEsRUFBbUIsSUFBQyxDQUFBLFlBQVksQ0FBQyxTQUFkLENBQUEsQ0FBbkI7UUFEUztJQUFBLENBOUJYO0FBQUEsSUFpQ0EsTUFBQSxFQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSx1QkFBWixDQUFBLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQUEsRUFIRjtPQUhNO0lBQUEsQ0FqQ1I7R0FKRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/lapier/github/scss-sort/lib/scss-sort.coffee