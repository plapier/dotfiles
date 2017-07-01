Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _csscomb = require('csscomb');

var _csscomb2 = _interopRequireDefault(_csscomb);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

'use babel';

exports['default'] = {
    config: {
        projectConfigs: {
            title: 'Use project config',
            description: 'Relative to the project directory. Example: `.csscomb.json` or `configs/.csscomb.json`. Leave blank if you want to use the following setting',
            'default': '',
            type: 'string'
        },
        commonConfigs: {
            title: 'Use common config',
            description: 'Put here a full path to your config. Example: `/Users/jchouse/propjects/.csscomb.json`. Leave blank if you want to use the following setting',
            'default': '',
            type: 'string'
        },
        readyMadeConfigs: {
            title: 'Ready made configs',
            description: 'Used when you do not specify a project or common file. The details below.',
            type: 'string',
            'default': 'yandex',
            'enum': ['yandex', 'csscomb', 'zen']
        }
    },

    getSettingsConfig: function getSettingsConfig() {
        var cssCombPackage = atom.packages.getLoadedPackage('atom-css-comb'),
            error,
            optionsFilePath,
            projectConfigs = atom.config.get('atom-css-comb.projectConfigs'),
            projectPath = atom.project.getPaths()[0],
            commonConfigs = atom.config.get('atom-css-comb.commonConfigs'),
            readyMadeConfigs = atom.config.get('atom-css-comb.readyMadeConfigs');

        if (projectConfigs) {
            optionsFilePath = _path2['default'].join(projectPath, projectConfigs);
            try {
                return require(optionsFilePath);
            } catch (error) {
                return error;
            }
        } else if (commonConfigs) {
            try {
                return require(commonConfigs);
            } catch (error) {
                return error;
            }
        } else {
            return readyMadeConfigs || 'yandex';
        }
    },

    activate: function activate(state) {
        var _this = this;

        this.subscriptions = new _atom.CompositeDisposable();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'css-comb:comb': function cssCombComb() {
                return _this.comb();
            }
        }));
    },

    combFile: function combFile(comb, syntax) {
        try {
            var text = this._getText(),
                combed = comb.processString(text, { syntax: syntax });

            atom.workspace.getActivePaneItem().setText(combed);
        } catch (error) {
            atom.notifications.addError(error.message);
        }
    },

    combText: function combText(comb, text) {
        var combed,
            syntax = this._getSytax(),
            activePane = atom.workspace.getActivePaneItem();

        try {
            combed = comb.processString(text, { syntax: syntax });

            activePane.setTextInBufferRange(activePane.getSelectedBufferRange(), combed);
        } catch (error) {
            atom.notifications.addError(error.message);
        }
    },

    _getSytax: function _getSytax() {
        var syntax = atom.workspace.getActiveTextEditor().getGrammar().name.toLowerCase();

        if (['css', 'less', 'sass', 'scss'].indexOf(syntax) !== -1) {
            return syntax;
        } else if (syntax === 'html') {
            return 'css';
        } else {
            return new Error();
        }
    },

    _getSelectedText: function _getSelectedText() {
        return atom.workspace.getActiveTextEditor().getSelectedText();
    },

    _getText: function _getText() {
        return atom.workspace.getActiveTextEditor().getText();
    },

    comb: function comb() {
        var comb,
            config = this.getSettingsConfig(),
            selectedText = this._getSelectedText(),
            syntax = this._getSytax();

        if (config instanceof Error) {
            return atom.notifications.addError(config.message);
        } else if (syntax instanceof Error) {
            return atom.notifications.addError('Not supported syntax');
        } else {
            comb = new _csscomb2['default'](config);

            if (selectedText !== '') {
                this.combText(comb, selectedText, syntax);
            } else {
                var _name = atom.workspace.getActiveTextEditor().getGrammar().name;
                if (syntax === 'css' && _name === 'HTML') {
                    atom.notifications.addError('Please select the text for combing.');
                    return;
                }
                this.combFile(comb, syntax);
            }
        }
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL2RvdGZpbGVzL2F0b20vcGFja2FnZXMvYXRvbS1jc3MtY29tYi9saWIvY3NzLWNvbWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVrQyxNQUFNOzt1QkFDdkIsU0FBUzs7OztvQkFDVCxNQUFNOzs7O0FBSnZCLFdBQVcsQ0FBQzs7cUJBTUc7QUFDWCxVQUFNLEVBQUU7QUFDSixzQkFBYyxFQUFFO0FBQ1osaUJBQUssRUFBRSxvQkFBb0I7QUFDM0IsdUJBQVcsRUFBRSw4SUFBOEk7QUFDM0osdUJBQVMsRUFBRTtBQUNYLGdCQUFJLEVBQUUsUUFBUTtTQUNqQjtBQUNELHFCQUFhLEVBQUU7QUFDWCxpQkFBSyxFQUFFLG1CQUFtQjtBQUMxQix1QkFBVyxFQUFFLDhJQUE4STtBQUMzSix1QkFBUyxFQUFFO0FBQ1gsZ0JBQUksRUFBRSxRQUFRO1NBQ2pCO0FBQ0Qsd0JBQWdCLEVBQUU7QUFDZCxpQkFBSyxFQUFFLG9CQUFvQjtBQUMzQix1QkFBVyxFQUFFLDJFQUEyRTtBQUN4RixnQkFBSSxFQUFFLFFBQVE7QUFDZCx1QkFBUyxRQUFRO0FBQ2pCLG9CQUFNLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUM7U0FDckM7S0FDSjs7QUFFRCxxQkFBaUIsRUFBQyw2QkFBRztBQUNqQixZQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQztZQUNoRSxLQUFLO1lBQ0wsZUFBZTtZQUNmLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQztZQUNoRSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDO1lBQzlELGdCQUFnQixHQUFHLElB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ZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL2RvdGZpbGVzL2F0b20vcGFja2FnZXMvYXRvbS1jc3MtY29tYi9saWIvY3NzLWNvbWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBDb21iIGZyb20gJ2Nzc2NvbWInO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBjb25maWc6IHtcbiAgICAgICAgcHJvamVjdENvbmZpZ3M6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnVXNlIHByb2plY3QgY29uZmlnJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUmVsYXRpdmUgdG8gdGhlIHByb2plY3QgZGlyZWN0b3J5LiBFeGFtcGxlOiBgLmNzc2NvbWIuanNvbmAgb3IgYGNvbmZpZ3MvLmNzc2NvbWIuanNvbmAuIExlYXZlIGJsYW5rIGlmIHlvdSB3YW50IHRvIHVzZSB0aGUgZm9sbG93aW5nIHNldHRpbmcnLFxuICAgICAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9LFxuICAgICAgICBjb21tb25Db25maWdzOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1VzZSBjb21tb24gY29uZmlnJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHV0IGhlcmUgYSBmdWxsIHBhdGggdG8geW91ciBjb25maWcuIEV4YW1wbGU6IGAvVXNlcnMvamNob3VzZS9wcm9wamVjdHMvLmNzc2NvbWIuanNvbmAuIExlYXZlIGJsYW5rIGlmIHlvdSB3YW50IHRvIHVzZSB0aGUgZm9sbG93aW5nIHNldHRpbmcnLFxuICAgICAgICAgICAgZGVmYXVsdDogJycsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9LFxuICAgICAgICByZWFkeU1hZGVDb25maWdzOiB7XG4gICAgICAgICAgICB0aXRsZTogJ1JlYWR5IG1hZGUgY29uZmlncycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1VzZWQgd2hlbiB5b3UgZG8gbm90IHNwZWNpZnkgYSBwcm9qZWN0IG9yIGNvbW1vbiBmaWxlLiBUaGUgZGV0YWlscyBiZWxvdy4nLFxuICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAneWFuZGV4JyxcbiAgICAgICAgICAgIGVudW06IFsneWFuZGV4JywgJ2Nzc2NvbWInLCAnemVuJ11cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRTZXR0aW5nc0NvbmZpZyAoKSB7XG4gICAgICAgIHZhciBjc3NDb21iUGFja2FnZSA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnYXRvbS1jc3MtY29tYicpLFxuICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICBvcHRpb25zRmlsZVBhdGgsXG4gICAgICAgICAgICBwcm9qZWN0Q29uZmlncyA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jc3MtY29tYi5wcm9qZWN0Q29uZmlncycpLFxuICAgICAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSxcbiAgICAgICAgICAgIGNvbW1vbkNvbmZpZ3MgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tY3NzLWNvbWIuY29tbW9uQ29uZmlncycpLFxuICAgICAgICAgICAgcmVhZHlNYWRlQ29uZmlncyA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jc3MtY29tYi5yZWFkeU1hZGVDb25maWdzJyk7XG5cbiAgICAgICAgaWYgKHByb2plY3RDb25maWdzKSB7XG4gICAgICAgICAgICBvcHRpb25zRmlsZVBhdGggPSBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIHByb2plY3RDb25maWdzKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVpcmUob3B0aW9uc0ZpbGVQYXRoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGNvbW1vbkNvbmZpZ3MpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVpcmUoY29tbW9uQ29uZmlncyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZWFkeU1hZGVDb25maWdzIHx8ICd5YW5kZXgnO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFjdGl2YXRlIChzdGF0ZSkge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAgICdjc3MtY29tYjpjb21iJzogKCkgPT4gdGhpcy5jb21iKClcbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBjb21iRmlsZSAoY29tYiwgc3ludGF4KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMuX2dldFRleHQoKSxcbiAgICAgICAgICAgICAgICBjb21iZWQgPSBjb21iLnByb2Nlc3NTdHJpbmcodGV4dCwge3N5bnRheDogc3ludGF4fSk7XG5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkuc2V0VGV4dChjb21iZWQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGNvbWJUZXh0IChjb21iLCB0ZXh0KSB7XG4gICAgICAgIHZhciBjb21iZWQsXG4gICAgICAgICAgICBzeW50YXggPSB0aGlzLl9nZXRTeXRheCgpLFxuICAgICAgICAgICAgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbWJlZCA9IGNvbWIucHJvY2Vzc1N0cmluZyh0ZXh0LCB7c3ludGF4OiBzeW50YXh9KTtcblxuICAgICAgICAgICAgYWN0aXZlUGFuZS5zZXRUZXh0SW5CdWZmZXJSYW5nZShhY3RpdmVQYW5lLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSwgY29tYmVkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfZ2V0U3l0YXggKCkge1xuICAgICAgICB2YXIgc3ludGF4ID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldEdyYW1tYXIoKS5uYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgaWYgKFsnY3NzJywgJ2xlc3MnLCAnc2FzcycsICdzY3NzJ10uaW5kZXhPZihzeW50YXgpICE9PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIHN5bnRheDtcbiAgICAgICAgfSBlbHNlIGlmIChzeW50YXggPT09ICdodG1sJykge1xuICAgICAgICAgICAgcmV0dXJuICdjc3MnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9nZXRTZWxlY3RlZFRleHQgKCkge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFNlbGVjdGVkVGV4dCgpO1xuICAgIH0sXG5cbiAgICBfZ2V0VGV4dCAoKSB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0VGV4dCgpO1xuICAgIH0sXG5cbiAgICBjb21iICgpIHtcbiAgICAgICAgdmFyIGNvbWIsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLmdldFNldHRpbmdzQ29uZmlnKCksXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSB0aGlzLl9nZXRTZWxlY3RlZFRleHQoKSxcbiAgICAgICAgICAgIHN5bnRheCA9IHRoaXMuX2dldFN5dGF4KCk7XG5cbiAgICAgICAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGNvbmZpZy5tZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIGlmIChzeW50YXggaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTm90IHN1cHBvcnRlZCBzeW50YXgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbWIgPSBuZXcgQ29tYihjb25maWcpO1xuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRUZXh0ICE9PSAnJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tYlRleHQoY29tYiwgc2VsZWN0ZWRUZXh0LCBzeW50YXgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgX25hbWUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0R3JhbW1hcigpLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKHN5bnRheCA9PT0gJ2NzcycgJiYgX25hbWUgPT09ICdIVE1MJykge1xuICAgICAgICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1BsZWFzZSBzZWxlY3QgdGhlIHRleHQgZm9yIGNvbWJpbmcuJyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jb21iRmlsZShjb21iLCBzeW50YXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcbiJdfQ==
//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/atom-css-comb/lib/css-comb.js
