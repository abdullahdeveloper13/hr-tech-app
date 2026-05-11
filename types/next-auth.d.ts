import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE"
    employee?: {
      id: string
      firstName: string
      lastName: string
      department: string
      position: string
    }
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string
    role: "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE"
    employee?: any
  }
}