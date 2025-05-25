import { Injectable } from "@nestjs/common"
import { envConfig } from "@src/env"
import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from "crypto"

@Injectable()
export class CipherService {
    private readonly algorithm: string
    private readonly key: Buffer

    constructor() {
        this.algorithm = "aes-256-cbc"
        this.key = pbkdf2Sync(envConfig().crypto.cipher.secret, "salt", 100000, 32, "sha256")
    }
    
    encrypt(plainText: string): string {
        const iv = randomBytes(16) // 16 bytes for AES-CBC
        const cipher = createCipheriv(this.algorithm, this.key, iv)
        let encrypted = cipher.update(plainText, "utf8", "base64")
        encrypted += cipher.final("base64")
    
        // Combine IV and encrypted text (base64-encode both)
        const ivBase64 = iv.toString("base64")
        return `${ivBase64}:${encrypted}`
    }
    
    decrypt(cipherText: string): string {
        // Split the IV and the encrypted content
        const [ivBase64, encrypted] = cipherText.split(":")
        if (!ivBase64 || !encrypted) {
            throw new Error("Invalid cipher text format")
        }
    
        const iv = Buffer.from(ivBase64, "base64")
        const decipher = createDecipheriv(this.algorithm, this.key, iv)
        let decrypted = decipher.update(encrypted, "base64", "utf8")
        decrypted += decipher.final("utf8")
        return decrypted
    }
}
