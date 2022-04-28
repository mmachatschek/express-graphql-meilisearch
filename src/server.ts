import { graphql } from "@graphql-ts/schema"
import type { ScalarType } from '@graphql-ts/schema'
import { 
    GraphQLSchema,
} from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'

import { MeiliSearch } from 'meilisearch'
import type { SearchResponse } from 'meilisearch'
import movies from './movies.json'

const client = new MeiliSearch({
  host: 'http://127.0.0.1:7700',
})

const index = client.index('movies')

// index.updateSettings({
//   filterableAttributes: ['genres'],
// })
// index.addDocuments(movies)

const JSONType: ScalarType<object> = graphql.scalar<object>(GraphQLJSON);

const SearchType = graphql.object<SearchResponse>()({
    name: 'Search',
    description: 'Some search',
    fields: {
        query: graphql.field({ 
            type: graphql.String,
        }),
        hits: graphql.field({ 
            type: JSONType,
        }),
        facetsDistribution: graphql.field({ 
            type: JSONType,
        }),
        offset: graphql.field({ 
            type: graphql.Int,
        }),
        limit: graphql.field({ 
            type: graphql.Int,
        }),
        nbHits: graphql.field({ 
            type: graphql.Int,
        }),
        exhaustiveNbHits: graphql.field({ 
            type: graphql.Boolean,
        }),
        exhaustiveFacetsCount: graphql.field({ 
            type: graphql.Boolean,
        }),
        processingTimeMs: graphql.field({ 
            type: graphql.Int,
        }),
    }
})

const RootQueryType = graphql.object()({
    name: 'Query',
    description: 'Root Query',
    fields: {
        search: graphql.field({
            type: SearchType,
            args: {
                q: graphql.arg({
                    type: graphql.String,
                    description: 'Query string (mandatory)',
                    defaultValue: null,
                }),
                offset: graphql.arg({
                    type: graphql.nonNull(graphql.Int),
                    description: 'Number of documents to skip. (any positive integer)',
                    defaultValue: 0,
                }),
                limit: graphql.arg({
                    type: graphql.nonNull(graphql.Int),
                    description: 'Maximum number of documents returned. (any positive integer)',
                    defaultValue: 20,
                }),
                filter: graphql.arg({
                    type: graphql.String,
                    description: 'Filter queries by an attribute\'s value',
                    defaultValue: null,
                }),
                facetsDistribution: graphql.arg({
                    type: graphql.list(graphql.String),
                    description: 'Display the count of matches per facet',
                    defaultValue: null,
                }),
                attributesToRetrieve: graphql.arg({
                    type: graphql.nonNull(graphql.list(graphql.String)),
                    description: 'Attributes to display in the returned documents',
                    defaultValue: ["*"],
                }),
                attributesToCrop: graphql.arg({
                    type: graphql.list(graphql.String),
                    description: 'Attributes whose values have to be cropped',
                    defaultValue: null,
                }),
                cropLength: graphql.arg({
                    type: graphql.nonNull(graphql.Int),
                    description: 'Maximum field value length. Positive integer',
                    defaultValue: 200,
                }),
                attributesToHighlight: graphql.arg({
                    type: graphql.list(graphql.String),
                    description: 'Highlight matching terms contained in an attribute',
                    defaultValue: null,
                }),
                matches: graphql.arg({
                    type: graphql.nonNull(graphql.Boolean),
                    description: 'Return matching terms location',
                    defaultValue: false,
                }),
                sort: graphql.arg({
                    type: graphql.String,
                    description: 'Sort search results by an attribute\'s value.  written as a comma-separated string',
                    defaultValue: null,
                })
            },
            resolve(_source, args) {
                return index.search(
                    args.q, /** @ts-ignore */
                    args
                )
            },
        }),

    }
})

const schema: GraphQLSchema = new GraphQLSchema({
    query: RootQueryType.graphQLType,
  })

const app = express()
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}))
app.listen(3000, () => {
    console.log('ready for requests! Started!!')
})