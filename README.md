# 🃏 Jesta

#### Stencila plugin for stencils using Node.js

<br>

[![Build Status](https://dev.azure.com/stencila/stencila/_apis/build/status/stencila.jesta?branchName=main)](https://dev.azure.com/stencila/stencila/_build/latest?definitionId=13&branchName=main)
[![Coverage](https://codecov.io/gh/stencila/jesta/branch/main/graph/badge.svg)](https://codecov.io/gh/stencila/jesta)
[![NPM](https://img.shields.io/npm/v/@stencila/jesta.svg?style=flat)](https://www.npmjs.com/package/@stencila/jesta)
[![Docs](https://img.shields.io/badge/docs-latest-blue.svg)](https://stencila.github.io/jesta/)

## ✨ Features

> Features that are not yet implemented or only partially implemented are indicated by a unicorn emoji 🦄

- Implements `compile`, `build` and `execute` methods for `CodeChunk` and `CodeExpression` nodes with Javascript as their `programmingLanguage` 🦄.

- Implements `vars`, `get`, `set` and `delete` methods for managing variables in Node.js sessions.

- Implements `funcs`, and `call` methods for using functions defined in Node.js sessions 🦄.

- Implements `decode` and `encode` methods for `format` `json`.

- Implements `select` for `lang` `simplepath`.

- Implements `read` and `write` for protocols `file://`, `http://` (with [RFC 7234](http://httpwg.org/specs/rfc7234.html) compliant caching), and `stdio://`.

- A base for other plugins written in Javascript or Typescript (implements `register` and `serve` methods required for integration with Stencila CLI and Desktop)

- A simple command line interface, including interactive modes, for running and testing plugins.

## 🏗️ Roadmap

- [x] Development setup (linting, tests, CI, docs etc)
- [x] Semantic releases
- [x] Simple API for developing extension plugins
- [x] Simple CLI for testing extension plugins
- [x] Binary distributions using `pkg` (mainly as an example for extenders)
- [ ] Add `js` as a format for encoding and decoding (with basic comment parsing)
- [ ] Docker image (mainly as an example for extenders)
- [ ] Re-implement / move basic IO utility functions from Encoda (e.g. cached HTTP requests, MediaType mappings)
- [ ] Finish implementing core execution functions for Javascript: `compile`, `build`, `execute`, `funcs`, `call`.
- [ ] Implement `set` for `Parameter` nodes
- [ ] Use `logga` for logging
- [ ] At least 95% test coverage
- [ ] Complete implementing `manifest`
- [ ] Test usage with `stencila` CLI
- [ ] Add an 🙏 Acknowledgements section to this README

## 📦 Install

It is envisioned that this will be the default plugin for Node.js and that you will be able to install it using the [Stencila CLI](https://github.com/stencila/stencila),

```sh
stencila install javascript
```

Or using the name of this repo directly,

```sh
stencila install jesta
```

None of that is possible right now, but if you have Node.js and NPM installed,

```sh
npm install --global @stencila/jesta
```

## 🚀 Use

Most of the time you won't use Jesta directly (it's more likely that you will use one of the plugins extended from it, or use it via the Stencila CLI). But if you _do_ want to run Jesta standalone...

```sh
jesta help
```

## 💪 Extend

Jesta is designed to be extended. You can create your own Stencila plugin by following these steps.

Initialize your package and add Jesta as a development dependency:

```sh
npm init
npm install stencila/jesta
```

Implement your own `manifest` function (and override any of Jesta's other methods) and then in your `index.ts` or `index.js`, call Jesta's `cli` function e.g.

```ts
import { Jesta } from '@stencila/jesta'
import { manifest } from './manifest'

export class MyPlugin extends Jesta {
  manifest = manifest
}

if (require.main === module) new MyPlugin(__filename).cli()
```

This repo also creates standalone binaries for Linux, MacOS and Windows using [`pkg`](https://github.com/vercel/pkg). These binaries are published for each [release](https://github.com/stencila/jesta/releases) with a [target triplet](https://wiki.osdev.org/Target_Triplet) name that is suitable for download by the `stencila` CLI tool. Check out the `build.sh` script and the `pkg` property in the [`package.json`](package.json) to see how to reuse this approach for your own plugin.

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
