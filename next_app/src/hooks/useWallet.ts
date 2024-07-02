import { create } from "zustand";


interface State {
    address: string | null;
    shortAddress: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
}

export const useWallet = create<State>((set) => ({
    address: null,
    shortAddress: null,
    isConnected: false,
    connect: async () => {
        await window.arweaveWallet.connect(["SIGN_TRANSACTION","ACCESS_ADDRESS"]);
        const address = await window.arweaveWallet.getActiveAddress();
        set({
            address,
            shortAddress:address.slice(0, 5) + "..." +address.slice(-5),
            isConnected: true
        });
    },
    disconnect: async () => { 
        await window.arweaveWallet.disconnect();
        set({ address: null, shortAddress:null, isConnected: false });
    }
}));