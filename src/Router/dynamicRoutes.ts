import { componentMap } from '../Router/componentMap';

export function buildRoutes(menus: any[]) {
  const routes: any[] = [];

  const walk = (items: any[]) => {
    for (const menu of items) {

      if (menu.component && componentMap[menu.component]) {
        routes.push({
          path: menu.path,
          name: menu.component,
          component: componentMap[menu.component],
          meta: { 
            requiresAuth: menu.requiresAuth,
            public: !menu.requiresAuth // optional, for convenience
           }
        });
      }

      if (menu.children?.length) {
        walk(menu.children);
      }
    }
  };

  walk(menus);
  return routes;
}
