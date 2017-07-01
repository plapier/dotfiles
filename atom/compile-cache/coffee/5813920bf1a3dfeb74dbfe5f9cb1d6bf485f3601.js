(function() {
  var HoverManager,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = HoverManager = (function() {
    function HoverManager(vimState) {
      var ref;
      this.vimState = vimState;
      this.destroy = bind(this.destroy, this);
      ref = this.vimState, this.editor = ref.editor, this.editorElement = ref.editorElement;
      this.container = document.createElement('div');
      this.decorationOptions = {
        type: 'overlay',
        item: this.container
      };
      this.vimState.onDidDestroy(this.destroy);
      this.reset();
    }

    HoverManager.prototype.getPoint = function() {
      var selection;
      if (this.vimState.isMode('visual', 'blockwise')) {
        return this.vimState.getLastBlockwiseSelection().getHeadSelection().getHeadBufferPosition();
      } else {
        selection = this.editor.getLastSelection();
        return this.vimState.swrap(selection).getBufferPositionFor('head', {
          from: ['property', 'selection']
        });
      }
    };

    HoverManager.prototype.set = function(text, point, options) {
      var ref, ref1;
      if (point == null) {
        point = this.getPoint();
      }
      if (options == null) {
        options = {};
      }
      if (this.marker == null) {
        this.marker = this.editor.markBufferPosition(point);
        this.editor.decorateMarker(this.marker, this.decorationOptions);
      }
      if ((ref = options.classList) != null ? ref.length : void 0) {
        (ref1 = this.container.classList).add.apply(ref1, options.classList);
      }
      return this.container.textContent = text;
    };

    HoverManager.prototype.reset = function() {
      var ref;
      this.container.className = 'vim-mode-plus-hover';
      if ((ref = this.marker) != null) {
        ref.destroy();
      }
      return this.marker = null;
    };

    HoverManager.prototype.destroy = function() {
      var ref;
      this.container.remove();
      if ((ref = this.marker) != null) {
        ref.destroy();
      }
      return this.marker = null;
    };

    return HoverManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9ob3Zlci1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsWUFBQTtJQUFBOztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxzQkFBQyxRQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxXQUFEOztNQUNaLE1BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxhQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsb0JBQUE7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ2IsSUFBQyxDQUFBLGlCQUFELEdBQXFCO1FBQUMsSUFBQSxFQUFNLFNBQVA7UUFBa0IsSUFBQSxFQUFNLElBQUMsQ0FBQSxTQUF6Qjs7TUFDckIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtNQUNBLElBQUMsQ0FBQSxLQUFELENBQUE7SUFMVzs7MkJBT2IsUUFBQSxHQUFVLFNBQUE7QUFDUixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsUUFBakIsRUFBMkIsV0FBM0IsQ0FBSDtlQUNFLElBQUMsQ0FBQSxRQUFRLENBQUMseUJBQVYsQ0FBQSxDQUFxQyxDQUFDLGdCQUF0QyxDQUFBLENBQXdELENBQUMscUJBQXpELENBQUEsRUFERjtPQUFBLE1BQUE7UUFHRSxTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBO2VBQ1osSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQWdCLFNBQWhCLENBQTBCLENBQUMsb0JBQTNCLENBQWdELE1BQWhELEVBQXdEO1VBQUEsSUFBQSxFQUFNLENBQUMsVUFBRCxFQUFhLFdBQWIsQ0FBTjtTQUF4RCxFQUpGOztJQURROzsyQkFPVixHQUFBLEdBQUssU0FBQyxJQUFELEVBQU8sS0FBUCxFQUEwQixPQUExQjtBQUNILFVBQUE7O1FBRFUsUUFBTSxJQUFDLENBQUEsUUFBRCxDQUFBOzs7UUFBYSxVQUFROztNQUNyQyxJQUFPLG1CQUFQO1FBQ0UsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCO1FBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxjQUFSLENBQXVCLElBQUMsQ0FBQSxNQUF4QixFQUFnQyxJQUFDLENBQUEsaUJBQWpDLEVBRkY7O01BSUEsMkNBQW9CLENBQUUsZUFBdEI7UUFDRSxRQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsU0FBWCxDQUFvQixDQUFDLEdBQXJCLGFBQXlCLE9BQU8sQ0FBQyxTQUFqQyxFQURGOzthQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxHQUF5QjtJQVB0Qjs7MkJBU0wsS0FBQSxHQUFPLFNBQUE7QUFDTCxVQUFBO01BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLEdBQXVCOztXQUNoQixDQUFFLE9BQVQsQ0FBQTs7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBSEw7OzJCQUtQLE9BQUEsR0FBUyxTQUFBO0FBQ1AsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFBOztXQUNPLENBQUUsT0FBVCxDQUFBOzthQUNBLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFISDs7Ozs7QUE5QlgiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBIb3Zlck1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIEBkZWNvcmF0aW9uT3B0aW9ucyA9IHt0eXBlOiAnb3ZlcmxheScsIGl0ZW06IEBjb250YWluZXJ9XG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveSlcbiAgICBAcmVzZXQoKVxuXG4gIGdldFBvaW50OiAtPlxuICAgIGlmIEB2aW1TdGF0ZS5pc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgQHZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5nZXRIZWFkU2VsZWN0aW9uKCkuZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgICAgQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddKVxuXG4gIHNldDogKHRleHQsIHBvaW50PUBnZXRQb2ludCgpLCBvcHRpb25zPXt9KSAtPlxuICAgIHVubGVzcyBAbWFya2VyP1xuICAgICAgQG1hcmtlciA9IEBlZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihAbWFya2VyLCBAZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICBpZiBvcHRpb25zLmNsYXNzTGlzdD8ubGVuZ3RoXG4gICAgICBAY29udGFpbmVyLmNsYXNzTGlzdC5hZGQob3B0aW9ucy5jbGFzc0xpc3QuLi4pXG4gICAgQGNvbnRhaW5lci50ZXh0Q29udGVudCA9IHRleHRcblxuICByZXNldDogLT5cbiAgICBAY29udGFpbmVyLmNsYXNzTmFtZSA9ICd2aW0tbW9kZS1wbHVzLWhvdmVyJ1xuICAgIEBtYXJrZXI/LmRlc3Ryb3koKVxuICAgIEBtYXJrZXIgPSBudWxsXG5cbiAgZGVzdHJveTogPT5cbiAgICBAY29udGFpbmVyLnJlbW92ZSgpXG4gICAgQG1hcmtlcj8uZGVzdHJveSgpXG4gICAgQG1hcmtlciA9IG51bGxcbiJdfQ==
