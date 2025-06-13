import { revalidatePath, revalidateTag } from "next/cache";
import {
  loadGridStateLocal,
  saveGridStateLocal,
} from "@/services/local-storage";
import { isDevelopment } from "@/services/config";
import { loadGridStateRedis, saveGridStateRedis } from "@/services/redis";
import { NextResponse } from "next/server";

// Default empty grid state
const DEFAULT_GRID_STATE = {
  blocks: [],
  createdAt: new Date().toISOString(),
};

export async function POST(request: Request) {
  const gridState = await request.json();
  if (!gridState) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    if (isDevelopment) {
      await saveGridStateLocal(gridState);
    } else {
      await saveGridStateRedis(gridState);
    }

    revalidateTag("homepage-grid"); // Revalidate all fetches with this tag
    revalidatePath("/");
    return Response.json({ revalidated: true });
  } catch (error) {
    console.error("Failed to save grid state:", error);
    return Response.json(
      { error: "Failed to save grid state" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let gridState;

    if (isDevelopment) {
      gridState = await loadGridStateLocal();
    } else {
      gridState = await loadGridStateRedis();
      // If Redis returns null, use default empty state
      if (!gridState) {
        gridState = DEFAULT_GRID_STATE;
      }
    }

    return Response.json(gridState);
  } catch (error) {
    console.error("Failed to load grid state:", error);
    return Response.json(DEFAULT_GRID_STATE);
  }
}
