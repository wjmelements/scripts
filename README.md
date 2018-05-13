# scripts
These are workflow scripts for Github productivity.

* *cpr* - Create Pull Request
* *rr* - Request review
* *rrr* - Re-request review

# Setup
Create a new Github personal access token and give it `repo` permissions.
Paste your token into `~/.github` with:

    umask 077; cat > ~/.github

Next, clone this repository.

    git clone git@github.com:wjmelements/scripts.git

Install the dependency `jq`. On Mac you can do this with Homebrew.

    brew install jq

Finally, add `/path/to/scripts/bin` to your `$PATH`.

    echo 'PATH=$PATH:~/scripts/bin' >> ~/.bashrc
    source ~/.bashrc

# Manual
## cpr

    cpr [-a] [-b base_branch] [-t template]

### -a
This option takes no parameter and sets pull request assignees in addition to reviewers.

### -b
This option configures the branch your pull request will compare against.
If you do not set this, it will default to master but you can still configure it when setting up your pull request.

### -t
This option configures the pull request template.
Without this option, `cpr.custom` is used if it exists, else `cpr.default` will be used.
If a template parameter is provided, the template used is `config/cpr.$template`, unless it does not exist.

## rr

    rrr [-f] [num...]
    rr [num] reviewer_username...

### -f
Does not prompt to confirm when re-requesting review.

### [num], [num...]
Specifies the target pull request number(s).
Otherwise, the script will query github for pull requests matching your current branch.

# Configuration
## Text Editor
These scripts use `$EDITOR` to determine which text editor you prefer.
Set your `EDITOR` in your `~/.bashrc`, else it will default to `nano`.

    echo EDITOR=$(which vim) >> ~/.bashrc
    source ~/.bashrc

## Pull Request Templates
You can add custom pull request templates by adding to `config`, and 


## Github Enterprise or Bitbucket
To add support alternative remote repositories, modify `bin/common/github`.

# Contributing
New scripts are appreciated.
As a guideline, scripts should be long enough that they cannot be aliases.
To contribute, please open a pull request against master.

# Bugs
Please use Github Issues to report bugs for scripts in this repository.
