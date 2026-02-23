export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__copy">&copy; {new Date().getFullYear()} Daily Os</span>
        <nav className="footer__links">
          <a href="#about" className="footer__link">About</a>
          <a href="#privacy" className="footer__link">Privacy</a>
          <a href="#contact" className="footer__link">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
