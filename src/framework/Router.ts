import type { BlockFactory, RouteProps } from "../types/type";
import Route from "./Route";

class Router {
  private static __instance: Router | null = null;
  private routes!: Route[];
  private history!: History;
  private _currentRoute!: Route | null;
  private _rootQuery!: string;

  constructor(rootQuery: string = "#app") {
    if (Router.__instance) {
      return Router.__instance;
    }

    this.routes = [];
    this.history = window.history;
    this._currentRoute = null;
    this._rootQuery = rootQuery;

    Router.__instance = this;
  }

  public use(pathname: string, blockFactory: BlockFactory): this {
    const routeProps: RouteProps = { rootQuery: this._rootQuery };
    const route = new Route(pathname, blockFactory, routeProps);
    this.routes.push(route);
    return this;
  }

  public start(): void {
    window.onpopstate = (event: PopStateEvent) => {
      const target = event.currentTarget as Window;
      const pathname = target?.location.pathname || "/";
      this._onRoute(pathname);
    };

    this._onRoute(window.location.pathname);
  }

  private _onRoute(pathname: string): void {
    const route = this.getRoute(pathname);

    if (!route) {
      const notFoundRoute = this.getRoute("/404");
      if (notFoundRoute) {
        if (this._currentRoute) {
          this._currentRoute.leave();
        }
        this._currentRoute = notFoundRoute;
        notFoundRoute.render();
      }
      return;
    }

    if (this._currentRoute && this._currentRoute !== route) {
      this._currentRoute.leave();
    }

    this._currentRoute = route;
    route.render();
  }

  public go(pathname: string): void {
    this.history.pushState({}, "", pathname);
    this._onRoute(pathname);
  }

  public back(): void {
    this.history.back();
  }

  public forward(): void {
    this.history.forward();
  }

  public getRoute(pathname: string): Route | undefined {
    return this.routes.find((route) => route.match(pathname));
  }

  public getCurrentRoute(): Route | null {
    return this._currentRoute;
  }
}

export default Router;
