import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";

describe("Constructor checker test for Cairo 1 contracts", function () {
    this.timeout(TIMEOUT);

    it("should work if constructor is empty", async function () {
        await starknet.getContractFactory("no_constructor");
    });

    it("should work if constructor is muted", async function () {
        await starknet.getContractFactory("mute_constructor");
    });

    it("should work if there is a comment between constructor annotation and definition", async function () {
        await starknet.getContractFactory("commented_constructor");
    });

    it("should work if there is an empty line between constructor annotation and definition", async function () {
        await starknet.getContractFactory("empty_line_constructor");
    });
});
