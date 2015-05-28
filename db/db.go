package db

import (
	"github.com/danjac/kanban/models"
	"gopkg.in/gorp.v1"
)

type DataManager interface {
	GetTaskLists() ([]models.TaskList, error)
	DeleteTaskList(int64) error
	UpdateTaskList(*models.TaskList) error
	DeleteTask(int64) error
	CreateTaskList(*models.TaskList) error
	CreateTask(*models.Task) error
	MoveTask(int64, int64) error
}

type sqliteDataManager struct {
	*gorp.DbMap
}

func NewDataManager(dbMap *gorp.DbMap) DataManager {
	return &sqliteDataManager{dbMap}
}

func (db *sqliteDataManager) GetTaskLists() ([]models.TaskList, error) {
	var lists []models.TaskList
	if _, err := db.Select(&lists, "select * from tasklists order by id desc"); err != nil {
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
			if list.Id == task.TaskListId {
				list.Tasks = append(list.Tasks, task)
			}
		}
		result = append(result, list)
	}

	return result, nil
}

func (db *sqliteDataManager) UpdateTaskList(list *models.TaskList) error {
	_, err := db.Update(list)
	return err
}

func (db *sqliteDataManager) DeleteTaskList(listId int64) error {
	list := &models.TaskList{}

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

func (db *sqliteDataManager) CreateTaskList(list *models.TaskList) error {
	return db.Insert(list)
}

func (db *sqliteDataManager) CreateTask(task *models.Task) error {
	return db.Insert(task)
}

func (db *sqliteDataManager) MoveTask(taskId int64, newListId int64) error {

	task := &models.Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskId); err != nil {
		return err
	}

	task.TaskListId = newListId

	_, err := db.Update(task)
	return err
}

func (db *sqliteDataManager) DeleteTask(taskId int64) error {
	task := &models.Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskId); err != nil {
		return err
	}

	_, err := db.Delete(task)
	return err

}
