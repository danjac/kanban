package api

import (
	"bufio"
	"net"
	"net/http"

	"github.com/danjac/kanban/db"
	"github.com/danjac/kanban/models"
)

type mockWriter struct {
	http.ResponseWriter
	size   int
	status int
}

// Implements the http.Hijacker interface
func (w *mockWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	if w.size < 0 {
		w.size = 0
	}
	return w.ResponseWriter.(http.Hijacker).Hijack()
}

// Implements the http.CloseNotify interface
func (w *mockWriter) CloseNotify() <-chan bool {
	return w.ResponseWriter.(http.CloseNotifier).CloseNotify()
}

// Implements the http.Flush interface
func (w *mockWriter) Flush() {
	w.ResponseWriter.(http.Flusher).Flush()
}

func (w *mockWriter) Size() int {
	return w.size
}

func (w *mockWriter) Status() int {
	return w.status
}

func (w *mockWriter) WriteString(name string) (int, error) {
	return 0, nil
}

func (w *mockWriter) Written() bool   { return true }
func (w *mockWriter) WriteHeaderNow() {}

type mockTaskListDB struct{}

func (DB *mockTaskListDB) Get() ([]models.TaskList, error) {
	var result []models.TaskList
	return result, nil
}

func (DB *mockTaskListDB) Delete(id int) error {
	return nil
}

func (DB *mockTaskListDB) Update(id int, name string) error {
	return nil
}

func (DB *mockTaskListDB) Create(list *models.TaskList) error {
	return nil
}

func (DB *mockTaskListDB) Move(id int, targetID int) error {
	return nil
}

type mockTaskDB struct{}

func (DB *mockTaskDB) Create(list *models.Task) error {
	return nil
}

func (DB *mockTaskDB) Move(id int, targetID int) error {
	return nil
}

func (DB *mockTaskDB) Delete(id int) error {
	return nil
}

func newMockDB() *db.DB {
	return &db.DB{
		&mockTaskListDB{},
		&mockTaskDB{},
	}
}
