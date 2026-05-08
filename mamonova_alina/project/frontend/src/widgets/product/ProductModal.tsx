import type { Product } from "../../entities/product/types";
import { useCartStore } from "../../features/cart/cartStore";
import { Modal } from "../../shared/ui/modal/Modal";
import { resolveImageSrc } from "../../shared/lib/images";
import cartIcon from "../../shared/assets/icons/cart.svg";
import "./productModal.css";

export function ProductModal({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}) {
  const qty = useCartStore((s) => (product ? s.getQty(product.id) : 0));
  const addOne = useCartStore((s) => s.addOne);
  const removeOne = useCartStore((s) => s.removeOne);

  if (!product) return <Modal open={open} onClose={onClose} />;

  return (
    <Modal open={open} onClose={onClose} width={860}>
      <div style={{ padding: 28, position: "relative" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: "absolute",
            right: 18,
            top: 14,
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "none",
            background: "transparent",
            color: "rgba(8,6,13,0.35)",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>

        <div className="pmGrid">
          <div className="pmMedia">
            <div className="pmBadges">
              {product.is_new ? <span className="pmBadgeNew">Новинка</span> : null}
              {product.is_hit ? <span className="pmBadgeHit">Хит</span> : null}
            </div>
            <img src={resolveImageSrc(product.image_url)} alt={product.name} />
          </div>

          <div>
            <div className="pmTitle">{product.name}</div>
            <div className="pmRating">
              <span style={{ color: "#f0c300" }}>★</span>
              {String(product.rating).replace(".", ",")}
            </div>

            <div className="pmText">{product.description}</div>

            <div className="pmSpecsTitle">Характеристики</div>
            <div className="pmSpecs">
              <div className="pmSpecRow">
                <div className="pmSpecKey">Гарантия</div>
                <div className="pmSpecLine" />
                <div className="pmSpecVal">1 год</div>
              </div>
              <div className="pmSpecRow">
                <div className="pmSpecKey">Экран</div>
                <div className="pmSpecLine" />
                <div className="pmSpecVal">3.4&quot;/720x748</div>
              </div>
              <div className="pmSpecRow">
                <div className="pmSpecKey">Процессор</div>
                <div className="pmSpecLine" />
                <div className="pmSpecVal">Snapdragon 8 Gen 2</div>
              </div>
            </div>

            <div className="pmBottom">
              <div className="pmPrice">
                {product.price.toLocaleString("ru-RU")} ₽
              </div>

              {qty > 0 ? (
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div className="pmQty">
                    <button
                      type="button"
                      className="pmQtyBtn"
                      onClick={() => removeOne(product.id)}
                    >
                      −
                    </button>
                    <div className="pmQtyNum">{qty}</div>
                    <button
                      type="button"
                      className="pmQtyBtn"
                      onClick={() => addOne(product.id)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="pmBtnPink"
                    onClick={() => addOne(product.id)}
                  >
                    <img
                      src={cartIcon}
                      width={14}
                      height={14}
                      alt=""
                      style={{ filter: "brightness(100)" }}
                    />
                    В корзине {qty} шт.
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="pmBtnBlue"
                  onClick={() => addOne(product.id)}
                >
                  <img
                    src={cartIcon}
                    width={14}
                    height={14}
                    alt=""
                    style={{ filter: "brightness(100)" }}
                  />
                  В корзину
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
