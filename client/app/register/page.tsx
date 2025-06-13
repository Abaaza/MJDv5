"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name,setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [guests, setGuests] = useState(0)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(name,email,password,guests)
      router.push("/")
    } catch (err) {
      setError("Registration failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <Card className="w-full max-w-md glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input id="name" value={name} onChange={(e)=>setName(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests" className="text-white">Number of Guests</Label>
              <Input id="guests" type="number" min="0" value={guests} onChange={e=>setGuests(parseInt(e.target.value,10)||0)} className="bg-white/5 border-white/10" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-to-r from-[#00D4FF] to-[#00FF88] text-black font-semibold">Create Account</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
