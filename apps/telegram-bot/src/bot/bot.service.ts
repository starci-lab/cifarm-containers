import { Injectable, OnModuleInit } from "@nestjs/common"
import { OnEventLeaderElected, OnEventLeaderLost } from "@src/kubernetes"
import { InjectTelegraf } from "@src/telegraf/telegraf.decorators"
import { readFileSync } from "fs"
import { join } from "path"
import { Telegraf } from "telegraf"

@Injectable()
export class BotService implements OnModuleInit {
    private isLeader = false
    
    constructor(
        @InjectTelegraf()
        private readonly telegraf: Telegraf
    ) {}

    @OnEventLeaderElected()
    handleLeaderElected() {
        this.isLeader = true
    }

    @OnEventLeaderLost()
    handleLeaderLost() {
        this.isLeader = false
    }
        
    onModuleInit() {
        if (!this.isLeader) {
            return
        }
        this.initializeCommands()
    }

    private async initializeCommands() {
        this.telegraf.start(async (ctx) => {
            const photoPath = join(__dirname, "assets", "cifarm-background.png")
            try {
                const photo = readFileSync(photoPath)
                const caption = "🌾 Cifarm: Farm-to-earn on Telegram! 🌾\n Farm, help, visit, and even steal from other players while earning airdropped tokens! 💰\n\n🚀 Free to play & packed with rewards! Unlock the potential of multichain gaming with Cifarm. 🌱✨\n👉 Start playing now and grow your farm!\n"

                await ctx.replyWithPhoto(
                    { source: photo },
                    {
                        caption,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Play Cifarm", url: "https://cifarm.io" }],
                            ]
                        }
                    }
                )
            } catch (error) {
                console.error("Error sending photo:", error)
                ctx.reply("An error occurred while processing your request.")
            }
        })

        process.once("SIGINT", () => this.telegraf.stop("SIGINT"))
        process.once("SIGTERM", () => this.telegraf.stop("SIGTERM"))

        await this.telegraf.launch()
    }
}
