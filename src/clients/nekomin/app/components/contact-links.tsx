export function ContactLinks({ className }: { className?: string }) {
  return (
    <div className={`contact-links${className ? ` ${className}` : ""}`}>
      <a href="https://www.facebook.com/nekomin" target="_blank" rel="noopener noreferrer" className="contact-links__btn" aria-label="Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
          <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.9V12h2.538V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
        </svg>
      </a>
      <a href="https://zalo.me/0000000000" target="_blank" rel="noopener noreferrer" className="contact-links__btn" aria-label="Zalo">
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 13.5h-4.25l3.5-5H11.5V9h4.25l-3.5 5H16.5v1.5zM8.75 9.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm-.75 5.75V10.5h1.5V15.5H8z"/>
        </svg>
      </a>
      <a href="mailto:nekomin@gmail.com" className="contact-links__btn" aria-label="Email">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m2 7 10 7 10-7"/>
        </svg>
      </a>
      <a href="tel:+84000000000" className="contact-links__btn" aria-label="Điện thoại">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 11.5a19.79 19.79 0 0 1-3-8.57A2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16v.92z"/>
        </svg>
      </a>
    </div>
  );
}
