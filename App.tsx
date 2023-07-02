import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {ApolloClient, InMemoryCache, ApolloProvider, gql} from '@apollo/client';

const GITHUB_API_ENDPOINT = 'https://api.github.com/graphql';
const GITHUB_API_TOKEN = '<YOUR_GITHUB_API_TOKEN>';

const client = new ApolloClient({
  uri: GITHUB_API_ENDPOINT,
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${GITHUB_API_TOKEN}`,
  },
});

const GET_REPOSITORIES_QUERY = gql`
  query GetUserRepositories($username: String!) {
    user(login: $username) {
      repositories(first: 10) {
        edges {
          node {
            name
          }
        }
      }
    }
  }
`;

interface RepositoryEdge {
  node: {
    name: string;
  };
}

interface UserRepositoriesData {
  user: {
    repositories: {
      edges: RepositoryEdge[];
    };
  };
}

const RepositoryList: React.FC<{username: string}> = ({username}) => {
  const [repositories, setRepositories] = useState<RepositoryEdge[]>([]);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const {data} = await client.query<UserRepositoriesData>({
          query: GET_REPOSITORIES_QUERY,
          variables: {username},
        });

        setRepositories(data.user.repositories.edges);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    fetchRepositories();
  }, [username]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repositories for {username}:</Text>
      <FlatList
        data={repositories}
        keyExtractor={item => item.node.name}
        renderItem={({item}) => (
          <Text style={styles.repository}>{item.node.name}</Text>
        )}
      />
    </View>
  );
};

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <RepositoryList username="your-github-username" />
    </ApolloProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  repository: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default App;
