export const contractSrc = `


// Welcome to BetterIDE Studio
// Feel free to edit the following smartweave contract code and add your own functions

function createVoteContract(state,action)
{
  state={...state,votes:{A:0,B:0}}
  state.campaignName=action.input.campaign;
  state.votes.A=0;
  state.votes.B=0;
  return {state}
}

function vote(state, action){
  if(!action.for) throw new ContractError("Need to input 'for'");

}

function voteA(state)
{
  state.votes.A+=1;
  return { state }
}

function voteB(state)
{
  state.votes.B+=1;
  return { state }
}

function result(state)
{
  if(state.votes.A>state.votes.B)
  {
    state.result="A won"
  }
  else if(state.votes.B>state.votes.A)
  {
    state.result="B won"
  }
  else
  {
    state.result="Draw";
  }
  return {state};
}

export function handle(state, action) {
  const input = action.input
  switch (input.function) {
    case "createVoteContract":
      return createVoteContract(state, action);
    // no need for break statement because we are using return
    case "voteA":
      return voteA(state,action);
    case "voteB":
      return voteB(state,action);
    case "result":
      return result(state);
    default:
      throw new ContractError(\`Function not recognised: "\${input.function}"\`)
  }
}

`;

export const stateSrc = `
{
  "campaignName": "",
  "votes":{
    "A":0,
    "B":0
  },
  "result":""
}

`;
