package api

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/danjac/kanban/db"
	"github.com/danjac/kanban/models"
	"github.com/gin-gonic/contrib/rest"
	"github.com/gin-gonic/gin"
)

var errNumError = errors.New("Invalid parameter")

func getIntParam(c *gin.Context, name string) (int64, error) {
	result, err := strconv.ParseInt(c.Params.ByName("id"), 10, 64)
	if err != nil {
		return result, errNumError
	}
	return result, nil
}

func handleError(c *gin.Context, err error) {
	switch err {
	case errNumError:
		c.AbortWithError(http.StatusBadRequest, err)
		break
	case sql.ErrNoRows:
		c.AbortWithStatus(http.StatusNotFound)
		break
	default:
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}

type TaskListApi struct {
	DB db.DataManager
}

func (api *TaskListApi) CreateHandler(c *gin.Context) {
	list := &models.TaskList{}

	if err := c.Bind(list); err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.CreateTaskList(list); err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, list)

}

func (api *TaskListApi) ListHandler(c *gin.Context) {
	taskLists, err := api.DB.GetTaskLists()
	if err != nil {
		handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"lists": taskLists})
}

func (api *TaskListApi) DeleteHandler(c *gin.Context) {

	listId, err := getIntParam(c, "id")
	if err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.DeleteTaskList(listId); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func (api *TaskListApi) AddTaskHandler(c *gin.Context) {

	listId, err := getIntParam(c, "id")
	if err != nil {
		handleError(c, err)
		return
	}

	task := &models.Task{TaskListId: listId}
	if err := c.Bind(task); err != nil {
		handleError(c, err)
		return
	}
	if err := api.DB.CreateTask(task); err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, task)
}

func NewTaskListApi(r *gin.RouterGroup, prefix string, dataMgr db.DataManager) *TaskListApi {
	api := &TaskListApi{dataMgr}

	rest.CRUD(r, prefix, api)
	r.POST(prefix+":id/add/", api.AddTaskHandler)
	return api
}

type TaskApi struct {
	DB db.DataManager
}

func (api *TaskApi) MoveHandler(c *gin.Context) {

	taskId, err := getIntParam(c, "id")

	if err != nil {
		handleError(c, err)
		return
	}

	newListId, err := getIntParam(c, "new_list_id")

	if err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.MoveTask(taskId, newListId); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func (api *TaskApi) DeleteHandler(c *gin.Context) {

	taskId, err := getIntParam(c, "id")
	if err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.DeleteTask(taskId); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func NewTaskApi(r *gin.RouterGroup, prefix string, dataMgr db.DataManager) *TaskApi {
	api := &TaskApi{dataMgr}

	rest.CRUD(r, prefix, api)

	r.PUT(prefix+":id/move/:new_list_id", api.MoveHandler)

	return api
}
