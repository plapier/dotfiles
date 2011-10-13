"""""""""""""""""""""""""""""""""
" Mappings
"""""""""""""""""""""""""""""""""
" Set Leader to <spacebar>
let mapleader = " "

" open ~/.vimrc
map ,; :tabe ~/.vimrc<CR><C-W>_
map ,. :tabe ~/.vim/miscelaneous.vim<CR><C-W>_
map ,/ :tabe ~/.vim/vundle.vim<CR><C-W>_

" Go back to normal mode with jk OR kj OR jj OR kk
imap jk <Esc>
imap kj <Esc>
imap jj <Esc>
imap kk <Esc>
map <Leader>g :CommandT<CR>

" Opens an edit command with the path of the currently edited file filled in
map <Leader>e :e <C-R>=expand("%:p:h") . "/" <CR>
map <Leader>s :split <C-R>=expand("%:p:h") . "/" <CR>
map <Leader>v :vsplit <C-R>=expand("%:p:h") . "/" <CR>
map <Leader>t :tabnew <C-R>=expand("%:p:h") . "/" <CR>
map <Leader>N :NERDTree <C-R>=expand("%:p:h") . "/" <CR>
autocmd User Rails Rnavcommand step features/step_definitions -glob=**/* -suffix=_steps.rb

" Unset highlighting
nnoremap <Leader>h :nohls<CR><C-L>
nmap <silent> <F5> :let _s=@/<Bar>:%s/\s\+$//e<Bar>:let @/=_s<Bar>:nohl<CR>

" Ctrl-j/k deletes blank line below/above, and Alt-j/k inserts.
nnoremap <silent><C-j> m`:silent +g/\m^\s*$/d<CR>``:noh<CR>
nnoremap <silent><C-k> m`:silent -g/\m^\s*$/d<CR>``:noh<CR>
nnoremap <silent><A-j> :set paste<CR>m`o<Esc>``:set nopaste<CR>
nnoremap <silent><A-k> :set paste<CR>m`O<Esc>``:set nopaste<CR>

" CSS Sorting
vmap <Leader>1 :!sort<CR>
map <Leader>2 !sortcss<CR>
map <Leader>3 viB !sortcss<CR>
map <Leader>4 ?{<CR>jV}k!sortcss<CR>:noh<CR>

" SessionMan Vim
nmap <Leader>S :SessionSave<CR>
nmap <Leader>A :SessionSaveAs<CR>
nmap <Leader>O :SessionOpen

" NERD Commenter
map <Leader>\\ ,cc<CR>
map <Leader>]]  ,cs<CR>
map <Leader>[[ ,cu<CR>

" Disable middle button paste
map <MiddleMouse> <Nop>
imap <MiddleMouse> <Nop>

" Get off my lawn
nnoremap <Left> :echoe "Use h"<CR>
nnoremap <Right> :echoe "Use l"<CR>
nnoremap <Up> :echoe "Use k"<CR>
nnoremap <Down> :echoe "Use j"<CR>
