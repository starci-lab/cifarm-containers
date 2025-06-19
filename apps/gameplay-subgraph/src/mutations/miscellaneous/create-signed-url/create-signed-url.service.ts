import { Injectable, Logger } from "@nestjs/common"
import { CreateSignedUrlResponse, CreateSignedUrlRequest } from "./create-signed-url.dto"
import { S3Service } from "@src/s3"

@Injectable()
export class CreateSignedUrlService {
    private readonly logger = new Logger(CreateSignedUrlService.name)

    constructor(
        private readonly s3Service: S3Service,
    ) {}

    async createSignedUrl(
        { key }: CreateSignedUrlRequest
    ): Promise<CreateSignedUrlResponse> {
        try {
            const signedUrl = await this.s3Service.getSignedUrl(key)
            return {
                success: true,
                message: "Create signed URL successfully",
                data: {
                    signedUrl
                }
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}