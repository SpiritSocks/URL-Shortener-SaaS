package geoip

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"time"
)

var client = &http.Client{Timeout: 2 * time.Second}

type ipAPIResponse struct {
	CountryCode string `json:"countryCode"`
}

func LookupCountry(ip string) string {
	if ip == "" || ip == "::1" || ip == "127.0.0.1" || net.ParseIP(ip) == nil {
		return "Local"
	}

	resp, err := client.Get(fmt.Sprintf("http://ip-api.com/json/%s?fields=countryCode", ip))
	if err != nil {
		return "Unknown"
	}
	defer resp.Body.Close()

	var result ipAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil || result.CountryCode == "" {
		return "Unknown"
	}
	return result.CountryCode
}
