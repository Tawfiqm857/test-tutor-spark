import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTest } from '@/contexts/TestContext';
import { 
  GraduationCap, 
  Clock, 
  BookOpen, 
  Play, 
  Target, 
  CheckCircle,
  AlertCircle,
  Trophy
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Exams: React.FC = () => {
  const { tests, getTestProgress } = useTest();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const subjects = ['all', ...new Set(tests.map(t => t.subject))];
  
  const filteredTests = selectedSubject === 'all' 
    ? tests 
    : tests.filter(t => t.subject === selectedSubject);

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'HTML': { bg: 'bg-orange-500/10', text: 'text-orange-500' },
      'CSS': { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      'JavaScript': { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
      'UI/UX Design': { bg: 'bg-purple-500/10', text: 'text-purple-500' },
      'Data Analysis': { bg: 'bg-green-500/10', text: 'text-green-500' },
      'Video Editing': { bg: 'bg-red-500/10', text: 'text-red-500' },
      'Graphics Design': { bg: 'bg-pink-500/10', text: 'text-pink-500' },
      'Digital Marketing': { bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
    };
    return colors[subject] || { bg: 'bg-primary/10', text: 'text-primary' };
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle className="h-4 w-4" />, 
          label: 'Completed', 
          className: 'bg-success/10 text-success border-success/20' 
        };
      case 'in-progress':
        return { 
          icon: <AlertCircle className="h-4 w-4" />, 
          label: 'In Progress', 
          className: 'bg-warning/10 text-warning border-warning/20' 
        };
      default:
        return { 
          icon: <Target className="h-4 w-4" />, 
          label: 'Not Started', 
          className: 'bg-muted text-muted-foreground border-muted' 
        };
    }
  };

  const completedExams = tests.filter(t => getTestProgress(t.id).status === 'completed').length;
  const averageScore = tests.reduce((sum, t) => {
    const progress = getTestProgress(t.id);
    return progress.status === 'completed' ? sum + progress.bestScore : sum;
  }, 0) / (completedExams || 1);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/10">
              <GraduationCap className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold">Exams & Certifications</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Take comprehensive exams to test your knowledge and earn certifications.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available Exams</p>
                  <p className="text-xl font-bold">{tests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{completedExams}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Trophy className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Average Score</p>
                  <p className="text-xl font-bold">{Math.round(averageScore)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium">Filter by subject:</span>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            const progress = getTestProgress(test.id);
            const statusInfo = getStatusInfo(progress.status);
            const subjectColor = getSubjectColor(test.subject);

            return (
              <Card 
                key={test.id} 
                className="group hover:shadow-xl transition-all duration-300 shadow-lg border-0 overflow-hidden"
              >
                <div className={`h-2 ${subjectColor.bg.replace('/10', '')}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{test.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className={`${subjectColor.bg} ${subjectColor.text} border-0`}>
                          {test.subject}
                        </Badge>
                        <Badge className={statusInfo.className}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed line-clamp-2">
                    {test.description}
                  </CardDescription>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
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
                      {progress.status === 'completed' ? 'Retake Exam' : 'Start Exam'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-muted inline-block mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No exams found</h3>
            <p className="text-muted-foreground">
              No exams available for the selected subject.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams;
