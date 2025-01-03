import { Injectable } from "@nestjs/common"
import { createHash } from "crypto"

@Injectable()
export class Sha256Service {
    // Hashes the input data using SHA-256
    hash(data: string): string {
        // Create a SHA-256 hash from the data
        const hash = createHash("sha256")
        hash.update(data)
        return hash.digest("hex") // Return the hash in hexadecimal format
    }

    // Verifies if the provided data matches the hash
    verify(data: string, hash: string): boolean {
        // Hash the data again and compare it to the provided hash
        const dataHash = this.hash(data)
        return dataHash === hash
    }
}