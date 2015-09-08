GOPATH := ${PWD}:${GOPATH}
export GOPATH

build: build-go migrate build-ui

build-go:
	godep restore
	go build -v -o bin/serve -i cmds/server/main.go


build-ui: 
	npm install
	bower install
	gulp build

migrate:
	go get bitbucket.org/liamstask/goose/cmd/goose
	goose up

test:
	go test ./...

