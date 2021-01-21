# 🃏 Jesta

#### Stencila plugin for Node.js

> 🚨 This is a work in progress. It is mainly an exploration of how plugins can be developed in Stencila in different languages

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

## 🛠️ Develop

Get started by cloning this repository, installing dependencies and running the command line interface:

```sh
git clone git@github.com:stencila/jesta
cd jesta
npm install
npm start
```

There are no unit tests yet but there is a test fixture that you can try things out on e.g.

```sh
npm start -- compile+build+execute tests/fixtures/one/index.json
```
