import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.spacex.land/graphql/',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          launches: {
            merge(existing: any, incoming: any) {
              debugger;
              return existing ? existing.concat(incoming) : incoming;
            }
          }
        }
      }
    }
  })
});

setTimeout(() => {
  console.log(client.cache);
}, 4000)

const LAUNCHES_QUERY = gql`
  query Launches($offset: Int, $limit: Int) {
    launches(offset: $offset, limit: $limit) {
      id
      mission_name
    }
  }
`;

interface Launch {
  id: number;
  mission_name: string;
}

function LaunchComponent({ launch }: { launch: Launch }) {
  return (
    <li>{launch.mission_name}</li>
  );
}

function LaunchesComponent() {
  const { loading, data, fetchMore } = useQuery<{ launches: Launch[] }>(
    LAUNCHES_QUERY,
    {
      variables: {
        offset: 0,
        limit: 10
      },
    });

  return (
    <div className="launches">
      <h1>Launches</h1>
      {
        loading
          ? <p>Loading ...</p>
          : (
            <ol>
              {
                data!.launches.map(launch =>
                  <LaunchComponent key={launch.id} launch={launch} />
                )
              }
            </ol>
          )
      }
      <button onClick={() => {
        fetchMore({
          variables: {
            offset: data!.launches.length,
          },
          updateQuery: (prev: any) => prev
        })
      }}>
        More
      </button>
    </div>
  );
}

ReactDOM.render(
  <ApolloProvider client={client}>
    <LaunchesComponent />
  </ApolloProvider>,
  document.getElementById('root')
);
