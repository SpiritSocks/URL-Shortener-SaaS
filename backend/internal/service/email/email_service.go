package email

import (
	"context"
	"fmt"
	"os"

	"github.com/resend/resend-go/v3"
)

type Service struct {
	client *resend.Client
	from   string
}

func NewEmailService() *Service {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("EMAIL_FROM")

	if from == "" {
		from = "support@linxie.ru"
	}

	return &Service{
		client: resend.NewClient(apiKey),
		from:   from,
	}
}

func (s *Service) SendResetLink(to, link string) error {
	subject := "Восстановление пароля"
	html := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; line-height: 1.6;">
			<h2>Восстановление пароля</h2>
			<p>Для сброса пароля нажмите на кнопку ниже:</p>
			<p>
				<a href="%s" style="
					display:inline-block;
					padding:12px 18px;
					background:#111;
					color:#fff;
					text-decoration:none;
					border-radius:8px;
				">Сбросить пароль</a>
			</p>
			<p>Или откройте ссылку вручную:</p>
			<p>%s</p>
			<p>Ссылка действительна 30 минут.</p>
			<p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
		</div>
	`, link, link)

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: subject,
		Html:    html,
	}

	_, err := s.client.Emails.SendWithContext(context.Background(), params)
	if err != nil {
		return fmt.Errorf("resend send reset link: %w", err)
	}

	return nil
}

func (s *Service) SendCode(to, code string) error {
	subject := "Код подтверждения смены пароля"
	html := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; line-height: 1.6;">
			<h2>Подтверждение смены пароля</h2>
			<p>Ваш код:</p>
			<p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">%s</p>
			<p>Код действителен 10 минут.</p>
			<p>Если вы не запрашивали смену пароля, просто проигнорируйте это письмо.</p>
		</div>
	`, code)

	params := &resend.SendEmailRequest{
		From:    s.from,
		To:      []string{to},
		Subject: subject,
		Html:    html,
	}

	_, err := s.client.Emails.SendWithContext(context.Background(), params)
	if err != nil {
		return fmt.Errorf("resend send code: %w", err)
	}

	return nil
}
