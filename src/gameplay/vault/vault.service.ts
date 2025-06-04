import { Injectable } from "@nestjs/common"
import { StaticService } from "../static"
import { ComputePaidAmountParams } from "./types"
import { roundNumber } from "@src/common"
@Injectable()
export class VaultService {
    constructor(
        private readonly staticService: StaticService
    ) {}
    
    public async computePaidAmount({
        vaultData,
        bulk,
    }: ComputePaidAmountParams) {
        const { tokenLocked } = vaultData
        const { maxPaidAmount, maxPaidPercentage } = bulk
        return roundNumber(Math.min(
            tokenLocked * maxPaidPercentage,
            maxPaidAmount
        ))
    }
}

