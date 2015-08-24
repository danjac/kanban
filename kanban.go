package main

import (
	"database/sql"
	"flag"
	"log"
	"net/http"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"gopkg.in/gorp.v1"

	"github.com/danjac/kanban/api"
	"github.com/danjac/kanban/db"
	"github.com/danjac/kanban/models"
	_ "github.com/mattn/go-sqlite3"
)

var (
	dbName = flag.String("db", "/tmp/kanban.sqlite", "sqlite database filename")
	env    = flag.String("env", "prod", "environment ('prod' or 'dev')")
)

func initDB(dbName string) (*gorp.DbMap, error) {
	db, err := sql.Open("sqlite3", dbName)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	dbMap := &gorp.DbMap{Db: db, Dialect: gorp.SqliteDialect{}}
	dbMap.AddTableWithName(models.Card{}, "cards").SetKeys(true, "id")
	dbMap.AddTableWithName(models.Task{}, "tasks").SetKeys(true, "id")
	if err = dbMap.CreateTablesIfNotExists(); err != nil {
		return nil, err
	}
	return dbMap, nil
}

func main() {

	flag.Parse()

	r := gin.Default()

	r.LoadHTMLGlob("templates/*")

	r.Use(static.Serve("/static", static.LocalFile("static", false)))

	dbMap, err := initDB(*dbName)

	if err != nil {
		log.Fatal(err)
	}

	api.New(r, "/api/v1", db.New(dbMap))

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{"env": *env})
	})

	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
