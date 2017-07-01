(function() {
  var CompositeDisposable, MARKS, MarkManager, Point, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  MARKS = /(?:[a-z]|[\[\]`'.^(){}<>])/;

  MarkManager = (function() {
    MarkManager.prototype.marks = null;

    function MarkManager(vimState) {
      var ref1;
      this.vimState = vimState;
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.vimState.onDidDestroy(this.destroy.bind(this)));
      this.marks = {};
      this.markerLayer = this.editor.addMarkerLayer();
    }

    MarkManager.prototype.destroy = function() {
      this.disposables.dispose();
      this.markerLayer.destroy();
      return this.marks = null;
    };

    MarkManager.prototype.isValid = function(name) {
      return MARKS.test(name);
    };

    MarkManager.prototype.get = function(name) {
      var point, ref1;
      if (!this.isValid(name)) {
        return;
      }
      point = (ref1 = this.marks[name]) != null ? ref1.getStartBufferPosition() : void 0;
      if (indexOf.call("`'", name) >= 0) {
        return point != null ? point : Point.ZERO;
      } else {
        return point;
      }
    };

    MarkManager.prototype.set = function(name, point) {
      var bufferPosition, marker;
      if (!this.isValid(name)) {
        return;
      }
      if (marker = this.marks[name]) {
        marker.destroy();
      }
      bufferPosition = this.editor.clipBufferPosition(point);
      this.marks[name] = this.markerLayer.markBufferPosition(bufferPosition, {
        invalidate: 'never'
      });
      return this.vimState.emitter.emit('did-set-mark', {
        name: name,
        bufferPosition: bufferPosition,
        editor: this.editor
      });
    };

    return MarkManager;

  })();

  module.exports = MarkManager;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tYXJrLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtREFBQTtJQUFBOztFQUFBLE1BQStCLE9BQUEsQ0FBUSxNQUFSLENBQS9CLEVBQUMsaUJBQUQsRUFBUTs7RUFFUixLQUFBLEdBQVE7O0VBS0Y7MEJBQ0osS0FBQSxHQUFPOztJQUVNLHFCQUFDLFFBQUQ7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFdBQUQ7TUFDWixPQUE0QixJQUFDLENBQUEsUUFBN0IsRUFBQyxJQUFDLENBQUEsY0FBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLHFCQUFBO01BQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsUUFBUSxDQUFDLFlBQVYsQ0FBdUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUF2QixDQUFqQjtNQUVBLElBQUMsQ0FBQSxLQUFELEdBQVM7TUFDVCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBO0lBTko7OzBCQVFiLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTthQUNBLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFIRjs7MEJBS1QsT0FBQSxHQUFTLFNBQUMsSUFBRDthQUNQLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtJQURPOzswQkFHVCxHQUFBLEdBQUssU0FBQyxJQUFEO0FBQ0gsVUFBQTtNQUFBLElBQUEsQ0FBYyxJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQsQ0FBZDtBQUFBLGVBQUE7O01BQ0EsS0FBQSwyQ0FBb0IsQ0FBRSxzQkFBZCxDQUFBO01BQ1IsSUFBRyxhQUFRLElBQVIsRUFBQSxJQUFBLE1BQUg7K0JBQ0UsUUFBUSxLQUFLLENBQUMsS0FEaEI7T0FBQSxNQUFBO2VBR0UsTUFIRjs7SUFIRzs7MEJBU0wsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDSCxVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBVCxDQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFHLE1BQUEsR0FBUyxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBbkI7UUFDRSxNQUFNLENBQUMsT0FBUCxDQUFBLEVBREY7O01BRUEsY0FBQSxHQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQTJCLEtBQTNCO01BQ2pCLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFQLEdBQWUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxrQkFBYixDQUFnQyxjQUFoQyxFQUFnRDtRQUFBLFVBQUEsRUFBWSxPQUFaO09BQWhEO2FBQ2YsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsQ0FBdUIsY0FBdkIsRUFBdUM7UUFBQyxNQUFBLElBQUQ7UUFBTyxnQkFBQSxjQUFQO1FBQXdCLFFBQUQsSUFBQyxDQUFBLE1BQXhCO09BQXZDO0lBTkc7Ozs7OztFQVFQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBM0NqQiIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludCwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5NQVJLUyA9IC8vLyAoXG4gID86IFthLXpdXG4gICB8IFtcXFtcXF1gJy5eKCl7fTw+XVxuKSAvLy9cblxuY2xhc3MgTWFya01hbmFnZXJcbiAgbWFya3M6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIEB2aW1TdGF0ZS5vbkRpZERlc3Ryb3koQGRlc3Ryb3kuYmluZCh0aGlzKSlcblxuICAgIEBtYXJrcyA9IHt9XG4gICAgQG1hcmtlckxheWVyID0gQGVkaXRvci5hZGRNYXJrZXJMYXllcigpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQG1hcmtlckxheWVyLmRlc3Ryb3koKVxuICAgIEBtYXJrcyA9IG51bGxcblxuICBpc1ZhbGlkOiAobmFtZSkgLT5cbiAgICBNQVJLUy50ZXN0KG5hbWUpXG5cbiAgZ2V0OiAobmFtZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpc1ZhbGlkKG5hbWUpXG4gICAgcG9pbnQgPSBAbWFya3NbbmFtZV0/LmdldFN0YXJ0QnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIG5hbWUgaW4gXCJgJ1wiXG4gICAgICBwb2ludCA/IFBvaW50LlpFUk9cbiAgICBlbHNlXG4gICAgICBwb2ludFxuXG4gICMgW0ZJWE1FXSBOZWVkIHRvIHN1cHBvcnQgR2xvYmFsIG1hcmsgd2l0aCBjYXBpdGFsIG5hbWUgW0EtWl1cbiAgc2V0OiAobmFtZSwgcG9pbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXNWYWxpZChuYW1lKVxuICAgIGlmIG1hcmtlciA9IEBtYXJrc1tuYW1lXVxuICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQGVkaXRvci5jbGlwQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgQG1hcmtzW25hbWVdID0gQG1hcmtlckxheWVyLm1hcmtCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbiwgaW52YWxpZGF0ZTogJ25ldmVyJylcbiAgICBAdmltU3RhdGUuZW1pdHRlci5lbWl0KCdkaWQtc2V0LW1hcmsnLCB7bmFtZSwgYnVmZmVyUG9zaXRpb24sIEBlZGl0b3J9KVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcmtNYW5hZ2VyXG4iXX0=
