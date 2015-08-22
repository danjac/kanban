package api

import (
	"github.com/danjac/kanban/db"
	"github.com/gin-gonic/gin"
)

const statusOK = "OK"

func getDB(c *gin.Context) *db.DB {
	return c.MustGet("db").(*db.DB)
}

/*
New creares a new API instance with all routes configured
*/
func New(r *gin.Engine, prefix string, db *db.DB) *gin.RouterGroup {

	api := r.Group(prefix)

	api.Use(func(c *gin.Context) {
		c.Set("db", db)
	})

	taskListRoutes(api, "/board/")
	taskRoutes(api, "/task/")

	return api

}
