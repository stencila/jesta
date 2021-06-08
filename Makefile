all: format lint cover build docs

node_modules: package.json
	npm install --legacy-peer-deps

setup: node_modules

format: setup
	npm run format

lint: setup
	npm run lint

test: setup
	npm test

cover: setup
	npm run test:cover

build: setup
	npm run build

image: build
	docker build --tag stencila/jesta . 

docs: setup
	npm run docs
.PHONY: docs

clean: setup
	npm run clean
