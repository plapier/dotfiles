"""""""""""""""""""""""""""""""""
" Abbreviations
"""""""""""""""""""""""""""""""""
:iabbrev cfjs <% content_for :javascript do -%><CR><% javascript_tag do -%><CR>$(function() {<CR>!cursor!<CR>});<CR><% end -%><CR><% end -%><ESC>:call search('!cursor!', 'b')<cr>cf!
:iabbrev "([ "([^"]+)"
:iabbrev ([ ([^"]+)

:iabbrev endash &#8212;
:iabbrev ellips &#8230;
