package api

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

const OK = "ok"

func int64Param(c *gin.Context, name string) (int64, error) {
	result, err := strconv.ParseInt(c.Params.ByName(name), 10, 64)
	if err != nil {
		c.AbortWithStatus(http.StatusNotFound)
		return result, err
	}
	return result, nil
}

func abortWithSqlErr(c *gin.Context, err error) {
	switch err {
	case sql.ErrNoRows:
		c.AbortWithStatus(http.StatusNotFound)
		break
	default:
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}
