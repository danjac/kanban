GOPATH := ${PWD}:${GOPATH}
export GOPATH

build-go:
	go build -v -o server -i kanban.go


build-ui: 
	npm install
	gulp build

migrate:
	go get bitbucket.org/liamstask/goose/cmd/goose
	goose up

build: build migrate build-ui


	

