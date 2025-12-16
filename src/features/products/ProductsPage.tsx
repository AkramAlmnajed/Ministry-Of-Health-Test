import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import type { ProductsResponse, Product } from "./products.api";
import { fetchProducts, deleteProduct } from "./products.api";

import AddProductDialog from "./AddProductDialog";
import EditProductDialog from "./EditProductDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { useToast } from "../../components/toast/ToastContext";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function SpinnerCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-14">
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-blue-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      <div>
        <div className="text-sm font-medium text-white">Loading products…</div>
        <div className="mt-1 text-center text-xs text-slate-500">Please wait</div>
      </div>
    </div>
  );
}

function parseApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg =
      (err.response?.data as { message?: string; error?: string } | undefined)?.message ??
      (err.response?.data as { error?: string } | undefined)?.error;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (err.response?.status) return `Request failed (${err.response.status}).`;
    return err.message || "Request failed.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export default function ProductsPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { push } = useToast();

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState<number>(1);

  const limit = 10;
  const skip = (page - 1) * limit;

  const keyParams = useMemo(() => ({ query, limit, skip }), [query, limit, skip]);
  const currentQueryKey = useMemo(() => ["products", keyParams] as const, [keyParams]);

  const { data, isLoading, isError, error, isFetching } = useQuery<ProductsResponse, Error>({
    queryKey: currentQueryKey,
    queryFn: async () => {
      await sleep(250);
      return fetchProducts({ q: query, limit, skip });
    },
    staleTime: 0,
  });

  const rows: Product[] = data?.products ?? [];
  const totalPages = useMemo(() => {
    const total = data?.total ?? 0;
    return Math.max(1, Math.ceil(total / limit));
  }, [data?.total, limit]);

  const onSubmitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const clearSearch = () => {
    setSearch("");
    setQuery("");
    setPage(1);
  };

  const showSpinner = isLoading || isFetching;

  const delMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: (_, id) => {
      qc.setQueryData(currentQueryKey, (old: unknown) => {
        const o = old as ProductsResponse | undefined;
        if (!o?.products) return old;
        return {
          ...o,
          products: o.products.filter((p) => p.id !== id),
          total: Math.max(0, (o.total ?? 0) - 1),
        } satisfies ProductsResponse;
      });

      qc.invalidateQueries({ queryKey: ["products"] });

      push({ type: "success", title: "Deleted", message: "Product removed successfully." });
      setOpenDelete(false);
      setDeleting(null);
    },
    onError: (err) => {
      push({ type: "error", title: "Delete failed", message: parseApiError(err) });
    },
  });

  const openEditDialog = (p: Product) => {
    setEditing(p);
    setOpenEdit(true);
  };

  const openDeleteDialog = (p: Product) => {
    setDeleting(p);
    setOpenDelete(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AddProductDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        queryKeyForCurrentPage={currentQueryKey}
      />

      <EditProductDialog
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        product={editing}
        queryKeyForCurrentPage={currentQueryKey}
      />

      <DeleteConfirmDialog
        open={openDelete}
        pending={delMutation.isPending}
        title="Delete product?"
        description={deleting ? `This will delete "${deleting.title}".` : ""}
        onClose={() => {
          if (delMutation.isPending) return;
          setOpenDelete(false);
          setDeleting(null);
        }}
        onConfirm={() => {
          if (!deleting) return;
          delMutation.mutate(deleting.id);
        }}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Products</h1>
          <p className="mt-1 text-sm text-slate-400">
            {query ? (
              <>
                Searching for: <span className="font-medium text-white">"{query}"</span>{" "}
                <span className="text-slate-500">({data?.total ?? 0} results)</span>
              </>
            ) : (
              "Manage your product inventory"
            )}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/30"
          onClick={() => setOpenAdd(true)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </motion.button>
      </div>

      {/* Search */}
      <form onSubmit={onSubmitSearch} className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-slate-800 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-slate-700"
        >
          Search
        </button>

        {query ? (
          <button
            type="button"
            onClick={clearSearch}
            className="shrink-0 rounded-xl border border-slate-700 bg-transparent px-5 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
          >
            Clear
          </button>
        ) : null}
      </form>

      {/* Table Card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
          <div className="text-sm font-medium text-slate-300">
            {showSpinner ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                Loading...
              </span>
            ) : (
              `Showing ${rows.length} results`
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {showSpinner ? (
            <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SpinnerCard />
            </motion.div>
          ) : isError ? (
            <motion.div key="error" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-6">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                Failed to load products. <span className="text-red-300">{error?.message ?? ""}</span>
              </div>
            </motion.div>
          ) : rows.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 p-3">
                <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="mt-3 text-sm text-slate-500">No products found.</p>
            </motion.div>
          ) : (
            <motion.div
              key={`table-${page}-${query}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto"
            >
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-5 sm:px-6">Title</th>
                    <th className="py-4 px-5 sm:px-6">Price</th>
                    <th className="py-4 px-5 sm:px-6">Category</th>
                    <th className="py-4 px-5 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {rows.map((p) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group transition-colors hover:bg-slate-800/30"
                    >
                      <td className="py-4 px-5 sm:px-6">
                        <span className="font-medium text-white">{p.title}</span>
                      </td>
                      <td className="py-4 px-5 sm:px-6">
                        <span className="font-mono text-emerald-400">${p.price}</span>
                      </td>
                      <td className="py-4 px-5 sm:px-6">
                        <span className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 sm:px-6">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => nav(`/products/${p.id}`)}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditDialog(p)}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteDialog(p)}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!showSpinner && !isError && (data?.total ?? 0) > 0 ? (
          <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="text-xs text-slate-500">
              Page <span className="font-medium text-slate-300">{page}</span> of{" "}
              <span className="font-medium text-slate-300">{totalPages}</span>
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              {[
                { label: "First", onClick: () => setPage(1), disabled: page === 1 },
                { label: "Prev", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1 },
                { label: "Next", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page >= totalPages },
                { label: "Last", onClick: () => setPage(totalPages), disabled: page >= totalPages },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  disabled={btn.disabled}
                  onClick={btn.onClick}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 transition-all hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}