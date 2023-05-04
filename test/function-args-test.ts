import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { Account, StarknetContract, StarknetContractFactory } from "hardhat/types/runtime";
import { expectFeeEstimationStructure, getOZAccount } from "./util";

describe("Starknet", function () {
    this.timeout(TIMEOUT);
    let contractFactory: StarknetContractFactory;
    let contract: StarknetContract;
    let account: Account;

    before(async function () {
        account = await getOZAccount();
        contractFactory = await starknet.getContractFactory("contract");
        await account.declare(contractFactory);
        contract = await account.deploy(contractFactory, { initial_balance: 0 });
    });

    it("should work if provided number of arguments is the same as the expected", async function () {
        const { res: balanceBefore } = await contract.call("get_balance");
        expect(balanceBefore).to.deep.equal(0n);
    });

    it("should fail if provided number of arguments is less than the expected", async function () {
        try {
            await contract.call("sum_array");
            expect.fail("Should have failed on passing too few arguments.");
        } catch (err: any) {
            expect(err.message).to.equal("sum_array: Expected 1 argument, got 0.");
        }
    });

    it("should fail if provided number of arguments is more than the expected", async function () {
        try {
            await contract.call("sum_array", { a: [1, 2, 3, 4], b: 4 });
            expect.fail("Should have failed on passing extra argument.");
        } catch (err: any) {
            expect(err.message).to.equal("sum_array: Expected 1 argument, got 2.");
        }
    });

    it("should work if not providing the array length when having an array as argument", async function () {
        const { res: sum } = await contract.call("sum_array", { a: [1, 2, 3, 4] });
        expect(sum).to.deep.equal(10n);
    });

    it("should fail if providing the array length when having an array as argument", async function () {
        try {
            await contract.call("sum_array", { a_len: 4, a: [1, 2, 3, 4] });
            expect.fail("Should have failed on passing extra argument.");
        } catch (err: any) {
            expect(err.message).to.equal("sum_array: Expected 1 argument, got 2.");
        }
    });

    it("should work if providing the exact amount of members in a tuple, with the exact amount of members in a nested struct", async function () {
        const { res: sum } = await contract.call("sum_points_to_tuple", {
            points: [
                { x: 1, y: 2 },
                { x: 3, y: 4 }
            ]
        });
        expect(sum).to.deep.equal([4n, 6n]);
    });

    it("should fail if providing too many members in a tuple", async function () {
        try {
            await contract.call("sum_points_to_tuple", {
                points: [
                    { x: 1, y: 2 },
                    { x: 3, y: 4 },
                    { x: 3, y: 4 }
                ]
            });
            expect.fail("Should have failed on passing more members than expected.");
        } catch (err: any) {
            expect(err.message).to.equal("\"points\": Expected 2 members, got 3.");
        }
    });

    it("should fail if providing too few members in a tuple", async function () {
        try {
            // passing Points (1, 2) and (3, 4) in a tuple
            await contract.call("sum_points_to_tuple", {
                points: [{ x: 1, y: 2 }]
            });
            expect.fail("Should have failed on passing less members than expected.");
        } catch (err: any) {
            expect(err.message).to.equal("\"points\": Expected 2 members, got 1.");
        }
    });

    it("should fail if providing too few members to a nested struct", async function () {
        try {
            // passing Points (1, 2) and (3, 4) in a tuple
            await contract.call("sum_points_to_tuple", {
                points: [{ x: 1 }, { x: 3, y: 4, z: 5 }]
            });
            expect.fail("Should have failed on passing less members than expected.");
        } catch (err: any) {
            expect(err.message).to.equal("\"points[0]\": Expected 2 members, got 1.");
        }
    });

    it("should fail if providing too many members to a nested struct", async function () {
        try {
            // passing Points (1, 2) and (3, 4) in a tuple
            await contract.call("sum_points_to_tuple", {
                points: [
                    { x: 1, y: 2 },
                    { x: 3, y: 4, z: 5 }
                ]
            });
            expect.fail("Should have failed on passing more members than expected");
        } catch (err: any) {
            expect(err.message).to.equal("\"points[1]\": Expected 2 members, got 3.");
        }
    });

    it("should work if providing exact amount of members in type alias", async function () {
        const payload = {
            alias: {
                a: 1n,
                point: {
                    x: 2n,
                    y: 2n
                }
            }
        };
        const { res } = await contract.call("dymmy_alias", payload);

        expect(res).to.deep.equal(payload.alias);
    });

    it("should work if providing exact amount of members in named tuple", async function () {
        const payload = {
            named_tuple: {
                a: 1n,
                b: {
                    tuple: [2n, 3n],
                    extra: 4n
                }
            }
        };
        const { res } = await contract.call("dymmy_named_tuple", payload);

        expect(res).to.deep.equal(payload.named_tuple);
    });

    it("should work if providing exact amount of members in nested tuple", async function () {
        const payload = {
            nested_tuple: [{ x: 1n, y: 2n }, [3n, 4n]]
        };
        const { res } = await contract.call("nested_tuple", payload);

        expect(res).to.deep.equal(payload.nested_tuple);
    });

    it("should work if providing exact amount of members in nested named tuple", async function () {
        const payload = {
            nested_named_tuple: { x: 1n, y: [2n, [3n, 4n]] }
        };
        const { res } = await contract.call("nested_named_tuple", payload);

        expect(res).to.deep.equal(payload.nested_named_tuple);
    });

    it("should work if providing exact amount of members in nested type alias", async function () {
        const payload = {
            nested_type_alias: {
                a: 1n,
                b: {
                    c: 2n,
                    d: [3n, [4n, 5n, 6n]]
                }
            }
        };
        const { res } = await contract.call("nested_type_alias", payload);

        expect(res).to.deep.equal(payload.nested_type_alias);
    });

    it("should work if providing exact amount of members in nested tuple type alias", async function () {
        const payload = {
            nested_tuple_type_alias: [[{ x: 1n, y: 2n }, 3n], 4n, [5n, [6n, { x: 7n, y: 8n }]]]
        };

        const { res } = await contract.call("nested_tuple_type_alias", payload);

        expect(res).to.deep.equal(payload.nested_tuple_type_alias);
    });

    it("should fail if provided number of members is less than the expected", async function () {
        try {
            await contract.call("nested_tuple_type_alias", {
                nested_tuple_type_alias: [[{ x: 1n, y: 2n }, 3n], 4n, [5n, [{ x: 7n, y: 8n }]]]
            });
            expect.fail("Should have failed on passing too few members.");
        } catch (err: any) {
            expect(err.message).to.eql(
                "\"nested_tuple_type_alias[2][1]\": Expected 2 members, got 1."
            );
        }
    });

    it("should fail if provided number of members is more than the expected", async function () {
        try {
            await contract.call("nested_tuple_type_alias", {
                nested_tuple_type_alias: [
                    [{ x: 1n, y: 2n }, 3n],
                    4n,
                    [5n, [6n, { x: 7n, y: 8n }], 9n]
                ]
            });
            expect.fail("Should have failed on passing too few members.");
        } catch (err: any) {
            expect(err.message).to.equal(
                "\"nested_tuple_type_alias[2]\": Expected 2 members, got 3."
            );
        }
    });

    const OBJECT_EXPECTATION = "Arguments should be passed in the form of an object.";
    it("shouldn't invoke with raw input if not selected", async function () {
        try {
            await account.invoke(contract, "increase_balance", ["10", "20"]);
        } catch (err: any) {
            expect(err.message).to.equal(OBJECT_EXPECTATION);
        }
    });

    it("shouldn't estimate fee with raw input if not selected", async function () {
        try {
            await account.estimateFee(contract, "increase_balance", ["10", "20"]);
        } catch (err: any) {
            expect(err.message).to.equal(OBJECT_EXPECTATION);
        }
    });

    it("shouldn't call with raw input if not selected", async function () {
        try {
            await contract.call("sum_point_array", [
                "can put whatever here since it won't be checked"
            ]);
        } catch (err: any) {
            expect(err.message).to.equal(OBJECT_EXPECTATION);
        }
    });

    it("should estimate fee with raw input", async function () {
        const rawInput = ["10", "20"];
        const estimation = await account.estimateFee(contract, "increase_balance", rawInput, {
            rawInput: true
        });
        expectFeeEstimationStructure(estimation);
    });

    it("should invoke with raw input", async function () {
        const rawInput = ["10", "20"];
        // implicit fee estimation
        await account.invoke(contract, "increase_balance", rawInput, { rawInput: true });
    });

    it("should call argumentless function with empty object as raw input", async function () {
        const expectedResult = await contract.call("get_balance", {}, { rawInput: false });
        const rawInputResult = await contract.call("get_balance", {}, { rawInput: true });
        expect(rawInputResult).to.deep.equal(expectedResult);
    });

    it("should call argumentless function with empty array as raw input", async function () {
        const expectedResult = await contract.call("get_balance", {}, { rawInput: false });
        const rawInputResult = await contract.call("get_balance", [], { rawInput: true });
        expect(rawInputResult).to.deep.equal(expectedResult);
    });

    it("should call complex function with raw input", async function () {
        const result = await contract.call(
            "sum_point_array",
            [
                // len
                "2",

                // point 1
                "10",
                "20",

                // point 2
                "30",
                "40"
            ],
            { rawInput: true }
        );
        expect(result).to.deep.equal({ res: { x: 40n, y: 60n } });
    });
});
