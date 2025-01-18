import { ApiProperty } from "@nestjs/swagger"

export class DeviceInfo {
    @ApiProperty({ example: "other", description: "Device type" })
        device: string
    @ApiProperty({ example: "Windows 10", description: "Operating system" })
        os: string
    @ApiProperty({ example: "Chrome", description: "Browser" })
        browser: string
    @ApiProperty({ example: "192.168.1.1", description: "IPv4 address" })
        ipV4: string
}

export interface RequestWithDeviceInfo {
    deviceInfo?: DeviceInfo
}