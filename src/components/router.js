
import { Router } from '@lit-labs/router';

export class AppRouter extends Router {
  constructor(element, props){
    const routes = props.routes;
    super(element, routes.map((enteringRoute, i, routes) => {
      const selector = enteringRoute.component;
      if (typeof selector === 'string') {
        enteringRoute.component = () => element.renderRoot.querySelector(selector);
      }
      enteringRoute.enter = async () => {
        await Promise.all(
          routes.reduce((promises, route) => {
            const leavingComponent = route.component();
            if (route !== enteringRoute && leavingComponent?.getAttribute('state') === 'active') {
              promises.push(leavingComponent?.onPageLeave?.())
            }
            leavingComponent?.removeAttribute('state');
            return promises;
          }, [props?.onRouteChange?.(enteringRoute)]).concat([
            enteringRoute?.onEnter?.(),
            enteringRoute.component()?.onPageEnter?.()
          ])
        )
        enteringRoute.component().setAttribute('state', 'active');
      }
      return enteringRoute;
    }))
  }
  navigateTo = (route, state = {}) => {
    history.pushState(state, state.title || '', route)
    this.goto(route);
  };
}