import { NextRequest, NextResponse } from "next/server";
import { importPatientFromFile } from "@/lib/patients";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileContent = formData.get("fileContent") as string;
    const consultationsJson = formData.get("consultations") as string;

    if (!fileContent) {
      return NextResponse.json(
        { error: "No se proporcionó contenido del archivo" },
        { status: 400 }
      );
    }

    let consultations: Array<{ date: string; summary: string }> = [];
    try {
      if (consultationsJson) {
        consultations = JSON.parse(consultationsJson);
      }
    } catch (err) {
      console.error("Error parsing consultations:", err);
      // Continue without consultations
    }

    const result = await importPatientFromFile(fileContent, consultations);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      patientId: result.patientId,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Error al procesar la importación" },
      { status: 500 }
    );
  }
}

