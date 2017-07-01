(function() {
  var GrammarUtils, _, base, base1, path, ref, ref1, ref2, ref3, ref4, ref5, shell;

  _ = require('underscore');

  path = require('path');

  GrammarUtils = require('../lib/grammar-utils');

  shell = require('electron').shell;

  module.exports = {
    '1C (BSL)': {
      'File Based': {
        command: "oscript",
        args: function(context) {
          return ['-encoding=utf-8', context.filepath];
        }
      }
    },
    Ansible: {
      "File Based": {
        command: "ansible-playbook",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    AppleScript: {
      'Selection Based': {
        command: 'osascript',
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'osascript',
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    AutoHotKey: {
      "File Based": {
        command: "AutoHotKey",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Selection Based": {
        command: "AutoHotKey",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      }
    },
    'Babel ES6 JavaScript': {
      "Selection Based": {
        command: "babel-node",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "babel-node",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'Bash Automated Test System (Bats)': {
      "File Based": {
        command: "bats",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Selection Based": {
        command: 'bats',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      }
    },
    Batch: {
      "File Based": {
        command: "cmd.exe",
        args: function(context) {
          return ['/q', '/c', context.filepath];
        }
      }
    },
    'Behat Feature': {
      "File Based": {
        command: "behat",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Line Number Based": {
        command: "behat",
        args: function(context) {
          return [context.fileColonLine()];
        }
      }
    },
    BuckleScript: {
      "Selection Based": {
        command: "bsc",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return ['-c', tmpFile];
        }
      },
      "File Based": {
        command: "bsc",
        args: function(context) {
          return ['-c', context.filepath];
        }
      }
    },
    C: {
      "File Based": {
        command: "bash",
        args: function(context) {
          var args;
          args = [];
          if (GrammarUtils.OperatingSystem.isDarwin()) {
            args = ['-c', "xcrun clang -fcolor-diagnostics -Wall -include stdio.h '" + context.filepath + "' -o /tmp/c.out && /tmp/c.out"];
          } else if (GrammarUtils.OperatingSystem.isLinux()) {
            args = ["-c", "cc -Wall -include stdio.h '" + context.filepath + "' -o /tmp/c.out && /tmp/c.out"];
          }
          return args;
        }
      },
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var args, code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".c");
          args = [];
          if (GrammarUtils.OperatingSystem.isDarwin()) {
            args = ['-c', "xcrun clang -fcolor-diagnostics -Wall -include stdio.h '" + tmpFile + "' -o /tmp/c.out && /tmp/c.out"];
          } else if (GrammarUtils.OperatingSystem.isLinux()) {
            args = ["-c", "cc -Wall -include stdio.h '" + tmpFile + "' -o /tmp/c.out && /tmp/c.out"];
          }
          return args;
        }
      }
    },
    'C#': {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, progname;
          progname = context.filename.replace(/\.cs$/, "");
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c csc " + context.filepath + " && " + progname + ".exe"];
          } else {
            args = ['-c', "csc " + context.filepath + " && mono " + progname + ".exe"];
          }
          return args;
        }
      },
      "Selection Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, code, progname, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cs");
          progname = tmpFile.replace(/\.cs$/, "");
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c csc /out:" + progname + ".exe " + tmpFile + " && " + progname + ".exe"];
          } else {
            args = ['-c', "csc /out:" + progname + ".exe " + tmpFile + " && mono " + progname + ".exe"];
          }
          return args;
        }
      }
    },
    'C# Script File': {
      "File Based": {
        command: "scriptcs",
        args: function(context) {
          return ['-script', context.filepath];
        }
      },
      "Selection Based": {
        command: "scriptcs",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".csx");
          return ['-script', tmpFile];
        }
      }
    },
    'C++': GrammarUtils.OperatingSystem.isDarwin() ? {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cpp");
          return ["-c", "xcrun clang++ -fcolor-diagnostics -std=c++14 -Wall -include stdio.h -include iostream '" + tmpFile + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "xcrun clang++ -fcolor-diagnostics -std=c++14 -Wall -include stdio.h -include iostream '" + context.filepath + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : GrammarUtils.OperatingSystem.isLinux() ? {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cpp");
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '" + tmpFile + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '" + context.filepath + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : GrammarUtils.OperatingSystem.isWindows() && GrammarUtils.OperatingSystem.release().split(".").slice(-1 >= '14399') ? {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '/mnt/" + path.posix.join.apply(path.posix, [].concat([context.filepath.split(path.win32.sep)[0].toLowerCase()], context.filepath.split(path.win32.sep).slice(1))).replace(":", "") + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : void 0,
    'C++14': GrammarUtils.OperatingSystem.isDarwin() ? {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cpp");
          return ["-c", "xcrun clang++ -fcolor-diagnostics -std=c++14 -Wall -include stdio.h -include iostream '" + tmpFile + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "xcrun clang++ -fcolor-diagnostics -std=c++14 -Wall -include stdio.h -include iostream '" + context.filepath + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : GrammarUtils.OperatingSystem.isLinux() ? {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".cpp");
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '" + tmpFile + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '" + context.filepath + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : GrammarUtils.OperatingSystem.isWindows() && GrammarUtils.OperatingSystem.release().split(".").slice(-1 >= '14399') ? {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ["-c", "g++ -std=c++14 -Wall -include stdio.h -include iostream '/mnt/" + path.posix.join.apply(path.posix, [].concat([context.filepath.split(path.win32.sep)[0].toLowerCase()], context.filepath.split(path.win32.sep).slice(1))).replace(":", "") + "' -o /tmp/cpp.out && /tmp/cpp.out"];
        }
      }
    } : void 0,
    Clojure: {
      "Selection Based": {
        command: "lein",
        args: function(context) {
          return ['exec', '-e', context.getCode()];
        }
      },
      "File Based": {
        command: "lein",
        args: function(context) {
          return ['exec', context.filepath];
        }
      }
    },
    CoffeeScript: {
      "Selection Based": {
        command: "coffee",
        args: function(context) {
          return GrammarUtils.CScompiler.args.concat([context.getCode()]);
        }
      },
      "File Based": {
        command: "coffee",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "CoffeeScript (Literate)": {
      'Selection Based': {
        command: 'coffee',
        args: function(context) {
          return GrammarUtils.CScompiler.args.concat([context.getCode()]);
        }
      },
      'File Based': {
        command: 'coffee',
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Common Lisp": {
      "File Based": {
        command: "clisp",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Crystal: {
      "Selection Based": {
        command: "crystal",
        args: function(context) {
          return ['eval', context.getCode()];
        }
      },
      "File Based": {
        command: "crystal",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    D: {
      "Selection Based": {
        command: "rdmd",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.D.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "rdmd",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Dart: {
      "Selection Based": {
        command: "dart",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".dart");
          return [tmpFile];
        }
      },
      "File Based": {
        command: "dart",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Graphviz (DOT)": {
      "Selection Based": {
        command: "dot",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".dot");
          return ['-Tpng', tmpFile, '-o', tmpFile + '.png'];
        }
      },
      "File Based": {
        command: "dot",
        args: function(context) {
          return ['-Tpng', context.filepath, '-o', context.filepath + '.png'];
        }
      }
    },
    DOT: {
      "Selection Based": {
        command: "dot",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".dot");
          return ['-Tpng', tmpFile, '-o', tmpFile + '.png'];
        }
      },
      "File Based": {
        command: "dot",
        args: function(context) {
          return ['-Tpng', context.filepath, '-o', context.filepath + '.png'];
        }
      }
    },
    Elixir: {
      "Selection Based": {
        command: "elixir",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "elixir",
        args: function(context) {
          return ['-r', context.filepath];
        }
      }
    },
    Erlang: {
      "Selection Based": {
        command: "erl",
        args: function(context) {
          return ['-noshell', '-eval', (context.getCode()) + ", init:stop()."];
        }
      }
    },
    'F#': {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "fsi" : "fsharpi",
        args: function(context) {
          return ['--exec', context.filepath];
        }
      }
    },
    'F*': {
      "File Based": {
        command: "fstar",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Fable: {
      "Selection Based": {
        command: "fable",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "fable",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Forth: {
      "File Based": {
        command: "gforth",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Fortran - Fixed Form": {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "gfortran '" + context.filepath + "' -ffixed-form -o /tmp/f.out && /tmp/f.out"];
        }
      }
    },
    "Fortran - Free Form": {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "gfortran '" + context.filepath + "' -ffree-form -o /tmp/f90.out && /tmp/f90.out"];
        }
      }
    },
    "Fortran - Modern": {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "gfortran '" + context.filepath + "' -ffree-form -o /tmp/f90.out && /tmp/f90.out"];
        }
      }
    },
    "Fortran - Punchcard": {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "gfortran '" + context.filepath + "' -ffixed-form -o /tmp/f.out && /tmp/f.out"];
        }
      }
    },
    Gherkin: {
      "File Based": {
        command: "cucumber",
        args: function(context) {
          return ['--color', context.filepath];
        }
      },
      "Line Number Based": {
        command: "cucumber",
        args: function(context) {
          return ['--color', context.fileColonLine()];
        }
      }
    },
    gnuplot: {
      "File Based": {
        command: "gnuplot",
        args: function(context) {
          return ['-p', context.filepath];
        },
        workingDirectory: (ref = atom.workspace.getActivePaneItem()) != null ? (ref1 = ref.buffer) != null ? (ref2 = ref1.file) != null ? typeof ref2.getParent === "function" ? typeof (base = ref2.getParent()).getPath === "function" ? base.getPath() : void 0 : void 0 : void 0 : void 0 : void 0
      }
    },
    Go: {
      "File Based": {
        command: "go",
        args: function(context) {
          if (context.filepath.match(/_test.go/)) {
            return ['test', ''];
          } else {
            return ['run', context.filepath];
          }
        },
        workingDirectory: (ref3 = atom.workspace.getActivePaneItem()) != null ? (ref4 = ref3.buffer) != null ? (ref5 = ref4.file) != null ? typeof ref5.getParent === "function" ? typeof (base1 = ref5.getParent()).getPath === "function" ? base1.getPath() : void 0 : void 0 : void 0 : void 0 : void 0
      }
    },
    Groovy: {
      "Selection Based": {
        command: "groovy",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "groovy",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Haskell: {
      "File Based": {
        command: "runhaskell",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Selection Based": {
        command: "ghc",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      }
    },
    Hy: {
      "File Based": {
        command: "hy",
        args: function(context) {
          return [context.filepath];
        }
      },
      "Selection Based": {
        command: "hy",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".hy");
          return [tmpFile];
        }
      }
    },
    IcedCoffeeScript: {
      "Selection Based": {
        command: "iced",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "iced",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Idris: {
      "File Based": {
        command: "idris",
        args: function(context) {
          return [context.filepath, '-o', path.basename(context.filepath, path.extname(context.filepath))];
        }
      }
    },
    InnoSetup: {
      "File Based": {
        command: "ISCC.exe",
        args: function(context) {
          return ['/Q', context.filepath];
        }
      }
    },
    ioLanguage: {
      "Selection Based": {
        command: "io",
        args: function(context) {
          return [context.getCode()];
        }
      },
      "File Based": {
        command: "io",
        args: function(context) {
          return ['-e', context.filepath];
        }
      }
    },
    Java: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, className, classPackages, sourcePath;
          className = GrammarUtils.Java.getClassName(context);
          classPackages = GrammarUtils.Java.getClassPackage(context);
          sourcePath = GrammarUtils.Java.getProjectPath(context);
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c javac -Xlint " + context.filename + " && java " + className];
          } else {
            args = ['-c', "javac -sourcepath " + sourcePath + " -d /tmp '" + context.filepath + "' && java -cp /tmp " + classPackages + className];
          }
          return args;
        }
      }
    },
    JavaScript: {
      "Selection Based": {
        command: "node",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "node",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'JavaScript with JSX': {
      "Selection Based": {
        command: "node",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "node",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "JavaScript for Automation (JXA)": {
      "Selection Based": {
        command: "osascript",
        args: function(context) {
          return ['-l', 'JavaScript', '-e', context.getCode()];
        }
      },
      "File Based": {
        command: "osascript",
        args: function(context) {
          return ['-l', 'JavaScript', context.filepath];
        }
      }
    },
    Jolie: {
      "File Based": {
        command: "jolie",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Julia: {
      "Selection Based": {
        command: "julia",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "julia",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Kotlin: {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          var args, code, jarName, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".kt");
          jarName = tmpFile.replace(/\.kt$/, ".jar");
          args = ['-c', "kotlinc " + tmpFile + " -include-runtime -d " + jarName + " && java -jar " + jarName];
          return args;
        }
      },
      "File Based": {
        command: "bash",
        args: function(context) {
          var args, jarName;
          jarName = context.filename.replace(/\.kt$/, ".jar");
          args = ['-c', "kotlinc " + context.filepath + " -include-runtime -d /tmp/" + jarName + " && java -jar /tmp/" + jarName];
          return args;
        }
      }
    },
    LAMMPS: GrammarUtils.OperatingSystem.isDarwin() || GrammarUtils.OperatingSystem.isLinux() ? {
      "File Based": {
        command: "lammps",
        args: function(context) {
          return ['-log', 'none', '-in', context.filepath];
        }
      }
    } : void 0,
    LaTeX: {
      "File Based": {
        command: "latexmk",
        args: function(context) {
          return ['-cd', '-quiet', '-pdf', '-pv', '-shell-escape', context.filepath];
        }
      }
    },
    'LaTeX Beamer': {
      "File Based": {
        command: "latexmk",
        args: function(context) {
          return ['-cd', '-quiet', '-pdf', '-pv', '-shell-escape', context.filepath];
        }
      }
    },
    LilyPond: {
      "File Based": {
        command: "lilypond",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Lisp: {
      "Selection Based": {
        command: "sbcl",
        args: function(context) {
          var args, statements;
          statements = _.flatten(_.map(GrammarUtils.Lisp.splitStatements(context.getCode()), function(statement) {
            return ['--eval', statement];
          }));
          args = _.union(['--noinform', '--disable-debugger', '--non-interactive', '--quit'], statements);
          return args;
        }
      },
      "File Based": {
        command: "sbcl",
        args: function(context) {
          return ['--noinform', '--script', context.filepath];
        }
      }
    },
    'Literate Haskell': {
      "File Based": {
        command: "runhaskell",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    LiveScript: {
      "Selection Based": {
        command: "lsc",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "lsc",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Lua: {
      "Selection Based": {
        command: "lua",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "lua",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'Lua (WoW)': {
      "Selection Based": {
        command: "lua",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "lua",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Makefile: {
      "Selection Based": {
        command: "bash",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "make",
        args: function(context) {
          return ['-f', context.filepath];
        }
      }
    },
    MagicPython: {
      "Selection Based": {
        command: "python",
        args: function(context) {
          return ['-u', '-c', context.getCode()];
        }
      },
      "File Based": {
        command: "python",
        args: function(context) {
          return ['-u', context.filepath];
        }
      }
    },
    MATLAB: {
      "Selection Based": {
        command: "matlab",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.MATLAB.createTempFileWithCode(code);
          return ['-nodesktop', '-nosplash', '-r', "try, run('" + tmpFile + "');while ~isempty(get(0,'Children')); pause(0.5); end; catch ME; disp(ME.message); exit(1); end; exit(0);"];
        }
      },
      "File Based": {
        command: "matlab",
        args: function(context) {
          return ['-nodesktop', '-nosplash', '-r', "try run('" + context.filepath + "');while ~isempty(get(0,'Children')); pause(0.5); end; catch ME; disp(ME.message); exit(1); end; exit(0);"];
        }
      }
    },
    'MIPS Assembler': {
      "File Based": {
        command: "spim",
        args: function(context) {
          return ['-f', context.filepath];
        }
      }
    },
    MoonScript: {
      "Selection Based": {
        command: "moon",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "moon",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'mongoDB (JavaScript)': {
      "Selection Based": {
        command: "mongo",
        args: function(context) {
          return ['--eval', context.getCode()];
        }
      },
      "File Based": {
        command: "mongo",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    NCL: {
      "Selection Based": {
        command: "ncl",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          code = code + "\nexit";
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "ncl",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    newLISP: {
      "Selection Based": {
        command: "newlisp",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "newlisp",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Nim: {
      "File Based": {
        command: "bash",
        args: function(context) {
          var file;
          file = GrammarUtils.Nim.findNimProjectFile(context.filepath);
          path = GrammarUtils.Nim.projectDir(context.filepath);
          return ['-c', 'cd "' + path + '" && nim c --hints:off --parallelBuild:1 -r "' + file + '" 2>&1'];
        }
      }
    },
    NSIS: {
      "Selection Based": {
        command: "makensis",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "makensis",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'Objective-C': GrammarUtils.OperatingSystem.isDarwin() ? {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "xcrun clang -fcolor-diagnostics -Wall -include stdio.h -framework Cocoa " + context.filepath + " -o /tmp/objc-c.out && /tmp/objc-c.out"];
        }
      }
    } : void 0,
    'Objective-C++': GrammarUtils.OperatingSystem.isDarwin() ? {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', "xcrun clang++ -fcolor-diagnostics -Wc++11-extensions -Wall -include stdio.h -include iostream -framework Cocoa " + context.filepath + " -o /tmp/objc-cpp.out && /tmp/objc-cpp.out"];
        }
      }
    } : void 0,
    OCaml: {
      "File Based": {
        command: "ocaml",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Octave: {
      "Selection Based": {
        command: "octave",
        args: function(context) {
          return ['-p', context.filepath.replace(/[^\/]*$/, ''), '--eval', context.getCode()];
        }
      },
      "File Based": {
        command: "octave",
        args: function(context) {
          return ['-p', context.filepath.replace(/[^\/]*$/, ''), context.filepath];
        }
      }
    },
    Oz: {
      "Selection Based": {
        command: "ozc",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return ['-c', tmpFile];
        }
      },
      "File Based": {
        command: "ozc",
        args: function(context) {
          return ['-c', context.filepath];
        }
      }
    },
    'Pandoc Markdown': {
      "File Based": {
        command: "panzer",
        args: function(context) {
          return [context.filepath, "--output=" + context.filepath + ".pdf"];
        }
      }
    },
    Perl: {
      "Selection Based": {
        command: "perl",
        args: function(context) {
          var code, file;
          code = context.getCode();
          file = GrammarUtils.Perl.createTempFileWithCode(code);
          return [file];
        }
      },
      "File Based": {
        command: "perl",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Perl 6": {
      "Selection Based": {
        command: "perl6",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "perl6",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Perl 6 FE": {
      "Selection Based": {
        command: "perl6",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "perl6",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    PHP: {
      "Selection Based": {
        command: "php",
        args: function(context) {
          var code, file;
          code = context.getCode();
          file = GrammarUtils.PHP.createTempFileWithCode(code);
          return [file];
        }
      },
      "File Based": {
        command: "php",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    PowerShell: {
      "Selection Based": {
        command: "powershell",
        args: function(context) {
          return [context.getCode()];
        }
      },
      "File Based": {
        command: "powershell",
        args: function(context) {
          return [context.filepath.replace(/\ /g, "` ")];
        }
      }
    },
    Processing: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          if (GrammarUtils.OperatingSystem.isWindows()) {
            return ['/c processing-java --sketch=' + context.filepath.replace("\\" + context.filename, "") + ' --run'];
          } else {
            return ['-c', 'processing-java --sketch=' + context.filepath.replace("/" + context.filename, "") + ' --run'];
          }
        }
      }
    },
    Prolog: {
      "File Based": {
        command: "bash",
        args: function(context) {
          return ['-c', 'cd \"' + context.filepath.replace(/[^\/]*$/, '') + '\"; swipl -f \"' + context.filepath + '\" -t main --quiet'];
        }
      }
    },
    PureScript: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          if (GrammarUtils.OperatingSystem.isWindows()) {
            return ['/c cd "' + context.filepath.replace(/[^\/]*$/, '') + '" && pulp run'];
          } else {
            return ['-c', 'cd "' + context.filepath.replace(/[^\/]*$/, '') + '" && pulp run'];
          }
        }
      }
    },
    Python: {
      "Selection Based": {
        command: "python",
        args: function(context) {
          return ['-u', '-c', context.getCode()];
        }
      },
      "File Based": {
        command: "python",
        args: function(context) {
          return ['-u', context.filepath];
        }
      }
    },
    R: {
      "Selection Based": {
        command: "Rscript",
        args: function(context) {
          var code, file;
          code = context.getCode();
          file = GrammarUtils.R.createTempFileWithCode(code);
          return [file];
        }
      },
      "File Based": {
        command: "Rscript",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Racket: {
      "Selection Based": {
        command: "racket",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "racket",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    RANT: {
      "Selection Based": {
        command: "RantConsole.exe",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode(true);
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return ['-file', tmpFile];
        }
      },
      "File Based": {
        command: "RantConsole.exe",
        args: function(context) {
          return ['-file', context.filepath];
        }
      }
    },
    Reason: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, progname;
          progname = context.filename.replace(/\.re$/, "");
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c rebuild " + progname + ".native && " + progname + ".native"];
          } else {
            args = ['-c', "rebuild '" + progname + ".native' && '" + progname + ".native'"];
          }
          return args;
        }
      }
    },
    "Ren'Py": {
      "File Based": {
        command: "renpy",
        args: function(context) {
          return [context.filepath.substr(0, context.filepath.lastIndexOf("/game"))];
        }
      }
    },
    'Robot Framework': {
      "File Based": {
        command: 'robot',
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    RSpec: {
      "Selection Based": {
        command: "ruby",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "rspec",
        args: function(context) {
          return ['--tty', '--color', context.filepath];
        }
      },
      "Line Number Based": {
        command: "rspec",
        args: function(context) {
          return ['--tty', '--color', context.fileColonLine()];
        }
      }
    },
    Ruby: {
      "Selection Based": {
        command: "ruby",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "ruby",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    'Ruby on Rails': {
      "Selection Based": {
        command: "rails",
        args: function(context) {
          return ['runner', context.getCode()];
        }
      },
      "File Based": {
        command: "rails",
        args: function(context) {
          return ['runner', context.filepath];
        }
      }
    },
    Rust: {
      "File Based": {
        command: GrammarUtils.OperatingSystem.isWindows() ? "cmd" : "bash",
        args: function(context) {
          var args, progname;
          progname = context.filename.replace(/\.rs$/, "");
          args = [];
          if (GrammarUtils.OperatingSystem.isWindows()) {
            args = ["/c rustc " + context.filepath + " && " + progname + ".exe"];
          } else {
            args = ['-c', "rustc '" + context.filepath + "' -o /tmp/rs.out && /tmp/rs.out"];
          }
          return args;
        }
      }
    },
    Sage: {
      "Selection Based": {
        command: "sage",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "sage",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Sass: {
      "File Based": {
        command: "sass",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Scala: {
      "Selection Based": {
        command: "scala",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "scala",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Scheme: {
      "Selection Based": {
        command: "guile",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "guile",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    SCSS: {
      "File Based": {
        command: "sass",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Shell Script": {
      "Selection Based": {
        command: process.env.SHELL,
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: process.env.SHELL,
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "Shell Script (Fish)": {
      "Selection Based": {
        command: "fish",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "fish",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    "SQL": {
      "Selection Based": {
        command: "echo",
        args: function(context) {
          return ['SQL requires setting \'Script: Run Options\' directly. See https://github.com/rgbkrk/atom-script/tree/master/examples/hello.sql for further information.'];
        }
      },
      "File Based": {
        command: "echo",
        args: function(context) {
          return ['SQL requires setting \'Script: Run Options\' directly. See https://github.com/rgbkrk/atom-script/tree/master/examples/hello.sql for further information.'];
        }
      }
    },
    "SQL (PostgreSQL)": {
      "Selection Based": {
        command: "psql",
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      "File Based": {
        command: "psql",
        args: function(context) {
          return ['-f', context.filepath];
        }
      }
    },
    "Standard ML": {
      "File Based": {
        command: "sml",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Stata: {
      "Selection Based": {
        command: "stata",
        args: function(context) {
          return ['do', context.getCode()];
        }
      },
      "File Based": {
        command: "stata",
        args: function(context) {
          return ['do', context.filepath];
        }
      }
    },
    Swift: {
      "File Based": {
        command: "swift",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Tcl: {
      "Selection Based": {
        command: "tclsh",
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      "File Based": {
        command: "tclsh",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    Turing: {
      "File Based": {
        command: "turing",
        args: function(context) {
          return ['-run', context.filepath];
        }
      }
    },
    TypeScript: {
      "Selection Based": {
        command: "ts-node",
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      "File Based": {
        command: "ts-node",
        args: function(context) {
          return [context.filepath];
        }
      }
    },
    VBScript: {
      'Selection Based': {
        command: 'cscript',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code, ".vbs");
          return ['//NOLOGO', tmpFile];
        }
      },
      'File Based': {
        command: 'cscript',
        args: function(context) {
          return ['//NOLOGO', context.filepath];
        }
      }
    },
    HTML: {
      "File Based": {
        command: 'echo',
        args: function(context) {
          var uri;
          uri = 'file://' + context.filepath;
          shell.openExternal(uri);
          return ['HTML file opened at:', uri];
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2dyYW1tYXJzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSOztFQUNmLEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUixDQUFtQixDQUFDOztFQUU1QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsVUFBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFNBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsaUJBQUQsRUFBb0IsT0FBTyxDQUFDLFFBQTVCO1FBQWIsQ0FETjtPQURGO0tBREY7SUFLQSxPQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsa0JBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BREY7S0FORjtJQVVBLFdBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsV0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFdBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0FYRjtJQWtCQSxVQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsWUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FERjtNQUdBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsWUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCO1VBQ1AsT0FBQSxHQUFVLFlBQVksQ0FBQyxzQkFBYixDQUFvQyxJQUFwQztpQkFDVixDQUFDLE9BQUQ7UUFISSxDQUROO09BSkY7S0FuQkY7SUE2QkEsc0JBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsWUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWIsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFlBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0E5QkY7SUFxQ0EsbUNBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQURGO01BR0EsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDO2lCQUNWLENBQUMsT0FBRDtRQUhJLENBRE47T0FKRjtLQXRDRjtJQWdEQSxLQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE9BQU8sQ0FBQyxRQUFyQjtRQUFiLENBRE47T0FERjtLQWpERjtJQXFEQSxlQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FERjtNQUdBLG1CQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsYUFBUixDQUFBLENBQUQ7UUFBYixDQUROO09BSkY7S0F0REY7SUE2REEsWUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQTtVQUNQLE9BQUEsR0FBVSxZQUFZLENBQUMsc0JBQWIsQ0FBb0MsSUFBcEM7aUJBQ1YsQ0FBQyxJQUFELEVBQU8sT0FBUDtRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBZjtRQUFiLENBRE47T0FQRjtLQTlERjtJQXdFQSxDQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPO1VBQ1AsSUFBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQTdCLENBQUEsQ0FBSDtZQUNFLElBQUEsR0FBTyxDQUFDLElBQUQsRUFBTywwREFBQSxHQUE2RCxPQUFPLENBQUMsUUFBckUsR0FBZ0YsK0JBQXZGLEVBRFQ7V0FBQSxNQUVLLElBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUE3QixDQUFBLENBQUg7WUFDSCxJQUFBLEdBQU8sQ0FBQyxJQUFELEVBQU8sNkJBQUEsR0FBZ0MsT0FBTyxDQUFDLFFBQXhDLEdBQW1ELCtCQUExRCxFQURKOztBQUVMLGlCQUFPO1FBTkgsQ0FETjtPQURGO01BU0EsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDLEVBQTBDLElBQTFDO1VBQ1YsSUFBQSxHQUFPO1VBQ1AsSUFBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQTdCLENBQUEsQ0FBSDtZQUNFLElBQUEsR0FBTyxDQUFDLElBQUQsRUFBTywwREFBQSxHQUE2RCxPQUE3RCxHQUF1RSwrQkFBOUUsRUFEVDtXQUFBLE1BRUssSUFBRyxZQUFZLENBQUMsZUFBZSxDQUFDLE9BQTdCLENBQUEsQ0FBSDtZQUNILElBQUEsR0FBTyxDQUFDLElBQUQsRUFBTyw2QkFBQSxHQUFnQyxPQUFoQyxHQUEwQywrQkFBakQsRUFESjs7QUFFTCxpQkFBTztRQVJILENBRE47T0FWRjtLQXpFRjtJQThGQSxJQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVksWUFBWSxDQUFDLGVBQWUsQ0FBQyxTQUE3QixDQUFBLENBQUgsR0FBaUQsS0FBakQsR0FBNEQsTUFBckU7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLFFBQUEsR0FBVyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQWpCLENBQXlCLE9BQXpCLEVBQWtDLEVBQWxDO1VBQ1gsSUFBQSxHQUFPO1VBQ1AsSUFBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUEsQ0FBSDtZQUNFLElBQUEsR0FBTyxDQUFDLFNBQUEsR0FBVSxPQUFPLENBQUMsUUFBbEIsR0FBMkIsTUFBM0IsR0FBaUMsUUFBakMsR0FBMEMsTUFBM0MsRUFEVDtXQUFBLE1BQUE7WUFHRSxJQUFBLEdBQU8sQ0FBQyxJQUFELEVBQU8sTUFBQSxHQUFPLE9BQU8sQ0FBQyxRQUFmLEdBQXdCLFdBQXhCLEdBQW1DLFFBQW5DLEdBQTRDLE1BQW5ELEVBSFQ7O0FBSUEsaUJBQU87UUFQSCxDQUROO09BREY7TUFVQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFZLFlBQVksQ0FBQyxlQUFlLENBQUMsU0FBN0IsQ0FBQSxDQUFILEdBQWlELEtBQWpELEdBQTRELE1BQXJFO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDLEVBQTBDLEtBQTFDO1VBQ1YsUUFBQSxHQUFXLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQWhCLEVBQXlCLEVBQXpCO1VBQ1gsSUFBQSxHQUFPO1VBQ1AsSUFBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUEsQ0FBSDtZQUNFLElBQUEsR0FBTyxDQUFDLGNBQUEsR0FBZSxRQUFmLEdBQXdCLE9BQXhCLEdBQStCLE9BQS9CLEdBQXVDLE1BQXZDLEdBQTZDLFFBQTdDLEdBQXNELE1BQXZELEVBRFQ7V0FBQSxNQUFBO1lBR0UsSUFBQSxHQUFPLENBQUMsSUFBRCxFQUFPLFdBQUEsR0FBWSxRQUFaLEdBQXFCLE9BQXJCLEdBQTRCLE9BQTVCLEdBQW9DLFdBQXBDLEdBQStDLFFBQS9DLEdBQXdELE1BQS9ELEVBSFQ7O0FBSUEsaUJBQU87UUFUSCxDQUROO09BWEY7S0EvRkY7SUFzSEEsZ0JBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxVQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLFNBQUQsRUFBWSxPQUFPLENBQUMsUUFBcEI7UUFBYixDQUROO09BREY7TUFHQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFVBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQjtVQUNQLE9BQUEsR0FBVSxZQUFZLENBQUMsc0JBQWIsQ0FBb0MsSUFBcEMsRUFBMEMsTUFBMUM7aUJBQ1YsQ0FBQyxTQUFELEVBQVksT0FBWjtRQUhJLENBRE47T0FKRjtLQXZIRjtJQWlJQSxLQUFBLEVBQ0ssWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUE3QixDQUFBLENBQUgsR0FDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCO1VBQ1AsT0FBQSxHQUFVLFlBQVksQ0FBQyxzQkFBYixDQUFvQyxJQUFwQyxFQUEwQyxNQUExQztpQkFDVixDQUFDLElBQUQsRUFBTyx5RkFBQSxHQUE0RixPQUE1RixHQUFzRyxtQ0FBN0c7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8seUZBQUEsR0FBNEYsT0FBTyxDQUFDLFFBQXBHLEdBQStHLG1DQUF0SDtRQUFiLENBRE47T0FQRjtLQURGLEdBVVEsWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUE3QixDQUFBLENBQUgsR0FDSDtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCO1VBQ1AsT0FBQSxHQUFVLFlBQVksQ0FBQyxzQkFBYixDQUFvQyxJQUFwQyxFQUEwQyxNQUExQztpQkFDVixDQUFDLElBQUQsRUFBTywyREFBQSxHQUE4RCxPQUE5RCxHQUF3RSxtQ0FBL0U7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sMkRBQUEsR0FBOEQsT0FBTyxDQUFDLFFBQXRFLEdBQWlGLG1DQUF4RjtRQUFiLENBRE47T0FQRjtLQURHLEdBVUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxTQUE3QixDQUFBLENBQUEsSUFBNkMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUE3QixDQUFBLENBQXNDLENBQUMsS0FBdkMsQ0FBNkMsR0FBN0MsQ0FBaUQsQ0FBQyxLQUFsRCxDQUF3RCxDQUFDLENBQUQsSUFBTSxPQUE5RCxDQUFoRCxHQUNIO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLGdFQUFBLEdBQW1FLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQWhCLENBQXNCLElBQUksQ0FBQyxLQUEzQixFQUFrQyxFQUFFLENBQUMsTUFBSCxDQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFqQixDQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQWxDLENBQXVDLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBMUMsQ0FBQSxDQUFELENBQVYsRUFBcUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFqQixDQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQWxDLENBQXNDLENBQUMsS0FBdkMsQ0FBNkMsQ0FBN0MsQ0FBckUsQ0FBbEMsQ0FBd0osQ0FBQyxPQUF6SixDQUFpSyxHQUFqSyxFQUFzSyxFQUF0SyxDQUFuRSxHQUErTyxtQ0FBdFA7UUFBYixDQUROO09BREY7S0FERyxHQUFBLE1BdEpQO0lBMkpBLE9BQUEsRUFDSyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQTdCLENBQUEsQ0FBSCxHQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDLEVBQTBDLE1BQTFDO2lCQUNWLENBQUMsSUFBRCxFQUFPLHlGQUFBLEdBQTRGLE9BQTVGLEdBQXNHLG1DQUE3RztRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyx5RkFBQSxHQUE0RixPQUFPLENBQUMsUUFBcEcsR0FBK0csbUNBQXRIO1FBQWIsQ0FETjtPQVBGO0tBREYsR0FVUSxZQUFZLENBQUMsZUFBZSxDQUFDLE9BQTdCLENBQUEsQ0FBSCxHQUNIO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDLEVBQTBDLE1BQTFDO2lCQUNWLENBQUMsSUFBRCxFQUFPLDJEQUFBLEdBQThELE9BQTlELEdBQXdFLG1DQUEvRTtRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTywyREFBQSxHQUE4RCxPQUFPLENBQUMsUUFBdEUsR0FBaUYsbUNBQXhGO1FBQWIsQ0FETjtPQVBGO0tBREcsR0FVRyxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUEsQ0FBQSxJQUE2QyxZQUFZLENBQUMsZUFBZSxDQUFDLE9BQTdCLENBQUEsQ0FBc0MsQ0FBQyxLQUF2QyxDQUE2QyxHQUE3QyxDQUFpRCxDQUFDLEtBQWxELENBQXdELENBQUMsQ0FBRCxJQUFNLE9BQTlELENBQWhELEdBQ0g7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sZ0VBQUEsR0FBbUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBaEIsQ0FBc0IsSUFBSSxDQUFDLEtBQTNCLEVBQWtDLEVBQUUsQ0FBQyxNQUFILENBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQWpCLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBbEMsQ0FBdUMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUExQyxDQUFBLENBQUQsQ0FBVixFQUFxRSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQWpCLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBbEMsQ0FBc0MsQ0FBQyxLQUF2QyxDQUE2QyxDQUE3QyxDQUFyRSxDQUFsQyxDQUF3SixDQUFDLE9BQXpKLENBQWlLLEdBQWpLLEVBQXNLLEVBQXRLLENBQW5FLEdBQStPLG1DQUF0UDtRQUFiLENBRE47T0FERjtLQURHLEdBQUEsTUFoTFA7SUFxTEEsT0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYyxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFmO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsTUFBRCxFQUFTLE9BQU8sQ0FBQyxRQUFqQjtRQUFiLENBRE47T0FKRjtLQXRMRjtJQTZMQSxZQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFFBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQTdCLENBQW9DLENBQUMsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFELENBQXBDO1FBQWIsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFFBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0E5TEY7SUFxTUEseUJBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBN0IsQ0FBb0MsQ0FBQyxPQUFPLENBQUMsT0FBUixDQUFBLENBQUQsQ0FBcEM7UUFBYixDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FKRjtLQXRNRjtJQTZNQSxhQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FERjtLQTlNRjtJQWtOQSxPQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFNBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFjLENBQUMsTUFBRCxFQUFTLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBVDtRQUFkLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxTQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQUpGO0tBbk5GO0lBME5BLENBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCO1VBQ1AsT0FBQSxHQUFVLFlBQVksQ0FBQyxDQUFDLENBQUMsc0JBQWYsQ0FBc0MsSUFBdEM7aUJBQ1YsQ0FBQyxPQUFEO1FBSEksQ0FETjtPQURGO01BTUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BUEY7S0EzTkY7SUFxT0EsSUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDLEVBQTBDLE9BQTFDO2lCQUNWLENBQUMsT0FBRDtRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQVBGO0tBdE9GO0lBZ1BBLGdCQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLEtBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQjtVQUNQLE9BQUEsR0FBVSxZQUFZLENBQUMsc0JBQWIsQ0FBb0MsSUFBcEMsRUFBMEMsTUFBMUM7aUJBQ1YsQ0FBQyxPQUFELEVBQVUsT0FBVixFQUFtQixJQUFuQixFQUF5QixPQUFBLEdBQVUsTUFBbkM7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsS0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFELEVBQVUsT0FBTyxDQUFDLFFBQWxCLEVBQTRCLElBQTVCLEVBQWtDLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLE1BQXJEO1FBQWIsQ0FETjtPQVBGO0tBalBGO0lBMFBBLEdBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsS0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCO1VBQ1AsT0FBQSxHQUFVLFlBQVksQ0FBQyxzQkFBYixDQUFvQyxJQUFwQyxFQUEwQyxNQUExQztpQkFDVixDQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLElBQW5CLEVBQXlCLE9BQUEsR0FBVSxNQUFuQztRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQUQsRUFBVSxPQUFPLENBQUMsUUFBbEIsRUFBNEIsSUFBNUIsRUFBa0MsT0FBTyxDQUFDLFFBQVIsR0FBbUIsTUFBckQ7UUFBYixDQUROO09BUEY7S0EzUEY7SUFxUUEsTUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxRQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYyxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLENBQVA7UUFBZCxDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLFFBQWY7UUFBYixDQUROO09BSkY7S0F0UUY7SUE2UUEsTUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYyxDQUFDLFVBQUQsRUFBYSxPQUFiLEVBQXdCLENBQUMsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFELENBQUEsR0FBbUIsZ0JBQTNDO1FBQWQsQ0FETjtPQURGO0tBOVFGO0lBa1JBLElBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBWSxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUEsQ0FBSCxHQUFpRCxLQUFqRCxHQUE0RCxTQUFyRTtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxRQUFELEVBQVcsT0FBTyxDQUFDLFFBQW5CO1FBQWIsQ0FETjtPQURGO0tBblJGO0lBdVJBLElBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQURGO0tBeFJGO0lBNFJBLEtBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUE7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDO2lCQUNWLENBQUMsT0FBRDtRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQVBGO0tBN1JGO0lBdVNBLEtBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxRQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQURGO0tBeFNGO0lBNFNBLHNCQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sWUFBQSxHQUFlLE9BQU8sQ0FBQyxRQUF2QixHQUFrQyw0Q0FBekM7UUFBYixDQUROO09BREY7S0E3U0Y7SUFpVEEscUJBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxZQUFBLEdBQWUsT0FBTyxDQUFDLFFBQXZCLEdBQWtDLCtDQUF6QztRQUFiLENBRE47T0FERjtLQWxURjtJQXNUQSxrQkFBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLFlBQUEsR0FBZSxPQUFPLENBQUMsUUFBdkIsR0FBa0MsK0NBQXpDO1FBQWIsQ0FETjtPQURGO0tBdlRGO0lBMlRBLHFCQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sWUFBQSxHQUFlLE9BQU8sQ0FBQyxRQUF2QixHQUFrQyw0Q0FBekM7UUFBYixDQUROO09BREY7S0E1VEY7SUFnVUEsT0FBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFVBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsU0FBRCxFQUFZLE9BQU8sQ0FBQyxRQUFwQjtRQUFiLENBRE47T0FERjtNQUdBLG1CQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsVUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxTQUFELEVBQVksT0FBTyxDQUFDLGFBQVIsQ0FBQSxDQUFaO1FBQWIsQ0FETjtPQUpGO0tBalVGO0lBd1VBLE9BQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxTQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBZjtRQUFiLENBRE47UUFFQSxnQkFBQSx1TkFBZ0YsQ0FBQyxzREFGakY7T0FERjtLQXpVRjtJQThVQSxFQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsSUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7VUFDSixJQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBakIsQ0FBdUIsVUFBdkIsQ0FBSDttQkFBMkMsQ0FBQyxNQUFELEVBQVMsRUFBVCxFQUEzQztXQUFBLE1BQUE7bUJBQ0ssQ0FBQyxLQUFELEVBQVEsT0FBTyxDQUFDLFFBQWhCLEVBREw7O1FBREksQ0FETjtRQUlBLGdCQUFBLDJOQUFnRixDQUFDLHNEQUpqRjtPQURGO0tBL1VGO0lBc1ZBLE1BQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFFBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0F2VkY7SUE4VkEsT0FBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFlBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BREY7TUFHQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLEtBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFjLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBUDtRQUFkLENBRE47T0FKRjtLQS9WRjtJQXNXQSxFQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsSUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FERjtNQUdBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsSUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCO1VBQ1AsT0FBQSxHQUFVLFlBQVksQ0FBQyxzQkFBYixDQUFvQyxJQUFwQyxFQUEwQyxLQUExQztpQkFDVixDQUFDLE9BQUQ7UUFISSxDQUROO09BSkY7S0F2V0Y7SUFpWEEsZ0JBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0FsWEY7SUF5WEEsS0FBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQsRUFBbUIsSUFBbkIsRUFBeUIsSUFBSSxDQUFDLFFBQUwsQ0FBYyxPQUFPLENBQUMsUUFBdEIsRUFBZ0MsSUFBSSxDQUFDLE9BQUwsQ0FBYSxPQUFPLENBQUMsUUFBckIsQ0FBaEMsQ0FBekI7UUFBYixDQUROO09BREY7S0ExWEY7SUE4WEEsU0FBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFVBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxRQUFmO1FBQWIsQ0FETjtPQURGO0tBL1hGO0lBbVlBLFVBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsSUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsT0FBUixDQUFBLENBQUQ7UUFBYixDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsSUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLFFBQWY7UUFBYixDQUROO09BSkY7S0FwWUY7SUEyWUEsSUFBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFZLFlBQVksQ0FBQyxlQUFlLENBQUMsU0FBN0IsQ0FBQSxDQUFILEdBQWlELEtBQWpELEdBQTRELE1BQXJFO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxTQUFBLEdBQVksWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFsQixDQUErQixPQUEvQjtVQUNaLGFBQUEsR0FBZ0IsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFsQixDQUFrQyxPQUFsQztVQUNoQixVQUFBLEdBQWEsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFsQixDQUFpQyxPQUFqQztVQUViLElBQUEsR0FBTztVQUNQLElBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxTQUE3QixDQUFBLENBQUg7WUFDRSxJQUFBLEdBQU8sQ0FBQyxrQkFBQSxHQUFtQixPQUFPLENBQUMsUUFBM0IsR0FBb0MsV0FBcEMsR0FBK0MsU0FBaEQsRUFEVDtXQUFBLE1BQUE7WUFHRSxJQUFBLEdBQU8sQ0FBQyxJQUFELEVBQU8sb0JBQUEsR0FBcUIsVUFBckIsR0FBZ0MsWUFBaEMsR0FBNEMsT0FBTyxDQUFDLFFBQXBELEdBQTZELHFCQUE3RCxHQUFrRixhQUFsRixHQUFrRyxTQUF6RyxFQUhUOztBQUtBLGlCQUFPO1FBWEgsQ0FETjtPQURGO0tBNVlGO0lBMlpBLFVBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0E1WkY7SUFtYUEscUJBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0FwYUY7SUEyYUEsaUNBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsV0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sWUFBUCxFQUFxQixJQUFyQixFQUEyQixPQUFPLENBQUMsT0FBUixDQUFBLENBQTNCO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFdBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLFlBQVAsRUFBcUIsT0FBTyxDQUFDLFFBQTdCO1FBQWIsQ0FETjtPQUpGO0tBNWFGO0lBbWJBLEtBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQURGO0tBcGJGO0lBd2JBLEtBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0F6YkY7SUFnY0EsTUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDLEVBQTBDLEtBQTFDO1VBQ1YsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQWhCLEVBQXlCLE1BQXpCO1VBQ1YsSUFBQSxHQUFPLENBQUMsSUFBRCxFQUFPLFVBQUEsR0FBVyxPQUFYLEdBQW1CLHVCQUFuQixHQUEwQyxPQUExQyxHQUFrRCxnQkFBbEQsR0FBa0UsT0FBekU7QUFDUCxpQkFBTztRQUxILENBRE47T0FERjtNQVFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFqQixDQUF5QixPQUF6QixFQUFrQyxNQUFsQztVQUNWLElBQUEsR0FBTyxDQUFDLElBQUQsRUFBTyxVQUFBLEdBQVcsT0FBTyxDQUFDLFFBQW5CLEdBQTRCLDRCQUE1QixHQUF3RCxPQUF4RCxHQUFnRSxxQkFBaEUsR0FBcUYsT0FBNUY7QUFDUCxpQkFBTztRQUhILENBRE47T0FURjtLQWpjRjtJQWdkQSxNQUFBLEVBQ0ssWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUE3QixDQUFBLENBQUEsSUFBMkMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxPQUE3QixDQUFBLENBQTlDLEdBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixLQUFqQixFQUF3QixPQUFPLENBQUMsUUFBaEM7UUFBYixDQUROO09BREY7S0FERixHQUFBLE1BamRGO0lBc2RBLEtBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxTQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLE1BQWxCLEVBQTBCLEtBQTFCLEVBQWlDLGVBQWpDLEVBQWtELE9BQU8sQ0FBQyxRQUExRDtRQUFiLENBRE47T0FERjtLQXZkRjtJQTJkQSxjQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixNQUFsQixFQUEwQixLQUExQixFQUFpQyxlQUFqQyxFQUFrRCxPQUFPLENBQUMsUUFBMUQ7UUFBYixDQUROO09BREY7S0E1ZEY7SUFnZUEsUUFBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFVBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BREY7S0FqZUY7SUFxZUEsSUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxVQUFBLEdBQWEsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFDLENBQUMsR0FBRixDQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBbEIsQ0FBa0MsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFsQyxDQUFOLEVBQTRELFNBQUMsU0FBRDttQkFBZSxDQUFDLFFBQUQsRUFBVyxTQUFYO1VBQWYsQ0FBNUQsQ0FBVjtVQUNiLElBQUEsR0FBTyxDQUFDLENBQUMsS0FBRixDQUFRLENBQUMsWUFBRCxFQUFlLG9CQUFmLEVBQXFDLG1CQUFyQyxFQUEwRCxRQUExRCxDQUFSLEVBQTZFLFVBQTdFO0FBQ1AsaUJBQU87UUFISCxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxZQUFELEVBQWUsVUFBZixFQUEyQixPQUFPLENBQUMsUUFBbkM7UUFBYixDQUROO09BUEY7S0F0ZUY7SUFnZkEsa0JBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxZQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQURGO0tBamZGO0lBcWZBLFVBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsS0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLEtBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0F0ZkY7SUE2ZkEsR0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDO2lCQUNWLENBQUMsT0FBRDtRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQVBGO0tBOWZGO0lBd2dCQSxXQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLEtBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQjtVQUNQLE9BQUEsR0FBVSxZQUFZLENBQUMsc0JBQWIsQ0FBb0MsSUFBcEM7aUJBQ1YsQ0FBQyxPQUFEO1FBSEksQ0FETjtPQURGO01BTUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLEtBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BUEY7S0F6Z0JGO0lBbWhCQSxRQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBUDtRQUFiLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBZjtRQUFiLENBRE47T0FKRjtLQXBoQkY7SUEyaEJBLFdBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBYjtRQUFkLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxRQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBZjtRQUFiLENBRE47T0FKRjtLQTVoQkY7SUFtaUJBLE1BQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUE7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxzQkFBcEIsQ0FBMkMsSUFBM0M7aUJBQ1YsQ0FBQyxZQUFELEVBQWMsV0FBZCxFQUEwQixJQUExQixFQUErQixZQUFBLEdBQWUsT0FBZixHQUF5QiwyR0FBeEQ7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxZQUFELEVBQWMsV0FBZCxFQUEwQixJQUExQixFQUErQixXQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQWlDLDJHQUFoRTtRQUFiLENBRE47T0FQRjtLQXBpQkY7SUE4aUJBLGdCQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLFFBQWY7UUFBYixDQUROO09BREY7S0EvaUJGO0lBbWpCQSxVQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBUDtRQUFiLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQUpGO0tBcGpCRjtJQTJqQkEsc0JBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxRQUFELEVBQVcsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFYO1FBQWIsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFVLE9BQVY7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0E1akJGO0lBbWtCQSxHQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLEtBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQjtVQUNQLElBQUEsR0FBTyxJQUFBLEdBQU87VUFHZCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDO2lCQUNWLENBQUMsT0FBRDtRQU5JLENBRE47T0FERjtNQVNBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQVZGO0tBcGtCRjtJQWlsQkEsT0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxTQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLENBQVA7UUFBYixDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FKRjtLQWxsQkY7SUF5bEJBLEdBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQyxrQkFBakIsQ0FBb0MsT0FBTyxDQUFDLFFBQTVDO1VBQ1AsSUFBQSxHQUFPLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBakIsQ0FBNEIsT0FBTyxDQUFDLFFBQXBDO2lCQUNQLENBQUMsSUFBRCxFQUFPLE1BQUEsR0FBUyxJQUFULEdBQWdCLCtDQUFoQixHQUFrRSxJQUFsRSxHQUF5RSxRQUFoRjtRQUhJLENBRE47T0FERjtLQTFsQkY7SUFpbUJBLElBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsVUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUE7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDO2lCQUNWLENBQUMsT0FBRDtRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxVQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQVBGO0tBbG1CRjtJQTRtQkEsYUFBQSxFQUNLLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBN0IsQ0FBQSxDQUFILEdBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sMEVBQUEsR0FBNkUsT0FBTyxDQUFDLFFBQXJGLEdBQWdHLHdDQUF2RztRQUFiLENBRE47T0FERjtLQURGLEdBQUEsTUE3bUJGO0lBa25CQSxlQUFBLEVBQ0ssWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUE3QixDQUFBLENBQUgsR0FDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxpSEFBQSxHQUFvSCxPQUFPLENBQUMsUUFBNUgsR0FBdUksNENBQTlJO1FBQWIsQ0FETjtPQURGO0tBREYsR0FBQSxNQW5uQkY7SUF3bkJBLEtBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQURGO0tBem5CRjtJQTZuQkEsTUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxRQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQWpCLENBQXlCLFNBQXpCLEVBQW9DLEVBQXBDLENBQVAsRUFBZ0QsUUFBaEQsRUFBMEQsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUExRDtRQUFiLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxRQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQWpCLENBQXlCLFNBQXpCLEVBQW9DLEVBQXBDLENBQVAsRUFBZ0QsT0FBTyxDQUFDLFFBQXhEO1FBQWIsQ0FETjtPQUpGO0tBOW5CRjtJQXFvQkEsRUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQTtVQUNQLE9BQUEsR0FBVSxZQUFZLENBQUMsc0JBQWIsQ0FBb0MsSUFBcEM7aUJBQ1YsQ0FBQyxJQUFELEVBQU8sT0FBUDtRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBZjtRQUFiLENBRE47T0FQRjtLQXRvQkY7SUFncEJBLGlCQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVCxFQUFtQixXQUFBLEdBQWMsT0FBTyxDQUFDLFFBQXRCLEdBQWlDLE1BQXBEO1FBQWIsQ0FETjtPQURGO0tBanBCRjtJQXFwQkEsSUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQTtVQUNQLElBQUEsR0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLHNCQUFsQixDQUF5QyxJQUF6QztpQkFDUCxDQUFDLElBQUQ7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FQRjtLQXRwQkY7SUFncUJBLFFBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0FqcUJGO0lBd3FCQSxXQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFjLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBUDtRQUFkLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQUpGO0tBenFCRjtJQWdyQkEsR0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQTtVQUNQLElBQUEsR0FBTyxZQUFZLENBQUMsR0FBRyxDQUFDLHNCQUFqQixDQUF3QyxJQUF4QztpQkFDUCxDQUFDLElBQUQ7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsS0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FQRjtLQWpyQkY7SUEyckJBLFVBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsWUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsT0FBUixDQUFBLENBQUQ7UUFBYixDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsWUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQWpCLENBQXlCLEtBQXpCLEVBQWdDLElBQWhDLENBQUQ7UUFBYixDQUROO09BSkY7S0E1ckJGO0lBbXNCQSxVQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVksWUFBWSxDQUFDLGVBQWUsQ0FBQyxTQUE3QixDQUFBLENBQUgsR0FBaUQsS0FBakQsR0FBNEQsTUFBckU7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO1VBQ0osSUFBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUEsQ0FBSDtBQUNFLG1CQUFPLENBQUMsOEJBQUEsR0FBK0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFqQixDQUF5QixJQUFBLEdBQUssT0FBTyxDQUFDLFFBQXRDLEVBQStDLEVBQS9DLENBQS9CLEdBQWtGLFFBQW5GLEVBRFQ7V0FBQSxNQUFBO0FBR0UsbUJBQU8sQ0FBQyxJQUFELEVBQU8sMkJBQUEsR0FBNEIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFqQixDQUF5QixHQUFBLEdBQUksT0FBTyxDQUFDLFFBQXJDLEVBQThDLEVBQTlDLENBQTVCLEdBQThFLFFBQXJGLEVBSFQ7O1FBREksQ0FETjtPQURGO0tBcHNCRjtJQTZzQkEsTUFBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLE9BQUEsR0FBVSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQWpCLENBQXlCLFNBQXpCLEVBQW9DLEVBQXBDLENBQVYsR0FBb0QsaUJBQXBELEdBQXdFLE9BQU8sQ0FBQyxRQUFoRixHQUEyRixvQkFBbEc7UUFBYixDQUROO09BREY7S0E5c0JGO0lBa3RCQSxVQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVksWUFBWSxDQUFDLGVBQWUsQ0FBQyxTQUE3QixDQUFBLENBQUgsR0FBaUQsS0FBakQsR0FBNEQsTUFBckU7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO1VBQ0osSUFBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUEsQ0FBSDttQkFDRSxDQUFDLFNBQUEsR0FBWSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQWpCLENBQXlCLFNBQXpCLEVBQW9DLEVBQXBDLENBQVosR0FBc0QsZUFBdkQsRUFERjtXQUFBLE1BQUE7bUJBR0UsQ0FBQyxJQUFELEVBQU8sTUFBQSxHQUFTLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBakIsQ0FBeUIsU0FBekIsRUFBb0MsRUFBcEMsQ0FBVCxHQUFtRCxlQUExRCxFQUhGOztRQURJLENBRE47T0FERjtLQW50QkY7SUEydEJBLE1BQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBYjtRQUFkLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxRQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBZjtRQUFiLENBRE47T0FKRjtLQTV0QkY7SUFtdUJBLENBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUE7VUFDUCxJQUFBLEdBQU8sWUFBWSxDQUFDLENBQUMsQ0FBQyxzQkFBZixDQUFzQyxJQUF0QztpQkFDUCxDQUFDLElBQUQ7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FQRjtLQXB1QkY7SUE4dUJBLE1BQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWIsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFFBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0EvdUJGO0lBc3ZCQSxJQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLGlCQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEI7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDO2lCQUNWLENBQUMsT0FBRCxFQUFVLE9BQVY7UUFISSxDQUROO09BREY7TUFNQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsaUJBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBRCxFQUFVLE9BQU8sQ0FBQyxRQUFsQjtRQUFiLENBRE47T0FQRjtLQXZ2QkY7SUFpd0JBLE1BQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBWSxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUEsQ0FBSCxHQUFpRCxLQUFqRCxHQUE0RCxNQUFyRTtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBakIsQ0FBeUIsT0FBekIsRUFBa0MsRUFBbEM7VUFDWCxJQUFBLEdBQU87VUFDUCxJQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsU0FBN0IsQ0FBQSxDQUFIO1lBQ0UsSUFBQSxHQUFPLENBQUMsYUFBQSxHQUFjLFFBQWQsR0FBdUIsYUFBdkIsR0FBb0MsUUFBcEMsR0FBNkMsU0FBOUMsRUFEVDtXQUFBLE1BQUE7WUFHRSxJQUFBLEdBQU8sQ0FBQyxJQUFELEVBQU8sV0FBQSxHQUFZLFFBQVosR0FBcUIsZUFBckIsR0FBb0MsUUFBcEMsR0FBNkMsVUFBcEQsRUFIVDs7QUFJQSxpQkFBTztRQVBILENBRE47T0FERjtLQWx3QkY7SUE2d0JBLFFBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBakIsQ0FBd0IsQ0FBeEIsRUFBMkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxXQUFqQixDQUE2QixPQUE3QixDQUEzQixDQUFEO1FBQWIsQ0FETjtPQURGO0tBOXdCRjtJQWt4QkEsaUJBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQURGO0tBbnhCRjtJQXV4QkEsS0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYyxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLENBQVA7UUFBZCxDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFELEVBQVUsU0FBVixFQUFxQixPQUFPLENBQUMsUUFBN0I7UUFBYixDQUROO09BSkY7TUFNQSxtQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBRCxFQUFVLFNBQVYsRUFBcUIsT0FBTyxDQUFDLGFBQVIsQ0FBQSxDQUFyQjtRQUFiLENBRE47T0FQRjtLQXh4QkY7SUFreUJBLElBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0FueUJGO0lBMHlCQSxlQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFjLENBQUMsUUFBRCxFQUFXLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBWDtRQUFkLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLFFBQUQsRUFBVyxPQUFPLENBQUMsUUFBbkI7UUFBYixDQUROO09BSkY7S0EzeUJGO0lBa3pCQSxJQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVksWUFBWSxDQUFDLGVBQWUsQ0FBQyxTQUE3QixDQUFBLENBQUgsR0FBaUQsS0FBakQsR0FBNEQsTUFBckU7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLFFBQUEsR0FBVyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQWpCLENBQXlCLE9BQXpCLEVBQWtDLEVBQWxDO1VBQ1gsSUFBQSxHQUFPO1VBQ1AsSUFBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUEsQ0FBSDtZQUNFLElBQUEsR0FBTyxDQUFDLFdBQUEsR0FBWSxPQUFPLENBQUMsUUFBcEIsR0FBNkIsTUFBN0IsR0FBbUMsUUFBbkMsR0FBNEMsTUFBN0MsRUFEVDtXQUFBLE1BQUE7WUFHRSxJQUFBLEdBQU8sQ0FBQyxJQUFELEVBQU8sU0FBQSxHQUFVLE9BQU8sQ0FBQyxRQUFsQixHQUEyQixpQ0FBbEMsRUFIVDs7QUFJQSxpQkFBTztRQVBILENBRE47T0FERjtLQW56QkY7SUE4ekJBLElBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWIsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0EvekJGO0lBczBCQSxJQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FERjtLQXYwQkY7SUEyMEJBLEtBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0E1MEJGO0lBbTFCQSxNQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFjLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBUDtRQUFkLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQUpGO0tBcDFCRjtJQTIxQkEsSUFBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BREY7S0E1MUJGO0lBZzJCQSxjQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBckI7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFjLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBUDtRQUFkLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQXJCO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQUpGO0tBajJCRjtJQXcyQkEscUJBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWMsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWQsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0F6MkJGO0lBZzNCQSxLQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsMEpBQUQ7UUFBYixDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsTUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQywwSkFBRDtRQUFiLENBRE47T0FKRjtLQWozQkY7SUF3M0JBLGtCQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBUDtRQUFiLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsUUFBZjtRQUFiLENBRE47T0FKRjtLQXozQkY7SUFnNEJBLGFBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQURGO0tBajRCRjtJQXE0QkEsS0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYyxDQUFDLElBQUQsRUFBTyxPQUFPLENBQUMsT0FBUixDQUFBLENBQVA7UUFBZCxDQUROO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLFFBQWY7UUFBYixDQUROO09BSkY7S0F0NEJGO0lBNjRCQSxLQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxPQUFPLENBQUMsUUFBVDtRQUFiLENBRE47T0FERjtLQTk0QkY7SUFrNUJBLEdBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsT0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUE7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDO2lCQUNWLENBQUMsT0FBRDtRQUhJLENBRE47T0FERjtNQU1BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFUO1FBQWIsQ0FETjtPQVBGO0tBbjVCRjtJQTY1QkEsTUFBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFFBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsTUFBRCxFQUFTLE9BQU8sQ0FBQyxRQUFqQjtRQUFiLENBRE47T0FERjtLQTk1QkY7SUFrNkJBLFVBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7aUJBQWEsQ0FBQyxJQUFELEVBQU8sT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFQO1FBQWIsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFNBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsT0FBTyxDQUFDLFFBQVQ7UUFBYixDQUROO09BSkY7S0FuNkJGO0lBMDZCQSxRQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFNBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO0FBQ0osY0FBQTtVQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsT0FBUixDQUFBO1VBQ1AsT0FBQSxHQUFVLFlBQVksQ0FBQyxzQkFBYixDQUFvQyxJQUFwQyxFQUEwQyxNQUExQztpQkFDVixDQUFDLFVBQUQsRUFBWSxPQUFaO1FBSEksQ0FETjtPQURGO01BTUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLFNBQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsVUFBRCxFQUFhLE9BQU8sQ0FBQyxRQUFyQjtRQUFiLENBRE47T0FQRjtLQTM2QkY7SUFxN0JBLElBQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtBQUNKLGNBQUE7VUFBQSxHQUFBLEdBQU0sU0FBQSxHQUFZLE9BQU8sQ0FBQztVQUMxQixLQUFLLENBQUMsWUFBTixDQUFtQixHQUFuQjtpQkFDQSxDQUFDLHNCQUFELEVBQXlCLEdBQXpCO1FBSEksQ0FETjtPQURGO0tBdDdCRjs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbIiMgTWFwcyBBdG9tIEdyYW1tYXIgbmFtZXMgdG8gdGhlIGNvbW1hbmQgdXNlZCBieSB0aGF0IGxhbmd1YWdlXG4jIEFzIHdlbGwgYXMgYW55IHNwZWNpYWwgc2V0dXAgZm9yIGFyZ3VtZW50cy5cblxuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbkdyYW1tYXJVdGlscyA9IHJlcXVpcmUgJy4uL2xpYi9ncmFtbWFyLXV0aWxzJ1xuc2hlbGwgPSByZXF1aXJlKCdlbGVjdHJvbicpLnNoZWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgJzFDIChCU0wpJzpcbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiBcIm9zY3JpcHRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWVuY29kaW5nPXV0Zi04JywgY29udGV4dC5maWxlcGF0aF1cblxuICBBbnNpYmxlOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJhbnNpYmxlLXBsYXlib29rXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBBcHBsZVNjcmlwdDpcbiAgICAnU2VsZWN0aW9uIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdvc2FzY3JpcHQnXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnb3Nhc2NyaXB0J1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEF1dG9Ib3RLZXk6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIkF1dG9Ib3RLZXlcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIkF1dG9Ib3RLZXlcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFt0bXBGaWxlXVxuXG4gICdCYWJlbCBFUzYgSmF2YVNjcmlwdCc6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmFiZWwtbm9kZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYWJlbC1ub2RlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICAnQmFzaCBBdXRvbWF0ZWQgVGVzdCBTeXN0ZW0gKEJhdHMpJzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmF0c1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6ICdiYXRzJ1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFt0bXBGaWxlXVxuXG4gIEJhdGNoOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJjbWQuZXhlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy9xJywgJy9jJywgY29udGV4dC5maWxlcGF0aF1cblxuICAnQmVoYXQgRmVhdHVyZSc6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJlaGF0XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cbiAgICBcIkxpbmUgTnVtYmVyIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJlaGF0XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlQ29sb25MaW5lKCldXG5cbiAgQnVja2xlU2NyaXB0OlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJzY1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSgpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbJy1jJywgdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYnNjXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgY29udGV4dC5maWxlcGF0aF1cblxuICBDOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBhcmdzID0gW11cbiAgICAgICAgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc0RhcndpbigpXG4gICAgICAgICAgYXJncyA9IFsnLWMnLCBcInhjcnVuIGNsYW5nIC1mY29sb3ItZGlhZ25vc3RpY3MgLVdhbGwgLWluY2x1ZGUgc3RkaW8uaCAnXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCInIC1vIC90bXAvYy5vdXQgJiYgL3RtcC9jLm91dFwiXVxuICAgICAgICBlbHNlIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNMaW51eCgpXG4gICAgICAgICAgYXJncyA9IFtcIi1jXCIsIFwiY2MgLVdhbGwgLWluY2x1ZGUgc3RkaW8uaCAnXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCInIC1vIC90bXAvYy5vdXQgJiYgL3RtcC9jLm91dFwiXVxuICAgICAgICByZXR1cm4gYXJnc1xuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsIFwiLmNcIilcbiAgICAgICAgYXJncyA9IFtdXG4gICAgICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNEYXJ3aW4oKVxuICAgICAgICAgIGFyZ3MgPSBbJy1jJywgXCJ4Y3J1biBjbGFuZyAtZmNvbG9yLWRpYWdub3N0aWNzIC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggJ1wiICsgdG1wRmlsZSArIFwiJyAtbyAvdG1wL2Mub3V0ICYmIC90bXAvYy5vdXRcIl1cbiAgICAgICAgZWxzZSBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzTGludXgoKVxuICAgICAgICAgIGFyZ3MgPSBbXCItY1wiLCBcImNjIC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggJ1wiICsgdG1wRmlsZSArIFwiJyAtbyAvdG1wL2Mub3V0ICYmIC90bXAvYy5vdXRcIl1cbiAgICAgICAgcmV0dXJuIGFyZ3NcblxuICAnQyMnOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKSB0aGVuIFwiY21kXCIgZWxzZSBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIHByb2duYW1lID0gY29udGV4dC5maWxlbmFtZS5yZXBsYWNlIC9cXC5jcyQvLCBcIlwiXG4gICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpXG4gICAgICAgICAgYXJncyA9IFtcIi9jIGNzYyAje2NvbnRleHQuZmlsZXBhdGh9ICYmICN7cHJvZ25hbWV9LmV4ZVwiXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXJncyA9IFsnLWMnLCBcImNzYyAje2NvbnRleHQuZmlsZXBhdGh9ICYmIG1vbm8gI3twcm9nbmFtZX0uZXhlXCJdXG4gICAgICAgIHJldHVybiBhcmdzXG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKCkgdGhlbiBcImNtZFwiIGVsc2UgXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5jc1wiKVxuICAgICAgICBwcm9nbmFtZSA9IHRtcEZpbGUucmVwbGFjZSAvXFwuY3MkLywgXCJcIlxuICAgICAgICBhcmdzID0gW11cbiAgICAgICAgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKVxuICAgICAgICAgIGFyZ3MgPSBbXCIvYyBjc2MgL291dDoje3Byb2duYW1lfS5leGUgI3t0bXBGaWxlfSAmJiAje3Byb2duYW1lfS5leGVcIl1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFyZ3MgPSBbJy1jJywgXCJjc2MgL291dDoje3Byb2duYW1lfS5leGUgI3t0bXBGaWxlfSAmJiBtb25vICN7cHJvZ25hbWV9LmV4ZVwiXVxuICAgICAgICByZXR1cm4gYXJnc1xuXG4gICdDIyBTY3JpcHQgRmlsZSc6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNjcmlwdGNzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1zY3JpcHQnLCBjb250ZXh0LmZpbGVwYXRoXVxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNjcmlwdGNzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5jc3hcIilcbiAgICAgICAgWyctc2NyaXB0JywgdG1wRmlsZV1cblxuICAnQysrJzpcbiAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzRGFyd2luKClcbiAgICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgXCIuY3BwXCIpXG4gICAgICAgICAgW1wiLWNcIiwgXCJ4Y3J1biBjbGFuZysrIC1mY29sb3ItZGlhZ25vc3RpY3MgLXN0ZD1jKysxNCAtV2FsbCAtaW5jbHVkZSBzdGRpby5oIC1pbmNsdWRlIGlvc3RyZWFtICdcIiArIHRtcEZpbGUgKyBcIicgLW8gL3RtcC9jcHAub3V0ICYmIC90bXAvY3BwLm91dFwiXVxuICAgICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgXCJ4Y3J1biBjbGFuZysrIC1mY29sb3ItZGlhZ25vc3RpY3MgLXN0ZD1jKysxNCAtV2FsbCAtaW5jbHVkZSBzdGRpby5oIC1pbmNsdWRlIGlvc3RyZWFtICdcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIicgLW8gL3RtcC9jcHAub3V0ICYmIC90bXAvY3BwLm91dFwiXVxuICAgIGVsc2UgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc0xpbnV4KClcbiAgICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgXCIuY3BwXCIpXG4gICAgICAgICAgW1wiLWNcIiwgXCJnKysgLXN0ZD1jKysxNCAtV2FsbCAtaW5jbHVkZSBzdGRpby5oIC1pbmNsdWRlIGlvc3RyZWFtICdcIiArIHRtcEZpbGUgKyBcIicgLW8gL3RtcC9jcHAub3V0ICYmIC90bXAvY3BwLm91dFwiXVxuICAgICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbXCItY1wiLCBcImcrKyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJ1wiICsgY29udGV4dC5maWxlcGF0aCArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG4gICAgZWxzZSBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpIGFuZCBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLnJlbGVhc2UoKS5zcGxpdChcIi5cIikuc2xpY2UgLTEgPj0gJzE0Mzk5J1xuICAgICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbXCItY1wiLCBcImcrKyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJy9tbnQvXCIgKyBwYXRoLnBvc2l4LmpvaW4uYXBwbHkocGF0aC5wb3NpeCwgW10uY29uY2F0KFtjb250ZXh0LmZpbGVwYXRoLnNwbGl0KHBhdGgud2luMzIuc2VwKVswXS50b0xvd2VyQ2FzZSgpXSwgY29udGV4dC5maWxlcGF0aC5zcGxpdChwYXRoLndpbjMyLnNlcCkuc2xpY2UoMSkpKS5yZXBsYWNlKFwiOlwiLCBcIlwiKSArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG5cbiAgJ0MrKzE0JzpcbiAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzRGFyd2luKClcbiAgICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgXCIuY3BwXCIpXG4gICAgICAgICAgW1wiLWNcIiwgXCJ4Y3J1biBjbGFuZysrIC1mY29sb3ItZGlhZ25vc3RpY3MgLXN0ZD1jKysxNCAtV2FsbCAtaW5jbHVkZSBzdGRpby5oIC1pbmNsdWRlIGlvc3RyZWFtICdcIiArIHRtcEZpbGUgKyBcIicgLW8gL3RtcC9jcHAub3V0ICYmIC90bXAvY3BwLm91dFwiXVxuICAgICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgXCJ4Y3J1biBjbGFuZysrIC1mY29sb3ItZGlhZ25vc3RpY3MgLXN0ZD1jKysxNCAtV2FsbCAtaW5jbHVkZSBzdGRpby5oIC1pbmNsdWRlIGlvc3RyZWFtICdcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIicgLW8gL3RtcC9jcHAub3V0ICYmIC90bXAvY3BwLm91dFwiXVxuICAgIGVsc2UgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc0xpbnV4KClcbiAgICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgXCIuY3BwXCIpXG4gICAgICAgICAgW1wiLWNcIiwgXCJnKysgLXN0ZD1jKysxNCAtV2FsbCAtaW5jbHVkZSBzdGRpby5oIC1pbmNsdWRlIGlvc3RyZWFtICdcIiArIHRtcEZpbGUgKyBcIicgLW8gL3RtcC9jcHAub3V0ICYmIC90bXAvY3BwLm91dFwiXVxuICAgICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbXCItY1wiLCBcImcrKyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJ1wiICsgY29udGV4dC5maWxlcGF0aCArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG4gICAgZWxzZSBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpIGFuZCBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLnJlbGVhc2UoKS5zcGxpdChcIi5cIikuc2xpY2UgLTEgPj0gJzE0Mzk5J1xuICAgICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbXCItY1wiLCBcImcrKyAtc3RkPWMrKzE0IC1XYWxsIC1pbmNsdWRlIHN0ZGlvLmggLWluY2x1ZGUgaW9zdHJlYW0gJy9tbnQvXCIgKyBwYXRoLnBvc2l4LmpvaW4uYXBwbHkocGF0aC5wb3NpeCwgW10uY29uY2F0KFtjb250ZXh0LmZpbGVwYXRoLnNwbGl0KHBhdGgud2luMzIuc2VwKVswXS50b0xvd2VyQ2FzZSgpXSwgY29udGV4dC5maWxlcGF0aC5zcGxpdChwYXRoLndpbjMyLnNlcCkuc2xpY2UoMSkpKS5yZXBsYWNlKFwiOlwiLCBcIlwiKSArIFwiJyAtbyAvdG1wL2NwcC5vdXQgJiYgL3RtcC9jcHAub3V0XCJdXG5cbiAgQ2xvanVyZTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJsZWluXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWydleGVjJywgJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImxlaW5cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnZXhlYycsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgQ29mZmVlU2NyaXB0OlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImNvZmZlZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gR3JhbW1hclV0aWxzLkNTY29tcGlsZXIuYXJncy5jb25jYXQgW2NvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJjb2ZmZWVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFwiQ29mZmVlU2NyaXB0IChMaXRlcmF0ZSlcIjpcbiAgICAnU2VsZWN0aW9uIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdjb2ZmZWUnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gR3JhbW1hclV0aWxzLkNTY29tcGlsZXIuYXJncy5jb25jYXQgW2NvbnRleHQuZ2V0Q29kZSgpXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdjb2ZmZWUnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJDb21tb24gTGlzcFwiOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJjbGlzcFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgQ3J5c3RhbDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJjcnlzdGFsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWydldmFsJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImNyeXN0YWxcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicmRtZFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5ELmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgW3RtcEZpbGVdXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJkbWRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIERhcnQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZGFydFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgXCIuZGFydFwiKVxuICAgICAgICBbdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZGFydFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJHcmFwaHZpeiAoRE9UKVwiOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImRvdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSwgXCIuZG90XCIpXG4gICAgICAgIFsnLVRwbmcnLCB0bXBGaWxlLCAnLW8nLCB0bXBGaWxlICsgJy5wbmcnXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJkb3RcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLVRwbmcnLCBjb250ZXh0LmZpbGVwYXRoLCAnLW8nLCBjb250ZXh0LmZpbGVwYXRoICsgJy5wbmcnXVxuICBET1Q6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZG90XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5kb3RcIilcbiAgICAgICAgWyctVHBuZycsIHRtcEZpbGUsICctbycsIHRtcEZpbGUgKyAnLnBuZyddXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImRvdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctVHBuZycsIGNvbnRleHQuZmlsZXBhdGgsICctbycsIGNvbnRleHQuZmlsZXBhdGggKyAnLnBuZyddXG5cbiAgRWxpeGlyOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImVsaXhpclwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZWxpeGlyXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1yJywgY29udGV4dC5maWxlcGF0aF1cblxuICBFcmxhbmc6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZXJsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctbm9zaGVsbCcsICctZXZhbCcsIFwiI3tjb250ZXh0LmdldENvZGUoKX0sIGluaXQ6c3RvcCgpLlwiXVxuXG4gICdGIyc6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpIHRoZW4gXCJmc2lcIiBlbHNlIFwiZnNoYXJwaVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctLWV4ZWMnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gICdGKic6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImZzdGFyXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBGYWJsZTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJmYWJsZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSgpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZmFibGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEZvcnRoOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJnZm9ydGhcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFwiRm9ydHJhbiAtIEZpeGVkIEZvcm1cIjpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIFwiZ2ZvcnRyYW4gJ1wiICsgY29udGV4dC5maWxlcGF0aCArIFwiJyAtZmZpeGVkLWZvcm0gLW8gL3RtcC9mLm91dCAmJiAvdG1wL2Yub3V0XCJdXG5cbiAgXCJGb3J0cmFuIC0gRnJlZSBGb3JtXCI6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCBcImdmb3J0cmFuICdcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIicgLWZmcmVlLWZvcm0gLW8gL3RtcC9mOTAub3V0ICYmIC90bXAvZjkwLm91dFwiXVxuXG4gIFwiRm9ydHJhbiAtIE1vZGVyblwiOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgXCJnZm9ydHJhbiAnXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCInIC1mZnJlZS1mb3JtIC1vIC90bXAvZjkwLm91dCAmJiAvdG1wL2Y5MC5vdXRcIl1cblxuICBcIkZvcnRyYW4gLSBQdW5jaGNhcmRcIjpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIFwiZ2ZvcnRyYW4gJ1wiICsgY29udGV4dC5maWxlcGF0aCArIFwiJyAtZmZpeGVkLWZvcm0gLW8gL3RtcC9mLm91dCAmJiAvdG1wL2Yub3V0XCJdXG5cbiAgR2hlcmtpbjpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiY3VjdW1iZXJcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLS1jb2xvcicsIGNvbnRleHQuZmlsZXBhdGhdXG4gICAgXCJMaW5lIE51bWJlciBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJjdWN1bWJlclwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctLWNvbG9yJywgY29udGV4dC5maWxlQ29sb25MaW5lKCldXG5cbiAgZ251cGxvdDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZ251cGxvdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctcCcsIGNvbnRleHQuZmlsZXBhdGhdXG4gICAgICB3b3JraW5nRGlyZWN0b3J5OiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpPy5idWZmZXI/LmZpbGU/LmdldFBhcmVudD8oKS5nZXRQYXRoPygpXG5cbiAgR286XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImdvXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBpZiBjb250ZXh0LmZpbGVwYXRoLm1hdGNoKC9fdGVzdC5nby8pIHRoZW4gWyd0ZXN0JywgJycgXVxuICAgICAgICBlbHNlIFsncnVuJywgY29udGV4dC5maWxlcGF0aF1cbiAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk/LmJ1ZmZlcj8uZmlsZT8uZ2V0UGFyZW50PygpLmdldFBhdGg/KClcblxuICBHcm9vdnk6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZ3Jvb3Z5XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJncm9vdnlcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEhhc2tlbGw6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJ1bmhhc2tlbGxcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImdoY1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cblxuICBIeTpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiaHlcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImh5XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5oeVwiKVxuICAgICAgICBbdG1wRmlsZV1cblxuICBJY2VkQ29mZmVlU2NyaXB0OlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImljZWRcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImljZWRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIElkcmlzOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJpZHJpc1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGgsICctbycsIHBhdGguYmFzZW5hbWUoY29udGV4dC5maWxlcGF0aCwgcGF0aC5leHRuYW1lKGNvbnRleHQuZmlsZXBhdGgpKV1cblxuICBJbm5vU2V0dXA6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIklTQ0MuZXhlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy9RJywgY29udGV4dC5maWxlcGF0aF1cblxuICBpb0xhbmd1YWdlOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImlvXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImlvXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1lJywgY29udGV4dC5maWxlcGF0aF1cblxuICBKYXZhOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKSB0aGVuIFwiY21kXCIgZWxzZSBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNsYXNzTmFtZSA9IEdyYW1tYXJVdGlscy5KYXZhLmdldENsYXNzTmFtZSBjb250ZXh0XG4gICAgICAgIGNsYXNzUGFja2FnZXMgPSBHcmFtbWFyVXRpbHMuSmF2YS5nZXRDbGFzc1BhY2thZ2UgY29udGV4dFxuICAgICAgICBzb3VyY2VQYXRoID0gR3JhbW1hclV0aWxzLkphdmEuZ2V0UHJvamVjdFBhdGggY29udGV4dFxuXG4gICAgICAgIGFyZ3MgPSBbXVxuICAgICAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpXG4gICAgICAgICAgYXJncyA9IFtcIi9jIGphdmFjIC1YbGludCAje2NvbnRleHQuZmlsZW5hbWV9ICYmIGphdmEgI3tjbGFzc05hbWV9XCJdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhcmdzID0gWyctYycsIFwiamF2YWMgLXNvdXJjZXBhdGggI3tzb3VyY2VQYXRofSAtZCAvdG1wICcje2NvbnRleHQuZmlsZXBhdGh9JyAmJiBqYXZhIC1jcCAvdG1wICN7Y2xhc3NQYWNrYWdlc30je2NsYXNzTmFtZX1cIl1cblxuICAgICAgICByZXR1cm4gYXJnc1xuXG4gIEphdmFTY3JpcHQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibm9kZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibm9kZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgJ0phdmFTY3JpcHQgd2l0aCBKU1gnOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm5vZGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm5vZGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFwiSmF2YVNjcmlwdCBmb3IgQXV0b21hdGlvbiAoSlhBKVwiOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm9zYXNjcmlwdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWwnLCAnSmF2YVNjcmlwdCcsICctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJvc2FzY3JpcHRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWwnLCAnSmF2YVNjcmlwdCcsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgSm9saWU6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImpvbGllXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBKdWxpYTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJqdWxpYVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwianVsaWFcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEtvdGxpbjpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlLCBcIi5rdFwiKVxuICAgICAgICBqYXJOYW1lID0gdG1wRmlsZS5yZXBsYWNlIC9cXC5rdCQvLCBcIi5qYXJcIlxuICAgICAgICBhcmdzID0gWyctYycsIFwia290bGluYyAje3RtcEZpbGV9IC1pbmNsdWRlLXJ1bnRpbWUgLWQgI3tqYXJOYW1lfSAmJiBqYXZhIC1qYXIgI3tqYXJOYW1lfVwiXVxuICAgICAgICByZXR1cm4gYXJnc1xuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBqYXJOYW1lID0gY29udGV4dC5maWxlbmFtZS5yZXBsYWNlIC9cXC5rdCQvLCBcIi5qYXJcIlxuICAgICAgICBhcmdzID0gWyctYycsIFwia290bGluYyAje2NvbnRleHQuZmlsZXBhdGh9IC1pbmNsdWRlLXJ1bnRpbWUgLWQgL3RtcC8je2phck5hbWV9ICYmIGphdmEgLWphciAvdG1wLyN7amFyTmFtZX1cIl1cbiAgICAgICAgcmV0dXJuIGFyZ3NcblxuICBMQU1NUFM6XG4gICAgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc0RhcndpbigpIHx8IEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNMaW51eCgpXG4gICAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgICAgY29tbWFuZDogXCJsYW1tcHNcIlxuICAgICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctbG9nJywgJ25vbmUnLCAnLWluJywgY29udGV4dC5maWxlcGF0aF1cblxuICBMYVRlWDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibGF0ZXhta1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctY2QnLCAnLXF1aWV0JywgJy1wZGYnLCAnLXB2JywgJy1zaGVsbC1lc2NhcGUnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gICdMYVRlWCBCZWFtZXInOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJsYXRleG1rXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jZCcsICctcXVpZXQnLCAnLXBkZicsICctcHYnLCAnLXNoZWxsLWVzY2FwZScsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgTGlseVBvbmQ6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImxpbHlwb25kXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBMaXNwOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNiY2xcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIHN0YXRlbWVudHMgPSBfLmZsYXR0ZW4oXy5tYXAoR3JhbW1hclV0aWxzLkxpc3Auc3BsaXRTdGF0ZW1lbnRzKGNvbnRleHQuZ2V0Q29kZSgpKSwgKHN0YXRlbWVudCkgLT4gWyctLWV2YWwnLCBzdGF0ZW1lbnRdKSlcbiAgICAgICAgYXJncyA9IF8udW5pb24gWyctLW5vaW5mb3JtJywgJy0tZGlzYWJsZS1kZWJ1Z2dlcicsICctLW5vbi1pbnRlcmFjdGl2ZScsICctLXF1aXQnXSwgc3RhdGVtZW50c1xuICAgICAgICByZXR1cm4gYXJnc1xuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJzYmNsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy0tbm9pbmZvcm0nLCAnLS1zY3JpcHQnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gICdMaXRlcmF0ZSBIYXNrZWxsJzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicnVuaGFza2VsbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgTGl2ZVNjcmlwdDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJsc2NcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImxzY1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgTHVhOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImx1YVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSh0cnVlKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgW3RtcEZpbGVdXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImx1YVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgJ0x1YSAoV29XKSc6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibHVhXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibHVhXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBNYWtlZmlsZTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1jJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm1ha2VcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWYnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIE1hZ2ljUHl0aG9uOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInB5dGhvblwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLXUnLCAnLWMnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicHl0aG9uXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy11JywgY29udGV4dC5maWxlcGF0aF1cblxuICBNQVRMQUI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibWF0bGFiXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5NQVRMQUIuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbJy1ub2Rlc2t0b3AnLCctbm9zcGxhc2gnLCctcicsXCJ0cnksIHJ1bignXCIgKyB0bXBGaWxlICsgXCInKTt3aGlsZSB+aXNlbXB0eShnZXQoMCwnQ2hpbGRyZW4nKSk7IHBhdXNlKDAuNSk7IGVuZDsgY2F0Y2ggTUU7IGRpc3AoTUUubWVzc2FnZSk7IGV4aXQoMSk7IGVuZDsgZXhpdCgwKTtcIl1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibWF0bGFiXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1ub2Rlc2t0b3AnLCctbm9zcGxhc2gnLCctcicsXCJ0cnkgcnVuKCdcIiArIGNvbnRleHQuZmlsZXBhdGggKyBcIicpO3doaWxlIH5pc2VtcHR5KGdldCgwLCdDaGlsZHJlbicpKTsgcGF1c2UoMC41KTsgZW5kOyBjYXRjaCBNRTsgZGlzcChNRS5tZXNzYWdlKTsgZXhpdCgxKTsgZW5kOyBleGl0KDApO1wiXVxuXG4gICdNSVBTIEFzc2VtYmxlcic6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNwaW1cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWYnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIE1vb25TY3JpcHQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibW9vblwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJtb29uXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICAnbW9uZ29EQiAoSmF2YVNjcmlwdCknOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm1vbmdvXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy0tZXZhbCcsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogIFwibW9uZ29cIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIE5DTDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJuY2xcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUodHJ1ZSlcbiAgICAgICAgY29kZSA9IGNvZGUgKyBcIlwiXCJcblxuICAgICAgICBleGl0XCJcIlwiXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibmNsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBuZXdMSVNQOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm5ld2xpc3BcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwibmV3bGlzcFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgTmltOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBmaWxlID0gR3JhbW1hclV0aWxzLk5pbS5maW5kTmltUHJvamVjdEZpbGUoY29udGV4dC5maWxlcGF0aClcbiAgICAgICAgcGF0aCA9IEdyYW1tYXJVdGlscy5OaW0ucHJvamVjdERpcihjb250ZXh0LmZpbGVwYXRoKVxuICAgICAgICBbJy1jJywgJ2NkIFwiJyArIHBhdGggKyAnXCIgJiYgbmltIGMgLS1oaW50czpvZmYgLS1wYXJhbGxlbEJ1aWxkOjEgLXIgXCInICsgZmlsZSArICdcIiAyPiYxJ11cblxuICBOU0lTOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm1ha2Vuc2lzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFt0bXBGaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJtYWtlbnNpc1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgJ09iamVjdGl2ZS1DJzpcbiAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzRGFyd2luKClcbiAgICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIFwieGNydW4gY2xhbmcgLWZjb2xvci1kaWFnbm9zdGljcyAtV2FsbCAtaW5jbHVkZSBzdGRpby5oIC1mcmFtZXdvcmsgQ29jb2EgXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCIgLW8gL3RtcC9vYmpjLWMub3V0ICYmIC90bXAvb2JqYy1jLm91dFwiXVxuXG4gICdPYmplY3RpdmUtQysrJzpcbiAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzRGFyd2luKClcbiAgICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIFwieGNydW4gY2xhbmcrKyAtZmNvbG9yLWRpYWdub3N0aWNzIC1XYysrMTEtZXh0ZW5zaW9ucyAtV2FsbCAtaW5jbHVkZSBzdGRpby5oIC1pbmNsdWRlIGlvc3RyZWFtIC1mcmFtZXdvcmsgQ29jb2EgXCIgKyBjb250ZXh0LmZpbGVwYXRoICsgXCIgLW8gL3RtcC9vYmpjLWNwcC5vdXQgJiYgL3RtcC9vYmpjLWNwcC5vdXRcIl1cblxuICBPQ2FtbDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwib2NhbWxcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIE9jdGF2ZTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJvY3RhdmVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLXAnLCBjb250ZXh0LmZpbGVwYXRoLnJlcGxhY2UoL1teXFwvXSokLywgJycpLCAnLS1ldmFsJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIm9jdGF2ZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctcCcsIGNvbnRleHQuZmlsZXBhdGgucmVwbGFjZSgvW15cXC9dKiQvLCAnJyksIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgT3o6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwib3pjXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFsnLWMnLCB0bXBGaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJvemNcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gICdQYW5kb2MgTWFya2Rvd24nOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwYW56ZXJcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoLCBcIi0tb3V0cHV0PVwiICsgY29udGV4dC5maWxlcGF0aCArIFwiLnBkZlwiXVxuXG4gIFBlcmw6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicGVybFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSgpXG4gICAgICAgIGZpbGUgPSBHcmFtbWFyVXRpbHMuUGVybC5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFtmaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwZXJsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBcIlBlcmwgNlwiOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBlcmw2XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwZXJsNlwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJQZXJsIDYgRkVcIjpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwZXJsNlwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicGVybDZcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFBIUDpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwaHBcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUoKVxuICAgICAgICBmaWxlID0gR3JhbW1hclV0aWxzLlBIUC5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIFtmaWxlXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwaHBcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFBvd2VyU2hlbGw6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicG93ZXJzaGVsbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJwb3dlcnNoZWxsXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aC5yZXBsYWNlIC9cXCAvZywgXCJgIFwiXVxuXG4gIFByb2Nlc3Npbmc6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpIHRoZW4gXCJjbWRcIiBlbHNlIFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKVxuICAgICAgICAgIHJldHVybiBbJy9jIHByb2Nlc3NpbmctamF2YSAtLXNrZXRjaD0nK2NvbnRleHQuZmlsZXBhdGgucmVwbGFjZShcIlxcXFxcIitjb250ZXh0LmZpbGVuYW1lLFwiXCIpKycgLS1ydW4nXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0dXJuIFsnLWMnLCAncHJvY2Vzc2luZy1qYXZhIC0tc2tldGNoPScrY29udGV4dC5maWxlcGF0aC5yZXBsYWNlKFwiL1wiK2NvbnRleHQuZmlsZW5hbWUsXCJcIikrJyAtLXJ1biddXG5cblxuICBQcm9sb2c6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcImJhc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCAnY2QgXFxcIicgKyBjb250ZXh0LmZpbGVwYXRoLnJlcGxhY2UoL1teXFwvXSokLywgJycpICsgJ1xcXCI7IHN3aXBsIC1mIFxcXCInICsgY29udGV4dC5maWxlcGF0aCArICdcXFwiIC10IG1haW4gLS1xdWlldCddXG5cbiAgUHVyZVNjcmlwdDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKCkgdGhlbiBcImNtZFwiIGVsc2UgXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpXG4gICAgICAgICAgWycvYyBjZCBcIicgKyBjb250ZXh0LmZpbGVwYXRoLnJlcGxhY2UoL1teXFwvXSokLywgJycpICsgJ1wiICYmIHB1bHAgcnVuJ11cbiAgICAgICAgZWxzZVxuICAgICAgICAgIFsnLWMnLCAnY2QgXCInICsgY29udGV4dC5maWxlcGF0aC5yZXBsYWNlKC9bXlxcL10qJC8sICcnKSArICdcIiAmJiBwdWxwIHJ1biddXG5cbiAgUHl0aG9uOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInB5dGhvblwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLXUnLCAnLWMnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicHl0aG9uXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy11JywgY29udGV4dC5maWxlcGF0aF1cblxuICBSOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcIlJzY3JpcHRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUoKVxuICAgICAgICBmaWxlID0gR3JhbW1hclV0aWxzLlIuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbZmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiUnNjcmlwdFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgUmFja2V0OlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJhY2tldFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJyYWNrZXRcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFJBTlQ6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiUmFudENvbnNvbGUuZXhlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKHRydWUpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICBbJy1maWxlJywgdG1wRmlsZV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiUmFudENvbnNvbGUuZXhlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy1maWxlJywgY29udGV4dC5maWxlcGF0aF1cblxuICBSZWFzb246XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBpZiBHcmFtbWFyVXRpbHMuT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpIHRoZW4gXCJjbWRcIiBlbHNlIFwiYmFzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgcHJvZ25hbWUgPSBjb250ZXh0LmZpbGVuYW1lLnJlcGxhY2UgL1xcLnJlJC8sIFwiXCJcbiAgICAgICAgYXJncyA9IFtdXG4gICAgICAgIGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKClcbiAgICAgICAgICBhcmdzID0gW1wiL2MgcmVidWlsZCAje3Byb2duYW1lfS5uYXRpdmUgJiYgI3twcm9nbmFtZX0ubmF0aXZlXCJdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhcmdzID0gWyctYycsIFwicmVidWlsZCAnI3twcm9nbmFtZX0ubmF0aXZlJyAmJiAnI3twcm9nbmFtZX0ubmF0aXZlJ1wiXVxuICAgICAgICByZXR1cm4gYXJnc1xuXG4gIFwiUmVuJ1B5XCI6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJlbnB5XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aC5zdWJzdHIoMCwgY29udGV4dC5maWxlcGF0aC5sYXN0SW5kZXhPZihcIi9nYW1lXCIpKV1cblxuICAnUm9ib3QgRnJhbWV3b3JrJzpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6ICdyb2JvdCdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBSU3BlYzpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJydWJ5XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJyc3BlY1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctLXR0eScsICctLWNvbG9yJywgY29udGV4dC5maWxlcGF0aF1cbiAgICBcIkxpbmUgTnVtYmVyIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJzcGVjXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJy0tdHR5JywgJy0tY29sb3InLCBjb250ZXh0LmZpbGVDb2xvbkxpbmUoKV1cblxuICBSdWJ5OlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJ1YnlcIlxuICAgICAgYXJnczogKGNvbnRleHQpICAtPiBbJy1lJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJ1YnlcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gICdSdWJ5IG9uIFJhaWxzJzpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJyYWlsc1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsncnVubmVyJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInJhaWxzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJ3J1bm5lcicsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgUnVzdDpcbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IGlmIEdyYW1tYXJVdGlscy5PcGVyYXRpbmdTeXN0ZW0uaXNXaW5kb3dzKCkgdGhlbiBcImNtZFwiIGVsc2UgXCJiYXNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBwcm9nbmFtZSA9IGNvbnRleHQuZmlsZW5hbWUucmVwbGFjZSAvXFwucnMkLywgXCJcIlxuICAgICAgICBhcmdzID0gW11cbiAgICAgICAgaWYgR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKVxuICAgICAgICAgIGFyZ3MgPSBbXCIvYyBydXN0YyAje2NvbnRleHQuZmlsZXBhdGh9ICYmICN7cHJvZ25hbWV9LmV4ZVwiXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXJncyA9IFsnLWMnLCBcInJ1c3RjICcje2NvbnRleHQuZmlsZXBhdGh9JyAtbyAvdG1wL3JzLm91dCAmJiAvdG1wL3JzLm91dFwiXVxuICAgICAgICByZXR1cm4gYXJnc1xuXG4gIFNhZ2U6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic2FnZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJzYWdlXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBTYXNzOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJzYXNzXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBTY2FsYTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJzY2FsYVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwic2NhbGFcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFNjaGVtZTpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJndWlsZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWMnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZ3VpbGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFNDU1M6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInNhc3NcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFwiU2hlbGwgU2NyaXB0XCI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IHByb2Nlc3MuZW52LlNIRUxMXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWMnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IHByb2Nlc3MuZW52LlNIRUxMXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJTaGVsbCBTY3JpcHQgKEZpc2gpXCI6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZmlzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgIC0+IFsnLWMnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwiZmlzaFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJTUUxcIjpcbiAgICBcIlNlbGVjdGlvbiBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJlY2hvXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJ1NRTCByZXF1aXJlcyBzZXR0aW5nIFxcJ1NjcmlwdDogUnVuIE9wdGlvbnNcXCcgZGlyZWN0bHkuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcmdia3JrL2F0b20tc2NyaXB0L3RyZWUvbWFzdGVyL2V4YW1wbGVzL2hlbGxvLnNxbCBmb3IgZnVydGhlciBpbmZvcm1hdGlvbi4nXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJlY2hvXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJ1NRTCByZXF1aXJlcyBzZXR0aW5nIFxcJ1NjcmlwdDogUnVuIE9wdGlvbnNcXCcgZGlyZWN0bHkuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcmdia3JrL2F0b20tc2NyaXB0L3RyZWUvbWFzdGVyL2V4YW1wbGVzL2hlbGxvLnNxbCBmb3IgZnVydGhlciBpbmZvcm1hdGlvbi4nXVxuXG4gIFwiU1FMIChQb3N0Z3JlU1FMKVwiOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInBzcWxcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWMnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwicHNxbFwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZicsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgXCJTdGFuZGFyZCBNTFwiOlxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJzbWxcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmZpbGVwYXRoXVxuXG4gIFN0YXRhOlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInN0YXRhXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAgLT4gWydkbycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgIFwiRmlsZSBCYXNlZFwiOlxuICAgICAgY29tbWFuZDogXCJzdGF0YVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWydkbycsIGNvbnRleHQuZmlsZXBhdGhdXG5cbiAgU3dpZnQ6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInN3aWZ0XCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBUY2w6XG4gICAgXCJTZWxlY3Rpb24gQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwidGNsc2hcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUoKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgW3RtcEZpbGVdXG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInRjbHNoXCJcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbY29udGV4dC5maWxlcGF0aF1cblxuICBUdXJpbmc6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInR1cmluZ1wiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctcnVuJywgY29udGV4dC5maWxlcGF0aF1cblxuICBUeXBlU2NyaXB0OlxuICAgIFwiU2VsZWN0aW9uIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiBcInRzLW5vZGVcIlxuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICBcIkZpbGUgQmFzZWRcIjpcbiAgICAgIGNvbW1hbmQ6IFwidHMtbm9kZVwiXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gW2NvbnRleHQuZmlsZXBhdGhdXG5cbiAgVkJTY3JpcHQ6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnY3NjcmlwdCdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsIFwiLnZic1wiKVxuICAgICAgICBbJy8vTk9MT0dPJyx0bXBGaWxlXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdjc2NyaXB0J1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLy9OT0xPR08nLCBjb250ZXh0LmZpbGVwYXRoXVxuXG4gIEhUTUw6XG4gICAgXCJGaWxlIEJhc2VkXCI6XG4gICAgICBjb21tYW5kOiAnZWNobydcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICB1cmkgPSAnZmlsZTovLycgKyBjb250ZXh0LmZpbGVwYXRoXG4gICAgICAgIHNoZWxsLm9wZW5FeHRlcm5hbCh1cmkpXG4gICAgICAgIFsnSFRNTCBmaWxlIG9wZW5lZCBhdDonLCB1cmldXG4iXX0=
