# Basic Sample Hardhat Project - with Starknet Plugin

This project demonstrates a basic Hardhat project, but with [Starknet plugin](https://github.com/0xSpaceShard/starknet-hardhat-plugin).

## Get started

#### Clone this repo

```
git clone git@github.com:0xSpaceShard/starknet-hardhat-example.git
cd starknet-hardhat-example
```

#### Install dependencies

```
npm ci
```

#### Compile a contract

```
npx hardhat starknet-compile contracts/contract.cairo
```

### Set up environment variables

Some scripts require environment variables (search for usage of `ensureEnvVar` in the repo). You can define these variables in an `.env` file in the project root.

#### Run a test that interacts with the compiled contract

```
npx hardhat test test/quick-test.ts
```

## Supported `starknet-hardhat-plugin` version

`package.json` is fixed to use the latest `starknet-hardhat-plugin` version this example repository is synced with.

## Troubleshooting

If you're having issues trying to use this example repo with the Starknet plugin, try running `npm install` or `npm update`, as it may be due to version mismatch in the dependencies.

## Branches

- `master` - latest stable examples
- `plugin` - used for testing by [Starknet Hardhat Plugin](https://github.com/0xSpaceShard/starknet-hardhat-plugin)

### Branch updating (for developers)

- New PRs and features should be targeted to the `plugin` branch.
- After releasing a new plugin version, `master` should ideally be reset (fast forwarded) to `plugin` (less ideally merged).
