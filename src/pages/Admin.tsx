import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  BookOpen, 
  Clock, 
  Shield, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  FileText,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
  description: string | null;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: string;
  is_active: boolean;
  subject_id: string;
  subjects?: { name: string };
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  is_active: boolean;
  subject_id: string;
  subjects?: { name: string };
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalTests: 0, avgScore: 0, activeToday: 0 });

  const [newQuestion, setNewQuestion] = useState({
    subject_id: '',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    difficulty: 'medium'
  });

  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    subject_id: '',
    duration_minutes: 60,
    passing_score: 70
  });

  // Fetch data on mount
  useEffect(() => {
    if (isAdmin) {
      fetchSubjects();
      fetchQuestions();
      fetchExams();
      fetchStats();
    }
  }, [isAdmin]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase.from('subjects').select('*').order('name');
    if (data) setSubjects(data);
    if (error) console.error('Error fetching subjects:', error);
  };

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*, subjects(name)')
      .order('created_at', { ascending: false });
    if (data) {
      setQuestions(data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
      })));
    }
    if (error) console.error('Error fetching questions:', error);
  };

  const fetchExams = async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*, subjects(name)')
      .order('created_at', { ascending: false });
    if (data) setExams(data);
    if (error) console.error('Error fetching exams:', error);
  };

  const fetchStats = async () => {
    try {
      // Get unique users from quiz_sessions
      const { data: sessions } = await supabase.from('quiz_sessions').select('user_id, score');
      const uniqueUsers = new Set(sessions?.map(s => s.user_id) || []);
      const avgScore = sessions?.length 
        ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length) 
        : 0;

      // Get total tests (quiz sessions)
      const totalTests = sessions?.length || 0;

      setStats({
        totalStudents: uniqueUsers.size,
        totalTests,
        avgScore,
        activeToday: Math.min(uniqueUsers.size, 28) // Mock active today
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text || !newQuestion.subject_id || newQuestion.options.some(opt => !opt)) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('questions').insert({
        subject_id: newQuestion.subject_id,
        question_text: newQuestion.question_text,
        options: newQuestion.options,
        correct_answer: newQuestion.correct_answer,
        explanation: newQuestion.explanation || null,
        difficulty: newQuestion.difficulty,
        created_by: user?.id
      });

      if (error) throw error;

      toast({
        title: 'Question added',
        description: 'New question has been added successfully.',
      });

      setNewQuestion({
        subject_id: '',
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        difficulty: 'medium'
      });

      fetchQuestions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add question.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Question deleted' });
      fetchQuestions();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddExam = async () => {
    if (!newExam.title || !newExam.subject_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('exams').insert({
        title: newExam.title,
        description: newExam.description || null,
        subject_id: newExam.subject_id,
        duration_minutes: newExam.duration_minutes,
        passing_score: newExam.passing_score,
        created_by: user?.id
      });

      if (error) throw error;

      toast({
        title: 'Exam created',
        description: 'New exam has been created successfully.',
      });

      setNewExam({
        title: '',
        description: '',
        subject_id: '',
        duration_minutes: 60,
        passing_score: 70
      });

      fetchExams();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create exam.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    try {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Exam deleted' });
      fetchExams();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleExamStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('exams').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast({ title: currentStatus ? 'Exam deactivated' : 'Exam activated' });
      fetchExams();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/30 to-background">
        <Card className="max-w-md shadow-lg border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage questions, exams, and platform content</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Questions</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Exams</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalStudents}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-accent/10 to-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tests Taken</p>
                      <p className="text-3xl font-bold text-accent">{stats.totalTests}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-accent/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-success/10 to-success/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <p className="text-3xl font-bold text-success">{stats.avgScore}%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-success/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-warning/10 to-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="text-3xl font-bold text-warning">{questions.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-warning/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Platform overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Subjects</p>
                    <p className="text-2xl font-bold">{subjects.length}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Exams</p>
                    <p className="text-2xl font-bold">{exams.filter(e => e.is_active).length}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Questions</p>
                    <p className="text-2xl font-bold">{questions.filter(q => q.is_active).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Question
                </CardTitle>
                <CardDescription>Create questions for tests and exams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select 
                      value={newQuestion.subject_id} 
                      onValueChange={(value) => setNewQuestion(prev => ({ ...prev, subject_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select 
                      value={newQuestion.difficulty} 
                      onValueChange={(value) => setNewQuestion(prev => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question..."
                    value={newQuestion.question_text}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Answer Options * (click "Correct" to mark the right answer)</Label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-8 text-center text-muted-foreground font-medium">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant={newQuestion.correct_answer === index ? "default" : "outline"}
                        onClick={() => setNewQuestion(prev => ({ ...prev, correct_answer: index }))}
                        className={newQuestion.correct_answer === index ? "bg-success hover:bg-success/90" : ""}
                      >
                        {newQuestion.correct_answer === index ? "✓ Correct" : "Correct"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation (optional)</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Explain why this is the correct answer..."
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  />
                </div>

                <Button onClick={handleAddQuestion} disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Add Question
                </Button>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Existing Questions ({questions.length})</CardTitle>
                <CardDescription>Manage your question bank</CardDescription>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No questions added yet. Add your first question above!</p>
                ) : (
                  <div className="space-y-4">
                    {questions.slice(0, 10).map((question) => (
                      <div key={question.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium line-clamp-2">{question.question_text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">{question.subjects?.name || 'Unknown'}</Badge>
                              <Badge variant="outline" className="capitalize">{question.difficulty}</Badge>
                              {question.is_active ? (
                                <Badge className="bg-success/10 text-success border-0">Active</Badge>
                              ) : (
                                <Badge variant="outline">Inactive</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {questions.length > 10 && (
                      <p className="text-center text-muted-foreground">Showing 10 of {questions.length} questions</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Exam
                </CardTitle>
                <CardDescription>Set up a new exam for students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="examTitle">Exam Title *</Label>
                    <Input
                      id="examTitle"
                      placeholder="e.g., HTML Fundamentals Final Exam"
                      value={newExam.title}
                      onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="examSubject">Subject *</Label>
                    <Select 
                      value={newExam.subject_id} 
                      onValueChange={(value) => setNewExam(prev => ({ ...prev, subject_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examDescription">Description</Label>
                  <Textarea
                    id="examDescription"
                    placeholder="Describe what this exam covers..."
                    value={newExam.description}
                    onChange={(e) => setNewExam(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={10}
                      max={180}
                      value={newExam.duration_minutes}
                      onChange={(e) => setNewExam(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min={0}
                      max={100}
                      value={newExam.passing_score}
                      onChange={(e) => setNewExam(prev => ({ ...prev, passing_score: parseInt(e.target.value) || 70 }))}
                    />
                  </div>
                </div>

                <Button onClick={handleAddExam} disabled={isLoading} size="lg">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Exam
                </Button>
              </CardContent>
            </Card>

            {/* Exams List */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Existing Exams ({exams.length})</CardTitle>
                <CardDescription>Manage your exams</CardDescription>
              </CardHeader>
              <CardContent>
                {exams.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No exams created yet. Create your first exam above!</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exams.map((exam) => (
                      <Card key={exam.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{exam.title}</CardTitle>
                              <CardDescription>{exam.subjects?.name || 'Unknown Subject'}</CardDescription>
                            </div>
                            <Switch
                              checked={exam.is_active}
                              onCheckedChange={() => handleToggleExamStatus(exam.id, exam.is_active)}
                            />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <p>Duration: {exam.duration_minutes} minutes</p>
                            <p>Passing Score: {exam.passing_score}%</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={exam.is_active ? "default" : "secondary"}>
                              {exam.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-4 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteExam(exam.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Admin Information</CardTitle>
                <CardDescription>Your admin account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Logged in as</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-success" />
                    <p className="font-medium text-success">Admin Access Granted</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">You have full access to manage the platform.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
