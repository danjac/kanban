package models

/*
Task models a single task object
*/
type Task struct {
	ID     int    `db:"id" json:"id,string"`
	CardID int    `db:"card_id" json:"-"`
	Text   string `db:"text" json:"text" binding:"required,max=60"`
}

/*
TaskList models a single task list
*/
type Card struct {
	ID       int    `db:"id"  json:"id,string"`
	Ordering int    `db:"ordering" json:"ordering"`
	Name     string `db:"name" json:"name" binding:"required,max=60"`
	Tasks    []Task `db:"-" json:"tasks"`
}
