import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Settings from "@/models/Settings";

export async function POST(request) {
  try {
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: 'Authentication failed', message: authResult.reason || authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { showPlatformHealth } = body;

    if (typeof showPlatformHealth !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ homepage: { showPlatformHealth: false } });
    }

    settings.homepage.showPlatformHealth = showPlatformHealth;
    await settings.save();

    return NextResponse.json({ success: true, settings: settings.homepage });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
