import React from "react";
import ContentPage from "../components/content/ContentPage";
import { useStoreSettings } from "../context/StoreSettings";

export default function ReturnsPage() {
  const { t } = useStoreSettings();

  return (
    <ContentPage
      title={t("returns.title")}
      intro={t("returns.intro")}
      sections={[
        { heading: t("returns.s1Heading"), body: t("returns.s1Body") },
        { heading: t("returns.s2Heading"), body: t("returns.s2Body") },
        { heading: t("returns.s3Heading"), body: t("returns.s3Body") },
        { heading: t("returns.s4Heading"), body: t("returns.s4Body") },
        { heading: t("returns.s5Heading"), body: t("returns.s5Body") },
      ]}
    />
  );
}
