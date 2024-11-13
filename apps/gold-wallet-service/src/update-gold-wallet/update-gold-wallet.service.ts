import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { UserEntity } from "@src/database"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { DataSource } from "typeorm"

@Injectable()
export class UpdateGoldWalletService {
    private readonly logger = new Logger(UpdateGoldWalletService.name)

    constructor(private readonly dataSource: DataSource) {}

    public async getGoldBalance(userId: string): Promise<{ golds: number }> {
        const user = await this.findUserById(userId)
        return { golds: user.golds }
    }

    public async addGold(userId: string, goldAmount: number): Promise<{ message: string }> {
        if(goldAmount < 0) throw new RpcException("Gold amount must be positive")
        const user = await this.findUserById(userId)
        if(!user) throw new NotFoundException("User not found")
        user.golds += goldAmount
        await this.dataSource.manager.save(user)
        return { message: "Gold added successfully" }
    }

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
    // public async addToken(userId: string, tokenAmount: number): Promise<{ message: string }> {
    //     const user = await this.findUserById(userId)
    //     user.tokens += tokenAmount
    //     await this.dataSource.manager.save(user)
    //     return { message: "Tokens added successfully" }
    // }

    // // 5. Subtract tokens from the user wallet
    // public async subtractToken(userId: string, tokenAmount: number): Promise<{ message: string }> {
    //     const user = await this.findUserById(userId)
    //     if (user.tokens < tokenAmount) throw new RpcException("Insufficient token balance")
    //     user.tokens -= tokenAmount
    //     await this.dataSource.manager.save(user)
    //     return { message: "Tokens subtracted successfully" }
    // }

    private async findUserById(userId: string): Promise<UserEntity> {
        const user = await this.dataSource.manager.findOne(UserEntity, { where: { id: userId } })
        if (!user) throw new GrpcNotFoundException("User not found")
        return user
    }
}
