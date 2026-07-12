import { MapPin, Mail, Phone } from 'lucide-react'

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const Instagram = () => (
  <svg {...iconProps}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
)

const Facebook = () => (
  <svg {...iconProps}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Twitter = () => (
  <svg {...iconProps}>
    <path d="M4 4l7.2 9.4L4.4 20h2.5l5.4-5.2L16.8 20H20l-7.5-9.8L18.9 4h-2.5l-4.9 4.7L7.2 4H4z" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <p className="navbar__brand">
            Maison <em>Élan</em>
          </p>
          <p className="footer__tagline">
            Fewer, better things — a curated boutique of timeless fashion,
            handcrafted in small batches.
          </p>
          <div className="footer__social">
            <a href="#top" aria-label="Instagram">
              <Instagram />
            </a>
            <a href="#top" aria-label="Facebook">
              <Facebook />
            </a>
            <a href="#top" aria-label="Twitter">
              <Twitter />
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Shop</h4>
          <a href="#collections">New Arrivals</a>
          <a href="#collections">The Dress Edit</a>
          <a href="#collections">Outerwear</a>
          <a href="#collections">Accessories</a>
        </div>

        <div className="footer__col">
          <h4>House</h4>
          <a href="#story">Our Story</a>
          <a href="#testimonials">Journal</a>
          <a href="#contact">Styling Sessions</a>
          <a href="#contact">Gift Cards</a>
        </div>

        <div className="footer__col footer__col--contact">
          <h4>Visit</h4>
          <p>
            <MapPin size={15} strokeWidth={1.5} /> 14 Rue des Fleurs, Le Marais
          </p>
          <p>
            <Mail size={15} strokeWidth={1.5} /> hello@maisonelan.com
          </p>
          <p>
            <Phone size={15} strokeWidth={1.5} /> +33 1 42 00 00 00
          </p>
        </div>
      </div>

      <div className="footer__bar">
        <p>© {new Date().getFullYear()} Maison Élan. All rights reserved.</p>
        <p>Crafted with intention.</p>
      </div>
    </footer>
  )
}
