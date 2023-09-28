#[starknet::contract]
mod FirstContract {
    #[storage]
    struct Storage { }

    #[view]
    fn greet() -> felt252 {
        return 'Hello from First';
    }
}

#[starknet::contract]
mod AnotherContract {
    #[storage]
    struct Storage { }

    #[view]
    fn get_balance() -> felt252 {
        return 'Hello from Another';
    }
}
