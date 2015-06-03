package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

const statusOK = "ok"

func abortWithSqlErr(c *gin.Context, err error) {
	switch err {
	case sql.ErrNoRows:
		c.AbortWithStatus(http.StatusNotFound)
		break
	default:
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}
