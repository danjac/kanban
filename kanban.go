package main

import (
	"database/sql"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"gopkg.in/gorp.v1"

	"github.com/danjac/kanban/api"
	"github.com/danjac/kanban/db"
	"github.com/danjac/kanban/models"
	_ "github.com/mattn/go-sqlite3"
)

func initDB() *gorp.DbMap {
	db, err := sql.Open("sqlite3", "/tmp/kanban.sqlite")
	if err != nil {
		panic(err)
	}
	dbMap := &gorp.DbMap{Db: db, Dialect: gorp.SqliteDialect{}}
	dbMap.AddTableWithName(models.TaskList{}, "tasklists").SetKeys(true, "id")
	dbMap.AddTableWithName(models.Task{}, "tasks").SetKeys(true, "id")
	if err = dbMap.CreateTablesIfNotExists(); err != nil {
		panic(err)
	}
	return dbMap
}

func main() {

	dbMap := initDB()
	dataManager := db.NewDataManager(dbMap)

	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("static", false)))

	apiGroup := r.Group("/api/v1")

	api.NewTaskListApi(apiGroup, "/board/", dataManager)
	api.NewTaskApi(apiGroup, "/task/", dataManager)

	r.Run(":8080")
}
