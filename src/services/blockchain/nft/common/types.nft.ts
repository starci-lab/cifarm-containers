import { Network } from "@/config"
import { Atomic } from "@/utils"


export interface GetContractObservableParams {
    nftCollectionId: string,
    chainKey: string,
    network: Network,
    eventName: string,
    callbackFn: (...args: Array<unknown>) => void | Promise<void>
} 


export interface NftData {
    ownerAddress: string,
    tokenId: string,
    metadata: NftMetadata
}

//algorand
export interface AlgorandCollection {
    id: string,
    name: string,
}

export interface AlgorandMetadata {
    name: string;
    collection: AlgorandCollection
    description: string;
    //image, for better display on the marketplace
    image: string;
    image_integrity: string; 
    image_mimetype: string;
    //data, for the actual content of the NFT
    properties: Record<string, Atomic>
}

export interface NftMetadata {
    image: string,
    //properties: Record<string, Atomic>
    //serialized
    properties: string
}

export interface NearNft {
    token_id: string,
    owner_id: string,
    metadata: NearNftMetadata
}

export interface NearNftMetadata {
    title?: string; // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
    description?: string; // free-form description
    media?: string; // URL to associated media, preferably to decentralized, content-addressed storage
    media_hash?: string; // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
    copies?: number; // number of copies of this set of metadata in existence when token was minted.
    issued_at?: string; // When token was issued or minted, Unix epoch in milliseconds
    expires_at?: string; // When token expires, Unix epoch in milliseconds
    starts_at?: string; // When token starts being valid, Unix epoch in milliseconds
    updated_at?: string; // When token was last updated, Unix epoch in milliseconds
    extra?: string; // anything extra the NFT wants to store on-chain. Can be stringified JSON.
    reference?: string; // URL to an off-chain JSON file with more info.
    reference_hash?: string; // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
  };  
  