import { useState, useEffect } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList, // <-- Import CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { X, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SPECIALTIES = [
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "ent", label: "ENT" },
  { value: "gastroenterology", label: "Gastroenterology" },
  { value: "general-medicine", label: "General Medicine" },
  { value: "gynecology", label: "Gynecology" },
  { value: "neurology", label: "Neurology" },
  { value: "oncology", label: "Oncology" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "pulmonology", label: "Pulmonology" },
  { value: "surgery", label: "Surgery" },
];

export function SpecialtiesSelect({ value = [], onChange }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value)

  // Sync with parent when value prop changes
  useEffect(() => {
    setSelected(value)
  }, [value])

  const handleSelect = (specialtyValue) => {
    const newSelected = selected.includes(specialtyValue)
      ? selected.filter(item => item !== specialtyValue)
      : [...selected, specialtyValue]
    
    setSelected(newSelected)
    onChange?.(newSelected)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {!selected?.length && "Select specialties..."}
            {selected?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selected.map((item) => (
                  <Badge key={item} variant="secondary" className="mr-1">
                    {SPECIALTIES.find((specialty) => specialty.value === item)?.label}
                  </Badge>
                ))}
              </div>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search specialties..." />
          {/* Wrap CommandEmpty and CommandGroup inside CommandList */}
          <CommandList>
            <CommandEmpty>No specialty found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {SPECIALTIES.map((specialty) => (
                <CommandItem
                  key={specialty.value}
                  onSelect={() => handleSelect(specialty.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selected?.includes(specialty.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <X className="h-3 w-3" />
                  </div>
                  {specialty.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
