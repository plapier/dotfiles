(function() {
  var GrammarUtils;

  GrammarUtils = require('../../lib/grammar-utils');

  describe('GrammarUtils', function() {
    return describe('Lisp', function() {
      var toStatements;
      toStatements = GrammarUtils.Lisp.splitStatements;
      it('returns empty array for empty code', function() {
        var code;
        code = '';
        return expect(toStatements(code)).toEqual([]);
      });
      it('does not split single statement', function() {
        var code;
        code = '(print "dummy")';
        return expect(toStatements(code)).toEqual([code]);
      });
      it('splits two simple statements', function() {
        var code;
        code = '(print "dummy")(print "statement")';
        return expect(toStatements(code)).toEqual(['(print "dummy")', '(print "statement")']);
      });
      it('splits two simple statements in many lines', function() {
        var code;
        code = '(print "dummy")  \n\n  (print "statement")';
        return expect(toStatements(code)).toEqual(['(print "dummy")', '(print "statement")']);
      });
      it('does not split single line complex statement', function() {
        var code;
        code = '(when t(setq a 2)(+ i 1))';
        return expect(toStatements(code)).toEqual(['(when t(setq a 2)(+ i 1))']);
      });
      it('does not split multi line complex statement', function() {
        var code;
        code = '(when t(setq a 2)  \n \t (+ i 1))';
        return expect(toStatements(code)).toEqual(['(when t(setq a 2)  \n \t (+ i 1))']);
      });
      it('splits single line complex statements', function() {
        var code;
        code = '(when t(setq a 2)(+ i 1))(when t(setq a 5)(+ i 3))';
        return expect(toStatements(code)).toEqual(['(when t(setq a 2)(+ i 1))', '(when t(setq a 5)(+ i 3))']);
      });
      return it('splits multi line complex statements', function() {
        var code;
        code = '(when t(\nsetq a 2)(+ i 1))   \n\t (when t(\n\t  setq a 5)(+ i 3))';
        return expect(toStatements(code)).toEqual(['(when t(\nsetq a 2)(+ i 1))', '(when t(\n\t  setq a 5)(+ i 3))']);
      });
    });
  });

}).call(this);
