(function() {
  var Blackspace, fs, path, temp;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp');

  Blackspace = require('../lib/blackspace');

  describe('Blackspace', function() {
    beforeEach(function() {
      var directory, filePath;
      directory = temp.mkdirSync();
      atom.project.setPaths(directory);
      filePath = path.join(directory, 'blackspace.coffee');
      fs.writeFileSync(filePath, '');
      waitsForPromise(function() {
        return atom.workspace.open(filePath);
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('blackspace');
      });
    });
    describe('newline', function() {
      return it('moves the (auto inserted) whitespace from a blank line to the next line', function() {
        var bufferText, cursor, editor;
        editor = atom.workspace.getActiveTextEditor();
        editor.setText("  hello\n  ");
        atom.commands.dispatch(atom.views.getView(editor), 'blackspace:newline');
        cursor = editor.getLastCursor();
        bufferText = editor.getText();
        bufferText = bufferText.replace(/\n/g, '=').replace(/\s/g, '-');
        expect(bufferText).toBe("--hello==--");
        expect(cursor.getBufferRow()).toBe(2);
        return expect(cursor.getBufferColumn()).toBe(2);
      });
    });
    return describe('newline-above', function() {
      return it('moves the (auto inserted) whitespace from a blank line to the line above', function() {
        var bufferText, cursor, editor;
        editor = atom.workspace.getActiveTextEditor();
        editor.setText("  hello\n  ");
        atom.commands.dispatch(atom.views.getView(editor), 'blackspace:newline-above');
        cursor = editor.getLastCursor();
        bufferText = editor.getText();
        bufferText = bufferText.replace(/\n/g, '=').replace(/\s/g, '-');
        expect(bufferText).toBe("--hello=--=");
        expect(cursor.getBufferRow()).toBe(1);
        return expect(cursor.getBufferColumn()).toBe(2);
      });
    });
  });

}).call(this);
