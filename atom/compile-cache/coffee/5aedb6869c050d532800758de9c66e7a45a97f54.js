(function() {
  var Input, REGISTERS, RegisterManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Input = require('./input');

  REGISTERS = /(?:[a-zA-Z*+%_".])/;

  module.exports = RegisterManager = (function() {
    function RegisterManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.data = this.vimState.globalState.get('register');
      this.subscriptionBySelection = new Map;
      this.clipboardBySelection = new Map;
      this.vimState.onDidDestroy(this.destroy);
    }

    RegisterManager.prototype.reset = function() {
      this.name = null;
      return this.editorElement.classList.toggle('with-register', false);
    };

    RegisterManager.prototype.destroy = function() {
      var ref;
      this.subscriptionBySelection.forEach(function(disposable) {
        return disposable.dispose();
      });
      this.subscriptionBySelection.clear();
      this.clipboardBySelection.clear();
      return ref = {}, this.subscriptionBySelection = ref.subscriptionBySelection, this.clipboardBySelection = ref.clipboardBySelection, ref;
    };

    RegisterManager.prototype.isValidName = function(name) {
      return REGISTERS.test(name);
    };

    RegisterManager.prototype.getText = function(name, selection) {
      var ref;
      return (ref = this.get(name, selection).text) != null ? ref : '';
    };

    RegisterManager.prototype.readClipboard = function(selection) {
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && this.clipboardBySelection.has(selection)) {
        return this.clipboardBySelection.get(selection);
      } else {
        return atom.clipboard.read();
      }
    };

    RegisterManager.prototype.writeClipboard = function(selection, text) {
      var disposable;
      if (selection == null) {
        selection = null;
      }
      if ((selection != null ? selection.editor.hasMultipleCursors() : void 0) && !this.clipboardBySelection.has(selection)) {
        disposable = selection.onDidDestroy((function(_this) {
          return function() {
            _this.subscriptionBySelection["delete"](selection);
            return _this.clipboardBySelection["delete"](selection);
          };
        })(this));
        this.subscriptionBySelection.set(selection, disposable);
      }
      if ((selection === null) || selection.isLastSelection()) {
        atom.clipboard.write(text);
      }
      if (selection != null) {
        return this.clipboardBySelection.set(selection, text);
      }
    };

    RegisterManager.prototype.getRegisterNameToUse = function(name) {
      var ref;
      if ((name != null) && !this.isValidName(name)) {
        return null;
      }
      if (name == null) {
        name = (ref = this.name) != null ? ref : '"';
      }
      if (name === '"' && this.vimState.getConfig('useClipboardAsDefaultRegister')) {
        return '*';
      } else {
        return name;
      }
    };

    RegisterManager.prototype.get = function(name, selection) {
      var ref, ref1, text, type;
      name = this.getRegisterNameToUse(name);
      if (name == null) {
        return;
      }
      switch (name) {
        case '*':
        case '+':
          text = this.readClipboard(selection);
          break;
        case '%':
          text = this.editor.getURI();
          break;
        case '_':
          text = '';
          break;
        default:
          ref1 = (ref = this.data[name.toLowerCase()]) != null ? ref : {}, text = ref1.text, type = ref1.type;
      }
      if (type == null) {
        type = this.getCopyType(text != null ? text : '');
      }
      return {
        text: text,
        type: type
      };
    };

    RegisterManager.prototype.set = function(name, value) {
      var selection;
      name = this.getRegisterNameToUse(name);
      if (name == null) {
        return;
      }
      if (value.type == null) {
        value.type = this.getCopyType(value.text);
      }
      selection = value.selection;
      delete value.selection;
      switch (name) {
        case '*':
        case '+':
          return this.writeClipboard(selection, value.text);
        case '_':
        case '%':
          return null;
        default:
          if (/^[A-Z]$/.test(name)) {
            name = name.toLowerCase();
            if (this.data[name] != null) {
              return this.append(name, value);
            } else {
              return this.data[name] = value;
            }
          } else {
            return this.data[name] = value;
          }
      }
    };

    RegisterManager.prototype.append = function(name, value) {
      var register;
      register = this.data[name];
      if ('linewise' === register.type || 'linewise' === value.type) {
        if (register.type !== 'linewise') {
          register.type = 'linewise';
          register.text += '\n';
        }
        if (value.type !== 'linewise') {
          value.text += '\n';
        }
      }
      return register.text += value.text;
    };

    RegisterManager.prototype.setName = function(name) {
      var inputUI;
      if (name != null) {
        this.name = name;
        this.editorElement.classList.toggle('with-register', true);
        return this.vimState.hover.set('"' + this.name);
      } else {
        inputUI = new Input(this.vimState);
        inputUI.onDidConfirm((function(_this) {
          return function(name) {
            if (_this.isValidName(name)) {
              return _this.setName(name);
            } else {
              return _this.vimState.hover.reset();
            }
          };
        })(this));
        inputUI.onDidCancel((function(_this) {
          return function() {
            return _this.vimState.hover.reset();
          };
        })(this));
        this.vimState.hover.set('"');
        return inputUI.focus(1);
      }
    };

    RegisterManager.prototype.getCopyType = function(text) {
      if (text.endsWith("\n") || text.endsWith("\r")) {
        return 'linewise';
      } else {
        return 'characterwise';
      }
    };

    return RegisterManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9yZWdpc3Rlci1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsaUNBQUE7SUFBQTs7RUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0VBRVIsU0FBQSxHQUFZOztFQWlCWixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MseUJBQUMsUUFBRDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDs7TUFDWixNQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLG9CQUFBO01BQ1gsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUF0QixDQUEwQixVQUExQjtNQUNSLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixJQUFJO01BQy9CLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFJO01BRTVCLElBQUMsQ0FBQSxRQUFRLENBQUMsWUFBVixDQUF1QixJQUFDLENBQUEsT0FBeEI7SUFOVzs7OEJBUWIsS0FBQSxHQUFPLFNBQUE7TUFDTCxJQUFDLENBQUEsSUFBRCxHQUFRO2FBQ1IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBekIsQ0FBZ0MsZUFBaEMsRUFBaUQsS0FBakQ7SUFGSzs7OEJBSVAsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLHVCQUF1QixDQUFDLE9BQXpCLENBQWlDLFNBQUMsVUFBRDtlQUMvQixVQUFVLENBQUMsT0FBWCxDQUFBO01BRCtCLENBQWpDO01BRUEsSUFBQyxDQUFBLHVCQUF1QixDQUFDLEtBQXpCLENBQUE7TUFDQSxJQUFDLENBQUEsb0JBQW9CLENBQUMsS0FBdEIsQ0FBQTthQUNBLE1BQW9ELEVBQXBELEVBQUMsSUFB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QSxNQUFBO2VBR0UsZ0JBSEY7O0lBRFc7Ozs7O0FBOUlmIiwic291cmNlc0NvbnRlbnQiOlsiSW5wdXQgPSByZXF1aXJlICcuL2lucHV0J1xuXG5SRUdJU1RFUlMgPSAvLy8gKFxuICA/OiBbYS16QS1aKislX1wiLl1cbikgLy8vXG5cbiMgVE9ETzogVmltIHN1cHBvcnQgZm9sbG93aW5nIHJlZ2lzdGVycy5cbiMgeDogY29tcGxldGUsIC06IHBhcnRpYWxseVxuIyAgW3hdIDEuIFRoZSB1bm5hbWVkIHJlZ2lzdGVyIFwiXCJcbiMgIFsgXSAyLiAxMCBudW1iZXJlZCByZWdpc3RlcnMgXCIwIHRvIFwiOVxuIyAgWyBdIDMuIFRoZSBzbWFsbCBkZWxldGUgcmVnaXN0ZXIgXCItXG4jICBbeF0gNC4gMjYgbmFtZWQgcmVnaXN0ZXJzIFwiYSB0byBcInogb3IgXCJBIHRvIFwiWlxuIyAgWy1dIDUuIHRocmVlIHJlYWQtb25seSByZWdpc3RlcnMgXCI6LCBcIi4sIFwiJVxuIyAgWyBdIDYuIGFsdGVybmF0ZSBidWZmZXIgcmVnaXN0ZXIgXCIjXG4jICBbIF0gNy4gdGhlIGV4cHJlc3Npb24gcmVnaXN0ZXIgXCI9XG4jICBbIF0gOC4gVGhlIHNlbGVjdGlvbiBhbmQgZHJvcCByZWdpc3RlcnMgXCIqLCBcIisgYW5kIFwiflxuIyAgW3hdIDkuIFRoZSBibGFjayBob2xlIHJlZ2lzdGVyIFwiX1xuIyAgWyBdIDEwLiBMYXN0IHNlYXJjaCBwYXR0ZXJuIHJlZ2lzdGVyIFwiL1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBSZWdpc3Rlck1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBkYXRhID0gQHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgncmVnaXN0ZXInKVxuICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24gPSBuZXcgTWFwXG5cbiAgICBAdmltU3RhdGUub25EaWREZXN0cm95KEBkZXN0cm95KVxuXG4gIHJlc2V0OiAtPlxuICAgIEBuYW1lID0gbnVsbFxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ3dpdGgtcmVnaXN0ZXInLCBmYWxzZSlcblxuICBkZXN0cm95OiA9PlxuICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5mb3JFYWNoIChkaXNwb3NhYmxlKSAtPlxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uY2xlYXIoKVxuICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5jbGVhcigpXG4gICAge0BzdWJzY3JpcHRpb25CeVNlbGVjdGlvbiwgQGNsaXBib2FyZEJ5U2VsZWN0aW9ufSA9IHt9XG5cbiAgaXNWYWxpZE5hbWU6IChuYW1lKSAtPlxuICAgIFJFR0lTVEVSUy50ZXN0KG5hbWUpXG5cbiAgZ2V0VGV4dDogKG5hbWUsIHNlbGVjdGlvbikgLT5cbiAgICBAZ2V0KG5hbWUsIHNlbGVjdGlvbikudGV4dCA/ICcnXG5cbiAgcmVhZENsaXBib2FyZDogKHNlbGVjdGlvbj1udWxsKSAtPlxuICAgIGlmIHNlbGVjdGlvbj8uZWRpdG9yLmhhc011bHRpcGxlQ3Vyc29ycygpIGFuZCBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIEBjbGlwYm9hcmRCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgIGVsc2VcbiAgICAgIGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuXG4gIHdyaXRlQ2xpcGJvYXJkOiAoc2VsZWN0aW9uPW51bGwsIHRleHQpIC0+XG4gICAgaWYgc2VsZWN0aW9uPy5lZGl0b3IuaGFzTXVsdGlwbGVDdXJzb3JzKCkgYW5kIG5vdCBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uaGFzKHNlbGVjdGlvbilcbiAgICAgIGRpc3Bvc2FibGUgPSBzZWxlY3Rpb24ub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5kZWxldGUoc2VsZWN0aW9uKVxuICAgICAgICBAY2xpcGJvYXJkQnlTZWxlY3Rpb24uZGVsZXRlKHNlbGVjdGlvbilcbiAgICAgIEBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBkaXNwb3NhYmxlKVxuXG4gICAgaWYgKHNlbGVjdGlvbiBpcyBudWxsKSBvciBzZWxlY3Rpb24uaXNMYXN0U2VsZWN0aW9uKClcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRleHQpXG4gICAgQGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIHRleHQpIGlmIHNlbGVjdGlvbj9cblxuICBnZXRSZWdpc3Rlck5hbWVUb1VzZTogKG5hbWUpIC0+XG4gICAgaWYgbmFtZT8gYW5kIG5vdCBAaXNWYWxpZE5hbWUobmFtZSlcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBuYW1lID89IEBuYW1lID8gJ1wiJ1xuICAgIGlmIG5hbWUgaXMgJ1wiJyBhbmQgQHZpbVN0YXRlLmdldENvbmZpZygndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInKVxuICAgICAgJyonXG4gICAgZWxzZVxuICAgICAgbmFtZVxuXG4gIGdldDogKG5hbWUsIHNlbGVjdGlvbikgLT5cbiAgICBuYW1lID0gQGdldFJlZ2lzdGVyTmFtZVRvVXNlKG5hbWUpXG4gICAgcmV0dXJuIHVubGVzcyBuYW1lP1xuXG4gICAgc3dpdGNoIG5hbWVcbiAgICAgIHdoZW4gJyonLCAnKycgdGhlbiB0ZXh0ID0gQHJlYWRDbGlwYm9hcmQoc2VsZWN0aW9uKVxuICAgICAgd2hlbiAnJScgdGhlbiB0ZXh0ID0gQGVkaXRvci5nZXRVUkkoKVxuICAgICAgd2hlbiAnXycgdGhlbiB0ZXh0ID0gJycgIyBCbGFja2hvbGUgYWx3YXlzIHJldHVybnMgbm90aGluZ1xuICAgICAgZWxzZVxuICAgICAgICB7dGV4dCwgdHlwZX0gPSBAZGF0YVtuYW1lLnRvTG93ZXJDYXNlKCldID8ge31cbiAgICB0eXBlID89IEBnZXRDb3B5VHlwZSh0ZXh0ID8gJycpXG4gICAge3RleHQsIHR5cGV9XG5cbiAgIyBQcml2YXRlOiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIHJlZ2lzdGVyLlxuICAjXG4gICMgbmFtZSAgLSBUaGUgbmFtZSBvZiB0aGUgcmVnaXN0ZXIgdG8gZmV0Y2guXG4gICMgdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0IHRoZSByZWdpc3RlciB0bywgd2l0aCBmb2xsb3dpbmcgcHJvcGVydGllcy5cbiAgIyAgdGV4dDogdGV4dCB0byBzYXZlIHRvIHJlZ2lzdGVyLlxuICAjICB0eXBlOiAob3B0aW9uYWwpIGlmIG9tbWl0ZWQgYXV0b21hdGljYWxseSBzZXQgZnJvbSB0ZXh0LlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBzZXQ6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICBuYW1lID0gQGdldFJlZ2lzdGVyTmFtZVRvVXNlKG5hbWUpXG4gICAgcmV0dXJuIHVubGVzcyBuYW1lP1xuXG4gICAgdmFsdWUudHlwZSA/PSBAZ2V0Q29weVR5cGUodmFsdWUudGV4dClcblxuICAgIHNlbGVjdGlvbiA9IHZhbHVlLnNlbGVjdGlvblxuICAgIGRlbGV0ZSB2YWx1ZS5zZWxlY3Rpb25cblxuICAgIHN3aXRjaCBuYW1lXG4gICAgICB3aGVuICcqJywgJysnIHRoZW4gQHdyaXRlQ2xpcGJvYXJkKHNlbGVjdGlvbiwgdmFsdWUudGV4dClcbiAgICAgIHdoZW4gJ18nLCAnJScgdGhlbiBudWxsXG4gICAgICBlbHNlXG4gICAgICAgIGlmIC9eW0EtWl0kLy50ZXN0KG5hbWUpXG4gICAgICAgICAgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIGlmIEBkYXRhW25hbWVdP1xuICAgICAgICAgICAgQGFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGF0YVtuYW1lXSA9IHZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGF0YVtuYW1lXSA9IHZhbHVlXG5cbiAgYXBwZW5kOiAobmFtZSwgdmFsdWUpIC0+XG4gICAgcmVnaXN0ZXIgPSBAZGF0YVtuYW1lXVxuICAgIGlmICdsaW5ld2lzZScgaW4gW3JlZ2lzdGVyLnR5cGUsIHZhbHVlLnR5cGVdXG4gICAgICBpZiByZWdpc3Rlci50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgICByZWdpc3Rlci50eXBlID0gJ2xpbmV3aXNlJ1xuICAgICAgICByZWdpc3Rlci50ZXh0ICs9ICdcXG4nXG4gICAgICBpZiB2YWx1ZS50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgICB2YWx1ZS50ZXh0ICs9ICdcXG4nXG4gICAgcmVnaXN0ZXIudGV4dCArPSB2YWx1ZS50ZXh0XG5cbiAgc2V0TmFtZTogKG5hbWUpIC0+XG4gICAgaWYgbmFtZT9cbiAgICAgIEBuYW1lID0gbmFtZVxuICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnd2l0aC1yZWdpc3RlcicsIHRydWUpXG4gICAgICBAdmltU3RhdGUuaG92ZXIuc2V0KCdcIicgKyBAbmFtZSlcbiAgICBlbHNlXG4gICAgICBpbnB1dFVJID0gbmV3IElucHV0KEB2aW1TdGF0ZSlcbiAgICAgIGlucHV0VUkub25EaWRDb25maXJtIChuYW1lKSA9PlxuICAgICAgICBpZiBAaXNWYWxpZE5hbWUobmFtZSlcbiAgICAgICAgICBAc2V0TmFtZShuYW1lKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQHZpbVN0YXRlLmhvdmVyLnJlc2V0KClcbiAgICAgIGlucHV0VUkub25EaWRDYW5jZWwgPT4gQHZpbVN0YXRlLmhvdmVyLnJlc2V0KClcbiAgICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoJ1wiJylcbiAgICAgIGlucHV0VUkuZm9jdXMoMSlcblxuICBnZXRDb3B5VHlwZTogKHRleHQpIC0+XG4gICAgaWYgdGV4dC5lbmRzV2l0aChcIlxcblwiKSBvciB0ZXh0LmVuZHNXaXRoKFwiXFxyXCIpXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZVxuICAgICAgJ2NoYXJhY3Rlcndpc2UnXG4iXX0=
