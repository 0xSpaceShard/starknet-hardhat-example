import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { assert } from 'chai';
import { Contract, ContractFactory } from 'ethers';
import { starknet, network, ethers } from 'hardhat';
import {
  StarknetContractFactory,
  StarknetContract,
  HttpNetworkConfig,
} from 'hardhat/types';

describe.only('Postman', () => {
  let L2contractFactory: StarknetContractFactory;
  let L2contract: StarknetContract;
  let networkUrl: string;
  let L1L2Example: ContractFactory;
  let MockStarknetMessaging: ContractFactory;
  let mockStarknetMessaging: Contract;
  let l1l2Example: Contract;
  let user = 1;
  let signer: SignerWithAddress;

  before(async function () {
    L2contractFactory = await starknet.getContractFactory('l1l2');
    L2contract = await L2contractFactory.deploy();

    const signers = await ethers.getSigners();
    signer = signers[0];

    MockStarknetMessaging = await ethers.getContractFactory(
      'MockStarknetMessaging',
      signer,
    );
    mockStarknetMessaging = await MockStarknetMessaging.deploy();
    await mockStarknetMessaging.deployed();

    L1L2Example = await ethers.getContractFactory('L1L2Example', signer);
    l1l2Example = await L1L2Example.deploy(mockStarknetMessaging.address);
    await l1l2Example.deployed();

    networkUrl = (network.config as HttpNetworkConfig).url;
  });

  it('should deploy the messaging contract', async () => {
    const {
      address: deployedTo,
      l1_provider: L1Provider,
    } = (await starknet.devnet.loadL1MessagingContract(networkUrl)) as any;

    assert.exists(deployedTo);
    assert.equal(L1Provider, networkUrl);
  });

  it('should load the already deployed contract if address is provided', async () => {
    const {
      address: loadedFrom,
    } = (await starknet.devnet.loadL1MessagingContract(
      networkUrl,
      mockStarknetMessaging.address,
    )) as any;

    assert.equal(mockStarknetMessaging.address, loadedFrom);
  });

  it('should exchange messages between L1 and L2', async () => {
    // Load mock messaging contract
    await starknet.devnet.loadL1MessagingContract(
      networkUrl,
      mockStarknetMessaging.address,
    );

    await L2contract.invoke('increase_balance', {
      user,
      amount: 100,
    });
    await L2contract.invoke('withdraw', {
      user,
      amount: 10,
      L1_CONTRACT_ADDRESS: BigInt(l1l2Example.address),
    });
    let l2getBalanceResponse = await L2contract.call('get_balance', {
      user,
    });

    assert.equal(l2getBalanceResponse.balance, 0n);

    await starknet.devnet.flush();

    let userBalance = await l1l2Example.userBalances(user);

    assert.equal(userBalance, 0n);

    await l1l2Example.withdraw(L2contract.address, user, 10);
    userBalance = await l1l2Example.userBalances(user);

    assert.equal(userBalance, 10n);

    await l1l2Example.deposit(L2contract.address, user, 5);

    userBalance = await l1l2Example.userBalances(user);

    assert.equal(userBalance, 5n);

    l2getBalanceResponse = await L2contract.call('get_balance', {
      user,
    });

    assert.equal(l2getBalanceResponse.balance, 90n);

    l2getBalanceResponse = await L2contract.call('get_balance', {
      user,
    });

    assert.equal(l2getBalanceResponse.balance, 95n);
  });
});
