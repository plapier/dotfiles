(function() {
  var CommandError, Ex, VimOption, fs, getFullPath, path, replaceGroups, saveAs, trySave,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  path = require('path');

  CommandError = require('./command-error');

  fs = require('fs-plus');

  VimOption = require('./vim-option');

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

  saveAs = function(filePath) {
    var editor;
    editor = atom.workspace.getActiveTextEditor();
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

  Ex = (function() {
    function Ex() {
      this.vsp = __bind(this.vsp, this);
      this.s = __bind(this.s, this);
      this.sp = __bind(this.sp, this);
      this.xit = __bind(this.xit, this);
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
      if (args.trim() !== '') {
        return this.edit(range, args);
      } else {
        return this.tabnew(range, args);
      }
    };

    Ex.prototype.tabe = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.tabedit.apply(this, args);
    };

    Ex.prototype.tabnew = function(range, args) {
      if (args.trim() === '') {
        return atom.workspace.open();
      } else {
        return this.tabedit(range, args);
      }
    };

    Ex.prototype.tabclose = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.quit.apply(this, args);
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
      var editor, force, fullPath;
      filePath = filePath.trim();
      if (filePath[0] === '!') {
        force = true;
        filePath = filePath.slice(1).trim();
      } else {
        force = false;
      }
      editor = atom.workspace.getActiveTextEditor();
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
      var deferred, editor, force, fullPath, saved;
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
        trySave(function() {
          return editor.save();
        }).then(deferred.resolve);
        saved = true;
      } else if (fullPath == null) {
        fullPath = atom.showSaveDialogSync();
      }
      if (!saved && (fullPath != null)) {
        if (!force && fs.existsSync(fullPath)) {
          throw new CommandError("File exists (add ! to override)");
        }
        trySave(function() {
          return saveAs(fullPath);
        }).then(deferred.resolve);
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

    Ex.prototype.xit = function() {
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
      var args_, buffer, delim, delimRE, e, i, notDelimRE, pattern, spl;
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
      notDelimRE = new RegExp("\\\\" + delim, 'g');
      spl[0] = spl[0].replace(notDelimRE, delim);
      spl[1] = spl[1].replace(notDelimRE, delim);
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
      return atom.workspace.getActiveTextEditor().transact(function() {
        var line, _i, _ref, _ref1, _results;
        _results = [];
        for (line = _i = _ref = range[0], _ref1 = range[1]; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; line = _ref <= _ref1 ? ++_i : --_i) {
          _results.push(buffer.scanInRange(pattern, [[line, 0], [line, buffer.lines[line].length]], function(_arg) {
            var match, matchText, range, replace, stop;
            match = _arg.match, matchText = _arg.matchText, range = _arg.range, stop = _arg.stop, replace = _arg.replace;
            return replace(replaceGroups(match.slice(0), spl[1]));
          }));
        }
        return _results;
      });
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

    Ex.prototype.set = function(range, args) {
      var option, options, _i, _len, _results;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0ZBQUE7SUFBQTtzQkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFDQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBRGYsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FIWixDQUFBOztBQUFBLEVBS0EsT0FBQSxHQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ1IsUUFBQSwyQ0FBQTtBQUFBLElBQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxLQUFSLENBQUEsQ0FBWCxDQUFBO0FBRUE7QUFDRSxNQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLFFBQVEsQ0FBQyxPQUFULENBQUEsQ0FEQSxDQURGO0tBQUEsY0FBQTtBQUlFLE1BREksY0FDSixDQUFBO0FBQUEsTUFBQSxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsQ0FBSDtBQUNFLFFBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUErQix1QkFBQSxHQUF1QixLQUFLLENBQUMsT0FBNUQsQ0FBQSxDQURGO09BQUEsTUFFSyxJQUFHLGtCQUFIO0FBQ0gsUUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsUUFBakI7QUFDRSxVQUFBLElBQUksQ0FBQyxhQUNILENBQUMsVUFESCxDQUNlLDBDQUFBLEdBQTBDLEtBQUssQ0FBQyxJQUFoRCxHQUFxRCxHQURwRSxDQUFBLENBREY7U0FBQSxNQUdLLFlBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxPQUFmLElBQUEsSUFBQSxLQUF3QixPQUF4QixJQUFBLElBQUEsS0FBaUMsU0FBakMsSUFBQSxJQUFBLEtBQTRDLFFBQS9DO0FBQ0gsVUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQStCLHVCQUFBLEdBQXVCLEtBQUssQ0FBQyxJQUE3QixHQUFrQyxHQUFqRSxFQUNFO0FBQUEsWUFBQSxNQUFBLEVBQVEsS0FBSyxDQUFDLE9BQWQ7V0FERixDQUFBLENBREc7U0FBQSxNQUdBLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxPQUFqQjtBQUNILFVBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUNHLDhDQUFBLEdBQThDLEtBQUssQ0FBQyxJQUFwRCxHQUF5RCxHQUQ1RCxDQUFBLENBREc7U0FQRjtPQUFBLE1BVUEsSUFBRyxDQUFDLFVBQUEsR0FDTCxvQ0FBb0MsQ0FBQyxJQUFyQyxDQUEwQyxLQUFLLENBQUMsT0FBaEQsQ0FESSxDQUFIO0FBRUgsUUFBQSxRQUFBLEdBQVcsVUFBVyxDQUFBLENBQUEsQ0FBdEIsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QiwwQ0FBQSxHQUM1QixDQUFDLFFBQUEsR0FBUSxRQUFSLEdBQWlCLDJCQUFsQixDQURGLENBREEsQ0FGRztPQUFBLE1BQUE7QUFNSCxjQUFNLEtBQU4sQ0FORztPQWhCUDtLQUZBO1dBMEJBLFFBQVEsQ0FBQyxRQTNCRDtFQUFBLENBTFYsQ0FBQTs7QUFBQSxFQWtDQSxNQUFBLEdBQVMsU0FBQyxRQUFELEdBQUE7QUFDUCxRQUFBLE1BQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBVCxDQUFBO1dBQ0EsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsUUFBakIsRUFBMkIsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUEzQixFQUZPO0VBQUEsQ0FsQ1QsQ0FBQTs7QUFBQSxFQXNDQSxXQUFBLEdBQWMsU0FBQyxRQUFELEdBQUE7QUFDWixJQUFBLFFBQUEsR0FBVyxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsQ0FBWCxDQUFBO0FBRUEsSUFBQSxJQUFHLElBQUksQ0FBQyxVQUFMLENBQWdCLFFBQWhCLENBQUg7YUFDRSxTQURGO0tBQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBQXVCLENBQUMsTUFBeEIsS0FBa0MsQ0FBckM7YUFDSCxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxTQUFILENBQWEsR0FBYixDQUFWLEVBQTZCLFFBQTdCLEVBREc7S0FBQSxNQUFBO2FBR0gsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBbEMsRUFBc0MsUUFBdEMsRUFIRztLQUxPO0VBQUEsQ0F0Q2QsQ0FBQTs7QUFBQSxFQWdEQSxhQUFBLEdBQWdCLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUNkLFFBQUEsOEJBQUE7QUFBQSxJQUFBLFFBQUEsR0FBVyxFQUFYLENBQUE7QUFBQSxJQUNBLE9BQUEsR0FBVSxLQURWLENBQUE7QUFFQSxXQUFNLDBCQUFOLEdBQUE7QUFDRSxNQUFBLE1BQUEsR0FBUyxNQUFPLFNBQWhCLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBQSxLQUFRLElBQVIsSUFBaUIsQ0FBQSxPQUFwQjtBQUNFLFFBQUEsT0FBQSxHQUFVLElBQVYsQ0FERjtPQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsQ0FBQSxJQUFvQixPQUF2QjtBQUNILFFBQUEsT0FBQSxHQUFVLEtBQVYsQ0FBQTtBQUFBLFFBQ0EsS0FBQSxHQUFRLE1BQU8sQ0FBQSxRQUFBLENBQVMsSUFBVCxDQUFBLENBRGYsQ0FBQTs7VUFFQSxRQUFTO1NBRlQ7QUFBQSxRQUdBLFFBQUEsSUFBWSxLQUhaLENBREc7T0FBQSxNQUFBO0FBTUgsUUFBQSxPQUFBLEdBQVUsS0FBVixDQUFBO0FBQUEsUUFDQSxRQUFBLElBQVksSUFEWixDQU5HO09BSlA7SUFBQSxDQUZBO1dBZUEsU0FoQmM7RUFBQSxDQWhEaEIsQ0FBQTs7QUFBQSxFQWtFTTs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FDSjs7QUFBQSxJQUFBLEVBQUMsQ0FBQSxTQUFELEdBQVksU0FBQSxHQUFBO2FBQ1YsRUFBQyxDQUFBLE9BQUQsRUFBQyxDQUFBLEtBQU8sR0FBQSxDQUFBLElBREU7SUFBQSxDQUFaLENBQUE7O0FBQUEsSUFHQSxFQUFDLENBQUEsZUFBRCxHQUFrQixTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7YUFDaEIsRUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFhLENBQUEsSUFBQSxDQUFiLEdBQXFCLEtBREw7SUFBQSxDQUhsQixDQUFBOztBQUFBLGlCQU1BLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLGlCQUEvQixDQUFBLEVBREk7SUFBQSxDQU5OLENBQUE7O0FBQUEsaUJBU0EsQ0FBQSxHQUFHLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELENBQUEsRUFBSDtJQUFBLENBVEgsQ0FBQTs7QUFBQSxpQkFXQSxPQUFBLEdBQVMsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1AsTUFBQSxJQUFHLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxLQUFpQixFQUFwQjtlQUNFLElBQUMsQ0FBQSxJQUFELENBQU0sS0FBTixFQUFhLElBQWIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsRUFBZSxJQUFmLEVBSEY7T0FETztJQUFBLENBWFQsQ0FBQTs7QUFBQSxpQkFpQkEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUFhLFVBQUEsSUFBQTtBQUFBLE1BQVosOERBQVksQ0FBQTthQUFBLElBQUMsQ0FBQSxPQUFELGFBQVMsSUFBVCxFQUFiO0lBQUEsQ0FqQk4sQ0FBQTs7QUFBQSxpQkFtQkEsTUFBQSxHQUFRLFNBQUMsS0FBRCxFQUFRLElBQVIsR0FBQTtBQUNOLE1BQUEsSUFBRyxJQUFJLENBQUMsSUFBTCxDQUFBLENBQUEsS0FBZSxFQUFsQjtlQUNFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFULEVBQWdCLElBQWhCLEVBSEY7T0FETTtJQUFBLENBbkJSLENBQUE7O0FBQUEsaUJBeUJBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFBYSxVQUFBLElBQUE7QUFBQSxNQUFaLDhEQUFZLENBQUE7YUFBQSxJQUFDLENBQUEsSUFBRCxhQUFNLElBQU4sRUFBYjtJQUFBLENBekJWLENBQUE7O0FBQUEsaUJBMkJBLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsUUFBRCxDQUFBLEVBQUg7SUFBQSxDQTNCTixDQUFBOztBQUFBLGlCQTZCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBUCxDQUFBO2FBQ0EsSUFBSSxDQUFDLGdCQUFMLENBQUEsRUFGTztJQUFBLENBN0JULENBQUE7O0FBQUEsaUJBaUNBLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7SUFBQSxDQWpDTixDQUFBOztBQUFBLGlCQW1DQSxXQUFBLEdBQWEsU0FBQSxHQUFBO0FBQ1gsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBUCxDQUFBO2FBQ0EsSUFBSSxDQUFDLG9CQUFMLENBQUEsRUFGVztJQUFBLENBbkNiLENBQUE7O0FBQUEsaUJBdUNBLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsV0FBRCxDQUFBLEVBQUg7SUFBQSxDQXZDTixDQUFBOztBQUFBLGlCQXlDQSxJQUFBLEdBQU0sU0FBQyxLQUFELEVBQVEsUUFBUixHQUFBO0FBQ0osVUFBQSx1QkFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxJQUFULENBQUEsQ0FBWCxDQUFBO0FBQ0EsTUFBQSxJQUFHLFFBQVMsQ0FBQSxDQUFBLENBQVQsS0FBZSxHQUFsQjtBQUNFLFFBQUEsS0FBQSxHQUFRLElBQVIsQ0FBQTtBQUFBLFFBQ0EsUUFBQSxHQUFXLFFBQVMsU0FBSSxDQUFDLElBQWQsQ0FBQSxDQURYLENBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxLQUFBLEdBQVEsS0FBUixDQUpGO09BREE7QUFBQSxNQU9BLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FQVCxDQUFBO0FBUUEsTUFBQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBQSxJQUF3QixDQUFBLEtBQTNCO0FBQ0UsY0FBVSxJQUFBLFlBQUEsQ0FBYSxnREFBYixDQUFWLENBREY7T0FSQTtBQVVBLE1BQUEsSUFBRyxRQUFRLENBQUMsT0FBVCxDQUFpQixHQUFqQixDQUFBLEtBQTJCLENBQUEsQ0FBOUI7QUFDRSxjQUFVLElBQUEsWUFBQSxDQUFhLDRCQUFiLENBQVYsQ0FERjtPQVZBO0FBYUEsTUFBQSxJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQXFCLENBQXhCO0FBQ0UsUUFBQSxRQUFBLEdBQVcsV0FBQSxDQUFZLFFBQVosQ0FBWCxDQUFBO0FBQ0EsUUFBQSxJQUFHLFFBQUEsS0FBWSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWY7aUJBQ0UsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFrQixDQUFDLE1BQW5CLENBQUEsRUFERjtTQUFBLE1BQUE7aUJBR0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLEVBSEY7U0FGRjtPQUFBLE1BQUE7QUFPRSxRQUFBLElBQUcsd0JBQUg7aUJBQ0UsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFrQixDQUFDLE1BQW5CLENBQUEsRUFERjtTQUFBLE1BQUE7QUFHRSxnQkFBVSxJQUFBLFlBQUEsQ0FBYSxjQUFiLENBQVYsQ0FIRjtTQVBGO09BZEk7SUFBQSxDQXpDTixDQUFBOztBQUFBLGlCQW1FQSxDQUFBLEdBQUcsU0FBQSxHQUFBO0FBQWEsVUFBQSxJQUFBO0FBQUEsTUFBWiw4REFBWSxDQUFBO2FBQUEsSUFBQyxDQUFBLElBQUQsYUFBTSxJQUFOLEVBQWI7SUFBQSxDQW5FSCxDQUFBOztBQUFBLGlCQXFFQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQW9DLENBQUMsTUFBOUMsQ0FBQTtBQUFBLE1BQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmLENBREEsQ0FBQTthQUVBLE1BQU0sQ0FBQyxJQUFQLENBQUEsRUFISTtJQUFBLENBckVOLENBQUE7O0FBQUEsaUJBMEVBLEtBQUEsR0FBTyxTQUFDLEtBQUQsRUFBUSxRQUFSLEdBQUE7QUFDTCxVQUFBLHdDQUFBO0FBQUEsTUFBQSxJQUFHLFFBQVMsQ0FBQSxDQUFBLENBQVQsS0FBZSxHQUFsQjtBQUNFLFFBQUEsS0FBQSxHQUFRLElBQVIsQ0FBQTtBQUFBLFFBQ0EsUUFBQSxHQUFXLFFBQVMsU0FEcEIsQ0FERjtPQUFBLE1BQUE7QUFJRSxRQUFBLEtBQUEsR0FBUSxLQUFSLENBSkY7T0FBQTtBQUFBLE1BTUEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxJQUFULENBQUEsQ0FOWCxDQUFBO0FBT0EsTUFBQSxJQUFHLFFBQVEsQ0FBQyxPQUFULENBQWlCLEdBQWpCLENBQUEsS0FBMkIsQ0FBQSxDQUE5QjtBQUNFLGNBQVUsSUFBQSxZQUFBLENBQWEsNEJBQWIsQ0FBVixDQURGO09BUEE7QUFBQSxNQVVBLFFBQUEsR0FBVyxPQUFPLENBQUMsS0FBUixDQUFBLENBVlgsQ0FBQTtBQUFBLE1BWUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQVpULENBQUE7QUFBQSxNQWFBLEtBQUEsR0FBUSxLQWJSLENBQUE7QUFjQSxNQUFBLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBcUIsQ0FBeEI7QUFDRSxRQUFBLFFBQUEsR0FBVyxXQUFBLENBQVksUUFBWixDQUFYLENBREY7T0FkQTtBQWdCQSxNQUFBLElBQUcsMEJBQUEsSUFBc0IsQ0FBSyxrQkFBSixJQUFpQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQUEsS0FBb0IsUUFBdEMsQ0FBekI7QUFFRSxRQUFBLE9BQUEsQ0FBUSxTQUFBLEdBQUE7aUJBQUcsTUFBTSxDQUFDLElBQVAsQ0FBQSxFQUFIO1FBQUEsQ0FBUixDQUF5QixDQUFDLElBQTFCLENBQStCLFFBQVEsQ0FBQyxPQUF4QyxDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxJQURSLENBRkY7T0FBQSxNQUlLLElBQU8sZ0JBQVA7QUFDSCxRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsa0JBQUwsQ0FBQSxDQUFYLENBREc7T0FwQkw7QUF1QkEsTUFBQSxJQUFHLENBQUEsS0FBQSxJQUFjLGtCQUFqQjtBQUNFLFFBQUEsSUFBRyxDQUFBLEtBQUEsSUFBYyxFQUFFLENBQUMsVUFBSCxDQUFjLFFBQWQsQ0FBakI7QUFDRSxnQkFBVSxJQUFBLFlBQUEsQ0FBYSxpQ0FBYixDQUFWLENBREY7U0FBQTtBQUFBLFFBRUEsT0FBQSxDQUFRLFNBQUEsR0FBQTtpQkFBRyxNQUFBLENBQU8sUUFBUCxFQUFIO1FBQUEsQ0FBUixDQUE0QixDQUFDLElBQTdCLENBQWtDLFFBQVEsQ0FBQyxPQUEzQyxDQUZBLENBREY7T0F2QkE7YUE0QkEsUUFBUSxDQUFDLFFBN0JKO0lBQUEsQ0ExRVAsQ0FBQTs7QUFBQSxpQkF5R0EsQ0FBQSxHQUFHLFNBQUEsR0FBQTtBQUNELFVBQUEsSUFBQTtBQUFBLE1BREUsOERBQ0YsQ0FBQTthQUFBLElBQUMsQ0FBQSxLQUFELGFBQU8sSUFBUCxFQURDO0lBQUEsQ0F6R0gsQ0FBQTs7QUFBQSxpQkE0R0EsRUFBQSxHQUFJLFNBQUEsR0FBQTtBQUNGLFVBQUEsSUFBQTtBQUFBLE1BREcsOERBQ0gsQ0FBQTthQUFBLElBQUMsQ0FBQSxLQUFELGFBQU8sSUFBUCxDQUFlLENBQUMsSUFBaEIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQixFQURFO0lBQUEsQ0E1R0osQ0FBQTs7QUFBQSxpQkErR0EsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUFhLFVBQUEsSUFBQTtBQUFBLE1BQVosOERBQVksQ0FBQTthQUFBLElBQUMsQ0FBQSxFQUFELGFBQUksSUFBSixFQUFiO0lBQUEsQ0EvR0wsQ0FBQTs7QUFBQSxpQkFpSEEsRUFBQSxHQUFJLFNBQUEsR0FBQTthQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBZixDQUFBLEVBREU7SUFBQSxDQWpISixDQUFBOztBQUFBLGlCQW9IQSxLQUFBLEdBQU8sU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ0wsVUFBQSxrREFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBUCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBRFosQ0FBQTtBQUVBLE1BQUEsSUFBeUIsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBcEIsSUFBMEIsU0FBVSxDQUFBLENBQUEsQ0FBVixLQUFnQixFQUFuRTtBQUFBLFFBQUEsU0FBQSxHQUFZLE1BQVosQ0FBQTtPQUZBO0FBQUEsTUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FIUCxDQUFBO0FBSUEsTUFBQSxJQUFHLG1CQUFBLElBQWUsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBckM7QUFDRSxRQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQVYsQ0FBQTtBQUNBO2FBQUEsZ0RBQUE7K0JBQUE7QUFDRSx3QkFBRyxDQUFBLFNBQUEsR0FBQTttQkFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkIsSUFBN0IsRUFBbUMsT0FBbkMsRUFEQztVQUFBLENBQUEsQ0FBSCxDQUFBLEVBQUEsQ0FERjtBQUFBO3dCQUZGO09BQUEsTUFBQTtlQU1FLElBQUksQ0FBQyxPQUFMLENBQWE7QUFBQSxVQUFBLGNBQUEsRUFBZ0IsSUFBaEI7U0FBYixFQU5GO09BTEs7SUFBQSxDQXBIUCxDQUFBOztBQUFBLGlCQWlJQSxFQUFBLEdBQUksU0FBQSxHQUFBO0FBQWEsVUFBQSxJQUFBO0FBQUEsTUFBWiw4REFBWSxDQUFBO2FBQUEsSUFBQyxDQUFBLEtBQUQsYUFBTyxJQUFQLEVBQWI7SUFBQSxDQWpJSixDQUFBOztBQUFBLGlCQW1JQSxVQUFBLEdBQVksU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1YsVUFBQSw2REFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBUCxDQUFBO0FBQUEsTUFDQSxLQUFBLEdBQVEsSUFBSyxDQUFBLENBQUEsQ0FEYixDQUFBO0FBRUEsTUFBQSxJQUFHLFFBQVEsQ0FBQyxJQUFULENBQWMsS0FBZCxDQUFIO0FBQ0UsY0FBVSxJQUFBLFlBQUEsQ0FDUixtREFEUSxDQUFWLENBREY7T0FGQTtBQUFBLE1BS0EsT0FBQSxHQUFjLElBQUEsTUFBQSxDQUFRLFNBQUEsR0FBUyxLQUFqQixDQUxkLENBQUE7QUFBQSxNQU1BLEdBQUEsR0FBTSxFQU5OLENBQUE7QUFBQSxNQU9BLEtBQUEsR0FBUSxJQUFLLFNBUGIsQ0FBQTtBQVFBLGFBQU0sQ0FBQyxDQUFBLEdBQUksS0FBSyxDQUFDLE1BQU4sQ0FBYSxPQUFiLENBQUwsQ0FBQSxLQUFpQyxDQUFBLENBQXZDLEdBQUE7QUFDRSxRQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsS0FBTSx3QkFBZixDQUFBLENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUSxLQUFNLGFBRGQsQ0FERjtNQUFBLENBUkE7QUFXQSxNQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsQ0FBaEIsSUFBc0IsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUF2QztBQUNFLGNBQVUsSUFBQSxZQUFBLENBQWEscUJBQWIsQ0FBVixDQURGO09BQUEsTUFFSyxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWtCLENBQXJCO0FBQ0gsUUFBQSxHQUFHLENBQUMsSUFBSixDQUFTLEtBQVQsQ0FBQSxDQURHO09BYkw7QUFlQSxNQUFBLElBQUcsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUFoQjtBQUNFLGNBQVUsSUFBQSxZQUFBLENBQWEscUJBQWIsQ0FBVixDQURGO09BZkE7O1FBaUJBLEdBQUksQ0FBQSxDQUFBLElBQU07T0FqQlY7O1FBa0JBLEdBQUksQ0FBQSxDQUFBLElBQU07T0FsQlY7QUFBQSxNQW1CQSxVQUFBLEdBQWlCLElBQUEsTUFBQSxDQUFRLE1BQUEsR0FBTSxLQUFkLEVBQXVCLEdBQXZCLENBbkJqQixDQUFBO0FBQUEsTUFvQkEsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFTLEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFQLENBQWUsVUFBZixFQUEyQixLQUEzQixDQXBCVCxDQUFBO0FBQUEsTUFxQkEsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFTLEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFQLENBQWUsVUFBZixFQUEyQixLQUEzQixDQXJCVCxDQUFBO0FBdUJBO0FBQ0UsUUFBQSxPQUFBLEdBQWMsSUFBQSxNQUFBLENBQU8sR0FBSSxDQUFBLENBQUEsQ0FBWCxFQUFlLEdBQUksQ0FBQSxDQUFBLENBQW5CLENBQWQsQ0FERjtPQUFBLGNBQUE7QUFHRSxRQURJLFVBQ0osQ0FBQTtBQUFBLFFBQUEsSUFBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQVYsQ0FBa0IsOENBQWxCLENBQUEsS0FBcUUsQ0FBeEU7QUFFRSxnQkFBVSxJQUFBLFlBQUEsQ0FBYyxpQkFBQSxHQUFpQixDQUFDLENBQUMsT0FBUSxVQUF6QyxDQUFWLENBRkY7U0FBQSxNQUdLLElBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFWLENBQWtCLDhCQUFsQixDQUFBLEtBQXFELENBQXhEO0FBQ0gsZ0JBQVUsSUFBQSxZQUFBLENBQWMsaUJBQUEsR0FBaUIsQ0FBQyxDQUFDLE9BQVEsVUFBekMsQ0FBVixDQURHO1NBQUEsTUFBQTtBQUdILGdCQUFNLENBQU4sQ0FIRztTQU5QO09BdkJBO0FBQUEsTUFrQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFvQyxDQUFDLE1BbEM5QyxDQUFBO2FBbUNBLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFvQyxDQUFDLFFBQXJDLENBQThDLFNBQUEsR0FBQTtBQUM1QyxZQUFBLCtCQUFBO0FBQUE7YUFBWSw0SEFBWixHQUFBO0FBQ0Usd0JBQUEsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsT0FBbkIsRUFDRSxDQUFDLENBQUMsSUFBRCxFQUFPLENBQVAsQ0FBRCxFQUFZLENBQUMsSUFBRCxFQUFPLE1BQU0sQ0FBQyxLQUFNLENBQUEsSUFBQSxDQUFLLENBQUMsTUFBMUIsQ0FBWixDQURGLEVBRUUsU0FBQyxJQUFELEdBQUE7QUFDRSxnQkFBQSxzQ0FBQTtBQUFBLFlBREEsYUFBQSxPQUFPLGlCQUFBLFdBQVcsYUFBQSxPQUFPLFlBQUEsTUFBTSxlQUFBLE9BQy9CLENBQUE7bUJBQUEsT0FBQSxDQUFRLGFBQUEsQ0FBYyxLQUFNLFNBQXBCLEVBQXlCLEdBQUksQ0FBQSxDQUFBLENBQTdCLENBQVIsRUFERjtVQUFBLENBRkYsRUFBQSxDQURGO0FBQUE7d0JBRDRDO01BQUEsQ0FBOUMsRUFwQ1U7SUFBQSxDQW5JWixDQUFBOztBQUFBLGlCQStLQSxDQUFBLEdBQUcsU0FBQSxHQUFBO0FBQWEsVUFBQSxJQUFBO0FBQUEsTUFBWiw4REFBWSxDQUFBO2FBQUEsSUFBQyxDQUFBLFVBQUQsYUFBWSxJQUFaLEVBQWI7SUFBQSxDQS9LSCxDQUFBOztBQUFBLGlCQWlMQSxNQUFBLEdBQVEsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ04sVUFBQSxrREFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBUCxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBRFosQ0FBQTtBQUVBLE1BQUEsSUFBeUIsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBcEIsSUFBMEIsU0FBVSxDQUFBLENBQUEsQ0FBVixLQUFnQixFQUFuRTtBQUFBLFFBQUEsU0FBQSxHQUFZLE1BQVosQ0FBQTtPQUZBO0FBQUEsTUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FIUCxDQUFBO0FBSUEsTUFBQSxJQUFHLG1CQUFBLElBQWUsU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBckM7QUFDRSxRQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBTCxDQUFBLENBQVYsQ0FBQTtBQUNBO2FBQUEsZ0RBQUE7K0JBQUE7QUFDRSx3QkFBRyxDQUFBLFNBQUEsR0FBQTttQkFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkIsSUFBN0IsRUFBbUMsT0FBbkMsRUFEQztVQUFBLENBQUEsQ0FBSCxDQUFBLEVBQUEsQ0FERjtBQUFBO3dCQUZGO09BQUEsTUFBQTtlQU1FLElBQUksQ0FBQyxTQUFMLENBQWU7QUFBQSxVQUFBLGNBQUEsRUFBZ0IsSUFBaEI7U0FBZixFQU5GO09BTE07SUFBQSxDQWpMUixDQUFBOztBQUFBLGlCQThMQSxHQUFBLEdBQUssU0FBQSxHQUFBO0FBQWEsVUFBQSxJQUFBO0FBQUEsTUFBWiw4REFBWSxDQUFBO2FBQUEsSUFBQyxDQUFBLE1BQUQsYUFBUSxJQUFSLEVBQWI7SUFBQSxDQTlMTCxDQUFBOztBQUFBLGlCQWdNQSxTQUFBLEdBQVEsU0FBQyxLQUFELEdBQUE7QUFDTixNQUFBLEtBQUEsR0FBUSxDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUCxFQUFXLENBQVgsQ0FBRCxFQUFnQixDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxDQUFaLEVBQWUsQ0FBZixDQUFoQixDQUFSLENBQUE7YUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUEsQ0FBb0MsQ0FBQyxNQUFNLENBQUMsY0FBNUMsQ0FBMkQsS0FBM0QsRUFBa0UsRUFBbEUsRUFGTTtJQUFBLENBaE1SLENBQUE7O0FBQUEsaUJBb01BLEdBQUEsR0FBSyxTQUFDLEtBQUQsRUFBUSxJQUFSLEdBQUE7QUFDSCxVQUFBLG1DQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFQLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBQSxLQUFRLEVBQVg7QUFDRSxjQUFVLElBQUEsWUFBQSxDQUFhLHFCQUFiLENBQVYsQ0FERjtPQURBO0FBQUEsTUFHQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBSFYsQ0FBQTtBQUlBO1dBQUEsOENBQUE7NkJBQUE7QUFDRSxzQkFBRyxDQUFBLFNBQUEsR0FBQTtBQUNELGNBQUEscURBQUE7QUFBQSxVQUFBLElBQUcsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsR0FBaEIsQ0FBSDtBQUNFLFlBQUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyxLQUFQLENBQWEsR0FBYixDQUFkLENBQUE7QUFDQSxZQUFBLElBQUksV0FBVyxDQUFDLE1BQVosS0FBc0IsQ0FBMUI7QUFDRSxvQkFBVSxJQUFBLFlBQUEsQ0FBYSx3REFBYixDQUFWLENBREY7YUFEQTtBQUFBLFlBR0EsVUFBQSxHQUFhLFdBQVksQ0FBQSxDQUFBLENBSHpCLENBQUE7QUFBQSxZQUlBLFdBQUEsR0FBYyxXQUFZLENBQUEsQ0FBQSxDQUoxQixDQUFBO0FBQUEsWUFLQSxlQUFBLEdBQWtCLFNBQVMsQ0FBQyxTQUFWLENBQUEsQ0FBc0IsQ0FBQSxVQUFBLENBTHhDLENBQUE7QUFNQSxZQUFBLElBQU8sdUJBQVA7QUFDRSxvQkFBVSxJQUFBLFlBQUEsQ0FBYyxrQkFBQSxHQUFrQixVQUFoQyxDQUFWLENBREY7YUFOQTttQkFRQSxlQUFBLENBQWdCLFdBQWhCLEVBVEY7V0FBQSxNQUFBO0FBV0UsWUFBQSxlQUFBLEdBQWtCLFNBQVMsQ0FBQyxTQUFWLENBQUEsQ0FBc0IsQ0FBQSxNQUFBLENBQXhDLENBQUE7QUFDQSxZQUFBLElBQU8sdUJBQVA7QUFDRSxvQkFBVSxJQUFBLFlBQUEsQ0FBYyxrQkFBQSxHQUFrQixNQUFoQyxDQUFWLENBREY7YUFEQTttQkFHQSxlQUFBLENBQUEsRUFkRjtXQURDO1FBQUEsQ0FBQSxDQUFILENBQUEsRUFBQSxDQURGO0FBQUE7c0JBTEc7SUFBQSxDQXBNTCxDQUFBOztjQUFBOztNQW5FRixDQUFBOztBQUFBLEVBOFJBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEVBOVJqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/ex.coffee
