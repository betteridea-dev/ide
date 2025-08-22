import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export enum ConnectionStrategies {
    ArWallet = "ar_wallet",
}

const requiredWalletPermissions: string[] = ["SIGN_TRANSACTION", "ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY", "ACCESS_ALL_ADDRESSES", "SIGNATURE"];

interface WalletState {
    address: string;
    originalAddress: string;
    connected: boolean;
    connectionStrategy: ConnectionStrategies | null;
    actions: WalletActions;
}

interface WalletActions {
    updateAddress: (address: string) => void;
    connect: ({ strategy }: { strategy: ConnectionStrategies }) => Promise<void>;
    disconnect: () => void;
}

function triggerAuthenticatedEvent(address: string) {
    window.dispatchEvent(new CustomEvent("subspace-authenticated", { detail: { address } }));
}

export const useWallet = create<WalletState>()(persist((set, get) => ({
    // state
    address: "",
    originalAddress: "",
    connected: false,
    connectionStrategy: null,

    actions: {
        updateAddress: (address: string) => set((state) => ({ address, originalAddress: state.address })),

        connect: async ({ strategy }: { strategy: ConnectionStrategies }) => {
            switch (strategy) {
                case ConnectionStrategies.ArWallet: {
                    if (window.arweaveWallet) {
                        try {
                            await window.arweaveWallet.connect(requiredWalletPermissions as any);
                            const address = await window.arweaveWallet.getActiveAddress();

                            set((state) => {
                                if (state.connected && state.connectionStrategy !== ConnectionStrategies.ArWallet) {
                                    state.actions.disconnect();
                                }

                                // Add wallet switch event listener
                                window.addEventListener("walletSwitch", (e: any) => {
                                    set((state) => ({ address: e.detail.address }));
                                });

                                return {
                                    address: address,
                                    connected: true,
                                    connectionStrategy: ConnectionStrategies.ArWallet,
                                };
                            });

                            triggerAuthenticatedEvent(address);
                        } catch (error) {
                            console.error("Error connecting to ArWeave wallet:", error);
                            throw error;
                        }
                    } else {
                        throw new Error("Arweave Web Wallet not found");
                    }
                    break;
                }
                default:
                    throw new Error(`Connection Strategy ${strategy} is not implemented`);
            }
        },

        disconnect: (reload: boolean = false) => {
            // Trigger disconnect event before clearing wallet state
            window.dispatchEvent(new CustomEvent("subspace-wallet-disconnected"));

            set(() => {
                if (window.arweaveWallet) {
                    window.arweaveWallet.disconnect().then(() => {
                        window.removeEventListener("walletSwitch", () => { });
                    });
                }

                return {
                    address: "",
                    originalAddress: "",
                    connected: false,
                    connectionStrategy: null,
                };
            });

            if (reload) window.location.reload();
        }
    }
}), {
    name: "subspace-wallet-connection",
    storage: createJSONStorage(() => localStorage),
    partialize: (state: WalletState) => ({
        connectionStrategy: state.connectionStrategy,
    })
}));