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
      var editor, selection;
      editor = atom.workspace.getActivePaneItem();
      selection = editor.getLastSelection();
      editor.insertText('Hello, World!');
      return console.log(selection);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJDQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUFmLENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQUEsR0FDZjtBQUFBLElBQUEsWUFBQSxFQUFjLElBQWQ7QUFBQSxJQUNBLFVBQUEsRUFBWSxJQURaO0FBQUEsSUFFQSxhQUFBLEVBQWUsSUFGZjtBQUFBLElBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyxnQkFBcEMsRUFBc0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RCxFQURRO0lBQUEsQ0FKVjtBQUFBLElBT0EsSUFBQSxFQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsaUJBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBVCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FEWixDQUFBO0FBQUEsTUFFQSxNQUFNLENBQUMsVUFBUCxDQUFrQixlQUFsQixDQUZBLENBQUE7YUFHQSxPQUFPLENBQUMsR0FBUixDQUFZLFNBQVosRUFKSTtJQUFBLENBUE47QUFBQSxJQWFBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FEQSxDQUFBO2FBRUEsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQUEsRUFIVTtJQUFBLENBYlo7QUFBQSxJQWtCQSxTQUFBLEVBQVcsU0FBQSxHQUFBO2FBQ1Q7QUFBQSxRQUFBLGlCQUFBLEVBQW1CLElBQUMsQ0FBQSxZQUFZLENBQUMsU0FBZCxDQUFBLENBQW5CO1FBRFM7SUFBQSxDQWxCWDtBQUFBLElBcUJBLE1BQUEsRUFBUSxTQUFBLEdBQUE7QUFDTixNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksdUJBQVosQ0FBQSxDQUFBO0FBRUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFBLEVBSEY7T0FITTtJQUFBLENBckJSO0dBSkYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/lapier/github/scss-sort/lib/scss-sort.coffee