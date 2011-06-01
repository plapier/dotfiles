nmap <F2> :mksession! ~/vim_session <cr> " Quick write session with F2
nmap <F3> :source ~/vim_session <cr>     " And load session with F3

" Save session to directory with .vis extensions
" map <leader>s :mksession! session.vis <cr>

" Automatically source vim sessions so I can Open them in finder
au BufRead *.vis so %
