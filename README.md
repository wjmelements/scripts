# scripts
These are workflow scripts for Github productivity.

* **chlog** - Create changelog
* **cpr** - Create Pull Request
* **rr** - Request Review
* **rrr** - Re-request Review
* **fork** - Fork and clone

These are Ethereum utility scripts for TrustToken.

* **web3** - Evaluate web3
* **requestMints** - List recent RequestMint Events
* **instantMints** - List recent InstantMint Events
* **finalizeMints** - List recent Mint events
* **pendingMints** - List pending mints for tokens
* **refundPool** - Show sponsored transactions
* **registryAttributes** - Show Registry attributes for addresses
* **writeAttributeFor** - Show write attribute for a specified attribute
* **isBlacklisted** - Report whether addresses are blacklisted from TrueUSD
* **subscribers** - Show Registry subscription state for addresses or attributes

# Setup
Create a new Github personal access token and give it `repo` permissions.
Paste your token into `~/.github` with:

    umask 077; cat > ~/.github

Next, clone this repository.

    git clone git@github.com:wjmelements/scripts.git

Install [nodejs](https://nodejs.org/en/) and dependencies.

    cd scripts
    npm install

Install the dependency `jq`. On Mac you can do this with Homebrew.

    # Mac
    brew install jq
    # Debian/Ubuntu
    sudo apt-get update
    sudo apt-get install jq

Optionally, add `/path/to/scripts/bin` to your `$PATH`, which allows you to execute these scripts without providing their full path.

    echo PATH='$PATH:~/scripts/bin' >> ~/.bashrc
    source ~/.bashrc

# Manual
## chlog

    chlog [-u] [-i] [-v version] <startref>

`chlog` creates a markdown changelog from the specified git ref to HEAD.
Refs can be branches, tags, or commits.

### Version [-v]

Specifies new version number.

    chlog -v 4.8.1 6d04c80302736133b0e741aa51719d0802cd8a2f

```markdown
    ## 4.8.1 Sun Jul 22 2018

    - [#4813](https://github.com/MetaMask/metamask-extension/pull/4813): Do not inject on blueskybooking.com
```

### Update [-u,-i]

    # output updated CHANGLELOG.md
    chlog -uv 4.8.1 v4.8.0
    # write updated CHANGLELOG.md
    chlog -iuv 4.8.1 v4.8.0

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

## web3

    web3 <javascript>

`web3` runs javascript in an environment that sources [web3js](https://web3js.readthedocs.io/en/1.0/index.html).
The eval context also can reference TrueUSD and its Controller objects.

    web3 "TrueUSD.methods.totalSupply().call()"

## requestMints

    requestMints [-a] [-g] [-s start_block] [-t token]

The script lists recent RequestMint Event events in the TrueUSD Controller.
The events are copied into your pasteboard.

### -a
Instead of listing recent events, list all events.

### -g
Formats the event data for pasting into a spreadsheet.

### -s start\_block
Specify starting block

### -t token
Specify token, e.g. TrueUSD, TUSD, or 0x0000000000085d4780B73119b644AE5ecd22b376.

## finalizeMints

    finalizeMints [-a] [-g] [-s start_block] [-t token]

The script lists recent Mint events in TrueUSD.
The events are copied into your pasteboard.

### -a
Instead of listing recent events, list all events.

### -g
Formats the event data for pasting into a spreadsheet.

### -s start\_block
Specify starting block

### -t token
Specify token, e.g. TrueUSD, TUSD, or 0x0000000000085d4780B73119b644AE5ecd22b376.

## instantMints

    instantMints [-a] [-g] [-s start_block] [-t token]

The script lists recent InstantMint events in the TrueUSD Controller.
The events are copied into your pasteboard.
By default the script lists only events since the last time you ran it.

### -a
Instead of listing recent events, list all events.

### -g
Formats the event data for pasting into a spreadsheet.

### -s start\_block
Specify starting block

### -t token
Specify token, e.g. TrueUSD, TUSD, or 0x0000000000085d4780B73119b644AE5ecd22b376.

## pendingMints

    pendingMints [token...]

If specified with no tokens, all tokens are shown.
Tokens can be specified by name (TrueUSD) or by symbol (TUSD).

## refundPool

    refundPool [-a]

This script shows the current size of the refund pool for TrueUSD in transactions.

### -a
With this switch, the script shows the entire state of the `gasRefundPool` array.

## registryAttributes

    registryAttributes [-a] [address...] [attribute...]

Shows all of the known attributes set for the provided address(es) in the TrustToken Registry.

### -a
With this switch, the script shows the entire state of the Registry.
This switch also forces output into the table format.
The columns of the table are attribute name, address, value, and the transaction hash of the latest change.

### Filters
If you supply a attribute hex, an attribute name, or an ethereum address, the results will be filtered to those values.
If you supply multiple addresses, you will get the attributes for both addresses.

#### With -a
If you only specify an address filter but do not supply `-a`, the output will be in the address-row format.
If you supply `-a` with an address filter, the output will be in the table format.

## writeAttributeFor

    writeAttributeFor [query...]

Queries can be case-insensitives substrings of attributes or hexadecimal bytes32 values.

    writeAttributeFor write_can_burn_aud
    writeAttributeFor 0xced374f2f4976e82126b869174d6abf326dc28df27bd0efa486f1ba8a6577143

## isBlacklisted

    isBlacklisted [address...]

Shows whether the given address(es) are blacklisted in the TrustToken Registry.

## subscribers

    subscribers [attributeOrContract...]

Contracts and attributes can be specified by name or with hexadecimal.

    subscribers TrueUSD
    subscribers DEPOSIT_ADDRESS
    subscribers burm

# Configuration
## Text Editor
These scripts use `$EDITOR` to determine which text editor you prefer.
Set your `EDITOR` in your `~/.bashrc`, else it will default to `nano`.

    echo EDITOR=$(which vim) >> ~/.bashrc
    source ~/.bashrc

## Pull Request Templates
You can add custom pull request templates, placing them in `config`.
See the documentation [here](#specify-template--t).

## Custom Ethereum RPC
You can supply a custom URL for your Ethereum RPC provider, placing the url in `config/ethrpc`.

    # Example: Custom INFURA URL
    echo https://mainnet.infura.io/v3/c238f0a19b0d33801d6e6409932d8dbd > config/ethrpc

Otherwise, it will default to `https://infura.io`.

## Github Enterprise or Bitbucket
To add support for alternative remote repositories, modify `bin/common/github_origin`.

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
