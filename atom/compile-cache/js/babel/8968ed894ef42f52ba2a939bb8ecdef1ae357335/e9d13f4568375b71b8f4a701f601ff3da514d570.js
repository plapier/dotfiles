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
  }, {
    key: 'visibility',
    set: function (value) {
      if (value) {
        this.removeAttribute('hidden');
      } else {
        this.setAttribute('hidden', true);
      }
    }
  }]);

  return BottomTab;
})(HTMLElement);

module.exports = BottomTab = document.registerElement('linter-bottom-tab', {
  prototype: BottomTab.prototype
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL2RvdGZpbGVzL2F0b20vcGFja2FnZXMvbGludGVyL2xpYi92aWV3cy9ib3R0b20tdGFiLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7SUFFUCxTQUFTO1dBQVQsU0FBUzswQkFBVCxTQUFTOzs7Ozs7O1lBQVQsU0FBUzs7ZUFBVCxTQUFTOztXQUVILG9CQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7QUFDM0IsVUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7QUFDcEIsVUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUE7QUFDeEIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRWhDLFVBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMvQyxVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDckMsVUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFBOztBQUVoQyxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUM5QyxVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFaEMsVUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUN4Qzs7O1NBQ1MsWUFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtLQUNwQjtTQUNTLFVBQUMsS0FBSyxFQUFFO0FBQ2hCLFVBQUksS0FBSyxFQUFFO0FBQ1QsWUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDN0IsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQ2hDO0FBQ0QsVUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUE7S0FDckI7OztTQUNRLFVBQUMsS0FBSyxFQUFFO0FBQ2YsVUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7QUFDbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFBO0tBQ25DOzs7U0FDYSxVQUFDLEtBQUssRUFBQztBQUNuQixVQUFHLEtBQUssRUFBQztBQUNQLFlBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDL0IsTUFBTTtBQUNMLFlBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO09BQ2xDO0tBQ0Y7OztTQXJDRyxTQUFTO0dBQVMsV0FBVzs7QUF3Q25DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLEVBQUU7QUFDekUsV0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTO0NBQy9CLENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvbGFwaWVyL0Ryb3Bib3ggKFBlcnNvbmFsKS9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdmlld3MvYm90dG9tLXRhYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY2xhc3MgQm90dG9tVGFiIGV4dGVuZHMgSFRNTEVsZW1lbnR7XG5cbiAgaW5pdGlhbGl6ZShDb250ZW50LCBvbkNsaWNrKSB7XG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2VcbiAgICB0aGlzLmlubmVySFRNTCA9IENvbnRlbnRcbiAgICB0aGlzLmNsYXNzTGlzdC5hZGQoJ2xpbnRlci10YWInKVxuXG4gICAgdGhpcy5jb3VudFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICB0aGlzLmNvdW50U3Bhbi5jbGFzc0xpc3QuYWRkKCdjb3VudCcpXG4gICAgdGhpcy5jb3VudFNwYW4udGV4dENvbnRlbnQgPSAnMCdcblxuICAgIHRoaXMuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJyAnKSlcbiAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuY291bnRTcGFuKVxuXG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spXG4gIH1cbiAgZ2V0IGFjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlXG4gIH1cbiAgc2V0IGFjdGl2ZSh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpXG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZSA9IHZhbHVlXG4gIH1cbiAgc2V0IGNvdW50KHZhbHVlKSB7XG4gICAgdGhpcy5fY291bnQgPSB2YWx1ZVxuICAgIHRoaXMuY291bnRTcGFuLnRleHRDb250ZW50ID0gdmFsdWVcbiAgfVxuICBzZXQgdmlzaWJpbGl0eSh2YWx1ZSl7XG4gICAgaWYodmFsdWUpe1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCB0cnVlKVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJvdHRvbVRhYiA9IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnbGludGVyLWJvdHRvbS10YWInLCB7XG4gIHByb3RvdHlwZTogQm90dG9tVGFiLnByb3RvdHlwZVxufSlcbiJdfQ==