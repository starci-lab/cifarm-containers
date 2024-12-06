import { ApiProperty } from "@nestjs/swagger"

export class DoHealthcheckResponse {
    @ApiProperty({ example: "hello world" })
        message: string
}
