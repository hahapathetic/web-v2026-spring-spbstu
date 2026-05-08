import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../features/cart/cartStore";
import { apiGetGoods } from "../../shared/api/goods";
import { apiCreateOrder, apiGetOrders } from "../../shared/api/orders";
import type { Product } from "../../entities/product/types";
import { Modal } from "../../shared/ui/modal/Modal";
import { resolveImageSrc } from "../../shared/lib/images";
import cartIcon from "../../shared/assets/icons/smile_face.png";
import emptyCartIcon from "../../shared/assets/icons/modern_cart.png";
import "./cart.css";

type TabKey = "cart" | "orders";
const CART_LOADING_ROWS = 3;
const ORDERS_LOADING_ROWS = 4;

function formatRub(n: number) {
  return `${n.toLocaleString("ru-RU")} ₽`;
}

function pluralizeItems(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} товара`;
  return `${n} товаров`;
}

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const addOne = useCartStore((s) => s.addOne);
  const removeOne = useCartStore((s) => s.removeOne);
  const removeMany = useCartStore((s) => s.removeMany);

  const goods = useQuery({
    queryKey: ["goods", "all"],
    queryFn: () => apiGetGoods({ page: 1, limit: 60, sort: "new" }),
  });
  const orders = useQuery({ queryKey: ["orders"], queryFn: apiGetOrders });

  const [tab, setTab] = useState<TabKey>("cart");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<number[] | null>(
    null,
  );
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
  const hasStoredItems = Object.keys(items).length > 0;

  const cartRows = useMemo(() => {
    const map = new Map<number, Product>();
    for (const p of goods.data ?? []) map.set(p.id, p);
    return Object.entries(items)
      .map(([idStr, qty]) => {
        const id = Number(idStr);
        const product = map.get(id);
        return product ? { product, qty } : null;
      })
      .filter(Boolean) as Array<{ product: Product; qty: number }>;
  }, [goods.data, items]);

  const totalSum = useMemo(
    () => cartRows.reduce((acc, r) => acc + r.product.price * r.qty, 0),
    [cartRows],
  );
  const totalCount = useMemo(
    () => cartRows.reduce((acc, r) => acc + r.qty, 0),
    [cartRows],
  );

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => Number(k)),
    [selected],
  );
  const checkoutRows = useMemo(
    () => cartRows.filter((row) => selectedIds.includes(row.product.id)),
    [cartRows, selectedIds],
  );
  const checkoutIds = useMemo(
    () => checkoutRows.map((row) => row.product.id),
    [checkoutRows],
  );
  const allChecked =
    cartRows.length > 0 && selectedIds.length === cartRows.length;

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"card" | "cash" | "">("");
  const [needPackaging, setNeedPackaging] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const selectionRequiredError = submitAttempted && checkoutRows.length === 0;
  const phoneRequiredError = submitAttempted && !phone.trim();
  const emailRequiredError = submitAttempted && !email.trim();
  const addressRequiredError =
    submitAttempted && delivery === "delivery" && !address.trim();
  const paymentRequiredError = submitAttempted && !payment.trim();

  const createOrder = useMutation({
    mutationFn: async () => {
      const payload = {
        items: checkoutRows.map((r) => ({
          product_id: r.product.id,
          quantity: r.qty,
        })),
        phone: phone.trim(),
        email: email.trim() ? email.trim() : null,
        delivery_method: delivery,
        payment_method: payment,
        need_packaging: needPackaging,
        address: delivery === "delivery" ? address.trim() : null,
      };
      return apiCreateOrder(payload);
    },
    onSuccess: (res) => {
      if (checkoutIds.length > 0) {
        removeMany(checkoutIds);
      }
      setSelected((prev) => {
        const next = { ...prev };
        for (const id of checkoutIds) delete next[id];
        return next;
      });
      setSuccessOrderId(res.order_id);
      orders.refetch();
    },
  });

  return (
    <div className="cartPage">
      <div className="cartTabsBar">
        <div className="cartTabsInner">
          <button
            type="button"
            className={tab === "cart" ? "cartTab cartTabActive" : "cartTab"}
            onClick={() => setTab("cart")}
          >
            Корзина
          </button>
          <button
            type="button"
            className={tab === "orders" ? "cartTab cartTabActive" : "cartTab"}
            onClick={() => setTab("orders")}
          >
            История заказов
          </button>
        </div>
      </div>

      {tab === "orders" ? (
        <div className="cartTabPanel">
          <div className="panel panelPad">
            {orders.isLoading ? (
              <div className="cartSkeletonOrders" aria-hidden="true">
                {Array.from({ length: ORDERS_LOADING_ROWS }, (_, index) => (
                  <div key={index} className="cartSkeletonOrderRow">
                    <div className="cartSkeletonLine cartSkeletonOrderMain" />
                    <div className="cartSkeletonLine cartSkeletonOrderMuted" />
                    <div className="cartSkeletonLine cartSkeletonOrderPrice" />
                  </div>
                ))}
              </div>
            ) : null}
            {orders.isError ? (
              <div className="p16 cartErrorText">
                Не удалось загрузить заказы
              </div>
            ) : null}

            <div className="orderList">
              {(orders.data ?? []).map((o) => (
                <div key={o.id} className="orderRow">
                  <div>
                    № {o.id} от{" "}
                    {new Date(o.created_at).toLocaleDateString("ru-RU")}
                  </div>
                  <div className="orderRowMuted">
                    {o.items?.length ? pluralizeItems(o.items.length) : "—"}
                  </div>
                  <div className="orderRowPrice">
                    {formatRub(o.total_amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="cartTabPanel">
          {goods.isLoading && hasStoredItems ? (
            <>
              <div className="panel panelPad" aria-hidden="true">
                <div className="cartSkeletonTools">
                  <div className="cartSkeletonCheckbox" />
                  <div className="cartSkeletonLine cartSkeletonToolsText" />
                </div>
                <div className="rows">
                  {Array.from({ length: CART_LOADING_ROWS }, (_, index) => (
                    <div className="row" key={`cart-loading-${index}`}>
                      <div className="cartSkeletonCheckbox" />
                      <div className="thumb">
                        <div className="thumbSquare cartSkeletonMedia" />
                      </div>
                      <div className="cartSkeletonLine" />
                      <div className="cartSkeletonQty" />
                      <div className="cartSkeletonLine cartSkeletonPrice" />
                      <div className="cartSkeletonLine cartSkeletonDelete" />
                    </div>
                  ))}
                </div>
                <div className="totalRowWrap">
                  <div className="totalRow">
                    <div className="cartSkeletonLine cartSkeletonTotal" />
                  </div>
                </div>
              </div>

              <div className="checkoutTitle">Оформление заказа</div>
              <div className="panel">
                <div className="formGrid cartSkeletonCheckout">
                  <div className="cartSkeletonLine cartSkeletonField" />
                  <div className="cartSkeletonLine cartSkeletonField" />
                  <div className="cartSkeletonLine cartSkeletonFieldWide" />
                  <div className="cartSkeletonLine cartSkeletonFieldWide" />
                </div>
              </div>
            </>
          ) : cartRows.length === 0 ? (
            <div className="cartEmptyWrap">
              <div className="cartEmptyInner">
                <div className="cartEmptyIcon">
                  <img src={emptyCartIcon} width={150} height={150} alt="" />
                </div>
                <div className="cartEmptyTitle">Пока пусто</div>
                <div className="cartEmptyHint">
                  Ознакомьтесь с новинками и хитами на главной или найдите
                  нужное в каталоге
                </div>
                <div className="cartEmptyActions">
                  <button
                    type="button"
                    className="submitBtnCatalogue"
                    onClick={() => navigate("/catalog")}
                  >
                    Перейти в каталог
                  </button>
                  <button
                    type="button"
                    className="cartEmptyLinkBtn"
                    onClick={() => navigate("/")}
                  >
                    Главная страница
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="panel panelPad">
                <div className="cartTools">
                  <label className="cartLabelRow">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={(e) => {
                        const next: Record<number, boolean> = {};
                        for (const r of cartRows)
                          next[r.product.id] = e.target.checked;
                        setSelected(next);
                      }}
                    />
                    Выбрать все
                  </label>
                  <button
                    type="button"
                    className="linkDanger"
                    onClick={() =>
                      setConfirmDeleteIds(cartRows.map((r) => r.product.id))
                    }
                  >
                    × Удалить все
                  </button>
                </div>

                <div className="rows">
                  {cartRows.map((r) => (
                    <div className="row" key={r.product.id}>
                      <input
                        type="checkbox"
                        checked={Boolean(selected[r.product.id])}
                        onChange={(e) =>
                          setSelected((p) => ({
                            ...p,
                            [r.product.id]: e.target.checked,
                          }))
                        }
                      />
                      <div className="thumb">
                        <div className="thumbSquare">
                          <img
                            src={resolveImageSrc(r.product.image_url)}
                            alt={r.product.name}
                          />
                        </div>
                      </div>
                      <div className="rowName">{r.product.name}</div>
                      <div className="qtyCtr">
                        <button
                          type="button"
                          className="sqBtn"
                          onClick={() => removeOne(r.product.id)}
                        >
                          −
                        </button>
                        <div className="cartQtyNum">{r.qty}</div>
                        <button
                          type="button"
                          className="sqBtn"
                          onClick={() => addOne(r.product.id)}
                        >
                          +
                        </button>
                      </div>
                      <div className="priceCell">
                        {formatRub(r.product.price * r.qty)}
                      </div>
                      <button
                        type="button"
                        className="delLink"
                        onClick={() => setConfirmDeleteIds([r.product.id])}
                      >
                        × Удалить
                      </button>
                    </div>
                  ))}
                </div>

                <div className="totalRowWrap">
                  <div className="totalRow">
                    {totalCount} товара на {formatRub(totalSum)}
                  </div>
                </div>
              </div>

              <div className="checkoutTitle">Оформление заказа</div>
              <div className="panel">
                <form
                  className="formGrid"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitAttempted(true);
                    if (checkoutRows.length === 0) return;
                    if (!phone.trim() || !email.trim() || !payment.trim()) return;
                    if (delivery === "delivery" && !address.trim()) return;
                    createOrder.mutate();
                  }}
                >
                  <div className="twoCols">
                    <label className="cartFieldBlock">
                      <div className="miniLabel">Телефон</div>
                      <input
                        className={
                          phoneRequiredError
                            ? "inputGrey inputGreyError"
                            : "inputGrey"
                        }
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </label>
                    <label className="cartFieldBlock">
                      <div className="miniLabel">E-mail</div>
                      <div className="cartInputRowWithStar">
                        <input
                          className={
                            emailRequiredError
                              ? "inputGrey inputGreyError"
                              : "inputGrey"
                          }
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        <span className="cartInputStar" aria-hidden>
                          *
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="cartDeliveryRow">
                    <label>
                      <input
                        type="radio"
                        checked={delivery === "pickup"}
                        onChange={() => setDelivery("pickup")}
                      />
                      Самовывоз
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={delivery === "delivery"}
                        onChange={() => setDelivery("delivery")}
                      />
                      Доставка
                    </label>
                  </div>

                  {delivery === "delivery" ? (
                    <label>
                      <div className="miniLabel">Адрес доставки</div>
                      <div className="cartInputRowWithStarDelivery">
                        <input
                          className={
                            addressRequiredError
                              ? "inputGrey inputGreyError"
                              : "inputGrey"
                          }
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                        <span className="cartInputStar" aria-hidden>
                          *
                        </span>
                      </div>
                    </label>
                  ) : null}

                  <label className="cartSelectField">
                    <div className="miniLabel">Способ оплаты</div>
                    <select
                      className={
                        paymentRequiredError
                          ? "selectGrey selectGreyError"
                          : "selectGrey"
                      }
                      value={payment}
                      onChange={(e) =>
                        setPayment(e.target.value as "" | "card" | "cash")
                      }
                    >
                      <option value="">Не выбрано</option>
                      <option value="card">По карте</option>
                      <option value="cash">Наличными</option>
                    </select>
                  </label>

                  <label className="cartPackagingRow">
                    <input
                      type="checkbox"
                      checked={needPackaging}
                      onChange={(e) => setNeedPackaging(e.target.checked)}
                    />
                    Нужна упаковка
                  </label>

                  <button
                    type="submit"
                    className="submitBtn"
                    disabled={createOrder.isPending}
                  >
                    Оформить заказ
                  </button>
                  {selectionRequiredError ? (
                    <div className="cartValidationHint">Выберите товары</div>
                  ) : null}
                </form>
              </div>
            </>
          )}
        </div>
      )}

      <Modal
        open={Boolean(confirmDeleteIds && confirmDeleteIds.length > 0)}
        onClose={() => setConfirmDeleteIds(null)}
        width={420}
      >
        <div className="cartConfirmModal">
          <button
            type="button"
            onClick={() => setConfirmDeleteIds(null)}
            className="cartModalCloseBtn"
          >
            ×
          </button>
          <div className="cartConfirmText">
            Вы действительно хотите удалить выбранные товары?
          </div>
          <div className="cartModalActions">
            <button
              type="button"
              className="linkDanger"
              onClick={() => setConfirmDeleteIds(null)}
            >
              Отмена
            </button>
            <button
              type="button"
              className="submitBtn"
              onClick={() => {
                if (!confirmDeleteIds) return;
                removeMany(confirmDeleteIds);
                setSelected((prev) => {
                  const next = { ...prev };
                  for (const id of confirmDeleteIds) delete next[id];
                  return next;
                });
                setConfirmDeleteIds(null);
              }}
            >
              Да, удалить
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={successOrderId !== null}
        onClose={() => setSuccessOrderId(null)}
        width={420}
      >
        <div className="cartSuccessModal">
          <div className="cartSuccessIcon">
            <img src={cartIcon} width={75} height={75} alt="" />
          </div>
          <div className="cartSuccessTitle">Спасибо за заказ!</div>
          {successOrderId ? (
            <div className="cartSuccessOrderNumber">
              Номер заказа {successOrderId}.
            </div>
          ) : null}
          <div className="cartSuccessMessage">
            Мы свяжемся с вами в течение 10 минут, чтобы уточнить удобное для
            вас время доставки
          </div>
          <div className="cartSuccessActions">
            <button
              type="button"
              className="submitBtn"
              onClick={() => setSuccessOrderId(null)}
            >
              Ок
            </button>
          </div>
        </div>
      </Modal>

      {goods.isLoading ? null : null}
    </div>
  );
}
