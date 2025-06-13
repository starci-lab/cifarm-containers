import { Injectable } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { ClientSession, Connection } from "mongoose"
import { remove as removeDiacritics } from "diacritics"
import { Network } from "@src/env"
@Injectable()
export class UsernameService {
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
    ) { }
    // we try to make username with this formular
    public async sanitizeUsername({ usernameRaw, session, network }: SanitizeUsernameParams): Promise<string> {
        // we try to make name to become familiar & unique, max 20 characters
        // eg. Nguyen Van Tu Cuong => nguyenvantucuong
        // eg. Nhĩ Anh => nhianh
        // eg. Perter Pan => peterpan
        // if 2 people have the same name, we add a number to the end
        // eg. Peter Pan => peterpan1
        // eg. Peter Pan => peterpan2
        // eg. Peter Pan => peterpan3
        // eg. Peter Pan => peterpan4
        // eg. Peter Pan => peterpan5
        // eg. Peter Pan => peterpan6
        // in case last char is a number, we remove it
        // eg. Peter Pan1 => peterpan
        // eg. Peter Pan2 => peterpan1
        // eg. Peter Pan3 => peterpan2
        // eg. Peter Pan4 => peterpan3
        // eg. Peter Pan5 => peterpan4
        // eg. Peter Pan6 => peterpan5
        const baseUsername = removeDiacritics(usernameRaw)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "") // ⬅️ keep only a–z and 0–9
            .replace(/\d+$/, "")       // remove trailing digits
            .slice(0, 20)

        const REGEX_USERNAME = `^${baseUsername}(\\d+)?$`
        const users = await this.connection
            .model<UserSchema>(UserSchema.name)
            .find({ username: { $regex: REGEX_USERNAME }, network })
            .select("username")
            .session(session)
            .lean()
        if (users.length === 0) {
            return baseUsername
        }
        // Extract numbers from usernames and find the max
        const maxNumber = users
            .map(user => {
                const match = user.username.match(REGEX_USERNAME)
                return match && match[1] ? parseInt(match[1], 10) : 0
            })
            .reduce((max, n) => Math.max(max, n), 0)

        const maxNumberString = (maxNumber + 1).toString()
        return baseUsername.slice(0, 20 - maxNumberString.length) + maxNumberString
    }

    //check if username is sanitized
    public isUsernameSanitized({ username }: IsUsernameSanitizedParams): boolean {
        const SANITIZED_USERNAME_REGEX = /^[a-z0-9]+$/
        return SANITIZED_USERNAME_REGEX.test(username) && username.length <= 20
    }
}

export interface SanitizeUsernameParams {
    usernameRaw: string
    session?: ClientSession
    network: Network
}

export interface IsUsernameSanitizedParams {
    username: string
}