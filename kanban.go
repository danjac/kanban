package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"github.com/danjac/kanban/api"
	"github.com/danjac/kanban/database"
	_ "github.com/mattn/go-sqlite3"
)

var (
	dbName = flag.String("db", "/tmp/kanban.sqlite", "sqlite database filename")
	env    = flag.String("env", "prod", "environment ('prod' or 'dev')")
)

func main() {

	flag.Parse()

	r := gin.Default()

	r.LoadHTMLGlob("templates/*")

	r.Use(static.Serve("/static", static.LocalFile("static", false)))

	dbx, err := sqlx.Connect("sqlite3", *dbName)

	if err != nil {
		log.Fatal(err)
	}

	api.New(r, "/api/v1", db.New(dbx))

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{"env": *env})
	})

	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
