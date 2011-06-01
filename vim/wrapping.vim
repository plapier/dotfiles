"""""""""""""""""""""""""""""""""
" line wrapping and movements
"""""""""""""""""""""""""""""""""
" toggle wrapping with <Leader>w (typically \w)
nnoremap <silent> <Leader>w :call ToggleWrap()<CR>

function! ToggleWrap()
  if &wrap
    echo "Wrap OFF"
    call UnwrapIt()
  else
    echo "Wrap ON"
    call WrapIt()
  endif
endfunction

function! WrapIt()
  set wrap linebreak
  set virtualedit=
  set breakat=\ ^I!@*-+;:,./?       " when wrapping, break at these characters (requires linbreak, see above)
  set showbreak=>                   " character to show that a line is wrapped
  setlocal display+=lastline
  noremap  <buffer> <silent> k gk
  noremap  <buffer> <silent> j gj
  noremap  <buffer> <silent> <Up>   gk
  noremap  <buffer> <silent> <Down> gj
  noremap  <buffer> <silent> <Home> g<Home>
  noremap  <buffer> <silent> <End>  g<End>
  inoremap <buffer> <silent> <Up>   <C-o>gk
  inoremap <buffer> <silent> <Down> <C-o>gj
  inoremap <buffer> <silent> <Home> <C-o>g<Home>
  inoremap <buffer> <silent> <End>  <C-o>g<End>
endfunction

function! UnwrapIt()
  set nowrap
  set virtualedit=all
  silent! nunmap <buffer> j
  silent! nunmap <buffer> k
  silent! nunmap <buffer> <Up>
  silent! nunmap <buffer> <Down>
  silent! nunmap <buffer> <Home>
  silent! nunmap <buffer> <End>
  silent! iunmap <buffer> <Up>
  silent! iunmap <buffer> <Down>
  silent! iunmap <buffer> <Home>
  silent! iunmap <buffer> <End>
endfunction

if &wrap
  call WrapIt()
endif

