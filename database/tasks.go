package db

import (
	"github.com/danjac/kanban/models"
	"github.com/jmoiron/sqlx"
)

/*
TaskDB handles db operations for tasks
*/
type TaskDB interface {
	Delete(int64) error
	Create(*models.Task) error
	Move(int64, int64) error
}

type defaultTaskDB struct {
	*sqlx.DB
}

func (db *defaultTaskDB) Create(task *models.Task) error {
	result, err := db.Exec("insert into tasks(card_id, label) values (?, ?)", task.CardID, task.Text)
	if err != nil {
		return err
	}
	task.ID, err = result.LastInsertId()
	return err
}

func (db *defaultTaskDB) Move(taskID int64, newCardID int64) error {
	_, err := db.Exec("update tasks set card_id=? where id=?", newCardID, taskID)
	return err
}

func (db *defaultTaskDB) Delete(taskID int64) error {
	_, err := db.Exec("delete from tasks where id=?", taskID)
	return err
}
