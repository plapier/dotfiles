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
    return it('moves the (auto inserted) whitespace from a blank line to the next line', function() {
      var bufferText, editor;
      editor = atom.workspace.getActiveTextEditor();
      editor.setText("  hello\n  ");
      atom.commands.dispatch(atom.views.getView(editor), 'blackspace:strip-auto-whitespace');
      bufferText = editor.getText();
      bufferText = bufferText.replace(/\n/g, '=').replace(/\s/g, '-');
      return expect(bufferText).toBe("--hello==--");
    });
  });

}).call(this);
