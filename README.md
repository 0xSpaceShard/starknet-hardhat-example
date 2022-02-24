# Basic Sample Hardhat Project - with Starknet Plugin
This project demonstrates a basic Hardhat project, but with [Starknet plugin](https://github.com/Shard-Labs/starknet-hardhat-plugin).

## Supported `starknet-hardhat-plugin` version
`package.json` is fixed to use the latest `starknet-hardhat-plugin` version this example repository is synced with.

## Troubleshooting
If you're having issues trying to use this example repo with the Starknet plugin, try using the `npm install` and\or `npm update` commands, as it may be due to version mismatch in the dependencies.

## Branches
- `master` - latest stable examples
- `plugin` - used for testing by [Starknet plugin](https://github.com/Shard-Labs/starknet-hardhat-plugin)
- `devnet` - used for testing by [Starknet devnet](https://github.com/Shard-Labs/starknet-devnet)

### Branch updating (for developers)
- New PRs and features should be targeted to the `plugin` branch.
- After releasing a new plugin version, `master` should be reset to `plugin` (so no need for merging/rebasing for these two branches).
- When needed, the `devnet` branch should be updated:
  - Since Devnet testing uses the latest plugin version, rebasing `devnet` should be done onto `plugin`.
  - After rebasing, a force push of the `devnet` branch is required.
  - New commits can be added to the `devnet` branch if they introduce devnet-specific files or configurations.
