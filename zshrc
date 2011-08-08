# Path to your oh-my-zsh configuration.
export ZSH=$HOME/.oh-my-zsh

#load oh-my-zsh plugins
plugins=(git github osx)

# load our own completion functions
#fpath=(~/.oh-my-zsh/completion $fpath)

#load oh-my-zsh config file
source "$ZSH/oh-my-zsh.sh"


# completion
autoload -U compinit
compinit

# automatically enter directories without cd
setopt auto_cd

# use vim as an editor
export EDITOR=vim

# aliases
if [ -e "$HOME/.aliases" ]; then
  source "$HOME/.aliases"
fi

# vi mode
bindkey -v
bindkey "^F" vi-cmd-mode

# use incremental search
bindkey "^R" history-incremental-search-backward

# add some readline keys back
bindkey "^A" beginning-of-line
bindkey "^E" end-of-line

# handy keybindings
bindkey "^P" history-search-backward
bindkey "^Y" accept-and-hold
bindkey "^N" insert-last-word
bindkey -s "^T" "^[Isudo ^[A" # "t" for "toughguy"
bindkey '^r' history-beginning-search-backward

# expand functions in the prompt
setopt prompt_subst


# ignore duplicate history entries
setopt histignoredups

# keep more history
export HISTSIZE=1000

# look for ey config in project dirs
export EYRC=./.eyrc

# automatically pushd
setopt auto_pushd
export dirstacksize=5

# Allows me to cd into projects
cdpath=(. ~/sites/ ~/sites/thoughtbot/ ~/Dev/ ~/Downloads ~/ )

# prediction
autoload predict-on
zle -N predict-on
zle -N predict-off
bindkey '^Z'   predict-on
bindkey '^X^Z' predict-off
zstyle ':predict' verbose true

export PATH=~/bin:$PATH

if [[ -s /Users/phillapier/.rvm/scripts/rvm ]] ; then source /Users/phillapier/.rvm/scripts/rvm ; fi
