import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { MOCK_RESOURCES } from "@/lib/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const semester = searchParams.get("semester");
    const search = searchParams.get("search");

    if (!isSupabaseConfigured() || !supabase) {
      let data = [...MOCK_RESOURCES];
      if (category && category !== "All Resources") {
        data = data.filter((r) => r.category === category);
      }
      if (semester && semester !== "All Semesters") {
        data = data.filter((r) => r.semester.toLowerCase().includes(semester.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase();
        data = data.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.subjectCode.toLowerCase().includes(q) ||
            r.subjectName.toLowerCase().includes(q)
        );
      }
      return NextResponse.json({ data, source: "mock" });
    }

    let query = supabase.from("resources").select("*");

    if (category && category !== "All Resources") {
      query = query.eq("category", category);
    }
    if (semester && semester !== "All Semesters") {
      query = query.ilike("semester", `%${semester}%`);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,subject_code.ilike.%${search}%,subject_name.ilike.%${search}%`);
    }

    const { data, error } = await query.order("downloads", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ data, source: "supabase" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      subjectCode,
      subjectName,
      semester,
      category,
      author,
      linkUrl,
      description,
    } = body;

    if (!title || !subjectCode || !linkUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSupabaseConfigured() || !supabase) {
      const mockResource = {
        id: `res-${Date.now()}`,
        title: title.trim(),
        subjectCode: subjectCode.trim().toUpperCase(),
        subjectName: subjectName || "Computer Science",
        semester: semester || "Semester 5",
        category: category || "Notes",
        author: author || "Student Contributor",
        verified: true,
        format: "PDF",
        fileSize: "5.0 MB",
        downloads: 0,
        rating: 5.0,
        linkUrl,
        description: description || "",
      };
      return NextResponse.json({ data: mockResource, source: "mock", message: "Resource contributed successfully!" });
    }

    const { data, error } = await supabase
      .from("resources")
      .insert([
        {
          title: title.trim(),
          subject_code: subjectCode.trim().toUpperCase(),
          subject_name: subjectName || "Computer Science",
          semester: semester || "Semester 5",
          category: category || "Notes",
          author: author || "Student Contributor",
          verified: true,
          format: "PDF",
          file_size: "5.0 MB",
          downloads: 0,
          rating: 5.0,
          link_url: linkUrl,
          description: description || "",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, source: "supabase", message: "Resource contributed successfully!" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload resource";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
