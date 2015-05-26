Object.defineProperty(exports, '__esModule', {
    value: true
});
var CSScomb = require('csscomb'),
    path = require('path'),
    fs = require('fs'),
    CompositeDisposable = require('atom').CompositeDisposable,
    allowedGrammas = ['css', 'less', 'scss', 'sass', 'styl'],
    getUserHome = function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
};

exports['default'] = {
    /**
     * @private
     */
    _subscriptions: undefined,
    _editorObserver: undefined,

    /**
     * Config
     *
     * @type {Object}
     */
    config: {
        shouldNotSearchConfig: {
            title: 'Disable config searching',
            description: 'Disable config searching in project directory and use predefined or custom config',
            type: 'boolean',
            'default': false
        },
        predef: {
            title: 'Predefined configs',
            description: 'Will be used if config is not found in project directory',
            type: 'string',
            'default': 'csscomb',
            'enum': ['csscomb', 'zen', 'yandex']
        },
        customConfig: {
            title: 'Custom config (Full path to file)',
            description: 'Will be used if config is not found in project directory,' + ' has more priority than predefined configs.',
            type: 'string',
            'default': ''
        },
        showNotifications: {
            title: 'Notifications',
            type: 'boolean',
            'default': true
        },
        shouldUpdateOnSave: {
            title: 'On Save',
            description: 'Process file on every save.',
            type: 'boolean',
            'default': false
        }
    },

    activate: function activate() {
        var _this = this;

        this._subscriptions = new CompositeDisposable();

        this._subscriptions.add(atom.commands.add('atom-workspace', {
            'css-comb:run': function cssCombRun() {
                _this.comb();
            }
        }));

        this._editorObserver = atom.workspace.observeTextEditors(function (editor) {
            return _this.handleEvents(editor);
        });
    },

    deactivate: function deactivate() {
        this._subscriptions.dispose();
        this._editorObserver.dispose();
    },

    /**
     * @private
     */
    handleEvents: function handleEvents(editor) {
        var _this2 = this;

        editor.getBuffer().onWillSave(function () {
            if (_this2._isOnSave() && _this2._isAllowedGrama(editor)) {
                _this2.comb();
            }
        });
    },

    /**
     * @private
     */
    comb: function comb() {
        var filePath = atom.workspace.getActivePaneItem().getPath(),
            config = this._getConfig(filePath),
            selectedText = this._getSelectedText();

        if (selectedText) {
            !this._isOnSave() && this._processSelection(selectedText, config);
        } else {
            this._processFile(filePath, config);
        }
    },

    /**
     * Process whole file be csscomb
     * @private
     *
     * @param {String} filePath — file to process
     * @param {Object} config — csscomb config
     */
    _processFile: function _processFile(filePath, config) {
        var comb = new CSScomb(config);

        try {
            comb.processFile(filePath);

            this._showInfoNotification('File processed by csscomb');
        } catch (err) {
            this._showErrorNotification(err.message);
            console.error(err);
        }
    },

    /**
     * Process only selection by csscomb
     * @private
     *
     * @param {String} string to process
     * @param {Object} config csscomb config
     */
    _processSelection: function _processSelection(string, config) {
        var comb = new CSScomb(config);

        try {
            var textEditor = atom.workspace.getActiveTextEditor(),
                processedString = comb.processString(string, {
                syntax: textEditor.getGrammar().name.toLowerCase()
            });

            textEditor.setTextInBufferRange(textEditor.getSelectedBufferRange(), processedString);

            this._showInfoNotification('Lines processed by csscomb');
        } catch (err) {
            this._showErrorNotification(err.message);
            console.error(err);
        }
    },

    /**
     * Show info notification
     * @private
     *
     * @param {String} message — notification text
     */
    _showInfoNotification: function _showInfoNotification(message) {
        if (this._isShowInfoNotification()) {
            atom.notifications.addInfo(message);
        }
    },

    /**
     * Show error notification
     * @private
     *
     * @param {String} message notification text
     */
    _showErrorNotification: function _showErrorNotification(message) {
        if (this._isShowErrorNotification()) {
            atom.notifications.addError(message);
        }
    },

    /**
     * Check if info notifications should be shown
     * @private
     *
     * @return {Boolean}
     */
    _isShowInfoNotification: function _isShowInfoNotification() {
        return atom.config.get('css-comb.showNotifications') && atom.notifications && atom.notifications.addInfo;
    },

    /**
     * Check if error notifications should be shown
     * @private
     *
     * @return {Boolean}
     */
    _isShowErrorNotification: function _isShowErrorNotification() {
        return atom.config.get('css-comb.showNotifications') && atom.notifications && atom.notifications.addError;
    },

    /**
     * Check if on save option enabled
     * @private
     *
     * @return {Boolean}
     */
    _isOnSave: function _isOnSave() {
        return atom.config.get('css-comb.shouldUpdateOnSave');
    },

    /**
     * Check if file is in allowed gramma list
     * @private
     *
     * @return {Boolean}
     */
    _isAllowedGrama: function _isAllowedGrama(editor) {
        return allowedGrammas.indexOf(editor.getGrammar().name.toLowerCase()) !== -1;
    },

    /**
     * Search and load csscomb config
     * @private
     *
     * @param {String} filePath from where start searching
     *
     * @return {Object} csscomb config
     */
    _getConfig: function _getConfig(filePath) {
        var configPath;

        if (!atom.config.get('css-comb.shouldNotSearchConfig')) {
            configPath = path.join(path.dirname(filePath), '.csscomb.json');
            configPath = CSScomb.getCustomConfigPath(configPath);
        }

        if (configPath) {
            return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } else {
            configPath = atom.config.get('css-comb.customConfig');

            if (configPath && configPath.match(/^\~/)) {
                configPath = path.join(getUserHome(), configPath.replace(/^\~\//, ''));
            }

            if (configPath && fs.existsSync(configPath)) {
                return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            } else {
                return CSScomb.getConfig(atom.config.get('css-comb.predef'));
            }
        }
    },

    /**
     * Return selected text for current opened file
     * @private
     *
     * @return {String}
     */
    _getSelectedText: function _getSelectedText() {
        return atom.workspace.getActiveTextEditor().getSelectedText();
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvY3NzLWNvbWIvc3JjL2Nzcy1jb21iLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFFNUIsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDdEIsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFFbEIsbUJBQW1CLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLG1CQUFtQjtJQUV6RCxjQUFjLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO0lBRXhELFdBQVcsR0FBRyxTQUFTLFdBQVcsR0FBSTtBQUNsQyxXQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO0NBQzlFLENBQUM7O3FCQUVTOzs7O0FBSVgsa0JBQWMsRUFBRSxTQUFTO0FBQ3pCLG1CQUFlLEVBQUUsU0FBUzs7Ozs7OztBQU8xQixVQUFNLEVBQUU7QUFDSiw2QkFBcUIsRUFBRTtBQUNuQixpQkFBSyxFQUFFLDBCQUEwQjtBQUNqQyx1QkFBVyxFQUFFLG1GQUFtRjtBQUNoRyxnQkFBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxFQUFFLEtBQUs7U0FDbkI7QUFDRCxjQUFNLEVBQUU7QUFDSixpQkFBSyxFQUFFLG9CQUFvQjtBQUMzQix1QkFBVyxFQUFFLDBEQUEwRDtBQUN2RSxnQkFBSSxFQUFFLFFBQVE7QUFDZCxxQkFBUyxFQUFFLFNBQVM7QUFDcEIsa0JBQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO1NBQ3ZDO0FBQ0Qsb0JBQVksRUFBRTtBQUNWLGlCQUFLLEVBQUUsbUNBQW1DO0FBQzFDLHVCQUFXLEVBQUUsMkRBQTJELEdBQzNELDZDQUE2QztBQUMxRCxnQkFBSSxFQUFFLFFBQVE7QUFDZCxxQkFBUyxFQUFFLEVBQUU7U0FDaEI7QUFDRCx5QkFBaUIsRUFBRTtBQUNmLGlCQUFLLEVBQUUsZUFBZTtBQUN0QixnQkFBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxFQUFFLElBQUk7U0FDbEI7QUFDRCwwQkFBa0IsRUFBRTtBQUNoQixpQkFBSyxFQUFFLFNBQVM7QUFDaEIsdUJBQVcsRUFBRSw2QkFBNkI7QUFDMUMsZ0JBQUksRUFBRSxTQUFTO0FBQ2YscUJBQVMsRUFBRSxLQUFLO1NBQ25CO0tBQ0o7O0FBRUQsWUFBUSxFQUFBLG9CQUFHOzs7QUFDUCxZQUFJLENBQUMsY0FBYyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQzs7QUFFaEQsWUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDeEQsMEJBQWMsRUFBRSxzQkFBTTtBQUNsQixzQkFBSyxJQUFJLEVBQUUsQ0FBQzthQUNmO1NBQ0osQ0FBQyxDQUFDLENBQUM7O0FBRUosWUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQUEsTUFBTTttQkFBSSxNQUFLLFlBQVksQ0FBQyxNQUFNLENBQUM7U0FBQSxDQUFDLENBQUM7S0FDakc7O0FBRUQsY0FBVSxFQUFBLHNCQUFHO0FBQ1QsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixZQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2xDOzs7OztBQUtELGdCQUFZLEVBQUEsc0JBQUMsTUFBTSxFQUFFOzs7QUFDakIsY0FBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFNO0FBQ2hDLGdCQUFJLE9BQUssU0FBUyxFQUFFLElBQUksT0FBSyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDbEQsdUJBQUssSUFBSSxFQUFFLENBQUM7YUFDZjtTQUNKLENBQUMsQ0FBQztLQUNOOzs7OztBQUtELFFBQUksRUFBQSxnQkFBRztBQUNILFlBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxPQUFPLEVBQUU7WUFDdkQsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO1lBQ2xDLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFM0MsWUFBSSxZQUFZLEVBQUU7QUFDZCxhQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3JFLE1BQU07QUFDSCxnQkFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdkM7S0FDSjs7Ozs7Ozs7O0FBU0QsZ0JBQVksRUFBQSxzQkFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQzNCLFlBQUksSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUUvQixZQUFJO0FBQ0EsZ0JBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTNCLGdCQUFJLENBQUMscUJBQXFCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUMzRCxDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1YsZ0JBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekMsbUJBQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEI7S0FDSjs7Ozs7Ozs7O0FBU0QscUJBQWlCLEVBQUEsMkJBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUM5QixZQUFJLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFL0IsWUFBSTtBQUNBLGdCQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFO2dCQUNqRCxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7QUFDekMsc0JBQU0sRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTthQUNyRCxDQUFDLENBQUM7O0FBRVAsc0JBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQzs7QUFFdEYsZ0JBQUksQ0FBQyxxQkFBcUIsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzVELENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDVixnQkFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxtQkFBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0QjtLQUNKOzs7Ozs7OztBQVFELHlCQUFxQixFQUFBLCtCQUFDLE9BQU8sRUFBRTtBQUMzQixZQUFJLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxFQUFFO0FBQ2hDLGdCQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2QztLQUNKOzs7Ozs7OztBQVFELDBCQUFzQixFQUFBLGdDQUFDLE9BQU8sRUFBRTtBQUM1QixZQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxFQUFFO0FBQ2pDLGdCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN4QztLQUNKOzs7Ozs7OztBQVFELDJCQUF1QixFQUFBLG1DQUFHO0FBQ3RCLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO0tBQzVHOzs7Ozs7OztBQVFELDRCQUF3QixFQUFBLG9DQUFHO0FBQ3ZCLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO0tBQzdHOzs7Ozs7OztBQVFELGFBQVMsRUFBQSxxQkFBRztBQUNSLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztLQUN6RDs7Ozs7Ozs7QUFRRCxtQkFBZSxFQUFBLHlCQUFDLE1BQU0sRUFBRTtBQUNwQixlQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ2hGOzs7Ozs7Ozs7O0FBVUQsY0FBVSxFQUFBLG9CQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLFVBQVUsQ0FBQzs7QUFFZixZQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsRUFBRTtBQUNwRCxzQkFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQztBQUNoRSxzQkFBVSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN4RDs7QUFFRCxZQUFJLFVBQVUsRUFBRTtBQUNaLG1CQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUMzRCxNQUFNO0FBQ0gsc0JBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOztBQUV0RCxnQkFBSSxVQUFVLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN2QywwQkFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMxRTs7QUFFRCxnQkFBSSxVQUFVLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUN6Qyx1QkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDM0QsTUFBTTtBQUNILHVCQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2FBQ2hFO1NBQ0o7S0FDSjs7Ozs7Ozs7QUFRRCxvQkFBZ0IsRUFBQSw0QkFBRztBQUNmLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ2pFO0NBQ0oiLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9jc3MtY29tYi9zcmMvY3NzLWNvbWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQ1NTY29tYiA9IHJlcXVpcmUoJ2Nzc2NvbWInKSxcblxuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJyksXG4gICAgZnMgPSByZXF1aXJlKCdmcycpLFxuXG4gICAgQ29tcG9zaXRlRGlzcG9zYWJsZSA9IHJlcXVpcmUoJ2F0b20nKS5Db21wb3NpdGVEaXNwb3NhYmxlLFxuXG4gICAgYWxsb3dlZEdyYW1tYXMgPSBbJ2NzcycsICdsZXNzJywgJ3Njc3MnLCAnc2FzcycsICdzdHlsJ10sXG5cbiAgICBnZXRVc2VySG9tZSA9IGZ1bmN0aW9uIGdldFVzZXJIb21lICgpIHtcbiAgICAgICAgcmV0dXJuIHByb2Nlc3MuZW52LkhPTUUgfHwgcHJvY2Vzcy5lbnYuSE9NRVBBVEggfHwgcHJvY2Vzcy5lbnYuVVNFUlBST0ZJTEU7XG4gICAgfTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3N1YnNjcmlwdGlvbnM6IHVuZGVmaW5lZCxcbiAgICBfZWRpdG9yT2JzZXJ2ZXI6IHVuZGVmaW5lZCxcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ1xuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBjb25maWc6IHtcbiAgICAgICAgc2hvdWxkTm90U2VhcmNoQ29uZmlnOiB7XG4gICAgICAgICAgICB0aXRsZTogJ0Rpc2FibGUgY29uZmlnIHNlYXJjaGluZycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2FibGUgY29uZmlnIHNlYXJjaGluZyBpbiBwcm9qZWN0IGRpcmVjdG9yeSBhbmQgdXNlIHByZWRlZmluZWQgb3IgY3VzdG9tIGNvbmZpZycsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAnZGVmYXVsdCc6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIHByZWRlZjoge1xuICAgICAgICAgICAgdGl0bGU6ICdQcmVkZWZpbmVkIGNvbmZpZ3MnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaWxsIGJlIHVzZWQgaWYgY29uZmlnIGlzIG5vdCBmb3VuZCBpbiBwcm9qZWN0IGRpcmVjdG9yeScsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICdkZWZhdWx0JzogJ2Nzc2NvbWInLFxuICAgICAgICAgICAgJ2VudW0nOiBbJ2Nzc2NvbWInLCAnemVuJywgJ3lhbmRleCddXG4gICAgICAgIH0sXG4gICAgICAgIGN1c3RvbUNvbmZpZzoge1xuICAgICAgICAgICAgdGl0bGU6ICdDdXN0b20gY29uZmlnIChGdWxsIHBhdGggdG8gZmlsZSknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaWxsIGJlIHVzZWQgaWYgY29uZmlnIGlzIG5vdCBmb3VuZCBpbiBwcm9qZWN0IGRpcmVjdG9yeSwnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnIGhhcyBtb3JlIHByaW9yaXR5IHRoYW4gcHJlZGVmaW5lZCBjb25maWdzLicsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICdkZWZhdWx0JzogJydcbiAgICAgICAgfSxcbiAgICAgICAgc2hvd05vdGlmaWNhdGlvbnM6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnTm90aWZpY2F0aW9ucycsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAnZGVmYXVsdCc6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgc2hvdWxkVXBkYXRlT25TYXZlOiB7XG4gICAgICAgICAgICB0aXRsZTogJ09uIFNhdmUnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQcm9jZXNzIGZpbGUgb24gZXZlcnkgc2F2ZS4nLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgJ2RlZmF1bHQnOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFjdGl2YXRlKCkge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICAgICAnY3NzLWNvbWI6cnVuJzogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5fZWRpdG9yT2JzZXJ2ZXIgPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHRoaXMuaGFuZGxlRXZlbnRzKGVkaXRvcikpO1xuICAgIH0sXG5cbiAgICBkZWFjdGl2YXRlKCkge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fZWRpdG9yT2JzZXJ2ZXIuZGlzcG9zZSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGhhbmRsZUV2ZW50cyhlZGl0b3IpIHtcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLm9uV2lsbFNhdmUoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzT25TYXZlKCkgJiYgdGhpcy5faXNBbGxvd2VkR3JhbWEoZWRpdG9yKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjb21iKCkge1xuICAgICAgICB2YXIgZmlsZVBhdGggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpLmdldFBhdGgoKSxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuX2dldENvbmZpZyhmaWxlUGF0aCksXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSB0aGlzLl9nZXRTZWxlY3RlZFRleHQoKTtcblxuICAgICAgICBpZiAoc2VsZWN0ZWRUZXh0KSB7XG4gICAgICAgICAgICAhdGhpcy5faXNPblNhdmUoKSAmJiB0aGlzLl9wcm9jZXNzU2VsZWN0aW9uKHNlbGVjdGVkVGV4dCwgY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NGaWxlKGZpbGVQYXRoLCBjb25maWcpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3Mgd2hvbGUgZmlsZSBiZSBjc3Njb21iXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlUGF0aCDigJQgZmlsZSB0byBwcm9jZXNzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyDigJQgY3NzY29tYiBjb25maWdcbiAgICAgKi9cbiAgICBfcHJvY2Vzc0ZpbGUoZmlsZVBhdGgsIGNvbmZpZykge1xuICAgICAgICB2YXIgY29tYiA9IG5ldyBDU1Njb21iKGNvbmZpZyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbWIucHJvY2Vzc0ZpbGUoZmlsZVBhdGgpO1xuXG4gICAgICAgICAgICB0aGlzLl9zaG93SW5mb05vdGlmaWNhdGlvbignRmlsZSBwcm9jZXNzZWQgYnkgY3NzY29tYicpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dFcnJvck5vdGlmaWNhdGlvbihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUHJvY2VzcyBvbmx5IHNlbGVjdGlvbiBieSBjc3Njb21iXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgdG8gcHJvY2Vzc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgY3NzY29tYiBjb25maWdcbiAgICAgKi9cbiAgICBfcHJvY2Vzc1NlbGVjdGlvbihzdHJpbmcsIGNvbmZpZykge1xuICAgICAgICB2YXIgY29tYiA9IG5ldyBDU1Njb21iKGNvbmZpZyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLFxuICAgICAgICAgICAgICAgIHByb2Nlc3NlZFN0cmluZyA9IGNvbWIucHJvY2Vzc1N0cmluZyhzdHJpbmcsIHtcbiAgICAgICAgICAgICAgICAgICAgc3ludGF4OiB0ZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5uYW1lLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGV4dEVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZSh0ZXh0RWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSwgcHJvY2Vzc2VkU3RyaW5nKTtcblxuICAgICAgICAgICAgdGhpcy5fc2hvd0luZm9Ob3RpZmljYXRpb24oJ0xpbmVzIHByb2Nlc3NlZCBieSBjc3Njb21iJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5fc2hvd0Vycm9yTm90aWZpY2F0aW9uKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGluZm8gbm90aWZpY2F0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIOKAlCBub3RpZmljYXRpb24gdGV4dFxuICAgICAqL1xuICAgIF9zaG93SW5mb05vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3dJbmZvTm90aWZpY2F0aW9uKCkpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgZXJyb3Igbm90aWZpY2F0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIG5vdGlmaWNhdGlvbiB0ZXh0XG4gICAgICovXG4gICAgX3Nob3dFcnJvck5vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3dFcnJvck5vdGlmaWNhdGlvbigpKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgaW5mbyBub3RpZmljYXRpb25zIHNob3VsZCBiZSBzaG93blxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIF9pc1Nob3dJbmZvTm90aWZpY2F0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdjc3MtY29tYi5zaG93Tm90aWZpY2F0aW9ucycpICYmIGF0b20ubm90aWZpY2F0aW9ucyAmJiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgZXJyb3Igbm90aWZpY2F0aW9ucyBzaG91bGQgYmUgc2hvd25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBfaXNTaG93RXJyb3JOb3RpZmljYXRpb24oKSB7XG4gICAgICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ2Nzcy1jb21iLnNob3dOb3RpZmljYXRpb25zJykgJiYgYXRvbS5ub3RpZmljYXRpb25zICYmIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgb24gc2F2ZSBvcHRpb24gZW5hYmxlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIF9pc09uU2F2ZSgpIHtcbiAgICAgICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnY3NzLWNvbWIuc2hvdWxkVXBkYXRlT25TYXZlJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGZpbGUgaXMgaW4gYWxsb3dlZCBncmFtbWEgbGlzdFxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIF9pc0FsbG93ZWRHcmFtYShlZGl0b3IpIHtcbiAgICAgICAgcmV0dXJuIGFsbG93ZWRHcmFtbWFzLmluZGV4T2YoZWRpdG9yLmdldEdyYW1tYXIoKS5uYW1lLnRvTG93ZXJDYXNlKCkpICE9PSAtMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIGFuZCBsb2FkIGNzc2NvbWIgY29uZmlnXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlUGF0aCBmcm9tIHdoZXJlIHN0YXJ0IHNlYXJjaGluZ1xuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBjc3Njb21iIGNvbmZpZ1xuICAgICAqL1xuICAgIF9nZXRDb25maWcoZmlsZVBhdGgpIHtcbiAgICAgICAgdmFyIGNvbmZpZ1BhdGg7XG5cbiAgICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ2Nzcy1jb21iLnNob3VsZE5vdFNlYXJjaENvbmZpZycpKSB7XG4gICAgICAgICAgICBjb25maWdQYXRoID0gcGF0aC5qb2luKHBhdGguZGlybmFtZShmaWxlUGF0aCksICcuY3NzY29tYi5qc29uJyk7XG4gICAgICAgICAgICBjb25maWdQYXRoID0gQ1NTY29tYi5nZXRDdXN0b21Db25maWdQYXRoKGNvbmZpZ1BhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbmZpZ1BhdGgpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjb25maWdQYXRoLCAndXRmLTgnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWdQYXRoID0gYXRvbS5jb25maWcuZ2V0KCdjc3MtY29tYi5jdXN0b21Db25maWcnKTtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZ1BhdGggJiYgY29uZmlnUGF0aC5tYXRjaCgvXlxcfi8pKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnUGF0aCA9IHBhdGguam9pbihnZXRVc2VySG9tZSgpLCBjb25maWdQYXRoLnJlcGxhY2UoL15cXH5cXC8vLCAnJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29uZmlnUGF0aCAmJiBmcy5leGlzdHNTeW5jKGNvbmZpZ1BhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNvbmZpZ1BhdGgsICd1dGYtOCcpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIENTU2NvbWIuZ2V0Q29uZmlnKGF0b20uY29uZmlnLmdldCgnY3NzLWNvbWIucHJlZGVmJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBzZWxlY3RlZCB0ZXh0IGZvciBjdXJyZW50IG9wZW5lZCBmaWxlXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBfZ2V0U2VsZWN0ZWRUZXh0KCkge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFNlbGVjdGVkVGV4dCgpO1xuICAgIH1cbn07XG4iXX0=