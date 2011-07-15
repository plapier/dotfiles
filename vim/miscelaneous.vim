" faster viewport scrolling
nnoremap <C-e> 3<C-e>
nnoremap <C-y> 3<C-y>

" open ~/.vimrc
map ,; :tabe ~/.vimrc<CR><C-W>_
map ,. :tabe ~/.vim/miscelaneous.vim<CR><C-W>_

" open NERDTree
map ;; :NERDTree ~/Sites/<CR>

autocmd FileType python set omnifunc=pythoncomplete#Complete
autocmd FileType javascript set omnifunc=javascriptcomplete#CompleteJS
autocmd FileType html set omnifunc=htmlcomplete#CompleteTags
autocmd FileType css set omnifunc=csscomplete#CompleteCSS
autocmd FileType scss set omnifunc=csscomplete#CompleteCSS
autocmd FileType xml set omnifunc=xmlcomplete#CompleteTags
autocmd FileType c set omnifunc=ccomplete#Complete
autocmd FileType ruby,eruby set omnifunc=rubycomplete#Complete

au BufRead,BufNewFile *.css set ft=css syntax=css              " Set CSS filetype and sntax to CSS
au BufRead,BufNewFile *.less set ft=scss syntax=scss           " Set LESS filetype and syntax to SCSS
au BufRead,BufNewFile *.scss set ft=scss.css syntax=scss       " Set SCSS filetype and syntax to SCSS
au BufRead,BufNewFile *.jst set ft=jst syntax=jst              " Set JST filetype and sntax to JST

" SnippetMate requirement
set nopaste

" Disable middle button paste
map <MiddleMouse> <Nop>
imap <MiddleMouse> <Nop>

" Set ruby syntax for Gemfile
autocmd BufNewFile,BufRead Gemfile setlocal filetype=ruby


let g:rubycomplete_buffer_loading = 1
let g:rubycomplete_klasses_in_global = 1
let g:rubycomplete_rails = 1
"clojure.vim
let clj_highlight_builtins = 1

let mapleader = " "

" Unset highlighting
nnoremap <Leader>h :nohls<CR><C-L>
""
nmap <silent> <F5> :let _s=@/<Bar>:%s/\s\+$//e<Bar>:let @/=_s<Bar>:nohl<CR>

set tabstop=2 shiftwidth=2 expandtab " Set two space tabs:

set splitbelow                    " Split windows at bottom
set splitright                    " VSplit windows to the right
set ttimeoutlen=50                " Speed up <esc>

" toggle past and nopaste
set pastetoggle=<F7>

" set cursorcolumn when editing HAML and others
autocmd BufEnter *.html setlocal cursorcolumn
autocmd BufEnter *.html.erb setlocal cursorcolumn
autocmd BufEnter *.haml setlocal cursorcolumn
autocmd BufEnter *.scss setlocal cursorcolumn
autocmd BufEnter *.less setlocal cursorcolumn
autocmd BufEnter *.js setlocal cursorcolumn
autocmd BufEnter *.jst setlocal cursorcolumn

" go back to normal mode with jk or kj
imap jk <Esc>
imap kj <Esc>
imap jj <Esc>
imap kk <Esc>

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

map <Leader>g :CommandT<CR>
" Opens an edit command with the path of the currently edited file filled in
map <Leader>e :e <C-R>=expand("%:p:h") . "/" <CR>
map <Leader>s :split <C-R>=expand("%:p:h") . "/" <CR>
map <Leader>v :vsplit <C-R>=expand("%:p:h") . "/" <CR>
map <Leader>t :tabnew <C-R>=expand("%:p:h") . "/" <CR>
map <Leader>N :NERDTree <C-R>=expand("%:p:h") . "/" <CR>
autocmd User Rails Rnavcommand step features/step_definitions -glob=**/* -suffix=_steps.rb

" Ctrl-j/k deletes blank line below/above, and Alt-j/k inserts.
nnoremap <silent><C-j> m`:silent +g/\m^\s*$/d<CR>``:noh<CR>
nnoremap <silent><C-k> m`:silent -g/\m^\s*$/d<CR>``:noh<CR>
nnoremap <silent><A-j> :set paste<CR>m`o<Esc>``:set nopaste<CR>
nnoremap <silent><A-k> :set paste<CR>m`O<Esc>``:set nopaste<CR>

vmap <Leader>1 :!sort<CR>
