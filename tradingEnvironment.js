class TrainingEnvironment {
    constructor(steps = [], windowSize = 50, fiatWallet = 500, shareWallet = 0) {
        this.startValue = fiatWallet;
        this.windowSize = windowSize;
        this.steps = steps;
        this.step = 0;
        this.fiatWallet = fiatWallet;
        this.shareWallet = shareWallet;
        this.closed = true;
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

    // takes an action in the environment and goes to the next step
    // in the real world we would take an action and wait for a new state once
    // a specific time interval has passed (1h, 4h, 1d are the most popular)
    nextStep(action) {
        // get the value of the last order
        let previousValue = 0;
        if (this.actions.length > 0) {
            previousValue = this.actions[this.actions.length - 1].value;
        }

        // go to next step
        this.step += 1;

        // perform the chosen action
        switch (action) {
        case 'sell' || 0:
            this.sell();
            break;
        case 'buy' || 2:
            this.buy();
            break;
        default:
            this.hold();
            break;
        }

        // get new value
        const newValue = this.currentValue();

        let reward = 0;

        // console.log(previousValue, newValue);
        if (previousValue) {
            // calculate reward
            reward = this.calculateReward(previousValue, newValue);
        }

        // console.log(
        //     `Performed action: ${action} on step: ${
        //         this.step
        //     }, current share price: ${this.sharePrice()}, profit: ${((newValue - previousValue) /
        //         newValue) *
        //         100}%, current value: ${this.currentValue()}`,
        // );

        // return reward and new state
        return {
            reward,
            // state: this.state(),
        };
    }

    // returns the current price of the share
    sharePrice() {
        return this.steps[this.windowSize + this.step].close;
    }

    // returns the reward from the previous action
    // eslint-disable-next-line
    calculateReward(previousValue, newValue) {
        if (previousValue > newValue) {
            return -1;
        }
        return 1;
    }

    // uses all the money in the fiat wallet to buy shares
    buy() {
        if (this.fiatWallet > 0) {
            this.shareWallet = this.fiatWallet / this.sharePrice();
            this.actions.push({
                action: 'buy',
                value: this.fiatWallet,
            });
            this.fiatWallet = 0;
        }
    }

    // sells all the shares for fiat
    sell() {
        if (this.shareWallet > 0) {
            this.fiatWallet = this.shareFiatValue();
            this.shareWallet = 0;
            this.actions.push({
                action: 'sell',
                value: this.fiatWallet,
            });
        }
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

    getSummary() {
        // eslint-disable-next-line
        const orders = this.actions.map(action => {
            if (action.action === 'buy' || action.action === 'sell') return action;
        });

        console.log(
            `Started with ${this.startValue}, and ended with ${this.currentValue()} after ${
                orders.length
            } trades.`,
        );
    }
}

module.exports = TrainingEnvironment;
