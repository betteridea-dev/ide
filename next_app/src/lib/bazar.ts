"use client"
import { readHandler } from "./ao-vars";
import { ARIO } from "@ar.io/sdk/web"

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

export const BAZAR = {
    // module: 'Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350',
    // scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
    assetSrc: 'Fmtgzy1Chs-5ZuUwHpQjQrQ7H7v1fjsP0Bi8jVaDIKA',
    defaultToken: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    ucm: 'U3TjJAZWJjlWBB4KAXSHKzuky81jtyh0zqH8rUL4Wd0',
    pixl: 'DM3FoZUq_yebASPhgd8pEIRIzDW6muXEhxz5-JwbZwo',
    collectionsRegistry: 'TFWDmf8a3_nw43GCm_CuYlYoylHAjCcFGbgHfDaGcsg',
    collectionSrc: '2ZDuM2VUCN8WHoAKOOjiH4_7Apq0ZHKnTWdLppxCdGY',
    profileRegistry: 'SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY',
    profileSrc: '_R2XYWDPUXVvQrQKFaQRvDTDcDwnQNbqlTd_qvCRSpQ',
};

export const BAZAR_TAGS = {
    keys: {
        ans110: {
            title: 'Title',
            description: 'Description',
            topic: 'Topic:*',
            type: 'Type',
            implements: 'Implements',
            license: 'License',
        },
        appName: 'App-Name',
        avatar: 'Avatar',
        banner: 'Banner',
        channelTitle: 'Channel-Title',
        collectionId: 'Collection-Id',
        collectionName: 'Collection-Name',
        contentLength: 'Content-Length',
        contentType: 'Content-Type',
        contractManifest: 'Contract-Manifest',
        contractSrc: 'Contract-Src',
        creator: 'Creator',
        currency: 'Currency',
        dataProtocol: 'Data-Protocol',
        dataSource: 'Data-Source',
        dateCreated: 'Date-Created',
        handle: 'Handle',
        initState: 'Init-State',
        initialOwner: 'Initial-Owner',
        license: 'License',
        name: 'Name',
        profileCreator: 'Profile-Creator',
        profileIndex: 'Profile-Index',
        protocolName: 'Protocol-Name',
        renderWith: 'Render-With',
        smartweaveAppName: 'App-Name',
        smartweaveAppVersion: 'App-Version',
        target: 'Target',
        thumbnail: 'Thumbnail',
        topic: (topic: string) => `topic:${topic}`,
        udl: {
            accessFee: 'Access-Fee',
            commercialUse: 'Commercial-Use',
            dataModelTraining: 'Data-Model-Training',
            derivations: 'Derivations',
            paymentAddress: 'Payment-Address',
            paymentMode: 'Payment-Mode',
        },
    },
    values: {
        ansVersion: 'ANS-110',
        collection: 'AO-Collection',
        comment: 'comment',
        document: 'Document',
        followDataProtocol: 'Follow',
        license: 'dE0rmDfl9_OWjkDznNEXHaSO_JohJkRolvMzaCroUdw',
        licenseCurrency: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
        profileVersions: { '1': 'Account-0.3' },
        ticker: 'ATOMIC ASSET',
        title: (title: string) => `${title}`,
    },
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
            const ario = ARIO.init()
            const arnsPrimaryName = await ario.getPrimaryName({ address: args.address })
            console.log(arnsPrimaryName)

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
            } else {
                return emptyProfile
            };
        } else return emptyProfile;
    } catch (e: any) {
        throw new Error(e);
    }
}

export async function getProfileById(args: { profileId: string }): Promise<ProfileHeaderType | null> {
    const emptyProfile = {
        id: args.profileId,
        walletAddress: null,
        displayName: null,
        username: null,
        bio: null,
        avatar: null,
        banner: null,
        version: null,
    };

    try {
        const fetchedProfile = await readHandler({
            processId: args.profileId,
            action: 'Info',
            data: null,
        });

        if (fetchedProfile) {
            return {
                id: args.profileId,
                walletAddress: fetchedProfile.Owner || null,
                displayName: fetchedProfile.Profile.DisplayName || null,
                username: fetchedProfile.Profile.UserName || null,
                bio: fetchedProfile.Profile.Description || null,
                avatar: fetchedProfile.Profile.ProfileImage || null,
                banner: fetchedProfile.Profile.CoverImage || null,
                version: fetchedProfile.Profile.Version || null,
            };
        } else return emptyProfile;
    } catch (e: any) {
        throw new Error(e);
    }
}
