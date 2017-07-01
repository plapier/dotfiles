Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

// Public: GrammarUtils.Nim - a module which selects the right file to run for Nim projects
'use babel';

exports['default'] = {
  // Public: Find the right file to run
  //
  // * `file`    A {String} containing the current editor file
  //
  // Returns the {String} filepath of file to run

  projectDir: function projectDir(editorfile) {
    return _path2['default'].dirname(editorfile);
  },

  findNimProjectFile: function findNimProjectFile(editorfile) {
    if (_path2['default'].extname(editorfile) === '.nims') {
      // if we have an .nims file
      var tfile = editorfile.slice(0, -1);

      if (_fs2['default'].existsSync(tfile)) {
        // it has a corresponding .nim file. so thats a config file.
        // we run the .nim file instead.
        return _path2['default'].basename(tfile);
      }
      // it has no corresponding .nim file, it is a standalone script
      return _path2['default'].basename(editorfile);
    }

    // check if we are running on a file with config
    if (_fs2['default'].existsSync(editorfile + 's') || _fs2['default'].existsSync(editorfile + '.cfg') || _fs2['default'].existsSync(editorfile + 'cfg')) {
      return _path2['default'].basename(editorfile);
    }

    // assume we want to run a project
    // searching for the first file which has
    // a config file with the same name and
    // run this instead of the one in the editor
    // tab
    var filepath = _path2['default'].dirname(editorfile);
    var files = _fs2['default'].readdirSync(filepath);
    files.sort();
    for (var file of files) {
      var _name = filepath + '/' + file;
      if (_fs2['default'].statSync(_name).isFile()) {
        if (_path2['default'].extname(_name) === '.nims' || _path2['default'].extname(_name) === '.nimcgf' || _path2['default'].extname(_name) === '.cfg') {
          var tfile = _name.slice(0, -1);
          if (_fs2['default'].existsSync(tfile)) return _path2['default'].basename(tfile);
        }
      }
    }

    // just run what we got
    return _path2['default'].basename(editorfile);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9uaW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2tCQUVlLElBQUk7Ozs7b0JBQ0YsTUFBTTs7Ozs7QUFIdkIsV0FBVyxDQUFDOztxQkFNRzs7Ozs7OztBQU9iLFlBQVUsRUFBQSxvQkFBQyxVQUFVLEVBQUU7QUFDckIsV0FBTyxrQkFBSyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDakM7O0FBRUQsb0JBQWtCLEVBQUEsNEJBQUMsVUFBVSxFQUFFO0FBQzdCLFFBQUksa0JBQUssT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLE9BQU8sRUFBRTs7QUFFeEMsVUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdEMsVUFBSSxnQkFBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7OztBQUd4QixlQUFPLGtCQUFLLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUM3Qjs7QUFFRCxhQUFPLGtCQUFLLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNsQzs7O0FBR0QsUUFBSSxnQkFBRyxVQUFVLENBQUksVUFBVSxPQUFJLElBQy9CLGdCQUFHLFVBQVUsQ0FBSSxVQUFVLFVBQU8sSUFDbEMsZ0JBQUcsVUFBVSxDQUFJLFVBQVUsU0FBTSxFQUFFO0FBQ3JDLGFBQU8sa0JBQUssUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ2xDOzs7Ozs7O0FBT0QsUUFBTSxRQUFRLEdBQUcsa0JBQUssT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFDLFFBQU0sS0FBSyxHQUFHLGdCQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QyxTQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDYixTQUFLLElBQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtBQUN4QixVQUFNLEtBQUksR0FBTSxRQUFRLFNBQUksSUFBSSxBQUFFLENBQUM7QUFDbkMsVUFBSSxnQkFBRyxRQUFRLENBQUMsS0FBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDOUIsWUFBSSxrQkFBSyxPQUFPLENBQUMsS0FBSSxDQUFDLEtBQUssT0FBTyxJQUM5QixrQkFBSyxPQUFPLENBQUMsS0FBSSxDQUFDLEtBQUssU0FBUyxJQUNoQyxrQkFBSyxPQUFPLENBQUMsS0FBSSxDQUFDLEtBQUssTUFBTSxFQUFFO0FBQ2pDLGNBQU0sS0FBSyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsY0FBSSxnQkFBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxrQkFBSyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkQ7T0FDRjtLQUNGOzs7QUFHRCxXQUFPLGtCQUFLLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUNsQztDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9uaW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBQdWJsaWM6IEdyYW1tYXJVdGlscy5OaW0gLSBhIG1vZHVsZSB3aGljaCBzZWxlY3RzIHRoZSByaWdodCBmaWxlIHRvIHJ1biBmb3IgTmltIHByb2plY3RzXG5leHBvcnQgZGVmYXVsdCB7XG4gIC8vIFB1YmxpYzogRmluZCB0aGUgcmlnaHQgZmlsZSB0byBydW5cbiAgLy9cbiAgLy8gKiBgZmlsZWAgICAgQSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBjdXJyZW50IGVkaXRvciBmaWxlXG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIHtTdHJpbmd9IGZpbGVwYXRoIG9mIGZpbGUgdG8gcnVuXG5cbiAgcHJvamVjdERpcihlZGl0b3JmaWxlKSB7XG4gICAgcmV0dXJuIHBhdGguZGlybmFtZShlZGl0b3JmaWxlKTtcbiAgfSxcblxuICBmaW5kTmltUHJvamVjdEZpbGUoZWRpdG9yZmlsZSkge1xuICAgIGlmIChwYXRoLmV4dG5hbWUoZWRpdG9yZmlsZSkgPT09ICcubmltcycpIHtcbiAgICAgIC8vIGlmIHdlIGhhdmUgYW4gLm5pbXMgZmlsZVxuICAgICAgY29uc3QgdGZpbGUgPSBlZGl0b3JmaWxlLnNsaWNlKDAsIC0xKTtcblxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmModGZpbGUpKSB7XG4gICAgICAgIC8vIGl0IGhhcyBhIGNvcnJlc3BvbmRpbmcgLm5pbSBmaWxlLiBzbyB0aGF0cyBhIGNvbmZpZyBmaWxlLlxuICAgICAgICAvLyB3ZSBydW4gdGhlIC5uaW0gZmlsZSBpbnN0ZWFkLlxuICAgICAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSh0ZmlsZSk7XG4gICAgICB9XG4gICAgICAvLyBpdCBoYXMgbm8gY29ycmVzcG9uZGluZyAubmltIGZpbGUsIGl0IGlzIGEgc3RhbmRhbG9uZSBzY3JpcHRcbiAgICAgIHJldHVybiBwYXRoLmJhc2VuYW1lKGVkaXRvcmZpbGUpO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIHdlIGFyZSBydW5uaW5nIG9uIGEgZmlsZSB3aXRoIGNvbmZpZ1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGAke2VkaXRvcmZpbGV9c2ApIHx8XG4gICAgICAgIGZzLmV4aXN0c1N5bmMoYCR7ZWRpdG9yZmlsZX0uY2ZnYCkgfHxcbiAgICAgICAgZnMuZXhpc3RzU3luYyhgJHtlZGl0b3JmaWxlfWNmZ2ApKSB7XG4gICAgICByZXR1cm4gcGF0aC5iYXNlbmFtZShlZGl0b3JmaWxlKTtcbiAgICB9XG5cbiAgICAvLyBhc3N1bWUgd2Ugd2FudCB0byBydW4gYSBwcm9qZWN0XG4gICAgLy8gc2VhcmNoaW5nIGZvciB0aGUgZmlyc3QgZmlsZSB3aGljaCBoYXNcbiAgICAvLyBhIGNvbmZpZyBmaWxlIHdpdGggdGhlIHNhbWUgbmFtZSBhbmRcbiAgICAvLyBydW4gdGhpcyBpbnN0ZWFkIG9mIHRoZSBvbmUgaW4gdGhlIGVkaXRvclxuICAgIC8vIHRhYlxuICAgIGNvbnN0IGZpbGVwYXRoID0gcGF0aC5kaXJuYW1lKGVkaXRvcmZpbGUpO1xuICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZmlsZXBhdGgpO1xuICAgIGZpbGVzLnNvcnQoKTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBgJHtmaWxlcGF0aH0vJHtmaWxlfWA7XG4gICAgICBpZiAoZnMuc3RhdFN5bmMobmFtZSkuaXNGaWxlKCkpIHtcbiAgICAgICAgaWYgKHBhdGguZXh0bmFtZShuYW1lKSA9PT0gJy5uaW1zJyB8fFxuICAgICAgICAgICAgcGF0aC5leHRuYW1lKG5hbWUpID09PSAnLm5pbWNnZicgfHxcbiAgICAgICAgICAgIHBhdGguZXh0bmFtZShuYW1lKSA9PT0gJy5jZmcnKSB7XG4gICAgICAgICAgY29uc3QgdGZpbGUgPSBuYW1lLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyh0ZmlsZSkpIHJldHVybiBwYXRoLmJhc2VuYW1lKHRmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGp1c3QgcnVuIHdoYXQgd2UgZ290XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUoZWRpdG9yZmlsZSk7XG4gIH0sXG59O1xuIl19