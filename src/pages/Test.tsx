import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTest } from '@/contexts/TestContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, ChevronLeft, ChevronRight, BookOpen, Send, AlertCircle, CheckCircle, XCircle, Lightbulb, Timer } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AnswerFeedback {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: number;
  explanation?: string;
  shown: boolean;
}

const Test: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tests, startTest, currentTest, currentAnswers, submitAnswer, submitTest, resetCurrentTest } = useTest();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<Record<string, AnswerFeedback>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (testId) {
      const test = tests.find(t => t.id === testId);
      if (!test) {
        toast({
          title: 'Test not found',
          description: 'The requested test could not be found.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }
      
      startTest(testId);
      setTimeRemaining(test.timeLimit * 60);
      setAnswerFeedback({});
    }

    return () => {
      resetCurrentTest();
    };
  }, [testId, tests, startTest, resetCurrentTest, navigate, toast]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentTest) {
      handleSubmitTest();
    }
  }, [timeRemaining, currentTest]);

  // Reset explanation visibility when changing questions
  useEffect(() => {
    if (currentTest) {
      const questionId = currentTest.questions[currentQuestionIndex]?.id;
      if (questionId && answerFeedback[questionId]?.shown) {
        setShowExplanation(true);
      } else {
        setShowExplanation(false);
      }
    }
  }, [currentQuestionIndex, currentTest, answerFeedback]);

  if (!currentTest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-sm w-full text-center shadow-lg border-0">
          <CardContent className="pt-8">
            <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
              <BookOpen className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-medium">Loading test...</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentTest.questions[currentQuestionIndex];
  const totalQuestions = currentTest.questions.length;
  const answeredCount = Object.keys(currentAnswers).length;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeRemaining / (currentTest.timeLimit * 60)) * 100;
    if (percentage <= 10) return 'bg-destructive text-destructive-foreground';
    if (percentage <= 25) return 'bg-warning text-warning-foreground';
    return 'bg-muted';
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    // Don't allow changing answers if feedback already shown
    if (answerFeedback[questionId]?.shown) return;

    submitAnswer(questionId, answerIndex);

    // Show immediate feedback
    const question = currentTest.questions.find(q => q.id === questionId);
    if (question) {
      const isCorrect = answerIndex === question.correctAnswer;
      setAnswerFeedback(prev => ({
        ...prev,
        [questionId]: {
          questionId,
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          shown: true
        }
      }));
      setShowExplanation(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitTest = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);
    
    try {
      const result = await submitTest();
      if (result) {
        toast({
          title: 'Test submitted!',
          description: `You scored ${result.score}% on this test.`,
        });
        navigate('/results', { state: { result } });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    const unansweredQuestions = currentTest.questions.filter(q => !(q.id in currentAnswers));
    if (unansweredQuestions.length > 0 && timeRemaining > 0) {
      setShowConfirmDialog(true);
    } else {
      handleSubmitTest();
    }
  };

  const isQuestionAnswered = (questionId: string) => questionId in currentAnswers;
  const allQuestionsAnswered = answeredCount === totalQuestions;
  const unansweredCount = totalQuestions - answeredCount;
  const currentFeedback = answerFeedback[currentQuestion.id];

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-5xl">
        {/* Test Header */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold">{currentTest.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {currentTest.subject} • {totalQuestions} Questions
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Animated Timer */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${getTimerColor()}`}>
                  <Timer className={`h-4 w-4 ${timeRemaining <= 60 ? 'animate-pulse' : ''}`} />
                  <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{answeredCount} of {totalQuestions} answered</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </CardTitle>
                  {currentFeedback?.shown && (
                    <Badge className={currentFeedback.isCorrect 
                      ? "bg-success/10 text-success border-0" 
                      : "bg-destructive/10 text-destructive border-0"
                    }>
                      {currentFeedback.isCorrect ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Correct</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Incorrect</>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-base text-foreground leading-relaxed">
                  {currentQuestion.question}
                </CardDescription>

                <RadioGroup
                  value={currentAnswers[currentQuestion.id]?.toString() || ''}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                  className="space-y-3"
                  disabled={currentFeedback?.shown}
                >
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = currentAnswers[currentQuestion.id] === index;
                    const isCorrectAnswer = currentFeedback?.shown && index === currentFeedback.correctAnswer;
                    const isWrongSelected = currentFeedback?.shown && isSelected && !currentFeedback.isCorrect;
                    
                    let borderClass = 'border-border hover:border-muted-foreground/30';
                    let bgClass = 'hover:bg-muted/50';
                    
                    if (currentFeedback?.shown) {
                      if (isCorrectAnswer) {
                        borderClass = 'border-success';
                        bgClass = 'bg-success/10';
                      } else if (isWrongSelected) {
                        borderClass = 'border-destructive';
                        bgClass = 'bg-destructive/10';
                      }
                    } else if (isSelected) {
                      borderClass = 'border-primary';
                      bgClass = 'bg-primary/5';
                    }
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                          currentFeedback?.shown ? '' : 'cursor-pointer'
                        } ${bgClass} ${borderClass}`}
                        onClick={() => !currentFeedback?.shown && handleAnswerSelect(currentQuestion.id, index)}
                      >
                        <RadioGroupItem 
                          value={index.toString()} 
                          id={`option-${index}`}
                          className={isSelected ? 'border-primary text-primary' : ''}
                          disabled={currentFeedback?.shown}
                        />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className={`flex-1 ${currentFeedback?.shown ? '' : 'cursor-pointer'} text-base`}
                        >
                          {option}
                        </Label>
                        {currentFeedback?.shown && isCorrectAnswer && (
                          <CheckCircle className="h-5 w-5 text-success" />
                        )}
                        {isWrongSelected && (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>

                {/* Explanation after answering */}
                {showExplanation && currentFeedback?.explanation && (
                  <Alert className="border-0 bg-muted/50 animate-in fade-in-50 slide-in-from-top-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      <span className="font-medium">Explanation: </span>
                      {currentFeedback.explanation}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                size="lg"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button onClick={handleNext} size="lg">
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitClick}
                    disabled={isSubmitting}
                    size="lg"
                    className="bg-success hover:bg-success/90"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {currentTest.questions.map((question, index) => {
                    const isAnswered = isQuestionAnswered(question.id);
                    const isCurrent = index === currentQuestionIndex;
                    const feedback = answerFeedback[question.id];
                    
                    let buttonClass = '';
                    if (feedback?.shown) {
                      buttonClass = feedback.isCorrect
                        ? 'bg-success/20 border-success/40 text-success hover:bg-success/30 hover:text-success'
                        : 'bg-destructive/20 border-destructive/40 text-destructive hover:bg-destructive/30 hover:text-destructive';
                    } else if (isAnswered && !isCurrent) {
                      buttonClass = 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:text-primary';
                    }
                    
                    return (
                      <Button
                        key={question.id}
                        variant={isCurrent ? 'default' : 'outline'}
                        size="sm"
                        className={`text-xs h-9 w-9 p-0 ${buttonClass}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Answered</span>
                    <Badge variant="secondary">{answeredCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <Badge variant="outline">{unansweredCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Correct</span>
                    <Badge className="bg-success/10 text-success border-0">
                      {Object.values(answerFeedback).filter(f => f.isCorrect).length}
                    </Badge>
                  </div>
                </div>

                {allQuestionsAnswered && (
                  <Button
                    onClick={handleSubmitClick}
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-success hover:bg-success/90"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Test
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Submit Test?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. 
              Are you sure you want to submit the test now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitTest} className="bg-success hover:bg-success/90">
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Test;
