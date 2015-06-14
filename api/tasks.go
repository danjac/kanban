package api

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/danjac/kanban/db"
	"github.com/gin-gonic/contrib/rest"
	"github.com/gin-gonic/gin"
)

/*
TaskAPI represents a set of task-related routes
*/
type TaskAPI struct {
	DB db.DataManager
}

/*
MoveHandler moves a task from one list to another
*/
func (api *TaskAPI) MoveHandler(c *gin.Context) {

	taskID, err := strconv.Atoi(c.Params.ByName("ID"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	newListID, err := strconv.Atoi(c.Params.ByName("new_list_ID"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := api.DB.MoveTask(taskID, newListID); err != nil {
		if err == sql.ErrNoRows {
			c.AbortWithStatus(http.StatusNotFound)
		} else {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.String(http.StatusOK, statusOK)
}

/*
DeleteHandler removes a task
*/
func (api *TaskAPI) DeleteHandler(c *gin.Context) {

	taskID, err := strconv.Atoi(c.Params.ByName("ID"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := api.DB.DeleteTask(taskID); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, statusOK)
}

/*
NewTaskAPI returns a new TaskAPI instance
*/
func NewTaskAPI(g *gin.RouterGroup, prefix string, dataMgr db.DataManager) *TaskAPI {
	api := &TaskAPI{dataMgr}

	rest.CRUD(g, prefix, api)

	g.PUT(prefix+":ID/move/:new_list_ID", api.MoveHandler)

	return api
}
