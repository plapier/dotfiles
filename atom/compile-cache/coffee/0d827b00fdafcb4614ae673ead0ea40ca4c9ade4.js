(function() {
  var AutoComplete, fs, helpers, os, path, uuid;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  uuid = require('node-uuid');

  helpers = require('./spec-helper');

  AutoComplete = require('../lib/autocomplete');

  describe("autocomplete functionality", function() {
    beforeEach(function() {
      this.autoComplete = new AutoComplete(['taba', 'tabb', 'tabc']);
      this.testDir = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
      this.nonExistentTestDir = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
      this.testFile1 = path.join(this.testDir, "atom-ex-testfile-a.txt");
      this.testFile2 = path.join(this.testDir, "atom-ex-testfile-b.txt");
      return runs((function(_this) {
        return function() {
          fs.makeTreeSync(_this.testDir);
          fs.closeSync(fs.openSync(_this.testFile1, 'w'));
          fs.closeSync(fs.openSync(_this.testFile2, 'w'));
          spyOn(_this.autoComplete, 'resetCompletion').andCallThrough();
          spyOn(_this.autoComplete, 'getFilePathCompletion').andCallThrough();
          return spyOn(_this.autoComplete, 'getCommandCompletion').andCallThrough();
        };
      })(this));
    });
    afterEach(function() {
      return fs.removeSync(this.testDir);
    });
    describe("autocomplete commands", function() {
      beforeEach(function() {
        return this.completed = this.autoComplete.getAutocomplete('tab');
      });
      it("returns taba", function() {
        return expect(this.completed).toEqual('taba');
      });
      return it("calls command function", function() {
        return expect(this.autoComplete.getCommandCompletion.callCount).toBe(1);
      });
    });
    describe("autocomplete commands, then autoComplete again", function() {
      beforeEach(function() {
        this.completed = this.autoComplete.getAutocomplete('tab');
        return this.completed = this.autoComplete.getAutocomplete('tab');
      });
      it("returns tabb", function() {
        return expect(this.completed).toEqual('tabb');
      });
      return it("calls command function", function() {
        return expect(this.autoComplete.getCommandCompletion.callCount).toBe(1);
      });
    });
    describe("autocomplete directory", function() {
      beforeEach(function() {
        var filePath;
        filePath = path.join(os.tmpdir(), 'atom-ex-mode-spec-');
        return this.completed = this.autoComplete.getAutocomplete('tabe ' + filePath);
      });
      it("returns testDir", function() {
        var expected;
        expected = 'tabe ' + this.testDir + path.sep;
        return expect(this.completed).toEqual(expected);
      });
      return it("clears autocomplete", function() {
        return expect(this.autoComplete.resetCompletion.callCount).toBe(1);
      });
    });
    describe("autocomplete directory, then autocomplete again", function() {
      beforeEach(function() {
        var filePath;
        filePath = path.join(os.tmpdir(), 'atom-ex-mode-spec-');
        this.completed = this.autoComplete.getAutocomplete('tabe ' + filePath);
        return this.completed = this.autoComplete.getAutocomplete(this.completed);
      });
      it("returns test file 1", function() {
        return expect(this.completed).toEqual('tabe ' + this.testFile1);
      });
      return it("lists files twice", function() {
        return expect(this.autoComplete.getFilePathCompletion.callCount).toBe(2);
      });
    });
    describe("autocomplete full directory, then autocomplete again", function() {
      beforeEach(function() {
        var filePath;
        filePath = path.join(this.testDir, 'a');
        this.completed = this.autoComplete.getAutocomplete('tabe ' + filePath);
        return this.completed = this.autoComplete.getAutocomplete(this.completed);
      });
      it("returns test file 2", function() {
        return expect(this.completed).toEqual('tabe ' + this.testFile2);
      });
      return it("lists files once", function() {
        return expect(this.autoComplete.getFilePathCompletion.callCount).toBe(1);
      });
    });
    describe("autocomplete non existent directory", function() {
      beforeEach(function() {
        return this.completed = this.autoComplete.getAutocomplete('tabe ' + this.nonExistentTestDir);
      });
      return it("returns no completions", function() {
        var expected;
        expected = '';
        return expect(this.completed).toEqual(expected);
      });
    });
    return describe("autocomplete existing file as directory", function() {
      beforeEach(function() {
        var filePath;
        filePath = this.testFile1 + path.sep;
        return this.completed = this.autoComplete.getAutocomplete('tabe ' + filePath);
      });
      return it("returns no completions", function() {
        var expected;
        expected = '';
        return expect(this.completed).toEqual(expected);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvYXV0b2NvbXBsZXRlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLFdBQVI7O0VBRVAsT0FBQSxHQUFVLE9BQUEsQ0FBUSxlQUFSOztFQUNWLFlBQUEsR0FBZSxPQUFBLENBQVEscUJBQVI7O0VBRWYsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7SUFDckMsVUFBQSxDQUFXLFNBQUE7TUFDVCxJQUFDLENBQUEsWUFBRCxHQUFvQixJQUFBLFlBQUEsQ0FBYSxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLENBQWI7TUFDcEIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVixFQUF1QixvQkFBQSxHQUFvQixDQUFDLElBQUksQ0FBQyxFQUFMLENBQUEsQ0FBRCxDQUEzQztNQUNYLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVixFQUF1QixvQkFBQSxHQUFvQixDQUFDLElBQUksQ0FBQyxFQUFMLENBQUEsQ0FBRCxDQUEzQztNQUN0QixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLE9BQVgsRUFBb0Isd0JBQXBCO01BQ2IsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxPQUFYLEVBQW9CLHdCQUFwQjthQUViLElBQUEsQ0FBSyxDQUFBLFNBQUEs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IHJlcXVpcmUgJ2ZzLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbm9zID0gcmVxdWlyZSAnb3MnXG51dWlkID0gcmVxdWlyZSAnbm9kZS11dWlkJ1xuXG5oZWxwZXJzID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbkF1dG9Db21wbGV0ZSA9IHJlcXVpcmUgJy4uL2xpYi9hdXRvY29tcGxldGUnXG5cbmRlc2NyaWJlIFwiYXV0b2NvbXBsZXRlIGZ1bmN0aW9uYWxpdHlcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIEBhdXRvQ29tcGxldGUgPSBuZXcgQXV0b0NvbXBsZXRlKFsndGFiYScsICd0YWJiJywgJ3RhYmMnXSlcbiAgICBAdGVzdERpciA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgXCJhdG9tLWV4LW1vZGUtc3BlYy0je3V1aWQudjQoKX1cIilcbiAgICBAbm9uRXhpc3RlbnRUZXN0RGlyID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCBcImF0b20tZXgtbW9kZS1zcGVjLSN7dXVpZC52NCgpfVwiKVxuICAgIEB0ZXN0RmlsZTEgPSBwYXRoLmpvaW4oQHRlc3REaXIsIFwiYXRvbS1leC10ZXN0ZmlsZS1hLnR4dFwiKVxuICAgIEB0ZXN0RmlsZTIgPSBwYXRoLmpvaW4oQHRlc3REaXIsIFwiYXRvbS1leC10ZXN0ZmlsZS1iLnR4dFwiKVxuXG4gICAgcnVucyA9PlxuICAgICAgZnMubWFrZVRyZWVTeW5jKEB0ZXN0RGlyKVxuICAgICAgZnMuY2xvc2VTeW5jKGZzLm9wZW5TeW5jKEB0ZXN0RmlsZTEsICd3JykpO1xuICAgICAgZnMuY2xvc2VTeW5jKGZzLm9wZW5TeW5jKEB0ZXN0RmlsZTIsICd3JykpO1xuICAgICAgc3B5T24oQGF1dG9Db21wbGV0ZSwgJ3Jlc2V0Q29tcGxldGlvbicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKEBhdXRvQ29tcGxldGUsICdnZXRGaWxlUGF0aENvbXBsZXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihAYXV0b0NvbXBsZXRlLCAnZ2V0Q29tbWFuZENvbXBsZXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgZnMucmVtb3ZlU3luYyhAdGVzdERpcilcblxuICBkZXNjcmliZSBcImF1dG9jb21wbGV0ZSBjb21tYW5kc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIEBjb21wbGV0ZWQgPSBAYXV0b0NvbXBsZXRlLmdldEF1dG9jb21wbGV0ZSgndGFiJylcblxuICAgIGl0IFwicmV0dXJucyB0YWJhXCIsIC0+XG4gICAgICBleHBlY3QoQGNvbXBsZXRlZCkudG9FcXVhbCgndGFiYScpXG5cbiAgICBpdCBcImNhbGxzIGNvbW1hbmQgZnVuY3Rpb25cIiwgLT5cbiAgICAgIGV4cGVjdChAYXV0b0NvbXBsZXRlLmdldENvbW1hbmRDb21wbGV0aW9uLmNhbGxDb3VudCkudG9CZSgxKVxuXG4gIGRlc2NyaWJlIFwiYXV0b2NvbXBsZXRlIGNvbW1hbmRzLCB0aGVuIGF1dG9Db21wbGV0ZSBhZ2FpblwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIEBjb21wbGV0ZWQgPSBAYXV0b0NvbXBsZXRlLmdldEF1dG9jb21wbGV0ZSgndGFiJylcbiAgICAgIEBjb21wbGV0ZWQgPSBAYXV0b0NvbXBsZXRlLmdldEF1dG9jb21wbGV0ZSgndGFiJylcblxuICAgIGl0IFwicmV0dXJucyB0YWJiXCIsIC0+XG4gICAgICBleHBlY3QoQGNvbXBsZXRlZCkudG9FcXVhbCgndGFiYicpXG5cbiAgICBpdCBcImNhbGxzIGNvbW1hbmQgZnVuY3Rpb25cIiwgLT5cbiAgICAgIGV4cGVjdChAYXV0b0NvbXBsZXRlLmdldENvbW1hbmRDb21wbGV0aW9uLmNhbGxDb3VudCkudG9CZSgxKVxuXG4gIGRlc2NyaWJlIFwiYXV0b2NvbXBsZXRlIGRpcmVjdG9yeVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCAnYXRvbS1leC1tb2RlLXNwZWMtJylcbiAgICAgIEBjb21wbGV0ZWQgPSBAYXV0b0NvbXBsZXRlLmdldEF1dG9jb21wbGV0ZSgndGFiZSAnICsgZmlsZVBhdGgpXG5cbiAgICBpdCBcInJldHVybnMgdGVzdERpclwiLCAtPlxuICAgICAgZXhwZWN0ZWQgPSAndGFiZSAnICsgQHRlc3REaXIgKyBwYXRoLnNlcFxuICAgICAgZXhwZWN0KEBjb21wbGV0ZWQpLnRvRXF1YWwoZXhwZWN0ZWQpXG5cbiAgICBpdCBcImNsZWFycyBhdXRvY29tcGxldGVcIiwgLT5cbiAgICAgIGV4cGVjdChAYXV0b0NvbXBsZXRlLnJlc2V0Q29tcGxldGlvbi5jYWxsQ291bnQpLnRvQmUoMSlcblxuICBkZXNjcmliZSBcImF1dG9jb21wbGV0ZSBkaXJlY3RvcnksIHRoZW4gYXV0b2NvbXBsZXRlIGFnYWluXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksICdhdG9tLWV4LW1vZGUtc3BlYy0nKVxuICAgICAgQGNvbXBsZXRlZCA9IEBhdXRvQ29tcGxldGUuZ2V0QXV0b2NvbXBsZXRlKCd0YWJlICcgKyBmaWxlUGF0aClcbiAgICAgIEBjb21wbGV0ZWQgPSBAYXV0b0NvbXBsZXRlLmdldEF1dG9jb21wbGV0ZShAY29tcGxldGVkKVxuXG4gICAgaXQgXCJyZXR1cm5zIHRlc3QgZmlsZSAxXCIsIC0+XG4gICAgICBleHBlY3QoQGNvbXBsZXRlZCkudG9FcXVhbCgndGFiZSAnICsgQHRlc3RGaWxlMSlcblxuICAgIGl0IFwibGlzdHMgZmlsZXMgdHdpY2VcIiwgLT5cbiAgICAgIGV4cGVjdChAYXV0b0NvbXBsZXRlLmdldEZpbGVQYXRoQ29tcGxldGlvbi5jYWxsQ291bnQpLnRvQmUoMilcblxuICBkZXNjcmliZSBcImF1dG9jb21wbGV0ZSBmdWxsIGRpcmVjdG9yeSwgdGhlbiBhdXRvY29tcGxldGUgYWdhaW5cIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihAdGVzdERpciwgJ2EnKVxuICAgICAgQGNvbXBsZXRlZCA9IEBhdXRvQ29tcGxldGUuZ2V0QXV0b2NvbXBsZXRlKCd0YWJlICcgKyBmaWxlUGF0aClcbiAgICAgIEBjb21wbGV0ZWQgPSBAYXV0b0NvbXBsZXRlLmdldEF1dG9jb21wbGV0ZShAY29tcGxldGVkKVxuXG4gICAgaXQgXCJyZXR1cm5zIHRlc3QgZmlsZSAyXCIsIC0+XG4gICAgICBleHBlY3QoQGNvbXBsZXRlZCkudG9FcXVhbCgndGFiZSAnICsgQHRlc3RGaWxlMilcblxuICAgIGl0IFwibGlzdHMgZmlsZXMgb25jZVwiLCAtPlxuICAgICAgZXhwZWN0KEBhdXRvQ29tcGxldGUuZ2V0RmlsZVBhdGhDb21wbGV0aW9uLmNhbGxDb3VudCkudG9CZSgxKVxuXG4gIGRlc2NyaWJlIFwiYXV0b2NvbXBsZXRlIG5vbiBleGlzdGVudCBkaXJlY3RvcnlcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBAY29tcGxldGVkID0gQGF1dG9Db21wbGV0ZS5nZXRBdXRvY29tcGxldGUoJ3RhYmUgJyArIEBub25FeGlzdGVudFRlc3REaXIpXG5cbiAgICBpdCBcInJldHVybnMgbm8gY29tcGxldGlvbnNcIiwgLT5cbiAgICAgIGV4cGVjdGVkID0gJyc7XG4gICAgICBleHBlY3QoQGNvbXBsZXRlZCkudG9FcXVhbChleHBlY3RlZClcblxuICBkZXNjcmliZSBcImF1dG9jb21wbGV0ZSBleGlzdGluZyBmaWxlIGFzIGRpcmVjdG9yeVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGZpbGVQYXRoID0gQHRlc3RGaWxlMSArIHBhdGguc2VwXG4gICAgICBAY29tcGxldGVkID0gQGF1dG9Db21wbGV0ZS5nZXRBdXRvY29tcGxldGUoJ3RhYmUgJyArIGZpbGVQYXRoKVxuXG4gICAgaXQgXCJyZXR1cm5zIG5vIGNvbXBsZXRpb25zXCIsIC0+XG4gICAgICBleHBlY3RlZCA9ICcnO1xuICAgICAgZXhwZWN0KEBjb21wbGV0ZWQpLnRvRXF1YWwoZXhwZWN0ZWQpXG4iXX0=
