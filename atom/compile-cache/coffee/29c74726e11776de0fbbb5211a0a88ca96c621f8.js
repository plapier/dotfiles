(function() {
  var Disposable, Settings, inferType;

  Disposable = require('atom').Disposable;

  inferType = function(value) {
    switch (false) {
      case !Number.isInteger(value):
        return 'integer';
      case typeof value !== 'boolean':
        return 'boolean';
      case typeof value !== 'string':
        return 'string';
      case !Array.isArray(value):
        return 'array';
    }
  };

  Settings = (function() {
    Settings.prototype.deprecatedParams = ['showCursorInVisualMode'];

    Settings.prototype.notifyDeprecatedParams = function() {
      var content, deprecatedParams, j, len, notification, param;
      deprecatedParams = this.deprecatedParams.filter((function(_this) {
        return function(param) {
          return _this.has(param);
        };
      })(this));
      if (deprecatedParams.length === 0) {
        return;
      }
      content = [this.scope + ": Config options deprecated.  ", "Remove from your `connfig.cson` now?  "];
      for (j = 0, len = deprecatedParams.length; j < len; j++) {
        param = deprecatedParams[j];
        content.push("- `" + param + "`");
      }
      return notification = atom.notifications.addWarning(content.join("\n"), {
        dismissable: true,
        buttons: [
          {
            text: 'Remove All',
            onDidClick: (function(_this) {
              return function() {
                var k, len1;
                for (k = 0, len1 = deprecatedParams.length; k < len1; k++) {
                  param = deprecatedParams[k];
                  _this["delete"](param);
                }
                return notification.dismiss();
              };
            })(this)
          }
        ]
      });
    };

    function Settings(scope, config) {
      var i, j, k, key, len, len1, name, ref, ref1, value;
      this.scope = scope;
      this.config = config;
      ref = Object.keys(this.config);
      for (j = 0, len = ref.length; j < len; j++) {
        key = ref[j];
        if (typeof this.config[key] === 'boolean') {
          this.config[key] = {
            "default": this.config[key]
          };
        }
        if ((value = this.config[key]).type == null) {
          value.type = inferType(value["default"]);
        }
      }
      ref1 = Object.keys(this.config);
      for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
        name = ref1[i];
        this.config[name].order = i;
      }
    }

    Settings.prototype.has = function(param) {
      return param in atom.config.get(this.scope);
    };

    Settings.prototype["delete"] = function(param) {
      return this.set(param, void 0);
    };

    Settings.prototype.get = function(param) {
      return atom.config.get(this.scope + "." + param);
    };

    Settings.prototype.set = function(param, value) {
      return atom.config.set(this.scope + "." + param, value);
    };

    Settings.prototype.toggle = function(param) {
      return this.set(param, !this.get(param));
    };

    Settings.prototype.observe = function(param, fn) {
      return atom.config.observe(this.scope + "." + param, fn);
    };

    Settings.prototype.observeConditionalKeymaps = function() {
      var conditionalKeymaps, observeConditionalKeymap;
      conditionalKeymaps = {
        keymapUnderscoreToReplaceWithRegister: {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            '_': 'vim-mode-plus:replace-with-register'
          }
        },
        keymapPToPutWithAutoIndent: {
          'atom-text-editor.vim-mode-plus:not(.insert-mode):not(.operator-pending-mode)': {
            'P': 'vim-mode-plus:put-before-with-auto-indent',
            'p': 'vim-mode-plus:put-after-with-auto-indent'
          }
        },
        keymapCCToChangeInnerSmartWord: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode.change-pending': {
            'c': 'vim-mode-plus:inner-smart-word'
          }
        },
        keymapSemicolonToInnerAnyPairInOperatorPendingMode: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode': {
            ';': 'vim-mode-plus:inner-any-pair'
          }
        },
        keymapSemicolonToInnerAnyPairInVisualMode: {
          'atom-text-editor.vim-mode-plus.visual-mode': {
            ';': 'vim-mode-plus:inner-any-pair'
          }
        },
        keymapBackslashToInnerCommentOrParagraphWhenToggleLineCommentsIsPending: {
          'atom-text-editor.vim-mode-plus.operator-pending-mode.toggle-line-comments-pending': {
            '/': 'vim-mode-plus:inner-comment-or-paragraph'
          }
        }
      };
      observeConditionalKeymap = (function(_this) {
        return function(param) {
          var disposable, keymapSource;
          keymapSource = "vim-mode-plus-conditional-keymap:" + param;
          disposable = _this.observe(param, function(newValue) {
            if (newValue) {
              return atom.keymaps.add(keymapSource, conditionalKeymaps[param]);
            } else {
              return atom.keymaps.removeBindingsFromSource(keymapSource);
            }
          });
          return new Disposable(function() {
            disposable.dispose();
            return atom.keymaps.removeBindingsFromSource(keymapSource);
          });
        };
      })(this);
      return Object.keys(conditionalKeymaps).map(function(param) {
        return observeConditionalKeymap(param);
      });
    };

    return Settings;

  })();

  module.exports = new Settings('vim-mode-plus', {
    keymapUnderscoreToReplaceWithRegister: {
      "default": false,
      description: "Can: `_ i (` to replace inner-parenthesis with register's value<br>\nCan: `_ ;` to replace inner-any-pair if you enabled `keymapSemicolonToInnerAnyPairInOperatorPendingMode`<br>\nConflicts: `_`( `move-to-first-character-of-line-and-down` ) motion. Who use this??"
    },
    keymapPToPutWithAutoIndent: {
      "default": false,
      description: "Remap `p` and `P` to auto indent version.<br>\n`p` remapped to `put-before-with-auto-indent` from original `put-before`<br>\n`P` remapped to `put-after-with-auto-indent` from original `put-after`<br>\nConflicts: Original `put-after` and `put-before` become unavailable unless you set different keymap by yourself."
    },
    keymapCCToChangeInnerSmartWord: {
      "default": false,
      description: "Can: `c c` to `change inner-smart-word`<br>\nConflicts: `c c`( change-current-line ) keystroke which is equivalent to `S` or `c i l` etc."
    },
    keymapSemicolonToInnerAnyPairInOperatorPendingMode: {
      "default": false,
      description: "Can: `c ;` to `change inner-any-pair`, Conflicts with original `;`( `repeat-find` ) motion.<br>\nConflicts: `;`( `repeat-find` )."
    },
    keymapSemicolonToInnerAnyPairInVisualMode: {
      "default": false,
      description: "Can: `v ;` to `select inner-any-pair`, Conflicts with original `;`( `repeat-find` ) motion.<br>L\nConflicts: `;`( `repeat-find` )."
    },
    keymapBackslashToInnerCommentOrParagraphWhenToggleLineCommentsIsPending: {
      "default": false,
      description: "Can: `g / /` to comment-in already commented region, `g / /` to comment-out paragraph.<br>\nConflicts: `/`( `search` ) motion only when `g /` is pending. you no longe can `g /` with search."
    },
    setCursorToStartOfChangeOnUndoRedo: true,
    setCursorToStartOfChangeOnUndoRedoStrategy: {
      "default": 'smart',
      "enum": ['smart', 'simple'],
      description: "When you think undo/redo cursor position has BUG, set this to `simple`.<br>\n`smart`: Good accuracy but have cursor-not-updated-on-different-editor limitation<br>\n`simple`: Always work, but accuracy is not as good as `smart`.<br>"
    },
    groupChangesWhenLeavingInsertMode: true,
    useClipboardAsDefaultRegister: true,
    dontUpdateRegisterOnChangeOrSubstitute: {
      "default": false,
      description: "When set to `true` any `change` or `substitute` operation no longer update register content<br>\nAffects `c`, `C`, `s`, `S` operator."
    },
    startInInsertMode: false,
    startInInsertModeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Start in insert-mode when editorElement matches scope'
    },
    clearMultipleCursorsOnEscapeInsertMode: false,
    autoSelectPersistentSelectionOnOperate: true,
    automaticallyEscapeInsertModeOnActivePaneItemChange: {
      "default": false,
      description: 'Escape insert-mode on tab switch, pane switch'
    },
    wrapLeftRightMotion: false,
    numberRegex: {
      "default": '-?[0-9]+',
      description: "Used to find number in ctrl-a/ctrl-x.<br>\nTo ignore \"-\"(minus) char in string like \"identifier-1\" use `(?:\\B-)?[0-9]+`"
    },
    clearHighlightSearchOnResetNormalMode: {
      "default": true,
      description: 'Clear highlightSearch on `escape` in normal-mode'
    },
    clearPersistentSelectionOnResetNormalMode: {
      "default": true,
      description: 'Clear persistentSelection on `escape` in normal-mode'
    },
    charactersToAddSpaceOnSurround: {
      "default": [],
      items: {
        type: 'string'
      },
      description: "Comma separated list of character, which add space around surrounded text.<br>\nFor vim-surround compatible behavior, set `(, {, [, <`."
    },
    ignoreCaseForSearch: {
      "default": false,
      description: 'For `/` and `?`'
    },
    useSmartcaseForSearch: {
      "default": false,
      description: 'For `/` and `?`. Override `ignoreCaseForSearch`'
    },
    ignoreCaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`.'
    },
    useSmartcaseForSearchCurrentWord: {
      "default": false,
      description: 'For `*` and `#`. Override `ignoreCaseForSearchCurrentWord`'
    },
    highlightSearch: true,
    highlightSearchExcludeScopes: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Suppress highlightSearch when any of these classes are present in the editor'
    },
    incrementalSearch: false,
    incrementalSearchVisitDirection: {
      "default": 'absolute',
      "enum": ['absolute', 'relative'],
      description: "When `relative`, `tab`, and `shift-tab` respect search direction('/' or '?')"
    },
    stayOnTransformString: {
      "default": false,
      description: "Don't move cursor after TransformString e.g upper-case, surround"
    },
    stayOnYank: {
      "default": false,
      description: "Don't move cursor after yank"
    },
    stayOnDelete: {
      "default": false,
      description: "Don't move cursor after delete"
    },
    stayOnOccurrence: {
      "default": true,
      description: "Don't move cursor when operator works on occurrences( when `true`, override operator specific `stayOn` options )"
    },
    keepColumnOnSelectTextObject: {
      "default": false,
      description: "Keep column on select TextObject(Paragraph, Indentation, Fold, Function, Edge)"
    },
    moveToFirstCharacterOnVerticalMotion: {
      "default": true,
      description: "Almost equivalent to `startofline` pure-Vim option. When true, move cursor to first char.<br>\nAffects to `ctrl-f, b, d, u`, `G`, `H`, `M`, `L`, `gg`<br>\nUnlike pure-Vim, `d`, `<<`, `>>` are not affected by this option, use independent `stayOn` options."
    },
    flashOnUndoRedo: true,
    flashOnMoveToOccurrence: {
      "default": false,
      description: "Affects normal-mode's `tab`, `shift-tab`."
    },
    flashOnOperate: true,
    flashOnOperateBlacklist: {
      "default": [],
      items: {
        type: 'string'
      },
      description: 'Comma separated list of operator class name to disable flash e.g. "yank, auto-indent"'
    },
    flashOnSearch: true,
    flashScreenOnSearchHasNoMatch: true,
    maxFoldableIndentLevel: {
      "default": 20,
      minimum: 0,
      description: 'Folds which startRow exceed this level are not folded on `zm` and `zM`'
    },
    showHoverSearchCounter: false,
    showHoverSearchCounterDuration: {
      "default": 700,
      description: "Duration(msec) for hover search counter"
    },
    hideTabBarOnMaximizePane: {
      "default": true,
      description: "If set to `false`, tab still visible after maximize-pane( `cmd-enter` )"
    },
    hideStatusBarOnMaximizePane: {
      "default": true
    },
    smoothScrollOnFullScrollMotion: {
      "default": false,
      description: "For `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnFullScrollMotionDuration: {
      "default": 500,
      description: "Smooth scroll duration in milliseconds for `ctrl-f` and `ctrl-b`"
    },
    smoothScrollOnHalfScrollMotion: {
      "default": false,
      description: "For `ctrl-d` and `ctrl-u`"
    },
    smoothScrollOnHalfScrollMotionDuration: {
      "default": 500,
      description: "Smooth scroll duration in milliseconds for `ctrl-d` and `ctrl-u`"
    },
    statusBarModeStringStyle: {
      "default": 'short',
      "enum": ['short', 'long']
    },
    debug: {
      "default": false,
      description: "[Dev use]"
    },
    strictAssertion: {
      "default": false,
      description: "[Dev use] to catche wired state in vmp-dev, enable this if you want help me"
    }
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZXR0aW5ncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVI7O0VBRWYsU0FBQSxHQUFZLFNBQUMsS0FBRDtBQUNWLFlBQUEsS0FBQTtBQUFBLFlBQ08sTUFBTSxDQUFDLFNBQVAsQ0FBaUIsS0FBakIsQ0FEUDtlQUNvQztBQURwQyxXQUVPLE9BQU8sS0FBUCxLQUFpQixTQUZ4QjtlQUV1QztBQUZ2QyxXQUdPLE9BQU8sS0FBUCxLQUFpQixRQUh4QjtlQUdzQztBQUh0QyxZQUlPLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBZCxDQUpQO2VBSWlDO0FBSmpDO0VBRFU7O0VBT047dUJBQ0osZ0JBQUEsR0FBa0IsQ0FDaEIsd0JBRGdCOzt1QkFHbEIsc0JBQUEsR0FBd0IsU0FBQTtBQUN0QixVQUFBO01BQUEsZ0JBQUEsR0FBbUIsSUFBQyxDQUFBLGdCQUFnQixDQUFDLE1BQWxCLENBQXlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO2lCQUFXLEtBQUMsQ0FBQSxHQUFELENBQUssS0FBTDtRQUFYO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QjtNQUNuQixJQUFVLGdCQUFnQixDQUFDLE1BQWpCLEtBQTJCLENBQXJDO0FBQUEsZUFBQTs7TUFFQSxPQUFBLEdBQVUsQ0FDTCxJQUFDLENBQUEsS0FBRixHQUFRLGdDQURGLEVBRVIsd0NBRlE7QUFJVixXQUFBLGtEQUFBOztRQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBQSxHQUFNLEtBQU4sR0FBWSxHQUF6QjtBQUFBO2FBRUEsWUFBQSxHQUFlLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsT0FBTyxDQUFDLElBQVIsQ0FBYSxJQUFiLENBQTlCLEVBQ2I7UUFBQSxXQUFB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QTZKQSxzQ0FBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxHQUFUO01BQ0EsV0FBQSxFQUFhLGtFQURiO0tBOUpGO0lBZ0tBLDhCQUFBLEVBQ0U7TUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7TUFDQSxXQUFBLEVBQWEsMkJBRGI7S0FqS0Y7SUFtS0Esc0NBQUEsRUFDRTtNQUFBLENBQUEsT0FBQSxDQUFBLEVBQVMsR0FBVDtNQUNBLFdBQUEsRUFBYSxrRUFEYjtLQXBLRjtJQXNLQSx3QkFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUFUO01BQ0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLENBRE47S0F2S0Y7SUF5S0EsS0FBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLFdBRGI7S0ExS0Y7SUE0S0EsZUFBQSxFQUNFO01BQUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUFUO01BQ0EsV0FBQSxFQUFhLDZFQURiO0tBN0tGO0dBRG1CO0FBdkdyQiIsInNvdXJjZXNDb250ZW50IjpbIntEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbmluZmVyVHlwZSA9ICh2YWx1ZSkgLT5cbiAgc3dpdGNoXG4gICAgd2hlbiBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSB0aGVuICdpbnRlZ2VyJ1xuICAgIHdoZW4gdHlwZW9mKHZhbHVlKSBpcyAnYm9vbGVhbicgdGhlbiAnYm9vbGVhbidcbiAgICB3aGVuIHR5cGVvZih2YWx1ZSkgaXMgJ3N0cmluZycgdGhlbiAnc3RyaW5nJ1xuICAgIHdoZW4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgdGhlbiAnYXJyYXknXG5cbmNsYXNzIFNldHRpbmdzXG4gIGRlcHJlY2F0ZWRQYXJhbXM6IFtcbiAgICAnc2hvd0N1cnNvckluVmlzdWFsTW9kZSdcbiAgXVxuICBub3RpZnlEZXByZWNhdGVkUGFyYW1zOiAtPlxuICAgIGRlcHJlY2F0ZWRQYXJhbXMgPSBAZGVwcmVjYXRlZFBhcmFtcy5maWx0ZXIoKHBhcmFtKSA9PiBAaGFzKHBhcmFtKSlcbiAgICByZXR1cm4gaWYgZGVwcmVjYXRlZFBhcmFtcy5sZW5ndGggaXMgMFxuXG4gICAgY29udGVudCA9IFtcbiAgICAgIFwiI3tAc2NvcGV9OiBDb25maWcgb3B0aW9ucyBkZXByZWNhdGVkLiAgXCIsXG4gICAgICBcIlJlbW92ZSBmcm9tIHlvdXIgYGNvbm5maWcuY3NvbmAgbm93PyAgXCJcbiAgICBdXG4gICAgY29udGVudC5wdXNoIFwiLSBgI3twYXJhbX1gXCIgZm9yIHBhcmFtIGluIGRlcHJlY2F0ZWRQYXJhbXNcblxuICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIGNvbnRlbnQuam9pbihcIlxcblwiKSxcbiAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnUmVtb3ZlIEFsbCdcbiAgICAgICAgICBvbkRpZENsaWNrOiA9PlxuICAgICAgICAgICAgQGRlbGV0ZShwYXJhbSkgZm9yIHBhcmFtIGluIGRlcHJlY2F0ZWRQYXJhbXNcbiAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgICAgfVxuICAgICAgXVxuXG4gIGNvbnN0cnVjdG9yOiAoQHNjb3BlLCBAY29uZmlnKSAtPlxuICAgICMgQXV0b21hdGljYWxseSBpbmZlciBhbmQgaW5qZWN0IGB0eXBlYCBvZiBlYWNoIGNvbmZpZyBwYXJhbWV0ZXIuXG4gICAgIyBza2lwIGlmIHZhbHVlIHdoaWNoIGFsZWFkeSBoYXZlIGB0eXBlYCBmaWVsZC5cbiAgICAjIEFsc28gdHJhbnNsYXRlIGJhcmUgYGJvb2xlYW5gIHZhbHVlIHRvIHtkZWZhdWx0OiBgYm9vbGVhbmB9IG9iamVjdFxuICAgIGZvciBrZXkgaW4gT2JqZWN0LmtleXMoQGNvbmZpZylcbiAgICAgIGlmIHR5cGVvZihAY29uZmlnW2tleV0pIGlzICdib29sZWFuJ1xuICAgICAgICBAY29uZmlnW2tleV0gPSB7ZGVmYXVsdDogQGNvbmZpZ1trZXldfVxuICAgICAgdW5sZXNzICh2YWx1ZSA9IEBjb25maWdba2V5XSkudHlwZT9cbiAgICAgICAgdmFsdWUudHlwZSA9IGluZmVyVHlwZSh2YWx1ZS5kZWZhdWx0KVxuXG4gICAgIyBbQ0FVVElPTl0gaW5qZWN0aW5nIG9yZGVyIHByb3BldHkgdG8gc2V0IG9yZGVyIHNob3duIGF0IHNldHRpbmctdmlldyBNVVNULUNPTUUtTEFTVC5cbiAgICBmb3IgbmFtZSwgaSBpbiBPYmplY3Qua2V5cyhAY29uZmlnKVxuICAgICAgQGNvbmZpZ1tuYW1lXS5vcmRlciA9IGlcblxuICBoYXM6IChwYXJhbSkgLT5cbiAgICBwYXJhbSBvZiBhdG9tLmNvbmZpZy5nZXQoQHNjb3BlKVxuXG4gIGRlbGV0ZTogKHBhcmFtKSAtPlxuICAgIEBzZXQocGFyYW0sIHVuZGVmaW5lZClcblxuICBnZXQ6IChwYXJhbSkgLT5cbiAgICBhdG9tLmNvbmZpZy5nZXQoXCIje0BzY29wZX0uI3twYXJhbX1cIilcblxuICBzZXQ6IChwYXJhbSwgdmFsdWUpIC0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiI3tAc2NvcGV9LiN7cGFyYW19XCIsIHZhbHVlKVxuXG4gIHRvZ2dsZTogKHBhcmFtKSAtPlxuICAgIEBzZXQocGFyYW0sIG5vdCBAZ2V0KHBhcmFtKSlcblxuICBvYnNlcnZlOiAocGFyYW0sIGZuKSAtPlxuICAgIGF0b20uY29uZmlnLm9ic2VydmUoXCIje0BzY29wZX0uI3twYXJhbX1cIiwgZm4pXG5cbiAgb2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwczogLT5cbiAgICBjb25kaXRpb25hbEtleW1hcHMgPVxuICAgICAga2V5bWFwVW5kZXJzY29yZVRvUmVwbGFjZVdpdGhSZWdpc3RlcjpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ18nOiAndmltLW1vZGUtcGx1czpyZXBsYWNlLXdpdGgtcmVnaXN0ZXInXG4gICAgICBrZXltYXBQVG9QdXRXaXRoQXV0b0luZGVudDpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKTpub3QoLm9wZXJhdG9yLXBlbmRpbmctbW9kZSknOlxuICAgICAgICAgICdQJzogJ3ZpbS1tb2RlLXBsdXM6cHV0LWJlZm9yZS13aXRoLWF1dG8taW5kZW50J1xuICAgICAgICAgICdwJzogJ3ZpbS1tb2RlLXBsdXM6cHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnQnXG4gICAgICBrZXltYXBDQ1RvQ2hhbmdlSW5uZXJTbWFydFdvcmQ6XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLmNoYW5nZS1wZW5kaW5nJzpcbiAgICAgICAgICAnYyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLXNtYXJ0LXdvcmQnXG4gICAgICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluT3BlcmF0b3JQZW5kaW5nTW9kZTpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUnOlxuICAgICAgICAgICc7JzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItYW55LXBhaXInXG4gICAgICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluVmlzdWFsTW9kZTpcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgJzsnOiAndmltLW1vZGUtcGx1czppbm5lci1hbnktcGFpcidcbiAgICAgIGtleW1hcEJhY2tzbGFzaFRvSW5uZXJDb21tZW50T3JQYXJhZ3JhcGhXaGVuVG9nZ2xlTGluZUNvbW1lbnRzSXNQZW5kaW5nOlxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZS50b2dnbGUtbGluZS1jb21tZW50cy1wZW5kaW5nJzpcbiAgICAgICAgICAnLyc6ICd2aW0tbW9kZS1wbHVzOmlubmVyLWNvbW1lbnQtb3ItcGFyYWdyYXBoJ1xuXG4gICAgb2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwID0gKHBhcmFtKSA9PlxuICAgICAga2V5bWFwU291cmNlID0gXCJ2aW0tbW9kZS1wbHVzLWNvbmRpdGlvbmFsLWtleW1hcDoje3BhcmFtfVwiXG4gICAgICBkaXNwb3NhYmxlID0gQG9ic2VydmUgcGFyYW0sIChuZXdWYWx1ZSkgLT5cbiAgICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgICBhdG9tLmtleW1hcHMuYWRkKGtleW1hcFNvdXJjZSwgY29uZGl0aW9uYWxLZXltYXBzW3BhcmFtXSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGF0b20ua2V5bWFwcy5yZW1vdmVCaW5kaW5nc0Zyb21Tb3VyY2Uoa2V5bWFwU291cmNlKVxuXG4gICAgICBuZXcgRGlzcG9zYWJsZSAtPlxuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgICBhdG9tLmtleW1hcHMucmVtb3ZlQmluZGluZ3NGcm9tU291cmNlKGtleW1hcFNvdXJjZSlcblxuICAgICMgUmV0dXJuIGRpc3Bvc2FsYmVzIHRvIGRpc3Bvc2UgY29uZmlnIG9ic2VydmF0aW9uIGFuZCBjb25kaXRpb25hbCBrZXltYXAuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbmRpdGlvbmFsS2V5bWFwcykubWFwIChwYXJhbSkgLT4gb2JzZXJ2ZUNvbmRpdGlvbmFsS2V5bWFwKHBhcmFtKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBTZXR0aW5ncyAndmltLW1vZGUtcGx1cycsXG4gIGtleW1hcFVuZGVyc2NvcmVUb1JlcGxhY2VXaXRoUmVnaXN0ZXI6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgQ2FuOiBgXyBpIChgIHRvIHJlcGxhY2UgaW5uZXItcGFyZW50aGVzaXMgd2l0aCByZWdpc3RlcidzIHZhbHVlPGJyPlxuICAgIENhbjogYF8gO2AgdG8gcmVwbGFjZSBpbm5lci1hbnktcGFpciBpZiB5b3UgZW5hYmxlZCBga2V5bWFwU2VtaWNvbG9uVG9Jbm5lckFueVBhaXJJbk9wZXJhdG9yUGVuZGluZ01vZGVgPGJyPlxuICAgIENvbmZsaWN0czogYF9gKCBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2YtbGluZS1hbmQtZG93bmAgKSBtb3Rpb24uIFdobyB1c2UgdGhpcz8/XG4gICAgXCJcIlwiXG4gIGtleW1hcFBUb1B1dFdpdGhBdXRvSW5kZW50OlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIFJlbWFwIGBwYCBhbmQgYFBgIHRvIGF1dG8gaW5kZW50IHZlcnNpb24uPGJyPlxuICAgIGBwYCByZW1hcHBlZCB0byBgcHV0LWJlZm9yZS13aXRoLWF1dG8taW5kZW50YCBmcm9tIG9yaWdpbmFsIGBwdXQtYmVmb3JlYDxicj5cbiAgICBgUGAgcmVtYXBwZWQgdG8gYHB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50YCBmcm9tIG9yaWdpbmFsIGBwdXQtYWZ0ZXJgPGJyPlxuICAgIENvbmZsaWN0czogT3JpZ2luYWwgYHB1dC1hZnRlcmAgYW5kIGBwdXQtYmVmb3JlYCBiZWNvbWUgdW5hdmFpbGFibGUgdW5sZXNzIHlvdSBzZXQgZGlmZmVyZW50IGtleW1hcCBieSB5b3Vyc2VsZi5cbiAgICBcIlwiXCJcbiAga2V5bWFwQ0NUb0NoYW5nZUlubmVyU21hcnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYGMgY2AgdG8gYGNoYW5nZSBpbm5lci1zbWFydC13b3JkYDxicj5cbiAgICBDb25mbGljdHM6IGBjIGNgKCBjaGFuZ2UtY3VycmVudC1saW5lICkga2V5c3Ryb2tlIHdoaWNoIGlzIGVxdWl2YWxlbnQgdG8gYFNgIG9yIGBjIGkgbGAgZXRjLlxuICAgIFwiXCJcIlxuICBrZXltYXBTZW1pY29sb25Ub0lubmVyQW55UGFpckluT3BlcmF0b3JQZW5kaW5nTW9kZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICBDYW46IGBjIDtgIHRvIGBjaGFuZ2UgaW5uZXItYW55LXBhaXJgLCBDb25mbGljdHMgd2l0aCBvcmlnaW5hbCBgO2AoIGByZXBlYXQtZmluZGAgKSBtb3Rpb24uPGJyPlxuICAgIENvbmZsaWN0czogYDtgKCBgcmVwZWF0LWZpbmRgICkuXG4gICAgXCJcIlwiXG4gIGtleW1hcFNlbWljb2xvblRvSW5uZXJBbnlQYWlySW5WaXN1YWxNb2RlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYHYgO2AgdG8gYHNlbGVjdCBpbm5lci1hbnktcGFpcmAsIENvbmZsaWN0cyB3aXRoIG9yaWdpbmFsIGA7YCggYHJlcGVhdC1maW5kYCApIG1vdGlvbi48YnI+TFxuICAgIENvbmZsaWN0czogYDtgKCBgcmVwZWF0LWZpbmRgICkuXG4gICAgXCJcIlwiXG4gIGtleW1hcEJhY2tzbGFzaFRvSW5uZXJDb21tZW50T3JQYXJhZ3JhcGhXaGVuVG9nZ2xlTGluZUNvbW1lbnRzSXNQZW5kaW5nOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgIENhbjogYGcgLyAvYCB0byBjb21tZW50LWluIGFscmVhZHkgY29tbWVudGVkIHJlZ2lvbiwgYGcgLyAvYCB0byBjb21tZW50LW91dCBwYXJhZ3JhcGguPGJyPlxuICAgIENvbmZsaWN0czogYC9gKCBgc2VhcmNoYCApIG1vdGlvbiBvbmx5IHdoZW4gYGcgL2AgaXMgcGVuZGluZy4geW91IG5vIGxvbmdlIGNhbiBgZyAvYCB3aXRoIHNlYXJjaC5cbiAgICBcIlwiXCJcbiAgc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbzogdHJ1ZVxuICBzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvU3RyYXRlZ3k6XG4gICAgZGVmYXVsdDogJ3NtYXJ0J1xuICAgIGVudW06IFsnc21hcnQnLCAnc2ltcGxlJ11cbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgV2hlbiB5b3UgdGhpbmsgdW5kby9yZWRvIGN1cnNvciBwb3NpdGlvbiBoYXMgQlVHLCBzZXQgdGhpcyB0byBgc2ltcGxlYC48YnI+XG4gICAgYHNtYXJ0YDogR29vZCBhY2N1cmFjeSBidXQgaGF2ZSBjdXJzb3Itbm90LXVwZGF0ZWQtb24tZGlmZmVyZW50LWVkaXRvciBsaW1pdGF0aW9uPGJyPlxuICAgIGBzaW1wbGVgOiBBbHdheXMgd29yaywgYnV0IGFjY3VyYWN5IGlzIG5vdCBhcyBnb29kIGFzIGBzbWFydGAuPGJyPlxuICAgIFwiXCJcIlxuICBncm91cENoYW5nZXNXaGVuTGVhdmluZ0luc2VydE1vZGU6IHRydWVcbiAgdXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXI6IHRydWVcbiAgZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGU6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJcIlwiXG4gICAgV2hlbiBzZXQgdG8gYHRydWVgIGFueSBgY2hhbmdlYCBvciBgc3Vic3RpdHV0ZWAgb3BlcmF0aW9uIG5vIGxvbmdlciB1cGRhdGUgcmVnaXN0ZXIgY29udGVudDxicj5cbiAgICBBZmZlY3RzIGBjYCwgYENgLCBgc2AsIGBTYCBvcGVyYXRvci5cbiAgICBcIlwiXCJcbiAgc3RhcnRJbkluc2VydE1vZGU6IGZhbHNlXG4gIHN0YXJ0SW5JbnNlcnRNb2RlU2NvcGVzOlxuICAgIGRlZmF1bHQ6IFtdXG4gICAgaXRlbXM6IHR5cGU6ICdzdHJpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTdGFydCBpbiBpbnNlcnQtbW9kZSB3aGVuIGVkaXRvckVsZW1lbnQgbWF0Y2hlcyBzY29wZSdcbiAgY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGU6IGZhbHNlXG4gIGF1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlOiB0cnVlXG4gIGF1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZTpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRXNjYXBlIGluc2VydC1tb2RlIG9uIHRhYiBzd2l0Y2gsIHBhbmUgc3dpdGNoJ1xuICB3cmFwTGVmdFJpZ2h0TW90aW9uOiBmYWxzZVxuICBudW1iZXJSZWdleDpcbiAgICBkZWZhdWx0OiAnLT9bMC05XSsnXG4gICAgZGVzY3JpcHRpb246IFwiXCJcIlxuICAgICAgVXNlZCB0byBmaW5kIG51bWJlciBpbiBjdHJsLWEvY3RybC14Ljxicj5cbiAgICAgIFRvIGlnbm9yZSBcIi1cIihtaW51cykgY2hhciBpbiBzdHJpbmcgbGlrZSBcImlkZW50aWZpZXItMVwiIHVzZSBgKD86XFxcXEItKT9bMC05XStgXG4gICAgICBcIlwiXCJcbiAgY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246ICdDbGVhciBoaWdobGlnaHRTZWFyY2ggb24gYGVzY2FwZWAgaW4gbm9ybWFsLW1vZGUnXG4gIGNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogJ0NsZWFyIHBlcnNpc3RlbnRTZWxlY3Rpb24gb24gYGVzY2FwZWAgaW4gbm9ybWFsLW1vZGUnXG4gIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZDpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIENvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGNoYXJhY3Rlciwgd2hpY2ggYWRkIHNwYWNlIGFyb3VuZCBzdXJyb3VuZGVkIHRleHQuPGJyPlxuICAgICAgRm9yIHZpbS1zdXJyb3VuZCBjb21wYXRpYmxlIGJlaGF2aW9yLCBzZXQgYCgsIHssIFssIDxgLlxuICAgICAgXCJcIlwiXG4gIGlnbm9yZUNhc2VGb3JTZWFyY2g6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogJ0ZvciBgL2AgYW5kIGA/YCdcbiAgdXNlU21hcnRjYXNlRm9yU2VhcmNoOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYC9gIGFuZCBgP2AuIE92ZXJyaWRlIGBpZ25vcmVDYXNlRm9yU2VhcmNoYCdcbiAgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246ICdGb3IgYCpgIGFuZCBgI2AuJ1xuICB1c2VTbWFydGNhc2VGb3JTZWFyY2hDdXJyZW50V29yZDpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiAnRm9yIGAqYCBhbmQgYCNgLiBPdmVycmlkZSBgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkYCdcbiAgaGlnaGxpZ2h0U2VhcmNoOiB0cnVlXG4gIGhpZ2hsaWdodFNlYXJjaEV4Y2x1ZGVTY29wZXM6XG4gICAgZGVmYXVsdDogW11cbiAgICBpdGVtczogdHlwZTogJ3N0cmluZydcbiAgICBkZXNjcmlwdGlvbjogJ1N1cHByZXNzIGhpZ2hsaWdodFNlYXJjaCB3aGVuIGFueSBvZiB0aGVzZSBjbGFzc2VzIGFyZSBwcmVzZW50IGluIHRoZSBlZGl0b3InXG4gIGluY3JlbWVudGFsU2VhcmNoOiBmYWxzZVxuICBpbmNyZW1lbnRhbFNlYXJjaFZpc2l0RGlyZWN0aW9uOlxuICAgIGRlZmF1bHQ6ICdhYnNvbHV0ZSdcbiAgICBlbnVtOiBbJ2Fic29sdXRlJywgJ3JlbGF0aXZlJ11cbiAgICBkZXNjcmlwdGlvbjogXCJXaGVuIGByZWxhdGl2ZWAsIGB0YWJgLCBhbmQgYHNoaWZ0LXRhYmAgcmVzcGVjdCBzZWFyY2ggZGlyZWN0aW9uKCcvJyBvciAnPycpXCJcbiAgc3RheU9uVHJhbnNmb3JtU3RyaW5nOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgVHJhbnNmb3JtU3RyaW5nIGUuZyB1cHBlci1jYXNlLCBzdXJyb3VuZFwiXG4gIHN0YXlPbllhbms6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJEb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rXCJcbiAgc3RheU9uRGVsZXRlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgZGVsZXRlXCJcbiAgc3RheU9uT2NjdXJyZW5jZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gICAgZGVzY3JpcHRpb246IFwiRG9uJ3QgbW92ZSBjdXJzb3Igd2hlbiBvcGVyYXRvciB3b3JrcyBvbiBvY2N1cnJlbmNlcyggd2hlbiBgdHJ1ZWAsIG92ZXJyaWRlIG9wZXJhdG9yIHNwZWNpZmljIGBzdGF5T25gIG9wdGlvbnMgKVwiXG4gIGtlZXBDb2x1bW5PblNlbGVjdFRleHRPYmplY3Q6XG4gICAgZGVmYXVsdDogZmFsc2VcbiAgICBkZXNjcmlwdGlvbjogXCJLZWVwIGNvbHVtbiBvbiBzZWxlY3QgVGV4dE9iamVjdChQYXJhZ3JhcGgsIEluZGVudGF0aW9uLCBGb2xkLCBGdW5jdGlvbiwgRWRnZSlcIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9uVmVydGljYWxNb3Rpb246XG4gICAgZGVmYXVsdDogdHJ1ZVxuICAgIGRlc2NyaXB0aW9uOiBcIlwiXCJcbiAgICAgIEFsbW9zdCBlcXVpdmFsZW50IHRvIGBzdGFydG9mbGluZWAgcHVyZS1WaW0gb3B0aW9uLiBXaGVuIHRydWUsIG1vdmUgY3Vyc29yIHRvIGZpcnN0IGNoYXIuPGJyPlxuICAgICAgQWZmZWN0cyB0byBgY3RybC1mLCBiLCBkLCB1YCwgYEdgLCBgSGAsIGBNYCwgYExgLCBgZ2dgPGJyPlxuICAgICAgVW5saWtlIHB1cmUtVmltLCBgZGAsIGA8PGAsIGA+PmAgYXJlIG5vdCBhZmZlY3RlZCBieSB0aGlzIG9wdGlvbiwgdXNlIGluZGVwZW5kZW50IGBzdGF5T25gIG9wdGlvbnMuXG4gICAgICBcIlwiXCJcbiAgZmxhc2hPblVuZG9SZWRvOiB0cnVlXG4gIGZsYXNoT25Nb3ZlVG9PY2N1cnJlbmNlOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiQWZmZWN0cyBub3JtYWwtbW9kZSdzIGB0YWJgLCBgc2hpZnQtdGFiYC5cIlxuICBmbGFzaE9uT3BlcmF0ZTogdHJ1ZVxuICBmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdDpcbiAgICBkZWZhdWx0OiBbXVxuICAgIGl0ZW1zOiB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlc2NyaXB0aW9uOiAnQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2Ygb3BlcmF0b3IgY2xhc3MgbmFtZSB0byBkaXNhYmxlIGZsYXNoIGUuZy4gXCJ5YW5rLCBhdXRvLWluZGVudFwiJ1xuICBmbGFzaE9uU2VhcmNoOiB0cnVlXG4gIGZsYXNoU2NyZWVuT25TZWFyY2hIYXNOb01hdGNoOiB0cnVlXG4gIG1heEZvbGRhYmxlSW5kZW50TGV2ZWw6XG4gICAgZGVmYXVsdDogMjBcbiAgICBtaW5pbXVtOiAwXG4gICAgZGVzY3JpcHRpb246ICdGb2xkcyB3aGljaCBzdGFydFJvdyBleGNlZWQgdGhpcyBsZXZlbCBhcmUgbm90IGZvbGRlZCBvbiBgem1gIGFuZCBgek1gJ1xuICBzaG93SG92ZXJTZWFyY2hDb3VudGVyOiBmYWxzZVxuICBzaG93SG92ZXJTZWFyY2hDb3VudGVyRHVyYXRpb246XG4gICAgZGVmYXVsdDogNzAwXG4gICAgZGVzY3JpcHRpb246IFwiRHVyYXRpb24obXNlYykgZm9yIGhvdmVyIHNlYXJjaCBjb3VudGVyXCJcbiAgaGlkZVRhYkJhck9uTWF4aW1pemVQYW5lOlxuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBkZXNjcmlwdGlvbjogXCJJZiBzZXQgdG8gYGZhbHNlYCwgdGFiIHN0aWxsIHZpc2libGUgYWZ0ZXIgbWF4aW1pemUtcGFuZSggYGNtZC1lbnRlcmAgKVwiXG4gIGhpZGVTdGF0dXNCYXJPbk1heGltaXplUGFuZTpcbiAgICBkZWZhdWx0OiB0cnVlXG4gIHNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbjpcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIGRlc2NyaXB0aW9uOiBcIkZvciBgY3RybC1mYCBhbmQgYGN0cmwtYmBcIlxuICBzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25EdXJhdGlvbjpcbiAgICBkZWZhdWx0OiA1MDBcbiAgICBkZXNjcmlwdGlvbjogXCJTbW9vdGggc2Nyb2xsIGR1cmF0aW9uIGluIG1pbGxpc2Vjb25kcyBmb3IgYGN0cmwtZmAgYW5kIGBjdHJsLWJgXCJcbiAgc21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiRm9yIGBjdHJsLWRgIGFuZCBgY3RybC11YFwiXG4gIHNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvbkR1cmF0aW9uOlxuICAgIGRlZmF1bHQ6IDUwMFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtb290aCBzY3JvbGwgZHVyYXRpb24gaW4gbWlsbGlzZWNvbmRzIGZvciBgY3RybC1kYCBhbmQgYGN0cmwtdWBcIlxuICBzdGF0dXNCYXJNb2RlU3RyaW5nU3R5bGU6XG4gICAgZGVmYXVsdDogJ3Nob3J0J1xuICAgIGVudW06IFsnc2hvcnQnLCAnbG9uZyddXG4gIGRlYnVnOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiW0RldiB1c2VdXCJcbiAgc3RyaWN0QXNzZXJ0aW9uOlxuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgZGVzY3JpcHRpb246IFwiW0RldiB1c2VdIHRvIGNhdGNoZSB3aXJlZCBzdGF0ZSBpbiB2bXAtZGV2LCBlbmFibGUgdGhpcyBpZiB5b3Ugd2FudCBoZWxwIG1lXCJcbiJdfQ==
