import Layout from "@/components/layout";

export default function Bounties() {
    window.location.href = "https://betteridea.dev/bounties";

    return <main className="flex items-center text-center justify-center w-screen h-screen">
        <div>Loading Bounties... <span className="inline-block animate-spin">⌛️</span></div>
    </main>
}