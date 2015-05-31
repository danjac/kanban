package api

import (
	"bufio"
	"net"
	"net/http"

	"github.com/danjac/kanban/models"
)

type fakeWriter struct {
	http.ResponseWriter
	size   int
	status int
}

// Implements the http.Hijacker interface
func (w *fakeWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	if w.size < 0 {
		w.size = 0
	}
	return w.ResponseWriter.(http.Hijacker).Hijack()
}

// Implements the http.CloseNotify interface
func (w *fakeWriter) CloseNotify() <-chan bool {
	return w.ResponseWriter.(http.CloseNotifier).CloseNotify()
}

// Implements the http.Flush interface
func (w *fakeWriter) Flush() {
	w.ResponseWriter.(http.Flusher).Flush()
}

func (w *fakeWriter) Size() int {
	return w.size
}

func (w *fakeWriter) Status() int {
	return w.status
}

func (w *fakeWriter) Writestring(name string) (int, error) {
	return 0, nil
}

func (w *fakeWriter) Written() bool   { return true }
func (w *fakeWriter) WriteHeaderNow() {}

type fakeDb struct{}

func (db *fakeDb) GetTaskLists() ([]models.TaskList, error) {
	var result []models.TaskList
	return result, nil
}

func (db *fakeDb) DeleteTaskList(id int64) error {
	return nil
}

func (db *fakeDb) UpdateTaskList(id int64, name string) error {
	return nil
}

func (db *fakeDb) DeleteTask(id int64) error {
	return nil
}

func (db *fakeDb) CreateTaskList(list *models.TaskList) error {
	return nil
}

func (db *fakeDb) CreateTask(list *models.Task) error {
	return nil
}

func (db *fakeDb) MoveTaskList(id int64, targetId int64) error {
	return nil
}

func (db *fakeDb) MoveTask(id int64, targetId int64) error {
	return nil
}
