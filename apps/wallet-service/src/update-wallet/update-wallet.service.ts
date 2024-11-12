import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { UserEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class UpdateWalletService {
    private readonly logger = new Logger(UpdateWalletService.name)

    constructor(private readonly dataSource: DataSource) {}

    // 1. Get balance of gold and tokens
    public async getBalance(userId: string): Promise<{ golds: number; tokens: number }> {
        const user = await this.findUserById(userId)
        return { golds: user.golds, tokens: user.tokens }
    }

    // 2. Add gold to the user wallet
    public async addGold(userId: string, goldAmount: number): Promise<{ message: string }> {
        if(goldAmount < 0) throw new RpcException("Gold amount must be positive")
        const user = await this.findUserById(userId)
        if(!user) throw new NotFoundException("User not found")
        user.golds += goldAmount
        await this.dataSource.manager.save(user)
        return { message: "Gold added successfully" }
    }

    // 3. Subtract gold from the user wallet
    public async subtractGold(userId: string, goldAmount: number): Promise<{ message: string }> {
        if(goldAmount < 0) throw new RpcException("Gold amount must be positive")
        const user = await this.findUserById(userId)
        if(!user) throw new NotFoundException("User not found")
        if (user.golds < goldAmount) throw new RpcException("Insufficient gold balance")
        user.golds -= goldAmount
        await this.dataSource.manager.save(user)
        return { message: "Gold subtracted successfully" }
    }

    // 4. Add tokens to the user wallet
    public async addToken(userId: string, tokenAmount: number): Promise<{ message: string }> {
        const user = await this.findUserById(userId)
        user.tokens += tokenAmount
        await this.dataSource.manager.save(user)
        return { message: "Tokens added successfully" }
    }

    // 5. Subtract tokens from the user wallet
    public async subtractToken(userId: string, tokenAmount: number): Promise<{ message: string }> {
        const user = await this.findUserById(userId)
        if (user.tokens < tokenAmount) throw new RpcException("Insufficient token balance")
        user.tokens -= tokenAmount
        await this.dataSource.manager.save(user)
        return { message: "Tokens subtracted successfully" }
    }

    private async findUserById(userId: string): Promise<UserEntity> {
        const user = await this.dataSource.manager.findOne(UserEntity, { where: { id: userId } })
        if (!user) throw new NotFoundException("User not found")
        return user
    }
}
