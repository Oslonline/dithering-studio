"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useParams as useNextParams, usePathname, useRouter, useSearchParams } from "next/navigation";

type ToObject = {
  pathname?: string;
  search?: string;
  hash?: string;
};

type To = string | ToObject;

type NavigateOptions = {
  replace?: boolean;
};

const normalizeSearch = (search?: string): string => {
  if (!search) return "";
  return search.startsWith("?") ? search : `?${search}`;
};

const normalizeHash = (hash?: string): string => {
  if (!hash) return "";
  return hash.startsWith("#") ? hash : `#${hash}`;
};

export const toHref = (to: To): string => {
  if (typeof to === "string") return to;
  const pathname = to.pathname ?? "";
  return `${pathname}${normalizeSearch(to.search)}${normalizeHash(to.hash)}`;
};

type CompatLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: To;
  children: ReactNode;
};

export function Link({ to, children, ...rest }: CompatLinkProps) {
  return (
    <NextLink href={toHref(to)} {...rest}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();

  return (to: To, options?: NavigateOptions) => {
    const href = toHref(to);
    if (options?.replace) {
      router.replace(href);
      return;
    }
    router.push(href);
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const readHash = () => setHash(window.location.hash || "");
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const search = useMemo(() => {
    const query = searchParams.toString();
    return query ? `?${query}` : "";
  }, [searchParams]);

  return {
    pathname,
    search,
    hash,
  };
}

export function useParams<T extends Record<string, string | undefined>>() {
  return useNextParams<T>();
}

export function Navigate({ to, replace = false }: { to: To; replace?: boolean }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}
