import {
  Routes as RouterRoutes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { Profile } from "@/pages/Profile";
import Search from "@/pages/Search";
import ListingDetails from "@/components/listings/edit/ListingDetails";
import CreateListing from "@/components/listings/create/CreateListing";
import EditListing from "@/components/listings/edit/EditListing";
import SavedListings from "@/components/listings/edit/favorites/ListingsCollection";
import Messages from "@/pages/Messages";
import CategoryPage from "@/pages/CategoryPage";
import Settings from "@/pages/Settings";
import PrivateRoute from "@/components/auth/AuthRoute";

const Routes = (): JSX.Element => {
  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute publicRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route path="/api/auth/login" element={<Login />} />
      <Route path="/api/auth/register" element={<Register />} />
      <Route
        path="/search"
        element={
          <PrivateRoute publicRoute>
            <Search />
          </PrivateRoute>
        }
      />
      <Route
        path="/listings/:id"
        element={
          <PrivateRoute publicRoute>
            <ListingDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/category/:category"
        element={
          <PrivateRoute publicRoute>
            <CategoryPage />
          </PrivateRoute>
        }
      />
      {/* Redirect /listings to home */}
      <Route path="/listings" element={<Navigate to="/" replace />} />

      {/* Protected Routes */}
      <Route
        element={
          <PrivateRoute>
            <Outlet />
          </PrivateRoute>
        }
      >
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/settings" element={<Settings />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/edit-listing/:id" element={<EditListing />} />
        <Route
          path="/saved-listings"
          element={<SavedListings type="saved" />}
        />
        <Route path="/messaging" element={<Messages />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;
