(function() {
  var LanguageSketchpluginView;

  LanguageSketchpluginView = require('./language-sketchplugin-view');

  module.exports = {
    languageSketchpluginView: null,
    activate: function(state) {
      return this.languageSketchpluginView = new LanguageSketchpluginView(state.languageSketchpluginViewState);
    },
    deactivate: function() {
      return this.languageSketchpluginView.destroy();
    },
    serialize: function() {
      return {
        languageSketchpluginViewState: this.languageSketchpluginView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGFuZ3VhZ2Utc2tldGNocGx1Z2luL2xpYi9sYW5ndWFnZS1za2V0Y2hwbHVnaW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSx3QkFBQSxHQUEyQixPQUFBLENBQVEsOEJBQVI7O0VBRTNCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSx3QkFBQSxFQUEwQixJQUExQjtJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFDUixJQUFDLENBQUEsd0JBQUQsR0FBZ0MsSUFBQSx3QkFBQSxDQUF5QixLQUFLLENBQUMsNkJBQS9CO0lBRHhCLENBRlY7SUFLQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxPQUExQixDQUFBO0lBRFUsQ0FMWjtJQVFBLFNBQUEsRUFBVyxTQUFBO2FBQ1Q7UUFBQSw2QkFBQSxFQUErQixJQUFDLENBQUEsd0JBQXdCLENBQUMsU0FBMUIsQ0FBQSxDQUEvQjs7SUFEUyxDQVJYOztBQUhGIiwic291cmNlc0NvbnRlbnQiOlsiTGFuZ3VhZ2VTa2V0Y2hwbHVnaW5WaWV3ID0gcmVxdWlyZSAnLi9sYW5ndWFnZS1za2V0Y2hwbHVnaW4tdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBsYW5ndWFnZVNrZXRjaHBsdWdpblZpZXc6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBsYW5ndWFnZVNrZXRjaHBsdWdpblZpZXcgPSBuZXcgTGFuZ3VhZ2VTa2V0Y2hwbHVnaW5WaWV3KHN0YXRlLmxhbmd1YWdlU2tldGNocGx1Z2luVmlld1N0YXRlKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGxhbmd1YWdlU2tldGNocGx1Z2luVmlldy5kZXN0cm95KClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgbGFuZ3VhZ2VTa2V0Y2hwbHVnaW5WaWV3U3RhdGU6IEBsYW5ndWFnZVNrZXRjaHBsdWdpblZpZXcuc2VyaWFsaXplKClcbiJdfQ==
