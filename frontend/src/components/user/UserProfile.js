import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";
import OrderHistory from "./OrderHistory";

export default function UserProfile(prop) {
  const {
    userData,
    setUserData,
    setSnackBarMessage,
    setOpenSuccessSnackBar,
    setOpenErrorSnackBar,
  } = prop;
  const { t } = useStoreSettings();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formUserData, setFormUserData] = useState({
    firstName: userData.firstName ?? "",
    lastName: userData.lastName ?? "",
    password: "",
  });

  function onChangeHandler(event) {
    setFormUserData({ ...formUserData, [event.target.id]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const updatedFields = {
      firstName: formUserData.firstName,
      lastName: formUserData.lastName,
    };
    try {
      // The password is re-checked against sign-in before the update, because
      // the update endpoint takes the password as part of the user payload.
      await axios.post(`${API_BASE}/Users/signIn`, {
        email: userData.email,
        password: formUserData.password,
      });

      await axios.put(
        `${API_BASE}/Users/${userData.userId}`,
        {
          ...userData,
          ...updatedFields,
          password: formUserData.password,
        },
        { headers: authHeaders() }
      );

      // The rows above render from userData, so without this the screen keeps
      // showing the old name while claiming the save worked. The PUT answers
      // with a status string rather than the updated user, so re-read the
      // record to show what was actually stored. A failed re-read does not
      // undo the save, so fall back to the values we sent rather than
      // reporting a failure that did not happen.
      try {
        const { data } = await axios.get(`${API_BASE}/Users/auth`, {
          headers: authHeaders(),
        });
        setUserData(data && data.userId ? data : { ...userData, ...updatedFields });
      } catch {
        setUserData({ ...userData, ...updatedFields });
      }

      setSnackBarMessage(t("profile.updated"));
      setOpenSuccessSnackBar(true);
      setEditing(false);
    } catch (error) {
      const status = error.response?.status;
      setSnackBarMessage(
        status === 401 || status === 500
          ? t("profile.wrongPassword")
          : t("profile.updateFailed")
      );
      setOpenErrorSnackBar(true);
    } finally {
      setSaving(false);
    }
  }

  const rows = [
    { label: t("profile.firstName"), value: userData.firstName },
    { label: t("profile.lastName"), value: userData.lastName },
    { label: t("profile.email"), value: userData.email },
    { label: t("profile.phone"), value: userData.phoneNumber },
  ];

  return (
    <div className="bg-chassis">
      <div className="border-b border-line px-6 py-4 sm:px-7">
        <h1 className="m-0 telemetry text-xs text-ink">{t("profile.title")}</h1>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-7">
        <section>
        <h2 className="m-0 mb-4 telemetry text-[11px] text-ink">{t("profile.details")}</h2>
        <dl className="m-0 grid gap-px border border-line bg-line sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="bg-panel p-4">
              <dt className="telemetry text-[10px] text-muted">{row.label}</dt>
              <dd className="m-0 mt-2.5 text-[15px] text-ink">{row.value || "—"}</dd>
            </div>
          ))}
        </dl>

        {editing ? (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 panel p-6">
            <div className="telemetry text-[11px] text-ink">{t("profile.edit")}</div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="firstName">
                  {t("profile.firstName")}
                </label>
                <input
                  id="firstName"
                  value={formUserData.firstName}
                  onChange={onChangeHandler}
                  className="field"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="lastName">
                  {t("profile.lastName")}
                </label>
                <input
                  id="lastName"
                  value={formUserData.lastName}
                  onChange={onChangeHandler}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                {t("profile.confirmPassword")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={formUserData.password}
                onChange={onChangeHandler}
                className="field"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-11 btn-ghost"
              >
                {t("common.close")}
              </button>
              <button type="submit" disabled={saving} className="h-11 flex-1 btn-acid">
                {saving ? t("common.loading") : t("profile.done")}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => setEditing(true)} className="h-12 btn-acid">
              {t("profile.edit")}
            </button>
            {/* The header hides its sign-out below sm, so the profile screen
                carries the action for narrow viewports. */}
            <button
              type="button"
              onClick={() => {
                setUserData(null);
                localStorage.removeItem("token");
                navigate("/");
              }}
              className="h-12 btn-ghost"
            >
              {t("nav.signOut")}
            </button>
          </div>
        )}
        </section>

        <OrderHistory userId={userData.userId} />
      </div>
    </div>
  );
}
