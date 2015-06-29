package db

import (
	"github.com/danjac/kanban/models"
	"gopkg.in/gorp.v1"
)

/*
TaskDB handles db operations for tasks
*/
type TaskDB interface {
	Delete(int) error
	Create(*models.Task) error
	Move(int, int) error
}

type defaultTaskDB struct {
	*gorp.DbMap
}

func (db *defaultTaskDB) Create(task *models.Task) error {
	return db.Insert(task)
}

func (db *defaultTaskDB) Move(taskID int, newListID int) error {

	task := &models.Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskID); err != nil {
		return err
	}

	task.TaskListID = newListID

	_, err := db.Update(task)
	return err
}

func (db *defaultTaskDB) Delete(taskID int) error {
	task := &models.Task{}

	if err := db.SelectOne(task, "select * from tasks where id=?", taskID); err != nil {
		return err
	}

	_, err := db.DbMap.Delete(task)
	return err

}
