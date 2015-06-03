package db

import (
	"github.com/danjac/kanban/models"
	"gopkg.in/gorp.v1"
)

type DataManager interface {
	GetTaskLists() ([]models.TaskList, error)
	DeleteTaskList(int) error
	UpdateTaskList(int, string) error
	DeleteTask(int) error
	CreateTaskList(*models.TaskList) error
	CreateTask(*models.Task) error
	MoveTask(int, int) error
	MoveTaskList(int, int) error
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

func (db *sqliteDataManager) UpdateTaskList(listId int, name string) error {
	_, err := db.Exec("update tasklists set name=? where id=?", name, listId)
	return err
}

func (db *sqliteDataManager) DeleteTaskList(listId int) error {
	list := &models.TaskList{}

	if err := db.SelectOne(list, "select * from tasklists where id=? order by ordering desc", listId); err != nil {
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
	maxOrder, err := db.SelectInt("select max(ordering) from tasklists")
	if err != nil {
		maxOrder = 0
	}
	list.Ordering = int(maxOrder) + 1
	return db.Insert(list)
}

func (db *sqliteDataManager) CreateTask(task *models.Task) error {
	return db.Insert(task)
}

func (db *sqliteDataManager) MoveTaskList(listId int, targetListId int) error {

	selectSql := "select ordering from tasklists where id=?"
	updateSql := "update tasklists set ordering=? where id=?"

	ordering, err := db.SelectInt(selectSql, listId)
	if err != nil {
		return err
	}

	targetOrdering, err := db.SelectInt(selectSql, targetListId)
	if err != nil {
		return err
	}

	if _, err := db.Exec(updateSql, targetOrdering, listId); err != nil {
		return err
	}

	if _, err := db.Exec(updateSql, ordering, targetListId); err != nil {
		return err
	}

	return nil

}

func (db *sqliteDataManager) MoveTask(taskId int, newListId int) error {

	task := &models.Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskId); err != nil {
		return err
	}

	task.TaskListId = newListId

	_, err := db.Update(task)
	return err
}

func (db *sqliteDataManager) DeleteTask(taskId int) error {
	task := &models.Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskId); err != nil {
		return err
	}

	_, err := db.Delete(task)
	return err

}
