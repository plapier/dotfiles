(function() {
  var Base, _, excludeProperties, extractBetween, formatKeymaps, formatReport, genTableOfContent, generateIntrospectionReport, getAncestors, getCommandFromClass, getKeyBindingForCommand, inspectFunction, inspectInstance, inspectObject, packageName, ref, report, sortByAncesstor, util,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = require('util');

  _ = require('underscore-plus');

  Base = require('./base');

  ref = require('./utils'), getAncestors = ref.getAncestors, getKeyBindingForCommand = ref.getKeyBindingForCommand;

  packageName = 'vim-mode-plus';

  extractBetween = function(str, s1, s2) {
    return str.substring(str.indexOf(s1) + 1, str.lastIndexOf(s2));
  };

  inspectFunction = function(fn, name) {
    var args, argumentsSignature, defaultConstructor, fnArgs, fnBody, fnString, j, len, line, m, superAsIs, superBase, superSignature, superWithModify;
    superBase = _.escapeRegExp(fn.name + ".__super__." + name);
    superAsIs = superBase + _.escapeRegExp(".apply(this, arguments);");
    defaultConstructor = '^return ' + superAsIs;
    superWithModify = superBase + '\\.call\\((.*)\\)';
    fnString = fn.toString();
    fnBody = extractBetween(fnString, '{', '}').split("\n").map(function(e) {
      return e.trim();
    });
    fnArgs = fnString.split("\n")[0].match(/\((.*)\)/)[1].split(/,\s*/g);
    fnArgs = fnArgs.map(function(arg) {
      var iVarAssign;
      iVarAssign = '^' + _.escapeRegExp("this." + arg + " = " + arg + ";") + '$';
      if (_.detect(fnBody, function(line) {
        return line.match(iVarAssign);
      })) {
        return '@' + arg;
      } else {
        return arg;
      }
    });
    argumentsSignature = '(' + fnArgs.join(', ') + ')';
    superSignature = null;
    for (j = 0, len = fnBody.length; j < len; j++) {
      line = fnBody[j];
      if (name === 'constructor' && line.match(defaultConstructor)) {
        superSignature = 'default';
      } else if (line.match(superAsIs)) {
        superSignature = 'super';
      } else if (m = line.match(superWithModify)) {
        args = m[1].replace(/this,?\s*/, '');
        args = args.replace(/this\./g, '@');
        superSignature = "super(" + args + ")";
      }
      if (superSignature) {
        break;
      }
    }
    return {
      argumentsSignature: argumentsSignature,
      superSignature: superSignature
    };
  };

  excludeProperties = ['__super__'];

  inspectObject = function(obj, options, prototype) {
    var ancesstors, argumentsSignature, excludeList, isOverridden, prefix, prop, ref1, ref2, results, s, superSignature, value;
    if (options == null) {
      options = {};
    }
    if (prototype == null) {
      prototype = false;
    }
    excludeList = excludeProperties.concat((ref1 = options.excludeProperties) != null ? ref1 : []);
    if (options.depth == null) {
      options.depth = 1;
    }
    prefix = '@';
    if (prototype) {
      obj = obj.prototype;
      prefix = '::';
    }
    ancesstors = getAncestors(obj.constructor);
    ancesstors.shift();
    results = [];
    for (prop in obj) {
      if (!hasProp.call(obj, prop)) continue;
      value = obj[prop];
      if (!(indexOf.call(excludeList, prop) < 0)) {
        continue;
      }
      s = "- " + prefix + prop;
      if (value instanceof options.recursiveInspect) {
        s += ":\n" + (inspectInstance(value, options));
      } else if (_.isFunction(value)) {
        ref2 = inspectFunction(value, prop), argumentsSignature = ref2.argumentsSignature, superSignature = ref2.superSignature;
        if ((prop === 'constructor') && (superSignature === 'default')) {
          continue;
        }
        s += "`" + argumentsSignature + "`";
        if (superSignature != null) {
          s += ": `" + superSignature + "`";
        }
      } else {
        s += ": ```" + (util.inspect(value, options)) + "```";
      }
      isOverridden = _.detect(ancesstors, function(ancestor) {
        return ancestor.prototype.hasOwnProperty(prop);
      });
      if (isOverridden) {
        s += ": **Overridden**";
      }
      results.push(s);
    }
    if (!results.length) {
      return null;
    }
    return results.join('\n');
  };

  report = function(obj, options) {
    var name;
    if (options == null) {
      options = {};
    }
    name = obj.name;
    return {
      name: name,
      ancesstorsNames: _.pluck(getAncestors(obj), 'name'),
      command: getCommandFromClass(obj),
      instance: inspectObject(obj, options),
      prototype: inspectObject(obj, options, true)
    };
  };

  sortByAncesstor = function(list) {
    var compare, mapped;
    mapped = list.map(function(obj, i) {
      return {
        index: i,
        value: obj.ancesstorsNames.slice().reverse()
      };
    });
    compare = function(v1, v2) {
      var a, b;
      a = v1.value[0];
      b = v2.value[0];
      switch (false) {
        case !((a === void 0) && (b === void 0)):
          return 0;
        case a !== void 0:
          return -1;
        case b !== void 0:
          return 1;
        case !(a < b):
          return -1;
        case !(a > b):
          return 1;
        default:
          a = {
            index: v1.index,
            value: v1.value.slice(1)
          };
          b = {
            index: v2.index,
            value: v2.value.slice(1)
          };
          return compare(a, b);
      }
    };
    return mapped.sort(compare).map(function(e) {
      return list[e.index];
    });
  };

  genTableOfContent = function(obj) {
    var ancesstorsNames, indent, indentLevel, link, name, s;
    name = obj.name, ancesstorsNames = obj.ancesstorsNames;
    indentLevel = ancesstorsNames.length - 1;
    indent = _.multiplyString('  ', indentLevel);
    link = ancesstorsNames.slice(0, 2).join('--').toLowerCase();
    s = indent + "- [" + name + "](#" + link + ")";
    if (obj.virtual != null) {
      s += ' *Not exported*';
    }
    return s;
  };

  generateIntrospectionReport = function(klasses, options) {
    var ancesstors, body, command, content, date, header, instance, j, keymaps, klass, len, pack, prototype, result, results, s, toc, version;
    pack = atom.packages.getActivePackage(packageName);
    version = pack.metadata.version;
    results = (function() {
      var j, len, results1;
      results1 = [];
      for (j = 0, len = klasses.length; j < len; j++) {
        klass = klasses[j];
        results1.push(report(klass, options));
      }
      return results1;
    })();
    results = sortByAncesstor(results);
    toc = results.map(function(e) {
      return genTableOfContent(e);
    }).join('\n');
    body = [];
    for (j = 0, len = results.length; j < len; j++) {
      result = results[j];
      ancesstors = result.ancesstorsNames.slice(0, 2);
      header = "#" + (_.multiplyString('#', ancesstors.length)) + " " + (ancesstors.join(" < "));
      s = [];
      s.push(header);
      command = result.command, instance = result.instance, prototype = result.prototype;
      if (command != null) {
        s.push("- command: `" + command + "`");
        keymaps = getKeyBindingForCommand(command, {
          packageName: 'vim-mode-plus'
        });
        if (keymaps != null) {
          s.push(formatKeymaps(keymaps));
        }
      }
      if (instance != null) {
        s.push(instance);
      }
      if (prototype != null) {
        s.push(prototype);
      }
      body.push(s.join("\n"));
    }
    date = new Date().toISOString();
    content = [packageName + " version: " + version + "  \n*generated at " + date + "*", toc, body.join("\n\n")].join("\n\n");
    return atom.workspace.open().then(function(editor) {
      editor.setText(content);
      return editor.setGrammar(atom.grammars.grammarForScopeName('source.gfm'));
    });
  };

  formatKeymaps = function(keymaps) {
    var j, keymap, keystrokes, len, s, selector;
    s = [];
    s.push('  - keymaps');
    for (j = 0, len = keymaps.length; j < len; j++) {
      keymap = keymaps[j];
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/(`|_)/g, '\\$1');
      s.push("    - `" + selector + "`: <kbd>" + keystrokes + "</kbd>");
    }
    return s.join("\n");
  };

  formatReport = function(report) {
    var ancesstorsNames, instance, prototype, s;
    instance = report.instance, prototype = report.prototype, ancesstorsNames = report.ancesstorsNames;
    s = [];
    s.push("# " + (ancesstorsNames.join(" < ")));
    if (instance != null) {
      s.push(instance);
    }
    if (prototype != null) {
      s.push(prototype);
    }
    return s.join("\n");
  };

  inspectInstance = function(obj, options) {
    var indent, ref1, rep;
    if (options == null) {
      options = {};
    }
    indent = _.multiplyString(' ', (ref1 = options.indent) != null ? ref1 : 0);
    rep = report(obj.constructor, options);
    return ["## " + obj + ": " + (rep.ancesstorsNames.slice(0, 2).join(" < ")), inspectObject(obj, options), formatReport(rep)].filter(function(e) {
      return e;
    }).join('\n').split('\n').map(function(e) {
      return indent + e;
    }).join('\n');
  };

  getCommandFromClass = function(klass) {
    if (klass.isCommand()) {
      return klass.getCommandName();
    } else {
      return null;
    }
  };

  module.exports = generateIntrospectionReport;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9pbnRyb3NwZWN0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscVJBQUE7SUFBQTs7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLE1BQTBDLE9BQUEsQ0FBUSxTQUFSLENBQTFDLEVBQUMsK0JBQUQsRUFBZTs7RUFFZixXQUFBLEdBQWM7O0VBRWQsY0FBQSxHQUFpQixTQUFDLEdBQUQsRUFBTSxFQUFOLEVBQVUsRUFBVjtXQUNmLEdBQUcsQ0FBQyxTQUFKLENBQWMsR0FBRyxDQUFDLE9BQUosQ0FBWSxFQUFaLENBQUEsR0FBZ0IsQ0FBOUIsRUFBaUMsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsRUFBaEIsQ0FBakM7RUFEZTs7RUFHakIsZUFBQSxHQUFrQixTQUFDLEVBQUQsRUFBSyxJQUFMO0FBYWhCLFFBQUE7SUFBQSxTQUFBLEdBQVksQ0FBQyxDQUFDLFlBQUYsQ0FBa0IsRUFBRSxDQUFDLElBQUosR0FBUyxhQUFULEdBQXNCLElBQXZDO0lBQ1osU0FBQSxHQUFZLFNBQUEsR0FBWSxDQUFDLENBQUMsWUFBRixDQUFlLDBCQUFmO0lBQ3hCLGtCQUFBLEdBQXFCLFVBQUEsR0FBYTtJQUNsQyxlQUFBLEdBQWtCLFNBQUEsR0FBWTtJQUU5QixRQUFBLEdBQVcsRUFBRSxDQUFDLFFBQUgsQ0FBQTtJQUNYLE1BQUEsR0FBUyxjQUFBLENBQWUsUUFBZixFQUF5QixHQUF6QixFQUE4QixHQUE5QixDQUFrQyxDQUFDLEtBQW5DLENBQXlDLElBQXpDLENBQThDLENBQUMsR0FBL0MsQ0FBbUQsU0FBQyxDQUFEO2FBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBQTtJQUFQLENB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S0FBSyxDQUFDLGNBQU4sQ0FBQSxFQUExQjtLQUFBLE1BQUE7YUFBc0QsS0FBdEQ7O0VBRG9COztFQUd0QixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWxNakIiLCJzb3VyY2VzQ29udGVudCI6WyJ1dGlsID0gcmVxdWlyZSAndXRpbCdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xue2dldEFuY2VzdG9ycywgZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmR9ID0gcmVxdWlyZSAnLi91dGlscydcblxucGFja2FnZU5hbWUgPSAndmltLW1vZGUtcGx1cydcblxuZXh0cmFjdEJldHdlZW4gPSAoc3RyLCBzMSwgczIpIC0+XG4gIHN0ci5zdWJzdHJpbmcoc3RyLmluZGV4T2YoczEpKzEsIHN0ci5sYXN0SW5kZXhPZihzMikpXG5cbmluc3BlY3RGdW5jdGlvbiA9IChmbiwgbmFtZSkgLT5cbiAgIyBDYWxsaW5nIHN1cGVyIGluIHRoZSBvdmVycmlkZGVuIGNvbnN0cnVjdG9yKCkgZnVuY3Rpb24uXG4gICMgIENhc2UtMTogTm8gb3ZlcnJpZGUuXG4gICMgIENvZmZlZVNjcmlwdCBTb3VyY2U6IE4vQVxuICAjICBDb21waWxlZCBKYXZhU2NyaXB0OiByZXR1cm4gQzEuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICNcbiAgIyAgQ2FzZS0yOiBzdXBlciB3aXRob3V0IHBhcmVudGhlc2VzLlxuICAjICBDb2ZmZWVTY3JpcHQgU291cmNlOiBzdXBlclxuICAjICBDb21waWxlZCBKYXZhU2NyaXB0OiBDMS5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgI1xuICAjICBDYXNlLTM6IHN1cGVyIHdpdGggZXhwbGljaXQgYXJndW1lbnQuXG4gICMgIENvZmZlZVNjcmlwdCBTb3VyY2U6IHN1cGVyKGExKVxuICAjICBDb21waWxlZCBKYXZhU2NyaXB0OiBDMS5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBhMSk7XG4gIHN1cGVyQmFzZSA9IF8uZXNjYXBlUmVnRXhwKFwiI3tmbi5uYW1lfS5fX3N1cGVyX18uI3tuYW1lfVwiKVxuICBzdXBlckFzSXMgPSBzdXBlckJhc2UgKyBfLmVzY2FwZVJlZ0V4cChcIi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1wiKSAjIENhc2UtMlxuICBkZWZhdWx0Q29uc3RydWN0b3IgPSAnXnJldHVybiAnKyAgc3VwZXJBc0lzICMgQ2FzZS0xXG4gIHN1cGVyV2l0aE1vZGlmeSA9IHN1cGVyQmFzZSArICdcXFxcLmNhbGxcXFxcKCguKilcXFxcKScgIyBDYXNlLTNcblxuICBmblN0cmluZyA9IGZuLnRvU3RyaW5nKClcbiAgZm5Cb2R5ID0gZXh0cmFjdEJldHdlZW4oZm5TdHJpbmcsICd7JywgJ30nKS5zcGxpdChcIlxcblwiKS5tYXAgKGUpIC0+IGUudHJpbSgpXG5cbiAgIyBFeHRyYWN0IGFyZ3VtZW50cyBmcm9tIGZuU3RyaW5nLiBlLmcuIGZ1bmN0aW9uKGExLCBhMSl7fSAtPiBbJ2ExJywgJ2EyJ10uXG4gIGZuQXJncyA9IGZuU3RyaW5nLnNwbGl0KFwiXFxuXCIpWzBdLm1hdGNoKC9cXCgoLiopXFwpLylbMV0uc3BsaXQoLyxcXHMqL2cpXG5cbiAgIyBSZXBsYWNlIFsnYXJnMScsICdhcmcyJ10gdG8gWydAYXJnMScsICdAYXJnMiddLlxuICAjIE9ubHkgd2hlbiBpbnN0YW5jZSB2YXJpYWJsZSBhc3NpZ25tZW50IHN0YXRlbWVudCB3YXMgZm91bmQuXG4gIGZuQXJncyA9IGZuQXJncy5tYXAgKGFyZykgLT5cbiAgICBpVmFyQXNzaWduID0gJ14nICsgXy5lc2NhcGVSZWdFeHAoXCJ0aGlzLiN7YXJnfSA9ICN7YXJnfTtcIikgKyAnJCdcbiAgICBpZiAoXy5kZXRlY3QoZm5Cb2R5LCAobGluZSkgLT4gbGluZS5tYXRjaChpVmFyQXNzaWduKSkpXG4gICAgICAnQCcgKyBhcmdcbiAgICBlbHNlXG4gICAgICBhcmdcbiAgYXJndW1lbnRzU2lnbmF0dXJlID0gJygnICsgZm5BcmdzLmpvaW4oJywgJykgKyAnKSdcblxuICBzdXBlclNpZ25hdHVyZSA9IG51bGxcbiAgZm9yIGxpbmUgaW4gZm5Cb2R5XG4gICAgaWYgbmFtZSBpcyAnY29uc3RydWN0b3InIGFuZCBsaW5lLm1hdGNoKGRlZmF1bHRDb25zdHJ1Y3RvcilcbiAgICAgIHN1cGVyU2lnbmF0dXJlID0gJ2RlZmF1bHQnXG4gICAgZWxzZSBpZiBsaW5lLm1hdGNoKHN1cGVyQXNJcylcbiAgICAgIHN1cGVyU2lnbmF0dXJlID0gJ3N1cGVyJ1xuICAgIGVsc2UgaWYgbSA9IGxpbmUubWF0Y2goc3VwZXJXaXRoTW9kaWZ5KVxuICAgICAgYXJncyA9IG1bMV0ucmVwbGFjZSgvdGhpcyw/XFxzKi8sICcnKSAjIERlbGV0ZSAxc3QgYXJnKD10aGlzKSBvZiBhcHBseSgpIG9yIGNhbGwoKVxuICAgICAgYXJncyA9IGFyZ3MucmVwbGFjZSgvdGhpc1xcLi9nLCAnQCcpXG4gICAgICBzdXBlclNpZ25hdHVyZSA9IFwic3VwZXIoI3thcmdzfSlcIlxuICAgIGJyZWFrIGlmIHN1cGVyU2lnbmF0dXJlXG5cbiAge2FyZ3VtZW50c1NpZ25hdHVyZSwgc3VwZXJTaWduYXR1cmV9XG5cbmV4Y2x1ZGVQcm9wZXJ0aWVzID0gWydfX3N1cGVyX18nXVxuXG5pbnNwZWN0T2JqZWN0ID0gKG9iaiwgb3B0aW9ucz17fSwgcHJvdG90eXBlPWZhbHNlKSAtPlxuICBleGNsdWRlTGlzdCA9IGV4Y2x1ZGVQcm9wZXJ0aWVzLmNvbmNhdCAob3B0aW9ucy5leGNsdWRlUHJvcGVydGllcyA/IFtdKVxuICBvcHRpb25zLmRlcHRoID89IDFcbiAgcHJlZml4ID0gJ0AnXG4gIGlmIHByb3RvdHlwZVxuICAgIG9iaiA9IG9iai5wcm90b3R5cGVcbiAgICBwcmVmaXggPSAnOjonXG4gIGFuY2Vzc3RvcnMgPSBnZXRBbmNlc3RvcnMob2JqLmNvbnN0cnVjdG9yKVxuICBhbmNlc3N0b3JzLnNoaWZ0KCkgIyBkcm9wIG15c2VsZi5cbiAgcmVzdWx0cyA9IFtdXG4gIGZvciBvd24gcHJvcCwgdmFsdWUgb2Ygb2JqIHdoZW4gcHJvcCBub3QgaW4gZXhjbHVkZUxpc3RcbiAgICBzID0gXCItICN7cHJlZml4fSN7cHJvcH1cIlxuICAgIGlmIHZhbHVlIGluc3RhbmNlb2Ygb3B0aW9ucy5yZWN1cnNpdmVJbnNwZWN0XG4gICAgICBzICs9IFwiOlxcbiN7aW5zcGVjdEluc3RhbmNlKHZhbHVlLCBvcHRpb25zKX1cIlxuICAgIGVsc2UgaWYgXy5pc0Z1bmN0aW9uKHZhbHVlKVxuICAgICAge2FyZ3VtZW50c1NpZ25hdHVyZSwgc3VwZXJTaWduYXR1cmV9ID0gaW5zcGVjdEZ1bmN0aW9uKHZhbHVlLCBwcm9wKVxuICAgICAgaWYgKHByb3AgaXMgJ2NvbnN0cnVjdG9yJykgYW5kIChzdXBlclNpZ25hdHVyZSBpcyAnZGVmYXVsdCcpXG4gICAgICAgIGNvbnRpbnVlICMgaGlkZSBkZWZhdWx0IGNvbnN0cnVjdG9yXG4gICAgICBzICs9IFwiYCN7YXJndW1lbnRzU2lnbmF0dXJlfWBcIlxuICAgICAgcyArPSBcIjogYCN7c3VwZXJTaWduYXR1cmV9YFwiIGlmIHN1cGVyU2lnbmF0dXJlP1xuICAgIGVsc2VcbiAgICAgIHMgKz0gXCI6IGBgYCN7dXRpbC5pbnNwZWN0KHZhbHVlLCBvcHRpb25zKX1gYGBcIlxuICAgIGlzT3ZlcnJpZGRlbiA9IF8uZGV0ZWN0KGFuY2Vzc3RvcnMsIChhbmNlc3RvcikgLT4gYW5jZXN0b3I6Oi5oYXNPd25Qcm9wZXJ0eShwcm9wKSlcbiAgICBzICs9IFwiOiAqKk92ZXJyaWRkZW4qKlwiIGlmIGlzT3ZlcnJpZGRlblxuICAgIHJlc3VsdHMucHVzaCBzXG5cbiAgcmV0dXJuIG51bGwgdW5sZXNzIHJlc3VsdHMubGVuZ3RoXG4gIHJlc3VsdHMuam9pbignXFxuJylcblxucmVwb3J0ID0gKG9iaiwgb3B0aW9ucz17fSkgLT5cbiAgbmFtZSA9IG9iai5uYW1lXG4gIHtcbiAgICBuYW1lOiBuYW1lXG4gICAgYW5jZXNzdG9yc05hbWVzOiBfLnBsdWNrKGdldEFuY2VzdG9ycyhvYmopLCAnbmFtZScpXG4gICAgY29tbWFuZDogZ2V0Q29tbWFuZEZyb21DbGFzcyhvYmopXG4gICAgaW5zdGFuY2U6IGluc3BlY3RPYmplY3Qob2JqLCBvcHRpb25zKVxuICAgIHByb3RvdHlwZTogaW5zcGVjdE9iamVjdChvYmosIG9wdGlvbnMsIHRydWUpXG4gIH1cblxuc29ydEJ5QW5jZXNzdG9yID0gKGxpc3QpIC0+XG4gIG1hcHBlZCA9IGxpc3QubWFwIChvYmosIGkpIC0+XG4gICAge2luZGV4OiBpLCB2YWx1ZTogb2JqLmFuY2Vzc3RvcnNOYW1lcy5zbGljZSgpLnJldmVyc2UoKX1cblxuICBjb21wYXJlID0gKHYxLCB2MikgLT5cbiAgICBhID0gdjEudmFsdWVbMF1cbiAgICBiID0gdjIudmFsdWVbMF1cbiAgICBzd2l0Y2hcbiAgICAgIHdoZW4gKGEgaXMgdW5kZWZpbmVkKSBhbmQgKGIgaXMgdW5kZWZpbmVkKSB0aGVuICAwXG4gICAgICB3aGVuIGEgaXMgdW5kZWZpbmVkIHRoZW4gLTFcbiAgICAgIHdoZW4gYiBpcyB1bmRlZmluZWQgdGhlbiAxXG4gICAgICB3aGVuIGEgPCBiIHRoZW4gLTFcbiAgICAgIHdoZW4gYSA+IGIgdGhlbiAxXG4gICAgICBlbHNlXG4gICAgICAgIGEgPSBpbmRleDogdjEuaW5kZXgsIHZhbHVlOiB2MS52YWx1ZVsxLi5dXG4gICAgICAgIGIgPSBpbmRleDogdjIuaW5kZXgsIHZhbHVlOiB2Mi52YWx1ZVsxLi5dXG4gICAgICAgIGNvbXBhcmUoYSwgYilcblxuICBtYXBwZWQuc29ydChjb21wYXJlKS5tYXAoKGUpIC0+IGxpc3RbZS5pbmRleF0pXG5cbmdlblRhYmxlT2ZDb250ZW50ID0gKG9iaikgLT5cbiAge25hbWUsIGFuY2Vzc3RvcnNOYW1lc30gPSBvYmpcbiAgaW5kZW50TGV2ZWwgPSBhbmNlc3N0b3JzTmFtZXMubGVuZ3RoIC0gMVxuICBpbmRlbnQgPSBfLm11bHRpcGx5U3RyaW5nKCcgICcsIGluZGVudExldmVsKVxuICBsaW5rID0gYW5jZXNzdG9yc05hbWVzWzAuLjFdLmpvaW4oJy0tJykudG9Mb3dlckNhc2UoKVxuICBzID0gXCIje2luZGVudH0tIFsje25hbWV9XSgjI3tsaW5rfSlcIlxuICBzICs9ICcgKk5vdCBleHBvcnRlZConIGlmIG9iai52aXJ0dWFsP1xuICBzXG5cbmdlbmVyYXRlSW50cm9zcGVjdGlvblJlcG9ydCA9IChrbGFzc2VzLCBvcHRpb25zKSAtPlxuICBwYWNrID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKHBhY2thZ2VOYW1lKVxuICB7dmVyc2lvbn0gPSBwYWNrLm1ldGFkYXRhXG5cbiAgcmVzdWx0cyA9IChyZXBvcnQoa2xhc3MsIG9wdGlvbnMpIGZvciBrbGFzcyBpbiBrbGFzc2VzKVxuICByZXN1bHRzID0gc29ydEJ5QW5jZXNzdG9yKHJlc3VsdHMpXG5cbiAgdG9jID0gcmVzdWx0cy5tYXAoKGUpIC0+IGdlblRhYmxlT2ZDb250ZW50KGUpKS5qb2luKCdcXG4nKVxuICBib2R5ID0gW11cbiAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgYW5jZXNzdG9ycyA9IHJlc3VsdC5hbmNlc3N0b3JzTmFtZXNbMC4uMV1cbiAgICBoZWFkZXIgPSBcIiMje18ubXVsdGlwbHlTdHJpbmcoJyMnLCBhbmNlc3N0b3JzLmxlbmd0aCl9ICN7YW5jZXNzdG9ycy5qb2luKFwiIDwgXCIpfVwiXG4gICAgcyA9IFtdXG4gICAgcy5wdXNoIGhlYWRlclxuICAgIHtjb21tYW5kLCBpbnN0YW5jZSwgcHJvdG90eXBlfSA9IHJlc3VsdFxuICAgIGlmIGNvbW1hbmQ/XG4gICAgICBzLnB1c2ggXCItIGNvbW1hbmQ6IGAje2NvbW1hbmR9YFwiXG4gICAgICBrZXltYXBzID0gZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmQoY29tbWFuZCwgcGFja2FnZU5hbWU6ICd2aW0tbW9kZS1wbHVzJylcbiAgICAgIHMucHVzaCBmb3JtYXRLZXltYXBzKGtleW1hcHMpIGlmIGtleW1hcHM/XG5cbiAgICBzLnB1c2ggaW5zdGFuY2UgaWYgaW5zdGFuY2U/XG4gICAgcy5wdXNoIHByb3RvdHlwZSBpZiBwcm90b3R5cGU/XG4gICAgYm9keS5wdXNoIHMuam9pbihcIlxcblwiKVxuXG4gIGRhdGUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgY29udGVudCA9IFtcbiAgICBcIiN7cGFja2FnZU5hbWV9IHZlcnNpb246ICN7dmVyc2lvbn0gIFxcbipnZW5lcmF0ZWQgYXQgI3tkYXRlfSpcIlxuICAgIHRvY1xuICAgIGJvZHkuam9pbihcIlxcblxcblwiKVxuICBdLmpvaW4oXCJcXG5cXG5cIilcblxuICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZWRpdG9yKSAtPlxuICAgIGVkaXRvci5zZXRUZXh0IGNvbnRlbnRcbiAgICBlZGl0b3Iuc2V0R3JhbW1hciBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5nZm0nKVxuXG5mb3JtYXRLZXltYXBzID0gKGtleW1hcHMpIC0+XG4gIHMgPSBbXVxuICBzLnB1c2ggJyAgLSBrZXltYXBzJ1xuICBmb3Iga2V5bWFwIGluIGtleW1hcHNcbiAgICB7a2V5c3Ryb2tlcywgc2VsZWN0b3J9ID0ga2V5bWFwXG4gICAga2V5c3Ryb2tlcyA9IGtleXN0cm9rZXMucmVwbGFjZSgvKGB8XykvZywgJ1xcXFwkMScpXG4gICAgcy5wdXNoIFwiICAgIC0gYCN7c2VsZWN0b3J9YDogPGtiZD4je2tleXN0cm9rZXN9PC9rYmQ+XCJcblxuICBzLmpvaW4oXCJcXG5cIilcblxuZm9ybWF0UmVwb3J0ID0gKHJlcG9ydCkgLT5cbiAge2luc3RhbmNlLCBwcm90b3R5cGUsIGFuY2Vzc3RvcnNOYW1lc30gPSByZXBvcnRcbiAgcyA9IFtdXG4gIHMucHVzaCBcIiMgI3thbmNlc3N0b3JzTmFtZXMuam9pbihcIiA8IFwiKX1cIlxuICBzLnB1c2ggaW5zdGFuY2UgaWYgaW5zdGFuY2U/XG4gIHMucHVzaCBwcm90b3R5cGUgaWYgcHJvdG90eXBlP1xuICBzLmpvaW4oXCJcXG5cIilcblxuaW5zcGVjdEluc3RhbmNlID0gKG9iaiwgb3B0aW9ucz17fSkgLT5cbiAgaW5kZW50ID0gXy5tdWx0aXBseVN0cmluZygnICcsIG9wdGlvbnMuaW5kZW50ID8gMClcbiAgcmVwID0gcmVwb3J0KG9iai5jb25zdHJ1Y3Rvciwgb3B0aW9ucylcbiAgW1xuICAgIFwiIyMgI3tvYmp9OiAje3JlcC5hbmNlc3N0b3JzTmFtZXNbMC4uMV0uam9pbihcIiA8IFwiKX1cIlxuICAgIGluc3BlY3RPYmplY3Qob2JqLCBvcHRpb25zKVxuICAgIGZvcm1hdFJlcG9ydChyZXApXG4gIF0uZmlsdGVyIChlKSAtPiBlXG4gIC5qb2luKCdcXG4nKS5zcGxpdCgnXFxuJykubWFwKChlKSAtPiBpbmRlbnQgKyBlKS5qb2luKCdcXG4nKVxuXG5nZXRDb21tYW5kRnJvbUNsYXNzID0gKGtsYXNzKSAtPlxuICBpZiBrbGFzcy5pc0NvbW1hbmQoKSB0aGVuIGtsYXNzLmdldENvbW1hbmROYW1lKCkgZWxzZSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuZXJhdGVJbnRyb3NwZWN0aW9uUmVwb3J0XG4iXX0=
