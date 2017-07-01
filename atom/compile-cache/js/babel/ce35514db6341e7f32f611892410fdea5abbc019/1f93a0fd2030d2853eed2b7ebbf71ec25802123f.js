function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libLinkPaths = require('../lib/link-paths');

var _libLinkPaths2 = _interopRequireDefault(_libLinkPaths);

'use babel';

describe('linkPaths', function () {
  it('detects file paths with line numbers', function () {
    var result = (0, _libLinkPaths2['default'])('foo() b/c.js:44:55');
    expect(result).toContain('foo() <a');
    expect(result).toContain('class="-linked-path"');
    expect(result).toContain('data-path="b/c.js"');
    expect(result).toContain('data-line="44"');
    expect(result).toContain('data-column="55"');
    expect(result).toContain('b/c.js:44:55');
  });

  it('detects file paths with Windows style drive prefix', function () {
    var result = (0, _libLinkPaths2['default'])('foo() C:/b/c.js:44:55');
    expect(result).toContain('data-path="C:/b/c.js"');
  });

  it('allow ommitting the column number', function () {
    var result = (0, _libLinkPaths2['default'])('foo() b/c.js:44');
    expect(result).toContain('data-line="44"');
    expect(result).toContain('data-column=""');
  });

  it('links multiple paths', function () {
    var multilineResult = (0, _libLinkPaths2['default'])('foo() b/c.js:44:5\nbar() b/c.js:45:56');
    expect(multilineResult).toContain('foo() <a');
    expect(multilineResult).toContain('bar() <a');
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvbGluay1wYXRocy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OzRCQUVzQixtQkFBbUI7Ozs7QUFGekMsV0FBVyxDQUFDOztBQUlaLFFBQVEsQ0FBQyxXQUFXLEVBQUUsWUFBTTtBQUMxQixJQUFFLENBQUMsc0NBQXNDLEVBQUUsWUFBTTtBQUMvQyxRQUFNLE1BQU0sR0FBRywrQkFBVSxvQkFBb0IsQ0FBQyxDQUFDO0FBQy9DLFVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckMsVUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ2pELFVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUMvQyxVQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDM0MsVUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQzdDLFVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDMUMsQ0FBQyxDQUFDOztBQUVILElBQUUsQ0FBQyxvREFBb0QsRUFBRSxZQUFNO0FBQzdELFFBQU0sTUFBTSxHQUFHLCtCQUFVLHVCQUF1QixDQUFDLENBQUM7QUFDbEQsVUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0dBQ25ELENBQUMsQ0FBQzs7QUFFSCxJQUFFLENBQUMsbUNBQW1DLEVBQUUsWUFBTTtBQUM1QyxRQUFNLE1BQU0sR0FBRywrQkFBVSxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVDLFVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUMzQyxVQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUM7R0FDNUMsQ0FBQyxDQUFDOztBQUVILElBQUUsQ0FBQyxzQkFBc0IsRUFBRSxZQUFNO0FBQy9CLFFBQU0sZUFBZSxHQUFHLCtCQUFVLHVDQUF1QyxDQUN4RSxDQUFDO0FBQ0YsVUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM5QyxVQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQy9DLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9zcGVjL2xpbmstcGF0aHMtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgbGlua1BhdGhzIGZyb20gJy4uL2xpYi9saW5rLXBhdGhzJztcblxuZGVzY3JpYmUoJ2xpbmtQYXRocycsICgpID0+IHtcbiAgaXQoJ2RldGVjdHMgZmlsZSBwYXRocyB3aXRoIGxpbmUgbnVtYmVycycsICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBsaW5rUGF0aHMoJ2ZvbygpIGIvYy5qczo0NDo1NScpO1xuICAgIGV4cGVjdChyZXN1bHQpLnRvQ29udGFpbignZm9vKCkgPGEnKTtcbiAgICBleHBlY3QocmVzdWx0KS50b0NvbnRhaW4oJ2NsYXNzPVwiLWxpbmtlZC1wYXRoXCInKTtcbiAgICBleHBlY3QocmVzdWx0KS50b0NvbnRhaW4oJ2RhdGEtcGF0aD1cImIvYy5qc1wiJyk7XG4gICAgZXhwZWN0KHJlc3VsdCkudG9Db250YWluKCdkYXRhLWxpbmU9XCI0NFwiJyk7XG4gICAgZXhwZWN0KHJlc3VsdCkudG9Db250YWluKCdkYXRhLWNvbHVtbj1cIjU1XCInKTtcbiAgICBleHBlY3QocmVzdWx0KS50b0NvbnRhaW4oJ2IvYy5qczo0NDo1NScpO1xuICB9KTtcblxuICBpdCgnZGV0ZWN0cyBmaWxlIHBhdGhzIHdpdGggV2luZG93cyBzdHlsZSBkcml2ZSBwcmVmaXgnLCAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbGlua1BhdGhzKCdmb28oKSBDOi9iL2MuanM6NDQ6NTUnKTtcbiAgICBleHBlY3QocmVzdWx0KS50b0NvbnRhaW4oJ2RhdGEtcGF0aD1cIkM6L2IvYy5qc1wiJyk7XG4gIH0pO1xuXG4gIGl0KCdhbGxvdyBvbW1pdHRpbmcgdGhlIGNvbHVtbiBudW1iZXInLCAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbGlua1BhdGhzKCdmb28oKSBiL2MuanM6NDQnKTtcbiAgICBleHBlY3QocmVzdWx0KS50b0NvbnRhaW4oJ2RhdGEtbGluZT1cIjQ0XCInKTtcbiAgICBleHBlY3QocmVzdWx0KS50b0NvbnRhaW4oJ2RhdGEtY29sdW1uPVwiXCInKTtcbiAgfSk7XG5cbiAgaXQoJ2xpbmtzIG11bHRpcGxlIHBhdGhzJywgKCkgPT4ge1xuICAgIGNvbnN0IG11bHRpbGluZVJlc3VsdCA9IGxpbmtQYXRocygnZm9vKCkgYi9jLmpzOjQ0OjVcXG5iYXIoKSBiL2MuanM6NDU6NTYnLFxuICAgICk7XG4gICAgZXhwZWN0KG11bHRpbGluZVJlc3VsdCkudG9Db250YWluKCdmb28oKSA8YScpO1xuICAgIGV4cGVjdChtdWx0aWxpbmVSZXN1bHQpLnRvQ29udGFpbignYmFyKCkgPGEnKTtcbiAgfSk7XG59KTtcbiJdfQ==