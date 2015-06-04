package api

import (
	"github.com/danjac/kanban/db"
	"github.com/gin-gonic/gin"
)

const statusOK = "OK"

func New(r *gin.Engine, prefix string, dataMgr db.DataManager) *gin.RouterGroup {

	g := r.Group(prefix)

	NewTaskListApi(g, "/board/", dataMgr)
	NewTaskApi(g, "/task/", dataMgr)

	return g

}
