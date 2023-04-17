import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { starknet, network, ethers } from "hardhat";
import {
    Account,
    StarknetContractFactory,
    StarknetContract,
    HttpNetworkConfig
} from "hardhat/types";
import { TIMEOUT } from "./constants";
import {
    expectAddressEquality,
    expectFeeEstimationStructure,
    getOZAccount,
    OK_TX_STATUSES
} from "./util";

/**
 * Follows the example at https://www.cairo-lang.org/docs/hello_starknet/l1l2.html
 * Shows the communication between an L2 contract defined in l1l2.cairo
 * and an L1 contract defined in https://www.cairo-lang.org/docs/_static/L1L2Example.sol
 */
describe("Postman", function () {
    this.timeout(TIMEOUT);

    const user = 1;
    /**
     * The URL of the L1 network to interact with. It is expected to be already running.
     * Possibilities include and are not limited to:
     * - Hardhat node: https://hardhat.org/hardhat-network/#running-stand-alone-in-order-to-support-wallets-and-other-software
     * - Ganache node
     * - Goerli testnet
     * Supply the L1 network with `npx hardhat test --network <L1_NETWORK_NAME>`.
     * The network is expected to be defined in hardhat.config.
     * The `localhost` network is predefined, so `--network localhost` works for e.g. `npx hardhat node`.
     */
    const networkUrl: string = (network.config as HttpNetworkConfig).url;
    let L2contractFactory: StarknetContractFactory;
    let l2contract: StarknetContract;
    let L1L2Example: ContractFactory;
    let MockStarknetMessaging: ContractFactory;
    let mockStarknetMessaging: Contract;
    let l1l2Example: Contract;
    let signer: SignerWithAddress;
    let account: Account;

    before(async function () {
        account = await getOZAccount();

        L2contractFactory = await starknet.getContractFactory("l1l2");
        await account.declare(L2contractFactory);
        l2contract = await account.deploy(L2contractFactory);

        const signers = await ethers.getSigners();
        signer = signers[0];

        MockStarknetMessaging = await ethers.getContractFactory("MockStarknetMessaging", signer);
        const messageCancellationDelay = 5 * 60; // seconds
        mockStarknetMessaging = await MockStarknetMessaging.deploy(messageCancellationDelay);
        await mockStarknetMessaging.deployed();

        L1L2Example = await ethers.getContractFactory("L1L2Example", signer);
        l1l2Example = await L1L2Example.deploy(mockStarknetMessaging.address);
        await l1l2Example.deployed();
    });

    it("should deploy the messaging contract", async () => {
        const { address: deployedTo, l1_provider: L1Provider } =
            await starknet.devnet.loadL1MessagingContract(networkUrl);

        expect(deployedTo).not.to.be.undefined;
        expect(L1Provider).to.equal(networkUrl);
    });

    it("should load the already deployed contract if the address is provided", async () => {
        const { address: loadedFrom } = await starknet.devnet.loadL1MessagingContract(
            networkUrl,
            mockStarknetMessaging.address
        );

        expect(mockStarknetMessaging.address).to.equal(loadedFrom);
    });

    it("should exchange messages between L1 and L2", async () => {
        /**
         * Load the mock messaging contract
         */

        await starknet.devnet.loadL1MessagingContract(networkUrl, mockStarknetMessaging.address);

        /**
         * Increase the L2 contract balance to 100 and withdraw 10 from it.
         */

        await account.invoke(l2contract, "increase_balance", {
            user,
            amount: 100
        });
        await account.invoke(l2contract, "withdraw", {
            user,
            amount: 10,
            L1_CONTRACT_ADDRESS: BigInt(l1l2Example.address)
        });
        let userL2Balance = await l2contract.call("get_balance", {
            user
        });

        expect(userL2Balance).to.deep.equal({ balance: 90n });

        /**
         * Flushing the L2 messages so that they can be consumed by the L1.
         */

        const flushL2Response = await starknet.devnet.flush();
        expect(flushL2Response.consumed_messages.from_l1).to.be.empty;
        const flushL2Messages = flushL2Response.consumed_messages.from_l2;

        expect(flushL2Messages).to.have.a.lengthOf(1);
        expectAddressEquality(flushL2Messages[0].from_address, l2contract.address);
        expectAddressEquality(flushL2Messages[0].to_address, l1l2Example.address);

        /**
         * Check the L1 balance and withdraw 10 which will consume the L2 message.
         */

        let userL1Balance: BigNumber = await l1l2Example.userBalances(user);

        expect(userL1Balance.eq(0)).to.be.true;

        await l1l2Example.withdraw(l2contract.address, user, 10);
        userL1Balance = await l1l2Example.userBalances(user);

        expect(userL1Balance.eq(10)).to.be.true;

        /**
         * Deposit to the L2 contract, L1 balance should be decreased by 2.
         */

        await l1l2Example.deposit(l2contract.address, user, 2, {
            value: 1 // Sets paid_fee_on_l1
        });

        userL1Balance = await l1l2Example.userBalances(user);

        expect(userL1Balance.eq(8)).to.be.true;

        /**
         * Check if L2 balance increased after the deposit
         */

        userL2Balance = await l2contract.call("get_balance", {
            user
        });

        expect(userL2Balance).to.deep.equal({ balance: 90n });

        /**
         * Flushing the L1 messages so that they can be consumed by the L2.
         */

        const flushL1Response = await starknet.devnet.flush();
        const flushL1Messages = flushL1Response.consumed_messages.from_l1;
        expect(flushL1Messages).to.have.a.lengthOf(1);
        expect(flushL1Response.consumed_messages.from_l2).to.be.empty;

        expectAddressEquality(flushL1Messages[0].args.from_address, l1l2Example.address);
        expectAddressEquality(flushL1Messages[0].args.to_address, l2contract.address);
        expectAddressEquality(flushL1Messages[0].address, mockStarknetMessaging.address);

        userL2Balance = await l2contract.call("get_balance", {
            user
        });

        expect(userL2Balance).to.deep.equal({ balance: 92n });
    });

    it("should mock l1 to l2 tx and vice versa", async () => {
        const L1_CONTRACT_ADDRESS = mockStarknetMessaging.address;
        const { transaction_hash } = await starknet.devnet.sendMessageToL2(
            l2contract.address,
            "deposit",
            L1_CONTRACT_ADDRESS,
            [1, 1],
            0,
            1 // Paid fee on l1
        );

        expect(transaction_hash.startsWith("0x")).to.be.true;
        const tx = await starknet.getTransaction(transaction_hash);
        expect(tx.status).to.be.oneOf(OK_TX_STATUSES);
        await account.invoke(l2contract, "increase_balance", {
            user,
            amount: 10000000
        });

        await account.invoke(l2contract, "withdraw", {
            user,
            amount: 10,
            L1_CONTRACT_ADDRESS
        });

        const { message_hash } = await starknet.devnet.consumeMessageFromL2(
            l2contract.address,
            L1_CONTRACT_ADDRESS,
            [0, 1, 10]
        );
        expect(message_hash.startsWith("0x")).to.be.true;
    });

    it("should estimate message fee", async () => {
        const L1_CONTRACT_ADDRESS = mockStarknetMessaging.address;
        const estimatedMessageFee = await l2contract.estimateMessageFee("deposit", {
            from_address: L1_CONTRACT_ADDRESS,
            amount: 123,
            user
        });
        expectFeeEstimationStructure(estimatedMessageFee);
    });

    it("should fail to estimate message fee with a non @l1_handler function", async () => {
        try {
            const L1_CONTRACT_ADDRESS = mockStarknetMessaging.address;
            await l2contract.estimateMessageFee("withdraw", {
                from_address: L1_CONTRACT_ADDRESS,
                amount: 123,
                user
            });
            expect.fail("Should have failed on the previous line");
        } catch (error: any) {
            expect(error.message).to.contain(
                "Cannot estimate message fee on \"withdraw\" - not an @l1_handler"
            );
        }
    });
});
