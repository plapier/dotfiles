(function() {
  module.exports = {
    apply: function() {
      var applyBackgroundColor, applyBackgroundGradient, applyBackgroundImage, applyEditorFont, applyFont, applyFontWeight, applyMinimalMode, applyTooltipContrast, body;
      body = document.querySelector('body');
      applyFont = function(font) {
        return body.setAttribute('data-isotope-ui-font', font);
      };
      applyFontWeight = function(weight) {
        return body.setAttribute('data-isotope-ui-fontweight', weight);
      };
      applyBackgroundColor = function() {
        if (atom.config.get('isotope-ui.customBackgroundColor')) {
          atom.config.set('isotope-ui.backgroundImage', 'false');
          atom.config.set('isotope-ui.backgroundGradient', 'false');
          body.setAttribute('data-isotope-ui-bg-color', 'true');
          return body.style.backgroundColor = atom.config.get('isotope-ui.customBackgroundColorPicker').toHexString();
        } else {
          body.setAttribute('data-isotope-ui-bg-color', 'false');
          return body.style.backgroundColor = '';
        }
      };
      applyBackgroundGradient = function() {
        if (atom.config.get('isotope-ui.backgroundGradient')) {
          atom.config.set('isotope-ui.backgroundImage', 'false');
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          return body.setAttribute('data-isotope-ui-bg-gradient', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-bg-gradient', 'false');
        }
      };
      applyBackgroundImage = function() {
        if (atom.config.get('isotope-ui.backgroundImage')) {
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          atom.config.set('isotope-ui.customBackgroundColor', 'false');
          atom.config.set('isotope-ui.backgroundGradient', 'false');
          body.setAttribute('data-isotope-ui-bg-image', 'true');
          return body.style.backgroundImage = 'url(' + atom.config.get('isotope-ui.backgroundImagePath') + ')';
        } else {
          body.setAttribute('data-isotope-ui-bg-image', 'false');
          return body.style.backgroundImage = '';
        }
      };
      applyTooltipContrast = function() {
        if (atom.config.get('isotope-ui.lowContrastTooltip')) {
          return body.setAttribute('data-isotope-ui-tooltip-lowcontrast', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-tooltip-lowcontrast', 'false');
        }
      };
      applyEditorFont = function() {
        if (atom.config.get('isotope-ui.matchEditorFont')) {
          if (atom.config.get('editor.fontFamily') === '') {
            return body.style.fontFamily = 'Inconsolata, Monaco, Consolas, "Courier New", Courier';
          } else {
            return body.style.fontFamily = atom.config.get('editor.fontFamily');
          }
        } else {
          return body.style.fontFamily = '';
        }
      };
      applyMinimalMode = function() {
        if (atom.config.get('isotope-ui.minimalMode')) {
          return body.setAttribute('data-isotope-ui-minimal', 'true');
        } else {
          return body.setAttribute('data-isotope-ui-minimal', 'false');
        }
      };
      applyFont(atom.config.get('isotope-ui.fontFamily'));
      applyFontWeight(atom.config.get('isotope-ui.fontWeight'));
      applyBackgroundGradient();
      applyBackgroundImage();
      applyBackgroundColor();
      applyTooltipContrast();
      applyEditorFont();
      applyMinimalMode();
      atom.config.onDidChange('isotope-ui.fontFamily', function() {
        return applyFont(atom.config.get('isotope-ui.fontFamily'));
      });
      atom.config.onDidChange('isotope-ui.fontWeight', function() {
        return applyFontWeight(atom.config.get('isotope-ui.fontWeight'));
      });
      atom.config.onDidChange('isotope-ui.customBackgroundColor', function() {
        return applyBackgroundColor();
      });
      atom.config.onDidChange('isotope-ui.customBackgroundColorPicker', function() {
        return applyBackgroundColor();
      });
      atom.config.onDidChange('isotope-ui.backgroundGradient', function() {
        return applyBackgroundGradient();
      });
      atom.config.onDidChange('isotope-ui.backgroundImage', function() {
        return applyBackgroundImage();
      });
      atom.config.onDidChange('isotope-ui.backgroundImagePath', function() {
        return applyBackgroundImage();
      });
      atom.config.onDidChange('isotope-ui.lowContrastTooltip', function() {
        return applyTooltipContrast();
      });
      atom.config.onDidChange('isotope-ui.matchEditorFont', function() {
        return applyEditorFont();
      });
      atom.config.onDidChange('isotope-ui.minimalMode', function() {
        return applyMinimalMode();
      });
      return atom.config.onDidChange('editor.fontFamily', function() {
        return applyEditorFont();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9pc290b3BlLXVpL2xpYi9jb25maWcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLEtBQUEsRUFBTyxTQUFBLEdBQUE7QUFFTCxVQUFBLDhKQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkIsQ0FBUCxDQUFBO0FBQUEsTUFLQSxTQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7ZUFDVixJQUFJLENBQUMsWUFBTCxDQUFrQixzQkFBbEIsRUFBMEMsSUFBMUMsRUFEVTtNQUFBLENBTFosQ0FBQTtBQUFBLE1BUUEsZUFBQSxHQUFrQixTQUFDLE1BQUQsR0FBQTtlQUNoQixJQUFJLENBQUMsWUFBTCxDQUFrQiw0QkFBbEIsRUFBZ0QsTUFBaEQsRUFEZ0I7TUFBQSxDQVJsQixDQUFBO0FBQUEsTUFXQSxvQkFBQSxHQUF1QixTQUFBLEdBQUE7QUFDckIsUUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsQ0FBSDtBQUNFLFVBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxPQUE5QyxDQUFBLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwrQkFBaEIsRUFBaUQsT0FBakQsQ0FEQSxDQUFBO0FBQUEsVUFFQSxJQUFJLENBQUMsWUFBTCxDQUFrQiwwQkFBbEIsRUFBOEMsTUFBOUMsQ0FGQSxDQUFBO2lCQUdBLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBWCxHQUE2QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0NBQWhC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

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/isotope-ui/lib/config.coffee
