(function() {
  'use strict';
  var CSSComb, atomConfigJson, atomConfigPath, csscomb, fs, path, userConfigJson, userConfigPath, _ref;

  fs = require('fs');

  path = require('path');

  CSSComb = require('csscomb');

  csscomb = new CSSComb('csscomb');

  userConfigPath = (_ref = atom.project.getDirectories()[0]) != null ? _ref.resolve('.csscomb.json') : void 0;

  atomConfigPath = path.join(__dirname, '../csscomb.json');

  if (fs.existsSync(userConfigPath)) {
    userConfigJson = require(userConfigPath);
    csscomb.configure(userConfigJson);
  } else if (fs.existsSync(atomConfigPath)) {
    atomConfigJson = require(atomConfigPath);
    csscomb.configure(atomConfigJson);
  }

  module.exports = {
    activate: function(state) {
      return atom.commands.add('atom-workspace', 'csscomb:execute', (function(_this) {
        return function() {
          return _this.execute();
        };
      })(this));
    },
    getExecPath: function() {
      return "ATOM_SHELL_INTERNAL_RUN_AS_NODE=1 '" + process.execPath + "'";
    },
    getNodePath: function() {
      return atom.config.get('csscomb.nodepath');
    },
    execute: function() {
      var e, editor, grammarName, isCSS, isHTML, isLess, isScss, selectedText, sortedText, syntax, text;
      editor = atom.workspace.getActiveTextEditor();
      if (editor === false) {
        return;
      }
      grammarName = editor.getGrammar().name.toLowerCase();
      isCSS = grammarName === 'css';
      isScss = grammarName === 'scss';
      isLess = grammarName === 'less';
      isHTML = grammarName === 'html';
      syntax = 'css';
      if (isCSS) {
        syntax = 'css';
      }
      if (isScss) {
        syntax = 'scss';
      }
      if (isLess) {
        syntax = 'less';
      }
      if (isHTML) {
        syntax = 'css';
      }
      text = editor.getText();
      selectedText = editor.getSelectedText();
      if (selectedText.length !== 0) {
        try {
          sortedText = csscomb.processString(selectedText, syntax);
          return editor.setTextInBufferRange(editor.getSelectedBufferRange(), sortedText);
        } catch (_error) {
          e = _error;
          return console.log(e);
        }
      } else {
        try {
          sortedText = csscomb.processString(text, syntax);
          return editor.setText(sortedText);
        } catch (_error) {
          e = _error;
          return console.log(e);
        }
      }
    }
  };

}).call(this);
