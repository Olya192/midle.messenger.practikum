// routerHelper.ts

import Router from "../framework/Router";

let globalRouter: Router | null = null;

export function initRouter(rootQuery: string = "#app"): Router {
  globalRouter = new Router(rootQuery);
  return globalRouter;
}

export function getRouter(): Router {
  if (!globalRouter) {
    throw new Error("Router not initialized. Call initRouter first.");
  }
  return globalRouter;
}

export interface NavigationAPI {
  navigate: (path: string) => void;
  back: () => void;
  forward: () => void;
  currentPath: () => string;
}

export function useNavigation(): NavigationAPI {
  const router = getRouter();
  return {
    navigate: (path: string) => router.go(path),
    back: () => router.back(),
    forward: () => router.forward(),
    currentPath: () => window.location.pathname
  };
}

export const ROUTES = {
  LOGIN: "/",
  REGISTER: "/sign-up",
  CHATS: "/messenger",
  PROFILE: "/settings",
  NOT_FOUND: "/404",
  SERVER_ERROR: "/500",
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
