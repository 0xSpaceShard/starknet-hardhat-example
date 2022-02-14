import { expect, assert } from 'chai';
import { starknet, network } from 'hardhat';
import { StarknetContract, StarknetContractFactory } from 'hardhat/types';

const ERROR_MESSAGE =
  'Request failed. Check if your network has postman endpoint';

describe.only('Postman', () => {
  it('flush should be defined', () => {
    expect(starknet.devnet.flush).not.to.be.undefined;
  });

  it('flush pass', async () => {
    assert.doesNotThrow(async () => {
      await starknet.devnet.flush();
    })
  });
});
