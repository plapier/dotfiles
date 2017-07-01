var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libCodeContextBuilder = require('../lib/code-context-builder');

var _libCodeContextBuilder2 = _interopRequireDefault(_libCodeContextBuilder);

'use babel';

describe('CodeContextBuilder', function () {
  beforeEach(function () {
    _this.editorMock = {
      getTitle: function getTitle() {},
      getPath: function getPath() {},
      getText: function getText() {},
      getLastSelection: function getLastSelection() {
        return {
          isEmpty: function isEmpty() {
            return false;
          }
        };
      },
      getGrammar: function getGrammar() {
        return { name: 'JavaScript' };
      },
      getLastCursor: function getLastCursor() {},
      save: function save() {}
    };

    spyOn(_this.editorMock, 'getTitle').andReturn('file.js');
    spyOn(_this.editorMock, 'getPath').andReturn('path/to/file.js');
    spyOn(_this.editorMock, 'getText').andReturn('console.log("hello")\n');
    _this.codeContextBuilder = new _libCodeContextBuilder2['default']();
  });

  describe('initCodeContext', function () {
    it('sets correct text source for empty selection', function () {
      var selection = { isEmpty: function isEmpty() {
          return true;
        } };
      spyOn(_this.editorMock, 'getLastSelection').andReturn(selection);
      var codeContext = _this.codeContextBuilder.initCodeContext(_this.editorMock);
      expect(codeContext.textSource).toEqual(_this.editorMock);
      expect(codeContext.filename).toEqual('file.js');
      expect(codeContext.filepath).toEqual('path/to/file.js');
    });

    it('sets correct text source for non-empty selection', function () {
      var selection = { isEmpty: function isEmpty() {
          return false;
        } };
      spyOn(_this.editorMock, 'getLastSelection').andReturn(selection);
      var codeContext = _this.codeContextBuilder.initCodeContext(_this.editorMock);
      expect(codeContext.textSource).toEqual(selection);
      expect(codeContext.selection).toEqual(selection);
    });

    it('sets correct lang', function () {
      var codeContext = _this.codeContextBuilder.initCodeContext(_this.editorMock);
      expect(codeContext.lang).toEqual('JavaScript');
    });
  });

  describe('buildCodeContext', function () {
    return ['Selection Based', 'Line Number Based'].map(function (argType) {
      return it('sets lineNumber with screenRow + 1 when ' + argType, function () {
        var cursor = { getScreenRow: function getScreenRow() {
            return 1;
          } };
        spyOn(_this.editorMock, 'getLastCursor').andReturn(cursor);
        var codeContext = _this.codeContextBuilder.buildCodeContext(_this.editorMock, argType);
        expect(codeContext.argType).toEqual(argType);
        expect(codeContext.lineNumber).toEqual(2);
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvY29kZS1jb250ZXh0LWJ1aWxkZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3FDQUUrQiw2QkFBNkI7Ozs7QUFGNUQsV0FBVyxDQUFDOztBQUlaLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxZQUFNO0FBQ25DLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsVUFBSyxVQUFVLEdBQUc7QUFDaEIsY0FBUSxFQUFBLG9CQUFHLEVBQUU7QUFDYixhQUFPLEVBQUEsbUJBQUcsRUFBRTtBQUNaLGFBQU8sRUFBQSxtQkFBRyxFQUFFO0FBQ1osc0JBQWdCLEVBQUEsNEJBQUc7QUFDakIsZUFBTztBQUNMLGlCQUFPLEVBQUEsbUJBQUc7QUFDUixtQkFBTyxLQUFLLENBQUM7V0FDZDtTQUNGLENBQUM7T0FDSDtBQUNELGdCQUFVLEVBQUEsc0JBQUc7QUFDWCxlQUFPLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDO09BQy9CO0FBQ0QsbUJBQWEsRUFBQSx5QkFBRyxFQUFFO0FBQ2xCLFVBQUksRUFBQSxnQkFBRyxFQUFFO0tBQ1YsQ0FBQzs7QUFFRixTQUFLLENBQUMsTUFBSyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELFNBQUssQ0FBQyxNQUFLLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMvRCxTQUFLLENBQUMsTUFBSyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDdEUsVUFBSyxrQkFBa0IsR0FBRyx3Q0FBd0IsQ0FBQztHQUNwRCxDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLGlCQUFpQixFQUFFLFlBQU07QUFDaEMsTUFBRSxDQUFDLDhDQUE4QyxFQUFFLFlBQU07QUFDdkQsVUFBTSxTQUFTLEdBQ2IsRUFBRSxPQUFPLEVBQUEsbUJBQUc7QUFBRSxpQkFBTyxJQUFJLENBQUM7U0FBRSxFQUFFLENBQUM7QUFDakMsV0FBSyxDQUFDLE1BQUssVUFBVSxFQUFFLGtCQUFrQixDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2hFLFVBQU0sV0FBVyxHQUFHLE1BQUssa0JBQWtCLENBQUMsZUFBZSxDQUFDLE1BQUssVUFBVSxDQUFDLENBQUM7QUFDN0UsWUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBSyxVQUFVLENBQUMsQ0FBQztBQUN4RCxZQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoRCxZQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3pELENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsa0RBQWtELEVBQUUsWUFBTTtBQUMzRCxVQUFNLFNBQVMsR0FDYixFQUFFLE9BQU8sRUFBQSxtQkFBRztBQUFFLGlCQUFPLEtBQUssQ0FBQztTQUFFLEVBQUUsQ0FBQztBQUNsQyxXQUFLLENBQUMsTUFBSyxVQUFVLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEUsVUFBTSxXQUFXLEdBQUcsTUFBSyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsTUFBSyxVQUFVLENBQUMsQ0FBQztBQUM3RSxZQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsRCxZQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNsRCxDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLG1CQUFtQixFQUFFLFlBQU07QUFDNUIsVUFBTSxXQUFXLEdBQUcsTUFBSyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsTUFBSyxVQUFVLENBQUMsQ0FBQztBQUM3RSxZQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNoRCxDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLGtCQUFrQixFQUFFO1dBQzNCLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPO2FBQ2xELEVBQUUsOENBQTRDLE9BQU8sRUFBSSxZQUFNO0FBQzdELFlBQU0sTUFBTSxHQUNWLEVBQUUsWUFBWSxFQUFBLHdCQUFHO0FBQUUsbUJBQU8sQ0FBQyxDQUFDO1dBQUUsRUFBRSxDQUFDO0FBQ25DLGFBQUssQ0FBQyxNQUFLLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUQsWUFBTSxXQUFXLEdBQUcsTUFBSyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFLLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RixjQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QyxjQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMzQyxDQUFDO0tBQUEsQ0FDSDtHQUFBLENBQ0YsQ0FBQztDQUNILENBQUMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9zcGVjL2NvZGUtY29udGV4dC1idWlsZGVyLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IENvZGVDb250ZXh0QnVpbGRlciBmcm9tICcuLi9saWIvY29kZS1jb250ZXh0LWJ1aWxkZXInO1xuXG5kZXNjcmliZSgnQ29kZUNvbnRleHRCdWlsZGVyJywgKCkgPT4ge1xuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICB0aGlzLmVkaXRvck1vY2sgPSB7XG4gICAgICBnZXRUaXRsZSgpIHt9LFxuICAgICAgZ2V0UGF0aCgpIHt9LFxuICAgICAgZ2V0VGV4dCgpIHt9LFxuICAgICAgZ2V0TGFzdFNlbGVjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpc0VtcHR5KCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgZ2V0R3JhbW1hcigpIHtcbiAgICAgICAgcmV0dXJuIHsgbmFtZTogJ0phdmFTY3JpcHQnIH07XG4gICAgICB9LFxuICAgICAgZ2V0TGFzdEN1cnNvcigpIHt9LFxuICAgICAgc2F2ZSgpIHt9LFxuICAgIH07XG5cbiAgICBzcHlPbih0aGlzLmVkaXRvck1vY2ssICdnZXRUaXRsZScpLmFuZFJldHVybignZmlsZS5qcycpO1xuICAgIHNweU9uKHRoaXMuZWRpdG9yTW9jaywgJ2dldFBhdGgnKS5hbmRSZXR1cm4oJ3BhdGgvdG8vZmlsZS5qcycpO1xuICAgIHNweU9uKHRoaXMuZWRpdG9yTW9jaywgJ2dldFRleHQnKS5hbmRSZXR1cm4oJ2NvbnNvbGUubG9nKFwiaGVsbG9cIilcXG4nKTtcbiAgICB0aGlzLmNvZGVDb250ZXh0QnVpbGRlciA9IG5ldyBDb2RlQ29udGV4dEJ1aWxkZXIoKTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2luaXRDb2RlQ29udGV4dCcsICgpID0+IHtcbiAgICBpdCgnc2V0cyBjb3JyZWN0IHRleHQgc291cmNlIGZvciBlbXB0eSBzZWxlY3Rpb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3Rpb24gPVxuICAgICAgICB7IGlzRW1wdHkoKSB7IHJldHVybiB0cnVlOyB9IH07XG4gICAgICBzcHlPbih0aGlzLmVkaXRvck1vY2ssICdnZXRMYXN0U2VsZWN0aW9uJykuYW5kUmV0dXJuKHNlbGVjdGlvbik7XG4gICAgICBjb25zdCBjb2RlQ29udGV4dCA9IHRoaXMuY29kZUNvbnRleHRCdWlsZGVyLmluaXRDb2RlQ29udGV4dCh0aGlzLmVkaXRvck1vY2spO1xuICAgICAgZXhwZWN0KGNvZGVDb250ZXh0LnRleHRTb3VyY2UpLnRvRXF1YWwodGhpcy5lZGl0b3JNb2NrKTtcbiAgICAgIGV4cGVjdChjb2RlQ29udGV4dC5maWxlbmFtZSkudG9FcXVhbCgnZmlsZS5qcycpO1xuICAgICAgZXhwZWN0KGNvZGVDb250ZXh0LmZpbGVwYXRoKS50b0VxdWFsKCdwYXRoL3RvL2ZpbGUuanMnKTtcbiAgICB9KTtcblxuICAgIGl0KCdzZXRzIGNvcnJlY3QgdGV4dCBzb3VyY2UgZm9yIG5vbi1lbXB0eSBzZWxlY3Rpb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3Rpb24gPVxuICAgICAgICB7IGlzRW1wdHkoKSB7IHJldHVybiBmYWxzZTsgfSB9O1xuICAgICAgc3B5T24odGhpcy5lZGl0b3JNb2NrLCAnZ2V0TGFzdFNlbGVjdGlvbicpLmFuZFJldHVybihzZWxlY3Rpb24pO1xuICAgICAgY29uc3QgY29kZUNvbnRleHQgPSB0aGlzLmNvZGVDb250ZXh0QnVpbGRlci5pbml0Q29kZUNvbnRleHQodGhpcy5lZGl0b3JNb2NrKTtcbiAgICAgIGV4cGVjdChjb2RlQ29udGV4dC50ZXh0U291cmNlKS50b0VxdWFsKHNlbGVjdGlvbik7XG4gICAgICBleHBlY3QoY29kZUNvbnRleHQuc2VsZWN0aW9uKS50b0VxdWFsKHNlbGVjdGlvbik7XG4gICAgfSk7XG5cbiAgICBpdCgnc2V0cyBjb3JyZWN0IGxhbmcnLCAoKSA9PiB7XG4gICAgICBjb25zdCBjb2RlQ29udGV4dCA9IHRoaXMuY29kZUNvbnRleHRCdWlsZGVyLmluaXRDb2RlQ29udGV4dCh0aGlzLmVkaXRvck1vY2spO1xuICAgICAgZXhwZWN0KGNvZGVDb250ZXh0LmxhbmcpLnRvRXF1YWwoJ0phdmFTY3JpcHQnKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2J1aWxkQ29kZUNvbnRleHQnLCAoKSA9PlxuICAgIFsnU2VsZWN0aW9uIEJhc2VkJywgJ0xpbmUgTnVtYmVyIEJhc2VkJ10ubWFwKGFyZ1R5cGUgPT5cbiAgICAgIGl0KGBzZXRzIGxpbmVOdW1iZXIgd2l0aCBzY3JlZW5Sb3cgKyAxIHdoZW4gJHthcmdUeXBlfWAsICgpID0+IHtcbiAgICAgICAgY29uc3QgY3Vyc29yID1cbiAgICAgICAgICB7IGdldFNjcmVlblJvdygpIHsgcmV0dXJuIDE7IH0gfTtcbiAgICAgICAgc3B5T24odGhpcy5lZGl0b3JNb2NrLCAnZ2V0TGFzdEN1cnNvcicpLmFuZFJldHVybihjdXJzb3IpO1xuICAgICAgICBjb25zdCBjb2RlQ29udGV4dCA9IHRoaXMuY29kZUNvbnRleHRCdWlsZGVyLmJ1aWxkQ29kZUNvbnRleHQodGhpcy5lZGl0b3JNb2NrLCBhcmdUeXBlKTtcbiAgICAgICAgZXhwZWN0KGNvZGVDb250ZXh0LmFyZ1R5cGUpLnRvRXF1YWwoYXJnVHlwZSk7XG4gICAgICAgIGV4cGVjdChjb2RlQ29udGV4dC5saW5lTnVtYmVyKS50b0VxdWFsKDIpO1xuICAgICAgfSksXG4gICAgKSxcbiAgKTtcbn0pO1xuIl19