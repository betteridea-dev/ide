import { AlertDialog, AlertDialogTitle, AlertDialogTrigger, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGlobalState, useProjectManager } from "@/hooks";
import { AppVersion, BetterIDEaWallet, SponsorWebhookUrl } from "@/lib/ao-vars";
import Arweave from "arweave";
import { useState } from "react";
import { toast } from "sonner";

export default function Sponsor() {
    const [amount, setAmount] = useState(1)
    const arweave = new Arweave({ host: "arweave.net", port: 443, protocol: "https" })

    async function oneTime(amount: number) {
        const txn = await arweave.createTransaction({
            target: BetterIDEaWallet,
            quantity: arweave.ar.arToWinston(amount.toString()),
        }, "use_wallet")
        txn.addTag("App-Name", "BetterIDEa")
        txn.addTag("BetterIDEa-Function", `Sponsor ${amount} $AR`)
        txn.addTag("App-Version", AppVersion)

        const res = await arweave.transactions.post(await window.arweaveWallet.sign(txn))
        if (res.status === 200) {
            await fetch(SponsorWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: `\`\`\`\n${await window.arweaveWallet.getActiveAddress()} has sponsored ${amount} $AR! 🎉\n\`\`\``,
                })
            })
            toast.success("Thank you for sponsoring us! 🎉", { position: "top-center" })
        } else {
            toast.error(res.statusText, { position: "top-center" })
            console.log(res)
        }
    }

    async function subscribe(amount: number) {
        // connect to the extension
        await window.arweaveWallet.connect(["ACCESS_ALL_ADDRESSES"]);


        const subscription = await (window.arweaveWallet as any)?.subscription({
            arweaveAccountAddress: "flBS223GKLwM0yiJGCk55BA_mdH_1QTLR5VFKejIi7c",
            applicationName: "BetterIDEa",
            subscriptionName: "BetterIDEa Sponsor",
            subscriptionManagementUrl: "https://ide.betteridea.dev",
            subscriptionFeeAmount: amount,
            recurringPaymentFrequency: "Monthly",
            // one day from today
            subscriptionEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            applicationIcon: "https://ide.betteridea.dev/icon.svg",
        });

        // Subscription will output the details and the initial payment txn
        console.log("Subscription details with paymentHistory array:", subscription);
    }

    async function sponsor() {
        await oneTime(amount)
        document.getElementById("cancel-sponsor")?.click()
    }

    function AmountButton({ value }: { value: number }) {
        return <Button variant={amount == value ? "default" : "outline"} className="m-1" onClick={() => {
            setAmount(value)
            const customInput = document.getElementById("custom-amt") as HTMLInputElement
            customInput.value = ""
        }}>{value} $AR</Button>
    }

    return <AlertDialog>
        <AlertDialogTrigger className="" id="sponsor-us">delete file</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Sponsor BetterIDEa ♥️</AlertDialogTitle>
                <AlertDialogDescription>Sponsor a one time or recurring amount to support the development of BetterIDEa and all of its services<br /> APM, LearnAO, Portable Codecell, VSCode extension</AlertDialogDescription>
            </AlertDialogHeader>
            <div>Select an amount (one time)</div>
            <div>
                {/* <Button variant="outline" className="m-1" onClick={()=>setAmount(0.1)}>0.1 $AR</Button>
                <Button variant="outline" className="m-1" onClick={() => setAmount(0.5)}>0.5 $AR</Button>
                <Button variant="outline" className="m-1" onClick={() => setAmount(1)}>1 $AR</Button>
                <Button variant="outline" className="m-1" onClick={() => setAmount(5)}>5 $AR</Button>
                <Button variant="outline" className="m-1" onClick={() => setAmount(10)}>10 $AR</Button> */}
                {
                    [0.1, 0.5, 1, 5, 10].map((v, i) => <AmountButton key={i} value={v} />)
                }
            </div>
            <div className="flex gap-2 items-center">
                <div className="pl-3 whitespace-nowrap">Custom Amount</div>
                <Input type="number" id="custom-amt" className="h-10" defaultValue={amount} onChange={e => setAmount(parseInt(e.target.value))} />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel id="cancel-sponsor">Cancel</AlertDialogCancel>
                <AlertDialog>
                    <AlertDialogTrigger className="p-0"> <Button variant="default">Continue</Button> </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Sponsorship</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to sponsor <span className="text-foreground">{amount} $AR</span> to BetterIDEa?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={sponsor}>I Confirm </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}