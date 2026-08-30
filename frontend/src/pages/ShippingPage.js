import React from "react";
import ContentPage from "../components/content/ContentPage";
import { useStoreSettings } from "../context/StoreSettings";

export default function ShippingPage() {
  const { t } = useStoreSettings();

  return (
    <ContentPage
      title={t("shipping.title")}
      intro={t("shipping.intro")}
      sections={[
        { heading: t("shipping.s1Heading"), body: t("shipping.s1Body") },
        { heading: t("shipping.s2Heading"), body: t("shipping.s2Body") },
        { heading: t("shipping.s3Heading"), body: t("shipping.s3Body") },
        { heading: t("shipping.s4Heading"), body: t("shipping.s4Body") },
      ]}
    />
  );
}
