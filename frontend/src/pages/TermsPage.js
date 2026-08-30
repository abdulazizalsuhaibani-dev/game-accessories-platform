import React from "react";
import ContentPage from "../components/content/ContentPage";
import { useStoreSettings } from "../context/StoreSettings";

export default function TermsPage() {
  const { t } = useStoreSettings();

  return (
    <ContentPage
      title={t("terms.title")}
      intro={t("terms.intro")}
      sections={[
        { heading: t("terms.s1Heading"), body: t("terms.s1Body") },
        { heading: t("terms.s2Heading"), body: t("terms.s2Body") },
        { heading: t("terms.s3Heading"), body: t("terms.s3Body") },
        { heading: t("terms.s4Heading"), body: t("terms.s4Body") },
        { heading: t("terms.s5Heading"), body: t("terms.s5Body") },
        { heading: t("terms.s6Heading"), body: t("terms.s6Body") },
        { heading: t("terms.s7Heading"), body: t("terms.s7Body") },
      ]}
    />
  );
}
