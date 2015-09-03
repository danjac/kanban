GOPATH := ${PWD}:${GOPATH}
export GOPATH

build:
	go build -v -o server -i kanban.go


build-ui: 
	npm install
	gulp build

run: build build-ui
	./server


	

