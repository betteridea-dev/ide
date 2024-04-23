"use client";
import { useProjectManager } from "@/hooks";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { AOModule, AOScheduler } from "@/lib/ao-vars";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const ao = connect();
  const pm = useProjectManager();
  const [process, setProcess] = useState("");

  async function aoConnect() {
    console.log("ao connect");
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
  }

  async function aoSpawn() {
    console.log("ao spawn");
    const name = prompt("Enter process name");
    const tags = [{ name: "App-Name", value: "BetterIDEa" }];
    if (name) {
      tags.push({ name: "Name", value: name });
    }
    const r = await ao.spawn({
      tags,
      signer: createDataItemSigner(window.arweaveWallet),
      module: AOModule,
      scheduler: AOScheduler,
    });
    console.log(r);
    setProcess(r);
  }

  async function aoMessage() {
    console.log("ao message");
    if (!process) return alert("no process");
    const r = await ao.message({
      process,
      //       data: `json = require("json")
      // return json.encode(Inbox)`,
      data: "return Inbox",
      tags: [
        { name: "App-Name", value: "BetterIDEa" },
        { name: "Action", value: "Eval" },
      ],
      signer: createDataItemSigner(window.arweaveWallet),
    });
    console.log(r);
    const res = await ao.result({
      process,
      message: r,
    });
    console.log(res);
  }

  function newProject() {
    const name = prompt("Enter project name");
    if (name) {
      const p = pm.newProject({ name, mode: "AO" });
      console.log(p);
    }
  }

  function newFile() {
    const projectname = prompt("Enter project name");
    const filename = prompt("Enter file name");

    if (projectname && filename) {
      const proj = pm.getProject(projectname);
      if (!proj) return alert("project not found");
      pm.newFile(proj, { name: filename, type: "NORMAL" });
    }
  }

  function updateFile() {
    const project = prompt("which project");
    const file = prompt("which file");
    const content = prompt("file content");
    if (project && file && content) {
      const proj = pm.getProject(project);
      if (!proj) return alert("project not found");
      const f = proj.getFile(file);
      if (!f) return alert("file not found");
      console.log(proj, f);
      pm.updateFile(proj, {
        file: f,
        content: {
          cellOrder: ["0"],
          cells: {
            "0": {
              code: "ok",
              output: "none",
            },
          },
        },
      });
    }
  }

  return (
    <div>
      <Button onClick={aoConnect}>connect</Button>
      <br />
      <Button onClick={aoSpawn}>spawn</Button>
      <br />
      <Button onClick={aoMessage}>message</Button>
      <br />
      <br />
      <Button onClick={newProject}>new project</Button>
      <br />
      <Button onClick={newFile}>new file</Button>
      <br />
      <Button onClick={updateFile}>update file</Button>
    </div>
  );
}
