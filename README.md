# Simple-Auth

Simple auth aims to be a simple, highly configurable and secure self-hosted service that you can simply deploy and start using.

The minimal setup should be close to plug-and-play.

# How to use

You can run the service in two ways:

- Pull the git repo and run the service locally
- (Prefered) Pull the docker image and run along with your other services

In both cases you will need a database engine running somewhere

## Running locally

Pull the git repo and in a terminal window run the following commands:

## Installation

```bash
$ npm install
```
## Running the app

```bash
$ npm run start:prod
```
## Running with Docker

Ideally we want to have an image in Docker hub, but since we're still developing for now you need to pull the repo and build the image locally.

So firstly pull the repo and open a terminal window on that location.

Then run

```bash
docker build -t simple-auth .
```

Once the image is built you can run the service with the minum config like so:

```bash
docker run -p 5000:5000 -e DATABASE_HOST=<YOUR-HOST> -e DATABASE_NAME=<YOUR-DB-NAME> -e DATABASE_PASSWORD=<YOUR-DB-USER-PASSWORD> -e DATABASE_PORT=<YOUR-DATABASE-PORT> -e DATABASE_TYPE=postgres -e DATABASE_USERNAME=<YOUR-DB-USER> -e TOKEN_ENCRYPTION_KEY=<YOUR-ENCRYPTION-KEY> simple-auth:latest
```

Or if you're using docker-compose add the service to your docker-compose.yml

```yml
  auth:
    image: simple-auth:latest
    container_name: api
    ports:
      - "5000:5000"
    environment:
      DATABASE_HOST: <YOUR-HOST>
      DATABASE_NAME: <YOUR-DB-NAME>
      DATABASE_USERNAME: <YOUR-DB-USER>
      DATABASE_PASSWORD: <YOUR-DB-USER-PASSWORD>
      DATABASE_PORT: <YOUR-DATABASE-PORT>
      DATABASE_TYPE: postgres
      TOKEN_ENCRYPTION_KEY: <YOUR-ENCRYPTION-KEY>
```

These are the minimum configurations to run the service. After it is up you should be able to access the available endpoints by accessing `localhost:5000`

# Configuration

Simple-Auth aims to be highly configurable and this configuration comes in the form of environment variables.
Below you will find a list of all the available variables, their description and types.

## DATABASE_TYPE *
      
- **Required**: true
- **Type**: string
- **Values**: postgres, mysql
- **Description**: The type of database to connect to. At the moment only postgres is supported, mysql/mariadb are untested but should be supported. We are aiming to increase the number of databases supported

## DATABASE_HOST *

- **Required**: true
- **Type**: string
- **Description**: The host name of your database, this could be the name of the service inside a docker network or a url

## DATABASE_NAME *
      
- **Required**: true
- **Type**: string
- **Description**: The name of the database to connect to. It is up to you to unsure that the database is created before initialising the service

## DATABASE_PORT *
      
- **Required**: true
- **Type**: number
- **Description**: The port in which the database service is listening

## DATABASE_USERNAME *
      
- **Required**: true
- **Type**: string
- **Description**: The user of the database to use in the connection

## DATABASE_PASSWORD *
      
- **Required**: true
- **Type**: string
- **Description**: The password of the user to use in the connection
      
## TOKEN_ENCRYPTION_KEY *
      
- **Required**: true
- **Type**: string
- **Description**: The secret key to encrypt the tokens with. We are currently using [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) you can find more information there.

## PASSWORD_PEPPER
      
- **Required**: false
- **Type**: string
- **Description**: A string to be used as [pepper](https://en.wikipedia.org/wiki/Pepper_(cryptography)) in protecting user passwords. **If you set this you can not change it a later time as it would make it impossible to unhash previous passwords**
- **Default Value**: ""
      
## PORT
      
- **Required**: false
- **Type**: number
- **Description**: The port in which the HTTP server will run
- **Default Value**: 5000

## ACCESS_TOKEN_EXPIRE_TIME
      
- **Required**: false
- **Type**: number
- **Description**: The number of seconds a token should last. This should be a short time, 10 to 60 minutes usually
- **Default Value**: 600 (10 minutes)

## REFRESH_TOKEN_EXPIRE_TIME
      
- **Required**: false
- **Type**: number
- **Description**: The number of seconds the refresh token should last. This token is long lived, usually between serveral days or months. When this token expires your user will have to login again
- **Default Value**: 2629743 (~30 days)

## MODE
      
- **Required**: false
- **Type**: string
- **Description**: The mode the service should run in. Possible values include ["dev", "prod"]. dev mode will show more debug information
- **Default Value**: prod

## SMTP_HOST
      
- **Required**: false
- **Type**: string
- **Description**: The server host of the SMTP email client to use. If none is provided the auth service will not send confirmation emails

## SMTP_PORT
      
- **Required**: false (true if using [SMTP_HOST](#SMTP_HOST))
- **Type**: number
- **Description**: The server port where the SMTP server is running

## SMTP_SECURE
      
- **Required**: false
- **Type**: boolean
- **Description**: Wether to use TLS in the connection to the server
- **Default Value**: false

## SMTP_USER
      
- **Required**: false (true if using [SMTP_HOST](#SMTP_HOST))
- **Type**: string
- **Description**: The user to connect to the SMTP server

## SMTP_PASSWORD
      
- **Required**: false (true if using [SMTP_HOST](#SMTP_HOST))
- **Type**: string
- **Description**: The password of the user to connect to the SMTP server

## SMTP_MAIL_FROM
      
- **Required**: false (true if using [SMTP_HOST](#SMTP_HOST))
- **Type**: string
- **Description**: The email address that will show up in "From" when sending emails

## AUTH_URL

- **Required**: false (true if using [SMTP_HOST](#SMTP_HOST))
- **Type**: string
- **Description**: The URL of where the simple-auth service is located. If you're hiding the service behind a proxy you need to provide the URL of direct access. This is used for the simple-auth service to provide email links for account confirmation, account deletion and password reset. Bear in mind that password resets are not possible without an email service

## ACCOUNT_CONFIRMATION_REDIRECT_URL

- **Required**: false
- **Type**: string
- **Description**: A URL to redirect the user to after confirming account creation. This works only when using an SMTP server and the user confirms the account through the email sent.
- **Default Value**: The host of the application we got through the request

## DB_SESSIONS

- **Required**: false
- **Type**: boolean
- **Description**: If you set this to true user sessions will be saved to the database and compared each time. This will be safer as the service will be able to track which sessions are active, but it will be slower as it requires reading and writing to the database.
- **Default Value**: false

# Development

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```