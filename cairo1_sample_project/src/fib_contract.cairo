// some dummy import to check if it works
use sample_project_name::multiple_contracts::AnotherContract;

#[contract]
mod FibContract {
    use sample_project_name::fib::fib as fib_impl;
    use array::ArrayTrait;

    struct Storage {
        balance: felt252,
    }

    #[constructor]
    fn constructor(initial_balance: felt252) {
        balance::write(initial_balance);
    }

    #[view]
    fn get_balance() -> felt252 {
        balance::read()
    }

    #[view]
    fn get_fib(n: usize) -> (Array<felt252>, felt252, usize) {
        fib_impl(n)
    }
}
