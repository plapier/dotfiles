(function() {
  module.exports = {
    config: {
      fontFamily: {
        description: 'Use one of the fonts available in this package. View the README for descriptions of each.',
        type: 'string',
        "default": 'System Default',
        "enum": ['Cantarell', 'Clear Sans', 'Fira Sans', 'Open Sans', 'Oxygen', 'Roboto', 'Source Sans Pro', 'Ubuntu', 'System Default']
      },
      fontWeight: {
        description: 'Not all fonts come in all weights: Canterell and Oxygen only have regular, Ubuntu and Open Sans don\'t have thin.',
        type: 'string',
        "default": 'Regular',
        "enum": ['Extra light / Thin', 'Light', 'Regular']
      },
      customBackgroundColor: {
        description: 'Choose a custom background color.',
        type: 'boolean',
        "default": false
      },
      customBackgroundColorPicker: {
        description: 'Choose your background color.',
        type: 'color',
        "default": 'white'
      },
      backgroundGradient: {
        description: 'Apply a subtle gradient to the background.',
        type: 'boolean',
        "default": false
      },
      backgroundImage: {
        description: 'Use an image as a background.',
        type: 'boolean',
        "default": false
      },
      backgroundImagePath: {
        description: 'The path to an image from your computer or the internets (e.g. hubblesite.org or unsplash.com).',
        type: 'string',
        "default": 'atom://isotope-ui/resources/images/raket.jpg'
      },
      lowContrastTooltip: {
        description: 'Make tooltips low contrast and not so colorful.',
        type: 'boolean',
        "default": false
      },
      matchEditorFont: {
        description: 'Match the font family you set for the editor.',
        type: 'boolean',
        "default": false
      },
      minimalMode: {
        description: 'Make the layout more minimal.',
        type: 'boolean',
        "default": false
      }
    },
    activate: function(state) {
      return atom.themes.onDidChangeActiveThemes(function() {
        var Config;
        Config = require('./config');
        return Config.apply();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2xhcGllci9Ecm9wYm94IChQZXJzb25hbCkvZG90ZmlsZXMvYXRvbS9wYWNrYWdlcy9pc290b3BlLXVpL2xpYi9pc290b3BlLXVpLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFVBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLDJGQUFiO0FBQUEsUUFFQSxJQUFBLEVBQU0sUUFGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLGdCQUhUO0FBQUEsUUFJQSxNQUFBLEVBQU0sQ0FDSixXQURJLEVBRUosWUFGSSxFQUdKLFdBSEksRUFJSixXQUpJLEVBS0osUUFMSSxFQU1KLFFBTkksRUFPSixpQkFQSSxFQVFKLFFBUkksRUFTSixnQkFUSSxDQUpOO09BREY7QUFBQSxNQWdCQSxVQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSxtSEFBYjtBQUFBLFFBRUEsSUFBQSxFQUFNLFFBRk47QUFBQSxRQUdBLFNBQUEsRUFBUyxTQUhUO0FBQUEsUUFJQSxNQUFBLEVBQU0sQ0FDSixvQkFESSxFQUVKLE9BRkksRUFHSixTQUhJLENBSk47T0FqQkY7QUFBQSxNQTBCQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxXQUFBLEVBQWEsbUNBQWI7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsS0FGVDtPQTNCRjtBQUFBLE1BOEJBLDJCQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSwrQkFBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLE9BRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxPQUZUO09BL0JGO0FBQUEsTUFrQ0Esa0JBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLDRDQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7T0FuQ0Y7QUFBQSxNQXNDQSxlQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSwrQkFBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BdkNGO0FBQUEsTUEwQ0EsbUJBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLGlHQUFiO0FBQUEsUUFFQSxJQUFBLEVBQU0sUUFGTjtBQUFBLFFBR0EsU0FBQSxFQUFTLDhDQUhUO09BM0NGO0FBQUEsTUErQ0Esa0JBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLGlEQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sU0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEtBRlQ7T0FoREY7QUFBQSxNQW1EQSxlQUFBLEVBQ0U7QUFBQSxRQUFBLFdBQUEsRUFBYSwrQ0FBYjtBQUFBLFFBQ0EsSUFBQSxFQUFNLFNBRE47QUFBQSxRQUVBLFNBQUEsRUFBUyxLQUZUO09BcERGO0FBQUEsTUF1REEsV0FBQSxFQUNFO0FBQUEsUUFBQSxXQUFBLEVBQWEsK0JBQWI7QUFBQSxRQUNBLElBQUEsRUFBTSxTQUROO0FBQUEsUUFFQSxTQUFBLEVBQVMsS0FGVDtPQXhERjtLQURGO0FBQUEsSUE4REEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBRVIsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBWixDQUFvQyxTQUFBLEdBQUE7QUFDbEMsWUFBQSxNQUFBO0FBQUEsUUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBO2VBQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBQSxFQUZrQztNQUFBLENBQXBDLEVBRlE7SUFBQSxDQTlEVjtHQUZGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/lapier/Dropbox%20(Personal)/dotfiles/atom/packages/isotope-ui/lib/isotope-ui.coffee
