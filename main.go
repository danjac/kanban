package main

import (
	"database/sql"
	"errors"
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

var errNumError = errors.New("Invalid parameter")

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

func getIntParam(c *gin.Context, name string) (int64, error) {
	result, err := strconv.ParseInt(c.Params.ByName("id"), 10, 64)
	if err != nil {
		return result, errNumError
	}
	return result, nil
}

func handleError(c *gin.Context, err error) {
	switch err {
	case errNumError:
		c.AbortWithError(http.StatusBadRequest, err)
		break
	case sql.ErrNoRows:
		c.AbortWithStatus(http.StatusNotFound)
		break
	default:
		c.AbortWithError(http.StatusInternalServerError, err)
	}
}

type DataManager interface {
	GetTaskLists() ([]TaskList, error)
	DeleteTaskList(int64) error
	DeleteTask(int64) error
	CreateTaskList(*TaskList) error
	CreateTask(*Task) error
	MoveTask(int64, int64) error
}

type SqliteDataManager struct {
	*gorp.DbMap
}

func (db *SqliteDataManager) GetTaskLists() ([]TaskList, error) {
	var lists []TaskList
	if _, err := db.Select(&lists, "select * from tasklists order by id desc"); err != nil {
		return nil, err
	}
	var tasks []Task
	if _, err := db.Select(&tasks, "select * from tasks order by id desc"); err != nil {
		return nil, err
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

	return result, nil
}

func (db *SqliteDataManager) DeleteTaskList(listId int64) error {
	list := &TaskList{}

	if err := db.SelectOne(list, "select * from tasklists where id=?", listId); err != nil {
		return err
	}

	if _, err := db.Delete(list); err != nil {
		return err
	}

	if _, err := db.Exec("delete from tasks where task_list_id=?", listId); err != nil {
		return err
	}
	return nil
}

func (db *SqliteDataManager) CreateTaskList(list *TaskList) error {
	return db.Insert(list)
}

func (db *SqliteDataManager) CreateTask(task *Task) error {
	return db.Insert(task)
}

func (db *SqliteDataManager) MoveTask(taskId int64, newListId int64) error {

	task := &Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskId); err != nil {
		return err
	}

	task.TaskListId = newListId

	_, err := db.Update(task)
	return err
}

func (db *SqliteDataManager) DeleteTask(taskId int64) error {
	task := &Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskId); err != nil {
		return err
	}

	_, err := db.Delete(task)
	return err

}

type TaskListApi struct {
	DB DataManager
}

func (api *TaskListApi) CreateHandler(c *gin.Context) {
	list := &TaskList{}

	if err := c.Bind(list); err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.CreateTaskList(list); err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, list)

}

func (api *TaskListApi) ListHandler(c *gin.Context) {
	taskLists, err := api.DB.GetTaskLists()
	if err != nil {
		handleError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"lists": taskLists})
}

func (api *TaskListApi) DeleteHandler(c *gin.Context) {

	listId, err := getIntParam(c, "id")
	if err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.DeleteTaskList(listId); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func (api *TaskListApi) AddTaskHandler(c *gin.Context) {

	listId, err := getIntParam(c, "id")
	if err != nil {
		handleError(c, err)
		return
	}

	task := &Task{TaskListId: listId}
	if err := c.Bind(task); err != nil {
		handleError(c, err)
		return
	}
	if err := api.DB.CreateTask(task); err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, task)
}

func NewTaskListApi(r *gin.RouterGroup, prefix string, db DataManager) *TaskListApi {
	api := &TaskListApi{db}

	rest.CRUD(r, prefix, api)
	r.POST(prefix+":id/add/", api.AddTaskHandler)
	return api
}

type TaskApi struct {
	DB DataManager
}

func (api *TaskApi) MoveHandler(c *gin.Context) {

	taskId, err := getIntParam(c, "id")

	if err != nil {
		handleError(c, err)
		return
	}

	newListId, err := getIntParam(c, "new_list_id")

	if err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.MoveTask(taskId, newListId); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func (api *TaskApi) DeleteHandler(c *gin.Context) {

	taskId, err := getIntParam(c, "id")
	if err != nil {
		handleError(c, err)
		return
	}

	if err := api.DB.DeleteTask(taskId); err != nil {
		handleError(c, err)
		return
	}

	c.String(http.StatusOK, "ok")
}

func NewTaskApi(r *gin.RouterGroup, prefix string, db DataManager) *TaskApi {
	api := &TaskApi{db}

	rest.CRUD(r, prefix, api)

	r.PUT(prefix+":id/move/:new_list_id", api.MoveHandler)

	return api
}

func main() {

	dbMap := initDB()
	dataManager := &SqliteDataManager{dbMap}

	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("static", false)))

	api := r.Group("/api/v1")

	NewTaskListApi(api, "/board/", dataManager)
	NewTaskApi(api, "/task/", dataManager)

	r.Run(":8080")
}
