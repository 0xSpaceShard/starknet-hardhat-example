%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_nn
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.alloc import alloc

// A Struct to test event emit
struct TestEvent {
    a: felt,
    b: felt,
    c: felt,
}

// Aliases to test event
using AliasEvent = (x: felt, y: felt);

// A map from user (represented by account contract address)
// to their balance.
@storage_var
func balance(user: felt) -> (res: felt) {
}

// An event emitted whenever increase_balance() is called.
// current_balance is the balance before it was increased.
@event
func increase_balance_called(current_balance: felt, amount: felt) {
}

// Events emitted to test event.
@event
func complex_event(
    simple: felt, struc: TestEvent, alias: AliasEvent, array_len: felt, array: felt*
) {
}

@event
func simple_event(arg1: felt, arg2: felt, arg3: felt) {
}

// Increases the balance of the user by the given amount.
@external
func increase_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount: felt
) {
    // Verify that the amount is positive.
    with_attr error_message("Amount must be positive.") {
        assert_nn(amount);
    }

    // Obtain the address of the account contract.
    let (user) = get_caller_address();

    // Read and update its balance.
    let (res) = balance.read(user=user);
    balance.write(user, res + amount);

    // Emit the event.
    increase_balance_called.emit(current_balance=res, amount=amount);

    return ();
}

// Send some events with more complex arguments.
@external
func send_events{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    array_len: felt, array: felt*
) {
    alloc_locals;
    let test = TestEvent(a=10, b=45, c=89);
    let uint = Uint256(40, 5);
    local pt: AliasEvent = (x=40, y=5);
    simple_event.emit(arg1=59, arg2=42, arg3=666);
    complex_event.emit(simple=4, struc=test, alias=pt, array_len=array_len, array=array);
    return ();
}

@view
func get_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user: felt) -> (
    res: felt
) {
    let (res) = balance.read(user=user);
    return (res,);
}
