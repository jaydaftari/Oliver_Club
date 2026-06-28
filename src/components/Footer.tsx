import Link from "next/link";

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
              <span className="label">Members:</span>
              <Link href="/dashboard">Log in</Link>
            </div>
            <div>
              <span className="label">Instagram:</span>
              <a
                href="https://www.instagram.com/olivierclub"
                target="_blank"
                rel="noopener noreferrer"
              >
                @olivierclub
              </a>
            </div>
            <div>
              <span className="label">Backed by</span>
              <a href="https://fishman.vc" target="_blank" rel="noopener noreferrer">
                Fishman.vc
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
