require('dotenv').config();
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    id: ID!
    username: String!
  }
  type Query {
    hello: String
    users: [User]
    user(id: ID!): User
  }
  type Mutation {
    createUser(username: String!): User
  }
`);

const users = [
  { id: '1', username: 'admin' },
  { id: '2', username: 'guest' }
];

const root = {
  hello: () => 'Hola desde GraphQL Homelab',
  users: () => users,
  user: ({ id }) => users.find(u => u.id === id),
  createUser: ({ username }) => {
    const newUser = { id: String(users.length + 1), username };
    users.push(newUser);
    return newUser;
  }
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`GraphQL corriendo en puerto ${PORT}`));
