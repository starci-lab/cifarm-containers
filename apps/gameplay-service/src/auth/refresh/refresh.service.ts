import { Injectable, Logger } from "@nestjs/common"
import { GameplayPostgreSQLService, SessionEntity, UserEntity } from "@src/databases"
import { UserIsNotLoginException, UserNotFoundException, UserRefreshIsInvalidException } from "@src/exceptions"
import { JwtService } from "@src/jwt"
import { DataSource, DeepPartial } from "typeorm"
import { RefreshRequest, RefreshResponse } from "./refresh.dto"

@Injectable()
export class RefreshService {
    private readonly logger = new Logger(RefreshService.name)
    private readonly dataSource: DataSource

    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    private readonly jwtService: JwtService,
    // @Inject(CACHE_MANAGER)
    // private cacheManager: Cache
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    public async refresh(request: RefreshRequest): Promise<RefreshResponse> {
        const { refreshToken } = request

        //Get session
        const refreshTokenFromDb = await this.dataSource.manager.findOne(
            SessionEntity, {
                where: {
                    token: refreshToken
                }
            }
        )

        if(!refreshTokenFromDb) throw new UserIsNotLoginException()

        const payload = await this.jwtService.verifyToken(refreshToken)
        if (!payload || !payload.refresh) {
            throw new UserRefreshIsInvalidException(payload.id)
        }

        const userId = payload.id

        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: {
                id: userId
            },
            relations: {
                
            }
        })
        if (!user) {
            this.logger.warn(`User not found for ID: ${userId}`)
            throw new UserNotFoundException(userId)
        }

        const { accessToken, refreshToken: newRefreshToken } = await this.jwtService.generateAuthCredentials({
            id: user.id,
        })

        const userSession: DeepPartial<SessionEntity> = {
            ...refreshTokenFromDb,
            isActive: true,
            expiredAt: await this.jwtService.getExpiredAt(refreshToken),
            token: newRefreshToken,
            userId: user.id,
        }
        
        // Save session
        await this.dataSource.manager.save(SessionEntity, userSession)

        return {
            accessToken,
            refreshToken: newRefreshToken,
        }
    }
}
