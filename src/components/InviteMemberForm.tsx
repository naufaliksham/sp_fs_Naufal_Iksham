"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type UserSearchResult = {
  id: string;
  email: string;
  isMember?: boolean;
};

export default function InviteMemberForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(async () => {
      const res = await fetch(`/api/projects/${projectId}/users/search?q=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, projectId]);

  const handleInvite = async () => {
    if (!selectedUser) {
      setMessage("Silakan pilih pengguna untuk ditambahkan.");
      return;
    }
    setIsLoading(true);
    setMessage("");

    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: selectedUser.email }),
    });

    const data = await res.json();
    setMessage(data.message || (res.ok ? "Anggota berhasil ditambahkan!" : "Terjadi kesalahan."));
    setIsLoading(false);
    if (res.ok) {
      setSelectedUser(null);
      setSearchQuery("");
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-full justify-between">
              {selectedUser ? selectedUser.email : "Cari dan pilih pengguna..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Ketik email untuk mencari..." value={searchQuery} onValueChange={setSearchQuery} />
              <CommandList>
                <CommandEmpty>Pengguna tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {suggestions.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.email}
                      disabled={user.isMember}
                      className={user.isMember ? "opacity-50 cursor-not-allowed" : ""}
                      onSelect={() => {
                        if (!user.isMember) {
                          setSelectedUser(user);
                          setOpen(false);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          user.isMember || selectedUser?.email === user.email ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {user.email}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button onClick={handleInvite} disabled={isLoading || !selectedUser || selectedUser.isMember}>
          {isLoading ? "Menambahkan..." : "Tambah Anggota"}
        </Button>
      </div>
      {message && <p className="text-sm pt-2">{message}</p>}
    </div>
  );
}