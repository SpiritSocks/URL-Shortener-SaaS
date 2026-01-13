package billing

import "time"

type DateTime time.Time

type Subscription struct {
	Subscription_ID int64
	Plan_ID         int64
	User_ID         int64
	Start_Date      DateTime
	End_Date        DateTime
	Is_Active       bool
}
