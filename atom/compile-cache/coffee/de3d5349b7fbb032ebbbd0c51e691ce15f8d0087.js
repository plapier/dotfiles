(function() {
  var Command, CommandError, Ex, ExViewModel, Find;

  ExViewModel = require('./ex-view-model');

  Ex = require('./ex');

  Find = require('./find');

  CommandError = require('./command-error');

  Command = (function() {
    function Command(editor, exState) {
      this.editor = editor;
      this.exState = exState;
      this.selections = this.exState.getSelections();
      this.viewModel = new ExViewModel(this, Object.keys(this.selections).length > 0);
    }

    Command.prototype.parseAddr = function(str, cursor) {
      var addr, mark, row, _ref;
      row = cursor.getBufferRow();
      if (str === '.') {
        addr = row;
      } else if (str === '$') {
        addr = this.editor.getBuffer().lines.length - 1;
      } else if ((_ref = str[0]) === "+" || _ref === "-") {
        addr = row + this.parseOffset(str);
      } else if (!isNaN(str)) {
        addr = parseInt(str) - 1;
      } else if (str[0] === "'") {
        if (this.vimState == null) {
          throw new CommandError("Couldn't get access to vim-mode.");
        }
        mark = this.vimState.marks[str[1]];
        if (mark == null) {
          throw new CommandError("Mark " + str + " not set.");
        }
        addr = mark.getEndBufferPosition().row;
      } else if (str[0] === "/") {
        str = str.slice(1);
        if (str[str.length - 1] === "/") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().end)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str);
        }
        addr = addr.start.row;
      } else if (str[0] === "?") {
        str = str.slice(1);
        if (str[str.length - 1] === "?") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().start, true)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str.slice(1, -1));
        }
        addr = addr.start.row;
      }
      return addr;
    };

    Command.prototype.parseOffset = function(str) {
      var o;
      if (str.length === 0) {
        return 0;
      }
      if (str.length === 1) {
        o = 1;
      } else {
        o = parseInt(str.slice(1));
      }
      if (str[0] === '+') {
        return o;
      } else {
        return -o;
      }
    };

    Command.prototype.execute = function(input) {
      var addr1, addr2, addrPattern, address1, address2, args, bufferRange, cl, command, cursor, func, id, lastLine, m, match, matching, name, off1, off2, range, runOverSelections, selection, val, _ref, _ref1, _ref2, _ref3, _results;
      this.vimState = (_ref = this.exState.globalExState.vim) != null ? _ref.getEditorState(this.editor) : void 0;
      cl = input.characters;
      cl = cl.replace(/^(:|\s)*/, '');
      if (!(cl.length > 0)) {
        return;
      }
      if (cl[0] === '"') {
        return;
      }
      lastLine = this.editor.getBuffer().lines.length - 1;
      if (cl[0] === '%') {
        range = [0, lastLine];
        cl = cl.slice(1);
      } else {
        addrPattern = /^(?:(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?(?:[^\\]\/|$)|\?.*?(?:[^\\]\?|$)|[+-]\d*)((?:\s*[+-]\d*)*))?(?:,(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?[^\\]\/|\?.*?[^\\]\?|[+-]\d*)((?:\s*[+-]\d*)*))?/;
        _ref1 = cl.match(addrPattern), match = _ref1[0], addr1 = _ref1[1], off1 = _ref1[2], addr2 = _ref1[3], off2 = _ref1[4];
        cursor = this.editor.getLastCursor();
        if (addr1 === "'<" && addr2 === "'>") {
          runOverSelections = true;
        } else {
          runOverSelections = false;
          if (addr1 != null) {
            address1 = this.parseAddr(addr1, cursor);
          } else {
            address1 = cursor.getBufferRow();
          }
          if (off1 != null) {
            address1 += this.parseOffset(off1);
          }
          if (address1 === -1) {
            address1 = 0;
          }
          if (address1 < 0 || address1 > lastLine) {
            throw new CommandError('Invalid range');
          }
          if (addr2 != null) {
            address2 = this.parseAddr(addr2, cursor);
          }
          if (off2 != null) {
            address2 += this.parseOffset(off2);
          }
          if (address2 < 0 || address2 > lastLine) {
            throw new CommandError('Invalid range');
          }
          if (address2 < address1) {
            throw new CommandError('Backwards range given');
          }
        }
        range = [address1, address2 != null ? address2 : address1];
      }
      cl = cl.slice(match != null ? match.length : void 0);
      cl = cl.trimLeft();
      if (cl.length === 0) {
        this.editor.setCursorBufferPosition([range[1], 0]);
        return;
      }
      if (cl.length === 2 && cl[0] === 'k' && /[a-z]/i.test(cl[1])) {
        command = 'mark';
        args = cl[1];
      } else if (!/[a-z]/i.test(cl[0])) {
        command = cl[0];
        args = cl.slice(1);
      } else {
        _ref2 = cl.match(/^(\w+)(.*)/), m = _ref2[0], command = _ref2[1], args = _ref2[2];
      }
      if ((func = Ex.singleton()[command]) == null) {
        matching = (function() {
          var _ref3, _results;
          _ref3 = Ex.singleton();
          _results = [];
          for (name in _ref3) {
            val = _ref3[name];
            if (name.indexOf(command) === 0) {
              _results.push(name);
            }
          }
          return _results;
        })();
        matching.sort();
        command = matching[0];
        func = Ex.singleton()[command];
      }
      if (func != null) {
        if (runOverSelections) {
          _ref3 = this.selections;
          _results = [];
          for (id in _ref3) {
            selection = _ref3[id];
            bufferRange = selection.getBufferRange();
            range = [bufferRange.start.row, bufferRange.end.row];
            _results.push(func({
              range: range,
              args: args,
              vimState: this.vimState,
              exState: this.exState,
              editor: this.editor
            }));
          }
          return _results;
        } else {
          return func({
            range: range,
            args: args,
            vimState: this.vimState,
            exState: this.exState,
            editor: this.editor
          });
        }
      } else {
        throw new CommandError("Not an editor command: " + input.characters);
      }
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9jb21tYW5kLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0Q0FBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsaUJBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBSGYsQ0FBQTs7QUFBQSxFQUtNO0FBQ1MsSUFBQSxpQkFBRSxNQUFGLEVBQVcsT0FBWCxHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQURxQixJQUFDLENBQUEsVUFBQSxPQUN0QixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUFBLENBQWQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxXQUFBLENBQVksSUFBWixFQUFlLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFVBQWIsQ0FBd0IsQ0FBQyxNQUF6QixHQUFrQyxDQUFqRCxDQURqQixDQURXO0lBQUEsQ0FBYjs7QUFBQSxzQkFJQSxTQUFBLEdBQVcsU0FBQyxHQUFELEVBQU0sTUFBTixHQUFBO0FBQ1QsVUFBQSxxQkFBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBTixDQUFBO0FBQ0EsTUFBQSxJQUFHLEdBQUEsS0FBTyxHQUFWO0FBQ0UsUUFBQSxJQUFBLEdBQU8sR0FBUCxDQURG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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/command.coffee
