package email

import (
	"crypto/tls"
	"errors"
	"fmt"
	"net"
	"net/smtp"
	"os"
)

// loginAuth implements smtp.Auth using the LOGIN mechanism
// (required by many Russian hosting providers like Timeweb).
type loginAuth struct {
	username, password string
}

func (a *loginAuth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	return "LOGIN", nil, nil
}

func (a *loginAuth) Next(fromServer []byte, more bool) ([]byte, error) {
	if !more {
		return nil, nil
	}
	switch string(fromServer) {
	case "Username:", "username:":
		return []byte(a.username), nil
	case "Password:", "password:":
		return []byte(a.password), nil
	default:
		return nil, errors.New("unexpected server challenge: " + string(fromServer))
	}
}

type Service struct {
	host     string
	port     string
	user     string
	password string
	from     string
}

func NewEmailService() *Service {
	return &Service{
		host:     os.Getenv("SMTP_HOST"),
		port:     os.Getenv("SMTP_PORT"),
		user:     os.Getenv("SMTP_USER"),
		password: os.Getenv("SMTP_PASSWORD"),
		from:     os.Getenv("SMTP_FROM"),
	}
}

func (s *Service) SendResetLink(to, link string) error {
	subject := "Восстановление пароля"
	body := fmt.Sprintf("Для сброса пароля перейдите по ссылке:\n\n%s\n\nСсылка действительна 30 минут.\nЕсли вы не запрашивали сброс пароля, проигнорируйте это письмо.", link)

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n%s", s.from, to, subject, body)

	addr := fmt.Sprintf("%s:%s", s.host, s.port)

	if s.port == "465" {
		return s.sendSSL(addr, to, msg)
	}
	return s.sendSTARTTLS(addr, to, msg)
}

func (s *Service) SendCode(to, code string) error {
	subject := "Код подтверждения смены пароля"
	body := fmt.Sprintf("Ваш код для смены пароля: %s\n\nКод действителен 10 минут.\nЕсли вы не запрашивали смену пароля, проигнорируйте это письмо.", code)

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n%s", s.from, to, subject, body)

	addr := fmt.Sprintf("%s:%s", s.host, s.port)

	// Port 465 uses implicit TLS (SSL), other ports use STARTTLS
	if s.port == "465" {
		return s.sendSSL(addr, to, msg)
	}
	return s.sendSTARTTLS(addr, to, msg)
}

func (s *Service) sendSSL(addr, to, msg string) error {
	tlsConfig := &tls.Config{ServerName: s.host}

	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		return fmt.Errorf("tls dial: %w", err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, s.host)
	if err != nil {
		return fmt.Errorf("smtp client: %w", err)
	}
	defer client.Quit()

	auth := &loginAuth{username: s.user, password: s.password}
	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("smtp auth: %w", err)
	}

	if err := client.Mail(s.from); err != nil {
		return err
	}
	if err := client.Rcpt(to); err != nil {
		return err
	}

	w, err := client.Data()
	if err != nil {
		return err
	}
	if _, err := w.Write([]byte(msg)); err != nil {
		return err
	}
	return w.Close()
}

func (s *Service) sendSTARTTLS(addr, to, msg string) error {
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return err
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, s.host)
	if err != nil {
		return err
	}
	defer client.Quit()

	tlsConfig := &tls.Config{ServerName: s.host}
	if err := client.StartTLS(tlsConfig); err != nil {
		return fmt.Errorf("starttls: %w", err)
	}

	auth := &loginAuth{username: s.user, password: s.password}
	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("smtp auth: %w", err)
	}

	if err := client.Mail(s.from); err != nil {
		return err
	}
	if err := client.Rcpt(to); err != nil {
		return err
	}

	w, err := client.Data()
	if err != nil {
		return err
	}
	if _, err := w.Write([]byte(msg)); err != nil {
		return err
	}
	return w.Close()
}
