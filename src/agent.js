const tf = require('@tensorflow/tfjs');

class Agent {
    constructor(actions, gamma = 0.95, epsilon = 0.95, path) {
        this.actions = actions;
        this.memory = [];
        this.gamma = gamma;
        this.epsilon = epsilon;
        this.epsilonDecay = 0.98;
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
                returnSequences: true,
                inputShape: [360, 5],
            }),
        );
        this.model.add(
            tf.layers.lstm({
                units: 5,
                returnSequences: false,
                inputShape: [360, 5],
            }),
        );
        this.model.add(
            tf.layers.dense({
                units: 32,
                activation: 'relu',
            }),
        );
        this.model.add(
            tf.layers.dense({
                units: 10,
                activation: 'relu',
            }),
        );
        this.model.add(tf.layers.dense({ units: this.actions.length, activation: 'linear' }));
        this.model.compile({
            optimizer: tf.train.adam(this.learningRate),
            loss: tf.losses.meanSquaredError,
        });
    }

    remember({ state, action, reward, nextState }) {
        this.memory.push({
            state,
            action,
            reward,
            nextState,
        });
    }

    act(state) {
        if (Math.random() <= this.epsilon) {
            return {
                action: Math.floor(Math.random() * this.actions.length),
                random: true,
            };
        }

        const prediction = this.model.predict(state);
        return {
            action: prediction.argMax(1).get(0),
            random: false,
        };
    }

    getRandomBatch(batchSize) {
        const batch = [];

        for (let i = 0; i < batchSize; i += 1) {
            const sample = this.memory[
                Math.floor(Math.random() * (this.memory.length - 1))
            ];
            batch.push(sample);
        }

        return batch;
    }

    async replay(batchSize = 32) {
        const batch = this.getRandomBatch(batchSize);
        let lossSum = 0;

        for (let i = 0; i < batch.length; i += 1) {
            const { state, action, reward, nextState } = batch[i];
            const target = reward + this.gamma * tf.max(this.model.predict(nextState)).get(); // eslint-disable-line
            const targetF = this.model.predict(state);

            targetF.buffer().set(target, 0, action);
            const { history } = await this.model.fit(state, targetF, { epochs: 1 }); // eslint-disable-line

            lossSum += history.loss[0];
        }

        const averageLoss = lossSum / batchSize;
        // console.log(`Average loss after replay: ${averageLoss}`);

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
