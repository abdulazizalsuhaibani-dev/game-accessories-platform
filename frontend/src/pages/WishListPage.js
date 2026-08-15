import React from "react";
import WishList from "../components/wishList/WishList";

export default function WishListPage({ wishList, setWishList, setWishListCount }) {
  return (
    <WishList
      wishList={wishList}
      setWishList={setWishList}
      setWishListCount={setWishListCount}
    />
  );
}
