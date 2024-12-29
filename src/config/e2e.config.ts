import axios, { Axios } from "axios"
import { io, Socket } from "socket.io-client"
import { envConfig } from "./env/env.config"

export const authAxios = (version: string): Axios => axios.create({
    baseURL: `http://localhost:${envConfig().containers.restApiGateway.port}/${version}/gameplay`
})

export const gameplayAxios = (version: string, accessToken: string): Axios => {
    const gameplayAxios = axios.create({
        baseURL: `http://localhost:${envConfig().containers.restApiGateway.port}/${version}/gameplay`
    })
    gameplayAxios.interceptors.request.use((config) => {
        config.headers["Authorization"] = `Bearer ${accessToken}`
        return config
    })
    return gameplayAxios
}

export const socket = (url: string): Socket  => io(url) 
