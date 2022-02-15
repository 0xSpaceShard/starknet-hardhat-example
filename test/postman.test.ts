import { assert } from 'chai'
import { starknet} from 'hardhat'
import {
  StarknetContractFactory,
  StarknetContract,
} from 'hardhat/types'

describe.only('Postman', () => {
  let L2contractFactory: StarknetContractFactory
  let L2contract: StarknetContract
  let networkUrl: string

  let user = 1

  before(async function () {
    L2contractFactory = await starknet.getContractFactory('l1l2')
    L2contract = await L2contractFactory.deploy()

    networkUrl = 'http://127.0.0.1:8545'
  })

  it('should load the same deployed contract', async () => {
    const {
      address: deployedTo,
      l1_provider: L1Provider
    } = (await starknet.devnet.loadL1MessagingContract(networkUrl)) as any

    const {
      address: loadedFrom,
    } = (await starknet.devnet.loadL1MessagingContract(networkUrl, deployedTo)) as any


    assert.equal(L1Provider, networkUrl)
    assert.equal(deployedTo, loadedFrom)
  })

  it.skip('should work', async () => {
    // call again
    const { address } = (await starknet.devnet.loadL1MessagingContract(
      networkUrl,
    )) as any

    console.log(await L2contract.call('get_balance', { user }))

    await L2contract.invoke('increase_balance', {
      user,
      amount: 100,
    })

    console.log(await L2contract.call('get_balance', { user }))

    await L2contract.invoke('withdraw', {
      user,
      amount: 10,
      L1_CONTRACT_ADDRESS: BigInt(address), // this should be
    })

    console.log(await L2contract.call('get_balance', { user }))

    console.log(JSON.stringify(await starknet.devnet.flush()))
  })
})
