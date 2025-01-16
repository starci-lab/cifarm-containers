import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, SessionEntity } from "@src/databases"
import { JwtService } from "@src/jwt"
import { DataSource } from "typeorm"
import { RefreshRequest, RefreshResponse } from "./refresh.dto"
import { GrpcInternalException, GrpcUnauthenticatedException } from "nestjs-grpc-exceptions"
import { createUtcDayjs } from "@src/common"

@Injectable()
export class RefreshService {
    private readonly logger = new Logger(RefreshService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService
    ) {}

    public async refresh({
        refreshToken,
        deviceInfo
    }: RefreshRequest): Promise<RefreshResponse> {
        //use destructuring to get device, os, browser from deviceInfo, even if deviceInfo is null
        const { device, os, browser, ipV4 } = { ...deviceInfo }

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        //Get session
        const session = await queryRunner.manager.findOne(SessionEntity, {
            where: {
                refreshToken: refreshToken
            }
        })
        if (!session) throw new GrpcUnauthenticatedException("Session not found")

        const { expiredAt, userId } = session
        //if current time is after the expired time, throw error that refresh token is expired
        if (createUtcDayjs().isAfter(expiredAt))
            throw new GrpcUnauthenticatedException("Refresh token is expired")

        const {
            accessToken,
            refreshToken: { token: newRefreshToken, expiredAt: newExpiredAt }
        } = await this.jwtService.generateAuthCredentials({
            id: userId
        })

        await queryRunner.startTransaction()
        try {
            await queryRunner.manager.save(SessionEntity, {
                expiredAt: newExpiredAt,
                refreshToken: newRefreshToken,
                userId,
                browser,
                os,
                device,
                ipV4
            })
            await queryRunner.commitTransaction()

            return {
                accessToken,
                refreshToken: newRefreshToken
            }
        } catch (error) {
            const errorMessage = `Transaction session creation failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        } finally {
            await queryRunner.release()
        }
    } 
}
