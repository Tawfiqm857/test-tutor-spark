import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Code, Palette, Zap, Users, Trophy, ArrowRight, CheckCircle } from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: 'HTML Mastery',
      description: 'Test your knowledge of HTML elements, attributes, and semantic markup.',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: 'CSS Styling',
      description: 'Evaluate your CSS skills including layout, animations, and responsive design.',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'JavaScript Logic',
      description: 'Challenge yourself with JavaScript fundamentals and modern ES6+ features.',
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  const stats = [
    { icon: <Users className="h-6 w-6" />, label: 'Active Students', value: '2,500+' },
    { icon: <BookOpen className="h-6 w-6" />, label: 'Practice Tests', value: '50+' },
    { icon: <Trophy className="h-6 w-6" />, label: 'Completed Tests', value: '10,000+' },
  ];

  const benefits = [
    'Comprehensive question bank',
    'Instant feedback and explanations',
    'Track your progress over time',
    'Compare with other students',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              Start learning for free
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Master Web Development with
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent block mt-2">
                StudyLane
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Test your HTML, CSS, and JavaScript skills with our comprehensive assessment platform. 
              Track your progress and become a better web developer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="text-lg px-8 h-12">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 h-12">
                    <Link to="/signup">
                      Start Learning Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 h-12">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform covers all essential web development technologies with interactive tests and instant feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-2xl ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-accent/10 text-accent">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose StudyLane?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of students who have improved their web development skills using our platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-success/10">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="p-8 shadow-xl border-0 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="text-center space-y-6">
                <div className="p-4 rounded-2xl bg-primary/10 inline-block">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Ready to Get Started?</h3>
                <p className="text-muted-foreground">
                  Create your free account and start practicing today.
                </p>
                {!isAuthenticated && (
                  <Button asChild size="lg" className="w-full">
                    <Link to="/signup">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Test Your Skills?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of students improving their web development skills every day.
            </p>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-12">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
