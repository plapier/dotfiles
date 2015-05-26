'use strict';

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvY3NzLWNvbWIvbGliL2Nzcy1jb21iLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUU7QUFDekMsU0FBSyxFQUFFLElBQUk7Q0FDZCxDQUFDLENBQUM7QUFDSCxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0lBQzVCLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ3RCLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ2xCLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUI7SUFDekQsY0FBYyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztJQUN4RCxXQUFXLEdBQUcsU0FBUyxXQUFXLEdBQUc7QUFDckMsV0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztDQUM5RSxDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRzs7OztBQUlqQixrQkFBYyxFQUFFLFNBQVM7QUFDekIsbUJBQWUsRUFBRSxTQUFTOzs7Ozs7O0FBTzFCLFVBQU0sRUFBRTtBQUNKLDZCQUFxQixFQUFFO0FBQ25CLGlCQUFLLEVBQUUsMEJBQTBCO0FBQ2pDLHVCQUFXLEVBQUUsbUZBQW1GO0FBQ2hHLGdCQUFJLEVBQUUsU0FBUztBQUNmLHFCQUFTLEVBQUUsS0FBSztTQUNuQjtBQUNELGNBQU0sRUFBRTtBQUNKLGlCQUFLLEVBQUUsb0JBQW9CO0FBQzNCLHVCQUFXLEVBQUUsMERBQTBEO0FBQ3ZFLGdCQUFJLEVBQUUsUUFBUTtBQUNkLHFCQUFTLEVBQUUsU0FBUztBQUNw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QUFVLEVBQUU7QUFDWixtQkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDM0QsTUFBTTtBQUNILHNCQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQzs7QUFFdEQsZ0JBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDdkMsMEJBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDMUU7O0FBRUQsZ0JBQUksVUFBVSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDekMsdUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQzNELE1BQU07QUFDSCx1QkFBTyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQzthQUNoRTtTQUNKO0tBQ0o7Ozs7Ozs7O0FBUUQsb0JBQWdCLEVBQUUsU0FBUyxnQkFBZ0IsR0FBRztBQUMxQyxlQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUNqRTtDQUNKLENBQUM7QUFDRixNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL2Nzcy1jb21iL2xpYi9jc3MtY29tYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcbnZhciBDU1Njb21iID0gcmVxdWlyZSgnY3NzY29tYicpLFxuICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJyksXG4gICAgZnMgPSByZXF1aXJlKCdmcycpLFxuICAgIENvbXBvc2l0ZURpc3Bvc2FibGUgPSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgICBhbGxvd2VkR3JhbW1hcyA9IFsnY3NzJywgJ2xlc3MnLCAnc2NzcycsICdzYXNzJywgJ3N0eWwnXSxcbiAgICBnZXRVc2VySG9tZSA9IGZ1bmN0aW9uIGdldFVzZXJIb21lKCkge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5IT01FIHx8IHByb2Nlc3MuZW52LkhPTUVQQVRIIHx8IHByb2Nlc3MuZW52LlVTRVJQUk9GSUxFO1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0ge1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3N1YnNjcmlwdGlvbnM6IHVuZGVmaW5lZCxcbiAgICBfZWRpdG9yT2JzZXJ2ZXI6IHVuZGVmaW5lZCxcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ1xuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBjb25maWc6IHtcbiAgICAgICAgc2hvdWxkTm90U2VhcmNoQ29uZmlnOiB7XG4gICAgICAgICAgICB0aXRsZTogJ0Rpc2FibGUgY29uZmlnIHNlYXJjaGluZycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rpc2FibGUgY29uZmlnIHNlYXJjaGluZyBpbiBwcm9qZWN0IGRpcmVjdG9yeSBhbmQgdXNlIHByZWRlZmluZWQgb3IgY3VzdG9tIGNvbmZpZycsXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAnZGVmYXVsdCc6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIHByZWRlZjoge1xuICAgICAgICAgICAgdGl0bGU6ICdQcmVkZWZpbmVkIGNvbmZpZ3MnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaWxsIGJlIHVzZWQgaWYgY29uZmlnIGlzIG5vdCBmb3VuZCBpbiBwcm9qZWN0IGRpcmVjdG9yeScsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICdkZWZhdWx0JzogJ2Nzc2NvbWInLFxuICAgICAgICAgICAgJ2VudW0nOiBbJ2Nzc2NvbWInLCAnemVuJywgJ3lhbmRleCddXG4gICAgICAgIH0sXG4gICAgICAgIGN1c3RvbUNvbmZpZzoge1xuICAgICAgICAgICAgdGl0bGU6ICdDdXN0b20gY29uZmlnIChGdWxsIHBhdGggdG8gZmlsZSknLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdXaWxsIGJlIHVzZWQgaWYgY29uZmlnIGlzIG5vdCBmb3VuZCBpbiBwcm9qZWN0IGRpcmVjdG9yeSwnICsgJyBoYXMgbW9yZSBwcmlvcml0eSB0aGFuIHByZWRlZmluZWQgY29uZmlncy4nLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAnZGVmYXVsdCc6ICcnXG4gICAgICAgIH0sXG4gICAgICAgIHNob3dOb3RpZmljYXRpb25zOiB7XG4gICAgICAgICAgICB0aXRsZTogJ05vdGlmaWNhdGlvbnMnLFxuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgJ2RlZmF1bHQnOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHNob3VsZFVwZGF0ZU9uU2F2ZToge1xuICAgICAgICAgICAgdGl0bGU6ICdPbiBTYXZlJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJvY2VzcyBmaWxlIG9uIGV2ZXJ5IHNhdmUuJyxcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICdkZWZhdWx0JzogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhY3RpdmF0ZTogZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAgICAgJ2Nzcy1jb21iOnJ1bic6IGZ1bmN0aW9uIGNzc0NvbWJSdW4oKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuY29tYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5fZWRpdG9yT2JzZXJ2ZXIgPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZnVuY3Rpb24gKGVkaXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmhhbmRsZUV2ZW50cyhlZGl0b3IpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZGVhY3RpdmF0ZTogZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX2VkaXRvck9ic2VydmVyLmRpc3Bvc2UoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBoYW5kbGVFdmVudHM6IGZ1bmN0aW9uIGhhbmRsZUV2ZW50cyhlZGl0b3IpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLm9uV2lsbFNhdmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzMi5faXNPblNhdmUoKSAmJiBfdGhpczIuX2lzQWxsb3dlZEdyYW1hKGVkaXRvcikpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuY29tYigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBjb21iOiBmdW5jdGlvbiBjb21iKCkge1xuICAgICAgICB2YXIgZmlsZVBhdGggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpLmdldFBhdGgoKSxcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuX2dldENvbmZpZyhmaWxlUGF0aCksXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSB0aGlzLl9nZXRTZWxlY3RlZFRleHQoKTtcblxuICAgICAgICBpZiAoc2VsZWN0ZWRUZXh0KSB7XG4gICAgICAgICAgICAhdGhpcy5faXNPblNhdmUoKSAmJiB0aGlzLl9wcm9jZXNzU2VsZWN0aW9uKHNlbGVjdGVkVGV4dCwgY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb2Nlc3NGaWxlKGZpbGVQYXRoLCBjb25maWcpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3Mgd2hvbGUgZmlsZSBiZSBjc3Njb21iXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlUGF0aCDigJQgZmlsZSB0byBwcm9jZXNzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyDigJQgY3NzY29tYiBjb25maWdcbiAgICAgKi9cbiAgICBfcHJvY2Vzc0ZpbGU6IGZ1bmN0aW9uIF9wcm9jZXNzRmlsZShmaWxlUGF0aCwgY29uZmlnKSB7XG4gICAgICAgIHZhciBjb21iID0gbmV3IENTU2NvbWIoY29uZmlnKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29tYi5wcm9jZXNzRmlsZShmaWxlUGF0aCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Nob3dJbmZvTm90aWZpY2F0aW9uKCdGaWxlIHByb2Nlc3NlZCBieSBjc3Njb21iJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5fc2hvd0Vycm9yTm90aWZpY2F0aW9uKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIG9ubHkgc2VsZWN0aW9uIGJ5IGNzc2NvbWJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyB0byBwcm9jZXNzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBjc3Njb21iIGNvbmZpZ1xuICAgICAqL1xuICAgIF9wcm9jZXNzU2VsZWN0aW9uOiBmdW5jdGlvbiBfcHJvY2Vzc1NlbGVjdGlvbihzdHJpbmcsIGNvbmZpZykge1xuICAgICAgICB2YXIgY29tYiA9IG5ldyBDU1Njb21iKGNvbmZpZyk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLFxuICAgICAgICAgICAgICAgIHByb2Nlc3NlZFN0cmluZyA9IGNvbWIucHJvY2Vzc1N0cmluZyhzdHJpbmcsIHtcbiAgICAgICAgICAgICAgICBzeW50YXg6IHRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRleHRFZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UodGV4dEVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCksIHByb2Nlc3NlZFN0cmluZyk7XG5cbiAgICAgICAgICAgIHRoaXMuX3Nob3dJbmZvTm90aWZpY2F0aW9uKCdMaW5lcyBwcm9jZXNzZWQgYnkgY3NzY29tYicpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3dFcnJvck5vdGlmaWNhdGlvbihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2hvdyBpbmZvIG5vdGlmaWNhdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSDigJQgbm90aWZpY2F0aW9uIHRleHRcbiAgICAgKi9cbiAgICBfc2hvd0luZm9Ob3RpZmljYXRpb246IGZ1bmN0aW9uIF9zaG93SW5mb05vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3dJbmZvTm90aWZpY2F0aW9uKCkpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgZXJyb3Igbm90aWZpY2F0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIG5vdGlmaWNhdGlvbiB0ZXh0XG4gICAgICovXG4gICAgX3Nob3dFcnJvck5vdGlmaWNhdGlvbjogZnVuY3Rpb24gX3Nob3dFcnJvck5vdGlmaWNhdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Nob3dFcnJvck5vdGlmaWNhdGlvbigpKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgaW5mbyBub3RpZmljYXRpb25zIHNob3VsZCBiZSBzaG93blxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIF9pc1Nob3dJbmZvTm90aWZpY2F0aW9uOiBmdW5jdGlvbiBfaXNTaG93SW5mb05vdGlmaWNhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnY3NzLWNvbWIuc2hvd05vdGlmaWNhdGlvbnMnKSAmJiBhdG9tLm5vdGlmaWNhdGlvbnMgJiYgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGVycm9yIG5vdGlmaWNhdGlvbnMgc2hvdWxkIGJlIHNob3duXG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgX2lzU2hvd0Vycm9yTm90aWZpY2F0aW9uOiBmdW5jdGlvbiBfaXNTaG93RXJyb3JOb3RpZmljYXRpb24oKSB7XG4gICAgICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ2Nzcy1jb21iLnNob3dOb3RpZmljYXRpb25zJykgJiYgYXRvbS5ub3RpZmljYXRpb25zICYmIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgb24gc2F2ZSBvcHRpb24gZW5hYmxlZFxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIF9pc09uU2F2ZTogZnVuY3Rpb24gX2lzT25TYXZlKCkge1xuICAgICAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdjc3MtY29tYi5zaG91bGRVcGRhdGVPblNhdmUnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgZmlsZSBpcyBpbiBhbGxvd2VkIGdyYW1tYSBsaXN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgX2lzQWxsb3dlZEdyYW1hOiBmdW5jdGlvbiBfaXNBbGxvd2VkR3JhbWEoZWRpdG9yKSB7XG4gICAgICAgIHJldHVybiBhbGxvd2VkR3JhbW1hcy5pbmRleE9mKGVkaXRvci5nZXRHcmFtbWFyKCkubmFtZS50b0xvd2VyQ2FzZSgpKSAhPT0gLTE7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlYXJjaCBhbmQgbG9hZCBjc3Njb21iIGNvbmZpZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZVBhdGggZnJvbSB3aGVyZSBzdGFydCBzZWFyY2hpbmdcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gY3NzY29tYiBjb25maWdcbiAgICAgKi9cbiAgICBfZ2V0Q29uZmlnOiBmdW5jdGlvbiBfZ2V0Q29uZmlnKGZpbGVQYXRoKSB7XG4gICAgICAgIHZhciBjb25maWdQYXRoO1xuXG4gICAgICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdjc3MtY29tYi5zaG91bGROb3RTZWFyY2hDb25maWcnKSkge1xuICAgICAgICAgICAgY29uZmlnUGF0aCA9IHBhdGguam9pbihwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCAnLmNzc2NvbWIuanNvbicpO1xuICAgICAgICAgICAgY29uZmlnUGF0aCA9IENTU2NvbWIuZ2V0Q3VzdG9tQ29uZmlnUGF0aChjb25maWdQYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWdQYXRoKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoY29uZmlnUGF0aCwgJ3V0Zi04JykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uZmlnUGF0aCA9IGF0b20uY29uZmlnLmdldCgnY3NzLWNvbWIuY3VzdG9tQ29uZmlnJyk7XG5cbiAgICAgICAgICAgIGlmIChjb25maWdQYXRoICYmIGNvbmZpZ1BhdGgubWF0Y2goL15cXH4vKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ1BhdGggPSBwYXRoLmpvaW4oZ2V0VXNlckhvbWUoKSwgY29uZmlnUGF0aC5yZXBsYWNlKC9eXFx+XFwvLywgJycpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbmZpZ1BhdGggJiYgZnMuZXhpc3RzU3luYyhjb25maWdQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjb25maWdQYXRoLCAndXRmLTgnKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBDU1Njb21iLmdldENvbmZpZyhhdG9tLmNvbmZpZy5nZXQoJ2Nzcy1jb21iLnByZWRlZicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gc2VsZWN0ZWQgdGV4dCBmb3IgY3VycmVudCBvcGVuZWQgZmlsZVxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgX2dldFNlbGVjdGVkVGV4dDogZnVuY3Rpb24gX2dldFNlbGVjdGVkVGV4dCgpIHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKS5nZXRTZWxlY3RlZFRleHQoKTtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iXX0=