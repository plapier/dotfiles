(function() {
  var _, getVimState;

  _ = require('underscore-plus');

  getVimState = require('./spec-helper').getVimState;

  xdescribe("visual-mode performance", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    afterEach(function() {
      vimState.resetNormalMode();
      return vimState.globalState.reset();
    });
    return describe("slow down editor", function() {
      var measureWithTimeEnd, moveRightAndLeftCheck;
      moveRightAndLeftCheck = function(scenario, modeSig) {
        var moveBySelect, moveByVMP, moveCount;
        console.log([scenario, modeSig, atom.getVersion(), atom.packages.getActivePackage('vim-mode-plus').metadata.version]);
        moveCount = 89;
        switch (scenario) {
          case 'vmp':
            moveByVMP = function() {
              _.times(moveCount, function() {
                return keystroke('l');
              });
              return _.times(moveCount, function() {
                return keystroke('h');
              });
            };
            return _.times(10, function() {
              return measureWithTimeEnd(moveByVMP);
            });
          case 'sel':
            moveBySelect = function() {
              _.times(moveCount, function() {
                return editor.getLastSelection().selectRight();
              });
              return _.times(moveCount, function() {
                return editor.getLastSelection().selectLeft();
              });
            };
            return _.times(15, function() {
              return measureWithTimeEnd(moveBySelect);
            });
        }
      };
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      beforeEach(function() {
        return set({
          cursor: [0, 0],
          text: "012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"
        });
      });
      return describe("vmp", function() {
        it("[normal] slow down editor", function() {
          return moveRightAndLeftCheck('vmp', 'moveCount');
        });
        it("[vC] slow down editor", function() {
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          ensure('escape', {
            mode: 'normal'
          });
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          return ensure('escape', {
            mode: 'normal'
          });
        });
        return it("[vC] slow down editor", function() {
          return moveRightAndLeftCheck('sel', 'vC');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvcGVyZm9ybWFuY2Utc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUgsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFFaEIsU0FBQSxDQUFVLHlCQUFWLEVBQXFDLFNBQUE7QUFDbkMsUUFBQTtJQUFBLE1BQTRELEVBQTVELEVBQUMsWUFBRCxFQUFNLGVBQU4sRUFBYyxrQkFBZCxFQUF5QixlQUF6QixFQUFpQyxzQkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixjQUFELEVBQU0sb0JBQU4sRUFBYywwQkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFNBQUEsQ0FBVSxTQUFBO01BQ1IsUUFBUSxDQUFDLGVBQVQsQ0FBQTthQUNBLFFBQVEsQ0FBQyxXQUFXLENBQUMsS0FBckIsQ0FBQTtJQUZRLENBQVY7V0FJQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtBQUMzQixVQUFBO01BQUEscUJBQUEsR0FBd0IsU0FBQyxRQUFELEVBQVcsT0FBWDtBQUN0QixZQUFBO1FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFDLFFBQUQsRUFBVyxPQUFYLEVBQW9CLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBcEIsRUFBdUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixlQUEvQixDQUErQyxDQUFDLFFBQVEsQ0FBQyxPQUFoRyxDQUFaO1FBRUEsU0FBQSxHQUFZO0FBQ1osZ0JBQU8sUUFBUDtBQUFBLGVBQ08sS0FEUDtZQUVJLFNBQUEsR0FBWSxTQUFBO2NBQ1YsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLFNBQUE7dUJBQUcsU0FBQSxDQUFVLEdBQVY7Y0FBSCxDQUFuQjtxQkFDQSxDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsRUFBbUIsU0FBQTt1QkFBRyxTQUFBLENBQVUsR0FBVjtjQUFILENBQW5CO1lBRlU7bUJBR1osQ0FBQyxDQUFDLEtBQUYsQ0FBUSxFQUFSLEVBQVksU0FBQTtxQkFBRyxrQkFBQSxDQUFtQixTQUFuQjtZQUFILENBQVo7QUFMSixlQU1PLEtBTlA7WUFPSSxZQUFBLEdBQWUsU0FBQTtjQUNiLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixFQUFtQixTQUFBO3VCQUFHLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQXlCLENBQUMsV0FBMUIsQ0FBQTtjQUFILENBQW5CO3FCQUNBLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixFQUFtQixTQUFBO3VCQUFHLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQXlCLENBQUMsVUFBMUIsQ0FBQTtjQUFILENBQW5CO1lBRmE7bUJBR2YsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxFQUFSLEVBQVksU0FBQTtxQkFBRyxrQkFBQSxDQUFtQixZQUFuQjtZQUFILENBQVo7QUFWSjtNQUpzQjtNQWdCeEIsa0JBQUEsR0FBcUIsU0FBQyxFQUFEO1FBQ25CLE9BQU8sQ0FBQyxJQUFSLENBQWEsRUFBRSxDQUFDLElBQWhCO1FBQ0EsRUFBQSxDQUFBO2VBQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBRSxDQUFDLElBQW5CO01BSG1CO01BS3JCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtVQUNBLElBQUEsRUFBTSw0RkFETjtTQURGO01BRFMsQ0FBWDthQU9BLFFBQUEsQ0FBUyxLQUFULEVBQWdCLFNBQUE7UUFFZCxFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQTtpQkFDOUIscUJBQUEsQ0FBc0IsS0FBdEIsRUFBNkIsV0FBN0I7UUFEOEIsQ0FBaEM7UUFFQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQTtVQUMxQixNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLGVBQVgsQ0FBTjtXQUFaO1VBQ0EscUJBQUEsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBN0I7VUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWpCO1VBRUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBQU47V0FBWjtVQUNBLHFCQUFBLENBQXNCLEtBQXRCLEVBQTZCLElBQTdCO2lCQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBakI7UUFQMEIsQ0FBNUI7ZUFTQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQTtpQkFFMUIscUJBQUEsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBN0I7UUFGMEIsQ0FBNUI7TUFiYyxDQUFoQjtJQTdCMkIsQ0FBN0I7RUFibUMsQ0FBckM7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG54ZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZSBwZXJmb3JtYW5jZVwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSBfdmltXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5yZXNldCgpXG5cbiAgZGVzY3JpYmUgXCJzbG93IGRvd24gZWRpdG9yXCIsIC0+XG4gICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrID0gKHNjZW5hcmlvLCBtb2RlU2lnKSAtPlxuICAgICAgY29uc29sZS5sb2cgW3NjZW5hcmlvLCBtb2RlU2lnLCBhdG9tLmdldFZlcnNpb24oKSwgYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykubWV0YWRhdGEudmVyc2lvbl1cblxuICAgICAgbW92ZUNvdW50ID0gODlcbiAgICAgIHN3aXRjaCBzY2VuYXJpb1xuICAgICAgICB3aGVuICd2bXAnXG4gICAgICAgICAgbW92ZUJ5Vk1QID0gLT5cbiAgICAgICAgICAgIF8udGltZXMgbW92ZUNvdW50LCAtPiBrZXlzdHJva2UgJ2wnXG4gICAgICAgICAgICBfLnRpbWVzIG1vdmVDb3VudCwgLT4ga2V5c3Ryb2tlICdoJ1xuICAgICAgICAgIF8udGltZXMgMTAsIC0+IG1lYXN1cmVXaXRoVGltZUVuZChtb3ZlQnlWTVApXG4gICAgICAgIHdoZW4gJ3NlbCdcbiAgICAgICAgICBtb3ZlQnlTZWxlY3QgPSAtPlxuICAgICAgICAgICAgXy50aW1lcyBtb3ZlQ291bnQsIC0+IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuc2VsZWN0UmlnaHQoKVxuICAgICAgICAgICAgXy50aW1lcyBtb3ZlQ291bnQsIC0+IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuc2VsZWN0TGVmdCgpXG4gICAgICAgICAgXy50aW1lcyAxNSwgLT4gbWVhc3VyZVdpdGhUaW1lRW5kKG1vdmVCeVNlbGVjdClcblxuICAgIG1lYXN1cmVXaXRoVGltZUVuZCA9IChmbikgLT5cbiAgICAgIGNvbnNvbGUudGltZShmbi5uYW1lKVxuICAgICAgZm4oKVxuICAgICAgY29uc29sZS50aW1lRW5kKGZuLm5hbWUpXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInZtcFwiLCAtPlxuICAgICAgIyBiZWZvcmVFYWNoIC0+XG4gICAgICBpdCBcIltub3JtYWxdIHNsb3cgZG93biBlZGl0b3JcIiwgLT5cbiAgICAgICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrKCd2bXAnLCAnbW92ZUNvdW50JylcbiAgICAgIGl0IFwiW3ZDXSBzbG93IGRvd24gZWRpdG9yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2soJ3ZtcCcsICd2QycpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrKCd2bXAnLCAndkMnKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiW3ZDXSBzbG93IGRvd24gZWRpdG9yXCIsIC0+XG4gICAgICAgICMgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgIG1vdmVSaWdodEFuZExlZnRDaGVjaygnc2VsJywgJ3ZDJylcbiJdfQ==
