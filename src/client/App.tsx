"use client"
import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

/**
 * Dashboard landing page.
 */
export default function App() {
  return (
    <div className="flex justify-center items-center h-full">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Exam Buster Dashboard</CardTitle>
          <CardDescription>Use the sidebar to access Prep Plans or AI Chat.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Welcome! Select an option from the sidebar to get started:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Prep Plans: Upload assignments and view study plans</li>
            <li>AI Chat: Interactive chat with AI assistant</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}