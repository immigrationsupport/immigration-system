import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { confirmCampayPayment } from "@/lib/subscription-payments";

async function processWebhook(payload: any) {
  const gatewayReference = String(payload?.reference || payload?.transaction_id || payload?.transactionId || payload?.operator_reference || "");
  const externalReference = String(payload?.external_reference || payload?.externalReference || payload?.tx_ref || "");

  if (!gatewayReference && !externalReference) return;

  let payment = gatewayReference
    ? await prisma.payment.findUnique({ where: { gatewayTransactionId: gatewayReference } })
    : null;

  if (!payment && externalReference) {
    payment = await prisma.payment.findUnique({ where: { reference: externalReference } });
  }

  // Some CamPay callbacks expose only one reference. If it matches our own
  // external reference, attach CamPay's gateway reference before verifying.
  if (payment && gatewayReference && payment.gatewayTransactionId !== gatewayReference) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayTransactionId: gatewayReference },
    });
  }

  if (gatewayReference) await confirmCampayPayment(gatewayReference);
}

export async function POST(req: NextRequest) {
  try {
    await processWebhook(await req.json());
  } catch (error) {
    console.error("CamPay webhook processing error:", error);
  }
  return NextResponse.json({ received: true });
}

export async function GET(req: NextRequest) {
  try {
    await processWebhook({
      reference: req.nextUrl.searchParams.get("reference"),
      external_reference: req.nextUrl.searchParams.get("external_reference"),
      transaction_id: req.nextUrl.searchParams.get("transaction_id"),
    });
  } catch (error) {
    console.error("CamPay webhook processing error:", error);
  }
  return NextResponse.json({ received: true });
}
