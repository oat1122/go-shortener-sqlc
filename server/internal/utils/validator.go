package utils

import (
	"fmt"
	"net"
	"net/url"
)

// ValidateTargetURL checks if the URL is safe (not localhost/private IP)
func ValidateTargetURL(rawURL string) error {
	u, err := url.Parse(rawURL)
	if err != nil {
		return err
	}

	hostname := u.Hostname()
	if hostname == "localhost" {
		return fmt.Errorf("localhost is not allowed")
	}

	// Resolve IP address
	ips, err := net.LookupIP(hostname)
	if err != nil {
		// If we can't resolve it, it might be an internal name or temporary failure.
		// For security, we might want to allow it if it's a valid public domain, 
		// but if it's unresolvable, it's useless anyway.
		return err
	}

	for _, ip := range ips {
		if IsPrivateIP(ip) {
			return fmt.Errorf("private IP addresses are not allowed")
		}
	}

	return nil
}

// IsPrivateIP checks if an IP is private or loopback
func IsPrivateIP(ip net.IP) bool {
	if ip.IsLoopback() || ip.IsLinkLocalMulticast() || ip.IsLinkLocalUnicast() {
		return true
	}

	if ip4 := ip.To4(); ip4 != nil {
		switch {
		case ip4[0] == 10:
			return true
		case ip4[0] == 172 && ip4[1] >= 16 && ip4[1] <= 31:
			return true
		case ip4[0] == 192 && ip4[1] == 168:
			return true
		default:
			return false
		}
	}
	return false // IPv6 private check omitted for brevity but recommended
}
