package main

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/contrib/rest"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"gopkg.in/gorp.v1"

	_ "github.com/mattn/go-sqlite3"
)

type Task struct {
	Id         int64  `db:"id" json:"id"`
	TaskListId int64  `db:"task_list_id" json:"-"`
	Text       string `db:"text" json:"text" required:true`
}

type TaskList struct {
	Id    int64   `db:"id"  json:"id"`
	Name  string  `db:"name" json:"name" required:true`
	Tasks []*Task `db:"-" json:"tasks"`
}

func initDB() *gorp.DbMap {
	db, err := sql.Open("sqlite3", "/tmp/kanban.sqlite")
	if err != nil {
		panic(err)
	}
	dbMap := &gorp.DbMap{Db: db, Dialect: gorp.SqliteDialect{}}
	dbMap.AddTableWithName(TaskList{}, "tasklists").SetKeys(true, "id")
	dbMap.AddTableWithName(Task{}, "tasks").SetKeys(true, "id")
	if err = dbMap.CreateTablesIfNotExists(); err != nil {
		panic(err)
	}
	return dbMap
}

type TaskListApi struct {
	DB *gorp.DbMap
}

func (api *TaskListApi) CreateHandler(c *gin.Context) {
	list := &TaskList{}

	if err := c.Bind(list); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if err := api.DB.Insert(list); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, list)

}

func (api *TaskListApi) ListHandler(c *gin.Context) {
	var lists []TaskList
	if _, err := api.DB.Select(&lists, "select * from tasklists order by id desc"); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	var tasks []Task
	if _, err := api.DB.Select(&tasks, "select * from tasks order by id desc"); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	var result []TaskList

	for _, list := range lists {
		if list.Tasks == nil {
			list.Tasks = make([]*Task, 0)
		}
		for _, task := range tasks {
			if list.Id == task.TaskListId {
				list.Tasks = append(list.Tasks, &task)
			}
		}
		result = append(result, list)
	}

	c.JSON(http.StatusOK, gin.H{"lists": result})
}

func (api *TaskListApi) DeleteHandler(c *gin.Context) {
	list := &TaskList{}

	if err := api.DB.SelectOne(list, "select * from tasklists where id=?", c.Params.ByName("id")); err != nil {
		switch err {
		case sql.ErrNoRows:
			c.AbortWithStatus(http.StatusNotFound)
			return
		default:
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	}

	if _, err := api.DB.Delete(list); err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func main() {

	dbMap := initDB()
	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("static", false)))

	api := r.Group("/api/v1")
	rest.CRUD(api, "/board/", &TaskListApi{dbMap})

	api.PUT("/move/:task_id/:new_list_id", func(c *gin.Context) {

		task := &Task{}
		if err := dbMap.SelectOne(task, "select * from tasks where id=?", c.Params.ByName("task_id")); err != nil {
			switch err {
			case sql.ErrNoRows:
				c.AbortWithStatus(http.StatusNotFound)
				return
			default:
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
		}
		newListId, err := strconv.ParseInt(c.Params.ByName("new_list_id"), 10, 64)
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		task.TaskListId = newListId
		if _, err := dbMap.Update(task); err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		c.String(http.StatusOK, "ok")
	})

	api.PUT("/task/:id/", func(c *gin.Context) {
		listId, err := strconv.ParseInt(c.Params.ByName("id"), 10, 64)
		if err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		task := &Task{TaskListId: listId}
		if err := c.Bind(task); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}
		if err := dbMap.Insert(task); err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		c.JSON(http.StatusOK, task)
	})

	api.DELETE("task/:id/", func(c *gin.Context) {
		task := &Task{}
		if err := dbMap.SelectOne(task, "select * from tasks where id=?", c.Params.ByName("id")); err != nil {
			switch err {
			case sql.ErrNoRows:
				c.AbortWithStatus(http.StatusNotFound)
				return
			default:
				c.AbortWithError(http.StatusInternalServerError, err)
				return
			}
		}

		if _, err := dbMap.Delete(task); err != nil {
			c.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		c.String(http.StatusOK, "ok")
	})

	r.Run(":8080")
}
