export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footerRow">
          <div>
            <div className="footerTitle">Gadget Hub</div>
            <div className="footerMuted">Магазин надежных гаджетов</div>
            <div className="footerMuted">
              © 2024 ООО “Гаджет Хаб”. Все права защищены
            </div>
          </div>

          <div
            className="footerMuted"
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <img src="/social/mobile.png" height={12} width={12} alt="" />
            <span style={{ opacity: 0.9 }}>8 (800) 678-34-24</span>
          </div>

          <div className="footerSocial">
            <a href="#" aria-label="VK">
              <img src="/social/vk.png" alt="" />
            </a>
            <a href="#" aria-label="Telegram">
              <img src="/social/telegram.png" alt="" />
            </a>
            <a href="#" aria-label="WhatsApp">
              <img src="/social/whatsapp.png" alt="" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
