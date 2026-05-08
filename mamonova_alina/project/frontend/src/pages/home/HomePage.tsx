import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGetGoods } from "../../shared/api/goods";
import { ProductCard } from "../../widgets/product/ProductCard";
import catalogIcon from "../../shared/assets/icons/rocket.png";
import emailIcon from "../../shared/assets/icons/envelope.png";
import rubIcon from "../../shared/assets/icons/rub.png";
import licenseIcon from "../../shared/assets/icons/license.png";
import subtractIcon from "../../shared/assets/icons/fire.png";
import vectorIcon from "../../shared/assets/icons/star_sparkles.png";
import locateIcon from "../../shared/assets/icons/map_pin.png";
import mobileIcon from "../../shared/assets/icons/mobile.png";
import "./home.css";

const HOME_GOODS_LIMIT = 36;
const CAROUSEL_VISIBLE_ITEMS = 3;
const CAROUSEL_PRODUCTS_LIMIT = 24;
const HOME_LOADING_SKELETON_COUNT = 3;
const HOME_BANNERS = ["/banners/banner-1.png", "/banners/banner-2.png"];
const HOME_BANNER_AUTOPLAY_MS = 5000;
const HOME_BANNER_FADE_MS = 350;

function getCarouselWindow<T>(items: T[], startIndex: number) {
  if (items.length <= CAROUSEL_VISIBLE_ITEMS) return items;
  const out: T[] = [];
  for (let i = 0; i < CAROUSEL_VISIBLE_ITEMS; i++)
    out.push(items[(startIndex + i + items.length) % items.length]);
  return out;
}

export function HomePage() {
  const navigate = useNavigate();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(true);

  const hitsGoods = useQuery({
    queryKey: ["goods", "home", "hits"],
    queryFn: () =>
      apiGetGoods({ page: 1, limit: HOME_GOODS_LIMIT, sort: "popular" }),
  });

  const newsGoods = useQuery({
    queryKey: ["goods", "home", "new"],
    queryFn: () =>
      apiGetGoods({ page: 1, limit: HOME_GOODS_LIMIT, sort: "new" }),
  });

  const hitProducts = useMemo(() => {
    const products = hitsGoods.data ?? [];
    const onlyHits = products.filter((product) => product.is_hit);
    const sourceProducts = onlyHits.length > 0 ? onlyHits : products;
    return sourceProducts.slice(0, CAROUSEL_PRODUCTS_LIMIT);
  }, [hitsGoods.data]);

  const newProducts = useMemo(() => {
    const products = newsGoods.data ?? [];
    const onlyNew = products.filter((product) => product.is_new);
    const sourceProducts = onlyNew.length > 0 ? onlyNew : products;
    return sourceProducts.slice(0, CAROUSEL_PRODUCTS_LIMIT);
  }, [newsGoods.data]);

  const [hitCarouselIndex, setHitCarouselIndex] = useState(0);
  const [newCarouselIndex, setNewCarouselIndex] = useState(0);

  const switchBanner = (nextIndex: number) => {
    setBannerVisible(false);
    window.setTimeout(() => {
      setBannerIndex(nextIndex);
      setBannerVisible(true);
    }, HOME_BANNER_FADE_MS);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      switchBanner((bannerIndex + 1) % HOME_BANNERS.length);
    }, HOME_BANNER_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [bannerIndex]);

  return (
    <div>
      <>
        <div className="homeBanner">
          <img
            src={HOME_BANNERS[bannerIndex]}
            alt=""
            className={
              bannerVisible ? "homeBannerImageVisible" : "homeBannerImageHidden"
            }
          />
          <button
            type="button"
            className="homeBannerArrow homeBannerArrowLeft"
            onClick={() =>
              switchBanner(
                (bannerIndex - 1 + HOME_BANNERS.length) % HOME_BANNERS.length,
              )
            }
            aria-label="Предыдущий баннер"
          >
            ‹
          </button>
          <button
            type="button"
            className="homeBannerArrow homeBannerArrowRight"
            onClick={() =>
              switchBanner((bannerIndex + 1) % HOME_BANNERS.length)
            }
            aria-label="Следующий баннер"
          >
            ›
          </button>
          <div className="homeBannerDots">
            {HOME_BANNERS.map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  index === bannerIndex
                    ? "homeBannerDot homeBannerDotActive"
                    : "homeBannerDot"
                }
                onClick={() => switchBanner(index)}
                aria-label={`Баннер ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <section className="homeSection">
          <div>
            <div className="homeSectionTitle">
              <div>
                <div className="advIcon">
                  <img src={subtractIcon} width={48} height={48} alt="" />
                </div>
                <h2>Хиты продаж</h2>
                <p>
                  Тысячи покупателей уже одобрили эти товары. Самые популярные,
                  проверенные и надежные гаджеты!
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="arrowBtn"
            disabled={hitsGoods.isPending || hitProducts.length === 0}
            onClick={() => setHitCarouselIndex((index) => index - 1)}
          >
            ‹
          </button>
          <div className="homeCardsRow">
            {hitsGoods.isPending ? (
              <div className="homeSkeletonRow" aria-hidden="true">
                {Array.from(
                  { length: HOME_LOADING_SKELETON_COUNT },
                  (_, index) => (
                    <div key={index} className="homeSkeletonCard">
                      <div className="homeSkeletonMedia" />
                      <div className="homeSkeletonLine homeSkeletonLinePrice" />
                      <div className="homeSkeletonLine" />
                      <div className="homeSkeletonLine homeSkeletonLineShort" />
                    </div>
                  ),
                )}
              </div>
            ) : hitsGoods.isError ? (
              <p className="homeGoodsHint">
                Не удалось загрузить товары. Проверьте, что backend запущен.
              </p>
            ) : hitProducts.length === 0 ? (
              <p className="homeGoodsHint">Пока нет товаров в каталоге.</p>
            ) : (
              getCarouselWindow(hitProducts, hitCarouselIndex).map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="home"
                    onOpen={() => navigate("/catalog")}
                  />
                ),
              )
            )}
          </div>
          <button
            type="button"
            className="arrowBtn"
            disabled={hitsGoods.isPending || hitProducts.length === 0}
            onClick={() => setHitCarouselIndex((index) => index + 1)}
          >
            ›
          </button>
        </section>

        <section className="homeSection">
          <div>
            <div className="homeSectionTitle">
              <div>
                <div className="advIcon">
                  <img src={vectorIcon} width={48} height={48} alt="" />
                </div>
                <h2>Новинки</h2>
                <p>
                  Их только произвели - они уже у нас! Все самое новое и свежее
                  на рынке электроники
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="arrowBtn"
            disabled={newsGoods.isPending || newProducts.length === 0}
            onClick={() => setNewCarouselIndex((index) => index - 1)}
          >
            ‹
          </button>
          <div className="homeCardsRow">
            {newsGoods.isPending ? (
              <div className="homeSkeletonRow" aria-hidden="true">
                {Array.from(
                  { length: HOME_LOADING_SKELETON_COUNT },
                  (_, index) => (
                    <div key={index} className="homeSkeletonCard">
                      <div className="homeSkeletonMedia" />
                      <div className="homeSkeletonLine homeSkeletonLinePrice" />
                      <div className="homeSkeletonLine" />
                      <div className="homeSkeletonLine homeSkeletonLineShort" />
                    </div>
                  ),
                )}
              </div>
            ) : newsGoods.isError ? (
              <p className="homeGoodsHint">
                Не удалось загрузить товары. Проверьте, что backend запущен.
              </p>
            ) : newProducts.length === 0 ? (
              <p className="homeGoodsHint">Пока нет товаров в каталоге.</p>
            ) : (
              getCarouselWindow(newProducts, newCarouselIndex).map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="home"
                    onOpen={() => navigate("/catalog")}
                  />
                ),
              )
            )}
          </div>
          <button
            type="button"
            className="arrowBtn"
            disabled={newsGoods.isPending || newProducts.length === 0}
            onClick={() => setNewCarouselIndex((index) => index + 1)}
          >
            ›
          </button>
        </section>

        <section className="advantages">
          <h3>Преимущества</h3>
          <div className="advGrid">
            <div className="advCard">
              <div className="advIcon">
                <img src={catalogIcon} width={72} height={72} alt="" />
              </div>
              <div className="advText">Утром заказали, вечером получили</div>
            </div>
            <div className="advCard">
              <div className="advIcon">
                <img src={rubIcon} width={72} height={72} alt="" />
              </div>
              <div className="advText">
                С товаром что-то не так? Вернем деньги
              </div>
            </div>
            <div className="advCard">
              <div className="advIcon">
                <img src={licenseIcon} width={72} height={72} alt="" />
              </div>
              <div className="advText">Только оригинальные товары</div>
            </div>
          </div>
        </section>

        <section className="contacts">
          <h3>Работаем 24/7</h3>
          <div className="contactsRow">
            <div className="contactsItem">
              <img src={mobileIcon} width={12} height={12} alt="" />8 (800)
              678-34-24
            </div>
            <div className="contactsItem">
              <img src={emailIcon} width={16} height={16} alt="" />
              gadget@hub.ru
            </div>
            <div className="contactsItem">
              <img src={locateIcon} width={16} height={16} alt="" />
              Санкт-Петербург, ул. Барочная, д.7, корпус 2
            </div>
          </div>
        </section>
      </>
    </div>
  );
}
