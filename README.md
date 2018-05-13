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

Finally, add `/path/to/scripts/bin` to your `$PATH`

    echo 'PATH=$PATH:~/scripts/bin' >> ~/.bashrc

# Configuration
## Github Enterprise or Bitbucket
To add support alternatives, modify `bin/common

# Contributing
New scripts are appreciated.
As a guideline, scripts should be long enough that they cannot be aliases.
To contribute, please open a pull request against master.

# Bugs
Please use Github Issues to report bugs for scripts in this repository.
