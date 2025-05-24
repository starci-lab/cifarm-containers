import { Injectable } from "@nestjs/common"
import { envConfig } from "@src/env"
import * as crypto from "crypto"

@Injectable()
export class CipherService {
    private readonly algorithm = "aes-256-cbc"
    private readonly key = crypto
        .pbkdf2Sync(envConfig().crypto.cipher.secret, "salt", 100000, 32, "sha256")

    encrypt(plainText: string, iv: Buffer): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
        let encrypted = cipher.update(plainText, "utf8", "base64")
        encrypted += cipher.final("base64")
        return encrypted
    }

    generateIv(string: string = ""): Buffer {
        // create hash vs pbkdf2
        return crypto.pbkdf2Sync(string, envConfig().crypto.cipher.ivSalt, 100000, 16, "sha256")
    }

    decrypt(cipherText: string, iv: Buffer): string {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
        let decrypted = decipher.update(cipherText, "base64", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted
    }
}
