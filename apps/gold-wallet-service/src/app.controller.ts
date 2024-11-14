import { Controller, Logger } from "@nestjs/common"
import { goldWalletGrpcConstants } from "./constants"
import { GrpcMethod } from "@nestjs/microservices"
import { UpdateGoldWalletService } from "./update-gold-wallet"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(private readonly goldWalletService: UpdateGoldWalletService) {}

    @GrpcMethod(goldWalletGrpcConstants.SERVICE, "GetGoldBalance")
    public async getBalance(request: { userId: string }) {
        return this.goldWalletService.getGoldBalance(request.userId)
    }

    @GrpcMethod(goldWalletGrpcConstants.SERVICE, "AddGold")
    public async addGold(request: { userId: string; goldAmount: number }) {
        return this.goldWalletService.addGold(request.userId, request.goldAmount)
    }

    @GrpcMethod(goldWalletGrpcConstants.SERVICE, "SubtractGold")
    public async subtractGold(request: { userId: string; goldAmount: number }) {
        return this.goldWalletService.subtractGold(request.userId, request.goldAmount)
    }

    // @GrpcMethod(goldWalletGrpcConstants.SERVICE, "AddToken")
    // public async addToken(request: { userId: string; tokenAmount: number }) {
    //     return this.goldWalletService.addToken(request.userId, request.tokenAmount)
    // }

    // @GrpcMethod(goldWalletGrpcConstants.SERVICE, "SubtractToken")
    // public async subtractToken(request: { userId: string; tokenAmount: number }) {
    //     return this.goldWalletService.subtractToken(request.userId, request.tokenAmount)
    // }
}
