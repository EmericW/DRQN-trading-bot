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
            Math.random() * this.steps.length - this.windowSize - this.episodeSize, // eslint-disable-line
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
        this.step += 1;

        // perform the chosen action
        switch (action) {
        case 'sell' || 0:
            this.sell();
            reward = this.calculateReward();
            break;
        case 'buy' || 2:
            this.buy();
            break;
        case 'hold':
        default:
            this.hold();
            reward = this.calculateReward();
            break;
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
            nextState: this.state(),
        };
    }

    // returns the current price of the share
    sharePrice() {
        return this.steps[this.windowSize + this.step - 1][3]; // eslint-disable-line
    }

    // returns the reward from the previous action
    calculateReward() {
        if (this.actions.length > 2) {
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

    printSummary() {
        // eslint-disable-next-line
        const orders = this.actions.map(action => {
            if (action.action === 'buy' || action.action === 'sell') return action;
        });

        const actionString = this.actions
            .map((item) => {
                switch (item.action) {
                case 'hold':
                    return 'H';
                case 'buy':
                    return 'B';
                default:
                    return 'S';
                }
            })
            .join('-');

        console.log(
            `Ended with ${this.formatPrice(this.currentValue())} after ${
                orders.length
            } trades. Which totals in ${this.formatPrice(
                this.profit(),
            )} profit. Moves: ${actionString}`,
        );
    }

    // eslint-disable-next-line
    formatPrice(amount) {
        return Math.round(amount * 100) / 100;
    }

    profit() {
        return this.currentValue() - this.startValue;
    }
}

module.exports = TrainingEnvironment;
