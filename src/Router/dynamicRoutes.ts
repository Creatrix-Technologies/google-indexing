import { componentMap } from '../Router/componentMap';

export function buildRoutes(menus: any[]) {
  const routes: any[] = [];
  const usedNames = new Set<string>();
  const usedPaths = new Set<string>();

  const walk = (items: any[]) => {
    for (const menu of items) {

      if (menu.component && componentMap[menu.component] && menu.path && !usedPaths.has(menu.path)) {
        // Two menu entries can point at the same page under different paths. Routes are registered
        // only when their name is new, so a shared name silently dropped one path (404). The first
        // keeps the component name (navigated to by name); later ones are named after their path.
        const name = usedNames.has(menu.component) ? `${menu.component}@${menu.path}` : menu.component;
        usedNames.add(name);
        usedPaths.add(menu.path);
        routes.push({
          path: menu.path,
          name,
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
