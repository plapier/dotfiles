(function() {
  var Base, BufferedProcess, CompositeDisposable, Developer, Disposable, Emitter, getEditorState, ref, settings;

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable;

  Base = require('./base');

  settings = require('./settings');

  getEditorState = null;

  Developer = (function() {
    var kinds, modifierKeyMap, selectorMap;

    function Developer() {}

    Developer.prototype.init = function(_getEditorState) {
      var commands, fn, name, subscriptions;
      getEditorState = _getEditorState;
      this.devEnvironmentByBuffer = new Map;
      this.reloadSubscriptionByBuffer = new Map;
      commands = {
        'toggle-debug': (function(_this) {
          return function() {
            return _this.toggleDebug();
          };
        })(this),
        'open-in-vim': (function(_this) {
          return function() {
            return _this.openInVim();
          };
        })(this),
        'generate-introspection-report': (function(_this) {
          return function() {
            return _this.generateIntrospectionReport();
          };
        })(this),
        'generate-command-summary-table': (function(_this) {
          return function() {
            return _this.generateCommandSummaryTable();
          };
        })(this),
        'write-command-table-on-disk': function() {
          return Base.writeCommandTableOnDisk();
        },
        'clear-debug-output': (function(_this) {
          return function() {
            return _this.clearDebugOutput();
          };
        })(this),
        'reload': (function(_this) {
          return function() {
            return _this.reload();
          };
        })(this),
        'reload-with-dependencies': (function(_this) {
          return function() {
            return _this.reload(true);
          };
        })(this),
        'report-total-marker-count': (function(_this) {
          return function() {
            return _this.getAllMarkerCount();
          };
        })(this),
        'report-total-and-per-editor-marker-count': (function(_this) {
          return function() {
            return _this.getAllMarkerCount(true);
          };
        })(this),
        'report-require-cache': (function(_this) {
          return function() {
            return _this.reportRequireCache({
              excludeNodModules: true
            });
          };
        })(this),
        'report-require-cache-all': (function(_this) {
          return function() {
            return _this.reportRequireCache({
              excludeNodModules: false
            });
          };
        })(this)
      };
      subscriptions = new CompositeDisposable;
      for (name in commands) {
        fn = commands[name];
        subscriptions.add(this.addCommand(name, fn));
      }
      return subscriptions;
    };

    Developer.prototype.reportRequireCache = function(arg) {
      var cachedPath, cachedPaths, excludeNodModules, focus, i, len, packPath, pathSeparator, results;
      focus = arg.focus, excludeNodModules = arg.excludeNodModules;
      pathSeparator = require('path').sep;
      packPath = atom.packages.getLoadedPackage("vim-mode-plus").path;
      cachedPaths = Object.keys(require.cache).filter(function(p) {
        return p.startsWith(packPath + pathSeparator);
      }).map(function(p) {
        return p.replace(packPath, '');
      });
      results = [];
      for (i = 0, len = cachedPaths.length; i < len; i++) {
        cachedPath = cachedPaths[i];
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(RegExp("" + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        results.push(console.log(cachedPath));
      }
      return results;
    };

    Developer.prototype.getAllMarkerCount = function(showEditorsReport) {
      var basename, editor, hlsearch, i, inspect, len, mark, mutation, occurrence, persistentSel, ref1, total, vimState;
      if (showEditorsReport == null) {
        showEditorsReport = false;
      }
      inspect = require('util').inspect;
      basename = require('path').basename;
      total = {
        mark: 0,
        hlsearch: 0,
        mutation: 0,
        occurrence: 0,
        persistentSel: 0
      };
      ref1 = atom.workspace.getTextEditors();
      for (i = 0, len = ref1.length; i < len; i++) {
        editor = ref1[i];
        vimState = getEditorState(editor);
        mark = vimState.mark.markerLayer.getMarkerCount();
        hlsearch = vimState.highlightSearch.markerLayer.getMarkerCount();
        mutation = vimState.mutationManager.markerLayer.getMarkerCount();
        occurrence = vimState.occurrenceManager.markerLayer.getMarkerCount();
        persistentSel = vimState.persistentSelection.markerLayer.getMarkerCount();
        if (showEditorsReport) {
          console.log(basename(editor.getPath()), inspect({
            mark: mark,
            hlsearch: hlsearch,
            mutation: mutation,
            occurrence: occurrence,
            persistentSel: persistentSel
          }));
        }
        total.mark += mark;
        total.hlsearch += hlsearch;
        total.mutation += mutation;
        total.occurrence += occurrence;
        total.persistentSel += persistentSel;
      }
      return console.log('total', inspect(total));
    };

    Developer.prototype.reload = function(reloadDependencies) {
      var activate, deactivate, invalidateRequireCacheForPackage, loadedPackages, packages, pathSeparator;
      pathSeparator = require('path').sep;
      packages = ['vim-mode-plus'];
      if (reloadDependencies) {
        packages.push.apply(packages, settings.get('devReloadPackages'));
      }
      invalidateRequireCacheForPackage = function(packPath) {
        return Object.keys(require.cache).filter(function(p) {
          return p.startsWith(packPath + pathSeparator);
        }).forEach(function(p) {
          return delete require.cache[p];
        });
      };
      deactivate = function(packName) {
        var packPath;
        console.log("- deactivating " + packName);
        packPath = atom.packages.getLoadedPackage(packName).path;
        atom.packages.deactivatePackage(packName);
        atom.packages.unloadPackage(packName);
        return invalidateRequireCacheForPackage(packPath);
      };
      activate = function(packName) {
        console.log("+ activating " + packName);
        atom.packages.loadPackage(packName);
        return atom.packages.activatePackage(packName);
      };
      loadedPackages = packages.filter(function(packName) {
        return atom.packages.getLoadedPackages(packName);
      });
      console.log("reload", loadedPackages);
      loadedPackages.map(deactivate);
      console.time('activate');
      loadedPackages.map(activate);
      return console.timeEnd('activate');
    };

    Developer.prototype.addCommand = function(name, fn) {
      return atom.commands.add('atom-text-editor', "vim-mode-plus:" + name, fn);
    };

    Developer.prototype.clearDebugOutput = function(name, fn) {
      var filePath, normalize, options;
      normalize = require('fs-plus').normalize;
      filePath = normalize(settings.get('debugOutputFilePath'));
      options = {
        searchAllPanes: true,
        activatePane: false
      };
      return atom.workspace.open(filePath, options).then(function(editor) {
        editor.setText('');
        return editor.save();
      });
    };

    Developer.prototype.toggleDebug = function() {
      settings.set('debug', !settings.get('debug'));
      return console.log(settings.scope + " debug:", settings.get('debug'));
    };

    modifierKeyMap = {
      "ctrl-cmd-": '\u2303\u2318',
      "cmd-": '\u2318',
      "ctrl-": '\u2303',
      alt: '\u2325',
      option: '\u2325',
      enter: '\u23ce',
      left: '\u2190',
      right: '\u2192',
      up: '\u2191',
      down: '\u2193',
      backspace: 'BS',
      space: 'SPC'
    };

    selectorMap = {
      "atom-text-editor.vim-mode-plus": '',
      ".normal-mode": 'n',
      ".insert-mode": 'i',
      ".replace": 'R',
      ".visual-mode": 'v',
      ".characterwise": 'C',
      ".blockwise": 'B',
      ".linewise": 'L',
      ".operator-pending-mode": 'o',
      ".with-count": '#',
      ".has-persistent-selection": '%'
    };

    Developer.prototype.getCommandSpecs = function() {
      var _, commandName, commands, compactKeystrokes, compactSelector, description, getAncestors, getKeyBindingForCommand, keymap, keymaps, kind, klass, name, ref1;
      _ = require('underscore-plus');
      compactSelector = function(selector) {
        var pattern;
        pattern = RegExp("(" + (_.keys(selectorMap).map(_.escapeRegExp).join('|')) + ")", "g");
        return selector.split(/,\s*/g).map(function(scope) {
          return scope.replace(/:not\((.*)\)/, '!$1').replace(pattern, function(s) {
            return selectorMap[s];
          });
        }).join(",");
      };
      compactKeystrokes = function(keystrokes) {
        var modifierKeyRegexp, specialChars, specialCharsRegexp;
        specialChars = '\\`*_{}[]()#+-.!';
        specialCharsRegexp = RegExp("" + (specialChars.split('').map(_.escapeRegExp).join('|')), "g");
        modifierKeyRegexp = RegExp("(" + (_.keys(modifierKeyMap).map(_.escapeRegExp).join('|')) + ")");
        return keystrokes.replace(modifierKeyRegexp, function(s) {
          return modifierKeyMap[s];
        }).replace(RegExp("(" + specialCharsRegexp + ")", "g"), "\\$1").replace(/\|/g, '&#124;').replace(/\s+/, '');
      };
      ref1 = this.vimstate.utils, getKeyBindingForCommand = ref1.getKeyBindingForCommand, getAncestors = ref1.getAncestors;
      commands = (function() {
        var ref2, ref3, results;
        ref2 = Base.getClassRegistry();
        results = [];
        for (name in ref2) {
          klass = ref2[name];
          if (!(klass.isCommand())) {
            continue;
          }
          kind = getAncestors(klass).map(function(k) {
            return k.name;
          }).slice(-2, -1)[0];
          commandName = klass.getCommandName();
          description = (ref3 = klass.getDesctiption()) != null ? ref3.replace(/\n/g, '<br/>') : void 0;
          keymap = null;
          if (keymaps = getKeyBindingForCommand(commandName, {
            packageName: "vim-mode-plus"
          })) {
            keymap = keymaps.map(function(arg) {
              var keystrokes, selector;
              keystrokes = arg.keystrokes, selector = arg.selector;
              return "`" + (compactSelector(selector)) + "` <code>" + (compactKeystrokes(keystrokes)) + "</code>";
            }).join("<br/>");
          }
          results.push({
            name: name,
            commandName: commandName,
            kind: kind,
            description: description,
            keymap: keymap
          });
        }
        return results;
      })();
      return commands;
    };

    Developer.prototype.generateCommandTableForMotion = function() {
      return require('./motion');
    };

    kinds = ["Operator", "Motion", "TextObject", "InsertMode", "MiscCommand", "Scroll"];

    Developer.prototype.generateSummaryTableForCommandSpecs = function(specs, arg) {
      var _, commandName, description, grouped, header, i, j, keymap, kind, len, len1, ref1, report, str;
      header = (arg != null ? arg : {}).header;
      _ = require('underscore-plus');
      grouped = _.groupBy(specs, 'kind');
      str = "";
      for (i = 0, len = kinds.length; i < len; i++) {
        kind = kinds[i];
        if (!(specs = grouped[kind])) {
          continue;
        }
        report = ["## " + kind, "", "| Keymap | Command | Description |", "|:-------|:--------|:------------|"];
        for (j = 0, len1 = specs.length; j < len1; j++) {
          ref1 = specs[j], keymap = ref1.keymap, commandName = ref1.commandName, description = ref1.description;
          commandName = commandName.replace(/vim-mode-plus:/, '');
          if (description == null) {
            description = "";
          }
          if (keymap == null) {
            keymap = "";
          }
          report.push("| " + keymap + " | `" + commandName + "` | " + description + " |");
        }
        str += report.join("\n") + "\n\n";
      }
      return atom.workspace.open().then(function(editor) {
        if (header != null) {
          editor.insertText(header + "\n");
        }
        return editor.insertText(str);
      });
    };

    Developer.prototype.generateCommandSummaryTable = function() {
      var header;
      header = "## Keymap selector abbreviations\n\nIn this document, following abbreviations are used for shortness.\n\n| Abbrev | Selector                     | Description                         |\n|:-------|:-----------------------------|:------------------------------------|\n| `!i`   | `:not(.insert-mode)`         | except insert-mode                  |\n| `i`    | `.insert-mode`               |                                     |\n| `o`    | `.operator-pending-mode`     |                                     |\n| `n`    | `.normal-mode`               |                                     |\n| `v`    | `.visual-mode`               |                                     |\n| `vB`   | `.visual-mode.blockwise`     |                                     |\n| `vL`   | `.visual-mode.linewise`      |                                     |\n| `vC`   | `.visual-mode.characterwise` |                                     |\n| `iR`   | `.insert-mode.replace`       |                                     |\n| `#`    | `.with-count`                | when count is specified             |\n| `%`    | `.has-persistent-selection` | when persistent-selection is exists |\n";
      return this.generateSummaryTableForCommandSpecs(this.getCommandSpecs(), {
        header: header
      });
    };

    Developer.prototype.openInVim = function() {
      var column, editor, ref1, row;
      editor = atom.workspace.getActiveTextEditor();
      ref1 = editor.getCursorBufferPosition(), row = ref1.row, column = ref1.column;
      return new BufferedProcess({
        command: "/Applications/MacVim.app/Contents/MacOS/Vim",
        args: ['-g', editor.getPath(), "+call cursor(" + (row + 1) + ", " + (column + 1) + ")"]
      });
    };

    Developer.prototype.generateIntrospectionReport = function() {
      var _, generateIntrospectionReport;
      _ = require('underscore-plus');
      generateIntrospectionReport = require('./introspection');
      return generateIntrospectionReport(_.values(Base.getClassRegistry()), {
        excludeProperties: ['run', 'getCommandNameWithoutPrefix', 'getClass', 'extend', 'getParent', 'getAncestors', 'isCommand', 'getClassRegistry', 'command', 'reset', 'getDesctiption', 'description', 'init', 'getCommandName', 'getCommandScope', 'registerCommand', 'delegatesProperties', 'subscriptions', 'commandPrefix', 'commandScope', 'delegatesMethods', 'delegatesProperty', 'delegatesMethod'],
        recursiveInspect: Base
      });
    };

    return Developer;

  })();

  module.exports = Developer;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9kZXZlbG9wZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE4RCxPQUFBLENBQVEsTUFBUixDQUE5RCxFQUFDLHFCQUFELEVBQVUsMkJBQVYsRUFBc0IscUNBQXRCLEVBQXVDOztFQUV2QyxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLGNBQUEsR0FBaUI7O0VBRVg7QUFDSixRQUFBOzs7O3dCQUFBLElBQUEsR0FBTSxTQUFDLGVBQUQ7QUFDSixVQUFBO01BQUEsY0FBQSxHQUFpQjtNQUNqQixJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFBSTtNQUM5QixJQUFDLENBQUEsMEJBQUQsR0FBOEIsSUFBSTtNQUVsQyxRQUFBLEdBQ0U7UUFBQSxjQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLFdBQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtRQUNBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEZjtRQUVBLCtCQUFBLEVBQWlDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLDJCQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FGakM7UUFHQSxnQ0FBQSxFQUFrQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSwyQkFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSGxDO1FBSUEsNkJBQUEsRUFBK0IsU0FB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QixVQUFBO01BQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjtNQUNKLDJCQUFBLEdBQThCLE9BQUEsQ0FBUSxpQkFBUjthQUU5QiwyQkFBQSxDQUE0QixDQUFDLENBQUMsTUFBRixDQUFTLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQVQsQ0FBNUIsRUFDRTtRQUFBLGlCQUFBLEVBQW1CLENBQ2pCLEtBRGlCLEVBRWpCLDZCQUZpQixFQUdqQixVQUhpQixFQUdMLFFBSEssRUFHSyxXQUhMLEVBR2tCLGNBSGxCLEVBR2tDLFdBSGxDLEVBSWpCLGtCQUppQixFQUlHLFNBSkgsRUFJYyxPQUpkLEVBS2pCLGdCQUxpQixFQUtDLGFBTEQsRUFNakIsTUFOaUIsRUFNVCxnQkFOUyxFQU1TLGlCQU5ULEVBTTRCLGlCQU41QixFQU9qQixxQkFQaUIsRUFPTSxlQVBOLEVBT3VCLGVBUHZCLEVBT3dDLGNBUHhDLEVBUWpCLGtCQVJpQixFQVNqQixtQkFUaUIsRUFVakIsaUJBVmlCLENBQW5CO1FBWUEsZ0JBQUEsRUFBa0IsSUFabEI7T0FERjtJQUoyQjs7Ozs7O0VBbUIvQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXpRakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgRGlzcG9zYWJsZSwgQnVmZmVyZWRQcm9jZXNzLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5nZXRFZGl0b3JTdGF0ZSA9IG51bGxcblxuY2xhc3MgRGV2ZWxvcGVyXG4gIGluaXQ6IChfZ2V0RWRpdG9yU3RhdGUpIC0+XG4gICAgZ2V0RWRpdG9yU3RhdGUgPSBfZ2V0RWRpdG9yU3RhdGVcbiAgICBAZGV2RW52aXJvbm1lbnRCeUJ1ZmZlciA9IG5ldyBNYXBcbiAgICBAcmVsb2FkU3Vic2NyaXB0aW9uQnlCdWZmZXIgPSBuZXcgTWFwXG5cbiAgICBjb21tYW5kcyA9XG4gICAgICAndG9nZ2xlLWRlYnVnJzogPT4gQHRvZ2dsZURlYnVnKClcbiAgICAgICdvcGVuLWluLXZpbSc6ID0+IEBvcGVuSW5WaW0oKVxuICAgICAgJ2dlbmVyYXRlLWludHJvc3BlY3Rpb24tcmVwb3J0JzogPT4gQGdlbmVyYXRlSW50cm9zcGVjdGlvblJlcG9ydCgpXG4gICAgICAnZ2VuZXJhdGUtY29tbWFuZC1zdW1tYXJ5LXRhYmxlJzogPT4gQGdlbmVyYXRlQ29tbWFuZFN1bW1hcnlUYWJsZSgpXG4gICAgICAnd3JpdGUtY29tbWFuZC10YWJsZS1vbi1kaXNrJzogLT4gQmFzZS53cml0ZUNvbW1hbmRUYWJsZU9uRGlzaygpXG4gICAgICAnY2xlYXItZGVidWctb3V0cHV0JzogPT4gQGNsZWFyRGVidWdPdXRwdXQoKVxuICAgICAgJ3JlbG9hZCc6ID0+IEByZWxvYWQoKVxuICAgICAgJ3JlbG9hZC13aXRoLWRlcGVuZGVuY2llcyc6ID0+IEByZWxvYWQodHJ1ZSlcbiAgICAgICdyZXBvcnQtdG90YWwtbWFya2VyLWNvdW50JzogPT4gQGdldEFsbE1hcmtlckNvdW50KClcbiAgICAgICdyZXBvcnQtdG90YWwtYW5kLXBlci1lZGl0b3ItbWFya2VyLWNvdW50JzogPT4gQGdldEFsbE1hcmtlckNvdW50KHRydWUpXG4gICAgICAncmVwb3J0LXJlcXVpcmUtY2FjaGUnOiA9PiBAcmVwb3J0UmVxdWlyZUNhY2hlKGV4Y2x1ZGVOb2RNb2R1bGVzOiB0cnVlKVxuICAgICAgJ3JlcG9ydC1yZXF1aXJlLWNhY2hlLWFsbCc6ID0+IEByZXBvcnRSZXF1aXJlQ2FjaGUoZXhjbHVkZU5vZE1vZHVsZXM6IGZhbHNlKVxuXG4gICAgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgZm9yIG5hbWUsIGZuIG9mIGNvbW1hbmRzXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZCBAYWRkQ29tbWFuZChuYW1lLCBmbilcbiAgICBzdWJzY3JpcHRpb25zXG5cbiAgcmVwb3J0UmVxdWlyZUNhY2hlOiAoe2ZvY3VzLCBleGNsdWRlTm9kTW9kdWxlc30pIC0+XG4gICAgcGF0aFNlcGFyYXRvciA9IHJlcXVpcmUoJ3BhdGgnKS5zZXBcbiAgICBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZShcInZpbS1tb2RlLXBsdXNcIikucGF0aFxuICAgIGNhY2hlZFBhdGhzID0gT2JqZWN0LmtleXMocmVxdWlyZS5jYWNoZSlcbiAgICAgIC5maWx0ZXIgKHApIC0+IHAuc3RhcnRzV2l0aChwYWNrUGF0aCArIHBhdGhTZXBhcmF0b3IpXG4gICAgICAubWFwIChwKSAtPiBwLnJlcGxhY2UocGFja1BhdGgsICcnKVxuXG4gICAgZm9yIGNhY2hlZFBhdGggaW4gY2FjaGVkUGF0aHNcbiAgICAgIGlmIGV4Y2x1ZGVOb2RNb2R1bGVzIGFuZCBjYWNoZWRQYXRoLnNlYXJjaCgvbm9kZV9tb2R1bGVzLykgPj0gMFxuICAgICAgICBjb250aW51ZVxuICAgICAgaWYgZm9jdXMgYW5kIGNhY2hlZFBhdGguc2VhcmNoKC8vLyN7Zm9jdXN9Ly8vKSA+PSAwXG4gICAgICAgIGNhY2hlZFBhdGggPSAnKicgKyBjYWNoZWRQYXRoXG4gICAgICBjb25zb2xlLmxvZyBjYWNoZWRQYXRoXG5cbiAgZ2V0QWxsTWFya2VyQ291bnQ6IChzaG93RWRpdG9yc1JlcG9ydD1mYWxzZSkgLT5cbiAgICB7aW5zcGVjdH0gPSByZXF1aXJlICd1dGlsJ1xuICAgIGJhc2VuYW1lID0gcmVxdWlyZSgncGF0aCcpLmJhc2VuYW1lXG4gICAgdG90YWwgPVxuICAgICAgbWFyazogMFxuICAgICAgaGxzZWFyY2g6IDBcbiAgICAgIG11dGF0aW9uOiAwXG4gICAgICBvY2N1cnJlbmNlOiAwXG4gICAgICBwZXJzaXN0ZW50U2VsOiAwXG5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKVxuICAgICAgbWFyayA9IHZpbVN0YXRlLm1hcmsubWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgICAgaGxzZWFyY2ggPSB2aW1TdGF0ZS5oaWdobGlnaHRTZWFyY2gubWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgICAgbXV0YXRpb24gPSB2aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIubWFya2VyTGF5ZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgICAgb2NjdXJyZW5jZSA9IHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIHBlcnNpc3RlbnRTZWwgPSB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIGlmIHNob3dFZGl0b3JzUmVwb3J0XG4gICAgICAgIGNvbnNvbGUubG9nIGJhc2VuYW1lKGVkaXRvci5nZXRQYXRoKCkpLCBpbnNwZWN0KHttYXJrLCBobHNlYXJjaCwgbXV0YXRpb24sIG9jY3VycmVuY2UsIHBlcnNpc3RlbnRTZWx9KVxuXG4gICAgICB0b3RhbC5tYXJrICs9IG1hcmtcbiAgICAgIHRvdGFsLmhsc2VhcmNoICs9IGhsc2VhcmNoXG4gICAgICB0b3RhbC5tdXRhdGlvbiArPSBtdXRhdGlvblxuICAgICAgdG90YWwub2NjdXJyZW5jZSArPSBvY2N1cnJlbmNlXG4gICAgICB0b3RhbC5wZXJzaXN0ZW50U2VsICs9IHBlcnNpc3RlbnRTZWxcblxuICAgIGNvbnNvbGUubG9nICd0b3RhbCcsIGluc3BlY3QodG90YWwpXG5cbiAgcmVsb2FkOiAocmVsb2FkRGVwZW5kZW5jaWVzKSAtPlxuICAgIHBhdGhTZXBhcmF0b3IgPSByZXF1aXJlKCdwYXRoJykuc2VwXG5cbiAgICBwYWNrYWdlcyA9IFsndmltLW1vZGUtcGx1cyddXG4gICAgaWYgcmVsb2FkRGVwZW5kZW5jaWVzXG4gICAgICBwYWNrYWdlcy5wdXNoKHNldHRpbmdzLmdldCgnZGV2UmVsb2FkUGFja2FnZXMnKS4uLilcblxuICAgIGludmFsaWRhdGVSZXF1aXJlQ2FjaGVGb3JQYWNrYWdlID0gKHBhY2tQYXRoKSAtPlxuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZS5jYWNoZSlcbiAgICAgICAgLmZpbHRlciAocCkgLT4gcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgcGF0aFNlcGFyYXRvcilcbiAgICAgICAgLmZvckVhY2ggKHApIC0+IGRlbGV0ZSByZXF1aXJlLmNhY2hlW3BdXG5cbiAgICBkZWFjdGl2YXRlID0gKHBhY2tOYW1lKSAtPlxuICAgICAgY29uc29sZS5sb2cgXCItIGRlYWN0aXZhdGluZyAje3BhY2tOYW1lfVwiXG4gICAgICBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZShwYWNrTmFtZSkucGF0aFxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrTmFtZSlcbiAgICAgIGF0b20ucGFja2FnZXMudW5sb2FkUGFja2FnZShwYWNrTmFtZSlcbiAgICAgIGludmFsaWRhdGVSZXF1aXJlQ2FjaGVGb3JQYWNrYWdlKHBhY2tQYXRoKVxuXG4gICAgYWN0aXZhdGUgPSAocGFja05hbWUpIC0+XG4gICAgICBjb25zb2xlLmxvZyBcIisgYWN0aXZhdGluZyAje3BhY2tOYW1lfVwiXG4gICAgICBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKHBhY2tOYW1lKVxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFja05hbWUpXG5cbiAgICBsb2FkZWRQYWNrYWdlcyA9IHBhY2thZ2VzLmZpbHRlciAocGFja05hbWUpIC0+IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZXMocGFja05hbWUpXG4gICAgY29uc29sZS5sb2cgXCJyZWxvYWRcIiwgbG9hZGVkUGFja2FnZXNcbiAgICBsb2FkZWRQYWNrYWdlcy5tYXAoZGVhY3RpdmF0ZSlcbiAgICBjb25zb2xlLnRpbWUoJ2FjdGl2YXRlJylcbiAgICBsb2FkZWRQYWNrYWdlcy5tYXAoYWN0aXZhdGUpXG4gICAgY29uc29sZS50aW1lRW5kKCdhY3RpdmF0ZScpXG5cbiAgYWRkQ29tbWFuZDogKG5hbWUsIGZuKSAtPlxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgXCJ2aW0tbW9kZS1wbHVzOiN7bmFtZX1cIiwgZm4pXG5cbiAgY2xlYXJEZWJ1Z091dHB1dDogKG5hbWUsIGZuKSAtPlxuICAgIHtub3JtYWxpemV9ID0gcmVxdWlyZSgnZnMtcGx1cycpXG4gICAgZmlsZVBhdGggPSBub3JtYWxpemUoc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dEZpbGVQYXRoJykpXG4gICAgb3B0aW9ucyA9IHtzZWFyY2hBbGxQYW5lczogdHJ1ZSwgYWN0aXZhdGVQYW5lOiBmYWxzZX1cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoLCBvcHRpb25zKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnJylcbiAgICAgIGVkaXRvci5zYXZlKClcblxuICB0b2dnbGVEZWJ1ZzogLT5cbiAgICBzZXR0aW5ncy5zZXQoJ2RlYnVnJywgbm90IHNldHRpbmdzLmdldCgnZGVidWcnKSlcbiAgICBjb25zb2xlLmxvZyBcIiN7c2V0dGluZ3Muc2NvcGV9IGRlYnVnOlwiLCBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcblxuICAjIEJvcnJvd2VkIGZyb20gdW5kZXJzY29yZS1wbHVzXG4gIG1vZGlmaWVyS2V5TWFwID1cbiAgICBcImN0cmwtY21kLVwiOiAnXFx1MjMwM1xcdTIzMTgnXG4gICAgXCJjbWQtXCI6ICdcXHUyMzE4J1xuICAgIFwiY3RybC1cIjogJ1xcdTIzMDMnXG4gICAgYWx0OiAnXFx1MjMyNSdcbiAgICBvcHRpb246ICdcXHUyMzI1J1xuICAgIGVudGVyOiAnXFx1MjNjZSdcbiAgICBsZWZ0OiAnXFx1MjE5MCdcbiAgICByaWdodDogJ1xcdTIxOTInXG4gICAgdXA6ICdcXHUyMTkxJ1xuICAgIGRvd246ICdcXHUyMTkzJ1xuICAgIGJhY2tzcGFjZTogJ0JTJ1xuICAgIHNwYWNlOiAnU1BDJ1xuXG4gIHNlbGVjdG9yTWFwID1cbiAgICBcImF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1c1wiOiAnJ1xuICAgIFwiLm5vcm1hbC1tb2RlXCI6ICduJ1xuICAgIFwiLmluc2VydC1tb2RlXCI6ICdpJ1xuICAgIFwiLnJlcGxhY2VcIjogJ1InXG4gICAgXCIudmlzdWFsLW1vZGVcIjogJ3YnXG4gICAgXCIuY2hhcmFjdGVyd2lzZVwiOiAnQydcbiAgICBcIi5ibG9ja3dpc2VcIjogJ0InXG4gICAgXCIubGluZXdpc2VcIjogJ0wnXG4gICAgXCIub3BlcmF0b3ItcGVuZGluZy1tb2RlXCI6ICdvJ1xuICAgIFwiLndpdGgtY291bnRcIjogJyMnXG4gICAgXCIuaGFzLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCI6ICclJ1xuXG4gIGdldENvbW1hbmRTcGVjczogLT5cbiAgICBfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG4gICAgY29tcGFjdFNlbGVjdG9yID0gKHNlbGVjdG9yKSAtPlxuICAgICAgcGF0dGVybiA9IC8vLygje18ua2V5cyhzZWxlY3Rvck1hcCkubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKCd8Jyl9KS8vL2dcbiAgICAgIHNlbGVjdG9yLnNwbGl0KC8sXFxzKi9nKS5tYXAgKHNjb3BlKSAtPlxuICAgICAgICBzY29wZVxuICAgICAgICAgIC5yZXBsYWNlKC86bm90XFwoKC4qKVxcKS8sICchJDEnKVxuICAgICAgICAgIC5yZXBsYWNlKHBhdHRlcm4sIChzKSAtPiBzZWxlY3Rvck1hcFtzXSlcbiAgICAgIC5qb2luKFwiLFwiKVxuXG4gICAgY29tcGFjdEtleXN0cm9rZXMgPSAoa2V5c3Ryb2tlcykgLT5cbiAgICAgIHNwZWNpYWxDaGFycyA9ICdcXFxcYCpfe31bXSgpIystLiEnXG4gICAgICBzcGVjaWFsQ2hhcnNSZWdleHAgPSAvLy8je3NwZWNpYWxDaGFycy5zcGxpdCgnJykubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKCd8Jyl9Ly8vZ1xuICAgICAgbW9kaWZpZXJLZXlSZWdleHAgPSAvLy8oI3tfLmtleXMobW9kaWZpZXJLZXlNYXApLm1hcChfLmVzY2FwZVJlZ0V4cCkuam9pbignfCcpfSkvLy9cbiAgICAgIGtleXN0cm9rZXNcbiAgICAgICAgIyAucmVwbGFjZSgvKGB8XykvZywgJ1xcXFwkMScpXG4gICAgICAgIC5yZXBsYWNlKG1vZGlmaWVyS2V5UmVnZXhwLCAocykgLT4gbW9kaWZpZXJLZXlNYXBbc10pXG4gICAgICAgIC5yZXBsYWNlKC8vLygje3NwZWNpYWxDaGFyc1JlZ2V4cH0pLy8vZywgXCJcXFxcJDFcIilcbiAgICAgICAgLnJlcGxhY2UoL1xcfC9nLCAnJiMxMjQ7JylcbiAgICAgICAgLnJlcGxhY2UoL1xccysvLCAnJylcblxuICAgIHtnZXRLZXlCaW5kaW5nRm9yQ29tbWFuZCwgZ2V0QW5jZXN0b3JzfSA9IEB2aW1zdGF0ZS51dGlsc1xuICAgIGNvbW1hbmRzID0gKFxuICAgICAgZm9yIG5hbWUsIGtsYXNzIG9mIEJhc2UuZ2V0Q2xhc3NSZWdpc3RyeSgpIHdoZW4ga2xhc3MuaXNDb21tYW5kKClcbiAgICAgICAga2luZCA9IGdldEFuY2VzdG9ycyhrbGFzcykubWFwKChrKSAtPiBrLm5hbWUpWy0yLi4tMl1bMF1cbiAgICAgICAgY29tbWFuZE5hbWUgPSBrbGFzcy5nZXRDb21tYW5kTmFtZSgpXG4gICAgICAgIGRlc2NyaXB0aW9uID0ga2xhc3MuZ2V0RGVzY3RpcHRpb24oKT8ucmVwbGFjZSgvXFxuL2csICc8YnIvPicpXG5cbiAgICAgICAga2V5bWFwID0gbnVsbFxuICAgICAgICBpZiBrZXltYXBzID0gZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmQoY29tbWFuZE5hbWUsIHBhY2thZ2VOYW1lOiBcInZpbS1tb2RlLXBsdXNcIilcbiAgICAgICAgICBrZXltYXAgPSBrZXltYXBzLm1hcCAoe2tleXN0cm9rZXMsIHNlbGVjdG9yfSkgLT5cbiAgICAgICAgICAgIFwiYCN7Y29tcGFjdFNlbGVjdG9yKHNlbGVjdG9yKX1gIDxjb2RlPiN7Y29tcGFjdEtleXN0cm9rZXMoa2V5c3Ryb2tlcyl9PC9jb2RlPlwiXG4gICAgICAgICAgLmpvaW4oXCI8YnIvPlwiKVxuXG4gICAgICAgIHtuYW1lLCBjb21tYW5kTmFtZSwga2luZCwgZGVzY3JpcHRpb24sIGtleW1hcH1cbiAgICApXG4gICAgY29tbWFuZHNcblxuICBnZW5lcmF0ZUNvbW1hbmRUYWJsZUZvck1vdGlvbjogLT5cbiAgICByZXF1aXJlKCcuL21vdGlvbicpXG5cblxuICBraW5kcyA9IFtcIk9wZXJhdG9yXCIsIFwiTW90aW9uXCIsIFwiVGV4dE9iamVjdFwiLCBcIkluc2VydE1vZGVcIiwgXCJNaXNjQ29tbWFuZFwiLCBcIlNjcm9sbFwiXVxuICBnZW5lcmF0ZVN1bW1hcnlUYWJsZUZvckNvbW1hbmRTcGVjczogKHNwZWNzLCB7aGVhZGVyfT17fSkgLT5cbiAgICBfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG4gICAgZ3JvdXBlZCA9IF8uZ3JvdXBCeShzcGVjcywgJ2tpbmQnKVxuICAgIHN0ciA9IFwiXCJcbiAgICBmb3Iga2luZCBpbiBraW5kcyB3aGVuIHNwZWNzID0gZ3JvdXBlZFtraW5kXVxuXG4gICAgICByZXBvcnQgPSBbXG4gICAgICAgIFwiIyMgI3traW5kfVwiXG4gICAgICAgIFwiXCJcbiAgICAgICAgXCJ8IEtleW1hcCB8IENvbW1hbmQgfCBEZXNjcmlwdGlvbiB8XCJcbiAgICAgICAgXCJ8Oi0tLS0tLS18Oi0tLS0tLS0tfDotLS0tLS0tLS0tLS18XCJcbiAgICAgIF1cbiAgICAgIGZvciB7a2V5bWFwLCBjb21tYW5kTmFtZSwgZGVzY3JpcHRpb259IGluIHNwZWNzXG4gICAgICAgIGNvbW1hbmROYW1lID0gY29tbWFuZE5hbWUucmVwbGFjZSgvdmltLW1vZGUtcGx1czovLCAnJylcbiAgICAgICAgZGVzY3JpcHRpb24gPz0gXCJcIlxuICAgICAgICBrZXltYXAgPz0gXCJcIlxuICAgICAgICByZXBvcnQucHVzaCBcInwgI3trZXltYXB9IHwgYCN7Y29tbWFuZE5hbWV9YCB8ICN7ZGVzY3JpcHRpb259IHxcIlxuICAgICAgc3RyICs9IHJlcG9ydC5qb2luKFwiXFxuXCIpICsgXCJcXG5cXG5cIlxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGhlYWRlciArIFwiXFxuXCIpIGlmIGhlYWRlcj9cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KHN0cilcblxuICBnZW5lcmF0ZUNvbW1hbmRTdW1tYXJ5VGFibGU6IC0+XG4gICAgaGVhZGVyID0gXCJcIlwiXG4gICAgIyMgS2V5bWFwIHNlbGVjdG9yIGFiYnJldmlhdGlvbnNcblxuICAgIEluIHRoaXMgZG9jdW1lbnQsIGZvbGxvd2luZyBhYmJyZXZpYXRpb25zIGFyZSB1c2VkIGZvciBzaG9ydG5lc3MuXG5cbiAgICB8IEFiYnJldiB8IFNlbGVjdG9yICAgICAgICAgICAgICAgICAgICAgfCBEZXNjcmlwdGlvbiAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfDotLS0tLS0tfDotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXw6LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICAgIHwgYCFpYCAgIHwgYDpub3QoLmluc2VydC1tb2RlKWAgICAgICAgICB8IGV4Y2VwdCBpbnNlcnQtbW9kZSAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGBpYCAgICB8IGAuaW5zZXJ0LW1vZGVgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgb2AgICAgfCBgLm9wZXJhdG9yLXBlbmRpbmctbW9kZWAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYG5gICAgIHwgYC5ub3JtYWwtbW9kZWAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGB2YCAgICB8IGAudmlzdWFsLW1vZGVgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgdkJgICAgfCBgLnZpc3VhbC1tb2RlLmJsb2Nrd2lzZWAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYHZMYCAgIHwgYC52aXN1YWwtbW9kZS5saW5ld2lzZWAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICB8IGB2Q2AgICB8IGAudmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZWAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgfCBgaVJgICAgfCBgLmluc2VydC1tb2RlLnJlcGxhY2VgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIHwgYCNgICAgIHwgYC53aXRoLWNvdW50YCAgICAgICAgICAgICAgICB8IHdoZW4gY291bnQgaXMgc3BlY2lmaWVkICAgICAgICAgICAgIHxcbiAgICB8IGAlYCAgICB8IGAuaGFzLXBlcnNpc3RlbnQtc2VsZWN0aW9uYCB8IHdoZW4gcGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgZXhpc3RzIHxcblxuICAgIFwiXCJcIlxuICAgIEBnZW5lcmF0ZVN1bW1hcnlUYWJsZUZvckNvbW1hbmRTcGVjcyhAZ2V0Q29tbWFuZFNwZWNzKCksIHtoZWFkZXJ9KVxuXG4gIG9wZW5JblZpbTogLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICB7cm93LCBjb2x1bW59ID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAjIGUuZy4gL0FwcGxpY2F0aW9ucy9NYWNWaW0uYXBwL0NvbnRlbnRzL01hY09TL1ZpbSAtZyAvZXRjL2hvc3RzIFwiK2NhbGwgY3Vyc29yKDQsIDMpXCJcbiAgICBuZXcgQnVmZmVyZWRQcm9jZXNzXG4gICAgICBjb21tYW5kOiBcIi9BcHBsaWNhdGlvbnMvTWFjVmltLmFwcC9Db250ZW50cy9NYWNPUy9WaW1cIlxuICAgICAgYXJnczogWyctZycsIGVkaXRvci5nZXRQYXRoKCksIFwiK2NhbGwgY3Vyc29yKCN7cm93KzF9LCAje2NvbHVtbisxfSlcIl1cblxuICBnZW5lcmF0ZUludHJvc3BlY3Rpb25SZXBvcnQ6IC0+XG4gICAgXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbiAgICBnZW5lcmF0ZUludHJvc3BlY3Rpb25SZXBvcnQgPSByZXF1aXJlICcuL2ludHJvc3BlY3Rpb24nXG5cbiAgICBnZW5lcmF0ZUludHJvc3BlY3Rpb25SZXBvcnQgXy52YWx1ZXMoQmFzZS5nZXRDbGFzc1JlZ2lzdHJ5KCkpLFxuICAgICAgZXhjbHVkZVByb3BlcnRpZXM6IFtcbiAgICAgICAgJ3J1bidcbiAgICAgICAgJ2dldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCdcbiAgICAgICAgJ2dldENsYXNzJywgJ2V4dGVuZCcsICdnZXRQYXJlbnQnLCAnZ2V0QW5jZXN0b3JzJywgJ2lzQ29tbWFuZCdcbiAgICAgICAgJ2dldENsYXNzUmVnaXN0cnknLCAnY29tbWFuZCcsICdyZXNldCdcbiAgICAgICAgJ2dldERlc2N0aXB0aW9uJywgJ2Rlc2NyaXB0aW9uJ1xuICAgICAgICAnaW5pdCcsICdnZXRDb21tYW5kTmFtZScsICdnZXRDb21tYW5kU2NvcGUnLCAncmVnaXN0ZXJDb21tYW5kJyxcbiAgICAgICAgJ2RlbGVnYXRlc1Byb3BlcnRpZXMnLCAnc3Vic2NyaXB0aW9ucycsICdjb21tYW5kUHJlZml4JywgJ2NvbW1hbmRTY29wZSdcbiAgICAgICAgJ2RlbGVnYXRlc01ldGhvZHMnLFxuICAgICAgICAnZGVsZWdhdGVzUHJvcGVydHknLFxuICAgICAgICAnZGVsZWdhdGVzTWV0aG9kJyxcbiAgICAgIF1cbiAgICAgIHJlY3Vyc2l2ZUluc3BlY3Q6IEJhc2VcblxubW9kdWxlLmV4cG9ydHMgPSBEZXZlbG9wZXJcbiJdfQ==
