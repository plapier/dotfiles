function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libGrammarUtils = require('../../lib/grammar-utils');

var _libGrammarUtils2 = _interopRequireDefault(_libGrammarUtils);

'use babel';

describe('GrammarUtils', function () {
  return describe('Lisp', function () {
    var toStatements = _libGrammarUtils2['default'].Lisp.splitStatements;

    it('returns empty array for empty code', function () {
      var code = '';
      expect(toStatements(code)).toEqual([]);
    });

    it('does not split single statement', function () {
      var code = '(print "dummy")';
      expect(toStatements(code)).toEqual([code]);
    });

    it('splits two simple statements', function () {
      var code = '(print "dummy")(print "statement")';
      expect(toStatements(code)).toEqual(['(print "dummy")', '(print "statement")']);
    });

    it('splits two simple statements in many lines', function () {
      var code = '(print "dummy")  \n\n  (print "statement")';
      expect(toStatements(code)).toEqual(['(print "dummy")', '(print "statement")']);
    });

    it('does not split single line complex statement', function () {
      var code = '(when t(setq a 2)(+ i 1))';
      expect(toStatements(code)).toEqual(['(when t(setq a 2)(+ i 1))']);
    });

    it('does not split multi line complex statement', function () {
      var code = '(when t(setq a 2)  \n \t (+ i 1))';
      expect(toStatements(code)).toEqual(['(when t(setq a 2)  \n \t (+ i 1))']);
    });

    it('splits single line complex statements', function () {
      var code = '(when t(setq a 2)(+ i 1))(when t(setq a 5)(+ i 3))';
      expect(toStatements(code)).toEqual(['(when t(setq a 2)(+ i 1))', '(when t(setq a 5)(+ i 3))']);
    });

    it('splits multi line complex statements', function () {
      var code = '(when t(\nsetq a 2)(+ i 1))   \n\t (when t(\n\t  setq a 5)(+ i 3))';
      expect(toStatements(code)).toEqual(['(when t(\nsetq a 2)(+ i 1))', '(when t(\n\t  setq a 5)(+ i 3))']);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvc2NyaXB0L3NwZWMvZ3JhbW1hci11dGlscy9saXNwLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7K0JBRXlCLHlCQUF5Qjs7OztBQUZsRCxXQUFXLENBQUM7O0FBSVosUUFBUSxDQUFDLGNBQWMsRUFBRTtTQUN2QixRQUFRLENBQUMsTUFBTSxFQUFFLFlBQU07QUFDckIsUUFBTSxZQUFZLEdBQUcsNkJBQWEsSUFBSSxDQUFDLGVBQWUsQ0FBQzs7QUFFdkQsTUFBRSxDQUFDLG9DQUFvQyxFQUFFLFlBQU07QUFDN0MsVUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFlBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDeEMsQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxpQ0FBaUMsRUFBRSxZQUFNO0FBQzFDLFVBQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDO0FBQy9CLFlBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQzVDLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsOEJBQThCLEVBQUUsWUFBTTtBQUN2QyxVQUFNLElBQUksR0FBRyxvQ0FBb0MsQ0FBQztBQUNsRCxZQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsaUJBQWlCLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0tBQ2hGLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsNENBQTRDLEVBQUUsWUFBTTtBQUNyRCxVQUFNLElBQUksR0FBRyw0Q0FBNEMsQ0FBQztBQUMxRCxZQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsaUJBQWlCLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0tBQ2hGLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsOENBQThDLEVBQUUsWUFBTTtBQUN2RCxVQUFNLElBQUksR0FBRywyQkFBMkIsQ0FBQztBQUN6QyxZQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO0tBQ25FLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsNkNBQTZDLEVBQUUsWUFBTTtBQUN0RCxVQUFNLElBQUksR0FBRyxtQ0FBbUMsQ0FBQztBQUNqRCxZQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDO0tBQzNFLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsdUNBQXVDLEVBQUUsWUFBTTtBQUNoRCxVQUFNLElBQUksR0FBRyxvREFBb0QsQ0FBQztBQUNsRSxZQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsMkJBQTJCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO0tBQ2hHLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsc0NBQXNDLEVBQUUsWUFBTTtBQUMvQyxVQUFNLElBQUksR0FBRyxvRUFBb0UsQ0FBQztBQUNsRixZQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsNkJBQTZCLEVBQUUsaUNBQWlDLENBQUMsQ0FBQyxDQUFDO0tBQ3hHLENBQUMsQ0FBQztHQUNKLENBQUM7Q0FBQSxDQUNILENBQUMiLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9zY3JpcHQvc3BlYy9ncmFtbWFyLXV0aWxzL2xpc3Atc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgR3JhbW1hclV0aWxzIGZyb20gJy4uLy4uL2xpYi9ncmFtbWFyLXV0aWxzJztcblxuZGVzY3JpYmUoJ0dyYW1tYXJVdGlscycsICgpID0+XG4gIGRlc2NyaWJlKCdMaXNwJywgKCkgPT4ge1xuICAgIGNvbnN0IHRvU3RhdGVtZW50cyA9IEdyYW1tYXJVdGlscy5MaXNwLnNwbGl0U3RhdGVtZW50cztcblxuICAgIGl0KCdyZXR1cm5zIGVtcHR5IGFycmF5IGZvciBlbXB0eSBjb2RlJywgKCkgPT4ge1xuICAgICAgY29uc3QgY29kZSA9ICcnO1xuICAgICAgZXhwZWN0KHRvU3RhdGVtZW50cyhjb2RlKSkudG9FcXVhbChbXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnZG9lcyBub3Qgc3BsaXQgc2luZ2xlIHN0YXRlbWVudCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGNvZGUgPSAnKHByaW50IFwiZHVtbXlcIiknO1xuICAgICAgZXhwZWN0KHRvU3RhdGVtZW50cyhjb2RlKSkudG9FcXVhbChbY29kZV0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3NwbGl0cyB0d28gc2ltcGxlIHN0YXRlbWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gJyhwcmludCBcImR1bW15XCIpKHByaW50IFwic3RhdGVtZW50XCIpJztcbiAgICAgIGV4cGVjdCh0b1N0YXRlbWVudHMoY29kZSkpLnRvRXF1YWwoWycocHJpbnQgXCJkdW1teVwiKScsICcocHJpbnQgXCJzdGF0ZW1lbnRcIiknXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc3BsaXRzIHR3byBzaW1wbGUgc3RhdGVtZW50cyBpbiBtYW55IGxpbmVzJywgKCkgPT4ge1xuICAgICAgY29uc3QgY29kZSA9ICcocHJpbnQgXCJkdW1teVwiKSAgXFxuXFxuICAocHJpbnQgXCJzdGF0ZW1lbnRcIiknO1xuICAgICAgZXhwZWN0KHRvU3RhdGVtZW50cyhjb2RlKSkudG9FcXVhbChbJyhwcmludCBcImR1bW15XCIpJywgJyhwcmludCBcInN0YXRlbWVudFwiKSddKTtcbiAgICB9KTtcblxuICAgIGl0KCdkb2VzIG5vdCBzcGxpdCBzaW5nbGUgbGluZSBjb21wbGV4IHN0YXRlbWVudCcsICgpID0+IHtcbiAgICAgIGNvbnN0IGNvZGUgPSAnKHdoZW4gdChzZXRxIGEgMikoKyBpIDEpKSc7XG4gICAgICBleHBlY3QodG9TdGF0ZW1lbnRzKGNvZGUpKS50b0VxdWFsKFsnKHdoZW4gdChzZXRxIGEgMikoKyBpIDEpKSddKTtcbiAgICB9KTtcblxuICAgIGl0KCdkb2VzIG5vdCBzcGxpdCBtdWx0aSBsaW5lIGNvbXBsZXggc3RhdGVtZW50JywgKCkgPT4ge1xuICAgICAgY29uc3QgY29kZSA9ICcod2hlbiB0KHNldHEgYSAyKSAgXFxuIFxcdCAoKyBpIDEpKSc7XG4gICAgICBleHBlY3QodG9TdGF0ZW1lbnRzKGNvZGUpKS50b0VxdWFsKFsnKHdoZW4gdChzZXRxIGEgMikgIFxcbiBcXHQgKCsgaSAxKSknXSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc3BsaXRzIHNpbmdsZSBsaW5lIGNvbXBsZXggc3RhdGVtZW50cycsICgpID0+IHtcbiAgICAgIGNvbnN0IGNvZGUgPSAnKHdoZW4gdChzZXRxIGEgMikoKyBpIDEpKSh3aGVuIHQoc2V0cSBhIDUpKCsgaSAzKSknO1xuICAgICAgZXhwZWN0KHRvU3RhdGVtZW50cyhjb2RlKSkudG9FcXVhbChbJyh3aGVuIHQoc2V0cSBhIDIpKCsgaSAxKSknLCAnKHdoZW4gdChzZXRxIGEgNSkoKyBpIDMpKSddKTtcbiAgICB9KTtcblxuICAgIGl0KCdzcGxpdHMgbXVsdGkgbGluZSBjb21wbGV4IHN0YXRlbWVudHMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBjb2RlID0gJyh3aGVuIHQoXFxuc2V0cSBhIDIpKCsgaSAxKSkgICBcXG5cXHQgKHdoZW4gdChcXG5cXHQgIHNldHEgYSA1KSgrIGkgMykpJztcbiAgICAgIGV4cGVjdCh0b1N0YXRlbWVudHMoY29kZSkpLnRvRXF1YWwoWycod2hlbiB0KFxcbnNldHEgYSAyKSgrIGkgMSkpJywgJyh3aGVuIHQoXFxuXFx0ICBzZXRxIGEgNSkoKyBpIDMpKSddKTtcbiAgICB9KTtcbiAgfSksXG4pO1xuIl19