(function() {
  var SearchViewModel, ViewModel,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ViewModel = require('./view-model').ViewModel;

  module.exports = SearchViewModel = (function(_super) {
    __extends(SearchViewModel, _super);

    function SearchViewModel(searchMotion) {
      this.searchMotion = searchMotion;
      this.confirm = __bind(this.confirm, this);
      this.decreaseHistorySearch = __bind(this.decreaseHistorySearch, this);
      this.increaseHistorySearch = __bind(this.increaseHistorySearch, this);
      SearchViewModel.__super__.constructor.call(this, this.searchMotion, {
        "class": 'search'
      });
      this.historyIndex = -1;
      atom.commands.add(this.view.editorElement, 'core:move-up', this.increaseHistorySearch);
      atom.commands.add(this.view.editorElement, 'core:move-down', this.decreaseHistorySearch);
    }

    SearchViewModel.prototype.restoreHistory = function(index) {
      return this.view.editorElement.getModel().setText(this.history(index));
    };

    SearchViewModel.prototype.history = function(index) {
      return this.vimState.getSearchHistoryItem(index);
    };

    SearchViewModel.prototype.increaseHistorySearch = function() {
      if (this.history(this.historyIndex + 1) != null) {
        this.historyIndex += 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    SearchViewModel.prototype.decreaseHistorySearch = function() {
      if (this.historyIndex <= 0) {
        this.historyIndex = -1;
        return this.view.editorElement.getModel().setText('');
      } else {
        this.historyIndex -= 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    SearchViewModel.prototype.confirm = function(view) {
      var lastSearch, repeatChar;
      repeatChar = this.searchMotion.initiallyReversed ? '?' : '/';
      if (this.view.value === '' || this.view.value === repeatChar) {
        lastSearch = this.history(0);
        if (lastSearch != null) {
          this.view.value = lastSearch;
        } else {
          this.view.value = '';
          atom.beep();
        }
      }
      SearchViewModel.__super__.confirm.call(this, view);
      return this.vimState.pushSearchHistory(this.view.value);
    };

    SearchViewModel.prototype.update = function(reverse) {
      if (reverse) {
        this.view.classList.add('reverse-search-input');
        return this.view.classList.remove('search-input');
      } else {
        this.view.classList.add('search-input');
        return this.view.classList.remove('reverse-search-input');
      }
    };

    return SearchViewModel;

  })(ViewModel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvdmlldy1tb2RlbHMvc2VhcmNoLXZpZXctbW9kZWwuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsWUFBYSxPQUFBLENBQVEsY0FBUixFQUFiLFNBQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixzQ0FBQSxDQUFBOztBQUFhLElBQUEseUJBQUUsWUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsZUFBQSxZQUNiLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsMkVBQUEsQ0FBQTtBQUFBLDJFQUFBLENBQUE7QUFBQSxNQUFBLGlEQUFNLElBQUMsQ0FBQSxZQUFQLEVBQXFCO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFyQixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUEsQ0FEaEIsQ0FBQTtBQUFBLE1BR0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBeEIsRUFBdUMsY0FBdkMsRUFBdUQsSUFBQyxDQUFBLHFCQUF4RCxDQUhBLENBQUE7QUFBQSxNQUlBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsSUFBSSxDQUFDLGFBQXhCLEVBQXVDLGdCQUF2QyxFQUF5RCxJQUFDLENBQUEscUJBQTFELENBSkEsQ0FEVztJQUFBLENBQWI7O0FBQUEsOEJBT0EsY0FBQSxHQUFnQixTQUFDLEtBQUQsR0FBQTthQUNkLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQXBCLENBQUEsQ0FBOEIs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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/view-models/search-view-model.coffee
