import React from "react";
import ContentPage from "../components/content/ContentPage";
import { useStoreSettings } from "../context/StoreSettings";

export default function PrivacyPage() {
  const { t } = useStoreSettings();

  return (
    <ContentPage
      title={t("privacy.title")}
      intro={t("privacy.intro")}
      sections={[
        { heading: t("privacy.s1Heading"), body: t("privacy.s1Body") },
        { heading: t("privacy.s2Heading"), body: t("privacy.s2Body") },
        { heading: t("privacy.s3Heading"), body: t("privacy.s3Body") },
        { heading: t("privacy.s4Heading"), body: t("privacy.s4Body") },
        { heading: t("privacy.s5Heading"), body: t("privacy.s5Body") },
        { heading: t("privacy.s6Heading"), body: t("privacy.s6Body") },
      ]}
    />
  );
}
