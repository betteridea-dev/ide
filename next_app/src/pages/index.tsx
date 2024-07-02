import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import Mobile from "@/components/mobile";

export default function Home() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userAgent = typeof window.navigator === "undefined" ? "bot" : navigator.userAgent;
            const isMobile = Boolean(userAgent.match(
                /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
            ));
            setIsMobile(isMobile);
        }
    }, []);
    return isMobile ? <Mobile/> : <Layout />

}