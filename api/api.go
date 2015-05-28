package api

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var errNumError = errors.New("Invalid parameter")

func getIntParam(c *gin.Context, name string) (int64, error) {
	result, err := strconv.ParseInt(c.Params.ByName("id"), 10, 64)
	if err != nil {
		return result, errNumError
	}
	return result, nil
}

func handleError(c *gin.Context, err error) {
	switch err {
	case errNumError:
		c.AbortWithError(http.StatusBadRequest, err)
		break
	case sql.ErrNoRows:
		c.AbortWithStatus(http.StatusNotFound)
		break
	default:
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}