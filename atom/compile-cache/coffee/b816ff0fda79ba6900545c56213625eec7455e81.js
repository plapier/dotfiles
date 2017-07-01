(function() {
  var CommandError, Ex, VimOption, fs, getFullPath, getSearchTerm, path, replaceGroups, saveAs, trySave, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  path = require('path');

  CommandError = require('./command-error');

  fs = require('fs-plus');

  VimOption = require('./vim-option');

  _ = require('underscore-plus');

  trySave = function(func) {
    var deferred, error, errorMatch, fileName, _ref;
    deferred = Promise.defer();
    try {
      func();
      deferred.resolve();
    } catch (_error) {
      error = _error;
      if (error.message.endsWith('is a directory')) {
        atom.notifications.addWarning("Unable to save file: " + error.message);
      } else if (error.path != null) {
        if (error.code === 'EACCES') {
          atom.notifications.addWarning("Unable to save file: Permission denied '" + error.path + "'");
        } else if ((_ref = error.code) === 'EPERM' || _ref === 'EBUSY' || _ref === 'UNKNOWN' || _ref === 'EEXIST') {
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
    var char, escaped, hasC, hasc, modFlags, term_, _i, _len;
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
    for (_i = 0, _len = term_.length; _i < _len; _i++) {
      char = term_[_i];
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
    } catch (_error) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  };

  Ex = (function() {
    function Ex() {
      this.vsp = __bind(this.vsp, this);
      this.s = __bind(this.s, this);
      this.sp = __bind(this.sp, this);
      this.xit = __bind(this.xit, this);
      this.saveas = __bind(this.saveas, this);
      this.xa = __bind(this.xa, this);
      this.xall = __bind(this.xall, this);
      this.wqa = __bind(this.wqa, this);
      this.wqall = __bind(this.wqall, this);
      this.wa = __bind(this.wa, this);
      this.wq = __bind(this.wq, this);
      this.w = __bind(this.w, this);
      this.e = __bind(this.e, this);
      this.tabp = __bind(this.tabp, this);
      this.tabn = __bind(this.tabn, this);
      this.tabc = __bind(this.tabc, this);
      this.tabclose = __bind(this.tabclose, this);
      this.tabnew = __bind(this.tabnew, this);
      this.tabe = __bind(this.tabe, this);
      this.tabedit = __bind(this.tabedit, this);
      this.qall = __bind(this.qall, this);
      this.q = __bind(this.q, this);
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

    Ex.prototype.tabnew = function(_arg) {
      var args, range;
      range = _arg.range, args = _arg.args;
      if (args.trim() === '') {
        return atom.workspace.open();
      } else {
        return this.tabedit(range, args);
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

    Ex.prototype.edit = function(_arg) {
      var args, editor, filePath, force, fullPath, range;
      range = _arg.range, args = _arg.args, editor = _arg.editor;
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

    Ex.prototype.write = function(_arg) {
      var args, deferred, editor, filePath, force, fullPath, range, saveas, saved;
      range = _arg.range, args = _arg.args, editor = _arg.editor, saveas = _arg.saveas;
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
      deferred = Promise.defer();
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
        if (saveas) {
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

    Ex.prototype.split = function(_arg) {
      var args, file, filePaths, newPane, pane, range, _i, _len, _results;
      range = _arg.range, args = _arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if ((filePaths != null) && filePaths.length > 0) {
        newPane = pane.splitUp();
        _results = [];
        for (_i = 0, _len = filePaths.length; _i < _len; _i++) {
          file = filePaths[_i];
          _results.push((function() {
            return atom.workspace.openURIInPane(file, newPane);
          })());
        }
        return _results;
      } else {
        return pane.splitUp({
          copyActiveItem: true
        });
      }
    };

    Ex.prototype.sp = function(args) {
      return this.split(args);
    };

    Ex.prototype.substitute = function(_arg) {
      var args, args_, char, delim, e, editor, escapeChars, escaped, flags, flagsObj, parsed, parsing, pattern, patternRE, range, substition, vimState;
      range = _arg.range, args = _arg.args, editor = _arg.editor, vimState = _arg.vimState;
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
        pattern = vimState.getSearchHistoryItem();
        if (pattern == null) {
          atom.beep();
          throw new CommandError('No previous regular expression');
        }
      } else {
        vimState.pushSearchHistory(pattern);
      }
      try {
        flagsObj = {};
        flags.split('').forEach(function(flag) {
          return flagsObj[flag] = true;
        });
        patternRE = getSearchTerm(pattern, flagsObj);
      } catch (_error) {
        e = _error;
        if (e.message.indexOf('Invalid flags supplied to RegExp constructor') === 0) {
          throw new CommandError("Invalid flags: " + e.message.slice(45));
        } else if (e.message.indexOf('Invalid regular expression: ') === 0) {
          throw new CommandError("Invalid RegEx: " + e.message.slice(27));
        } else {
          throw e;
        }
      }
      return editor.transact(function() {
        var line, _i, _ref, _ref1, _results;
        _results = [];
        for (line = _i = _ref = range[0], _ref1 = range[1]; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; line = _ref <= _ref1 ? ++_i : --_i) {
          _results.push(editor.scanInBufferRange(patternRE, [[line, 0], [line + 1, 0]], function(_arg1) {
            var match, replace;
            match = _arg1.match, replace = _arg1.replace;
            return replace(replaceGroups(match.slice(0), substition));
          }));
        }
        return _results;
      });
    };

    Ex.prototype.s = function(args) {
      return this.substitute(args);
    };

    Ex.prototype.vsplit = function(_arg) {
      var args, file, filePaths, newPane, pane, range, _i, _len, _results;
      range = _arg.range, args = _arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if ((filePaths != null) && filePaths.length > 0) {
        newPane = pane.splitLeft();
        _results = [];
        for (_i = 0, _len = filePaths.length; _i < _len; _i++) {
          file = filePaths[_i];
          _results.push((function() {
            return atom.workspace.openURIInPane(file, newPane);
          })());
        }
        return _results;
      } else {
        return pane.splitLeft({
          copyActiveItem: true
        });
      }
    };

    Ex.prototype.vsp = function(args) {
      return this.vsplit(args);
    };

    Ex.prototype["delete"] = function(_arg) {
      var range;
      range = _arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      return atom.workspace.getActiveTextEditor().buffer.setTextInRange(range, '');
    };

    Ex.prototype.set = function(_arg) {
      var args, option, options, range, _i, _len, _results;
      range = _arg.range, args = _arg.args;
      args = args.trim();
      if (args === "") {
        throw new CommandError("No option specified");
      }
      options = args.split(' ');
      _results = [];
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        _results.push((function() {
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
      return _results;
    };

    return Ex;

  })();

  module.exports = Ex;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0dBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FIWixDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUpKLENBQUE7O0FBQUEsRUFNQSxPQUFBLEdBQVUsU0FBQyxJQUFELEdBQUE7QUFDUixRQUFBLDJDQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsT0FBTyxDQUFDLEtBQVIsQ0FBQSxDQUFYLENBQUE7QUFFQTtBQUNFLE1BQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBQSxDQURBLENBREY7S0FBQSxjQUFBO0FBSUUsTUFESSxjQUNKLENBQUE7QUFBQSxNQUFBLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixDQUFIO0FBQ0UsUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQStCLHVCQUFBLEdBQXVCLEtBQUssQ0FBQyxPQUE1RCxDQUFBLENBREY7T0FBQSxNQUVLLElBQUcsa0JBQUg7QUFDSCxRQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxRQUFqQjtBQUNFLFVBQUEsSUFBSSxDQUFDLGFBQ0gsQ0FBQyxVQURILENBQ2UsMENB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/ex.coffee
