%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.starknet.common.syscalls import get_tx_info

@external
func get_signature{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*}() -> (
    res_len : felt, res : felt*
):
    let (tx_info) = get_tx_info()
    return (res_len=tx_info.signature_len, res=tx_info.signature)
end
