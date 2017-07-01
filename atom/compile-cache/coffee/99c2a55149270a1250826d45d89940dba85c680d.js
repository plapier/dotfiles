(function() {
  var LongModeStringTable, StatusBarManager, createDiv, settings;

  settings = require('./settings');

  createDiv = function(arg) {
    var classList, div, id, ref;
    id = arg.id, classList = arg.classList;
    div = document.createElement('div');
    if (id != null) {
      div.id = id;
    }
    if (classList != null) {
      (ref = div.classList).add.apply(ref, classList);
    }
    return div;
  };

  LongModeStringTable = {
    'normal': "Normal",
    'operator-pending': "Operator Pending",
    'visual.characterwise': "Visual Characterwise",
    'visual.blockwise': "Visual Blockwise",
    'visual.linewise': "Visual Linewise",
    'insert': "Insert",
    'insert.replace': "Insert Replace"
  };

  module.exports = StatusBarManager = (function() {
    StatusBarManager.prototype.prefix = 'status-bar-vim-mode-plus';

    function StatusBarManager() {
      this.container = createDiv({
        id: this.prefix + "-container",
        classList: ['inline-block']
      });
      this.container.appendChild(this.element = createDiv({
        id: this.prefix
      }));
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(mode, submode) {
      this.element.className = this.prefix + "-" + mode;
      return this.element.textContent = (function() {
        switch (settings.get('statusBarModeStringStyle')) {
          case 'short':
            return (mode[0] + (submode != null ? submode[0] : '')).toUpperCase();
          case 'long':
            return LongModeStringTable[mode + (submode != null ? '.' + submode : '')];
        }
      })();
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zdGF0dXMtYmFyLW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsU0FBQSxHQUFZLFNBQUMsR0FBRDtBQUNWLFFBQUE7SUFEWSxhQUFJO0lBQ2hCLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtJQUNOLElBQWUsVUFBZjtNQUFBLEdBQUcsQ0FBQyxFQUFKLEdBQVMsR0FBVDs7SUFDQSxJQUFtQyxpQkFBbkM7TUFBQSxPQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWEsQ0FBQyxHQUFkLFlBQWtCLFNBQWxCLEVBQUE7O1dBQ0E7RUFKVTs7RUFNWixtQkFBQSxHQUNFO0lBQUEsUUFBQSxFQUFVLFFBQVY7SUFDQSxrQkFBQSxFQUFvQixrQkFEcEI7SUFFQSxzQkFBQSxFQUF3QixzQkFGeEI7SUFHQSxrQkFBQSxFQUFvQixrQkFIcEI7SUFJQSxpQkFBQSxFQUFtQixpQkFKbkI7SUFLQSxRQUFBLEVBQVUsUUFMVjtJQU1BLGdCQUFBLEVBQWtCLGdCQU5sQjs7O0VBUUYsTUFBTSxDQUFDLE9BQVAsR0FDTTsrQkFDSixNQUFBLEdBQVE7O0lBRUssMEJBQUE7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhLFNBQUEsQ0FBVTtRQUFBLEVBQUEsRUFBTyxJQUFDLENBQUEsTUFBRixHQUFTLFlBQWY7UUFBNEIsU0FBQSxFQUFXLENBQUMsY0FBRCxDQUF2QztPQUFWO01BQ2IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxPQUFELEdBQVcsU0FBQSxDQUFVO1FBQUEsRUFBQSxFQUFJLElBQUMsQ0FBQSxNQUFMO09BQVYsQ0FBbEM7SUFGVzs7K0JBSWIsVUFBQSxHQUFZLFNBQUMsU0FBRDtNQUFDLElBQUMsQ0FBQSxZQUFEO0lBQUQ7OytCQUVaLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxPQUFQO01BQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULEdBQXdCLElBQUMsQ0FBQSxNQUFGLEdBQVMsR0FBVCxHQUFZO2FBQ25DLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVDtBQUNFLGdCQUFPLFFBQVEsQ0FBQyxHQUFULENBQWEsMEJBQWIsQ0FBUDtBQUFBLGVBQ08sT0FEUDttQkFFSSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxDQUFJLGVBQUgsR0FBaUIsT0FBUSxDQUFBLENBQUEsQ0FBekIsR0FBaUMsRUFBbEMsQ0FBWCxDQUFpRCxDQUFDLFdBQWxELENBQUE7QUFGSixlQUdPLE1BSFA7bUJBSUksbUJBQW9CLENBQUEsSUFBQSxHQUFPLENBQUksZUFBSCxHQUFpQixHQUFBLEdBQU0sT0FBdkIsR0FBb0MsRUFBckMsQ0FBUDtBQUp4Qjs7SUFISTs7K0JBU1IsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QjtRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBUDtRQUFrQixRQUFBLEVBQVUsRUFBNUI7T0FBeEI7SUFERjs7K0JBR1IsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQTtJQURNOzs7OztBQXZDViIsInNvdXJjZXNDb250ZW50IjpbInNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxuY3JlYXRlRGl2ID0gKHtpZCwgY2xhc3NMaXN0fSkgLT5cbiAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZGl2LmlkID0gaWQgaWYgaWQ/XG4gIGRpdi5jbGFzc0xpc3QuYWRkKGNsYXNzTGlzdC4uLikgaWYgY2xhc3NMaXN0P1xuICBkaXZcblxuTG9uZ01vZGVTdHJpbmdUYWJsZSA9XG4gICdub3JtYWwnOiBcIk5vcm1hbFwiXG4gICdvcGVyYXRvci1wZW5kaW5nJzogXCJPcGVyYXRvciBQZW5kaW5nXCJcbiAgJ3Zpc3VhbC5jaGFyYWN0ZXJ3aXNlJzogXCJWaXN1YWwgQ2hhcmFjdGVyd2lzZVwiXG4gICd2aXN1YWwuYmxvY2t3aXNlJzogXCJWaXN1YWwgQmxvY2t3aXNlXCJcbiAgJ3Zpc3VhbC5saW5ld2lzZSc6IFwiVmlzdWFsIExpbmV3aXNlXCJcbiAgJ2luc2VydCc6IFwiSW5zZXJ0XCJcbiAgJ2luc2VydC5yZXBsYWNlJzogXCJJbnNlcnQgUmVwbGFjZVwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFN0YXR1c0Jhck1hbmFnZXJcbiAgcHJlZml4OiAnc3RhdHVzLWJhci12aW0tbW9kZS1wbHVzJ1xuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBjb250YWluZXIgPSBjcmVhdGVEaXYoaWQ6IFwiI3tAcHJlZml4fS1jb250YWluZXJcIiwgY2xhc3NMaXN0OiBbJ2lubGluZS1ibG9jayddKVxuICAgIEBjb250YWluZXIuYXBwZW5kQ2hpbGQoQGVsZW1lbnQgPSBjcmVhdGVEaXYoaWQ6IEBwcmVmaXgpKVxuXG4gIGluaXRpYWxpemU6IChAc3RhdHVzQmFyKSAtPlxuXG4gIHVwZGF0ZTogKG1vZGUsIHN1Ym1vZGUpIC0+XG4gICAgQGVsZW1lbnQuY2xhc3NOYW1lID0gXCIje0BwcmVmaXh9LSN7bW9kZX1cIlxuICAgIEBlbGVtZW50LnRleHRDb250ZW50ID1cbiAgICAgIHN3aXRjaCBzZXR0aW5ncy5nZXQoJ3N0YXR1c0Jhck1vZGVTdHJpbmdTdHlsZScpXG4gICAgICAgIHdoZW4gJ3Nob3J0J1xuICAgICAgICAgIChtb2RlWzBdICsgKGlmIHN1Ym1vZGU/IHRoZW4gc3VibW9kZVswXSBlbHNlICcnKSkudG9VcHBlckNhc2UoKVxuICAgICAgICB3aGVuICdsb25nJ1xuICAgICAgICAgIExvbmdNb2RlU3RyaW5nVGFibGVbbW9kZSArIChpZiBzdWJtb2RlPyB0aGVuICcuJyArIHN1Ym1vZGUgZWxzZSAnJyldXG5cbiAgYXR0YWNoOiAtPlxuICAgIEB0aWxlID0gQHN0YXR1c0Jhci5hZGRSaWdodFRpbGUoaXRlbTogQGNvbnRhaW5lciwgcHJpb3JpdHk6IDIwKVxuXG4gIGRldGFjaDogLT5cbiAgICBAdGlsZS5kZXN0cm95KClcbiJdfQ==
