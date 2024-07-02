import { create } from "zustand";


interface State {
    address: string | null;
    shortAddress: string | null;
    isConnected: boolean;
    connect: () => Promise<State>;
    disconnect: () => Promise<void>;
}

export const useWallet = create<State>((set) => ({
    address: null,
    shortAddress: null,
    isConnected: false,
    connect: async () => {
        await window.arweaveWallet.connect(["SIGN_TRANSACTION","ACCESS_ADDRESS"]);
        const address = await window.arweaveWallet.getActiveAddress();
        const shortAddress = address.slice(0, 5) + "..." + address.slice(-5);
        set({
            address,
            shortAddress:shortAddress,
            isConnected: true
        });
        return { address, shortAddress, isConnected: true } as State;
    },
    disconnect: async () => { 
        await window.arweaveWallet.disconnect();
        set({ address: null, shortAddress:null, isConnected: false });
    }
}));