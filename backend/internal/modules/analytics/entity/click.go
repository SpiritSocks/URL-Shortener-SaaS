package analytics

import "time"

type DateTime time.Time

type Click struct {
	ID          int64
	Link_ID     int64
	Clicked_At  DateTime
	User_Agent  string
	Country     string
	Device_Type string
	Browser     string
	OS          string
}
