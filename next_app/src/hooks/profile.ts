import { create } from "zustand";
import { AOProfileType } from "@/lib/bazar";

type State = AOProfileType & {
    loading: boolean;
    set: (fn: (state: State) => State) => void;
    reset: () => void;
    setLoading: (loading: boolean) => void;
    setProfile: (profile: AOProfileType) => void;
    setProfileField: (field: string, value: any) => void;
    setProfileFields: (fields: Partial<AOProfileType>) => void;
    setProfileAvatar: (avatar: string) => void;
    setProfileBanner: (banner: string) => void;
    setProfileDisplayName: (displayName: string) => void;
    setProfileUsername: (username: string) => void;
    setProfileBio: (bio: string) => void;
    setProfileVersion: (version: string) => void;
    setProfileId: (id: string) => void;
    setProfileWalletAddress: (walletAddress: string) => void;
};

export const useProfile = create<State>((set) => ({
    id: null,
    walletAddress: null,
    displayName: null,
    username: null,
    bio: null,
    avatar: null,
    banner: null,
    version: null,
    loading: false,
    set: (fn) => set((state) => fn(state)),
    reset: () => set({ id: null, walletAddress: null, displayName: null, username: null, bio: null, avatar: null, banner: null, version: null, loading: false }),
    setLoading: (loading) => set({ loading }),
    setProfile: (profile) => set({ ...profile }),
    setProfileField: (field, value) => set((state) => ({ ...state, [field]: value })),
    setProfileFields: (fields) => set((state) => ({ ...state, ...fields })),
    setProfileAvatar: (avatar) => set((state) => ({ ...state, avatar })),
    setProfileBanner: (banner) => set((state) => ({ ...state, banner })),
    setProfileDisplayName: (displayName) => set((state) => ({ ...state, displayName })),
    setProfileUsername: (username) => set((state) => ({ ...state, username })),
    setProfileBio: (bio) => set((state) => ({ ...state, bio })),
    setProfileVersion: (version) => set((state) => ({ ...state, version })),
    setProfileId: (id) => set((state) => ({ ...state, id })),
    setProfileWalletAddress: (walletAddress) => set((state) => ({ ...state, walletAddress })),
}));