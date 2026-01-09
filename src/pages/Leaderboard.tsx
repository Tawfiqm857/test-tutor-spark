import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, Star, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTest } from '@/contexts/TestContext';

interface StudentData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  overallScore: number;
  completedTests: number;
  totalAttempts: number;
  htmlScore: number;
  cssScore: number;
  jsScore: number;
  rank: number;
  isPremium?: boolean;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { testProgress } = useTest();

  const calculateUserOverallScore = () => {
    const completedTests = Object.values(testProgress).filter(p => p.status === 'completed');
    if (completedTests.length === 0) return 0;
    const totalScore = completedTests.reduce((sum, test) => sum + test.bestScore, 0);
    return Math.round(totalScore / completedTests.length);
  };

  const mockStudents: StudentData[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      overallScore: 98,
      completedTests: 15,
      totalAttempts: 18,
      htmlScore: 96,
      cssScore: 98,
      jsScore: 100,
      rank: 1,
      isPremium: true
    },
    {
      id: '2',
      name: 'Bob Chen',
      email: 'bob@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      overallScore: 94,
      completedTests: 12,
      totalAttempts: 15,
      htmlScore: 92,
      cssScore: 95,
      jsScore: 96,
      rank: 2,
      isPremium: true
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      overallScore: 89,
      completedTests: 10,
      totalAttempts: 14,
      htmlScore: 88,
      cssScore: 90,
      jsScore: 89,
      rank: 3,
      isPremium: true
    },
    // Current user
    {
      id: user?.id || 'current',
      name: user?.name || 'You',
      email: user?.email || '',
      avatar: user?.avatar,
      overallScore: calculateUserOverallScore(),
      completedTests: Object.values(testProgress).filter(p => p.status === 'completed').length,
      totalAttempts: Object.values(testProgress).reduce((sum, p) => sum + p.attempts, 0),
      htmlScore: testProgress['html']?.bestScore || 0,
      cssScore: testProgress['css']?.bestScore || 0,
      jsScore: testProgress['javascript']?.bestScore || 0,
      rank: 4,
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david@example.com',
      overallScore: 82,
      completedTests: 8,
      totalAttempts: 12,
      htmlScore: 80,
      cssScore: 84,
      jsScore: 82,
      rank: 5,
    },
    {
      id: '5',
      name: 'Emma Brown',
      email: 'emma@example.com',
      overallScore: 78,
      completedTests: 6,
      totalAttempts: 10,
      htmlScore: 75,
      cssScore: 80,
      jsScore: 79,
      rank: 6,
    }
  ];

  const sortedStudents = mockStudents.sort((a, b) => b.overallScore - a.overallScore)
    .map((student, index) => ({ ...student, rank: index + 1 }));

  const topStudents = sortedStudents.slice(0, 3);
  const currentUser = sortedStudents.find(s => s.id === user?.id);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-warning" />;
      case 2: return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3: return <Award className="h-6 w-6 text-warning" />;
      default: return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSubjectBadge = (subject: string, score: number) => {
    const colors: Record<string, string> = {
      html: 'bg-warning/10 text-warning',
      css: 'bg-primary/10 text-primary',
      javascript: 'bg-warning/10 text-warning',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[subject.toLowerCase()]}`}>
        {score}%
      </span>
    );
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other students</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top 3 Podium */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  Top Performers
                </CardTitle>
                <CardDescription>Our highest achieving students</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {topStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`relative p-6 rounded-xl border text-center transition-all hover:shadow-md ${
                        student.rank === 1 
                          ? 'bg-gradient-to-b from-warning/10 to-warning/5 border-warning/20' 
                          : 'bg-muted/30 border-muted'
                      }`}
                    >
                      {student.isPremium && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-primary text-primary-foreground shadow-md">
                            <Zap className="h-3 w-3 mr-1" />
                            Pro
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex justify-center mb-3">
                        {getRankIcon(student.rank)}
                      </div>
                      
                      <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-background shadow-md">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-semibold mb-1 truncate">{student.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">{student.overallScore}%</p>
                      <p className="text-sm text-muted-foreground">
                        {student.completedTests} tests
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Full Leaderboard */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Complete Rankings</CardTitle>
                <CardDescription>All students ranked by overall performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        student.id === user?.id 
                          ? 'bg-primary/5 border-primary/20 shadow-sm' 
                          : 'hover:bg-muted/50 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 min-w-[60px]">
                          {getRankIcon(student.rank)}
                          <span className="font-bold text-lg">#{student.rank}</span>
                        </div>
                        
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{student.name}</p>
                            {student.id === user?.id && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                            {student.isPremium && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {student.completedTests} tests • {student.totalAttempts} attempts
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{student.overallScore}%</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getSubjectBadge('html', student.htmlScore)}
                          {getSubjectBadge('css', student.cssScore)}
                          {getSubjectBadge('javascript', student.jsScore)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Your Stats */}
          <div className="space-y-6">
            {currentUser && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Your Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-4 rounded-xl bg-primary/5">
                    <div className="flex justify-center mb-2">
                      {getRankIcon(currentUser.rank)}
                    </div>
                    <p className="text-4xl font-bold text-primary">#{currentUser.rank}</p>
                    <p className="text-sm text-muted-foreground mt-1">Your current rank</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Overall Score</span>
                        <span className="font-bold">{currentUser.overallScore}%</span>
                      </div>
                      <Progress value={currentUser.overallScore} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{currentUser.completedTests}</p>
                        <p className="text-xs text-muted-foreground">Tests Done</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{currentUser.totalAttempts}</p>
                        <p className="text-xs text-muted-foreground">Attempts</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Unlock More
                </CardTitle>
                <CardDescription>Achieve top ranking for special features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Detailed Analytics',
                    'Custom Study Plans',
                    'Priority Support',
                    'Advanced Features',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50">
                  Reach top 3 to unlock premium features!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
