import { Injectable, Logger } from "@nestjs/common"
import { decodeAddress, encodeAddress } from "algosdk"
import { CID } from "multiformats/cid"
import { sha256 } from "multiformats/hashes/sha2"
import { digest } from "multiformats"
import axios from "axios"
import { NftMetadata } from "../common"

@Injectable()
export class IpfsService {
    private readonly logger = new Logger(IpfsService.name)
    
    constructor() {}

    //algorand only
    public algorandCidToReserve(cid: string) {
        const decoded = CID.parse(cid)
        const { version } = decoded
        
        const url = `template-ipfs://{ipfscid:${version}:dag-pb:reserve:sha2-256}`
        const reserveAddress = encodeAddress(
            Uint8Array.from(Buffer.from(decoded.multihash.digest))
        )
        return {
            url,
            reserveAddress,
        }
    }

    public algorandReserveAddressToCid(reserveAddress: string) {
        const { publicKey } = decodeAddress(reserveAddress)
        const mhdigest = digest.create(sha256.code, publicKey)
        return CID.createV0(mhdigest).toString()
    }

    public getCidUri(cid: string) {
        return  `https://violet-lazy-yak-333.mypinata.cloud/ipfs/${cid}`
    }

    async getCidContent(cid: string) : Promise<NftMetadata> {
        try {
            const uri = this.getCidUri(cid)
            const { data } = await axios.get(uri)
            return {
                ...data,
                properties: JSON.stringify(data.properties),
            }
        } catch (ex) {
            this.logger.error(ex)
            return {
                image: "",
                properties: "",
            }
        }
    }

    async getRawContent(uri: string) : Promise<NftMetadata> {
        try {
            const { data } = await axios.get(uri)
            return {
                ...data,
                properties: JSON.stringify(data.properties),
            }
        } catch (ex) {
            this.logger.error(ex)
            return {
                image: "",
                properties: "",
            }
        }
    }
}