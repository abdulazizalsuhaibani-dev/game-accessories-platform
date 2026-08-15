import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import arcadeTheme from "./theme/arcadeTheme";
import { StoreSettingsProvider, useStoreSettings } from "./context/StoreSettings";
import { API_BASE } from "./api";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import WishListPage from "./pages/WishListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import EntityPage from "./pages/EntityPage";
import UserProfilePage from "./pages/UserProfilePage";
import axios from "axios";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Layout from "./components/shared/Layout";
import DocumentTitle from "./components/shared/DocumentTitle";
import CheckoutPage from "./pages/CheckoutPage";

function App() {
  return (
    <StoreSettingsProvider>
      <Store />
    </StoreSettingsProvider>
  );
}

function Store() {
  const { isRTL } = useStoreSettings();
  // Rebuilt only when the language flips, so MUI's own portals mirror too.
  const appTheme = useMemo(
    () => createTheme(arcadeTheme, { direction: isRTL ? "rtl" : "ltr" }),
    [isRTL]
  );

  function initializeWishlist() {
    const wishList = JSON.parse(localStorage.getItem("wishList"));
    if (wishList == null) localStorage.setItem("wishList", JSON.stringify([]));
    return wishList != null ? wishList : [];
  }

  function initializeCart() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (cart == null) localStorage.setItem("cart", JSON.stringify([]));
    return cart != null ? cart : [];
  }

  function initializeWishlistCount() {
    const wishList = initializeWishlist();
    const wishListCount = wishList.length;
    return wishListCount;
  }

  function initializeCartCount() {
    const cart = initializeCart();
    const cartCount = cart.length;
    return cartCount;
  }

  const [wishList, setWishList] = useState(initializeWishlist);
  const [wishListCount, setWishListCount] = useState(initializeWishlistCount);
  const [cart, setCart] = useState(initializeCart);
  const [cartCount, setCartCount] = useState(initializeCartCount);
  const [userData, setUserData] = useState(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const [openSuccessSnackBar, setOpenSuccessSnackBar] = useState(false);
  const [openErrorSnackBar, setOpenErrorSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");

  const handleSuccessSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccessSnackBar(false);
  };
  const handleErrorSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenErrorSnackBar(false);
  };

  useEffect(() => {
    function getUserData() {
      const token = localStorage.getItem("token");
      axios
        .get(`${API_BASE}/Users/auth`, {
          headers: {
            Authorization: `Bearer ${token} `,
          },
        })
        .then((response) => {
          setUserData(response.data);
          setIsUserDataLoading(false);
        })
        .catch((error) => {
          setIsUserDataLoading(false);
          console.log(error);
        });
    }
    getUserData();
  }, []);

  let isAuthenticated = userData !== null;

  return (
    <ThemeProvider theme={appTheme}>
      <div className="App">
        <BrowserRouter>
          <DocumentTitle />
          <Routes>
            <Route
              path="/"
              element={
                <Layout
                  isAuthenticated={isAuthenticated}
                  isUserDataLoading={isUserDataLoading}
                  wishListCount={wishListCount}
                  cartCount={cartCount}
                  userData={userData}
                  setUserData={setUserData}
                  snackBarMessage={snackBarMessage}
                  openSuccessSnackBar={openSuccessSnackBar}
                  handleSuccessSnackBarClose={handleSuccessSnackBarClose}
                  openErrorSnackBar={openErrorSnackBar}
                  handleErrorSnackBarClose={handleErrorSnackBarClose}
                />
              }
              children={[
                <Route path="/" element={<HomePage />} key="homepage" />,
                <Route
                  path="/products"
                  element={<ProductsPage />}
                  key="products"
                />,
                <Route
                  path="/products/:productId"
                  element={
                    <ProductDetails
                      wishList={wishList}
                      setWishList={setWishList}
                      wishListCount={wishListCount}
                      setWishListCount={setWishListCount}
                      cart={cart}
                      setCart={setCart}
                      cartCount={cartCount}
                      setCartCount={setCartCount}
                      userData={userData}
                      isAuthenticated={isAuthenticated}
                      setSnackBarMessage={setSnackBarMessage}
                      setOpenSuccessSnackBar={setOpenSuccessSnackBar}
                      setOpenErrorSnackBar={setOpenErrorSnackBar}
                    />
                  }
                  key="productDetails"
                />,
                <Route
                  path="/cart"
                  element={
                    <CartPage
                      cart={cart}
                      setCart={setCart}
                      cartCount={cartCount}
                      setCartCount={setCartCount}
                      userData={userData}
                      setSnackBarMessage={setSnackBarMessage}
                      setOpenSuccessSnackBar={setOpenSuccessSnackBar}
                      setOpenErrorSnackBar={setOpenErrorSnackBar}
                    />
                  }
                  key="cart"
                />,
                <Route
                  path="/wishlist"
                  element={
                    <WishListPage
                      wishList={wishList}
                      setWishList={setWishList}
                      wishListCount={wishListCount}
                      setWishListCount={setWishListCount}
                    />
                  }
                  key="wishlist"
                />,
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute
                      isUserDataLoading={isUserDataLoading}
                      isAuthenticated={isAuthenticated}
                      element={
                        <UserProfilePage
                          userData={userData}
                          setUserData={setUserData}
                          setSnackBarMessage={setSnackBarMessage}
                          setOpenSuccessSnackBar={setOpenSuccessSnackBar}
                          setOpenErrorSnackBar={setOpenErrorSnackBar}
                        />
                      }
                      userData={userData}
                      shouldCheckAdmin={false}
                    />
                  }
                  key="profile"
                />,
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute
                      isUserDataLoading={isUserDataLoading}
                      isAuthenticated={isAuthenticated}
                      element={
                        <CheckoutPage
                          userData={userData}
                          setSnackBarMessage={setSnackBarMessage}
                          setOpenSuccessSnackBar={setOpenSuccessSnackBar}
                          setOpenErrorSnackBar={setOpenErrorSnackBar}
                          setCart={setCart}
                          setCartCount={setCartCount}
                          cart={cart}
                        />
                      }
                      userData={userData}
                      shouldCheckAdmin={false}
                    />
                  }
                  key="checkout"
                />,
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute
                      isUserDataLoading={isUserDataLoading}
                      isAuthenticated={isAuthenticated}
                      element={<DashboardPage userData={userData} />}
                      userData={userData}
                      shouldCheckAdmin={true}
                    />
                  }
                  key="dashboard"
                />,
                <Route
                  path="/dashboard/:tableName"
                  element={
                    <ProtectedRoute
                      isUserDataLoading={isUserDataLoading}
                      isAuthenticated={isAuthenticated}
                      element={
                        <EntityPage
                          userData={userData}
                          setSnackBarMessage={setSnackBarMessage}
                          setOpenSuccessSnackBar={setOpenSuccessSnackBar}
                          setOpenErrorSnackBar={setOpenErrorSnackBar}
                        />
                      }
                      userData={userData}
                      shouldCheckAdmin={true}
                    />
                  }
                  key="entity"
                />,
                <Route path="*" element={<ErrorPage />} key="error" />,
              ]}
            />
            <Route path="/login" element={<LoginPage />} key="login" />,
            <Route path="/signUp" element={<RegisterPage />} key="register" />,
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
