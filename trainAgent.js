const TrainingEnvironment = require('./tradingEnvironment');
const Agent = require('./agent');
const load = require('./csvParser');

const data = load('data/BTC-USD.csv');
const agent = new Agent(TrainingEnvironment.actions());
const env = new TrainingEnvironment(data);

while (env.remainingSteps() > 0) {
    const state = env.state();
    // calculate next step
    const action = agent.act(state);
    // take action
    const { reward } = env.nextStep(action);
    // train model with reward
    agent.train(state, action);
    // set new state
    // currentState = state;
}

env.getSummary();
