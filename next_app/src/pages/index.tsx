import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useGlobalState } from "@/states";
import Ao from "@/components/ao";
import Warp from "@/components/warp";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function Home() {
  const globalState = useGlobalState();
  return globalState.activeMode == "AO" ? <Ao /> : <Warp />;
}

export function NotHome() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}>
      <section className="container p-24 my-16">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="text-6xl font-bold">Welcome, {"{pikachu}"}</h1>

          <p className="text-lg text-muted-foreground">
            The intuitive web IDE for building powerful <span className="text-primary">actor oriented</span> applications.
          </p>

          <div className="flex flex-row gap-x-4 mt-8">
            <Button className="px-8">Open Project</Button>
            <Button className="px-8" variant="outline">
              New Project
            </Button>
          </div>
        </div>
      </section>

      <section className="container flex flex-col gap-y-20 px-20">
        <div className="flex flex-col gap-6 rounded-xl p-4 px-6">
          <p className="text-lg text-[#494949]">Recently opened projects</p>

          <ScrollArea>
            <div className="flex flex-row text-muted items-center gap-x-4 h-[96px] w-full">
              {Array(3)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="h-full text-[#707070] bg-[#0D0D0D] border border-[#282828] rounded-2xl aspect-[2.25] flex items-center justify-center">
                    Project Name
                  </div>
                ))}
            </div>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-2xl text-[#707070]">Templates</h3>
          <p className="text-[#353535]">Integrate pre-built and customisable scripts seamlessly into your ao projects with minimal coding.</p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-[264px] w-full p-8 border rounded-xl bg-[#353535] relative">
              <h3 className="text-primary text-lg">Token Managament System</h3>

              <Image src="/images/token-mgmt.svg" alt="Token Management System" className="absolute bottom-0 right-0" width={200} height={160} />
            </div>

            <div className="h-[264px] w-full p-8 border rounded-xl bg-[#353535] relative">
              <h3 className="text-primary text-lg">Decentralised Voting Script</h3>

              <Image src="/images/voting-script.svg" alt="Token Management System" className="absolute bottom-0 right-8" width={180} height={120} />
            </div>

            <div className="h-[264px] w-full p-8 border rounded-xl bg-[#353535] relative col-span-2">
              <h3 className="text-primary text-lg">Real Time Chat Integration</h3>

              <Image src="/images/chat.svg" alt="Token Management System" className="absolute bottom-0 right-0" width={180} height={120} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-2xl text-[#707070]">Feeling lost?</h3>
          <p className="text-[#353535]">ao is a new battlefield, and navigating it might feel difficult. Don&apos;t worry, BetterIDEa has some resources that will help you in the journey!</p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-[264px] w-full p-8 border rounded-3xl bg-[#121212] relative">
              <h3 className="text-primary text-2xl font-light">Docs</h3>

              <p className="text-[#353535]">Master ao on BetterIDEa with in-depth documentation</p>

              <Image src="/images/docs.svg" alt="Token Management System" className="absolute bottom-0 right-0" width={110} height={75} />
            </div>

            <div className="h-[264px] w-full p-8 border rounded-3xl bg-[#121212] flex flex-col justify-end">
              <h3 className="text-primary text-2xl font-light">Docs</h3>

              <p className="text-[#353535]">Accelerate development with pre-built code</p>
            </div>

            <div className="h-[264px] p-8 w-full border rounded-3xl bg-[#121212] flex flex-row justify-between items-center gap-4 col-span-2">
              <div className="h-full">
                <h3 className="text-primary text-2xl font-light">Learn AO</h3>

                <p className="text-[#353535]">Explore concepts of ao and practice it hands-on</p>
              </div>

              <div className="flex flex-col justify-between gap-6">
                {[
                  {
                    title: "Quick Start",
                    description: "Get started with ao - for complete beginners",
                    tasks: 5,
                    buttonText: "Begin Course >",
                    buttonHref: "/",
                    icon: <Icons.golfFlag height={42} width={42} className="fill-white self-center" />,
                  },
                  {
                    title: "Messaging",
                    description: "Communicate with process in the ao network",
                    tasks: 7,
                    buttonText: "Begin Course >",
                    buttonHref: "/",
                    icon: <Icons.smiley height={42} width={42} className=" self-center" />,
                  },
                ].map((item, i) => (
                  <div key={i} className="grid gap-4 grid-cols-7 items-center">
                    <div className="p-4 rounded-md bg-[#222222} border border-[#2e2e2e] flex aspect-square">{item.icon}</div>

                    <div className="flex flex-col justify-between gap-2 col-span-3">
                      <div>
                        <h4 className="text-lg">{item.title}</h4>
                        <p className="text-sm">{item.description}</p>
                      </div>

                      <p className="text-[#5c5c5c]">{item.tasks} tasks</p>
                    </div>

                    <Link href={item.buttonHref} className="col-span-3 h-full">
                      <Button className="h-full w-full bg-white border border-black outline-double">{item.buttonText}</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Image src="/images/footer.svg" alt="Token Management System" className="mt-20" width={750} height={500} />

      <div className="h-52"></div>
    </main>
  );
}
