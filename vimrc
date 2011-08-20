"""""""""""""""""""""""""""""""""
" Basics
"""""""""""""""""""""""""""""""""
set nocompatible                     " We're on vim, not vi
filetype plugin indent on            " indent files, ftplugins
runtime macros/matchit.vim           " Enable matchit
set wildmode=list:longest,list:full  " Tab completion options
set wildignore=*.o,*.obj,*~,*.swp    " ignore when tab completing:
set complete=.,w,t                   " Tab completion options
set backspace=indent,eol,start       " Intuitive backspacing in insert mode
set shortmess=atI
set visualbell                       " get rid of the BEEP
set scrolloff=3                      " Provide three lines of context
set autowrite                        " Automatically save before commands like :next

" Pathogen plugin
call pathogen#helptags()
call pathogen#runtime_append_all_bundles()


source $HOME/.vim/mappings.vim    " Key Mappings
source $HOME/.vim/miscelaneous.vim
source $HOME/.vim/number.vim      " Toggle Relative or Abs Line numbers
source $HOME/.vim/wrapping.vim
source $HOME/.vim/copypaste.vim
source $HOME/.vim/backups.vim
source $HOME/.vim/looks.vim       " Vim Appearance
source $HOME/.vim/searching.vim
source $HOME/.vim/abbreviations.vim
source $HOME/.vim/githelpers.vim
source $HOME/.vim/autocomplete.vim
source $HOME/.vim/autocorrect.vim " Mappings to autocorrect common misspelled words
source $HOME/.vim/session.vim     " Saving & Resuming sessions
source $HOME/.vim/privates.vim
source $HOME/.vim/buffers.vim
source $HOME/.vim/tabularizing.vim
source $HOME/.vim/ruby-blocks.vim
