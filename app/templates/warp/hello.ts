export const contractSrc = `

// Welcome to BetterIDE Studio
// Feel free to edit the following smartweave contract code and add your own functions


// This is a contract function
function setName(state, action) {
  // Modify state with the input
  state.myName = action.input.name
  return { state }
}

function getName(state) {
  // simply return the value for myName key in state
  return { result: state.myName }
}

// This is the handler for all contract functions
export function handle(state, action) {
  const input = action.input
  switch (input.function) {
    case "setName":
      return setName(state, action);
    // no need for break statement because we are using return
    case "getName":
      return getName(state);
    default:
      throw new ContractError(\`Function not recognised: "\${input.function}"\`)
  }
}

`;

export const stateSrc = `
{
  "myName": ""
}
`;
