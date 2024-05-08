import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      <section className="container p-24 my-16">
        <div className="flex flex-col gap-6 items-center">
          <h1 className="text-6xl font-bold">Welcome, {"{pikachu}"}</h1>

          <p className="text-lg text-muted-foreground">
            The intuitive web IDE for building powerful{" "}
            <span className="text-primary">actor oriented</span> applications.
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
                  <div
                    key={i}
                    className="h-full text-[#707070] bg-[#0D0D0D] border border-[#282828] rounded-2xl aspect-[2.25] flex items-center justify-center"
                  >
                    Project Name
                  </div>
                ))}
            </div>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-2xl text-[#707070]">Templates</h3>
          <p className="text-[#353535]">
            Integrate pre-built and customisable scripts seamlessly into your ao
            projects with minimal coding.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-[264px] w-full p-8 border rounded-xl bg-[#353535] relative">
              <h3 className="text-primary text-lg">Token Managament System</h3>

              <Image
                src="/images/token-mgmt.svg"
                alt="Token Management System"
                className="absolute bottom-0 right-0"
                width={200}
                height={160}
              />
            </div>

            <div className="h-[264px] w-full p-8 border rounded-xl bg-[#353535] relative">
              <h3 className="text-primary text-lg">
                Decentralised Voting Script
              </h3>

              <Image
                src="/images/voting-script.svg"
                alt="Token Management System"
                className="absolute bottom-0 right-8"
                width={180}
                height={120}
              />
            </div>
            <div className="h-[264px] w-full p-8 border rounded-xl bg-[#353535] relative col-span-2">
              <h3 className="text-primary text-lg">
                Real Time Chat Integration
              </h3>

              <Image
                src="/images/chat.svg"
                alt="Token Management System"
                className="absolute bottom-0 right-0"
                width={180}
                height={120}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container p-20 text-center flex flex-col mt-20 gap-8 items-center justify-center">
        <h2 className="text-4xl">Feeling lost?</h2>

        <p>
          ao is a new battlefield, and navigating it might feel difficult. Don’t
          worry, BetterIDEa has some resources that will help you in the
          journey!
        </p>
      </section>

      <Image
        src="/images/footer.svg"
        alt="Token Management System"
        className=""
        width={750}
        height={500}
      />

      <div className="h-52"></div>
    </main>
  );
}
