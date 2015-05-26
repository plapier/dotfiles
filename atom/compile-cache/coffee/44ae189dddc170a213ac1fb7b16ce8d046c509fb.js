(function() {
  var CodeContext;

  CodeContext = require('../lib/code-context');

  describe('CodeContext', function() {
    beforeEach(function() {
      this.codeContext = new CodeContext('test.txt', '/tmp/test.txt', null);
      this.dummyTextSource = {};
      return this.dummyTextSource.getText = function() {
        return "print 'hello world!'";
      };
    });
    describe('fileColonLine when lineNumber is not set', function() {
      it('returns the full filepath when fullPath is truthy', function() {
        expect(this.codeContext.fileColonLine()).toMatch("/tmp/test.txt");
        return expect(this.codeContext.fileColonLine(true)).toMatch("/tmp/test.txt");
      });
      return it('returns only the filename and line number when fullPath is falsy', function() {
        return expect(this.codeContext.fileColonLine(false)).toMatch("test.txt");
      });
    });
    describe('fileColonLine when lineNumber is set', function() {
      it('returns the full filepath when fullPath is truthy', function() {
        this.codeContext.lineNumber = 42;
        expect(this.codeContext.fileColonLine()).toMatch("/tmp/test.txt");
        return expect(this.codeContext.fileColonLine(true)).toMatch("/tmp/test.txt");
      });
      return it('returns only the filename and line number when fullPath is falsy', function() {
        this.codeContext.lineNumber = 42;
        return expect(this.codeContext.fileColonLine(false)).toMatch("test.txt");
      });
    });
    describe('getCode', function() {
      it('returns undefined if no textSource is available', function() {
        return expect(this.codeContext.getCode()).toBe(void 0);
      });
      it('returns a string prepended with newlines when prependNewlines is truthy', function() {
        var code;
        this.codeContext.textSource = this.dummyTextSource;
        this.codeContext.lineNumber = 3;
        code = this.codeContext.getCode(true);
        expect(typeof code).toEqual('string');
        return expect(code).toMatch("\n\nprint 'hello world!'");
      });
      return it('returns the text from the textSource when available', function() {
        var code;
        this.codeContext.textSource = this.dummyTextSource;
        code = this.codeContext.getCode();
        expect(typeof code).toEqual('string');
        return expect(code).toMatch("print 'hello world!'");
      });
    });
    describe('shebangCommand when no shebang was found', function() {
      return it('returns undefined when no shebang is found', function() {
        var firstLine, lines;
        lines = this.dummyTextSource.getText();
        firstLine = lines.split("\n")[0];
        if (firstLine.match(/^#!/)) {
          this.codeContext.shebang = firstLine;
        }
        return expect(this.codeContext.shebangCommand()).toBe(void 0);
      });
    });
    describe('shebangCommand when a shebang was found', function() {
      it('returns the command from the shebang', function() {
        var firstLine, lines;
        lines = "#!/bin/bash\necho 'hello from bash!'";
        firstLine = lines.split("\n")[0];
        if (firstLine.match(/^#!/)) {
          this.codeContext.shebang = firstLine;
        }
        return expect(this.codeContext.shebangCommand()).toMatch('bash');
      });
      it('returns /usr/bin/env as the command if applicable', function() {
        var firstLine, lines;
        lines = "#!/usr/bin/env ruby -w\nputs 'hello from ruby!'";
        firstLine = lines.split("\n")[0];
        firstLine = lines.split("\n")[0];
        if (firstLine.match(/^#!/)) {
          this.codeContext.shebang = firstLine;
        }
        return expect(this.codeContext.shebangCommand()).toMatch('env');
      });
      return it('returns a command with non-alphabet characters', function() {
        var firstLine, lines;
        lines = "#!/usr/bin/python2.7\nprint 'hello from python!'";
        firstLine = lines.split("\n")[0];
        if (firstLine.match(/^#!/)) {
          this.codeContext.shebang = firstLine;
        }
        return expect(this.codeContext.shebangCommand()).toMatch('python2.7');
      });
    });
    describe('shebangCommandArgs when no shebang was found', function() {
      return it('returns [] when no shebang is found', function() {
        var firstLine, lines;
        lines = this.dummyTextSource.getText();
        firstLine = lines.split("\n")[0];
        if (firstLine.match(/^#!/)) {
          this.codeContext.shebang = firstLine;
        }
        return expect(this.codeContext.shebangCommandArgs()).toMatch([]);
      });
    });
    return describe('shebangCommandArgs when a shebang was found', function() {
      it('returns the command from the shebang', function() {
        var firstLine, lines;
        lines = "#!/bin/bash\necho 'hello from bash!'";
        firstLine = lines.split("\n")[0];
        if (firstLine.match(/^#!/)) {
          this.codeContext.shebang = firstLine;
        }
        return expect(this.codeContext.shebangCommandArgs()).toMatch([]);
      });
      it('returns the true command as the first argument when /usr/bin/env is used', function() {
        var args, firstLine, lines;
        lines = "#!/usr/bin/env ruby -w\nputs 'hello from ruby!'";
        firstLine = lines.split("\n")[0];
        firstLine = lines.split("\n")[0];
        if (firstLine.match(/^#!/)) {
          this.codeContext.shebang = firstLine;
        }
        args = this.codeContext.shebangCommandArgs();
        expect(args[0]).toMatch('ruby');
        return expect(args).toMatch(['ruby', '-w']);
      });
      return it('returns the command args when the command had non-alphabet characters', function() {
        var firstLine, lines;
        lines = "#!/usr/bin/python2.7\nprint 'hello from python!'";
        firstLine = lines.split("\n")[0];
        if (firstLine.match(/^#!/)) {
          this.codeContext.shebang = firstLine;
        }
        return expect(this.codeContext.shebangCommandArgs()).toMatch([]);
      });
    });
  });

}).call(this);
