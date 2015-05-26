(function() {
  var AtomBourbonSnippetsView;

  AtomBourbonSnippetsView = require('./atom-bourbon-snippets-view');

  module.exports = {
    atomBourbonSnippetsView: null,
    activate: function(state) {
      return this.atomBourbonSnippetsView = new AtomBourbonSnippetsView(state.atomBourbonSnippetsViewState);
    },
    deactivate: function() {
      return this.atomBourbonSnippetsView.destroy();
    },
    serialize: function() {
      return {
        atomBourbonSnippetsViewState: this.atomBourbonSnippetsView.serialize()
      };
    }
  };

}).call(this);
