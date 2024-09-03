import { useEffect } from "react";

export default function Bounties() {
    useEffect(() => {
        window.location.href = "https://betteridea.dev/bounties";

    }, [])

    return <main className="flex items-center text-center justify-center w-screen h-screen">
        <div>Loading Bounties... <span className="inline-block animate-spin">⌛️</span></div>
    </main>
}