import { Injectable, OnModuleInit } from "@nestjs/common"
import { envConfig } from "src/env"
import { Telegraf } from "telegraf"

@Injectable()
export class CiWalletService implements OnModuleInit {
    private bot: Telegraf

    constructor() {}

    onModuleInit() {
        this.bot = new Telegraf(envConfig().telegramBots.ciWallet.token)
        this.initializeCommands()
    }

    private initializeCommands() {
        this.bot.start(async (ctx) => {
            const photoUrl =
        "https://violet-lazy-yak-333.mypinata.cloud/ipfs/QmRHnaFV6HPkggqEA7hHHJT8c3Sd1yG6NNcbFxdnjWVgkD"
            const chatId = ctx.chat?.id || 0

            try {
                const caption = "🎉 Introducing Ci Wallet — a Telegram-based cross-chain wallet that transforms cryptocurrency management by enabling you to send, receive, and swap assets across multiple blockchains directly within your Telegram app. With Ci Wallet, you can effortlessly handle a diverse range of cryptocurrencies in a familiar chat environment, making cross-chain transactions simpler and more secure than ever before."

                await ctx.replyWithPhoto(photoUrl, {
                    caption,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Open Ciwallet",
                                    url: envConfig().telegramBots.ciWallet.miniAppUrl,
                                },
                            ],
                        ],
                    },
                })

                console.log(`Message sent to chat ID: ${chatId}`)
            } catch (error) {
                console.error("Error sending photo:", error)
                ctx.reply("An error occurred while processing your request.")
            }
        })

        process.once("SIGINT", () => this.bot.stop("SIGINT"))
        process.once("SIGTERM", () => this.bot.stop("SIGTERM"))

        this.bot.launch()
    }
}
