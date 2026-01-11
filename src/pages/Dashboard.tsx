import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useTest } from '@/contexts/TestContext';
import { useQuizStats } from '@/hooks/useQuizStats';
import { Play, Clock, Trophy, Target, BookOpen, Brain, ChevronRight, Sparkles, Loader2, GraduationCap } from 'lucide-react';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import SubjectBreakdownChart from '@/components/dashboard/SubjectBreakdownChart';
import ScoreDistributionChart from '@/components/dashboard/ScoreDistributionChart';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { tests, getTestProgress } = useTest();
  const { performanceData, subjectData, scoreDistribution, totalAttempts, averageScore, loading: statsLoading } = useQuizStats();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'HTML':
        return <BookOpen className="h-5 w-5 text-accent" />;
      case 'CSS':
        return <Brain className="h-5 w-5 text-primary" />;
      case 'JavaScript':
        return <Target className="h-5 w-5 text-accent" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const calculateOverallProgress = () => {
    const completedTests = tests.filter(test => getTestProgress(test.id).status === 'completed').length;
    return Math.round((completedTests / tests.length) * 100);
  };

  const overallProgress = calculateOverallProgress();

  const stats = [
    { 
      label: 'Overall Progress', 
      value: `${overallProgress}%`, 
      icon: Trophy, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'Average Score', 
      value: `${averageScore}%`, 
      icon: Target, 
      color: 'text-success',
      bg: 'bg-success/10'
    },
    { 
      label: 'Tests Available', 
      value: tests.length.toString(), 
      icon: BookOpen, 
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      label: 'Total Attempts', 
      value: totalAttempts.toString(), 
      icon: Brain, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
  ];

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <p className="text-muted-foreground text-lg">
                Ready to continue your learning journey? Let's see how you're progressing.
              </p>
            </div>
            <Card className="p-4 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <ProfilePictureUpload />
                <div className="space-y-1">
                  <h3 className="font-semibold">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Take an Exam</h3>
                  <p className="text-sm text-muted-foreground">Test your knowledge and earn certifications</p>
                </div>
                <Button asChild>
                  <Link to="/exams">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    View Exams
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 bg-gradient-to-r from-accent/10 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">View Leaderboard</h3>
                  <p className="text-sm text-muted-foreground">See how you rank against others</p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/leaderboard">
                    <Trophy className="mr-2 h-4 w-4" />
                    Rankings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg border-0 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PerformanceChart data={performanceData} />
          <SubjectBreakdownChart data={subjectData} />
          <ScoreDistributionChart data={scoreDistribution} />
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>Your Learning Progress</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Track your journey through our comprehensive courses
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/student-performance">
                  View Details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Overall Completion</span>
                <span className="text-muted-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2.5" />
              <p className="text-sm text-muted-foreground">
                {tests.filter(test => getTestProgress(test.id).status === 'completed').length} of {tests.length} tests completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Tests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Practice Tests</h2>
            <Badge variant="secondary" className="text-xs">
              {tests.length} tests
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tests.slice(0, 6).map((test) => {
              const progress = getTestProgress(test.id);
              return (
                <Card key={test.id} className="group hover:shadow-xl transition-all duration-300 shadow-lg border-0 overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                          {getSubjectIcon(test.subject)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{test.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1.5">
                            <Badge variant="outline" className="text-xs font-normal">
                              {test.subject}
                            </Badge>
                            {getStatusBadge(progress.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed line-clamp-2">
                      {test.description}
                    </CardDescription>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{test.timeLimit} min</span>
                      </div>
                      <span>{test.questions.length} questions</span>
                    </div>

                    {progress.status === 'completed' && (
                      <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Best Score</span>
                          <span className="font-bold text-success">{progress.bestScore}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-muted-foreground">Attempts</span>
                          <span className="font-medium">{progress.attempts}</span>
                        </div>
                      </div>
                    )}

                    <Button asChild className="w-full group-hover:bg-primary/90">
                      <Link to={`/test/${test.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        {progress.status === 'completed' ? 'Retake Test' : 'Start Test'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {tests.length > 6 && (
            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link to="/exams">
                  View All Tests
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Learning Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">📚 Study Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Review incorrect answers and explanations after each test to improve your understanding. 
                Focus on one subject at a time for better retention.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">🎯 Practice Regularly</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Take tests multiple times to reinforce your knowledge. Consistent practice leads to 
                significant improvement in your scores.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
