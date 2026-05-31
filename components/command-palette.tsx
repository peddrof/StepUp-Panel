"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { GraduationCap, BookOpen, Users } from "lucide-react";

interface SearchData {
  students: { id: string; name: string }[];
  mentors: { id: string; name: string }[];
  groups: { id: string; name: string; level: string }[];
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [data, setData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);

  // Cmd/Ctrl+K toggles the palette from anywhere in the admin area.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Lazy-load entities the first time the palette opens.
  const load = useCallback(async () => {
    setLoading(true);
    const [studentsRes, mentorsRes, groupsRes] = await Promise.all([
      supabase.from("students").select("id, name").order("name"),
      supabase.from("mentors").select("id, name").order("name"),
      supabase
        .from("groups")
        .select("id, name, level")
        .is("deleted_at", null)
        .order("name"),
    ]);
    setData({
      students: (studentsRes.data as SearchData["students"]) || [],
      mentors: (mentorsRes.data as SearchData["mentors"]) || [],
      groups: (groupsRes.data as SearchData["groups"]) || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open && !data && !loading) load();
  }, [open, data, loading, load]);

  const go = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search students, groups, mentors..." />
      <CommandList>
        <CommandEmpty>{loading ? "Loading…" : "No results found."}</CommandEmpty>

        {data && data.students.length > 0 && (
          <CommandGroup heading="Students">
            {data.students.map((s) => (
              <CommandItem
                key={s.id}
                value={`${s.name} ${s.id}`}
                onSelect={() => go(`/admin/students/${s.id}`)}
              >
                <GraduationCap className="mr-2 h-4 w-4 text-sky-800" />
                {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {data && data.groups.length > 0 && (
          <CommandGroup heading="Groups">
            {data.groups.map((g) => (
              <CommandItem
                key={g.id}
                value={`${g.name} ${g.level} ${g.id}`}
                onSelect={() => go(`/admin/groups?group=${g.id}`)}
              >
                <BookOpen className="mr-2 h-4 w-4 text-sky-800" />
                {g.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {g.level}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {data && data.mentors.length > 0 && (
          <CommandGroup heading="Mentors">
            {data.mentors.map((m) => (
              <CommandItem
                key={m.id}
                value={`${m.name} ${m.id}`}
                onSelect={() => go(`/admin/people?tab=mentors`)}
              >
                <Users className="mr-2 h-4 w-4 text-cyan-600" />
                {m.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
