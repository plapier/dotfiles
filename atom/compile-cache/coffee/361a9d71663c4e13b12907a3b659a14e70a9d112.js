(function() {
  var SearchHistoryManager, _,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  module.exports = SearchHistoryManager = (function() {
    SearchHistoryManager.prototype.idx = null;

    function SearchHistoryManager(vimState) {
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      this.globalState = this.vimState.globalState;
      this.idx = -1;
      this.vimState.onDidDestroy(this.destroy);
    }

    SearchHistoryManager.prototype.get = function(direction) {
      var ref;
      switch (direction) {
        case 'prev':
          if ((this.idx + 1) !== this.getSize()) {
            this.idx += 1;
          }
          break;
        case 'next':
          if (!(this.idx === -1)) {
            this.idx -= 1;
          }
      }
      return (ref = this.globalState.get('searchHistory')[this.idx]) != null ? ref : '';
    };

    SearchHistoryManager.prototype.save = function(entry) {
      var entries;
      if (_.isEmpty(entry)) {
        return;
      }
      entries = this.globalState.get('searchHistory').slice();
      entries.unshift(entry);
      entries = _.uniq(entries);
      if (this.getSize() > this.vimState.getConfig('historySize')) {
        entries.splice(this.vimState.getConfig('historySize'));
      }
      return this.globalState.set('searchHistory', entries);
    };

    SearchHistoryManager.prototype.reset = function() {
      return this.idx = -1;
    };

    SearchHistoryManager.prototype.clear = function() {
      return this.globalState.reset('searchHistory');
    };

    SearchHistoryManager.prototype.getSize = function() {
      return this.globalState.get('searchHistory').length;
    };

    SearchHistoryManager.prototype.destroy = function() {
      return this.idx = null;
    };

    return SearchHistoryManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWFyY2gtaGlzdG9yeS1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLE1BQU0sQ0FBQyxPQUFQLEdBQ007bUNBQ0osR0FBQSxHQUFLOztJQUVRLDhCQUFDLFFBQUQ7TUFBQyxJQUFDLENBQUEsV0FBRDs7TUFDWCxJQUFDLENBQUEsY0FBZSxJQUFDLENBQUEsU0FBaEI7TUFDRixJQUFDLENBQUEsR0FBRCxHQUFPLENBQUM7TUFDUixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQXhCO0lBSFc7O21DQUtiLEdBQUEsR0FBSyxTQUFDLFNBQUQ7QUFDSCxVQUFBO0FBQUEsY0FBTyxTQUFQO0FBQUEsYUFDTyxNQURQO1VBQ21CLElBQWlCLENBQUMsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFSLENBQUEsS0FBYyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQS9CO1lBQUEsSUFBQyxDQUFBLEdBQUQsSUFBUSxFQUFSOztBQUFaO0FBRFAsYUFFTyxNQUZQO1VBRW1CLElBQUEsQ0FBaUIsQ0FBQyxJQUFDLENBQUEsR0FBRCxLQUFRLENBQUMsQ0FBVixDQUFqQjtZQUFBLElBQUMsQ0FBQSxHQUFELElBQVEsRUFBUjs7QUFGbkI7cUZBRzBDO0lBSnZDOzttQ0FNTCxJQUFBLEdBQU0sU0FBQyxLQUFEO0FBQ0osVUFBQTtNQUFBLElBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLENBQVY7QUFBQSxlQUFBOztNQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsZUFBakIsQ0FBaUMsQ0FBQyxLQUFsQyxDQUFBO01BQ1YsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsS0FBaEI7TUFDQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFQO01BQ1YsSUFBRyxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsR0FBYSxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsYUFBcEIsQ0FBaEI7UUFDRSxPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFvQixhQUFwQixDQUFmLEVBREY7O2FBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCLEVBQWtDLE9BQWxDO0lBUkk7O21DQVVOLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLEdBQUQsR0FBTyxDQUFDO0lBREg7O21DQUdQLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLFdBQVcsQ0FBQyxLQUFiLENBQW1CLGVBQW5CO0lBREs7O21DQUdQLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLGVBQWpCLENBQWlDLENBQUM7SUFEM0I7O21DQUdULE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLEdBQUQsR0FBTztJQURBOzs7OztBQXBDWCIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlYXJjaEhpc3RvcnlNYW5hZ2VyXG4gIGlkeDogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZ2xvYmFsU3RhdGV9ID0gQHZpbVN0YXRlXG4gICAgQGlkeCA9IC0xXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcblxuICBnZXQ6IChkaXJlY3Rpb24pIC0+XG4gICAgc3dpdGNoIGRpcmVjdGlvblxuICAgICAgd2hlbiAncHJldicgdGhlbiBAaWR4ICs9IDEgdW5sZXNzIChAaWR4ICsgMSkgaXMgQGdldFNpemUoKVxuICAgICAgd2hlbiAnbmV4dCcgdGhlbiBAaWR4IC09IDEgdW5sZXNzIChAaWR4IGlzIC0xKVxuICAgIEBnbG9iYWxTdGF0ZS5nZXQoJ3NlYXJjaEhpc3RvcnknKVtAaWR4XSA/ICcnXG5cbiAgc2F2ZTogKGVudHJ5KSAtPlxuICAgIHJldHVybiBpZiBfLmlzRW1wdHkoZW50cnkpXG5cbiAgICBlbnRyaWVzID0gQGdsb2JhbFN0YXRlLmdldCgnc2VhcmNoSGlzdG9yeScpLnNsaWNlKClcbiAgICBlbnRyaWVzLnVuc2hpZnQoZW50cnkpXG4gICAgZW50cmllcyA9IF8udW5pcShlbnRyaWVzKVxuICAgIGlmIEBnZXRTaXplKCkgPiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdoaXN0b3J5U2l6ZScpXG4gICAgICBlbnRyaWVzLnNwbGljZShAdmltU3RhdGUuZ2V0Q29uZmlnKCdoaXN0b3J5U2l6ZScpKVxuICAgIEBnbG9iYWxTdGF0ZS5zZXQoJ3NlYXJjaEhpc3RvcnknLCBlbnRyaWVzKVxuXG4gIHJlc2V0OiAtPlxuICAgIEBpZHggPSAtMVxuXG4gIGNsZWFyOiAtPlxuICAgIEBnbG9iYWxTdGF0ZS5yZXNldCgnc2VhcmNoSGlzdG9yeScpXG5cbiAgZ2V0U2l6ZTogLT5cbiAgICBAZ2xvYmFsU3RhdGUuZ2V0KCdzZWFyY2hIaXN0b3J5JykubGVuZ3RoXG5cbiAgZGVzdHJveTogPT5cbiAgICBAaWR4ID0gbnVsbFxuIl19
