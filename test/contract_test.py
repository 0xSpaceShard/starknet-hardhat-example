import os
import pytest

from starkware.starknet.compiler.compile import (
    compile_starknet_files)
from starkware.starknet.testing.starknet import Starknet
from starkware.starknet.testing.contract import StarknetContract

# The path to the contract source code.
# my change: modified the path to adapt to the file system
CONTRACT_FILE = os.path.join(
    os.path.dirname(__file__), "..", "contracts", "contract.cairo")


# The testing library uses python's asyncio. So the following
# decorator and the ``async`` keyword are needed.
@pytest.mark.asyncio
async def test_increase_balance():
    # Compile the contract.
    contract_definition = compile_starknet_files(
        [CONTRACT_FILE], debug_info=True)

    # Create a new Starknet class that simulates the StarkNet
    # system.
    starknet = await Starknet.empty()

    # Deploy the contract.
    contract_address = await starknet.deploy(
        contract_definition=contract_definition)
    contract = StarknetContract(
        starknet=starknet,
        abi=contract_definition.abi,
        contract_address=contract_address,
    )

    # Invoke increase_balance() twice.
    await contract.increase_balance(amount1=10, amount2=20).invoke()
    #await contract.increase_balance(amount1=20, amount2=0).invoke()

    # Check the result of get_balance().
    assert await contract.get_balance().call() == (30,)