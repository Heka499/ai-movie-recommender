import Note from "@/components/Note";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description: "Notes",
};

export default async function NotesPage() {
  const { userId } = auth();

  if (!userId) throw Error("userId undefined");

  const allNotes = await prisma.note.findMany({ where: { userId } });

  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {allNotes.map((note) => (
      <Note note={note} key={note.id} />
    
    ))}
    {allNotes.length === 0 && (
      <div className="col-span-full text-center">
        {"You don't have any notes yet. Why not create one?"}
      </div>  
    )}

    </div>;
}