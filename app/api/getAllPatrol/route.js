import { NextResponse } from "next/server";
import connectMongoDB from "@/util/connectMongoDB";
import Patrol from "@/models/patrol";

export async function GET(request) {
    try {
        await connectMongoDB();

        const patrols = await Patrol.find();

        if (!patrols || patrols.length === 0) {
            return NextResponse.json({ error: "Patrol not found" }, { status: 404 });
        }

        return NextResponse.json(patrols);
    } catch (error) {
        console.error("Error fetching venue:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}