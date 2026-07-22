import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Users, BookOpen, Crown, Star, Loader2 } from 'lucide-react';

interface StudentAggregate {
  user_id: string;
  name: string;
  avatar?: string | null;
  overallScore: number;
  completedTests: number;
  totalAttempts: number;
  perSubject: Record<string, number>;
}

const StudentPerformance: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentAggregate[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: sessions }, { data: profiles }, { data: subjectRows }] = await Promise.all([
        supabase.from('quiz_sessions').select('*'),
        supabase.from('profiles').select('user_id, display_name, avatar_url'),
        supabase.from('subjects').select('id, name'),
      ]);

      const subjectMap: Record<string, string> = {};
      (subjectRows || []).forEach((s: any) => { subjectMap[s.id] = s.name; });
      const subjectNames = Array.from(new Set((subjectRows || []).map((s: any) => s.name)));

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });

      // Aggregate per-user
      const byUser: Record<string, { scores: number[]; attempts: number; perSubject: Record<string, number[]> }> = {};
      (sessions || []).forEach((s: any) => {
        if (!byUser[s.user_id]) byUser[s.user_id] = { scores: [], attempts: 0, perSubject: {} };
        byUser[s.user_id].scores.push(s.score);
        byUser[s.user_id].attempts += 1;
        const subj = subjectMap[s.subject_id] || 'Other';
        if (!byUser[s.user_id].perSubject[subj]) byUser[s.user_id].perSubject[subj] = [];
        byUser[s.user_id].perSubject[subj].push(s.score);
      });

      const aggregates: StudentAggregate[] = Object.entries(byUser).map(([uid, data]) => {
        const profile = profileMap[uid];
        const perSubject: Record<string, number> = {};
        Object.entries(data.perSubject).forEach(([subj, scores]) => {
          perSubject[subj] = Math.max(...scores);
        });
        const overall = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
        return {
          user_id: uid,
          name: profile?.display_name || 'Student',
          avatar: profile?.avatar_url,
          overallScore: overall,
          completedTests: Object.keys(data.perSubject).length,
          totalAttempts: data.attempts,
          perSubject,
        };
      });

      aggregates.sort((a, b) => b.overallScore - a.overallScore);
      setStudents(aggregates);
      setSubjects(subjectNames);
      setLoading(false);
    })();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-warning" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-warning" />;
    return <Star className="h-5 w-5 text-muted-foreground" />;
  };

  const userStats = user ? students.find(s => s.user_id === user.id) : undefined;
  const userRank = userStats ? students.findIndex(s => s.user_id === user!.id) + 1 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Performance</h1>
          <p className="text-muted-foreground text-lg">
            Compare your progress with other students and track your learning journey.
          </p>
        </div>

        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Your Performance</span>
            </CardTitle>
            <CardDescription>Your current progress and ranking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="text-3xl font-bold text-primary mb-1">{userStats ? `#${userRank}` : '—'}</div>
                <div className="text-sm text-muted-foreground">Class Rank</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/5">
                <div className="text-3xl font-bold text-success mb-1">{userStats?.overallScore ?? 0}%</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/5">
                <div className="text-3xl font-bold text-warning mb-1">{userStats?.completedTests ?? 0}</div>
                <div className="text-sm text-muted-foreground">Subjects Completed</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5">
                <div className="text-3xl font-bold text-accent mb-1">{userStats?.totalAttempts ?? 0}</div>
                <div className="text-sm text-muted-foreground">Total Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Class Leaderboard</span>
              </CardTitle>
              <CardDescription>Top performing students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.slice(0, 10).map((student, index) => (
                  <div key={student.user_id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={student.avatar || undefined} alt={student.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {student.name}
                          {user && student.user_id === user.id && <span className="text-primary"> (You)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.completedTests} subjects · {student.totalAttempts} attempts</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold">{student.overallScore}%</p>
                      <p className="text-xs text-muted-foreground">#{index + 1}</p>
                    </div>
                  </div>
                ))}
                {students.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No test attempts yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Your Subject Breakdown</CardTitle>
              <CardDescription>Your best score per subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjects.map(subj => {
                  const score = userStats?.perSubject[subj] ?? 0;
                  return (
                    <div key={subj}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{subj}</span>
                        </div>
                        <span className="text-sm font-bold">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  );
                })}
                {subjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">No subjects available yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
