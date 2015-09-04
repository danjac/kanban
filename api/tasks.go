package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func moveTask(c *gin.Context) {

	taskID, err := pInt64(c, "id")

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	newListID, err := pInt64(c, "new_list_id")

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := getDB(c).Tasks.Move(taskID, newListID); err != nil {
		if err == sql.ErrNoRows {
			c.AbortWithStatus(http.StatusNotFound)
		} else {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.String(http.StatusOK, statusOK)
}

func deleteTask(c *gin.Context) {

	taskID, err := pInt64(c, "id")

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := getDB(c).Tasks.Delete(taskID); err != nil {
		if err == sql.ErrNoRows {
			c.AbortWithStatus(http.StatusNotFound)
		} else {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.String(http.StatusOK, statusOK)
}

func taskRoutes(api *gin.RouterGroup, prefix string) {

	g := api.Group(prefix)
	{
		g.DELETE(":id", deleteTask)
		g.PUT(":id/move/:new_list_id", moveTask)
	}
}
