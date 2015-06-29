package api

import (
	"github.com/danjac/kanban/db"
	"github.com/gin-gonic/gin"
)

const statusOK = "OK"

/*
New creares a new API instance with all routes configured
*/
func New(r *gin.Engine, prefix string, db *db.DB) *gin.RouterGroup {

	g := r.Group(prefix)

	NewTaskListAPI(g, "/board/", db)
	NewTaskAPI(g, "/task/", db)

	return g

}
