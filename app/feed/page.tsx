"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Plus, LogOut } from "lucide-react"

const SECTIONS = ["All", "Academics", "Campus Life", "Events", "Career", "General"]

interface Query {
  query_id: string
  section: string
  title: string
  description: string
  anonymous_name: string
  created_at: string
  comment_count: number
}

export default function FeedPage() {
  const router = useRouter()
  const [queries, setQueries] = useState<Query[]>([])
  const [selectedSection, setSelectedSection] = useState("All")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    loadQueries()
  }, [selectedSection])

  const loadQueries = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const url = selectedSection === "All" ? "/api/queries" : `/api/queries?section=${selectedSection}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token")
          router.push("/auth/login")
          return
        }
        throw new Error("Failed to load queries")
      }

      const data = await res.json()
      setQueries(data.queries || [])
    } catch (error) {
      console.error("[v0] Failed to load queries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">CampusQuery</span>
            <Badge variant="secondary" className="ml-2">
              {selectedSection}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push("/feed/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Query
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-border bg-muted/30 lg:block">
          <div className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Sections</h3>
            <nav className="space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedSection === section
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <div className="container max-w-4xl py-8">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {selectedSection === "All" ? "All Queries" : `${selectedSection} Queries`}
              </h1>
              <div className="flex gap-2 lg:hidden">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {SECTIONS.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 w-3/4 rounded bg-muted" />
                      <div className="h-4 w-1/2 rounded bg-muted" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : queries.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No queries yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Be the first to ask a question in this section</p>
                  <Button onClick={() => router.push("/feed/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Post a Query
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {queries.map((query) => (
                  <Card
                    key={query.query_id}
                    className="cursor-pointer transition-shadow hover:shadow-md"
                    onClick={() => router.push(`/feed/${query.query_id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{query.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Posted by {query.anonymous_name} •{" "}
                            {new Date(query.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{query.section}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{query.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span>{query.comment_count || 0} comments</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
