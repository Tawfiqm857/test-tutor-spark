import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTest } from '@/contexts/TestContext';
import { Trophy, Medal, Target, TrendingUp, Users, BookOpen, Crown, Star } from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  overallScore: number;
  completedTests: number;
  totalAttempts: number;
  htmlScore: number;
  cssScore: number;
  jsScore: number;
  rank: number;
}

const StudentPerformance: React.FC = () => {
  const { user } = useAuth();
  const { tests, testProgress } = useTest();

  // Mock student data for demonstration
  const mockStudents: StudentData[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: '',
      overallScore: 95,
      completedTests: 3,
      totalAttempts: 5,
      htmlScore: 100,
      cssScore: 90,
      jsScore: 95,
      rank: 1
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      avatar: '',
      overallScore: 88,
      completedTests: 3,
      totalAttempts: 4,
      htmlScore: 85,
      cssScore: 95,
      jsScore: 85,
      rank: 2
    },
    {
      id: '3',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      avatar: '',
      overallScore: 82,
      completedTests: 2,
      totalAttempts: 3,
      htmlScore: 80,
      cssScore: 85,
      jsScore: 0,
      rank: 3
    },
    {
      id: '4',
      name: user?.name || 'Current User',
      email: user?.email || 'you@example.com',
      avatar: user?.avatar,
      overallScore: calculateUserOverallScore(),
      completedTests: tests.filter(test => testProgress[test.id]?.status === 'completed').length,
      totalAttempts: Object.values(testProgress).reduce((sum, progress) => sum + progress.attempts, 0),
      htmlScore: testProgress['html-basics']?.bestScore || 0,
      cssScore: testProgress['css-styling']?.bestScore || 0,
      jsScore: testProgress['js-fundamentals']?.bestScore || 0,
      rank: 4
    },
    {
      id: '5',
      name: 'Diana Prince',
      email: 'diana@example.com',
      avatar: '',
      overallScore: 75,
      completedTests: 2,
      totalAttempts: 6,
      htmlScore: 70,
      cssScore: 80,
      jsScore: 0,
      rank: 5
    }
  ];

  function calculateUserOverallScore(): number {
    const completedTests = tests.filter(test => testProgress[test.id]?.status === 'completed');
    if (completedTests.length === 0) return 0;
    
    const totalScore = completedTests.reduce((sum, test) => sum + (testProgress[test.id]?.bestScore || 0), 0);
    return Math.round(totalScore / completedTests.length);
  }

  // Sort students by overall score
  const sortedStudents = mockStudents.sort((a, b) => b.overallScore - a.overallScore);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-warning" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Trophy className="h-5 w-5 text-warning" />;
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'HTML':
        return <BookOpen className="h-4 w-4 text-warning" />;
      case 'CSS':
        return <Target className="h-4 w-4 text-primary" />;
      case 'JavaScript':
        return <TrendingUp className="h-4 w-4 text-warning" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const userStats = mockStudents.find(s => s.id === '4');

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Performance</h1>
          <p className="text-muted-foreground text-lg">
            Compare your progress with other students and track your learning journey.
          </p>
        </div>

        {/* Your Stats */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Your Performance</span>
            </CardTitle>
            <CardDescription>
              Your current progress and ranking among all students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="text-3xl font-bold text-primary mb-1">{userStats?.rank}</div>
                <div className="text-sm text-muted-foreground">Class Rank</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/5">
                <div className="text-3xl font-bold text-success mb-1">{userStats?.overallScore}%</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/5">
                <div className="text-3xl font-bold text-warning mb-1">{userStats?.completedTests}</div>
                <div className="text-sm text-muted-foreground">Tests Completed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5">
                <div className="text-3xl font-bold text-accent mb-1">{userStats?.totalAttempts}</div>
                <div className="text-sm text-muted-foreground">Total Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Class Leaderboard</span>
              </CardTitle>
              <CardDescription>
                Top performing students across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedStudents.slice(0, 5).map((student, index) => (
                  <div key={student.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {student.name}
                          {student.id === '4' && <span className="text-primary"> (You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.completedTests} tests completed</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold">{student.overallScore}%</p>
                      <p className="text-xs text-muted-foreground">#{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Subject Breakdown</CardTitle>
              <CardDescription>
                Your performance in each subject area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSubjectIcon('HTML')}
                      <span className="text-sm font-medium">HTML Fundamentals</span>
                    </div>
                    <span className="text-sm font-bold">{userStats?.htmlScore || 0}%</span>
                  </div>
                  <Progress value={userStats?.htmlScore || 0} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSubjectIcon('CSS')}
                      <span className="text-sm font-medium">CSS Styling</span>
                    </div>
                    <span className="text-sm font-bold">{userStats?.cssScore || 0}%</span>
                  </div>
                  <Progress value={userStats?.cssScore || 0} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSubjectIcon('JavaScript')}
                      <span className="text-sm font-medium">JavaScript Fundamentals</span>
                    </div>
                    <span className="text-sm font-bold">{userStats?.jsScore || 0}%</span>
                  </div>
                  <Progress value={userStats?.jsScore || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Student List */}
        <Card className="mt-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              Complete list of student performances and scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedStudents.map((student, index) => (
                <div key={student.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(index + 1)}
                        <span className="font-semibold">#{index + 1}</span>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {student.name}
                          {student.id === '4' && <Badge variant="secondary" className="ml-2">You</Badge>}
                        </p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{student.overallScore}%</p>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-warning/5 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        {getSubjectIcon('HTML')}
                        <span className="text-sm font-medium">HTML</span>
                      </div>
                      <p className="text-lg font-bold text-warning">{student.htmlScore}%</p>
                    </div>
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        {getSubjectIcon('CSS')}
                        <span className="text-sm font-medium">CSS</span>
                      </div>
                      <p className="text-lg font-bold text-primary">{student.cssScore}%</p>
                    </div>
                    <div className="text-center p-3 bg-warning/5 rounded-lg">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        {getSubjectIcon('JavaScript')}
                        <span className="text-sm font-medium">JS</span>
                      </div>
                      <p className="text-lg font-bold text-warning">{student.jsScore}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPerformance;
