package main

import (
	"database/sql"
	"flag"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"gopkg.in/gorp.v1"

	"github.com/danjac/kanban/api"
	"github.com/danjac/kanban/db"
	"github.com/danjac/kanban/models"
	_ "github.com/mattn/go-sqlite3"
)

func initDB(dbName string) *gorp.DbMap {
	db, err := sql.Open("sqlite3", dbName)
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

var dbName = flag.String("db", "/tmp/kanban.sqlite", "sqlite database filename")

func main() {

	flag.Parse()

	dbMap := initDB(*dbName)

	dataManager := db.NewDataManager(dbMap)

	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("static", false)))

	api.New(r, "/api/v1", dataManager)

	r.Run(":8080")
}
