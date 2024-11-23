# Omniflex Mono-Repo

## Usage Notice

This project is built using the Omniflex Mono-Repo. For more information, visit [omniflex.io](https://omniflex.io).

The omniflex mono-repo is available at [here](https://github.com/Zay-Dev/omniflex).


## Overview

Welcome to the Omniflex Mono-Repo! This repository is designed to provide a robust and scalable foundation for developers to build their applications. Our focus is on maintaining a high-quality infrastructure and package ecosystem, allowing you to concentrate on developing your application logic.

## Quick Usage

The Omniflex Mono-Repo offers a streamlined development experience with features like quick scaffolding, automatic Swagger documentation, and modular architecture. These benefits lead to easier maintenance and faster development cycles.

### Getting Started

1. **Clone the Repository**: Start by cloning this mono-repo to your local machine.
2. **Create Your App**: Develop your application within the `apps` folder. Each app (or the whole apps/) can be a separate Git repository, allowing you to focus on your code while we handle the infrastructure.
3. **Leverage Our Infrastructure**: Experience the power of our maintained packages and infrastructure! While you focus on crafting amazing features for your application, we ensure your foundation stays rock-solid with continuous updates, security patches, and performance improvements. It's like having an expert team at your service!

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

### Example Structure

```
apps/
  └── server/                   # Example Express server
      ├── .git/                 # Separate Git repository
      ├── modules/
      ├── services/
      └── package.json
```

## Structure

- **core**: Contains shared types and utilities.
- **infra**: Infrastructure-related packages, such as Express, Mongoose, and Swagger autogen.
- **modules**: Feature-specific modules, such as identity management.
- **apps**: Applications built using the core and infra packages.

## Contributing

While we are not currently accepting code contributions, we welcome:
- Bug reports
- Feature suggestions
- General feedback and recommendations

Please feel free to open issues to share your ideas or report problems.

## License

See the LICENSE file for more details.

