"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"

interface FeedbackFormProps {
  sessionType?: "morning" | "evening"
  onSubmit?: (feedback: any) => void
}

export default function FeedbackForm({ sessionType = "morning", onSubmit }: FeedbackFormProps) {
  const [energyLevel, setEnergyLevel] = useState([5])
  const [moodRating, setMoodRating] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [sleepQuality, setSleepQuality] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const feedback = {
      sessionType,
      energyLevel: energyLevel[0],
      moodRating,
      symptoms,
      sleepQuality,
      additionalNotes,
      timestamp: new Date().toISOString(),
    }

    if (onSubmit) {
      onSubmit(feedback)
    } else {
      console.log("Feedback submitted:", feedback)
      alert("Thank you for your feedback! Your responses have been recorded.")
    }
  }

  return (
    <Card className="border-border/50 max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">Daily Feedback Form</CardTitle>
            <CardDescription>Help us track your progress and adjust your treatment plan</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {sessionType === "morning" ? "Morning Check-in" : "Evening Check-in"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Energy Level */}
          <div className="space-y-3">
            <Label className="text-card-foreground">Energy Level (1-10)</Label>
            <div className="px-3">
              <Slider value={energyLevel} onValueChange={setEnergyLevel} max={10} min={1} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Very Low</span>
                <span className="font-medium text-card-foreground">{energyLevel[0]}</span>
                <span>Very High</span>
              </div>
            </div>
          </div>

          {/* Mood Rating */}
          <div className="space-y-3">
            <Label className="text-card-foreground">Overall Mood</Label>
            <RadioGroup value={moodRating} onValueChange={setMoodRating}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="excellent" />
                <Label htmlFor="excellent" className="text-sm">
                  Excellent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good" className="text-sm">
                  Good
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="fair" />
                <Label htmlFor="fair" className="text-sm">
                  Fair
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="poor" />
                <Label htmlFor="poor" className="text-sm">
                  Poor
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sleep Quality (Evening only) */}
          {sessionType === "evening" && (
            <div className="space-y-3">
              <Label className="text-card-foreground">Sleep Quality (Last Night)</Label>
              <RadioGroup value={sleepQuality} onValueChange={setSleepQuality}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="sleep-excellent" />
                  <Label htmlFor="sleep-excellent" className="text-sm">
                    Excellent (8+ hours, restful)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="sleep-good" />
                  <Label htmlFor="sleep-good" className="text-sm">
                    Good (6-8 hours, mostly restful)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fair" id="sleep-fair" />
                  <Label htmlFor="sleep-fair" className="text-sm">
                    Fair (4-6 hours, some interruptions)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="sleep-poor" />
                  <Label htmlFor="sleep-poor" className="text-sm">
                    Poor (Less than 4 hours, restless)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Symptoms */}
          <div className="space-y-3">
            <Label htmlFor="symptoms" className="text-card-foreground">
              Current Symptoms or Concerns
            </Label>
            <Textarea
              id="symptoms"
              placeholder="Describe any symptoms, discomfort, or changes you've noticed..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-20"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-card-foreground">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Any other observations, questions, or feedback for your doctor..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="min-h-20"
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={!moodRating}>
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
