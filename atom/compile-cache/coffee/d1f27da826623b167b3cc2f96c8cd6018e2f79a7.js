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
        if (address1 === -1) {
          address1 = 0;
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
        return func({
          range: range,
          args: args,
          vimState: this.vimState,
          exState: this.exState,
          editor: this.editor
        });
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
          return func({
            range: range,
            args: args,
            vimState: this.vimState,
            exState: this.exState,
            editor: this.editor
          });
        } else {
          throw new CommandError("Not an editor command: " + input.characters);
        }
      }
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9jb21tYW5kLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0Q0FBQTs7QUFBQSxFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsaUJBQVIsQ0FBZCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBSGYsQ0FBQTs7QUFBQSxFQUtNO0FBQ1MsSUFBQSxpQkFBRSxNQUFGLEVBQVcsT0FBWCxHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsU0FBQSxNQUNiLENBQUE7QUFBQSxNQURxQixJQUFDLENBQUEsVUFBQSxPQUN0QixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFdBQUEsQ0FBWSxJQUFaLENBQWpCLENBRFc7SUFBQSxDQUFiOztBQUFBLHNCQUdBLFNBQUEsR0FBVyxTQUFDLEdBQUQsRUFBTSxNQUFOLEdBQUE7QUFDVCxVQUFBLGdCQUFBO0FBQUEsTUFBQSxJQUFHLEdBQUEsS0FBTyxHQUFWO0FBQ0UsUUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLEdBQWQsQ0FERjtPQUFBLE1BRUssSUFBRyxHQUFBLEtBQU8sR0FBVjtBQUVILFFBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBQW1CLENBQUMsS0FBSyxDQUFDLE1BQTFCLEdBQW1DLENBQTFDLENBRkc7T0FBQSxNQUdBLFlBQUcsR0FBSSxDQUFBLENBQUEsRUFBSixLQUFXLEdBQVgsSUFBQSxJQUFB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/command.coffee
