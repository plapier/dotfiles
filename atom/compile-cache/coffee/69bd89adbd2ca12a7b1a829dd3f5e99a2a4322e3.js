(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  describe("dirty work for fast package activation", function() {
    var ensureRequiredFiles, withCleanActivation;
    withCleanActivation = null;
    ensureRequiredFiles = null;
    beforeEach(function() {
      return runs(function() {
        var cleanRequireCache, getRequiredLibOrNodeModulePaths, packPath;
        packPath = atom.packages.loadPackage('vim-mode-plus').path;
        getRequiredLibOrNodeModulePaths = function() {
          return Object.keys(require.cache).filter(function(p) {
            return p.startsWith(packPath + 'lib') || p.startsWith(packPath + 'node_modules');
          });
        };
        cleanRequireCache = function() {
          var oldPaths, savedCache;
          savedCache = {};
          oldPaths = getRequiredLibOrNodeModulePaths();
          oldPaths.forEach(function(p) {
            savedCache[p] = require.cache[p];
            return delete require.cache[p];
          });
          return function() {
            oldPaths.forEach(function(p) {
              return require.cache[p] = savedCache[p];
            });
            return getRequiredLibOrNodeModulePaths().forEach(function(p) {
              if (indexOf.call(oldPaths, p) < 0) {
                return delete require.cache[p];
              }
            });
          };
        };
        withCleanActivation = function(fn) {
          var restoreRequireCache;
          restoreRequireCache = null;
          runs(function() {
            return restoreRequireCache = cleanRequireCache();
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('vim-mode-plus').then(fn);
          });
          return runs(function() {
            return restoreRequireCache();
          });
        };
        return ensureRequiredFiles = function(files) {
          var should;
          should = files.map(function(file) {
            return packPath + file;
          });
          return expect(getRequiredLibOrNodeModulePaths()).toEqual(should);
        };
      });
    });
    describe("requrie as minimum num of file as possible on startup", function() {
      var shouldRequireFilesInOrdered;
      shouldRequireFilesInOrdered = ["lib/main.coffee", "lib/base.coffee", "node_modules/delegato/lib/delegator.js", "node_modules/mixto/lib/mixin.js", "lib/settings.coffee", "lib/global-state.coffee", "lib/vim-state.coffee", "lib/mode-manager.coffee", "lib/command-table.coffee"];
      if (atom.inDevMode()) {
        shouldRequireFilesInOrdered.push('lib/developer.coffee');
      }
      it("THIS IS WORKAROUND FOR Travis-CI's", function() {
        return withCleanActivation(function() {
          return null;
        });
      });
      it("require minimum set of files", function() {
        return withCleanActivation(function() {
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
      it("[one editor opened] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open();
          });
          return runs(function() {
            var files;
            files = shouldRequireFilesInOrdered.concat('lib/status-bar-manager.coffee');
            return ensureRequiredFiles(files);
          });
        });
      });
      return it("[after motion executed] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open().then(function(e) {
              return atom.commands.dispatch(e.element, 'vim-mode-plus:move-right');
            });
          });
          return runs(function() {
            var extraShouldRequireFilesInOrdered, files;
            extraShouldRequireFilesInOrdered = ["lib/status-bar-manager.coffee", "lib/operation-stack.coffee", "lib/selection-wrapper.coffee", "lib/utils.coffee", "node_modules/underscore-plus/lib/underscore-plus.js", "node_modules/underscore/underscore.js", "lib/blockwise-selection.coffee", "lib/motion.coffee", "lib/cursor-style-manager.coffee"];
            files = shouldRequireFilesInOrdered.concat(extraShouldRequireFilesInOrdered);
            return ensureRequiredFiles(files);
          });
        });
      });
    });
    return describe("command-table", function() {
      describe("initial classRegistry", function() {
        return it("contains one entry and it's Base class", function() {
          return withCleanActivation(function(pack) {
            var Base, classRegistry, keys;
            Base = pack.mainModule.provideVimModePlus().Base;
            classRegistry = Base.getClassRegistry();
            keys = Object.keys(classRegistry);
            expect(keys).toHaveLength(1);
            expect(keys[0]).toBe("Base");
            return expect(classRegistry[keys[0]]).toBe(Base);
          });
        });
      });
      describe("fully populated classRegistry", function() {
        return it("generateCommandTableByEagerLoad populate all registry eagerly", function() {
          return withCleanActivation(function(pack) {
            var Base, newRegistriesLength, oldRegistries, oldRegistriesLength;
            Base = pack.mainModule.provideVimModePlus().Base;
            oldRegistries = Base.getClassRegistry();
            oldRegistriesLength = Object.keys(oldRegistries).length;
            expect(Object.keys(oldRegistries)).toHaveLength(1);
            Base.generateCommandTableByEagerLoad();
            newRegistriesLength = Object.keys(Base.getClassRegistry()).length;
            return expect(newRegistriesLength).toBeGreaterThan(oldRegistriesLength);
          });
        });
      });
      return describe("make sure cmd-table is NOT out-of-date", function() {
        return it("generateCommandTableByEagerLoad return table which is equals to initially loaded command table", function() {
          return withCleanActivation(function(pack) {
            var Base, loadedCommandTable, newCommandTable, oldCommandTable, ref;
            Base = pack.mainModule.provideVimModePlus().Base;
            ref = [], oldCommandTable = ref[0], newCommandTable = ref[1];
            oldCommandTable = Base.commandTable;
            newCommandTable = Base.generateCommandTableByEagerLoad();
            loadedCommandTable = require('../lib/command-table');
            expect(oldCommandTable).not.toBe(newCommandTable);
            expect(loadedCommandTable).toEqual(oldCommandTable);
            return expect(loadedCommandTable).toEqual(newCommandTable);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2xhcGllci8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvZmFzdC1hY3RpdmF0aW9uLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCQTtBQUFBLE1BQUE7O0VBQUEsUUFBQSxDQUFTLHdDQUFULEVBQW1ELFNBQUE7QUFDakQsUUFBQTtJQUFBLG1CQUFBLEdBQXNCO0lBQ3RCLG1CQUFBLEdBQXNCO0lBRXRCLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsSUFBQSxDQUFLLFNBQUE7QUFDSCxZQUFBO1FBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixlQUExQixDQUEwQyxDQUFDO1FBRXRELCtCQUFBLEdBQWtDLFNBQUE7aUJBQ2hDLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLEtBQXBCLENBQTBCLENBQUMsTUFBM0IsQ0FBa0MsU0FBQyxDQUFEO21CQUNoQyxDQUFDLENBQUMsVUFBRixDQUFhLFFBQUEsR0FBVyxLQUF4QixDQUFBLElBQWtDLENBQUMsQ0FBQyxVQUFGLENBQWEsUUFBQSxHQUFXLGNBQXhCO1VBREYsQ0FBbEM7UUFEZ0M7UUFLbEMsaUJBQUEsR0FBb0IsU0FBQTtBQUNsQixjQUFBO1VBQUEsVUFBQSxHQUFhO1VBQ2IsUUFBQSxHQUFXLCtCQUFBLENBQUE7VUFDWCxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFDLENBQUQ7WUFDZixVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQWdCLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQTttQkFDOUIsT0FBTyxPQUFPLENBQUMsS0FBTSxDQUFBLENBQUE7VUFGTixDQUFqQjtBQUlBLGlCQUFPLFNBQUE7WUFDTCxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFDLENBQUQ7cUJBQ2YsT0FBTyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWQsR0FBbUIsVUFBVyxDQUFBLENBQUE7WUFEZixDQUFq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QUFDLCtCQUFMLENBQUE7WUFDQSxtQkFBQSxHQUFzQixNQUFNLENBQUMsSUFBUCxDQUFZLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQVosQ0FBb0MsQ0FBQzttQkFDM0QsTUFBQSxDQUFPLG1CQUFQLENBQTJCLENBQUMsZUFBNUIsQ0FBNEMsbUJBQTVDO1VBUmtCLENBQXBCO1FBRGtFLENBQXBFO01BRHdDLENBQTFDO2FBWUEsUUFBQSxDQUFTLHdDQUFULEVBQW1ELFNBQUE7ZUFDakQsRUFBQSxDQUFHLGdHQUFILEVBQXFHLFNBQUE7aUJBQ25HLG1CQUFBLENBQW9CLFNBQUMsSUFBRDtBQUNsQixnQkFBQTtZQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFoQixDQUFBLENBQW9DLENBQUM7WUFDNUMsTUFBcUMsRUFBckMsRUFBQyx3QkFBRCxFQUFrQjtZQUVsQixlQUFBLEdBQWtCLElBQUksQ0FBQztZQUN2QixlQUFBLEdBQWtCLElBQUksQ0FBQywrQkFBTCxDQUFBO1lBQ2xCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxzQkFBUjtZQUVyQixNQUFBLENBQU8sZUFBUCxDQUF1QixDQUFDLEdBQUcsQ0FBQyxJQUE1QixDQUFpQyxlQUFqQztZQUNBLE1BQUEsQ0FBTyxrQkFBUCxDQUEwQixDQUFDLE9BQTNCLENBQW1DLGVBQW5DO21CQUNBLE1BQUEsQ0FBTyxrQkFBUCxDQUEwQixDQUFDLE9BQTNCLENBQW1DLGVBQW5DO1VBVmtCLENBQXBCO1FBRG1HLENBQXJHO01BRGlELENBQW5EO0lBN0J3QixDQUExQjtFQWxHaUQsQ0FBbkQ7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIiMgW0RBTkdFUl1cbiMgV2hhdCBJJ20gZG9pbmcgaW4gdGhpcyB0ZXN0LXNwZWMgaXMgU1VQRVIgaGFja3ksIGFuZCBJIGRvbid0IGxpa2UgdGhpcy5cbiNcbiMgLSBXaGF0IEknbSBkb2luZyBhbmQgd2h5XG4jICAtIEludmFsaWRhdGUgcmVxdWlyZS5jYWNoZSB0byBcIm9ic2VydmUgcmVxdWlyZWQgZmlsZSBvbiBzdGFydHVwXCIuXG4jICAtIFRoZW4gcmVzdG9yZSByZXF1aXJlLmNhY2hlIHRvIG9yaWdpbmFsIHN0YXRlLlxuI1xuIyAtIEp1c3QgaW52YWxpZGF0aW5nIGlzIG5vdCBlbm91Z2ggdW5sZXNzIHJlc3RvcmVpbmcgb3RoZXIgc3BlYyBmaWxlIGZhaWwuXG4jXG4jIC0gV2hhdCBoYXBwZW5zIGp1c3QgaW52YWxpZGF0ZSByZXF1aXJlLmNhY2hlIGFuZCBOT1QgcmVzdG9yZWQgdG8gb3JpZ2luYWwgcmVxdWlyZS5jYWNoZT9cbiMgIC0gRm9yIG1vZHVsZSBzdWNoIGxpa2UgYGdsb2JsYWwtc3RhdGUuY29mZmVlYCBpdCBpbnN0YW50aWF0ZWQgYXQgcmVxdWlyZWQgdGltZS5cbiMgIC0gSW52YWxpZGF0aW5nIHJlcXVpcmUuY2FjaGUgZm9yIGBnbG9iYWwtc3RhdGUuY29mZmVlYCBtZWFucywgaXQncyByZWxvYWRlZCBhZ2Fpbi5cbiMgIC0gVGhpcyAybmQgcmVsb2FkIHJldHVybiBESUZGRVJFTlQgZ2xvYmFsU3RhdGUgaW5zdGFuY2UuXG4jICAtIFNvIGdsb2JhbFN0YXRlIGlzIG5vdyBubyBsb25nZXIgZ2xvYmFsbHkgcmVmZXJlbmNpbmcgc2FtZSBzYW1lIG9iamVjdCwgaXQncyBicm9rZW4uXG4jICAtIFRoaXMgc2l0dWF0aW9uIGlzIGNhdXNlZCBieSBleHBsaWNpdCBjYWNoZSBpbnZhbGlkYXRpb24gYW5kIG5vdCBoYXBwZW4gaW4gcmVhbCB1c2FnZS5cbiNcbiMgLSBJIGtub3cgdGhpcyBzcGVjIGlzIHN0aWxsIHN1cGVyIGhhY2t5IGFuZCBJIHdhbnQgdG8gZmluZCBzYWZlciB3YXkuXG4jICAtIEJ1dCBJIG5lZWQgdGhpcyBzcGVjIHRvIGRldGVjdCB1bndhbnRlZCBmaWxlIGlzIHJlcXVpcmVkIGF0IHN0YXJ0dXAoIHZtcCBnZXQgc2xvd2VyIHN0YXJ0dXAgKS5cbmRlc2NyaWJlIFwiZGlydHkgd29yayBmb3IgZmFzdCBwYWNrYWdlIGFjdGl2YXRpb25cIiwgLT5cbiAgd2l0aENsZWFuQWN0aXZhdGlvbiA9IG51bGxcbiAgZW5zdXJlUmVxdWlyZWRGaWxlcyA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgcnVucyAtPlxuICAgICAgcGFja1BhdGggPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykucGF0aFxuXG4gICAgICBnZXRSZXF1aXJlZExpYk9yTm9kZU1vZHVsZVBhdGhzID0gLT5cbiAgICAgICAgT2JqZWN0LmtleXMocmVxdWlyZS5jYWNoZSkuZmlsdGVyIChwKSAtPlxuICAgICAgICAgIHAuc3RhcnRzV2l0aChwYWNrUGF0aCArICdsaWInKSBvciBwLnN0YXJ0c1dpdGgocGFja1BhdGggKyAnbm9kZV9tb2R1bGVzJylcblxuICAgICAgIyBSZXR1cm4gZnVuY3Rpb24gdG8gcmVzdG9yZSBvcmlnaW5hbCByZXF1aXJlLmNhY2hlIG9mIGludGVyZXN0XG4gICAgICBjbGVhblJlcXVpcmVDYWNoZSA9IC0+XG4gICAgICAgIHNhdmVkQ2FjaGUgPSB7fVxuICAgICAgICBvbGRQYXRocyA9IGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMoKVxuICAgICAgICBvbGRQYXRocy5mb3JFYWNoIChwKSAtPlxuICAgICAgICAgIHNhdmVkQ2FjaGVbcF0gPSByZXF1aXJlLmNhY2hlW3BdXG4gICAgICAgICAgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcF1cblxuICAgICAgICByZXR1cm4gLT5cbiAgICAgICAgICBvbGRQYXRocy5mb3JFYWNoIChwKSAtPlxuICAgICAgICAgICAgcmVxdWlyZS5jYWNoZVtwXSA9IHNhdmVkQ2FjaGVbcF1cbiAgICAgICAgICBnZXRSZXF1aXJlZExpYk9yTm9kZU1vZHVsZVBhdGhzKCkuZm9yRWFjaCAocCkgLT5cbiAgICAgICAgICAgIGlmIHAgbm90IGluIG9sZFBhdGhzXG4gICAgICAgICAgICAgIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3BdXG5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gPSAoZm4pIC0+XG4gICAgICAgIHJlc3RvcmVSZXF1aXJlQ2FjaGUgPSBudWxsXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICByZXN0b3JlUmVxdWlyZUNhY2hlID0gY2xlYW5SZXF1aXJlQ2FjaGUoKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndmltLW1vZGUtcGx1cycpLnRoZW4oZm4pXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICByZXN0b3JlUmVxdWlyZUNhY2hlKClcblxuICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyA9IChmaWxlcykgLT5cbiAgICAgICAgc2hvdWxkID0gZmlsZXMubWFwKChmaWxlKSAtPiBwYWNrUGF0aCArIGZpbGUpXG4gICAgICAgIGV4cGVjdChnZXRSZXF1aXJlZExpYk9yTm9kZU1vZHVsZVBhdGhzKCkpLnRvRXF1YWwoc2hvdWxkKVxuXG4gICMgKiBUbyByZWR1Y2UgSU8gYW5kIGNvbXBpbGUtZXZhbHVhdGlvbiBvZiBqcyBmaWxlIG9uIHN0YXJ0dXBcbiAgZGVzY3JpYmUgXCJyZXF1cmllIGFzIG1pbmltdW0gbnVtIG9mIGZpbGUgYXMgcG9zc2libGUgb24gc3RhcnR1cFwiLCAtPlxuICAgIHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZCA9IFtcbiAgICAgIFwibGliL21haW4uY29mZmVlXCJcbiAgICAgIFwibGliL2Jhc2UuY29mZmVlXCJcbiAgICAgIFwibm9kZV9tb2R1bGVzL2RlbGVnYXRvL2xpYi9kZWxlZ2F0b3IuanNcIlxuICAgICAgXCJub2RlX21vZHVsZXMvbWl4dG8vbGliL21peGluLmpzXCJcbiAgICAgIFwibGliL3NldHRpbmdzLmNvZmZlZVwiXG4gICAgICBcImxpYi9nbG9iYWwtc3RhdGUuY29mZmVlXCJcbiAgICAgIFwibGliL3ZpbS1zdGF0ZS5jb2ZmZWVcIlxuICAgICAgXCJsaWIvbW9kZS1tYW5hZ2VyLmNvZmZlZVwiXG4gICAgICBcImxpYi9jb21tYW5kLXRhYmxlLmNvZmZlZVwiXG4gICAgXVxuICAgIGlmIGF0b20uaW5EZXZNb2RlKClcbiAgICAgIHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZC5wdXNoKCdsaWIvZGV2ZWxvcGVyLmNvZmZlZScpXG5cbiAgICBpdCBcIlRISVMgSVMgV09SS0FST1VORCBGT1IgVHJhdmlzLUNJJ3NcIiwgLT5cbiAgICAgICMgSEFDSzpcbiAgICAgICMgQWZ0ZXIgdmVyeSBmaXJzdCBjYWxsIG9mIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJylcbiAgICAgICMgcmVxdWlyZS5jYWNoZSBpcyBOT1QgcG9wdWxhdGVkIHlldCBvbiBUcmF2aXMtQ0kuXG4gICAgICAjIEl0IGRvZXNuJ3QgaW5jbHVkZSBsaWIvbWFpbi5jb2ZmZWUoIHRoaXMgaXMgb2RkIHN0YXRlISApLlxuICAgICAgIyBUaGlzIG9ubHkgaGFwcGVucyBpbiB2ZXJ5IGZpcnN0IGFjdGl2YXRpb24uXG4gICAgICAjIFNvIHB1dGluZyBoZXJlIHVzZWxlc3MgdGVzdCBqdXN0IGFjdGl2YXRlIHBhY2thZ2UgY2FuIGJlIHdvcmthcm91bmQuXG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIC0+XG4gICAgICAgIG51bGxcblxuICAgIGl0IFwicmVxdWlyZSBtaW5pbXVtIHNldCBvZiBmaWxlc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzKHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZClcblxuICAgIGl0IFwiW29uZSBlZGl0b3Igb3BlbmVkXSByZXF1aXJlIG1pbmltdW0gc2V0IG9mIGZpbGVzXCIsIC0+XG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZmlsZXMgPSBzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQuY29uY2F0KCdsaWIvc3RhdHVzLWJhci1tYW5hZ2VyLmNvZmZlZScpXG4gICAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhmaWxlcylcblxuICAgIGl0IFwiW2FmdGVyIG1vdGlvbiBleGVjdXRlZF0gcmVxdWlyZSBtaW5pbXVtIHNldCBvZiBmaWxlc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAoZSkgLT5cbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZS5lbGVtZW50LCAndmltLW1vZGUtcGx1czptb3ZlLXJpZ2h0JylcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4dHJhU2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkID0gW1xuICAgICAgICAgICAgXCJsaWIvc3RhdHVzLWJhci1tYW5hZ2VyLmNvZmZlZVwiXG4gICAgICAgICAgICBcImxpYi9vcGVyYXRpb24tc3RhY2suY29mZmVlXCJcbiAgICAgICAgICAgIFwibGliL3NlbGVjdGlvbi13cmFwcGVyLmNvZmZlZVwiXG4gICAgICAgICAgICBcImxpYi91dGlscy5jb2ZmZWVcIlxuICAgICAgICAgICAgXCJub2RlX21vZHVsZXMvdW5kZXJzY29yZS1wbHVzL2xpYi91bmRlcnNjb3JlLXBsdXMuanNcIlxuICAgICAgICAgICAgXCJub2RlX21vZHVsZXMvdW5kZXJzY29yZS91bmRlcnNjb3JlLmpzXCJcbiAgICAgICAgICAgIFwibGliL2Jsb2Nrd2lzZS1zZWxlY3Rpb24uY29mZmVlXCJcbiAgICAgICAgICAgIFwibGliL21vdGlvbi5jb2ZmZWVcIlxuICAgICAgICAgICAgXCJsaWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuY29mZmVlXCJcbiAgICAgICAgICBdXG4gICAgICAgICAgZmlsZXMgPSBzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQuY29uY2F0KGV4dHJhU2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkKVxuICAgICAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMoZmlsZXMpXG5cbiAgZGVzY3JpYmUgXCJjb21tYW5kLXRhYmxlXCIsIC0+XG4gICAgIyAqIExvYWRpbmcgYXRvbSBjb21tYW5kcyBmcm9tIHByZS1nZW5lcmF0ZWQgY29tbWFuZC10YWJsZS5cbiAgICAjICogV2h5P1xuICAgICMgIHZtcCBhZGRzIGFib3V0IDMwMCBjbWRzLCB3aGljaCBpcyBodWdlLCBkeW5hbWljYWxseSBjYWxjdWxhdGluZyBhbmQgcmVnaXN0ZXIgY21kc1xuICAgICMgIHRvb2sgdmVyeSBsb25nIHRpbWUuXG4gICAgIyAgU28gY2FsY2x1YXRlIG5vbi1keW5hbWljIHBhciB0aGVuIHNhdmUgdG8gY29tbWFuZC10YWJsZS5jb2ZmZSBhbmQgbG9hZCBpbiBvbiBzdGFydHVwLlxuICAgICMgIFdoZW4gY29tbWFuZCBhcmUgZXhlY3V0ZWQsIG5lY2Vzc2FyeSBjb21tYW5kIGNsYXNzIGZpbGUgaXMgbGF6eS1yZXF1aXJlZC5cbiAgICBkZXNjcmliZSBcImluaXRpYWwgY2xhc3NSZWdpc3RyeVwiLCAtPlxuICAgICAgaXQgXCJjb250YWlucyBvbmUgZW50cnkgYW5kIGl0J3MgQmFzZSBjbGFzc1wiLCAtPlxuICAgICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIChwYWNrKSAtPlxuICAgICAgICAgIEJhc2UgPSBwYWNrLm1haW5Nb2R1bGUucHJvdmlkZVZpbU1vZGVQbHVzKCkuQmFzZVxuICAgICAgICAgIGNsYXNzUmVnaXN0cnkgPSBCYXNlLmdldENsYXNzUmVnaXN0cnkoKVxuICAgICAgICAgIGtleXMgPSBPYmplY3Qua2V5cyhjbGFzc1JlZ2lzdHJ5KVxuICAgICAgICAgIGV4cGVjdChrZXlzKS50b0hhdmVMZW5ndGgoMSlcbiAgICAgICAgICBleHBlY3Qoa2V5c1swXSkudG9CZShcIkJhc2VcIilcbiAgICAgICAgICBleHBlY3QoY2xhc3NSZWdpc3RyeVtrZXlzWzBdXSkudG9CZShCYXNlKVxuXG4gICAgZGVzY3JpYmUgXCJmdWxseSBwb3B1bGF0ZWQgY2xhc3NSZWdpc3RyeVwiLCAtPlxuICAgICAgaXQgXCJnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkIHBvcHVsYXRlIGFsbCByZWdpc3RyeSBlYWdlcmx5XCIsIC0+XG4gICAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgICAgQmFzZSA9IHBhY2subWFpbk1vZHVsZS5wcm92aWRlVmltTW9kZVBsdXMoKS5CYXNlXG4gICAgICAgICAgb2xkUmVnaXN0cmllcyA9IEJhc2UuZ2V0Q2xhc3NSZWdpc3RyeSgpXG4gICAgICAgICAgb2xkUmVnaXN0cmllc0xlbmd0aCA9IE9iamVjdC5rZXlzKG9sZFJlZ2lzdHJpZXMpLmxlbmd0aFxuICAgICAgICAgIGV4cGVjdChPYmplY3Qua2V5cyhvbGRSZWdpc3RyaWVzKSkudG9IYXZlTGVuZ3RoKDEpXG5cbiAgICAgICAgICBCYXNlLmdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKVxuICAgICAgICAgIG5ld1JlZ2lzdHJpZXNMZW5ndGggPSBPYmplY3Qua2V5cyhCYXNlLmdldENsYXNzUmVnaXN0cnkoKSkubGVuZ3RoXG4gICAgICAgICAgZXhwZWN0KG5ld1JlZ2lzdHJpZXNMZW5ndGgpLnRvQmVHcmVhdGVyVGhhbihvbGRSZWdpc3RyaWVzTGVuZ3RoKVxuXG4gICAgZGVzY3JpYmUgXCJtYWtlIHN1cmUgY21kLXRhYmxlIGlzIE5PVCBvdXQtb2YtZGF0ZVwiLCAtPlxuICAgICAgaXQgXCJnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkIHJldHVybiB0YWJsZSB3aGljaCBpcyBlcXVhbHMgdG8gaW5pdGlhbGx5IGxvYWRlZCBjb21tYW5kIHRhYmxlXCIsIC0+XG4gICAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgICAgQmFzZSA9IHBhY2subWFpbk1vZHVsZS5wcm92aWRlVmltTW9kZVBsdXMoKS5CYXNlXG4gICAgICAgICAgW29sZENvbW1hbmRUYWJsZSwgbmV3Q29tbWFuZFRhYmxlXSA9IFtdXG5cbiAgICAgICAgICBvbGRDb21tYW5kVGFibGUgPSBCYXNlLmNvbW1hbmRUYWJsZVxuICAgICAgICAgIG5ld0NvbW1hbmRUYWJsZSA9IEJhc2UuZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpXG4gICAgICAgICAgbG9hZGVkQ29tbWFuZFRhYmxlID0gcmVxdWlyZSgnLi4vbGliL2NvbW1hbmQtdGFibGUnKVxuXG4gICAgICAgICAgZXhwZWN0KG9sZENvbW1hbmRUYWJsZSkubm90LnRvQmUobmV3Q29tbWFuZFRhYmxlKVxuICAgICAgICAgIGV4cGVjdChsb2FkZWRDb21tYW5kVGFibGUpLnRvRXF1YWwob2xkQ29tbWFuZFRhYmxlKVxuICAgICAgICAgIGV4cGVjdChsb2FkZWRDb21tYW5kVGFibGUpLnRvRXF1YWwobmV3Q29tbWFuZFRhYmxlKVxuIl19
