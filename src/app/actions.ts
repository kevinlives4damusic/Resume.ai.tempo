"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  signUp,
  signIn,
  resetPassword,
  updateUserPassword,
  signOutUser,
} from "@/lib/auth";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const origin = headers().get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { user, error } = await signUp(email, password, fullName);

  if (error) {
    console.error("Sign up error:", error);
    return encodedRedirect("error", "/sign-up", error);
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { user, error } = await signIn(email, password);

  if (error) {
    return encodedRedirect("error", "/sign-in", error);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { success, error } = await resetPassword(email);

  if (error) {
    console.error(error);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { success, error } = await updateUserPassword(password);

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  return encodedRedirect(
    "success",
    "/protected/reset-password",
    "Password updated",
  );
};

export const signOutAction = async () => {
  await signOutUser();
  return redirect("/sign-in");
};
