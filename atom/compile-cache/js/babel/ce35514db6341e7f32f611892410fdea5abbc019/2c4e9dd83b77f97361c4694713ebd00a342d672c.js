Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var TargetsView = (function (_SelectListView) {
  _inherits(TargetsView, _SelectListView);

  function TargetsView() {
    _classCallCheck(this, TargetsView);

    _get(Object.getPrototypeOf(TargetsView.prototype), 'constructor', this).apply(this, arguments);
    this.show();
  }

  _createClass(TargetsView, [{
    key: 'initialize',
    value: function initialize() {
      _get(Object.getPrototypeOf(TargetsView.prototype), 'initialize', this).apply(this, arguments);
      this.addClass('build-target');
      this.list.addClass('mark-active');
    }
  }, {
    key: 'show',
    value: function show() {
      this.panel = atom.workspace.addModalPanel({ item: this });
      this.panel.show();
      this.focusFilterEditor();
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
    }
  }, {
    key: 'setItems',
    value: function setItems() {
      _get(Object.getPrototypeOf(TargetsView.prototype), 'setItems', this).apply(this, arguments);

      var activeItemView = this.find('.active');
      if (0 < activeItemView.length) {
        this.selectItemView(activeItemView);
        this.scrollToItemView(activeItemView);
      }
    }
  }, {
    key: 'setActiveTarget',
    value: function setActiveTarget(target) {
      this.activeTarget = target;
    }
  }, {
    key: 'viewForItem',
    value: function viewForItem(targetName) {
      var activeTarget = this.activeTarget;
      return TargetsView.render(function () {
        var activeClass = targetName === activeTarget ? 'active' : '';
        this.li({ 'class': activeClass + ' build-target' }, targetName);
      });
    }
  }, {
    key: 'getEmptyMessage',
    value: function getEmptyMessage(itemCount) {
      return 0 === itemCount ? 'No targets found.' : 'No matches';
    }
  }, {
    key: 'awaitSelection',
    value: function awaitSelection() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.resolveFunction = resolve;
      });
    }
  }, {
    key: 'confirmed',
    value: function confirmed(target) {
      if (this.resolveFunction) {
        this.resolveFunction(target);
        this.resolveFunction = null;
      }
      this.hide();
    }
  }, {
    key: 'cancelled',
    value: function cancelled() {
      this.hide();
    }
  }]);

  return TargetsView;
})(_atomSpacePenViews.SelectListView);

exports['default'] = TargetsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL3RhcmdldHMtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7aUNBRStCLHNCQUFzQjs7QUFGckQsV0FBVyxDQUFDOztJQUlTLFdBQVc7WUFBWCxXQUFXOztBQUVuQixXQUZRLFdBQVcsR0FFaEI7MEJBRkssV0FBVzs7QUFHNUIsK0JBSGlCLFdBQVcsOENBR25CLFNBQVMsRUFBRTtBQUNwQixRQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDYjs7ZUFMa0IsV0FBVzs7V0FPcEIsc0JBQUc7QUFDWCxpQ0FSaUIsV0FBVyw2Q0FRUixTQUFTLEVBQUU7QUFDL0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM5QixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUNuQzs7O1dBRUcsZ0JBQUc7QUFDTCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDMUQsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNsQixVQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUMxQjs7O1dBRUcsZ0JBQUc7QUFDTCxVQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ25COzs7V0FFTyxvQkFBRztBQUNULGlDQXhCaUIsV0FBVywyQ0F3QlYsU0FBUyxFQUFFOztBQUU3QixVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDN0IsWUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNwQyxZQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7T0FDdkM7S0FDRjs7O1dBRWMseUJBQUMsTUFBTSxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDO0tBQzVCOzs7V0FFVSxxQkFBQyxVQUFVLEVBQUU7QUFDdEIsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUN2QyxhQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBWTtBQUNwQyxZQUFNLFdBQVcsR0FBSSxVQUFVLEtBQUssWUFBWSxHQUFHLFFBQVEsR0FBRyxFQUFFLEFBQUMsQ0FBQztBQUNsRSxZQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBTyxXQUFXLEdBQUcsZUFBZSxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7T0FDL0QsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLHlCQUFDLFNBQVMsRUFBRTtBQUN6QixhQUFPLEFBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBSSxtQkFBbUIsR0FBRyxZQUFZLENBQUM7S0FDL0Q7OztXQUVhLDBCQUFHOzs7QUFDZixhQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxjQUFLLGVBQWUsR0FBRyxPQUFPLENBQUM7T0FDaEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVRLG1CQUFDLE1BQU0sRUFBRTtBQUNoQixVQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDeEIsWUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixZQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztPQUM3QjtBQUNELFVBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNiOzs7V0FFUSxxQkFBRztBQUNWLFVBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNiOzs7U0FqRWtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL3RhcmdldHMtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBTZWxlY3RMaXN0VmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFyZ2V0c1ZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0VmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICB0aGlzLnNob3coKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSguLi5hcmd1bWVudHMpO1xuICAgIHRoaXMuYWRkQ2xhc3MoJ2J1aWxkLXRhcmdldCcpO1xuICAgIHRoaXMubGlzdC5hZGRDbGFzcygnbWFyay1hY3RpdmUnKTtcbiAgfVxuXG4gIHNob3coKSB7XG4gICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiB0aGlzIH0pO1xuICAgIHRoaXMucGFuZWwuc2hvdygpO1xuICAgIHRoaXMuZm9jdXNGaWx0ZXJFZGl0b3IoKTtcbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgdGhpcy5wYW5lbC5oaWRlKCk7XG4gIH1cblxuICBzZXRJdGVtcygpIHtcbiAgICBzdXBlci5zZXRJdGVtcyguLi5hcmd1bWVudHMpO1xuXG4gICAgY29uc3QgYWN0aXZlSXRlbVZpZXcgPSB0aGlzLmZpbmQoJy5hY3RpdmUnKTtcbiAgICBpZiAoMCA8IGFjdGl2ZUl0ZW1WaWV3Lmxlbmd0aCkge1xuICAgICAgdGhpcy5zZWxlY3RJdGVtVmlldyhhY3RpdmVJdGVtVmlldyk7XG4gICAgICB0aGlzLnNjcm9sbFRvSXRlbVZpZXcoYWN0aXZlSXRlbVZpZXcpO1xuICAgIH1cbiAgfVxuXG4gIHNldEFjdGl2ZVRhcmdldCh0YXJnZXQpIHtcbiAgICB0aGlzLmFjdGl2ZVRhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIHZpZXdGb3JJdGVtKHRhcmdldE5hbWUpIHtcbiAgICBjb25zdCBhY3RpdmVUYXJnZXQgPSB0aGlzLmFjdGl2ZVRhcmdldDtcbiAgICByZXR1cm4gVGFyZ2V0c1ZpZXcucmVuZGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZUNsYXNzID0gKHRhcmdldE5hbWUgPT09IGFjdGl2ZVRhcmdldCA/ICdhY3RpdmUnIDogJycpO1xuICAgICAgdGhpcy5saSh7IGNsYXNzOiBhY3RpdmVDbGFzcyArICcgYnVpbGQtdGFyZ2V0JyB9LCB0YXJnZXROYW1lKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEVtcHR5TWVzc2FnZShpdGVtQ291bnQpIHtcbiAgICByZXR1cm4gKDAgPT09IGl0ZW1Db3VudCkgPyAnTm8gdGFyZ2V0cyBmb3VuZC4nIDogJ05vIG1hdGNoZXMnO1xuICB9XG5cbiAgYXdhaXRTZWxlY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZUZ1bmN0aW9uID0gcmVzb2x2ZTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbmZpcm1lZCh0YXJnZXQpIHtcbiAgICBpZiAodGhpcy5yZXNvbHZlRnVuY3Rpb24pIHtcbiAgICAgIHRoaXMucmVzb2x2ZUZ1bmN0aW9uKHRhcmdldCk7XG4gICAgICB0aGlzLnJlc29sdmVGdW5jdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuaGlkZSgpO1xuICB9XG5cbiAgY2FuY2VsbGVkKCkge1xuICAgIHRoaXMuaGlkZSgpO1xuICB9XG59XG4iXX0=