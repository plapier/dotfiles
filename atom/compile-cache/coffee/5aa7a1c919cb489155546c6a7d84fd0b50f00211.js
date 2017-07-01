(function() {
  var CommandError, Ex, VimOption, defer, fs, getFullPath, getSearchTerm, path, replaceGroups, saveAs, trySave, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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
    var deferred, error, errorMatch, fileName, _ref;
    deferred = defer();
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

    Ex.prototype.split = function(_arg) {
      var args, file, filePaths, newPane, pane, range, _i, _j, _len, _len1, _results, _results1;
      range = _arg.range, args = _arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if (atom.config.get('ex-mode.splitbelow')) {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitDown();
          _results = [];
          for (_i = 0, _len = filePaths.length; _i < _len; _i++) {
            file = filePaths[_i];
            _results.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return _results;
        } else {
          return pane.splitDown({
            copyActiveItem: true
          });
        }
      } else {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitUp();
          _results1 = [];
          for (_j = 0, _len1 = filePaths.length; _j < _len1; _j++) {
            file = filePaths[_j];
            _results1.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return _results1;
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
      var args, file, filePaths, newPane, pane, range, _i, _j, _len, _len1, _results, _results1;
      range = _arg.range, args = _arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if (atom.config.get('ex-mode.splitright')) {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitRight();
          _results = [];
          for (_i = 0, _len = filePaths.length; _i < _len; _i++) {
            file = filePaths[_i];
            _results.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return _results;
        } else {
          return pane.splitRight({
            copyActiveItem: true
          });
        }
      } else {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitLeft();
          _results1 = [];
          for (_j = 0, _len1 = filePaths.length; _j < _len1; _j++) {
            file = filePaths[_j];
            _results1.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return _results1;
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

    Ex.prototype["delete"] = function(_arg) {
      var editor, range, text;
      range = _arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      editor = atom.workspace.getActiveTextEditor();
      text = editor.getTextInBufferRange(range);
      atom.clipboard.write(text);
      return editor.buffer.setTextInRange(range, '');
    };

    Ex.prototype.yank = function(_arg) {
      var range, txt;
      range = _arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      txt = atom.workspace.getActiveTextEditor().getTextInBufferRange(range);
      return atom.clipboard.write(txt);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkdBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FIWixDQUFBOztBQUFBLEVBSUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUpKLENBQUE7O0FBQUEsRUFNQSxLQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sUUFBQSxRQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsRUFBWCxDQUFBO0FBQUEsSUFDQSxRQUFRLENBQUMsT0FBVCxHQUF1QixJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDN0IsTUFBQSxRQUFRLENBQUMsT0FBVCxHQUFtQixPQUFuQixDQUFBO2FBQ0EsUUFBUSxDQUFDLE1BQVQsR0FBa0IsT0FGVztJQUFBLENBQVIsQ0FEdkIsQ0FBQTtBQUtBLFdBQU8sUUFBUCxDQU5NO0VBQUEsQ0FOUixDQUFBOztBQUFBLEVBZUEsT0FBQSxHQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsUUFBQSwyQ0FBQTtBQUFBLElBQUEsUUFBQSxHQUFXLEtBQUEsQ0FBQSxDQUFYLENBQUE7QUFFQTtBQUNFLE1BQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBQSxDQURBLENBREY7S0FBQSxj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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/ex.coffee
