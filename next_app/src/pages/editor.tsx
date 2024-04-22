import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Editor, useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";

import theme from "@/themes/warp.json";
import useContracts, { contractsType } from "@/hooks/useContracts";

export default function CodeEditor() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchParams = useSearchParams();

  const { contracts, setContracts } = useContracts();
  const [value, setValue] = useState<string | undefined>("");

  const monaco = useMonaco();
  monaco?.editor.defineTheme("code", theme as editor.IStandaloneThemeData);

  const file = searchParams.get("file")!.split("/");
  const contractName: string = file[0];
  const contractFile: string = file[1];

  useEffect(() => {
    if (!contracts) return;

    // console.log(contracts, contractName, contractFile)
    const c: contractsType = JSON.parse(localStorage.getItem("contracts")! || "{}");
    const src = c[contractName][contractFile];
    setContracts(c);
    setValue(src);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!value) return;

    const nc = { ...contracts };
    nc[contractName][contractFile] = value;
    setContracts(nc);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Editor
      height="100vh"
      language={searchParams.get("language")!}
      theme="code"
      defaultValue={value}
      onChange={(value) => {
        setValue(value);
      }}
    />
  );
}
