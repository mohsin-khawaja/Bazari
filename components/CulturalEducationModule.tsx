"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookOpen, Clock, Award, CheckCircle, Play, Trophy } from "lucide-react"
import {
  getEducationModules,
  getUserEducationProgress,
  updateEducationProgress,
} from "@/lib/supabase/cultural-education"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"

interface CulturalEducationModuleProps {
  culturalOriginId?: string
  moduleType?: string
}

export default function CulturalEducationModule({ culturalOriginId, moduleType }: CulturalEducationModuleProps) {
  const { user } = useAuth()
  const [modules, setModules] = useState<any[]>([])
  const [userProgress, setUserProgress] = useState<any[]>([])
  const [selectedModule, setSelectedModule] = useState<any>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesData, progressData] = await Promise.all([
          getEducationModules(culturalOriginId, moduleType),
          user ? getUserEducationProgress(user.id) : Promise.resolve([]),
        ])

        setModules(modulesData || [])
        setUserProgress(progressData || [])
      } catch (error) {
        console.error("Error fetching education data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [culturalOriginId, moduleType, user])

  const getModuleProgress = (moduleId: string) => {
    if (!user) return { completed: false, score: null }

    const progress = userProgress.find((p) => p.cultural_origin_id === culturalOriginId)
    if (!progress) return { completed: false, score: null }

    const completed = progress.completed_modules?.includes(moduleId) || false
    const score = progress.quiz_scores?.[moduleId] || null

    return { completed, score }
  }

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const startModule = (module: any) => {
    setSelectedModule(module)
    setCurrentSection(0)
    setQuizAnswers({})
    setQuizScore(null)
  }

  const nextSection = () => {
    if (selectedModule && currentSection < selectedModule.content.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const startQuiz = () => {
    setCurrentSection(selectedModule.content.sections.length) // Move to quiz section
  }

  const submitQuiz = async () => {
    if (!selectedModule || !user) return

    const questions = selectedModule.quiz_questions || []
    let correct = 0

    questions.forEach((question: any, index: number) => {
      if (quizAnswers[index] === question.correct_answer) {
        correct++
      }
    })

    const score = Math.round((correct / questions.length) * 100)
    setQuizScore(score)

    try {
      await updateEducationProgress(user.id, culturalOriginId!, selectedModule.id, score)

      // Update local progress
      const updatedProgress = await getUserEducationProgress(user.id)
      setUserProgress(updatedProgress || [])

      toast({
        title: "Quiz completed!",
        description: `You scored ${score}% on this module.`,
      })
    } catch (error) {
      console.error("Error updating progress:", error)
      toast({
        title: "Error",
        description: "Failed to save your progress.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (modules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Cultural Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No education modules available.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Cultural Education Modules
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {modules.map((module) => {
              const progress = getModuleProgress(module.id)
              return (
                <div key={module.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{module.title}</h3>
                        {progress.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{module.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.estimated_duration} min
                        </div>
                        <Badge className={`text-xs ${getDifficultyColor(module.difficulty_level)}`}>
                          {module.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {module.module_type}
                        </Badge>
                      </div>

                      {progress.score !== null && (
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">Quiz Score: {progress.score}%</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant={progress.completed ? "outline" : "default"}
                      size="sm"
                      onClick={() => startModule(module)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {progress.completed ? "Review" : "Start"}
                    </Button>
                  </div>

                  {module.learning_objectives && module.learning_objectives.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Learning Objectives:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {module.learning_objectives.slice(0, 3).map((objective: string, index: number) => (
                          <li key={index}>• {objective}</li>
                        ))}
                        {module.learning_objectives.length > 3 && (
                          <li>• +{module.learning_objectives.length - 3} more objectives</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Module Content Modal */}
      {selectedModule && (
        <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {selectedModule.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>
                    {currentSection + 1} / {selectedModule.content.sections.length + 1}
                  </span>
                </div>
                <Progress
                  value={((currentSection + 1) / (selectedModule.content.sections.length + 1)) * 100}
                  className="h-2"
                />
              </div>

              <ScrollArea className="max-h-[60vh] pr-4">
                {/* Module Content Sections */}
                {currentSection < selectedModule.content.sections.length && (
                  <div className="space-y-6">
                    {selectedModule.content.sections[currentSection] && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">
                          {selectedModule.content.sections[currentSection].title}
                        </h2>

                        <div className="prose prose-sm max-w-none">
                          <p className="leading-relaxed">{selectedModule.content.sections[currentSection].content}</p>
                        </div>

                        {selectedModule.content.sections[currentSection].images && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            {selectedModule.content.sections[currentSection].images.map(
                              (image: string, index: number) => (
                                <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                                  <img
                                    src={image || "/placeholder.svg"}
                                    alt={`Section ${currentSection + 1} - Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Section */}
                {currentSection >= selectedModule.content.sections.length &&
                  selectedModule.quiz_questions &&
                  selectedModule.quiz_questions.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Knowledge Check</h2>

                      {quizScore === null ? (
                        <div className="space-y-6">
                          {selectedModule.quiz_questions.map((question: any, index: number) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <h3 className="font-medium mb-4">
                                  {index + 1}. {question.question}
                                </h3>

                                <RadioGroup
                                  value={quizAnswers[index] || ""}
                                  onValueChange={(value) => setQuizAnswers((prev) => ({ ...prev, [index]: value }))}
                                >
                                  {question.options.map((option: string, optionIndex: number) => (
                                    <div key={optionIndex} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option} id={`q${index}-${optionIndex}`} />
                                      <Label htmlFor={`q${index}-${optionIndex}`} className="text-sm">
                                        {option}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="p-6 bg-muted rounded-lg">
                            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                            <p className="text-lg">Your Score: {quizScore}%</p>
                            {quizScore >= 80 && (
                              <div className="mt-4">
                                <Badge className="bg-green-100 text-green-800">
                                  <Award className="h-3 w-3 mr-1" />
                                  Module Completed
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </ScrollArea>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={previousSection} disabled={currentSection === 0}>
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentSection < selectedModule.content.sections.length - 1 && (
                    <Button onClick={nextSection}>Next Section</Button>
                  )}

                  {currentSection === selectedModule.content.sections.length - 1 &&
                    selectedModule.quiz_questions &&
                    selectedModule.quiz_questions.length > 0 && <Button onClick={startQuiz}>Take Quiz</Button>}

                  {currentSection >= selectedModule.content.sections.length &&
                    selectedModule.quiz_questions &&
                    selectedModule.quiz_questions.length > 0 &&
                    quizScore === null && (
                      <Button
                        onClick={submitQuiz}
                        disabled={Object.keys(quizAnswers).length < selectedModule.quiz_questions.length || !user}
                      >
                        Submit Quiz
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
