Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _validate = require('./validate');

var Validate = _interopRequireWildcard(_validate);

var _helpers = require('./helpers');

var IndieDelegate = (function () {
  function IndieDelegate(indie, version) {
    _classCallCheck(this, IndieDelegate);

    this.indie = indie;
    this.scope = 'project';
    this.version = version;
    this.emitter = new _atom.Emitter();
    this.messages = new Map();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  _createClass(IndieDelegate, [{
    key: 'getMessages',
    value: function getMessages() {
      return Array.from(this.messages.values()).reduce(function (toReturn, entry) {
        return toReturn.concat(entry);
      }, []);
    }
  }, {
    key: 'deleteMessages',
    value: function deleteMessages() {
      if (this.version === 1) {
        this.clearMessages();
      } else {
        throw new Error('Call to depreciated method deleteMessages(). Use clearMessages() insead');
      }
    }
  }, {
    key: 'clearMessages',
    value: function clearMessages() {
      if (!this.subscriptions.disposed) {
        this.emitter.emit('did-update', []);
        this.messages.clear();
      }
    }
  }, {
    key: 'setMessages',
    value: function setMessages(filePathOrMessages) {
      var messages = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      // Legacy support area
      if (this.version === 1) {
        if (!Array.isArray(filePathOrMessages)) {
          throw new Error('Parameter 1 to setMessages() must be Array');
        }
        this.setAllMessages(filePathOrMessages);
        return;
      }

      // v2 Support from here on
      if (typeof filePathOrMessages !== 'string' || !Array.isArray(messages)) {
        throw new Error('Invalid Parameters to setMessages()');
      }
      var filePath = filePathOrMessages;
      if (this.subscriptions.disposed || !Validate.messages(this.name, messages)) {
        return;
      }
      messages.forEach(function (message) {
        if (message.location.file !== filePath) {
          console.debug('[Linter-UI-Default] Expected File', filePath, 'Message', message);
          throw new Error('message.location.file does not match the given filePath');
        }
      });

      (0, _helpers.normalizeMessages)(this.name, messages);
      this.messages.set(filePath, messages);
      this.emitter.emit('did-update', this.getMessages());
    }
  }, {
    key: 'setAllMessages',
    value: function setAllMessages(messages) {
      if (this.subscriptions.disposed) {
        return;
      }

      if (this.version === 1) {
        if (!Validate.messagesLegacy(this.name, messages)) return;
        (0, _helpers.normalizeMessagesLegacy)(this.name, messages);
      } else {
        if (!Validate.messages(this.name, messages)) return;
        (0, _helpers.normalizeMessages)(this.name, messages);
      }

      this.messages.clear();
      for (var i = 0, _length = messages.length; i < _length; ++i) {
        var message = messages[i];
        var filePath = message.version === 1 ? message.filePath : message.location.file;
        var fileMessages = this.messages.get(filePath);
        if (!fileMessages) {
          this.messages.set(filePath, fileMessages = []);
        }
        fileMessages.push(message);
      }
      this.emitter.emit('did-update', this.getMessages());
    }
  }, {
    key: 'onDidUpdate',
    value: function onDidUpdate(callback) {
      return this.emitter.on('did-update', callback);
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
      this.messages.clear();
    }
  }, {
    key: 'name',
    get: function get() {
      return this.indie.name;
    }
  }]);

  return IndieDelegate;
})();

exports['default'] = IndieDelegate;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9pbmRpZS1kZWxlZ2F0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUU2QyxNQUFNOzt3QkFHekIsWUFBWTs7SUFBMUIsUUFBUTs7dUJBQ3VDLFdBQVc7O0lBR2pELGFBQWE7QUFRckIsV0FSUSxhQUFhLENBUXBCLEtBQVksRUFBRSxPQUFjLEVBQUU7MEJBUnZCLGFBQWE7O0FBUzlCLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDekIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDOztlQWpCa0IsYUFBYTs7V0FxQnJCLHVCQUFtQztBQUM1QyxhQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFTLFFBQVEsRUFBRSxLQUFLLEVBQUU7QUFDekUsZUFBTyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzlCLEVBQUUsRUFBRSxDQUFDLENBQUE7S0FDUDs7O1dBQ2EsMEJBQVM7QUFDckIsVUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUN0QixZQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7T0FDckIsTUFBTTtBQUNMLGNBQU0sSUFBSSxLQUFLLENBQUMseUVBQXlFLENBQUMsQ0FBQTtPQUMzRjtLQUNGOzs7V0FDWSx5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SSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUMsWUFBSSxDQUFDLFlBQVksRUFBRTtBQUNqQixjQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFBO1NBQy9DO0FBQ0Qsb0JBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7T0FDM0I7QUFDRCxVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7S0FDcEQ7OztXQUNVLHFCQUFDLFFBQWtCLEVBQWM7QUFDMUMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDL0M7OztXQUNXLHNCQUFDLFFBQWtCLEVBQWM7QUFDM0MsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEQ7OztXQUNNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFBO0tBQ3RCOzs7U0FyRk8sZUFBVztBQUNqQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFBO0tBQ3ZCOzs7U0FwQmtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9pbmRpZS1kZWxlZ2F0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0ICogYXMgVmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZSdcbmltcG9ydCB7IG5vcm1hbGl6ZU1lc3NhZ2VzLCBub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgSW5kaWUsIE1lc3NhZ2UsIE1lc3NhZ2VMZWdhY3kgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmRpZURlbGVnYXRlIHtcbiAgaW5kaWU6IEluZGllO1xuICBzY29wZTogJ3Byb2plY3QnO1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICB2ZXJzaW9uOiAxIHwgMlxuICBtZXNzYWdlczogTWFwPD9zdHJpbmcsIEFycmF5PE1lc3NhZ2UgfCBNZXNzYWdlTGVnYWN5Pj47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoaW5kaWU6IEluZGllLCB2ZXJzaW9uOiAxIHwgMikge1xuICAgIHRoaXMuaW5kaWUgPSBpbmRpZVxuICAgIHRoaXMuc2NvcGUgPSAncHJvamVjdCdcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubWVzc2FnZXMgPSBuZXcgTWFwKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgfVxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmluZGllLm5hbWVcbiAgfVxuICBnZXRNZXNzYWdlcygpOiBBcnJheTxNZXNzYWdlIHwgTWVzc2FnZUxlZ2FjeT4ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMubWVzc2FnZXMudmFsdWVzKCkpLnJlZHVjZShmdW5jdGlvbih0b1JldHVybiwgZW50cnkpIHtcbiAgICAgIHJldHVybiB0b1JldHVybi5jb25jYXQoZW50cnkpXG4gICAgfSwgW10pXG4gIH1cbiAgZGVsZXRlTWVzc2FnZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudmVyc2lvbiA9PT0gMSkge1xuICAgICAgdGhpcy5jbGVhck1lc3NhZ2VzKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYWxsIHRvIGRlcHJlY2lhdGVkIG1ldGhvZCBkZWxldGVNZXNzYWdlcygpLiBVc2UgY2xlYXJNZXNzYWdlcygpIGluc2VhZCcpXG4gICAgfVxuICB9XG4gIGNsZWFyTWVzc2FnZXMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZWQpIHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlJywgW10pXG4gICAgICB0aGlzLm1lc3NhZ2VzLmNsZWFyKClcbiAgICB9XG4gIH1cbiAgc2V0TWVzc2FnZXMoZmlsZVBhdGhPck1lc3NhZ2VzOiBzdHJpbmcgfCBBcnJheTxPYmplY3Q+LCBtZXNzYWdlczogP0FycmF5PE9iamVjdD4gPSBudWxsKTogdm9pZCB7XG4gICAgLy8gTGVnYWN5IHN1cHBvcnQgYXJlYVxuICAgIGlmICh0aGlzLnZlcnNpb24gPT09IDEpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShmaWxlUGF0aE9yTWVzc2FnZXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGFyYW1ldGVyIDEgdG8gc2V0TWVzc2FnZXMoKSBtdXN0IGJlIEFycmF5JylcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0QWxsTWVzc2FnZXMoZmlsZVBhdGhPck1lc3NhZ2VzKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gdjIgU3VwcG9ydCBmcm9tIGhlcmUgb25cbiAgICBpZiAodHlwZW9mIGZpbGVQYXRoT3JNZXNzYWdlcyAhPT0gJ3N0cmluZycgfHwgIUFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgUGFyYW1ldGVycyB0byBzZXRNZXNzYWdlcygpJylcbiAgICB9XG4gICAgY29uc3QgZmlsZVBhdGggPSBmaWxlUGF0aE9yTWVzc2FnZXNcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2VkIHx8ICFWYWxpZGF0ZS5tZXNzYWdlcyh0aGlzLm5hbWUsIG1lc3NhZ2VzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgaWYgKG1lc3NhZ2UubG9jYXRpb24uZmlsZSAhPT0gZmlsZVBhdGgpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnW0xpbnRlci1VSS1EZWZhdWx0XSBFeHBlY3RlZCBGaWxlJywgZmlsZVBhdGgsICdNZXNzYWdlJywgbWVzc2FnZSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtZXNzYWdlLmxvY2F0aW9uLmZpbGUgZG9lcyBub3QgbWF0Y2ggdGhlIGdpdmVuIGZpbGVQYXRoJylcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgbm9ybWFsaXplTWVzc2FnZXModGhpcy5uYW1lLCBtZXNzYWdlcylcbiAgICB0aGlzLm1lc3NhZ2VzLnNldChmaWxlUGF0aCwgbWVzc2FnZXMpXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUnLCB0aGlzLmdldE1lc3NhZ2VzKCkpXG4gIH1cbiAgc2V0QWxsTWVzc2FnZXMobWVzc2FnZXM6IEFycmF5PE9iamVjdD4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2VkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy52ZXJzaW9uID09PSAxKSB7XG4gICAgICBpZiAoIVZhbGlkYXRlLm1lc3NhZ2VzTGVnYWN5KHRoaXMubmFtZSwgbWVzc2FnZXMpKSByZXR1cm5cbiAgICAgIG5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KHRoaXMubmFtZSwgbWVzc2FnZXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghVmFsaWRhdGUubWVzc2FnZXModGhpcy5uYW1lLCBtZXNzYWdlcykpIHJldHVyblxuICAgICAgbm9ybWFsaXplTWVzc2FnZXModGhpcy5uYW1lLCBtZXNzYWdlcylcbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2VzLmNsZWFyKClcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gbWVzc2FnZXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE1lc3NhZ2UgfCBNZXNzYWdlTGVnYWN5ID0gbWVzc2FnZXNbaV1cbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gbWVzc2FnZS52ZXJzaW9uID09PSAxID8gbWVzc2FnZS5maWxlUGF0aCA6IG1lc3NhZ2UubG9jYXRpb24uZmlsZVxuICAgICAgbGV0IGZpbGVNZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuZ2V0KGZpbGVQYXRoKVxuICAgICAgaWYgKCFmaWxlTWVzc2FnZXMpIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlcy5zZXQoZmlsZVBhdGgsIGZpbGVNZXNzYWdlcyA9IFtdKVxuICAgICAgfVxuICAgICAgZmlsZU1lc3NhZ2VzLnB1c2gobWVzc2FnZSlcbiAgICB9XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUnLCB0aGlzLmdldE1lc3NhZ2VzKCkpXG4gIH1cbiAgb25EaWRVcGRhdGUoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXVwZGF0ZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5tZXNzYWdlcy5jbGVhcigpXG4gIH1cbn1cbiJdfQ==