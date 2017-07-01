(function() {
  var getSearchTerm, _;

  _ = require('underscore-plus');

  getSearchTerm = function(term, modifiers) {
    var char, escaped, hasC, hasc, modFlags, term_, _i, _len;
    if (modifiers == null) {
      modifiers = {
        'g': true
      };
    }
    escaped = false;
    hasc = false;
    hasC = false;
    term_ = term;
    term = '';
    for (_i = 0, _len = term_.length; _i < _len; _i++) {
      char = term_[_i];
      if (char === '\\' && !escaped) {
        escaped = true;
        term += char;
      } else {
        if (char === 'c' && escaped) {
          hasc = true;
          term = term.slice(0, -1);
        } else if (char === 'C' && escaped) {
          hasC = true;
          term = term.slice(0, -1);
        } else if (char !== '\\') {
          term += char;
        }
        escaped = false;
      }
    }
    if (hasC) {
      modifiers['i'] = false;
    }
    if ((!hasC && !term.match('[A-Z]') && atom.config.get("vim-mode:useSmartcaseForSearch")) || hasc) {
      modifiers['i'] = true;
    }
    modFlags = Object.keys(modifiers).filter(function(key) {
      return modifiers[key];
    }).join('');
    try {
      return new RegExp(term, modFlags);
    } catch (_error) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  };

  module.exports = {
    findInBuffer: function(buffer, pattern) {
      var found;
      found = [];
      buffer.scan(new RegExp(pattern, 'g'), function(obj) {
        return found.push(obj.range);
      });
      return found;
    },
    findNextInBuffer: function(buffer, curPos, pattern) {
      var found, i, more;
      found = this.findInBuffer(buffer, pattern);
      more = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = found.length; _i < _len; _i++) {
          i = found[_i];
          if (i.compare([curPos, curPos]) === 1) {
            _results.push(i);
          }
        }
        return _results;
      })();
      if (more.length > 0) {
        return more[0].start.row;
      } else if (found.length > 0) {
        return found[0].start.row;
      } else {
        return null;
      }
    },
    findPreviousInBuffer: function(buffer, curPos, pattern) {
      var found, i, less;
      found = this.findInBuffer(buffer, pattern);
      less = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = found.length; _i < _len; _i++) {
          i = found[_i];
          if (i.compare([curPos, curPos]) === -1) {
            _results.push(i);
          }
        }
        return _results;
      })();
      if (less.length > 0) {
        return less[less.length - 1].start.row;
      } else if (found.length > 0) {
        return found[found.length - 1].start.row;
      } else {
        return null;
      }
    },
    scanEditor: function(term, editor, position, reverse) {
      var rangesAfter, rangesBefore, _ref;
      if (reverse == null) {
        reverse = false;
      }
      _ref = [[], []], rangesBefore = _ref[0], rangesAfter = _ref[1];
      editor.scan(getSearchTerm(term), function(_arg) {
        var isBefore, range;
        range = _arg.range;
        if (reverse) {
          isBefore = range.start.compare(position) < 0;
        } else {
          isBefore = range.start.compare(position) <= 0;
        }
        if (isBefore) {
          return rangesBefore.push(range);
        } else {
          return rangesAfter.push(range);
        }
      });
      if (reverse) {
        return rangesAfter.concat(rangesBefore).reverse();
      } else {
        return rangesAfter.concat(rangesBefore);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9maW5kLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBRUEsYUFBQSxHQUFnQixTQUFDLElBQUQsRUFBTyxTQUFQLEdBQUE7QUFFZCxRQUFBLG9EQUFBOztNQUZxQixZQUFZO0FBQUEsUUFBQyxHQUFBLEVBQUssSUFBTjs7S0FFakM7QUFBQSxJQUFBLE9BQUEsR0FBVSxLQUFWLENBQUE7QUFBQSxJQUNBLElBQUEsR0FBTyxLQURQLENBQUE7QUFBQSxJQUVBLElBQUEsR0FBTyxLQUZQLENBQUE7QUFBQSxJQUdBLEtBQUEsR0FBUSxJQUhSLENBQUE7QUFBQSxJQUlBLElBQUEsR0FBTyxFQUpQLENBQUE7QUFLQSxTQUFBLDRDQUFBO3VCQUFBO0FBQ0UsTUFBQSxJQUFHLElBQUEsS0FBUSxJQUFSLElBQWlCLENBQUEsT0FBcEI7QUFDRSxRQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFBQSxRQUNBLElBQUEsSUFBUSxJQURSLENBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxJQUFHLElBQUEsS0FBUSxHQUFSLElBQWdCLE9BQW5CO0FBQ0UsVUFBQSxJQUFBLEdBQU8sSUFBUCxDQUFBO0FBQUEsVUFDQSxJQUFBLEdBQU8sSUFBSyxhQURaLENBREY7U0FBQSxNQUdLLElBQUcsSUFBQSxLQUFRLEdBQVIsSUFBZ0IsT0FBbkI7QUFDSCxVQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxJQUFLLGFBRFosQ0FERztTQUFBLE1BR0EsSUFBRyxJQUFBLEtBQVUsSUFBYjtBQUNI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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/ex-mode/lib/find.coffee
