# Omniflex Mono-Repo

## Usage Notice

This project is built using the Omniflex Mono-Repo. For more information, visit [omniflex.io](https://omniflex.io).

The omniflex mono-repo is available at [here](https://github.com/Zay-Dev/omniflex).


## Overview

Welcome to the Omniflex Mono-Repo! This repository is designed to provide a robust and scalable foundation for developers to build their applications. Our focus is on maintaining a high-quality infrastructure and package ecosystem, allowing you to concentrate on developing your application logic.

## Usage

The Omniflex Mono-Repo offers a streamlined development experience with features like quick scaffolding, automatic Swagger documentation, and modular architecture. These benefits lead to easier maintenance and faster development cycles.

### Quick Start

```bash
# clone the omniflex mono-repo
git clone --recurse-submodules git@github.com:Zay-Dev/Omniflex.git omniflex

# clone the example apps-server
git clone git@github.com:Zay-Dev/omniflex-express-apps-server.git apps/server

# remove the git history of the cloned apps-server
rm -rf apps/server/.git

# install dependencies
yarn

# run the example apps-server
yarn dev:server
```

### Getting Started

1. **Clone the Repository**: Start by cloning this mono-repo to your local machine.
2. **Create Your App**: Develop your application within the `apps` folder. Each app (or the whole apps/) can be a separate Git repository, allowing you to focus on your code while we handle the infrastructure.
3. **Leverage Our Infrastructure**: Experience the power of our maintained packages and infrastructure! While you focus on crafting amazing features for your application, we ensure your foundation stays rock-solid with continuous updates, security patches, and performance improvements. It's like having an expert team at your service!

### Example Structure

```
core/                # Omniflex core packages
infra/               # Omniflex infrastructure packages
modules/             # Omniflex feature-specific modules
...
apps/
  └── server/                   # Example Express server
      ├── .git/                 # Separate Git repository
      ├── modules/
      ├── services/
      └── package.json
```

### Package Configuration

Configure your application's `package.json` to work with Yarn workspaces. This enables you to manage dependencies and run commands from the root directory.

```json
{
  "name": "apps-server",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nodemon",
    "start": "node dist/index.js",
    "build": "tsc && tsc-alias"
  },
  "nodemonConfig": {
    "delay": 100,
    "watch": [
      "../../",
      ".env"
    ],
    "ext": "js,ts,ts,json",
    "exec": "tsc --noEmit && tsx -C development index.ts",
    "ignore": [
      "**/dist/**",
      "**/docs/**"
    ]
  }
}
```

With Yarn workspaces, you can run commands for specific packages from the root directory:

```bash
# Add dependencies
yarn ws-run apps-server add @omniflex/core@^0.1.0

# Run scripts
yarn ws-run apps-server dev
yarn ws-run apps-server build
yarn ws-run dev:server # predefined yarn workspace apps-server dev
yarn ws-run start:server # predefined yarn workspace apps-server start
```

For more information about Yarn workspaces, visit the [official documentation](https://classic.yarnpkg.com/lang/en/docs/workspaces/).

### Express Server Example

For a complete working example, please refer to our reference implementation at [omniflex-express-apps-server](https://github.com/Zay-Dev/omniflex-express-apps-server).

## Structure

- `core/`: Contains shared types and utilities.
- `infra/`: Infrastructure-related packages, such as Express, Mongoose, and Swagger autogen.
- `modules/`: Feature-specific modules, such as identity management.
- `apps/`: Applications built using the core and infra packages.

### Features

#### `core/`

- **Error Handling**
  - Generic and standardized error types and handling mechanisms
  - Although the usage looks like built for HTTP, it is not limited to HTTP
- **Dependency Injection**
  - Uses [awilix](https://github.com/jeffijoe/awilix) to manage dependencies and promote loose coupling between components

The core package serves as the foundation for all other packages in the Omniflex ecosystem, providing essential utilities and standardized patterns that ensure consistency across your application.

### Usage Example

```typescript
import { logger, errors, Containers } from '@omniflex/core';

// Logging
logger.info('Operation successful', { tags: ['user-service'] });
logger.error('Operation failed', { error, tags: ['auth'] });

// Error handling
throw errors.notFound('User not found');
throw errors.forbidden('Invalid permissions');

// Container usage
const container = Containers.create('myApp');
container.register('userService', () => new UserService());
```

#### `infra/infra-express/`

- **Error Handling**
  - Standardized error responses with configurable detail exposure
  - Capture unhandled async errors and prevent the app from dying
- **Logging**
  - Comprehensive request/response logging with [morgan](https://github.com/expressjs/morgan) integration
  - Detailed request/response logging with request ID tracking
  - Automatic sanitization and masking of sensitive data
- **Security**
  - Built-in security middlewares including:
    - [cors](https://github.com/expressjs/cors)
    - [helmet](https://github.com/helmetjs/helmet)
- **Utility Middleware**
  - [express-fileupload](https://github.com/richardgirges/express-fileupload) for file upload handling
  - [express-useragent](https://github.com/biggora/express-useragent) for user agent parsing
  - [response-time](https://github.com/expressjs/response-time) for tracking response time
- compatible with (an enhanced) [swagger-autogen](https://github.com/swagger-autogen/swagger-autogen)
- Uses [joi](https://github.com/hapijs/joi) for request body validation
- Utilizes [joi-to-swagger](https://github.com/Twipped/joi-to-swagger) to generate swagger documentation, no need to maintain the request body schema manually anymore
- **Base Controller Classes**: each controller instance serves one and only one request, eliminating the messy `(req: Request, res: Response)` passing around but just `this.req` and `this.res`
  - BaseExpressController:
    - provides `tryAction` and `tryActionWithBody` methods out of the box that make it easier to wrap logic in a try/catch block and standardized the error handling
    - provides `throwNotFound` and `throwForbidden` methods out of the box that make it easier to throw standardized errors
    - provides `respondOne` and `respondMany` methods out of the box that make it easier to respond with standardized data structure
    - `this.pathId`, `this.pageSize` and `this.page` are automatically populated for convenience
  - BaseEntitiesController:
    - everything from `BaseExpressController`, and
    - `tryListAll`, `tryGetOne`, `tryListPaginated`, `tryCreate`, `tryUpdate`, `tryDelete` and `trySoftDelete` methods out of the box that make it easier to perform CRUD operations

Usage example:

```typescript
// -- controller.ts

class Controller extends UsersController<TUser & {
  appTypes: string[];
}> {
  tryRegisterWithEmail(appType: string) {
    type TBody = Schemas.TBodyRegisterWithEmail;

    this.tryActionWithBody<TBody>(async ({ password, ...body }) => {
      const { id } = await this.register(appType, password, {
        ...body,
        username: body.email,
      });

      const user = await this.repository.update(id, {
        appTypes: [appType],
      });

      return this.respondOne(user);
    });
  }

  tryLoginWithEmail(appType: string) {
    type TBody = Schemas.TBodyLoginWithEmail;

    this.tryActionWithBody<TBody>(async (body) => {
      const user = await this.login(appType, {
        ...body,
        username: body.email,
      });
      const userAppTypes = user.appTypes || [];

      if (!userAppTypes.includes(appType)) {
        throw errors.unauthorized();
      }

      return this.respondOne({
        token: await jwtProvider.sign({
          ...user,
          id: user.id,

          __appType: appType,
          __type: 'access-token',
        }),
      });
    });
  }

  tryGetMyProfile() {
    this.tryAction(async () => {
      const profile = this.res.locals.required.profile;

      return this.respondOne({
        profileId: profile.id,
        ...profile,
      });
    });
  }
}

// -- exposed.ts
// #swagger.file.tags = ['Users']
// #swagger.file.basePath = '/v1/users'

import ...;

const router = Servers.exposedRoute('/v1/users');

const appType = Servers.servers.exposed.type;

router
  .get('/my/profile',
    // #swagger.security = [{"bearerAuth": []}]
    auth.requireExposed,    // -- valid JWT with `exposed` appType

    DbEntries.requiredById(
      repositories.users,
      (req, res, next) => res.locals.user.id,       // -- retrieved from JWT
      true,
    ),
    DbEntries.requiredFirstMatch(
      repositories.profiles,
      (_, res) => ({ userId: res.locals.user.id }),
      'profile'
    ),

    create(controller => controller.tryGetMyProfile()),
  )

  .post('/',
    // #swagger.jsonBody = required|components/schemas/moduleIdentity/registerWithEmail
    // -- schema is auto generated by joi-to-swagger
    Validators.validateRegisterWithEmail,

    create(controller => controller.tryRegisterWithEmail(appType)),
  )

  .post('/access-tokens',
    // #swagger.jsonBody = required|components/schemas/moduleIdentity/loginWithEmail
    Validators.validateLoginWithEmail,

    create(controller => controller.tryLoginWithEmail(appType)),
  );
```

#### `infra/infra-{db}/`

##### `infra-mongoose/`
- **Type System**
  - Predefined schema types with common configurations:
    - Easier to read and understand
    - Required/Optional variants for all basic types
    - Integer handling with automatic rounding
    - String enums with type safety
    - Boolean fields with default values

Usage example:

```typescript
import { getConnection } from '@omniflex/infra-mongoose';
import { optionalString, requiredDate, defaultFalse } from '@omniflex/infra-mongoose/types';

// Connection setup
const connection = await getConnection({
  mongoose: {
    uri: 'mongodb://localhost:27017',
    dbName: 'myapp'
  }
});

// Schema definition using provided types
const userSchema = {
  name: requiredString,
  bio: optionalString,
  joinedAt: requiredDate,
  isActive: defaultFalse
};
```

##### infra-postgres
- **Connection Management**
  - Uses [sequelize](https://sequelize.org/) ORM
  - Built-in logging integration with `core/` logger
  - Predefined schema types with common configurations:
    - Easier to read and understand
    - Required/Optional variants for all basic types
    - Consistent type definitions across the application

Usage example:
```typescript
import { getConnection } from '@omniflex/infra-postgres';
import { optionalString, requiredDate, defaultFalse } from '@omniflex/infra-postgres/types';

// Connection setup with automatic logging
const connection = await getConnection({
  postgres: {
    uri: 'postgresql://user:pass@localhost:5432/myapp'
  }
});

// Schema definition using provided types
const userSchema = {
  name: requiredString(),
  bio: optionalString(),
  joinedAt: requiredDate(),
  isActive: defaultFalse()
};
```

The database infrastructure packages are designed to provide consistent patterns and interfaces while abstracting away the complexity of database operations.

#### Git Submodules

This project uses a forked version of [swagger-autogen](https://github.com/swagger-autogen/swagger-autogen) as a git submodule. After cloning the repository, you'll need to initialize and update the submodule:

```bash
git submodule init
git submodule update
```

Or you can clone the repository with submodules in one command:

```bash
git clone --recurse-submodules git@github.com:Zay-Dev/Omniflex.git
```

The forked swagger-autogen includes custom enhancements specific to our needs while maintaining compatibility with the original project.

## Contributing

While we are not currently accepting code contributions, we welcome:
- Bug reports
- Feature suggestions
- General feedback and recommendations

Please feel free to open issues to share your ideas or report problems.

## License

See the LICENSE file for more details.

