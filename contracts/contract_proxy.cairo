%lang starknet
%builtins pedersen range_check bitwise

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import library_call

@contract_interface
namespace IBalanceContract {
    func increase_balance(amount1: felt, amount2: felt) {
    }

    func get_balance() -> (res: felt) {
    }
}

@external
func call_increase_balance{syscall_ptr: felt*, range_check_ptr}(
    contract_address: felt, amount1: felt, amount2: felt
) {
    IBalanceContract.increase_balance(
        contract_address=contract_address, amount1=amount1, amount2=amount2
    );
    return ();
}

@view
func call_get_balance{syscall_ptr: felt*, range_check_ptr}(contract_address: felt) -> (res: felt) {
    let (res) = IBalanceContract.get_balance(contract_address=contract_address);
    return (res=res);
}

// Define local balance variable in our proxy contract.
@storage_var
func balance() -> (res: felt) {
}

@external
func increase_my_balance{syscall_ptr: felt*, range_check_ptr}(
    class_hash: felt, amount1: felt, amount2: felt
) {
    // Increase the local balance variable using a function from a
    // different contract class using a library call.
    IBalanceContract.library_call_increase_balance(
        class_hash=class_hash, amount1=amount1, amount2=amount2
    );
    return ();
}

@view
func get_my_balance{syscall_ptr: felt*, range_check_ptr}(class_hash: felt) -> (res: felt) {
    // Increase the local balance variable using a function from a
    // different contract class using a library call.
    let (res) = IBalanceContract.library_call_get_balance(class_hash=class_hash);
    return (res=res);
}
