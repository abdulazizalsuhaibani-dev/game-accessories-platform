import React from "react";
import ContentPage from "../components/content/ContentPage";
import { useStoreSettings } from "../context/StoreSettings";

export default function AboutPage() {
  const { t } = useStoreSettings();

  return (
    <ContentPage title={t("about.title")} paragraphs={[t("about.p1"), t("about.p2"), t("about.p3")]} />
  );
}
