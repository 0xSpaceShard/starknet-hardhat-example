# Declare this file as a StarkNet contract and set the required
# builtins.
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_signature
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.alloc import alloc
from util import almost_equal as aeq

# Define a storage variable.
@storage_var
func balance() -> (res : felt):
end

@constructor
func constructor{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr
} (initial_balance : felt):
    balance.write(initial_balance)
    return ()
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

@view
func increase_balance_with_even{
    syscall_ptr: felt*, pedersen_ptr: HashBuiltin*,
    range_check_ptr}(amount: felt):

    let (div, rem) = unsigned_div_rem(amount, 2)
    assert rem = 0 # assert even
    let (res) = balance.read()
    balance.write(res + amount)
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

struct PointPair:
    member p1 : Point
    member p2 : Point
    member extra : felt
end

struct TupleHolder:
    member tuple : (felt, felt)
    member extra : felt
end

struct ComplexStruct:
    member i : felt
    member point : Point
    member m : felt
end

@view
func dummy_tuple_holder() -> (tuple_holder: TupleHolder):
    return (
        tuple_holder=TupleHolder(
            tuple=(2, 3),
            extra=4
        )
    )
end

@view
func identity(a_len: felt, a: felt*) -> (res_len: felt, res: felt*, res_len_squared: felt):
    return(
        res_len=a_len,
        res=a,
        res_len_squared=a_len * a_len
    )
end

@view
func sum_points_to_tuple(points : (Point, Point)) -> (res: (felt, felt)):
    return (
        res=(
            points[0].x + points[1].x,
            points[0].y + points[1].y
        )
    )
end

@view
func sum_point_pair(pointPair: PointPair) -> (res: Point):
    return (
        res=Point(
            x=pointPair.p1.x + pointPair.p2.x + pointPair.extra,
            y=pointPair.p1.y + pointPair.p2.y + pointPair.extra
        )
    )
end

@view
func add_extra_to_tuple(tuple_holder: TupleHolder) -> (res: Point):
    return (
        res=Point(
            x=tuple_holder.tuple[0] + tuple_holder.extra,
            y=tuple_holder.tuple[1] + tuple_holder.extra
        )
    )
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

@view
func increment_point_array(
        a_len : felt, a : Point*, i : felt) -> (res_len : felt, res : Point*):
    alloc_locals
    if a_len == 1:
        let (local struct_array : Point*) = alloc()
        let (result_len, result) = add_point_to_array(0,struct_array,Point(a[0].x + i, a[0].y + i))
        return (res_len = result_len, res=result)
    end
    let (rest_len, rest) = increment_point_array(a_len=a_len - 1, a=a + Point.SIZE, i=i)
    let (result_len, result) = add_point_to_array(rest_len, rest, Point(a[0].x + i, a[0].y + i))
    return (res_len = result_len, res=result)
end

func add_point_to_array(
        a_len : felt, a : Point*, r : Point) -> (res_len : felt, res : Point*):
    let res = a
    assert res[a_len] = r
    return (a_len + 1, res)
end

@view
func sum_point_array(points_len: felt, points: Point*) -> (res: Point):
    if points_len == 0:
        return (res=Point(x=0, y=0))
    end
    let (rest) = sum_point_array(points_len=points_len - 1, points=points + Point.SIZE)
    return (res=Point(
        x=points[0].x + rest.x,
        y=points[0].y + rest.y
    ))
end

@view
func complex_array(
        a_len : felt, a : Point*, i : felt, b_len : felt, b : ComplexStruct*) -> (points_len : felt, points : Point*, complex_struct_len : felt, complex_struct : ComplexStruct*):
    return (a_len, a, b_len, b)
end

@external
func get_signature{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*}() -> (
        res_len : felt, res : felt*):
    let (sig_len, sig) = get_tx_signature()
    return (res_len=sig_len, res=sig)
end
