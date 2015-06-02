package api

import (
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func makeTestWriter() gin.ResponseWriter {
	w := httptest.NewRecorder()

	writer := &fakeWriter{
		ResponseWriter: w,
	}
	return gin.ResponseWriter(writer)
}

func TestIntParamValid(t *testing.T) {
	params := gin.Params{gin.Param{Key: "id", Value: "5"}}
	c := &gin.Context{
		Params: params,
		Writer: makeTestWriter(),
	}
	value, err := int64Param(c, "id")
	if value != 5 {
		t.Fail()
	}
	if err != nil {
		t.Error(err)
	}

}

func TestIntParamMissing(t *testing.T) {
	params := gin.Params{}
	c := &gin.Context{
		Params: params,
		Writer: makeTestWriter(),
	}
	_, err := int64Param(c, "id")
	if err == nil {
		t.Fail()
	}

}

func TestIntParamNaN(t *testing.T) {
	params := gin.Params{gin.Param{Key: "id", Value: "foo"}}
	c := &gin.Context{
		Params: params,
		Writer: makeTestWriter(),
	}
	_, err := int64Param(c, "id")
	if err == nil {
		t.Fail()
	}

}
