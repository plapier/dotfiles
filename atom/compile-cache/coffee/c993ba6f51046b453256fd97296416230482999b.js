(function() {
  var GlobalVimState, StatusBarManager, VimMode, VimState, dispatchKeyboardEvent, dispatchTextEvent, getEditorElement, globalVimState, keydown, mockPlatform, statusBarManager, unmockPlatform, _ref,
    __slice = [].slice;

  VimState = require('../lib/vim-state');

  GlobalVimState = require('../lib/global-vim-state');

  VimMode = require('../lib/vim-mode');

  StatusBarManager = require('../lib/status-bar-manager');

  _ref = [], globalVimState = _ref[0], statusBarManager = _ref[1];

  beforeEach(function() {
    atom.workspace || (atom.workspace = {});
    statusBarManager = null;
    globalVimState = null;
    return spyOn(atom, 'beep');
  });

  getEditorElement = function(callback) {
    var textEditor;
    textEditor = null;
    waitsForPromise(function() {
      return atom.workspace.open().then(function(e) {
        return textEditor = e;
      });
    });
    return runs(function() {
      var element;
      element = atom.views.getView(textEditor);
      element.setUpdatedSynchronously(true);
      element.classList.add('vim-mode');
      if (statusBarManager == null) {
        statusBarManager = new StatusBarManager;
      }
      if (globalVimState == null) {
        globalVimState = new GlobalVimState;
      }
      element.vimState = new VimState(element, statusBarManager, globalVimState);
      element.addEventListener("keydown", function(e) {
        return atom.keymaps.handleKeyboardEvent(e);
      });
      document.createElement("html").appendChild(element);
      return callback(element);
    });
  };

  mockPlatform = function(editorElement, platform) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    return wrapper.appendChild(editorElement);
  };

  unmockPlatform = function(editorElement) {
    return editorElement.parentNode.removeChild(editorElement);
  };

  dispatchKeyboardEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    e = document.createEvent('KeyboardEvent');
    e.initKeyboardEvent.apply(e, eventArgs);
    if (e.keyCode === 0) {
      Object.defineProperty(e, 'keyCode', {
        get: function() {
          return void 0;
        }
      });
    }
    return target.dispatchEvent(e);
  };

  dispatchTextEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    e = document.createEvent('TextEvent');
    e.initTextEvent.apply(e, eventArgs);
    return target.dispatchEvent(e);
  };

  keydown = function(key, _arg) {
    var alt, canceled, ctrl, element, eventArgs, meta, raw, shift, _ref1;
    _ref1 = _arg != null ? _arg : {}, element = _ref1.element, ctrl = _ref1.ctrl, shift = _ref1.shift, alt = _ref1.alt, meta = _ref1.meta, raw = _ref1.raw;
    if (!(key === 'escape' || (raw != null))) {
      key = "U+" + (key.charCodeAt(0).toString(16));
    }
    element || (element = document.activeElement);
    eventArgs = [false, true, null, key, 0, ctrl, alt, shift, meta];
    canceled = !dispatchKeyboardEvent.apply(null, [element, 'keydown'].concat(__slice.call(eventArgs)));
    dispatchKeyboardEvent.apply(null, [element, 'keypress'].concat(__slice.call(eventArgs)));
    if (!canceled) {
      if (dispatchTextEvent.apply(null, [element, 'textInput'].concat(__slice.call(eventArgs)))) {
        element.value += key;
      }
    }
    return dispatchKeyboardEvent.apply(null, [element, 'keyup'].concat(__slice.call(eventArgs)));
  };

  module.exports = {
    keydown: keydown,
    getEditorElement: getEditorElement,
    mockPlatform: mockPlatform,
    unmockPlatform: unmockPlatform
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9zcGVjL3NwZWMtaGVscGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw4TEFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxrQkFBUixDQUFYLENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSx5QkFBUixDQURqQixDQUFBOztBQUFBLEVBRUEsT0FBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxnQkFBQSxHQUFtQixPQUFBLENBQVEsMkJBQVIsQ0FIbkIsQ0FBQTs7QUFBQSxFQUtBLE9BQXFDLEVBQXJDLEVBQUMsd0JBQUQsRUFBaUIsMEJBTGpCLENBQUE7O0FBQUEsRUFPQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsSUFBQSxJQUFJLENBQUMsY0FBTCxJQUFJLENBQUMsWUFBYyxHQUFuQixDQUFBO0FBQUEsSUFDQSxnQkFBQSxHQUFtQixJQURuQixDQUFBO0FBQUEsSUFFQSxjQUFBLEdBQWlCLElBRmpCLENBQUE7V0FHQSxLQUFBLENBQU0sSUFBTixFQUFZLE1BQVosRUFKUztFQUFBLENBQVgsQ0FQQSxDQUFBOztBQUFBLEVBYUEsZ0JBQUEsR0FBbUIsU0FBQyxRQUFELEdBQUE7QUFDakIsUUFBQSxVQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsSUFBYixDQUFBO0FBQUEsSUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTthQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxDQUFELEdBQUE7ZUFDekIsVUFBQSxHQUFhLEVBRFk7TUFBQSxDQUEzQixFQURj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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/spec/spec-helper.coffee
