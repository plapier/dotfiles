(function() {
  var CommandError, Ex, VimOption, _, defer, fs, getFullPath, getSearchTerm, path, replaceGroups, saveAs, trySave,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  path = require('path');

  CommandError = require('./command-error');

  fs = require('fs-plus');

  VimOption = require('./vim-option');

  _ = require('underscore-plus');

  defer = function() {
    var deferred;
    deferred = {};
    deferred.promise = new Promise(function(resolve, reject) {
      deferred.resolve = resolve;
      return deferred.reject = reject;
    });
    return deferred;
  };

  trySave = function(func) {
    var deferred, error, errorMatch, fileName, ref;
    deferred = defer();
    try {
      func();
      deferred.resolve();
    } catch (error1) {
      error = error1;
      if (error.message.endsWith('is a directory')) {
        atom.notifications.addWarning("Unable to save file: " + error.message);
      } else if (error.path != null) {
        if (error.code === 'EACCES') {
          atom.notifications.addWarning("Unable to save file: Permission denied '" + error.path + "'");
        } else if ((ref = error.code) === 'EPERM' || ref === 'EBUSY' || ref === 'UNKNOWN' || ref === 'EEXIST') {
          atom.notifications.addWarning("Unable to save file '" + error.path + "'", {
            detail: error.message
          });
        } else if (error.code === 'EROFS') {
          atom.notifications.addWarning("Unable to save file: Read-only file system '" + error.path + "'");
        }
      } else if ((errorMatch = /ENOTDIR, not a directory '([^']+)'/.exec(error.message))) {
        fileName = errorMatch[1];
        atom.notifications.addWarning("Unable to save file: A directory in the " + ("path '" + fileName + "' could not be written to"));
      } else {
        throw error;
      }
    }
    return deferred.promise;
  };

  saveAs = function(filePath, editor) {
    return fs.writeFileSync(filePath, editor.getText());
  };

  getFullPath = function(filePath) {
    filePath = fs.normalize(filePath);
    if (path.isAbsolute(filePath)) {
      return filePath;
    } else if (atom.project.getPaths().length === 0) {
      return path.join(fs.normalize('~'), filePath);
    } else {
      return path.join(atom.project.getPaths()[0], filePath);
    }
  };

  replaceGroups = function(groups, string) {
    var char, escaped, group, replaced;
    replaced = '';
    escaped = false;
    while ((char = string[0]) != null) {
      string = string.slice(1);
      if (char === '\\' && !escaped) {
        escaped = true;
      } else if (/\d/.test(char) && escaped) {
        escaped = false;
        group = groups[parseInt(char)];
        if (group == null) {
          group = '';
        }
        replaced += group;
      } else {
        escaped = false;
        replaced += char;
      }
    }
    return replaced;
  };

  getSearchTerm = function(term, modifiers) {
    var char, escaped, hasC, hasc, i, len, modFlags, term_;
    if (modifiers == null) {
      modifiers = {
        'g': true
      };
    }
    escaped = false;
    hasc = false;
    hasC = false;
    term_ = term;
    term = '';
    for (i = 0, len = term_.length; i < len; i++) {
      char = term_[i];
      if (char === '\\' && !escaped) {
        escaped = true;
        term += char;
      } else {
        if (char === 'c' && escaped) {
          hasc = true;
          term = term.slice(0, -1);
        } else if (char === 'C' && escaped) {
          hasC = true;
          term = term.slice(0, -1);
        } else if (char !== '\\') {
          term += char;
        }
        escaped = false;
      }
    }
    if (hasC) {
      modifiers['i'] = false;
    }
    if ((!hasC && !term.match('[A-Z]') && atom.config.get('vim-mode.useSmartcaseForSearch')) || hasc) {
      modifiers['i'] = true;
    }
    modFlags = Object.keys(modifiers).filter(function(key) {
      return modifiers[key];
    }).join('');
    try {
      return new RegExp(term, modFlags);
    } catch (error1) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  };

  Ex = (function() {
    function Ex() {
      this.vsp = bind(this.vsp, this);
      this.s = bind(this.s, this);
      this.sp = bind(this.sp, this);
      this.x = bind(this.x, this);
      this.xit = bind(this.xit, this);
      this.saveas = bind(this.saveas, this);
      this.xa = bind(this.xa, this);
      this.xall = bind(this.xall, this);
      this.wqa = bind(this.wqa, this);
      this.wqall = bind(this.wqall, this);
      this.wa = bind(this.wa, this);
      this.wq = bind(this.wq, this);
      this.w = bind(this.w, this);
      this.e = bind(this.e, this);
      this.tabo = bind(this.tabo, this);
      this.tabp = bind(this.tabp, this);
      this.tabn = bind(this.tabn, this);
      this.tabc = bind(this.tabc, this);
      this.tabclose = bind(this.tabclose, this);
      this.tabnew = bind(this.tabnew, this);
      this.tabe = bind(this.tabe, this);
      this.tabedit = bind(this.tabedit, this);
      this.qall = bind(this.qall, this);
      this.q = bind(this.q, this);
    }

    Ex.singleton = function() {
      return Ex.ex || (Ex.ex = new Ex);
    };

    Ex.registerCommand = function(name, func) {
      return Ex.singleton()[name] = func;
    };

    Ex.registerAlias = function(alias, name) {
      return Ex.singleton()[alias] = function(args) {
        return Ex.singleton()[name](args);
      };
    };

    Ex.getCommands = function() {
      return Object.keys(Ex.singleton()).concat(Object.keys(Ex.prototype)).filter(function(cmd, index, list) {
        return list.indexOf(cmd) === index;
      });
    };

    Ex.prototype.quit = function() {
      return atom.workspace.getActivePane().destroyActiveItem();
    };

    Ex.prototype.quitall = function() {
      return atom.close();
    };

    Ex.prototype.q = function() {
      return this.quit();
    };

    Ex.prototype.qall = function() {
      return this.quitall();
    };

    Ex.prototype.tabedit = function(args) {
      if (args.args.trim() !== '') {
        return this.edit(args);
      } else {
        return this.tabnew(args);
      }
    };

    Ex.prototype.tabe = function(args) {
      return this.tabedit(args);
    };

    Ex.prototype.tabnew = function(args) {
      if (args.args.trim() === '') {
        return atom.workspace.open();
      } else {
        return this.tabedit(args);
      }
    };

    Ex.prototype.tabclose = function(args) {
      return this.quit(args);
    };

    Ex.prototype.tabc = function() {
      return this.tabclose();
    };

    Ex.prototype.tabnext = function() {
      var pane;
      pane = atom.workspace.getActivePane();
      return pane.activateNextItem();
    };

    Ex.prototype.tabn = function() {
      return this.tabnext();
    };

    Ex.prototype.tabprevious = function() {
      var pane;
      pane = atom.workspace.getActivePane();
      return pane.activatePreviousItem();
    };

    Ex.prototype.tabp = function() {
      return this.tabprevious();
    };

    Ex.prototype.tabonly = function() {
      var tabBar, tabBarElement;
      tabBar = atom.workspace.getPanes()[0];
      tabBarElement = atom.views.getView(tabBar).querySelector(".tab-bar");
      tabBarElement.querySelector(".right-clicked") && tabBarElement.querySelector(".right-clicked").classList.remove("right-clicked");
      tabBarElement.querySelector(".active").classList.add("right-clicked");
      atom.commands.dispatch(tabBarElement, 'tabs:close-other-tabs');
      return tabBarElement.querySelector(".active").classList.remove("right-clicked");
    };

    Ex.prototype.tabo = function() {
      return this.tabonly();
    };

    Ex.prototype.edit = function(arg) {
      var args, editor, filePath, force, fullPath, range;
      range = arg.range, args = arg.args, editor = arg.editor;
      filePath = args.trim();
      if (filePath[0] === '!') {
        force = true;
        filePath = filePath.slice(1).trim();
      } else {
        force = false;
      }
      if (editor.isModified() && !force) {
        throw new CommandError('No write since last change (add ! to override)');
      }
      if (filePath.indexOf(' ') !== -1) {
        throw new CommandError('Only one file name allowed');
      }
      if (filePath.length !== 0) {
        fullPath = getFullPath(filePath);
        if (fullPath === editor.getPath()) {
          return editor.getBuffer().reload();
        } else {
          return atom.workspace.open(fullPath);
        }
      } else {
        if (editor.getPath() != null) {
          return editor.getBuffer().reload();
        } else {
          throw new CommandError('No file name');
        }
      }
    };

    Ex.prototype.e = function(args) {
      return this.edit(args);
    };

    Ex.prototype.enew = function() {
      var buffer;
      buffer = atom.workspace.getActiveTextEditor().buffer;
      buffer.setPath(void 0);
      return buffer.load();
    };

    Ex.prototype.write = function(arg) {
      var args, deferred, editor, filePath, force, fullPath, range, saveas, saved;
      range = arg.range, args = arg.args, editor = arg.editor, saveas = arg.saveas;
      if (saveas == null) {
        saveas = false;
      }
      filePath = args;
      if (filePath[0] === '!') {
        force = true;
        filePath = filePath.slice(1);
      } else {
        force = false;
      }
      filePath = filePath.trim();
      if (filePath.indexOf(' ') !== -1) {
        throw new CommandError('Only one file name allowed');
      }
      deferred = defer();
      editor = atom.workspace.getActiveTextEditor();
      saved = false;
      if (filePath.length !== 0) {
        fullPath = getFullPath(filePath);
      }
      if ((editor.getPath() != null) && ((fullPath == null) || editor.getPath() === fullPath)) {
        if (saveas) {
          throw new CommandError("Argument required");
        } else {
          trySave(function() {
            return editor.save();
          }).then(deferred.resolve);
          saved = true;
        }
      } else if (fullPath == null) {
        fullPath = atom.showSaveDialogSync();
      }
      if (!saved && (fullPath != null)) {
        if (!force && fs.existsSync(fullPath)) {
          throw new CommandError("File exists (add ! to override)");
        }
        if (saveas || editor.getFileName() === null) {
          editor = atom.workspace.getActiveTextEditor();
          trySave(function() {
            return editor.saveAs(fullPath, editor);
          }).then(deferred.resolve);
        } else {
          trySave(function() {
            return saveAs(fullPath, editor);
          }).then(deferred.resolve);
        }
      }
      return deferred.promise;
    };

    Ex.prototype.wall = function() {
      return atom.workspace.saveAll();
    };

    Ex.prototype.w = function(args) {
      return this.write(args);
    };

    Ex.prototype.wq = function(args) {
      return this.write(args).then((function(_this) {
        return function() {
          return _this.quit();
        };
      })(this));
    };

    Ex.prototype.wa = function() {
      return this.wall();
    };

    Ex.prototype.wqall = function() {
      this.wall();
      return this.quitall();
    };

    Ex.prototype.wqa = function() {
      return this.wqall();
    };

    Ex.prototype.xall = function() {
      return this.wqall();
    };

    Ex.prototype.xa = function() {
      return this.wqall();
    };

    Ex.prototype.saveas = function(args) {
      args.saveas = true;
      return this.write(args);
    };

    Ex.prototype.xit = function(args) {
      return this.wq(args);
    };

    Ex.prototype.x = function(args) {
      return this.xit(args);
    };

    Ex.prototype.split = function(arg) {
      var args, file, filePaths, i, j, len, len1, newPane, pane, range, results, results1;
      range = arg.range, args = arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if (atom.config.get('ex-mode.splitbelow')) {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitDown();
          results = [];
          for (i = 0, len = filePaths.length; i < len; i++) {
            file = filePaths[i];
            results.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results;
        } else {
          return pane.splitDown({
            copyActiveItem: true
          });
        }
      } else {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitUp();
          results1 = [];
          for (j = 0, len1 = filePaths.length; j < len1; j++) {
            file = filePaths[j];
            results1.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results1;
        } else {
          return pane.splitUp({
            copyActiveItem: true
          });
        }
      }
    };

    Ex.prototype.sp = function(args) {
      return this.split(args);
    };

    Ex.prototype.substitute = function(arg) {
      var args, args_, char, delim, e, editor, escapeChars, escaped, flags, flagsObj, parsed, parsing, pattern, patternRE, range, substition, vimState;
      range = arg.range, args = arg.args, editor = arg.editor, vimState = arg.vimState;
      args_ = args.trimLeft();
      delim = args_[0];
      if (/[a-z1-9\\"|]/i.test(delim)) {
        throw new CommandError("Regular expressions can't be delimited by alphanumeric characters, '\\', '\"' or '|'");
      }
      args_ = args_.slice(1);
      escapeChars = {
        t: '\t',
        n: '\n',
        r: '\r'
      };
      parsed = ['', '', ''];
      parsing = 0;
      escaped = false;
      while ((char = args_[0]) != null) {
        args_ = args_.slice(1);
        if (char === delim) {
          if (!escaped) {
            parsing++;
            if (parsing > 2) {
              throw new CommandError('Trailing characters');
            }
          } else {
            parsed[parsing] = parsed[parsing].slice(0, -1);
          }
        } else if (char === '\\' && !escaped) {
          parsed[parsing] += char;
          escaped = true;
        } else if (parsing === 1 && escaped && (escapeChars[char] != null)) {
          parsed[parsing] += escapeChars[char];
          escaped = false;
        } else {
          escaped = false;
          parsed[parsing] += char;
        }
      }
      pattern = parsed[0], substition = parsed[1], flags = parsed[2];
      if (pattern === '') {
        if (vimState.getSearchHistoryItem != null) {
          pattern = vimState.getSearchHistoryItem();
        } else if (vimState.searchHistory != null) {
          pattern = vimState.searchHistory.get('prev');
        }
        if (pattern == null) {
          atom.beep();
          throw new CommandError('No previous regular expression');
        }
      } else {
        if (vimState.pushSearchHistory != null) {
          vimState.pushSearchHistory(pattern);
        } else if (vimState.searchHistory != null) {
          vimState.searchHistory.save(pattern);
        }
      }
      try {
        flagsObj = {};
        flags.split('').forEach(function(flag) {
          return flagsObj[flag] = true;
        });
        patternRE = getSearchTerm(pattern, flagsObj);
      } catch (error1) {
        e = error1;
        if (e.message.indexOf('Invalid flags supplied to RegExp constructor') === 0) {
          throw new CommandError("Invalid flags: " + e.message.slice(45));
        } else if (e.message.indexOf('Invalid regular expression: ') === 0) {
          throw new CommandError("Invalid RegEx: " + e.message.slice(27));
        } else {
          throw e;
        }
      }
      return editor.transact(function() {
        var i, line, ref, ref1, results;
        results = [];
        for (line = i = ref = range[0], ref1 = range[1]; ref <= ref1 ? i <= ref1 : i >= ref1; line = ref <= ref1 ? ++i : --i) {
          results.push(editor.scanInBufferRange(patternRE, [[line, 0], [line + 1, 0]], function(arg1) {
            var match, replace;
            match = arg1.match, replace = arg1.replace;
            return replace(replaceGroups(match.slice(0), substition));
          }));
        }
        return results;
      });
    };

    Ex.prototype.s = function(args) {
      return this.substitute(args);
    };

    Ex.prototype.vsplit = function(arg) {
      var args, file, filePaths, i, j, len, len1, newPane, pane, range, results, results1;
      range = arg.range, args = arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if (atom.config.get('ex-mode.splitright')) {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitRight();
          results = [];
          for (i = 0, len = filePaths.length; i < len; i++) {
            file = filePaths[i];
            results.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results;
        } else {
          return pane.splitRight({
            copyActiveItem: true
          });
        }
      } else {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitLeft();
          results1 = [];
          for (j = 0, len1 = filePaths.length; j < len1; j++) {
            file = filePaths[j];
            results1.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results1;
        } else {
          return pane.splitLeft({
            copyActiveItem: true
          });
        }
      }
    };

    Ex.prototype.vsp = function(args) {
      return this.vsplit(args);
    };

    Ex.prototype["delete"] = function(arg) {
      var editor, range, text;
      range = arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      editor = atom.workspace.getActiveTextEditor();
      text = editor.getTextInBufferRange(range);
      atom.clipboard.write(text);
      return editor.buffer.setTextInRange(range, '');
    };

    Ex.prototype.yank = function(arg) {
      var range, txt;
      range = arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      txt = atom.workspace.getActiveTextEditor().getTextInBufferRange(range);
      return atom.clipboard.write(txt);
    };

    Ex.prototype.set = function(arg) {
      var args, i, len, option, options, range, results;
      range = arg.range, args = arg.args;
      args = args.trim();
      if (args === "") {
        throw new CommandError("No option specified");
      }
      options = args.split(' ');
      results = [];
      for (i = 0, len = options.length; i < len; i++) {
        option = options[i];
        results.push((function() {
          var nameValPair, optionName, optionProcessor, optionValue;
          if (option.includes("=")) {
            nameValPair = option.split("=");
            if (nameValPair.length !== 2) {
              throw new CommandError("Wrong option format. [name]=[value] format is expected");
            }
            optionName = nameValPair[0];
            optionValue = nameValPair[1];
            optionProcessor = VimOption.singleton()[optionName];
            if (optionProcessor == null) {
              throw new CommandError("No such option: " + optionName);
            }
            return optionProcessor(optionValue);
          } else {
            optionProcessor = VimOption.singleton()[option];
            if (optionProcessor == null) {
              throw new CommandError("No such option: " + option);
            }
            return optionProcessor();
          }
        })());
      }
      return results;
    };

    return Ex;

  })();

  module.exports = Ex;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJHQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjs7RUFDWixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLEtBQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLFFBQUEsR0FBVztJQUNYLFFBQVEsQ0FBQyxPQUFULEdBQXVCLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7TUFDN0IsUUFBUSxDQUFDLE9BQVQsR0FBbUI7YUFDbkIsUUFBUSxDQUFDLE1BQVQsR0FBa0I7SUFGVyxDQUFSO0FBSXZCLFdBQU87RUFORDs7RUFTUixPQUFBLEdBQVUsU0FBQyxJQUFEO0FBQ1IsUUFBQTtJQUFBLFFBQUEsR0FBVyxLQUFBLENBQUE7QUFFWDtNQUNFLElBQUEsQ0FBQTtNQUNBLFFBQVEsQ0FBQyxPQUFULENBQUEsRUFGRjtLQUFBLGNBQUE7TUFHTTtNQUNKLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixDQUFIO1FBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4Qix1QkFBQSxHQUF3QixLQUFLLENBQUMsT0FBNUQsRUFERjtPQUFBLE1BRUssSUFBRyxrQkFBSDtRQUNILElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxRQUFqQjtVQUNFLElBQUksQ0FBQyxhQUNILENBQUMsVUFESCxDQUNjLDBDQUFBLEdBQTJDLEtBQUssQ0FBQyxJQUFqRCxHQUFzRCxHQURwRSxFQURGO1NBQUEsTUFHSyxXQUFHLEtB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Q0UsY0FBVSxJQUFBLFlBQUEsQ0FBYSxxQkFBYixFQURaOztNQUVBLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQVg7QUFDVjtXQUFBLHlDQUFBOztxQkFDSyxDQUFBLFNBQUE7QUFDRCxjQUFBO1VBQUEsSUFBRyxNQUFNLENBQUMsUUFBUCxDQUFnQixHQUFoQixDQUFIO1lBQ0UsV0FBQSxHQUFjLE1BQU0sQ0FBQyxLQUFQLENBQWEsR0FBYjtZQUNkLElBQUksV0FBVyxDQUFDLE1BQVosS0FBc0IsQ0FBMUI7QUFDRSxvQkFBVSxJQUFBLFlBQUEsQ0FBYSx3REFBYixFQURaOztZQUVBLFVBQUEsR0FBYSxXQUFZLENBQUEsQ0FBQTtZQUN6QixXQUFBLEdBQWMsV0FBWSxDQUFBLENBQUE7WUFDMUIsZUFBQSxHQUFrQixTQUFTLENBQUMsU0FBVixDQUFBLENBQXNCLENBQUEsVUFBQTtZQUN4QyxJQUFPLHVCQUFQO0FBQ0Usb0JBQVUsSUFBQSxZQUFBLENBQWEsa0JBQUEsR0FBbUIsVUFBaEMsRUFEWjs7bUJBRUEsZUFBQSxDQUFnQixXQUFoQixFQVRGO1dBQUEsTUFBQTtZQVdFLGVBQUEsR0FBa0IsU0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUFzQixDQUFBLE1BQUE7WUFDeEMsSUFBTyx1QkFBUDtBQUNFLG9CQUFVLElBQUEsWUFBQSxDQUFhLGtCQUFBLEdBQW1CLE1BQWhDLEVBRFo7O21CQUVBLGVBQUEsQ0FBQSxFQWRGOztRQURDLENBQUEsQ0FBSCxDQUFBO0FBREY7O0lBTEc7Ozs7OztFQXVCUCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXZiakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbkNvbW1hbmRFcnJvciA9IHJlcXVpcmUgJy4vY29tbWFuZC1lcnJvcidcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblZpbU9wdGlvbiA9IHJlcXVpcmUgJy4vdmltLW9wdGlvbidcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbmRlZmVyID0gKCkgLT5cbiAgZGVmZXJyZWQgPSB7fVxuICBkZWZlcnJlZC5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICBkZWZlcnJlZC5yZXNvbHZlID0gcmVzb2x2ZVxuICAgIGRlZmVycmVkLnJlamVjdCA9IHJlamVjdFxuICApXG4gIHJldHVybiBkZWZlcnJlZFxuXG5cbnRyeVNhdmUgPSAoZnVuYykgLT5cbiAgZGVmZXJyZWQgPSBkZWZlcigpXG5cbiAgdHJ5XG4gICAgZnVuYygpXG4gICAgZGVmZXJyZWQucmVzb2x2ZSgpXG4gIGNhdGNoIGVycm9yXG4gICAgaWYgZXJyb3IubWVzc2FnZS5lbmRzV2l0aCgnaXMgYSBkaXJlY3RvcnknKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJVbmFibGUgdG8gc2F2ZSBmaWxlOiAje2Vycm9yLm1lc3NhZ2V9XCIpXG4gICAgZWxzZSBpZiBlcnJvci5wYXRoP1xuICAgICAgaWYgZXJyb3IuY29kZSBpcyAnRUFDQ0VTJ1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnNcbiAgICAgICAgICAuYWRkV2FybmluZyhcIlVuYWJsZSB0byBzYXZlIGZpbGU6IFBlcm1pc3Npb24gZGVuaWVkICcje2Vycm9yLnBhdGh9J1wiKVxuICAgICAgZWxzZSBpZiBlcnJvci5jb2RlIGluIFsnRVBFUk0nLCAnRUJVU1knLCAnVU5LTk9XTicsICdFRVhJU1QnXVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIlVuYWJsZSB0byBzYXZlIGZpbGUgJyN7ZXJyb3IucGF0aH0nXCIsXG4gICAgICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlKVxuICAgICAgZWxzZSBpZiBlcnJvci5jb2RlIGlzICdFUk9GUydcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgXCJVbmFibGUgdG8gc2F2ZSBmaWxlOiBSZWFkLW9ubHkgZmlsZSBzeXN0ZW0gJyN7ZXJyb3IucGF0aH0nXCIpXG4gICAgZWxzZSBpZiAoZXJyb3JNYXRjaCA9XG4gICAgICAgIC9FTk9URElSLCBub3QgYSBkaXJlY3RvcnkgJyhbXiddKyknLy5leGVjKGVycm9yLm1lc3NhZ2UpKVxuICAgICAgZmlsZU5hbWUgPSBlcnJvck1hdGNoWzFdXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIlVuYWJsZSB0byBzYXZlIGZpbGU6IEEgZGlyZWN0b3J5IGluIHRoZSBcIitcbiAgICAgICAgXCJwYXRoICcje2ZpbGVOYW1lfScgY291bGQgbm90IGJlIHdyaXR0ZW4gdG9cIilcbiAgICBlbHNlXG4gICAgICB0aHJvdyBlcnJvclxuXG4gIGRlZmVycmVkLnByb21pc2Vcblxuc2F2ZUFzID0gKGZpbGVQYXRoLCBlZGl0b3IpIC0+XG4gIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGVkaXRvci5nZXRUZXh0KCkpXG5cbmdldEZ1bGxQYXRoID0gKGZpbGVQYXRoKSAtPlxuICBmaWxlUGF0aCA9IGZzLm5vcm1hbGl6ZShmaWxlUGF0aClcblxuICBpZiBwYXRoLmlzQWJzb2x1dGUoZmlsZVBhdGgpXG4gICAgZmlsZVBhdGhcbiAgZWxzZSBpZiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5sZW5ndGggPT0gMFxuICAgIHBhdGguam9pbihmcy5ub3JtYWxpemUoJ34nKSwgZmlsZVBhdGgpXG4gIGVsc2VcbiAgICBwYXRoLmpvaW4oYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0sIGZpbGVQYXRoKVxuXG5yZXBsYWNlR3JvdXBzID0gKGdyb3Vwcywgc3RyaW5nKSAtPlxuICByZXBsYWNlZCA9ICcnXG4gIGVzY2FwZWQgPSBmYWxzZVxuICB3aGlsZSAoY2hhciA9IHN0cmluZ1swXSk/XG4gICAgc3RyaW5nID0gc3RyaW5nWzEuLl1cbiAgICBpZiBjaGFyIGlzICdcXFxcJyBhbmQgbm90IGVzY2FwZWRcbiAgICAgIGVzY2FwZWQgPSB0cnVlXG4gICAgZWxzZSBpZiAvXFxkLy50ZXN0KGNoYXIpIGFuZCBlc2NhcGVkXG4gICAgICBlc2NhcGVkID0gZmFsc2VcbiAgICAgIGdyb3VwID0gZ3JvdXBzW3BhcnNlSW50KGNoYXIpXVxuICAgICAgZ3JvdXAgPz0gJydcbiAgICAgIHJlcGxhY2VkICs9IGdyb3VwXG4gICAgZWxzZVxuICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICByZXBsYWNlZCArPSBjaGFyXG5cbiAgcmVwbGFjZWRcblxuZ2V0U2VhcmNoVGVybSA9ICh0ZXJtLCBtb2RpZmllcnMgPSB7J2cnOiB0cnVlfSkgLT5cblxuICBlc2NhcGVkID0gZmFsc2VcbiAgaGFzYyA9IGZhbHNlXG4gIGhhc0MgPSBmYWxzZVxuICB0ZXJtXyA9IHRlcm1cbiAgdGVybSA9ICcnXG4gIGZvciBjaGFyIGluIHRlcm1fXG4gICAgaWYgY2hhciBpcyAnXFxcXCcgYW5kIG5vdCBlc2NhcGVkXG4gICAgICBlc2NhcGVkID0gdHJ1ZVxuICAgICAgdGVybSArPSBjaGFyXG4gICAgZWxzZVxuICAgICAgaWYgY2hhciBpcyAnYycgYW5kIGVzY2FwZWRcbiAgICAgICAgaGFzYyA9IHRydWVcbiAgICAgICAgdGVybSA9IHRlcm1bLi4uLTFdXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgJ0MnIGFuZCBlc2NhcGVkXG4gICAgICAgIGhhc0MgPSB0cnVlXG4gICAgICAgIHRlcm0gPSB0ZXJtWy4uLi0xXVxuICAgICAgZWxzZSBpZiBjaGFyIGlzbnQgJ1xcXFwnXG4gICAgICAgIHRlcm0gKz0gY2hhclxuICAgICAgZXNjYXBlZCA9IGZhbHNlXG5cbiAgaWYgaGFzQ1xuICAgIG1vZGlmaWVyc1snaSddID0gZmFsc2VcbiAgaWYgKG5vdCBoYXNDIGFuZCBub3QgdGVybS5tYXRjaCgnW0EtWl0nKSBhbmQgXFxcbiAgICAgIGF0b20uY29uZmlnLmdldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJykpIG9yIGhhc2NcbiAgICBtb2RpZmllcnNbJ2knXSA9IHRydWVcblxuICBtb2RGbGFncyA9IE9iamVjdC5rZXlzKG1vZGlmaWVycykuZmlsdGVyKChrZXkpIC0+IG1vZGlmaWVyc1trZXldKS5qb2luKCcnKVxuXG4gIHRyeVxuICAgIG5ldyBSZWdFeHAodGVybSwgbW9kRmxhZ3MpXG4gIGNhdGNoXG4gICAgbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0ZXJtKSwgbW9kRmxhZ3MpXG5cbmNsYXNzIEV4XG4gIEBzaW5nbGV0b246ID0+XG4gICAgQGV4IHx8PSBuZXcgRXhcblxuICBAcmVnaXN0ZXJDb21tYW5kOiAobmFtZSwgZnVuYykgPT5cbiAgICBAc2luZ2xldG9uKClbbmFtZV0gPSBmdW5jXG5cbiAgQHJlZ2lzdGVyQWxpYXM6IChhbGlhcywgbmFtZSkgPT5cbiAgICBAc2luZ2xldG9uKClbYWxpYXNdID0gKGFyZ3MpID0+IEBzaW5nbGV0b24oKVtuYW1lXShhcmdzKVxuXG4gIEBnZXRDb21tYW5kczogKCkgPT5cbiAgICBPYmplY3Qua2V5cyhFeC5zaW5nbGV0b24oKSkuY29uY2F0KE9iamVjdC5rZXlzKEV4LnByb3RvdHlwZSkpLmZpbHRlcigoY21kLCBpbmRleCwgbGlzdCkgLT5cbiAgICAgIGxpc3QuaW5kZXhPZihjbWQpID09IGluZGV4XG4gICAgKVxuXG4gIHF1aXQ6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmRlc3Ryb3lBY3RpdmVJdGVtKClcblxuICBxdWl0YWxsOiAtPlxuICAgIGF0b20uY2xvc2UoKVxuXG4gIHE6ID0+IEBxdWl0KClcblxuICBxYWxsOiA9PiBAcXVpdGFsbCgpXG5cbiAgdGFiZWRpdDogKGFyZ3MpID0+XG4gICAgaWYgYXJncy5hcmdzLnRyaW0oKSBpc250ICcnXG4gICAgICBAZWRpdChhcmdzKVxuICAgIGVsc2VcbiAgICAgIEB0YWJuZXcoYXJncylcblxuICB0YWJlOiAoYXJncykgPT4gQHRhYmVkaXQoYXJncylcblxuICB0YWJuZXc6IChhcmdzKSA9PlxuICAgIGlmIGFyZ3MuYXJncy50cmltKCkgaXMgJydcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKVxuICAgIGVsc2VcbiAgICAgIEB0YWJlZGl0KGFyZ3MpXG5cbiAgdGFiY2xvc2U6IChhcmdzKSA9PiBAcXVpdChhcmdzKVxuXG4gIHRhYmM6ID0+IEB0YWJjbG9zZSgpXG5cbiAgdGFibmV4dDogLT5cbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgcGFuZS5hY3RpdmF0ZU5leHRJdGVtKClcblxuICB0YWJuOiA9PiBAdGFibmV4dCgpXG5cbiAgdGFicHJldmlvdXM6IC0+XG4gICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIHBhbmUuYWN0aXZhdGVQcmV2aW91c0l0ZW0oKVxuXG4gIHRhYnA6ID0+IEB0YWJwcmV2aW91cygpXG5cbiAgdGFib25seTogLT5cbiAgICB0YWJCYXIgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpWzBdXG4gICAgdGFiQmFyRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0YWJCYXIpLnF1ZXJ5U2VsZWN0b3IoXCIudGFiLWJhclwiKVxuICAgIHRhYkJhckVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5yaWdodC1jbGlja2VkXCIpICYmIHRhYkJhckVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5yaWdodC1jbGlja2VkXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJyaWdodC1jbGlja2VkXCIpXG4gICAgdGFiQmFyRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmFjdGl2ZVwiKS5jbGFzc0xpc3QuYWRkKFwicmlnaHQtY2xpY2tlZFwiKVxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFiQmFyRWxlbWVudCwgJ3RhYnM6Y2xvc2Utb3RoZXItdGFicycpXG4gICAgdGFiQmFyRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLmFjdGl2ZVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwicmlnaHQtY2xpY2tlZFwiKVxuXG4gIHRhYm86ID0+IEB0YWJvbmx5KClcblxuICBlZGl0OiAoeyByYW5nZSwgYXJncywgZWRpdG9yIH0pIC0+XG4gICAgZmlsZVBhdGggPSBhcmdzLnRyaW0oKVxuICAgIGlmIGZpbGVQYXRoWzBdIGlzICchJ1xuICAgICAgZm9yY2UgPSB0cnVlXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoWzEuLl0udHJpbSgpXG4gICAgZWxzZVxuICAgICAgZm9yY2UgPSBmYWxzZVxuXG4gICAgaWYgZWRpdG9yLmlzTW9kaWZpZWQoKSBhbmQgbm90IGZvcmNlXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdObyB3cml0ZSBzaW5jZSBsYXN0IGNoYW5nZSAoYWRkICEgdG8gb3ZlcnJpZGUpJylcbiAgICBpZiBmaWxlUGF0aC5pbmRleE9mKCcgJykgaXNudCAtMVxuICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignT25seSBvbmUgZmlsZSBuYW1lIGFsbG93ZWQnKVxuXG4gICAgaWYgZmlsZVBhdGgubGVuZ3RoIGlzbnQgMFxuICAgICAgZnVsbFBhdGggPSBnZXRGdWxsUGF0aChmaWxlUGF0aClcbiAgICAgIGlmIGZ1bGxQYXRoIGlzIGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnJlbG9hZCgpXG4gICAgICBlbHNlXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZnVsbFBhdGgpXG4gICAgZWxzZVxuICAgICAgaWYgZWRpdG9yLmdldFBhdGgoKT9cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnJlbG9hZCgpXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ05vIGZpbGUgbmFtZScpXG5cbiAgZTogKGFyZ3MpID0+IEBlZGl0KGFyZ3MpXG5cbiAgZW5ldzogLT5cbiAgICBidWZmZXIgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuYnVmZmVyXG4gICAgYnVmZmVyLnNldFBhdGgodW5kZWZpbmVkKVxuICAgIGJ1ZmZlci5sb2FkKClcblxuICB3cml0ZTogKHsgcmFuZ2UsIGFyZ3MsIGVkaXRvciwgc2F2ZWFzIH0pIC0+XG4gICAgc2F2ZWFzID89IGZhbHNlXG4gICAgZmlsZVBhdGggPSBhcmdzXG4gICAgaWYgZmlsZVBhdGhbMF0gaXMgJyEnXG4gICAgICBmb3JjZSA9IHRydWVcbiAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGhbMS4uXVxuICAgIGVsc2VcbiAgICAgIGZvcmNlID0gZmFsc2VcblxuICAgIGZpbGVQYXRoID0gZmlsZVBhdGgudHJpbSgpXG4gICAgaWYgZmlsZVBhdGguaW5kZXhPZignICcpIGlzbnQgLTFcbiAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ09ubHkgb25lIGZpbGUgbmFtZSBhbGxvd2VkJylcblxuICAgIGRlZmVycmVkID0gZGVmZXIoKVxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgc2F2ZWQgPSBmYWxzZVxuICAgIGlmIGZpbGVQYXRoLmxlbmd0aCBpc250IDBcbiAgICAgIGZ1bGxQYXRoID0gZ2V0RnVsbFBhdGgoZmlsZVBhdGgpXG4gICAgaWYgZWRpdG9yLmdldFBhdGgoKT8gYW5kIChub3QgZnVsbFBhdGg/IG9yIGVkaXRvci5nZXRQYXRoKCkgPT0gZnVsbFBhdGgpXG4gICAgICBpZiBzYXZlYXNcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIkFyZ3VtZW50IHJlcXVpcmVkXCIpXG4gICAgICBlbHNlXG4gICAgICAgICMgVXNlIGVkaXRvci5zYXZlIHdoZW4gbm8gcGF0aCBpcyBnaXZlbiBvciB0aGUgcGF0aCB0byB0aGUgZmlsZSBpcyBnaXZlblxuICAgICAgICB0cnlTYXZlKC0+IGVkaXRvci5zYXZlKCkpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSlcbiAgICAgICAgc2F2ZWQgPSB0cnVlXG4gICAgZWxzZSBpZiBub3QgZnVsbFBhdGg/XG4gICAgICBmdWxsUGF0aCA9IGF0b20uc2hvd1NhdmVEaWFsb2dTeW5jKClcblxuICAgIGlmIG5vdCBzYXZlZCBhbmQgZnVsbFBhdGg/XG4gICAgICBpZiBub3QgZm9yY2UgYW5kIGZzLmV4aXN0c1N5bmMoZnVsbFBhdGgpXG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJGaWxlIGV4aXN0cyAoYWRkICEgdG8gb3ZlcnJpZGUpXCIpXG4gICAgICBpZiBzYXZlYXMgb3IgZWRpdG9yLmdldEZpbGVOYW1lKCkgPT0gbnVsbFxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgdHJ5U2F2ZSgtPiBlZGl0b3Iuc2F2ZUFzKGZ1bGxQYXRoLCBlZGl0b3IpKS50aGVuKGRlZmVycmVkLnJlc29sdmUpXG4gICAgICBlbHNlXG4gICAgICAgIHRyeVNhdmUoLT4gc2F2ZUFzKGZ1bGxQYXRoLCBlZGl0b3IpKS50aGVuKGRlZmVycmVkLnJlc29sdmUpXG5cbiAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgd2FsbDogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5zYXZlQWxsKClcblxuICB3OiAoYXJncykgPT5cbiAgICBAd3JpdGUoYXJncylcblxuICB3cTogKGFyZ3MpID0+XG4gICAgQHdyaXRlKGFyZ3MpLnRoZW4gPT4gQHF1aXQoKVxuXG4gIHdhOiA9PlxuICAgIEB3YWxsKClcblxuICB3cWFsbDogPT5cbiAgICBAd2FsbCgpXG4gICAgQHF1aXRhbGwoKVxuXG4gIHdxYTogPT5cbiAgICBAd3FhbGwoKVxuXG4gIHhhbGw6ID0+XG4gICAgQHdxYWxsKClcblxuICB4YTogPT5cbiAgICBAd3FhbGwoKVxuXG4gIHNhdmVhczogKGFyZ3MpID0+XG4gICAgYXJncy5zYXZlYXMgPSB0cnVlXG4gICAgQHdyaXRlKGFyZ3MpXG5cbiAgeGl0OiAoYXJncykgPT4gQHdxKGFyZ3MpXG5cbiAgeDogKGFyZ3MpID0+IEB4aXQoYXJncylcblxuICBzcGxpdDogKHsgcmFuZ2UsIGFyZ3MgfSkgLT5cbiAgICBhcmdzID0gYXJncy50cmltKClcbiAgICBmaWxlUGF0aHMgPSBhcmdzLnNwbGl0KCcgJylcbiAgICBmaWxlUGF0aHMgPSB1bmRlZmluZWQgaWYgZmlsZVBhdGhzLmxlbmd0aCBpcyAxIGFuZCBmaWxlUGF0aHNbMF0gaXMgJydcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0YmVsb3cnKVxuICAgICAgaWYgZmlsZVBhdGhzPyBhbmQgZmlsZVBhdGhzLmxlbmd0aCA+IDBcbiAgICAgICAgbmV3UGFuZSA9IHBhbmUuc3BsaXREb3duKClcbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZVBhdGhzXG4gICAgICAgICAgZG8gLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgZmlsZSwgbmV3UGFuZVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lLnNwbGl0RG93bihjb3B5QWN0aXZlSXRlbTogdHJ1ZSlcbiAgICBlbHNlXG4gICAgICBpZiBmaWxlUGF0aHM/IGFuZCBmaWxlUGF0aHMubGVuZ3RoID4gMFxuICAgICAgICBuZXdQYW5lID0gcGFuZS5zcGxpdFVwKClcbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZVBhdGhzXG4gICAgICAgICAgZG8gLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgZmlsZSwgbmV3UGFuZVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lLnNwbGl0VXAoY29weUFjdGl2ZUl0ZW06IHRydWUpXG5cblxuICBzcDogKGFyZ3MpID0+IEBzcGxpdChhcmdzKVxuXG4gIHN1YnN0aXR1dGU6ICh7IHJhbmdlLCBhcmdzLCBlZGl0b3IsIHZpbVN0YXRlIH0pIC0+XG4gICAgYXJnc18gPSBhcmdzLnRyaW1MZWZ0KClcbiAgICBkZWxpbSA9IGFyZ3NfWzBdXG4gICAgaWYgL1thLXoxLTlcXFxcXCJ8XS9pLnRlc3QoZGVsaW0pXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFxuICAgICAgICBcIlJlZ3VsYXIgZXhwcmVzc2lvbnMgY2FuJ3QgYmUgZGVsaW1pdGVkIGJ5IGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzLCAnXFxcXCcsICdcXFwiJyBvciAnfCdcIilcbiAgICBhcmdzXyA9IGFyZ3NfWzEuLl1cbiAgICBlc2NhcGVDaGFycyA9IHt0OiAnXFx0JywgbjogJ1xcbicsIHI6ICdcXHInfVxuICAgIHBhcnNlZCA9IFsnJywgJycsICcnXVxuICAgIHBhcnNpbmcgPSAwXG4gICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgd2hpbGUgKGNoYXIgPSBhcmdzX1swXSk/XG4gICAgICBhcmdzXyA9IGFyZ3NfWzEuLl1cbiAgICAgIGlmIGNoYXIgaXMgZGVsaW1cbiAgICAgICAgaWYgbm90IGVzY2FwZWRcbiAgICAgICAgICBwYXJzaW5nKytcbiAgICAgICAgICBpZiBwYXJzaW5nID4gMlxuICAgICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignVHJhaWxpbmcgY2hhcmFjdGVycycpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwYXJzZWRbcGFyc2luZ10gPSBwYXJzZWRbcGFyc2luZ11bLi4uLTFdXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgJ1xcXFwnIGFuZCBub3QgZXNjYXBlZFxuICAgICAgICBwYXJzZWRbcGFyc2luZ10gKz0gY2hhclxuICAgICAgICBlc2NhcGVkID0gdHJ1ZVxuICAgICAgZWxzZSBpZiBwYXJzaW5nID09IDEgYW5kIGVzY2FwZWQgYW5kIGVzY2FwZUNoYXJzW2NoYXJdP1xuICAgICAgICBwYXJzZWRbcGFyc2luZ10gKz0gZXNjYXBlQ2hhcnNbY2hhcl1cbiAgICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIGVzY2FwZWQgPSBmYWxzZVxuICAgICAgICBwYXJzZWRbcGFyc2luZ10gKz0gY2hhclxuXG4gICAgW3BhdHRlcm4sIHN1YnN0aXRpb24sIGZsYWdzXSA9IHBhcnNlZFxuICAgIGlmIHBhdHRlcm4gaXMgJydcbiAgICAgIGlmIHZpbVN0YXRlLmdldFNlYXJjaEhpc3RvcnlJdGVtP1xuICAgICAgICAjIHZpbS1tb2RlXG4gICAgICAgIHBhdHRlcm4gPSB2aW1TdGF0ZS5nZXRTZWFyY2hIaXN0b3J5SXRlbSgpXG4gICAgICBlbHNlIGlmIHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnk/XG4gICAgICAgICMgdmltLW1vZGUtcGx1c1xuICAgICAgICBwYXR0ZXJuID0gdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ3ByZXYnKVxuXG4gICAgICBpZiBub3QgcGF0dGVybj9cbiAgICAgICAgYXRvbS5iZWVwKClcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignTm8gcHJldmlvdXMgcmVndWxhciBleHByZXNzaW9uJylcbiAgICBlbHNlXG4gICAgICBpZiB2aW1TdGF0ZS5wdXNoU2VhcmNoSGlzdG9yeT9cbiAgICAgICAgIyB2aW0tbW9kZVxuICAgICAgICB2aW1TdGF0ZS5wdXNoU2VhcmNoSGlzdG9yeShwYXR0ZXJuKVxuICAgICAgZWxzZSBpZiB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5P1xuICAgICAgICAjIHZpbS1tb2RlLXBsdXNcbiAgICAgICAgdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKHBhdHRlcm4pXG5cbiAgICB0cnlcbiAgICAgIGZsYWdzT2JqID0ge31cbiAgICAgIGZsYWdzLnNwbGl0KCcnKS5mb3JFYWNoKChmbGFnKSAtPiBmbGFnc09ialtmbGFnXSA9IHRydWUpXG4gICAgICBwYXR0ZXJuUkUgPSBnZXRTZWFyY2hUZXJtKHBhdHRlcm4sIGZsYWdzT2JqKVxuICAgIGNhdGNoIGVcbiAgICAgIGlmIGUubWVzc2FnZS5pbmRleE9mKCdJbnZhbGlkIGZsYWdzIHN1cHBsaWVkIHRvIFJlZ0V4cCBjb25zdHJ1Y3RvcicpIGlzIDBcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIkludmFsaWQgZmxhZ3M6ICN7ZS5tZXNzYWdlWzQ1Li5dfVwiKVxuICAgICAgZWxzZSBpZiBlLm1lc3NhZ2UuaW5kZXhPZignSW52YWxpZCByZWd1bGFyIGV4cHJlc3Npb246ICcpIGlzIDBcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIkludmFsaWQgUmVnRXg6ICN7ZS5tZXNzYWdlWzI3Li5dfVwiKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBlXG5cbiAgICBlZGl0b3IudHJhbnNhY3QgLT5cbiAgICAgIGZvciBsaW5lIGluIFtyYW5nZVswXS4ucmFuZ2VbMV1dXG4gICAgICAgIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShcbiAgICAgICAgICBwYXR0ZXJuUkUsXG4gICAgICAgICAgW1tsaW5lLCAwXSwgW2xpbmUgKyAxLCAwXV0sXG4gICAgICAgICAgKHttYXRjaCwgcmVwbGFjZX0pIC0+XG4gICAgICAgICAgICByZXBsYWNlKHJlcGxhY2VHcm91cHMobWF0Y2hbLi5dLCBzdWJzdGl0aW9uKSlcbiAgICAgICAgKVxuXG4gIHM6IChhcmdzKSA9PiBAc3Vic3RpdHV0ZShhcmdzKVxuXG4gIHZzcGxpdDogKHsgcmFuZ2UsIGFyZ3MgfSkgLT5cbiAgICBhcmdzID0gYXJncy50cmltKClcbiAgICBmaWxlUGF0aHMgPSBhcmdzLnNwbGl0KCcgJylcbiAgICBmaWxlUGF0aHMgPSB1bmRlZmluZWQgaWYgZmlsZVBhdGhzLmxlbmd0aCBpcyAxIGFuZCBmaWxlUGF0aHNbMF0gaXMgJydcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKVxuICAgICAgaWYgZmlsZVBhdGhzPyBhbmQgZmlsZVBhdGhzLmxlbmd0aCA+IDBcbiAgICAgICAgbmV3UGFuZSA9IHBhbmUuc3BsaXRSaWdodCgpXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVQYXRoc1xuICAgICAgICAgIGRvIC0+XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lIGZpbGUsIG5ld1BhbmVcbiAgICAgIGVsc2VcbiAgICAgICAgcGFuZS5zcGxpdFJpZ2h0KGNvcHlBY3RpdmVJdGVtOiB0cnVlKVxuICAgIGVsc2VcbiAgICAgIGlmIGZpbGVQYXRocz8gYW5kIGZpbGVQYXRocy5sZW5ndGggPiAwXG4gICAgICAgIG5ld1BhbmUgPSBwYW5lLnNwbGl0TGVmdCgpXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVQYXRoc1xuICAgICAgICAgIGRvIC0+XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lIGZpbGUsIG5ld1BhbmVcbiAgICAgIGVsc2VcbiAgICAgICAgcGFuZS5zcGxpdExlZnQoY29weUFjdGl2ZUl0ZW06IHRydWUpXG5cbiAgdnNwOiAoYXJncykgPT4gQHZzcGxpdChhcmdzKVxuXG4gIGRlbGV0ZTogKHsgcmFuZ2UgfSkgLT5cbiAgICByYW5nZSA9IFtbcmFuZ2VbMF0sIDBdLCBbcmFuZ2VbMV0gKyAxLCAwXV1cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICAgIHRleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dClcblxuICAgIGVkaXRvci5idWZmZXIuc2V0VGV4dEluUmFuZ2UocmFuZ2UsICcnKVxuXG4gIHlhbms6ICh7IHJhbmdlIH0pIC0+XG4gICAgcmFuZ2UgPSBbW3JhbmdlWzBdLCAwXSwgW3JhbmdlWzFdICsgMSwgMF1dXG4gICAgdHh0ID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHR4dCk7XG5cbiAgc2V0OiAoeyByYW5nZSwgYXJncyB9KSAtPlxuICAgIGFyZ3MgPSBhcmdzLnRyaW0oKVxuICAgIGlmIGFyZ3MgPT0gXCJcIlxuICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk5vIG9wdGlvbiBzcGVjaWZpZWRcIilcbiAgICBvcHRpb25zID0gYXJncy5zcGxpdCgnICcpXG4gICAgZm9yIG9wdGlvbiBpbiBvcHRpb25zXG4gICAgICBkbyAtPlxuICAgICAgICBpZiBvcHRpb24uaW5jbHVkZXMoXCI9XCIpXG4gICAgICAgICAgbmFtZVZhbFBhaXIgPSBvcHRpb24uc3BsaXQoXCI9XCIpXG4gICAgICAgICAgaWYgKG5hbWVWYWxQYWlyLmxlbmd0aCAhPSAyKVxuICAgICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIldyb25nIG9wdGlvbiBmb3JtYXQuIFtuYW1lXT1bdmFsdWVdIGZvcm1hdCBpcyBleHBlY3RlZFwiKVxuICAgICAgICAgIG9wdGlvbk5hbWUgPSBuYW1lVmFsUGFpclswXVxuICAgICAgICAgIG9wdGlvblZhbHVlID0gbmFtZVZhbFBhaXJbMV1cbiAgICAgICAgICBvcHRpb25Qcm9jZXNzb3IgPSBWaW1PcHRpb24uc2luZ2xldG9uKClbb3B0aW9uTmFtZV1cbiAgICAgICAgICBpZiBub3Qgb3B0aW9uUHJvY2Vzc29yP1xuICAgICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk5vIHN1Y2ggb3B0aW9uOiAje29wdGlvbk5hbWV9XCIpXG4gICAgICAgICAgb3B0aW9uUHJvY2Vzc29yKG9wdGlvblZhbHVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3B0aW9uUHJvY2Vzc29yID0gVmltT3B0aW9uLnNpbmdsZXRvbigpW29wdGlvbl1cbiAgICAgICAgICBpZiBub3Qgb3B0aW9uUHJvY2Vzc29yP1xuICAgICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk5vIHN1Y2ggb3B0aW9uOiAje29wdGlvbn1cIilcbiAgICAgICAgICBvcHRpb25Qcm9jZXNzb3IoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEV4XG4iXX0=
