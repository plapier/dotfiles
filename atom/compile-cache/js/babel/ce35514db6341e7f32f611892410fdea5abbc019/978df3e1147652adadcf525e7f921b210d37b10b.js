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

    subscriptions: new _atom.CompositeDisposable(),

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

    activate: function activate() {
        var _this = this;

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'css-comb:comb': function cssCombComb() {
                return _this.comb();
            }
        }));
    },

    destroy: function destroy() {
        this.subscriptions.dispose();
    },

    combFile: function combFile(comb, syntax) {
        var text = this._getText();

        comb.processString(text, { syntax: syntax }).then(function (combed) {
            return atom.workspace.getActivePaneItem().setText(combed);
        })['catch'](function (error) {
            return atom.notifications.addError(error.message);
        });
    },

    combText: function combText(comb, text) {
        var combed,
            syntax = this._getSytax(),
            activePane = atom.workspace.getActivePaneItem();

        comb.processString(text, { syntax: syntax }).then(function (result) {
            return activePane.setTextInBufferRange(activePane.getSelectedBufferRange(), result);
        })['catch'](function (error) {
            return atom.notifications.addError(error.message);
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9waGlsLy5hdG9tL3BhY2thZ2VzL2F0b20tY3NzLWNvbWIvbGliL2Nzcy1jb21iLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFFa0MsTUFBTTs7dUJBQ3ZCLFNBQVM7Ozs7b0JBQ1QsTUFBTTs7OztBQUp2QixXQUFXLENBQUM7O3FCQU1HO0FBQ1gsVUFBTSxFQUFFO0FBQ0osc0JBQWMsRUFBRTtBQUNaLGlCQUFLLEVBQUUsb0JBQW9CO0FBQzNCLHVCQUFXLEVBQUUsOElBQThJO0FBQzNKLHVCQUFTLEVBQUU7QUFDWCxnQkFBSSxFQUFFLFFBQVE7U0FDakI7QUFDRCxxQkFBYSxFQUFFO0FBQ1gsaUJBQUssRUFBRSxtQkFBbUI7QUFDMUIsdUJBQVcsRUFBRSw4SUFBOEk7QUFDM0osdUJBQVMsRUFBRTtBQUNYLGdCQUFJLEVBQUUsUUFBUTtTQUNqQjtBQUNELHdCQUFnQixFQUFFO0FBQ2QsaUJBQUssRUFBRSxvQkFBb0I7QUFDM0IsdUJBQVcsRUFBRSwyRUFBMkU7QUFDeEYsZ0JBQUksRUFBRSxRQUFRO0FBQ2QsdUJBQVMsUUFBUTtBQUNqQixvQkFBTSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDO1NBQ3JDO0tBQ0o7O0FBRUQsaUJBQWEsRUFBRSwrQkFBeUI7O0FBRXhDLHFCQUFpQixFQUFBLDZCQUFHO0FBQ2hCLFlBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDO1lBQ2hFLEtBQUs7WUFDTCxlQUFlO1lBQ2YsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDO1lBQ2hFLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUM7WUFDOUQsZ0JBQWdCLEdBQUcsSUFBSSxD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QUMvQjtTQUNKO0tBQ0o7Q0FDSiIsImZpbGUiOiIvVXNlcnMvcGhpbC8uYXRvbS9wYWNrYWdlcy9hdG9tLWNzcy1jb21iL2xpYi9jc3MtY29tYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENvbWIgZnJvbSAnY3NzY29tYic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNvbmZpZzoge1xuICAgICAgICBwcm9qZWN0Q29uZmlnczoge1xuICAgICAgICAgICAgdGl0bGU6ICdVc2UgcHJvamVjdCBjb25maWcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdSZWxhdGl2ZSB0byB0aGUgcHJvamVjdCBkaXJlY3RvcnkuIEV4YW1wbGU6IGAuY3NzY29tYi5qc29uYCBvciBgY29uZmlncy8uY3NzY29tYi5qc29uYC4gTGVhdmUgYmxhbmsgaWYgeW91IHdhbnQgdG8gdXNlIHRoZSBmb2xsb3dpbmcgc2V0dGluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH0sXG4gICAgICAgIGNvbW1vbkNvbmZpZ3M6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnVXNlIGNvbW1vbiBjb25maWcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQdXQgaGVyZSBhIGZ1bGwgcGF0aCB0byB5b3VyIGNvbmZpZy4gRXhhbXBsZTogYC9Vc2Vycy9qY2hvdXNlL3Byb3BqZWN0cy8uY3NzY29tYi5qc29uYC4gTGVhdmUgYmxhbmsgaWYgeW91IHdhbnQgdG8gdXNlIHRoZSBmb2xsb3dpbmcgc2V0dGluZycsXG4gICAgICAgICAgICBkZWZhdWx0OiAnJyxcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH0sXG4gICAgICAgIHJlYWR5TWFkZUNvbmZpZ3M6IHtcbiAgICAgICAgICAgIHRpdGxlOiAnUmVhZHkgbWFkZSBjb25maWdzJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVXNlZCB3aGVuIHlvdSBkbyBub3Qgc3BlY2lmeSBhIHByb2plY3Qgb3IgY29tbW9uIGZpbGUuIFRoZSBkZXRhaWxzIGJlbG93LicsXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgIGRlZmF1bHQ6ICd5YW5kZXgnLFxuICAgICAgICAgICAgZW51bTogWyd5YW5kZXgnLCAnY3NzY29tYicsICd6ZW4nXVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHN1YnNjcmlwdGlvbnM6IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCksXG5cbiAgICBnZXRTZXR0aW5nc0NvbmZpZygpIHtcbiAgICAgICAgdmFyIGNzc0NvbWJQYWNrYWdlID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdhdG9tLWNzcy1jb21iJyksXG4gICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgIG9wdGlvbnNGaWxlUGF0aCxcbiAgICAgICAgICAgIHByb2plY3RDb25maWdzID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNzcy1jb21iLnByb2plY3RDb25maWdzJyksXG4gICAgICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLFxuICAgICAgICAgICAgY29tbW9uQ29uZmlncyA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jc3MtY29tYi5jb21tb25Db25maWdzJyksXG4gICAgICAgICAgICByZWFkeU1hZGVDb25maWdzID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNzcy1jb21iLnJlYWR5TWFkZUNvbmZpZ3MnKTtcblxuICAgICAgICBpZiAocHJvamVjdENvbmZpZ3MpIHtcbiAgICAgICAgICAgIG9wdGlvbnNGaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgcHJvamVjdENvbmZpZ3MpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWlyZShvcHRpb25zRmlsZVBhdGgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY29tbW9uQ29uZmlncykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWlyZShjb21tb25Db25maWdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHJlYWR5TWFkZUNvbmZpZ3MgfHwgJ3lhbmRleCc7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgYWN0aXZhdGUoKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAgICdjc3MtY29tYjpjb21iJzogKCkgPT4gdGhpcy5jb21iKClcbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH0sXG5cbiAgICBjb21iRmlsZShjb21iLCBzeW50YXgpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuX2dldFRleHQoKTtcblxuICAgICAgICBjb21iLnByb2Nlc3NTdHJpbmcodGV4dCwge3N5bnRheDogc3ludGF4fSlcbiAgICAgICAgICAgIC50aGVuKGNvbWJlZCA9PiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpLnNldFRleHQoY29tYmVkKSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xuICAgIH0sXG5cbiAgICBjb21iVGV4dChjb21iLCB0ZXh0KSB7XG4gICAgICAgIHZhciBjb21iZWQsXG4gICAgICAgICAgICBzeW50YXggPSB0aGlzLl9nZXRTeXRheCgpLFxuICAgICAgICAgICAgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG5cbiAgICAgICAgY29tYi5wcm9jZXNzU3RyaW5nKHRleHQsIHtzeW50YXg6IHN5bnRheH0pXG4gICAgICAgICAgICAudGhlbihyZXN1bHQgPT4gYWN0aXZlUGFuZS5zZXRUZXh0SW5CdWZmZXJSYW5nZShhY3RpdmVQYW5lLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSwgcmVzdWx0KSlcbiAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3IubWVzc2FnZSkpO1xuICAgIH0sXG5cbiAgICBfZ2V0U3l0YXgoKSB7XG4gICAgICAgIHZhciBzeW50YXggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0R3JhbW1hcigpLm5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBpZiAoWydjc3MnLCAnbGVzcycsICdzYXNzJywgJ3Njc3MnXS5pbmRleE9mKHN5bnRheCkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gc3ludGF4O1xuICAgICAgICB9IGVsc2UgaWYgKHN5bnRheCA9PT0gJ2h0bWwnKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2Nzcyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEVycm9yKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2dldFNlbGVjdGVkVGV4dCgpIHtcbiAgICAgICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKS5nZXRTZWxlY3RlZFRleHQoKTtcbiAgICB9LFxuXG4gICAgX2dldFRleHQoKSB7XG4gICAgICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0VGV4dCgpO1xuICAgIH0sXG5cbiAgICBjb21iKCkge1xuICAgICAgICB2YXIgY29tYixcbiAgICAgICAgICAgIGNvbmZpZyA9IHRoaXMuZ2V0U2V0dGluZ3NDb25maWcoKSxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dCA9IHRoaXMuX2dldFNlbGVjdGVkVGV4dCgpLFxuICAgICAgICAgICAgc3ludGF4ID0gdGhpcy5fZ2V0U3l0YXgoKTtcblxuICAgICAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoY29uZmlnLm1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHN5bnRheCBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdOb3Qgc3VwcG9ydGVkIHN5bnRheCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tYiA9IG5ldyBDb21iKGNvbmZpZyk7XG5cbiAgICAgICAgICAgIGlmIChzZWxlY3RlZFRleHQgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21iVGV4dChjb21iLCBzZWxlY3RlZFRleHQsIHN5bnRheCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBfbmFtZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKS5nZXRHcmFtbWFyKCkubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoc3ludGF4ID09PSAnY3NzJyAmJiBfbmFtZSA9PT0gJ0hUTUwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignUGxlYXNlIHNlbGVjdCB0aGUgdGV4dCBmb3IgY29tYmluZy4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNvbWJGaWxlKGNvbWIsIHN5bnRheCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuIl19