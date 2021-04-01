# 🃏 Jesta

**Stencila plugin for executable documents using JavaScript**

<br>

[![Build Status](https://dev.azure.com/stencila/stencila/_apis/build/status/stencila.jesta?branchName=main)](https://dev.azure.com/stencila/stencila/_build/latest?definitionId=13&branchName=main)
[![Coverage](https://codecov.io/gh/stencila/jesta/branch/main/graph/badge.svg)](https://codecov.io/gh/stencila/jesta)
[![NPM](https://img.shields.io/npm/v/@stencila/jesta?logo=npm)](https://www.npmjs.com/package/@stencila/jesta)
[![Docker Image](https://img.shields.io/docker/v/stencila/jesta?label=docker&logo=docker)](https://hub.docker.com/r/stencila/jesta)
[![Docs](https://img.shields.io/badge/docs-latest-blue.svg)](https://stencila.github.io/jesta/)

## ✨ Features

- Implements `compile`, `build` and `execute` methods for `CodeChunk` and `CodeExpression` nodes with Javascript as their `programmingLanguage`.

- Implements `vars`, `get`, `set` and `delete` methods for managing variables in Node.js.

- Implements `funcs`, and `call` methods for using functions defined in Node.js.

- Implements `decode` and `encode` methods for document format `json`.

- Implements `select` for query language `simplepath`.

- Implements `read` and `write` for protocols `file://`, `http://` (with [RFC 7234](http://httpwg.org/specs/rfc7234.html) compliant caching), and `stdio://`.

- Implements the `validate` method to validate documents against Stencila [JSON Schema](https://github.com/stencila/schema). By default, coerces inputs to meet the schema (e.g. dropping unknown properties, parsing dates) but this can be turned off with `--force=false`.

- A base for other plugins written in Javascript or Typescript (implements `manifest` and `serve` methods required for integration with Stencila CLI and Desktop)

- A simple command line interface, including interactive modes, for running and testing plugins.

## 🏗️ Roadmap

- [x] Development setup (linting, tests, CI, docs etc)
- [x] Semantic releases
- [x] Simple API for developing extension plugins
- [x] Simple CLI for testing extension plugins
- [x] Binary distributions using `pkg` (mainly as an example for extenders)
- [ ] Add `js` as a format for encoding and decoding (with basic comment parsing)
- [x] Docker image (mainly as an example for extenders)
- [x] Re-implement / move basic IO utility functions from Encoda (e.g. cached HTTP requests, MediaType mappings)
- [ ] Finish implementing core execution functions for Javascript: `compile`, `build`, `execute`, `funcs`, `call`.
- [ ] Implement `set` for `Parameter` nodes
- [ ] Use `logga` for logging
- [ ] At least 95% test coverage
- [ ] Complete implementing `manifest`
- [ ] Test usage with `stencila` CLI
- [x] Add an 🙏 Acknowledgements section to this README

## 📦 Install

### Via `stencila`

This is the default plugin for using Javascript with Stencila. Install it using the [Stencila CLI](https://github.com/stencila/stencila),

```sh
stencila plugins install javascript
```

Or using the name of this repo directly,

```sh
stencila install jesta
```

### Via `npm`

If you have Node.js and NPM installed,

```sh
npm install --global @stencila/jesta
```

### Via `docker`

A Docker [image](https://hub.docker.com/r/stencila/jesta) is built for each release,

```sh
docker pull stencila/jesta
```

## 🚀 Use

Most of the time you won't use Jesta directly (it's more likely that you will use one of the plugins extended from it, or use it via the Stencila CLI).

But if you _do_ want to run Jesta standalone, for example to execute a document containing Javascript code,

```sh
jesta execute document.json
```

Or, if you are using the Docker image,

```sh
docker run -it --rm -v$PWD:/work -w/work stencila/jesta execute document.json
```

## 💪 Extend

Jesta is designed to be extended so that you can create your own Stencila plugins using Javascript or Typescript.

### Getting started

Initialize your package and add Jesta as a dependency:

```sh
npm init
npm install @stencila/jesta
```

### Override one or more method

Override any of Jesta's methods e.g. `compile` and in your `index.ts` or `index.js`, call Jesta's `cli` function e.g.

```ts
import { Jesta } from '@stencila/jesta'
import { compile } from './compile'

export class MyPlugin extends Jesta {
  compile = compile
}

if (require.main === module) new MyPlugin().cli()
```

### Write a `codemeta.json` file

The `codemeta.json` file contains metadata (based on the [Codemeta](https://codemeta.github.io/) and schema.org standards) about your plugin including how it can be installed and it's capabilities. This metadata is used by Stencila to determine how it should install your plugin, how to run it, and what functions should be delegated to it.

A good place to start is by copying Jesta's [`codemeta.json`](codemeta.json) file and modifying it. At a minimum, the `codemeta.json` file should include a `name`, `description`, a `installUrl` array containing the NPM URL of the package, and a `featureList` array.

```json
{
  "name": "myplugin",
  "description": "My awesome plugin",
  "installUrl": [
    "https://www.npmjs.com/package/myplugin",
  ],
  "featureList": [
    ...
  ]
}
```

### Publish standalone binaries

Not everyone has Node.js installed. To make your plugin available to as many possible users as possible we encourage you to create standalone binaries for major operating systems.

This repo provides an example of how to create standalone binaries for Linux, MacOS and Windows using [`pkg`](https://github.com/vercel/pkg). These binaries are published for each [release](https://github.com/stencila/jesta/releases) with a [target triplet](https://wiki.osdev.org/Target_Triplet) name that is suitable for download by Stencila. Check out the `build.sh` script and the `pkg` property in the [`package.json`](package.json) to see how to reuse this approach for your own plugin.

Add the binaries as assets to each release (see how we do this automatically using `semantic-release`) and add the GitHub releases URL to `installUrl` so that Stencila knows that standalone binaries are an installation option:

```json
  "installUrl": [
    ...
    "https://github.com/me/myplugin/releases"
  ]
```

### Publish a Docker image

Some users may prefer to use your plugin as a Docker image.

This repo contains a [`Dockerfile`](Dockerfile) that shows how you can create a Docker image for your plugin based on the Linux binary. Once it is published add the Docker Hub URL to `installUrl` so that Stencila knows that is an installation option:

```json
  "installUrl": [
    ...
    "https://hub.docker.com/r/me/myplugin"
  ]
```

> 💬 Tip: Stencila will attempt to install a plugin based on the order of URLs in `installUrl`. So, for example, if it's best that your users use a Docker image, put it first and that method will be used, if possible, and if the user hasn't specified a installation preference.

## 🛠️ Develop

Get started by cloning this repository, installing dependencies and running the command line interface:

```sh
git clone git@github.com:stencila/jesta
cd jesta
npm install
npm start
```

Please run the formatting, linting and testing scripts when contributing code e.g.

```sh
npm run format
npm run lint
npm run test::watch
```

Alternatively, use `make` if you prefer,

```sh
make format lint test
```

There are also some test fixtures that you can try the CLI out on e.g.

```sh
npm start -- compile+build+execute tests/fixtures/one/index.json
```

## 🙏 Acknowledgements

- The `read` method uses [`got`](https://github.com/sindresorhus/got#readme), [`keyv`](https://github.com/lukechilds/keyv#readme) and [`content-type`](https://github.com/jshttp/content-type#readme) to enable cached reads of URLs and determine the format of the returned content.

- The `validate` method uses [Ajv](https://ajv.js.org/), "the fastest JSON Schema validator for Node.js and browser", to validate and coerce JSON documents against our [schema](https://github.com/stencila/schema).

- The `compile` method relies on [Acorn](https://github.com/acornjs/acorn#readme), a "tiny, fast JavaScript parser, written completely in JavaScript", to determine the `imports`, `declares`, `uses` etc properties of `CodeChunk` and `CodeExpression` nodes in documents.

- The command line interface is implemented using [`minimist`](https://github.com/substack/minimist#readme).
