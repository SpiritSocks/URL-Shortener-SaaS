package config

import "os"

type Config struct {
	HTTP_Port   string
	DB_Host     string
	DB_Port     string
	DB_User     string
	DB_Password string
	DB_Name     string
	Server_Port string
	JWT_Secret  string
}

func Load() *Config {

	port := os.Getenv("PORT")
	db_host := os.Getenv("DB_HOST")
	db_port := os.Getenv("DB_PORT")
	db_user := os.Getenv("DB_USER")
	db_password := os.Getenv("DB_PASSWORD")
	db_name := os.Getenv("DB_NAME")
	jwt_secret := os.Getenv("JWT_SECRET")

	return &Config{
		HTTP_Port:   port,
		DB_Host:     db_host,
		DB_Port:     db_port,
		DB_User:     db_user,
		DB_Password: db_password,
		DB_Name:     db_name,
		JWT_Secret:  jwt_secret,
	}
}
