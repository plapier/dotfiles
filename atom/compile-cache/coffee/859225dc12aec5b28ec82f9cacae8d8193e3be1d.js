(function() {
  var $$, AnsiFilter, BufferedProcess, CodeContext, CompositeDisposable, HeaderView, ScriptOptionsView, ScriptView, View, grammarMap, stripAnsi, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  grammarMap = require('./grammars');

  _ref = require('atom'), BufferedProcess = _ref.BufferedProcess, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('atom-space-pen-views'), View = _ref1.View, $$ = _ref1.$$;

  CodeContext = require('./code-context');

  HeaderView = require('./header-view');

  ScriptOptionsView = require('./script-options-view');

  AnsiFilter = require('ansi-to-html');

  stripAnsi = require('strip-ansi');

  _ = require('underscore');

  module.exports = ScriptView = (function(_super) {
    __extends(ScriptView, _super);

    function ScriptView() {
      return ScriptView.__super__.constructor.apply(this, arguments);
    }

    ScriptView.bufferedProcess = null;

    ScriptView.results = "";

    ScriptView.content = function() {
      return this.div((function(_this) {
        return function() {
          var css;
          _this.subview('headerView', new HeaderView());
          css = 'tool-panel panel panel-bottom padding script-view native-key-bindings';
          return _this.div({
            "class": css,
            outlet: 'script',
            tabindex: -1
          }, function() {
            return _this.div({
              "class": 'panel-body padded output',
              outlet: 'output'
            });
          });
        };
      })(this));
    };

    ScriptView.prototype.initialize = function(serializeState, runOptions) {
      this.runOptions = runOptions;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': (function(_this) {
          return function() {
            return _this.close();
          };
        })(this),
        'core:close': (function(_this) {
          return function() {
            return _this.close();
          };
        })(this),
        'script:close-view': (function(_this) {
          return function() {
            return _this.close();
          };
        })(this),
        'script:copy-run-results': (function(_this) {
          return function() {
            return _this.copyResults();
          };
        })(this),
        'script:kill-process': (function(_this) {
          return function() {
            return _this.stop();
          };
        })(this),
        'script:run-by-line-number': (function(_this) {
          return function() {
            return _this.lineRun();
          };
        })(this),
        'script:run': (function(_this) {
          return function() {
            return _this.defaultRun();
          };
        })(this)
      }));
      return this.ansiFilter = new AnsiFilter;
    };

    ScriptView.prototype.serialize = function() {};

    ScriptView.prototype.updateOptions = function(event) {
      return this.runOptions = event.runOptions;
    };

    ScriptView.prototype.getShebang = function(editor) {
      var firstLine, lines, text;
      text = editor.getText();
      lines = text.split("\n");
      firstLine = lines[0];
      if (!firstLine.match(/^#!/)) {
        return;
      }
      return firstLine.replace(/^#!\s*/, '');
    };

    ScriptView.prototype.initCodeContext = function(editor) {
      var codeContext, filename, filepath, lang, selection, textSource;
      filename = editor.getTitle();
      filepath = editor.getPath();
      selection = editor.getLastSelection();
      if (selection.isEmpty()) {
        textSource = editor;
      } else {
        textSource = selection;
      }
      codeContext = new CodeContext(filename, filepath, textSource);
      codeContext.selection = selection;
      codeContext.shebang = this.getShebang(editor);
      lang = this.getLang(editor);
      if (this.validateLang(lang)) {
        codeContext.lang = lang;
      }
      return codeContext;
    };

    ScriptView.prototype.lineRun = function() {
      var codeContext;
      this.resetView();
      codeContext = this.buildCodeContext('Line Number Based');
      if (!(codeContext == null)) {
        return this.start(codeContext);
      }
    };

    ScriptView.prototype.defaultRun = function() {
      var codeContext;
      this.resetView();
      codeContext = this.buildCodeContext();
      if (!(codeContext == null)) {
        return this.start(codeContext);
      }
    };

    ScriptView.prototype.buildCodeContext = function(argType) {
      var codeContext, cursor, editor;
      if (argType == null) {
        argType = 'Selection Based';
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      codeContext = this.initCodeContext(editor);
      codeContext.argType = argType;
      if (argType === 'Line Number Based') {
        editor.save();
      } else if (codeContext.selection.isEmpty() && (codeContext.filepath != null)) {
        codeContext.argType = 'File Based';
        editor.save();
      }
      if (argType !== 'File Based') {
        cursor = editor.getLastCursor();
        codeContext.lineNumber = cursor.getScreenRow() + 1;
      }
      return codeContext;
    };

    ScriptView.prototype.start = function(codeContext) {
      var commandContext;
      if (codeContext.lang == null) {
        return;
      }
      commandContext = this.setupRuntime(codeContext);
      if (commandContext) {
        return this.run(commandContext.command, commandContext.args, codeContext);
      }
    };

    ScriptView.prototype.resetView = function(title) {
      if (title == null) {
        title = 'Loading...';
      }
      if (!this.hasParent()) {
        atom.workspace.addBottomPanel({
          item: this
        });
      }
      this.stop();
      this.headerView.title.text(title);
      this.headerView.setStatus('start');
      this.output.empty();
      return this.results = "";
    };

    ScriptView.prototype.close = function() {
      this.stop();
      if (this.hasParent()) {
        return this.detach();
      }
    };

    ScriptView.prototype.destroy = function() {
      var _ref2;
      return (_ref2 = this.subscriptions) != null ? _ref2.dispose() : void 0;
    };

    ScriptView.prototype.getLang = function(editor) {
      return editor.getGrammar().name;
    };

    ScriptView.prototype.validateLang = function(lang) {
      var err;
      err = null;
      if (lang === 'Null Grammar' || lang === 'Plain Text') {
        err = $$(function() {
          return this.p('You must select a language in the lower right, or save the file with an appropriate extension.');
        });
      } else if (!(lang in grammarMap)) {
        err = $$(function() {
          this.p({
            "class": 'block'
          }, "Command not configured for " + lang + "!");
          return this.p({
            "class": 'block'
          }, (function(_this) {
            return function() {
              _this.text('Add an ');
              _this.a({
                href: "https://github.com/rgbkrk/atom-script/issues/new?title=Add%20support%20for%20" + lang
              }, 'issue on GitHub');
              return _this.text(' or send your own Pull Request.');
            };
          })(this));
        });
      }
      if (err != null) {
        this.handleError(err);
        return false;
      }
      return true;
    };

    ScriptView.prototype.setupRuntime = function(codeContext) {
      var buildArgsArray, commandContext, err, error, errorSendByArgs;
      commandContext = {};
      try {
        if ((this.runOptions.cmd == null) || this.runOptions.cmd === '') {
          commandContext.command = codeContext.shebangCommand() || grammarMap[codeContext.lang][codeContext.argType].command;
        } else {
          commandContext.command = this.runOptions.cmd;
        }
        buildArgsArray = grammarMap[codeContext.lang][codeContext.argType].args;
      } catch (_error) {
        error = _error;
        err = this.createGitHubIssueLink(codeContext);
        this.handleError(err);
        return false;
      }
      if (codeContext.argType === 'Line Number Based') {
        this.headerView.title.text("" + codeContext.lang + " - " + (codeContext.fileColonLine(false)));
      } else {
        this.headerView.title.text("" + codeContext.lang + " - " + codeContext.filename);
      }
      try {
        commandContext.args = buildArgsArray(codeContext);
      } catch (_error) {
        errorSendByArgs = _error;
        this.handleError(errorSendByArgs);
        return false;
      }
      return commandContext;
    };

    ScriptView.prototype.createGitHubIssueLink = function(codeContext) {
      var body, encodedURI, title;
      title = "Add " + codeContext.argType + " support for " + codeContext.lang;
      body = "##### Platform: `" + process.platform + "`\n---";
      encodedURI = encodeURI("https://github.com/rgbkrk/atom-script/issues/new?title=" + title + "&body=" + body);
      encodedURI = encodedURI.replace(/#/g, '%23');
      return $$(function() {
        this.p({
          "class": 'block'
        }, "" + codeContext.argType + " runner not available for " + codeContext.lang + ".");
        return this.p({
          "class": 'block'
        }, (function(_this) {
          return function() {
            _this.text('If it should exist, add an ');
            _this.a({
              href: encodedURI
            }, 'issue on GitHub');
            return _this.text(', or send your own pull request.');
          };
        })(this));
      });
    };

    ScriptView.prototype.handleError = function(err) {
      this.headerView.title.text('Error');
      this.headerView.setStatus('err');
      this.output.append(err);
      return this.stop();
    };

    ScriptView.prototype.run = function(command, extraArgs, codeContext) {
      var args, exit, options, startTime, stderr, stdout;
      startTime = new Date();
      options = {
        cwd: this.getCwd(),
        env: this.runOptions.mergedEnv(process.env)
      };
      args = (this.runOptions.cmdArgs.concat(extraArgs)).concat(this.runOptions.scriptArgs);
      if ((this.runOptions.cmd == null) || this.runOptions.cmd === '') {
        args = codeContext.shebangCommandArgs().concat(args);
      }
      stdout = (function(_this) {
        return function(output) {
          return _this.display('stdout', output);
        };
      })(this);
      stderr = (function(_this) {
        return function(output) {
          return _this.display('stderr', output);
        };
      })(this);
      exit = (function(_this) {
        return function(returnCode) {
          var executionTime;
          _this.bufferedProcess = null;
          if ((atom.config.get('script.enableExecTime')) === true) {
            executionTime = (new Date().getTime() - startTime.getTime()) / 1000;
            _this.display('stdout', '[Finished in ' + executionTime.toString() + 's]');
          }
          if (returnCode === 0) {
            _this.headerView.setStatus('stop');
          } else {
            _this.headerView.setStatus('err');
          }
          return console.log("Exited with " + returnCode);
        };
      })(this);
      this.bufferedProcess = new BufferedProcess({
        command: command,
        args: args,
        options: options,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
      return this.bufferedProcess.onWillThrowError((function(_this) {
        return function(nodeError) {
          _this.bufferedProcess = null;
          _this.output.append($$(function() {
            this.h1('Unable to run');
            this.pre(_.escape(command));
            this.h2('Is it on your path?');
            return this.pre("PATH: " + (_.escape(process.env.PATH)));
          }));
          return nodeError.handle();
        };
      })(this));
    };

    ScriptView.prototype.getCwd = function() {
      var cwd, paths, workingDirectoryProvided;
      cwd = this.runOptions.workingDirectory;
      workingDirectoryProvided = (cwd != null) && cwd !== '';
      paths = atom.project.getPaths();
      if (!workingDirectoryProvided && (paths != null ? paths.length : void 0) > 0) {
        cwd = paths[0];
      }
      return cwd;
    };

    ScriptView.prototype.stop = function() {
      if (this.bufferedProcess != null) {
        this.display('stdout', '^C');
        this.headerView.setStatus('kill');
        this.bufferedProcess.kill();
        return this.bufferedProcess = null;
      }
    };

    ScriptView.prototype.display = function(css, line) {
      var lessThanFull, padding, scrolledToEnd;
      this.results += line;
      if (atom.config.get('script.escapeConsoleOutput')) {
        line = _.escape(line);
      }
      line = this.ansiFilter.toHtml(line);
      padding = parseInt(this.output.css('padding-bottom'));
      scrolledToEnd = this.script.scrollBottom() === (padding + this.output.trueHeight());
      lessThanFull = this.output.trueHeight() <= this.script.trueHeight();
      this.output.append($$(function() {
        return this.pre({
          "class": "line " + css
        }, (function(_this) {
          return function() {
            return _this.raw(line);
          };
        })(this));
      }));
      if (atom.config.get('script.scrollWithOutput')) {
        if (lessThanFull || scrolledToEnd) {
          return this.script.scrollTop(this.output.trueHeight());
        }
      }
    };

    ScriptView.prototype.copyResults = function() {
      if (this.results) {
        return atom.clipboard.write(stripAnsi(this.results));
      }
    };

    return ScriptView;

  })(View);

}).call(this);
