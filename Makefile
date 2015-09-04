GOPATH := ${PWD}:${GOPATH}
export GOPATH

build:
	go build -v -o server -i kanban.go


build-ui: 
	npm install
	gulp build

migrate:
	go get bitbucket.org/liamstask/goose/cmd/goose
	goose up

run: build migrate build-ui
	./server


	

