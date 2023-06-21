use sample_project_name::double_contract::AnotherContract;

#[contract]
mod FibContract {
    use sample_project_name::fib::fib as fib_impl;

    #[view]
    fn get_fib(n: usize) -> (Array<felt252>, felt252, usize) {
        fib_impl(n)
    }
}
