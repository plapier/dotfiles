Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable func-names */

var _atomSpacePenViews = require('atom-space-pen-views');

var _atomMessagePanel = require('atom-message-panel');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _ansiToHtml = require('ansi-to-html');

var _ansiToHtml2 = _interopRequireDefault(_ansiToHtml);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _headerView = require('./header-view');

var _headerView2 = _interopRequireDefault(_headerView);

var _linkPaths = require('./link-paths');

var _linkPaths2 = _interopRequireDefault(_linkPaths);

// Runs a portion of a script through an interpreter and displays it line by line
'use babel';
var ScriptView = (function (_MessagePanelView) {
  _inherits(ScriptView, _MessagePanelView);

  function ScriptView() {
    _classCallCheck(this, ScriptView);

    var headerView = new _headerView2['default']();
    _get(Object.getPrototypeOf(ScriptView.prototype), 'constructor', this).call(this, { title: headerView, rawTitle: true, closeMethod: 'destroy' });

    this.scrollTimeout = null;
    this.ansiFilter = new _ansiToHtml2['default']();
    this.headerView = headerView;

    this.showInTab = this.showInTab.bind(this);
    this.setHeaderAndShowExecutionTime = this.setHeaderAndShowExecutionTime.bind(this);
    this.addClass('script-view');
    this.addShowInTabIcon();

    _linkPaths2['default'].listen(this.body);
  }

  _createClass(ScriptView, [{
    key: 'addShowInTabIcon',
    value: function addShowInTabIcon() {
      var icon = (0, _atomSpacePenViews.$$)(function () {
        this.div({
          'class': 'heading-show-in-tab inline-block icon-file-text',
          style: 'cursor: pointer;',
          outlet: 'btnShowInTab',
          title: 'Show output in new tab'
        });
      });

      icon.click(this.showInTab);
      icon.insertBefore(this.btnAutoScroll);
    }
  }, {
    key: 'showInTab',
    value: function showInTab() {
      // concat output
      var output = '';
      for (var message of this.messages) {
        output += message.text();
      }

      // represent command context
      var context = '';
      if (this.commandContext) {
        context = '[Command: ' + this.commandContext.getRepresentation() + ']\n';
      }

      // open new tab and set content to output
      atom.workspace.open().then(function (editor) {
        return editor.setText((0, _stripAnsi2['default'])(context + output));
      });
    }
  }, {
    key: 'setHeaderAndShowExecutionTime',
    value: function setHeaderAndShowExecutionTime(returnCode, executionTime) {
      if (executionTime) {
        this.display('stdout', '[Finished in ' + executionTime.toString() + 's]');
      } else {
        this.display('stdout');
      }

      if (returnCode === 0) {
        this.setHeaderStatus('stop');
      } else {
        this.setHeaderStatus('err');
      }
    }
  }, {
    key: 'resetView',
    value: function resetView() {
      var title = arguments.length <= 0 || arguments[0] === undefined ? 'Loading...' : arguments[0];

      // Display window and load message

      // First run, create view
      if (!this.hasParent()) {
        this.attach();
      }

      this.setHeaderTitle(title);
      this.setHeaderStatus('start');

      // Get script view ready
      this.clear();
    }
  }, {
    key: 'removePanel',
    value: function removePanel() {
      this.stop();
      this.detach();
      // the 'close' method from MessagePanelView actually destroys the panel
      Object.getPrototypeOf(ScriptView.prototype).close.apply(this);
    }

    // This is triggered when hitting the 'close' button on the panel
    // We are not actually closing the panel here since we want to trigger
    // 'script:close-view' which will eventually remove the panel via 'removePanel'
  }, {
    key: 'close',
    value: function close() {
      var workspaceView = atom.views.getView(atom.workspace);
      atom.commands.dispatch(workspaceView, 'script:close-view');
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.display('stdout', '^C');
      this.setHeaderStatus('kill');
    }
  }, {
    key: 'createGitHubIssueLink',
    value: function createGitHubIssueLink(argType, lang) {
      var title = 'Add ' + argType + ' support for ' + lang;
      var body = '##### Platform: `' + process.platform + '`\n---\n';
      var encodedURI = encodeURI('https://github.com/rgbkrk/atom-script/issues/new?title=' + title + '&body=' + body);
      // NOTE: Replace "#" after regular encoding so we don't double escape it.
      encodedURI = encodedURI.replace(/#/g, '%23');

      var err = (0, _atomSpacePenViews.$$)(function () {
        var _this = this;

        this.p({ 'class': 'block' }, argType + ' runner not available for ' + lang + '.');
        this.p({ 'class': 'block' }, function () {
          _this.text('If it should exist, add an ');
          _this.a({ href: encodedURI }, 'issue on GitHub');
          _this.text(', or send your own pull request.');
        });
      });
      this.handleError(err);
    }
  }, {
    key: 'showUnableToRunError',
    value: function showUnableToRunError(command) {
      this.add((0, _atomSpacePenViews.$$)(function () {
        this.h1('Unable to run');
        this.pre(_underscore2['default'].escape(command));
        this.h2('Did you start Atom from the command line?');
        this.pre('  atom .');
        this.h2('Is it in your PATH?');
        this.pre('PATH: ' + _underscore2['default'].escape(process.env.PATH));
      }));
    }
  }, {
    key: 'showNoLanguageSpecified',
    value: function showNoLanguageSpecified() {
      var err = (0, _atomSpacePenViews.$$)(function () {
        this.p('You must select a language in the lower right, or save the file with an appropriate extension.');
      });
      this.handleError(err);
    }
  }, {
    key: 'showLanguageNotSupported',
    value: function showLanguageNotSupported(lang) {
      var err = (0, _atomSpacePenViews.$$)(function () {
        var _this2 = this;

        this.p({ 'class': 'block' }, 'Command not configured for ' + lang + '!');
        this.p({ 'class': 'block' }, function () {
          _this2.text('Add an ');
          _this2.a({ href: 'https://github.com/rgbkrk/atom-script/issues/new?title=Add%20support%20for%20' + lang }, 'issue on GitHub');
          _this2.text(' or send your own Pull Request.');
        });
      });
      this.handleError(err);
    }
  }, {
    key: 'handleError',
    value: function handleError(err) {
      // Display error and kill process
      this.setHeaderTitle('Error');
      this.setHeaderStatus('err');
      this.add(err);
      this.stop();
    }
  }, {
    key: 'setHeaderStatus',
    value: function setHeaderStatus(status) {
      this.headerView.setStatus(status);
    }
  }, {
    key: 'setHeaderTitle',
    value: function setHeaderTitle(title) {
      this.headerView.title.text(title);
    }
  }, {
    key: 'display',
    value: function display(css, line) {
      if (atom.config.get('script.escapeConsoleOutput')) {
        line = _underscore2['default'].escape(line);
      }

      line = this.ansiFilter.toHtml(line);
      line = (0, _linkPaths2['default'])(line);

      var _body$0 = this.body[0];
      var clientHeight = _body$0.clientHeight;
      var scrollTop = _body$0.scrollTop;
      var scrollHeight = _body$0.scrollHeight;

      // indicates that the panel is scrolled to the bottom, thus we know that
      // we are not interfering with the user's manual scrolling
      var atEnd = scrollTop >= scrollHeight - clientHeight;

      this.add((0, _atomSpacePenViews.$$)(function () {
        var _this3 = this;

        this.pre({ 'class': 'line ' + css }, function () {
          return _this3.raw(line);
        });
      }));

      if (atom.config.get('script.scrollWithOutput') && atEnd) {
        // Scroll down in a polling loop 'cause
        // we don't know when the reflow will finish.
        // See: http://stackoverflow.com/q/5017923/407845
        this.checkScrollAgain(5)();
      }
    }
  }, {
    key: 'checkScrollAgain',
    value: function checkScrollAgain(times) {
      var _this4 = this;

      return function () {
        _this4.body.scrollToBottom();

        clearTimeout(_this4.scrollTimeout);
        if (times > 1) {
          _this4.scrollTimeout = setTimeout(_this4.checkScrollAgain(times - 1), 50);
        }
      };
    }
  }, {
    key: 'copyResults',
    value: function copyResults() {
      if (this.results) {
        atom.clipboard.write((0, _stripAnsi2['default'])(this.results));
      }
    }
  }]);

  return ScriptView;
})(_atomMessagePanel.MessagePanelView);

exports['default'] = ScriptView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztpQ0FHbUIsc0JBQXNCOztnQ0FDUixvQkFBb0I7OzBCQUN2QyxZQUFZOzs7OzBCQUNILGNBQWM7Ozs7eUJBQ2YsWUFBWTs7OzswQkFFWCxlQUFlOzs7O3lCQUNoQixjQUFjOzs7OztBQVZwQyxXQUFXLENBQUM7SUFhUyxVQUFVO1lBQVYsVUFBVTs7QUFDbEIsV0FEUSxVQUFVLEdBQ2Y7MEJBREssVUFBVTs7QUFFM0IsUUFBTSxVQUFVLEdBQUcsNkJBQWdCLENBQUM7QUFDcEMsK0JBSGlCLFVBQVUsNkNBR3JCLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsRUFBRTs7QUFFckUsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFVBQVUsR0FBRyw2QkFBZ0IsQ0FBQztBQUNuQyxRQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQzs7QUFFN0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzQyxRQUFJLENBQUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRixRQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztBQUV4QiwyQkFBVSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzdCOztlQWZrQixVQUFVOztXQWlCYiw0QkFBRztBQUNqQixVQUFNLElBQUksR0FBRywyQkFBRyxZQUFZO0FBQzFC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RUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2RTtPQUNGLENBQUM7S0FDSDs7O1dBRVUsdUJBQUc7QUFDWixVQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsNEJBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7T0FDL0M7S0FDRjs7O1NBdk1rQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9EZXYvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIGZ1bmMtbmFtZXMgKi9cbmltcG9ydCB7ICQkIH0gZnJvbSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnO1xuaW1wb3J0IHsgTWVzc2FnZVBhbmVsVmlldyB9IGZyb20gJ2F0b20tbWVzc2FnZS1wYW5lbCc7XG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJztcbmltcG9ydCBBbnNpRmlsdGVyIGZyb20gJ2Fuc2ktdG8taHRtbCc7XG5pbXBvcnQgc3RyaXBBbnNpIGZyb20gJ3N0cmlwLWFuc2knO1xuXG5pbXBvcnQgSGVhZGVyVmlldyBmcm9tICcuL2hlYWRlci12aWV3JztcbmltcG9ydCBsaW5rUGF0aHMgZnJvbSAnLi9saW5rLXBhdGhzJztcblxuLy8gUnVucyBhIHBvcnRpb24gb2YgYSBzY3JpcHQgdGhyb3VnaCBhbiBpbnRlcnByZXRlciBhbmQgZGlzcGxheXMgaXQgbGluZSBieSBsaW5lXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY3JpcHRWaWV3IGV4dGVuZHMgTWVzc2FnZVBhbmVsVmlldyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IGhlYWRlclZpZXcgPSBuZXcgSGVhZGVyVmlldygpO1xuICAgIHN1cGVyKHsgdGl0bGU6IGhlYWRlclZpZXcsIHJhd1RpdGxlOiB0cnVlLCBjbG9zZU1ldGhvZDogJ2Rlc3Ryb3knIH0pO1xuXG4gICAgdGhpcy5zY3JvbGxUaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLmFuc2lGaWx0ZXIgPSBuZXcgQW5zaUZpbHRlcigpO1xuICAgIHRoaXMuaGVhZGVyVmlldyA9IGhlYWRlclZpZXc7XG5cbiAgICB0aGlzLnNob3dJblRhYiA9IHRoaXMuc2hvd0luVGFiLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZXRIZWFkZXJBbmRTaG93RXhlY3V0aW9uVGltZSA9IHRoaXMuc2V0SGVhZGVyQW5kU2hvd0V4ZWN1dGlvblRpbWUuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZENsYXNzKCdzY3JpcHQtdmlldycpO1xuICAgIHRoaXMuYWRkU2hvd0luVGFiSWNvbigpO1xuXG4gICAgbGlua1BhdGhzLmxpc3Rlbih0aGlzLmJvZHkpO1xuICB9XG5cbiAgYWRkU2hvd0luVGFiSWNvbigpIHtcbiAgICBjb25zdCBpY29uID0gJCQoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5kaXYoe1xuICAgICAgICBjbGFzczogJ2hlYWRpbmctc2hvdy1pbi10YWIgaW5saW5lLWJsb2NrIGljb24tZmlsZS10ZXh0JyxcbiAgICAgICAgc3R5bGU6ICdjdXJzb3I6IHBvaW50ZXI7JyxcbiAgICAgICAgb3V0bGV0OiAnYnRuU2hvd0luVGFiJyxcbiAgICAgICAgdGl0bGU6ICdTaG93IG91dHB1dCBpbiBuZXcgdGFiJyxcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWNvbi5jbGljayh0aGlzLnNob3dJblRhYik7XG4gICAgaWNvbi5pbnNlcnRCZWZvcmUodGhpcy5idG5BdXRvU2Nyb2xsKTtcbiAgfVxuXG4gIHNob3dJblRhYigpIHtcbiAgICAvLyBjb25jYXQgb3V0cHV0XG4gICAgbGV0IG91dHB1dCA9ICcnO1xuICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiB0aGlzLm1lc3NhZ2VzKSB7IG91dHB1dCArPSBtZXNzYWdlLnRleHQoKTsgfVxuXG4gICAgLy8gcmVwcmVzZW50IGNvbW1hbmQgY29udGV4dFxuICAgIGxldCBjb250ZXh0ID0gJyc7XG4gICAgaWYgKHRoaXMuY29tbWFuZENvbnRleHQpIHtcbiAgICAgIGNvbnRleHQgPSBgW0NvbW1hbmQ6ICR7dGhpcy5jb21tYW5kQ29udGV4dC5nZXRSZXByZXNlbnRhdGlvbigpfV1cXG5gO1xuICAgIH1cblxuICAgIC8vIG9wZW4gbmV3IHRhYiBhbmQgc2V0IGNvbnRlbnQgdG8gb3V0cHV0XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4oZWRpdG9yID0+IGVkaXRvci5zZXRUZXh0KHN0cmlwQW5zaShjb250ZXh0ICsgb3V0cHV0KSkpO1xuICB9XG5cbiAgc2V0SGVhZGVyQW5kU2hvd0V4ZWN1dGlvblRpbWUocmV0dXJuQ29kZSwgZXhlY3V0aW9uVGltZSkge1xuICAgIGlmIChleGVjdXRpb25UaW1lKSB7XG4gICAgICB0aGlzLmRpc3BsYXkoJ3N0ZG91dCcsIGBbRmluaXNoZWQgaW4gJHtleGVjdXRpb25UaW1lLnRvU3RyaW5nKCl9c11gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kaXNwbGF5KCdzdGRvdXQnKTtcbiAgICB9XG5cbiAgICBpZiAocmV0dXJuQ29kZSA9PT0gMCkge1xuICAgICAgdGhpcy5zZXRIZWFkZXJTdGF0dXMoJ3N0b3AnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRIZWFkZXJTdGF0dXMoJ2VycicpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0Vmlldyh0aXRsZSA9ICdMb2FkaW5nLi4uJykge1xuICAgIC8vIERpc3BsYXkgd2luZG93IGFuZCBsb2FkIG1lc3NhZ2VcblxuICAgIC8vIEZpcnN0IHJ1biwgY3JlYXRlIHZpZXdcbiAgICBpZiAoIXRoaXMuaGFzUGFyZW50KCkpIHsgdGhpcy5hdHRhY2goKTsgfVxuXG4gICAgdGhpcy5zZXRIZWFkZXJUaXRsZSh0aXRsZSk7XG4gICAgdGhpcy5zZXRIZWFkZXJTdGF0dXMoJ3N0YXJ0Jyk7XG5cbiAgICAvLyBHZXQgc2NyaXB0IHZpZXcgcmVhZHlcbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cblxuICByZW1vdmVQYW5lbCgpIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgICB0aGlzLmRldGFjaCgpO1xuICAgIC8vIHRoZSAnY2xvc2UnIG1ldGhvZCBmcm9tIE1lc3NhZ2VQYW5lbFZpZXcgYWN0dWFsbHkgZGVzdHJveXMgdGhlIHBhbmVsXG4gICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKFNjcmlwdFZpZXcucHJvdG90eXBlKS5jbG9zZS5hcHBseSh0aGlzKTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgdHJpZ2dlcmVkIHdoZW4gaGl0dGluZyB0aGUgJ2Nsb3NlJyBidXR0b24gb24gdGhlIHBhbmVsXG4gIC8vIFdlIGFyZSBub3QgYWN0dWFsbHkgY2xvc2luZyB0aGUgcGFuZWwgaGVyZSBzaW5jZSB3ZSB3YW50IHRvIHRyaWdnZXJcbiAgLy8gJ3NjcmlwdDpjbG9zZS12aWV3JyB3aGljaCB3aWxsIGV2ZW50dWFsbHkgcmVtb3ZlIHRoZSBwYW5lbCB2aWEgJ3JlbW92ZVBhbmVsJ1xuICBjbG9zZSgpIHtcbiAgICBjb25zdCB3b3Jrc3BhY2VWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHdvcmtzcGFjZVZpZXcsICdzY3JpcHQ6Y2xvc2UtdmlldycpO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLmRpc3BsYXkoJ3N0ZG91dCcsICdeQycpO1xuICAgIHRoaXMuc2V0SGVhZGVyU3RhdHVzKCdraWxsJyk7XG4gIH1cblxuICBjcmVhdGVHaXRIdWJJc3N1ZUxpbmsoYXJnVHlwZSwgbGFuZykge1xuICAgIGNvbnN0IHRpdGxlID0gYEFkZCAke2FyZ1R5cGV9IHN1cHBvcnQgZm9yICR7bGFuZ31gO1xuICAgIGNvbnN0IGJvZHkgPSBgIyMjIyMgUGxhdGZvcm06IFxcYCR7cHJvY2Vzcy5wbGF0Zm9ybX1cXGBcXG4tLS1cXG5gO1xuICAgIGxldCBlbmNvZGVkVVJJID0gZW5jb2RlVVJJKGBodHRwczovL2dpdGh1Yi5jb20vcmdia3JrL2F0b20tc2NyaXB0L2lzc3Vlcy9uZXc/dGl0bGU9JHt0aXRsZX0mYm9keT0ke2JvZHl9YCk7XG4gICAgLy8gTk9URTogUmVwbGFjZSBcIiNcIiBhZnRlciByZWd1bGFyIGVuY29kaW5nIHNvIHdlIGRvbid0IGRvdWJsZSBlc2NhcGUgaXQuXG4gICAgZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvIy9nLCAnJTIzJyk7XG5cbiAgICBjb25zdCBlcnIgPSAkJChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnAoeyBjbGFzczogJ2Jsb2NrJyB9LCBgJHthcmdUeXBlfSBydW5uZXIgbm90IGF2YWlsYWJsZSBmb3IgJHtsYW5nfS5gKTtcbiAgICAgIHRoaXMucCh7IGNsYXNzOiAnYmxvY2snIH0sICgpID0+IHtcbiAgICAgICAgdGhpcy50ZXh0KCdJZiBpdCBzaG91bGQgZXhpc3QsIGFkZCBhbiAnKTtcbiAgICAgICAgdGhpcy5hKHsgaHJlZjogZW5jb2RlZFVSSSB9LCAnaXNzdWUgb24gR2l0SHViJyk7XG4gICAgICAgIHRoaXMudGV4dCgnLCBvciBzZW5kIHlvdXIgb3duIHB1bGwgcmVxdWVzdC4nKTtcbiAgICAgIH0sXG4gICAgICApO1xuICAgIH0pO1xuICAgIHRoaXMuaGFuZGxlRXJyb3IoZXJyKTtcbiAgfVxuXG4gIHNob3dVbmFibGVUb1J1bkVycm9yKGNvbW1hbmQpIHtcbiAgICB0aGlzLmFkZCgkJChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmgxKCdVbmFibGUgdG8gcnVuJyk7XG4gICAgICB0aGlzLnByZShfLmVzY2FwZShjb21tYW5kKSk7XG4gICAgICB0aGlzLmgyKCdEaWQgeW91IHN0YXJ0IEF0b20gZnJvbSB0aGUgY29tbWFuZCBsaW5lPycpO1xuICAgICAgdGhpcy5wcmUoJyAgYXRvbSAuJyk7XG4gICAgICB0aGlzLmgyKCdJcyBpdCBpbiB5b3VyIFBBVEg/Jyk7XG4gICAgICB0aGlzLnByZShgUEFUSDogJHtfLmVzY2FwZShwcm9jZXNzLmVudi5QQVRIKX1gKTtcbiAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgc2hvd05vTGFuZ3VhZ2VTcGVjaWZpZWQoKSB7XG4gICAgY29uc3QgZXJyID0gJCQoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wKCdZb3UgbXVzdCBzZWxlY3QgYSBsYW5ndWFnZSBpbiB0aGUgbG93ZXIgcmlnaHQsIG9yIHNhdmUgdGhlIGZpbGUgd2l0aCBhbiBhcHByb3ByaWF0ZSBleHRlbnNpb24uJyxcbiAgICApO1xuICAgIH0pO1xuICAgIHRoaXMuaGFuZGxlRXJyb3IoZXJyKTtcbiAgfVxuXG4gIHNob3dMYW5ndWFnZU5vdFN1cHBvcnRlZChsYW5nKSB7XG4gICAgY29uc3QgZXJyID0gJCQoZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5wKHsgY2xhc3M6ICdibG9jaycgfSwgYENvbW1hbmQgbm90IGNvbmZpZ3VyZWQgZm9yICR7bGFuZ30hYCk7XG4gICAgICB0aGlzLnAoeyBjbGFzczogJ2Jsb2NrJyB9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMudGV4dCgnQWRkIGFuICcpO1xuICAgICAgICB0aGlzLmEoeyBocmVmOiBgaHR0cHM6Ly9naXRodWIuY29tL3JnYmtyay9hdG9tLXNjcmlwdC9pc3N1ZXMvbmV3P3RpdGxlPUFkZCUyMHN1cHBvcnQlMjBmb3IlMjAke2xhbmd9YCB9LCAnaXNzdWUgb24gR2l0SHViJyk7XG4gICAgICAgIHRoaXMudGV4dCgnIG9yIHNlbmQgeW91ciBvd24gUHVsbCBSZXF1ZXN0LicpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5oYW5kbGVFcnJvcihlcnIpO1xuICB9XG5cbiAgaGFuZGxlRXJyb3IoZXJyKSB7XG4gICAgLy8gRGlzcGxheSBlcnJvciBhbmQga2lsbCBwcm9jZXNzXG4gICAgdGhpcy5zZXRIZWFkZXJUaXRsZSgnRXJyb3InKTtcbiAgICB0aGlzLnNldEhlYWRlclN0YXR1cygnZXJyJyk7XG4gICAgdGhpcy5hZGQoZXJyKTtcbiAgICB0aGlzLnN0b3AoKTtcbiAgfVxuXG4gIHNldEhlYWRlclN0YXR1cyhzdGF0dXMpIHtcbiAgICB0aGlzLmhlYWRlclZpZXcuc2V0U3RhdHVzKHN0YXR1cyk7XG4gIH1cblxuICBzZXRIZWFkZXJUaXRsZSh0aXRsZSkge1xuICAgIHRoaXMuaGVhZGVyVmlldy50aXRsZS50ZXh0KHRpdGxlKTtcbiAgfVxuXG4gIGRpc3BsYXkoY3NzLCBsaW5lKSB7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnc2NyaXB0LmVzY2FwZUNvbnNvbGVPdXRwdXQnKSkge1xuICAgICAgbGluZSA9IF8uZXNjYXBlKGxpbmUpO1xuICAgIH1cblxuICAgIGxpbmUgPSB0aGlzLmFuc2lGaWx0ZXIudG9IdG1sKGxpbmUpO1xuICAgIGxpbmUgPSBsaW5rUGF0aHMobGluZSk7XG5cbiAgICBjb25zdCB7IGNsaWVudEhlaWdodCwgc2Nyb2xsVG9wLCBzY3JvbGxIZWlnaHQgfSA9IHRoaXMuYm9keVswXTtcbiAgICAvLyBpbmRpY2F0ZXMgdGhhdCB0aGUgcGFuZWwgaXMgc2Nyb2xsZWQgdG8gdGhlIGJvdHRvbSwgdGh1cyB3ZSBrbm93IHRoYXRcbiAgICAvLyB3ZSBhcmUgbm90IGludGVyZmVyaW5nIHdpdGggdGhlIHVzZXIncyBtYW51YWwgc2Nyb2xsaW5nXG4gICAgY29uc3QgYXRFbmQgPSBzY3JvbGxUb3AgPj0gKHNjcm9sbEhlaWdodCAtIGNsaWVudEhlaWdodCk7XG5cbiAgICB0aGlzLmFkZCgkJChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLnByZSh7IGNsYXNzOiBgbGluZSAke2Nzc31gIH0sICgpID0+IHRoaXMucmF3KGxpbmUpKTtcbiAgICB9KSk7XG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdzY3JpcHQuc2Nyb2xsV2l0aE91dHB1dCcpICYmIGF0RW5kKSB7XG4gICAgICAvLyBTY3JvbGwgZG93biBpbiBhIHBvbGxpbmcgbG9vcCAnY2F1c2VcbiAgICAgIC8vIHdlIGRvbid0IGtub3cgd2hlbiB0aGUgcmVmbG93IHdpbGwgZmluaXNoLlxuICAgICAgLy8gU2VlOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcS81MDE3OTIzLzQwNzg0NVxuICAgICAgdGhpcy5jaGVja1Njcm9sbEFnYWluKDUpKCk7XG4gICAgfVxuICB9XG4gIGNoZWNrU2Nyb2xsQWdhaW4odGltZXMpIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgdGhpcy5ib2R5LnNjcm9sbFRvQm90dG9tKCk7XG5cbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNjcm9sbFRpbWVvdXQpO1xuICAgICAgaWYgKHRpbWVzID4gMSkge1xuICAgICAgICB0aGlzLnNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuY2hlY2tTY3JvbGxBZ2Fpbih0aW1lcyAtIDEpLCA1MCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGNvcHlSZXN1bHRzKCkge1xuICAgIGlmICh0aGlzLnJlc3VsdHMpIHtcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHN0cmlwQW5zaSh0aGlzLnJlc3VsdHMpKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==