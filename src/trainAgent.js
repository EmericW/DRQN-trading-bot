const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-node');
const cliProgress = require('cli-progress');

const progressBar = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);
const TrainingEnvironment = require('./environments/tradingEnvironment');
const Agent = require('./agent');
const load = require('./csv/csvParser');

const episodes = 500;
const steps = 120;
const windowSize = 1440;

const data = load('data/min/coinbase.clean.csv');
const agent = new Agent(TrainingEnvironment.actions(), 0.95);
const env = new TrainingEnvironment(data, windowSize, steps);

(async () => {
    for (let e = 0; e < episodes; e += 1) {
        console.log(`episode: ${e + 1}`);
        env.reset();

        progressBar.start(steps, 0);
        for (let s = 0; s < steps; s += 1) {
            progressBar.update(s + 1);
            let state = env.state();
            state = tf.tensor3d([state], [1, windowSize, 5]);

            // calculate next step
            const action = agent.act(state);
            // take action

            const { reward, nextState } = env.nextStep(action);
            // train model with reward

            await agent.train(state, action, reward, tf.tensor3d([nextState], [1, windowSize, 5])); //eslint-disable-line

            if (env.remainingSteps() === 0) break;
        }
        progressBar.stop();

        env.printSummary();
    }
})();
