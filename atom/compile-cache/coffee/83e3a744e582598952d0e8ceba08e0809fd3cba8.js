(function() {
  var CompositeDisposable, HighlightSearchManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = HighlightSearchManager = (function() {
    function HighlightSearchManager(vimState) {
      var decorationOptions, ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement, this.globalState = ref.globalState;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy));
      this.disposables.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      decorationOptions = {
        type: 'highlight',
        "class": 'vim-mode-plus-highlight-search'
      };
      this.decorationLayer = this.editor.decorateMarkerLayer(this.markerLayer, decorationOptions);
    }

    HighlightSearchManager.prototype.destroy = function() {
      this.decorationLayer.destroy();
      this.disposables.dispose();
      return this.markerLayer.destroy();
    };

    HighlightSearchManager.prototype.hasMarkers = function() {
      return this.markerLayer.getMarkerCount() > 0;
    };

    HighlightSearchManager.prototype.getMarkers = function() {
      return this.markerLayer.getMarkers();
    };

    HighlightSearchManager.prototype.clearMarkers = function() {
      return this.markerLayer.clear();
    };

    HighlightSearchManager.prototype.refresh = function() {
      var i, len, pattern, range, ref, results;
      this.clearMarkers();
      if (!this.vimState.getConfig('highlightSearch')) {
        return;
      }
      if (!this.vimState.isVisible()) {
        return;
      }
      if (!(pattern = this.globalState.get('highlightSearchPattern'))) {
        return;
      }
      if (this.vimState.utils.matchScopes(this.editorElement, this.vimState.getConfig('highlightSearchExcludeScopes'))) {
        return;
      }
      ref = this.vimState.utils.scanEditor(this.editor, pattern);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        range = ref[i];
        if (!range.isEmpty()) {
          results.push(this.markerLayer.markBufferRange(range, {
            invalidate: 'inside'
          }));
        }
      }
      return results;
    };

    return HighlightSearchManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9oaWdobGlnaHQtc2VhcmNoLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFHeEIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLGdDQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7O01BQ1osTUFBMEMsSUFBQyxDQUFBLFFBQTNDLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxvQkFBQSxhQUFYLEVBQTBCLElBQUMsQ0FBQSxrQkFBQTtNQUMzQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFFbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEIsQ0FBakI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxpQkFBUixDQUEwQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQixDQUFqQjtNQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQUE7TUFDZixpQkFBQSxHQUFvQjtRQUFDLElBQUEsRUFBTSxXQUFQO1FBQW9CLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0NBQTNCOztNQUNwQixJQUFDLENBQUEsZUFBRCxHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLENBQTRCLElBQUMsQ0FBQSxXQUE3QixFQUEwQyxpQkFBMUM7SUFUUjs7cUNBV2IsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsZUFBZSxDQUFDLE9BQWpCLENBQUE7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBSE87O3FDQU9ULFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFiLENBQUEsQ0FBQSxHQUFnQztJQUR0Qjs7cUNBR1osVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQTtJQURVOztxQ0FHWixZQUFBLEdBQWMsU0FBQTthQUNaLElBQUMsQ0FBQSxXQUFXLENBQUMsS0FBYixDQUFBO0lBRFk7O3FDQUdkLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxZQUFELENBQUE7TUFFQSxJQUFBLENBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQW9CLGlCQUFwQixDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFBLENBQWMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxTQUFWLENBQUEsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQSxDQUFjLENBQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQix3QkFBakIsQ0FBVixDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQWhCLENBQTRCLElBQUMsQ0FBQSxhQUE3QixFQUE0QyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsOEJBQXBCLENBQTVDLENBQVY7QUFBQSxlQUFBOztBQUVBO0FBQUE7V0FBQSxxQ0FBQTs7WUFBK0QsQ0FBSSxLQUFLLENBQUMsT0FBTixDQUFBO3VCQUNqRSxJQUFDLENBQUEsV0FBVyxDQUFDLGVBQWIsQ0FBNkIsS0FBN0IsRUFBb0M7WUFBQSxVQUFBLEVBQVksUUFBWjtXQUFwQzs7QUFERjs7SUFSTzs7Ozs7QUFoQ1giLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG4jIEdlbmVyYWwgcHVycG9zZSB1dGlsaXR5IGNsYXNzIHRvIG1ha2UgQXRvbSdzIG1hcmtlciBtYW5hZ2VtZW50IGVhc2llci5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEhpZ2hsaWdodFNlYXJjaE1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50LCBAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgPT4gQHJlZnJlc2goKVxuXG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG4gICAgZGVjb3JhdGlvbk9wdGlvbnMgPSB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiAndmltLW1vZGUtcGx1cy1oaWdobGlnaHQtc2VhcmNoJ31cbiAgICBAZGVjb3JhdGlvbkxheWVyID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKEBtYXJrZXJMYXllciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgZGVzdHJveTogPT5cbiAgICBAZGVjb3JhdGlvbkxheWVyLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAbWFya2VyTGF5ZXIuZGVzdHJveSgpXG5cbiAgIyBNYXJrZXJzXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoYXNNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpID4gMFxuXG4gIGdldE1hcmtlcnM6IC0+XG4gICAgQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKVxuXG4gIGNsZWFyTWFya2VyczogLT5cbiAgICBAbWFya2VyTGF5ZXIuY2xlYXIoKVxuXG4gIHJlZnJlc2g6IC0+XG4gICAgQGNsZWFyTWFya2VycygpXG5cbiAgICByZXR1cm4gdW5sZXNzIEB2aW1TdGF0ZS5nZXRDb25maWcoJ2hpZ2hsaWdodFNlYXJjaCcpXG4gICAgcmV0dXJuIHVubGVzcyBAdmltU3RhdGUuaXNWaXNpYmxlKClcbiAgICByZXR1cm4gdW5sZXNzIHBhdHRlcm4gPSBAZ2xvYmFsU3RhdGUuZ2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJylcbiAgICByZXR1cm4gaWYgQHZpbVN0YXRlLnV0aWxzLm1hdGNoU2NvcGVzKEBlZGl0b3JFbGVtZW50LCBAdmltU3RhdGUuZ2V0Q29uZmlnKCdoaWdobGlnaHRTZWFyY2hFeGNsdWRlU2NvcGVzJykpXG5cbiAgICBmb3IgcmFuZ2UgaW4gQHZpbVN0YXRlLnV0aWxzLnNjYW5FZGl0b3IoQGVkaXRvciwgcGF0dGVybikgd2hlbiBub3QgcmFuZ2UuaXNFbXB0eSgpXG4gICAgICBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlLCBpbnZhbGlkYXRlOiAnaW5zaWRlJylcbiJdfQ==
