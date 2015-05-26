(function() {
  var GrammarUtils, ScriptOptions, ScriptOptionsView, ScriptView;

  ScriptView = require('./script-view');

  ScriptOptionsView = require('./script-options-view');

  ScriptOptions = require('./script-options');

  GrammarUtils = require('./grammar-utils');

  module.exports = {
    config: {
      enableExecTime: {
        title: 'Output the time it took to execute the script',
        type: 'boolean',
        "default": true
      },
      escapeConsoleOutput: {
        title: 'HTML escape console output',
        type: 'boolean',
        "default": true
      },
      scrollWithOutput: {
        title: 'Scroll with output',
        type: 'boolean',
        "default": true
      }
    },
    scriptView: null,
    scriptOptionsView: null,
    scriptOptions: null,
    activate: function(state) {
      this.scriptOptions = new ScriptOptions();
      this.scriptView = new ScriptView(state.scriptViewState, this.scriptOptions);
      return this.scriptOptionsView = new ScriptOptionsView(this.scriptOptions);
    },
    deactivate: function() {
      GrammarUtils.deleteTempFiles();
      this.scriptView.close();
      return this.scriptOptionsView.close();
    },
    serialize: function() {
      return {
        scriptViewState: this.scriptView.serialize(),
        scriptOptionsViewState: this.scriptOptionsView.serialize()
      };
    }
  };

}).call(this);
