(function() {
  var LanguageSketchpluginView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('atom').View;

  module.exports = LanguageSketchpluginView = (function(superClass) {
    extend(LanguageSketchpluginView, superClass);

    function LanguageSketchpluginView() {
      return LanguageSketchpluginView.__super__.constructor.apply(this, arguments);
    }

    LanguageSketchpluginView.content = function() {
      return this.div({
        "class": 'language-sketchplugin overlay from-top'
      }, (function(_this) {
        return function() {
          return _this.div("The LanguageSketchplugin package is Alive! It's ALIVE!", {
            "class": "message"
          });
        };
      })(this));
    };

    LanguageSketchpluginView.prototype.initialize = function(serializeState) {
      return atom.workspaceView.command("language-sketchplugin:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    };

    LanguageSketchpluginView.prototype.serialize = function() {};

    LanguageSketchpluginView.prototype.destroy = function() {
      return this.detach();
    };

    LanguageSketchpluginView.prototype.toggle = function() {
      console.log("LanguageSketchpluginView was toggled!");
      if (this.hasParent()) {
        return this.detach();
      } else {
        return atom.workspaceView.append(this);
      }
    };

    return LanguageSketchpluginView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGFuZ3VhZ2Utc2tldGNocGx1Z2luL2xpYi9sYW5ndWFnZS1za2V0Y2hwbHVnaW4tdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhCQUFBO0lBQUE7OztFQUFDLE9BQVEsT0FBQSxDQUFRLE1BQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLHdCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx3Q0FBUDtPQUFMLEVBQXNELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDcEQsS0FBQyxDQUFBLEdBQUQsQ0FBSyx3REFBTCxFQUErRDtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtXQUEvRDtRQURvRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEQ7SUFEUTs7dUNBSVYsVUFBQSxHQUFZLFNBQUMsY0FBRDthQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsOEJBQTNCLEVBQTJELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNEO0lBRFU7O3VDQUlaLFNBQUEsR0FBVyxTQUFBLEdBQUE7O3VDQUdYLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQURPOzt1Q0FHVCxNQUFBLEdBQVEsU0FBQTtNQUNOLE9BQU8sQ0FBQyxHQUFSLENBQVksdUNBQVo7TUFDQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQW5CLENBQTBCLElBQTFCLEVBSEY7O0lBRk07Ozs7S0FmNkI7QUFIdkMiLCJzb3VyY2VzQ29udGVudCI6WyJ7Vmlld30gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMYW5ndWFnZVNrZXRjaHBsdWdpblZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdsYW5ndWFnZS1za2V0Y2hwbHVnaW4gb3ZlcmxheSBmcm9tLXRvcCcsID0+XG4gICAgICBAZGl2IFwiVGhlIExhbmd1YWdlU2tldGNocGx1Z2luIHBhY2thZ2UgaXMgQWxpdmUhIEl0J3MgQUxJVkUhXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuXG4gIGluaXRpYWxpemU6IChzZXJpYWxpemVTdGF0ZSkgLT5cbiAgICBhdG9tLndvcmtzcGFjZVZpZXcuY29tbWFuZCBcImxhbmd1YWdlLXNrZXRjaHBsdWdpbjp0b2dnbGVcIiwgPT4gQHRvZ2dsZSgpXG5cbiAgIyBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNhbiBiZSByZXRyaWV2ZWQgd2hlbiBwYWNrYWdlIGlzIGFjdGl2YXRlZFxuICBzZXJpYWxpemU6IC0+XG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogLT5cbiAgICBAZGV0YWNoKClcblxuICB0b2dnbGU6IC0+XG4gICAgY29uc29sZS5sb2cgXCJMYW5ndWFnZVNrZXRjaHBsdWdpblZpZXcgd2FzIHRvZ2dsZWQhXCJcbiAgICBpZiBAaGFzUGFyZW50KClcbiAgICAgIEBkZXRhY2goKVxuICAgIGVsc2VcbiAgICAgIGF0b20ud29ya3NwYWNlVmlldy5hcHBlbmQodGhpcylcbiJdfQ==
