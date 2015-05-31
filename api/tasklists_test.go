package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestListHandler(t *testing.T) {
	req, _ := http.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	writer := &fakeWriter{
		ResponseWriter: w,
	}
	c := &gin.Context{
		Request: req,
		Writer:  gin.ResponseWriter(writer),
	}
	api := &TaskListApi{&fakeDb{}}
	api.ListHandler(c)
	if w.Code != 200 {
		t.Fail()
	}

}
