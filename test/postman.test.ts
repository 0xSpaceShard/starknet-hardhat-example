import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { assert } from 'chai';
import { BigNumber, Contract, ContractFactory } from 'ethers';
import { starknet, network, ethers } from 'hardhat';
import {
  StarknetContractFactory,
  StarknetContract,
  HttpNetworkConfig,
} from 'hardhat/types';

describe('Postman', () => {
  const user = 1;
  const networkUrl: string = (network.config as HttpNetworkConfig).url;
  let L2contractFactory: StarknetContractFactory;
  let l2contract: StarknetContract;
  let L1L2Example: ContractFactory;
  let MockStarknetMessaging: ContractFactory;
  let mockStarknetMessaging: Contract;
  let l1l2Example: Contract;
  let signer: SignerWithAddress;

  before(async function () {
    L2contractFactory = await starknet.getContractFactory('l1l2');
    l2contract = await L2contractFactory.deploy();

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
  });

  it('should deploy the messaging contract', async () => {
    const {
      address: deployedTo,
      l1_provider: L1Provider,
    } = await starknet.devnet.loadL1MessagingContract(networkUrl);

    assert.exists(deployedTo);
    assert(L1Provider === networkUrl, `L1 provider is ${L1Provider}, should be ${networkUrl}`);
  });

  it('should load the already deployed contract if the address is provided', async () => {

    const {
      address: loadedFrom,
    } = await starknet.devnet.loadL1MessagingContract(
      networkUrl,
      mockStarknetMessaging.address,
    );

    assert(mockStarknetMessaging.address === loadedFrom, `Loaded from address is ${loadedFrom}, should be ${mockStarknetMessaging.address}`);
  });

  it('should exchange messages between L1 and L2', async () => {
    // Load mock messaging contract
    await starknet.devnet.loadL1MessagingContract(
      networkUrl,
      mockStarknetMessaging.address,
    );

    await l2contract.invoke('increase_balance', {
      user,
      amount: 100,
    });
    await l2contract.invoke('withdraw', {
      user,
      amount: 10,
      L1_CONTRACT_ADDRESS: BigInt(l1l2Example.address),
    });
    let getBalanceResponse = await l2contract.call('get_balance', {
      user,
    });

    assert(getBalanceResponse.balance === 90n, `L2 balance should be 90, but got ${getBalanceResponse.balance}`);

    const {
      n_consumed_l2_to_l1_messages,
    } = await starknet.devnet.flush();

    assert(n_consumed_l2_to_l1_messages === 1, `${n_consumed_l2_to_l1_messages} messages were consumed, should be 1.`);

    let userBalanceL1: BigNumber = await l1l2Example.userBalances(user);

    assert(userBalanceL1.eq(0), `Initial L1 should be 0, but got ${userBalanceL1}`);

    await l1l2Example.withdraw(l2contract.address, user, 10);
    userBalanceL1 = await l1l2Example.userBalances(user);

    assert(userBalanceL1.eq(10), `After the withdraw of 10 L1 balance should be 10, but got ${userBalanceL1}`);

    await l1l2Example.deposit(l2contract.address, user, 2);

    userBalanceL1 = await l1l2Example.userBalances(user);

    assert(userBalanceL1.eq(8), `After the deposit of 2 L1 balance should be 8, but got ${userBalanceL1}`);

    getBalanceResponse = await l2contract.call('get_balance', {
      user,
    });

    assert(getBalanceResponse.balance === 90n, `L2 balance should stay 90 before the flush, but got ${getBalanceResponse.balance}`);

    // Flush gets called by the devnet when the L2 contract method is invoked

    getBalanceResponse = await l2contract.call('get_balance', {
      user,
    });

    assert(getBalanceResponse.balance === 92n, `L2 balance should be 92 after the flush, but got ${getBalanceResponse.balance}`);
  });
});
