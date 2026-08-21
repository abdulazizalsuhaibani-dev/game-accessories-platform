import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Brand from "../shared/Brand";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

const schema = yup
  .object({
    username: yup.string().required("Username is required!"),
    firstName: yup.string().required("First Name is required!"),
    lastName: yup.string().required("Last Name is required!"),
    birthDate: yup
      .date()
      .max(new Date(), "Date must not be from the future!")
      .required("Birthday is required!"),
    phoneNumber: yup
      .string()
      .matches(
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/,
        "Phone Number must be in valid format!"
      )
      .required("Phone Number is required"),
    email: yup.string().email().required("Email is required"),
    // The same policy the API enforces in UserService.CreateOneAsync: at least
    // 8 characters carrying a letter, a number and one of ! @ # $ % ^ & * ( ) _
    // [ ]. Any other character is allowed through, because the API restricts
    // which characters must appear, never which ones may. Each rule is its own
    // check so the message can say which one the password broke. Letters and
    // numbers are matched by Unicode category to mirror char.IsLetter and
    // char.IsDigit on the API side, so an Arabic-script password behaves the
    // same at both ends.
    password: yup
      .string()
      .required("Password is required!")
      .min(8, "Password must be at least 8 characters!")
      .matches(/\p{L}/u, "Password must contain at least one letter!")
      .matches(/\p{Nd}/u, "Password must contain at least one number!")
      .matches(
        /[!@#$%^&*()_[\]]/,
        "Password must contain at least one special character (! @ # $ % ^ & * ( ) _ [ ])!"
      ),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match!"),
  })
  .required();

export default function RegistrationForm() {
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
    const payload = {
      ...data,
      birthDate: data.birthDate.toISOString().substring(0, 10),
      cartId: EMPTY_GUID,
    };
    delete payload.passwordConfirmation;

    return axios
      .post(`${API_BASE}/Users`, payload)
      .then(() => navigate("/login"))
      .catch((error) => {
        setServerError(error.response?.data?.message ?? "We couldn't create your account.");
      });
  }

  const fields = [
    { id: "username", label: t("auth.username"), type: "text" },
    { id: "firstName", label: t("profile.firstName"), type: "text" },
    { id: "lastName", label: t("profile.lastName"), type: "text" },
    { id: "birthDate", label: t("auth.birthday"), type: "date" },
    { id: "phoneNumber", label: t("auth.phone"), type: "text" },
    { id: "email", label: t("auth.email"), type: "text" },
    { id: "password", label: t("auth.password"), type: "password", hint: t("auth.passwordHint") },
    { id: "passwordConfirmation", label: t("auth.confirmPassword"), type: "password" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <div className="panel p-8">
          <h1 className="m-0 text-center font-display text-2xl font-bold uppercase text-ink">
            {t("auth.createAccount")}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="field-label" htmlFor={field.id}>
                  {field.label}
                </label>
                <input
                  {...register(field.id)}
                  id={field.id}
                  type={field.type}
                  className="field"
                />
                {field.hint ? (
                  <p className="mt-1.5 font-mono text-[11px] text-muted">{field.hint}</p>
                ) : null}
                {errors[field.id] ? (
                  <p className="mt-1.5 font-mono text-[11px] text-magenta">
                    {errors[field.id].message}
                  </p>
                ) : null}
              </div>
            ))}

            {serverError ? (
              <p className="m-0 border border-magenta p-3 font-mono text-[11px] text-magenta">
                {serverError}
              </p>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="mt-2 h-12 btn-acid">
              {t("auth.createAccount")}
            </button>

            <p className="m-0 mt-3 text-center text-[13px] text-dim">
              {t("auth.haveAccount")}{" "}
              <Link to="/login" className="font-semibold">
                {t("auth.loginHere")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
