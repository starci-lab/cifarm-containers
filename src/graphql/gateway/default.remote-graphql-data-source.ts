import { RemoteGraphQLDataSource } from "@apollo/gateway"

export class DefaultRemoteGraphQLDataSource extends RemoteGraphQLDataSource  {
    // add headers to the request to the subgraph
    willSendRequest({ request, context }) {
        // Pass the auth token from the context to each subgraph
        // as a header called `authorization`
        const token = context.req?.headers?.authorization
        if (token) {
            request.http.headers.set("authorization", token)
        }
        // set the ip address of the client
        const ip = context.req?.headers?.["x-forwarded-for"]
        console.log(context.req?.headers)
        if (ip) {
            request.http.headers.set("x-forwarded-for", ip)
        }
    }
}