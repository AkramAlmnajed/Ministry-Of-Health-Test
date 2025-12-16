import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { createProduct } from "./products.api";
import type { CreateProductPayload, Product, ProductsResponse } from "./products.api";
import { useToast } from "../../components/toast/ToastContext";

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  price: z.number().positive("Price must be > 0"),
  description: z.string().min(5, "Description is required"),
  category: z.string().min(2, "Category is required"),
  imageUrl: z.string().url("Please enter a valid image URL"),
});

type FormValues = z.infer<typeof schema>;

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

export default function AddProductDialog({
  open,
  onClose,
  queryKeyForCurrentPage,
}: {
  open: boolean;
  onClose: () => void;
  queryKeyForCurrentPage: readonly unknown[];
}) {
  const { push } = useToast();
  const qc = useQueryClient();

  const defaultValues = useMemo<FormValues>(
    () => ({
      title: "",
      price: 0,
      description: "",
      category: "",
      imageUrl: "",
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: (created: Product) => {
      qc.setQueryData(queryKeyForCurrentPage, (old: unknown) => {
        const o = old as ProductsResponse | undefined;
        if (!o) return old;

        return {
          ...o,
          products: [created, ...(o.products ?? [])].slice(0, o.limit),
          total: (o.total ?? 0) + 1,
        } satisfies ProductsResponse;
      });

      qc.invalidateQueries({ queryKey: ["products"] });

      push({
        type: "success",
        title: "Product added",
        message: `"${created.title}" created successfully.`,
      });

      onClose();
      reset(defaultValues);
    },
    onError: (err) => {
      push({ type: "error", title: "Add product failed", message: parseApiError(err) });
    },
  });

  const resetMutation = mutation.reset;

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
      resetMutation();
    }
  }, [open, reset, defaultValues, resetMutation]);

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      title: values.title.trim(),
      price: values.price,
      description: values.description.trim(),
      category: values.category.trim(),
      imageUrl: values.imageUrl.trim(),
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => (mutation.isPending ? null : onClose())}
          />

          <div className="absolute inset-0 grid place-items-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-lg max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Add Product</h2>
                  <p className="mt-0.5 text-xs text-slate-500 font-mono">POST /products/add</p>
                </div>

                <button
                  type="button"
                  onClick={() => (mutation.isPending ? null : onClose())}
                  disabled={mutation.isPending}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Title
                      </label>
                      <input
                        {...register("title")}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
                        placeholder="e.g., MacBook Pro"
                      />
                      {errors.title?.message ? (
                        <p className="mt-2 text-xs font-medium text-red-400">{errors.title.message}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("price", { valueAsNumber: true })}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
                        placeholder="e.g., 999.99"
                      />
                      {errors.price?.message ? (
                        <p className="mt-2 text-xs font-medium text-red-400">{errors.price.message}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Category
                      </label>
                      <input
                        {...register("category")}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
                        placeholder="e.g., laptops"
                      />
                      {errors.category?.message ? (
                        <p className="mt-2 text-xs font-medium text-red-400">{errors.category.message}</p>
                      ) : null}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        {...register("description")}
                        className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
                        placeholder="Short description..."
                      />
                      {errors.description?.message ? (
                        <p className="mt-2 text-xs font-medium text-red-400">{errors.description.message}</p>
                      ) : null}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Image URL
                      </label>
                      <input
                        {...register("imageUrl")}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
                        placeholder="https://..."
                      />
                      {errors.imageUrl?.message ? (
                        <p className="mt-2 text-xs font-medium text-red-400">{errors.imageUrl.message}</p>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => (mutation.isPending ? null : onClose())}
                      disabled={mutation.isPending}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white sm:w-auto disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {mutation.isPending ? "Adding..." : "Add Product"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}