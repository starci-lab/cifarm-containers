import { Injectable } from "@nestjs/common"
import { ComputePaidAmountParams } from "./types"
import { roundNumber } from "@src/common"
@Injectable()
export class VaultService {
    public async computePaidAmount({
        vaultData,
        bulk,
        bulkPaid
    }: ComputePaidAmountParams) {
        const { tokenLocked } = vaultData
        const { maxPaidAmount, maxPaidPercentage } = bulk
        return roundNumber(
            Math.min(
                tokenLocked * maxPaidPercentage,
                maxPaidAmount
            ) * (1 - bulkPaid.decrementPercentage)
        )
    }
}

