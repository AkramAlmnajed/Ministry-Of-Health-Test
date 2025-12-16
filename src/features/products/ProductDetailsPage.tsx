import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

import { getProduct } from "./products.api";
import type { Product } from "./products.api";

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "text-amber-400" : "text-slate-700"}>
          ★
        </span>
      ))}
      <span className="ml-2 text-xs font-medium text-slate-400">{value.toFixed(1)}</span>
    </div>
  );
}

export default function ProductDetailsPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data, isLoading, isError, error } = useQuery<Product, Error>({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  });

  const images = useMemo(() => {
    const arr = data?.images?.length ? data.images : [];
    const thumb = data?.thumbnail ? [data.thumbnail] : [];
    const merged = Array.from(new Set([...thumb, ...arr])).filter(Boolean);
    return merged;
  }, [data]);

  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 p-14 backdrop-blur-sm">
          <motion.div
            className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-blue-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
          Failed to load product. <span className="text-red-300">{error.message}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const activeSrc = images[activeImg] || data.thumbnail || "";
  const imgKey = activeSrc ? `img:${activeSrc}` : `img:fallback:${data.id}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold tracking-tight text-white"
          >
            {data.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-sm text-slate-400"
          >
            Category: <span className="text-slate-300">{data.category}</span>
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => nav("/products")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </motion.button>
      </div>

      {/* Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm"
        >
          <div className="aspect-square overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <AnimatePresence mode="wait">
              <motion.img
                key={imgKey}
                src={activeSrc}
                alt={data.title}
                className="h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
          </div>

          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {images.slice(0, 5).map((img, i) => (
                <motion.button
                  key={img}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveImg(i)}
                  className={[
                    "aspect-square overflow-hidden rounded-lg border-2 bg-slate-950 transition-all",
                    i === activeImg
                      ? "border-blue-500 ring-4 ring-blue-500/20"
                      : "border-slate-800 hover:border-slate-600",
                  ].join(" ")}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </motion.button>
              ))}
            </div>
          ) : null}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Price</div>
              <div className="mt-2 text-3xl font-bold text-white">
                <span className="text-emerald-400">${data.price}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Rating (mock)</div>
              <div className="mt-2">
                <Stars value={4.2} />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-6">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Description</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{data.description}</p>
          </div>

          {/* Reviews */}
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Reviews (mock)</div>
              <span className="text-xs text-slate-500">3 reviews</span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { name: "Sara", text: "Great quality and fast delivery.", rating: 5 },
                { name: "Ahmad", text: "Good value for the price.", rating: 4 },
                { name: "Lina", text: "Looks nice, packaging could be better.", rating: 4 },
              ].map((r, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
                        {r.name[0]}
                      </div>
                      <span className="text-sm font-medium text-white">{r.name}</span>
                    </div>
                    <div className="text-xs text-amber-400">
                      {Array.from({ length: r.rating }).map(() => "★").join("")}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{r.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
