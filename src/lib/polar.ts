import { createClient } from "../../supabase/server";

const POLAR_API_URL = "https://api.polar.sh";
const POLAR_ACCESS_TOKEN =
  process.env.POLAR_ACCESS_TOKEN ||
  "polar_oat_AVcEgAVHXgF8OlK7AN9WbrqfaRFR0ZW6VCEKu3k77FO";
const POLAR_PRODUCT_ID =
  process.env.POLAR_PRODUCT_ID || "d29af488-590f-488c-93b5-4cd87f7fc411";

export async function createCheckoutSession(
  userId: string,
  email: string,
  returnUrl: string,
) {
  try {
    console.log("Creating Polar checkout with:", {
      userId,
      email,
      returnUrl,
      productId: POLAR_PRODUCT_ID,
      token: POLAR_ACCESS_TOKEN.substring(0, 10) + "...", // Log partial token for debugging
    });

    const requestBody = {
      product_id: POLAR_PRODUCT_ID,
      success_url: `${returnUrl}/dashboard/checkout-success`,
      cancel_url: `${returnUrl}/dashboard?checkout=cancelled`,
      customer_email: email,
      metadata: {
        user_id: userId,
      },
    };

    console.log("Request body:", JSON.stringify(requestBody));

    const response = await fetch(`${POLAR_API_URL}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${POLAR_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    console.log("Polar API response status:", response.status);
    console.log("Polar API response:", responseData);

    if (!response.ok) {
      throw new Error(
        `Failed to create checkout session: ${JSON.stringify(responseData)}`,
      );
    }

    if (!responseData.url) {
      throw new Error("No checkout URL returned from Polar API");
    }

    return responseData.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function getUserSubscription(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data;
}
