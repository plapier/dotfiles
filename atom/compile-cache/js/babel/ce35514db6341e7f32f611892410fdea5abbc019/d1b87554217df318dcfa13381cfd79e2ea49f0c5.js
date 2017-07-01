var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _atom = require('atom');

var ToggleProviders = (function () {
  function ToggleProviders(action, providers) {
    var _this = this;

    _classCallCheck(this, ToggleProviders);

    this.action = action;
    this.emitter = new _atom.Emitter();
    this.providers = providers;
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter.disabledProviders', function (disabledProviders) {
      _this.disabledProviders = disabledProviders;
    }));
  }

  _createClass(ToggleProviders, [{
    key: 'getItems',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      if (this.action === 'disable') {
        return this.providers.filter(function (name) {
          return !_this2.disabledProviders.includes(name);
        });
      }
      return this.disabledProviders;
    })
  }, {
    key: 'process',
    value: _asyncToGenerator(function* (name) {
      if (this.action === 'disable') {
        this.disabledProviders.push(name);
        this.emitter.emit('did-disable', name);
      } else {
        var index = this.disabledProviders.indexOf(name);
        if (index !== -1) {
          this.disabledProviders.splice(index, 1);
        }
      }
      atom.config.set('linter.disabledProviders', this.disabledProviders);
    })
  }, {
    key: 'show',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      var selectListView = new _atomSelectList2['default']({
        items: yield this.getItems(),
        emptyMessage: 'No matches found',
        filterKeyForItem: function filterKeyForItem(item) {
          return item;
        },
        elementForItem: function elementForItem(item) {
          var li = document.createElement('li');
          li.textContent = item;
          return li;
        },
        didConfirmSelection: function didConfirmSelection(item) {
          _this3.process(item)['catch'](function (e) {
            return console.error('[Linter] Unable to process toggle:', e);
          }).then(function () {
            return _this3.dispose();
          });
        },
        didCancelSelection: function didCancelSelection() {
          _this3.dispose();
        }
      });
      var panel = atom.workspace.addModalPanel({ item: selectListView });

      selectListView.focus();
      this.subscriptions.add(new _atom.Disposable(function () {
        panel.destroy();
      }));
    })
  }, {
    key: 'onDidDispose',
    value: function onDidDispose(callback) {
      return this.emitter.on('did-dispose', callback);
    }
  }, {
    key: 'onDidDisable',
    value: function onDidDisable(callback) {
      return this.emitter.on('did-disable', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-dispose');
      this.subscriptions.dispose();
    }
  }]);

  return ToggleProviders;
})();

module.exports = ToggleProviders;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi90b2dnbGUtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs4QkFFMkIsa0JBQWtCOzs7O29CQUNZLE1BQU07O0lBSXpELGVBQWU7QUFPUixXQVBQLGVBQWUsQ0FPUCxNQUFvQixFQUFFLFNBQXdCLEVBQUU7OzswQkFQeEQsZUFBZTs7QUFRakIsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxVQUFDLGlCQUFpQixFQUFLO0FBQzVGLFlBQUssaUJBQWlCLEdBQUcsaUJBQWlCLENBQUE7S0FDM0MsQ0FBQyxDQUFDLENBQUE7R0FDSjs7ZUFqQkcsZUFBZTs7NkJBa0JMLGFBQTJCOzs7QUFDdkMsVUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUM3QixlQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtpQkFBSSxDQUFDLE9BQUssaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztTQUFBLENBQUMsQ0FBQTtPQUM3RTtBQUNELGFBQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFBO0tBQzlCOzs7NkJBQ1ksV0FBQyxJQUFZLEVBQWlCO0FBQ3pDLFVBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDN0IsWUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNqQyxZQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDdkMsTUFBTTtBQUNMLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDbEQsWUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDaEIsY0FBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FDeEM7T0FDRjtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0tBQ3BFOzs7NkJBQ1MsYUFBRzs7O0FBQ1gsVUFBTSxjQUFjLEdBQUcsZ0NBQW1CO0FBQ3hDLGFBQUssRUFBRSxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDNUIsb0JBQVksRUFBRSxrQkFBa0I7QUFDaEMsd0JBQWdCLEVBQUUsMEJBQUEsSUFBSTtpQkFBSSxJQUFJO1NBQUE7QUFDOUIsc0JBQWMsRUFBRSx3QkFBQyxJQUFJLEVBQUs7QUFDeEIsY0FBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN2QyxZQUFFLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtBQUNyQixpQkFBTyxFQUFFLENBQUE7U0FDVjtBQUNELDJCQUFtQixFQUFFLDZCQUFDLElBQUksRUFBSztBQUM3QixpQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQU0sQ0FBQyxVQUFBLENBQUM7bUJBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDLENBQUM7V0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDO21CQUFNLE9BQUssT0FBTyxFQUFFO1dBQUEsQ0FBQyxDQUFBO1NBQ2pIO0FBQ0QsMEJBQWtCLEVBQUUsOEJBQU07QUFDeEIsaUJBQUssT0FBTyxFQUFFLENBQUE7U0FDZjtPQUNGLENBQUMsQ0FBQTtBQUNGLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUE7O0FBRXBFLG9CQUFjLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBVztBQUMvQyxhQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDaEIsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1dBQ1csc0JBQUMsUUFBcUIsRUFBYztBQUM5QyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNoRDs7O1dBQ1csc0JBQUMsUUFBaUMsRUFBYztBQUMxRCxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNoRDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNoQyxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0FyRUcsZUFBZTs7O0FBd0VyQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQSIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvdG9nZ2xlLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgZnJvbSAnYXRvbS1zZWxlY3QtbGlzdCdcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIsIERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG50eXBlIFRvZ2dsZUFjdGlvbiA9ICdlbmFibGUnIHwgJ2Rpc2FibGUnXG5cbmNsYXNzIFRvZ2dsZVByb3ZpZGVycyB7XG4gIGFjdGlvbjogVG9nZ2xlQWN0aW9uO1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBwcm92aWRlcnM6IEFycmF5PHN0cmluZz47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGRpc2FibGVkUHJvdmlkZXJzOiBBcnJheTxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKGFjdGlvbjogVG9nZ2xlQWN0aW9uLCBwcm92aWRlcnM6IEFycmF5PHN0cmluZz4pIHtcbiAgICB0aGlzLmFjdGlvbiA9IGFjdGlvblxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLnByb3ZpZGVycyA9IHByb3ZpZGVyc1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmRpc2FibGVkUHJvdmlkZXJzJywgKGRpc2FibGVkUHJvdmlkZXJzKSA9PiB7XG4gICAgICB0aGlzLmRpc2FibGVkUHJvdmlkZXJzID0gZGlzYWJsZWRQcm92aWRlcnNcbiAgICB9KSlcbiAgfVxuICBhc3luYyBnZXRJdGVtcygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgICBpZiAodGhpcy5hY3Rpb24gPT09ICdkaXNhYmxlJykge1xuICAgICAgcmV0dXJuIHRoaXMucHJvdmlkZXJzLmZpbHRlcihuYW1lID0+ICF0aGlzLmRpc2FibGVkUHJvdmlkZXJzLmluY2x1ZGVzKG5hbWUpKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZFByb3ZpZGVyc1xuICB9XG4gIGFzeW5jIHByb2Nlc3MobmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuYWN0aW9uID09PSAnZGlzYWJsZScpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWRQcm92aWRlcnMucHVzaChuYW1lKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kaXNhYmxlJywgbmFtZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmRpc2FibGVkUHJvdmlkZXJzLmluZGV4T2YobmFtZSlcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlZFByb3ZpZGVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG4gICAgfVxuICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLmRpc2FibGVkUHJvdmlkZXJzJywgdGhpcy5kaXNhYmxlZFByb3ZpZGVycylcbiAgfVxuICBhc3luYyBzaG93KCkge1xuICAgIGNvbnN0IHNlbGVjdExpc3RWaWV3ID0gbmV3IFNlbGVjdExpc3RWaWV3KHtcbiAgICAgIGl0ZW1zOiBhd2FpdCB0aGlzLmdldEl0ZW1zKCksXG4gICAgICBlbXB0eU1lc3NhZ2U6ICdObyBtYXRjaGVzIGZvdW5kJyxcbiAgICAgIGZpbHRlcktleUZvckl0ZW06IGl0ZW0gPT4gaXRlbSxcbiAgICAgIGVsZW1lbnRGb3JJdGVtOiAoaXRlbSkgPT4ge1xuICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgbGkudGV4dENvbnRlbnQgPSBpdGVtXG4gICAgICAgIHJldHVybiBsaVxuICAgICAgfSxcbiAgICAgIGRpZENvbmZpcm1TZWxlY3Rpb246IChpdGVtKSA9PiB7XG4gICAgICAgIHRoaXMucHJvY2VzcyhpdGVtKS5jYXRjaChlID0+IGNvbnNvbGUuZXJyb3IoJ1tMaW50ZXJdIFVuYWJsZSB0byBwcm9jZXNzIHRvZ2dsZTonLCBlKSkudGhlbigoKSA9PiB0aGlzLmRpc3Bvc2UoKSlcbiAgICAgIH0sXG4gICAgICBkaWRDYW5jZWxTZWxlY3Rpb246ICgpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwb3NlKClcbiAgICAgIH0sXG4gICAgfSlcbiAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiBzZWxlY3RMaXN0VmlldyB9KVxuXG4gICAgc2VsZWN0TGlzdFZpZXcuZm9jdXMoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICBwYW5lbC5kZXN0cm95KClcbiAgICB9KSlcbiAgfVxuICBvbkRpZERpc3Bvc2UoY2FsbGJhY2s6ICgoKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRpc3Bvc2UnLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZERpc2FibGUoY2FsbGJhY2s6ICgobmFtZTogc3RyaW5nKSA9PiBhbnkpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRpc2FibGUnLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGlzcG9zZScpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVG9nZ2xlUHJvdmlkZXJzXG4iXX0=