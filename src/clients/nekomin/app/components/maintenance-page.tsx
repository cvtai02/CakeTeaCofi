import Image from "next/image";
import Link from "next/link";
import "../landing.css";
import { ContactLinks } from "./contact-links";

export function MaintenancePage() {
  return (
    <div className="landing-root">
      <div className="site-logo-bar">
        <Link href="/" className="site-logo">
          <Image src="/nekomin.svg" alt="Nekomin" width={108} height={108} />
        </Link>
      </div>

      <div className="maintenance-screen">
        <p className="maintenance-screen__title">
          Server của chúng tôi hiện đang nâng cấp.
        </p>
        <p className="maintenance-screen__sub">
          Bạn có thể liên hệ với chúng tôi qua
        </p>
        <ContactLinks />
      </div>

      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <Image src="/nekomin.svg" alt="Nekomin" width={108} height={108} className="footer-logo" />
            </div>
            <p className="footer-tagline">Sống chill, minimalism - mình sống vì mình.</p>
          </div>
          <div className="footer-links">
            <h4>Khám phá</h4>
            <ul>
              <li><a href="#">Phụ kiện</a></li>
              <li><a href="#">Detox</a></li>
              <li><a href="#">Decor</a></li>
              <li><a href="#">Nhật ký</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Kết nối</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">TikTok</a></li>
              <li><a href="#">Pinterest</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Nekomin. Bảo lưu mọi quyền.</span>
          <span>Sản phẩm từ tâm 🌿</span>
        </div>
      </footer>
    </div>
  );
}
