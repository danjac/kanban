package api

import (
	"database/sql"
	"net/http"
	"strconv"

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
		return
	}

	if err := api.DB.CreateTaskList(list); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, list)

}

func (api *TaskListApi) ListHandler(c *gin.Context) {
	taskLists, err := api.DB.GetTaskLists()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"lists": taskLists})
}

func (api *TaskListApi) DeleteHandler(c *gin.Context) {

	listId, _ := strconv.Atoi(c.Params.ByName("id"))
	if err := api.DB.DeleteTaskList(listId); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, statusOK)
}

func (api *TaskListApi) MoveHandler(c *gin.Context) {

	listId, _ := strconv.Atoi(c.Params.ByName("id"))
	targetListId, _ := strconv.Atoi(c.Params.ByName("target_list_id"))

	if err := api.DB.MoveTaskList(listId, targetListId); err != nil {
		if err == sql.ErrNoRows {
			c.AbortWithStatus(http.StatusNotFound)
		} else {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.String(http.StatusOK, statusOK)

}

func (api *TaskListApi) UpdateHandler(c *gin.Context) {

	listId, _ := strconv.Atoi(c.Params.ByName("id"))

	s := &struct {
		Name string `json:"name" binding:"required"`
	}{}

	if err := c.Bind(s); err != nil {
		return
	}

	if err := api.DB.UpdateTaskList(listId, s.Name); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, statusOK)

}

func (api *TaskListApi) AddTaskHandler(c *gin.Context) {

	listId, _ := strconv.Atoi(c.Params.ByName("id"))

	task := &models.Task{TaskListId: listId}
	if err := c.Bind(task); err != nil {
		return
	}
	if err := api.DB.CreateTask(task); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, task)
}

func NewTaskListApi(g *gin.RouterGroup, prefix string, dataMgr db.DataManager) *TaskListApi {
	api := &TaskListApi{dataMgr}

	rest.CRUD(g, prefix, api)
	g.PUT(prefix+":id/move/:target_list_id", api.MoveHandler)
	g.POST(prefix+":id/add/", api.AddTaskHandler)
	return api
}
