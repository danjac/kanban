package db

import "github.com/jmoiron/sqlx"

/*
DB handles all data layer functionality
*/
type DB struct {
	Cards CardDB
	Tasks TaskDB
}

/*
New creates a new db instance
*/
func New(db *sqlx.DB) *DB {

	return &DB{
		&defaultCardDB{db},
		&defaultTaskDB{db},
	}
}
