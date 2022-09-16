// Declare this file as a StarkNet contract and set the required
// builtins.
%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_signature
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.alloc import alloc
from util import almost_equal as aeq

// Define a storage variable.
@storage_var
func balance() -> (res: felt) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    initial_balance: felt
) {
    balance.write(initial_balance);
    return ();
}

// Increases the balance by the given amount.
@external
func increase_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount1: felt, amount2: felt
) {
    let (res) = balance.read();
    balance.write(res + amount1 + amount2);
    return ();
}

@view
func increase_balance_with_even{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount: felt
) {
    let (div, rem) = unsigned_div_rem(amount, 2);
    assert rem = 0;  // assert even
    let (res) = balance.read();
    balance.write(res + amount);
    return ();
}

// Returns the current balance.
@view
func get_balance{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (res: felt) {
    let (res) = balance.read();
    return (res,);
}

// ########### tuples

struct Point {
    x: felt,
    y: felt,
}

struct PointPair {
    p1: Point,
    p2: Point,
    extra: felt,
}

struct TupleHolder {
    tuple: (felt, felt),
    extra: felt,
}

struct ComplexStruct {
    i: felt,
    point: Point,
    m: felt,
}

@view
func dummy_tuple_holder() -> (tuple_holder: TupleHolder) {
    return (tuple_holder=TupleHolder(
        tuple=(2, 3),
        extra=4
        ));
}

@view
func identity(a_len: felt, a: felt*) -> (res_len: felt, res: felt*, res_len_squared: felt) {
    return (res_len=a_len, res=a, res_len_squared=a_len * a_len);
}

@view
func sum_points_to_tuple(points: (Point, Point)) -> (res: (felt, felt)) {
    return (res=(
        points[0].x + points[1].x,
        points[0].y + points[1].y
        ));
}

@view
func sum_point_pair(pointPair: PointPair) -> (res: Point) {
    return (
        res=Point(
        x=pointPair.p1.x + pointPair.p2.x + pointPair.extra,
        y=pointPair.p1.y + pointPair.p2.y + pointPair.extra
        ),
    );
}

@view
func add_extra_to_tuple(tuple_holder: TupleHolder) -> (res: Point) {
    return (
        res=Point(
        x=tuple_holder.tuple[0] + tuple_holder.extra,
        y=tuple_holder.tuple[1] + tuple_holder.extra
        ),
    );
}

@view
func use_almost_equal(a, b) -> (res: felt) {
    let (res) = aeq(a=a, b=b);
    return (res,);
}

// ########### type aliases & named tuples
using TypeAlias = (a: felt, point: Point);

@view
func dymmy_alias(alias: TypeAlias) -> (res: TypeAlias) {
    return (alias,);
}

@view
func dymmy_named_tuple(named_tuple: (a: felt, b: TupleHolder)) -> (res: (a: felt, b: TupleHolder)) {
    return (named_tuple,);
}

// ########### nested tuples, named tuples, aliases
using NestedTypeAlias = (a: felt, b: (c: felt, d: (felt, (felt, felt, felt))));
using TupleTypeAlias = ((Point, felt), felt, (felt, (felt, Point)));

@view
func nested_tuple(nested_tuple: (Point, (felt, felt))) -> (res: (Point, (felt, felt))) {
    return (nested_tuple,);
}

@view
func nested_named_tuple(nested_named_tuple: (x: felt, y: (felt, (felt, felt)))) -> (
    res: (x: felt, y: (felt, (felt, felt)))
) {
    return (nested_named_tuple,);
}

@view
func nested_type_alias(nested_type_alias: NestedTypeAlias) -> (res: NestedTypeAlias) {
    return (nested_type_alias,);
}

@view
func nested_tuple_type_alias(nested_tuple_type_alias: TupleTypeAlias) -> (res: TupleTypeAlias) {
    return (nested_tuple_type_alias,);
}

// ########## arrays

@external
func sum_array(a_len: felt, a: felt*) -> (res: felt) {
    if (a_len == 0) {
        return (res=0);
    }
    let (rest) = sum_array(a_len=a_len - 1, a=a + 1);
    return (res=a[0] + rest);
}

@view
func increment_point_array(a_len: felt, a: Point*, i: felt) -> (res_len: felt, res: Point*) {
    alloc_locals;
    if (a_len == 1) {
        let (local struct_array: Point*) = alloc();
        let (result_len, result) = add_point_to_array(
            0, struct_array, Point(a[0].x + i, a[0].y + i)
        );
        return (res_len=result_len, res=result);
    }
    let (rest_len, rest) = increment_point_array(a_len=a_len - 1, a=a + Point.SIZE, i=i);
    let (result_len, result) = add_point_to_array(rest_len, rest, Point(a[0].x + i, a[0].y + i));
    return (res_len=result_len, res=result);
}

func add_point_to_array(a_len: felt, a: Point*, r: Point) -> (res_len: felt, res: Point*) {
    let res = a;
    assert res[a_len] = r;
    return (a_len + 1, res);
}

@view
func sum_point_array(points_len: felt, points: Point*) -> (res: Point) {
    if (points_len == 0) {
        return (res=Point(x=0, y=0));
    }
    let (rest) = sum_point_array(points_len=points_len - 1, points=points + Point.SIZE);
    return (res=Point(
        x=points[0].x + rest.x,
        y=points[0].y + rest.y
        ));
}

@view
func complex_array(a_len: felt, a: Point*, i: felt, b_len: felt, b: ComplexStruct*) -> (
    points_len: felt, points: Point*, complex_struct_len: felt, complex_struct: ComplexStruct*
) {
    return (a_len, a, b_len, b);
}

@external
func get_signature{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*}() -> (
    res_len: felt, res: felt*
) {
    let (sig_len, sig) = get_tx_signature();
    return (res_len=sig_len, res=sig);
}
