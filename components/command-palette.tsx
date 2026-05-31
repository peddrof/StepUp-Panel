"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
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

type EntityType = "student" | "group" | "mentor";

interface Item {
  id: string;
  type: EntityType;
  label: string;
  sub?: string;
  search: string;
  href: string;
}

// Lowercase + strip accents (José -> jose, A1 stays A1) for forgiving matching.
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const commandClassName =
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5";

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
  const [query, setQuery] = useState("");

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

  const items = useMemo<Item[]>(() => {
    if (!data) return [];
    const out: Item[] = [];
    data.students.forEach((s) =>
      out.push({
        id: `s-${s.id}`,
        type: "student",
        label: s.name,
        search: normalize(s.name),
        href: `/admin/students/${s.id}`,
      })
    );
    data.groups.forEach((g) =>
      out.push({
        id: `g-${g.id}`,
        type: "group",
        label: g.name,
        sub: g.level,
        search: normalize(`${g.name} ${g.level}`),
        href: `/admin/groups?group=${g.id}`,
      })
    );
    data.mentors.forEach((m) =>
      out.push({
        id: `m-${m.id}`,
        type: "mentor",
        label: m.name,
        search: normalize(m.name),
        href: `/admin/people?tab=mentors`,
      })
    );
    return out;
  }, [data]);

  // Matches (accent/case-insensitive substring) first — prefix hits ranked
  // above mid-string hits — then everything else under "Other".
  const { matched, other } = useMemo(() => {
    const nq = normalize(query.trim());
    if (!nq) return { matched: items, other: [] as Item[] };
    const hits: { item: Item; rank: number }[] = [];
    const rest: Item[] = [];
    items.forEach((item) => {
      const idx = item.search.indexOf(nq);
      if (idx === -1) rest.push(item);
      else hits.push({ item, rank: idx === 0 ? 0 : 1 });
    });
    hits.sort(
      (a, b) => a.rank - b.rank || a.item.label.localeCompare(b.item.label)
    );
    return { matched: hits.map((h) => h.item), other: rest };
  }, [items, query]);

  const close = (next: boolean) => {
    if (!next) setQuery("");
    onOpenChange(next);
  };

  const go = (href: string) => {
    setQuery("");
    onOpenChange(false);
    router.push(href);
  };

  const renderItem = (item: Item) => (
    <CommandItem key={item.id} value={item.id} onSelect={() => go(item.href)}>
      {item.type === "student" ? (
        <GraduationCap className="mr-2 h-4 w-4 text-sky-800" />
      ) : item.type === "group" ? (
        <BookOpen className="mr-2 h-4 w-4 text-sky-800" />
      ) : (
        <Users className="mr-2 h-4 w-4 text-cyan-600" />
      )}
      {item.label}
      {item.sub && (
        <span className="ml-2 text-xs text-muted-foreground">{item.sub}</span>
      )}
    </CommandItem>
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command shouldFilter={false} className={commandClassName}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search students, groups, mentors..."
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading…" : "No results found."}
            </CommandEmpty>
            {matched.length > 0 && (
              <CommandGroup heading={query.trim() ? "Results" : undefined}>
                {matched.map(renderItem)}
              </CommandGroup>
            )}
            {other.length > 0 && (
              <CommandGroup heading="Other">{other.map(renderItem)}</CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
