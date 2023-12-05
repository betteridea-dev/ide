export const contractSrc = `

// Welcome to BetterIDE Studio
// Feel free to edit the following smartweave contract code and add your own functions

// This is a contract function
function _set(state, action) {
  ContractAssert(action.input.key, "Key not supplied")
  ContractAssert(action.input.value, "Value not supplied")
  // Modify state with the input
  state.db[action.input.key] = action.input.value
  return { state }
}

function _get(state) {
  ContractAssert(action.input.key, "Key not supplied")
  // simply return the value for myName key in state
  return { result: state.db[action.input.key] }
}

function _delete(state) {
  ContractAssert(action.input.key, "Key not supplied")
  delete state.db[action.input.key]
  return { state }
}

// This is the handler for all contract functions
export function handle(state, action) {
  const input = action.input
  switch (input.function) {
    case "set":
      return _set(state, action);
    // no need for break statement because we are using return
    case "get":
      return _get(state, action);
    case "delete":
      return _delete(state, action)
    default:
      throw new ContractError(\`Function not recognised: "\${input.function}"\`)
  }
}


`;

export const stateSrc = `
{
 "db":{}
}

`;
