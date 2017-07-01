Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _side = require('./side');

var _navigator = require('./navigator');

// Public: Model an individual conflict parsed from git's automatic conflict resolution output.
'use babel';

var Conflict = (function () {

  /*
   * Private: Initialize a new Conflict with its constituent Sides, Navigator, and the MergeState
   * it belongs to.
   *
   * ours [Side] the lines of this conflict that the current user contributed (by our best guess).
   * theirs [Side] the lines of this conflict that another contributor created.
   * base [Side] the lines of merge base of this conflict. Optional.
   * navigator [Navigator] maintains references to surrounding Conflicts in the original file.
   * state [MergeState] repository-wide information about the current merge.
   */

  function Conflict(ours, theirs, base, navigator, merge) {
    _classCallCheck(this, Conflict);

    this.ours = ours;
    this.theirs = theirs;
    this.base = base;
    this.navigator = navigator;
    this.merge = merge;

    this.emitter = new _atom.Emitter();

    // Populate back-references
    this.ours.conflict = this;
    this.theirs.conflict = this;
    if (this.base) {
      this.base.conflict = this;
    }
    this.navigator.conflict = this;

    // Begin unresolved
    this.resolution = null;
  }

  // Regular expression that matches the beginning of a potential conflict.

  /*
   * Public: Has this conflict been resolved in any way?
   *
   * Return [Boolean]
   */

  _createClass(Conflict, [{
    key: 'isResolved',
    value: function isResolved() {
      return this.resolution !== null;
    }

    /*
     * Public: Attach an event handler to be notified when this conflict is resolved.
     *
     * callback [Function]
     */
  }, {
    key: 'onDidResolveConflict',
    value: function onDidResolveConflict(callback) {
      return this.emitter.on('resolve-conflict', callback);
    }

    /*
     * Public: Specify which Side is to be kept. Note that either side may have been modified by the
     * user prior to resolution. Notify any subscribers.
     *
     * side [Side] our changes or their changes.
     */
  }, {
    key: 'resolveAs',
    value: function resolveAs(side) {
      this.resolution = side;
      this.emitter.emit('resolve-conflict');
    }

    /*
     * Public: Locate the position that the editor should scroll to in order to make this conflict
     * visible.
     *
     * Return [Point] buffer coordinates
     */
  }, {
    key: 'scrollTarget',
    value: function scrollTarget() {
      return this.ours.marker.getTailBufferPosition();
    }

    /*
     * Public: Audit all Marker instances owned by subobjects within this Conflict.
     *
     * Return [Array<Marker>]
     */
  }, {
    key: 'markers',
    value: function markers() {
      var ms = [this.ours.markers(), this.theirs.markers(), this.navigator.markers()];
      if (this.base) {
        ms.push(this.base.markers());
      }
      return _underscorePlus2['default'].flatten(ms, true);
    }

    /*
     * Public: Console-friendly identification of this conflict.
     *
     * Return [String] that distinguishes this conflict from others.
     */
  }, {
    key: 'toString',
    value: function toString() {
      return '[conflict: ' + this.ours + ' ' + this.theirs + ']';
    }

    /*
     * Public: Parse any conflict markers in a TextEditor's buffer and return a Conflict that contains
     * markers corresponding to each.
     *
     * merge [MergeState] Repository-wide state of the merge.
     * editor [TextEditor] The editor to search.
     * return [Array<Conflict>] A (possibly empty) collection of parsed Conflicts.
     */
  }], [{
    key: 'all',
    value: function all(merge, editor) {
      var conflicts = [];
      var lastRow = -1;

      editor.getBuffer().scan(CONFLICT_START_REGEX, function (m) {
        conflictStartRow = m.range.start.row;
        if (conflictStartRow < lastRow) {
          // Match within an already-parsed conflict.
          return;
        }

        var visitor = new ConflictVisitor(merge, editor);

        try {
          lastRow = parseConflict(merge, editor, conflictStartRow, visitor);
          var conflict = visitor.conflict();

          if (conflicts.length > 0) {
            conflict.navigator.linkToPrevious(conflicts[conflicts.length - 1]);
          }
          conflicts.push(conflict);
        } catch (e) {
          if (!e.parserState) throw e;

          if (!atom.inSpecMode()) {
            console.error('Unable to parse conflict: ' + e.message + '\n' + e.stack);
          }
        }
      });

      return conflicts;
    }
  }]);

  return Conflict;
})();

exports.Conflict = Conflict;
var CONFLICT_START_REGEX = /^<{7} (.+)\r?\n/g;

// Side positions.
var TOP = 'top';
var BASE = 'base';
var BOTTOM = 'bottom';

// Options used to initialize markers.
var options = {
  invalidate: 'never'
};

/*
 * Private: conflict parser visitor that ignores all events.
 */

var NoopVisitor = (function () {
  function NoopVisitor() {
    _classCallCheck(this, NoopVisitor);
  }

  /*
   * Private: conflict parser visitor that marks each buffer range and assembles a Conflict from the
   * pieces.
   */

  _createClass(NoopVisitor, [{
    key: 'visitOurSide',
    value: function visitOurSide(position, bannerRow, textRowStart, textRowEnd) {}
  }, {
    key: 'visitBaseSide',
    value: function visitBaseSide(position, bannerRow, textRowStart, textRowEnd) {}
  }, {
    key: 'visitSeparator',
    value: function visitSeparator(sepRowStart, sepRowEnd) {}
  }, {
    key: 'visitTheirSide',
    value: function visitTheirSide(position, bannerRow, textRowStart, textRowEnd) {}
  }]);

  return NoopVisitor;
})();

var ConflictVisitor = (function () {

  /*
   * merge - [MergeState] passed to each instantiated Side.
   * editor - [TextEditor] displaying the conflicting text.
   */

  function ConflictVisitor(merge, editor) {
    _classCallCheck(this, ConflictVisitor);

    this.merge = merge;
    this.editor = editor;
    this.previousSide = null;

    this.ourSide = null;
    this.baseSide = null;
    this.navigator = null;
  }

  /*
   * Private: parseConflict discovers git conflict markers in a corpus of text and constructs Conflict
   * instances that mark the correct lines.
   *
   * Returns [Integer] the buffer row after the final <<<<<< boundary.
   */

  /*
   * position - [String] one of TOP or BOTTOM.
   * bannerRow - [Integer] of the buffer row that contains our side's banner.
   * textRowStart - [Integer] of the first buffer row that contain this side's text.
   * textRowEnd - [Integer] of the first buffer row beyond the extend of this side's text.
   */

  _createClass(ConflictVisitor, [{
    key: 'visitOurSide',
    value: function visitOurSide(position, bannerRow, textRowStart, textRowEnd) {
      this.ourSide = this.markSide(position, _side.OurSide, bannerRow, textRowStart, textRowEnd);
    }

    /*
     * bannerRow - [Integer] the buffer row that contains our side's banner.
     * textRowStart - [Integer] first buffer row that contain this side's text.
     * textRowEnd - [Integer] first buffer row beyond the extend of this side's text.
     */
  }, {
    key: 'visitBaseSide',
    value: function visitBaseSide(bannerRow, textRowStart, textRowEnd) {
      this.baseSide = this.markSide(BASE, _side.BaseSide, bannerRow, textRowStart, textRowEnd);
    }

    /*
     * sepRowStart - [Integer] buffer row that contains the "=======" separator.
     * sepRowEnd - [Integer] the buffer row after the separator.
     */
  }, {
    key: 'visitSeparator',
    value: function visitSeparator(sepRowStart, sepRowEnd) {
      var marker = this.editor.markBufferRange([[sepRowStart, 0], [sepRowEnd, 0]], options);
      this.previousSide.followingMarker = marker;

      this.navigator = new _navigator.Navigator(marker);
      this.previousSide = this.navigator;
    }

    /*
     * position - [String] Always BASE; accepted for consistency.
     * bannerRow - [Integer] the buffer row that contains our side's banner.
     * textRowStart - [Integer] first buffer row that contain this side's text.
     * textRowEnd - [Integer] first buffer row beyond the extend of this side's text.
     */
  }, {
    key: 'visitTheirSide',
    value: function visitTheirSide(position, bannerRow, textRowStart, textRowEnd) {
      this.theirSide = this.markSide(position, _side.TheirSide, bannerRow, textRowStart, textRowEnd);
    }
  }, {
    key: 'markSide',
    value: function markSide(position, sideKlass, bannerRow, textRowStart, textRowEnd) {
      var description = this.sideDescription(bannerRow);

      var bannerMarker = this.editor.markBufferRange([[bannerRow, 0], [bannerRow + 1, 0]], options);

      if (this.previousSide) {
        this.previousSide.followingMarker = bannerMarker;
      }

      var textRange = [[textRowStart, 0], [textRowEnd, 0]];
      var textMarker = this.editor.markBufferRange(textRange, options);
      var text = this.editor.getTextInBufferRange(textRange);

      var side = new sideKlass(text, description, textMarker, bannerMarker, position);
      this.previousSide = side;
      return side;
    }

    /*
     * Parse the banner description for the current side from a banner row.
     */
  }, {
    key: 'sideDescription',
    value: function sideDescription(bannerRow) {
      return this.editor.lineTextForBufferRow(bannerRow).match(/^[<|>]{7} (.*)$/)[1];
    }
  }, {
    key: 'conflict',
    value: function conflict() {
      this.previousSide.followingMarker = this.previousSide.refBannerMarker;

      return new Conflict(this.ourSide, this.theirSide, this.baseSide, this.navigator, this.merge);
    }
  }]);

  return ConflictVisitor;
})();

var parseConflict = function parseConflict(merge, editor, row, visitor) {
  var lastBoundary = null;

  // Visit a side that begins with a banner and description as its first line.
  var visitHeaderSide = function visitHeaderSide(position, visitMethod) {
    var sideRowStart = row;
    row += 1;
    advanceToBoundary('|=');
    var sideRowEnd = row;

    visitor[visitMethod](position, sideRowStart, sideRowStart + 1, sideRowEnd);
  };

  // Visit the base side from diff3 output, if one is present, then visit the separator.
  var visitBaseAndSeparator = function visitBaseAndSeparator() {
    if (lastBoundary === '|') {
      visitBaseSide();
    }

    visitSeparator();
  };

  // Visit a base side from diff3 output.
  var visitBaseSide = function visitBaseSide() {
    var sideRowStart = row;
    row += 1;

    var b = advanceToBoundary('<=');
    while (b === '<') {
      // Embedded recursive conflict within a base side, caused by a criss-cross merge.
      // Advance beyond it without marking anything.
      row = parseConflict(merge, editor, row, new NoopVisitor());
      b = advanceToBoundary('<=');
    }

    var sideRowEnd = row;

    visitor.visitBaseSide(sideRowStart, sideRowStart + 1, sideRowEnd);
  };

  // Visit a "========" separator.
  var visitSeparator = function visitSeparator() {
    var sepRowStart = row;
    row += 1;
    var sepRowEnd = row;

    visitor.visitSeparator(sepRowStart, sepRowEnd);
  };

  // Vidie a side with a banner and description as its last line.
  var visitFooterSide = function visitFooterSide(position, visitMethod) {
    var sideRowStart = row;
    var b = advanceToBoundary('>');
    row += 1;
    sideRowEnd = row;

    visitor[visitMethod](position, sideRowEnd - 1, sideRowStart, sideRowEnd - 1);
  };

  // Determine if the current row is a side boundary.
  //
  // boundaryKinds - [String] any combination of <, |, =, or > to limit the kinds of boundary
  //   detected.
  //
  // Returns the matching boundaryKinds character, or `null` if none match.
  var isAtBoundary = function isAtBoundary() {
    var boundaryKinds = arguments.length <= 0 || arguments[0] === undefined ? '<|=>' : arguments[0];

    var line = editor.lineTextForBufferRow(row);
    for (b of boundaryKinds) {
      if (line.startsWith(b.repeat(7))) {
        return b;
      }
    }
    return null;
  };

  // Increment the current row until the current line matches one of the provided boundary kinds,
  // or until there are no more lines in the editor.
  //
  // boundaryKinds - [String] any combination of <, |, =, or > to limit the kinds of boundaries
  //   that halt the progression.
  //
  // Returns the matching boundaryKinds character, or 'null' if there are no matches to the end of
  // the editor.
  var advanceToBoundary = function advanceToBoundary() {
    var boundaryKinds = arguments.length <= 0 || arguments[0] === undefined ? '<|=>' : arguments[0];

    var b = isAtBoundary(boundaryKinds);
    while (b === null) {
      row += 1;
      if (row > editor.getLastBufferRow()) {
        var e = new Error('Unterminated conflict side');
        e.parserState = true;
        throw e;
      }
      b = isAtBoundary(boundaryKinds);
    }

    lastBoundary = b;
    return b;
  };

  if (!merge.isRebase) {
    visitHeaderSide(TOP, 'visitOurSide');
    visitBaseAndSeparator();
    visitFooterSide(BOTTOM, 'visitTheirSide');
  } else {
    visitHeaderSide(TOP, 'visitTheirSide');
    visitBaseAndSeparator();
    visitFooterSide(BOTTOM, 'visitOurSide');
  }

  return row;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9sYXBpZXIvLmF0b20vcGFja2FnZXMvbWVyZ2UtY29uZmxpY3RzL2xpYi9jb25mbGljdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVzQixNQUFNOzs4QkFDZCxpQkFBaUI7Ozs7b0JBRWtCLFFBQVE7O3lCQUNqQyxhQUFhOzs7QUFOckMsV0FBVyxDQUFBOztJQVNFLFFBQVE7Ozs7Ozs7Ozs7Ozs7QUFZUCxXQVpELFFBQVEsQ0FZTixJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFOzBCQVp4QyxRQUFROztBQWFqQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTs7QUFFbEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBOzs7QUFHNUIsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUMzQixRQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDYixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7S0FDMUI7QUFDRCxRQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7OztBQUc5QixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtHQUN2Qjs7Ozs7Ozs7OztlQS9CVSxRQUFROztXQXNDVCxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUE7S0FDaEM7Ozs7Ozs7OztXQU9vQiw4QkFBQyxRQUFRLEVBQUU7QUFDOUIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNyRDs7Ozs7Ozs7OztXQVFTLG1CQUFDLElBQUksRUFBRTtBQUNmLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0FBQ3RCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7S0FDdEM7Ozs7Ozs7Ozs7V0FRWSx3QkFBRztBQUNkLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQTtLQUNoRDs7Ozs7Ozs7O1dBT08sbUJBQUc7QUFDVCxVQUFNLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7QUFDakYsVUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2IsVUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7T0FDN0I7QUFDRCxhQUFPLDRCQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUE7S0FDM0I7Ozs7Ozs7OztXQU9RLG9CQUFHO0FBQ1YsNkJBQXFCLElBQUksQ0FBQyxJQUFJLFNBQUksSUFBSSxDQUFDLE1BQU0sT0FBRztLQUNqRDs7Ozs7Ozs7Ozs7O1dBVVUsYUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ3pCLFVBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQTtBQUNwQixVQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQTs7QUFFaEIsWUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxVQUFDLENBQUMsRUFBSztBQUNuRCx3QkFBZ0IsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUE7QUFDcEMsWUFBSSxnQkFBZ0IsR0FBRyxPQUFPLEVBQUU7O0FBRTlCLGlCQUFNO1NBQ1A7O0FBRUQsWUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFlLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUVsRCxZQUFJO0FBQ0YsaUJBQU8sR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNqRSxjQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7O0FBRW5DLGNBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDeEIsb0JBQVEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7V0FDbkU7QUFDRCxtQkFBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUN6QixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsY0FBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7O0FBRTNCLGNBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7QUFDdEIsbUJBQU8sQ0FBQyxLQUFLLGdDQUE4QixDQUFDLENBQUMsT0FBTyxVQUFLLENBQUMsQ0FBQyxLQUFLLENBQUcsQ0FBQTtXQUNwRTtTQUNGO09BQ0YsQ0FBQyxDQUFBOztBQUVGLGFBQU8sU0FBUyxDQUFBO0tBQ2pCOzs7U0FySVUsUUFBUTs7OztBQXlJckIsSUFBTSxvQkFBb0IsR0FBRyxrQkFBa0IsQ0FBQTs7O0FBRy9DLElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQTtBQUNqQixJQUFNLElBQUksR0FBRyxNQUFNLENBQUE7QUFDbkIsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFBOzs7QUFHdkIsSUFBTSxPQUFPLEdBQUc7QUFDZCxZQUFVLEVBQUUsT0FBTztDQUNwQixDQUFBOzs7Ozs7SUFLSyxXQUFXO1dBQVgsV0FBVzswQkFBWCxXQUFXOzs7Ozs7OztlQUFYLFdBQVc7O1dBRUYsc0JBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLEVBQUc7OztXQUVsRCx1QkFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsRUFBRzs7O1dBRWxELHdCQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsRUFBRzs7O1dBRTVCLHdCQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxFQUFHOzs7U0FSOUQsV0FBVzs7O0lBZ0JYLGVBQWU7Ozs7Ozs7QUFNUCxXQU5SLGVBQWUsQ0FNTixLQUFLLEVBQUUsTUFBTSxFQUFFOzBCQU54QixlQUFlOztBQU9qQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTs7QUFFeEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDbkIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDcEIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7R0FDdEI7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFkRyxlQUFlOztXQXNCTixzQkFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7QUFDM0QsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsaUJBQVcsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQTtLQUNyRjs7Ozs7Ozs7O1dBT2EsdUJBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7QUFDbEQsVUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksa0JBQVksU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQTtLQUNuRjs7Ozs7Ozs7V0FNYyx3QkFBQyxXQUFXLEVBQUUsU0FBUyxFQUFFO0FBQ3RDLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUN2RixVQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUE7O0FBRTFDLFVBQUksQ0FBQyxTQUFTLEdBQUcseUJBQWMsTUFBTSxDQUFDLENBQUE7QUFDdEMsVUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFBO0tBQ25DOzs7Ozs7Ozs7O1dBUWMsd0JBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFO0FBQzdELFVBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLG1CQUFhLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUE7S0FDekY7OztXQUVRLGtCQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUU7QUFDbEUsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFbkQsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQTs7QUFFL0YsVUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxHQUFHLFlBQVksQ0FBQTtPQUNqRDs7QUFFRCxVQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEQsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ2xFLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUE7O0FBRXhELFVBQU0sSUFBSSxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUNqRixVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQTtBQUN4QixhQUFPLElBQUksQ0FBQTtLQUNaOzs7Ozs7O1dBS2UseUJBQUMsU0FBUyxFQUFFO0FBQzFCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUMvRTs7O1dBRVEsb0JBQUc7QUFDVixVQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQTs7QUFFckUsYUFBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUM3Rjs7O1NBdEZHLGVBQWU7OztBQWdHckIsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFhLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUMzRCxNQUFJLFlBQVksR0FBRyxJQUFJLENBQUE7OztBQUd2QixNQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQUksUUFBUSxFQUFFLFdBQVcsRUFBSztBQUNqRCxRQUFNLFlBQVksR0FBRyxHQUFHLENBQUE7QUFDeEIsT0FBRyxJQUFJLENBQUMsQ0FBQTtBQUNSLHFCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZCLFFBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQTs7QUFFdEIsV0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsWUFBWSxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQTtHQUMzRSxDQUFBOzs7QUFHRCxNQUFNLHFCQUFxQixHQUFHLFNBQXhCLHFCQUFxQixHQUFTO0FBQ2xDLFFBQUksWUFBWSxLQUFLLEdBQUcsRUFBRTtBQUN4QixtQkFBYSxFQUFFLENBQUE7S0FDaEI7O0FBRUQsa0JBQWMsRUFBRSxDQUFBO0dBQ2pCLENBQUE7OztBQUdELE1BQU0sYUFBYSxHQUFHLFNBQWhCLGFBQWEsR0FBUztBQUMxQixRQUFNLFlBQVksR0FBRyxHQUFHLENBQUE7QUFDeEIsT0FBRyxJQUFJLENBQUMsQ0FBQTs7QUFFUixRQUFJLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMvQixXQUFPLENBQUMsS0FBSyxHQUFHLEVBQUU7OztBQUdoQixTQUFHLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQTtBQUMxRCxPQUFDLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDNUI7O0FBRUQsUUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFBOztBQUV0QixXQUFPLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxZQUFZLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFBO0dBQ2xFLENBQUE7OztBQUdELE1BQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsR0FBUztBQUMzQixRQUFNLFdBQVcsR0FBRyxHQUFHLENBQUE7QUFDdkIsT0FBRyxJQUFJLENBQUMsQ0FBQTtBQUNSLFFBQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQTs7QUFFckIsV0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUE7R0FDL0MsQ0FBQTs7O0FBR0QsTUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFJLFFBQVEsRUFBRSxXQUFXLEVBQUs7QUFDakQsUUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFBO0FBQ3hCLFFBQU0sQ0FBQyxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ2hDLE9BQUcsSUFBSSxDQUFDLENBQUE7QUFDUixjQUFVLEdBQUcsR0FBRyxDQUFBOztBQUVoQixXQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFVBQVUsR0FBRyxDQUFDLEVBQUUsWUFBWSxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQTtHQUM3RSxDQUFBOzs7Ozs7OztBQVFELE1BQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxHQUErQjtRQUEzQixhQUFhLHlEQUFHLE1BQU07O0FBQzFDLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM3QyxTQUFLLENBQUMsSUFBSSxhQUFhLEVBQUU7QUFDdkIsVUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNoQyxlQUFPLENBQUMsQ0FBQTtPQUNUO0tBQ0Y7QUFDRCxXQUFPLElBQUksQ0FBQTtHQUNaLENBQUE7Ozs7Ozs7Ozs7QUFVRCxNQUFNLGlCQUFpQixHQUFHLFNBQXBCLGlCQUFpQixHQUErQjtRQUEzQixhQUFhLHlEQUFHLE1BQU07O0FBQy9DLFFBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUNuQyxXQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDakIsU0FBRyxJQUFJLENBQUMsQ0FBQTtBQUNSLFVBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO0FBQ25DLFlBQU0sQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUE7QUFDakQsU0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7QUFDcEIsY0FBTSxDQUFDLENBQUE7T0FDUjtBQUNELE9BQUMsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUE7S0FDaEM7O0FBRUQsZ0JBQVksR0FBRyxDQUFDLENBQUE7QUFDaEIsV0FBTyxDQUFDLENBQUE7R0FDVCxDQUFBOztBQUVELE1BQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ25CLG1CQUFlLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFBO0FBQ3BDLHlCQUFxQixFQUFFLENBQUE7QUFDdkIsbUJBQWUsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtHQUMxQyxNQUFNO0FBQ0wsbUJBQWUsQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtBQUN0Qyx5QkFBcUIsRUFBRSxDQUFBO0FBQ3ZCLG1CQUFlLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFBO0dBQ3hDOztBQUVELFNBQU8sR0FBRyxDQUFBO0NBQ1gsQ0FBQSIsImZpbGUiOiIvVXNlcnMvbGFwaWVyLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvY29uZmxpY3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2F0b20nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlLXBsdXMnXG5cbmltcG9ydCB7U2lkZSwgT3VyU2lkZSwgVGhlaXJTaWRlLCBCYXNlU2lkZX0gZnJvbSAnLi9zaWRlJ1xuaW1wb3J0IHtOYXZpZ2F0b3J9IGZyb20gJy4vbmF2aWdhdG9yJ1xuXG4vLyBQdWJsaWM6IE1vZGVsIGFuIGluZGl2aWR1YWwgY29uZmxpY3QgcGFyc2VkIGZyb20gZ2l0J3MgYXV0b21hdGljIGNvbmZsaWN0IHJlc29sdXRpb24gb3V0cHV0LlxuZXhwb3J0IGNsYXNzIENvbmZsaWN0IHtcblxuICAvKlxuICAgKiBQcml2YXRlOiBJbml0aWFsaXplIGEgbmV3IENvbmZsaWN0IHdpdGggaXRzIGNvbnN0aXR1ZW50IFNpZGVzLCBOYXZpZ2F0b3IsIGFuZCB0aGUgTWVyZ2VTdGF0ZVxuICAgKiBpdCBiZWxvbmdzIHRvLlxuICAgKlxuICAgKiBvdXJzIFtTaWRlXSB0aGUgbGluZXMgb2YgdGhpcyBjb25mbGljdCB0aGF0IHRoZSBjdXJyZW50IHVzZXIgY29udHJpYnV0ZWQgKGJ5IG91ciBiZXN0IGd1ZXNzKS5cbiAgICogdGhlaXJzIFtTaWRlXSB0aGUgbGluZXMgb2YgdGhpcyBjb25mbGljdCB0aGF0IGFub3RoZXIgY29udHJpYnV0b3IgY3JlYXRlZC5cbiAgICogYmFzZSBbU2lkZV0gdGhlIGxpbmVzIG9mIG1lcmdlIGJhc2Ugb2YgdGhpcyBjb25mbGljdC4gT3B0aW9uYWwuXG4gICAqIG5hdmlnYXRvciBbTmF2aWdhdG9yXSBtYWludGFpbnMgcmVmZXJlbmNlcyB0byBzdXJyb3VuZGluZyBDb25mbGljdHMgaW4gdGhlIG9yaWdpbmFsIGZpbGUuXG4gICAqIHN0YXRlIFtNZXJnZVN0YXRlXSByZXBvc2l0b3J5LXdpZGUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgbWVyZ2UuXG4gICAqL1xuICBjb25zdHJ1Y3RvciAob3VycywgdGhlaXJzLCBiYXNlLCBuYXZpZ2F0b3IsIG1lcmdlKSB7XG4gICAgdGhpcy5vdXJzID0gb3Vyc1xuICAgIHRoaXMudGhlaXJzID0gdGhlaXJzXG4gICAgdGhpcy5iYXNlID0gYmFzZVxuICAgIHRoaXMubmF2aWdhdG9yID0gbmF2aWdhdG9yXG4gICAgdGhpcy5tZXJnZSA9IG1lcmdlXG5cbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG5cbiAgICAvLyBQb3B1bGF0ZSBiYWNrLXJlZmVyZW5jZXNcbiAgICB0aGlzLm91cnMuY29uZmxpY3QgPSB0aGlzXG4gICAgdGhpcy50aGVpcnMuY29uZmxpY3QgPSB0aGlzXG4gICAgaWYgKHRoaXMuYmFzZSkge1xuICAgICAgdGhpcy5iYXNlLmNvbmZsaWN0ID0gdGhpc1xuICAgIH1cbiAgICB0aGlzLm5hdmlnYXRvci5jb25mbGljdCA9IHRoaXNcblxuICAgIC8vIEJlZ2luIHVucmVzb2x2ZWRcbiAgICB0aGlzLnJlc29sdXRpb24gPSBudWxsXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IEhhcyB0aGlzIGNvbmZsaWN0IGJlZW4gcmVzb2x2ZWQgaW4gYW55IHdheT9cbiAgICpcbiAgICogUmV0dXJuIFtCb29sZWFuXVxuICAgKi9cbiAgaXNSZXNvbHZlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHV0aW9uICE9PSBudWxsXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IEF0dGFjaCBhbiBldmVudCBoYW5kbGVyIHRvIGJlIG5vdGlmaWVkIHdoZW4gdGhpcyBjb25mbGljdCBpcyByZXNvbHZlZC5cbiAgICpcbiAgICogY2FsbGJhY2sgW0Z1bmN0aW9uXVxuICAgKi9cbiAgb25EaWRSZXNvbHZlQ29uZmxpY3QgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbigncmVzb2x2ZS1jb25mbGljdCcsIGNhbGxiYWNrKVxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBTcGVjaWZ5IHdoaWNoIFNpZGUgaXMgdG8gYmUga2VwdC4gTm90ZSB0aGF0IGVpdGhlciBzaWRlIG1heSBoYXZlIGJlZW4gbW9kaWZpZWQgYnkgdGhlXG4gICAqIHVzZXIgcHJpb3IgdG8gcmVzb2x1dGlvbi4gTm90aWZ5IGFueSBzdWJzY3JpYmVycy5cbiAgICpcbiAgICogc2lkZSBbU2lkZV0gb3VyIGNoYW5nZXMgb3IgdGhlaXIgY2hhbmdlcy5cbiAgICovXG4gIHJlc29sdmVBcyAoc2lkZSkge1xuICAgIHRoaXMucmVzb2x1dGlvbiA9IHNpZGVcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgncmVzb2x2ZS1jb25mbGljdCcpXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IExvY2F0ZSB0aGUgcG9zaXRpb24gdGhhdCB0aGUgZWRpdG9yIHNob3VsZCBzY3JvbGwgdG8gaW4gb3JkZXIgdG8gbWFrZSB0aGlzIGNvbmZsaWN0XG4gICAqIHZpc2libGUuXG4gICAqXG4gICAqIFJldHVybiBbUG9pbnRdIGJ1ZmZlciBjb29yZGluYXRlc1xuICAgKi9cbiAgc2Nyb2xsVGFyZ2V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5vdXJzLm1hcmtlci5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBBdWRpdCBhbGwgTWFya2VyIGluc3RhbmNlcyBvd25lZCBieSBzdWJvYmplY3RzIHdpdGhpbiB0aGlzIENvbmZsaWN0LlxuICAgKlxuICAgKiBSZXR1cm4gW0FycmF5PE1hcmtlcj5dXG4gICAqL1xuICBtYXJrZXJzICgpIHtcbiAgICBjb25zdCBtcyA9IFt0aGlzLm91cnMubWFya2VycygpLCB0aGlzLnRoZWlycy5tYXJrZXJzKCksIHRoaXMubmF2aWdhdG9yLm1hcmtlcnMoKV1cbiAgICBpZiAodGhpcy5iYXNlKSB7XG4gICAgICBtcy5wdXNoKHRoaXMuYmFzZS5tYXJrZXJzKCkpXG4gICAgfVxuICAgIHJldHVybiBfLmZsYXR0ZW4obXMsIHRydWUpXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IENvbnNvbGUtZnJpZW5kbHkgaWRlbnRpZmljYXRpb24gb2YgdGhpcyBjb25mbGljdC5cbiAgICpcbiAgICogUmV0dXJuIFtTdHJpbmddIHRoYXQgZGlzdGluZ3Vpc2hlcyB0aGlzIGNvbmZsaWN0IGZyb20gb3RoZXJzLlxuICAgKi9cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBgW2NvbmZsaWN0OiAke3RoaXMub3Vyc30gJHt0aGlzLnRoZWlyc31dYFxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBQYXJzZSBhbnkgY29uZmxpY3QgbWFya2VycyBpbiBhIFRleHRFZGl0b3IncyBidWZmZXIgYW5kIHJldHVybiBhIENvbmZsaWN0IHRoYXQgY29udGFpbnNcbiAgICogbWFya2VycyBjb3JyZXNwb25kaW5nIHRvIGVhY2guXG4gICAqXG4gICAqIG1lcmdlIFtNZXJnZVN0YXRlXSBSZXBvc2l0b3J5LXdpZGUgc3RhdGUgb2YgdGhlIG1lcmdlLlxuICAgKiBlZGl0b3IgW1RleHRFZGl0b3JdIFRoZSBlZGl0b3IgdG8gc2VhcmNoLlxuICAgKiByZXR1cm4gW0FycmF5PENvbmZsaWN0Pl0gQSAocG9zc2libHkgZW1wdHkpIGNvbGxlY3Rpb24gb2YgcGFyc2VkIENvbmZsaWN0cy5cbiAgICovXG4gIHN0YXRpYyBhbGwgKG1lcmdlLCBlZGl0b3IpIHtcbiAgICBjb25zdCBjb25mbGljdHMgPSBbXVxuICAgIGxldCBsYXN0Um93ID0gLTFcblxuICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zY2FuKENPTkZMSUNUX1NUQVJUX1JFR0VYLCAobSkgPT4ge1xuICAgICAgY29uZmxpY3RTdGFydFJvdyA9IG0ucmFuZ2Uuc3RhcnQucm93XG4gICAgICBpZiAoY29uZmxpY3RTdGFydFJvdyA8IGxhc3RSb3cpIHtcbiAgICAgICAgLy8gTWF0Y2ggd2l0aGluIGFuIGFscmVhZHktcGFyc2VkIGNvbmZsaWN0LlxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgdmlzaXRvciA9IG5ldyBDb25mbGljdFZpc2l0b3IobWVyZ2UsIGVkaXRvcilcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGFzdFJvdyA9IHBhcnNlQ29uZmxpY3QobWVyZ2UsIGVkaXRvciwgY29uZmxpY3RTdGFydFJvdywgdmlzaXRvcilcbiAgICAgICAgY29uc3QgY29uZmxpY3QgPSB2aXNpdG9yLmNvbmZsaWN0KClcblxuICAgICAgICBpZiAoY29uZmxpY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25mbGljdC5uYXZpZ2F0b3IubGlua1RvUHJldmlvdXMoY29uZmxpY3RzW2NvbmZsaWN0cy5sZW5ndGggLSAxXSlcbiAgICAgICAgfVxuICAgICAgICBjb25mbGljdHMucHVzaChjb25mbGljdClcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKCFlLnBhcnNlclN0YXRlKSB0aHJvdyBlXG5cbiAgICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byBwYXJzZSBjb25mbGljdDogJHtlLm1lc3NhZ2V9XFxuJHtlLnN0YWNrfWApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGNvbmZsaWN0c1xuICB9XG59XG5cbi8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdGhlIGJlZ2lubmluZyBvZiBhIHBvdGVudGlhbCBjb25mbGljdC5cbmNvbnN0IENPTkZMSUNUX1NUQVJUX1JFR0VYID0gL148ezd9ICguKylcXHI/XFxuL2dcblxuLy8gU2lkZSBwb3NpdGlvbnMuXG5jb25zdCBUT1AgPSAndG9wJ1xuY29uc3QgQkFTRSA9ICdiYXNlJ1xuY29uc3QgQk9UVE9NID0gJ2JvdHRvbSdcblxuLy8gT3B0aW9ucyB1c2VkIHRvIGluaXRpYWxpemUgbWFya2Vycy5cbmNvbnN0IG9wdGlvbnMgPSB7XG4gIGludmFsaWRhdGU6ICduZXZlcidcbn1cblxuLypcbiAqIFByaXZhdGU6IGNvbmZsaWN0IHBhcnNlciB2aXNpdG9yIHRoYXQgaWdub3JlcyBhbGwgZXZlbnRzLlxuICovXG5jbGFzcyBOb29wVmlzaXRvciB7XG5cbiAgdmlzaXRPdXJTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHsgfVxuXG4gIHZpc2l0QmFzZVNpZGUgKHBvc2l0aW9uLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkgeyB9XG5cbiAgdmlzaXRTZXBhcmF0b3IgKHNlcFJvd1N0YXJ0LCBzZXBSb3dFbmQpIHsgfVxuXG4gIHZpc2l0VGhlaXJTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHsgfVxuXG59XG5cbi8qXG4gKiBQcml2YXRlOiBjb25mbGljdCBwYXJzZXIgdmlzaXRvciB0aGF0IG1hcmtzIGVhY2ggYnVmZmVyIHJhbmdlIGFuZCBhc3NlbWJsZXMgYSBDb25mbGljdCBmcm9tIHRoZVxuICogcGllY2VzLlxuICovXG5jbGFzcyBDb25mbGljdFZpc2l0b3Ige1xuXG4gIC8qXG4gICAqIG1lcmdlIC0gW01lcmdlU3RhdGVdIHBhc3NlZCB0byBlYWNoIGluc3RhbnRpYXRlZCBTaWRlLlxuICAgKiBlZGl0b3IgLSBbVGV4dEVkaXRvcl0gZGlzcGxheWluZyB0aGUgY29uZmxpY3RpbmcgdGV4dC5cbiAgICovXG4gIGNvbnN0cnVjdG9yIChtZXJnZSwgZWRpdG9yKSB7XG4gICAgdGhpcy5tZXJnZSA9IG1lcmdlXG4gICAgdGhpcy5lZGl0b3IgPSBlZGl0b3JcbiAgICB0aGlzLnByZXZpb3VzU2lkZSA9IG51bGxcblxuICAgIHRoaXMub3VyU2lkZSA9IG51bGxcbiAgICB0aGlzLmJhc2VTaWRlID0gbnVsbFxuICAgIHRoaXMubmF2aWdhdG9yID0gbnVsbFxuICB9XG5cbiAgLypcbiAgICogcG9zaXRpb24gLSBbU3RyaW5nXSBvbmUgb2YgVE9QIG9yIEJPVFRPTS5cbiAgICogYmFubmVyUm93IC0gW0ludGVnZXJdIG9mIHRoZSBidWZmZXIgcm93IHRoYXQgY29udGFpbnMgb3VyIHNpZGUncyBiYW5uZXIuXG4gICAqIHRleHRSb3dTdGFydCAtIFtJbnRlZ2VyXSBvZiB0aGUgZmlyc3QgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW4gdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICogdGV4dFJvd0VuZCAtIFtJbnRlZ2VyXSBvZiB0aGUgZmlyc3QgYnVmZmVyIHJvdyBiZXlvbmQgdGhlIGV4dGVuZCBvZiB0aGlzIHNpZGUncyB0ZXh0LlxuICAgKi9cbiAgdmlzaXRPdXJTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHtcbiAgICB0aGlzLm91clNpZGUgPSB0aGlzLm1hcmtTaWRlKHBvc2l0aW9uLCBPdXJTaWRlLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZClcbiAgfVxuXG4gIC8qXG4gICAqIGJhbm5lclJvdyAtIFtJbnRlZ2VyXSB0aGUgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW5zIG91ciBzaWRlJ3MgYmFubmVyLlxuICAgKiB0ZXh0Um93U3RhcnQgLSBbSW50ZWdlcl0gZmlyc3QgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW4gdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICogdGV4dFJvd0VuZCAtIFtJbnRlZ2VyXSBmaXJzdCBidWZmZXIgcm93IGJleW9uZCB0aGUgZXh0ZW5kIG9mIHRoaXMgc2lkZSdzIHRleHQuXG4gICAqL1xuICB2aXNpdEJhc2VTaWRlIChiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkge1xuICAgIHRoaXMuYmFzZVNpZGUgPSB0aGlzLm1hcmtTaWRlKEJBU0UsIEJhc2VTaWRlLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZClcbiAgfVxuXG4gIC8qXG4gICAqIHNlcFJvd1N0YXJ0IC0gW0ludGVnZXJdIGJ1ZmZlciByb3cgdGhhdCBjb250YWlucyB0aGUgXCI9PT09PT09XCIgc2VwYXJhdG9yLlxuICAgKiBzZXBSb3dFbmQgLSBbSW50ZWdlcl0gdGhlIGJ1ZmZlciByb3cgYWZ0ZXIgdGhlIHNlcGFyYXRvci5cbiAgICovXG4gIHZpc2l0U2VwYXJhdG9yIChzZXBSb3dTdGFydCwgc2VwUm93RW5kKSB7XG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5lZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbc2VwUm93U3RhcnQsIDBdLCBbc2VwUm93RW5kLCAwXV0sIG9wdGlvbnMpXG4gICAgdGhpcy5wcmV2aW91c1NpZGUuZm9sbG93aW5nTWFya2VyID0gbWFya2VyXG5cbiAgICB0aGlzLm5hdmlnYXRvciA9IG5ldyBOYXZpZ2F0b3IobWFya2VyKVxuICAgIHRoaXMucHJldmlvdXNTaWRlID0gdGhpcy5uYXZpZ2F0b3JcbiAgfVxuXG4gIC8qXG4gICAqIHBvc2l0aW9uIC0gW1N0cmluZ10gQWx3YXlzIEJBU0U7IGFjY2VwdGVkIGZvciBjb25zaXN0ZW5jeS5cbiAgICogYmFubmVyUm93IC0gW0ludGVnZXJdIHRoZSBidWZmZXIgcm93IHRoYXQgY29udGFpbnMgb3VyIHNpZGUncyBiYW5uZXIuXG4gICAqIHRleHRSb3dTdGFydCAtIFtJbnRlZ2VyXSBmaXJzdCBidWZmZXIgcm93IHRoYXQgY29udGFpbiB0aGlzIHNpZGUncyB0ZXh0LlxuICAgKiB0ZXh0Um93RW5kIC0gW0ludGVnZXJdIGZpcnN0IGJ1ZmZlciByb3cgYmV5b25kIHRoZSBleHRlbmQgb2YgdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICovXG4gIHZpc2l0VGhlaXJTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHtcbiAgICB0aGlzLnRoZWlyU2lkZSA9IHRoaXMubWFya1NpZGUocG9zaXRpb24sIFRoZWlyU2lkZSwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpXG4gIH1cblxuICBtYXJrU2lkZSAocG9zaXRpb24sIHNpZGVLbGFzcywgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHtcbiAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHRoaXMuc2lkZURlc2NyaXB0aW9uKGJhbm5lclJvdylcblxuICAgIGNvbnN0IGJhbm5lck1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW2Jhbm5lclJvdywgMF0sIFtiYW5uZXJSb3cgKyAxLCAwXV0sIG9wdGlvbnMpXG5cbiAgICBpZiAodGhpcy5wcmV2aW91c1NpZGUpIHtcbiAgICAgIHRoaXMucHJldmlvdXNTaWRlLmZvbGxvd2luZ01hcmtlciA9IGJhbm5lck1hcmtlclxuICAgIH1cblxuICAgIGNvbnN0IHRleHRSYW5nZSA9IFtbdGV4dFJvd1N0YXJ0LCAwXSwgW3RleHRSb3dFbmQsIDBdXVxuICAgIGNvbnN0IHRleHRNYXJrZXIgPSB0aGlzLmVkaXRvci5tYXJrQnVmZmVyUmFuZ2UodGV4dFJhbmdlLCBvcHRpb25zKVxuICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZSh0ZXh0UmFuZ2UpXG5cbiAgICBjb25zdCBzaWRlID0gbmV3IHNpZGVLbGFzcyh0ZXh0LCBkZXNjcmlwdGlvbiwgdGV4dE1hcmtlciwgYmFubmVyTWFya2VyLCBwb3NpdGlvbilcbiAgICB0aGlzLnByZXZpb3VzU2lkZSA9IHNpZGVcbiAgICByZXR1cm4gc2lkZVxuICB9XG5cbiAgLypcbiAgICogUGFyc2UgdGhlIGJhbm5lciBkZXNjcmlwdGlvbiBmb3IgdGhlIGN1cnJlbnQgc2lkZSBmcm9tIGEgYmFubmVyIHJvdy5cbiAgICovXG4gIHNpZGVEZXNjcmlwdGlvbiAoYmFubmVyUm93KSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGJhbm5lclJvdykubWF0Y2goL15bPHw+XXs3fSAoLiopJC8pWzFdXG4gIH1cblxuICBjb25mbGljdCAoKSB7XG4gICAgdGhpcy5wcmV2aW91c1NpZGUuZm9sbG93aW5nTWFya2VyID0gdGhpcy5wcmV2aW91c1NpZGUucmVmQmFubmVyTWFya2VyXG5cbiAgICByZXR1cm4gbmV3IENvbmZsaWN0KHRoaXMub3VyU2lkZSwgdGhpcy50aGVpclNpZGUsIHRoaXMuYmFzZVNpZGUsIHRoaXMubmF2aWdhdG9yLCB0aGlzLm1lcmdlKVxuICB9XG5cbn1cblxuLypcbiAqIFByaXZhdGU6IHBhcnNlQ29uZmxpY3QgZGlzY292ZXJzIGdpdCBjb25mbGljdCBtYXJrZXJzIGluIGEgY29ycHVzIG9mIHRleHQgYW5kIGNvbnN0cnVjdHMgQ29uZmxpY3RcbiAqIGluc3RhbmNlcyB0aGF0IG1hcmsgdGhlIGNvcnJlY3QgbGluZXMuXG4gKlxuICogUmV0dXJucyBbSW50ZWdlcl0gdGhlIGJ1ZmZlciByb3cgYWZ0ZXIgdGhlIGZpbmFsIDw8PDw8PCBib3VuZGFyeS5cbiAqL1xuY29uc3QgcGFyc2VDb25mbGljdCA9IGZ1bmN0aW9uIChtZXJnZSwgZWRpdG9yLCByb3csIHZpc2l0b3IpIHtcbiAgbGV0IGxhc3RCb3VuZGFyeSA9IG51bGxcblxuICAvLyBWaXNpdCBhIHNpZGUgdGhhdCBiZWdpbnMgd2l0aCBhIGJhbm5lciBhbmQgZGVzY3JpcHRpb24gYXMgaXRzIGZpcnN0IGxpbmUuXG4gIGNvbnN0IHZpc2l0SGVhZGVyU2lkZSA9IChwb3NpdGlvbiwgdmlzaXRNZXRob2QpID0+IHtcbiAgICBjb25zdCBzaWRlUm93U3RhcnQgPSByb3dcbiAgICByb3cgKz0gMVxuICAgIGFkdmFuY2VUb0JvdW5kYXJ5KCd8PScpXG4gICAgY29uc3Qgc2lkZVJvd0VuZCA9IHJvd1xuXG4gICAgdmlzaXRvclt2aXNpdE1ldGhvZF0ocG9zaXRpb24sIHNpZGVSb3dTdGFydCwgc2lkZVJvd1N0YXJ0ICsgMSwgc2lkZVJvd0VuZClcbiAgfVxuXG4gIC8vIFZpc2l0IHRoZSBiYXNlIHNpZGUgZnJvbSBkaWZmMyBvdXRwdXQsIGlmIG9uZSBpcyBwcmVzZW50LCB0aGVuIHZpc2l0IHRoZSBzZXBhcmF0b3IuXG4gIGNvbnN0IHZpc2l0QmFzZUFuZFNlcGFyYXRvciA9ICgpID0+IHtcbiAgICBpZiAobGFzdEJvdW5kYXJ5ID09PSAnfCcpIHtcbiAgICAgIHZpc2l0QmFzZVNpZGUoKVxuICAgIH1cblxuICAgIHZpc2l0U2VwYXJhdG9yKClcbiAgfVxuXG4gIC8vIFZpc2l0IGEgYmFzZSBzaWRlIGZyb20gZGlmZjMgb3V0cHV0LlxuICBjb25zdCB2aXNpdEJhc2VTaWRlID0gKCkgPT4ge1xuICAgIGNvbnN0IHNpZGVSb3dTdGFydCA9IHJvd1xuICAgIHJvdyArPSAxXG5cbiAgICBsZXQgYiA9IGFkdmFuY2VUb0JvdW5kYXJ5KCc8PScpXG4gICAgd2hpbGUgKGIgPT09ICc8Jykge1xuICAgICAgLy8gRW1iZWRkZWQgcmVjdXJzaXZlIGNvbmZsaWN0IHdpdGhpbiBhIGJhc2Ugc2lkZSwgY2F1c2VkIGJ5IGEgY3Jpc3MtY3Jvc3MgbWVyZ2UuXG4gICAgICAvLyBBZHZhbmNlIGJleW9uZCBpdCB3aXRob3V0IG1hcmtpbmcgYW55dGhpbmcuXG4gICAgICByb3cgPSBwYXJzZUNvbmZsaWN0KG1lcmdlLCBlZGl0b3IsIHJvdywgbmV3IE5vb3BWaXNpdG9yKCkpXG4gICAgICBiID0gYWR2YW5jZVRvQm91bmRhcnkoJzw9JylcbiAgICB9XG5cbiAgICBjb25zdCBzaWRlUm93RW5kID0gcm93XG5cbiAgICB2aXNpdG9yLnZpc2l0QmFzZVNpZGUoc2lkZVJvd1N0YXJ0LCBzaWRlUm93U3RhcnQgKyAxLCBzaWRlUm93RW5kKVxuICB9XG5cbiAgLy8gVmlzaXQgYSBcIj09PT09PT09XCIgc2VwYXJhdG9yLlxuICBjb25zdCB2aXNpdFNlcGFyYXRvciA9ICgpID0+IHtcbiAgICBjb25zdCBzZXBSb3dTdGFydCA9IHJvd1xuICAgIHJvdyArPSAxXG4gICAgY29uc3Qgc2VwUm93RW5kID0gcm93XG5cbiAgICB2aXNpdG9yLnZpc2l0U2VwYXJhdG9yKHNlcFJvd1N0YXJ0LCBzZXBSb3dFbmQpXG4gIH1cblxuICAvLyBWaWRpZSBhIHNpZGUgd2l0aCBhIGJhbm5lciBhbmQgZGVzY3JpcHRpb24gYXMgaXRzIGxhc3QgbGluZS5cbiAgY29uc3QgdmlzaXRGb290ZXJTaWRlID0gKHBvc2l0aW9uLCB2aXNpdE1ldGhvZCkgPT4ge1xuICAgIGNvbnN0IHNpZGVSb3dTdGFydCA9IHJvd1xuICAgIGNvbnN0IGIgPSBhZHZhbmNlVG9Cb3VuZGFyeSgnPicpXG4gICAgcm93ICs9IDFcbiAgICBzaWRlUm93RW5kID0gcm93XG5cbiAgICB2aXNpdG9yW3Zpc2l0TWV0aG9kXShwb3NpdGlvbiwgc2lkZVJvd0VuZCAtIDEsIHNpZGVSb3dTdGFydCwgc2lkZVJvd0VuZCAtIDEpXG4gIH1cblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGN1cnJlbnQgcm93IGlzIGEgc2lkZSBib3VuZGFyeS5cbiAgLy9cbiAgLy8gYm91bmRhcnlLaW5kcyAtIFtTdHJpbmddIGFueSBjb21iaW5hdGlvbiBvZiA8LCB8LCA9LCBvciA+IHRvIGxpbWl0IHRoZSBraW5kcyBvZiBib3VuZGFyeVxuICAvLyAgIGRldGVjdGVkLlxuICAvL1xuICAvLyBSZXR1cm5zIHRoZSBtYXRjaGluZyBib3VuZGFyeUtpbmRzIGNoYXJhY3Rlciwgb3IgYG51bGxgIGlmIG5vbmUgbWF0Y2guXG4gIGNvbnN0IGlzQXRCb3VuZGFyeSA9IChib3VuZGFyeUtpbmRzID0gJzx8PT4nKSA9PiB7XG4gICAgY29uc3QgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpXG4gICAgZm9yIChiIG9mIGJvdW5kYXJ5S2luZHMpIHtcbiAgICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoYi5yZXBlYXQoNykpKSB7XG4gICAgICAgIHJldHVybiBiXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBJbmNyZW1lbnQgdGhlIGN1cnJlbnQgcm93IHVudGlsIHRoZSBjdXJyZW50IGxpbmUgbWF0Y2hlcyBvbmUgb2YgdGhlIHByb3ZpZGVkIGJvdW5kYXJ5IGtpbmRzLFxuICAvLyBvciB1bnRpbCB0aGVyZSBhcmUgbm8gbW9yZSBsaW5lcyBpbiB0aGUgZWRpdG9yLlxuICAvL1xuICAvLyBib3VuZGFyeUtpbmRzIC0gW1N0cmluZ10gYW55IGNvbWJpbmF0aW9uIG9mIDwsIHwsID0sIG9yID4gdG8gbGltaXQgdGhlIGtpbmRzIG9mIGJvdW5kYXJpZXNcbiAgLy8gICB0aGF0IGhhbHQgdGhlIHByb2dyZXNzaW9uLlxuICAvL1xuICAvLyBSZXR1cm5zIHRoZSBtYXRjaGluZyBib3VuZGFyeUtpbmRzIGNoYXJhY3Rlciwgb3IgJ251bGwnIGlmIHRoZXJlIGFyZSBubyBtYXRjaGVzIHRvIHRoZSBlbmQgb2ZcbiAgLy8gdGhlIGVkaXRvci5cbiAgY29uc3QgYWR2YW5jZVRvQm91bmRhcnkgPSAoYm91bmRhcnlLaW5kcyA9ICc8fD0+JykgPT4ge1xuICAgIGxldCBiID0gaXNBdEJvdW5kYXJ5KGJvdW5kYXJ5S2luZHMpXG4gICAgd2hpbGUgKGIgPT09IG51bGwpIHtcbiAgICAgIHJvdyArPSAxXG4gICAgICBpZiAocm93ID4gZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSkge1xuICAgICAgICBjb25zdCBlID0gbmV3IEVycm9yKCdVbnRlcm1pbmF0ZWQgY29uZmxpY3Qgc2lkZScpXG4gICAgICAgIGUucGFyc2VyU3RhdGUgPSB0cnVlXG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICAgIGIgPSBpc0F0Qm91bmRhcnkoYm91bmRhcnlLaW5kcylcbiAgICB9XG5cbiAgICBsYXN0Qm91bmRhcnkgPSBiXG4gICAgcmV0dXJuIGJcbiAgfVxuXG4gIGlmICghbWVyZ2UuaXNSZWJhc2UpIHtcbiAgICB2aXNpdEhlYWRlclNpZGUoVE9QLCAndmlzaXRPdXJTaWRlJylcbiAgICB2aXNpdEJhc2VBbmRTZXBhcmF0b3IoKVxuICAgIHZpc2l0Rm9vdGVyU2lkZShCT1RUT00sICd2aXNpdFRoZWlyU2lkZScpXG4gIH0gZWxzZSB7XG4gICAgdmlzaXRIZWFkZXJTaWRlKFRPUCwgJ3Zpc2l0VGhlaXJTaWRlJylcbiAgICB2aXNpdEJhc2VBbmRTZXBhcmF0b3IoKVxuICAgIHZpc2l0Rm9vdGVyU2lkZShCT1RUT00sICd2aXNpdE91clNpZGUnKVxuICB9XG5cbiAgcmV0dXJuIHJvd1xufVxuIl19