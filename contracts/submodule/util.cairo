%lang starknet
%builtins range_check

@view
func foo(a) -> (res: felt) {
    return (res=42);
}
