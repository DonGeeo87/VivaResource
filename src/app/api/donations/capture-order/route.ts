import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import path from "path";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

const PAYPAL_BASE_URL =
  PAYPAL_MODE === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccountPath = path.join(
      process.cwd(),
      "vivaresource-firebase-adminsdk-fbsvc-1c15e4d2ee.json"
    );
    const credential = cert(serviceAccountPath);
    initializeApp({ credential });
  }
  return getFirestore();
}

async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    // Capture the order
    const response = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PayPal capture error:", errorData);
      return NextResponse.json(
        { error: "Failed to capture PayPal order" },
        { status: 500 }
      );
    }

    const captureData = await response.json();

    // Extract donation info from custom_id
    const purchaseUnit = captureData.purchase_units?.[0];
    let donorInfo: { donorName?: string; donorEmail?: string; frequency?: string } = {};
    try {
      donorInfo = JSON.parse(purchaseUnit?.custom_id || "{}");
    } catch {
      // ignore parse error
    }

    // Get payer info from PayPal
    const payerInfo = captureData.payer || {};

    // Save to Firestore
    const db = initFirebaseAdmin();
    const donationRef = db.collection("donations").doc();

    const amountValue = parseFloat(
      purchaseUnit?.payments?.captures?.[0]?.amount?.value || "0"
    );
    const currency =
      purchaseUnit?.payments?.captures?.[0]?.amount?.currency_code || "USD";

    await donationRef.set({
      id: donationRef.id,
      paypalOrderId: orderId,
      paypalCaptureId: captureData.id,
      amount: amountValue,
      currency,
      status: captureData.status,
      donorName:
        donorInfo.donorName ||
        `${payerInfo.name?.given_name || ""} ${payerInfo.name?.surname || ""}`.trim() ||
        "Anonymous",
      donorEmail: donorInfo.donorEmail || payerInfo.email_address || "",
      frequency: donorInfo.frequency || "one-time",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      status: captureData.status,
      donationId: donationRef.id,
    });
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
