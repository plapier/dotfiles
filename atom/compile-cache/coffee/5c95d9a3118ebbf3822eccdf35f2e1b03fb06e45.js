(function() {
  var FlashManager, _, addDemoSuffix, flashTypes, isNotEmpty, ref, removeDemoSuffix, replaceDecorationClassBy,
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('./utils'), isNotEmpty = ref.isNotEmpty, replaceDecorationClassBy = ref.replaceDecorationClassBy;

  flashTypes = {
    operator: {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator'
      }
    },
    'operator-long': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-long'
      }
    },
    'operator-occurrence': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-occurrence'
      }
    },
    'operator-remove-occurrence': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash operator-remove-occurrence'
      }
    },
    search: {
      allowMultiple: false,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash search'
      }
    },
    screen: {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash screen'
      }
    },
    'undo-redo': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo'
      }
    },
    'undo-redo-multiple-changes': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo-multiple-changes'
      }
    },
    'undo-redo-multiple-delete': {
      allowMultiple: true,
      decorationOptions: {
        type: 'highlight',
        "class": 'vim-mode-plus-flash undo-redo-multiple-delete'
      }
    }
  };

  addDemoSuffix = replaceDecorationClassBy.bind(null, function(text) {
    return text + '-demo';
  });

  removeDemoSuffix = replaceDecorationClassBy.bind(null, function(text) {
    return text.replace(/-demo$/, '');
  });

  module.exports = FlashManager = (function() {
    function FlashManager(vimState) {
      this.vimState = vimState;
      this.editor = this.vimState.editor;
      this.markersByType = new Map;
      this.vimState.onDidDestroy(this.destroy.bind(this));
      this.postponedDestroyMarkersTasks = [];
    }

    FlashManager.prototype.destroy = function() {
      this.markersByType.forEach(function(markers) {
        var i, len, marker, results;
        results = [];
        for (i = 0, len = markers.length; i < len; i++) {
          marker = markers[i];
          results.push(marker.destroy());
        }
        return results;
      });
      return this.markersByType.clear();
    };

    FlashManager.prototype.destroyDemoModeMarkers = function() {
      var i, len, ref1, resolve;
      ref1 = this.postponedDestroyMarkersTasks;
      for (i = 0, len = ref1.length; i < len; i++) {
        resolve = ref1[i];
        resolve();
      }
      return this.postponedDestroyMarkersTasks = [];
    };

    FlashManager.prototype.destroyMarkersAfter = function(markers, timeout) {
      return setTimeout(function() {
        var i, len, marker, results;
        results = [];
        for (i = 0, len = markers.length; i < len; i++) {
          marker = markers[i];
          results.push(marker.destroy());
        }
        return results;
      }, timeout);
    };

    FlashManager.prototype.flash = function(ranges, options, rangeType) {
      var allowMultiple, decorationOptions, decorations, i, len, marker, markerOptions, markers, range, ref1, ref2, timeout, type;
      if (rangeType == null) {
        rangeType = 'buffer';
      }
      if (!_.isArray(ranges)) {
        ranges = [ranges];
      }
      ranges = ranges.filter(isNotEmpty);
      if (!ranges.length) {
        return null;
      }
      type = options.type, timeout = options.timeout;
      if (timeout == null) {
        timeout = 1000;
      }
      ref1 = flashTypes[type], allowMultiple = ref1.allowMultiple, decorationOptions = ref1.decorationOptions;
      markerOptions = {
        invalidate: 'touch'
      };
      switch (rangeType) {
        case 'buffer':
          markers = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = ranges.length; i < len; i++) {
              range = ranges[i];
              results.push(this.editor.markBufferRange(range, markerOptions));
            }
            return results;
          }).call(this);
          break;
        case 'screen':
          markers = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = ranges.length; i < len; i++) {
              range = ranges[i];
              results.push(this.editor.markScreenRange(range, markerOptions));
            }
            return results;
          }).call(this);
      }
      if (!allowMultiple) {
        if (this.markersByType.has(type)) {
          ref2 = this.markersByType.get(type);
          for (i = 0, len = ref2.length; i < len; i++) {
            marker = ref2[i];
            marker.destroy();
          }
        }
        this.markersByType.set(type, markers);
      }
      decorations = markers.map((function(_this) {
        return function(marker) {
          return _this.editor.decorateMarker(marker, decorationOptions);
        };
      })(this));
      if (this.vimState.globalState.get('demoModeIsActive')) {
        decorations.map(addDemoSuffix);
        return this.postponedDestroyMarkersTasks.push((function(_this) {
          return function() {
            decorations.map(removeDemoSuffix);
            return _this.destroyMarkersAfter(markers, timeout);
          };
        })(this));
      } else {
        return this.destroyMarkersAfter(markers, timeout);
      }
    };

    FlashManager.prototype.flashScreenRange = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.flash.apply(this, args.concat('screen'));
    };

    return FlashManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9mbGFzaC1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUdBQUE7SUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQXlDLE9BQUEsQ0FBUSxTQUFSLENBQXpDLEVBQUMsMkJBQUQsRUFBYTs7RUFFYixVQUFBLEdBQ0U7SUFBQSxRQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8sOEJBRFA7T0FGRjtLQURGO0lBS0EsZUFBQSxFQUNFO01BQUEsYUFBQSxFQUFlLElBQWY7TUFDQSxpQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFdBQU47UUFDQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1DQURQO09BRkY7S0FORjtJQVVBLHFCQUFBLEVBQ0U7TUFBQSxhQUFBLEVBQWUsSUFBZjtNQUNBLGlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sV0FBTjtRQUNBLENBQUEsS0FBQSxDQUFBLEVBQU8seUNBRFA7T0FGRjtLQVhGO0lBZUEsNEJBQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyxnREFEUDtPQUZGO0tBaEJGO0lBb0JBLE1BQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxLQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxXQUFOO1FBQ0EsQ0FBQSxLQUFBLENBQUEsRUFBTyw0QkFEUDtPQUZGO0tBckJGO0lBeUJBLE1BQUEsRUFDRTtNQUFBLGFBQUEsRUFBZSxJQUFmO01BQ0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxX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ID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue2lzTm90RW1wdHksIHJlcGxhY2VEZWNvcmF0aW9uQ2xhc3NCeX0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5mbGFzaFR5cGVzID1cbiAgb3BlcmF0b3I6XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBvcGVyYXRvcidcbiAgJ29wZXJhdG9yLWxvbmcnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggb3BlcmF0b3ItbG9uZydcbiAgJ29wZXJhdG9yLW9jY3VycmVuY2UnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggb3BlcmF0b3Itb2NjdXJyZW5jZSdcbiAgJ29wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIG9wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJ1xuICBzZWFyY2g6XG4gICAgYWxsb3dNdWx0aXBsZTogZmFsc2VcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggc2VhcmNoJ1xuICBzY3JlZW46XG4gICAgYWxsb3dNdWx0aXBsZTogdHJ1ZVxuICAgIGRlY29yYXRpb25PcHRpb25zOlxuICAgICAgdHlwZTogJ2hpZ2hsaWdodCdcbiAgICAgIGNsYXNzOiAndmltLW1vZGUtcGx1cy1mbGFzaCBzY3JlZW4nXG4gICd1bmRvLXJlZG8nOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggdW5kby1yZWRvJ1xuICAndW5kby1yZWRvLW11bHRpcGxlLWNoYW5nZXMnOlxuICAgIGFsbG93TXVsdGlwbGU6IHRydWVcbiAgICBkZWNvcmF0aW9uT3B0aW9uczpcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogJ3ZpbS1tb2RlLXBsdXMtZmxhc2ggdW5kby1yZWRvLW11bHRpcGxlLWNoYW5nZXMnXG4gICd1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlJzpcbiAgICBhbGxvd011bHRpcGxlOiB0cnVlXG4gICAgZGVjb3JhdGlvbk9wdGlvbnM6XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6ICd2aW0tbW9kZS1wbHVzLWZsYXNoIHVuZG8tcmVkby1tdWx0aXBsZS1kZWxldGUnXG5cbmFkZERlbW9TdWZmaXggPSByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnkuYmluZChudWxsLCAodGV4dCkgLT4gdGV4dCArICctZGVtbycpXG5yZW1vdmVEZW1vU3VmZml4ID0gcmVwbGFjZURlY29yYXRpb25DbGFzc0J5LmJpbmQobnVsbCwgKHRleHQpIC0+IHRleHQucmVwbGFjZSgvLWRlbW8kLywgJycpKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBGbGFzaE1hbmFnZXJcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3J9ID0gQHZpbVN0YXRlXG4gICAgQG1hcmtlcnNCeVR5cGUgPSBuZXcgTWFwXG4gICAgQHZpbVN0YXRlLm9uRGlkRGVzdHJveShAZGVzdHJveS5iaW5kKHRoaXMpKVxuICAgIEBwb3N0cG9uZWREZXN0cm95TWFya2Vyc1Rhc2tzID0gW11cblxuICBkZXN0cm95OiAtPlxuICAgIEBtYXJrZXJzQnlUeXBlLmZvckVhY2ggKG1hcmtlcnMpIC0+XG4gICAgICBtYXJrZXIuZGVzdHJveSgpIGZvciBtYXJrZXIgaW4gbWFya2Vyc1xuICAgIEBtYXJrZXJzQnlUeXBlLmNsZWFyKClcblxuICBkZXN0cm95RGVtb01vZGVNYXJrZXJzOiAtPlxuICAgIGZvciByZXNvbHZlIGluIEBwb3N0cG9uZWREZXN0cm95TWFya2Vyc1Rhc2tzXG4gICAgICByZXNvbHZlKClcbiAgICBAcG9zdHBvbmVkRGVzdHJveU1hcmtlcnNUYXNrcyA9IFtdXG5cbiAgZGVzdHJveU1hcmtlcnNBZnRlcjogKG1hcmtlcnMsIHRpbWVvdXQpIC0+XG4gICAgc2V0VGltZW91dCAtPlxuICAgICAgZm9yIG1hcmtlciBpbiBtYXJrZXJzXG4gICAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICAsIHRpbWVvdXRcblxuICBmbGFzaDogKHJhbmdlcywgb3B0aW9ucywgcmFuZ2VUeXBlPSdidWZmZXInKSAtPlxuICAgIHJhbmdlcyA9IFtyYW5nZXNdIHVubGVzcyBfLmlzQXJyYXkocmFuZ2VzKVxuICAgIHJhbmdlcyA9IHJhbmdlcy5maWx0ZXIoaXNOb3RFbXB0eSlcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgcmFuZ2VzLmxlbmd0aFxuXG4gICAge3R5cGUsIHRpbWVvdXR9ID0gb3B0aW9uc1xuICAgIHRpbWVvdXQgPz0gMTAwMFxuXG4gICAge2FsbG93TXVsdGlwbGUsIGRlY29yYXRpb25PcHRpb25zfSA9IGZsYXNoVHlwZXNbdHlwZV1cbiAgICBtYXJrZXJPcHRpb25zID0ge2ludmFsaWRhdGU6ICd0b3VjaCd9XG5cbiAgICBzd2l0Y2ggcmFuZ2VUeXBlXG4gICAgICB3aGVuICdidWZmZXInXG4gICAgICAgIG1hcmtlcnMgPSAoQGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIG1hcmtlck9wdGlvbnMpIGZvciByYW5nZSBpbiByYW5nZXMpXG4gICAgICB3aGVuICdzY3JlZW4nXG4gICAgICAgIG1hcmtlcnMgPSAoQGVkaXRvci5tYXJrU2NyZWVuUmFuZ2UocmFuZ2UsIG1hcmtlck9wdGlvbnMpIGZvciByYW5nZSBpbiByYW5nZXMpXG5cbiAgICB1bmxlc3MgYWxsb3dNdWx0aXBsZVxuICAgICAgaWYgQG1hcmtlcnNCeVR5cGUuaGFzKHR5cGUpXG4gICAgICAgIG1hcmtlci5kZXN0cm95KCkgZm9yIG1hcmtlciBpbiBAbWFya2Vyc0J5VHlwZS5nZXQodHlwZSlcbiAgICAgIEBtYXJrZXJzQnlUeXBlLnNldCh0eXBlLCBtYXJrZXJzKVxuXG4gICAgZGVjb3JhdGlvbnMgPSBtYXJrZXJzLm1hcCAobWFya2VyKSA9PiBAZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwgZGVjb3JhdGlvbk9wdGlvbnMpXG5cbiAgICBpZiBAdmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdkZW1vTW9kZUlzQWN0aXZlJylcbiAgICAgIGRlY29yYXRpb25zLm1hcChhZGREZW1vU3VmZml4KVxuICAgICAgQHBvc3Rwb25lZERlc3Ryb3lNYXJrZXJzVGFza3MucHVzaCA9PlxuICAgICAgICBkZWNvcmF0aW9ucy5tYXAocmVtb3ZlRGVtb1N1ZmZpeClcbiAgICAgICAgQGRlc3Ryb3lNYXJrZXJzQWZ0ZXIobWFya2VycywgdGltZW91dClcbiAgICBlbHNlXG4gICAgICBAZGVzdHJveU1hcmtlcnNBZnRlcihtYXJrZXJzLCB0aW1lb3V0KVxuXG4gIGZsYXNoU2NyZWVuUmFuZ2U6IChhcmdzLi4uKSAtPlxuICAgIEBmbGFzaChhcmdzLmNvbmNhdCgnc2NyZWVuJykuLi4pXG4iXX0=
