import { AbstractEntity } from "./abstract"
import { TelegramUserEntity } from "./user.entity"

export const telegramUserTrackerPostgreSqlEntites = () : Array<typeof AbstractEntity> => ([
    TelegramUserEntity,
])