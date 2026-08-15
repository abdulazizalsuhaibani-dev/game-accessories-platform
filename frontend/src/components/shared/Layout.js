import React from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { Snackbar, Alert } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function Layout(prop) {
  const {
    wishListCount,
    cartCount,
    isAuthenticated,
    isUserDataLoading,
    userData,
    setUserData,
    snackBarMessage,
    openSuccessSnackBar,
    handleSuccessSnackBarClose,
    openErrorSnackBar,
    handleErrorSnackBarClose,
  } = prop;
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Header
        wishListCount={wishListCount}
        cartCount={cartCount}
        isAuthenticated={isAuthenticated}
        isUserDataLoading={isUserDataLoading}
        userData={userData}
        setUserData={setUserData}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Snackbar
        open={openSuccessSnackBar}
        autoHideDuration={6000}
        onClose={handleSuccessSnackBarClose}
      >
        <Alert
          onClose={handleSuccessSnackBarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openErrorSnackBar}
        autoHideDuration={6000}
        onClose={handleErrorSnackBarClose}
      >
        <Alert
          onClose={handleErrorSnackBarClose}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
