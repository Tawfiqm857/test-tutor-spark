import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="JESTUDYLANE" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your comprehensive platform for web development testing, exams, and skill assessment by Joe Express Tech Hub.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Gwagwalada, FCT, Nigeria</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Practice Tests
                </Link>
              </li>
              <li>
                <Link to="/exams" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Take Exams
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/student-performance" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Progress Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Subjects */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Subjects</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-muted-foreground">HTML Fundamentals</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">CSS Styling</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">JavaScript</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">UI/UX Design</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Data Analysis</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Connect With Us</h4>
            <div className="space-y-2">
              <a 
                href="mailto:info@joeexpress.com" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                info@joeexpress.com
              </a>
              <a 
                href="tel:+2348000000000" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                +234 800 000 0000
              </a>
            </div>
            <div className="flex space-x-3 pt-2">
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
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} JESTUDYLANE by Joe Express Tech Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
