(function() {
  var _;

  _ = require('underscore');

  module.exports = {
    splitStatements: function(code) {
      var iterator, statements;
      iterator = function(statements, currentCharacter, _memo, _context) {
        if (this.parenDepth == null) {
          this.parenDepth = 0;
        }
        if (currentCharacter === '(') {
          this.parenDepth += 1;
          this.inStatement = true;
        } else if (currentCharacter === ')') {
          this.parenDepth -= 1;
        }
        if (this.statement == null) {
          this.statement = '';
        }
        this.statement += currentCharacter;
        if (this.parenDepth === 0 && this.inStatement) {
          this.inStatement = false;
          statements.push(this.statement.trim());
          this.statement = '';
        }
        return statements;
      };
      statements = _.reduce(code.trim(), iterator, [], {});
      return statements;
    }
  };

}).call(this);
