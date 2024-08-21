import { BAZAR, readHandler } from "./ao-vars";

export type AOProfileType = {
    id: string;
    walletAddress: string;
    displayName: string | null;
    username: string | null;
    bio: string | null;
    avatar: string | null;
    banner: string | null;
    version: string | null;
};

export type ProfileHeaderType = AOProfileType;

export type RegistryProfileType = {
    id: string;
    avatar: string | null;
    username: string;
    bio?: string;
};

export async function getProfileByWalletAddress(args: { address: string }): Promise<ProfileHeaderType | null> {
    const emptyProfile = {
        id: null,
        walletAddress: args.address,
        displayName: null,
        username: null,
        bio: null,
        avatar: null,
        banner: null,
        version: null,
    };

    try {
        const profileLookup = await readHandler({
            processId: BAZAR.profileRegistry,
            action: 'Get-Profiles-By-Delegate',
            data: { Address: args.address },
        });

        let activeProfileId: string;
        if (profileLookup && profileLookup.length > 0 && profileLookup[0].ProfileId) {
            activeProfileId = profileLookup[0].ProfileId;
        }

        if (activeProfileId) {
            const fetchedProfile = await readHandler({
                processId: activeProfileId,
                action: 'Info',
                data: null,
            });

            if (fetchedProfile) {
                return {
                    id: activeProfileId,
                    walletAddress: fetchedProfile.Owner || null,
                    displayName: fetchedProfile.Profile.DisplayName || null,
                    username: fetchedProfile.Profile.UserName || null,
                    bio: fetchedProfile.Profile.Description || null,
                    avatar: fetchedProfile.Profile.ProfileImage || null,
                    banner: fetchedProfile.Profile.CoverImage || null,
                    version: fetchedProfile.Profile.Version || null
                };
            } else return emptyProfile;
        } else return emptyProfile;
    } catch (e: any) {
        throw new Error(e);
    }
}