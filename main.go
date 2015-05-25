package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

type Task struct {
	Text string `json:"text", required:true`
}

type TaskList struct {
	Name  string  `json:"name", required:true`
	Tasks []*Task `json:"tasks"`
}

func (list *TaskList) Len() int {
	return len(list.Tasks)
}

func (list *TaskList) AddTask(task *Task) *Task {
	list.Tasks = append(list.Tasks, task)
	return task
}

func (list *TaskList) DeleteTask(taskID int64) *Task {
	if int(taskID) > list.Len()-1 {
		return nil
	}
	task := list.Tasks[taskID]
	list.Tasks = append(list.Tasks[:taskID], list.Tasks[taskID+1:]...)
	return task
}

func NewTaskList(name string) *TaskList {
	list := &TaskList{Name: name}
	list.Tasks = make([]*Task, 0)
	return list
}

type Board map[string]*TaskList

func (board Board) GetTaskLists() []*TaskList {
	lists := make([]*TaskList, 0, len(board))
	for _, value := range board {
		lists = append(lists, value)
	}
	return lists
}

func (board Board) AddTaskList(list *TaskList) *TaskList {
	board[list.Name] = list
	return list
}

var DB Board

func initBoard() Board {
	board := make(Board)

	todo := board.AddTaskList(NewTaskList("Todo"))
	todo.AddTask(&Task{"Write example React app"})
	todo.AddTask(&Task{"Write some documentation"})

	done := board.AddTaskList(NewTaskList("Done"))
	done.AddTask(&Task{"Learn the basics of React"})

	return board
}

func getIntParam(c *gin.Context, param string) int64 {
	num, err := strconv.ParseInt(c.Params.ByName(param), 10, 64)
	if err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return -1
	}
	return num
}

func getTaskList(c *gin.Context, param string) *TaskList {

	listID := c.Params.ByName(param)
	if listID == "" {
		return nil
	}

	list, ok := DB[listID]
	if !ok {
		c.AbortWithStatus(http.StatusNotFound)
		return nil
	}
	return list

}

func main() {
	DB = initBoard()

	r := gin.Default()

	r.Use(static.Serve("/", static.LocalFile("static", false)))

	api := r.Group("/api/v1")

	api.GET("/board/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"lists": DB.GetTaskLists()})
	})

	api.POST("/board/", func(c *gin.Context) {

		s := &struct {
			Name string `json:"name",required:true`
		}{}

		if err := c.Bind(s); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		DB.AddTaskList(NewTaskList(s.Name))

		c.String(http.StatusOK, "ok")
	})

	api.PUT("/move/:list_id/:new_list_id/:task_id", func(c *gin.Context) {
		oldList := getTaskList(c, "list_id")
		if oldList == nil {
			return
		}
		newList := getTaskList(c, "new_list_id")
		if newList == nil {
			return
		}
		taskId := getIntParam(c, "task_id")
		if taskId == -1 {
			return
		}
		task := oldList.DeleteTask(taskId)
		newList.AddTask(task)
		c.String(http.StatusOK, "ok")
	})

	api.PUT("/task/:id/", func(c *gin.Context) {

		list := getTaskList(c, "id")
		if list == nil {
			return
		}

		var task Task

		if err := c.Bind(&task); err != nil {
			c.AbortWithError(http.StatusBadRequest, err)
			return
		}

		list.AddTask(&task)
		c.String(http.StatusOK, "ok")

	})

	api.DELETE("/:list_id/task/:task_id/", func(c *gin.Context) {

		list := getTaskList(c, "list_id")

		if list == nil {
			return
		}

		taskID := getIntParam(c, "task_id")
		if taskID == -1 {
			return
		}
		list.DeleteTask(taskID)
		c.String(http.StatusOK, "ok")
	})

	r.Run(":8080")
}
