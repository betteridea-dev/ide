// warp/protocol-land/actions/evolve.ts
async function evolveContract(state, { caller, input: { value } }) {
  if (state.owner !== caller) {
    throw new ContractError("Only the owner can evolve a contract.");
  }
  state.evolve = value;
  return { state };
}
// warp/protocol-land/actions/issues.ts
async function createNewIssue(state, { caller, input: { payload } }) {
  if (!payload.repoId || !payload.title || !payload.description) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  const issue = {
    id: 1,
    repoId: payload.repoId,
    title: payload.title,
    description: payload.description,
    author: caller,
    status: "OPEN",
    assignees: [],
    comments: [],
    bounties: [],
    timestamp: Date.now()
  };
  const issuesCount = repo.issues.length;
  if (issuesCount > 0) {
    issue.id = issuesCount + 1;
  }
  repo.issues.push(issue);
  return { state };
}
async function updateIssueStatus(state, { input: { payload }, caller }) {
  if (!payload.status || !payload.repoId || !payload.issueId) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1;
  if (!hasPermissions) {
    throw new ContractError("Error: You dont have permissions for this operation.");
  }
  const issue = repo.issues[+payload.issueId - 1];
  if (!issue) {
    throw new ContractError("Issue not found.");
  }
  issue.status = payload.status;
  return { state };
}
async function addAssigneeToIssue(state, { input: { payload }, caller }) {
  if (!payload.repoId || !payload.issueId || !payload.assignees) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repo not found.");
  }
  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1;
  if (!hasPermissions) {
    throw new ContractError("Error: You dont have permissions for this operation.");
  }
  const issue = repo.issues[+payload.issueId - 1];
  if (!issue) {
    throw new ContractError("Issue not found.");
  }
  const newAssignees = payload.assignees.filter((assignee) => !issue.assignees.includes(assignee));
  if (newAssignees.length === 0) {
    throw new ContractError("No new assignees to add.");
  }
  issue.assignees.push(...newAssignees);
  return { state };
}
async function addCommentToIssue(state, { caller, input: { payload } }) {
  if (!payload.repoId || !payload.issueId || !payload.comment) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repo not found.");
  }
  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1;
  if (!hasPermissions) {
    throw new ContractError("Error: You dont have permissions for this operation.");
  }
  const issue = repo.issues[+payload.issueId - 1];
  if (!issue) {
    throw new ContractError("Issue not found.");
  }
  const comment = {
    author: caller,
    description: payload.comment,
    timestamp: Date.now()
  };
  if (!issue?.comments) {
    issue.comments = [];
  }
  issue.comments.push(comment);
  return { state };
}
async function createNewBounty(state, { caller, input: { payload } }) {
  if (!payload.repoId || !payload.issueId || !payload.amount || !payload.expiry) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repo not found.");
  }
  const issue = repo.issues[+payload.issueId - 1];
  if (!issue) {
    throw new ContractError("Issue not found.");
  }
  if (caller !== issue.author) {
    throw new ContractError("Only author of this issue can create bounties.");
  }
  const bounty = {
    id: 1,
    amount: payload.amount,
    expiry: payload.expiry,
    paymentTxId: null,
    status: "ACTIVE",
    timestamp: Date.now()
  };
  if (!issue?.bounties) {
    issue.bounties = [];
  }
  const bountyCount = issue.bounties.length;
  if (bountyCount > 0) {
    bounty.id = bountyCount + 1;
  }
  issue.bounties.push(bounty);
  return { state };
}
async function updateBounty(state, { caller, input: { payload } }) {
  if (!payload.repoId || !payload.issueId || !payload.bountyId || !payload.status) {
    throw new ContractError("Invalid inputs supplied.");
  }
  if (payload.status === "CLAIMED" && !payload.paymentTxId) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repo not found.");
  }
  const issue = repo.issues[+payload.issueId - 1];
  if (!issue) {
    throw new ContractError("Issue not found.");
  }
  if (caller !== issue.author) {
    throw new ContractError("Only author of this issue can update bounties.");
  }
  const bounty = issue.bounties[+payload.bountyId - 1];
  if (!bounty) {
    throw new ContractError("Bounty not found.");
  }
  bounty.status = payload.status;
  if (payload.status === "CLAIMED") {
    bounty.paymentTxId = payload.paymentTxId;
  }
  return { state };
}
// warp/protocol-land/actions/pull-requests.ts
async function createNewPullRequest(state, { caller, input: { payload } }) {
  if (!payload.repoId || !payload.title || !payload.description || !payload.baseBranch || !payload.compareBranch || !payload.baseBranchOid || !payload.baseRepo || !payload.compareRepo) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  const pullRequest = {
    id: 1,
    repoId: payload.repoId,
    title: payload.title,
    description: payload.description,
    baseBranch: payload.baseBranch,
    compareBranch: payload.compareBranch,
    baseBranchOid: payload.baseBranchOid,
    author: caller,
    status: "OPEN",
    reviewers: [],
    timestamp: Date.now(),
    baseRepo: payload.baseRepo,
    compareRepo: payload.compareRepo
  };
  const pullRequestsCount = repo.pullRequests.length;
  if (pullRequestsCount > 0) {
    pullRequest.id = pullRequestsCount + 1;
  }
  repo.pullRequests.push(pullRequest);
  return { state };
}
async function updatePullRequestStatus(state, { input: { payload }, caller }) {
  if (!payload.status || !payload.repoId || !payload.prId) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1;
  if (!hasPermissions) {
    throw new ContractError("Error: You dont have permissions for this operation.");
  }
  const PR = repo.pullRequests[+payload.prId - 1];
  if (!PR) {
    throw new ContractError("Pull Request not found.");
  }
  PR.status = payload.status;
  return { state };
}
async function addReviewersToPR(state, { input: { payload }, caller }) {
  if (!payload.repoId || !payload.prId || !payload.reviewers) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1;
  if (!hasPermissions) {
    throw new ContractError("Error: You dont have permissions for this operation.");
  }
  const PR = repo.pullRequests[+payload.prId - 1];
  if (!PR) {
    throw new ContractError("Pull Request not found.");
  }
  const newReviewers = payload.reviewers.filter(
    (reviewer) => !PR.reviewers.some((existingReviewer) => existingReviewer.address === reviewer)
  );
  if (newReviewers.length === 0) {
    throw new ContractError("No new reviewers to add.");
  }
  const reviewers = newReviewers.map((reviewer) => ({
    address: reviewer,
    approved: false
  }));
  PR.reviewers.push(...reviewers);
  return { state };
}
async function approvePR(state, { caller, input: { payload } }) {
  if (!payload.repoId || !payload.prId) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.repoId];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1;
  if (!hasPermissions) {
    throw new ContractError("Error: You dont have permissions for this operation.");
  }
  const PR = repo.pullRequests[+payload.prId - 1];
  if (!PR) {
    throw new ContractError("Pull Request not found.");
  }
  const reviewerIdx = PR.reviewers.findIndex((reviewer) => reviewer.address === caller);
  if (reviewerIdx < 0) {
    throw new ContractError("Reviewer not found.");
  }
  PR.reviewers[reviewerIdx].approved = true;
  return { state };
}
// warp/protocol-land/actions/repository.ts
async function initializeNewRepository(state, { caller, input: { payload } }) {
  if (!payload.name || !payload.description || !payload.dataTxId || !payload.id) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = {
    id: payload.id,
    name: payload.name,
    description: payload.description,
    defaultBranch: "master",
    dataTxId: payload.dataTxId,
    owner: caller,
    contributors: [],
    pullRequests: [],
    issues: [],
    timestamp: Date.now(),
    fork: false,
    forks: [],
    forkedOwners: {},
    parent: null
  };
  state.repos[repo.id] = repo;
  return { state };
}
async function forkRepository(state, { caller, input: { payload } }) {
  if (!payload.name || !payload.description || !payload.dataTxId || !payload.id || !payload.parent) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = {
    id: payload.id,
    name: payload.name,
    description: payload.description,
    defaultBranch: "master",
    dataTxId: payload.dataTxId,
    owner: caller,
    contributors: [],
    pullRequests: [],
    issues: [],
    timestamp: Date.now(),
    fork: true,
    forks: [],
    forkedOwners: {},
    parent: payload.parent
  };
  const parentRepo = state.repos[payload.parent];
  if (!parentRepo) {
    throw new ContractError("Fork failed. Parent not found.");
  }
  const hasAlreadyForked = repo.forkedOwners[caller];
  if (hasAlreadyForked) {
    throw new ContractError("Fork failed. Already forked by the owner.");
  }
  parentRepo.forks.push(payload.id);
  repo.forkedOwners[caller] = true;
  state.repos[repo.id] = repo;
  return { state };
}
async function updateRepositoryTxId(state, { input: { payload }, caller }) {
  if (!payload.dataTxId || !payload.id) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.id];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  const hasPermissions = caller === repo.owner || repo.contributors.indexOf(caller) > -1;
  if (!hasPermissions) {
    throw new ContractError("Error: You dont have permissions for this operation.");
  }
  repo.dataTxId = payload.dataTxId;
  return { state };
}
async function getRepository(state, { input: { payload } }) {
  if (!payload.id) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.id];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  return { result: repo };
}
async function getAllRepositoriesByOwner(state, { input: { payload } }) {
  if (!payload.owner) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repos = Object.values(state.repos);
  const ownerRepos = repos.filter((repo) => repo.owner === payload.owner);
  return { result: ownerRepos };
}
async function getAllRepositoriesByContributor(state, { input: { payload } }) {
  if (!payload.contributor) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repos = Object.values(state.repos);
  const contributorRepos = repos.filter(
    (repo) => repo?.contributors ? repo.contributors.indexOf(payload.contributor) > -1 : false
  );
  return { result: contributorRepos };
}
async function updateRepositoryDetails(state, { input: { payload }, caller }) {
  if (!payload.id) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.id];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  if (caller !== repo.owner) {
    throw new ContractError("Error: Only repo owner can update repo details.");
  }
  if (payload.name) {
    repo.name = payload.name;
  }
  if (payload.description) {
    repo.description = payload.description;
  }
  return { state };
}
async function addContributor(state, { input: { payload }, caller }) {
  if (!payload.id || !payload.contributor) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const repo = state.repos[payload.id];
  if (!repo) {
    throw new ContractError("Repository not found.");
  }
  if (caller !== repo.owner) {
    throw new ContractError("Error: Only repo owner can update repo details.");
  }
  const contributorExists = repo.contributors.find((address) => address === payload.contributor);
  if (contributorExists) {
    throw new ContractError("Contributor already exists.");
  }
  repo.contributors.push(payload.contributor);
  return { state };
}
// warp/protocol-land/actions/user.ts
async function updateProfileDetails(state, { caller, input: { payload } }) {
  if (Object.keys(payload).length === 0) {
    throw new ContractError("Invalid inputs supplied.");
  }
  const user = state.users[caller] ?? {};
  state.users[caller] = { ...user, ...payload };
  return { state };
}
async function getUserDetails(state, { caller }) {
  const user = state.users[caller];
  if (!user) {
    return { result: {} };
  }
  return { result: user };
}
// warp/protocol-land/contract.ts
export async function handle(state, action) {
  const input = action.input;
  switch (input.function) {
    case "initialize":
      return await initializeNewRepository(state, action);
    case "forkRepository":
      return await forkRepository(state, action);
    case "getRepository":
      return await getRepository(state, action);
    case "getRepositoriesByOwner":
      return await getAllRepositoriesByOwner(state, action);
    case "getRepositoriesByContributor":
      return await getAllRepositoriesByContributor(state, action);
    case "updateRepositoryTxId":
      return await updateRepositoryTxId(state, action);
    case "updateRepositoryDetails":
      return await updateRepositoryDetails(state, action);
    case "addContributor":
      return await addContributor(state, action);
    case "createPullRequest":
      return await createNewPullRequest(state, action);
    case "updatePullRequestStatus":
      return await updatePullRequestStatus(state, action);
    case "addReviewersToPR":
      return await addReviewersToPR(state, action);
    case "approvePR":
      return await approvePR(state, action);
    case "createIssue":
      return await createNewIssue(state, action);
    case "updateIssueStatus":
      return await updateIssueStatus(state, action);
    case "addAssigneeToIssue":
      return await addAssigneeToIssue(state, action);
    case "addCommentToIssue":
      return await addCommentToIssue(state, action);
    case "createNewBounty":
      return await createNewBounty(state, action);
    case "updateBounty":
      return await updateBounty(state, action);
    case "updateProfileDetails":
      return await updateProfileDetails(state, action);
    case "getUserDetails":
      return await getUserDetails(state, action);
    case "evolve":
      return await evolveContract(state, action);
    default:
      throw new ContractError(`No function supplied or function not recognised`);
  }
}
