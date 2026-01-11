package entity

// Plan represents a subscription plan entity in the system.

type Plan struct {
	Plan_ID         int64
	Name            string
	Price_Per_Month float64
	Max_Links       int64
}
