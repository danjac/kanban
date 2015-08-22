package api

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/danjac/kanban/models"
	"github.com/gin-gonic/gin"
)

func addTaskList(c *gin.Context) {

	list := &models.TaskList{}

	if err := c.Bind(list); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := getDB(c).TaskLists.Create(list); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, list)

}

func getTaskLists(c *gin.Context) {
	taskLists, err := getDB(c).TaskLists.Get()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"lists": taskLists})
}

func deleteTaskList(c *gin.Context) {

	listID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	if err := getDB(c).TaskLists.Delete(listID); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, statusOK)
}

/*
MoveHandler changes the position of a task list
*/
func moveTaskList(c *gin.Context) {
	listID, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	targetListID, err := strconv.Atoi(c.Param("target_list_id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := getDB(c).TaskLists.Move(listID, targetListID); err != nil {
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
func updateTaskList(c *gin.Context) {

	listID, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	s := &struct {
		Name string `json:"name" binding:"required,max=60"`
	}{}

	if err := c.Bind(s); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := getDB(c).TaskLists.Update(listID, s.Name); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, statusOK)

}

/*
AddTaskHandler adds a new task to a task list
*/
func addTask(c *gin.Context) {

	listID, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	task := &models.Task{TaskListID: listID}
	if err := c.Bind(task); err != nil {
		return
	}
	if err := getDB(c).Tasks.Create(task); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, task)
}

func taskListRoutes(api *gin.RouterGroup, prefix string) {

	g := api.Group(prefix)
	{
		g.GET("", getTaskLists)
		g.POST("", addTaskList)
		g.DELETE(":id", deleteTaskList)
		g.PUT(":id", updateTaskList)
		g.PUT(":id/move/:target_list_id", moveTaskList)
		g.POST(":id/add/", addTask)
	}

}
