import { FOOTER_COLUMNS } from '../data.js'

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="#top" className="brand">
            Boutique<em>.</em>
          </a>
          <p>
            Timeless womenswear, crafted in small batches across 48 ateliers —
            designed in Lisbon, loved worldwide.
          </p>
          <div className="footer-social">
            <a href="#top" aria-label="Instagram">Instagram</a>
            <a href="#top" aria-label="Pinterest">Pinterest</a>
            <a href="#top" aria-label="TikTok">TikTok</a>
          </div>
        </div>

        <div className="footer-columns">
          {FOOTER_COLUMNS.map((col) => (
            <div className="footer-col" key={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#top">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Boutique. All rights reserved.</p>
        <p>Crafted with patience — worn with confidence.</p>
      </div>
    </footer>
  )
}

export default Footer
