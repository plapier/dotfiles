(function() {
  describe("sorting lines", function() {
    var activationPromise, editor, editorView, sortLineCaseInsensitive, sortLines, sortLinesNatural, sortLinesReversed, uniqueLines, _ref;
    _ref = [], activationPromise = _ref[0], editor = _ref[1], editorView = _ref[2];
    sortLines = function(callback) {
      atom.commands.dispatch(editorView, "sort-lines:sort");
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(callback);
    };
    sortLinesReversed = function(callback) {
      atom.commands.dispatch(editorView, "sort-lines:reverse-sort");
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(callback);
    };
    uniqueLines = function(callback) {
      atom.commands.dispatch(editorView, "sort-lines:unique");
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(callback);
    };
    sortLineCaseInsensitive = function(callback) {
      atom.commands.dispatch(editorView, "sort-lines:case-insensitive-sort");
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(callback);
    };
    sortLinesNatural = function(callback) {
      atom.commands.dispatch(editorView, "sort-lines:natural");
      waitsForPromise(function() {
        return activationPromise;
      });
      return runs(callback);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open();
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        editorView = atom.views.getView(editor);
        return activationPromise = atom.packages.activatePackage('sort-lines');
      });
    });
    describe("when no lines are selected", function() {
      it("sorts all lines", function() {
        editor.setText("Hydrogen\nHelium\nLithium");
        editor.setCursorBufferPosition([0, 0]);
        return sortLines(function() {
          return expect(editor.getText()).toBe("Helium\nHydrogen\nLithium");
        });
      });
      return it("sorts all lines, ignoring the trailing new line", function() {
        editor.setText("Hydrogen\nHelium\nLithium\n");
        editor.setCursorBufferPosition([0, 0]);
        return sortLines(function() {
          return expect(editor.getText()).toBe("Helium\nHydrogen\nLithium\n");
        });
      });
    });
    describe("when entire lines are selected", function() {
      return it("sorts the selected lines", function() {
        editor.setText("Hydrogen\nHelium\nLithium\nBeryllium\nBoron");
        editor.setSelectedBufferRange([[1, 0], [4, 0]]);
        return sortLines(function() {
          return expect(editor.getText()).toBe("Hydrogen\nBeryllium\nHelium\nLithium\nBoron");
        });
      });
    });
    describe("when partial lines are selected", function() {
      return it("sorts the selected lines", function() {
        editor.setText("Hydrogen\nHelium\nLithium\nBeryllium\nBoron");
        editor.setSelectedBufferRange([[1, 3], [3, 2]]);
        return sortLines(function() {
          return expect(editor.getText()).toBe("Hydrogen\nBeryllium\nHelium\nLithium\nBoron");
        });
      });
    });
    describe("when there are multiple selection ranges", function() {
      return it("sorts the lines in each selection range", function() {
        editor.setText("Hydrogen\nHelium    # selection 1\nBeryllium # selection 1\nCarbon\nFluorine  # selection 2\nAluminum  # selection 2\nGallium\nEuropium");
        editor.addSelectionForBufferRange([[1, 0], [3, 0]]);
        editor.addSelectionForBufferRange([[4, 0], [6, 0]]);
        return sortLines(function() {
          return expect(editor.getText()).toBe("Hydrogen\nBeryllium # selection 1\nHelium    # selection 1\nCarbon\nAluminum  # selection 2\nFluorine  # selection 2\nGallium\nEuropium");
        });
      });
    });
    describe("reversed sorting", function() {
      return it("sorts all lines in reverse order", function() {
        editor.setText("Hydrogen\nHelium\nLithium");
        editor.setCursorBufferPosition([0, 0]);
        return sortLinesReversed(function() {
          return expect(editor.getText()).toBe("Lithium\nHydrogen\nHelium");
        });
      });
    });
    describe("uniqueing", function() {
      it("uniques all lines but does not change order", function() {
        editor.setText("Hydrogen\nHydrogen\nHelium\nLithium\nHydrogen\nHydrogen\nHelium\nLithium\nHydrogen\nHydrogen\nHelium\nLithium\nHydrogen\nHydrogen\nHelium\nLithium");
        editor.setCursorBufferPosition([0, 0]);
        return uniqueLines(function() {
          return expect(editor.getText()).toBe("Hydrogen\nHelium\nLithium");
        });
      });
      return it("uniques all lines using CRLF line-endings", function() {
        editor.setText("Hydrogen\r\nHydrogen\r\nHelium\r\nLithium\r\nHydrogen\r\nHydrogen\r\nHelium\r\nLithium\r\nHydrogen\r\nHydrogen\r\nHelium\r\nLithium\r\nHydrogen\r\nHydrogen\r\nHelium\r\nLithium\r\n");
        editor.setCursorBufferPosition([0, 0]);
        return uniqueLines(function() {
          return expect(editor.getText()).toBe("Hydrogen\r\nHelium\r\nLithium\r\n");
        });
      });
    });
    describe("case-insensitive sorting", function() {
      return it("sorts all lines, ignoring case", function() {
        editor.setText("Hydrogen\nlithium\nhelium\nHelium\nLithium");
        editor.setCursorBufferPosition([0, 0]);
        return sortLineCaseInsensitive(function() {
          return expect(editor.getText()).toBe("helium\nHelium\nHydrogen\nlithium\nLithium");
        });
      });
    });
    return describe("natural sorting", function() {
      it("orders by leading numerals", function() {
        editor.setText("4a\n1a\n2a\n3a\n0a");
        editor.setCursorBufferPosition([0, 0]);
        return sortLinesNatural(function() {
          return expect(editor.getText()).toBe("0a\n1a\n2a\n3a\n4a");
        });
      });
      it("orders by word", function() {
        editor.setText("1Hydrogen1\n1Beryllium1\n1Carbon1");
        editor.setCursorBufferPosition([0, 0]);
        return sortLinesNatural(function() {
          return expect(editor.getText()).toBe("1Beryllium1\n1Carbon1\n1Hydrogen1");
        });
      });
      it("orders by trailing numeral", function() {
        editor.setText("a4\na0\na1\na2\na3");
        editor.setCursorBufferPosition([0, 0]);
        return sortLinesNatural(function() {
          return expect(editor.getText()).toBe("a0\na1\na2\na3\na4");
        });
      });
      it("orders by leading numeral before word", function() {
        editor.setText("4b\n2b\n3a\n1a");
        editor.setCursorBufferPosition([0, 0]);
        return sortLinesNatural(function() {
          return expect(editor.getText()).toBe("1a\n2b\n3a\n4b");
        });
      });
      it("orders by word before trailing number", function() {
        editor.setText("c2\na4\nd1\nb3");
        editor.setCursorBufferPosition([0, 0]);
        return sortLinesNatural(function() {
          return expect(editor.getText()).toBe("a4\nb3\nc2\nd1");
        });
      });
      return it("properly handles leading zeros", function() {
        editor.setText("a01\na001\na003\na002\na02");
        editor.setCursorBufferPosition([0, 0]);
        return sortLinesNatural(function() {
          return expect(editor.getText()).toBe("a001\na002\na003\na01\na02");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9zb3J0LWxpbmVzL3NwZWMvc29ydC1saW5lcy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUNBO0FBQUEsRUFBQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsUUFBQSxpSUFBQTtBQUFBLElBQUEsT0FBMEMsRUFBMUMsRUFBQywyQkFBRCxFQUFvQixnQkFBcEIsRUFBNEIsb0JBQTVCLENBQUE7QUFBQSxJQUVBLFNBQUEsR0FBWSxTQUFDLFFBQUQsR0FBQTtBQUNWLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLFVBQXZCLEVBQW1DLGlCQUFuQyxDQUFBLENBQUE7QUFBQSxNQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsa0JBQUg7TUFBQSxDQUFoQixDQURBLENBQUE7YUFFQSxJQUFBLENBQUssUUFBTCxFQUhVO0lBQUEsQ0FGWixDQUFBO0FBQUEsSUFPQSxpQkFBQSxHQUFvQixTQUFDLFFBQUQsR0FBQTtBQUNsQixNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixVQUF2QixFQUFtQyx5QkFBbkMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUFHLGtCQUFIO01BQUEsQ0FBaEIsQ0FEQSxDQUFBO2FBRUEsSUFBQSxDQUFLLFFBQUwsRUFIa0I7SUFBQSxDQVBwQixDQUFBO0FBQUEsSUFZQSxXQUFBLEdBQWMsU0FBQyxRQUFELEdBQUE7QUFDWixNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixVQUF2QixFQUFtQyxtQkFBbkMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUFHLGtCQUFIO01B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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/sort-lines/spec/sort-lines-spec.coffee
