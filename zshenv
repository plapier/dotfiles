# This loads rvm at start of $PATH
[[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm"
# This loads nvm at start of $PATH
[ -s "/Users/phil/.nvm/nvm.sh" ] && . "/Users/phil/.nvm/nvm.sh"

export PATH="$PATH:/Users/$USER/bin"

### Added by the Heroku Toolbelt
export PATH="$PATH:/usr/local/heroku/bin"

export PATH="$PATH:$HOME/.rvm/bin:/Applications/Postgres.app/Contents/Versions/9.3/bin"
