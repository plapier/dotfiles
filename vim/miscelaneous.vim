"""""""""""""""""""""""""""""""""
" Miscelaneous
"""""""""""""""""""""""""""""""""

" faster viewport scrolling
nnoremap <C-e> 3<C-e>
nnoremap <C-y> 3<C-y>

" filetypes
autocmd FileType python set omnifunc=pythoncomplete#Complete
autocmd FileType javascript set omnifunc=javascriptcomplete#CompleteJS
autocmd FileType html set omnifunc=htmlcomplete#CompleteTags
autocmd FileType css set omnifunc=csscomplete#CompleteCSS
autocmd FileType scss set omnifunc=csscomplete#CompleteCSS
autocmd FileType xml set omnifunc=xmlcomplete#CompleteTags
autocmd FileType c set omnifunc=ccomplete#Complete
autocmd FileType ruby,eruby set omnifunc=rubycomplete#Complete
autocmd FileType jst let &l:commentstring='<!--%s-->'          " Set NERD_Commenter comment type
autocmd BufNewFile,BufRead Gemfile setlocal filetype=ruby      " Set ruby syntax for Gemfile

au BufRead,BufNewFile *.css set ft=css syntax=css              " Set CSS filetype and sntax to CSS
au BufRead,BufNewFile *.less set ft=scss syntax=scss           " Set LESS filetype and syntax to SCSS
au BufRead,BufNewFile *.scss set ft=scss.css syntax=scss       " Set SCSS filetype and syntax to SCSS
au BufRead,BufNewFile *.jst set ft=jst syntax=jst              " Set JST filetype and sntax to JST


let g:snippetsEmu_key = "<S-Tab>"                              " Snippets are activated by Shift+Tab
let g:rubycomplete_buffer_loading = 1
let g:rubycomplete_klasses_in_global = 1
let g:rubycomplete_rails = 1
let g:html_indent_tags = 'li\|p'                               " Treat <li> and <p> tags like the block tags
let g:Tlist_Ctags_Cmd="ctags --exclude='*.js'"                 " Tags
let clj_highlight_builtins = 1                                 " clojure.vim


set ttimeoutlen=50                   " Speed up <esc>
set nopaste                          " SnippetMate requirement
set pastetoggle=<F7>                 " toggle past and nopaste


" set cursorcolumn when editing HAML and others
autocmd BufEnter *.html setlocal cursorcolumn
autocmd BufEnter *.html.erb setlocal cursorcolumn
autocmd BufEnter *.haml setlocal cursorcolumn
autocmd BufEnter *.scss setlocal cursorcolumn
autocmd BufEnter *.less setlocal cursorcolumn
autocmd BufEnter *.js setlocal cursorcolumn
autocmd BufEnter *.jst setlocal cursorcolumn


"""""""""""""""""""""""""""""""""
" Other
"""""""""""""""""""""""""""""""""

"define :Lorem command to dump in a paragraph of lorem ipsum
command! -nargs=0 Lorem :normal iLorem ipsum dolor sit amet, consectetur
      \ adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore
      \ magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
      \ ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
      \ irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
      \ fugiat nulla pariatur.  Excepteur sint occaecat cupidatat non
      \ proident, sunt in culpa qui officia deserunt mollit anim id est
      \ laborum


" From thoughtbot dotfiles
"""""""""""""""""""""""""""""""""
augroup vimrcEx
  au!
  " For all text files set 'textwidth' to 78 characters.
  autocmd FileType text setlocal textwidth=78

  " When editing a file, always jump to the last known cursor position.
  " Don't do it when the position is invalid or when inside an event handler
  " (happens when dropping a file on gvim).
  autocmd BufReadPost *
    \ if line("'\"") > 0 && line("'\"") <= line("$") |
    \   exe "normal g`\"" |
    \ endif
augroup END

" Use Ack instead of Grep when available
if executable("ack")
  set grepprg=ack\ -H\ --nogroup\ --nocolor
endif
