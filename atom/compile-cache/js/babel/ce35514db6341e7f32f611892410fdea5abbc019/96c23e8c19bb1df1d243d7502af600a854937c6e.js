Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createSuggestion = createSuggestion;
exports.getKeyboardEvent = getKeyboardEvent;

var _libHelpers = require('../lib/helpers');

'use babel';

function createSuggestion(text, selected) {
  var className = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
  var icon = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
  var process = arguments.length <= 4 || arguments[4] === undefined ? true : arguments[4];

  var suggestion = {
    icon: icon,
    title: text,
    'class': className,
    priority: 100,
    selected: selected
  };
  if (process) {
    return (0, _libHelpers.processListItems)([suggestion])[0];
  }
  return suggestion;
}

function getKeyboardEvent() {
  var name = arguments.length <= 0 || arguments[0] === undefined ? 'keydown' : arguments[0];
  var code = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var event = new KeyboardEvent(name);
  Object.defineProperty(event, 'keyCode', {
    value: code
  });
  return event;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvaW50ZW50aW9ucy9zcGVjL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzBCQUVpQyxnQkFBZ0I7O0FBRmpELFdBQVcsQ0FBQTs7QUFJSixTQUFTLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQTZDO01BQTNDLFNBQVMseURBQUcsRUFBRTtNQUFFLElBQUkseURBQUcsRUFBRTtNQUFFLE9BQU8seURBQUcsSUFBSTs7QUFDeEYsTUFBTSxVQUFVLEdBQUc7QUFDakIsUUFBSSxFQUFKLElBQUk7QUFDSixTQUFLLEVBQUUsSUFBSTtBQUNYLGFBQU8sU0FBUztBQUNoQixZQUFRLEVBQUUsR0FBRztBQUNiLFlBQVEsRUFBUixRQUFRO0dBQ1QsQ0FBQTtBQUNELE1BQUksT0FBTyxFQUFFO0FBQ1gsV0FBTyxrQ0FBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQ3pDO0FBQ0QsU0FBTyxVQUFVLENBQUE7Q0FDbEI7O0FBRU0sU0FBUyxnQkFBZ0IsR0FBNEM7TUFBM0MsSUFBSSx5REFBRyxTQUFTO01BQUUsSUFBSSx5REFBRyxDQUFDOztBQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNyQyxRQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUU7QUFDdEMsU0FBSyxFQUFFLElBQUk7R0FDWixDQUFDLENBQUE7QUFDRixTQUFPLEtBQUssQ0FBQTtDQUNiIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvaW50ZW50aW9ucy9zcGVjL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBwcm9jZXNzTGlzdEl0ZW1zIH0gZnJvbSAnLi4vbGliL2hlbHBlcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdWdnZXN0aW9uKHRleHQsIHNlbGVjdGVkLCBjbGFzc05hbWUgPSAnJywgaWNvbiA9ICcnLCBwcm9jZXNzID0gdHJ1ZSkge1xuICBjb25zdCBzdWdnZXN0aW9uID0ge1xuICAgIGljb24sXG4gICAgdGl0bGU6IHRleHQsXG4gICAgY2xhc3M6IGNsYXNzTmFtZSxcbiAgICBwcmlvcml0eTogMTAwLFxuICAgIHNlbGVjdGVkLFxuICB9XG4gIGlmIChwcm9jZXNzKSB7XG4gICAgcmV0dXJuIHByb2Nlc3NMaXN0SXRlbXMoW3N1Z2dlc3Rpb25dKVswXVxuICB9XG4gIHJldHVybiBzdWdnZXN0aW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlib2FyZEV2ZW50KG5hbWUgPSAna2V5ZG93bicsIGNvZGUgPSAwKTogS2V5Ym9hcmRFdmVudCB7XG4gIGNvbnN0IGV2ZW50ID0gbmV3IEtleWJvYXJkRXZlbnQobmFtZSlcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV2ZW50LCAna2V5Q29kZScsIHtcbiAgICB2YWx1ZTogY29kZSxcbiAgfSlcbiAgcmV0dXJuIGV2ZW50XG59XG4iXX0=