import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { envConfig } from "@src/env"
import { InjectTelegraf } from "@src/telegraf"
import { readFileSync } from "fs"
import { join } from "path"
import { Telegraf } from "telegraf"

@Injectable()
export class BotService implements OnModuleInit {
    private readonly logger = new Logger(BotService.name)

    constructor(
        @InjectTelegraf()
        private readonly telegraf: Telegraf
    ) {}

    onModuleInit() {
        this.launch()
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
                    "🌾 Cifarm: The first GameFi x DeFi concept. Farm, steal, earn, and use $CARROT to enter our DeFi ecosystem. Start playing now and earn big rewards!"

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
