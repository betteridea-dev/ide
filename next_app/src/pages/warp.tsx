import Layout from "@/components/layout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useGlobalState } from "@/states";
import Link from "next/link";

export default function Warp() {
  const globalState = useGlobalState();
  return (
    <>
      <AlertDialog defaultOpen={globalState.activeMode == "WARP"}>
        {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Warp mode is currently unstable</AlertDialogTitle>
            <AlertDialogDescription>
              <div>We are constantly shipping and upgrading the IDE to our full potential, but being a small team of three (2 devs, 1 designer) we have been focusing more on the AO features rather than the Warp mode.</div>
              <br />
              <div>Which is why a lot of things are yet to be ported form our old codebase to this new one.</div>
              <br />
              <div>
                Luckily the entire IDE is opensource on{" "}
                <Link className="text-btr-green" href="https://github.com/betteridea-dev">
                  Github
                </Link>
                , we would love if you could contribute something ;)
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
            <AlertDialogAction>I Understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Layout />
    </>
  );
}
