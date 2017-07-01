(function() {
  var ExState, GlobalExState, activateExMode, dispatchKeyboardEvent, dispatchTextEvent, getEditorElement, keydown,
    __slice = [].slice;

  ExState = require('../lib/ex-state');

  GlobalExState = require('../lib/global-ex-state');

  beforeEach(function() {
    return atom.workspace || (atom.workspace = {});
  });

  activateExMode = function() {
    return atom.workspace.open().then(function() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'ex-mode:open');
      keydown('escape');
      return atom.workspace.getActivePane().destroyActiveItem();
    });
  };

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
      return callback(element);
    });
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
    var alt, canceled, ctrl, element, eventArgs, meta, raw, shift, _ref;
    _ref = _arg != null ? _arg : {}, element = _ref.element, ctrl = _ref.ctrl, shift = _ref.shift, alt = _ref.alt, meta = _ref.meta, raw = _ref.raw;
    if (!(key === 'escape' || (raw != null))) {
      key = "U+" + (key.charCodeAt(0).toString(16));
    }
    element || (element = document.activeElement);
    eventArgs = [true, true, null, key, 0, ctrl, alt, shift, meta];
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
    activateExMode: activateExMode
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvc3BlYy1oZWxwZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJHQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGlCQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHdCQUFSLENBRGhCLENBQUE7O0FBQUEsRUFHQSxVQUFBLENBQVcsU0FBQSxHQUFBO1dBQ1QsSUFBSSxDQUFDLGNBQUwsSUFBSSxDQUFDLFlBQWMsSUFEVjtFQUFBLENBQVgsQ0FIQSxDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFpQixTQUFBLEdBQUE7V0FDZixJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBQSxDQUFxQixDQUFDLElBQXRCLENBQTJCLFNBQUEsR0FBQTtBQUN6QixNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQXZCLEVBQTJELGNBQTNELENBQUEsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxDQUFRLFFBQVIsQ0FEQSxDQUFBO2FBRUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBOEIsQ0FBQyxpQkFBL0IsQ0FBQSxFQUh5QjtJQUFBLENBQTNCLEVBRGU7RUFBQSxDQU5qQixDQUFBOztBQUFBLEVBYUEsZ0JBQUEsR0FBbUIsU0FBQyxRQUFELEdBQUE7QUFDakIsUUFBQSxVQUFBO0FBQUEsSUFBQSxVQUFBLEdBQWEsSUFBYixDQUFBO0FBQUEsSUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTthQUNkLElBQUksQ0FBQyxTQUFTLENB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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/spec/spec-helper.coffee
