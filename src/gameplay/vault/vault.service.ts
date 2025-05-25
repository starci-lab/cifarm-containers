import { Injectable } from "@nestjs/common"
import { StaticService } from "../static"
import { ComputePaidAmountParams } from "./types"
import { roundNumber } from "@src/common"
import { TokenVault } from "@src/databases"
@Injectable()
export class VaultService {
    constructor(
        private readonly staticService: StaticService
    ) {}
    
    public async computePaidAmount({
        vaultInfoData,
        network
    }: ComputePaidAmountParams) {
        const { maxPaidAmount, vaultPaidPercentage } = this.staticService.tokenVaults[network] as TokenVault
        return roundNumber(Math.min(
            vaultInfoData.currentMaxPaidAmount ?? maxPaidAmount,
            vaultInfoData.tokenLocked * vaultPaidPercentage
        ))
    }
}

