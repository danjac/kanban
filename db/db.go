package db

import (
	"github.com/danjac/kanban/models"
	"gopkg.in/gorp.v1"
)

type DataManager interface {
	GetTaskLists() ([]models.TaskList, error)
	DeleteTaskList(int64) error
	UpdateTaskList(int64, string) error
	DeleteTask(int64) error
	CreateTaskList(*models.TaskList) error
	CreateTask(*models.Task) error
	MoveTask(int64, int64) error
	MoveTaskList(int64, int64) error
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

func (db *sqliteDataManager) UpdateTaskList(listId int64, name string) error {
	_, err := db.Exec("update tasklists set name=? where id=?", name, listId)
	return err
}

func (db *sqliteDataManager) DeleteTaskList(listId int64) error {
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
	list.Ordering = maxOrder + 1
	return db.Insert(list)
}

func (db *sqliteDataManager) CreateTask(task *models.Task) error {
	return db.Insert(task)
}

func (db *sqliteDataManager) MoveTaskList(listId int64, targetListId int64) error {

	var (
		list       models.TaskList
		targetList models.TaskList
	)

	if err := db.SelectOne(&list, "select * from tasklists where id=?", listId); err != nil {
		return err
	}

	if err := db.SelectOne(&targetList, "select * from tasklists where id=?", targetListId); err != nil {
		return err
	}

	ordering := list.Ordering
	targetOrdering := targetList.Ordering

	list.Ordering = targetOrdering
	targetList.Ordering = ordering

	_, err := db.Update(&list)
	if err != nil {
		return err
	}

	_, err = db.Update(&targetList)
	if err != nil {
		return err
	}

	return nil

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
