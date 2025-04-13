"use client"

import * as React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function SearchInput() {
  const [query, setQuery] = useState("")

  const handleClear = () => {
    setQuery("")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would search the database
    console.log("Searching for:", query)
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for people, topics, or keywords..."
        className="pl-10 pr-10"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button type="submit" size="sm" className="absolute right-1 top-1/2 h-7 -translate-y-1/2">
        Search
      </Button>
    </form>
  )
}

