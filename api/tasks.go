package api

import (
	"net/http"

	"github.com/danjac/kanban/db"
	"github.com/gin-gonic/contrib/rest"
	"github.com/gin-gonic/gin"
)

type TaskApi struct {
	DB db.DataManager
}

func (api *TaskApi) MoveHandler(c *gin.Context) {

	taskId, err := int64Param(c, "id")

	if err != nil {
		return
	}

	newListId, err := int64Param(c, "new_list_id")
	if err != nil {
		return
	}

	if err := api.DB.MoveTask(taskId, newListId); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.String(http.StatusOK, OK)
}

func (api *TaskApi) DeleteHandler(c *gin.Context) {

	taskId, err := int64Param(c, "id")
	if err != nil {
		return
	}

	if err := api.DB.DeleteTask(taskId); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.String(http.StatusOK, OK)
}

func NewTaskApi(r *gin.RouterGroup, prefix string, dataMgr db.DataManager) *TaskApi {
	api := &TaskApi{dataMgr}

	rest.CRUD(r, prefix, api)

	r.PUT(prefix+":id/move/:new_list_id", api.MoveHandler)

	return api
}
