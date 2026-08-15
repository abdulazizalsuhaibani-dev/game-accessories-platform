import React from "react";
import { useParams } from "react-router-dom";
import Error from "../components/error/Error";
import AdminLayout from "../components/dashboard/AdminLayout";
import useAdminCounts from "../components/dashboard/useAdminCounts";
import ProductsTable from "../components/tables/ProductsTable";
import UsersTable from "../components/tables/UsersTable";
import OrdersTable from "../components/tables/OrdersTable";
import { useStoreSettings } from "../context/StoreSettings";

const TABLES = {
  Products: { component: ProductsTable, titleKey: "admin.products", countKey: "products" },
  Users: { component: UsersTable, titleKey: "admin.users", countKey: "users" },
  Orders: { component: OrdersTable, titleKey: "admin.orders", countKey: "orders" },
};

export default function EntityPage(prop) {
  const { userData, setSnackBarMessage, setOpenSuccessSnackBar, setOpenErrorSnackBar } = prop;
  const { tableName } = useParams();
  const { t, num } = useStoreSettings();
  const counts = useAdminCounts();

  const entry = TABLES[tableName];
  if (!entry) {
    return <Error errorMessage={t("error.notFound")} errorCode={404} />;
  }

  const Table = entry.component;
  const total = counts[entry.countKey];

  return (
    <AdminLayout
      userData={userData}
      counts={counts}
      title={t(entry.titleKey)}
      meta={total == null ? null : `${num(total.toLocaleString("en-US"))} total`}
    >
      <div className="p-6">
        <Table
          setSnackBarMessage={setSnackBarMessage}
          setOpenSuccessSnackBar={setOpenSuccessSnackBar}
          setOpenErrorSnackBar={setOpenErrorSnackBar}
        />
      </div>
    </AdminLayout>
  );
}
