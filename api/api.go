package api

import (
	db "github.com/danjac/kanban/database"
	"github.com/gin-gonic/gin"
	"strconv"
)

const statusOK = "OK"

func getDB(c *gin.Context) *db.DB {
	return c.MustGet("db").(*db.DB)
}

func pInt64(c *gin.Context, name string) (int64, error) {
	return strconv.ParseInt(c.Param(name), 10, 64)
}

/*
New creares a new API instance with all routes configured
*/
func New(r *gin.Engine, prefix string, db *db.DB) *gin.RouterGroup {

	api := r.Group(prefix)

	api.Use(func(c *gin.Context) {
		c.Set("db", db)
	})

	cardRoutes(api, "/board/")
	taskRoutes(api, "/task/")

	return api

}
