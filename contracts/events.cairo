%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.math import assert_nn
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.alloc import alloc

# A Struct to test event emit
struct TestEvent:
    member a : felt
    member b : felt
    member c : felt
end

# Aliases to test event
using AliasEvent = (x : felt, y : felt)

# A map from user (represented by account contract address)
# to their balance.
@storage_var
func balance(user : felt) -> (res : felt):
end

# An event emitted whenever increase_balance() is called.
# current_balance is the balance before it was increased.
@event
func increase_balance_called(current_balance : felt, amount : felt):
end

# Events emitted to test event.
@event
func complex_event_test(simple : felt, struc : TestEvent, alias : AliasEvent, array_len : felt, array : felt*):
end

@event
func simple_event_test(arg1 : felt, arg2 : felt, arg3 : felt):
end

# Increases the balance of the user by the given amount.
@external
func increase_balance{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        amount : felt):
    # Verify that the amount is positive.
    with_attr error_message("Amount must be positive."):
        assert_nn(amount)
    end

    # Obtain the address of the account contract.
    let (user) = get_caller_address()

    # Read and update its balance.
    let (res) = balance.read(user=user)
    balance.write(user, res + amount)

    # Emit the event.
    increase_balance_called.emit(current_balance=res, amount=amount)

    return ()
end

# Send some events with more complex arguments.
@external
func send_events{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(array_len : felt, array : felt*):
    alloc_locals
    let test = TestEvent(a=10, b=45, c=89)
    let uint = Uint256(40,5)
    local pt : AliasEvent = (x=40, y=5)
    simple_event_test.emit(arg1=59, arg2=42, arg3=666)
    complex_event_test.emit(simple=4, struc=test, alias=pt, array_len=array_len, array=array)
    return ()
end

@view
func get_balance{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        user : felt) -> (res : felt):
    let (res) = balance.read(user=user)
    return (res)
end
