package api

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/danjac/kanban/models"
	"github.com/gin-gonic/gin"
)

func addCard(c *gin.Context) {

	card := &models.Card{}

	if err := c.Bind(card); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := getDB(c).Cards.Create(card); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	card.Tasks = make([]models.Task, 0)

	c.JSON(http.StatusOK, card)

}

func getCards(c *gin.Context) {
	cards, err := getDB(c).Cards.Get()
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"cards": cards})
}

func deleteCard(c *gin.Context) {

	cardID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}
	if err := getDB(c).Cards.Delete(cardID); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

}

func moveCard(c *gin.Context) {
	cardID, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	targetCardID, err := strconv.Atoi(c.Param("target_id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := getDB(c).Cards.Move(cardID, targetCardID); err != nil {
		if err == sql.ErrNoRows {
			c.AbortWithStatus(http.StatusNotFound)
		} else {
			c.AbortWithError(http.StatusInternalServerError, err)
		}
		return
	}

	c.String(http.StatusOK, statusOK)

}

func updateCard(c *gin.Context) {

	cardID, err := strconv.Atoi(c.Param("id"))

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

	if err := getDB(c).Cards.Update(cardID, s.Name); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, statusOK)

}

func addTask(c *gin.Context) {

	cardID, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	task := &models.Task{CardID: cardID}
	if err := c.Bind(task); err != nil {
		return
	}
	if err := getDB(c).Tasks.Create(task); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, task)
}

func cardRoutes(api *gin.RouterGroup, prefix string) {

	g := api.Group(prefix)
	{
		g.GET("", getCards)
		g.POST("", addCard)
		g.DELETE(":id", deleteCard)
		g.PUT(":id", updateCard)
		g.PUT(":id/move/:target_id", moveCard)
		g.POST(":id/add/", addTask)
	}

}
