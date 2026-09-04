import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import { createArcadeTheme } from "./theme/arcadeTheme";
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
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import ShippingPage from "./pages/ShippingPage";
import ReturnsPage from "./pages/ReturnsPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import SubscriptionActionPage from "./pages/SubscriptionActionPage";
import axios from "axios";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Layout from "./components/shared/Layout";
import { cartItemCount } from "./utils/cart";
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
  const { isRTL, theme } = useStoreSettings();
  // Rebuilt when the language or the color theme flips, so MUI's own portals
  // mirror too. MUI can't read var(--color-x) for its palette (see
  // theme/arcadeTheme.js), so this is a real rebuild, not just a CSS swap.
  const appTheme = useMemo(
    () => createTheme(createArcadeTheme(theme), { direction: isRTL ? "rtl" : "ltr" }),
    [theme, isRTL]
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

  const [wishList, setWishList] = useState(initializeWishlist);
  const [wishListCount, setWishListCount] = useState(initializeWishlistCount);
  const [cart, setCart] = useState(initializeCart);
  // Derived, never set. The badge is the sum of quantities, which is what a
  // shopper expects and what the cart summary already showed; keeping it as
  // state meant four call sites each writing their own idea of the count, and
  // three of them wrote the number of lines instead.
  const cartCount = useMemo(() => cartItemCount(cart), [cart]);
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
    // The token can outlive the account it was issued for, so a failed or
    // empty answer from /Users/auth has to drop it. Leaving it in storage
    // means every later request keeps presenting a token nobody honours.
    function clearSession() {
      localStorage.removeItem("token");
      setUserData(null);
    }

    function getUserData() {
      const token = localStorage.getItem("token");
      axios
        .get(`${API_BASE}/Users/auth`, {
          headers: {
            Authorization: `Bearer ${token} `,
          },
        })
        .then((response) => {
          // A 200 is not by itself proof of a session: an empty body arrives
          // here as "", and storing that would leave the app signed in as a
          // user with no fields.
          if (response.data && response.data.userId) {
            setUserData(response.data);
          } else {
            clearSession();
          }
          setIsUserDataLoading(false);
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            clearSession();
          }
          setIsUserDataLoading(false);
          console.log(error);
        });
    }
    getUserData();
  }, []);

  // Truthiness rather than `!== null`, so a malformed payload can never read
  // as a signed-in session.
  const isAuthenticated = Boolean(userData && userData.userId);

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
                <Route path="/about" element={<AboutPage />} key="about" />,
                <Route path="/contact" element={<ContactPage />} key="contact" />,
                <Route path="/faq" element={<FaqPage />} key="faq" />,
                <Route path="/shipping" element={<ShippingPage />} key="shipping" />,
                <Route path="/returns" element={<ReturnsPage />} key="returns" />,
                <Route path="/terms" element={<TermsPage />} key="terms" />,
                <Route path="/privacy" element={<PrivacyPage />} key="privacy" />,
                // where the links in our emails land - public, since a subscriber need not
                // have an account
                <Route
                  path="/subscriptions/confirm"
                  element={<SubscriptionActionPage action="confirm" />}
                  key="subscriptionConfirm"
                />,
                <Route
                  path="/subscriptions/unsubscribe"
                  element={<SubscriptionActionPage action="unsubscribe" />}
                  key="subscriptionUnsubscribe"
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
