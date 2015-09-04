
-- +goose Up
-- SQL in section 'Up' is executed when this migration is applied

CREATE TABLE cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    name TEXT NOT NULL,
    ordering INT DEFAULT 0
);


CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    card_id INTEGER NOT NULL,
    FOREIGN KEY(card_id) REFERENCES cards(id)
);


-- +goose Down
-- SQL section 'Down' is executed when this migration is rolled back

DROP TABLE tasks;
DROP TABLE cards;

