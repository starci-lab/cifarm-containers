import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { envConfig } from "@src/env"
import { OnEventLeaderElected, OnEventLeaderLost } from "@src/kubernetes"
import { InjectTelegraf } from "@src/telegraf/telegraf.decorators"
import { readFileSync } from "fs"
import { join } from "path"
import { Telegraf } from "telegraf"

@Injectable()
export class BotService implements OnModuleInit {
    private readonly logger = new Logger(BotService.name)
    private isLeader = false
    constructor(
        @InjectTelegraf()
        private readonly telegraf: Telegraf
    ) {}

    onModuleInit() {
        this.launch()
    }

    @OnEventLeaderElected()
    handleLeaderElected() {
        this.isLeader = true
    }

    @OnEventLeaderLost()
    handleLeaderLost() {
        //this.stop()
        //this.isLeader = false
    }

    private async launch() {
        this.registerStartMiddleware()
        this.logger.verbose("Bot prepared. Launching...")
        await this.telegraf.launch()
    }

    private registerStartMiddleware() {
        this.telegraf.start(async (ctx) => {
            const photoPath = join(__dirname, "assets", "cifarm-background.png")
            try {
                const photo = readFileSync(photoPath)
                const caption =
                    "🌾 Cifarm: Farm-to-earn on Telegram! 🌾\n Farm, help, visit, and even steal from other players while earning airdropped tokens! 💰\n\n🚀 Free to play & packed with rewards! Unlock the potential of Solana gaming with Cifarm. 🌱✨\n👉 Start playing now and grow your farm!\n"

                await ctx.replyWithPhoto(
                    { source: photo },
                    {
                        caption,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "Play",
                                        web_app: {
                                            url: envConfig().telegram.main.miniappUrl
                                        }
                                    }
                                ]
                            ]
                        }
                    }
                )
            } catch (error) {
                console.error("Error sending photo:", error)
                ctx.reply("An error occurred while processing your request.")
            }
        })
    }

    async stop() {
        try {
            this.telegraf.stop()
        } catch (error) {
            this.logger.error("Error stopping bot:", error)
        }
    }
}
