const tf = require('@tensorflow/tfjs');

class Agent {
    constructor(actions, gamma = 0.95, epsilon = 0.9, path) {
        this.actions = actions;
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.epsilonDecay = 0.995;
        this.epsilonMin = 0.01;
        this.learningRate = 0.001;

        if (path) {
            this.loadModel(path);
        } else {
            this.createModel();
        }
    }

    createModel() {
        this.model = tf.sequential();
        this.model.add(
            tf.layers.lstm({
                units: 5,
                returnSequences: false,
                inputShape: [50, 5],
            }),
        );
        this.model.add(
            tf.layers.dense({
                units: 32,
                activation: 'relu',
            }),
        );
        this.model.add(tf.layers.dense({ units: this.actions.length, activation: 'linear' }));
        this.model.compile({
            optimizer: 'sgd',
            loss: 'meanSquaredError',
            learningRate: this.learningRate,
        });
    }

    act(state) {
        if (Math.random() <= this.epsilon) {
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        }
        const prediction = this.model.predict(state);
        return prediction.argMax(1).get(0);
    }

    async train(state, action, reward, nextState) {
        const target = reward + this.gamma * tf.max(this.model.predict(nextState)).get(); // eslint-disable-line
        const targetF = this.model.predict(state);
        targetF.buffer().set(target, 0, action);
        await this.model.fit(state, targetF, { epochs: 1 });

        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }

    async loadModel(path) {
        this.model = await tf.loadModel(path);
    }

    async saveModel(path) {
        await this.model.save(path);
    }
}

module.exports = Agent;
