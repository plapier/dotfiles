"""""""""""""""""""""""""""""""""
" Basics
"""""""""""""""""""""""""""""""""
set nocompatible                  " We're on vim, not vi
filetype plugin indent on         " indent files, ftplugins
filetype plugin on
runtime macros/matchit.vim        " Enable matchit
set autochdir                     " Set working directory to current buffer
set wildmode=list:longest         " bash like command line tab completion
set wildignore=*.o,*.obj,*~,*.swp " ignore when tab completing:
set backspace=indent,eol,start    " Intuitive backspacing in insert mode
set shortmess=atI
set visualbell                    " get rid of the BEEP
set scrolloff=3                   " Provide three lines of context
set autowrite                     " Automatically save before commands like :next
set showcmd                       " display incomplete commands
call pathogen#helptags()
call pathogen#runtime_append_all_bundles()


source $HOME/.vim/miscelaneous.vim
source $HOME/.vim/wrapping.vim
source $HOME/.vim/copypaste.vim
source $HOME/.vim/backups.vim
source $HOME/.vim/looks.vim       " Vim Appearance
source $HOME/.vim/searching.vim
source $HOME/.vim/abbreviations.vim
source $HOME/.vim/githelpers.vim
source $HOME/.vim/autocomplete.vim
source $HOME/.vim/session.vim     " Saving & Resuming sessions
source $HOME/.vim/privates.vim
source $HOME/.vim/buffers.vim
source $HOME/.vim/tabularizing.vim
source $HOME/.vim/ruby-blocks.vim


map <Leader>bs ^wwv$hhyO@include box-shadow(ppp);jk
map <Leader>lg f(f(yi(kO@include linear-gradient(pppjkjj^f(f(f(f(yi(kkA, ppp);jk
map <Leader>lgh f(f(yi(kkjO@include linear-gradient(pppjkjj^f(f(f(yi(kkA, ppp);jk
map <Leader>br ^wwveyO@include border-radius(ppp);jk

map <Leader>2 !sortcss<CR>
map <Leader>3 viB !sortcss<CR>
map <Leader>4 ?{<CR>jV}k!sortcss<CR>:noh<CR>
"map <Leader>5 /{<CR>Ojk?{<CR>jV}k:!sortcss<CR>
"map <Leader>6 /{<CR>a<CR>[/}<CR>i<CR>jk

" Comment Out SassScript with Leader /
map <Leader>// :s/^/\/\//g<CR>:noh<CR>
map <Leader>.. :s/^\/\///<CR>:noh<CR>
