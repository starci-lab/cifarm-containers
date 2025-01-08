import { AbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"

export { UserEntity as TelegramUserEntity }

export const telegramPostgreSqlEntities = () : Array<typeof AbstractEntity> => ([
    UserEntity,
])