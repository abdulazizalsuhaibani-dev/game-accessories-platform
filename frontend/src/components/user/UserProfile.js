import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE, authHeaders } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

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
          firstName: formUserData.firstName,
          lastName: formUserData.lastName,
          password: formUserData.password,
        },
        { headers: authHeaders() }
      );

      setSnackBarMessage("User information updated successfully");
      setOpenSuccessSnackBar(true);
      setEditing(false);
    } catch (error) {
      const status = error.response?.status;
      setSnackBarMessage(
        status === 401 || status === 500 ? "Incorrect password" : "User information update failed"
      );
      setOpenErrorSnackBar(true);
    } finally {
      setSaving(false);
    }
  }

  const rows = [
    { label: t("profile.username"), value: userData.username },
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
      </div>
    </div>
  );
}
