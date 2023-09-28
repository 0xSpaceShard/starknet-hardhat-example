// some dummy import to check if it works
use sample_package_name::multiple_contracts::AnotherContract;

#[starknet::contract]
mod FibContract {
    use sample_package_name::fib::fib as fib_impl;
    use array::ArrayTrait;

    #[storage]
    struct Storage {
        balance: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_balance: felt252) {
        self.balance.write(initial_balance);
    }

    #[external(v0)]
    fn get_balance(ref self: ContractState) -> felt252 {
        self.balance.read()
    }

    #[external(v0)]
    fn get_fib(ref self: ContractState, n: usize) -> (Array<felt252>, felt252, usize) {
        fib_impl(n)
    }
}
