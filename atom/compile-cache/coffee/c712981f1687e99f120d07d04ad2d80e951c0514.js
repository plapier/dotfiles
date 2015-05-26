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
      this.viewModel = new ExViewModel(this);
    }

    Command.prototype.parseAddr = function(str, curPos) {
      var addr, mark, _ref;
      if (str === '.') {
        addr = curPos.row;
      } else if (str === '$') {
        addr = this.editor.getBuffer().lines.length - 1;
      } else if ((_ref = str[0]) === "+" || _ref === "-") {
        addr = curPos.row + this.parseOffset(str);
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
        addr = mark.bufferMarker.range.end.row;
      } else if (str[0] === "/") {
        addr = Find.findNextInBuffer(this.editor.buffer, curPos, str.slice(1, -1));
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str.slice(1, -1));
        }
      } else if (str[0] === "?") {
        addr = Find.findPreviousInBuffer(this.editor.buffer, curPos, str.slice(1, -1));
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str.slice(1, -1));
        }
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
      var addr1, addr2, addrPattern, address1, address2, args, cl, command, curPos, func, lastLine, m, match, matching, name, off1, off2, range, val, _ref, _ref1, _ref2;
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
        addrPattern = /^(?:(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?[^\\]\/|\?.*?[^\\]\?|[+-]\d*)((?:\s*[+-]\d*)*))?(?:,(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?[^\\]\/|\?.*?[^\\]\?|[+-]\d*)((?:\s*[+-]\d*)*))?/;
        _ref1 = cl.match(addrPattern), match = _ref1[0], addr1 = _ref1[1], off1 = _ref1[2], addr2 = _ref1[3], off2 = _ref1[4];
        curPos = this.editor.getCursorBufferPosition();
        if (addr1 != null) {
          address1 = this.parseAddr(addr1, curPos);
        } else {
          address1 = curPos.row;
        }
        if (off1 != null) {
          address1 += this.parseOffset(off1);
        }
        if (address1 < 0 || address1 > lastLine) {
          throw new CommandError('Invalid range');
        }
        if (addr2 != null) {
          address2 = this.parseAddr(addr2, curPos);
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
        range = [address1, address2 != null ? address2 : address1];
        cl = cl.slice(match != null ? match.length : void 0);
      }
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
      if ((func = Ex.singleton()[command]) != null) {
        return func(range, args);
      } else {
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
        if (func != null) {
          return func(range, args);
        } else {
          throw new CommandError("Not an editor command: " + input.characters);
        }
      }
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);
