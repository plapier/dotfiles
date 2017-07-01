Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getLinter = getLinter;
exports.getMessage = getMessage;
exports.getMessageLegacy = getMessageLegacy;
exports.getFixturesPath = getFixturesPath;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _libHelpers = require('../lib/helpers');

function getLinter() {
  return {
    name: 'Some Linter',
    scope: 'project',
    lintsOnChange: false,
    grammarScopes: ['source.js'],
    lint: function lint() {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve([]);
        }, 50);
      });
    }
  };
}

function getMessage(filePathOrNormalized) {
  var message = { severity: 'error', excerpt: String(Math.random()), location: { file: __filename, position: [[0, 0], [0, 0]] } };
  if (typeof filePathOrNormalized === 'boolean' && filePathOrNormalized) {
    (0, _libHelpers.normalizeMessages)('Some Linter', [message]);
  } else if (typeof filePathOrNormalized === 'string') {
    message.location.file = filePathOrNormalized;
  }
  return message;
}

function getMessageLegacy() {
  var normalized = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

  var message = { type: 'Error', filePath: '/tmp/passwd', range: [[0, 1], [1, 0]], text: String(Math.random()) };
  if (normalized) {
    (0, _libHelpers.normalizeMessagesLegacy)('Some Linter', [message]);
  }
  return message;
}

function getFixturesPath(path) {
  return _path2['default'].join(__dirname, 'fixtures', path);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvY29tbW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRWlCLE1BQU07Ozs7MEJBQ29DLGdCQUFnQjs7QUFFcEUsU0FBUyxTQUFTLEdBQVc7QUFDbEMsU0FBTztBQUNMLFFBQUksRUFBRSxhQUFhO0FBQ25CLFNBQUssRUFBRSxTQUFTO0FBQ2hCLGlCQUFhLEVBQUUsS0FBSztBQUNwQixpQkFBYSxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQzVCLFFBQUksRUFBQSxnQkFBRztBQUNMLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUU7QUFDbkMsa0JBQVUsQ0FBQyxZQUFXO0FBQ3BCLGlCQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDWixFQUFFLEVBQUUsQ0FBQyxDQUFBO09BQ1AsQ0FBQyxDQUFBO0tBQ0g7R0FDRixDQUFBO0NBQ0Y7O0FBQ00sU0FBUyxVQUFVLENBQUMsb0JBQXlDLEVBQVU7QUFDNUUsTUFBTSxPQUFlLEdBQUcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQTtBQUN6SSxNQUFJLE9BQU8sb0JBQW9CLEtBQUssU0FBUyxJQUFJLG9CQUFvQixFQUFFO0FBQ3JFLHVDQUFrQixhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0dBQzVDLE1BQU0sSUFBSSxPQUFPLG9CQUFvQixLQUFLLFFBQVEsRUFBRTtBQUNuRCxXQUFPLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxvQkFBb0IsQ0FBQTtHQUM3QztBQUNELFNBQU8sT0FBTyxDQUFBO0NBQ2Y7O0FBQ00sU0FBUyxnQkFBZ0IsR0FBcUM7TUFBcEMsVUFBbUIseURBQUcsSUFBSTs7QUFDekQsTUFBTSxPQUFlLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUE7QUFDeEgsTUFBSSxVQUFVLEVBQUU7QUFDZCw2Q0FBd0IsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtHQUNsRDtBQUNELFNBQU8sT0FBTyxDQUFBO0NBQ2Y7O0FBQ00sU0FBUyxlQUFlLENBQUMsSUFBWSxFQUFVO0FBQ3BELFNBQU8sa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUE7Q0FDOUMiLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgbm9ybWFsaXplTWVzc2FnZXMsIG5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5IH0gZnJvbSAnLi4vbGliL2hlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMaW50ZXIoKTogT2JqZWN0IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnU29tZSBMaW50ZXInLFxuICAgIHNjb3BlOiAncHJvamVjdCcsXG4gICAgbGludHNPbkNoYW5nZTogZmFsc2UsXG4gICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuanMnXSxcbiAgICBsaW50KCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNvbHZlKFtdKVxuICAgICAgICB9LCA1MClcbiAgICAgIH0pXG4gICAgfSxcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldE1lc3NhZ2UoZmlsZVBhdGhPck5vcm1hbGl6ZWQ6ID8oYm9vbGVhbiB8IHN0cmluZykpOiBPYmplY3Qge1xuICBjb25zdCBtZXNzYWdlOiBPYmplY3QgPSB7IHNldmVyaXR5OiAnZXJyb3InLCBleGNlcnB0OiBTdHJpbmcoTWF0aC5yYW5kb20oKSksIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0gfVxuICBpZiAodHlwZW9mIGZpbGVQYXRoT3JOb3JtYWxpemVkID09PSAnYm9vbGVhbicgJiYgZmlsZVBhdGhPck5vcm1hbGl6ZWQpIHtcbiAgICBub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gIH0gZWxzZSBpZiAodHlwZW9mIGZpbGVQYXRoT3JOb3JtYWxpemVkID09PSAnc3RyaW5nJykge1xuICAgIG1lc3NhZ2UubG9jYXRpb24uZmlsZSA9IGZpbGVQYXRoT3JOb3JtYWxpemVkXG4gIH1cbiAgcmV0dXJuIG1lc3NhZ2Vcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRNZXNzYWdlTGVnYWN5KG5vcm1hbGl6ZWQ6IGJvb2xlYW4gPSB0cnVlKTogT2JqZWN0IHtcbiAgY29uc3QgbWVzc2FnZTogT2JqZWN0ID0geyB0eXBlOiAnRXJyb3InLCBmaWxlUGF0aDogJy90bXAvcGFzc3dkJywgcmFuZ2U6IFtbMCwgMV0sIFsxLCAwXV0sIHRleHQ6IFN0cmluZyhNYXRoLnJhbmRvbSgpKSB9XG4gIGlmIChub3JtYWxpemVkKSB7XG4gICAgbm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICB9XG4gIHJldHVybiBtZXNzYWdlXG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0Rml4dHVyZXNQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBQYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnLCBwYXRoKVxufVxuIl19