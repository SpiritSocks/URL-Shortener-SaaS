package postgres

import "database/sql"

type BillingRepository struct {
	Conn *sql.DB
}
