import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { walletGrpcConstants } from "./constants"
import { UpdateWalletService } from "./update-wallet"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
        private readonly walletService: UpdateWalletService
    ) {}

    @GrpcMethod(walletGrpcConstants.SERVICE, "GetBalance")
    public async getBalance(request: { userId: string }) {
        return this.walletService.getBalance(request.userId)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "AddGold")
    public async addGold(request: { userId: string; goldAmount: number }) {
        return this.walletService.addGold(request.userId, request.goldAmount)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "SubtractGold")
    public async subtractGold(request: { userId: string; goldAmount: number }) {
        return this.walletService.subtractGold(request.userId, request.goldAmount)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "AddToken")
    public async addToken(request: { userId: string; tokenAmount: number }) {
        return this.walletService.addToken(request.userId, request.tokenAmount)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "SubtractToken")
    public async subtractToken(request: { userId: string; tokenAmount: number }) {
        return this.walletService.subtractToken(request.userId, request.tokenAmount)
    }
}
