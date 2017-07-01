var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCodeContext = require('../lib/code-context');

var _libCodeContext2 = _interopRequireDefault(_libCodeContext);

'use babel';

describe('CodeContext', function () {
  beforeEach(function () {
    _this.codeContext = new _libCodeContext2['default']('test.txt', '/tmp/test.txt', null);
    // TODO: Test using an actual editor or a selection?
    _this.dummyTextSource = {};
    _this.dummyTextSource.getText = function () {
      return "print 'hello world!'";
    };
  });

  describe('fileColonLine when lineNumber is not set', function () {
    it('returns the full filepath when fullPath is truthy', function () {
      expect(_this.codeContext.fileColonLine()).toMatch('/tmp/test.txt');
      expect(_this.codeContext.fileColonLine(true)).toMatch('/tmp/test.txt');
    });

    it('returns only the filename and line number when fullPath is falsy', function () {
      expect(_this.codeContext.fileColonLine(false)).toMatch('test.txt');
    });
  });

  describe('fileColonLine when lineNumber is set', function () {
    it('returns the full filepath when fullPath is truthy', function () {
      _this.codeContext.lineNumber = 42;
      expect(_this.codeContext.fileColonLine()).toMatch('/tmp/test.txt');
      expect(_this.codeContext.fileColonLine(true)).toMatch('/tmp/test.txt');
    });

    it('returns only the filename and line number when fullPath is falsy', function () {
      _this.codeContext.lineNumber = 42;
      expect(_this.codeContext.fileColonLine(false)).toMatch('test.txt');
    });
  });

  describe('getCode', function () {
    it('returns undefined if no textSource is available', function () {
      expect(_this.codeContext.getCode()).toBe(null);
    });

    it('returns a string prepended with newlines when prependNewlines is truthy', function () {
      _this.codeContext.textSource = _this.dummyTextSource;
      _this.codeContext.lineNumber = 3;

      var code = _this.codeContext.getCode(true);
      expect(typeof code).toEqual('string');
      // Since Array#join will create newlines for one less than the the number
      // of elements line number 3 means there should be two newlines
      expect(code).toMatch("\n\nprint 'hello world!'");
    });

    it('returns the text from the textSource when available', function () {
      _this.codeContext.textSource = _this.dummyTextSource;

      var code = _this.codeContext.getCode();
      expect(typeof code).toEqual('string');
      expect(code).toMatch("print 'hello world!'");
    });
  });

  describe('shebangCommand when no shebang was found', function () {
    return it('returns undefined when no shebang is found', function () {
      var lines = _this.dummyTextSource.getText();
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommand()).toBe(null);
    });
  });

  describe('shebangCommand when a shebang was found', function () {
    it('returns the command from the shebang', function () {
      var lines = "#!/bin/bash\necho 'hello from bash!'";
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommand()).toMatch('bash');
    });

    it('returns /usr/bin/env as the command if applicable', function () {
      var lines = "#!/usr/bin/env ruby -w\nputs 'hello from ruby!'";
      var firstLine = lines.split('\n')[0];
      firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommand()).toMatch('env');
    });

    it('returns a command with non-alphabet characters', function () {
      var lines = "#!/usr/bin/python2.7\nprint 'hello from python!'";
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommand()).toMatch('python2.7');
    });
  });

  describe('shebangCommandArgs when no shebang was found', function () {
    return it('returns [] when no shebang is found', function () {
      var lines = _this.dummyTextSource.getText();
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommandArgs()).toMatch([]);
    });
  });

  describe('shebangCommandArgs when a shebang was found', function () {
    it('returns the command from the shebang', function () {
      var lines = "#!/bin/bash\necho 'hello from bash!'";
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommandArgs()).toMatch([]);
    });

    it('returns the true command as the first argument when /usr/bin/env is used', function () {
      var lines = "#!/usr/bin/env ruby -w\nputs 'hello from ruby!'";
      var firstLine = lines.split('\n')[0];
      firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      var args = _this.codeContext.shebangCommandArgs();
      expect(args[0]).toMatch('ruby');
      expect(args).toMatch(['ruby', '-w']);
    });

    it('returns the command args when the command had non-alphabet characters', function () {
      var lines = "#!/usr/bin/python2.7\nprint 'hello from python!'";
      var firstLine = lines.split('\n')[0];
      if (firstLine.match(/^#!/)) {
        _this.codeContext.shebang = firstLine;
      }
      expect(_this.codeContext.shebangCommandArgs()).toMatch([]);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvY29kZS1jb250ZXh0LXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs4QkFFd0IscUJBQXFCOzs7O0FBRjdDLFdBQVcsQ0FBQzs7QUFJWixRQUFRLENBQUMsYUFBYSxFQUFFLFlBQU07QUFDNUIsWUFBVSxDQUFDLFlBQU07QUFDZixVQUFLLFdBQVcsR0FBRyxnQ0FBZ0IsVUFBVSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFdEUsVUFBSyxlQUFlLEdBQUcsRUFBRSxDQUFDO0FBQzFCLFVBQUssZUFBZSxDQUFDLE9BQU8sR0FBRzthQUFNLHNCQUFzQjtLQUFBLENBQUM7R0FDN0QsQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQywwQ0FBMEMsRUFBRSxZQUFNO0FBQ3pELE1BQUUsQ0FBQyxtREFBbUQsRUFBRSxZQUFNO0FBQzVELFlBQU0sQ0FBQyxNQUFLLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNsRSxZQUFNLENBQUMsTUFBSyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0tBQ3ZFLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsa0VBQWtFLEVBQUUsWUFBTTtBQUMzRSxZQUFNLENBQUMsTUFBSyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ25FLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsc0NBQXNDLEVBQUUsWUFBTTtBQUNyRCxNQUFFLENBQUMsbURBQW1ELEVBQUUsWUFBTTtBQUM1RCxZQUFLLFdBQVcsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ2pDLFlBQU0sQ0FBQyxNQUFLLFdBQVcsQ0FBQyxhQUFh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QUMsa0JBQWtCLEVBQUUsQ0FBQztBQUNuRCxZQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLFlBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUN0QyxDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLHVFQUF1RSxFQUFFLFlBQU07QUFDaEYsVUFBTSxLQUFLLEdBQUcsa0RBQWtELENBQUM7QUFDakUsVUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxVQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFBRSxjQUFLLFdBQVcsQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO09BQUU7QUFDckUsWUFBTSxDQUFDLE1BQUssV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDM0QsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvY29kZS1jb250ZXh0LXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IENvZGVDb250ZXh0IGZyb20gJy4uL2xpYi9jb2RlLWNvbnRleHQnO1xuXG5kZXNjcmliZSgnQ29kZUNvbnRleHQnLCAoKSA9PiB7XG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIHRoaXMuY29kZUNvbnRleHQgPSBuZXcgQ29kZUNvbnRleHQoJ3Rlc3QudHh0JywgJy90bXAvdGVzdC50eHQnLCBudWxsKTtcbiAgICAvLyBUT0RPOiBUZXN0IHVzaW5nIGFuIGFjdHVhbCBlZGl0b3Igb3IgYSBzZWxlY3Rpb24/XG4gICAgdGhpcy5kdW1teVRleHRTb3VyY2UgPSB7fTtcbiAgICB0aGlzLmR1bW15VGV4dFNvdXJjZS5nZXRUZXh0ID0gKCkgPT4gXCJwcmludCAnaGVsbG8gd29ybGQhJ1wiO1xuICB9KTtcblxuICBkZXNjcmliZSgnZmlsZUNvbG9uTGluZSB3aGVuIGxpbmVOdW1iZXIgaXMgbm90IHNldCcsICgpID0+IHtcbiAgICBpdCgncmV0dXJucyB0aGUgZnVsbCBmaWxlcGF0aCB3aGVuIGZ1bGxQYXRoIGlzIHRydXRoeScsICgpID0+IHtcbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LmZpbGVDb2xvbkxpbmUoKSkudG9NYXRjaCgnL3RtcC90ZXN0LnR4dCcpO1xuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuZmlsZUNvbG9uTGluZSh0cnVlKSkudG9NYXRjaCgnL3RtcC90ZXN0LnR4dCcpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3JldHVybnMgb25seSB0aGUgZmlsZW5hbWUgYW5kIGxpbmUgbnVtYmVyIHdoZW4gZnVsbFBhdGggaXMgZmFsc3knLCAoKSA9PiB7XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5maWxlQ29sb25MaW5lKGZhbHNlKSkudG9NYXRjaCgndGVzdC50eHQnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2ZpbGVDb2xvbkxpbmUgd2hlbiBsaW5lTnVtYmVyIGlzIHNldCcsICgpID0+IHtcbiAgICBpdCgncmV0dXJucyB0aGUgZnVsbCBmaWxlcGF0aCB3aGVuIGZ1bGxQYXRoIGlzIHRydXRoeScsICgpID0+IHtcbiAgICAgIHRoaXMuY29kZUNvbnRleHQubGluZU51bWJlciA9IDQyO1xuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuZmlsZUNvbG9uTGluZSgpKS50b01hdGNoKCcvdG1wL3Rlc3QudHh0Jyk7XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5maWxlQ29sb25MaW5lKHRydWUpKS50b01hdGNoKCcvdG1wL3Rlc3QudHh0Jyk7XG4gICAgfSk7XG5cbiAgICBpdCgncmV0dXJucyBvbmx5IHRoZSBmaWxlbmFtZSBhbmQgbGluZSBudW1iZXIgd2hlbiBmdWxsUGF0aCBpcyBmYWxzeScsICgpID0+IHtcbiAgICAgIHRoaXMuY29kZUNvbnRleHQubGluZU51bWJlciA9IDQyO1xuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuZmlsZUNvbG9uTGluZShmYWxzZSkpLnRvTWF0Y2goJ3Rlc3QudHh0Jyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdnZXRDb2RlJywgKCkgPT4ge1xuICAgIGl0KCdyZXR1cm5zIHVuZGVmaW5lZCBpZiBubyB0ZXh0U291cmNlIGlzIGF2YWlsYWJsZScsICgpID0+IHtcbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LmdldENvZGUoKSkudG9CZShudWxsKTtcbiAgICB9KTtcblxuICAgIGl0KCdyZXR1cm5zIGEgc3RyaW5nIHByZXBlbmRlZCB3aXRoIG5ld2xpbmVzIHdoZW4gcHJlcGVuZE5ld2xpbmVzIGlzIHRydXRoeScsICgpID0+IHtcbiAgICAgIHRoaXMuY29kZUNvbnRleHQudGV4dFNvdXJjZSA9IHRoaXMuZHVtbXlUZXh0U291cmNlO1xuICAgICAgdGhpcy5jb2RlQ29udGV4dC5saW5lTnVtYmVyID0gMztcblxuICAgICAgY29uc3QgY29kZSA9IHRoaXMuY29kZUNvbnRleHQuZ2V0Q29kZSh0cnVlKTtcbiAgICAgIGV4cGVjdCh0eXBlb2YgY29kZSkudG9FcXVhbCgnc3RyaW5nJyk7XG4gICAgICAvLyBTaW5jZSBBcnJheSNqb2luIHdpbGwgY3JlYXRlIG5ld2xpbmVzIGZvciBvbmUgbGVzcyB0aGFuIHRoZSB0aGUgbnVtYmVyXG4gICAgICAvLyBvZiBlbGVtZW50cyBsaW5lIG51bWJlciAzIG1lYW5zIHRoZXJlIHNob3VsZCBiZSB0d28gbmV3bGluZXNcbiAgICAgIGV4cGVjdChjb2RlKS50b01hdGNoKFwiXFxuXFxucHJpbnQgJ2hlbGxvIHdvcmxkISdcIik7XG4gICAgfSk7XG5cbiAgICBpdCgncmV0dXJucyB0aGUgdGV4dCBmcm9tIHRoZSB0ZXh0U291cmNlIHdoZW4gYXZhaWxhYmxlJywgKCkgPT4ge1xuICAgICAgdGhpcy5jb2RlQ29udGV4dC50ZXh0U291cmNlID0gdGhpcy5kdW1teVRleHRTb3VyY2U7XG5cbiAgICAgIGNvbnN0IGNvZGUgPSB0aGlzLmNvZGVDb250ZXh0LmdldENvZGUoKTtcbiAgICAgIGV4cGVjdCh0eXBlb2YgY29kZSkudG9FcXVhbCgnc3RyaW5nJyk7XG4gICAgICBleHBlY3QoY29kZSkudG9NYXRjaChcInByaW50ICdoZWxsbyB3b3JsZCEnXCIpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc2hlYmFuZ0NvbW1hbmQgd2hlbiBubyBzaGViYW5nIHdhcyBmb3VuZCcsICgpID0+XG4gICAgaXQoJ3JldHVybnMgdW5kZWZpbmVkIHdoZW4gbm8gc2hlYmFuZyBpcyBmb3VuZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gdGhpcy5kdW1teVRleHRTb3VyY2UuZ2V0VGV4dCgpO1xuICAgICAgY29uc3QgZmlyc3RMaW5lID0gbGluZXMuc3BsaXQoJ1xcbicpWzBdO1xuICAgICAgaWYgKGZpcnN0TGluZS5tYXRjaCgvXiMhLykpIHsgdGhpcy5jb2RlQ29udGV4dC5zaGViYW5nID0gZmlyc3RMaW5lOyB9XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5zaGViYW5nQ29tbWFuZCgpKS50b0JlKG51bGwpO1xuICAgIH0pLFxuICApO1xuXG4gIGRlc2NyaWJlKCdzaGViYW5nQ29tbWFuZCB3aGVuIGEgc2hlYmFuZyB3YXMgZm91bmQnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgdGhlIGNvbW1hbmQgZnJvbSB0aGUgc2hlYmFuZycsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gXCIjIS9iaW4vYmFzaFxcbmVjaG8gJ2hlbGxvIGZyb20gYmFzaCEnXCI7XG4gICAgICBjb25zdCBmaXJzdExpbmUgPSBsaW5lcy5zcGxpdCgnXFxuJylbMF07XG4gICAgICBpZiAoZmlyc3RMaW5lLm1hdGNoKC9eIyEvKSkgeyB0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmcgPSBmaXJzdExpbmU7IH1cbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmdDb21tYW5kKCkpLnRvTWF0Y2goJ2Jhc2gnKTtcbiAgICB9KTtcblxuICAgIGl0KCdyZXR1cm5zIC91c3IvYmluL2VudiBhcyB0aGUgY29tbWFuZCBpZiBhcHBsaWNhYmxlJywgKCkgPT4ge1xuICAgICAgY29uc3QgbGluZXMgPSBcIiMhL3Vzci9iaW4vZW52IHJ1YnkgLXdcXG5wdXRzICdoZWxsbyBmcm9tIHJ1YnkhJ1wiO1xuICAgICAgbGV0IGZpcnN0TGluZSA9IGxpbmVzLnNwbGl0KCdcXG4nKVswXTtcbiAgICAgIGZpcnN0TGluZSA9IGxpbmVzLnNwbGl0KCdcXG4nKVswXTtcbiAgICAgIGlmIChmaXJzdExpbmUubWF0Y2goL14jIS8pKSB7IHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZyA9IGZpcnN0TGluZTsgfVxuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZ0NvbW1hbmQoKSkudG9NYXRjaCgnZW52Jyk7XG4gICAgfSk7XG5cbiAgICBpdCgncmV0dXJucyBhIGNvbW1hbmQgd2l0aCBub24tYWxwaGFiZXQgY2hhcmFjdGVycycsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gXCIjIS91c3IvYmluL3B5dGhvbjIuN1xcbnByaW50ICdoZWxsbyBmcm9tIHB5dGhvbiEnXCI7XG4gICAgICBjb25zdCBmaXJzdExpbmUgPSBsaW5lcy5zcGxpdCgnXFxuJylbMF07XG4gICAgICBpZiAoZmlyc3RMaW5lLm1hdGNoKC9eIyEvKSkgeyB0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmcgPSBmaXJzdExpbmU7IH1cbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmdDb21tYW5kKCkpLnRvTWF0Y2goJ3B5dGhvbjIuNycpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnc2hlYmFuZ0NvbW1hbmRBcmdzIHdoZW4gbm8gc2hlYmFuZyB3YXMgZm91bmQnLCAoKSA9PlxuICAgIGl0KCdyZXR1cm5zIFtdIHdoZW4gbm8gc2hlYmFuZyBpcyBmb3VuZCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gdGhpcy5kdW1teVRleHRTb3VyY2UuZ2V0VGV4dCgpO1xuICAgICAgY29uc3QgZmlyc3RMaW5lID0gbGluZXMuc3BsaXQoJ1xcbicpWzBdO1xuICAgICAgaWYgKGZpcnN0TGluZS5tYXRjaCgvXiMhLykpIHsgdGhpcy5jb2RlQ29udGV4dC5zaGViYW5nID0gZmlyc3RMaW5lOyB9XG4gICAgICBleHBlY3QodGhpcy5jb2RlQ29udGV4dC5zaGViYW5nQ29tbWFuZEFyZ3MoKSkudG9NYXRjaChbXSk7XG4gICAgfSksXG4gICk7XG5cbiAgZGVzY3JpYmUoJ3NoZWJhbmdDb21tYW5kQXJncyB3aGVuIGEgc2hlYmFuZyB3YXMgZm91bmQnLCAoKSA9PiB7XG4gICAgaXQoJ3JldHVybnMgdGhlIGNvbW1hbmQgZnJvbSB0aGUgc2hlYmFuZycsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gXCIjIS9iaW4vYmFzaFxcbmVjaG8gJ2hlbGxvIGZyb20gYmFzaCEnXCI7XG4gICAgICBjb25zdCBmaXJzdExpbmUgPSBsaW5lcy5zcGxpdCgnXFxuJylbMF07XG4gICAgICBpZiAoZmlyc3RMaW5lLm1hdGNoKC9eIyEvKSkgeyB0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmcgPSBmaXJzdExpbmU7IH1cbiAgICAgIGV4cGVjdCh0aGlzLmNvZGVDb250ZXh0LnNoZWJhbmdDb21tYW5kQXJncygpKS50b01hdGNoKFtdKTtcbiAgICB9KTtcblxuICAgIGl0KCdyZXR1cm5zIHRoZSB0cnVlIGNvbW1hbmQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHdoZW4gL3Vzci9iaW4vZW52IGlzIHVzZWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBsaW5lcyA9IFwiIyEvdXNyL2Jpbi9lbnYgcnVieSAtd1xcbnB1dHMgJ2hlbGxvIGZyb20gcnVieSEnXCI7XG4gICAgICBsZXQgZmlyc3RMaW5lID0gbGluZXMuc3BsaXQoJ1xcbicpWzBdO1xuICAgICAgZmlyc3RMaW5lID0gbGluZXMuc3BsaXQoJ1xcbicpWzBdO1xuICAgICAgaWYgKGZpcnN0TGluZS5tYXRjaCgvXiMhLykpIHsgdGhpcy5jb2RlQ29udGV4dC5zaGViYW5nID0gZmlyc3RMaW5lOyB9XG4gICAgICBjb25zdCBhcmdzID0gdGhpcy5jb2RlQ29udGV4dC5zaGViYW5nQ29tbWFuZEFyZ3MoKTtcbiAgICAgIGV4cGVjdChhcmdzWzBdKS50b01hdGNoKCdydWJ5Jyk7XG4gICAgICBleHBlY3QoYXJncykudG9NYXRjaChbJ3J1YnknLCAnLXcnXSk7XG4gICAgfSk7XG5cbiAgICBpdCgncmV0dXJucyB0aGUgY29tbWFuZCBhcmdzIHdoZW4gdGhlIGNvbW1hbmQgaGFkIG5vbi1hbHBoYWJldCBjaGFyYWN0ZXJzJywgKCkgPT4ge1xuICAgICAgY29uc3QgbGluZXMgPSBcIiMhL3Vzci9iaW4vcHl0aG9uMi43XFxucHJpbnQgJ2hlbGxvIGZyb20gcHl0aG9uISdcIjtcbiAgICAgIGNvbnN0IGZpcnN0TGluZSA9IGxpbmVzLnNwbGl0KCdcXG4nKVswXTtcbiAgICAgIGlmIChmaXJzdExpbmUubWF0Y2goL14jIS8pKSB7IHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZyA9IGZpcnN0TGluZTsgfVxuICAgICAgZXhwZWN0KHRoaXMuY29kZUNvbnRleHQuc2hlYmFuZ0NvbW1hbmRBcmdzKCkpLnRvTWF0Y2goW10pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19