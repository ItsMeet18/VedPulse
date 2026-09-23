"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Phone, Video, ArrowLeft, Leaf, User, Shield, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ChatPage() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "doctor",
      name: "Dr. Rajesh Sharma",
      content: "Hello! How are you feeling today? Any changes since your last session?",
      timestamp: "10:30 AM",
      read: true,
    },
    {
      id: 2,
      sender: "patient",
      name: "You",
      content: "Hi Doctor! I'm feeling much better. The digestive issues have improved significantly.",
      timestamp: "10:32 AM",
      read: true,
    },
    {
      id: 3,
      sender: "doctor",
      name: "Dr. Rajesh Sharma",
      content:
        "That's wonderful to hear! The Panchakarma treatment is working well. Please continue with the prescribed diet plan.",
      timestamp: "10:35 AM",
      read: true,
    },
    {
      id: 4,
      sender: "patient",
      name: "You",
      content: "Thank you! I have a question about the morning routine. Should I continue the warm water with honey?",
      timestamp: "10:37 AM",
      read: true,
    },
    {
      id: 5,
      sender: "doctor",
      name: "Dr. Rajesh Sharma",
      content:
        "Yes, absolutely! Continue with warm water and honey first thing in the morning. It helps with detoxification.",
      timestamp: "10:40 AM",
      read: false,
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: "patient",
      name: "You",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true,
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulate doctor response after 2 seconds
    setTimeout(() => {
      const doctorResponse = {
        id: messages.length + 2,
        sender: "doctor",
        name: "Dr. Rajesh Sharma",
        content: "Thank you for your message. I'll review this and get back to you shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      }
      setMessages((prev) => [...prev, doctorResponse])
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/patient/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">Panchakarma Care</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Chat with Doctor
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <Card className="border-border/50 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Shield className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-card-foreground">Dr. Rajesh Sharma</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online • Panchakarma Specialist
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                  >
                    Emergency Call
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Chat Messages */}
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex gap-3 max-w-xs lg:max-w-md ${msg.sender === "patient" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback
                          className={
                            msg.sender === "doctor" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
                          }
                        >
                          {msg.sender === "doctor" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`space-y-1 ${msg.sender === "patient" ? "text-right" : ""}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            msg.sender === "patient"
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent/50 text-card-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{msg.timestamp}</span>
                          {msg.sender === "patient" && msg.read && <CheckCircle2 className="h-3 w-3 text-primary" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-border/50 p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send • Your doctor typically responds within 30 minutes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-card-foreground mb-1">Voice Call</h3>
                <p className="text-sm text-muted-foreground mb-3">Schedule a voice consultation</p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  Request Call
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <Video className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium text-card-foreground mb-1">Video Call</h3>
                <p className="text-sm text-muted-foreground mb-3">Face-to-face consultation</p>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  Start Video
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <Phone className="h-8 w-8 text-destructive mx-auto mb-2" />
                <h3 className="font-medium text-card-foreground mb-1">Emergency</h3>
                <p className="text-sm text-muted-foreground mb-3">24/7 emergency support</p>
                <Button size="sm" variant="destructive" className="w-full">
                  Emergency Call
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chat Guidelines */}
          <Card className="border-border/50 mt-6">
            <CardHeader>
              <CardTitle className="text-card-foreground">Chat Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">What to Share</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Symptoms and how you're feeling</li>
                    <li>• Questions about your treatment</li>
                    <li>• Concerns about medications or diet</li>
                    <li>• Progress updates and improvements</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Response Times</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Regular messages: Within 2-4 hours</li>
                    <li>• Urgent concerns: Within 30 minutes</li>
                    <li>• Emergency situations: Call immediately</li>
                    <li>• After hours: Next business day</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
