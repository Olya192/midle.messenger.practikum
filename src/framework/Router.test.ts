import Router from "./Router";
import Route from "./Route";
import type { BlockFactory } from "../types/type";

jest.mock("./Route");

const createAuthPage = jest.fn();
const createRegisterPage = jest.fn();
const createChatsPage = jest.fn();
const createProfilePage = jest.fn();
const create404Page = jest.fn();
const create500Page = jest.fn();

interface MockRouteInstance {
  match: jest.Mock<boolean, [string]>;
  render: jest.Mock<void, []>;
  leave: jest.Mock<void, []>;
  navigate: jest.Mock<void, [string]>;
}

class TestRouterWrapper {
  private router: Router;

  constructor(rootQuery: string = "#app") {
    this.router = new Router(rootQuery);
  }

  use(pathname: string, blockFactory: BlockFactory): this {
    this.router.use(pathname, blockFactory);
    return this;
  }

  start(): void {
    this.router.start();
  }

  go(pathname: string): void {
    this.router.go(pathname);
  }

  back(): void {
    this.router.back();
  }

  forward(): void {
    this.router.forward();
  }

  getRoute(pathname: string): Route | undefined {
    return this.router.getRoute(pathname);
  }

  getCurrentRoute(): Route | null {
    return this.router.getCurrentRoute();
  }

  get routes(): Route[] {
    return (this.router as unknown as { routes: Route[] }).routes;
  }

  get history(): History {
    return (this.router as unknown as { history: History }).history;
  }

  get currentRoute(): Route | null {
    return (this.router as unknown as { _currentRoute: Route | null })
      ._currentRoute;
  }

  set currentRoute(route: Route | null) {
    (this.router as unknown as { _currentRoute: Route | null })._currentRoute =
      route;
  }

  callOnRoute(pathname: string): void {
    (
      this.router as unknown as { _onRoute: (pathname: string) => void }
    )._onRoute(pathname);
  }

  getOriginalRouter(): Router {
    return this.router;
  }

  static resetInstance(): void {
    (Router as unknown as { __instance: Router | null }).__instance = null;
  }
}

describe("Router", () => {
  let router: TestRouterWrapper;
  let mockRouteInstance: MockRouteInstance;

  const originalHistory = window.history;
  const originalLocation = window.location;
  const originalOnPopState = window.onpopstate;

  beforeEach(() => {
    const mockHistory = {
      pushState: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      go: jest.fn(),
      length: 1,
      scrollRestoration: "auto" as const,
      state: {},
    };

    Object.defineProperty(window, "history", {
      value: mockHistory,
      writable: true,
      configurable: true,
    });

    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = {
      ancestorOrigins: {} as DOMStringList,
      hash: "",
      host: "localhost",
      hostname: "localhost",
      href: "http://localhost/",
      origin: "http://localhost",
      pathname: "/",
      port: "",
      protocol: "http:",
      search: "",
      reload: jest.fn(),
      replace: jest.fn(),
      assign: jest.fn(),
      toString: () => "http://localhost/",
    } as Location;

    window.onpopstate = null;

    mockRouteInstance = {
      match: jest.fn(),
      render: jest.fn(),
      leave: jest.fn(),
      navigate: jest.fn(),
    };

    (Route as jest.Mock).mockImplementation(() => mockRouteInstance);

    createAuthPage.mockClear();
    createRegisterPage.mockClear();
    createChatsPage.mockClear();
    createProfilePage.mockClear();
    create404Page.mockClear();
    create500Page.mockClear();

    TestRouterWrapper.resetInstance();

    router = new TestRouterWrapper("#app");
    router
      .use("/", createAuthPage)
      .use("/sign-up", createRegisterPage)
      .use("/messenger", createChatsPage)
      .use("/settings", createProfilePage)
      .use("/404", create404Page)
      .use("/500", create500Page);
  });

  afterEach(() => {
    Object.defineProperty(window, "history", {
      value: originalHistory,
      writable: true,
      configurable: true,
    });

    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = originalLocation;

    window.onpopstate = originalOnPopState;

    jest.clearAllMocks();
    TestRouterWrapper.resetInstance();
  });

  test("should register routes correctly and maintain singleton pattern", () => {
    expect(Route).toHaveBeenCalledTimes(6);
    expect(Route).toHaveBeenCalledWith("/", createAuthPage, {
      rootQuery: "#app",
    });
    expect(Route).toHaveBeenCalledWith("/sign-up", createRegisterPage, {
      rootQuery: "#app",
    });
    expect(Route).toHaveBeenCalledWith("/messenger", createChatsPage, {
      rootQuery: "#app",
    });

    const result = router.use("/test", jest.fn());
    expect(result).toBe(router);

    const router2 = new TestRouterWrapper("#test");
    expect(router2.getOriginalRouter()).toBe(router.getOriginalRouter());
  });

  test("should navigate between pages and render correct routes", () => {
    // Настраиваем match для существующих путей
    mockRouteInstance.match.mockImplementation((pathname: string) => {
      return ["/", "/sign-up", "/messenger", "/settings", "/500"].includes(
        pathname,
      );
    });

    const paths = ["/", "/sign-up", "/messenger", "/settings", "/500"];

    paths.forEach((path) => {
      router.go(path);
      expect(window.history.pushState).toHaveBeenCalledWith({}, "", path);
      expect(mockRouteInstance.render).toHaveBeenCalled();
      mockRouteInstance.render.mockClear();
      mockRouteInstance.match.mockClear();
    });

    router.back();
    expect(window.history.back).toHaveBeenCalled();

    router.forward();
    expect(window.history.forward).toHaveBeenCalled();
  });

  test("should find existing route and track current route correctly", () => {
    // Настраиваем match для тестируемых путей
    mockRouteInstance.match.mockImplementation((pathname: string) => {
      return pathname === "/messenger" || pathname === "/settings";
    });

    const route = router.getRoute("/messenger");
    expect(route).toBeDefined();

    const nonExistentRoute = router.getRoute("/non-existent");
    expect(nonExistentRoute).toBeUndefined();

    router.callOnRoute("/settings");
    expect(router.getCurrentRoute()).toBe(
      mockRouteInstance as unknown as Route,
    );

    // Создаем новый роутер после сброса синглтона
    TestRouterWrapper.resetInstance();
    const newRouter = new TestRouterWrapper("#app");
    expect(newRouter.getCurrentRoute()).toBeNull();
  });

  test("should handle navigation and errors gracefully", () => {
    const authRouteMock = {
      match: jest.fn().mockReturnValue(true),
      render: jest.fn(),
      leave: jest.fn(),
      navigate: jest.fn(),
    };
    const chatsRouteMock = {
      match: jest.fn().mockReturnValue(true),
      render: jest.fn(),
      leave: jest.fn(),
      navigate: jest.fn(),
    };

    (Route as jest.Mock)
      .mockImplementationOnce(() => authRouteMock)
      .mockImplementationOnce(() => chatsRouteMock);

    const testRouter = new TestRouterWrapper("#app");
    testRouter.use("/", createAuthPage).use("/messenger", createChatsPage);

    testRouter.start();
    expect(authRouteMock.render).toHaveBeenCalled();

    // Проверяем, что можно перейти на другой маршрут без ошибок
    expect(() => testRouter.go("/messenger")).not.toThrow();

    // Проверяем обработку ошибок для несуществующих маршрутов
    expect(() => testRouter.callOnRoute("/non-existent")).not.toThrow();
    expect(() => router.use("", createAuthPage)).not.toThrow();
  });
});
