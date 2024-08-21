import { useState, useEffect } from "react";
import Layout from "@/components/layout";
import Mobile from "@/components/mobile";
import { useRouter } from "next/router";
import TxRenderer from "@/pages/renderer";

export default function Home() {
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter()
    const { tx } = router.query

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userAgent = typeof window.navigator === "undefined" ? "bot" : navigator.userAgent;
            const isMobile = Boolean(userAgent.match(
                /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
            ));
            setIsMobile(isMobile);
        }
    }, []);

    if (tx) {
        return <TxRenderer id_={tx as string} />
    }

    return isMobile ? <Mobile /> : <Layout />



}