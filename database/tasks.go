package db

import (
	"github.com/danjac/kanban/models"
	"github.com/jmoiron/sqlx"
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
	*sqlx.DB
}

func (db *defaultTaskDB) Create(task *models.Task) error {
	result, err := db.Exec("insert into tasks(card_id, label) values (?, ?)", task.CardID, task.Label)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	task.ID = int(id)
	return nil
}

func (db *defaultTaskDB) Move(taskID int, newCardID int) error {
	_, err := db.Exec("update tasks set card_id=? where id=?", newCardID, taskID)
	return err
}

func (db *defaultTaskDB) Delete(taskID int) error {
	_, err := db.Exec("delete from tasks where id=?", taskID)
	return err
}
