"""""""""""""""""""""""""""""""""
" Looks
"""""""""""""""""""""""""""""""""
syntax on                         " syntax highlighting, please
set foldmethod=syntax             " me likes the syntax folding
set foldnestmax=3                 " deepest fold level
set nofoldenable                  " don't fold by default
set ruler                         " always show the cursor position
set showmatch                     " Show matching brackets.
set mat=5                         " Bracket blinking.
set laststatus=2                  " Always show status line (not only for multiple windows)
set cursorline                    " highlight cursor line
set listchars=tab:>\ ,trail:•,extends:>,precedes:<,nbsp:+
set list                          " show trailing whiteshace and tabs
"set fuopt=maxvert,maxhorz         " Fullscreen mode takes up entire screen


set guifont=Consolas:h15
"set guifont=Anonymous\ Pro:h16
"set guifont=DejaVu\ Sans\ Mono:h16
"set guifont=Inconsolata:h16

set t_Co=256
set background=dark
":colorscheme vividchalk
":colorscheme neon
":colorscheme xoria256
":colorscheme wombat
":colorscheme zenburn
":colorscheme darkspectrum
":colorscheme customtwilight2
:colorscheme solarized

if has('gui_running')
  set guioptions-=T              " Remove toolbar and menus in gvim
  set guioptions-=m
  set guioptions-=l
  set guioptions-=r
  set mousehide                  " Hide mouse after chars typed, only gvim
endif

set number
set numberwidth=5
