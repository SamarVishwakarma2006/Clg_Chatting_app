"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MessageCircle, Trash2, Send } from "lucide-react"

interface Query {
  query_id: string
  section: string
  title: string
  description: string
  anonymous_name: string
  created_at: string
  student_id: string
  is_owner: boolean
}

interface Comment {
  comment_id: string
  comment_text: string
  anonymous_name: string
  created_at: string
}

export default function QueryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const queryId = params.id as string

  const [query, setQuery] = useState<Query | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    loadQuery()
  }, [queryId])

  const loadQuery = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      console.log("[v0] Loading query with ID:", queryId)

      const res = await fetch(`/api/queries/${queryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token")
          router.push("/auth/login")
          return
        }
        
        // Try to get error message from response
        let errorMessage = "Failed to load query"
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorMessage
          console.error("[v0] API Error:", errorData)
        } catch (e) {
          console.error("[v0] Failed to parse error response:", e)
        }
        
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log("[v0] Query data received:", data.query)
      console.log("[v0] Is owner:", data.query.is_owner)

      setQuery(data.query)
      setComments(data.comments || [])
    } catch (error) {
      console.error("[v0] Failed to load query:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return

    console.log("[v0] Starting comment post...")
    console.log("[v0] Comment text:", newComment)
    console.log("[v0] Query ID:", queryId)

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      console.log("[v0] Token present:", !!token)

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query_id: queryId, // Firestore document IDs are strings
          comment_text: newComment,
        }),
      })

      console.log("[v0] Response status:", res.status)

      if (!res.ok) {
        const errorData = await res.json()
        console.error("[v0] Comment post error:", errorData)
        alert(`Failed to post comment: ${errorData.error || "Unknown error"}`)
        throw new Error("Failed to post comment")
      }

      const result = await res.json()
      console.log("[v0] Comment posted successfully:", result)

      setNewComment("")
      loadQuery()
    } catch (error) {
      console.error("[v0] Failed to post comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuery = async () => {
    if (!confirm("Are you sure you want to delete this query?")) return

    console.log("[v0] Starting delete operation...")
    setDeleting(true)

    try {
      const token = localStorage.getItem("token")
      console.log("[v0] Sending delete request for query:", queryId)

      const res = await fetch(`/api/queries/${queryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("[v0] Delete failed:", errorData)
        alert(`Failed to delete: ${errorData.error || "Unknown error"}`)
        throw new Error("Failed to delete query")
      }

      console.log("[v0] Delete successful, redirecting to feed...")
      router.push("/feed")
    } catch (error) {
      console.error("[v0] Failed to delete query:", error)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border">
          <div className="container flex h-16 items-center">
            <Button variant="ghost" onClick={() => router.push("/feed")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </div>
        </header>
        <div className="container max-w-4xl py-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!query) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Query not found</h2>
          <Button className="mt-4" onClick={() => router.push("/feed")}>
            Back to Feed
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/feed")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
          {query?.is_owner && (
            <Button variant="destructive" onClick={handleDeleteQuery} disabled={deleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete Query"}
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-4xl flex-1 py-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl">{query.title}</CardTitle>
                <CardDescription className="mt-2">
                  Posted by {query.anonymous_name} •{" "}
                  {new Date(query.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardDescription>
              </div>
              <Badge>{query.section}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{query.description}</p>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{comments.length} Comments</h2>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <Textarea
              placeholder="Share your thoughts anonymously..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3 min-h-[100px] resize-none"
            />
            <Button onClick={handlePostComment} disabled={submitting || !newComment.trim()}>
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {comments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No comments yet. Be the first to reply!</p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.comment_id}>
                <CardHeader>
                  <CardDescription>
                    {comment.anonymous_name} •{" "}
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{comment.comment_text}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
