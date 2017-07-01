'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var BottomTab = (function (_HTMLElement) {
  function BottomTab() {
    _classCallCheck(this, BottomTab);

    if (_HTMLElement != null) {
      _HTMLElement.apply(this, arguments);
    }
  }

  _inherits(BottomTab, _HTMLElement);

  _createClass(BottomTab, [{
    key: 'initialize',
    value: function initialize(Content, onClick) {
      this._active = false;
      this.innerHTML = Content;
      this.classList.add('linter-tab');

      this.countSpan = document.createElement('span');
      this.countSpan.classList.add('count');
      this.countSpan.textContent = '0';

      this.appendChild(document.createTextNode(' '));
      this.appendChild(this.countSpan);

      this.addEventListener('click', onClick);
    }
  }, {
    key: 'active',
    get: function () {
      return this._active;
    },
    set: function (value) {
      if (value) {
        this.classList.add('active');
      } else {
        this.classList.remove('active');
      }
      this._active = value;
    }
  }, {
    key: 'count',
    set: function (value) {
      this._count = value;
      this.countSpan.textContent = value;
    }
  }]);

  return BottomTab;
})(HTMLElement);

module.exports = BottomTab = document.registerElement('linter-bottom-tab', {
  prototype: BottomTab.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGludGVyL2xpYi92aWV3cy9ib3R0b20tdGFiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7SUFFUCxTQUFTO1dBQVQsU0FBUzswQkFBVCxTQUFTOzs7Ozs7O1lBQVQsU0FBUzs7ZUFBVCxTQUFTOztXQUVILG9CQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDM0IsVUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7QUFDcEIsVUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUE7QUFDeEIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRWhDLFVBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMvQyxVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDckMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFBOztBQUVoQyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUM5QyxVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUN4Qzs7O1NBRVMsWUFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtLQUNwQjtTQUVTLFVBQUMsS0FBSyxFQUFFO0FBQ2hCLFVBQUksS0FBSyxFQUFFO0FBQ1QsWUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDN0IsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQ2hDO0FBQ0QsVUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7S0FDckI7OztTQUVRLFVBQUMsS0FBSyxFQUFFO0FBQ2YsVUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7QUFDbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFBO0tBQ25DOzs7U0FqQ0csU0FBUztHQUFTLFdBQVc7O0FBb0NuQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLG1CQUFtQixFQUFFO0FBQ3pFLFdBQVMsRUFBRSxTQUFTLENBQUMsU0FBUztDQUMvQixDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL3ZpZXdzL2JvdHRvbS10YWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmNsYXNzIEJvdHRvbVRhYiBleHRlbmRzIEhUTUxFbGVtZW50e1xuXG4gIGluaXRpYWxpemUoQ29udGVudCwgb25DbGljaykge1xuICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlXG4gICAgdGhpcy5pbm5lckhUTUwgPSBDb250ZW50XG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdsaW50ZXItdGFiJylcblxuICAgIHRoaXMuY291bnRTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgdGhpcy5jb3VudFNwYW4uY2xhc3NMaXN0LmFkZCgnY291bnQnKVxuICAgIHRoaXMuY291bnRTcGFuLnRleHRDb250ZW50ID0gJzAnXG5cbiAgICB0aGlzLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJykpXG4gICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLmNvdW50U3BhbilcblxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKVxuICB9XG5cbiAgZ2V0IGFjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlXG4gIH1cblxuICBzZXQgYWN0aXZlKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJylcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlID0gdmFsdWVcbiAgfVxuXG4gIHNldCBjb3VudCh2YWx1ZSkge1xuICAgIHRoaXMuX2NvdW50ID0gdmFsdWVcbiAgICB0aGlzLmNvdW50U3Bhbi50ZXh0Q29udGVudCA9IHZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCb3R0b21UYWIgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQoJ2xpbnRlci1ib3R0b20tdGFiJywge1xuICBwcm90b3R5cGU6IEJvdHRvbVRhYi5wcm90b3R5cGVcbn0pXG4iXX0=