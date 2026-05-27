export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="label">Email:</span>
            <a href="mailto:contact@olivierclub.com">contact@olivierclub.com</a>
          </div>
          <div className="footer-right">
            <div>
              <span className="label">Instagram:</span>
              <a href="#" target="_blank" rel="noopener">
                @olivierclub
              </a>
            </div>
            <div>
              <span className="label">Backed by</span>
              <a href="#" target="_blank" rel="noopener">
                Fishman.vc
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
