import { Inject, Injectable } from "@nestjs/common"
import {
    GetObjectCommand,
    ObjectCannedACL as S3ObjectCannedACL,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3"
import { envConfig } from "@src/env"
import { MODULE_OPTIONS_TOKEN } from "./s3.module-definition"
import { S3Options, S3Provider } from "./types"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createEnumType } from "@src/common"
import { registerEnumType } from "@nestjs/graphql"

@Injectable()
export class S3Service {
    private readonly s3: S3Client
    private readonly provider: S3Provider
    private readonly spaceEndpoint: string
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: S3Options
    ) {
        this.provider = options.provider ?? S3Provider.DigitalOcean1
        const split = envConfig().s3[this.provider].endpoint.split("//")
        this.spaceEndpoint = `${split[0]}//${envConfig().s3[this.provider].bucketName}.${split[1]}`
        this.s3 = new S3Client({
            endpoint: envConfig().s3[this.provider].endpoint,
            region: envConfig().s3[this.provider].region,
            forcePathStyle: false,
            credentials: {
                accessKeyId: envConfig().s3[this.provider].accessKeyId,
                secretAccessKey: envConfig().s3[this.provider].secretAccessKey
            }
        })
    }

    public async uploadJson<T>(key: string, json: T): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: envConfig().s3[this.provider].bucketName,
            Key: key,
            Body: JSON.stringify(json),
            ACL: "public-read",
            ContentType: "application/json"
        })
        await this.s3.send(command)
        return `${this.spaceEndpoint}/${key}`
    }

    public async getJson<T>(key: string): Promise<S3Json<T>> {
        const command = new GetObjectCommand({
            Bucket: envConfig().s3[this.provider].bucketName,
            Key: key
        })
        const response = await this.s3.send(command)
        const data = await response.Body?.transformToString()
        return new S3Json(JSON.parse(data.toString()), key, this)
    }

    public async getSignedUrl({
        key,
        contentType = "image/png",
        acl = ObjectCannedACL.PublicRead
    }: GetSignedUrlParams): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: envConfig().s3[this.provider].bucketName,
            Key: key,
            ACL: getObjectCannedACL(acl),
            ContentType: contentType
        })

        return await getSignedUrl(this.s3, command, {
            expiresIn: envConfig().s3[this.provider].expiresIn
        })
    }

    public getSignedUrlExpiresIn(): number {
        return envConfig().s3[this.provider].expiresIn
    }
}

export class S3Json<T> {
    constructor(
        public data: T,
        private readonly key: string,
        private readonly s3Service: S3Service
    ) {}
    public async save(): Promise<void> {
        await this.s3Service.uploadJson(this.key, this.data)
    }
}

export interface GetSignedUrlParams {
    key: string
    contentType?: string
    acl?: ObjectCannedACL
}

export enum ObjectCannedACL {
    PublicRead = "publicRead",
    Private = "private",
    PublicReadWrite = "publicReadWrite",
    AuthenticatedRead = "authenticatedRead",
    BucketOwnerRead = "bucketOwnerRead"
}

export const GraphQLTypeObjectCannedACL = createEnumType(ObjectCannedACL)

registerEnumType(GraphQLTypeObjectCannedACL, {
    name: "ObjectCannedACL",
    description: "The canned acl of the file",
    valuesMap: {
        [ObjectCannedACL.PublicRead]: {
            description: "The public read acl of the file"
        },
        [ObjectCannedACL.Private]: {
            description: "The private acl of the file"
        },
        [ObjectCannedACL.PublicReadWrite]: {
            description: "The public read write acl of the file"
        },
        [ObjectCannedACL.AuthenticatedRead]: {
            description: "The authenticated read acl of the file"
        },
        [ObjectCannedACL.BucketOwnerRead]: {
            description: "The bucket owner read acl of the file"
        }
    }
})

export const getObjectCannedACL = (acl: ObjectCannedACL): S3ObjectCannedACL => {
    const map: Record<ObjectCannedACL, S3ObjectCannedACL> = {
        [ObjectCannedACL.PublicRead]: "public-read",
        [ObjectCannedACL.Private]: "private",
        [ObjectCannedACL.PublicReadWrite]: "public-read-write",
        [ObjectCannedACL.AuthenticatedRead]: "authenticated-read",
        [ObjectCannedACL.BucketOwnerRead]: "bucket-owner-read"
    }
    return map[acl]
}