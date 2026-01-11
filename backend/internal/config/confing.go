package config

type Config struct {
	HTTPPort   string
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort int
	JWTSecret  string
}

func Load() *Config {
	return &Config{
		HTTPPort:   "",
		DBHost:     "",
		DBPort:     ,
		DBUser:     "",
		DBPassword: "",
		DBName:     "",
		ServerPort: ,
		JWTSecret:  "",
	}
}
