package api

import (
	"testing"

	"github.com/gin-gonic/gin"
)

func TestIntParamValid(t *testing.T) {
	params := gin.Params{gin.Param{Key: "id", Value: "5"}}
	c := &gin.Context{
		Params: params,
	}
	value, err := getIntParam(c, "id")
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
	}
	_, err := getIntParam(c, "id")
	if err == nil {
		t.Fail()
	}

}

func TestIntParamNaN(t *testing.T) {
	params := gin.Params{gin.Param{Key: "id", Value: "foo"}}
	c := &gin.Context{
		Params: params,
	}
	_, err := getIntParam(c, "id")
	if err == nil {
		t.Fail()
	}

}
