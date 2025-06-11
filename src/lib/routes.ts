export const ROUTES = {
  HOME: '/',
  PROFILE: {
    VIEW: (id: string) => `/profile/${id}` as const,
    EDIT: '/profile/edit',
  },
  PROBLEM: {
    VIEW: (id: string) => `/problem/${id}` as const,
  },
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP: '/auth/sign-up',
  },
} as const;

// Type helper for route parameters
export type RouteParams<T extends string> = T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & RouteParams<`${Start}${Rest}`>
  : T extends `${infer Start}:${infer Param}`
  ? { [K in Param]: string }
  : {};

// Type helper for route paths
export type RoutePath = typeof ROUTES[keyof typeof ROUTES] extends string
  ? typeof ROUTES[keyof typeof ROUTES]
  : typeof ROUTES[keyof typeof ROUTES] extends (...args: any[]) => string
  ? ReturnType<typeof ROUTES[keyof typeof ROUTES]>
  : never; 