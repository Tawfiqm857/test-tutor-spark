import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, Star, Crown, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { backend as supabase } from '@/integrations/backend/client';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_score: number;
  total_tests: number;
  average_score: number;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch quiz sessions grouped by user with their scores
        const { data: sessions, error } = await supabase
          .from('quiz_sessions')
          .select(`
            user_id,
            score,
            profiles!inner(display_name, avatar_url)
          `)
          .order('score', { ascending: false });

        if (error) {
          console.error('Error fetching leaderboard:', error);
          return;
        }

        // Aggregate by user
        const userMap = new Map<string, {
          user_id: string;
          display_name: string;
          avatar_url: string | null;
          total_score: number;
          total_tests: number;
        }>();

        sessions?.forEach((session: any) => {
          const userId = session.user_id;
          const existing = userMap.get(userId);
          
          if (existing) {
            existing.total_score += session.score;
            existing.total_tests += 1;
          } else {
            userMap.set(userId, {
              user_id: userId,
              display_name: session.profiles?.display_name || 'Anonymous',
              avatar_url: session.profiles?.avatar_url,
              total_score: session.score,
              total_tests: 1
            });
          }
        });

        // Convert to array and calculate average
        const leaderboard: LeaderboardEntry[] = Array.from(userMap.values())
          .map(entry => ({
            ...entry,
            average_score: Math.round(entry.total_score / entry.total_tests)
          }))
          .sort((a, b) => b.average_score - a.average_score);

        setLeaderboardData(leaderboard);

        // Find current user's rank
        if (user) {
          const userIndex = leaderboard.findIndex(e => e.user_id === user.id);
          if (userIndex !== -1) {
            setCurrentUserRank(userIndex + 1);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  const topStudents = leaderboardData.slice(0, 3);
  const currentUser = user ? leaderboardData.find(e => e.user_id === user.id) : null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-amber-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/10">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">See how you rank against other students</p>
        </div>

        {leaderboardData.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="py-12 text-center">
              <div className="p-4 rounded-full bg-muted inline-block mb-4">
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No data yet</h3>
              <p className="text-muted-foreground">
                Be the first to complete a test and appear on the leaderboard!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top 3 Podium */}
              {topStudents.length > 0 && (
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-accent" />
                      Top Performers
                    </CardTitle>
                    <CardDescription>Our highest achieving students</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {topStudents.map((student, index) => (
                        <div
                          key={student.user_id}
                          className={`relative p-6 rounded-xl border text-center transition-all hover:shadow-md ${
                            index === 0 
                              ? 'bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-amber-500/20' 
                              : 'bg-muted/30 border-muted'
                          }`}
                        >
                          <div className="flex justify-center mb-3">
                            {getRankIcon(index + 1)}
                          </div>
                          
                          <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-background shadow-md">
                            <AvatarImage src={student.avatar_url || undefined} alt={student.display_name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(student.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <h3 className="font-semibold mb-1 truncate">{student.display_name}</h3>
                          <p className="text-2xl font-bold text-primary mb-2">{student.average_score}%</p>
                          <p className="text-sm text-muted-foreground">
                            {student.total_tests} tests
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full Leaderboard */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Complete Rankings</CardTitle>
                  <CardDescription>All students ranked by average score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardData.map((student, index) => (
                      <div
                        key={student.user_id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          student.user_id === user?.id 
                            ? 'bg-primary/5 border-primary/20 shadow-sm' 
                            : 'hover:bg-muted/50 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 min-w-[60px]">
                            {getRankIcon(index + 1)}
                            <span className="font-bold text-lg">#{index + 1}</span>
                          </div>
                          
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar_url || undefined} alt={student.display_name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(student.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{student.display_name}</p>
                              {student.user_id === user?.id && (
                                <Badge variant="secondary" className="text-xs">You</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {student.total_tests} tests completed
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{student.average_score}%</p>
                          <p className="text-sm text-muted-foreground">avg. score</p>
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
                        {currentUserRank && getRankIcon(currentUserRank)}
                      </div>
                      <p className="text-4xl font-bold text-primary">#{currentUserRank || '-'}</p>
                      <p className="text-sm text-muted-foreground mt-1">Your current rank</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Average Score</span>
                          <span className="font-bold">{currentUser.average_score}%</span>
                        </div>
                        <Progress value={currentUser.average_score} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-primary">{currentUser.total_tests}</p>
                          <p className="text-xs text-muted-foreground">Tests Done</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-primary">{currentUser.total_score}</p>
                          <p className="text-xs text-muted-foreground">Total Points</p>
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
                    <Zap className="h-5 w-5 text-accent" />
                    Keep Going!
                  </CardTitle>
                  <CardDescription>Achieve top ranking for recognition</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      'Complete more tests',
                      'Improve your scores',
                      'Be consistent',
                      'Learn from mistakes',
                    ].map((tip, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        <span className="text-muted-foreground">{tip}</span>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4 p-3 rounded-lg bg-muted/50">
                    Reach top 3 to be featured as a top performer!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
