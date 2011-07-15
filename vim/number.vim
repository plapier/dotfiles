function! ToggleRelativeNumbers()
  if &number
    echo "Relative Numbers ON"
    set relativenumber
  else
    echo "Relative Numbers OFF"
    set number
  endif
endfunction

noremap <Leader>n :call ToggleRelativeNumbers()<Enter>
