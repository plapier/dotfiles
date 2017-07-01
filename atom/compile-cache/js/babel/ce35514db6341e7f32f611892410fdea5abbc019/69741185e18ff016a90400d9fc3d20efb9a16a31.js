var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* eslint-disable no-unused-vars, global-require, no-undef */

var _libCodeContext = require('../lib/code-context');

var _libCodeContext2 = _interopRequireDefault(_libCodeContext);

var _libGrammarUtilsOperatingSystem = require('../lib/grammar-utils/operating-system');

var _libGrammarUtilsOperatingSystem2 = _interopRequireDefault(_libGrammarUtilsOperatingSystem);

var _libGrammarsCoffee = require('../lib/grammars.coffee');

var _libGrammarsCoffee2 = _interopRequireDefault(_libGrammarsCoffee);

'use babel';

describe('grammarMap', function () {
  beforeEach(function () {
    _this.codeContext = new _libCodeContext2['default']('test.txt', '/tmp/test.txt', null);
    // TODO: Test using an actual editor or a selection?
    _this.dummyTextSource = {};
    _this.dummyTextSource.getText = function () {
      return '';
    };
  });

  it("has a command and an args function set for each grammar's mode", function () {
    _this.codeContext.textSource = _this.dummyTextSource;
    for (var lang in _libGrammarsCoffee2['default']) {
      var modes = _libGrammarsCoffee2['default'][lang];
      for (var mode in modes) {
        var commandContext = modes[mode];
        expect(commandContext.command).toBeDefined();
        var argList = commandContext.args(_this.codeContext);
        expect(argList).toBeDefined();
      }
    }
  });

  describe('Operating system specific runners', function () {
    beforeEach(function () {
      _this.originalPlatform = _libGrammarUtilsOperatingSystem2['default'].platform;
      _this.reloadGrammar = function () {
        delete require.cache[require.resolve('../lib/grammars.coffee')];
        _this.grammarMap = require('../lib/grammars.coffee');
      };
    });

    afterEach(function () {
      _libGrammarUtilsOperatingSystem2['default'].platform = _this.originalPlatform;
      _this.reloadGrammar();
    });

    describe('C', function () {
      return it('returns the appropriate File Based runner on Mac OS X', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap.C;
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('bash');
        expect(args[0]).toEqual('-c');
        expect(args[1]).toMatch(/^xcrun clang/);
      });
    });

    describe('C++', function () {
      return it('returns the appropriate File Based runner on Mac OS X', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['C++'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('bash');
        expect(args[0]).toEqual('-c');
        expect(args[1]).toMatch(/^xcrun clang\+\+/);
      });
    });

    describe('F#', function () {
      it('returns "fsi" as command for File Based runner on Windows', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'win32';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['F#'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('fsi');
        expect(args[0]).toEqual('--exec');
        expect(args[1]).toEqual(_this.codeContext.filepath);
      });

      it('returns "fsharpi" as command for File Based runner when platform is not Windows', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['F#'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('fsharpi');
        expect(args[0]).toEqual('--exec');
        expect(args[1]).toEqual(_this.codeContext.filepath);
      });
    });

    describe('Objective-C', function () {
      return it('returns the appropriate File Based runner on Mac OS X', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['Objective-C'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('bash');
        expect(args[0]).toEqual('-c');
        expect(args[1]).toMatch(/^xcrun clang/);
      });
    });

    describe('Objective-C++', function () {
      return it('returns the appropriate File Based runner on Mac OS X', function () {
        _libGrammarUtilsOperatingSystem2['default'].platform = function () {
          return 'darwin';
        };
        _this.reloadGrammar();

        var grammar = _this.grammarMap['Objective-C++'];
        var fileBasedRunner = grammar['File Based'];
        var args = fileBasedRunner.args(_this.codeContext);
        expect(fileBasedRunner.command).toEqual('bash');
        expect(args[0]).toEqual('-c');
        expect(args[1]).toMatch(/^xcrun clang\+\+/);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvZ3JhbW1hcnMtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OEJBR3dCLHFCQUFxQjs7Ozs4Q0FDakIsdUNBQXVDOzs7O2lDQUM1Qyx3QkFBd0I7Ozs7QUFML0MsV0FBVyxDQUFDOztBQU9aLFFBQVEsQ0FBQyxZQUFZLEVBQUUsWUFBTTtBQUMzQixZQUFVLENBQUMsWUFBTTtBQUNmLFVBQUssV0FBVyxHQUFHLGdDQUFnQixVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUV0RSxVQUFLLGVBQWUsR0FBRyxFQUFFLENBQUM7QUFDMUIsVUFBSyxlQUFlLENBQUMsT0FBTyxHQUFHO2FBQU0sRUFBRTtLQUFBLENBQUM7R0FDekMsQ0FBQyxDQUFDOztBQUVILElBQUUsQ0FBQyxnRUFBZ0UsRUFBRSxZQUFNO0FBQ3pFLFVBQUssV0FBVyxDQUFDLFVBQVUsR0FBRyxNQUFLLGVBQWUsQ0FBQztBQUNuRCxTQUFLLElBQU0sSUFBSSxvQ0FBZ0I7QUFDN0IsVUFBTSxLQUFLLEdBQUcsK0JBQVcsSUFBSSxDQUFDLENBQUM7QUFDL0IsV0FBSyxJQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7QUFDeEIsWUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLGNBQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDN0MsWUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQ3RELGNBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUMvQjtLQUNGO0dBQ0YsQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQyxtQ0FBbUMsRUFBRSxZQUFNO0FBQ2xELGNBQVUsQ0FBQyxZQUFNO0FBQ2YsWUFBSyxnQkFBZ0IsR0FBRyw0Q0FBZ0IsUUFB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QU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRCxjQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlCLGNBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7T0FDekMsQ0FBQztLQUFBLENBQ0gsQ0FBQzs7QUFFRixZQUFRLENBQUMsZUFBZSxFQUFFO2FBQ3hCLEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxZQUFNO0FBQ2hFLG9EQUFnQixRQUFRLEdBQUc7aUJBQU0sUUFBUTtTQUFBLENBQUM7QUFDMUMsY0FBSyxhQUFhLEVBQUUsQ0FBQzs7QUFFckIsWUFBTSxPQUFPLEdBQUcsTUFBSyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDakQsWUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlDLFlBQU0sSUFBSSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBSyxXQUFXLENBQUMsQ0FBQztBQUNwRCxjQUFNLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRCxjQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlCLGNBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztPQUM3QyxDQUFDO0tBQUEsQ0FDSCxDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvZ3JhbW1hcnMtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycywgZ2xvYmFsLXJlcXVpcmUsIG5vLXVuZGVmICovXG5pbXBvcnQgQ29kZUNvbnRleHQgZnJvbSAnLi4vbGliL2NvZGUtY29udGV4dCc7XG5pbXBvcnQgT3BlcmF0aW5nU3lzdGVtIGZyb20gJy4uL2xpYi9ncmFtbWFyLXV0aWxzL29wZXJhdGluZy1zeXN0ZW0nO1xuaW1wb3J0IGdyYW1tYXJNYXAgZnJvbSAnLi4vbGliL2dyYW1tYXJzLmNvZmZlZSc7XG5cbmRlc2NyaWJlKCdncmFtbWFyTWFwJywgKCkgPT4ge1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICB0aGlzLmNvZGVDb250ZXh0ID0gbmV3IENvZGVDb250ZXh0KCd0ZXN0LnR4dCcsICcvdG1wL3Rlc3QudHh0JywgbnVsbCk7XG4gICAgLy8gVE9ETzogVGVzdCB1c2luZyBhbiBhY3R1YWwgZWRpdG9yIG9yIGEgc2VsZWN0aW9uP1xuICAgIHRoaXMuZHVtbXlUZXh0U291cmNlID0ge307XG4gICAgdGhpcy5kdW1teVRleHRTb3VyY2UuZ2V0VGV4dCA9ICgpID0+ICcnO1xuICB9KTtcblxuICBpdChcImhhcyBhIGNvbW1hbmQgYW5kIGFuIGFyZ3MgZnVuY3Rpb24gc2V0IGZvciBlYWNoIGdyYW1tYXIncyBtb2RlXCIsICgpID0+IHtcbiAgICB0aGlzLmNvZGVDb250ZXh0LnRleHRTb3VyY2UgPSB0aGlzLmR1bW15VGV4dFNvdXJjZTtcbiAgICBmb3IgKGNvbnN0IGxhbmcgaW4gZ3JhbW1hck1hcCkge1xuICAgICAgY29uc3QgbW9kZXMgPSBncmFtbWFyTWFwW2xhbmddO1xuICAgICAgZm9yIChjb25zdCBtb2RlIGluIG1vZGVzKSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmRDb250ZXh0ID0gbW9kZXNbbW9kZV07XG4gICAgICAgIGV4cGVjdChjb21tYW5kQ29udGV4dC5jb21tYW5kKS50b0JlRGVmaW5lZCgpO1xuICAgICAgICBjb25zdCBhcmdMaXN0ID0gY29tbWFuZENvbnRleHQuYXJncyh0aGlzLmNvZGVDb250ZXh0KTtcbiAgICAgICAgZXhwZWN0KGFyZ0xpc3QpLnRvQmVEZWZpbmVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBkZXNjcmliZSgnT3BlcmF0aW5nIHN5c3RlbSBzcGVjaWZpYyBydW5uZXJzJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgdGhpcy5vcmlnaW5hbFBsYXRmb3JtID0gT3BlcmF0aW5nU3lzdGVtLnBsYXRmb3JtO1xuICAgICAgdGhpcy5yZWxvYWRHcmFtbWFyID0gKCkgPT4ge1xuICAgICAgICBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJy4uL2xpYi9ncmFtbWFycy5jb2ZmZWUnKV07XG4gICAgICAgIHRoaXMuZ3JhbW1hck1hcCA9IHJlcXVpcmUoJy4uL2xpYi9ncmFtbWFycy5jb2ZmZWUnKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgT3BlcmF0aW5nU3lzdGVtLnBsYXRmb3JtID0gdGhpcy5vcmlnaW5hbFBsYXRmb3JtO1xuICAgICAgdGhpcy5yZWxvYWRHcmFtbWFyKCk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnQycsICgpID0+XG4gICAgICBpdCgncmV0dXJucyB0aGUgYXBwcm9wcmlhdGUgRmlsZSBCYXNlZCBydW5uZXIgb24gTWFjIE9TIFgnLCAoKSA9PiB7XG4gICAgICAgIE9wZXJhdGluZ1N5c3RlbS5wbGF0Zm9ybSA9ICgpID0+ICdkYXJ3aW4nO1xuICAgICAgICB0aGlzLnJlbG9hZEdyYW1tYXIoKTtcblxuICAgICAgICBjb25zdCBncmFtbWFyID0gdGhpcy5ncmFtbWFyTWFwLkM7XG4gICAgICAgIGNvbnN0IGZpbGVCYXNlZFJ1bm5lciA9IGdyYW1tYXJbJ0ZpbGUgQmFzZWQnXTtcbiAgICAgICAgY29uc3QgYXJncyA9IGZpbGVCYXNlZFJ1bm5lci5hcmdzKHRoaXMuY29kZUNvbnRleHQpO1xuICAgICAgICBleHBlY3QoZmlsZUJhc2VkUnVubmVyLmNvbW1hbmQpLnRvRXF1YWwoJ2Jhc2gnKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMF0pLnRvRXF1YWwoJy1jJyk7XG4gICAgICAgIGV4cGVjdChhcmdzWzFdKS50b01hdGNoKC9eeGNydW4gY2xhbmcvKTtcbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICBkZXNjcmliZSgnQysrJywgKCkgPT5cbiAgICAgIGl0KCdyZXR1cm5zIHRoZSBhcHByb3ByaWF0ZSBGaWxlIEJhc2VkIHJ1bm5lciBvbiBNYWMgT1MgWCcsICgpID0+IHtcbiAgICAgICAgT3BlcmF0aW5nU3lzdGVtLnBsYXRmb3JtID0gKCkgPT4gJ2Rhcndpbic7XG4gICAgICAgIHRoaXMucmVsb2FkR3JhbW1hcigpO1xuXG4gICAgICAgIGNvbnN0IGdyYW1tYXIgPSB0aGlzLmdyYW1tYXJNYXBbJ0MrKyddO1xuICAgICAgICBjb25zdCBmaWxlQmFzZWRSdW5uZXIgPSBncmFtbWFyWydGaWxlIEJhc2VkJ107XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBmaWxlQmFzZWRSdW5uZXIuYXJncyh0aGlzLmNvZGVDb250ZXh0KTtcbiAgICAgICAgZXhwZWN0KGZpbGVCYXNlZFJ1bm5lci5jb21tYW5kKS50b0VxdWFsKCdiYXNoJyk7XG4gICAgICAgIGV4cGVjdChhcmdzWzBdKS50b0VxdWFsKCctYycpO1xuICAgICAgICBleHBlY3QoYXJnc1sxXSkudG9NYXRjaCgvXnhjcnVuIGNsYW5nXFwrXFwrLyk7XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgZGVzY3JpYmUoJ0YjJywgKCkgPT4ge1xuICAgICAgaXQoJ3JldHVybnMgXCJmc2lcIiBhcyBjb21tYW5kIGZvciBGaWxlIEJhc2VkIHJ1bm5lciBvbiBXaW5kb3dzJywgKCkgPT4ge1xuICAgICAgICBPcGVyYXRpbmdTeXN0ZW0ucGxhdGZvcm0gPSAoKSA9PiAnd2luMzInO1xuICAgICAgICB0aGlzLnJlbG9hZEdyYW1tYXIoKTtcblxuICAgICAgICBjb25zdCBncmFtbWFyID0gdGhpcy5ncmFtbWFyTWFwWydGIyddO1xuICAgICAgICBjb25zdCBmaWxlQmFzZWRSdW5uZXIgPSBncmFtbWFyWydGaWxlIEJhc2VkJ107XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBmaWxlQmFzZWRSdW5uZXIuYXJncyh0aGlzLmNvZGVDb250ZXh0KTtcbiAgICAgICAgZXhwZWN0KGZpbGVCYXNlZFJ1bm5lci5jb21tYW5kKS50b0VxdWFsKCdmc2knKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMF0pLnRvRXF1YWwoJy0tZXhlYycpO1xuICAgICAgICBleHBlY3QoYXJnc1sxXSkudG9FcXVhbCh0aGlzLmNvZGVDb250ZXh0LmZpbGVwYXRoKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgncmV0dXJucyBcImZzaGFycGlcIiBhcyBjb21tYW5kIGZvciBGaWxlIEJhc2VkIHJ1bm5lciB3aGVuIHBsYXRmb3JtIGlzIG5vdCBXaW5kb3dzJywgKCkgPT4ge1xuICAgICAgICBPcGVyYXRpbmdTeXN0ZW0ucGxhdGZvcm0gPSAoKSA9PiAnZGFyd2luJztcbiAgICAgICAgdGhpcy5yZWxvYWRHcmFtbWFyKCk7XG5cbiAgICAgICAgY29uc3QgZ3JhbW1hciA9IHRoaXMuZ3JhbW1hck1hcFsnRiMnXTtcbiAgICAgICAgY29uc3QgZmlsZUJhc2VkUnVubmVyID0gZ3JhbW1hclsnRmlsZSBCYXNlZCddO1xuICAgICAgICBjb25zdCBhcmdzID0gZmlsZUJhc2VkUnVubmVyLmFyZ3ModGhpcy5jb2RlQ29udGV4dCk7XG4gICAgICAgIGV4cGVjdChmaWxlQmFzZWRSdW5uZXIuY29tbWFuZCkudG9FcXVhbCgnZnNoYXJwaScpO1xuICAgICAgICBleHBlY3QoYXJnc1swXSkudG9FcXVhbCgnLS1leGVjJyk7XG4gICAgICAgIGV4cGVjdChhcmdzWzFdKS50b0VxdWFsKHRoaXMuY29kZUNvbnRleHQuZmlsZXBhdGgpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnT2JqZWN0aXZlLUMnLCAoKSA9PlxuICAgICAgaXQoJ3JldHVybnMgdGhlIGFwcHJvcHJpYXRlIEZpbGUgQmFzZWQgcnVubmVyIG9uIE1hYyBPUyBYJywgKCkgPT4ge1xuICAgICAgICBPcGVyYXRpbmdTeXN0ZW0ucGxhdGZvcm0gPSAoKSA9PiAnZGFyd2luJztcbiAgICAgICAgdGhpcy5yZWxvYWRHcmFtbWFyKCk7XG5cbiAgICAgICAgY29uc3QgZ3JhbW1hciA9IHRoaXMuZ3JhbW1hck1hcFsnT2JqZWN0aXZlLUMnXTtcbiAgICAgICAgY29uc3QgZmlsZUJhc2VkUnVubmVyID0gZ3JhbW1hclsnRmlsZSBCYXNlZCddO1xuICAgICAgICBjb25zdCBhcmdzID0gZmlsZUJhc2VkUnVubmVyLmFyZ3ModGhpcy5jb2RlQ29udGV4dCk7XG4gICAgICAgIGV4cGVjdChmaWxlQmFzZWRSdW5uZXIuY29tbWFuZCkudG9FcXVhbCgnYmFzaCcpO1xuICAgICAgICBleHBlY3QoYXJnc1swXSkudG9FcXVhbCgnLWMnKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMV0pLnRvTWF0Y2goL154Y3J1biBjbGFuZy8pO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIGRlc2NyaWJlKCdPYmplY3RpdmUtQysrJywgKCkgPT5cbiAgICAgIGl0KCdyZXR1cm5zIHRoZSBhcHByb3ByaWF0ZSBGaWxlIEJhc2VkIHJ1bm5lciBvbiBNYWMgT1MgWCcsICgpID0+IHtcbiAgICAgICAgT3BlcmF0aW5nU3lzdGVtLnBsYXRmb3JtID0gKCkgPT4gJ2Rhcndpbic7XG4gICAgICAgIHRoaXMucmVsb2FkR3JhbW1hcigpO1xuXG4gICAgICAgIGNvbnN0IGdyYW1tYXIgPSB0aGlzLmdyYW1tYXJNYXBbJ09iamVjdGl2ZS1DKysnXTtcbiAgICAgICAgY29uc3QgZmlsZUJhc2VkUnVubmVyID0gZ3JhbW1hclsnRmlsZSBCYXNlZCddO1xuICAgICAgICBjb25zdCBhcmdzID0gZmlsZUJhc2VkUnVubmVyLmFyZ3ModGhpcy5jb2RlQ29udGV4dCk7XG4gICAgICAgIGV4cGVjdChmaWxlQmFzZWRSdW5uZXIuY29tbWFuZCkudG9FcXVhbCgnYmFzaCcpO1xuICAgICAgICBleHBlY3QoYXJnc1swXSkudG9FcXVhbCgnLWMnKTtcbiAgICAgICAgZXhwZWN0KGFyZ3NbMV0pLnRvTWF0Y2goL154Y3J1biBjbGFuZ1xcK1xcKy8pO1xuICAgICAgfSksXG4gICAgKTtcbiAgfSk7XG59KTtcbiJdfQ==