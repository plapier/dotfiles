Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var HeaderView = (function (_View) {
  _inherits(HeaderView, _View);

  function HeaderView() {
    _classCallCheck(this, HeaderView);

    _get(Object.getPrototypeOf(HeaderView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(HeaderView, [{
    key: 'setStatus',
    value: function setStatus(status) {
      this.status.removeClass('icon-alert icon-check icon-hourglass icon-stop');
      switch (status) {
        case 'start':
          return this.status.addClass('icon-hourglass');
        case 'stop':
          return this.status.addClass('icon-check');
        case 'kill':
          return this.status.addClass('icon-stop');
        case 'err':
          return this.status.addClass('icon-alert');
        default:
          return null;
      }
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.div({ 'class': 'header-view' }, function () {
        _this.span({ 'class': 'heading-title', outlet: 'title' });
        return _this.span({ 'class': 'heading-status', outlet: 'status' });
      });
    }
  }]);

  return HeaderView;
})(_atomSpacePenViews.View);

exports['default'] = HeaderView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvaGVhZGVyLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2lDQUVxQixzQkFBc0I7O0FBRjNDLFdBQVcsQ0FBQzs7SUFJUyxVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7OztlQUFWLFVBQVU7O1dBU3BCLG1CQUFDLE1BQU0sRUFBRTtBQUNoQixVQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0FBQzFFLGNBQVEsTUFBTTtBQUNaLGFBQUssT0FBTztBQUFFLGlCQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFBQSxBQUM1RCxhQUFLLE1BQU07QUFBRSxpQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUFBLEFBQ3ZELGFBQUssTUFBTTtBQUFFLGlCQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQUEsQUFDdEQsYUFBSyxLQUFLO0FBQUUsaUJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7QUFBQSxBQUN0RDtBQUFTLGlCQUFPLElBQUksQ0FBQztBQUFBLE9BQ3RCO0tBQ0Y7OztXQWhCYSxtQkFBRzs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBTyxhQUFhLEVBQUUsRUFBRSxZQUFNO0FBQzlDLGNBQUssSUFBSSxDQUFDLEVBQUUsU0FBTyxlQUFlLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDdkQsZUFBTyxNQUFLLElBQUksQ0FBQyxFQUFFLFNBQU8sZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7T0FDakUsQ0FBQyxDQUFDO0tBQ0o7OztTQVBrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9EZXYvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zY3JpcHQvbGliL2hlYWRlci12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlYWRlclZpZXcgZXh0ZW5kcyBWaWV3IHtcblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXYoeyBjbGFzczogJ2hlYWRlci12aWV3JyB9LCAoKSA9PiB7XG4gICAgICB0aGlzLnNwYW4oeyBjbGFzczogJ2hlYWRpbmctdGl0bGUnLCBvdXRsZXQ6ICd0aXRsZScgfSk7XG4gICAgICByZXR1cm4gdGhpcy5zcGFuKHsgY2xhc3M6ICdoZWFkaW5nLXN0YXR1cycsIG91dGxldDogJ3N0YXR1cycgfSk7XG4gICAgfSk7XG4gIH1cblxuICBzZXRTdGF0dXMoc3RhdHVzKSB7XG4gICAgdGhpcy5zdGF0dXMucmVtb3ZlQ2xhc3MoJ2ljb24tYWxlcnQgaWNvbi1jaGVjayBpY29uLWhvdXJnbGFzcyBpY29uLXN0b3AnKTtcbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSAnc3RhcnQnOiByZXR1cm4gdGhpcy5zdGF0dXMuYWRkQ2xhc3MoJ2ljb24taG91cmdsYXNzJyk7XG4gICAgICBjYXNlICdzdG9wJzogcmV0dXJuIHRoaXMuc3RhdHVzLmFkZENsYXNzKCdpY29uLWNoZWNrJyk7XG4gICAgICBjYXNlICdraWxsJzogcmV0dXJuIHRoaXMuc3RhdHVzLmFkZENsYXNzKCdpY29uLXN0b3AnKTtcbiAgICAgIGNhc2UgJ2Vycic6IHJldHVybiB0aGlzLnN0YXR1cy5hZGRDbGFzcygnaWNvbi1hbGVydCcpO1xuICAgICAgZGVmYXVsdDogcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=