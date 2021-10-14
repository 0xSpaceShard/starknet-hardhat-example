# Declare this file as a StarkNet contract and set the required
# builtins.
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.storage import Storage

# Define a storage variable.
@storage_var
func balance() -> (res : felt):
end

# Increases the balance by the given amount.
@external
func increase_balance{
        storage_ptr : Storage*, pedersen_ptr : HashBuiltin*,
        range_check_ptr}(amount1 : felt, amount2 : felt):
    let (res) = balance.read()
    balance.write(res + amount1 + amount2)
    return ()
end

# Returns the current balance.
@view
func get_balance{
        storage_ptr : Storage*, pedersen_ptr : HashBuiltin*,
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