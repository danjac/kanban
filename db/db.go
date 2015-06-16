package db

import (
	"github.com/danjac/kanban/models"
	"gopkg.in/gorp.v1"
)

/*
TaskListManager handles tasklist related data
*/
type TaskListManager interface {
	CreateTaskList(*models.TaskList) error
	GetTaskLists() ([]models.TaskList, error)
	DeleteTaskList(int) error
	UpdateTaskList(int, string) error
	MoveTaskList(int, int) error
}

/*
TaskManager handles tasklist related data
*/
type TaskManager interface {
	DeleteTask(int) error
	CreateTask(*models.Task) error
	MoveTask(int, int) error
}

/*
DataManager handles all data layer functionality
*/
type DataManager interface {
	TaskListManager
	TaskManager
}

type defaultDataManager struct {
	*gorp.DbMap
}

/*
NewDataManager returns the default DataManager implementation instance
*/
func NewDataManager(dbMap *gorp.DbMap) DataManager {
	return &defaultDataManager{dbMap}
}

func (db *defaultDataManager) GetTaskLists() ([]models.TaskList, error) {
	var lists []models.TaskList
	if _, err := db.Select(&lists, "select * from tasklists order by ordering"); err != nil {
		return nil, err
	}
	var tasks []models.Task
	if _, err := db.Select(&tasks, "select * from tasks order by id desc"); err != nil {
		return nil, err
	}

	var result []models.TaskList

	for _, list := range lists {
		if list.Tasks == nil {
			list.Tasks = make([]models.Task, 0)
		}
		for _, task := range tasks {
			if list.ID == task.TaskListID {
				list.Tasks = append(list.Tasks, task)
			}
		}
		result = append(result, list)
	}

	return result, nil
}

func (db *defaultDataManager) UpdateTaskList(listID int, name string) error {
	_, err := db.Exec("update tasklists set name=? where id=?", name, listID)
	return err
}

func (db *defaultDataManager) DeleteTaskList(listID int) error {

	t, err := db.Begin()

	if err != nil {
		return err
	}

	if _, err := t.Exec("delete from tasklists where id=? ", listID); err != nil {
		return err
	}

	if _, err := t.Exec("delete from tasks where task_list_id=?", listID); err != nil {
		return err
	}

	return t.Commit()
}

func (db *defaultDataManager) CreateTaskList(list *models.TaskList) error {
	maxOrder, err := db.SelectInt("select max(ordering) from tasklists")
	if err != nil {
		maxOrder = 0
	}
	list.Ordering = int(maxOrder) + 1
	return db.Insert(list)
}

func (db *defaultDataManager) CreateTask(task *models.Task) error {
	return db.Insert(task)
}

func (db *defaultDataManager) MoveTaskList(listID int, targetListID int) error {

	selectSql := "select ordering from tasklists where id=?"
	updateSql := "update tasklists set ordering=? where id=?"

	ordering, err := db.SelectInt(selectSql, listID)
	if err != nil {
		return err
	}

	targetOrdering, err := db.SelectInt(selectSql, targetListID)
	if err != nil {
		return err
	}

	t, err := db.Begin()
	if err != nil {
		return err
	}

	if _, err := t.Exec(updateSql, targetOrdering, listID); err != nil {
		return err
	}

	if _, err := t.Exec(updateSql, ordering, targetListID); err != nil {
		return err
	}

	return t.Commit()

}

func (db *defaultDataManager) MoveTask(taskID int, newListID int) error {

	task := &models.Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskID); err != nil {
		return err
	}

	task.TaskListID = newListID

	_, err := db.Update(task)
	return err
}

func (db *defaultDataManager) DeleteTask(taskID int) error {
	task := &models.Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskID); err != nil {
		return err
	}

	_, err := db.Delete(task)
	return err

}
