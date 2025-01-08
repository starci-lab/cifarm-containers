export interface GraphqlGatewayOptions {
    subgraphs: SubgraphUrl[]
}

export interface SubgraphUrl {
    name: string
    url: string
}