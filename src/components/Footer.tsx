import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">StudyLane</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your comprehensive platform for web development testing and skill assessment.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  HTML Tests
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  CSS Challenges
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  JavaScript Quizzes
                </Link>
              </li>
              <li>
                <Link to="/student-performance" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Progress Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Help Center
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Documentation
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  Contact Us
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  FAQ
                </span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Connect</h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} StudyLane. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
