ScssSortView = require './scss-sort-view'
{CompositeDisposable} = require 'atom'

module.exports = ScssSort =
  scssSortView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    atom.commands.add 'atom-workspace', "scss-sort:sort-selection", => @sort_selection()
    atom.commands.add 'atom-workspace', "scss-sort:sort-rule-set", => @sort_rule_set()
    atom.commands.add 'atom-workspace', "scss-sort:sort-nested-rule-set", => @sort_nested_rule_set()

  sort_selection: ->
    editor = atom.workspace.getActivePaneItem()
    selection = editor.getLastSelection()
    textArray = selection.getText().split('\n').filter (e) -> e ## Split by newLines then filter empty lines
    sortedText = textArray.sort (a, b) ->
      newA = a.replace(/@include /i, '').replace(/-webkit-/i, '').replace(/-moz-/i, '')
      newB = b.replace(/@include /i, '').replace(/-webkit-/i, '').replace(/-moz-/i, '')
      if (newA > newB) then return 1
      if (newA < newB) then return -1
      return 0
    sortedText.push("") ## Append a new line
    selection.insertText(sortedText.join('\n'))

  sort_rule_set: ->
    console.log "Sort rule set"
    editor = atom.workspace.getActivePaneItem()
    marker = editor.getScreenRow()
    console.log marker

  sort_nested_rule_set: ->
    console.log "Sort nested rule set"

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @scssSortView.destroy()

  serialize: ->
    scssSortViewState: @scssSortView.serialize()

  toggle: ->
    console.log 'ScssSort was toggled!'

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()
