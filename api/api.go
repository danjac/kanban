package api

import (
	"github.com/danjac/kanban/db"
	"github.com/gin-gonic/gin"
)

const statusOK = "OK"

/*
New creares a new API instance with all routes
*/
func New(r *gin.Engine, prefix string, dataMgr db.DataManager) *gin.RouterGroup {

	g := r.Group(prefix)

	NewTaskListAPI(g, "/board/", dataMgr)
	NewTaskAPI(g, "/task/", dataMgr)

	return g

}
