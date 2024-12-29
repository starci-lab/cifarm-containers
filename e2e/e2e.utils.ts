import axios, { Axios } from "axios"
import { io, Socket } from "socket.io-client"
import { envConfig } from "@src/env"

interface AxiosConfig {
  version: string;
  accessToken?: string;
}

export type AxiosConfigType = "no-auth" | "with-auth"

export const createAxios = (type: AxiosConfigType, config: AxiosConfig): Axios => {
    const { version, accessToken } = config
    const baseURL = `http://localhost:${envConfig().containers.restApiGateway.port}/${version}/gameplay`

    switch (type) {
    case "no-auth":
        return axios.create({
            baseURL,
        })

    case "with-auth":
        // eslint-disable-next-line no-case-declarations
        const gameplayAxios = axios.create({
            baseURL,
        })
        gameplayAxios.interceptors.request.use((config) => {
            if (accessToken) {
                config.headers["Authorization"] = `Bearer ${accessToken}`
            }
            return config
        })
        return gameplayAxios

    default:
        throw new Error("Invalid Axios type")
    }
}


export const socket = (url: string): Socket  => io(url) 
