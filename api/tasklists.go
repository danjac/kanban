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

/*
TaskListAPI manages all routes for task lists
*/
type TaskListAPI struct {
	DB *db.DB
}

/*
CreateHandler creates a new task list
*/
func (api *TaskListAPI) CreateHandler(c *gin.Context) {

	list := &models.TaskList{}

	if err := c.Bind(list); err != nil {
		return
	}

	if err := api.DB.TaskLists.Create(list); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, list)

}

/*
ListHandler retrieves a list of task lists
*/
func (api *TaskListAPI) ListHandler(c *gin.Context) {
	taskLists, err := api.DB.TaskLists.Get()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"lists": taskLists})
}

/*
DeleteHandler removes a tasklist and all its tasks
*/
func (api *TaskListAPI) DeleteHandler(c *gin.Context) {

	listID, err := strconv.Atoi(c.Params.ByName("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
	}
	if err := api.DB.TaskLists.Delete(listID); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, statusOK)
}

/*
MoveHandler changes the position of a task list
*/
func (api *TaskListAPI) MoveHandler(c *gin.Context) {
	listID, err := strconv.Atoi(c.Params.ByName("id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
	}

	targetListID, err := strconv.Atoi(c.Params.ByName("target_list_id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
	}

	if err := api.DB.TaskLists.Move(listID, targetListID); err != nil {
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
UpdateHandler changes the details of a task list
*/
func (api *TaskListAPI) UpdateHandler(c *gin.Context) {

	listID, err := strconv.Atoi(c.Params.ByName("id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
	}

	s := &struct {
		Name string `json:"name" binding:"required"`
	}{}

	if err := c.Bind(s); err != nil {
		return
	}

	if err := api.DB.TaskLists.Update(listID, s.Name); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, statusOK)

}

/*
AddTaskHandler adds a new task to a task list
*/
func (api *TaskListAPI) AddTaskHandler(c *gin.Context) {

	listID, err := strconv.Atoi(c.Params.ByName("id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
	}

	task := &models.Task{TaskListID: listID}
	if err := c.Bind(task); err != nil {
		return
	}
	if err := api.DB.Tasks.Create(task); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, task)
}

/*
NewTaskListAPI creates a new set of task list routes
*/
func NewTaskListAPI(g *gin.RouterGroup, prefix string, db *db.DB) *TaskListAPI {
	api := &TaskListAPI{db}

	rest.CRUD(g, prefix, api)
	g.PUT(prefix+":id/move/:target_list_id", api.MoveHandler)
	g.POST(prefix+":id/add/", api.AddTaskHandler)
	return api
}
