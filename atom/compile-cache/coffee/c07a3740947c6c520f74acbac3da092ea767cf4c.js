(function() {
  var CommandError, Ex, getFullPath, path, replaceGroups, trySave,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  path = require('path');

  CommandError = require('./command-error');

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

  getFullPath = function(filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(atom.project.getPath(), filePath);
  };

  replaceGroups = function(groups, replString) {
    var arr, cdiff, group, i, l, m, offset, _ref, _ref1;
    arr = replString.split('');
    offset = 0;
    cdiff = 0;
    while ((m = replString.match(/(?:[^\\]|^)\\(\d)/)) != null) {
      group = groups[m[1]] || '';
      i = replString.indexOf(m[0]);
      l = m[0].length;
      replString = replString.slice(i + l);
      [].splice.apply(arr, [(_ref = i + offset), (i + offset + l) - _ref].concat(_ref1 = (l === 2 ? '' : m[0][0]) + group)), _ref1;
      arr = arr.join('').split('');
      offset += i + l - group.length;
    }
    return arr.join('').replace(/\\\\(\d)/, '\\$1');
  };

  Ex = (function() {
    function Ex() {
      this.vsp = __bind(this.vsp, this);
      this.s = __bind(this.s, this);
      this.sp = __bind(this.sp, this);
      this.x = __bind(this.x, this);
      this.wq = __bind(this.wq, this);
      this.w = __bind(this.w, this);
      this.e = __bind(this.e, this);
      this.tabp = __bind(this.tabp, this);
      this.tabn = __bind(this.tabn, this);
      this.tabc = __bind(this.tabc, this);
      this.tabclose = __bind(this.tabclose, this);
      this.tabnew = __bind(this.tabnew, this);
      this.tabe = __bind(this.tabe, this);
      this.q = __bind(this.q, this);
    }

    Ex.singleton = function() {
      return Ex.ex || (Ex.ex = new Ex);
    };

    Ex.registerCommand = function(name, func) {
      return Ex.singleton()[name] = func;
    };

    Ex.prototype.quit = function() {
      return atom.workspace.getActivePane().destroyActiveItem();
    };

    Ex.prototype.q = function() {
      return this.quit();
    };

    Ex.prototype.tabedit = function(range, args) {
      var file, filePaths, pane, _i, _len, _results;
      args = args.trim();
      filePaths = args.split(' ');
      pane = atom.workspace.getActivePane();
      if ((filePaths != null) && filePaths.length > 0) {
        _results = [];
        for (_i = 0, _len = filePaths.length; _i < _len; _i++) {
          file = filePaths[_i];
          _results.push((function() {
            return atom.workspace.openURIInPane(file, pane);
          })());
        }
        return _results;
      } else {
        return atom.workspace.openURIInPane('', pane);
      }
    };

    Ex.prototype.tabe = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.tabedit.apply(this, args);
    };

    Ex.prototype.tabnew = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.tabedit.apply(this, args);
    };

    Ex.prototype.tabclose = function() {
      return this.quit();
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

    Ex.prototype.edit = function(range, filePath) {
      var buffer;
      filePath = filePath.trim();
      if (filePath.indexOf(' ') !== -1) {
        throw new CommandError('Only one file name allowed');
      }
      buffer = atom.workspace.getActiveTextEditor().buffer;
      if (filePath === '') {
        filePath = buffer.getPath();
      }
      buffer.setPath(getFullPath(filePath));
      return buffer.load();
    };

    Ex.prototype.e = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.edit.apply(this, args);
    };

    Ex.prototype.enew = function() {
      var buffer;
      buffer = atom.workspace.getActiveTextEditor().buffer;
      buffer.setPath(void 0);
      return buffer.load();
    };

    Ex.prototype.write = function(range, filePath) {
      var deferred, editor, editorPath, fullPath, pane;
      filePath = filePath.trim();
      deferred = Promise.defer();
      pane = atom.workspace.getActivePane();
      editor = atom.workspace.getActiveTextEditor();
      if (atom.workspace.getActiveTextEditor().getPath() !== void 0) {
        if (filePath.length > 0) {
          editorPath = editor.getPath();
          fullPath = getFullPath(filePath);
          trySave(function() {
            return editor.saveAs(fullPath);
          }).then(function() {
            return deferred.resolve();
          });
          editor.buffer.setPath(editorPath);
        } else {
          trySave(function() {
            return editor.save();
          }).then(deferred.resolve);
        }
      } else {
        if (filePath.length > 0) {
          fullPath = getFullPath(filePath);
          trySave(function() {
            return editor.saveAs(fullPath);
          }).then(deferred.resolve);
        } else {
          fullPath = atom.showSaveDialogSync();
          if (fullPath != null) {
            trySave(function() {
              return editor.saveAs(fullPath);
            }).then(deferred.resolve);
          }
        }
      }
      return deferred.promise;
    };

    Ex.prototype.w = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.write.apply(this, args);
    };

    Ex.prototype.wq = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.write.apply(this, args).then((function(_this) {
        return function() {
          return _this.quit();
        };
      })(this));
    };

    Ex.prototype.x = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.wq.apply(this, args);
    };

    Ex.prototype.wa = function() {
      return atom.workspace.saveAll();
    };

    Ex.prototype.split = function(range, args) {
      var file, filePaths, newPane, pane, _i, _len, _results;
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

    Ex.prototype.sp = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.split.apply(this, args);
    };

    Ex.prototype.substitute = function(range, args) {
      var args_, buffer, cp, delim, delimRE, e, i, line, pattern, spl, _i, _ref, _ref1;
      args = args.trimLeft();
      delim = args[0];
      if (/[a-z]/i.test(delim)) {
        throw new CommandError("Regular expressions can't be delimited by letters");
      }
      delimRE = new RegExp("[^\\\\]" + delim);
      spl = [];
      args_ = args.slice(1);
      while ((i = args_.search(delimRE)) !== -1) {
        spl.push(args_.slice(0, +i + 1 || 9e9));
        args_ = args_.slice(i + 2);
      }
      if (args_.length === 0 && spl.length === 3) {
        throw new CommandError('Trailing characters');
      } else if (args_.length !== 0) {
        spl.push(args_);
      }
      if (spl.length > 3) {
        throw new CommandError('Trailing characters');
      }
      if (spl[1] == null) {
        spl[1] = '';
      }
      if (spl[2] == null) {
        spl[2] = '';
      }
      try {
        pattern = new RegExp(spl[0], spl[2]);
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
      buffer = atom.workspace.getActiveTextEditor().buffer;
      cp = buffer.history.createCheckpoint();
      for (line = _i = _ref = range[0], _ref1 = range[1]; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; line = _ref <= _ref1 ? ++_i : --_i) {
        buffer.scanInRange(pattern, [[line, 0], [line, buffer.lines[line].length]], function(_arg) {
          var match, matchText, range, replace, stop;
          match = _arg.match, matchText = _arg.matchText, range = _arg.range, stop = _arg.stop, replace = _arg.replace;
          return replace(replaceGroups(match.slice(0), spl[1]));
        });
      }
      return buffer.history.groupChangesSinceCheckpoint(cp);
    };

    Ex.prototype.s = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.substitute.apply(this, args);
    };

    Ex.prototype.vsplit = function(range, args) {
      var file, filePaths, newPane, pane, _i, _len, _results;
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

    Ex.prototype.vsp = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.vsplit.apply(this, args);
    };

    Ex.prototype["delete"] = function(range) {
      range = [[range[0], 0], [range[1] + 1, 0]];
      return atom.workspace.getActiveTextEditor().buffer.setTextInRange(range, '');
    };

    return Ex;

  })();

  module.exports = Ex;

}).call(this);
