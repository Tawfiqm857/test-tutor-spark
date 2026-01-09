import { useState, useEffect } from 'react';
import { backend as supabase } from '@/integrations/backend/client';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceData {
  date: string;
  score: number;
  subject: string;
}

interface SubjectData {
  name: string;
  value: number;
  attempts: number;
  avgScore: number;
}

interface ScoreDistribution {
  range: string;
  count: number;
}

interface QuizStats {
  performanceData: PerformanceData[];
  subjectData: SubjectData[];
  scoreDistribution: ScoreDistribution[];
  totalAttempts: number;
  averageScore: number;
  loading: boolean;
}

export const useQuizStats = (): QuizStats => {
  const { user, isAuthenticated } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([
    { range: '0-20%', count: 0 },
    { range: '21-40%', count: 0 },
    { range: '41-60%', count: 0 },
    { range: '61-80%', count: 0 },
    { range: '81-100%', count: 0 },
  ]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch quiz sessions with subject info
        const { data: sessions, error } = await supabase
          .from('quiz_sessions')
          .select(`
            id,
            score,
            total_questions,
            completed_at,
            subjects (name)
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: true });

        if (error) {
          console.error('Error fetching quiz stats:', error);
          return;
        }

        if (!sessions || sessions.length === 0) {
          setLoading(false);
          return;
        }

        // Process performance data (last 10 attempts)
        const perfData = sessions.slice(-10).map(session => ({
          date: new Date(session.completed_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          score: session.score,
          subject: (session.subjects as any)?.name || 'Unknown'
        }));
        setPerformanceData(perfData);

        // Process subject breakdown
        const subjectMap = new Map<string, { attempts: number; totalScore: number }>();
        sessions.forEach(session => {
          const subjectName = (session.subjects as any)?.name || 'Unknown';
          const existing = subjectMap.get(subjectName) || { attempts: 0, totalScore: 0 };
          subjectMap.set(subjectName, {
            attempts: existing.attempts + 1,
            totalScore: existing.totalScore + session.score
          });
        });

        const subjData: SubjectData[] = Array.from(subjectMap.entries()).map(([name, data]) => ({
          name,
          value: data.attempts,
          attempts: data.attempts,
          avgScore: Math.round(data.totalScore / data.attempts)
        }));
        setSubjectData(subjData);

        // Process score distribution
        const distribution = [
          { range: '0-20%', count: 0 },
          { range: '21-40%', count: 0 },
          { range: '41-60%', count: 0 },
          { range: '61-80%', count: 0 },
          { range: '81-100%', count: 0 },
        ];

        sessions.forEach(session => {
          const score = session.score;
          if (score <= 20) distribution[0].count++;
          else if (score <= 40) distribution[1].count++;
          else if (score <= 60) distribution[2].count++;
          else if (score <= 80) distribution[3].count++;
          else distribution[4].count++;
        });
        setScoreDistribution(distribution);

        // Calculate totals
        setTotalAttempts(sessions.length);
        const avgScore = Math.round(
          sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
        );
        setAverageScore(avgScore);

      } catch (error) {
        console.error('Error fetching quiz stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isAuthenticated]);

  return {
    performanceData,
    subjectData,
    scoreDistribution,
    totalAttempts,
    averageScore,
    loading
  };
};
