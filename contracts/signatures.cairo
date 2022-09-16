%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_info

@storage_var
func signature_len() -> (len: felt) {
}

@view
func get_signature{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*}() -> (
    res_len: felt, res: felt*
) {
    let (tx_info) = get_tx_info();
    return (res_len=tx_info.signature_len, res=tx_info.signature);
}

@view
func get_signature_len{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (
    res_len: felt
) {
    let (len) = signature_len.read();
    return (res_len=len);
}

@external
func set_signature_len{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    let (tx_info) = get_tx_info();

    signature_len.write(tx_info.signature_len);

    return ();
}
