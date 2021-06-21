all: format lint cover build docs

node_modules: package.json
	npm install --legacy-peer-deps

setup: node_modules

format:
	npm run format

lint:
	npm run lint

test:
	npm test

cover:
	npm run test:cover

build:
	npm run build

image: build
	docker build --tag stencila/jesta . 

docs:
	npm run docs
.PHONY: docs

clean:
	npm run clean
