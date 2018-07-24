const tf = require('@tensorflow/tfjs');

class Agent {
    constructor(gamma, actions, path) {
        this.actions = actions;
        this.gamma = gamma;

        if (path) {
            this.loadModel(path);
        } else {
            this.createModel();
        }
    }

    createModel() {
        this.model = tf.sequential();
        this.model.add(
            tf.layers.dense({
                units: 20,
                activation: 'relu',
                inputShape: [5],
            }),
        );
        this.model.add(tf.layers.dense({ units: this.actions.length }));
        this.model.compile({
            optimizer: 'sgd',
            loss: 'meanSquaredError',
        });
    }

    act(state) {
        const prediction = this.model.predict(state);
        return tf.argMax(prediction);
    }

    train(state, action, reward, nextState) {
        const target = reward + this.gamma * tf.max(this.model.predict(nextState)[0]); // eslint-disable-line
        const targetF = this.model.predict(state);
        targetF[0][action] = target;
        this.model.fit(state, targetF, { epochs: 1, verbose: 1 });
    }

    async loadModel(path) {
        this.model = await tf.loadModel(path);
    }

    async saveModel(path) {
        await this.model.save(path);
    }
}

module.exports = Agent;
