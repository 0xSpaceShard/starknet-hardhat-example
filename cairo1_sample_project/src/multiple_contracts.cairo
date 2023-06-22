#[contract]
mod FirstContract {
    #[view]
    fn greet() -> felt252 {
        return 'Hello from First';
    }
}

#[contract]
mod AnotherContract {
    #[view]
    fn get_balance() -> felt252 {
        return 'Hello from Another';
    }
}
