#[contract]
mod Contract {
    use serde::Serde;
    use array::ArrayTrait;

    #[derive(Drop, Serde)]
    struct EventStruct {
        type_felt252: felt252,
        type_u8: u8,
        type_u16: u16,
        type_u32: u32,
        type_u64: u64,
        type_u128: u128,
        type_u256: u256,
        type_tuple: (felt252, u8)
    }

    struct Storage {
        balance: felt252, 
    }


    #[event]
    fn BalanceChanged(prev_balance: felt252, balance: felt252) {}

    #[event]
    fn ComplexEvent(simple: felt252, event_struct: EventStruct, type_tuple: (felt252, u8, usize)) {}

    #[constructor]
    fn constructor(initial_balance: felt252) {
        balance::write(initial_balance);
    }

    // to force EventStruct type generation in abi
    // https://github.com/starkware-libs/cairo/issues/3419
    #[external]
    fn useless(event_struct: EventStruct) {}

    #[external]
    fn increase_balance(amount: felt252) {
        let prev_balance = balance::read();
        balance::write(prev_balance + amount);
        BalanceChanged(prev_balance, balance::read());
    }

    #[external]
    fn send_events() {
        BalanceChanged(0, 42);

        let event_struct = EventStruct {
            type_felt252: 'abc',
            type_u8: 1_u8,
            type_u16: 2_u16,
            type_u32: 3_u32,
            type_u64: 4_u64,
            type_u128: 5_u128,
            type_u256: u256 {
                low: 0, high: 1
            }, type_tuple: ('tuple', 1_u8),
        };

        let type_tuple = ('tuple', 1_u8, 123456789_usize);

        ComplexEvent('simple', event_struct, type_tuple);
    }
}
