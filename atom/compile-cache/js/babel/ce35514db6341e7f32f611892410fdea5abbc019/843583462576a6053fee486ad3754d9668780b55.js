Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

'use babel';

var ScriptOptions = (function () {
  function ScriptOptions() {
    _classCallCheck(this, ScriptOptions);

    this.name = '';
    this.description = '';
    this.lang = '';
    this.workingDirectory = null;
    this.cmd = null;
    this.cmdArgs = [];
    this.env = null;
    this.scriptArgs = [];
  }

  _createClass(ScriptOptions, [{
    key: 'toObject',
    value: function toObject() {
      return {
        name: this.name,
        description: this.description,
        lang: this.lang,
        workingDirectory: this.workingDirectory,
        cmd: this.cmd,
        cmdArgs: this.cmdArgs,
        env: this.env,
        scriptArgs: this.scriptArgs
      };
    }

    // Public: Serializes the user specified environment vars as an {object}
    // TODO: Support shells that allow a number as the first character in a variable?
    //
    // Returns an {Object} representation of the user specified environment.
  }, {
    key: 'getEnv',
    value: function getEnv() {
      if (!this.env) return {};

      var mapping = {};

      for (var pair of this.env.trim().split(';')) {
        var _pair$split = pair.split('=', 2);

        var _pair$split2 = _slicedToArray(_pair$split, 2);

        var key = _pair$split2[0];
        var value = _pair$split2[1];

        mapping[key] = ('' + value).replace(/"((?:[^"\\]|\\"|\\[^"])+)"/, '$1');
        mapping[key] = mapping[key].replace(/'((?:[^'\\]|\\'|\\[^'])+)'/, '$1');
      }

      return mapping;
    }

    // Public: Merges two environment objects
    //
    // otherEnv - The {Object} to extend the parsed environment by
    //
    // Returns the merged environment {Object}.
  }, {
    key: 'mergedEnv',
    value: function mergedEnv(otherEnv) {
      var otherCopy = _underscore2['default'].extend({}, otherEnv);
      var mergedEnv = _underscore2['default'].extend(otherCopy, this.getEnv());

      for (var key in mergedEnv) {
        var value = mergedEnv[key];
        mergedEnv[key] = ('' + value).replace(/"((?:[^"\\]|\\"|\\[^"])+)"/, '$1');
        mergedEnv[key] = mergedEnv[key].replace(/'((?:[^'\\]|\\'|\\[^'])+)'/, '$1');
      }

      return mergedEnv;
    }
  }], [{
    key: 'createFromOptions',
    value: function createFromOptions(name, options) {
      var so = new ScriptOptions();
      so.name = name;
      for (var key in options) {
        var value = options[key];so[key] = value;
      }
      return so;
    }
  }]);

  return ScriptOptions;
})();

exports['default'] = ScriptOptions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LW9wdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzBCQUVjLFlBQVk7Ozs7QUFGMUIsV0FBVyxDQUFDOztJQUlTLGFBQWE7QUFDckIsV0FEUSxhQUFhLEdBQ2xCOzBCQURLLGFBQWE7O0FBRTlCLFFBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0dBQ3RCOztlQVZrQixhQUFhOztXQW1CeEIsb0JBQUc7QUFDVCxhQUFPO0FBQ0wsWUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ2YsbUJBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztBQUM3QixZQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDZix3QkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO0FBQ3ZDLFdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztBQUNiLGVBQU8sRUFBRSxJQUFJLENBQUMsT0FBTztBQUNyQixXQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDYixrQkFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO09BQzVCLENBQUM7S0FDSDs7Ozs7Ozs7V0FNSyxrQkFBRztBQUNQLFVBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDOztBQUV6QixVQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRW5CLFdBQUssSUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7MEJBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzs7OztZQUFoQyxHQUFHO1lBQUUsS0FBSzs7QUFDakIsZUFBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQUcsS0FBSyxFQUFHLE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0RSxlQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUN6RTs7QUFHRCxhQUFPLE9BQU8sQ0FBQztLQUNoQjs7Ozs7Ozs7O1dBT1EsbUJBQUMsUUFBUSxFQUFFO0FBQ2xCLFVBQU0sU0FBUyxHQUFHLHdCQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDekMsVUFBTSxTQUFTLEdBQUcsd0JBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzs7QUFFckQsV0FBSyxJQUFNLEdBQUcsSUFBSSxTQUFTLEVBQUU7QUFDM0IsWUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLGlCQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBRyxLQUFLLEVBQUcsT0FBTyxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hFLGlCQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUM3RTs7QUFFRCxhQUFPLFNBQVMsQ0FBQztLQUNsQjs7O1dBdkR1QiwyQkFBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3RDLFVBQU0sRUFBRSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7QUFDL0IsUUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDZixXQUFLLElBQU0sR0FBRyxJQUFJLE9BQU8sRUFBRTtBQUFFLFlBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxBQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7T0FBRTtBQUMzRSxhQUFPLEVBQUUsQ0FBQztLQUNYOzs7U0FqQmtCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvc2NyaXB0LW9wdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmlwdE9wdGlvbnMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm5hbWUgPSAnJztcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gJyc7XG4gICAgdGhpcy5sYW5nID0gJyc7XG4gICAgdGhpcy53b3JraW5nRGlyZWN0b3J5ID0gbnVsbDtcbiAgICB0aGlzLmNtZCA9IG51bGw7XG4gICAgdGhpcy5jbWRBcmdzID0gW107XG4gICAgdGhpcy5lbnYgPSBudWxsO1xuICAgIHRoaXMuc2NyaXB0QXJncyA9IFtdO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb21PcHRpb25zKG5hbWUsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBzbyA9IG5ldyBTY3JpcHRPcHRpb25zKCk7XG4gICAgc28ubmFtZSA9IG5hbWU7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gb3B0aW9ucykgeyBjb25zdCB2YWx1ZSA9IG9wdGlvbnNba2V5XTsgc29ba2V5XSA9IHZhbHVlOyB9XG4gICAgcmV0dXJuIHNvO1xuICB9XG5cbiAgdG9PYmplY3QoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbGFuZzogdGhpcy5sYW5nLFxuICAgICAgd29ya2luZ0RpcmVjdG9yeTogdGhpcy53b3JraW5nRGlyZWN0b3J5LFxuICAgICAgY21kOiB0aGlzLmNtZCxcbiAgICAgIGNtZEFyZ3M6IHRoaXMuY21kQXJncyxcbiAgICAgIGVudjogdGhpcy5lbnYsXG4gICAgICBzY3JpcHRBcmdzOiB0aGlzLnNjcmlwdEFyZ3MsXG4gICAgfTtcbiAgfVxuXG4gIC8vIFB1YmxpYzogU2VyaWFsaXplcyB0aGUgdXNlciBzcGVjaWZpZWQgZW52aXJvbm1lbnQgdmFycyBhcyBhbiB7b2JqZWN0fVxuICAvLyBUT0RPOiBTdXBwb3J0IHNoZWxscyB0aGF0IGFsbG93IGEgbnVtYmVyIGFzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgaW4gYSB2YXJpYWJsZT9cbiAgLy9cbiAgLy8gUmV0dXJucyBhbiB7T2JqZWN0fSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdXNlciBzcGVjaWZpZWQgZW52aXJvbm1lbnQuXG4gIGdldEVudigpIHtcbiAgICBpZiAoIXRoaXMuZW52KSByZXR1cm4ge307XG5cbiAgICBjb25zdCBtYXBwaW5nID0ge307XG5cbiAgICBmb3IgKGNvbnN0IHBhaXIgb2YgdGhpcy5lbnYudHJpbSgpLnNwbGl0KCc7JykpIHtcbiAgICAgIGNvbnN0IFtrZXksIHZhbHVlXSA9IHBhaXIuc3BsaXQoJz0nLCAyKTtcbiAgICAgIG1hcHBpbmdba2V5XSA9IGAke3ZhbHVlfWAucmVwbGFjZSgvXCIoKD86W15cIlxcXFxdfFxcXFxcInxcXFxcW15cIl0pKylcIi8sICckMScpO1xuICAgICAgbWFwcGluZ1trZXldID0gbWFwcGluZ1trZXldLnJlcGxhY2UoLycoKD86W14nXFxcXF18XFxcXCd8XFxcXFteJ10pKyknLywgJyQxJyk7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gbWFwcGluZztcbiAgfVxuXG4gIC8vIFB1YmxpYzogTWVyZ2VzIHR3byBlbnZpcm9ubWVudCBvYmplY3RzXG4gIC8vXG4gIC8vIG90aGVyRW52IC0gVGhlIHtPYmplY3R9IHRvIGV4dGVuZCB0aGUgcGFyc2VkIGVudmlyb25tZW50IGJ5XG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIG1lcmdlZCBlbnZpcm9ubWVudCB7T2JqZWN0fS5cbiAgbWVyZ2VkRW52KG90aGVyRW52KSB7XG4gICAgY29uc3Qgb3RoZXJDb3B5ID0gXy5leHRlbmQoe30sIG90aGVyRW52KTtcbiAgICBjb25zdCBtZXJnZWRFbnYgPSBfLmV4dGVuZChvdGhlckNvcHksIHRoaXMuZ2V0RW52KCkpO1xuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gbWVyZ2VkRW52KSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG1lcmdlZEVudltrZXldO1xuICAgICAgbWVyZ2VkRW52W2tleV0gPSBgJHt2YWx1ZX1gLnJlcGxhY2UoL1wiKCg/OlteXCJcXFxcXXxcXFxcXCJ8XFxcXFteXCJdKSspXCIvLCAnJDEnKTtcbiAgICAgIG1lcmdlZEVudltrZXldID0gbWVyZ2VkRW52W2tleV0ucmVwbGFjZSgvJygoPzpbXidcXFxcXXxcXFxcJ3xcXFxcW14nXSkrKScvLCAnJDEnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VkRW52O1xuICB9XG59XG4iXX0=