import { Injectable, Logger } from "@nestjs/common"
import { MintParams, MintResult, _mint } from "./mint.token"
import { TransactionExecutionException } from "@src/exceptions"

@Injectable()
export class BlockchainTokenService {
    private readonly logger = new Logger(BlockchainTokenService.name)
    constructor() {}

    public async mint(params: MintParams): Promise<MintResult> {
        try {
            return await _mint(params)
        } catch (ex) {
            this.logger.error(ex)
            throw new TransactionExecutionException(ex)
        } 
    }
}   