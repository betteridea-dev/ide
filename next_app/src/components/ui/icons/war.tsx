import Image from "next/image"
import wARpng from "@/assets/icons/wAR.png"

export default function WarpedAR({ width = 20, height = 20 }: { width?: number, height?: number }) {
    return <div className="inline-block">
        <Image src={wARpng} width={width} height={height} alt="war-icon" />
    </div>
}