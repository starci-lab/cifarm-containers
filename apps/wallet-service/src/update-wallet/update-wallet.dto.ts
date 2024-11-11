import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsOptional, IsNumber, IsUUID } from "class-validator"

export class UpdateWalletRequest {
    @IsUUID()
    @ApiProperty({ example: "5a6919c3-6ae3-45de-81eb-f1bbb05a246d", description: "User ID of the wallet owner" })
        userId?: string

    @IsInt()
    @IsOptional()
    @ApiProperty({ example: 100, description: "Amount of gold to update" })
        goldAmount?: number

    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 10.5, description: "Amount of tokens to update" })
        tokenAmount?: number
}


export class UpdateWalletResponse {
    @ApiProperty({ example: "Wallet updated successfully" })
        message: string
}
