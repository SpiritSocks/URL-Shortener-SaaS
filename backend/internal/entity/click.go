package entity

// Click represents a click event on a link.

type Click struct {
	ID          int64
	Link_ID     int64
	Created_At  DateTime
	IP_Address  string
	User_Agent  string
	Country     string
	Device_Type string
	Browser     string
	OS          string
}
