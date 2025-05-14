import { Injectable } from "@nestjs/common"
import { envConfig } from "@src/env"
import { PinataSDK } from "pinata"

@Injectable()
export class PinataService {
    public pinata: PinataSDK
    constructor() {
        this.pinata = new PinataSDK({
            pinataJwt: envConfig().pinata.jwtToken,
            pinataGateway: envConfig().pinata.gatewayUrl,
        })
    }

    public getUrl(cid: string): string {
        return `${this.pinata.config.pinataGateway}/ipfs/${cid}`
    }
}
