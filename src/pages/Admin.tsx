import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mock admin check - in real app this would come from backend
  const isAdmin = user?.email === 'admin@example.com';

  const [settings, setSettings] = useState({
    defaultTestTime: 60,
    maxAttempts: 3,
    passingScore: 70,
    allowRetakes: true,
    showResults: true,
    enableTimeLimits: true,
    maintenanceMode: false
  });

  const [newQuestion, setNewQuestion] = useState({
    subject: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const mockStudents = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', score: 98, tests: 15, lastActive: '2024-01-15' },
    { id: '2', name: 'Bob Chen', email: 'bob@example.com', score: 94, tests: 12, lastActive: '2024-01-14' },
    { id: '3', name: 'Carol Davis', email: 'carol@example.com', score: 89, tests: 10, lastActive: '2024-01-13' },
    { id: '4', name: 'David Wilson', email: 'david@example.com', score: 82, tests: 8, lastActive: '2024-01-12' },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Settings saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question || newQuestion.options.some(opt => !opt)) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Question added',
        description: 'New question has been added successfully.',
      });
      setNewQuestion({
        subject: '',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add question.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage students, tests, and platform settings</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-3xl font-bold text-primary">142</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tests</p>
                      <p className="text-3xl font-bold text-primary">3</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <p className="text-3xl font-bold text-primary">87%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Today</p>
                      <p className="text-3xl font-bold text-primary">28</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>Manage student accounts and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{student.score}% avg</p>
                          <p className="text-sm text-muted-foreground">{student.tests} tests</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Add New Question</CardTitle>
                <CardDescription>Create questions for your tests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newQuestion.subject} onValueChange={(value) => 
                      setNewQuestion(prev => ({ ...prev, subject: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Answer Options</Label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion(prev => ({ ...prev, options: newOptions }));
                        }}
                      />
                      <Button
                        size="sm"
                        variant={newQuestion.correctAnswer === index ? "default" : "outline"}
                        onClick={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                      >
                        Correct
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

                <Button onClick={handleAddQuestion} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Add Question
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Test Management</CardTitle>
                <CardDescription>Configure test settings and timing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">HTML Fundamentals</CardTitle>
                      <CardDescription>50 questions • 60 minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="secondary">Active</Badge>
                        <span className="text-sm text-muted-foreground">142 attempts</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Analytics</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">CSS Styling</CardTitle>
                      <CardDescription>50 questions • 60 minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="secondary">Active</Badge>
                        <span className="text-sm text-muted-foreground">98 attempts</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Analytics</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">JavaScript Basics</CardTitle>
                      <CardDescription>50 questions • 60 minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="secondary">Active</Badge>
                        <span className="text-sm text-muted-foreground">156 attempts</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Analytics</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultTime">Default Test Time (minutes)</Label>
                      <Input
                        id="defaultTime"
                        type="number"
                        value={settings.defaultTestTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, defaultTestTime: parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">Max Attempts per Test</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        value={settings.maxAttempts}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        value={settings.passingScore}
                        onChange={(e) => setSettings(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allowRetakes">Allow Retakes</Label>
                        <p className="text-sm text-muted-foreground">Let students retake failed tests</p>
                      </div>
                      <Switch
                        id="allowRetakes"
                        checked={settings.allowRetakes}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRetakes: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showResults">Show Results Immediately</Label>
                        <p className="text-sm text-muted-foreground">Display results after test completion</p>
                      </div>
                      <Switch
                        id="showResults"
                        checked={settings.showResults}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showResults: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableTimeLimits">Enable Time Limits</Label>
                        <p className="text-sm text-muted-foreground">Enforce time limits on tests</p>
                      </div>
                      <Switch
                        id="enableTimeLimits"
                        checked={settings.enableTimeLimits}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableTimeLimits: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isLoading}>
                    {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Settings
                  </Button>
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