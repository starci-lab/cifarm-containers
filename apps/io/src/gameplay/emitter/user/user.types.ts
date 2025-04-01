import { UserSchema } from "@src/databases"
import { DeepPartial } from "@src/common"

export interface SyncUserPayload {
    data: DeepPartial<UserSchema>
    userId: string
}

export interface UserSyncedMessage {
    data: DeepPartial<UserSchema>
}





