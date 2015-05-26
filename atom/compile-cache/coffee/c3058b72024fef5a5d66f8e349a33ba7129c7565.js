(function() {
  var AtomBourbonSnippetsView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = AtomBourbonSnippetsView = (function(_super) {
    __extends(AtomBourbonSnippetsView, _super);

    function AtomBourbonSnippetsView() {
      return AtomBourbonSnippetsView.__super__.constructor.apply(this, arguments);
    }

    AtomBourbonSnippetsView.prototype.initialize = function(serializeState) {
      return atom.workspaceView.command("atom-bourbon-snippets:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    };

    AtomBourbonSnippetsView.prototype.serialize = function() {};

    AtomBourbonSnippetsView.prototype.destroy = function() {
      return this.detach();
    };

    AtomBourbonSnippetsView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return atom.workspaceView.append(this);
      }
    };

    return AtomBourbonSnippetsView;

  })(View);

}).call(this);
