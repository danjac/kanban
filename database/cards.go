package db

import (
	"github.com/danjac/kanban/models"
	"github.com/jmoiron/sqlx"
)

/*
CardDB handles db operations for cards
*/
type CardDB interface {
	Create(*models.Card) error
	GetAll() ([]models.Card, error)
	Delete(int64) error
	Update(int64, string) error
	Move(int64, int64) error
}

type defaultCardDB struct {
	*sqlx.DB
}

func (db *defaultCardDB) GetAll() ([]models.Card, error) {

	var cards []models.Card
	if err := db.Select(&cards, "select * from cards order by ordering"); err != nil {
		return nil, err
	}

	var tasks []models.Task
	if err := db.Select(&tasks, "select * from tasks order by id desc"); err != nil {
		return nil, err
	}

	var result []models.Card

	for _, card := range cards {
		if card.Tasks == nil {
			card.Tasks = make([]models.Task, 0)
		}
		for _, task := range tasks {
			if card.ID == task.CardID {
				card.Tasks = append(card.Tasks, task)
			}
		}
		result = append(result, card)
	}

	return result, nil
}

func (db *defaultCardDB) Update(cardID int64, name string) error {
	_, err := db.Exec("update cards set name=? where id=?", name, cardID)
	return err
}

func (db *defaultCardDB) Delete(cardID int64) error {

	t, err := db.Begin()

	if err != nil {
		return err
	}

	if _, err := t.Exec("delete from cards where id=? ", cardID); err != nil {
		return err
	}

	if _, err := t.Exec("delete from tasks where card_id=?", cardID); err != nil {
		return err
	}

	return t.Commit()
}

func (db *defaultCardDB) Move(cardID int64, targetCardID int64) error {

	selectSQL := "select ordering from cards where id=?"
	var ordering, targetOrdering int64

	if err := db.Get(&ordering, selectSQL, cardID); err != nil {
		return err
	}

	if err := db.Get(&targetOrdering, selectSQL, targetCardID); err != nil {
		return err
	}

	t, err := db.Begin()
	if err != nil {
		return err
	}

	updateSQL := "update cards set ordering=? where id=?"

	if _, err := t.Exec(updateSQL, targetOrdering, cardID); err != nil {
		return err
	}

	if _, err := t.Exec(updateSQL, ordering, targetCardID); err != nil {
		return err
	}

	return t.Commit()

}

func (db *defaultCardDB) Create(card *models.Card) error {
	var maxOrder int64
	if err := db.Get(&maxOrder, "select max(ordering) from cards"); err != nil {
		maxOrder = 0
	}
	card.Ordering = maxOrder + 1
	sql := "insert into cards(ordering, name) values (:ordering, :name)"
	query, args, err := sqlx.Named(sql, card)
	if err != nil {
		return err
	}
	result, err := db.Exec(query, args...)
	if err != nil {
		return err
	}
	card.ID, err = result.LastInsertId()
	return err
}
