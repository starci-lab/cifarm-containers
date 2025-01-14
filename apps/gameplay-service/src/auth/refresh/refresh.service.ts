import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, SessionEntity } from "@src/databases"
import { JwtService } from "@src/jwt"
import { DataSource } from "typeorm"
import { RefreshRequest, RefreshResponse } from "./refresh.dto"
import {
    GrpcInternalException,
    GrpcUnauthenticatedException
} from "nestjs-grpc-exceptions"
import { createUtcDayjs } from "@src/common"

@Injectable()
export class RefreshService {
    private readonly logger = new Logger(RefreshService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService
    ) {}

    public async refresh(request: RefreshRequest): Promise<RefreshResponse> {
        const { refreshToken } = request

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        //Get session
        const session = await queryRunner.manager.findOne(SessionEntity, {
            where: {
                token: refreshToken
            }
        })
        if (!session) throw new GrpcUnauthenticatedException("Session not found")

        const { expiredAt, userId } = session
        if (!createUtcDayjs().isAfter(expiredAt))
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
                token: newRefreshToken,
                userId
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
