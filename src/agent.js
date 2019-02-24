const tf = require('@tensorflow/tfjs-node');

class Agent {
    /**
     * @param {Array} actions
     * @param {string} path
     * @param {number} windowSize
     * @param {number} gamma
     * @param {number} epsilon
     * @param {number} epsilonDecay
     * @param {number} epsilonMin
     * @param {number} learningRate
     */
    constructor(
        actions,
        path,
        windowSize,
        gamma = 0.95,
        epsilon = 0.95,
        epsilonDecay = 0.995,
        epsilonMin = 0.01,
        learningRate = 0.001,
    ) {
        this.actions = actions;
        this.windowSize = +windowSize;
        this.gamma = +gamma;
        this.epsilon = +epsilon;
        this.epsilonDecay = +epsilonDecay;
        this.epsilonMin = +epsilonMin;
        this.learningRate = +learningRate;
        this.memory = [];

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
                units: 256,
                activation: 'relu',
                inputShape: [this.windowSize, 4],
            }),
        );
        this.model.add(
            tf.layers.dropout({
                rate: 0.1,
            }),
        );
        this.model.add(
            tf.layers.dense({
                units: 256,
                activation: 'relu',
            }),
        );
        this.model.add(
            tf.layers.dropout({
                rate: 0.1,
            }),
        );
        this.model.add(
            tf.layers.lstm({
                units: 256,
                returnSequences: false,
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

    act(state, allowRandom = false) {
        if (Math.random() <= this.epsilon && allowRandom) {
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

            const { history } = await this.model.fit(state, targetF, { epochs: 1, verbose: 0 }); // eslint-disable-line

            lossSum += history.loss[0];
        }

        const averageLoss = lossSum / batchSize;
        console.log(`Average loss after replay: ${averageLoss}`);

        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }

    async loadModel(path) {
        this.model = await tf.loadModel(`file://${path}`);
    }

    async saveModel(path = null) {
        const defaultPath = `file://${__dirname.split('/').slice(0, -1).join('/')}/models/${+new Date()}`;
        await this.model.save(path || defaultPath);
    }
}

module.exports = Agent;
