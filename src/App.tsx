import { type ReactElement, useEffect } from "react";
import { Layout } from "@/components/layout";
import {
  AuthProvider,
  UIProvider,
  ListingsProvider,
  FavoritesProvider,
} from "@/context";
import { TokenManager } from "@/utils/TokenManager";
import AppRoutes from "./routes/Routes";

const App: () => ReactElement = () => {
  useEffect(() => {
    // Initialize authentication on app start
    TokenManager.initialize();
  }, []);

  return (
    <UIProvider>
      <AuthProvider>
        <FavoritesProvider>
          <ListingsProvider>
            <Layout>
              <AppRoutes />
            </Layout>
          </ListingsProvider>
        </FavoritesProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default App;
