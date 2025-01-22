import { getHttpUrl } from "@src/common"
import { ApiVersion } from "../../infra.types"
import { envConfig } from "@src/env"

export const ACCESS_TOKEN = "ACCESS_TOKEN"
export const REFRESH_TOKEN = "REFRESH_TOKEN"

export const urlMap: Record<ApiVersion, string> = {
    [ApiVersion.V1]: getHttpUrl({
        host: envConfig().containers.restApiGateway.host,
        port: envConfig().containers.restApiGateway.port,
        path: `api/${ApiVersion.V1}/gameplay`
    }),
    [ApiVersion.V2]: getHttpUrl({
        host: envConfig().containers.restApiGateway.host,
        port: envConfig().containers.restApiGateway.port,
        path: `api/${ApiVersion.V2}/gameplay`
    })
}
