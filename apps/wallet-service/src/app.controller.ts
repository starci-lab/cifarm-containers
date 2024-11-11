import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { walletGrpcConstants } from "./constants"
import { UpdateWalletRequest, UpdateWalletService } from "./update-wallet"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
        private readonly updateWalletService: UpdateWalletService
    ) {}

    // @ApiBearerAuth()
    // @UseGuards(RestJwtAuthGuard)
    @GrpcMethod(walletGrpcConstants.SERVICE, "UpdateWallet")
    public async requestMessage(request: UpdateWalletRequest) {
        return this.updateWalletService.updateWallet(request)
    }
}
