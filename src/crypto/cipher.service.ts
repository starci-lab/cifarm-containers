import { Injectable } from "@nestjs/common"
import { envConfig } from "@src/env"
import * as crypto from "crypto"

@Injectable()
export class CipherService {
    private readonly algorithm = "aes-256-cbc"
    private readonly key = crypto
        .createHash("sha256")
        .update(envConfig().crypto.cipher.secret)
        .digest() // 32 bytes for aes-256

    encrypt(plainText: string, iv: Buffer): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
        let encrypted = cipher.update(plainText, "utf8", "base64")
        encrypted += cipher.final("base64")
        return encrypted
    }

    decrypt(cipherText: string, iv: Buffer): string {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
        let decrypted = decipher.update(cipherText, "base64", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted
    }
}
