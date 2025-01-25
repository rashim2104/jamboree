import Patrol from "@/models/patrol";
import connectMongoDB from "@/util/connectMongoDB";
import { NextResponse } from "next/server";
import { pavillionLimits } from "@/public/image/data/pavillionLimit";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { patrolId } = await req.json();

    // Validate patrolId
    if (!patrolId) {
      return NextResponse.json(
        {
          success: false,
          message: "Patrol ID is required",
          errorType: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    // Find patrol details
    const patrol = await Patrol.findOne({ patrolId });

    if (!patrol) {
      return NextResponse.json(
        {
          success: false,
          message: "Patrol not found",
          errorType: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Calculate total pavilion visits
    const totalPavilionVisits = patrol.visitedPavilions.reduce(
      (sum, pavilion) => sum + pavilion.visitedCount,
      0
    );

    // Analyze missing venues and required visits
    const pavilionStatus = pavillionLimits.map((limit) => {
      const pavilionName = Object.keys(limit)[0];
      const requiredVisits = limit[pavilionName];
      const patrolPavilion = patrol.visitedPavilions.find(
        (p) => p.pavilion === pavilionName
      );
      const currentVisits = patrolPavilion ? patrolPavilion.visitedCount : 0;
      const remainingVisits = Math.max(0, requiredVisits - currentVisits);

      return {
        pavilion: pavilionName,
        required: requiredVisits,
        visited: currentVisits,
        remaining: remainingVisits,
        completed: currentVisits >= requiredVisits,
      };
    });

    const missingPavilions = pavilionStatus.filter((p) => !p.completed);
    const completedPavilions = pavilionStatus.filter((p) => p.completed);

    return NextResponse.json(
      {
        success: true,
        data: {
          patrolId: patrol.patrolId,
          visitedVenues: patrol.visitedVenues,
          totalVenues: patrol.visitedVenues.length,
          totalPavilionVisits,
          pavilionStatus: {
            completed: completedPavilions.map((p) => ({
              pavilion: p.pavilion,
              visits: p.visited,
            })),
            missing: missingPavilions.map((p) => ({
              pavilion: p.pavilion,
              required: p.required,
              visited: p.visited,
              remaining: p.remaining,
            })),
          },
          lastUpdated: patrol.lastUpdated,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching patrol details",
        errorType: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
