import React from "react";
import { Link } from "react-router-dom";
import { useStoreSettings } from "../../context/StoreSettings";

export default function Error({ errorMessage, errorCode }) {
  const { t, num } = useStoreSettings();

  return (
    <div className="flex flex-col items-center gap-6 bg-chassis px-6 py-24">
      <div className="font-display text-[96px] font-bold leading-none text-acid sm:text-[140px]">
        {num(errorCode ?? 404)}
      </div>
      <p className="m-0 max-w-[40ch] text-center text-base text-dim">{errorMessage}</p>
      <Link to="/" className="h-[50px] btn-acid">
        {t("error.goHome")}
      </Link>
    </div>
  );
}
