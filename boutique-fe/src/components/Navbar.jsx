import { useEffect, useState } from 'react'
import { NAV_LINKS } from '../data.js'

function Navbar({ page, onNavigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  const solid = scrolled || page !== 'home'

  const go = (id) => {
    setOpen(false)
    onNavigate(id)
  }

  const goShop = (e) => {
    e.preventDefault()
    setOpen(false)
    onNavigate('home')
    setTimeout(() => {
      document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  return (
    <>
      <div className="announcement">
        Complimentary shipping on orders over $150 — worldwide
      </div>

      <header className={`navbar ${solid ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
        <nav className="navbar-inner">
          <button type="button" className="brand" onClick={() => go('home')}>
            Boutique<em>.</em>
          </button>

          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={page === link.id ? 'is-active' : ''}
                  onClick={() => go(link.id)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <a href="#featured" className="nav-cta" onClick={goShop}>
              Shop Now
            </a>
            <button
              type="button"
              className="menu-toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </nav>
      </header>

      <div className={`mobile-menu ${open ? 'is-open' : ''}`}>
        <ul>
          {NAV_LINKS.map((link, i) => (
            <li key={link.id} style={{ transitionDelay: `${80 + i * 60}ms` }}>
              <button
                type="button"
                className={`mobile-link ${page === link.id ? 'is-active' : ''}`}
                onClick={() => go(link.id)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
        <a href="#featured" className="btn btn-solid mobile-menu-cta" onClick={goShop}>
          Shop the Collection
        </a>
      </div>
    </>
  )
}

export default Navbar
