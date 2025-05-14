import { Injectable } from "@nestjs/common"

@Injectable()
export class SerializationService {

    // Method to serialize object to Base64
    serializeToBase64<T>(obj: T): string {
        const json = JSON.stringify(obj) // Step 1: Serialize to JSON string
        return Buffer.from(json, "utf8").toString("base64") // Step 2: Encode to Base64
    }

    // Method to deserialize from Base64 back to object
    deserializeFromBase64<T>(base64: string): T {
        const json = Buffer.from(base64, "base64").toString("utf8") // Decode from Base64
        return JSON.parse(json) as T // Parse back to object
    }

    // Method to serialize object to JSON string
    serializeToJSON<T>(obj: T): string {
        return JSON.stringify(obj) // Serialize to JSON string
    }

    // Method to deserialize from JSON back to object
    deserializeFromJSON<T>(json: string): T {
        return JSON.parse(json) as T // Parse back to object
    }

    // Generic method to serialize object using any encoding format
    serialize<T>(obj: T, format: "base64" | "json"): string {
        switch (format) {
        case "base64":
            return this.serializeToBase64(obj)
        case "json":
            return this.serializeToJSON(obj)
        default:
            throw new Error(`Unsupported format: ${format}`)
        }
    }

    // Generic method to deserialize using any encoding format
    deserialize<T>(data: string, format: "base64" | "json"): T {
        switch (format) {
        case "base64":
            return this.deserializeFromBase64(data)
        case "json":
            return this.deserializeFromJSON(data)
        default:
            throw new Error(`Unsupported format: ${format}`)
        }
    }
}
