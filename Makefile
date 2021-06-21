all: format lint cover build

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

clean:
	rm -rf bin coverage dist docs
