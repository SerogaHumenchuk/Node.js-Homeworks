const EventEmitter = require('events')

const VALIDATION_MESSAGES = {
    REGISTER_ERROR: 'client registration is not valid',
    DEPOSIT_ERROR: 'deposit is not valid',
    WITHDRAW_ERROR: 'withdrawal is not valid',
    CLIENT_NOT_FOUND: 'client not found',
    SEND_ERROR: 'sending failed',
};

const EVENTS = {
    REGISTER: 'register',
    ADD: 'add',
    WITHDRAW: 'withdraw',
    GET: 'get',
    ERROR: 'error',
    SEND: 'send',
};

class Bank extends EventEmitter {
    constructor() {
        super();
        this.clients = {};

        this.validation();
        this.add();
        this.withdraw();
        this.get();
        this.send();
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

    send() {
        this.on(EVENTS.SEND, function (personFirstId, personSecondId, money) {
            if((this.clients[personFirstId].balance - money) >= 0) {
                this.emit(EVENTS.WITHDRAW, personFirstId, money);
                this.emit(EVENTS.ADD, personSecondId, money);
            }
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

        this.on(EVENTS.SEND, function (personFirstId, personSecondId, money) {
            if(!checkIsIdExist(personFirstId) || !checkIsIdExist(personSecondId) || money <= 0) {
                return this.emit(EVENTS.ERROR, { message: VALIDATION_MESSAGES.SEND_ERROR })
            }
        });
    }
}

const bank = new Bank();
const personFirstId = bank.register({
    name: 'User 1',
    balance: 100
});

const personSecondId = bank.register({
    name: 'User 2',
    balance: 200
});

console.log('bank ', bank);
bank.emit('send', personFirstId, personSecondId, 50);
console.log('bank ', bank);
