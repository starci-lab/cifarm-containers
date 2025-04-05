import { InputType, Field, ObjectType, registerEnumType } from "@nestjs/graphql"
import { createFirstCharLowerCaseEnumType } from "@src/common"
import { IResponseLike, ResponseLike } from "@src/graphql"
import { IsString } from "class-validator"

@InputType({
    description: "Get Solana Metaplex NFT status request"
})
export class GetSolanaMetaplexNFTRequest {
    @Field(() => String, {
        description: "NFT address"
    })
    @IsString()
        nftAddress: string
}

export enum MetaplexNFTStatus {
    Available = "Available",
    Wrapped = "Wrapped",
    Used = "Used"
}

export const FirstCharLowerCaseMetaplexNFTStatus =
    createFirstCharLowerCaseEnumType(MetaplexNFTStatus)

registerEnumType(FirstCharLowerCaseMetaplexNFTStatus, {
    name: "MetaplexNFTStatus",
    description: "The current chain key",
    valuesMap: {
        [MetaplexNFTStatus.Available]: {
            description: "Available"
        },
        [MetaplexNFTStatus.Wrapped]: {
            description: "Wrapped"
        },
        [MetaplexNFTStatus.Used]: {
            description: "Used"
        }
    }
})

@ObjectType({
    description: "Get Solana Metaplex NFT response data"
})
export class GetSolanaMetaplexNFTResponseData {
    @Field(() => FirstCharLowerCaseMetaplexNFTStatus, {
        description: "NFT status"
    })
        status: MetaplexNFTStatus
}

@ObjectType({
    description: "Get Solana Metaplex NFT status response"
})
export class GetSolanaMetaplexNFTResponse extends ResponseLike implements IResponseLike<GetSolanaMetaplexNFTResponseData> {
    @Field(() => GetSolanaMetaplexNFTResponseData, {
        description: "Solana Metaplex NFT status"
    })
        data: GetSolanaMetaplexNFTResponseData
}
