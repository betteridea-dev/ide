import Image from "next/image"
import bazarpng from "@/assets/icons/bazar.svg"

export default function BazarIcon({ width = 20, height = 20 }: { width?: number, height?: number }) {
    return <div className="inline-block">
        <Image src={bazarpng} width={width} height={height} alt="war-icon" />
    </div>
}