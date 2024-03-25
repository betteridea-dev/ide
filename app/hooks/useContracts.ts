import { useEffect, useState } from "react";
import { contractSrc, stateSrc } from "../templates/warp/hello";

type contract = {
  "contract.js": string;
  "state.json": string;
  "README.md": string;
  [a: string]: string
};

export type contractsType = {
  [key: string]: contract;
};

const freshStart: contractsType = {
  hello: {
    "contract.js": contractSrc,
    "state.json": stateSrc,
    "README.md": "# Hello",
  },
};

export default function useContracts() {
  const [contracts, setContracts] = useState<contractsType>(
    JSON.parse(localStorage.getItem("contracts")!) || freshStart
  );

  useEffect(() => {
    if (!contracts) return;
    localStorage.setItem("contracts", JSON.stringify(contracts));
  }, [contracts]);

  function newContract(src?: string, state?: string): string | void {
    const name = prompt("Enter contract name");
    if (!name) return;
    if (name in contracts)
      return alert("Contract with same name already exists");
    const nc = {
      ...contracts,
      [name]: {
        "contract.js": src || contractSrc,
        "state.json": state || stateSrc,
        "README.md": "# " + name,
      },
    };
    setContracts(nc);
    return name;
  }

  function deleteContract(name: string) {
    const nc = { ...contracts };
    delete nc[name];
    setContracts(nc);
  }

  return { contracts, setContracts, newContract, deleteContract };
}

export interface ContractsType {
  contracts: contractsType;
  setContracts: React.Dispatch<React.SetStateAction<contractsType>>;
  newContract: (src?: string, state?: string) => string | void;
  deleteContract: (name: string) => void;
}
