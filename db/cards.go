package db

import (
	"github.com/danjac/kanban/models"
	"gopkg.in/gorp.v1"
)

/*
CardDB handles db operations for cards
*/
type CardDB interface {
	Create(*models.Card) error
	Get() ([]models.Card, error)
	Delete(int) error
	Update(int, string) error
	Move(int, int) error
}

type defaultCardDB struct {
	*gorp.DbMap
}

func (db *defaultCardDB) Get() ([]models.Card, error) {
	var cards []models.Card
	if _, err := db.Select(&cards, "select * from cards order by ordering"); err != nil {
		return nil, err
	}
	var tasks []models.Task
	if _, err := db.Select(&tasks, "select * from tasks order by id desc"); err != nil {
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

	ordering, err := db.SelectInt(selectSql, cardID)
	if err != nil {
		return err
	}

	targetOrdering, err := db.SelectInt(selectSql, targetCardID)
	if err != nil {
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
	maxOrder, err := db.SelectInt("select max(ordering) from cards")
	if err != nil {
		maxOrder = 0
	}
	card.Ordering = int(maxOrder) + 1
	return db.Insert(card)
}
