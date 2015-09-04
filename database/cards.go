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
	Delete(int) error
	Update(int, string) error
	Move(int, int) error
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

	result := make([]models.Card, 0)

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

func (db *defaultCardDB) Update(cardID int, name string) error {
	_, err := db.Exec("update cards set name=? where id=?", name, cardID)
	return err
}

func (db *defaultCardDB) Delete(cardID int) error {

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

func (db *defaultCardDB) Move(cardID int, targetCardID int) error {

	selectSql := "select ordering from cards where id=?"
	var ordering, targetOrdering int

	if err := db.Get(&ordering, selectSql, cardID); err != nil {
		return err
	}

	if err := db.Get(&targetOrdering, selectSql, targetCardID); err != nil {
		return err
	}

	t, err := db.Begin()
	if err != nil {
		return err
	}

	updateSql := "update cards set ordering=? where id=?"

	if _, err := t.Exec(updateSql, targetOrdering, cardID); err != nil {
		return err
	}

	if _, err := t.Exec(updateSql, ordering, targetCardID); err != nil {
		return err
	}

	return t.Commit()

}

func (db *defaultCardDB) Create(card *models.Card) error {
	var maxOrder int
	if err := db.Get(&maxOrder, "select max(ordering) from cards"); err != nil {
		maxOrder = 0
	}
	card.Ordering = int(maxOrder) + 1
	sql := "insert into cards(ordering, name) values (:ordering, :name)"
	query, args, err := sqlx.Named(sql, card)
	if err != nil {
		return err
	}
	result, err := db.Exec(query, args...)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	card.ID = int(id)
	return nil
}
