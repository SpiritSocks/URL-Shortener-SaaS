package entity

// Subscription represents a subscription entity in the system.

type Subscription struct {
	Subscription_ID    int64
	User_ID            int64
	Plan_ID            int64
	Subscription_Start DateTime
	Subscription_End   DateTime
	Is_Active          bool
}
