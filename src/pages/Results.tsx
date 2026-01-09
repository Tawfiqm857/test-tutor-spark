import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTest, TestAttempt } from '@/contexts/TestContext';
import { Trophy, RotateCcw, Home, CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

const Results: React.FC = () => {
  const location = useLocation();
  const { tests } = useTest();
  const result = location.state?.result as TestAttempt;

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-lg border-0">
          <CardContent className="pt-8 pb-8">
            <div className="p-4 rounded-full bg-muted inline-block mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-6">
              It looks like you haven't completed any tests yet.
            </p>
            <Button asChild>
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const test = tests.find(t => t.id === result.testId);
  const correctAnswers = Object.keys(result.answers).filter(questionId => {
    const question = test?.questions.find(q => q.id === questionId);
    return question && result.answers[questionId] === question.correctAnswer;
  }).length;

  const getPerformanceData = (score: number) => {
    if (score >= 90) return { message: "Outstanding!", emoji: "🎉", color: "text-success", bg: "bg-success/10" };
    if (score >= 70) return { message: "Great job!", emoji: "👏", color: "text-success", bg: "bg-success/10" };
    if (score >= 50) return { message: "Good effort!", emoji: "👍", color: "text-warning", bg: "bg-warning/10" };
    return { message: "Keep practicing!", emoji: "💪", color: "text-destructive", bg: "bg-destructive/10" };
  };

  const performance = getPerformanceData(result.score);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-3xl">
        {/* Score Hero */}
        <Card className="shadow-xl border-0 mb-8 overflow-hidden">
          <div className={`p-8 text-center ${performance.bg}`}>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-background shadow-lg">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Test Complete!</h1>
            <p className="text-muted-foreground mb-6">{test?.title}</p>
            
            <div className="text-7xl font-bold text-primary mb-2">{result.score}%</div>
            <p className={`text-xl font-medium ${performance.color}`}>
              {performance.emoji} {performance.message}
            </p>
          </div>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-success/5">
                <p className="text-2xl font-bold text-success">{correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 rounded-xl bg-destructive/5">
                <p className="text-2xl font-bold text-destructive">{result.totalQuestions - correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold">{result.totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Review */}
        {test && (
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Review Your Answers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {test.questions.map((question, index) => {
                const userAnswer = result.answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div 
                    key={question.id} 
                    className={`p-4 rounded-xl border transition-colors ${
                      isCorrect ? 'border-success/20 bg-success/5' : 'border-destructive/20 bg-destructive/5'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCorrect ? (
                          <div className="p-1 rounded-full bg-success/20">
                            <CheckCircle className="h-4 w-4 text-success" />
                          </div>
                        ) : (
                          <div className="p-1 rounded-full bg-destructive/20">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium mb-2">Q{index + 1}: {question.question}</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Your answer:{' '}
                          <span className={`font-medium ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                            {userAnswer !== undefined ? question.options[userAnswer] : 'Not answered'}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Correct answer:</span>{' '}
                            <span className="text-success font-medium">{question.options[question.correctAnswer]}</span>
                          </p>
                        )}
                        {question.explanation && !isCorrect && (
                          <Alert className="mt-3 border-0 bg-muted/50">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-sm">
                              {question.explanation}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="outline">
            <Link to={`/test/${result.testId}`}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake Test
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
