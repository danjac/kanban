package api

import (
	"net/http"

	"github.com/danjac/kanban/db"
	"github.com/danjac/kanban/models"
	"github.com/gin-gonic/contrib/rest"
	"github.com/gin-gonic/gin"
)

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

func (api *TaskListApi) UpdateHandler(c *gin.Context) {

	listId, err := getIntParam(c, "id")
	if err != nil {
		handleError(c, err)
		return
	}
	list := &models.TaskList{Id: listId}

	if err := c.Bind(list); err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.UpdateTaskList(list); err != nil {
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
