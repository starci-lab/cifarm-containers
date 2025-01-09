export interface GraphqlGatewayOptions {
    subgraphs: Array<SubgraphUrl>
}

export interface SubgraphUrl {
    name: string
    url: string
}