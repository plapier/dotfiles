function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libMessageRegistry = require('../lib/message-registry');

var _libMessageRegistry2 = _interopRequireDefault(_libMessageRegistry);

var _common = require('./common');

describe('Message Registry', function () {
  var messageRegistry = undefined;
  beforeEach(function () {
    messageRegistry = new _libMessageRegistry2['default']();
    messageRegistry.debouncedUpdate = jasmine.createSpy('debouncedUpdate');
  });
  afterEach(function () {
    messageRegistry.dispose();
  });

  describe('::set', function () {
    it('stores results using both buffer and linter', function () {
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();
      var messageThird = (0, _common.getMessageLegacy)();
      var linter = { name: 'any' };
      var buffer = {};
      var info = undefined;

      messageRegistry.set({ linter: linter, buffer: null, messages: [messageFirst] });
      expect(messageRegistry.debouncedUpdate.calls.length).toBe(1);
      expect(messageRegistry.messagesMap.size).toBe(1);
      info = Array.from(messageRegistry.messagesMap)[0];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(null);
      expect(info.oldMessages.length).toBe(0);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageFirst);

      messageRegistry.set({ linter: linter, buffer: null, messages: [messageFirst] });
      expect(messageRegistry.debouncedUpdate.calls.length).toBe(2);
      expect(messageRegistry.messagesMap.size).toBe(1);
      info = Array.from(messageRegistry.messagesMap)[0];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(null);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageFirst);

      messageRegistry.set({ linter: linter, buffer: buffer, messages: [messageThird] });
      expect(messageRegistry.debouncedUpdate.calls.length).toBe(3);
      expect(messageRegistry.messagesMap.size).toBe(2);
      info = Array.from(messageRegistry.messagesMap)[0];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(null);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageFirst);

      info = Array.from(messageRegistry.messagesMap)[1];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(buffer);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageThird);

      messageRegistry.set({ linter: linter, buffer: null, messages: [messageFirst, messageSecond] });
      expect(messageRegistry.debouncedUpdate.calls.length).toBe(4);
      expect(messageRegistry.messagesMap.size).toBe(2);
      info = Array.from(messageRegistry.messagesMap)[0];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(null);
      expect(info.messages.length).toBe(2);
      expect(info.messages[0]).toBe(messageFirst);
      expect(info.messages[1]).toBe(messageSecond);

      info = Array.from(messageRegistry.messagesMap)[1];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(buffer);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageThird);
    });
  });

  describe('updates (::update & ::onDidUpdateMessages)', function () {
    it('notifies on changes', function () {
      var called = 0;
      var linter = { name: 'any' };
      var message = (0, _common.getMessageLegacy)();
      messageRegistry.onDidUpdateMessages(function (_ref) {
        var added = _ref.added;
        var removed = _ref.removed;
        var messages = _ref.messages;

        called++;
        expect(added.length).toBe(1);
        expect(removed.length).toBe(0);
        expect(messages.length).toBe(1);
        expect(added).toEqual(messages);
        expect(added[0]).toBe(message);
      });
      messageRegistry.set({ linter: linter, buffer: null, messages: [message] });
      messageRegistry.update();
      expect(called).toBe(1);
    });
    it('notifies properly for as many linters as you want', function () {
      var buffer = {};
      var linterFirst = { name: 'any' };
      var linterSecond = {};
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();
      var messageThird = (0, _common.getMessageLegacy)();
      var called = 0;

      messageRegistry.onDidUpdateMessages(function (_ref2) {
        var added = _ref2.added;
        var removed = _ref2.removed;
        var messages = _ref2.messages;

        called++;

        if (called === 1) {
          expect(added.length).toBe(1);
          expect(removed.length).toBe(0);
          expect(added).toEqual(messages);
          expect(added[0]).toEqual(messageFirst);
        } else if (called === 2) {
          expect(added.length).toBe(2);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(3);
          expect(messages[0]).toBe(messageFirst);
          expect(messages[1]).toBe(messageSecond);
          expect(messages[2]).toBe(messageThird);
        } else if (called === 3) {
          expect(added.length).toBe(0);
          expect(removed.length).toBe(1);
          expect(removed[0]).toBe(messageFirst);
          expect(messages.length).toBe(2);
          expect(messages[0]).toBe(messageSecond);
          expect(messages[1]).toBe(messageThird);
        } else if (called === 4) {
          expect(added.length).toBe(0);
          expect(removed.length).toBe(2);
          expect(messages.length).toBe(0);
          expect(removed[0]).toBe(messageSecond);
          expect(removed[1]).toBe(messageThird);
        } else {
          throw new Error('Unnecessary update call');
        }
      });

      messageRegistry.set({ buffer: buffer, linter: linterFirst, messages: [messageFirst] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(1);
      messageRegistry.set({ buffer: buffer, linter: linterSecond, messages: [messageSecond, messageThird] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(2);
      messageRegistry.set({ buffer: buffer, linter: linterFirst, messages: [] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(3);
      messageRegistry.set({ buffer: buffer, linter: linterSecond, messages: [] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(4);
    });

    it('sets key, severity on messages', function () {
      var linter = { name: 'any' };
      var buffer = {};
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();
      var messageThird = (0, _common.getMessageLegacy)();

      var called = 0;

      messageRegistry.onDidUpdateMessages(function (_ref3) {
        var added = _ref3.added;
        var removed = _ref3.removed;
        var messages = _ref3.messages;

        called++;
        if (called === 1) {
          // All messages are new
          expect(added.length).toBe(2);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(2);
          expect(added).toEqual(messages);
          expect(typeof messages[0].key).toBe('string');
          expect(typeof messages[1].key).toBe('string');
          expect(typeof messages[0].severity).toBe('string');
          expect(typeof messages[1].severity).toBe('string');
        } else {
          // One removed, one added
          expect(added.length).toBe(1);
          expect(removed.length).toBe(1);
          expect(messages.length).toBe(2);
          expect(messages.indexOf(added[0])).not.toBe(-1);
          expect(typeof messages[0].key).toBe('string');
          expect(typeof messages[1].key).toBe('string');
          expect(typeof messages[0].severity).toBe('string');
          expect(typeof messages[1].severity).toBe('string');
        }
      });

      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst, messageSecond] });
      messageRegistry.update();
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst, messageThird] });
      messageRegistry.update();
      expect(called).toBe(2);
    });

    it('checks if an old message has updated, if so invalidates it properly', function () {
      var called = 0;
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = Object.assign({}, messageFirst);
      var linter = { name: 'any' };
      var buffer = {};

      messageRegistry.onDidUpdateMessages(function (_ref4) {
        var added = _ref4.added;
        var removed = _ref4.removed;
        var messages = _ref4.messages;

        called++;
        if (called === 1) {
          expect(messages.length).toBe(1);
          expect(removed.length).toBe(0);
          expect(added.length).toBe(1);
          expect(added[0]).toBe(messageFirst);
        } else {
          expect(messages.length).toBe(1);
          expect(removed.length).toBe(1);
          expect(added.length).toBe(1);
          expect(added[0]).toBe(messageSecond);
          expect(removed[0]).toBe(messageFirst);
        }
      });

      expect(called).toBe(0);
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst] });
      messageRegistry.update();
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageSecond] });
      messageRegistry.update();
      expect(called).toBe(1);
      messageFirst.text = 'Hellow';
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageSecond] });
      messageRegistry.update();
      expect(called).toBe(2);
    });

    it('sends the same object each time even in complicated scenarios', function () {
      var called = 0;
      var knownMessages = new Set();
      messageRegistry.onDidUpdateMessages(function (_ref5) {
        var added = _ref5.added;
        var removed = _ref5.removed;
        var messages = _ref5.messages;

        called++;
        for (var entry of added) {
          if (knownMessages.has(entry)) {
            throw new Error('Message already exists');
          } else knownMessages.add(entry);
        }
        for (var entry of removed) {
          if (knownMessages.has(entry)) {
            knownMessages['delete'](entry);
          } else throw new Error('Message does not exist');
        }
        if (messages.length !== knownMessages.size) {
          throw new Error('Size mismatch, registry is having hiccups');
        }
      });

      var linter = { name: 'any' };
      var buffer = {};
      var messageRealFirst = (0, _common.getMessageLegacy)();
      var messageDupeFirst = Object.assign({}, messageRealFirst);
      var messageRealSecond = (0, _common.getMessageLegacy)();
      var messageDupeSecond = Object.assign({}, messageRealSecond);

      expect(called).toBe(0);
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageRealFirst, messageRealSecond] });
      messageRegistry.update();
      expect(called).toBe(1);
      expect(knownMessages.size).toBe(2);
      messageRegistry.update();
      expect(called).toBe(1);
      expect(knownMessages.size).toBe(2);
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageRealFirst, messageRealSecond] });
      messageRegistry.update();
      expect(called).toBe(1);
      expect(knownMessages.size).toBe(2);
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageDupeFirst, messageDupeSecond] });
      messageRegistry.update();
      expect(called).toBe(1);
      expect(knownMessages.size).toBe(2);
      messageRegistry.deleteByLinter(linter);
      messageRegistry.update();
      expect(called).toBe(2);
      expect(knownMessages.size).toBe(0);
    });
    it('notices changes on last messages instead of relying on their keys and invaildates them', function () {
      var called = 0;

      var linter = { name: 'any' };
      var buffer = {};
      var messageA = (0, _common.getMessageLegacy)();
      var messageB = Object.assign({}, messageA);
      var messageC = Object.assign({}, messageA);

      messageRegistry.onDidUpdateMessages(function (_ref6) {
        var added = _ref6.added;
        var removed = _ref6.removed;
        var messages = _ref6.messages;

        called++;
        if (called === 1) {
          expect(added.length).toBe(1);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(1);
          expect(added).toEqual(messages);
          expect(added[0]).toBe(messageA);
        } else if (called === 2) {
          expect(added.length).toBe(1);
          expect(removed.length).toBe(1);
          expect(messages.length).toBe(1);
          expect(added).toEqual(messages);
          expect(added[0]).toBe(messageB);
          expect(removed[0]).toBe(messageA);
        } else {
          throw new Error('Should not have been triggered');
        }
      });
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageA] });
      messageRegistry.update();
      messageA.text = 'MURICAAA';
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageB] });
      messageRegistry.update();
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageC] });
      messageRegistry.update();
      expect(called).toBe(2);
    });
  });

  describe('::deleteByBuffer', function () {
    it('deletes the messages and sends them in an event', function () {
      var linter = { name: 'any' };
      var buffer = {};
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();

      var called = 0;

      messageRegistry.onDidUpdateMessages(function (_ref7) {
        var added = _ref7.added;
        var removed = _ref7.removed;
        var messages = _ref7.messages;

        called++;
        if (called === 1) {
          expect(added.length).toBe(2);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(2);
          expect(added).toEqual(messages);
          expect(added[0]).toBe(messageFirst);
          expect(added[1]).toBe(messageSecond);
        } else if (called === 2) {
          expect(added.length).toBe(0);
          expect(removed.length).toBe(2);
          expect(messages.length).toBe(0);
          expect(removed[0]).toBe(messageFirst);
          expect(removed[1]).toBe(messageSecond);
        } else {
          throw new Error('Unnecessary update call');
        }
      });
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst, messageSecond] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(1);
      messageRegistry.deleteByBuffer(buffer);
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(2);
    });
  });

  describe('::deleteByLinter', function () {
    it('deletes the messages and sends them in an event', function () {
      var linter = { name: 'any' };
      var buffer = {};
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();

      var called = 0;

      messageRegistry.onDidUpdateMessages(function (_ref8) {
        var added = _ref8.added;
        var removed = _ref8.removed;
        var messages = _ref8.messages;

        called++;
        if (called === 1) {
          expect(added.length).toBe(2);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(2);
          expect(added).toEqual(messages);
          expect(added[0]).toBe(messageFirst);
          expect(added[1]).toBe(messageSecond);
        } else if (called === 2) {
          expect(added.length).toBe(0);
          expect(removed.length).toBe(2);
          expect(messages.length).toBe(0);
          expect(removed[0]).toBe(messageFirst);
          expect(removed[1]).toBe(messageSecond);
        } else {
          throw new Error('Unnecessary update call');
        }
      });
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst, messageSecond] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(1);
      messageRegistry.deleteByLinter(linter);
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(2);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvbWVzc2FnZS1yZWdpc3RyeS1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O2tDQUU0Qix5QkFBeUI7Ozs7c0JBQ3BCLFVBQVU7O0FBRTNDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxZQUFXO0FBQ3RDLE1BQUksZUFBZSxZQUFBLENBQUE7QUFDbkIsWUFBVSxDQUFDLFlBQVc7QUFDcEIsbUJBQWUsR0FBRyxxQ0FBcUIsQ0FBQTtBQUN2QyxtQkFBZSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUE7R0FDdkUsQ0FBQyxDQUFBO0FBQ0YsV0FBUyxDQUFDLFlBQVc7QUFDbkIsbUJBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtHQUMxQixDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLE9BQU8sRUFBRSxZQUFXO0FBQzNCLE1BQUUsQ0FBQyw2Q0FBNkMsRUFBRSxZQUFXO0FBQzNELFVBQU0sWUFBWSxHQUFHLCtCQUFrQixDQUFBO0FBQ3ZDLFVBQU0sYUFBYSxHQUFHLCtCQUFrQixDQUFBO0FBQ3hDLFVBQU0sWUFBWSxHQUFHLCtCQUFrQixDQUFBO0FBQ3ZDLFVBQU0sTUFBYyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFBO0FBQ3RDLFVBQU0sTUFBYyxHQUFHLEVBQUUsQ0FBQTtBQUN6QixVQUFJLElBQUksWUFBQSxDQUFBOztBQUVSLHFCQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUN2RSxZQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVELFlBQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNoRCxVQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRWpELFlBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQy9CLFlBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2hDLFlBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlCLFlBQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN2QyxZQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDcEMsWUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRTNDLHFCQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUN2RSxZQUFNLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVELFlBQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNoRCxVQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxD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LENBQUE7QUFDNUIsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlCLGdCQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMvQixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN0QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN2QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtTQUN2QyxNQUFNLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN2QixnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDNUIsZ0JBQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlCLGdCQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3JDLGdCQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMvQixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN2QyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtTQUN2QyxNQUFNLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN2QixnQkFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FB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SSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3JDLGdCQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1NBQ3ZDLE1BQU07QUFDTCxnQkFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO1NBQzNDO09BQ0YsQ0FBQyxDQUFBO0FBQ0YscUJBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNoRixxQkFBZSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ3hCLHFCQUFlLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDeEIscUJBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN4QixxQkFBZSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ3hCLFlBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEIscUJBQWUsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDdEMscUJBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN4QixxQkFBZSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ3hCLHFCQUFlLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDeEIscUJBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN4QixZQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3ZCLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL21lc3NhZ2UtcmVnaXN0cnktc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBNZXNzYWdlUmVnaXN0cnkgZnJvbSAnLi4vbGliL21lc3NhZ2UtcmVnaXN0cnknXG5pbXBvcnQgeyBnZXRNZXNzYWdlTGVnYWN5IH0gZnJvbSAnLi9jb21tb24nXG5cbmRlc2NyaWJlKCdNZXNzYWdlIFJlZ2lzdHJ5JywgZnVuY3Rpb24oKSB7XG4gIGxldCBtZXNzYWdlUmVnaXN0cnlcbiAgYmVmb3JlRWFjaChmdW5jdGlvbigpIHtcbiAgICBtZXNzYWdlUmVnaXN0cnkgPSBuZXcgTWVzc2FnZVJlZ2lzdHJ5KClcbiAgICBtZXNzYWdlUmVnaXN0cnkuZGVib3VuY2VkVXBkYXRlID0gamFzbWluZS5jcmVhdGVTcHkoJ2RlYm91bmNlZFVwZGF0ZScpXG4gIH0pXG4gIGFmdGVyRWFjaChmdW5jdGlvbigpIHtcbiAgICBtZXNzYWdlUmVnaXN0cnkuZGlzcG9zZSgpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJzo6c2V0JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ3N0b3JlcyByZXN1bHRzIHVzaW5nIGJvdGggYnVmZmVyIGFuZCBsaW50ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VGaXJzdCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZVNlY29uZCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZVRoaXJkID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBsaW50ZXI6IE9iamVjdCA9IHsgbmFtZTogJ2FueScgfVxuICAgICAgY29uc3QgYnVmZmVyOiBPYmplY3QgPSB7fVxuICAgICAgbGV0IGluZm9cblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGxpbnRlciwgYnVmZmVyOiBudWxsLCBtZXNzYWdlczogW21lc3NhZ2VGaXJzdF0gfSlcbiAgICAgIGV4cGVjdChtZXNzYWdlUmVnaXN0cnkuZGVib3VuY2VkVXBkYXRlLmNhbGxzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VSZWdpc3RyeS5tZXNzYWdlc01hcC5zaXplKS50b0JlKDEpXG4gICAgICBpbmZvID0gQXJyYXkuZnJvbShtZXNzYWdlUmVnaXN0cnkubWVzc2FnZXNNYXApWzBdXG5cbiAgICAgIGV4cGVjdChpbmZvLmNoYW5nZWQpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpbmZvLmxpbnRlcikudG9CZShsaW50ZXIpXG4gICAgICBleHBlY3QoaW5mby5idWZmZXIpLnRvQmUobnVsbClcbiAgICAgIGV4cGVjdChpbmZvLm9sZE1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuICAgICAgZXhwZWN0KGluZm8ubWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QoaW5mby5tZXNzYWdlc1swXSkudG9CZShtZXNzYWdlRmlyc3QpXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBsaW50ZXIsIGJ1ZmZlcjogbnVsbCwgbWVzc2FnZXM6IFttZXNzYWdlRmlyc3RdIH0pXG4gICAgICBleHBlY3QobWVzc2FnZVJlZ2lzdHJ5LmRlYm91bmNlZFVwZGF0ZS5jYWxscy5sZW5ndGgpLnRvQmUoMilcbiAgICAgIGV4cGVjdChtZXNzYWdlUmVnaXN0cnkubWVzc2FnZXNNYXAuc2l6ZSkudG9CZSgxKVxuICAgICAgaW5mbyA9IEFycmF5LmZyb20obWVzc2FnZVJlZ2lzdHJ5Lm1lc3NhZ2VzTWFwKVswXVxuXG4gICAgICBleHBlY3QoaW5mby5jaGFuZ2VkKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaW5mby5saW50ZXIpLnRvQmUobGludGVyKVxuICAgICAgZXhwZWN0KGluZm8uYnVmZmVyKS50b0JlKG51bGwpXG4gICAgICBleHBlY3QoaW5mby5tZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGxpbnRlciwgYnVmZmVyLCBtZXNzYWdlczogW21lc3NhZ2VUaGlyZF0gfSlcbiAgICAgIGV4cGVjdChtZXNzYWdlUmVnaXN0cnkuZGVib3VuY2VkVXBkYXRlLmNhbGxzLmxlbmd0aCkudG9CZSgzKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VSZWdpc3RyeS5tZXNzYWdlc01hcC5zaXplKS50b0JlKDIpXG4gICAgICBpbmZvID0gQXJyYXkuZnJvbShtZXNzYWdlUmVnaXN0cnkubWVzc2FnZXNNYXApWzBdXG5cbiAgICAgIGV4cGVjdChpbmZvLmNoYW5nZWQpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpbmZvLmxpbnRlcikudG9CZShsaW50ZXIpXG4gICAgICBleHBlY3QoaW5mby5idWZmZXIpLnRvQmUobnVsbClcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KGluZm8ubWVzc2FnZXNbMF0pLnRvQmUobWVzc2FnZUZpcnN0KVxuXG4gICAgICBpbmZvID0gQXJyYXkuZnJvbShtZXNzYWdlUmVnaXN0cnkubWVzc2FnZXNNYXApWzFdXG5cbiAgICAgIGV4cGVjdChpbmZvLmNoYW5nZWQpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpbmZvLmxpbnRlcikudG9CZShsaW50ZXIpXG4gICAgICBleHBlY3QoaW5mby5idWZmZXIpLnRvQmUoYnVmZmVyKVxuICAgICAgZXhwZWN0KGluZm8ubWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QoaW5mby5tZXNzYWdlc1swXSkudG9CZShtZXNzYWdlVGhpcmQpXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBsaW50ZXIsIGJ1ZmZlcjogbnVsbCwgbWVzc2FnZXM6IFttZXNzYWdlRmlyc3QsIG1lc3NhZ2VTZWNvbmRdIH0pXG4gICAgICBleHBlY3QobWVzc2FnZVJlZ2lzdHJ5LmRlYm91bmNlZFVwZGF0ZS5jYWxscy5sZW5ndGgpLnRvQmUoNClcbiAgICAgIGV4cGVjdChtZXNzYWdlUmVnaXN0cnkubWVzc2FnZXNNYXAuc2l6ZSkudG9CZSgyKVxuICAgICAgaW5mbyA9IEFycmF5LmZyb20obWVzc2FnZVJlZ2lzdHJ5Lm1lc3NhZ2VzTWFwKVswXVxuXG4gICAgICBleHBlY3QoaW5mby5jaGFuZ2VkKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaW5mby5saW50ZXIpLnRvQmUobGludGVyKVxuICAgICAgZXhwZWN0KGluZm8uYnVmZmVyKS50b0JlKG51bGwpXG4gICAgICBleHBlY3QoaW5mby5tZXNzYWdlcy5sZW5ndGgpLnRvQmUoMilcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzWzFdKS50b0JlKG1lc3NhZ2VTZWNvbmQpXG5cbiAgICAgIGluZm8gPSBBcnJheS5mcm9tKG1lc3NhZ2VSZWdpc3RyeS5tZXNzYWdlc01hcClbMV1cblxuICAgICAgZXhwZWN0KGluZm8uY2hhbmdlZCkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGluZm8ubGludGVyKS50b0JlKGxpbnRlcilcbiAgICAgIGV4cGVjdChpbmZvLmJ1ZmZlcikudG9CZShidWZmZXIpXG4gICAgICBleHBlY3QoaW5mby5tZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzWzBdKS50b0JlKG1lc3NhZ2VUaGlyZClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd1cGRhdGVzICg6OnVwZGF0ZSAmIDo6b25EaWRVcGRhdGVNZXNzYWdlcyknLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnbm90aWZpZXMgb24gY2hhbmdlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGNhbGxlZCA9IDBcbiAgICAgIGNvbnN0IGxpbnRlcjogT2JqZWN0ID0geyBuYW1lOiAnYW55JyB9XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbih7IGFkZGVkLCByZW1vdmVkLCBtZXNzYWdlcyB9KSB7XG4gICAgICAgIGNhbGxlZCsrXG4gICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDApXG4gICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KGFkZGVkKS50b0VxdWFsKG1lc3NhZ2VzKVxuICAgICAgICBleHBlY3QoYWRkZWRbMF0pLnRvQmUobWVzc2FnZSlcbiAgICAgIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgbGludGVyLCBidWZmZXI6IG51bGwsIG1lc3NhZ2VzOiBbbWVzc2FnZV0gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ25vdGlmaWVzIHByb3Blcmx5IGZvciBhcyBtYW55IGxpbnRlcnMgYXMgeW91IHdhbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlcjogT2JqZWN0ID0ge31cbiAgICAgIGNvbnN0IGxpbnRlckZpcnN0OiBPYmplY3QgPSB7IG5hbWU6ICdhbnknIH1cbiAgICAgIGNvbnN0IGxpbnRlclNlY29uZDogT2JqZWN0ID0ge31cbiAgICAgIGNvbnN0IG1lc3NhZ2VGaXJzdCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZVNlY29uZCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZVRoaXJkID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBsZXQgY2FsbGVkID0gMFxuXG4gICAgICBtZXNzYWdlUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbih7IGFkZGVkLCByZW1vdmVkLCBtZXNzYWdlcyB9KSB7XG4gICAgICAgIGNhbGxlZCsrXG5cbiAgICAgICAgaWYgKGNhbGxlZCA9PT0gMSkge1xuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QoYWRkZWQpLnRvRXF1YWwobWVzc2FnZXMpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkWzBdKS50b0VxdWFsKG1lc3NhZ2VGaXJzdClcbiAgICAgICAgfSBlbHNlIGlmIChjYWxsZWQgPT09IDIpIHtcbiAgICAgICAgICBleHBlY3QoYWRkZWQubGVuZ3RoKS50b0JlKDIpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgzKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXSkudG9CZShtZXNzYWdlRmlyc3QpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzFdKS50b0JlKG1lc3NhZ2VTZWNvbmQpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzJdKS50b0JlKG1lc3NhZ2VUaGlyZClcbiAgICAgICAgfSBlbHNlIGlmIChjYWxsZWQgPT09IDMpIHtcbiAgICAgICAgICBleHBlY3QoYWRkZWQubGVuZ3RoKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWRbMF0pLnRvQmUobWVzc2FnZUZpcnN0KVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMF0pLnRvQmUobWVzc2FnZVNlY29uZClcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMV0pLnRvQmUobWVzc2FnZVRoaXJkKVxuICAgICAgICB9IGVsc2UgaWYgKGNhbGxlZCA9PT0gNCkge1xuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWRbMF0pLnRvQmUobWVzc2FnZVNlY29uZClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFsxXSkudG9CZShtZXNzYWdlVGhpcmQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbm5lY2Vzc2FyeSB1cGRhdGUgY2FsbCcpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlcjogbGludGVyRmlyc3QsIG1lc3NhZ2VzOiBbbWVzc2FnZUZpcnN0XSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDEpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXI6IGxpbnRlclNlY29uZCwgbWVzc2FnZXM6IFttZXNzYWdlU2Vjb25kLCBtZXNzYWdlVGhpcmRdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMilcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlcjogbGludGVyRmlyc3QsIG1lc3NhZ2VzOiBbXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDMpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXI6IGxpbnRlclNlY29uZCwgbWVzc2FnZXM6IFtdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoNClcbiAgICB9KVxuXG4gICAgaXQoJ3NldHMga2V5LCBzZXZlcml0eSBvbiBtZXNzYWdlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbGludGVyOiBPYmplY3QgPSB7IG5hbWU6ICdhbnknIH1cbiAgICAgIGNvbnN0IGJ1ZmZlcjogT2JqZWN0ID0ge31cbiAgICAgIGNvbnN0IG1lc3NhZ2VGaXJzdCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZVNlY29uZCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZVRoaXJkID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG5cbiAgICAgIGxldCBjYWxsZWQgPSAwXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzIH0pIHtcbiAgICAgICAgY2FsbGVkKytcbiAgICAgICAgaWYgKGNhbGxlZCA9PT0gMSkge1xuICAgICAgICAgIC8vIEFsbCBtZXNzYWdlcyBhcmUgbmV3XG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgICBleHBlY3QoYWRkZWQpLnRvRXF1YWwobWVzc2FnZXMpXG4gICAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlc1swXS5rZXkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlc1sxXS5rZXkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2VzWzFdLnNldmVyaXR5KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE9uZSByZW1vdmVkLCBvbmUgYWRkZWRcbiAgICAgICAgICBleHBlY3QoYWRkZWQubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5pbmRleE9mKGFkZGVkWzBdKSkubm90LnRvQmUoLTEpXG4gICAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlc1swXS5rZXkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlc1sxXS5rZXkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlc1swXS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2VzWzFdLnNldmVyaXR5KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZUZpcnN0LCBtZXNzYWdlU2Vjb25kXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZUZpcnN0LCBtZXNzYWdlVGhpcmRdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMilcbiAgICB9KVxuXG4gICAgaXQoJ2NoZWNrcyBpZiBhbiBvbGQgbWVzc2FnZSBoYXMgdXBkYXRlZCwgaWYgc28gaW52YWxpZGF0ZXMgaXQgcHJvcGVybHknLCBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBjYWxsZWQgPSAwXG4gICAgICBjb25zdCBtZXNzYWdlRmlyc3QgPSBnZXRNZXNzYWdlTGVnYWN5KClcbiAgICAgIGNvbnN0IG1lc3NhZ2VTZWNvbmQgPSBPYmplY3QuYXNzaWduKHt9LCBtZXNzYWdlRmlyc3QpXG4gICAgICBjb25zdCBsaW50ZXI6IE9iamVjdCA9IHsgbmFtZTogJ2FueScgfVxuICAgICAgY29uc3QgYnVmZmVyOiBPYmplY3QgPSB7fVxuXG4gICAgICBtZXNzYWdlUmVnaXN0cnkub25EaWRVcGRhdGVNZXNzYWdlcyhmdW5jdGlvbih7IGFkZGVkLCByZW1vdmVkLCBtZXNzYWdlcyB9KSB7XG4gICAgICAgIGNhbGxlZCsrXG4gICAgICAgIGlmIChjYWxsZWQgPT09IDEpIHtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICAgIGV4cGVjdChhZGRlZFswXSkudG9CZShtZXNzYWdlRmlyc3QpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QoYWRkZWRbMF0pLnRvQmUobWVzc2FnZVNlY29uZClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFswXSkudG9CZShtZXNzYWdlRmlyc3QpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlRmlyc3RdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlU2Vjb25kXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDEpXG4gICAgICBtZXNzYWdlRmlyc3QudGV4dCA9ICdIZWxsb3cnXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZVNlY29uZF0gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgyKVxuICAgIH0pXG5cbiAgICBpdCgnc2VuZHMgdGhlIHNhbWUgb2JqZWN0IGVhY2ggdGltZSBldmVuIGluIGNvbXBsaWNhdGVkIHNjZW5hcmlvcycsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGNhbGxlZCA9IDBcbiAgICAgIGNvbnN0IGtub3duTWVzc2FnZXMgPSBuZXcgU2V0KClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzIH0pIHtcbiAgICAgICAgY2FsbGVkKytcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBhZGRlZCkge1xuICAgICAgICAgIGlmIChrbm93bk1lc3NhZ2VzLmhhcyhlbnRyeSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBhbHJlYWR5IGV4aXN0cycpXG4gICAgICAgICAgfSBlbHNlIGtub3duTWVzc2FnZXMuYWRkKGVudHJ5KVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgcmVtb3ZlZCkge1xuICAgICAgICAgIGlmIChrbm93bk1lc3NhZ2VzLmhhcyhlbnRyeSkpIHtcbiAgICAgICAgICAgIGtub3duTWVzc2FnZXMuZGVsZXRlKGVudHJ5KVxuICAgICAgICAgIH0gZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ01lc3NhZ2UgZG9lcyBub3QgZXhpc3QnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChtZXNzYWdlcy5sZW5ndGggIT09IGtub3duTWVzc2FnZXMuc2l6ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2l6ZSBtaXNtYXRjaCwgcmVnaXN0cnkgaXMgaGF2aW5nIGhpY2N1cHMnKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBjb25zdCBsaW50ZXI6IE9iamVjdCA9IHsgbmFtZTogJ2FueScgfVxuICAgICAgY29uc3QgYnVmZmVyOiBPYmplY3QgPSB7fVxuICAgICAgY29uc3QgbWVzc2FnZVJlYWxGaXJzdCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZUR1cGVGaXJzdCA9IE9iamVjdC5hc3NpZ24oe30sIG1lc3NhZ2VSZWFsRmlyc3QpXG4gICAgICBjb25zdCBtZXNzYWdlUmVhbFNlY29uZCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZUR1cGVTZWNvbmQgPSBPYmplY3QuYXNzaWduKHt9LCBtZXNzYWdlUmVhbFNlY29uZClcblxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgwKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VSZWFsRmlyc3QsIG1lc3NhZ2VSZWFsU2Vjb25kXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDEpXG4gICAgICBleHBlY3Qoa25vd25NZXNzYWdlcy5zaXplKS50b0JlKDIpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChrbm93bk1lc3NhZ2VzLnNpemUpLnRvQmUoMilcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlUmVhbEZpcnN0LCBtZXNzYWdlUmVhbFNlY29uZF0gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KGtub3duTWVzc2FnZXMuc2l6ZSkudG9CZSgyKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VEdXBlRmlyc3QsIG1lc3NhZ2VEdXBlU2Vjb25kXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDEpXG4gICAgICBleHBlY3Qoa25vd25NZXNzYWdlcy5zaXplKS50b0JlKDIpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuZGVsZXRlQnlMaW50ZXIobGludGVyKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDIpXG4gICAgICBleHBlY3Qoa25vd25NZXNzYWdlcy5zaXplKS50b0JlKDApXG4gICAgfSlcbiAgICBpdCgnbm90aWNlcyBjaGFuZ2VzIG9uIGxhc3QgbWVzc2FnZXMgaW5zdGVhZCBvZiByZWx5aW5nIG9uIHRoZWlyIGtleXMgYW5kIGludmFpbGRhdGVzIHRoZW0nLCBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBjYWxsZWQgPSAwXG5cbiAgICAgIGNvbnN0IGxpbnRlcjogT2JqZWN0ID0geyBuYW1lOiAnYW55JyB9XG4gICAgICBjb25zdCBidWZmZXI6IE9iamVjdCA9IHt9XG4gICAgICBjb25zdCBtZXNzYWdlQSA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZUIgPSBPYmplY3QuYXNzaWduKHt9LCBtZXNzYWdlQSlcbiAgICAgIGNvbnN0IG1lc3NhZ2VDID0gT2JqZWN0LmFzc2lnbih7fSwgbWVzc2FnZUEpXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzIH0pIHtcbiAgICAgICAgY2FsbGVkKytcbiAgICAgICAgaWYgKGNhbGxlZCA9PT0gMSkge1xuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkKS50b0VxdWFsKG1lc3NhZ2VzKVxuICAgICAgICAgIGV4cGVjdChhZGRlZFswXSkudG9CZShtZXNzYWdlQSlcbiAgICAgICAgfSBlbHNlIGlmIChjYWxsZWQgPT09IDIpIHtcbiAgICAgICAgICBleHBlY3QoYWRkZWQubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICAgIGV4cGVjdChhZGRlZCkudG9FcXVhbChtZXNzYWdlcylcbiAgICAgICAgICBleHBlY3QoYWRkZWRbMF0pLnRvQmUobWVzc2FnZUIpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWRbMF0pLnRvQmUobWVzc2FnZUEpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IGhhdmUgYmVlbiB0cmlnZ2VyZWQnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VBXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlQS50ZXh0ID0gJ01VUklDQUFBJ1xuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VCXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZUNdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMilcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCc6OmRlbGV0ZUJ5QnVmZmVyJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2RlbGV0ZXMgdGhlIG1lc3NhZ2VzIGFuZCBzZW5kcyB0aGVtIGluIGFuIGV2ZW50JywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBsaW50ZXI6IE9iamVjdCA9IHsgbmFtZTogJ2FueScgfVxuICAgICAgY29uc3QgYnVmZmVyOiBPYmplY3QgPSB7fVxuICAgICAgY29uc3QgbWVzc2FnZUZpcnN0ID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlU2Vjb25kID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG5cbiAgICAgIGxldCBjYWxsZWQgPSAwXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzIH0pIHtcbiAgICAgICAgY2FsbGVkKytcbiAgICAgICAgaWYgKGNhbGxlZCA9PT0gMSkge1xuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkKS50b0VxdWFsKG1lc3NhZ2VzKVxuICAgICAgICAgIGV4cGVjdChhZGRlZFswXSkudG9CZShtZXNzYWdlRmlyc3QpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkWzFdKS50b0JlKG1lc3NhZ2VTZWNvbmQpXG4gICAgICAgIH0gZWxzZSBpZiAoY2FsbGVkID09PSAyKSB7XG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFswXSkudG9CZShtZXNzYWdlRmlyc3QpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWRbMV0pLnRvQmUobWVzc2FnZVNlY29uZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VubmVjZXNzYXJ5IHVwZGF0ZSBjYWxsJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlRmlyc3QsIG1lc3NhZ2VTZWNvbmRdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5kZWxldGVCeUJ1ZmZlcihidWZmZXIpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMilcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCc6OmRlbGV0ZUJ5TGludGVyJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2RlbGV0ZXMgdGhlIG1lc3NhZ2VzIGFuZCBzZW5kcyB0aGVtIGluIGFuIGV2ZW50JywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBsaW50ZXI6IE9iamVjdCA9IHsgbmFtZTogJ2FueScgfVxuICAgICAgY29uc3QgYnVmZmVyOiBPYmplY3QgPSB7fVxuICAgICAgY29uc3QgbWVzc2FnZUZpcnN0ID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlU2Vjb25kID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG5cbiAgICAgIGxldCBjYWxsZWQgPSAwXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzIH0pIHtcbiAgICAgICAgY2FsbGVkKytcbiAgICAgICAgaWYgKGNhbGxlZCA9PT0gMSkge1xuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkKS50b0VxdWFsKG1lc3NhZ2VzKVxuICAgICAgICAgIGV4cGVjdChhZGRlZFswXSkudG9CZShtZXNzYWdlRmlyc3QpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkWzFdKS50b0JlKG1lc3NhZ2VTZWNvbmQpXG4gICAgICAgIH0gZWxzZSBpZiAoY2FsbGVkID09PSAyKSB7XG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFswXSkudG9CZShtZXNzYWdlRmlyc3QpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWRbMV0pLnRvQmUobWVzc2FnZVNlY29uZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VubmVjZXNzYXJ5IHVwZGF0ZSBjYWxsJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlRmlyc3QsIG1lc3NhZ2VTZWNvbmRdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5kZWxldGVCeUxpbnRlcihsaW50ZXIpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMilcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==