package api

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

const OK = "ok"

var errInvalidParameter = errors.New("Invalid parameter")

func getIntParam(c *gin.Context, name string) (int64, error) {
	result, err := strconv.ParseInt(c.Params.ByName(name), 10, 64)
	if err != nil {
		return result, errInvalidParameter
	}
	return result, nil
}

func handleError(c *gin.Context, err error) {
	switch err {
	case errInvalidParameter:
		c.AbortWithError(http.StatusBadRequest, err)
		break
	case sql.ErrNoRows:
		c.AbortWithStatus(http.StatusNotFound)
		break
	default:
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}
