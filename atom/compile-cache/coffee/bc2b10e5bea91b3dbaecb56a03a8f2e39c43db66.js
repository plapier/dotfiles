(function() {
  var $, $$, SelectList, SelectListView, _, fuzzaldrin, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom-space-pen-views'), SelectListView = ref.SelectListView, $ = ref.$, $$ = ref.$$;

  fuzzaldrin = require('fuzzaldrin');

  SelectList = (function(superClass) {
    extend(SelectList, superClass);

    function SelectList() {
      return SelectList.__super__.constructor.apply(this, arguments);
    }

    SelectList.prototype.initialize = function() {
      SelectList.__super__.initialize.apply(this, arguments);
      return this.addClass('vim-mode-plus-select-list');
    };

    SelectList.prototype.getFilterKey = function() {
      return 'displayName';
    };

    SelectList.prototype.cancelled = function() {
      this.vimState.emitter.emit('did-cancel-select-list');
      return this.hide();
    };

    SelectList.prototype.show = function(vimState, options) {
      var ref1;
      this.vimState = vimState;
      if (options.maxItems != null) {
        this.setMaxItems(options.maxItems);
      }
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setItems(options.items);
      return this.focusFilterEditor();
    };

    SelectList.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    SelectList.prototype.viewForItem = function(arg) {
      var displayName, filterQuery, matches, name;
      name = arg.name, displayName = arg.displayName;
      filterQuery = this.getFilterQuery();
      matches = fuzzaldrin.match(displayName, filterQuery);
      return $$(function() {
        var highlighter;
        highlighter = (function(_this) {
          return function(command, matches, offsetIndex) {
            var i, lastIndex, len, matchIndex, matchedChars, unmatched;
            lastIndex = 0;
            matchedChars = [];
            for (i = 0, len = matches.length; i < len; i++) {
              matchIndex = matches[i];
              matchIndex -= offsetIndex;
              if (matchIndex < 0) {
                continue;
              }
              unmatched = command.substring(lastIndex, matchIndex);
              if (unmatched) {
                if (matchedChars.length) {
                  _this.span(matchedChars.join(''), {
                    "class": 'character-match'
                  });
                }
                matchedChars = [];
                _this.text(unmatched);
              }
              matchedChars.push(command[matchIndex]);
              lastIndex = matchIndex + 1;
            }
            if (matchedChars.length) {
              _this.span(matchedChars.join(''), {
                "class": 'character-match'
              });
            }
            return _this.text(command.substring(lastIndex));
          };
        })(this);
        return this.li({
          "class": 'event',
          'data-event-name': name
        }, (function(_this) {
          return function() {
            return _this.span({
              title: displayName
            }, function() {
              return highlighter(displayName, matches, 0);
            });
          };
        })(this));
      });
    };

    SelectList.prototype.confirmed = function(item) {
      this.vimState.emitter.emit('did-confirm-select-list', item);
      return this.cancel();
    };

    return SelectList;

  })(SelectListView);

  module.exports = new SelectList;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9zZWxlY3QtbGlzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBMEIsT0FBQSxDQUFRLHNCQUFSLENBQTFCLEVBQUMsbUNBQUQsRUFBaUIsU0FBakIsRUFBb0I7O0VBQ3BCLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUjs7RUFFUDs7Ozs7Ozt5QkFDSixVQUFBLEdBQVksU0FBQTtNQUNWLDRDQUFBLFNBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLDJCQUFWO0lBRlU7O3lCQUlaLFlBQUEsR0FBYyxTQUFBO2FBQ1o7SUFEWTs7eUJBR2QsU0FBQSxHQUFXLFNBQUE7TUFDVCxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUF1Qix3QkFBdkI7YUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRlM7O3lCQUlYLElBQUEsR0FBTSxTQUFDLFFBQUQsRUFBWSxPQUFaO0FBQ0osVUFBQTtNQURLLElBQUMsQ0FBQSxXQUFEO01BQ0wsSUFBRyx3QkFBSDtRQUNFLElBQUMsQ0FBQSxXQUFELENBQWEsT0FBTyxDQUFDLFFBQXJCLEVBREY7O01BRUEsT0FBNEIsSUFBQyxDQUFBLFFBQTdCLEVBQUMsSUFBQyxDQUFBLHFCQUFBLGFBQUYsRUFBaUIsSUFBQyxDQUFBLGNBQUE7TUFDbEIsSUFBQyxDQUFBLG1CQUFELENBQUE7O1FBQ0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUMsSUFBQSxFQUFNLElBQVA7U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQU8sQ0FBQyxLQUFsQjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBUkk7O3lCQVVOLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTsrQ0FBTSxDQUFFLElBQVIsQ0FBQTtJQURJOzt5QkFHTixXQUFBLEdBQWEsU0FBQyxHQUFEO0FBRVgsVUFBQTtNQUZhLGlCQUFNO01BRW5CLFdBQUEsR0FBYyxJQUFDLENBQUEsY0FBRCxDQUFBO01BQ2QsT0FBQSxHQUFVLFVBQVUsQ0FBQyxLQUFYLENBQWlCLFdBQWpCLEVBQThCLFdBQTlCO2FBQ1YsRUFBQSxDQUFHLFNBQUE7QUFDRCxZQUFBO1FBQUEsV0FBQSxHQUFjLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsT0FBRCxFQUFVLE9BQVYsRUFBbUIsV0FBbkI7QUFDWixnQkFBQTtZQUFBLFNBQUEsR0FBWTtZQUNaLFlBQUEsR0FBZTtBQUVmLGlCQUFBLHlDQUFBOztjQUNFLFVBQUEsSUFBYztjQUNkLElBQVksVUFBQSxHQUFhLENBQXpCO0FBQUEseUJBQUE7O2NBQ0EsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFNBQWxCLEVBQTZCLFVBQTdCO2NBQ1osSUFBRyxTQUFIO2dCQUNFLElBQXlELFlBQVksQ0FBQyxNQUF0RTtrQkFBQSxLQUFDLENBQUEsSUFBRCxDQUFNLFlBQVksQ0FBQyxJQUFiLENBQWtCLEVBQWxCLENBQU4sRUFBNkI7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxpQkFBUDttQkFBN0IsRUFBQTs7Z0JBQ0EsWUFBQSxHQUFlO2dCQUNmLEtBQUMsQ0FBQSxJQUFELENBQU0sU0FBTixFQUhGOztjQUlBLFlBQVksQ0FBQyxJQUFiLENBQWtCLE9BQVEsQ0FBQSxVQUFBLENBQTFCO2NBQ0EsU0FBQSxHQUFZLFVBQUEsR0FBYTtBQVQzQjtZQVdBLElBQXlELFlBQVksQ0FBQyxNQUF0RTtjQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sWUFBWSxDQUFDLElBQWIsQ0FBa0IsRUFBbEIsQ0FBTixFQUE2QjtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGlCQUFQO2VBQTdCLEVBQUE7O21CQUVBLEtBQUMsQ0FBQSxJQUFELENBQU0sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsU0FBbEIsQ0FBTjtVQWpCWTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7ZUFtQmQsSUFBQyxDQUFBLEVBQUQsQ0FBSTtVQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtVQUFnQixpQkFBQSxFQUFtQixJQUFuQztTQUFKLEVBQTZDLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQzNDLEtBQUMsQ0FBQSxJQUFELENBQU07Y0FBQSxLQUFBLEVBQU8sV0FBUDthQUFOLEVBQTBCLFNBQUE7cUJBQUcsV0FBQSxDQUFZLFdBQVosRUFBeUIsT0FBekIsRUFBa0MsQ0FBbEM7WUFBSCxDQUExQjtVQUQyQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0M7TUFwQkMsQ0FBSDtJQUpXOzt5QkEyQmIsU0FBQSxHQUFXLFNBQUMsSUFBRDtNQUNULElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQWxCLENBQXVCLHlCQUF2QixFQUFrRCxJQUFsRDthQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFGUzs7OztLQXBEWTs7RUF3RHpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUk7QUE1RHJCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntTZWxlY3RMaXN0VmlldywgJCwgJCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5mdXp6YWxkcmluID0gcmVxdWlyZSAnZnV6emFsZHJpbidcblxuY2xhc3MgU2VsZWN0TGlzdCBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAYWRkQ2xhc3MoJ3ZpbS1tb2RlLXBsdXMtc2VsZWN0LWxpc3QnKVxuXG4gIGdldEZpbHRlcktleTogLT5cbiAgICAnZGlzcGxheU5hbWUnXG5cbiAgY2FuY2VsbGVkOiAtPlxuICAgIEB2aW1TdGF0ZS5lbWl0dGVyLmVtaXQgJ2RpZC1jYW5jZWwtc2VsZWN0LWxpc3QnXG4gICAgQGhpZGUoKVxuXG4gIHNob3c6IChAdmltU3RhdGUsIG9wdGlvbnMpIC0+XG4gICAgaWYgb3B0aW9ucy5tYXhJdGVtcz9cbiAgICAgIEBzZXRNYXhJdGVtcyhvcHRpb25zLm1heEl0ZW1zKVxuICAgIHtAZWRpdG9yRWxlbWVudCwgQGVkaXRvcn0gPSBAdmltU3RhdGVcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoe2l0ZW06IHRoaXN9KVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAc2V0SXRlbXMob3B0aW9ucy5pdGVtcylcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGhpZGU6IC0+XG4gICAgQHBhbmVsPy5oaWRlKClcblxuICB2aWV3Rm9ySXRlbTogKHtuYW1lLCBkaXNwbGF5TmFtZX0pIC0+XG4gICAgIyBTdHlsZSBtYXRjaGVkIGNoYXJhY3RlcnMgaW4gc2VhcmNoIHJlc3VsdHNcbiAgICBmaWx0ZXJRdWVyeSA9IEBnZXRGaWx0ZXJRdWVyeSgpXG4gICAgbWF0Y2hlcyA9IGZ1enphbGRyaW4ubWF0Y2goZGlzcGxheU5hbWUsIGZpbHRlclF1ZXJ5KVxuICAgICQkIC0+XG4gICAgICBoaWdobGlnaHRlciA9IChjb21tYW5kLCBtYXRjaGVzLCBvZmZzZXRJbmRleCkgPT5cbiAgICAgICAgbGFzdEluZGV4ID0gMFxuICAgICAgICBtYXRjaGVkQ2hhcnMgPSBbXSAjIEJ1aWxkIHVwIGEgc2V0IG9mIG1hdGNoZWQgY2hhcnMgdG8gYmUgbW9yZSBzZW1hbnRpY1xuXG4gICAgICAgIGZvciBtYXRjaEluZGV4IGluIG1hdGNoZXNcbiAgICAgICAgICBtYXRjaEluZGV4IC09IG9mZnNldEluZGV4XG4gICAgICAgICAgY29udGludWUgaWYgbWF0Y2hJbmRleCA8IDAgIyBJZiBtYXJraW5nIHVwIHRoZSBiYXNlbmFtZSwgb21pdCBjb21tYW5kIG1hdGNoZXNcbiAgICAgICAgICB1bm1hdGNoZWQgPSBjb21tYW5kLnN1YnN0cmluZyhsYXN0SW5kZXgsIG1hdGNoSW5kZXgpXG4gICAgICAgICAgaWYgdW5tYXRjaGVkXG4gICAgICAgICAgICBAc3BhbiBtYXRjaGVkQ2hhcnMuam9pbignJyksIGNsYXNzOiAnY2hhcmFjdGVyLW1hdGNoJyBpZiBtYXRjaGVkQ2hhcnMubGVuZ3RoXG4gICAgICAgICAgICBtYXRjaGVkQ2hhcnMgPSBbXVxuICAgICAgICAgICAgQHRleHQgdW5tYXRjaGVkXG4gICAgICAgICAgbWF0Y2hlZENoYXJzLnB1c2goY29tbWFuZFttYXRjaEluZGV4XSlcbiAgICAgICAgICBsYXN0SW5kZXggPSBtYXRjaEluZGV4ICsgMVxuXG4gICAgICAgIEBzcGFuIG1hdGNoZWRDaGFycy5qb2luKCcnKSwgY2xhc3M6ICdjaGFyYWN0ZXItbWF0Y2gnIGlmIG1hdGNoZWRDaGFycy5sZW5ndGhcbiAgICAgICAgIyBSZW1haW5pbmcgY2hhcmFjdGVycyBhcmUgcGxhaW4gdGV4dFxuICAgICAgICBAdGV4dCBjb21tYW5kLnN1YnN0cmluZyhsYXN0SW5kZXgpXG5cbiAgICAgIEBsaSBjbGFzczogJ2V2ZW50JywgJ2RhdGEtZXZlbnQtbmFtZSc6IG5hbWUsID0+XG4gICAgICAgIEBzcGFuIHRpdGxlOiBkaXNwbGF5TmFtZSwgLT4gaGlnaGxpZ2h0ZXIoZGlzcGxheU5hbWUsIG1hdGNoZXMsIDApXG5cbiAgY29uZmlybWVkOiAoaXRlbSkgLT5cbiAgICBAdmltU3RhdGUuZW1pdHRlci5lbWl0ICdkaWQtY29uZmlybS1zZWxlY3QtbGlzdCcsIGl0ZW1cbiAgICBAY2FuY2VsKClcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgU2VsZWN0TGlzdFxuIl19
