import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../entities/product/types";
import { apiGetGoods, apiGetGoodsPage } from "../../shared/api/goods";
import { ProductCard } from "../../widgets/product/ProductCard";
import { ProductModal } from "../../widgets/product/ProductModal";
import "./catalog.css";

type SortKey = "new" | "popular" | "price_asc" | "price_desc";

const CATALOG_PAGE_SIZE = 9;
const CATALOG_FILTER_OPTIONS_LIMIT = 200;
const CATALOG_LOADING_SKELETON_COUNT = 9;
const PRICE_MIN = 0;
const PRICE_MAX = 100000;

function clampPrice(value: number) {
  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, value));
}

function parsePriceInput(value: string) {
  if (value.trim() === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? clampPrice(numeric) : null;
}

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

export function CatalogPage() {
  const [sort, setSort] = useState<SortKey>("new");
  const [draftMinPrice, setDraftMinPrice] = useState<string>("");
  const [draftMaxPrice, setDraftMaxPrice] = useState<string>("");
  const [draftMinRange, setDraftMinRange] = useState(PRICE_MIN);
  const [draftMaxRange, setDraftMaxRange] = useState(PRICE_MAX);
  const [draftCategories, setDraftCategories] = useState<
    Record<string, boolean>
  >({});
  const [draftColors, setDraftColors] = useState<Record<string, boolean>>({});
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>("");
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedColors, setAppliedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [opened, setOpened] = useState<Product | null>(null);

  const minPriceFilter = useMemo(() => {
    const parsed = Number(appliedMinPrice);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [appliedMinPrice]);
  const maxPriceFilter = useMemo(() => {
    const parsed = Number(appliedMaxPrice);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [appliedMaxPrice]);

  const goods = useQuery<{ items: Product[]; total: number }>({
    queryKey: [
      "goods",
      "catalog",
      {
        page,
        limit: CATALOG_PAGE_SIZE,
        sort,
        categories: appliedCategories,
        colors: appliedColors,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
      },
    ],
    queryFn: () =>
      apiGetGoodsPage({
        page,
        limit: CATALOG_PAGE_SIZE,
        sort,
        category: appliedCategories,
        color: appliedColors,
        min_price: minPriceFilter,
        max_price: maxPriceFilter,
      }),
  });

  const optionsQuery = useQuery({
    queryKey: ["goods", "catalog-options"],
    queryFn: () =>
      apiGetGoods({
        page: 1,
        limit: CATALOG_FILTER_OPTIONS_LIMIT,
        sort: "new",
      }),
  });

  const allCategories = useMemo(
    () => uniqueSorted((optionsQuery.data ?? []).map((p) => p.category)),
    [optionsQuery.data],
  );
  const allColors = useMemo(
    () => uniqueSorted((optionsQuery.data ?? []).map((p) => p.color ?? null)),
    [optionsQuery.data],
  );
  const totalPages = Math.max(
    1,
    Math.ceil((goods.data?.total ?? 0) / CATALOG_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = goods.data?.items ?? [];

  const paginationItems = useMemo(() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, 3, -1, totalPages];
  }, [totalPages]);
  const priceRangePercents = useMemo(() => {
    const start = ((draftMinRange - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    const end = ((draftMaxRange - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    return { start, end };
  }, [draftMinRange, draftMaxRange]);

  return (
    <div>
      <div className="catalogTop">
        <h1 className="catalogTitle">Каталог товаров</h1>
        <div className="catalogTabs">
          {(
            [
              ["new", "Новые"],
              ["popular", "Популярные"],
              ["price_asc", "Подешевле"],
              ["price_desc", "Подороже"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={
                key === sort
                  ? "tabBtn tabBtnPrimaryActive"
                  : "tabBtn tabBtnUnderline"
              }
              onClick={() => {
                setSort(key);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="catalogLayout">
        <div>
          {goods.isLoading ? (
            <div className="catalogLoading">
              <div className="catalogLoadingTitle">Загружаем товары...</div>
              <div
                className="catalogGrid catalogGridLoading"
                aria-hidden="true"
              >
                {Array.from(
                  { length: CATALOG_LOADING_SKELETON_COUNT },
                  (_, index) => (
                    <div key={index} className="catalogSkeletonCard">
                      <div className="catalogSkeletonMedia" />
                      <div className="catalogSkeletonLine catalogSkeletonLinePrice" />
                      <div className="catalogSkeletonLine" />
                      <div className="catalogSkeletonLine catalogSkeletonLineShort" />
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}
          {goods.isError ? (
            <div className="p16" style={{ color: "#ff3b30" }}>
              Не удалось получить товары. Проверьте, что вы вошли в систему.
              запущен.
            </div>
          ) : null}

          {!goods.isLoading &&
          !goods.isError &&
          visibleProducts.length === 0 ? (
            <div className="p16">Товары по вашему запросу не найдены.</div>
          ) : null}

          {!goods.isLoading ? (
            <div className="catalogGrid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={() => setOpened(product)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="filters">
          <div className="filtersBlock">
            <div className="filtersTitle">Цена, ₽</div>
            <div className="filtersRow2">
              <div>
                <div className="fieldLabel">От</div>
                <input
                  className="fInput"
                  value={draftMinPrice}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setDraftMinPrice(nextValue);
                    const parsed = parsePriceInput(nextValue);
                    if (parsed === null) return;
                    const normalizedMin = Math.min(parsed, draftMaxRange);
                    setDraftMinRange(normalizedMin);
                  }}
                />
              </div>
              <div>
                <div className="fieldLabel">До</div>
                <input
                  className="fInput"
                  value={draftMaxPrice}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setDraftMaxPrice(nextValue);
                    const parsed = parsePriceInput(nextValue);
                    if (parsed === null) return;
                    const normalizedMax = Math.max(parsed, draftMinRange);
                    setDraftMaxRange(normalizedMax);
                  }}
                />
              </div>
            </div>
            <div className="rangeWrap">
              <div className="rangeRail" />
              <div
                className="rangeFill"
                style={{
                  left: `calc(${priceRangePercents.start}% + 9px)`,
                  right: `calc(${100 - priceRangePercents.end}% + 9px)`,
                }}
              />
              <input
                className="range"
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={draftMinRange}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v <= draftMaxRange) {
                    setDraftMinRange(v);
                    setDraftMinPrice(String(v));
                  }
                }}
              />
              <input
                className="range"
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={draftMaxRange}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= draftMinRange) {
                    setDraftMaxRange(v);
                    setDraftMaxPrice(String(v));
                  }
                }}
              />
            </div>
          </div>

          <div className="filtersBlock">
            <div className="filtersTitle">Тип товара</div>
            <div className="filtersList">
              {allCategories.map((c) => (
                <label
                  key={c}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(draftCategories[c])}
                    onChange={(e) => {
                      setDraftCategories((prev) => ({
                        ...prev,
                        [c]: e.target.checked,
                      }));
                    }}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="filtersBlock">
            <div className="filtersTitle">Цвет</div>
            <div className="filtersList">
              {allColors.map((c) => (
                <label
                  key={c}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(draftColors[c])}
                    onChange={(e) => {
                      setDraftColors((prev) => ({
                        ...prev,
                        [c]: e.target.checked,
                      }));
                    }}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div className="filtersActions">
            <button
              type="button"
              className="btnShow"
              onClick={() => {
                const normalizedMin = parsePriceInput(draftMinPrice);
                const normalizedMax = parsePriceInput(draftMaxPrice);
                const safeMin = normalizedMin ?? PRICE_MIN;
                const safeMax = normalizedMax ?? PRICE_MAX;

                if (
                  normalizedMin !== null &&
                  normalizedMax !== null &&
                  safeMin > safeMax
                ) {
                  setDraftMinRange(safeMax);
                  setDraftMaxRange(safeMax);
                  setDraftMinPrice(String(safeMax));
                  setDraftMaxPrice(String(safeMax));
                  setAppliedMinPrice(String(safeMax));
                  setAppliedMaxPrice(String(safeMax));
                } else {
                  if (normalizedMin !== null) {
                    setDraftMinRange(Math.min(safeMin, safeMax));
                    setDraftMinPrice(String(Math.min(safeMin, safeMax)));
                    setAppliedMinPrice(String(Math.min(safeMin, safeMax)));
                  } else {
                    setDraftMinRange(PRICE_MIN);
                    setAppliedMinPrice("");
                  }

                  if (normalizedMax !== null) {
                    setDraftMaxRange(Math.max(safeMax, safeMin));
                    setDraftMaxPrice(String(Math.max(safeMax, safeMin)));
                    setAppliedMaxPrice(String(Math.max(safeMax, safeMin)));
                  } else {
                    setDraftMaxRange(PRICE_MAX);
                    setAppliedMaxPrice("");
                  }
                }
                setAppliedCategories(
                  Object.entries(draftCategories)
                    .filter(([, isSelected]) => isSelected)
                    .map(([name]) => name),
                );
                setAppliedColors(
                  Object.entries(draftColors)
                    .filter(([, isSelected]) => isSelected)
                    .map(([name]) => name),
                );
                setPage(1);
              }}
            >
              Показать
            </button>
            <button
              type="button"
              className="btnReset"
              onClick={() => {
                setDraftMinPrice("");
                setDraftMaxPrice("");
                setDraftMinRange(PRICE_MIN);
                setDraftMaxRange(PRICE_MAX);
                setDraftCategories({});
                setDraftColors({});
                setAppliedMinPrice("");
                setAppliedMaxPrice("");
                setAppliedCategories([]);
                setAppliedColors([]);
                setSort("new");
                setPage(1);
              }}
            >
              Сбросить
            </button>
          </div>
        </aside>
      </div>

      {visibleProducts.length > 0 && totalPages > 1 ? (
        <div className="pagination">
          {paginationItems.map((n, idx) =>
            n === -1 ? (
              <span key={`dots-${idx}`} style={{ color: "rgba(8,6,13,0.55)" }}>
                ...
              </span>
            ) : (
              <button
                key={n}
                type="button"
                className={
                  n === currentPage ? "pageBtn pageBtnActive" : "pageBtn"
                }
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ),
          )}
        </div>
      ) : null}

      <ProductModal
        open={Boolean(opened)}
        product={opened}
        onClose={() => setOpened(null)}
      />
    </div>
  );
}
