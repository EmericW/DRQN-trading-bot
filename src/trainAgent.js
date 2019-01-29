const tf = require('@tensorflow/tfjs-node');

const TrainingEnvironment = require('./environments/tradingEnvironment');
const Agent = require('./agent');
const load = require('./csv/csvParser');

const episodes = 100;
const steps = 60;
const windowSize = 360;

const data = load('data/min/coinbase.clean.csv');
const agent = new Agent(TrainingEnvironment.actions(), 0.95);
const env = new TrainingEnvironment(data, windowSize, steps);

(async () => {
    for (let e = 0; e < episodes; e += 1) {
        console.log(`episode: ${e + 1}/${episodes}`);
        env.reset();
        let randomMoves = 0;

        for (let s = 0; s < steps; s += 1) {
            // get current state and reshape
            let state = env.state();
            state = tf.tensor3d([state], [1, windowSize, 5]);

            // calculate next step
            const {
                action,
                random,
            } = agent.act(state);

            if (random) {
                randomMoves += 1;
            }
            // take action, get reward and next state
            const { reward, nextState } = env.nextStep(action);
            // add experience to agents memory
            agent.remember({
                state,
                action,
                reward,
                nextState: tf.tensor3d([nextState], [1, windowSize, 5]),
            });

            if (env.remainingSteps() === 0) break;
        }
        const randomness = (randomMoves / steps) * 100;

        // train agent using random experiences
        await agent.replay(50); // eslint-disable-line

        env.printSummary();
        console.log(`Randomness ${randomness}`);
    }
})();
