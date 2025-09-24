'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { useTranslation } from '@/lib/i18n'

// Ülkeler listesi - Türkiye öncelikli
const COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'US', name: 'Amerika Birleşik Devletleri', flag: '🇺🇸' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
  { code: 'GB', name: 'İngiltere', flag: '🇬🇧' },
  { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
  { code: 'IT', name: 'İtalya', flag: '🇮🇹' },
  { code: 'ES', name: 'İspanya', flag: '🇪🇸' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱' },
  { code: 'BE', name: 'Belçika', flag: '🇧🇪' },
  { code: 'CH', name: 'İsviçre', flag: '🇨🇭' },
  { code: 'AT', name: 'Avusturya', flag: '🇦🇹' },
  { code: 'SE', name: 'İsveç', flag: '🇸🇪' },
  { code: 'NO', name: 'Norveç', flag: '🇳🇴' },
  { code: 'DK', name: 'Danimarka', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlandiya', flag: '🇫🇮' },
  { code: 'PL', name: 'Polonya', flag: '🇵🇱' },
  { code: 'CZ', name: 'Çek Cumhuriyeti', flag: '🇨🇿' },
  { code: 'HU', name: 'Macaristan', flag: '🇭🇺' },
  { code: 'GR', name: 'Yunanistan', flag: '🇬🇷' },
  { code: 'PT', name: 'Portekiz', flag: '🇵🇹' },
  { code: 'RU', name: 'Rusya', flag: '🇷🇺' },
  { code: 'JP', name: 'Japonya', flag: '🇯🇵' },
  { code: 'KR', name: 'Güney Kore', flag: '🇰🇷' },
  { code: 'CN', name: 'Çin', flag: '🇨🇳' },
  { code: 'IN', name: 'Hindistan', flag: '🇮🇳' },
  { code: 'AU', name: 'Avustralya', flag: '🇦🇺' },
  { code: 'CA', name: 'Kanada', flag: '🇨🇦' },
  { code: 'BR', name: 'Brezilya', flag: '🇧🇷' },
  { code: 'AR', name: 'Arjantin', flag: '🇦🇷' },
  { code: 'MX', name: 'Meksika', flag: '🇲🇽' },
  { code: 'SA', name: 'Suudi Arabistan', flag: '🇸🇦' },
  { code: 'AE', name: 'Birleşik Arap Emirlikleri', flag: '🇦🇪' },
  { code: 'EG', name: 'Mısır', flag: '🇪🇬' },
  { code: 'ZA', name: 'Güney Afrika', flag: '🇿🇦' },
  { code: 'NG', name: 'Nijerya', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'MA', name: 'Fas', flag: '🇲🇦' },
  { code: 'DZ', name: 'Cezayir', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunus', flag: '🇹🇳' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'ET', name: 'Etiyopya', flag: '🇪🇹' },
  { code: 'GH', name: 'Gana', flag: '🇬🇭' },
  { code: 'CI', name: 'Fildişi Sahili', flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzanya', flag: '🇹🇿' },
  { code: 'ZW', name: 'Zimbabve', flag: '🇿🇼' },
  { code: 'BW', name: 'Botsvana', flag: '🇧🇼' },
  { code: 'NA', name: 'Namibya', flag: '🇳🇦' },
]

export interface Country {
  code: string
  name: string
  flag: string
}

interface CountrySelectProps {
  value?: Country
  onValueChange: (country: Country | undefined) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export function CountrySelect({
  value,
  onValueChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  error,
  className,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false)
  const { t } = useTranslation()
  
  // Use translation for default placeholder if not provided
  const defaultPlaceholder = placeholder || t('shared.common.ui.selectCountry')

  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
            disabled={disabled}
          >
            {value ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">{value.flag}</span>
                <span>{value.name}</span>
              </div>
            ) : (
              defaultPlaceholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={t('shared.common.ui.searchCountry')} />
            <CommandList>
              <CommandEmpty>{t('shared.common.ui.noCountryFound')}</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code}`}
                    onSelect={() => {
                      onValueChange(
                        country.code === value?.code ? undefined : country
                      )
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value?.code === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}