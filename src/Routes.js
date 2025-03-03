import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ListingDetails from './components/listings/ListingDetails';
import Messages from './pages/Messages';
import CreateListing from './components/listings/create/CreateListing';
import PrivateRoute from './components/auth/PrivateRoute';
import EditListing from './components/listings/EditListing';
import CategoryPage from './pages/CategoryPage';
import ProfileSettings from './pages/ProfileSettings';
import SavedListings from './components/listings/SavedListings';

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout title="Home" description="Find amazing deals near you">
            <Home />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout title="Login" description="Login to your account">
            <Login />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout title="Register" description="Create a new account">
            <Register />
          </Layout>
        }
      />
      <Route
        path="/listings/:id"
        element={
          <Layout title="Listing Details">
            <ListingDetails />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout title="Profile" description="Manage your profile">
            <PrivateRoute component={Profile} />
          </Layout>
        }
      />
      <Route
        path="/messages"
        element={
          <Layout title="Messages" description="Your conversations">
            <PrivateRoute component={Messages} />
          </Layout>
        }
      />
      <Route
        path="/create-listing"
        element={
          <Layout title="Create Listing" description="Create a new listing">
            <PrivateRoute component={CreateListing} />
          </Layout>
        }
      />
      <Route
        path="/edit-listing/:id"
        element={
          <Layout title="Edit Listing" description="Edit your listing">
            <PrivateRoute component={EditListing} />
          </Layout>
        }
      />
      <Route
        path="/category/:categoryId"
        element={
          <Layout>
            <CategoryPage />
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={
          <Layout title="Settings" description="Manage your account settings">
            <PrivateRoute component={ProfileSettings} />
          </Layout>
        }
      />
      <Route
        path="/saved-listings"
        element={
          <Layout title="Saved Listings" description="View and manage your saved listings">
            <PrivateRoute component={SavedListings} />
          </Layout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;