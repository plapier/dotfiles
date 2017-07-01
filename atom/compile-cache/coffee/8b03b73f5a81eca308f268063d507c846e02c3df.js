(function() {
  var TextData, dispatch, getView, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Persistent Selection", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    return describe("CreatePersistentSelection operator", function() {
      var ensurePersistentSelection, textForMarker;
      textForMarker = function(marker) {
        return editor.getTextInBufferRange(marker.getBufferRange());
      };
      ensurePersistentSelection = function() {
        var _keystroke, args, markers, options, text;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        switch (args.length) {
          case 1:
            options = args[0];
            break;
          case 2:
            _keystroke = args[0], options = args[1];
        }
        if (_keystroke != null) {
          keystroke(_keystroke);
        }
        markers = vimState.persistentSelection.getMarkers();
        if (options.length != null) {
          expect(markers).toHaveLength(options.length);
        }
        if (options.text != null) {
          text = markers.map(function(marker) {
            return textForMarker(marker);
          });
          expect(text).toEqual(options.text);
        }
        if (options.mode != null) {
          return ensure({
            mode: options.mode
          });
        }
      };
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g m': 'vim-mode-plus:create-persistent-selection'
          }
        });
        set({
          text: "ooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n",
          cursor: [0, 0]
        });
        return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
      });
      describe("basic behavior", function() {
        describe("create-persistent-selection", function() {
          it("create-persistent-selection", function() {
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            return ensurePersistentSelection('j .', {
              length: 2,
              text: ['ooo', 'xxx']
            });
          });
          return it("create-persistent-selection forr current selection and repeatable by .", function() {
            ensurePersistentSelection('v enter', {
              length: 1,
              text: ['o']
            });
            return ensurePersistentSelection('j .', {
              length: 2,
              text: ['o', 'x']
            });
          });
        });
        return describe("[No behavior diff currently] inner-persistent-selection and a-persistent-selection", function() {
          return it("apply operator to across all persistent-selections", function() {
            ensurePersistentSelection('g m i w j . 2 j g m i p', {
              length: 3,
              text: ['ooo', 'xxx', "ooo xxx ooo\nxxx ooo xxx\n"]
            });
            return ensure('g U a r', {
              text: "OOO xxx ooo\nXXX ooo xxx\n\nOOO XXX OOO\nXXX OOO XXX\n\nooo xxx ooo\nxxx ooo xxx\n"
            });
          });
        });
      });
      describe("practical scenario", function() {
        return describe("persistent-selection is treated in same way as real selection", function() {
          beforeEach(function() {
            set({
              textC: "|0 ==========\n1 ==========\n2 ==========\n3 ==========\n4 ==========\n5 =========="
            });
            ensurePersistentSelection('V j enter', {
              text: ['0 ==========\n1 ==========\n']
            });
            return ensure('2 j V j', {
              selectedText: ['3 ==========\n4 ==========\n'],
              mode: ['visual', 'linewise']
            });
          });
          it("I in vL-mode with persistent-selection", function() {
            return ensure('I', {
              mode: 'insert',
              textC: "|0 ==========\n|1 ==========\n2 ==========\n|3 ==========\n|4 ==========\n5 =========="
            });
          });
          return it("A in vL-mode with persistent-selection", function() {
            return ensure('A', {
              mode: 'insert',
              textC: "0 ==========|\n1 ==========|\n2 ==========\n3 ==========|\n4 ==========|\n5 =========="
            });
          });
        });
      });
      describe("select-occurrence-in-a-persistent-selection", function() {
        return it("select all instance of cursor word only within marked range", function() {
          runs(function() {
            var paragraphText;
            paragraphText = "ooo xxx ooo\nxxx ooo xxx\n";
            return ensurePersistentSelection('g m i p } } j .', {
              length: 2,
              text: [paragraphText, paragraphText]
            });
          });
          return runs(function() {
            ensure('g cmd-d', {
              selectedText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo', 'ooo']
            });
            keystroke('c');
            editor.insertText('!!!');
            return ensure({
              text: "!!! xxx !!!\nxxx !!! xxx\n\nooo xxx ooo\nxxx ooo xxx\n\n!!! xxx !!!\nxxx !!! xxx\n"
            });
          });
        });
      });
      describe("clear-persistent-selections command", function() {
        return it("clear persistentSelections", function() {
          ensurePersistentSelection('g m i w', {
            length: 1,
            text: ['ooo']
          });
          dispatch(editorElement, 'vim-mode-plus:clear-persistent-selection');
          return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
        });
      });
      return describe("clearPersistentSelectionOnResetNormalMode", function() {
        describe("when disabled", function() {
          return it("it won't clear persistentSelection", function() {
            settings.set('clearPersistentSelectionOnResetNormalMode', false);
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            ensure("escape", {
              mode: 'normal'
            });
            return ensurePersistentSelection({
              length: 1,
              text: ['ooo']
            });
          });
        });
        return describe("when enabled", function() {
          return it("it clear persistentSelection on reset-normal-mode", function() {
            settings.set('clearPersistentSelectionOnResetNormalMode', true);
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            ensure("escape", {
              mode: 'normal'
            });
            return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvcGVyc2lzdGVudC1zZWxlY3Rpb24tc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVEQUFBO0lBQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLGVBQVIsQ0FBN0MsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCLHVCQUF4QixFQUFrQzs7RUFDbEMsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQTtBQUMvQixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsY0FBRCxFQUFNLG9CQUFOLEVBQWMsMEJBQWQsRUFBMkI7TUFIakIsQ0FBWjthQUlBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFERyxDQUFMO0lBTFMsQ0FBWDtXQVFBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBO0FBQzdDLFVBQUE7TUFBQSxhQUFBLEdBQWdCLFNBQUMsTUFBRDtlQUNkLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixNQUFNLENBQUMsY0FBUCxDQUFBLENBQTVCO01BRGM7TUFHaEIseUJBQUEsR0FBNEIsU0FBQTtBQUMxQixZQUFBO1FBRDJCO0FBQzNCLGdCQUFPLElBQUksQ0FBQyxNQUFaO0FBQUEsZUFDTyxDQURQO1lBQ2UsVUFBVztBQUFuQjtBQURQLGVBRU8sQ0FGUDtZQUVlLG9CQUFELEVBQWE7QUFGM0I7UUFJQSxJQUFHLGtCQUFI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dFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGEsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIlBlcnNpc3RlbnQgU2VsZWN0aW9uXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IF92aW1cbiAgICBydW5zIC0+XG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgZGVzY3JpYmUgXCJDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIG9wZXJhdG9yXCIsIC0+XG4gICAgdGV4dEZvck1hcmtlciA9IChtYXJrZXIpIC0+XG4gICAgICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UobWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpXG5cbiAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uID0gKGFyZ3MuLi4pIC0+XG4gICAgICBzd2l0Y2ggYXJncy5sZW5ndGhcbiAgICAgICAgd2hlbiAxIHRoZW4gW29wdGlvbnNdID0gYXJnc1xuICAgICAgICB3aGVuIDIgdGhlbiBbX2tleXN0cm9rZSwgb3B0aW9uc10gPSBhcmdzXG5cbiAgICAgIGlmIF9rZXlzdHJva2U/XG4gICAgICAgIGtleXN0cm9rZShfa2V5c3Ryb2tlKVxuXG4gICAgICBtYXJrZXJzID0gdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJzKClcbiAgICAgIGlmIG9wdGlvbnMubGVuZ3RoP1xuICAgICAgICBleHBlY3QobWFya2VycykudG9IYXZlTGVuZ3RoKG9wdGlvbnMubGVuZ3RoKVxuXG4gICAgICBpZiBvcHRpb25zLnRleHQ/XG4gICAgICAgIHRleHQgPSBtYXJrZXJzLm1hcCAobWFya2VyKSAtPiB0ZXh0Rm9yTWFya2VyKG1hcmtlcilcbiAgICAgICAgZXhwZWN0KHRleHQpLnRvRXF1YWwob3B0aW9ucy50ZXh0KVxuXG4gICAgICBpZiBvcHRpb25zLm1vZGU/XG4gICAgICAgIGVuc3VyZSBtb2RlOiBvcHRpb25zLm1vZGVcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIG0nOiAndmltLW1vZGUtcGx1czpjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb24nXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIG9vbyB4eHggb29vXG4gICAgICAgIHh4eCBvb28geHh4XG5cbiAgICAgICAgb29vIHh4eCBvb29cbiAgICAgICAgeHh4IG9vbyB4eHhcblxuICAgICAgICBvb28geHh4IG9vb1xuICAgICAgICB4eHggb29vIHh4eFxcblxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGV4cGVjdCh2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmhhc01hcmtlcnMoKSkudG9CZShmYWxzZSlcblxuICAgIGRlc2NyaWJlIFwiYmFzaWMgYmVoYXZpb3JcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiY3JlYXRlLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiY3JlYXRlLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAnZyBtIGkgdycsXG4gICAgICAgICAgICBsZW5ndGg6IDFcbiAgICAgICAgICAgIHRleHQ6IFsnb29vJ11cbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdqIC4nLFxuICAgICAgICAgICAgbGVuZ3RoOiAyXG4gICAgICAgICAgICB0ZXh0OiBbJ29vbycsICd4eHgnXVxuICAgICAgICBpdCBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvbiBmb3JyIGN1cnJlbnQgc2VsZWN0aW9uIGFuZCByZXBlYXRhYmxlIGJ5IC5cIiwgLT5cbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICd2IGVudGVyJyxcbiAgICAgICAgICAgIGxlbmd0aDogMVxuICAgICAgICAgICAgdGV4dDogWydvJ11cbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdqIC4nLFxuICAgICAgICAgICAgbGVuZ3RoOiAyXG4gICAgICAgICAgICB0ZXh0OiBbJ28nLCAneCddXG5cbiAgICAgIGRlc2NyaWJlIFwiW05vIGJlaGF2aW9yIGRpZmYgY3VycmVudGx5XSBpbm5lci1wZXJzaXN0ZW50LXNlbGVjdGlvbiBhbmQgYS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImFwcGx5IG9wZXJhdG9yIHRvIGFjcm9zcyBhbGwgcGVyc2lzdGVudC1zZWxlY3Rpb25zXCIsIC0+XG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAnZyBtIGkgdyBqIC4gMiBqIGcgbSBpIHAnLCAgIyBNYXJrIDIgaW5uZXItd29yZCBhbmQgMSBpbm5lci1wYXJhZ3JhcGhcbiAgICAgICAgICAgIGxlbmd0aDogM1xuICAgICAgICAgICAgdGV4dDogWydvb28nLCAneHh4JywgXCJvb28geHh4IG9vb1xcbnh4eCBvb28geHh4XFxuXCJdXG5cbiAgICAgICAgICBlbnN1cmUgJ2cgVSBhIHInLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBPT08geHh4IG9vb1xuICAgICAgICAgICAgWFhYIG9vbyB4eHhcblxuICAgICAgICAgICAgT09PIFhYWCBPT09cbiAgICAgICAgICAgIFhYWCBPT08gWFhYXG5cbiAgICAgICAgICAgIG9vbyB4eHggb29vXG4gICAgICAgICAgICB4eHggb29vIHh4eFxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInByYWN0aWNhbCBzY2VuYXJpb1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyB0cmVhdGVkIGluIHNhbWUgd2F5IGFzIHJlYWwgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHwwID09PT09PT09PT1cbiAgICAgICAgICAgIDEgPT09PT09PT09PVxuICAgICAgICAgICAgMiA9PT09PT09PT09XG4gICAgICAgICAgICAzID09PT09PT09PT1cbiAgICAgICAgICAgIDQgPT09PT09PT09PVxuICAgICAgICAgICAgNSA9PT09PT09PT09XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ1YgaiBlbnRlcicsXG4gICAgICAgICAgICB0ZXh0OiBbJzAgPT09PT09PT09PVxcbjEgPT09PT09PT09PVxcbiddXG5cbiAgICAgICAgICBlbnN1cmUgJzIgaiBWIGonLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJzMgPT09PT09PT09PVxcbjQgPT09PT09PT09PVxcbiddXG4gICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG5cbiAgICAgICAgaXQgXCJJIGluIHZMLW1vZGUgd2l0aCBwZXJzaXN0ZW50LXNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnSScsXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfDAgPT09PT09PT09PVxuICAgICAgICAgICAgfDEgPT09PT09PT09PVxuICAgICAgICAgICAgMiA9PT09PT09PT09XG4gICAgICAgICAgICB8MyA9PT09PT09PT09XG4gICAgICAgICAgICB8NCA9PT09PT09PT09XG4gICAgICAgICAgICA1ID09PT09PT09PT1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgIyBjdXJzb3I6IFtbMywgMF0sIFs0LCAwXSwgWzAsIDBdLCBbMSwgMF1dXG5cbiAgICAgICAgaXQgXCJBIGluIHZMLW1vZGUgd2l0aCBwZXJzaXN0ZW50LXNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnQScsXG4gICAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMCA9PT09PT09PT09fFxuICAgICAgICAgICAgMSA9PT09PT09PT09fFxuICAgICAgICAgICAgMiA9PT09PT09PT09XG4gICAgICAgICAgICAzID09PT09PT09PT18XG4gICAgICAgICAgICA0ID09PT09PT09PT18XG4gICAgICAgICAgICA1ID09PT09PT09PT1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgIyBjdXJzb3I6IFtbMywgMTJdLCBbNCwgMTJdLCBbMCwgMTJdLCBbMSwgMTJdXVxuXG4gICAgZGVzY3JpYmUgXCJzZWxlY3Qtb2NjdXJyZW5jZS1pbi1hLXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBhbGwgaW5zdGFuY2Ugb2YgY3Vyc29yIHdvcmQgb25seSB3aXRoaW4gbWFya2VkIHJhbmdlXCIsIC0+XG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBwYXJhZ3JhcGhUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgICBvb28geHh4IG9vb1xuICAgICAgICAgICAgeHh4IG9vbyB4eHhcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ2cgbSBpIHAgfSB9IGogLicsICMgTWFyayAyIGlubmVyLXdvcmQgYW5kIDEgaW5uZXItcGFyYWdyYXBoXG4gICAgICAgICAgICBsZW5ndGg6IDJcbiAgICAgICAgICAgIHRleHQ6IFtwYXJhZ3JhcGhUZXh0LCBwYXJhZ3JhcGhUZXh0XVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgY21kLWQnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAnb29vJyBdXG4gICAgICAgICAga2V5c3Ryb2tlICdjJ1xuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICchISEnXG4gICAgICAgICAgZW5zdXJlXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICEhISB4eHggISEhXG4gICAgICAgICAgICB4eHggISEhIHh4eFxuXG4gICAgICAgICAgICBvb28geHh4IG9vb1xuICAgICAgICAgICAgeHh4IG9vbyB4eHhcblxuICAgICAgICAgICAgISEhIHh4eCAhISFcbiAgICAgICAgICAgIHh4eCAhISEgeHh4XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiY2xlYXItcGVyc2lzdGVudC1zZWxlY3Rpb25zIGNvbW1hbmRcIiwgLT5cbiAgICAgIGl0IFwiY2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvbnNcIiwgLT5cbiAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAnZyBtIGkgdycsXG4gICAgICAgICAgbGVuZ3RoOiAxXG4gICAgICAgICAgdGV4dDogWydvb28nXVxuXG4gICAgICAgIGRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOmNsZWFyLXBlcnNpc3RlbnQtc2VsZWN0aW9uJylcbiAgICAgICAgZXhwZWN0KHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uaGFzTWFya2VycygpKS50b0JlKGZhbHNlKVxuXG4gICAgZGVzY3JpYmUgXCJjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGRpc2FibGVkXCIsIC0+XG4gICAgICAgIGl0IFwiaXQgd29uJ3QgY2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnY2xlYXJQZXJzaXN0ZW50U2VsZWN0aW9uT25SZXNldE5vcm1hbE1vZGUnLCBmYWxzZSlcbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdnIG0gaSB3JyxcbiAgICAgICAgICAgIGxlbmd0aDogMVxuICAgICAgICAgICAgdGV4dDogWydvb28nXVxuXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiBsZW5ndGg6IDEsIHRleHQ6IFsnb29vJ11cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGVuYWJsZWRcIiwgLT5cbiAgICAgICAgaXQgXCJpdCBjbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uIG9uIHJlc2V0LW5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZScsIHRydWUpXG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAnZyBtIGkgdycsXG4gICAgICAgICAgICBsZW5ndGg6IDFcbiAgICAgICAgICAgIHRleHQ6IFsnb29vJ11cbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBleHBlY3QodmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5oYXNNYXJrZXJzKCkpLnRvQmUoZmFsc2UpXG4iXX0=
