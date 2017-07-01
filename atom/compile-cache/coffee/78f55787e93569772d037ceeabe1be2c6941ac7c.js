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
      var addr, mark, ref, row;
      row = cursor.getBufferRow();
      if (str === '.') {
        addr = row;
      } else if (str === '$') {
        addr = this.editor.getBuffer().lines.length - 1;
      } else if ((ref = str[0]) === "+" || ref === "-") {
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
      var addr1, addr2, addrPattern, address1, address2, args, bufferRange, cl, command, cursor, func, id, lastLine, m, match, matching, name, off1, off2, range, ref, ref1, ref2, ref3, results, runOverSelections, selection, val;
      this.vimState = (ref = this.exState.globalExState.vim) != null ? ref.getEditorState(this.editor) : void 0;
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
        ref1 = cl.match(addrPattern), match = ref1[0], addr1 = ref1[1], off1 = ref1[2], addr2 = ref1[3], off2 = ref1[4];
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
          if (address1 > lastLine) {
            address1 = lastLine;
          }
          if (address1 < 0) {
            throw new CommandError('Invalid range');
          }
          if (addr2 != null) {
            address2 = this.parseAddr(addr2, cursor);
          }
          if (off2 != null) {
            address2 += this.parseOffset(off2);
          }
          if (address2 === -1) {
            address2 = 0;
          }
          if (address2 > lastLine) {
            address2 = lastLine;
          }
          if (address2 < 0) {
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
        ref2 = cl.match(/^(\w+)(.*)/), m = ref2[0], command = ref2[1], args = ref2[2];
      }
      if ((func = Ex.singleton()[command]) == null) {
        matching = (function() {
          var ref3, results;
          ref3 = Ex.singleton();
          results = [];
          for (name in ref3) {
            val = ref3[name];
            if (name.indexOf(command) === 0) {
              results.push(name);
            }
          }
          return results;
        })();
        matching.sort();
        command = matching[0];
        func = Ex.singleton()[command];
      }
      if (func != null) {
        if (runOverSelections) {
          ref3 = this.selections;
          results = [];
          for (id in ref3) {
            selection = ref3[id];
            bufferRange = selection.getBufferRange();
            range = [bufferRange.start.row, bufferRange.end.row];
            results.push(func({
              range: range,
              args: args,
              vimState: this.vimState,
              exState: this.exState,
              editor: this.editor
            }));
          }
          return results;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9jb21tYW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZCxFQUFBLEdBQUssT0FBQSxDQUFRLE1BQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBRVQ7SUFDUyxpQkFBQyxNQUFELEVBQVUsT0FBVjtNQUFDLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFVBQUQ7TUFDckIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQTtNQUNkLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsV0FBQSxDQUFZLElBQVosRUFBZSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxVQUFiLENBQXdCLENBQUMsTUFBekIsR0FBa0MsQ0FBakQ7SUFGTjs7c0JBSWIsU0FBQSxHQUFXLFNBQUMsR0FBRCxFQUFNLE1BQU47QUFDVCxVQUFBO01BQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxZQUFQLENBQUE7TUFDTixJQUFHLEdBQUEsS0FBTyxHQUFWO1FBQ0UsSUFBQSxHQUFPLElBRFQ7T0FBQSxNQUVLLElBQUcsR0FBQSxLQUFPLEdBQVY7UUFFSCxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FBbUIsQ0FBQyxLQUFLLENBQUMsTUFBMUIsR0FBbUMsRUFGdkM7T0FBQSxNQUdBLFdBQUcsR0FBSSxDQUFBLENBQUEsRUFBSixLQUFXLEdBQVgsSUFBQSxHQUFBLEtBQWdCLEdBQW5CO1FBQ0gsSUFBQSxHQUFPLEdBQUEsR0FBTSxJQUFDLENBQUEsV0FBRCxDQUFh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QUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsQ0FBQSxLQUF5QjsyQkFEZjs7QUFBQTs7O1FBR1osUUFBUSxDQUFDLElBQVQsQ0FBQTtRQUVBLE9BQUEsR0FBVSxRQUFTLENBQUEsQ0FBQTtRQUVuQixJQUFBLEdBQU8sRUFBRSxDQUFDLFNBQUgsQ0FBQSxDQUFlLENBQUEsT0FBQSxFQVR4Qjs7TUFXQSxJQUFHLFlBQUg7UUFDRSxJQUFHLGlCQUFIO0FBQ0U7QUFBQTtlQUFBLFVBQUE7O1lBQ0UsV0FBQSxHQUFjLFNBQVMsQ0FBQyxjQUFWLENBQUE7WUFDZCxLQUFBLEdBQVEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQW5CLEVBQXdCLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBeEM7eUJBQ1IsSUFBQSxDQUFLO2NBQUUsT0FBQSxLQUFGO2NBQVMsTUFBQSxJQUFUO2NBQWdCLFVBQUQsSUFBQyxDQUFBLFFBQWhCO2NBQTJCLFNBQUQsSUFBQyxDQUFBLE9BQTNCO2NBQXFDLFFBQUQsSUFBQyxDQUFBLE1BQXJDO2FBQUw7QUFIRjt5QkFERjtTQUFBLE1BQUE7aUJBTUUsSUFBQSxDQUFLO1lBQUUsT0FBQSxLQUFGO1lBQVMsTUFBQSxJQUFUO1lBQWdCLFVBQUQsSUFBQyxDQUFBLFFBQWhCO1lBQTJCLFNBQUQsSUFBQyxDQUFBLE9BQTNCO1lBQXFDLFFBQUQsSUFBQyxDQUFBLE1BQXJDO1dBQUwsRUFORjtTQURGO09BQUEsTUFBQTtBQVNFLGNBQVUsSUFBQSxZQUFBLENBQWEseUJBQUEsR0FBMEIsS0FBSyxDQUFDLFVBQTdDLEVBVFo7O0lBNUhPOzs7Ozs7RUF1SVgsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFsTWpCIiwic291cmNlc0NvbnRlbnQiOlsiRXhWaWV3TW9kZWwgPSByZXF1aXJlICcuL2V4LXZpZXctbW9kZWwnXG5FeCA9IHJlcXVpcmUgJy4vZXgnXG5GaW5kID0gcmVxdWlyZSAnLi9maW5kJ1xuQ29tbWFuZEVycm9yID0gcmVxdWlyZSAnLi9jb21tYW5kLWVycm9yJ1xuXG5jbGFzcyBDb21tYW5kXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQGV4U3RhdGUpIC0+XG4gICAgQHNlbGVjdGlvbnMgPSBAZXhTdGF0ZS5nZXRTZWxlY3Rpb25zKClcbiAgICBAdmlld01vZGVsID0gbmV3IEV4Vmlld01vZGVsKEAsIE9iamVjdC5rZXlzKEBzZWxlY3Rpb25zKS5sZW5ndGggPiAwKVxuXG4gIHBhcnNlQWRkcjogKHN0ciwgY3Vyc29yKSAtPlxuICAgIHJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlmIHN0ciBpcyAnLidcbiAgICAgIGFkZHIgPSByb3dcbiAgICBlbHNlIGlmIHN0ciBpcyAnJCdcbiAgICAgICMgTGluZXMgYXJlIDAtaW5kZXhlZCBpbiBBdG9tLCBidXQgMS1pbmRleGVkIGluIHZpbS5cbiAgICAgIGFkZHIgPSBAZWRpdG9yLmdldEJ1ZmZlcigpLmxpbmVzLmxlbmd0aCAtIDFcbiAgICBlbHNlIGlmIHN0clswXSBpbiBbXCIrXCIsIFwiLVwiXVxuICAgICAgYWRkciA9IHJvdyArIEBwYXJzZU9mZnNldChzdHIpXG4gICAgZWxzZSBpZiBub3QgaXNOYU4oc3RyKVxuICAgICAgYWRkciA9IHBhcnNlSW50KHN0cikgLSAxXG4gICAgZWxzZSBpZiBzdHJbMF0gaXMgXCInXCIgIyBQYXJzZSBNYXJrLi4uXG4gICAgICB1bmxlc3MgQHZpbVN0YXRlP1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiQ291bGRuJ3QgZ2V0IGFjY2VzcyB0byB2aW0tbW9kZS5cIilcbiAgICAgIG1hcmsgPSBAdmltU3RhdGUubWFya3Nbc3RyWzFdXVxuICAgICAgdW5sZXNzIG1hcms/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJNYXJrICN7c3RyfSBub3Qgc2V0LlwiKVxuICAgICAgYWRkciA9IG1hcmsuZ2V0RW5kQnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICBlbHNlIGlmIHN0clswXSBpcyBcIi9cIlxuICAgICAgc3RyID0gc3RyWzEuLi5dXG4gICAgICBpZiBzdHJbc3RyLmxlbmd0aC0xXSBpcyBcIi9cIlxuICAgICAgICBzdHIgPSBzdHJbLi4uLTFdXG4gICAgICBhZGRyID0gRmluZC5zY2FuRWRpdG9yKHN0ciwgQGVkaXRvciwgY3Vyc29yLmdldEN1cnJlbnRMaW5lQnVmZmVyUmFuZ2UoKS5lbmQpWzBdXG4gICAgICB1bmxlc3MgYWRkcj9cbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIlBhdHRlcm4gbm90IGZvdW5kOiAje3N0cn1cIilcbiAgICAgIGFkZHIgPSBhZGRyLnN0YXJ0LnJvd1xuICAgIGVsc2UgaWYgc3RyWzBdIGlzIFwiP1wiXG4gICAgICBzdHIgPSBzdHJbMS4uLl1cbiAgICAgIGlmIHN0cltzdHIubGVuZ3RoLTFdIGlzIFwiP1wiXG4gICAgICAgIHN0ciA9IHN0clsuLi4tMV1cbiAgICAgIGFkZHIgPSBGaW5kLnNjYW5FZGl0b3Ioc3RyLCBAZWRpdG9yLCBjdXJzb3IuZ2V0Q3VycmVudExpbmVCdWZmZXJSYW5nZSgpLnN0YXJ0LCB0cnVlKVswXVxuICAgICAgdW5sZXNzIGFkZHI/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJQYXR0ZXJuIG5vdCBmb3VuZDogI3tzdHJbMS4uLi0xXX1cIilcbiAgICAgIGFkZHIgPSBhZGRyLnN0YXJ0LnJvd1xuXG4gICAgcmV0dXJuIGFkZHJcblxuICBwYXJzZU9mZnNldDogKHN0cikgLT5cbiAgICBpZiBzdHIubGVuZ3RoIGlzIDBcbiAgICAgIHJldHVybiAwXG4gICAgaWYgc3RyLmxlbmd0aCBpcyAxXG4gICAgICBvID0gMVxuICAgIGVsc2VcbiAgICAgIG8gPSBwYXJzZUludChzdHJbMS4uXSlcbiAgICBpZiBzdHJbMF0gaXMgJysnXG4gICAgICByZXR1cm4gb1xuICAgIGVsc2VcbiAgICAgIHJldHVybiAtb1xuXG4gIGV4ZWN1dGU6IChpbnB1dCkgLT5cbiAgICBAdmltU3RhdGUgPSBAZXhTdGF0ZS5nbG9iYWxFeFN0YXRlLnZpbT8uZ2V0RWRpdG9yU3RhdGUoQGVkaXRvcilcbiAgICAjIENvbW1hbmQgbGluZSBwYXJzaW5nIChtb3N0bHkpIGZvbGxvd2luZyB0aGUgcnVsZXMgYXRcbiAgICAjIGh0dHA6Ly9wdWJzLm9wZW5ncm91cC5vcmcvb25saW5lcHVicy85Njk5OTE5Nzk5L3V0aWxpdGllc1xuICAgICMgL2V4Lmh0bWwjdGFnXzIwXzQwXzEzXzAzXG5cbiAgICAjIFN0ZXBzIDEvMjogTGVhZGluZyBibGFua3MgYW5kIGNvbG9ucyBhcmUgaWdub3JlZC5cbiAgICBjbCA9IGlucHV0LmNoYXJhY3RlcnNcbiAgICBjbCA9IGNsLnJlcGxhY2UoL14oOnxcXHMpKi8sICcnKVxuICAgIHJldHVybiB1bmxlc3MgY2wubGVuZ3RoID4gMFxuXG4gICAgIyBTdGVwIDM6IElmIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaXMgYSBcIiwgaWdub3JlIHRoZSByZXN0IG9mIHRoZSBsaW5lXG4gICAgaWYgY2xbMF0gaXMgJ1wiJ1xuICAgICAgcmV0dXJuXG5cbiAgICAjIFN0ZXAgNDogQWRkcmVzcyBwYXJzaW5nXG4gICAgbGFzdExpbmUgPSBAZWRpdG9yLmdldEJ1ZmZlcigpLmxpbmVzLmxlbmd0aCAtIDFcbiAgICBpZiBjbFswXSBpcyAnJSdcbiAgICAgIHJhbmdlID0gWzAsIGxhc3RMaW5lXVxuICAgICAgY2wgPSBjbFsxLi5dXG4gICAgZWxzZVxuICAgICAgYWRkclBhdHRlcm4gPSAvLy9eXG4gICAgICAgICg/OiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEZpcnN0IGFkZHJlc3NcbiAgICAgICAgKFxuICAgICAgICBcXC58ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgQ3VycmVudCBsaW5lXG4gICAgICAgIFxcJHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBMYXN0IGxpbmVcbiAgICAgICAgXFxkK3wgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIG4tdGggbGluZVxuICAgICAgICAnW1xcW1xcXTw+J2BcIl4uKCl7fWEtekEtWl18ICAgICAgICAgIyBNYXJrc1xuICAgICAgICAvLio/KD86W15cXFxcXS98JCl8ICAgICAgICAgICAgICAgICAjIFJlZ2V4XG4gICAgICAgIFxcPy4qPyg/OlteXFxcXF1cXD98JCl8ICAgICAgICAgICAgICAgIyBCYWNrd2FyZHMgc2VhcmNoXG4gICAgICAgIFsrLV1cXGQqICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBDdXJyZW50IGxpbmUgKy8tIGEgbnVtYmVyIG9mIGxpbmVzXG4gICAgICAgICkoKD86XFxzKlsrLV1cXGQqKSopICAgICAgICAgICAgICAgICMgTGluZSBvZmZzZXRcbiAgICAgICAgKT9cbiAgICAgICAgKD86LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgU2Vjb25kIGFkZHJlc3NcbiAgICAgICAgKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgU2FtZSBhcyBmaXJzdCBhZGRyZXNzXG4gICAgICAgIFxcLnxcbiAgICAgICAgXFwkfFxuICAgICAgICBcXGQrfFxuICAgICAgICAnW1xcW1xcXTw+J2BcIl4uKCl7fWEtekEtWl18XG4gICAgICAgIC8uKj9bXlxcXFxdL3xcbiAgICAgICAgXFw/Lio/W15cXFxcXVxcP3xcbiAgICAgICAgWystXVxcZCpcbiAgICAgICAgKSgoPzpcXHMqWystXVxcZCopKilcbiAgICAgICAgKT9cbiAgICAgIC8vL1xuXG4gICAgICBbbWF0Y2gsIGFkZHIxLCBvZmYxLCBhZGRyMiwgb2ZmMl0gPSBjbC5tYXRjaChhZGRyUGF0dGVybilcblxuICAgICAgY3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcblxuICAgICAgIyBTcGVjaWFsIGNhc2U6IHJ1biBjb21tYW5kIG9uIHNlbGVjdGlvbi4gVGhpcyBjYW4ndCBiZSBoYW5kbGVkIGJ5IHNpbXBseVxuICAgICAgIyBwYXJzaW5nIHRoZSBtYXJrIHNpbmNlIHZpbS1tb2RlIGRvZXNuJ3Qgc2V0IGl0IChhbmQgaXQgd291bGQgYmUgZmFpcmx5XG4gICAgICAjIHVzZWxlc3Mgd2l0aCBtdWx0aXBsZSBzZWxlY3Rpb25zKVxuICAgICAgaWYgYWRkcjEgaXMgXCInPFwiIGFuZCBhZGRyMiBpcyBcIic+XCJcbiAgICAgICAgcnVuT3ZlclNlbGVjdGlvbnMgPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIHJ1bk92ZXJTZWxlY3Rpb25zID0gZmFsc2VcbiAgICAgICAgaWYgYWRkcjE/XG4gICAgICAgICAgYWRkcmVzczEgPSBAcGFyc2VBZGRyKGFkZHIxLCBjdXJzb3IpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIElmIG5vIGFkZHIxIGlzIGdpdmVuICgsKzMpLCBhc3N1bWUgaXQgaXMgJy4nXG4gICAgICAgICAgYWRkcmVzczEgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgICAgaWYgb2ZmMT9cbiAgICAgICAgICBhZGRyZXNzMSArPSBAcGFyc2VPZmZzZXQob2ZmMSlcblxuICAgICAgICBhZGRyZXNzMSA9IDAgaWYgYWRkcmVzczEgaXMgLTFcbiAgICAgICAgYWRkcmVzczEgPSBsYXN0TGluZSBpZiBhZGRyZXNzMSA+IGxhc3RMaW5lXG5cbiAgICAgICAgaWYgYWRkcmVzczEgPCAwXG4gICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignSW52YWxpZCByYW5nZScpXG5cbiAgICAgICAgaWYgYWRkcjI/XG4gICAgICAgICAgYWRkcmVzczIgPSBAcGFyc2VBZGRyKGFkZHIyLCBjdXJzb3IpXG4gICAgICAgIGlmIG9mZjI/XG4gICAgICAgICAgYWRkcmVzczIgKz0gQHBhcnNlT2Zmc2V0KG9mZjIpXG5cbiAgICAgICAgYWRkcmVzczIgPSAwIGlmIGFkZHJlc3MyIGlzIC0xXG4gICAgICAgIGFkZHJlc3MyID0gbGFzdExpbmUgaWYgYWRkcmVzczIgPiBsYXN0TGluZVxuXG4gICAgICAgIGlmIGFkZHJlc3MyIDwgMFxuICAgICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ0ludmFsaWQgcmFuZ2UnKVxuXG4gICAgICAgIGlmIGFkZHJlc3MyIDwgYWRkcmVzczFcbiAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdCYWNrd2FyZHMgcmFuZ2UgZ2l2ZW4nKVxuXG4gICAgICByYW5nZSA9IFthZGRyZXNzMSwgaWYgYWRkcmVzczI/IHRoZW4gYWRkcmVzczIgZWxzZSBhZGRyZXNzMV1cbiAgICBjbCA9IGNsW21hdGNoPy5sZW5ndGguLl1cblxuICAgICMgU3RlcCA1OiBMZWFkaW5nIGJsYW5rcyBhcmUgaWdub3JlZFxuICAgIGNsID0gY2wudHJpbUxlZnQoKVxuXG4gICAgIyBTdGVwIDZhOiBJZiBubyBjb21tYW5kIGlzIHNwZWNpZmllZCwgZ28gdG8gdGhlIGxhc3Qgc3BlY2lmaWVkIGFkZHJlc3NcbiAgICBpZiBjbC5sZW5ndGggaXMgMFxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbcmFuZ2VbMV0sIDBdKVxuICAgICAgcmV0dXJuXG5cbiAgICAjIElnbm9yZSBzdGVwcyA2YiBhbmQgNmMgc2luY2UgdGhleSBvbmx5IG1ha2Ugc2Vuc2UgZm9yIHByaW50IGNvbW1hbmRzIGFuZFxuICAgICMgcHJpbnQgZG9lc24ndCBtYWtlIHNlbnNlXG5cbiAgICAjIElnbm9yZSBzdGVwIDdhIHNpbmNlIGZsYWdzIGFyZSBvbmx5IHVzZWZ1bCBmb3IgcHJpbnRcblxuICAgICMgU3RlcCA3YjogOms8dmFsaWQgbWFyaz4gaXMgZXF1YWwgdG8gOm1hcmsgPHZhbGlkIG1hcms+IC0gb25seSBhLXpBLVogaXNcbiAgICAjIGluIHZpbS1tb2RlIGZvciBub3dcbiAgICBpZiBjbC5sZW5ndGggaXMgMiBhbmQgY2xbMF0gaXMgJ2snIGFuZCAvW2Etel0vaS50ZXN0KGNsWzFdKVxuICAgICAgY29tbWFuZCA9ICdtYXJrJ1xuICAgICAgYXJncyA9IGNsWzFdXG4gICAgZWxzZSBpZiBub3QgL1thLXpdL2kudGVzdChjbFswXSlcbiAgICAgIGNvbW1hbmQgPSBjbFswXVxuICAgICAgYXJncyA9IGNsWzEuLl1cbiAgICBlbHNlXG4gICAgICBbbSwgY29tbWFuZCwgYXJnc10gPSBjbC5tYXRjaCgvXihcXHcrKSguKikvKVxuXG4gICAgIyBJZiB0aGUgY29tbWFuZCBtYXRjaGVzIGFuIGV4aXN0aW5nIG9uZSBleGFjdGx5LCBleGVjdXRlIHRoYXQgb25lXG4gICAgdW5sZXNzIChmdW5jID0gRXguc2luZ2xldG9uKClbY29tbWFuZF0pP1xuICAgICAgIyBTdGVwIDg6IE1hdGNoIGNvbW1hbmQgYWdhaW5zdCBleGlzdGluZyBjb21tYW5kc1xuICAgICAgbWF0Y2hpbmcgPSAobmFtZSBmb3IgbmFtZSwgdmFsIG9mIEV4LnNpbmdsZXRvbigpIHdoZW4gXFxcbiAgICAgICAgbmFtZS5pbmRleE9mKGNvbW1hbmQpIGlzIDApXG5cbiAgICAgIG1hdGNoaW5nLnNvcnQoKVxuXG4gICAgICBjb21tYW5kID0gbWF0Y2hpbmdbMF1cblxuICAgICAgZnVuYyA9IEV4LnNpbmdsZXRvbigpW2NvbW1hbmRdXG5cbiAgICBpZiBmdW5jP1xuICAgICAgaWYgcnVuT3ZlclNlbGVjdGlvbnNcbiAgICAgICAgZm9yIGlkLCBzZWxlY3Rpb24gb2YgQHNlbGVjdGlvbnNcbiAgICAgICAgICBidWZmZXJSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgICAgcmFuZ2UgPSBbYnVmZmVyUmFuZ2Uuc3RhcnQucm93LCBidWZmZXJSYW5nZS5lbmQucm93XVxuICAgICAgICAgIGZ1bmMoeyByYW5nZSwgYXJncywgQHZpbVN0YXRlLCBAZXhTdGF0ZSwgQGVkaXRvciB9KVxuICAgICAgZWxzZVxuICAgICAgICBmdW5jKHsgcmFuZ2UsIGFyZ3MsIEB2aW1TdGF0ZSwgQGV4U3RhdGUsIEBlZGl0b3IgfSlcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTm90IGFuIGVkaXRvciBjb21tYW5kOiAje2lucHV0LmNoYXJhY3RlcnN9XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZFxuIl19
