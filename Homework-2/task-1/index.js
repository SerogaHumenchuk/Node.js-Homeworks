const EventEmitter = require('events')

const VALIDATION_MESSAGES = {
    REGISTER_ERROR: 'client registration is not valid',
    DEPOSIT_ERROR: 'deposit is not valid',
    WITHDRAW_ERROR: 'withdrawal is not valid',
    CLIENT_NOT_FOUND: 'client not found',
};

const EVENTS = {
    REGISTER: 'register',
    ADD: 'add',
    WITHDRAW: 'withdraw',
    GET: 'get',
    ERROR: 'error',
};

class Bank extends EventEmitter {
    constructor() {
        super();
        this.clients = {};

        this.validation();
        this.add();
        this.withdraw();
        this.get();
    }

    register(client) {
        this.emit(EVENTS.REGISTER, client)

        const id = Math.random();
        this.clients = {...this.clients, [id]: client};
        return id;
    }

    add() {
        this.on(EVENTS.ADD, function (personId, money) {
            this.clients[personId].balance += money;
        })
    }

    withdraw() {
        this.on(EVENTS.WITHDRAW, function (personId, money) {
            this.clients[personId].balance -= money;
        })
    }

    get() {
        this.on(EVENTS.GET, function (personId, getBalance) {
            getBalance(this.clients[personId].balance)
        })
    }

    validation() {
        this.on(EVENTS.ERROR, function (error) {
            throw new Error(error.message);
        });

        this.on(EVENTS.REGISTER, function (client) {
            const clientNameIsRegistered = Object.values(this.clients)
                .find(({name}) => client.name === name);
            if(clientNameIsRegistered || client.balance <= 0) {
                return this.emit(EVENTS.ERROR, { message: VALIDATION_MESSAGES.REGISTER_ERROR })
            }
        });

        const checkIsIdExist = (id) => Boolean(this.clients[id])

        this.on(EVENTS.ADD, function (personId, money) {
            if(!checkIsIdExist(personId)) {
                return this.emit(EVENTS.ERROR, { message: VALIDATION_MESSAGES.CLIENT_NOT_FOUND })
            }
            if(money <= 0) {
                return this.emit(EVENTS.ERROR, { message: VALIDATION_MESSAGES.DEPOSIT_ERROR })
            }
        });

        this.on(EVENTS.WITHDRAW, function (personId, money) {
            if(!checkIsIdExist(personId)) {
                return this.emit(EVENTS.ERROR, { message: VALIDATION_MESSAGES.CLIENT_NOT_FOUND })
            }
            const clientDoesNotHaveEnoughMoney = (this.clients[personId].balance - money) <= 0;
            if(clientDoesNotHaveEnoughMoney || money <= 0) {
                return this.emit(EVENTS.ERROR, { message: VALIDATION_MESSAGES.WITHDRAW_ERROR })
            }
        });

        this.on(EVENTS.GET, function (personId) {
            if(!checkIsIdExist(personId)) {
                return this.emit(EVENTS.ERROR, { message: VALIDATION_MESSAGES.CLIENT_NOT_FOUND })
            }
        });
    }
}

const bank = new Bank();
const personId = bank.register({
    name: 'Pitter Black',
    balance: 100
});

console.log('bank ', bank);
console.log('personId ', personId);
bank.emit('add', personId, 20);
bank.emit('get', personId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 120₴
});
bank.emit('withdraw', personId, 50);
bank.emit('get', personId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 70₴
});