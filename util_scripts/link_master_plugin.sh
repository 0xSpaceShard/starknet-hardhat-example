#!/bin/bash

set -eu

# Clone starknet-hardhat-plugin repo, install dependencies & build
git clone https://github.com/0xSpaceShard/starknet-hardhat-plugin.git
cd starknet-hardhat-plugin
npm install
npm run build
# create a symlink to plugin repo
npm link

# cd into current example repo and link the plugin repo
cd ..
npm link @shardlabs/starknet-hardhat-plugin
