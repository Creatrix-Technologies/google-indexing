export const componentMap: Record<string, any> = {
    Dashboard: () => import('../pages/Dashboard.vue'),
    SiteManagement: () => import('../pages/SiteManagement.vue'),
    Settings: () => import('../pages/Settings.vue'),
    CrawlIndexManagement: () => import('../pages/CrawlIndexManagement.vue'),
    CrawlIndexDetails: () => import('../pages/CrawlIndexDetails.vue'),
    GoogleConfiguration: () => import('../pages/GoogleConfiguration.vue'),
    ScheduleConfiguration: () => import('../pages/ScheduleConfiguration.vue'),
    Users: () => import('../pages/Users.vue'),
    stripe: () => import('../Subscriptions/stripe.vue'),
    plans: () => import('../Subscriptions/plans.vue'),
  };
  