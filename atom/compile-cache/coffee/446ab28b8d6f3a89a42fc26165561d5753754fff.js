(function() {
  var VimNormalModeInputElement,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  VimNormalModeInputElement = (function(_super) {
    __extends(VimNormalModeInputElement, _super);

    function VimNormalModeInputElement() {
      return VimNormalModeInputElement.__super__.constructor.apply(this, arguments);
    }

    VimNormalModeInputElement.prototype.createdCallback = function() {
      return this.className = "normal-mode-input";
    };

    VimNormalModeInputElement.prototype.initialize = function(viewModel, mainEditorElement, opts) {
      var _ref;
      this.viewModel = viewModel;
      this.mainEditorElement = mainEditorElement;
      if (opts == null) {
        opts = {};
      }
      if (opts["class"] != null) {
        this.classList.add(opts["class"]);
      }
      this.editorElement = document.createElement("atom-text-editor");
      this.editorElement.classList.add('editor');
      this.editorElement.getModel().setMini(true);
      this.editorElement.setAttribute('mini', '');
      this.appendChild(this.editorElement);
      this.singleChar = opts.singleChar;
      this.defaultText = (_ref = opts.defaultText) != null ? _ref : '';
      if (opts.hidden) {
        this.classList.add('vim-hidden-normal-mode-input');
        this.mainEditorElement.parentNode.appendChild(this);
      } else {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          priority: 100
        });
      }
      this.focus();
      this.handleEvents();
      return this;
    };

    VimNormalModeInputElement.prototype.handleEvents = function() {
      var compositing;
      if (this.singleChar != null) {
        compositing = false;
        this.editorElement.getModel().getBuffer().onDidChange((function(_this) {
          return function(e) {
            if (e.newText && !compositing) {
              return _this.confirm();
            }
          };
        })(this));
        this.editorElement.addEventListener('compositionstart', function() {
          return compositing = true;
        });
        this.editorElement.addEventListener('compositionend', function() {
          return compositing = false;
        });
      } else {
        atom.commands.add(this.editorElement, 'editor:newline', this.confirm.bind(this));
      }
      atom.commands.add(this.editorElement, 'core:confirm', this.confirm.bind(this));
      atom.commands.add(this.editorElement, 'core:cancel', this.cancel.bind(this));
      return atom.commands.add(this.editorElement, 'blur', this.cancel.bind(this));
    };

    VimNormalModeInputElement.prototype.confirm = function() {
      this.value = this.editorElement.getModel().getText() || this.defaultText;
      this.viewModel.confirm(this);
      return this.removePanel();
    };

    VimNormalModeInputElement.prototype.focus = function() {
      return this.editorElement.focus();
    };

    VimNormalModeInputElement.prototype.cancel = function(e) {
      this.viewModel.cancel(this);
      return this.removePanel();
    };

    VimNormalModeInputElement.prototype.removePanel = function() {
      atom.workspace.getActivePane().activate();
      if (this.panel != null) {
        return this.panel.destroy();
      } else {
        return this.remove();
      }
    };

    return VimNormalModeInputElement;

  })(HTMLDivElement);

  module.exports = document.registerElement("vim-normal-mode-input", {
    "extends": "div",
    prototype: VimNormalModeInputElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy92aW0tbW9kZS9saWIvdmlldy1tb2RlbHMvdmltLW5vcm1hbC1tb2RlLWlucHV0LWVsZW1lbnQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBTTtBQUNKLGdEQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx3Q0FBQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTthQUNmLElBQUMsQ0FBQSxTQUFELEdBQWEsb0JBREU7SUFBQSxDQUFqQixDQUFBOztBQUFBLHdDQUdBLFVBQUEsR0FBWSxTQUFFLFNBQUYsRUFBYyxpQkFBZCxFQUFpQyxJQUFqQyxHQUFBO0FBQ1YsVUFBQSxJQUFBO0FBQUEsTUFEVyxJQUFDLENBQUEsWUFBQSxTQUNaLENBQUE7QUFBQSxNQUR1QixJQUFDLENBQUEsb0JBQUEsaUJBQ3hCLENBQUE7O1FBRDJDLE9BQU87T0FDbEQ7QUFBQSxNQUFBLElBQUcscUJBQUg7QUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLElBQUksQ0FBQyxPQUFELENBQW5CLENBQUEsQ0FERjtPQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixRQUFRLENBQUMsYUFBVCxDQUF1QixrQkFBdkIsQ0FIakIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsUUFBN0IsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQSxDQUF5QixDQUFDLE9BQTFCLENBQWtDLElBQWxDLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxZQUFmLENBQTRCLE1BQTVC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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/vim-mode/lib/view-models/vim-normal-mode-input-element.coffee
