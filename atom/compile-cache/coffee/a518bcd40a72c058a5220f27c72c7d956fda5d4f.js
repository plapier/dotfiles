(function() {
  var Emitter, GlobalState, getInitialState;

  Emitter = require('atom').Emitter;

  GlobalState = (function() {
    function GlobalState(state) {
      this.state = state;
      this.emitter = new Emitter;
      this.onDidChange((function(_this) {
        return function(arg) {
          var name, newValue;
          name = arg.name, newValue = arg.newValue;
          if (name === 'lastSearchPattern') {
            return _this.set('highlightSearchPattern', newValue);
          }
        };
      })(this));
    }

    GlobalState.prototype.get = function(name) {
      return this.state[name];
    };

    GlobalState.prototype.set = function(name, newValue) {
      var oldValue;
      oldValue = this.get(name);
      this.state[name] = newValue;
      return this.emitDidChange({
        name: name,
        oldValue: oldValue,
        newValue: newValue
      });
    };

    GlobalState.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    GlobalState.prototype.emitDidChange = function(event) {
      return this.emitter.emit('did-change', event);
    };

    GlobalState.prototype.reset = function(name) {
      var initialState;
      initialState = getInitialState();
      if (name != null) {
        return this.set(name, initialState[name]);
      } else {
        return this.state = initialState;
      }
    };

    return GlobalState;

  })();

  getInitialState = function() {
    return {
      searchHistory: [],
      currentSearch: null,
      lastSearchPattern: null,
      lastOccurrencePattern: null,
      lastOccurrenceType: null,
      highlightSearchPattern: null,
      currentFind: null,
      register: {},
      demoModeIsActive: false
    };
  };

  module.exports = new GlobalState(getInitialState());

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9nbG9iYWwtc3RhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUVOO0lBQ1MscUJBQUMsS0FBRDtNQUFDLElBQUMsQ0FBQSxRQUFEO01BQ1osSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BRWYsSUFBQyxDQUFBLFdBQUQsQ0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUVYLGNBQUE7VUFGYSxpQkFBTTtVQUVuQixJQUFHLElBQUEsS0FBUSxtQkFBWDttQkFDRSxLQUFDLENBQUEsR0FBRCxDQUFLLHdCQUFMLEVBQStCLFFBQS9CLEVBREY7O1FBRlc7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWI7SUFIVzs7MEJBUWIsR0FBQSxHQUFLLFNBQUMsSUFBRDthQUNILElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQTtJQURKOzswQkFHTCxHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sUUFBUDtBQUNILFVBQUE7TUFBQSxRQUFBLEdBQVcsSUFBQyxDQUFBLEdBQUQsQ0FBSyxJQUFMO01BQ1gsSUFBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBZTthQUNmLElBQUMsQ0FBQSxhQUFELENBQWU7UUFBQyxNQUFBLElBQUQ7UUFBTyxVQUFBLFFBQVA7UUFBaUIsVUFBQSxRQUFqQjtPQUFmO0lBSEc7OzBCQUtMLFdBQUEsR0FBYSxTQUFDLEVBQUQ7YUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxZQUFaLEVBQTBCLEVBQTFCO0lBRFc7OzBCQUdiLGFBQUEsR0FBZSxTQUFDLEtBQUQ7YUFDYixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkLEVBQTRCLEtBQTVCO0lBRGE7OzBCQUdmLEtBQUEsR0FBTyxTQUFDLElBQUQ7QUFDTCxVQUFBO01BQUEsWUFBQSxHQUFlLGVBQUEsQ0FBQTtNQUNmLElBQUcsWUFBSDtlQUNFLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTCxFQUFXLFlBQWEsQ0FBQSxJQUFBLENBQXhCLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLEtBQUQsR0FBUyxhQUhYOztJQUZLOzs7Ozs7RUFPVCxlQUFBLEdBQWtCLFNBQUE7V0FDaEI7TUFBQSxhQUFBLEVBQWUsRUFBZjtNQUNBLGFBQUEsRUFBZSxJQURmO01BRUEsaUJBQUEsRUFBbUIsSUFGbkI7TUFHQSxxQkFBQSxFQUF1QixJQUh2QjtNQUlBLGtCQUFBLEVBQW9CLElBSnBCO01BS0Esc0JBQUEsRUFBd0IsSUFMeEI7TUFNQSxXQUFBLEVBQWEsSUFOYjtNQU9BLFFBQUEsRUFBVSxFQVBWO01BUUEsZ0JBQUEsRUFBa0IsS0FSbEI7O0VBRGdCOztFQVdsQixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFdBQUEsQ0FBWSxlQUFBLENBQUEsQ0FBWjtBQTNDckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5jbGFzcyBHbG9iYWxTdGF0ZVxuICBjb25zdHJ1Y3RvcjogKEBzdGF0ZSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBAb25EaWRDaGFuZ2UgKHtuYW1lLCBuZXdWYWx1ZX0pID0+XG4gICAgICAjIGF1dG8gc3luYyB2YWx1ZSwgYnV0IGhpZ2hsaWdodFNlYXJjaFBhdHRlcm4gaXMgc29sZWx5IGNsZWFyZWQgdG8gY2xlYXIgaGxzZWFyY2guXG4gICAgICBpZiBuYW1lIGlzICdsYXN0U2VhcmNoUGF0dGVybidcbiAgICAgICAgQHNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG5ld1ZhbHVlKVxuXG4gIGdldDogKG5hbWUpIC0+XG4gICAgQHN0YXRlW25hbWVdXG5cbiAgc2V0OiAobmFtZSwgbmV3VmFsdWUpIC0+XG4gICAgb2xkVmFsdWUgPSBAZ2V0KG5hbWUpXG4gICAgQHN0YXRlW25hbWVdID0gbmV3VmFsdWVcbiAgICBAZW1pdERpZENoYW5nZSh7bmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlfSlcblxuICBvbkRpZENoYW5nZTogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtY2hhbmdlJywgZm4pXG5cbiAgZW1pdERpZENoYW5nZTogKGV2ZW50KSAtPlxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnLCBldmVudClcblxuICByZXNldDogKG5hbWUpIC0+XG4gICAgaW5pdGlhbFN0YXRlID0gZ2V0SW5pdGlhbFN0YXRlKClcbiAgICBpZiBuYW1lP1xuICAgICAgQHNldChuYW1lLCBpbml0aWFsU3RhdGVbbmFtZV0pXG4gICAgZWxzZVxuICAgICAgQHN0YXRlID0gaW5pdGlhbFN0YXRlXG5cbmdldEluaXRpYWxTdGF0ZSA9IC0+XG4gIHNlYXJjaEhpc3Rvcnk6IFtdXG4gIGN1cnJlbnRTZWFyY2g6IG51bGxcbiAgbGFzdFNlYXJjaFBhdHRlcm46IG51bGxcbiAgbGFzdE9jY3VycmVuY2VQYXR0ZXJuOiBudWxsXG4gIGxhc3RPY2N1cnJlbmNlVHlwZTogbnVsbFxuICBoaWdobGlnaHRTZWFyY2hQYXR0ZXJuOiBudWxsXG4gIGN1cnJlbnRGaW5kOiBudWxsXG4gIHJlZ2lzdGVyOiB7fVxuICBkZW1vTW9kZUlzQWN0aXZlOiBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHbG9iYWxTdGF0ZShnZXRJbml0aWFsU3RhdGUoKSlcbiJdfQ==
