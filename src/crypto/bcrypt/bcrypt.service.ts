import { Injectable } from "@nestjs/common"
import { compare, hashSync } from "bcrypt"
@Injectable()
export class BcryptService {
    // hash a string with a salt or rounds
    public hash(data: string, saltOrRounds: string | number = 10) {
        return hashSync(data, saltOrRounds)
    }

    // compare a string with a hash
    public compare(data: string, hash: string) {
        return compare(data, hash)
    }
}