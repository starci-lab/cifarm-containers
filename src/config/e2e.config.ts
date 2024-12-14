import axios, { Axios } from "axios"
import { io, Socket } from "socket.io-client"
import { envConfig } from "./env.config"

export const authAxios = (): Axios => axios.create({
    baseURL: `http://localhost:${envConfig().containers.restApiGateway.port}/auth`
})

export const gameplayAxios = (accessToken: string): Axios => {
    const gameplayAxios = axios.create({
        baseURL: `http://localhost:${envConfig().containers.restApiGateway.port}/gameplay`
    })
    gameplayAxios.interceptors.request.use((config) => {
        config.headers["Authorization"] = `Bearer ${accessToken}`
        return config
    })
    return gameplayAxios
}

export const socket = (url: string): Socket  => io(url) 
