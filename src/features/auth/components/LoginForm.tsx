import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { getPostLoginRoute } from "../../../constants/RouteConstants";
import { useAuth } from "../hooks/useAuth";
import type { AuthErrorResponse } from "../types/AuthErrorResponse";

const loginSchema = z.object({
  volunteerId: z.string().trim().min(1, "Volunteer ID is required"),
  password: z
    .string()
    .refine((password) => password.trim().length > 0, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getLoginErrorMessage(error: unknown): string {
  if (axios.isAxiosError<AuthErrorResponse>(error)) {
    const backendMessage = error.response?.data?.error;

    if (typeof backendMessage === "string" && backendMessage.length > 0) {
      return backendMessage;
    }
  }

  return "Login failed. Please try again.";
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      volunteerId: "",
      password: "",
    },
    shouldFocusError: true,
  });

  const submitLogin = async (values: LoginFormValues) => {
    setServerError("");

    try {
      const authenticatedUser = await login(values);
      navigate(getPostLoginRoute(authenticatedUser.role), { replace: true });
    } catch (error: unknown) {
      setServerError(getLoginErrorMessage(error));
    }
  };

  return (
    <form
      className="login-form"
      onSubmit={handleSubmit(submitLogin)}
      noValidate
    >
      {serverError !== "" ? (
        <div
          className="login-form__alert"
          role="alert"
          aria-live="assertive"
        >
          <span aria-hidden="true">!</span>
          <span>{serverError}</span>
        </div>
      ) : null}

      <div className="login-form__field">
        <label className="login-form__sr-only" htmlFor="volunteerId">
          Volunteer ID
        </label>
        <span className="login-form__input-icon" aria-hidden="true">
          ID
        </span>
        <input
          id="volunteerId"
          type="text"
          className="login-form__input login-form__input--with-leading-icon"
          placeholder="Enter your Volunteer ID"
          autoComplete="username"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={errors.volunteerId !== undefined}
          aria-describedby={
            errors.volunteerId !== undefined ? "volunteerId-error" : undefined
          }
          {...register("volunteerId")}
        />
        {errors.volunteerId !== undefined ? (
          <p
            id="volunteerId-error"
            className="login-form__field-error"
            role="alert"
          >
            {errors.volunteerId.message}
          </p>
        ) : null}
      </div>

      <div className="login-form__field">
        <label className="login-form__sr-only" htmlFor="password">
          Password
        </label>
        <span className="login-form__input-icon" aria-hidden="true">
          ●
        </span>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          className="login-form__input login-form__input--password"
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={errors.password !== undefined}
          aria-describedby={
            errors.password !== undefined ? "password-error" : undefined
          }
          {...register("password")}
        />
        <button
          className="login-form__password-toggle"
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
        {errors.password !== undefined ? (
          <p
            id="password-error"
            className="login-form__field-error"
            role="alert"
          >
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <button
        className="login-form__submit"
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="login-form__spinner" aria-hidden="true" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
