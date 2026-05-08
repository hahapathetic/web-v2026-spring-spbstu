import type { Product } from "../../entities/product/types";
import { useCartStore } from "../../features/cart/cartStore";
import { resolveImageSrc } from "../../shared/lib/images";
import cartIcon from "../../shared/assets/icons/cart.svg";
import { useAuthStore } from "../../features/auth/authStore";
import "./product.css";

export function ProductCard({
  product,
  onOpen,
  variant = "catalog",
}: {
  product: Product;
  onOpen: () => void;
  variant?: "catalog" | "home";
}) {
  const isAuthed = useAuthStore((s) => s.isAuthed);
  const quantity = useCartStore((s) => s.items[product.id] ?? 0);
  const addOne = useCartStore((s) => s.addOne);
  const removeOne = useCartStore((s) => s.removeOne);

  return (
    <div className="card">
      <button
        type="button"
        onClick={onOpen}
        style={{
          display: "block",
          width: "100%",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div className="imgWrap">
          <div className="badges">
            {product.is_new ? <span className="badgeNew">Новинка</span> : null}
            {product.is_hit ? <span className="badgeHit">Хит</span> : null}
          </div>
          <div className="imgSquare">
            <img src={resolveImageSrc(product.image_url)} alt={product.name} />
          </div>
        </div>
        <div className="cardBody">
          <div className="priceRow">
            <div className="price">
              {product.price.toLocaleString("ru-RU")} ₽
            </div>
            <div />
          </div>
          <div className="name" title={product.name}>
            {product.name}
          </div>
          <div className="meta">
            <span>
              <span className="star">★</span>{" "}
              {String(product.rating).replace(".", ",")}
            </span>
          </div>
        </div>
      </button>

      {isAuthed && variant === "catalog" ? (
        <div className="cardActions">
          {quantity <= 0 ? (
            <button
              type="button"
              className="addBtn"
              onClick={() => addOne(product.id)}
            >
              {variant === "catalog" ? (
                <span className="btnContent">
                  <img
                    src={cartIcon}
                    width={14}
                    height={14}
                    alt=""
                    className="btnIcon btnIconWhite"
                  />
                  В корзину
                </span>
              ) : (
                "В корзину"
              )}
            </button>
          ) : (
            <div className="qtyInline">
              <span className="qtyPink">
                <span className="qtyPinkContent">
                  <img
                    src={cartIcon}
                    width={14}
                    height={14}
                    alt=""
                    className="btnIcon btnIconWhite"
                  />
                  {quantity} шт.
                </span>
              </span>
              <div className="qtyRight">
                <button
                  type="button"
                  className="qtyBtn"
                  onClick={() => removeOne(product.id)}
                >
                  −
                </button>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {quantity} шт.
                </span>
                <button
                  type="button"
                  className="qtyBtn"
                  onClick={() => addOne(product.id)}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
