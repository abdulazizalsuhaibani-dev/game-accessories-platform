import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Brand from "../shared/Brand";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

const schema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
  .required();

export default function LoginForm() {
  const { t } = useStoreSettings();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  function onSubmit(data) {
    setServerError("");
    return axios
      .post(`${API_BASE}/Users/signIn`, data)
      .then((response) => {
        localStorage.setItem("token", response.data);
        navigate("/profile");
        navigate(0);
      })
      .catch((error) => {
        setServerError(error.response?.data?.message ?? "Sign in failed. Check your details.");
      });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <div className="panel p-8">
          <h1 className="m-0 text-center font-display text-2xl font-bold uppercase text-ink">
            {t("auth.signIn")}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
            <div>
              <label className="field-label" htmlFor="email">
                {t("auth.email")}
              </label>
              <input {...register("email")} id="email" type="text" className="field" />
              {errors.email ? (
                <p className="mt-1.5 font-mono text-[11px] text-magenta">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                {t("auth.password")}
              </label>
              <input {...register("password")} id="password" type="password" className="field" />
              {errors.password ? (
                <p className="mt-1.5 font-mono text-[11px] text-magenta">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {serverError ? (
              <p className="m-0 border border-magenta p-3 font-mono text-[11px] text-magenta">
                {serverError}
              </p>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="mt-2 h-12 btn-acid">
              {t("auth.signIn")}
            </button>

            <p className="m-0 mt-3 text-center text-[13px] text-dim">
              {t("auth.noAccount")}{" "}
              <Link to="/signUp" className="font-semibold">
                {t("auth.registerHere")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
