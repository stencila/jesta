# 🃏 Jesta

#### Stencila plugin for stencils using Node.js

<br>

[![Build Status](https://dev.azure.com/stencila/stencila/_apis/build/status/stencila.jesta?branchName=main)](https://dev.azure.com/stencila/stencila/_build/latest?definitionId=13&branchName=main)
[![Coverage](https://codecov.io/gh/stencila/jesta/branch/master/graph/badge.svg)](https://codecov.io/gh/stencila/jesta)
[![NPM](https://img.shields.io/npm/v/@stencila/jesta.svg?style=flat)](https://www.npmjs.com/package/@stencila/jesta)
[![Docs](https://img.shields.io/badge/docs-latest-blue.svg)](https://stencila.github.io/jesta/)

## ✨ Features

- Implements `compile`, `build` and `execute` methods for `CodeChunk` and `CodeExpression` nodes with Javascript as their `programmingLanguage`.

- Implements `vars`, `get`, and `set` methods for Node.js sessions.

- Implements `decode` and `encode` methods for `format:json`.

- Implements `select` for `lang:simplepath`.

- A base for other plugins written in Javascript or Typescript (implements `register` and `serve` methods (required for integration with Stencila CLI and Desktop)

- A simple command line interface, including interactive modes, for running and testing plugins.

## 📦 Install

It is envisioned that this will be the default plugin for Node.js and that you will be able to install it using the Stencila CLI,

```sh
stencila install nodejs
```

Or using the name of this repo directly,

```sh
stencila install jesta
```

None of that is possible right now, and this package isn't even on NPM yet, but you could always install it from GitHub directly if you like:

```sh
npm install stencila/jesta
```

## 🚀 Use

Most of the time, you won't use Jesta directly (it's more likely that you will use one of the plugins extended from it, or use it via the Stencila CLI). But if you do want to run Jesta standalone...

```sh
npx jesta help
```

## 💪 Extend

Jesta is designed to be extended. You can create your own Stencila plugin by following these steps.

Initialize your package and add Jesta as a development dependency:

```sh
npm init
npm install stencila/jesta
```

Implement your own `manifest` and override any of Jesta's other methods and in your `index.ts` or `index.js`, call Jesta's `cli` function e.g.

```ts
import { Jesta } from '@stencila/jesta'
import { manifest } from './manifest'

export class MyPlugin extends Jesta {
  manifest = manifest
}

if (require.main === module) new MyPlugin.cli(__filename)
```

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
