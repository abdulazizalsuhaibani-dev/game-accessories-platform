import React from "react";
import UserProfile from "../components/user/UserProfile";

export default function UserProfilePage(prop) {
  const {
    userData,
    setUserData,
    setSnackBarMessage,
    setOpenSuccessSnackBar,
    setOpenErrorSnackBar,
  } = prop;

  return (
    <div>
      <UserProfile
        userData={userData}
        setUserData={setUserData}
        setSnackBarMessage={setSnackBarMessage}
        setOpenSuccessSnackBar={setOpenSuccessSnackBar}
        setOpenErrorSnackBar={setOpenErrorSnackBar}
      />
    </div>
  );
}
