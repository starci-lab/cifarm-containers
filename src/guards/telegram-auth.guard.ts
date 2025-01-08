import { TelegramAuthorizationFailedException } from "@src/exceptions"
import { CanActivate, ExecutionContext, Logger } from "@nestjs/common"
import { validate, parse } from "@telegram-apps/init-data-node"
import { Observable } from "rxjs"
import { envConfig } from "@src/env"

export interface TelegramData {
    userId: number
    username: string
}

export enum BotType {
    Ciwallet = "ciwallet",
    Cifarm = "cifarm",
}

export const defaultBotType = BotType.Ciwallet

export class TelegramAuthorizationGuard implements CanActivate {
    private readonly logger = new Logger(TelegramAuthorizationGuard.name)

    validateToken(authData: string, botType?: BotType) {
        botType = botType || BotType.Ciwallet

        const botTokenMap = {
            [BotType.Cifarm]: envConfig().secrets.telegram.botTokens.cifarm,
        }
 
        if (botTokenMap[botType] === undefined) {
            this.logger.error("Bot type not found")
            throw new TelegramAuthorizationFailedException("Bot type not found")
        }
        try {
            validate(authData, botTokenMap[botType], {
                expiresIn: 3600,
            })
        } catch (ex) {
            this.logger.error(ex.toString())
            throw new TelegramAuthorizationFailedException(`${ex.toString()}`)
        }
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        const [authType, authData = ""] =
      (request.headers["authorization"]  || "").split(" ")
        const botType = request.headers["bot-type"] || defaultBotType
        console.log(botType)
        console.log(request.headers)
        
        switch (authType) { 
        case "tma": {
            const [mockAuthorization, mockUserId = ""] = authData.split(",")
            if (mockAuthorization === envConfig().secrets.telegram.mockAuthorization) {
                const telegramData: TelegramData = {
                    userId: mockUserId ? Number(mockUserId) : 123456789,
                    username: "test"
                }
                request.telegramData = telegramData
                return true
            }
            this.validateToken(authData, botType)
            // Parse init data. We will surely need it in the future.

            const parsed = parse(authData)
            const telegramData: TelegramData = {
                userId: parsed.user.id,
                username: parsed.user.username,
            }

            request.telegramData = telegramData
            return true
        }
        default: {
            this.logger.error("Authorization data not found")
            throw new TelegramAuthorizationFailedException("Authorization data not found")
        }
        }
    }
}
