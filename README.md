# open-rpc-mock-server

<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/open-rpc/mock-server/master.svg">
    <img src="https://codecov.io/gh/open-rpc/mock-server/branch/master/graph/badge.svg" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@open-rpc/mock-server.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/open-rpc/mock-server.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/open-rpc/mock-server/latest.svg" />
  </span>
</center>

Provide a [Mock server](https://en.wikipedia.org/wiki/Mock_object) for an [OpenRPC Document](https://spec.open-rpc.org/).


## Features

### Basic Mode

Given an [OpenRPC document](https://github.com/open-rpc/spec#openrpc-document), Mock server will provide a mock implementation of the JSON-RPC api that:
 - implements all of the methods specified in the given [OpenRPC document](https://github.com/open-rpc/spec#openrpc-document).
 - when calling a method with params used in an example, the example's result will be returned.
 - params without examples will have their results generated according to the [`method.result.schema: JSONSchema`](https://spec.open-rpc.org/#content-descriptor-schema).
 - validates input params against their respective JSONSchemas.
 - Provides [rpc.discover](https://github.com/open-rpc/spec#service-discovery-method) for service discovery-based integration testing.


### Service Mode

Running the mock server in service mode will run a [JSON-RPC service](https://github.com/open-rpc/mock-server/blob/master/service-mode-openrpc.json) that:
 - implements one method: `mock`. It takes an openrpc document, returns a url path postfix. Appending the path to the services url will give us a mock server for the document provided.
 - host it yourself or use the OpenRPC hosted one: `https://mock.open-rpc.org`

### CLI & Javascript/Typescript API

Mock server is generally meant to be run via CLI, however it can also be imported to your project. doing so will:
 - give you a function to start the server, and returns you the [OpenRPC Server instance](https://github.com/open-rpc/server-js)
 - from there you can add transports, routers & middleware

## Install

### CLI

```bash
npm i -g @open-rpc/mock-server
```

### Javascript API

```bash
npm i -S @open-rpc/mock-server
```

## Usage

### CLI
#### Defaults
The default settings expect to find a file in the root of your project called `open-rpc.json`. It will must be a valid OpenRPC document as validated by [OpenRPC Metaschema](https://meta.open-rpc.org/), or an error will be returned.

```bash
npm run mock-server
```

this will start an [HTTP server](https://github.com/open-rpc/server-js) on http://localhost:3333 (default settings)

#### Custom path or filename
Where my-open-rpc-document.json is a file in the current directory which is a valid OpenRPC document as validated by [OpenRPC Metaschema](https://meta.open-rpc.org/).

```bash
open-rpc-mock-server -d my-open-rpc-document.json
```

#### OpenRPC Document from url
You can also provide a URL that will resolve the OpenRPC document in JSON format:
```bash
open-rpc-mock-server -d https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/simple-math-openrpc.json
```

#### Running in Service Mode
Allows you to add documents to the running server as a JSON-RPC request. One mock server in service mode can handle a large number of mocked services at once with this configuration.

```bash
open-rpc-mock-server --mode service
```

A server is running on http://localhost:3333 now. You can call the `mock` method, and pass it your OpenRPC document, which will start mocking that service (under the returned url path).


## Trying out the mocked service

 - Try out the free to use OpenRPC-hosted mock server `https://mock.open-rpc.org/` [here](https://playground.open-rpc.org/?url=https://mock.open-rpc.org)
 - use your own localhost mock server with playground [here](https://playground.open-rpc.org/?url=http://localhost:3333)
 - or try the postman-like only interface [OpenRPC Inspector](https://inspector.open-rpc.org/) with any of the above links

## Example

- [Using OpenRPC Mock Server to test against an Ethereum JSON-RPC API](https://medium.com/etclabscore/using-openrpc-mock-server-to-test-against-an-ethereum-json-rpc-api-50b86b6d02d6) - Jun 11, 2019 - ETC Labs Core

## Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
