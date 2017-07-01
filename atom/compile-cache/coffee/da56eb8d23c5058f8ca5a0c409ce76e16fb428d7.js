(function() {
  var CompositeDisposable, exec;

  exec = require('child_process').exec;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    subs: null,
    autoCompiling: false,
    activate: function() {
      var name;
      name = "language-applescript";
      this.subs = new CompositeDisposable();
      this.subs.add(atom.config.observe(name + ".autoCompile", (function(_this) {
        return function(newValue) {
          return _this.enableAutoCompile(newValue);
        };
      })(this)));
      this.subs.add(atom.commands.add("body", name + ":decompile", (function(_this) {
        return function() {
          return _this.decompile();
        };
      })(this)));
      return this.subs.add(atom.commands.add("body", name + ":recompile", (function(_this) {
        return function() {
          return _this.recompile();
        };
      })(this)));
    },
    deactivate: function() {
      return this.subs.dispose();
    },
    decompile: function() {
      var editor, path, task;
      editor = atom.workspace.getActiveTextEditor();
      if (path = editor != null ? editor.buffer.getPath() : void 0) {
        task = exec("osadecompile '" + path + "'");
        return task.stdout.on("data", function(data) {
          return editor.setText(data);
        });
      }
    },
    recompile: function() {
      var editor, path;
      editor = atom.workspace.getActiveTextEditor();
      if (path = editor != null ? editor.buffer.getPath() : void 0) {
        return exec("osacompile -o " + path + "{,}");
      }
    },
    enableAutoCompile: function(enable) {
      if (enable && !this.autoCompiling) {
        this.autoCompiling = true;
        return this.subs.add(this.watchEditors = atom.workspace.observeTextEditors((function(_this) {
          return function(editor) {
            var scopeName, scpt, stdout;
            scpt = editor.getPath();
            scopeName = editor.getGrammar().scopeName;
            if (scopeName.endsWith('applescript') && (scpt != null ? scpt.endsWith('.scpt') : void 0)) {
              stdout = exec("osadecompile '" + scpt + "'");
              stdout.stdout.on('data', function(data) {
                return editor.setText(data);
              });
              return editor.onDidDestroy(function() {
                if (_this.autoCompiling) {
                  return exec("osacompile -o '" + scpt + "'{,}");
                }
              });
            }
          };
        })(this)));
      } else if (!enable) {
        this.autoCompiling = false;
        if (this.watchEditors != null) {
          this.watchEditors.dispose();
          return this.subs.remove(this.watchEditors);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGFuZ3VhZ2UtYXBwbGVzY3JpcHQvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxlQUFSOztFQUNSLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDQztJQUFBLElBQUEsRUFBTSxJQUFOO0lBQ0EsYUFBQSxFQUFlLEtBRGY7SUFHQSxRQUFBLEVBQVUsU0FBQTtBQUNULFVBQUE7TUFBQSxJQUFBLEdBQU87TUFDUCxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsbUJBQUEsQ0FBQTtNQUNaLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUF1QixJQUFELEdBQU0sY0FBNUIsRUFBMkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLFFBQUQ7aUJBQ3BELEtBQUMsQ0FBQSxpQkFBRCxDQUFtQixRQUFuQjtRQURvRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0MsQ0FBVjtNQUdBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixNQUFsQixFQUE2QixJQUFELEdBQU0sWUFBbEMsRUFBK0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxTQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0MsQ0FBVjthQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixNQUFsQixFQUE2QixJQUFELEdBQU0sWUFBbEMsRUFBK0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxTQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0MsQ0FBVjtJQVBTLENBSFY7SUFZQSxVQUFBLEVBQVksU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBO0lBQUgsQ0FaWjtJQWVBLFNBQUEsRUFBVyxTQUFBO0FBQ1YsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFDVCxJQUFHLElBQUEsb0JBQU8sTUFBTSxDQUFFLE1BQU0sQ0FBQyxPQUFmLENBQUEsVUFBVjtRQUNDLElBQUEsR0FBTyxJQUFBLENBQUssZ0JBQUEsR0FBaUIsSUFBakIsR0FBc0IsR0FBM0I7ZUFDUCxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQVosQ0FBZSxNQUFmLEVBQXVCLFNBQUMsSUFBRDtpQkFBVSxNQUFNLENBQUMsT0FBUCxDQUFlLElBQWY7UUFBVixDQUF2QixFQUZEOztJQUZVLENBZlg7SUFxQkEsU0FBQSxFQUFXLFNBQUE7QUFDVixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULElBQUcsSUFBQSxvQkFBTyxNQUFNLENBQUUsTUFBTSxDQUFDLE9BQWYsQ0FBQSxVQUFWO2VBQ0MsSUFBQSxDQUFLLGdCQUFBLEdBQWlCLElBQWpCLEdBQXNCLEtBQTNCLEVBREQ7O0lBRlUsQ0FyQlg7SUEyQkEsaUJBQUEsRUFBbUIsU0FBQyxNQUFEO01BQ2xCLElBQUcsTUFBQSxJQUFXLENBQUksSUFBQyxDQUFBLGFBQW5CO1FBQ0MsSUFBQyxDQUFBLGFBQUQsR0FBaUI7ZUFFakIsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE1BQUQ7QUFDM0QsZ0JBQUE7WUFBQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQTtZQUNOLFlBQWEsTUFBTSxDQUFDLFVBQVAsQ0FBQTtZQUVkLElBQUcsU0FBUyxDQUFDLFFBQVYsQ0FBbUIsYUFBbkIsQ0FBQSxvQkFBc0MsSUFBSSxDQUFFLFFBQU4sQ0FBZSxPQUFmLFdBQXpDO2NBR0MsTUFBQSxHQUFTLElBQUEsQ0FBSyxnQkFBQSxHQUFpQixJQUFqQixHQUFzQixHQUEzQjtjQUNULE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBZCxDQUFpQixNQUFqQixFQUF5QixTQUFDLElBQUQ7dUJBQVUsTUFBTSxDQUFDLE9BQVAsQ0FBZSxJQUFmO2NBQVYsQ0FBekI7cUJBR0EsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsU0FBQTtnQkFDbkIsSUFBRyxLQUFDLENBQUEsYUFBSjt5QkFBdUIsSUFBQSxDQUFLLGlCQUFBLEdBQWtCLElBQWxCLEdBQXVCLE1BQTVCLEVBQXZCOztjQURtQixDQUFwQixFQVBEOztVQUoyRDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBMUIsRUFIRDtPQUFBLE1BaUJLLElBQUcsQ0FBSSxNQUFQO1FBQ0osSUFBQyxDQUFBLGFBQUQsR0FBaUI7UUFDakIsSUFBRyx5QkFBSDtVQUNDLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBO2lCQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFhLElBQUMsQ0FBQSxZQUFkLEVBRkQ7U0FGSTs7SUFsQmEsQ0EzQm5COztBQUpEIiwic291cmNlc0NvbnRlbnQiOlsie2V4ZWN9ID0gcmVxdWlyZSAnY2hpbGRfcHJvY2VzcydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cblx0c3ViczogbnVsbFxuXHRhdXRvQ29tcGlsaW5nOiBmYWxzZVxuXHRcblx0YWN0aXZhdGU6IC0+XG5cdFx0bmFtZSA9IFwibGFuZ3VhZ2UtYXBwbGVzY3JpcHRcIlxuXHRcdEBzdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXHRcdEBzdWJzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlIFwiI3tuYW1lfS5hdXRvQ29tcGlsZVwiLCAobmV3VmFsdWUpID0+XG5cdFx0XHRAZW5hYmxlQXV0b0NvbXBpbGUgbmV3VmFsdWVcblx0XHRcblx0XHRAc3Vicy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgXCJib2R5XCIsIFwiI3tuYW1lfTpkZWNvbXBpbGVcIiwgPT4gQGRlY29tcGlsZSgpXG5cdFx0QHN1YnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIFwiYm9keVwiLCBcIiN7bmFtZX06cmVjb21waWxlXCIsID0+IEByZWNvbXBpbGUoKVxuXG5cdGRlYWN0aXZhdGU6IC0+IEBzdWJzLmRpc3Bvc2UoKVxuXHRcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdGRlY29tcGlsZTogLT5cblx0XHRlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblx0XHRpZiBwYXRoID0gZWRpdG9yPy5idWZmZXIuZ2V0UGF0aCgpXG5cdFx0XHR0YXNrID0gZXhlYyBcIm9zYWRlY29tcGlsZSAnI3twYXRofSdcIlxuXHRcdFx0dGFzay5zdGRvdXQub24gXCJkYXRhXCIsIChkYXRhKSAtPiBlZGl0b3Iuc2V0VGV4dCBkYXRhXG5cdFxuXHRyZWNvbXBpbGU6IC0+XG5cdFx0ZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cdFx0aWYgcGF0aCA9IGVkaXRvcj8uYnVmZmVyLmdldFBhdGgoKVxuXHRcdFx0ZXhlYyBcIm9zYWNvbXBpbGUgLW8gI3twYXRofXssfVwiXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdGVuYWJsZUF1dG9Db21waWxlOiAoZW5hYmxlKSAtPlxuXHRcdGlmIGVuYWJsZSBhbmQgbm90IEBhdXRvQ29tcGlsaW5nXG5cdFx0XHRAYXV0b0NvbXBpbGluZyA9IHRydWVcblx0XHRcdFxuXHRcdFx0QHN1YnMuYWRkIEB3YXRjaEVkaXRvcnMgPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cblx0XHRcdFx0c2NwdCA9IGVkaXRvci5nZXRQYXRoKClcblx0XHRcdFx0e3Njb3BlTmFtZX0gPSBlZGl0b3IuZ2V0R3JhbW1hcigpXG5cblx0XHRcdFx0aWYgc2NvcGVOYW1lLmVuZHNXaXRoKCdhcHBsZXNjcmlwdCcpIGFuZCBzY3B0Py5lbmRzV2l0aCAnLnNjcHQnXG5cblx0XHRcdFx0XHQjIERlY29tcGlsZSAuc2NwdFxuXHRcdFx0XHRcdHN0ZG91dCA9IGV4ZWMgXCJvc2FkZWNvbXBpbGUgJyN7c2NwdH0nXCJcblx0XHRcdFx0XHRzdGRvdXQuc3Rkb3V0Lm9uICdkYXRhJywgKGRhdGEpIC0+IGVkaXRvci5zZXRUZXh0IGRhdGFcblxuXHRcdFx0XHRcdCMgUmVjb21waWxlIG9uIHNhdmUvY2xvc2Vcblx0XHRcdFx0XHRlZGl0b3Iub25EaWREZXN0cm95ID0+XG5cdFx0XHRcdFx0XHRpZiBAYXV0b0NvbXBpbGluZyB0aGVuIGV4ZWMgXCJvc2Fjb21waWxlIC1vICcje3NjcHR9J3ssfVwiXG5cdFx0XHRcblx0XHRlbHNlIGlmIG5vdCBlbmFibGVcblx0XHRcdEBhdXRvQ29tcGlsaW5nID0gZmFsc2Vcblx0XHRcdGlmIEB3YXRjaEVkaXRvcnM/XG5cdFx0XHRcdEB3YXRjaEVkaXRvcnMuZGlzcG9zZSgpXG5cdFx0XHRcdEBzdWJzLnJlbW92ZSBAd2F0Y2hFZGl0b3JzXG4iXX0=
