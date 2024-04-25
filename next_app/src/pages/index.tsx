import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function Home() {
  return (
    // TODO: Test font here
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${inter.className}`}
    >
      <section className="container grid grid-cols-2 h-screen p-24 items-center">
        <div className="flex flex-col gap-6">
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
        <div className="flex flex-col gap-6 border rounded-xl p-4 px-6">
          <p className="text-lg">Recently opened projects</p>

          <div className="flex flex-row gap-x-4 h-14">
            <div className="h-full bg-primary border rounded-2xl w-12"></div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-2xl">Templates</h3>
          <p>
            Integrate pre-built and customisable scripts seamlessly into your ao
            projects with minimal coding.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-[264px] w-full border rounded-xl">
              Token Managament System
            </div>
            <div className="h-[264px] w-full border rounded-xl">
              Decentralised Voting Script
            </div>
            <div className="h-[264px] w-full border rounded-xl col-span-2">
              Real Time Chat Integration
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col mt-20 gap-8 items-center justify-center">
        <h2 className="text-4xl">Feeling lost?</h2>

        <p>
          ao is a new battlefield, and navigating it might feel difficult. Don’t
          worry, BetterIDEa has some resources that will help you in the
          journey!
        </p>
      </section>

      <div className="h-52"></div>
    </main>
  );
}
