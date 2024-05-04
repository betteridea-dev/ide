export const contractSrc = `


// Welcome to BetterIDE Studio
// Feel free to edit the following smartweave contract code and add your own functions

function createEvent(state,action)
{
    state.eventName=action.input.value;
    return {state};
}

// a function to add participants
function addParticipant(state,action)
{
  state.participants.push(action.input.value);
  return { state };
}

// a function to viewParticipants
function viewParticipants(state)
{
  return { state.participants };
}

// This is the handler for all contract functions
export function handle(state, action) {
  
  const input = action.input
  switch (input.function) {
    case "createEvent":
      return createEvent(state, action);
    // no need for break statement because we are using return
    case "addParticipant":
      return addParticipant(state,action);
    case "viewParticipants":
      return viewParticipants(state);
    default:
      throw new ContractError(\`Function not recognised: "\${input.function}"\`)

  }
}

`;

export const stateSrc = `
{
  "eventName": "",
  "participants": []
}

`;
