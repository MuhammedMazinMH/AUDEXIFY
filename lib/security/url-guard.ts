import { isIP } from 'node:net'
import { lookup } from 'node:dns/promises'

/**
 * URL validation + SSRF protection for the audit engine.
 *
 * The audit engine drives a real browser to a user-supplied URL, so this
 * module rejects anything that could reach internal infrastructure:
 * - only http/https schemes
 * - no credentials embedded in the URL
 * - hostname must not resolve to a private, loopback, link-local,
 *   multicast, or otherwise reserved IP range (both IPv4 and IPv6)
 */

export class UrlValidationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'INVALID_URL'
      | 'INVALID_SCHEME'
      | 'CREDENTIALS_IN_URL'
      | 'PRIVATE_ADDRESS'
      | 'DNS_FAILURE',
  ) {
    super(message)
    this.name = 'UrlValidationError'
  }
}

function ipv4ToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => (acc << 8) + Number.parseInt(octet, 10), 0)
}

interface Cidr {
  base: number
  mask: number
}

function cidr(range: string): Cidr {
  const [ip, bits] = range.split('/')
  const maskBits = Number.parseInt(bits, 10)
  return {
    base: ipv4ToInt(ip),
    mask: maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0,
  }
}

const BLOCKED_IPV4_RANGES: Cidr[] = [
  cidr('0.0.0.0/8'), // "this network"
  cidr('10.0.0.0/8'), // private
  cidr('100.64.0.0/10'), // carrier-grade NAT
  cidr('127.0.0.0/8'), // loopback
  cidr('169.254.0.0/16'), // link-local (cloud metadata)
  cidr('172.16.0.0/12'), // private
  cidr('192.0.0.0/24'), // IETF protocol assignments
  cidr('192.0.2.0/24'), // TEST-NET-1
  cidr('192.168.0.0/16'), // private
  cidr('198.18.0.0/15'), // benchmarking
  cidr('198.51.100.0/24'), // TEST-NET-2
  cidr('203.0.113.0/24'), // TEST-NET-3
  cidr('224.0.0.0/4'), // multicast
  cidr('240.0.0.0/4'), // reserved
  cidr('255.255.255.255/32'), // broadcast
]

function isBlockedIpv4(ip: string): boolean {
  const int = ipv4ToInt(ip) >>> 0
  return BLOCKED_IPV4_RANGES.some(({ base, mask }) => (int & mask) === (base >>> 0 & mask))
}

function isBlockedIpv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  // Normalize away zone index (fe80::1%eth0)
  const addr = lower.split('%')[0]
  if (addr === '::' || addr === '::1') return true // unspecified / loopback
  if (addr.startsWith('fe8') || addr.startsWith('fe9') || addr.startsWith('fea') || addr.startsWith('feb')) {
    return true // link-local fe80::/10
  }
  if (addr.startsWith('fc') || addr.startsWith('fd')) return true // unique local fc00::/7
  if (addr.startsWith('ff')) return true // multicast ff00::/8
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  const v4Match = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (v4Match) return isBlockedIpv4(v4Match[1])
  return false
}

export function isBlockedIp(ip: string): boolean {
  const family = isIP(ip)
  if (family === 4) return isBlockedIpv4(ip)
  if (family === 6) return isBlockedIpv6(ip)
  return true // not a valid IP at all — treat as blocked
}

/**
 * Parses and validates a user-supplied URL string.
 * Throws UrlValidationError when the URL is unsafe to fetch.
 * Returns the parsed URL and the resolved, verified IP address.
 */
export async function validateAuditUrl(raw: string): Promise<{ url: URL; resolvedIp: string }> {
  let url: URL
  try {
    // Be forgiving about missing scheme: default to https.
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`)
  } catch {
    throw new UrlValidationError('The provided value is not a valid URL.', 'INVALID_URL')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UrlValidationError('Only http and https URLs can be audited.', 'INVALID_SCHEME')
  }

  if (url.username || url.password) {
    throw new UrlValidationError('URLs with embedded credentials are not allowed.', 'CREDENTIALS_IN_URL')
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '')

  // Literal IP in the URL
  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new UrlValidationError('This address points to a private or reserved network.', 'PRIVATE_ADDRESS')
    }
    return { url, resolvedIp: hostname }
  }

  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new UrlValidationError('Internal hostnames cannot be audited.', 'PRIVATE_ADDRESS')
  }

  let resolved: { address: string }
  try {
    resolved = await lookup(hostname)
  } catch {
    throw new UrlValidationError('The hostname could not be resolved.', 'DNS_FAILURE')
  }

  if (isBlockedIp(resolved.address)) {
    throw new UrlValidationError('This hostname resolves to a private or reserved network.', 'PRIVATE_ADDRESS')
  }

  return { url, resolvedIp: resolved.address }
}
