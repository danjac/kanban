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

var dbName = flag.String("db", "/tmp/kanban.sqlite", "sqlite database filename")

func initDB(dbName string) (*gorp.DbMap, error) {
	db, err := sql.Open("sqlite3", dbName)
	if err != nil {
		return nil, err
	}
	dbMap := &gorp.DbMap{Db: db, Dialect: gorp.SqliteDialect{}}
	dbMap.AddTableWithName(models.TaskList{}, "tasklists").SetKeys(true, "id")
	dbMap.AddTableWithName(models.Task{}, "tasks").SetKeys(true, "id")
	if err = dbMap.CreateTablesIfNotExists(); err != nil {
		return nil, err
	}
	return dbMap, nil
}

func main() {

	flag.Parse()

	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("static", false)))

	dbMap, err := initDB(*dbName)

	if err != nil {
		panic(err)
	}

	api.New(r, "/api/v1", db.NewDataManager(dbMap))

	r.Run(":8080")
}
