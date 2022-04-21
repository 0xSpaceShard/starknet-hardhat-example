# Basic Sample Hardhat Project - with Starknet Plugin
This project demonstrates a basic Hardhat project, but with [Starknet plugin](https://github.com/Shard-Labs/starknet-hardhat-plugin).

## Supported `starknet-hardhat-plugin` version
`package.json` is fixed to use the latest `starknet-hardhat-plugin` version this example repository is synced with.

## Troubleshooting
If you're having issues trying to use this example repo with the Starknet plugin, try using the `npm install` and/or `npm update` commands, as it may be due to version mismatch in the dependencies.

## Branches
- `master` - latest stable examples
- `plugin` - used for testing by [Starknet Hardhat Plugin](https://github.com/Shard-Labs/starknet-hardhat-plugin)

### Branch updating (for developers)
- New PRs and features should be targeted to the `plugin` branch.
- After releasing a new plugin version, `master` should ideally be reset (fast forwarded) to `plugin` (less ideally merged).
