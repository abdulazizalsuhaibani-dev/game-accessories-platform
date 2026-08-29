import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Brand from "../shared/Brand";
import { API_BASE } from "../../api";
import { useStoreSettings } from "../../context/StoreSettings";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

// Built per language rather than once at module load. yup resolves a rule's
// message when the schema is constructed, so a schema built at import time
// would freeze whichever language happened to be active then. Every rule names
// its own message — any rule left bare falls back to a yup default written from
// the property key, which is how "birthDate must be a `date` type" reached the
// screen.
const buildSchema = (t) =>
  yup
    .object({
      firstName: yup.string().required(t("validation.firstNameRequired")),
      lastName: yup.string().required(t("validation.lastNameRequired")),
      birthDate: yup
        .date()
        // An empty date input arrives as "", which fails yup's cast to Date
        // before .required() is ever consulted. Only typeError can replace
        // the message shown in that case.
        .typeError(t("validation.birthdayRequired"))
        .max(new Date(), t("validation.birthdayFuture"))
        .required(t("validation.birthdayRequired")),
      phoneNumber: yup
        .string()
        .matches(
          /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{3,6}$/,
          t("validation.phoneFormat")
        )
        .required(t("validation.phoneRequired")),
      email: yup
        .string()
        .email(t("validation.emailFormat"))
        .required(t("validation.emailRequired")),
      // The same policy the API enforces in UserService.CreateOneAsync: at
      // least 8 characters carrying a letter, a number and one of
      // ! @ # $ % ^ & * ( ) _ [ ]. Any other character is allowed through,
      // because the API restricts which characters must appear, never which
      // ones may. Each rule is its own check so the message can say which one
      // the password broke. Letters and numbers are matched by Unicode
      // category to mirror char.IsLetter and char.IsDigit on the API side, so
      // an Arabic-script password behaves the same at both ends.
      password: yup
        .string()
        .required(t("validation.passwordRequired"))
        .min(8, t("validation.passwordMin"))
        .matches(/\p{L}/u, t("validation.passwordLetter"))
        .matches(/\p{Nd}/u, t("validation.passwordNumber"))
        .matches(/[!@#$%^&*()_[\]]/, t("validation.passwordSpecial")),
      passwordConfirmation: yup
        .string()
        .oneOf([yup.ref("password"), null], t("validation.passwordMatch")),
    })
    .required();

export default function RegistrationForm() {
  const { t } = useStoreSettings();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  // Rebuilt when the language flips, so the messages follow the switch. `t` is
  // a useCallback keyed on locale, so this is stable between renders.
  const resolver = useMemo(() => yupResolver(buildSchema(t)), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver });

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
