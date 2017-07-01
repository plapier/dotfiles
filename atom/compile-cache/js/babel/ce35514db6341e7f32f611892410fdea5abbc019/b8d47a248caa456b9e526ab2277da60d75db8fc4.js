'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var hooks = {
  preBuild: function preBuild() {},
  postBuild: function postBuild() {}
};

var Builder = (function () {
  function Builder() {
    _classCallCheck(this, Builder);
  }

  _createClass(Builder, [{
    key: 'getNiceName',
    value: function getNiceName() {
      return 'Build with hooks';
    }
  }, {
    key: 'isEligible',
    value: function isEligible() {
      return true;
    }
  }, {
    key: 'settings',
    value: function settings() {
      return [{
        exec: 'exit',
        args: ['0'],
        atomCommandName: 'build:hook-test:succeeding',
        preBuild: function preBuild() {
          return hooks.preBuild();
        },
        postBuild: function postBuild(success) {
          return hooks.postBuild(success);
        }
      }, {
        exec: 'exit',
        args: ['1'],
        atomCommandName: 'build:hook-test:failing',
        preBuild: function preBuild() {
          return hooks.preBuild();
        },
        postBuild: function postBuild(success) {
          return hooks.postBuild(success);
        }
      }];
    }
  }]);

  return Builder;
})();

module.exports = {
  activate: function activate() {},
  provideBuilder: function provideBuilder() {
    return Builder;
  },
  hooks: hooks
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9maXh0dXJlL2F0b20tYnVpbGQtaG9va3MtZHVtbXktcGFja2FnZS9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7O0FBRVosSUFBTSxLQUFLLEdBQUc7QUFDWixVQUFRLEVBQUUsb0JBQU0sRUFBRTtBQUNsQixXQUFTLEVBQUUscUJBQU0sRUFBRTtDQUNwQixDQUFDOztJQUVJLE9BQU87V0FBUCxPQUFPOzBCQUFQLE9BQU87OztlQUFQLE9BQU87O1dBQ0EsdUJBQUc7QUFDWixhQUFPLGtCQUFrQixDQUFDO0tBQzNCOzs7V0FFUyxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVPLG9CQUFHO0FBQ1QsYUFBTyxDQUNMO0FBQ0UsWUFBSSxFQUFFLE1BQU07QUFDWixZQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCx1QkFBZSxFQUFFLDRCQUE0QjtBQUM3QyxnQkFBUSxFQUFFO2lCQUFNLEtBQUssQ0FBQyxRQUFRLEVBQUU7U0FBQTtBQUNoQyxpQkFBUyxFQUFFLG1CQUFDLE9BQU87aUJBQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7U0FBQTtPQUNqRCxFQUNEO0FBQ0UsWUFBSSxFQUFFLE1BQU07QUFDWixZQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDWCx1QkFBZSxFQUFFLHlCQUF5QjtBQUMxQyxnQkFBUSxFQUFFO2lCQUFNLEtBQUssQ0FBQyxRQUFRLEVBQUU7U0FBQTtBQUNoQyxpQkFBUyxFQUFFLG1CQUFDLE9BQU87aUJBQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7U0FBQTtPQUNqRCxDQUNGLENBQUM7S0FDSDs7O1NBMUJHLE9BQU87OztBQTZCYixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFFLG9CQUFNLEVBQUU7QUFDbEIsZ0JBQWMsRUFBRTtXQUFNLE9BQU87R0FBQTtBQUM3QixPQUFLLEVBQUUsS0FBSztDQUNiLENBQUMiLCJmaWxlIjoiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2ZpeHR1cmUvYXRvbS1idWlsZC1ob29rcy1kdW1teS1wYWNrYWdlL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY29uc3QgaG9va3MgPSB7XG4gIHByZUJ1aWxkOiAoKSA9PiB7fSxcbiAgcG9zdEJ1aWxkOiAoKSA9PiB7fVxufTtcblxuY2xhc3MgQnVpbGRlciB7XG4gIGdldE5pY2VOYW1lKCkge1xuICAgIHJldHVybiAnQnVpbGQgd2l0aCBob29rcyc7XG4gIH1cblxuICBpc0VsaWdpYmxlKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgc2V0dGluZ3MoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgZXhlYzogJ2V4aXQnLFxuICAgICAgICBhcmdzOiBbJzAnXSxcbiAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnYnVpbGQ6aG9vay10ZXN0OnN1Y2NlZWRpbmcnLFxuICAgICAgICBwcmVCdWlsZDogKCkgPT4gaG9va3MucHJlQnVpbGQoKSxcbiAgICAgICAgcG9zdEJ1aWxkOiAoc3VjY2VzcykgPT4gaG9va3MucG9zdEJ1aWxkKHN1Y2Nlc3MpXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBleGVjOiAnZXhpdCcsXG4gICAgICAgIGFyZ3M6IFsnMSddLFxuICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdidWlsZDpob29rLXRlc3Q6ZmFpbGluZycsXG4gICAgICAgIHByZUJ1aWxkOiAoKSA9PiBob29rcy5wcmVCdWlsZCgpLFxuICAgICAgICBwb3N0QnVpbGQ6IChzdWNjZXNzKSA9PiBob29rcy5wb3N0QnVpbGQoc3VjY2VzcylcbiAgICAgIH1cbiAgICBdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZTogKCkgPT4ge30sXG4gIHByb3ZpZGVCdWlsZGVyOiAoKSA9PiBCdWlsZGVyLFxuICBob29rczogaG9va3Ncbn07XG4iXX0=