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
		HTTPPort:   "8080",
		DBHost:     "localhost",
		DBPort:     5432,
		DBUser:     "user",
		DBPassword: "password",
		DBName:     "url_shortener",
		ServerPort: 8080,
		JWTSecret:  "your_jwt_secret_key",
	}
}
