import { Button } from "./ui/button";
import { Combobox } from "./ui/combo-box";

export default function AosHome() {
  return (
    <div className="h-full flex flex-col gap-2 items-center justify-evenly">
      <h1 className="text-2xl tracking-tight">
        <span className="italic font-light mr-1">
          Unlock Infinite Creativity with{" "}
        </span>
        <span className="bg-gradient-to-r from-[#006F86] to-white bg-clip-text text-transparent font-bold not-italic">
          AO notebook&apos;s threaded computer
        </span>
      </h1>

      <div className="w-full max-w-xl flex flex-col gap-8">
        <h3 className="text-xl font-bold italic">Recent processes</h3>

        <div>
          <p className="font-normal mb-2">Select a process</p>

          <Combobox />
        </div>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-8">
        <h3 className="text-xl font-bold italic">Explore templates</h3>

        <div className="grid grid-cols-3 gap-2">
          {["Chatroom", "Token", "Ping Pong"].map((label, i) => (
            <Button>{label}</Button>
          ))}
        </div>
      </div>

      <Button variant="secondary">Start new process</Button>
    </div>
  );
}
