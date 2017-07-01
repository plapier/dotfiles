(function() {
  var OperationAbortedError,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  module.exports = OperationAbortedError = (function(superClass) {
    extend(OperationAbortedError, superClass);

    function OperationAbortedError(arg) {
      this.message = arg.message;
      this.name = this.constructor.name;
    }

    return OperationAbortedError;

  })(Error);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9lcnJvcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBOzs7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDUywrQkFBQyxHQUFEO01BQUUsSUFBQyxDQUFBLFVBQUYsSUFBRTtNQUNkLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLFdBQVcsQ0FBQztJQURWOzs7O0tBRHFCO0FBRHBDIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgT3BlcmF0aW9uQWJvcnRlZEVycm9yIGV4dGVuZHMgRXJyb3JcbiAgY29uc3RydWN0b3I6ICh7QG1lc3NhZ2V9KSAtPlxuICAgIEBuYW1lID0gQGNvbnN0cnVjdG9yLm5hbWVcbiJdfQ==
