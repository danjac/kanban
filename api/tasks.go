package api

import (
	"net/http"
	"strconv"

	"github.com/danjac/kanban/db"
	"github.com/gin-gonic/contrib/rest"
	"github.com/gin-gonic/gin"
)

type TaskApi struct {
	DB db.DataManager
}

func (api *TaskApi) MoveHandler(c *gin.Context) {

	taskId, _ := strconv.Atoi(c.Params.ByName("id"))
	newListId, _ := strconv.Atoi(c.Params.ByName("new_list_id"))

	if err := api.DB.MoveTask(taskId, newListId); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.String(http.StatusOK, statusOK)
}

func (api *TaskApi) DeleteHandler(c *gin.Context) {

	taskId, _ := strconv.Atoi(c.Params.ByName("id"))

	if err := api.DB.DeleteTask(taskId); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.String(http.StatusOK, statusOK)
}

func NewTaskApi(r *gin.RouterGroup, prefix string, dataMgr db.DataManager) *TaskApi {
	api := &TaskApi{dataMgr}

	rest.CRUD(r, prefix, api)

	r.PUT(prefix+":id/move/:new_list_id", api.MoveHandler)

	return api
}
