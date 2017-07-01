Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

// Public: GrammarUtils.Lisp - a module which exposes the ability to evaluate
// code
'use babel';

exports['default'] = {
  // Public: Split a string of code into an array of executable statements
  //
  // Returns an {Array} of executable statements.
  splitStatements: function splitStatements(code) {
    var _this = this;

    var iterator = function iterator(statements, currentCharacter) {
      if (!_this.parenDepth) _this.parenDepth = 0;
      if (currentCharacter === '(') {
        _this.parenDepth += 1;
        _this.inStatement = true;
      } else if (currentCharacter === ')') {
        _this.parenDepth -= 1;
      }

      if (!_this.statement) _this.statement = '';
      _this.statement += currentCharacter;

      if (_this.parenDepth === 0 && _this.inStatement) {
        _this.inStatement = false;
        statements.push(_this.statement.trim());
        _this.statement = '';
      }

      return statements;
    };

    var statements = _underscore2['default'].reduce(code.trim(), iterator, [], {});

    return statements;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvRHJvcGJveCAoUGVyc29uYWwpL0Rldi9kb3RmaWxlcy9hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hci11dGlscy9saXNwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OzswQkFFYyxZQUFZOzs7Ozs7QUFGMUIsV0FBVyxDQUFDOztxQkFNRzs7OztBQUliLGlCQUFlLEVBQUEseUJBQUMsSUFBSSxFQUFFOzs7QUFDcEIsUUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQUksVUFBVSxFQUFFLGdCQUFnQixFQUFLO0FBQ2pELFVBQUksQ0FBQyxNQUFLLFVBQVUsRUFBRSxNQUFLLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDMUMsVUFBSSxnQkFBZ0IsS0FBSyxHQUFHLEVBQUU7QUFDNUIsY0FBSyxVQUFVLElBQUksQ0FBQyxDQUFDO0FBQ3JCLGNBQUssV0FBVyxHQUFHLElBQUksQ0FBQztPQUN6QixNQUFNLElBQUksZ0JBQWdCLEtBQUssR0FBRyxFQUFFO0FBQ25DLGNBQUssVUFBVSxJQUFJLENBQUMsQ0FBQztPQUN0Qjs7QUFFRCxVQUFJLENBQUMsTUFBSyxTQUFTLEVBQUUsTUFBSyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3pDLFlBQUssU0FBUyxJQUFJLGdCQUFnQixDQUFDOztBQUVuQyxVQUFJLE1BQUssVUFBVSxLQUFLLENBQUMsSUFBSSxNQUFLLFdBQVcsRUFBRTtBQUM3QyxjQUFLLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDekIsa0JBQVUsQ0FBQyxJQUFJLENBQUMsTUFBSyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN2QyxjQUFLLFNBQVMsR0FBRyxFQUFFLENBQUM7T0FDckI7O0FBRUQsYUFBTyxVQUFVLENBQUM7S0FDbkIsQ0FBQzs7QUFFRixRQUFNLFVBQVUsR0FBRyx3QkFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRTNELFdBQU8sVUFBVSxDQUFDO0dBQ25CO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvRGV2L2RvdGZpbGVzL2F0b20vcGFja2FnZXMvc2NyaXB0L2xpYi9ncmFtbWFyLXV0aWxzL2xpc3AuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSc7XG5cbi8vIFB1YmxpYzogR3JhbW1hclV0aWxzLkxpc3AgLSBhIG1vZHVsZSB3aGljaCBleHBvc2VzIHRoZSBhYmlsaXR5IHRvIGV2YWx1YXRlXG4vLyBjb2RlXG5leHBvcnQgZGVmYXVsdCB7XG4gIC8vIFB1YmxpYzogU3BsaXQgYSBzdHJpbmcgb2YgY29kZSBpbnRvIGFuIGFycmF5IG9mIGV4ZWN1dGFibGUgc3RhdGVtZW50c1xuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtBcnJheX0gb2YgZXhlY3V0YWJsZSBzdGF0ZW1lbnRzLlxuICBzcGxpdFN0YXRlbWVudHMoY29kZSkge1xuICAgIGNvbnN0IGl0ZXJhdG9yID0gKHN0YXRlbWVudHMsIGN1cnJlbnRDaGFyYWN0ZXIpID0+IHtcbiAgICAgIGlmICghdGhpcy5wYXJlbkRlcHRoKSB0aGlzLnBhcmVuRGVwdGggPSAwO1xuICAgICAgaWYgKGN1cnJlbnRDaGFyYWN0ZXIgPT09ICcoJykge1xuICAgICAgICB0aGlzLnBhcmVuRGVwdGggKz0gMTtcbiAgICAgICAgdGhpcy5pblN0YXRlbWVudCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRDaGFyYWN0ZXIgPT09ICcpJykge1xuICAgICAgICB0aGlzLnBhcmVuRGVwdGggLT0gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLnN0YXRlbWVudCkgdGhpcy5zdGF0ZW1lbnQgPSAnJztcbiAgICAgIHRoaXMuc3RhdGVtZW50ICs9IGN1cnJlbnRDaGFyYWN0ZXI7XG5cbiAgICAgIGlmICh0aGlzLnBhcmVuRGVwdGggPT09IDAgJiYgdGhpcy5pblN0YXRlbWVudCkge1xuICAgICAgICB0aGlzLmluU3RhdGVtZW50ID0gZmFsc2U7XG4gICAgICAgIHN0YXRlbWVudHMucHVzaCh0aGlzLnN0YXRlbWVudC50cmltKCkpO1xuICAgICAgICB0aGlzLnN0YXRlbWVudCA9ICcnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RhdGVtZW50cztcbiAgICB9O1xuXG4gICAgY29uc3Qgc3RhdGVtZW50cyA9IF8ucmVkdWNlKGNvZGUudHJpbSgpLCBpdGVyYXRvciwgW10sIHt9KTtcblxuICAgIHJldHVybiBzdGF0ZW1lbnRzO1xuICB9LFxufTtcbiJdfQ==