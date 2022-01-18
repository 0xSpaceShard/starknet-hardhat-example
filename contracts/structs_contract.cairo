# Declare this file as a StarkNet contract and set the required
# builtins.
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_signature
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.alloc import alloc
from util import almost_equal as aeq
############ Structs

struct Point:
    member x : felt
    member y : felt
end


struct ComplexStruct:
    member i : felt
    member point : Point
    member m : felt
end

########### arrays

@view
func increment_point_array(
        a_len : felt, a : Point*, i : felt) -> (res_len : felt, res : Point*):
    alloc_locals
    if a_len == 1:
        let (local struct_array : Point*) = alloc()
        let (result) = add_point_to_array(0,struct_array,Point(a[0].x + i, a[0].y + i))
        return (res_len = 1, res=result)
    end
    let (rest_len, rest) = increment_point_array(a_len=a_len - 1, a=a + 1, i=i)
    let (result) = add_point_to_array(rest_len, rest, Point(a[0].x + i, a[0].y + i))
    return (res_len = rest_len + 1, res=result)
end


func add_point_to_array(
        a_len : felt, a : Point*, r : Point) -> (res : Point*):
    let res = a
    let next_ind = a_len + 1
    assert res[next_ind] = r
    return (res)
end


@view
func complex_array(
        a_len : felt, a : Point*, i : felt, b_len : felt, b : ComplexStruct*) -> (points_len : felt, points : Point*, complex_struct_len : felt, complex_struct : ComplexStruct*):
    return (a_len, a, b_len, b)
end