Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('atom');

var _atomSpacePenViews = require('atom-space-pen-views');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _scriptInputView = require('./script-input-view');

var _scriptInputView2 = _interopRequireDefault(_scriptInputView);

'use babel';

var ScriptOptionsView = (function (_View) {
  _inherits(ScriptOptionsView, _View);

  function ScriptOptionsView() {
    _classCallCheck(this, ScriptOptionsView);

    _get(Object.getPrototypeOf(ScriptOptionsView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ScriptOptionsView, [{
    key: 'initialize',
    value: function initialize(runOptions) {
      var _this = this;

      this.runOptions = runOptions;
      this.emitter = new _atom.Emitter();

      this.subscriptions = new _atom.CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': function coreCancel() {
          return _this.hide();
        },
        'core:close': function coreClose() {
          return _this.hide();
        },
        'script:close-options': function scriptCloseOptions() {
          return _this.hide();
        },
        'script:run-options': function scriptRunOptions() {
          return _this.panel.isVisible() ? _this.hide() : _this.show();
        },
        'script:save-options': function scriptSaveOptions() {
          return _this.saveOptions();
        }
      }));

      // handling focus traversal and run on enter
      this.find('atom-text-editor').on('keydown', function (e) {
        if (e.keyCode !== 9 && e.keyCode !== 13) return true;

        switch (e.keyCode) {
          case 9:
            {
              e.preventDefault();
              e.stopPropagation();
              var row = _this.find(e.target).parents('tr:first').nextAll('tr:first');
              if (row.length) {
                return row.find('atom-text-editor').focus();
              }
              return _this.buttonCancel.focus();
            }
          case 13:
            return _this.run();
        }
        return null;
      });

      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.hide();
    }
  }, {
    key: 'splitArgs',
    value: function splitArgs(element) {
      var args = element.get(0).getModel().getText().trim();

      if (args.indexOf('"') === -1 && args.indexOf("'") === -1) {
        // no escaping, just split
        return args.split(' ').filter(function (item) {
          return item !== '';
        }).map(function (item) {
          return item;
        });
      }

      var replaces = {};

      var regexps = [/"[^"]*"/ig, /'[^']*'/ig];

      var matches = undefined;
      // find strings in arguments
      regexps.forEach(function (regex) {
        matches = (!matches ? matches : []).concat(args.match(regex) || []);
      });

      // format replacement as bash comment to avoid replacing valid input
      matches.forEach(function (match) {
        replaces['`#match' + (Object.keys(replaces).length + 1) + '`'] = match;
      });

      // replace strings
      for (var match in replaces) {
        var part = replaces[match];
        args = args.replace(new RegExp(part, 'g'), match);
      }
      var split = args.split(' ').filter(function (item) {
        return item !== '';
      }).map(function (item) {
        return item;
      });

      var replacer = function replacer(argument) {
        for (var match in replaces) {
          var replacement = replaces[match];
          argument = argument.replace(match, replacement);
        }
        return argument;
      };

      // restore strings, strip quotes
      return split.map(function (argument) {
        return replacer(argument).replace(/"|'/g, '');
      });
    }
  }, {
    key: 'getOptions',
    value: function getOptions() {
      return {
        workingDirectory: this.inputCwd.get(0).getModel().getText(),
        cmd: this.inputCommand.get(0).getModel().getText(),
        cmdArgs: this.splitArgs(this.inputCommandArgs),
        env: this.inputEnv.get(0).getModel().getText(),
        scriptArgs: this.splitArgs(this.inputScriptArgs)
      };
    }
  }, {
    key: 'saveOptions',
    value: function saveOptions() {
      var options = this.getOptions();
      for (var option in options) {
        var value = options[option];
        this.runOptions[option] = value;
      }
    }
  }, {
    key: 'onProfileSave',
    value: function onProfileSave(callback) {
      return this.emitter.on('on-profile-save', callback);
    }

    // Saves specified options as new profile
  }, {
    key: 'saveProfile',
    value: function saveProfile() {
      var _this2 = this;

      this.hide();

      var options = this.getOptions();

      var inputView = new _scriptInputView2['default']({ caption: 'Enter profile name:' });
      inputView.onCancel(function () {
        return _this2.show();
      });
      inputView.onConfirm(function (profileName) {
        if (!profileName) return;
        _underscore2['default'].forEach(_this2.find('atom-text-editor'), function (editor) {
          editor.getModel().setText('');
        });

        // clean up the options
        _this2.saveOptions();

        // add to global profiles list
        _this2.emitter.emit('on-profile-save', { name: profileName, options: options });
      });

      inputView.show();
    }
  }, {
    key: 'close',
    value: function close() {
      this.hide();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.subscriptions) this.subscriptions.dispose();
    }
  }, {
    key: 'show',
    value: function show() {
      this.panel.show();
      this.inputCwd.focus();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'run',
    value: function run() {
      this.saveOptions();
      this.hide();
      atom.commands.dispatch(this.getWorkspaceView(), 'script:run');
    }
  }, {
    key: 'getWorkspaceView',
    value: function getWorkspaceView() {
      return atom.views.getView(atom.workspace);
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      this.div({ 'class': 'options-view' }, function () {
        _this3.div({ 'class': 'panel-heading' }, 'Configure Run Options');
        _this3.table(function () {
          _this3.tr(function () {
            _this3.td({ 'class': 'first' }, function () {
              return _this3.label('Current Working Directory:');
            });
            _this3.td({ 'class': 'second' }, function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCwd' });
            });
          });
          _this3.tr(function () {
            _this3.td(function () {
              return _this3.label('Command');
            });
            _this3.td(function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCommand' });
            });
          });
          _this3.tr(function () {
            _this3.td(function () {
              return _this3.label('Command Arguments:');
            });
            _this3.td(function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputCommandArgs' });
            });
          });
          _this3.tr(function () {
            _this3.td(function () {
              return _this3.label('Program Arguments:');
            });
            _this3.td(function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputScriptArgs' });
            });
          });
          _this3.tr(function () {
            _this3.td(function () {
              return _this3.label('Environment Variables:');
            });
            _this3.td(function () {
              return _this3.tag('atom-text-editor', { mini: '', 'class': 'editor mini', outlet: 'inputEnv' });
            });
          });
        });
        _this3.div({ 'class': 'block buttons' }, function () {
          var css = 'btn inline-block-tight';
          _this3.button({ 'class': 'btn ' + css + ' cancel', outlet: 'buttonCancel', click: 'close' }, function () {
            return _this3.span({ 'class': 'icon icon-x' }, 'Cancel');
          });
          _this3.span({ 'class': 'right-buttons' }, function () {
            _this3.button({ 'class': 'btn ' + css + ' save-profile', outlet: 'buttonSaveProfile', click: 'saveProfile' }, function () {
              return _this3.span({ 'class': 'icon icon-file-text' }, 'Save as profile');
            });
            _this3.button({ 'class': 'btn ' + css + ' run', outlet: 'buttonRun', click: 'run' }, function () {
              return _this3.span({ 'class': 'icon icon-playback-play' }, 'Run');
            });
          });
        });
      });
    }
  }]);

  return ScriptOptionsView;
})(_atomSpacePenViews.View);

exports['default'] = ScriptOptionsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LW9wdGlvbnMtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFNkMsTUFBTTs7aUNBQzlCLHNCQUFzQjs7MEJBQzdCLFlBQVk7Ozs7K0JBQ0UscUJBQXFCOzs7O0FBTGpELFdBQVcsQ0FBQzs7SUFPUyxpQkFBaUI7WUFBakIsaUJBQWlCOztXQUFqQixpQkFBaUI7MEJBQWpCLGlCQUFpQjs7K0JBQWpCLGlCQUFpQjs7O2VBQWpCLGlCQUFpQjs7V0E0QzFCLG9CQUFDLFVBQVUsRUFBRTs7O0FBQ3JCLFVBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQzs7QUFFN0IsVUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQztBQUMvQyxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCxxQkFBYSxFQUFFO2lCQUFNLE1BQUssSUFBSSxFQUFFO1NBQUE7QUFDaEMsb0JBQVksRUFBRTtpQkFBTSxNQUFLLElBQUksRUFBRTtTQUFBO0FBQy9CLDhCQUFzQixFQUFFO2lCQUFNLE1BQUssSUFBSSxFQUFFO1NBQUE7QUFDekMsNEJBQW9CLEVBQUU7aUJBQU8sTUFBSyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsTUFBSyxJQUFJLEVBQUUsR0FBRyxNQUFLLElBQUksRUFBRTtTQUFDO0FBQ2hGLDZCQUFxQixFQUFFO2lCQUFNLE1BQUssV0FBVyxFQUFFO1NBQUE7T0FDaEQsQ0FBQyxDQUFDLENBQUM7OztBQUdKLFVBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQUMsQ0FBQyxFQUFL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QixpQkFBaUIiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9zY3JpcHQtb3B0aW9ucy12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7IFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCBTY3JpcHRJbnB1dFZpZXcgZnJvbSAnLi9zY3JpcHQtaW5wdXQtdmlldyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmlwdE9wdGlvbnNWaWV3IGV4dGVuZHMgVmlldyB7XG5cbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgdGhpcy5kaXYoeyBjbGFzczogJ29wdGlvbnMtdmlldycgfSwgKCkgPT4ge1xuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ3BhbmVsLWhlYWRpbmcnIH0sICdDb25maWd1cmUgUnVuIE9wdGlvbnMnKTtcbiAgICAgIHRoaXMudGFibGUoKCkgPT4ge1xuICAgICAgICB0aGlzLnRyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnRkKHsgY2xhc3M6ICdmaXJzdCcgfSwgKCkgPT4gdGhpcy5sYWJlbCgnQ3VycmVudCBXb3JraW5nIERpcmVjdG9yeTonKSk7XG4gICAgICAgICAgdGhpcy50ZCh7IGNsYXNzOiAnc2Vjb25kJyB9LCAoKSA9PiB0aGlzLnRhZygnYXRvbS10ZXh0LWVkaXRvcicsIHsgbWluaTogJycsIGNsYXNzOiAnZWRpdG9yIG1pbmknLCBvdXRsZXQ6ICdpbnB1dEN3ZCcgfSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50cigoKSA9PiB7XG4gICAgICAgICAgdGhpcy50ZCgoKSA9PiB0aGlzLmxhYmVsKCdDb21tYW5kJykpO1xuICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy50YWcoJ2F0b20tdGV4dC1lZGl0b3InLCB7IG1pbmk6ICcnLCBjbGFzczogJ2VkaXRvciBtaW5pJywgb3V0bGV0OiAnaW5wdXRDb21tYW5kJyB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnRkKCgpID0+IHRoaXMubGFiZWwoJ0NvbW1hbmQgQXJndW1lbnRzOicpKTtcbiAgICAgICAgICB0aGlzLnRkKCgpID0+IHRoaXMudGFnKCdhdG9tLXRleHQtZWRpdG9yJywgeyBtaW5pOiAnJywgY2xhc3M6ICdlZGl0b3IgbWluaScsIG91dGxldDogJ2lucHV0Q29tbWFuZEFyZ3MnIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudHIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy5sYWJlbCgnUHJvZ3JhbSBBcmd1bWVudHM6JykpO1xuICAgICAgICAgIHRoaXMudGQoKCkgPT4gdGhpcy50YWcoJ2F0b20tdGV4dC1lZGl0b3InLCB7IG1pbmk6ICcnLCBjbGFzczogJ2VkaXRvciBtaW5pJywgb3V0bGV0OiAnaW5wdXRTY3JpcHRBcmdzJyB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnRkKCgpID0+IHRoaXMubGFiZWwoJ0Vudmlyb25tZW50IFZhcmlhYmxlczonKSk7XG4gICAgICAgICAgdGhpcy50ZCgoKSA9PiB0aGlzLnRhZygnYXRvbS10ZXh0LWVkaXRvcicsIHsgbWluaTogJycsIGNsYXNzOiAnZWRpdG9yIG1pbmknLCBvdXRsZXQ6ICdpbnB1dEVudicgfSkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ2Jsb2NrIGJ1dHRvbnMnIH0sICgpID0+IHtcbiAgICAgICAgY29uc3QgY3NzID0gJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQnO1xuICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiBgYnRuICR7Y3NzfSBjYW5jZWxgLCBvdXRsZXQ6ICdidXR0b25DYW5jZWwnLCBjbGljazogJ2Nsb3NlJyB9LCAoKSA9PlxuICAgICAgICAgIHRoaXMuc3Bhbih7IGNsYXNzOiAnaWNvbiBpY29uLXgnIH0sICdDYW5jZWwnKSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zcGFuKHsgY2xhc3M6ICdyaWdodC1idXR0b25zJyB9LCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5idXR0b24oeyBjbGFzczogYGJ0biAke2Nzc30gc2F2ZS1wcm9maWxlYCwgb3V0bGV0OiAnYnV0dG9uU2F2ZVByb2ZpbGUnLCBjbGljazogJ3NhdmVQcm9maWxlJyB9LCAoKSA9PlxuICAgICAgICAgICAgdGhpcy5zcGFuKHsgY2xhc3M6ICdpY29uIGljb24tZmlsZS10ZXh0JyB9LCAnU2F2ZSBhcyBwcm9maWxlJyksXG4gICAgICAgICAgKTtcbiAgICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiBgYnRuICR7Y3NzfSBydW5gLCBvdXRsZXQ6ICdidXR0b25SdW4nLCBjbGljazogJ3J1bicgfSwgKCkgPT5cbiAgICAgICAgICAgIHRoaXMuc3Bhbih7IGNsYXNzOiAnaWNvbiBpY29uLXBsYXliYWNrLXBsYXknIH0sICdSdW4nKSxcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShydW5PcHRpb25zKSB7XG4gICAgdGhpcy5ydW5PcHRpb25zID0gcnVuT3B0aW9ucztcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdjb3JlOmNhbmNlbCc6ICgpID0+IHRoaXMuaGlkZSgpLFxuICAgICAgJ2NvcmU6Y2xvc2UnOiAoKSA9PiB0aGlzLmhpZGUoKSxcbiAgICAgICdzY3JpcHQ6Y2xvc2Utb3B0aW9ucyc6ICgpID0+IHRoaXMuaGlkZSgpLFxuICAgICAgJ3NjcmlwdDpydW4tb3B0aW9ucyc6ICgpID0+ICh0aGlzLnBhbmVsLmlzVmlzaWJsZSgpID8gdGhpcy5oaWRlKCkgOiB0aGlzLnNob3coKSksXG4gICAgICAnc2NyaXB0OnNhdmUtb3B0aW9ucyc6ICgpID0+IHRoaXMuc2F2ZU9wdGlvbnMoKSxcbiAgICB9KSk7XG5cbiAgICAvLyBoYW5kbGluZyBmb2N1cyB0cmF2ZXJzYWwgYW5kIHJ1biBvbiBlbnRlclxuICAgIHRoaXMuZmluZCgnYXRvbS10ZXh0LWVkaXRvcicpLm9uKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgIGlmIChlLmtleUNvZGUgIT09IDkgJiYgZS5rZXlDb2RlICE9PSAxMykgcmV0dXJuIHRydWU7XG5cbiAgICAgIHN3aXRjaCAoZS5rZXlDb2RlKSB7XG4gICAgICAgIGNhc2UgOToge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZmluZChlLnRhcmdldCkucGFyZW50cygndHI6Zmlyc3QnKS5uZXh0QWxsKCd0cjpmaXJzdCcpO1xuICAgICAgICAgIGlmIChyb3cubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gcm93LmZpbmQoJ2F0b20tdGV4dC1lZGl0b3InKS5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhpcy5idXR0b25DYW5jZWwuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIDEzOiByZXR1cm4gdGhpcy5ydW4oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuXG4gICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiB0aGlzIH0pO1xuICAgIHRoaXMucGFuZWwuaGlkZSgpO1xuICB9XG5cbiAgc3BsaXRBcmdzKGVsZW1lbnQpIHtcbiAgICBsZXQgYXJncyA9IGVsZW1lbnQuZ2V0KDApLmdldE1vZGVsKCkuZ2V0VGV4dCgpLnRyaW0oKTtcblxuICAgIGlmIChhcmdzLmluZGV4T2YoJ1wiJykgPT09IC0xICYmIGFyZ3MuaW5kZXhPZihcIidcIikgPT09IC0xKSB7XG4gICAgICAvLyBubyBlc2NhcGluZywganVzdCBzcGxpdFxuICAgICAgcmV0dXJuIChhcmdzLnNwbGl0KCcgJykuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gJycpLm1hcChpdGVtID0+IGl0ZW0pKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXBsYWNlcyA9IHt9O1xuXG4gICAgY29uc3QgcmVnZXhwcyA9IFsvXCJbXlwiXSpcIi9pZywgLydbXiddKicvaWddO1xuXG4gICAgbGV0IG1hdGNoZXM7XG4gICAgLy8gZmluZCBzdHJpbmdzIGluIGFyZ3VtZW50c1xuICAgIHJlZ2V4cHMuZm9yRWFjaCgocmVnZXgpID0+IHtcbiAgICAgIG1hdGNoZXMgPSAoIW1hdGNoZXMgPyBtYXRjaGVzIDogW10pLmNvbmNhdCgoYXJncy5tYXRjaChyZWdleCkpIHx8IFtdKTtcbiAgICB9KTtcblxuICAgIC8vIGZvcm1hdCByZXBsYWNlbWVudCBhcyBiYXNoIGNvbW1lbnQgdG8gYXZvaWQgcmVwbGFjaW5nIHZhbGlkIGlucHV0XG4gICAgbWF0Y2hlcy5mb3JFYWNoKChtYXRjaCkgPT4ge1xuICAgICAgcmVwbGFjZXNbYFxcYCNtYXRjaCR7T2JqZWN0LmtleXMocmVwbGFjZXMpLmxlbmd0aCArIDF9XFxgYF0gPSBtYXRjaDtcbiAgICB9KTtcblxuICAgIC8vIHJlcGxhY2Ugc3RyaW5nc1xuICAgIGZvciAoY29uc3QgbWF0Y2ggaW4gcmVwbGFjZXMpIHtcbiAgICAgIGNvbnN0IHBhcnQgPSByZXBsYWNlc1ttYXRjaF07XG4gICAgICBhcmdzID0gYXJncy5yZXBsYWNlKG5ldyBSZWdFeHAocGFydCwgJ2cnKSwgbWF0Y2gpO1xuICAgIH1cbiAgICBjb25zdCBzcGxpdCA9IChhcmdzLnNwbGl0KCcgJykuZmlsdGVyKGl0ZW0gPT4gaXRlbSAhPT0gJycpLm1hcChpdGVtID0+IGl0ZW0pKTtcblxuICAgIGNvbnN0IHJlcGxhY2VyID0gKGFyZ3VtZW50KSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IG1hdGNoIGluIHJlcGxhY2VzKSB7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gcmVwbGFjZXNbbWF0Y2hdO1xuICAgICAgICBhcmd1bWVudCA9IGFyZ3VtZW50LnJlcGxhY2UobWF0Y2gsIHJlcGxhY2VtZW50KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmd1bWVudDtcbiAgICB9O1xuXG4gICAgLy8gcmVzdG9yZSBzdHJpbmdzLCBzdHJpcCBxdW90ZXNcbiAgICByZXR1cm4gc3BsaXQubWFwKGFyZ3VtZW50ID0+IHJlcGxhY2VyKGFyZ3VtZW50KS5yZXBsYWNlKC9cInwnL2csICcnKSk7XG4gIH1cblxuICBnZXRPcHRpb25zKCkge1xuICAgIHJldHVybiB7XG4gICAgICB3b3JraW5nRGlyZWN0b3J5OiB0aGlzLmlucHV0Q3dkLmdldCgwKS5nZXRNb2RlbCgpLmdldFRleHQoKSxcbiAgICAgIGNtZDogdGhpcy5pbnB1dENvbW1hbmQuZ2V0KDApLmdldE1vZGVsKCkuZ2V0VGV4dCgpLFxuICAgICAgY21kQXJnczogdGhpcy5zcGxpdEFyZ3ModGhpcy5pbnB1dENvbW1hbmRBcmdzKSxcbiAgICAgIGVudjogdGhpcy5pbnB1dEVudi5nZXQoMCkuZ2V0TW9kZWwoKS5nZXRUZXh0KCksXG4gICAgICBzY3JpcHRBcmdzOiB0aGlzLnNwbGl0QXJncyh0aGlzLmlucHV0U2NyaXB0QXJncyksXG4gICAgfTtcbiAgfVxuXG4gIHNhdmVPcHRpb25zKCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMoKTtcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBpbiBvcHRpb25zKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgIHRoaXMucnVuT3B0aW9uc1tvcHRpb25dID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgb25Qcm9maWxlU2F2ZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29uLXByb2ZpbGUtc2F2ZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFNhdmVzIHNwZWNpZmllZCBvcHRpb25zIGFzIG5ldyBwcm9maWxlXG4gIHNhdmVQcm9maWxlKCkge1xuICAgIHRoaXMuaGlkZSgpO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucygpO1xuXG4gICAgY29uc3QgaW5wdXRWaWV3ID0gbmV3IFNjcmlwdElucHV0Vmlldyh7IGNhcHRpb246ICdFbnRlciBwcm9maWxlIG5hbWU6JyB9KTtcbiAgICBpbnB1dFZpZXcub25DYW5jZWwoKCkgPT4gdGhpcy5zaG93KCkpO1xuICAgIGlucHV0Vmlldy5vbkNvbmZpcm0oKHByb2ZpbGVOYW1lKSA9PiB7XG4gICAgICBpZiAoIXByb2ZpbGVOYW1lKSByZXR1cm47XG4gICAgICBfLmZvckVhY2godGhpcy5maW5kKCdhdG9tLXRleHQtZWRpdG9yJyksIChlZGl0b3IpID0+IHtcbiAgICAgICAgZWRpdG9yLmdldE1vZGVsKCkuc2V0VGV4dCgnJyk7XG4gICAgICB9KTtcblxuICAgICAgLy8gY2xlYW4gdXAgdGhlIG9wdGlvbnNcbiAgICAgIHRoaXMuc2F2ZU9wdGlvbnMoKTtcblxuICAgICAgLy8gYWRkIHRvIGdsb2JhbCBwcm9maWxlcyBsaXN0XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnb24tcHJvZmlsZS1zYXZlJywgeyBuYW1lOiBwcm9maWxlTmFtZSwgb3B0aW9ucyB9KTtcbiAgICB9KTtcblxuICAgIGlucHV0Vmlldy5zaG93KCk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLmhpZGUoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuc3Vic2NyaXB0aW9ucykgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNob3coKSB7XG4gICAgdGhpcy5wYW5lbC5zaG93KCk7XG4gICAgdGhpcy5pbnB1dEN3ZC5mb2N1cygpO1xuICB9XG5cbiAgaGlkZSgpIHtcbiAgICB0aGlzLnBhbmVsLmhpZGUoKTtcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKTtcbiAgfVxuXG4gIHJ1bigpIHtcbiAgICB0aGlzLnNhdmVPcHRpb25zKCk7XG4gICAgdGhpcy5oaWRlKCk7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0aGlzLmdldFdvcmtzcGFjZVZpZXcoKSwgJ3NjcmlwdDpydW4nKTtcbiAgfVxuXG4gIGdldFdvcmtzcGFjZVZpZXcoKSB7XG4gICAgcmV0dXJuIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gIH1cbn1cbiJdfQ==