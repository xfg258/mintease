const KEY = "mintease-address-book";

export interface AddressEntry {
  id: string;
  label: string;
  address: string;
  networkId?: string;
  createdAt: number;
}

export function loadAddressBook(): AddressEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AddressEntry[];
  } catch {
    return [];
  }
}

export function saveAddressBook(entries: AddressEntry[]): void {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function addAddressEntry(entry: Omit<AddressEntry, "id" | "createdAt">): AddressEntry[] {
  const list = loadAddressBook();
  const next: AddressEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const updated = [next, ...list.filter((e) => e.address.toLowerCase() !== entry.address.toLowerCase())];
  saveAddressBook(updated);
  return updated;
}

export function removeAddressEntry(id: string): AddressEntry[] {
  const updated = loadAddressBook().filter((e) => e.id !== id);
  saveAddressBook(updated);
  return updated;
}
