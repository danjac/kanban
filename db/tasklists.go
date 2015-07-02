package db

import (
	"github.com/danjac/kanban/models"
	"gopkg.in/gorp.v1"
)

/*
TaskListDB handles db operations for task lists
*/
type TaskListDB interface {
	Create(*models.TaskList) error
	Get() ([]models.TaskList, error)
	Delete(int) error
	Update(int, string) error
	Move(int, int) error
}

type defaultTaskListDB struct {
	*gorp.DbMap
}

func (db *defaultTaskListDB) Get() ([]models.TaskList, error) {
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

func (db *defaultTaskListDB) Update(listID int, name string) error {
	_, err := db.Exec("update tasklists set name=? where id=?", name, listID)
	return err
}

func (db *defaultTaskListDB) Delete(listID int) error {

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

func (db *defaultTaskListDB) Move(listID int, targetListID int) error {

	selectSql := "select ordering from tasklists where id=?"

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

	updateSql := "update tasklists set ordering=? where id=?"

	if _, err := t.Exec(updateSql, targetOrdering, listID); err != nil {
		return err
	}

	if _, err := t.Exec(updateSql, ordering, targetListID); err != nil {
		return err
	}

	return t.Commit()

}

func (db *defaultTaskListDB) Create(list *models.TaskList) error {
	maxOrder, err := db.SelectInt("select max(ordering) from tasklists")
	if err != nil {
		maxOrder = 0
	}
	list.Ordering = int(maxOrder) + 1
	return db.Insert(list)
}
