import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    const content = type === "one-pager" 
      ? "# HUMAIN Sales Platform - One-Pager\n\n## Transform Your Sales with AI\n\n**The Challenge:** Sales teams waste hours creating custom collateral.\n\n**Our Solution:** AI-powered generation in minutes.\n\n**Key Benefits:**\n✓ 70% time savings\n✓ Perfect brand consistency\n✓ Unlimited customization"
      : "# Generated Content\n\nYour sales collateral will appear here!";

    return NextResponse.json({
      success: true,
      content,
      type,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate" },
      { status: 500 }
    );
  }
}