const colors = require('colors'); // eslint-disable-line

class TrainingEnvironment {
    constructor(steps = [], windowSize = 50, episodeSize = 10, fiatWallet = 500, shareWallet = 0) {
        this.startValue = fiatWallet;
        this.windowSize = windowSize;
        this.episodeSize = episodeSize;
        this.steps = steps;
        this.step = 0;
        this.fiatWallet = fiatWallet;
        this.shareWallet = shareWallet;
        this.actions = [];
    }

    // different actions the agent can take
    static actions() {
        return ['sell', 'hold', 'buy'];
    }

    // returns the current state the environment is in
    state() {
        return this.steps.slice(this.step, this.windowSize + this.step);
    }

    // sets the current state of the environment to a random position in the data
    reset() {
        this.step = Math.floor(
            Math.random() * (this.steps.length - this.windowSize - this.episodeSize - 1), // eslint-disable-line
        );
        this.actions = [];
        this.fiatWallet = this.startValue;
        this.shareWallet = 0;
    }

    // takes an action in the environment and goes to the next step
    // in the real world we would take an action and wait for a new state once
    // a specific time interval has passed (1h, 4h, 1d are the most popular)
    nextStep(action) {
        let reward = 0;
        // go to next step
        const previousPrice = this.currentValue();
        this.step += 1;
        // perform the chosen action
        switch (action) {
        case 0:
            this.sell();
            break;
        case 2:
            this.buy();
            break;
        case 1:
        default:
            this.hold();
            break;
        }

        reward = (this.currentValue() - previousPrice) * 10;
        // return reward and new state
        return {
            reward: Math.max(0, reward),
            nextState: this.state(),
        };
    }

    // returns the current price of the share
    sharePrice() {
        return this.steps[this.windowSize + this.step - 1][1]; // eslint-disable-line
    }

    // returns the reward from the previous action
    calculateReward() {
        if (this.actions.length > 1) {
            return (
                this.actions[this.actions.length - 1].value -
                this.actions[this.actions.length - 2].value
            );
        }
        return 0;
    }

    // uses all the money in the fiat wallet to buy shares
    buy() {
        if (this.fiatWallet > 0) {
            this.shareWallet = this.fiatWallet / this.sharePrice();
            this.fiatWallet = 0;
        }
        this.actions.push({
            action: 'buy',
            value: this.currentValue(),
        });
    }

    // sells all the shares for fiat
    sell() {
        if (this.shareWallet > 0) {
            this.fiatWallet = this.shareFiatValue();
            this.shareWallet = 0;
        }
        this.actions.push({
            action: 'sell',
            value: this.currentValue(),
        });
    }

    hold() {
        this.actions.push({
            action: 'hold',
            value: this.currentValue(),
        });
    }

    // returns the fiat value of your share
    shareFiatValue() {
        return this.shareWallet * this.sharePrice();
    }

    // return the current value, wether it be from the fiat of share wallet
    currentValue() {
        if (this.fiatWallet > 0) {
            return this.fiatWallet;
        }
        return this.shareFiatValue();
    }

    remainingSteps() {
        return this.steps.length - this.windowSize - this.step - 1;
    }

    printSummary() {
        // eslint-disable-next-line
        const orders = this.actions.filter(action => {
            return (action.action === 'buy' || action.action === 'sell');
        });

        const actionString = orders.map((item) => {
            switch (item.action) {
            case 'buy':
                return 'B';
            case 'sell':
                return 'S';
            default:
                return 'H';
            }
        })
            .join('-');

        console.log(
            `Ended with ${this.formatPrice(this.currentValue())} after ${
                orders.length
            } trades. Which totals in ${this.formatPrice(
                this.profit(), true,
            )} profit. Moves: ${actionString}`,
        );
    }

    // eslint-disable-next-line
    formatPrice(amount, colors) {
        const price = Math.round(amount * 100) / 100;

        if (colors) {
            if (price >= 0) {
                return `${price}`.green;
            }
            return `${price}`.red;
        }

        return price;
    }

    profit() {
        return this.currentValue() - this.startValue;
    }
}

module.exports = TrainingEnvironment;
