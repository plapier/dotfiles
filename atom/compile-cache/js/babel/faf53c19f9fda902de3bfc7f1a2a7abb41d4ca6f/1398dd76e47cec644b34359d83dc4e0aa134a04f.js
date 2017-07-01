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
                this.combFile(comb, syntax);
            }
        }
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL2RvdGZpbGVzL2F0b20vcGFja2FnZXMvYXRvbS1jc3MtY29tYi9saWIvY3NzLWNvbWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVrQyxNQUFNOzt1QkFDdkIsU0FBUzs7OztvQkFDVCxNQUFNOzs7O0FBSnZCLFdBQVcsQ0FBQzs7cUJBTUc7QUFDWCxVQUFNLEVBQUU7QUFDSixzQkFBYyxFQUFFO0FBQ1osaUJBQUssRUFBRSxvQkFBb0I7QUFDM0IsdUJBQVcsRUFBRSw4SUFBOEk7QUFDM0osdUJBQVMsRUFBRTtBQUNYLGdCQUFJLEVBQUUsUUFBUTtTQUNqQjtBQUNELHFCQUFhLEVBQUU7QUFDWCxpQkFBSyxFQUFFLG1CQUFtQjtBQUMxQix1QkFBVyxFQUFFLDhJQUE4STtBQUMzSix1QkFBUyxFQUFFO0FBQ1gsZ0JBQUksRUFBRSxRQUFRO1NBQ2pCO0FBQ0Qsd0JBQWdCLEVBQUU7QUFDZCxpQkFBSyxFQUFFLG9CQUFvQjtBQUMzQix1QkFBVyxFQUFFLDJFQUEyRTtBQUN4RixnQkFBSSxFQUFFLFFBQVE7QUFDZCx1QkFBUyxRQUFRO0FBQ2pCLG9CQUFNLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUM7U0FDckM7S0FDSjs7QUFFRCxxQkFBaUIsRUFBQyw2QkFBRztBQUNqQixZQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQztZQUNoRSxLQUFLO1lBQ0wsZUFBZTtZQUNmLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQztZQUNoRSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDO1lBQzlELGdCQUFnQixHQUFHLElB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QUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDekQ7O0FBRUQsUUFBSSxFQUFDLGdCQUFHO0FBQ0osWUFBSSxJQUFJO1lBQ0osTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUNqQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3RDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRTlCLFlBQUksTUFBTSxZQUFZLEtBQUssRUFBRTtBQUN6QixtQkFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdEQsTUFBTSxJQUFJLE1BQU0sWUFBWSxLQUFLLEVBQUU7QUFDaEMsbUJBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUM5RCxNQUFNO0FBQ0gsZ0JBQUksR0FBRyx5QkFBUyxNQUFNLENBQUMsQ0FBQzs7QUFFeEIsZ0JBQUksWUFBWSxLQUFLLEVBQUUsRUFBRTtBQUNyQixvQkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzdDLE1BQU07QUFDSCxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDL0I7U0FDSjtLQUNKO0NBQ0oiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9hdG9tLWNzcy1jb21iL2xpYi9jc3MtY29tYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENvbWIgZnJvbSAnY3NzY29tYic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNvbmZpZzoge1xuICAgICAgICBwcm9qZWN0Q29uZmlnczoge1xuICAgICAgICAgICAgdGl0bGU6ICdVc2UgcHJvamVjdCBjb25maWcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWxhdGl2ZSB0byB0aGUgcHJvamVjdCBkaXJlY3RvcnkuIEV4YW1wbGU6IGAuY3NzY29tYi5qc29uYCBvciBgY29uZmlncy8uY3NzY29tYi5qc29uYC4gTGVhdmUgYmxhbmsgaWYgeW91IHdhbnQgdG8gdXNlIHRoZSBmb2xsb3dpbmcgc2V0dGluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH0sXG4gICAgICAgIGNvbW1vbkNvbmZpZ3M6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnVXNlIGNvbW1vbiBjb25maWcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQdXQgaGVyZSBhIGZ1bGwgcGF0aCB0byB5b3VyIGNvbmZpZy4gRXhhbXBsZTogYC9Vc2Vycy9qY2hvdXNlL3Byb3BqZWN0cy8uY3NzY29tYi5qc29uYC4gTGVhdmUgYmxhbmsgaWYgeW91IHdhbnQgdG8gdXNlIHRoZSBmb2xsb3dpbmcgc2V0dGluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5TWFkZUNvbmZpZ3M6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUmVhZHkgbWFkZSBjb25maWdzJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVXNlZCB3aGVuIHlvdSBkbyBub3Qgc3BlY2lmeSBhIHByb2plY3Qgb3IgY29tbW9uIGZpbGUuIFRoZSBkZXRhaWxzIGJlbG93LicsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6ICd5YW5kZXgnLFxuICAgICAgICAgICAgZW51bTogWyd5YW5kZXgnLCAnY3NzY29tYicsICd6ZW4nXVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFNldHRpbmdzQ29uZmlnICgpIHtcbiAgICAgICAgdmFyIGNzc0NvbWJQYWNrYWdlID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdhdG9tLWNzcy1jb21iJyksXG4gICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgIG9wdGlvbnNGaWxlUGF0aCxcbiAgICAgICAgICAgIHByb2plY3RDb25maWdzID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNzcy1jb21iLnByb2plY3RDb25maWdzJyksXG4gICAgICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLFxuICAgICAgICAgICAgY29tbW9uQ29uZmlncyA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jc3MtY29tYi5jb21tb25Db25maWdzJyksXG4gICAgICAgICAgICByZWFkeU1hZGVDb25maWdzID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNzcy1jb21iLnJlYWR5TWFkZUNvbmZpZ3MnKTtcblxuICAgICAgICBpZiAocHJvamVjdENvbmZpZ3MpIHtcbiAgICAgICAgICAgIG9wdGlvbnNGaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgcHJvamVjdENvbmZpZ3MpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWlyZShvcHRpb25zRmlsZVBhdGgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY29tbW9uQ29uZmlncykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWlyZShjb21tb25Db25maWdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlYWR5TWFkZUNvbmZpZ3MgfHwgJ3lhbmRleCc7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYWN0aXZhdGUgKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICAgJ2Nzcy1jb21iOmNvbWInOiAoKSA9PiB0aGlzLmNvbWIoKVxuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIGNvbWJGaWxlIChjb21iLCBzeW50YXgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5fZ2V0VGV4dCgpLFxuICAgICAgICAgICAgICAgIGNvbWJlZCA9IGNvbWIucHJvY2Vzc1N0cmluZyh0ZXh0LCB7c3ludGF4OiBzeW50YXh9KTtcblxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKS5zZXRUZXh0KGNvbWJlZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tYlRleHQgKGNvbWIsIHRleHQpIHtcbiAgICAgICAgdmFyIGNvbWJlZCxcbiAgICAgICAgICAgIHN5bnRheCA9IHRoaXMuX2dldFN5dGF4KCksXG4gICAgICAgICAgICBhY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29tYmVkID0gY29tYi5wcm9jZXNzU3RyaW5nKHRleHQsIHtzeW50YXg6IHN5bnRheH0pO1xuXG4gICAgICAgICAgICBhY3RpdmVQYW5lLnNldFRleHRJbkJ1ZmZlclJhbmdlKGFjdGl2ZVBhbmUuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpLCBjb21iZWQpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9nZXRTeXRheCAoKSB7XG4gICAgICAgIHZhciBzeW50YXggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0R3JhbW1hcigpLm5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBpZiAoWydjc3MnLCAnbGVzcycsICdzYXNzJywgJ3Njc3MnXS5pbmRleE9mKHN5bnRheCkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gc3ludGF4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcigpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9nZXRTZWxlY3RlZFRleHQgKCkge1xuICAgICAgICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFNlbGVjdGVkVGV4dCgpO1xuICAgIH0sXG5cbiAgICBfZ2V0VGV4dCAoKSB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0VGV4dCgpO1xuICAgIH0sXG5cbiAgICBjb21iICgpIHtcbiAgICAgICAgdmFyIGNvbWIsXG4gICAgICAgICAgICBjb25maWcgPSB0aGlzLmdldFNldHRpbmdzQ29uZmlnKCksXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQgPSB0aGlzLl9nZXRTZWxlY3RlZFRleHQoKSxcbiAgICAgICAgICAgIHN5bnRheCA9IHRoaXMuX2dldFN5dGF4KCk7XG5cbiAgICAgICAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGNvbmZpZy5tZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIGlmIChzeW50YXggaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignTm90IHN1cHBvcnRlZCBzeW50YXgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbWIgPSBuZXcgQ29tYihjb25maWcpO1xuXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRUZXh0ICE9PSAnJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tYlRleHQoY29tYiwgc2VsZWN0ZWRUZXh0LCBzeW50YXgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbWJGaWxlKGNvbWIsIHN5bnRheCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuIl19
//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/atom-css-comb/lib/css-comb.js
