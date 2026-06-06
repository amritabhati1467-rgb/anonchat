import Layout from "@/components/Layout";
import ChatHome from "@/pages/ChatHome";
import ChatRoom from "@/pages/ChatRoom";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ChatHome,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$conversationId",
  component: ChatRoom,
});

const routeTree = rootRoute.addChildren([indexRoute, chatRoute]);

const appRouter = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof appRouter;
  }
}

export default function App() {
  return <RouterProvider router={appRouter} />;
}
