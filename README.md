# scripts
These are workflow scripts for Github productivity.

* **chlog** - Create changelog
* **cpr** - Create Pull Request
* **rr** - Request Review
* **rrr** - Re-request Review
* **fork** - Fork and clone

# Setup
Create a new Github personal access token and give it `repo` permissions.
Paste your token into `~/.github` with:

    umask 077; cat > ~/.github

Next, clone this repository.

    git clone git@github.com:wjmelements/scripts.git

Install the dependency `jq`. On Mac you can do this with Homebrew.

    # Mac
    brew install jq
    # Debian/Ubuntu
    sudo apt-get update
    sudo apt-get install jq

Finally, add `/path/to/scripts/bin` to your `$PATH`.

    echo 'PATH=$PATH:~/scripts/bin' >> ~/.bashrc
    source ~/.bashrc

# Manual
## chlog

    chlog <startref>

`chlog` creates a markdown changelog from the specified git ref to HEAD.

## cpr

    cpr [-a] [-b base_branch] [-t template]

`cpr` creates a pull request in your preferred text editor, then opens the pull request in your preferred browser, and requests reviewers.
The reviewers are parsed from the first line of the pull request description beginning with `Reviewer`

    Reviewer @wjmelements
    Reviewers @wjmelements @mongoose700

### Set Assignees (-a)
Using this option also sets the reviewers as assignees.

### Set Base Branch (-b)
This option configures the branch your pull request will compare against.
If you do not set this, it will default to the value in `.git/info/trunk` else master but you can still configure it when setting up your pull request.
If no other options are used, you can specify target branch without `-b`.

    cpr -b release
    cpr release
    # set default pull request target to 'develop'
    echo develop > $(git rev-parse --show-toplevel)/.git/info/trunk

### Specify Template (-t)
This option configures the pull request template.
Without this option, `cpr.custom` is used if it exists, else `cpr.default` will be used.
If a template parameter is provided, the template used is `config/cpr.$template`, unless it does not exist.

    cpr -t messaging # uses config/cpr.messaging

## rr

    rrr [-f] [num...]
    rr [num] reviewer_username...

### [num], [num...]
Specifies the target pull request number(s).
Otherwise, the script will query github for pull requests matching your current branch.

    rr wjmelements
    rr 121 wjmelements
    rrr 120 123
    # forgot the pr numbers?
    rrr

### -f
Does not prompt to confirm when re-requesting review.

## fork

    fork <repository>

`fork` simultaneously clones a repo and creates a remote fork for your user.

    fork git@github.com:wjmelements/scripts.git

The `origin` remote is set to your fork and the `upstream` remote is set to the source.

# Configuration
## Text Editor
These scripts use `$EDITOR` to determine which text editor you prefer.
Set your `EDITOR` in your `~/.bashrc`, else it will default to `nano`.

    echo EDITOR=$(which vim) >> ~/.bashrc
    source ~/.bashrc

## Pull Request Templates
You can add custom pull request templates, placing them in `config`.
See the documentation [here](#specify-template--t).

## Github Enterprise or Bitbucket
To add support for alternative remote repositories, modify `bin/common/github`.

## Turn off automatic updates
These scripts update automatically in the background each time you run one of them.
To turn off automatic updates, you simply need to leave the master branch.

    cd /path/to/scripts
    # Turn off automatic updates
    git checkout -b freeze
    # You can still pull updates manually
    git pull origin master
    # Turn automatic updates back on
    git checkout master

# Contributing
New scripts are appreciated.
As a guideline, scripts should be long enough that they cannot be aliases.
To contribute, please open a pull request against master.

When developing for this repo, it is important not to develop on the master branch because `update-scripts` can create merge conflicts.

# Bugs
Please use Github Issues to report bugs for scripts in this repository.
