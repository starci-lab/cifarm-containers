import { Injectable } from "@nestjs/common"
import { StaticService } from "../static"
import { ComputePaidAmountParams } from "./types"
import { roundNumber } from "@src/common"
import { TokenVaultData } from "@src/databases"
@Injectable()
export class VaultService {
    constructor(
        private readonly staticService: StaticService
    ) {}
    
    public async computePaidAmount({
        network,
        chainKey,
        vaultInfoData
    }: ComputePaidAmountParams) {
        const { maxPaidAmount, vaultPaidPercentage } = this.staticService.tokenVaults[
            chainKey
        ][network] as TokenVaultData
        return Math.min(
            vaultInfoData.currentMaxPaidAmount ?? maxPaidAmount,
            roundNumber(vaultInfoData.tokenLocked * vaultPaidPercentage)
        )
    }
}

