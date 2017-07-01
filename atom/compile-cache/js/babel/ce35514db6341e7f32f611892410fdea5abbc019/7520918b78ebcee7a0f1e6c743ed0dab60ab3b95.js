Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable func-names */

var _atom = require('atom');

var _atomSpacePenViews = require('atom-space-pen-views');

var _scriptInputView = require('./script-input-view');

var _scriptInputView2 = _interopRequireDefault(_scriptInputView);

'use babel';
var ScriptProfileRunView = (function (_SelectListView) {
  _inherits(ScriptProfileRunView, _SelectListView);

  function ScriptProfileRunView() {
    _classCallCheck(this, ScriptProfileRunView);

    _get(Object.getPrototypeOf(ScriptProfileRunView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ScriptProfileRunView, [{
    key: 'initialize',
    value: function initialize(profiles) {
      var _this = this;

      this.profiles = profiles;
      _get(Object.getPrototypeOf(ScriptProfileRunView.prototype), 'initialize', this).apply(this, arguments);

      this.emitter = new _atom.Emitter();

      this.subscriptions = new _atom.CompositeDisposable();
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'core:cancel': function coreCancel() {
          return _this.hide();
        },
        'core:close': function coreClose() {
          return _this.hide();
        },
        'script:run-with-profile': function scriptRunWithProfile() {
          return _this.panel.isVisible() ? _this.hide() : _this.show();
        }
      }));

      this.setItems(this.profiles);
      this.initializeView();
    }
  }, {
    key: 'initializeView',
    value: function initializeView() {
      var _this3 = this;

      this.addClass('overlay from-top script-profile-run-view');
      // @panel.hide()

      this.buttons = (0, _atomSpacePenViews.$$)(function () {
        var _this2 = this;

        this.div({ 'class': 'block buttons' }, function () {
          /* eslint-disable no-unused-vars */
          var css = 'btn inline-block-tight';
          /* eslint-enable no-unused-vars */
          _this2.button({ 'class': 'btn cancel' }, function () {
            return _this2.span({ 'class': 'icon icon-x' }, 'Cancel');
          });
          _this2.button({ 'class': 'btn rename' }, function () {
            return _this2.span({ 'class': 'icon icon-pencil' }, 'Rename');
          });
          _this2.button({ 'class': 'btn delete' }, function () {
            return _this2.span({ 'class': 'icon icon-trashcan' }, 'Delete');
          });
          _this2.button({ 'class': 'btn run' }, function () {
            return _this2.span({ 'class': 'icon icon-playback-play' }, 'Run');
          });
        });
      });

      // event handlers
      this.buttons.find('.btn.cancel').on('click', function () {
        return _this3.hide();
      });
      this.buttons.find('.btn.rename').on('click', function () {
        return _this3.rename();
      });
      this.buttons.find('.btn.delete').on('click', function () {
        return _this3['delete']();
      });
      this.buttons.find('.btn.run').on('click', function () {
        return _this3.run();
      });

      // fix focus traversal (from run button to filter editor)
      this.buttons.find('.btn.run').on('keydown', function (e) {
        if (e.keyCode === 9) {
          e.stopPropagation();
          e.preventDefault();
          _this3.focusFilterEditor();
        }
      });

      // hide panel on ecsape
      this.on('keydown', function (e) {
        if (e.keyCode === 27) {
          _this3.hide();
        }
        if (e.keyCode === 13) {
          _this3.run();
        }
      });

      // append buttons container
      this.append(this.buttons);

      var selector = '.rename, .delete, .run';
      if (this.profiles.length) {
        this.buttons.find(selector).show();
      } else {
        this.buttons.find(selector).hide();
      }

      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.hide();
    }
  }, {
    key: 'onProfileDelete',
    value: function onProfileDelete(callback) {
      return this.emitter.on('on-profile-delete', callback);
    }
  }, {
    key: 'onProfileChange',
    value: function onProfileChange(callback) {
      return this.emitter.on('on-profile-change', callback);
    }
  }, {
    key: 'onProfileRun',
    value: function onProfileRun(callback) {
      return this.emitter.on('on-profile-run', callback);
    }
  }, {
    key: 'rename',
    value: function rename() {
      var _this4 = this;

      var profile = this.getSelectedItem();
      if (!profile) {
        return;
      }

      var inputView = new _scriptInputView2['default']({ caption: 'Enter new profile name:', 'default': profile.name });
      inputView.onCancel(function () {
        return _this4.show();
      });
      inputView.onConfirm(function (newProfileName) {
        if (!newProfileName) {
          return;
        }
        _this4.emitter.emit('on-profile-change', { profile: profile, key: 'name', value: newProfileName });
      });

      inputView.show();
    }
  }, {
    key: 'delete',
    value: function _delete() {
      var _this5 = this;

      var profile = this.getSelectedItem();
      if (!profile) {
        return;
      }

      atom.confirm({
        message: 'Delete profile',
        detailedMessage: 'Are you sure you want to delete "' + profile.name + '" profile?',
        buttons: {
          No: function No() {
            return _this5.focusFilterEditor();
          },
          Yes: function Yes() {
            return _this5.emitter.emit('on-profile-delete', profile);
          }
        }
      });
    }
  }, {
    key: 'getFilterKey',
    value: function getFilterKey() {
      return 'name';
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage() {
      return 'No profiles found';
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(item) {
      return (0, _atomSpacePenViews.$$)(function () {
        var _this6 = this;

        this.li({ 'class': 'two-lines profile' }, function () {
          _this6.div({ 'class': 'primary-line name' }, function () {
            return _this6.text(item.name);
          });
          _this6.div({ 'class': 'secondary-line description' }, function () {
            return _this6.text(item.description);
          });
        });
      });
    }
  }, {
    key: 'cancel',
    value: function cancel() {}
  }, {
    key: 'confirmed',
    value: function confirmed() {}
  }, {
    key: 'show',
    value: function show() {
      this.panel.show();
      this.focusFilterEditor();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
      atom.workspace.getActivePane().activate();
    }

    // Updates profiles
  }, {
    key: 'setProfiles',
    value: function setProfiles(profiles) {
      this.profiles = profiles;
      this.setItems(this.profiles);

      // toggle profile controls
      var selector = '.rename, .delete, .run';
      if (this.profiles.length) {
        this.buttons.find(selector).show();
      } else {
        this.buttons.find(selector).hide();
      }

      this.populateList();
      this.focusFilterEditor();
    }
  }, {
    key: 'close',
    value: function close() {}
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.subscriptions) this.subscriptions.dispose();
    }
  }, {
    key: 'run',
    value: function run() {
      var profile = this.getSelectedItem();
      if (!profile) {
        return;
      }

      this.emitter.emit('on-profile-run', profile);
      this.hide();
    }
  }]);

  return ScriptProfileRunView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = ScriptProfileRunView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LXByb2ZpbGUtcnVuLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQkFHNkMsTUFBTTs7aUNBQ2hCLHNCQUFzQjs7K0JBQzdCLHFCQUFxQjs7OztBQUxqRCxXQUFXLENBQUM7SUFPUyxvQkFBb0I7WUFBcEIsb0JBQW9COztXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7K0JBQXBCLG9CQUFvQjs7O2VBQXBCLG9CQUFvQjs7V0FDN0Isb0JBQUMsUUFBUSxFQUFFOzs7QUFDbkIsVUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsaUNBSGlCLG9CQUFvQiw2Q0FHakIsU0FBUyxFQUFFOztBQUUvQixVQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUM7O0FBRTdCLFVBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDL0MsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQscUJBQWEsRUFBRTtpQkFBTSxNQUFLLElBQUksRUFBRTtTQUFBO0FBQ2hDLG9CQUFZLEVBQUU7aUJBQU0sTUFBSyxJQUFJLEVBQUU7U0FBQTtBQUMvQixpQ0FBeUIsRUFBRTtpQkFBTyxNQUFLLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxNQUFLLElBQUksRUFBRSxHQUFHLE1BQUssSUFBSSxFQUFFO1NBQUM7T0FDdEYsQ0FBQyxDQUFDLENBQUM7O0FBRUosVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDN0IsVUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3ZCOzs7V0FFYSwwQkFBRzs7O0FBQ2YsVUFBSSxDQUFDLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDOzs7QUFHMUQsVUFBSSxDQUFDLE9BQU8sR0FBRywyQkFBRyxZQUFZOzs7QUFDNUIsWUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQU8sZUFBZSxFQUFFLEVBQUUsWUFBTTs7QUFFekMsY0FBTSxHQUFHLEdBQUcsd0JBQXdCLENBQUM7O0FBRXJDLGlCQUFLLE1BQU0sQ0FBQyxFQUFFLFNBQU8sWUFBWSxFQUFFLEVBQUU7bUJBQU0sT0FBSyxJQUFJLENBQUMsRUFBRSxTQUFPLGFBQWEsRUFBRSxFQUFFLFFBQVEsQ0FBQztXQUFBLENBQUMsQ0FBQztBQUMxRixpQkFBSyxNQUFNLENBQUMsRUFBRSxTQUFPLFlBQVksRUFBRSxFQUFFO21CQUFNLE9BQUssSUFBSSxDQUFDLEVBQUUsU0FBTyxrQkFBa0IsRUFBRSxFQUFFLFFBQVEsQ0FBQztXQUFBLENBQUMsQ0FBQztBQUMvRixpQkFBSyxNQUFNLENBQUMsRUFBRSxTQUFPLFlBQVksRUFBRSxFQUFFO21CQUFNLE9BQUssSUFBSSxDQUFDLEVBQUUsU0FBTyxvQkFBb0IsRUFBRSxFQUFFLFFBQVEsQ0FBQztXQUFBLENBQUMsQ0FBQztBQUNqRyxpQkFBSyxNQUFNLENBQUMsRUFBRSxTQUFPLFNBQVMsRUFBRSxFQUFFO21CQUFNLE9BQUssSUFBSSxDQUFDLEVBQUUsU0FBTyx5QkFBeUIsRUFBRSxFQUFFLEtBQUssQ0FBQztXQUFBLENBQUMsQ0FBQztTQUNqRyxDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7OztBQUdILFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7ZUFBTSxPQUFLLElBQUksRUFBRTtPQUFBLENBQUMsQ0FBQztBQUNoRSxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO2VBQU0sT0FBSyxNQUFNLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDbEUsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTtlQUFNLGdCQUFXLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDbEUsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTtlQUFNLE9BQUssR0FBRyxFQUFFO09BQUEsQ0FBQyxDQUFDOzs7QUFHNUQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFDLENBQUMsRUFBSztBQUNqRCxZQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUFFO0FBQ25CLFdBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUNwQixXQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsaUJBQUssaUJBQWlCLEVBQUUsQ0FBQztTQUMxQjtPQUNGLENBQUMsQ0FBQzs7O0FBR0gsVUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDeEIsWUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRTtBQUFFLGlCQUFLLElBQUksRUFBRSxDQUFDO1NBQUU7QUFDdEMsWUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRTtBQUFFLGlCQUFLLEdBQUcsRUFBRSxDQUFDO1NBQUU7T0FDdEMsQ0FBQyxDQUFDOzs7QUFHSCxVQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFMUIsVUFBTSxRQUFRLEdBQUcsd0JBQXdCLENBQUM7QUFDMUMsVUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUN4QixZQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNwQyxNQUFNO0FBQ0wsWUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDcEM7O0FBRUQsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzFELFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDbkI7OztXQUVjLHlCQUFDLFFBQVEsRUFBRTtBQUN4QixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZEOzs7V0FFYyx5QkFBQyxRQUFRLEVBQUU7QUFDeEIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN2RDs7O1dBRVcsc0JBQUMsUUFBUSxFQUFFO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDcEQ7OztXQUdLLGtCQUFHOzs7QUFDUCxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLE9BQU8sRUFBRTtBQUFFLGVBQU87T0FBRTs7QUFFekIsVUFBTSxTQUFTLEdBQUcsaUNBQW9CLEVBQUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLFdBQVMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDckcsZUFBUyxDQUFDLFFBQVEsQ0FBQztlQUFNLE9BQUssSUFBSSxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3RDLGVBQVMsQ0FBQyxTQUFTLENBQUMsVUFBQyxjQUFjLEVBQUs7QUFDdEMsWUFBSSxDQUFDLGNBQWMsRUFBRTtBQUFFLGlCQUFPO1NBQUU7QUFDaEMsZUFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO09BQ3pGLENBQ0EsQ0FBQzs7QUFFRixlQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDbEI7OztXQUVLLG1CQUFHOzs7QUFDUCxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLE9BQU8sRUFBRTtBQUFFLGVBQU87T0FBRTs7QUFFekIsVUFBSSxDQUFDLE9BQU8sQ0FBQztBQUNYLGVBQU8sRUFBRSxnQkFBZ0I7QUFDekIsdUJBQWUsd0NBQXNDLE9BQU8sQ0FBQyxJQUFJLGVBQVk7QUFDN0UsZUFBTyxFQUFFO0FBQ1AsWUFBRSxFQUFFO21CQUFNLE9BQUssaUJBQWlCLEVBQUU7V0FBQTtBQUNsQyxhQUFHLEVBQUU7bUJBQU0sT0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQztXQUFBO1NBQzNEO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVXLHdCQUFHO0FBQ2IsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1dBRWMsMkJBQUc7QUFDaEIsYUFBTyxtQkFBbUIsQ0FBQztLQUM1Qjs7O1dBRVUscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLGFBQU8sMkJBQUcsWUFBWTs7O0FBQ3BCLFlBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFPLG1CQUFtQixFQUFFLEVBQUUsWUFBTTtBQUM1QyxpQkFBSyxHQUFHLENBQUMsRUFBRSxTQUFPLG1CQUFtQixFQUFFLEVBQUU7bUJBQU0sT0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztXQUFBLENBQUMsQ0FBQztBQUNyRSxpQkFBSyxHQUFHLENBQUMsRUFBRSxTQUFPLDRCQUE0QixFQUFFLEVBQUU7bUJBQU0sT0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztXQUFBLENBQUMsQ0FBQztTQUN0RixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1dBRUssa0JBQUcsRUFBRTs7O1dBQ0YscUJBQUcsRUFBRTs7O1dBRVYsZ0JBQUc7QUFDTCxVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQzFCOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDbEIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUMzQzs7Ozs7V0FHVSxxQkFBQyxRQUFRLEVBQUU7QUFDcEIsVUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUc3QixVQUFNLFFBQVEsR0FBRyx3QkFBd0IsQ0FBQztBQUMxQyxVQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO09BQ3BDLE1BQU07QUFDTCxZQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNwQzs7QUFFRCxVQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDcEIsVUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7S0FDMUI7OztXQUVJLGlCQUFHLEVBQUU7OztXQUVILG1CQUFHO0FBQ1IsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdEQ7OztXQUVFLGVBQUc7QUFDSixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLE9BQU8sRUFBRTtBQUFFLGVBQU87T0FBRTs7QUFFekIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDN0MsVUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2I7OztTQTFLa0Isb0JBQW9COzs7cUJBQXBCLG9CQUFvQiIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9EZXYvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL3NjcmlwdC1wcm9maWxlLXJ1bi12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIGZ1bmMtbmFtZXMgKi9cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7ICQkLCBTZWxlY3RMaXN0VmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcbmltcG9ydCBTY3JpcHRJbnB1dFZpZXcgZnJvbSAnLi9zY3JpcHQtaW5wdXQtdmlldyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmlwdFByb2ZpbGVSdW5WaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXcge1xuICBpbml0aWFsaXplKHByb2ZpbGVzKSB7XG4gICAgdGhpcy5wcm9maWxlcyA9IHByb2ZpbGVzO1xuICAgIHN1cGVyLmluaXRpYWxpemUoLi4uYXJndW1lbnRzKTtcblxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2NvcmU6Y2FuY2VsJzogKCkgPT4gdGhpcy5oaWRlKCksXG4gICAgICAnY29yZTpjbG9zZSc6ICgpID0+IHRoaXMuaGlkZSgpLFxuICAgICAgJ3NjcmlwdDpydW4td2l0aC1wcm9maWxlJzogKCkgPT4gKHRoaXMucGFuZWwuaXNWaXNpYmxlKCkgPyB0aGlzLmhpZGUoKSA6IHRoaXMuc2hvdygpKSxcbiAgICB9KSk7XG5cbiAgICB0aGlzLnNldEl0ZW1zKHRoaXMucHJvZmlsZXMpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZVZpZXcoKTtcbiAgfVxuXG4gIGluaXRpYWxpemVWaWV3KCkge1xuICAgIHRoaXMuYWRkQ2xhc3MoJ292ZXJsYXkgZnJvbS10b3Agc2NyaXB0LXByb2ZpbGUtcnVuLXZpZXcnKTtcbiAgICAvLyBAcGFuZWwuaGlkZSgpXG5cbiAgICB0aGlzLmJ1dHRvbnMgPSAkJChmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmRpdih7IGNsYXNzOiAnYmxvY2sgYnV0dG9ucycgfSwgKCkgPT4ge1xuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgICAgICBjb25zdCBjc3MgPSAnYnRuIGlubGluZS1ibG9jay10aWdodCc7XG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICAgICAgdGhpcy5idXR0b24oeyBjbGFzczogJ2J0biBjYW5jZWwnIH0sICgpID0+IHRoaXMuc3Bhbih7IGNsYXNzOiAnaWNvbiBpY29uLXgnIH0sICdDYW5jZWwnKSk7XG4gICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6ICdidG4gcmVuYW1lJyB9LCAoKSA9PiB0aGlzLnNwYW4oeyBjbGFzczogJ2ljb24gaWNvbi1wZW5jaWwnIH0sICdSZW5hbWUnKSk7XG4gICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6ICdidG4gZGVsZXRlJyB9LCAoKSA9PiB0aGlzLnNwYW4oeyBjbGFzczogJ2ljb24gaWNvbi10cmFzaGNhbicgfSwgJ0RlbGV0ZScpKTtcbiAgICAgICAgdGhpcy5idXR0b24oeyBjbGFzczogJ2J0biBydW4nIH0sICgpID0+IHRoaXMuc3Bhbih7IGNsYXNzOiAnaWNvbiBpY29uLXBsYXliYWNrLXBsYXknIH0sICdSdW4nKSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGV2ZW50IGhhbmRsZXJzXG4gICAgdGhpcy5idXR0b25zLmZpbmQoJy5idG4uY2FuY2VsJykub24oJ2NsaWNrJywgKCkgPT4gdGhpcy5oaWRlKCkpO1xuICAgIHRoaXMuYnV0dG9ucy5maW5kKCcuYnRuLnJlbmFtZScpLm9uKCdjbGljaycsICgpID0+IHRoaXMucmVuYW1lKCkpO1xuICAgIHRoaXMuYnV0dG9ucy5maW5kKCcuYnRuLmRlbGV0ZScpLm9uKCdjbGljaycsICgpID0+IHRoaXMuZGVsZXRlKCkpO1xuICAgIHRoaXMuYnV0dG9ucy5maW5kKCcuYnRuLnJ1bicpLm9uKCdjbGljaycsICgpID0+IHRoaXMucnVuKCkpO1xuXG4gICAgLy8gZml4IGZvY3VzIHRyYXZlcnNhbCAoZnJvbSBydW4gYnV0dG9uIHRvIGZpbHRlciBlZGl0b3IpXG4gICAgdGhpcy5idXR0b25zLmZpbmQoJy5idG4ucnVuJykub24oJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gOSkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGhpZGUgcGFuZWwgb24gZWNzYXBlXG4gICAgdGhpcy5vbigna2V5ZG93bicsIChlKSA9PiB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAyNykgeyB0aGlzLmhpZGUoKTsgfVxuICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHsgdGhpcy5ydW4oKTsgfVxuICAgIH0pO1xuXG4gICAgLy8gYXBwZW5kIGJ1dHRvbnMgY29udGFpbmVyXG4gICAgdGhpcy5hcHBlbmQodGhpcy5idXR0b25zKTtcblxuICAgIGNvbnN0IHNlbGVjdG9yID0gJy5yZW5hbWUsIC5kZWxldGUsIC5ydW4nO1xuICAgIGlmICh0aGlzLnByb2ZpbGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy5idXR0b25zLmZpbmQoc2VsZWN0b3IpLnNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5idXR0b25zLmZpbmQoc2VsZWN0b3IpLmhpZGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMgfSk7XG4gICAgdGhpcy5wYW5lbC5oaWRlKCk7XG4gIH1cblxuICBvblByb2ZpbGVEZWxldGUoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdvbi1wcm9maWxlLWRlbGV0ZScsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uUHJvZmlsZUNoYW5nZShjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ29uLXByb2ZpbGUtY2hhbmdlJywgY2FsbGJhY2spO1xuICB9XG5cbiAgb25Qcm9maWxlUnVuKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb24tcHJvZmlsZS1ydW4nLCBjYWxsYmFjayk7XG4gIH1cblxuXG4gIHJlbmFtZSgpIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5nZXRTZWxlY3RlZEl0ZW0oKTtcbiAgICBpZiAoIXByb2ZpbGUpIHsgcmV0dXJuOyB9XG5cbiAgICBjb25zdCBpbnB1dFZpZXcgPSBuZXcgU2NyaXB0SW5wdXRWaWV3KHsgY2FwdGlvbjogJ0VudGVyIG5ldyBwcm9maWxlIG5hbWU6JywgZGVmYXVsdDogcHJvZmlsZS5uYW1lIH0pO1xuICAgIGlucHV0Vmlldy5vbkNhbmNlbCgoKSA9PiB0aGlzLnNob3coKSk7XG4gICAgaW5wdXRWaWV3Lm9uQ29uZmlybSgobmV3UHJvZmlsZU5hbWUpID0+IHtcbiAgICAgIGlmICghbmV3UHJvZmlsZU5hbWUpIHsgcmV0dXJuOyB9XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnb24tcHJvZmlsZS1jaGFuZ2UnLCB7IHByb2ZpbGUsIGtleTogJ25hbWUnLCB2YWx1ZTogbmV3UHJvZmlsZU5hbWUgfSk7XG4gICAgfSxcbiAgICApO1xuXG4gICAgaW5wdXRWaWV3LnNob3coKTtcbiAgfVxuXG4gIGRlbGV0ZSgpIHtcbiAgICBjb25zdCBwcm9maWxlID0gdGhpcy5nZXRTZWxlY3RlZEl0ZW0oKTtcbiAgICBpZiAoIXByb2ZpbGUpIHsgcmV0dXJuOyB9XG5cbiAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgbWVzc2FnZTogJ0RlbGV0ZSBwcm9maWxlJyxcbiAgICAgIGRldGFpbGVkTWVzc2FnZTogYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgXCIke3Byb2ZpbGUubmFtZX1cIiBwcm9maWxlP2AsXG4gICAgICBidXR0b25zOiB7XG4gICAgICAgIE5vOiAoKSA9PiB0aGlzLmZvY3VzRmlsdGVyRWRpdG9yKCksXG4gICAgICAgIFllczogKCkgPT4gdGhpcy5lbWl0dGVyLmVtaXQoJ29uLXByb2ZpbGUtZGVsZXRlJywgcHJvZmlsZSksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0RmlsdGVyS2V5KCkge1xuICAgIHJldHVybiAnbmFtZSc7XG4gIH1cblxuICBnZXRFbXB0eU1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuICdObyBwcm9maWxlcyBmb3VuZCc7XG4gIH1cblxuICB2aWV3Rm9ySXRlbShpdGVtKSB7XG4gICAgcmV0dXJuICQkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMubGkoeyBjbGFzczogJ3R3by1saW5lcyBwcm9maWxlJyB9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdwcmltYXJ5LWxpbmUgbmFtZScgfSwgKCkgPT4gdGhpcy50ZXh0KGl0ZW0ubmFtZSkpO1xuICAgICAgICB0aGlzLmRpdih7IGNsYXNzOiAnc2Vjb25kYXJ5LWxpbmUgZGVzY3JpcHRpb24nIH0sICgpID0+IHRoaXMudGV4dChpdGVtLmRlc2NyaXB0aW9uKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNhbmNlbCgpIHt9XG4gIGNvbmZpcm1lZCgpIHt9XG5cbiAgc2hvdygpIHtcbiAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgICB0aGlzLmZvY3VzRmlsdGVyRWRpdG9yKCk7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMucGFuZWwuaGlkZSgpO1xuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpO1xuICB9XG5cbiAgLy8gVXBkYXRlcyBwcm9maWxlc1xuICBzZXRQcm9maWxlcyhwcm9maWxlcykge1xuICAgIHRoaXMucHJvZmlsZXMgPSBwcm9maWxlcztcbiAgICB0aGlzLnNldEl0ZW1zKHRoaXMucHJvZmlsZXMpO1xuXG4gICAgLy8gdG9nZ2xlIHByb2ZpbGUgY29udHJvbHNcbiAgICBjb25zdCBzZWxlY3RvciA9ICcucmVuYW1lLCAuZGVsZXRlLCAucnVuJztcbiAgICBpZiAodGhpcy5wcm9maWxlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuYnV0dG9ucy5maW5kKHNlbGVjdG9yKS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnV0dG9ucy5maW5kKHNlbGVjdG9yKS5oaWRlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5wb3B1bGF0ZUxpc3QoKTtcbiAgICB0aGlzLmZvY3VzRmlsdGVyRWRpdG9yKCk7XG4gIH1cblxuICBjbG9zZSgpIHt9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zKSB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgcnVuKCkge1xuICAgIGNvbnN0IHByb2ZpbGUgPSB0aGlzLmdldFNlbGVjdGVkSXRlbSgpO1xuICAgIGlmICghcHJvZmlsZSkgeyByZXR1cm47IH1cblxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvbi1wcm9maWxlLXJ1bicsIHByb2ZpbGUpO1xuICAgIHRoaXMuaGlkZSgpO1xuICB9XG59XG4iXX0=