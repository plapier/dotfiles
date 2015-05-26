(function() {
  var AtomCsscombView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = AtomCsscombView = (function(_super) {
    __extends(AtomCsscombView, _super);

    function AtomCsscombView() {
      return AtomCsscombView.__super__.constructor.apply(this, arguments);
    }

    AtomCsscombView.content = function() {
      return this.div({
        "class": 'atom-csscomb overlay from-top'
      }, (function(_this) {
        return function() {
          return _this.div("The AtomCsscomb package is Alive! It's ALIVE!", {
            "class": "message"
          });
        };
      })(this));
    };

    AtomCsscombView.prototype.initialize = function(serializeState) {
      return atom.workspaceView.command("csscomb:execute", (function(_this) {
        return function() {
          return _this.execute();
        };
      })(this));
    };

    AtomCsscombView.prototype.serialize = function() {};

    AtomCsscombView.prototype.destroy = function() {
      return this.detach();
    };

    AtomCsscombView.prototype.execute = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return atom.workspaceView.append(this);
      }
    };

    return AtomCsscombView;

  })(View);

}).call(this);
