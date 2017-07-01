(function() {
  var exec;

  exec = require('child_process').exec;

  module.exports = {
    subs: null,
    activate: function() {
      return this.subs = atom.workspace.observeTextEditors(function(editor) {
        var buffer, ref, ref1, scopeName, scpt, stdout;
        buffer = editor.buffer;
        scpt = (ref = (ref1 = buffer.file) != null ? ref1.path : void 0) != null ? ref : '';
        scopeName = editor.getGrammar().scopeName;
        if (scopeName.endsWith('jxa') && scpt.endsWith('.scpt') && buffer.getLines()[0].startsWith('JsOsa')) {
          stdout = exec("osadecompile '" + scpt + "'").stdout;
          stdout.on('data', function(script) {
            return editor.setText(script);
          });
          return editor.onDidDestroy(function() {
            return exec("osacompile -l JavaScript -o '" + scpt + "'{,}");
          });
        }
      });
    },
    deactivate: function() {
      return this.subs.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGFuZ3VhZ2UtamF2YXNjcmlwdC1qeGEvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxlQUFSOztFQUVULE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxJQUFBLEVBQU0sSUFBTjtJQUNBLFFBQUEsRUFBVSxTQUFBO2FBR1IsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLFNBQUMsTUFBRDtBQUN4QyxZQUFBO1FBQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQztRQUNoQixJQUFBLDZFQUEyQjtRQUMxQixZQUFhLE1BQU0sQ0FBQyxVQUFQLENBQUE7UUFFZCxJQUFHLFNBQVMsQ0FBQyxRQUFWLENBQW1CLEtBQW5CLENBQUEsSUFBOEIsSUFBSSxDQUFDLFFBQUwsQ0FBYyxPQUFkLENBQTlCLElBQ0QsTUFBTSxDQUFDLFFBQVAsQ0FBQSxDQUFrQixDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQXJCLENBQWdDLE9BQWhDLENBREY7VUFJSyxTQUFVLElBQUEsQ0FBSyxnQkFBQSxHQUFpQixJQUFqQixHQUFzQixHQUEzQjtVQUNYLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixTQUFDLE1BQUQ7bUJBQVksTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmO1VBQVosQ0FBbEI7aUJBRUEsTUFBTSxDQUFDLFlBQVAsQ0FBb0IsU0FBQTttQkFDbEIsSUFBQSxDQUFLLCtCQUFBLEdBQWdDLElBQWhDLEdBQXFDLE1BQTFDO1VBRGtCLENBQXBCLEVBUEo7O01BTHdDLENBQWxDO0lBSEEsQ0FEVjtJQW9CQSxVQUFBLEVBQVksU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsT0FBTixDQUFBO0lBQUgsQ0FwQlo7O0FBSEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7ZXhlY30gPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHN1YnM6IG51bGxcbiAgYWN0aXZhdGU6IC0+XG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgQHN1YnMgPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgLT5cbiAgICAgIGJ1ZmZlciA9IGVkaXRvci5idWZmZXJcbiAgICAgIHNjcHQgPSBidWZmZXIuZmlsZT8ucGF0aCA/ICcnXG4gICAgICB7c2NvcGVOYW1lfSA9IGVkaXRvci5nZXRHcmFtbWFyKClcblxuICAgICAgaWYgc2NvcGVOYW1lLmVuZHNXaXRoKCdqeGEnKSBhbmQgc2NwdC5lbmRzV2l0aCgnLnNjcHQnKSBhbmRcbiAgICAgICAgYnVmZmVyLmdldExpbmVzKClbMF0uc3RhcnRzV2l0aCAnSnNPc2EnXG5cbiAgICAgICAgICAjIERlY29tcGlsZSAuc2NwdFxuICAgICAgICAgIHtzdGRvdXR9ID0gZXhlYyBcIm9zYWRlY29tcGlsZSAnI3tzY3B0fSdcIlxuICAgICAgICAgIHN0ZG91dC5vbiAnZGF0YScsIChzY3JpcHQpIC0+IGVkaXRvci5zZXRUZXh0IHNjcmlwdFxuXG4gICAgICAgICAgZWRpdG9yLm9uRGlkRGVzdHJveSAtPiAjIFJlY29tcGlsZVxuICAgICAgICAgICAgZXhlYyBcIm9zYWNvbXBpbGUgLWwgSmF2YVNjcmlwdCAtbyAnI3tzY3B0fSd7LH1cIlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBkZWFjdGl2YXRlOiAtPiBAc3Vicy5kaXNwb3NlKClcbiJdfQ==
