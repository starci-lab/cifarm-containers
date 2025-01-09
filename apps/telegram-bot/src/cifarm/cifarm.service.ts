import { Injectable, OnModuleInit } from "@nestjs/common"
import { InjectPostgreSQL, TelegramUserEntity } from "@src/databases"
import { envConfig, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { readFileSync } from "fs"
import { join } from "path"
import { Telegraf } from "telegraf"
import { DataSource } from "typeorm"

@Injectable()
export class CiFarmService implements OnModuleInit {
    private bot: Telegraf

    
        
    constructor(
        @InjectPostgreSQL({
            context:  PostgreSQLContext.Main,
            database: PostgreSQLDatabase.Telegram
        })
        private readonly dataSource: DataSource
    ) {
    }

    onModuleInit() {
        this.bot = new Telegraf(envConfig().secrets.telegram.botTokens.cifarm)
        this.initializeCommands()
    }

    private initializeCommands() {
        this.bot.start(async (ctx) => {
            const photoPath = join(__dirname, "assets", "cifarm-background.png")
            const telegramId = ctx.from?.id.toString() || ""
            const username = ctx.from?.username || "Unknown"

            // Save user info to the database
            await this.saveUserInfo(telegramId, username)

            const totalFarmers = await this.getTotalFarmers()

            try {
                const photo = readFileSync(photoPath)
                const caption = `🌾 Cifarm: Farm-to-earn on Telegram! 🌾\nStep into the first multichain farming game on Telegram, powered by Ciwallet and Wormhole. Farm, help, visit, and even steal from other players while earning airdropped tokens! 💰\n\n🚀 Free to play & packed with rewards! Unlock the potential of multichain gaming with Cifarm. 🌱✨\n👉 Start playing now and grow your farm!\n👩‍🌾 Total farmers: ${totalFarmers}`

                await ctx.replyWithPhoto(
                    { source: photo },
                    {
                        caption,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Play Cifarm", url: "https://t.me/cifarm_bot" }],
                            ],
                        },
                    }
                )
            } catch (error) {
                console.error("Error sending photo:", error)
                ctx.reply("An error occurred while processing your request.")
            }
        })

        process.once("SIGINT", () => this.bot.stop("SIGINT"))
        process.once("SIGTERM", () => this.bot.stop("SIGTERM"))

        this.bot.launch()
    }

    private async saveUserInfo(telegramId: string, username: string): Promise<void> {
        try {
            const existingUser = await this.dataSource.manager.findOne(TelegramUserEntity, { 
                where: { telegramId }
            })
            if (!existingUser) {
                await this.dataSource.manager.save(TelegramUserEntity, { telegramId, username })
            }
        } catch (error) {
            console.error("Error saving user info:", error)
        }
    }

    private async getTotalFarmers(): Promise<number> {
        try {
            const totalFarmers = await this.dataSource.manager.count(TelegramUserEntity)
            return totalFarmers
        } catch (error) {
            console.error("Error fetching total farmers count:", error)
            return 0
        }
    }
}
