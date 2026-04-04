package useragent

import "strings"

type Info struct {
	Device  string
	Browser string
	OS      string
}

func Parse(ua string) Info {
	ua = strings.ToLower(ua)
	return Info{
		Device:  detectDevice(ua),
		Browser: detectBrowser(ua),
		OS:      detectOS(ua),
	}
}

func detectDevice(ua string) string {
	switch {
	case strings.Contains(ua, "mobile"), strings.Contains(ua, "android"),
		strings.Contains(ua, "iphone"), strings.Contains(ua, "ipod"):
		return "Mobile"
	case strings.Contains(ua, "tablet"), strings.Contains(ua, "ipad"):
		return "Tablet"
	default:
		return "Desktop"
	}
}

func detectBrowser(ua string) string {
	switch {
	case strings.Contains(ua, "yabrowser"):
		return "Yandex"
	case strings.Contains(ua, "brave"):
		return "Brave"
	case strings.Contains(ua, "edg"):
		return "Edge"
	case strings.Contains(ua, "opr"), strings.Contains(ua, "opera"):
		return "Opera"
	case strings.Contains(ua, "vivaldi"):
		return "Vivaldi"
	case strings.Contains(ua, "firefox"), strings.Contains(ua, "fxios"):
		return "Firefox"
	case strings.Contains(ua, "chrome"), strings.Contains(ua, "crios"):
		return "Chrome"
	case strings.Contains(ua, "safari") && !strings.Contains(ua, "chrome"):
		return "Safari"
	default:
		return "Other"
	}
}

func detectOS(ua string) string {
	switch {
	case strings.Contains(ua, "windows"):
		return "Windows"
	case strings.Contains(ua, "android"):
		return "Android"
	case strings.Contains(ua, "iphone"), strings.Contains(ua, "ipad"), strings.Contains(ua, "ipod"):
		return "iOS"
	case strings.Contains(ua, "mac os"), strings.Contains(ua, "macintosh"):
		return "macOS"
	case strings.Contains(ua, "linux"):
		return "Linux"
	default:
		return "Other"
	}
}
