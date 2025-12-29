export interface User {
  id: number
  email: string
}

export interface Query {
  query_id: number
  section: string
  title: string
  description: string
  anonymous_name: string
  created_at: string
}

export interface Comment {
  comment_id: number
  query_id: number
  comment_text: string
  anonymous_name: string
  created_at: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export const SECTIONS = [
  "DSA",
  "DBMS",
  "OS",
  "CN",
  "Math",
  "Web Development",
  "Machine Learning",
  "Cloud Computing",
  "Other",
] as const

export type Section = (typeof SECTIONS)[number]
