"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const db = new PrismaClient();

export async function createProjectAction(
  tenantId: string,
  slug: string,
  name: string,
  description: string,
) {
  if (!name) return { error: "Project name is required" };

  try {
    await db.project.create({
      data: {
        tenantId,
        name,
        description,
      },
    });

    // Refresh the UI cache instantly
    revalidatePath(`/v1/${slug}/dashboard`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create project." };
  }
}
