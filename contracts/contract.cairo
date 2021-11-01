# Declare this file as a StarkNet contract and set the required
# builtins.
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_signature
from util import almost_equal as aeq

# Define a storage variable.
@storage_var
func balance() -> (res : felt):
end

# Increases the balance by the given amount.
@external
func increase_balance{
        syscall_ptr : felt*, pedersen_ptr : HashBuiltin*,
        range_check_ptr}(amount1 : felt, amount2 : felt):
    let (res) = balance.read()
    balance.write(res + amount1 + amount2)
    return ()
end

# Returns the current balance.
@view
func get_balance{
        syscall_ptr : felt*, pedersen_ptr : HashBuiltin*,
        range_check_ptr}() -> (res : felt):
    let (res) = balance.read()
    return (res)
end

############ tuples

struct Point:
    member x : felt
    member y : felt
end

@view
func sum_points(points : (Point, Point)) -> (x : felt, y : felt):
    return (
        x=points[0].x + points[1].x,
        y=points[0].y + points[1].y)
end

@view
func use_almost_equal(a, b) -> (res):
    let (res) = aeq(a=a, b=b)
    return (res)
end

########### arrays

@external
func sum_array(
        a_len : felt, a : felt*) -> (res):
    if a_len == 0:
        return (res=0)
    end
    let (rest) = sum_array(a_len=a_len - 1, a=a + 1)
    return (res=a[0] + rest)
end

@external
func get_signature{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*}() -> (
        res_len : felt, res : felt*):
    let (sig_len, sig) = get_tx_signature()
    return (res_len=sig_len, res=sig)
end
