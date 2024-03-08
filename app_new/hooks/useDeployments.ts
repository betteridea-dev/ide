import { useEffect, useState } from "react";

export type deployment = {
  txid: string;
  env: "local" | "mainnet" | "testnet";
  functionNames: string[];
};

export type deploymentType = {
  [key: string]: deployment;
};

export default function useDeployments() {
  const [deployments, setDeployments] = useState<deploymentType>(
    JSON.parse(localStorage.getItem("deployments")!) || {}
  );

  useEffect(() => {
    if (deployments)
      localStorage.setItem("deployments", JSON.stringify(deployments));
  }, [deployments]);

  function newDeployment(
    name: string,
    txid: string,
    env: string,
    functionNames: string[]
  ) {
    console.log("newDeployment", name, txid, env);
    const nc = {
      ...deployments,
      [name]: {
        txid: txid,
        env: env as "local" | "mainnet" | "testnet",
        functionNames: functionNames,
      },
    };
    setDeployments(nc);
  }

  function removeDeployment(name: string) {
    const nc = { ...deployments };
    delete nc[name];
    setDeployments(nc);
  }

  return { deployments, newDeployment, removeDeployment };
}
