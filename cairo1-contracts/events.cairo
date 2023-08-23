#[starknet::contract]
mod Contract {
    use serde::Serde;
    use array::ArrayTrait;
    use starknet::ContractAddress;
    use starknet::get_contract_address;
    use starknet::get_caller_address;

    #[derive(Copy, Drop, Serde)]
    struct EventStruct {
        type_felt252: felt252,
        type_u8: u8,
        type_u16: u16,
        type_u32: u32,
        type_u64: u64,
        type_u128: u128,
        type_u256: u256,
        type_tuple: (felt252, u8),
        type_contract_address: ContractAddress
    }

    #[storage]
    struct Storage {
        balance: felt252,
    }

    #[derive(Copy, Drop, starknet::Event)]
    struct BalanceChanged {
        prev_balance: felt252,
        balance: felt252
    }

    #[derive(Copy, Drop, starknet::Event)]
    struct ComplexEvent {
        simple: felt252,
        event_struct: EventStruct,
        type_tuple: (felt252, u8, usize),
        caller_address: ContractAddress
    }

    #[event]
    #[derive(Copy, Drop, starknet::Event)]
    enum Event {
        BalanceChanged: BalanceChanged,
        ComplexEvent: ComplexEvent
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_balance: felt252) {
        self.balance.write(initial_balance);
    }

    #[external(v0)]
    fn increase_balance(ref self: ContractState, amount: felt252) {
        let prev_balance = self.balance.read();
        self.balance.write(prev_balance + amount);
        self.emit(BalanceChanged {
            prev_balance: prev_balance,
            balance: self.balance.read()
        });
    }

    #[external(v0)]
    fn send_events(ref self: ContractState) {
        let caller_address = get_caller_address();
        let contract_address = get_contract_address();

        self.emit(BalanceChanged { prev_balance: 0, balance: 42 });

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
            type_contract_address: contract_address,
        };

        let type_tuple = ('tuple', 1_u8, 123456789_usize);

        self.emit(ComplexEvent {
            simple: 'simple',
            event_struct: event_struct,
            type_tuple: type_tuple,
            caller_address: caller_address
        });
    }
}
