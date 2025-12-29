// Generate random anonymous names for students
const adjectives = [
  "Curious",
  "Silent",
  "Hidden",
  "Anonymous",
  "Mysterious",
  "Quiet",
  "Thoughtful",
  "Clever",
  "Wise",
  "Swift",
  "Bright",
  "Sharp",
  "Focused",
  "Calm",
  "Bold",
  "Quick",
  "Gentle",
  "Noble",
]

const animals = [
  "Panda",
  "Falcon",
  "Tiger",
  "Owl",
  "Fox",
  "Eagle",
  "Wolf",
  "Bear",
  "Hawk",
  "Lion",
  "Deer",
  "Raven",
  "Dolphin",
  "Jaguar",
  "Phoenix",
  "Dragon",
  "Lynx",
  "Leopard",
]

export function generateAnonymousName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adjective} ${animal}`
}
