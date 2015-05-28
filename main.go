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
	Id    int64  `db:"id"  json:"id"`
	Name  string `db:"name" json:"name" required:true`
	Tasks []Task `db:"-" json:"tasks"`
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

func handleError(c *gin.Context, err error) {
	switch err {
	case strconv.NumError:
		c.AbortWithError(http.StatusBadRequest, err)
		break
	case sql.ErrNoRows:
		c.AbortWithStatus(http.StatusNotFound)
		break
	default:
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}

type TaskListApi struct {
	DB *gorp.DbMap
}

func (api *TaskListApi) CreateHandler(c *gin.Context) {
	list := &TaskList{}

	if err := c.Bind(list); err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.Insert(list); err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, list)

}

func (api *TaskListApi) ListHandler(c *gin.Context) {
	var lists []TaskList
	if _, err := api.DB.Select(&lists, "select * from tasklists order by id desc"); err != nil {
		handleError(c, err)
		return
	}
	var tasks []Task
	if _, err := api.DB.Select(&tasks, "select * from tasks order by id desc"); err != nil {
		handleError(c, err)
		return
	}

	var result []TaskList

	for _, list := range lists {
		if list.Tasks == nil {
			list.Tasks = make([]Task, 0)
		}
		for _, task := range tasks {
			if list.Id == task.TaskListId {
				list.Tasks = append(list.Tasks, task)
			}
		}
		result = append(result, list)
	}

	c.JSON(http.StatusOK, gin.H{"lists": result})
}

func (api *TaskListApi) DeleteHandler(c *gin.Context) {

	list := &TaskList{}
	listId := c.Params.ByName("id")

	if err := api.DB.SelectOne(list, "select * from tasklists where id=?", listId); err != nil {
		handleError(c, err)
		return
	}

	if _, err := api.DB.Delete(list); err != nil {
		handleError(c, err)
		return
	}

	if _, err := api.DB.Exec("delete from tasks where task_list_id=?", listId); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func (api *TaskListApi) AddTaskHandler(c *gin.Context) {

	listId, err := strconv.ParseInt(c.Params.ByName("id"), 10, 64)
	if err != nil {
		handleError(c, err)
		return
	}

	task := &Task{TaskListId: listId}
	if err := c.Bind(task); err != nil {
		handleError(c, err)
		return
	}
	if err := api.DB.Insert(task); err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, task)
}

func NewTaskListApi(r *gin.RouterGroup, prefix string, dbMap *gorp.DbMap) *TaskListApi {
	api := &TaskListApi{dbMap}

	rest.CRUD(r, prefix, api)
	r.PUT(prefix+":id/add/", api.AddTaskHandler)
	return api
}

type TaskApi struct {
	DB *gorp.DbMap
}

func (api *TaskApi) MoveHandler(c *gin.Context) {
	task := &Task{}

	taskId, err := strconv.ParseInt(c.Params.ByName("id"), 10, 64)

	if err != nil {
		handleError(c, err)
		return
	}

	if err := dbMap.SelectOne(task, "select * from tasks where id=?", taskId); err != nil {
		handleError(c, err)
		return
	}

	newListId, err := strconv.ParseInt(c.Params.ByName("new_list_id"), 10, 64)

	if err != nil {
		handleError(c, err)
		return
	}

	task.TaskListId = newListId
	if _, err := dbMap.Update(task); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func (api *TaskApi) DeleteHandler(c *gin.Context) {
	task := &Task{}

	if err := api.DB.SelectOne(task, "select * from tasks where id=?", c.Params.ByName("id")); err != nil {
		handleError(c, err)
		return
	}

	if _, err := api.DB.Delete(task); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func NewTaskApi(r *gin.RouterGroup, prefix string, dbMap *gorp.DbMap) *TaskApi {
	api := &TaskApi{dbMap}

	rest.CRUD(r, prefix, api)

	r.PUT(prefix+":id/move/:new_list_id", api.MoveHandler)

	return api
}

func main() {

	dbMap := initDB()
	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("static", false)))

	api := r.Group("/api/v1")

	NewTaskListApi(api, "/board/", dbMap)
	NewTaskApi(api, "/task/", dbMap)

	r.Run(":8080")
}
