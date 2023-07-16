export type Project = {
    _id?: string;
    id?: string;
    index: number;
    hunter: string; //TokenID
    hunter_id: string; //MongoDB ID
    name: string;
    tagline?: string | null;
    summary: string;
    thumbnail: string | null;
    media: string[];
    tags: string[];
    mint_info: {
        minted: boolean;
        date?: string | null;
        price?: number | null;
        duration?: number | null;
        price_TBA: boolean;
        date_TBA: boolean;
        mintingNow: boolean;
    };
    size: number | null;
    twitter?: string;
    discord?: string;
    website?: string;
    hunted_date: string;
    upvotes: string[];
    sponsored: {
        isSponsored: boolean;
        amount: number | null;
        multiplier: number | null;
        duration: number | null;
    }
}

export const resetProject = {
    index: 0,
    hunter: "",
    hunter_id: "", //Token_ID
    name: "",
    tagline: "",
    summary: "",
    thumbnail: null,
    media: [],
    tags: [],
    mint_info: {
        minted: false,
        date: '',
        price: 0,
        mintingNow: false,
        price_TBA: false,
        date_TBA: false,
    },
    size: 0,
    twitter: "",
    discord: "",
    website: "",
    hunted_date: '',
    upvotes: [],
    sponsored: { isSponsored: false, amount: 0, multiplier: null, duration: null }
}