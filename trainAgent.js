const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-node');

const TrainingEnvironment = require('./tradingEnvironment');
const Agent = require('./agent');
const load = require('./csvParser');

const episodes = 500;
const steps = 50;

const data = load('data/daily/BTC-USD.csv');
const agent = new Agent(TrainingEnvironment.actions(), 0.95);
const env = new TrainingEnvironment(data, 50, steps);

(async () => {
    for (let e = 0; e < episodes; e += 1) {
        console.log(`episode: ${e + 1}`);
        env.reset();

        for (let s = 0; s < steps; s += 1) {
            let state = env.state();
            state = tf.tensor3d([state], [1, 50, 5]);

            // calculate next step
            const action = agent.act(state);
            // take action

            const { reward, nextState } = env.nextStep(action);
            // train model with reward

            await agent.train(state, action, reward, tf.tensor3d([nextState], [1, 50, 5])); //eslint-disable-line

            if (env.remainingSteps() === 0) break;
        }

        env.printSummary();
    }
})();
