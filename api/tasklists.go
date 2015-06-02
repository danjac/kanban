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
		return
	}

	if err := api.DB.CreateTaskList(list); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.JSON(http.StatusOK, list)

}

func (api *TaskListApi) ListHandler(c *gin.Context) {
	taskLists, err := api.DB.GetTaskLists()
	if err != nil {
		abortWithSqlErr(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"lists": taskLists})
}

func (api *TaskListApi) DeleteHandler(c *gin.Context) {

	listId, err := int64Param(c, "id")
	if err != nil {
		return
	}

	if err := api.DB.DeleteTaskList(listId); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.String(http.StatusOK, OK)
}

func (api *TaskListApi) MoveHandler(c *gin.Context) {

	listId, err := int64Param(c, "id")
	if err != nil {
		return
	}

	targetListId, err := int64Param(c, "target_list_id")
	if err != nil {
		abortWithSqlErr(c, err)
		return
	}

	if err := api.DB.MoveTaskList(listId, targetListId); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.String(http.StatusOK, OK)

}

func (api *TaskListApi) UpdateHandler(c *gin.Context) {

	listId, err := int64Param(c, "id")
	if err != nil {
		abortWithSqlErr(c, err)
		return
	}

	s := &struct {
		Name string `json:"name" binding:"required"`
	}{}

	if err := c.Bind(s); err != nil {
		return
	}

	if err := api.DB.UpdateTaskList(listId, s.Name); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.String(http.StatusOK, OK)

}

func (api *TaskListApi) AddTaskHandler(c *gin.Context) {

	listId, err := int64Param(c, "id")
	if err != nil {
		return
	}

	task := &models.Task{TaskListId: listId}
	if err := c.Bind(task); err != nil {
		return
	}
	if err := api.DB.CreateTask(task); err != nil {
		abortWithSqlErr(c, err)
		return
	}

	c.JSON(http.StatusOK, task)
}

func NewTaskListApi(r *gin.RouterGroup, prefix string, dataMgr db.DataManager) *TaskListApi {
	api := &TaskListApi{dataMgr}

	rest.CRUD(r, prefix, api)
	r.PUT(prefix+":id/move/:target_list_id", api.MoveHandler)
	r.POST(prefix+":id/add/", api.AddTaskHandler)
	return api
}
