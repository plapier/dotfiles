var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libRunner = require('../lib/runner');

var _libRunner2 = _interopRequireDefault(_libRunner);

var _libScriptOptions = require('../lib/script-options');

var _libScriptOptions2 = _interopRequireDefault(_libScriptOptions);

'use babel';

describe('Runner', function () {
  beforeEach(function () {
    _this.command = 'node';
    _this.runOptions = new _libScriptOptions2['default']();
    _this.runOptions.cmd = _this.command;
    _this.runner = new _libRunner2['default'](_this.runOptions);
  });

  afterEach(function () {
    _this.runner.destroy();
  });

  describe('run', function () {
    it('with no input', function () {
      runs(function () {
        _this.output = null;
        _this.runner.onDidWriteToStdout(function (output) {
          _this.output = output;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/outputTest.js'], {});
      });

      waitsFor(function () {
        return _this.output !== null;
      }, 'File should execute', 500);

      runs(function () {
        return expect(_this.output).toEqual({ message: 'hello\n' });
      });
    });

    it('with an input string', function () {
      runs(function () {
        _this.output = null;
        _this.runner.onDidWriteToStdout(function (output) {
          _this.output = output;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/ioTest.js'], {}, 'hello');
      });

      waitsFor(function () {
        return _this.output !== null;
      }, 'File should execute', 500);

      runs(function () {
        return expect(_this.output).toEqual({ message: 'TEST: hello\n' });
      });
    });

    it('exits', function () {
      runs(function () {
        _this.exited = false;
        _this.runner.onDidExit(function () {
          _this.exited = true;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/outputTest.js'], {});
      });

      waitsFor(function () {
        return _this.exited;
      }, 'Should receive exit callback', 500);
    });

    it('notifies about writing to stderr', function () {
      runs(function () {
        _this.failedEvent = null;
        _this.runner.onDidWriteToStderr(function (event) {
          _this.failedEvent = event;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/throw.js'], {});
      });

      waitsFor(function () {
        return _this.failedEvent;
      }, 'Should receive failure callback', 500);

      runs(function () {
        return expect(_this.failedEvent.message).toMatch(/kaboom/);
      });
    });

    it('terminates stdin', function () {
      runs(function () {
        _this.output = null;
        _this.runner.onDidWriteToStdout(function (output) {
          _this.output = output;
        });
        _this.runner.run(_this.command, ['./spec/fixtures/stdinEndTest.js'], {}, 'unused input');
      });

      waitsFor(function () {
        return _this.output !== null;
      }, 'File should execute', 500);

      runs(function () {
        return expect(_this.output).toEqual({ message: 'stdin terminated\n' });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvcnVubmVyLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt5QkFFbUIsZUFBZTs7OztnQ0FDUix1QkFBdUI7Ozs7QUFIakQsV0FBVyxDQUFDOztBQUtaLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBTTtBQUN2QixZQUFVLENBQUMsWUFBTTtBQUNmLFVBQUssT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN0QixVQUFLLFVBQVUsR0FBRyxtQ0FBbUIsQ0FBQztBQUN0QyxVQUFLLFVBQVUsQ0FBQyxHQUFHLEdBQUcsTUFBSyxPQUFPLENBQUM7QUFDbkMsVUFBSyxNQUFNLEdBQUcsMkJBQVcsTUFBSyxVQUFVLENBQUMsQ0FBQztHQUMzQyxDQUFDLENBQUM7O0FBRUgsV0FBUyxDQUFDLFlBQU07QUFDZCxVQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUN2QixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLEtBQUssRUFBRSxZQUFNO0FBQ3BCLE1BQUUsQ0FBQyxlQUFlLEVBQUUsWUFBTTtBQUN4QixVQUFJLENBQUMsWUFBTTtBQUNULGNBQUssTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixjQUFLLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUN6QyxnQkFBSyxNQUFNLEdBQUcsTUFBTSxDQUFDO1NBQ3RCLENBQUMsQ0FBQztBQUNILGNBQUssTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFLLE9BQU8sRUFBRSxDQUFDLCtCQUErQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FDdEUsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQztlQUFNLE1BQUssTUFBTSxLQUFLLElBQUk7T0FBQSxFQUFFLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUVqRSxVQUFJLENBQUM7ZUFBTSxNQUFNLENBQUMsTUFBSyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMs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b0JBQW9CLEVBQUUsQ0FBQztPQUFBLENBQUMsQ0FBQztLQUM1RSxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9ydW5uZXItc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgUnVubmVyIGZyb20gJy4uL2xpYi9ydW5uZXInO1xuaW1wb3J0IFNjcmlwdE9wdGlvbnMgZnJvbSAnLi4vbGliL3NjcmlwdC1vcHRpb25zJztcblxuZGVzY3JpYmUoJ1J1bm5lcicsICgpID0+IHtcbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdGhpcy5jb21tYW5kID0gJ25vZGUnO1xuICAgIHRoaXMucnVuT3B0aW9ucyA9IG5ldyBTY3JpcHRPcHRpb25zKCk7XG4gICAgdGhpcy5ydW5PcHRpb25zLmNtZCA9IHRoaXMuY29tbWFuZDtcbiAgICB0aGlzLnJ1bm5lciA9IG5ldyBSdW5uZXIodGhpcy5ydW5PcHRpb25zKTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICB0aGlzLnJ1bm5lci5kZXN0cm95KCk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdydW4nLCAoKSA9PiB7XG4gICAgaXQoJ3dpdGggbm8gaW5wdXQnLCAoKSA9PiB7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgdGhpcy5vdXRwdXQgPSBudWxsO1xuICAgICAgICB0aGlzLnJ1bm5lci5vbkRpZFdyaXRlVG9TdGRvdXQoKG91dHB1dCkgPT4ge1xuICAgICAgICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ydW5uZXIucnVuKHRoaXMuY29tbWFuZCwgWycuL3NwZWMvZml4dHVyZXMvb3V0cHV0VGVzdC5qcyddLCB7fSk7XG4gICAgICB9KTtcblxuICAgICAgd2FpdHNGb3IoKCkgPT4gdGhpcy5vdXRwdXQgIT09IG51bGwsICdGaWxlIHNob3VsZCBleGVjdXRlJywgNTAwKTtcblxuICAgICAgcnVucygoKSA9PiBleHBlY3QodGhpcy5vdXRwdXQpLnRvRXF1YWwoeyBtZXNzYWdlOiAnaGVsbG9cXG4nIH0pKTtcbiAgICB9KTtcblxuICAgIGl0KCd3aXRoIGFuIGlucHV0IHN0cmluZycsICgpID0+IHtcbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICB0aGlzLm91dHB1dCA9IG51bGw7XG4gICAgICAgIHRoaXMucnVubmVyLm9uRGlkV3JpdGVUb1N0ZG91dCgob3V0cHV0KSA9PiB7XG4gICAgICAgICAgdGhpcy5vdXRwdXQgPSBvdXRwdXQ7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJ1bm5lci5ydW4odGhpcy5jb21tYW5kLCBbJy4vc3BlYy9maXh0dXJlcy9pb1Rlc3QuanMnXSwge30sICdoZWxsbycpO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHRoaXMub3V0cHV0ICE9PSBudWxsLCAnRmlsZSBzaG91bGQgZXhlY3V0ZScsIDUwMCk7XG5cbiAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KHRoaXMub3V0cHV0KS50b0VxdWFsKHsgbWVzc2FnZTogJ1RFU1Q6IGhlbGxvXFxuJyB9KSk7XG4gICAgfSk7XG5cbiAgICBpdCgnZXhpdHMnLCAoKSA9PiB7XG4gICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgdGhpcy5leGl0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ydW5uZXIub25EaWRFeGl0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLmV4aXRlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJ1bm5lci5ydW4odGhpcy5jb21tYW5kLCBbJy4vc3BlYy9maXh0dXJlcy9vdXRwdXRUZXN0LmpzJ10sIHt9KTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB0aGlzLmV4aXRlZCwgJ1Nob3VsZCByZWNlaXZlIGV4aXQgY2FsbGJhY2snLCA1MDApO1xuICAgIH0pO1xuXG4gICAgaXQoJ25vdGlmaWVzIGFib3V0IHdyaXRpbmcgdG8gc3RkZXJyJywgKCkgPT4ge1xuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIHRoaXMuZmFpbGVkRXZlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLnJ1bm5lci5vbkRpZFdyaXRlVG9TdGRlcnIoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgdGhpcy5mYWlsZWRFdmVudCA9IGV2ZW50O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5ydW5uZXIucnVuKHRoaXMuY29tbWFuZCwgWycuL3NwZWMvZml4dHVyZXMvdGhyb3cuanMnXSwge30pO1xuICAgICAgfSk7XG5cbiAgICAgIHdhaXRzRm9yKCgpID0+IHRoaXMuZmFpbGVkRXZlbnQsICdTaG91bGQgcmVjZWl2ZSBmYWlsdXJlIGNhbGxiYWNrJywgNTAwKTtcblxuICAgICAgcnVucygoKSA9PiBleHBlY3QodGhpcy5mYWlsZWRFdmVudC5tZXNzYWdlKS50b01hdGNoKC9rYWJvb20vKSk7XG4gICAgfSk7XG5cbiAgICBpdCgndGVybWluYXRlcyBzdGRpbicsICgpID0+IHtcbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICB0aGlzLm91dHB1dCA9IG51bGw7XG4gICAgICAgIHRoaXMucnVubmVyLm9uRGlkV3JpdGVUb1N0ZG91dCgob3V0cHV0KSA9PiB7XG4gICAgICAgICAgdGhpcy5vdXRwdXQgPSBvdXRwdXQ7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJ1bm5lci5ydW4odGhpcy5jb21tYW5kLCBbJy4vc3BlYy9maXh0dXJlcy9zdGRpbkVuZFRlc3QuanMnXSwge30sICd1bnVzZWQgaW5wdXQnKTtcbiAgICAgIH0pO1xuXG4gICAgICB3YWl0c0ZvcigoKSA9PiB0aGlzLm91dHB1dCAhPT0gbnVsbCwgJ0ZpbGUgc2hvdWxkIGV4ZWN1dGUnLCA1MDApO1xuXG4gICAgICBydW5zKCgpID0+IGV4cGVjdCh0aGlzLm91dHB1dCkudG9FcXVhbCh7IG1lc3NhZ2U6ICdzdGRpbiB0ZXJtaW5hdGVkXFxuJyB9KSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=