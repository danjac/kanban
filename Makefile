GOPATH := ${PWD}:${GOPATH}
export GOPATH

build-go:
	godep restore
	go build -v -o bin/serve -i cmds/server/main.go


build-ui: 
	npm install
	gulp build

migrate:
	go get bitbucket.org/liamstask/goose/cmd/goose
	goose up

test:
	go test ./...

build: build migrate build-ui



	

