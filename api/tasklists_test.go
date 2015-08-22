package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestGetTaskLists(t *testing.T) {

	req, _ := http.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	writer := &mockWriter{
		ResponseWriter: w,
	}
	c := &gin.Context{
		Request: req,
		Writer:  gin.ResponseWriter(writer),
	}

	getTaskLists(c)

	if w.Code != http.StatusOK {
		t.Fail()
	}

}
