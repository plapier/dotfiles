# This loads rvm at start of $PATH
# [[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm"
# This loads nvm at start of $PATH
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

export PATH="$PATH:/Users/$USER/.bin"
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init - zsh)"

### Added by the Heroku Toolbelt
export PATH="$PATH:/usr/local/heroku/bin"

export PATH="$PATH:/Applications/Postgres.app/Contents/Versions/9.3/bin"

