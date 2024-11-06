import { HttpStatus } from "@nestjs/common"
import { ApiProperty } from "@nestjs/swagger"

export interface ITransformedSuccessResponse<Data>  
{
    data: Data;
    status: HttpStatus;
    message: string;
} 

export class TransformedSuccessResponse<Data> implements ITransformedSuccessResponse<Data> {
    data: Data

    @ApiProperty({ 
        example: HttpStatus.OK
    })
        status: HttpStatus

    @ApiProperty({
        example: "Success"
    })
        message: string
}