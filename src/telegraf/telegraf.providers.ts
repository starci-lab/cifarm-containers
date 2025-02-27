import { Provider } from "@nestjs/common"
import { envConfig } from "@src/env"
import { TELEGRAF } from "./telegraf.constants"
import { Telegraf } from "telegraf"

export const createTelegrafFactoryProvider = (): Provider => ({
    provide: TELEGRAF,
    useFactory: (): Telegraf => {
        return new Telegraf(envConfig().telegram.main.botToken)
    }
})
