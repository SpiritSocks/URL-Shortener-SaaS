package domain

import "errors"

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrEmailTaken        = errors.New("email already registered")
	ErrInvalidPassword   = errors.New("invalid password")
	ErrLinkNotFound      = errors.New("link not found")
	ErrUnauthorized      = errors.New("unauthorized")
	ErrDomainNotFound    = errors.New("custom domain not found")
	ErrDomainTaken       = errors.New("domain already registered")
	ErrDomainNotVerified  = errors.New("domain not verified")
	ErrBioPageNotFound    = errors.New("bio page not found")
	ErrHandleTaken        = errors.New("handle already taken")
	ErrBioLinkNotFound    = errors.New("bio link not found")
	ErrBioLinkLimitReached = errors.New("bio link limit reached")
	ErrInvalidCode         = errors.New("invalid or expired code")
)
