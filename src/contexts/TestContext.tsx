import React, { createContext, useContext, useState, useEffect } from 'react';
import { backend as supabase } from '@/integrations/backend/client';
import { useAuth } from './AuthContext';

// ... keep existing interfaces for questions and results ...

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Test {
  id: string;
  title: string;
  subject: 'HTML' | 'CSS' | 'JavaScript' | 'UI/UX Design' | 'Data Analysis' | 'Video Editing' | 'Graphics Design' | 'Digital Marketing';
  description: string;
  questions: Question[];
  timeLimit: number; // in minutes
}

export interface TestAttempt {
  testId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, number>;
  completedAt: Date;
}

export interface TestProgress {
  testId: string;
  attempts: number;
  bestScore: number;
  lastAttemptDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface TestContextType {
  tests: Test[];
  testProgress: Record<string, TestProgress>;
  currentTest: Test | null;
  currentAnswers: Record<string, number>;
  startTest: (testId: string) => void;
  submitAnswer: (questionId: string, answer: number) => void;
  submitTest: () => Promise<TestAttempt | null>;
  resetCurrentTest: () => void;
  getTestProgress: (testId: string) => TestProgress;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};

// Mock test data - 50 questions per subject for comprehensive learning
const mockTests: Test[] = [
  {
    id: 'html-basics',
    title: 'HTML Fundamentals',
    subject: 'HTML',
    description: 'Test your knowledge of HTML basics, elements, and structure with 50 comprehensive questions.',
    timeLimit: 60,
    questions: [
      // Basic HTML Questions (1-20)
      {
        id: 'q1',
        question: 'What does HTML stand for?',
        options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
        correctAnswer: 0,
        explanation: 'HTML stands for Hyper Text Markup Language.'
      },
      {
        id: 'q2',
        question: 'Which HTML element is used to define the structure of an HTML document?',
        options: ['<body>', '<html>', '<head>', '<div>'],
        correctAnswer: 1,
        explanation: 'The <html> element is the root element that contains all other HTML elements.'
      },
      {
        id: 'q3',
        question: 'Which HTML element is used for the largest heading?',
        options: ['<h6>', '<h1>', '<header>', '<heading>'],
        correctAnswer: 1,
        explanation: 'The <h1> element represents the largest/most important heading.'
      },
      {
        id: 'q4',
        question: 'Which HTML element is used to create a hyperlink?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correctAnswer: 1,
        explanation: 'The <a> (anchor) element is used to create hyperlinks.'
      },
      {
        id: 'q5',
        question: 'Which attribute is used to specify the URL in a hyperlink?',
        options: ['src', 'link', 'href', 'url'],
        correctAnswer: 2,
        explanation: 'The href attribute specifies the URL that the link goes to.'
      },
      {
        id: 'q6',
        question: 'Which HTML element is used to display an image?',
        options: ['<image>', '<img>', '<picture>', '<photo>'],
        correctAnswer: 1,
        explanation: 'The <img> element is used to embed images in HTML documents.'
      },
      {
        id: 'q7',
        question: 'Which HTML element creates a line break?',
        options: ['<break>', '<br>', '<lb>', '<newline>'],
        correctAnswer: 1,
        explanation: 'The <br> element creates a line break in HTML.'
      },
      {
        id: 'q8',
        question: 'Which HTML attribute specifies alternative text for an image?',
        options: ['title', 'alt', 'description', 'caption'],
        correctAnswer: 1,
        explanation: 'The alt attribute provides alternative text for images, important for accessibility.'
      },
      {
        id: 'q9',
        question: 'Which HTML element is used to create an unordered list?',
        options: ['<ol>', '<ul>', '<list>', '<items>'],
        correctAnswer: 1,
        explanation: 'The <ul> element creates an unordered (bulleted) list.'
      },
      {
        id: 'q10',
        question: 'Which HTML5 element is used for navigation links?',
        options: ['<navigation>', '<nav>', '<menu>', '<links>'],
        correctAnswer: 1,
        explanation: 'The <nav> element is used to define navigation links in HTML5.'
      },
      // Intermediate Questions (11-30)
      {
        id: 'q11',
        question: 'Which HTML element is used to create a table?',
        options: ['<table>', '<tab>', '<grid>', '<data>'],
        correctAnswer: 0,
        explanation: 'The <table> element is used to create tables in HTML.'
      },
      {
        id: 'q12',
        question: 'Which attribute makes an input field required?',
        options: ['mandatory', 'required', 'needed', 'must'],
        correctAnswer: 1,
        explanation: 'The required attribute makes an input field mandatory to fill.'
      },
      {
        id: 'q13',
        question: 'Which HTML element defines the document type?',
        options: ['<doctype>', '<!DOCTYPE>', '<html>', '<meta>'],
        correctAnswer: 1,
        explanation: '<!DOCTYPE> declaration defines the document type and HTML version.'
      },
      {
        id: 'q14',
        question: 'Which HTML element is used for emphasized text?',
        options: ['<strong>', '<em>', '<i>', '<bold>'],
        correctAnswer: 1,
        explanation: 'The <em> element is used for emphasized text with semantic meaning.'
      },
      {
        id: 'q15',
        question: 'Which attribute specifies the character encoding?',
        options: ['encoding', 'charset', 'character-set', 'char-encoding'],
        correctAnswer: 1,
        explanation: 'The charset attribute specifies the character encoding for the HTML document.'
      },
      {
        id: 'q16',
        question: 'Which HTML element creates a horizontal rule?',
        options: ['<hr>', '<line>', '<rule>', '<horizontal>'],
        correctAnswer: 0,
        explanation: 'The <hr> element creates a horizontal rule (line) in HTML.'
      },
      {
        id: 'q17',
        question: 'Which HTML element is used for inline styling?',
        options: ['<style>', '<css>', '<span>', '<inline>'],
        correctAnswer: 2,
        explanation: 'The <span> element is used for inline styling and grouping.'
      },
      {
        id: 'q18',
        question: 'Which attribute is used to merge table cells horizontally?',
        options: ['rowspan', 'colspan', 'merge', 'span'],
        correctAnswer: 1,
        explanation: 'The colspan attribute merges table cells horizontally.'
      },
      {
        id: 'q19',
        question: 'Which HTML element represents a section of a page?',
        options: ['<div>', '<section>', '<part>', '<area>'],
        correctAnswer: 1,
        explanation: 'The <section> element represents a distinct section of a document.'
      },
      {
        id: 'q20',
        question: 'Which HTML element is used for user input?',
        options: ['<input>', '<field>', '<form>', '<data>'],
        correctAnswer: 0,
        explanation: 'The <input> element is used to create input fields for user data.'
      },
      // Advanced Questions (21-40)
      {
        id: 'q21',
        question: 'Which HTML5 element is used for audio content?',
        options: ['<sound>', '<audio>', '<music>', '<media>'],
        correctAnswer: 1,
        explanation: 'The <audio> element is used to embed audio content in HTML5.'
      },
      {
        id: 'q22',
        question: 'Which HTML5 element is used for video content?',
        options: ['<movie>', '<video>', '<film>', '<media>'],
        correctAnswer: 1,
        explanation: 'The <video> element is used to embed video content in HTML5.'
      },
      {
        id: 'q23',
        question: 'Which attribute makes a link open in a new window?',
        options: ['window="new"', 'target="_blank"', 'new="true"', 'open="new"'],
        correctAnswer: 1,
        explanation: 'The target="_blank" attribute makes a link open in a new window or tab.'
      },
      {
        id: 'q24',
        question: 'Which HTML element groups form elements?',
        options: ['<group>', '<fieldset>', '<form-group>', '<field-group>'],
        correctAnswer: 1,
        explanation: 'The <fieldset> element is used to group related form elements.'
      },
      {
        id: 'q25',
        question: 'Which HTML element provides a caption for a fieldset?',
        options: ['<caption>', '<legend>', '<title>', '<label>'],
        correctAnswer: 1,
        explanation: 'The <legend> element provides a caption for a <fieldset> element.'
      },
      {
        id: 'q26',
        question: 'Which HTML5 input type is used for email addresses?',
        options: ['type="mail"', 'type="email"', 'type="e-mail"', 'type="address"'],
        correctAnswer: 1,
        explanation: 'The input type="email" is used for email address input fields.'
      },
      {
        id: 'q27',
        question: 'Which HTML element represents quoted text?',
        options: ['<quote>', '<q>', '<cite>', '<quotation>'],
        correctAnswer: 1,
        explanation: 'The <q> element represents a short inline quotation.'
      },
      {
        id: 'q28',
        question: 'Which HTML attribute specifies the language of the element content?',
        options: ['language', 'lang', 'locale', 'xml:lang'],
        correctAnswer: 1,
        explanation: 'The lang attribute specifies the language of the element content.'
      },
      {
        id: 'q29',
        question: 'Which HTML element defines contact information?',
        options: ['<contact>', '<address>', '<info>', '<details>'],
        correctAnswer: 1,
        explanation: 'The <address> element defines contact information for the author/owner.'
      },
      {
        id: 'q30',
        question: 'Which HTML element represents a disclosure widget?',
        options: ['<details>', '<summary>', '<disclosure>', '<toggle>'],
        correctAnswer: 0,
        explanation: 'The <details> element represents a disclosure widget from which the user can obtain additional information.'
      },
      // Expert Questions (31-50)
      {
        id: 'q31',
        question: 'Which HTML attribute indicates that an element is draggable?',
        options: ['drag="true"', 'draggable="true"', 'movable="true"', 'dragdrop="true"'],
        correctAnswer: 1,
        explanation: 'The draggable="true" attribute makes an element draggable.'
      },
      {
        id: 'q32',
        question: 'Which HTML5 element represents the result of a calculation?',
        options: ['<result>', '<output>', '<calculation>', '<compute>'],
        correctAnswer: 1,
        explanation: 'The <output> element represents the result of a calculation or user action.'
      },
      {
        id: 'q33',
        question: 'Which HTML element represents a progress indicator?',
        options: ['<progress>', '<meter>', '<gauge>', '<indicator>'],
        correctAnswer: 0,
        explanation: 'The <progress> element represents the progress of a task.'
      },
      {
        id: 'q34',
        question: 'Which HTML element represents a scalar measurement within a known range?',
        options: ['<progress>', '<meter>', '<gauge>', '<scale>'],
        correctAnswer: 1,
        explanation: 'The <meter> element represents a scalar measurement within a known range, or a fractional value.'
      },
      {
        id: 'q35',
        question: 'Which HTML attribute provides additional information about an element?',
        options: ['info', 'title', 'tooltip', 'description'],
        correctAnswer: 1,
        explanation: 'The title attribute provides additional information about an element, often displayed as a tooltip.'
      },
      {
        id: 'q36',
        question: 'Which HTML element represents machine-readable data?',
        options: ['<data>', '<time>', '<machine>', '<readable>'],
        correctAnswer: 0,
        explanation: 'The <data> element links a piece of content with a machine-readable translation.'
      },
      {
        id: 'q37',
        question: 'Which HTML5 element represents a date/time?',
        options: ['<date>', '<time>', '<datetime>', '<timestamp>'],
        correctAnswer: 1,
        explanation: 'The <time> element represents a specific period in time.'
      },
      {
        id: 'q38',
        question: 'Which HTML attribute specifies the relationship between documents?',
        options: ['relation', 'rel', 'relationship', 'link-type'],
        correctAnswer: 1,
        explanation: 'The rel attribute specifies the relationship between the current document and the linked document.'
      },
      {
        id: 'q39',
        question: 'Which HTML element represents a sidebar?',
        options: ['<sidebar>', '<aside>', '<side>', '<secondary>'],
        correctAnswer: 1,
        explanation: 'The <aside> element represents content aside from the main content (like a sidebar).'
      },
      {
        id: 'q40',
        question: 'Which HTML element represents the header of a section?',
        options: ['<head>', '<header>', '<top>', '<section-header>'],
        correctAnswer: 1,
        explanation: 'The <header> element represents introductory content or a set of navigational aids.'
      },
      {
        id: 'q41',
        question: 'Which HTML element represents the footer of a section?',
        options: ['<foot>', '<footer>', '<bottom>', '<section-footer>'],
        correctAnswer: 1,
        explanation: 'The <footer> element represents a footer for its nearest sectioning content.'
      },
      {
        id: 'q42',
        question: 'Which HTML attribute specifies that an input field should automatically get focus?',
        options: ['focus', 'autofocus', 'auto-focus', 'default-focus'],
        correctAnswer: 1,
        explanation: 'The autofocus attribute specifies that an input field should automatically get focus when the page loads.'
      },
      {
        id: 'q43',
        question: 'Which HTML attribute specifies that multiple files can be selected?',
        options: ['multiple', 'multi', 'many', 'several'],
        correctAnswer: 0,
        explanation: 'The multiple attribute allows the user to select more than one file.'
      },
      {
        id: 'q44',
        question: 'Which HTML element represents preformatted text?',
        options: ['<pre>', '<code>', '<format>', '<text>'],
        correctAnswer: 0,
        explanation: 'The <pre> element represents preformatted text with preserved whitespace.'
      },
      {
        id: 'q45',
        question: 'Which HTML element represents computer code?',
        options: ['<pre>', '<code>', '<program>', '<script>'],
        correctAnswer: 1,
        explanation: 'The <code> element represents a fragment of computer code.'
      },
      {
        id: 'q46',
        question: 'Which HTML element represents sample output from a computer program?',
        options: ['<output>', '<samp>', '<result>', '<example>'],
        correctAnswer: 1,
        explanation: 'The <samp> element represents sample output from a computer program.'
      },
      {
        id: 'q47',
        question: 'Which HTML element represents user input?',
        options: ['<input>', '<kbd>', '<user>', '<key>'],
        correctAnswer: 1,
        explanation: 'The <kbd> element represents user input (typically keyboard input).'
      },
      {
        id: 'q48',
        question: 'Which HTML element represents a variable in a mathematical expression?',
        options: ['<var>', '<variable>', '<math>', '<expression>'],
        correctAnswer: 0,
        explanation: 'The <var> element represents a variable in a mathematical expression or programming context.'
      },
      {
        id: 'q49',
        question: 'Which HTML attribute specifies that the element content is editable?',
        options: ['editable', 'contenteditable', 'edit', 'modify'],
        correctAnswer: 1,
        explanation: 'The contenteditable attribute specifies whether the content of an element is editable.'
      },
      {
        id: 'q50',
        question: 'Which HTML element represents a container for SVG graphics?',
        options: ['<svg>', '<graphics>', '<vector>', '<drawing>'],
        correctAnswer: 0,
        explanation: 'The <svg> element is used to define a container for SVG graphics.'
      }
    ]
  },
  {
    id: 'css-styling',
    title: 'CSS Styling & Layout',
    subject: 'CSS',
    description: 'Evaluate your understanding of CSS properties, selectors, and layout techniques with 50 comprehensive questions.',
    timeLimit: 60,
    questions: [
      // Basic CSS Questions (1-20)
      {
        id: 'q1',
        question: 'What does CSS stand for?',
        options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
        correctAnswer: 1,
        explanation: 'CSS stands for Cascading Style Sheets.'
      },
      {
        id: 'q2',
        question: 'Which CSS property is used to change the text color?',
        options: ['font-color', 'text-color', 'color', 'foreground-color'],
        correctAnswer: 2,
        explanation: 'The color property is used to set the color of text.'
      },
      {
        id: 'q3',
        question: 'Which CSS property is used to make text bold?',
        options: ['font-weight', 'text-weight', 'font-style', 'text-style'],
        correctAnswer: 0,
        explanation: 'The font-weight property is used to make text bold or specify the weight of the font.'
      },
      {
        id: 'q4',
        question: 'How do you select an element with id "header" in CSS?',
        options: ['.header', '#header', '*header', 'header'],
        correctAnswer: 1,
        explanation: 'The # symbol is used to select elements by their id attribute.'
      },
      {
        id: 'q5',
        question: 'Which CSS property is used to control the spacing between elements?',
        options: ['spacing', 'margin', 'padding', 'border'],
        correctAnswer: 1,
        explanation: 'The margin property controls the space around elements (outside the border).'
      },
      {
        id: 'q6',
        question: 'Which CSS property sets the background color?',
        options: ['bg-color', 'background-color', 'color-background', 'background'],
        correctAnswer: 1,
        explanation: 'The background-color property sets the background color of an element.'
      },
      {
        id: 'q7',
        question: 'How do you select all elements with class "button"?',
        options: ['#button', '.button', '*button', 'button'],
        correctAnswer: 1,
        explanation: 'The . (dot) symbol is used to select elements by their class attribute.'
      },
      {
        id: 'q8',
        question: 'Which CSS property is used to create rounded corners?',
        options: ['corner-radius', 'border-radius', 'radius', 'round-corners'],
        correctAnswer: 1,
        explanation: 'The border-radius property creates rounded corners on elements.'
      },
      {
        id: 'q9',
        question: 'Which CSS property controls the transparency of an element?',
        options: ['transparency', 'opacity', 'alpha', 'visibility'],
        correctAnswer: 1,
        explanation: 'The opacity property controls the transparency level of an element.'
      },
      {
        id: 'q10',
        question: 'Which CSS property creates a grid container?',
        options: ['display: grid', 'grid-template', 'grid-container', 'layout: grid'],
        correctAnswer: 0,
        explanation: 'Setting display: grid creates a grid container.'
      },
      // Intermediate CSS Questions (11-30)
      {
        id: 'q11',
        question: 'Which CSS property creates a flexbox container?',
        options: ['display: flex', 'flex-container', 'layout: flex', 'flexbox: true'],
        correctAnswer: 0,
        explanation: 'Setting display: flex creates a flexbox container.'
      },
      {
        id: 'q12',
        question: 'Which CSS property controls the space inside an element?',
        options: ['margin', 'padding', 'spacing', 'inner-space'],
        correctAnswer: 1,
        explanation: 'The padding property controls the space inside an element (between content and border).'
      },
      {
        id: 'q13',
        question: 'Which CSS pseudo-class selects the first child element?',
        options: [':first', ':first-child', ':child-first', ':initial'],
        correctAnswer: 1,
        explanation: 'The :first-child pseudo-class selects the first child element.'
      },
      {
        id: 'q14',
        question: 'Which CSS property positions an element relative to its normal position?',
        options: ['position: relative', 'position: absolute', 'position: fixed', 'position: static'],
        correctAnswer: 0,
        explanation: 'position: relative positions an element relative to its normal position.'
      },
      {
        id: 'q15',
        question: 'Which CSS property makes an element invisible but still takes up space?',
        options: ['display: none', 'visibility: hidden', 'opacity: 0', 'hide: true'],
        correctAnswer: 1,
        explanation: 'visibility: hidden makes an element invisible but it still takes up space in the layout.'
      },
      {
        id: 'q16',
        question: 'Which CSS property changes the cursor when hovering over an element?',
        options: ['cursor', 'pointer', 'mouse', 'hover-cursor'],
        correctAnswer: 0,
        explanation: 'The cursor property changes the mouse cursor when hovering over an element.'
      },
      {
        id: 'q17',
        question: 'Which CSS property controls the vertical alignment of inline elements?',
        options: ['align', 'vertical-align', 'valign', 'text-align'],
        correctAnswer: 1,
        explanation: 'The vertical-align property controls the vertical alignment of inline elements.'
      },
      {
        id: 'q18',
        question: 'Which CSS property creates a shadow behind an element?',
        options: ['shadow', 'box-shadow', 'element-shadow', 'drop-shadow'],
        correctAnswer: 1,
        explanation: 'The box-shadow property creates a shadow behind an element.'
      },
      {
        id: 'q19',
        question: 'Which CSS property controls the stacking order of elements?',
        options: ['z-index', 'stack-order', 'layer', 'depth'],
        correctAnswer: 0,
        explanation: 'The z-index property controls the stacking order of positioned elements.'
      },
      {
        id: 'q20',
        question: 'Which CSS property creates a transition effect?',
        options: ['transition', 'animation', 'effect', 'transform'],
        correctAnswer: 0,
        explanation: 'The transition property creates smooth transition effects between property changes.'
      },
      // Advanced CSS Questions (21-40)
      {
        id: 'q21',
        question: 'Which CSS function is used for 2D transformations?',
        options: ['transform2d()', 'transform()', 'rotate()', 'scale()'],
        correctAnswer: 1,
        explanation: 'The transform() function is used for 2D and 3D transformations.'
      },
      {
        id: 'q22',
        question: 'Which CSS property controls the order of flex items?',
        options: ['flex-order', 'order', 'flex-sequence', 'item-order'],
        correctAnswer: 1,
        explanation: 'The order property controls the order of flex items without changing the HTML.'
      },
      {
        id: 'q23',
        question: 'Which CSS property makes a flex item grow to fill available space?',
        options: ['flex-grow', 'flex-expand', 'grow', 'expand'],
        correctAnswer: 0,
        explanation: 'The flex-grow property makes a flex item grow to fill available space.'
      },
      {
        id: 'q24',
        question: 'Which CSS property creates a CSS animation?',
        options: ['animate', 'animation', 'keyframes', 'motion'],
        correctAnswer: 1,
        explanation: 'The animation property creates CSS animations using keyframes.'
      },
      {
        id: 'q25',
        question: 'Which CSS rule defines animation keyframes?',
        options: ['@animation', '@keyframes', '@frames', '@animate'],
        correctAnswer: 1,
        explanation: 'The @keyframes rule defines the animation sequence.'
      },
      {
        id: 'q26',
        question: 'Which CSS property controls how background images are repeated?',
        options: ['background-repeat', 'bg-repeat', 'repeat', 'image-repeat'],
        correctAnswer: 0,
        explanation: 'The background-repeat property controls how background images are repeated.'
      },
      {
        id: 'q27',
        question: 'Which CSS property controls the size of background images?',
        options: ['background-size', 'bg-size', 'image-size', 'background-scale'],
        correctAnswer: 0,
        explanation: 'The background-size property controls the size of background images.'
      },
      {
        id: 'q28',
        question: 'Which CSS property creates a gradient background?',
        options: ['gradient', 'background-gradient', 'background-image', 'linear-gradient'],
        correctAnswer: 2,
        explanation: 'Gradients are created using the background-image property with gradient functions.'
      },
      {
        id: 'q29',
        question: 'Which CSS property controls text overflow behavior?',
        options: ['text-overflow', 'overflow-text', 'text-wrap', 'word-wrap'],
        correctAnswer: 0,
        explanation: 'The text-overflow property controls how overflowed text is displayed.'
      },
      {
        id: 'q30',
        question: 'Which CSS property creates space between columns in a multi-column layout?',
        options: ['column-gap', 'column-spacing', 'gap', 'column-margin'],
        correctAnswer: 0,
        explanation: 'The column-gap property creates space between columns.'
      },
      // Expert CSS Questions (31-50)
      {
        id: 'q31',
        question: 'Which CSS property controls how an element is positioned in the grid?',
        options: ['grid-position', 'grid-area', 'grid-place', 'grid-location'],
        correctAnswer: 1,
        explanation: 'The grid-area property controls how an element is positioned in the grid.'
      },
      {
        id: 'q32',
        question: 'Which CSS property creates CSS custom properties (variables)?',
        options: ['--variable', 'var()', 'custom-property', '@variable'],
        correctAnswer: 0,
        explanation: 'CSS custom properties are defined using the -- prefix.'
      },
      {
        id: 'q33',
        question: 'Which CSS function accesses custom property values?',
        options: ['get()', 'var()', 'custom()', 'property()'],
        correctAnswer: 1,
        explanation: 'The var() function is used to access custom property values.'
      },
      {
        id: 'q34',
        question: 'Which CSS property controls the behavior of scrollable content?',
        options: ['scroll-behavior', 'scroll-style', 'overflow-behavior', 'scroll-mode'],
        correctAnswer: 0,
        explanation: 'The scroll-behavior property controls the scrolling behavior.'
      },
      {
        id: 'q35',
        question: 'Which CSS property creates a clip path for an element?',
        options: ['clip-path', 'clip', 'mask', 'shape'],
        correctAnswer: 0,
        explanation: 'The clip-path property creates a clipping region to show only part of an element.'
      },
      {
        id: 'q36',
        question: 'Which CSS property controls the aspect ratio of an element?',
        options: ['aspect-ratio', 'ratio', 'width-height-ratio', 'proportion'],
        correctAnswer: 0,
        explanation: 'The aspect-ratio property controls the preferred aspect ratio of an element.'
      },
      {
        id: 'q37',
        question: 'Which CSS property controls the writing direction?',
        options: ['direction', 'writing-mode', 'text-direction', 'flow'],
        correctAnswer: 1,
        explanation: 'The writing-mode property controls the writing direction and text flow.'
      },
      {
        id: 'q38',
        question: 'Which CSS property controls how white space is handled?',
        options: ['white-space', 'space-handling', 'whitespace-mode', 'text-space'],
        correctAnswer: 0,
        explanation: 'The white-space property controls how white space inside an element is handled.'
      },
      {
        id: 'q39',
        question: 'Which CSS property controls the space between lines of text?',
        options: ['line-height', 'line-spacing', 'text-height', 'row-height'],
        correctAnswer: 0,
        explanation: 'The line-height property controls the space between lines of text.'
      },
      {
        id: 'q40',
        question: 'Which CSS property controls letter spacing?',
        options: ['letter-spacing', 'char-spacing', 'character-spacing', 'text-spacing'],
        correctAnswer: 0,
        explanation: 'The letter-spacing property controls the space between characters.'
      },
      {
        id: 'q41',
        question: 'Which CSS property controls word spacing?',
        options: ['word-spacing', 'word-gap', 'text-word-spacing', 'space-between-words'],
        correctAnswer: 0,
        explanation: 'The word-spacing property controls the space between words.'
      },
      {
        id: 'q42',
        question: 'Which CSS property creates a filter effect?',
        options: ['filter', 'effect', 'image-filter', 'visual-effect'],
        correctAnswer: 0,
        explanation: 'The filter property creates visual effects like blur, brightness, etc.'
      },
      {
        id: 'q43',
        question: 'Which CSS property controls the blending mode of elements?',
        options: ['blend-mode', 'mix-blend-mode', 'blending', 'layer-blend'],
        correctAnswer: 1,
        explanation: 'The mix-blend-mode property controls how an element blends with its background.'
      },
      {
        id: 'q44',
        question: 'Which CSS property creates a backdrop filter?',
        options: ['backdrop-filter', 'background-filter', 'behind-filter', 'layer-filter'],
        correctAnswer: 0,
        explanation: 'The backdrop-filter property creates filter effects for the area behind an element.'
      },
      {
        id: 'q45',
        question: 'Which CSS property controls the shape of a list marker?',
        options: ['list-style-type', 'marker-style', 'bullet-style', 'list-marker'],
        correctAnswer: 0,
        explanation: 'The list-style-type property controls the shape of list markers.'
      },
      {
        id: 'q46',
        question: 'Which CSS property controls the position of a list marker?',
        options: ['list-style-position', 'marker-position', 'bullet-position', 'list-position'],
        correctAnswer: 0,
        explanation: 'The list-style-position property controls whether list markers are inside or outside the content.'
      },
      {
        id: 'q47',
        question: 'Which CSS property controls the counter increment?',
        options: ['counter-increment', 'increment', 'counter-add', 'count-increment'],
        correctAnswer: 0,
        explanation: 'The counter-increment property increases or decreases CSS counter values.'
      },
      {
        id: 'q48',
        question: 'Which CSS property displays counter values?',
        options: ['counter()', 'content', 'counter-display', 'show-counter'],
        correctAnswer: 1,
        explanation: 'The content property with counter() function displays counter values.'
      },
      {
        id: 'q49',
        question: 'Which CSS property controls the resize behavior of an element?',
        options: ['resize', 'resizable', 'resize-mode', 'user-resize'],
        correctAnswer: 0,
        explanation: 'The resize property controls whether and how an element can be resized by the user.'
      },
      {
        id: 'q50',
        question: 'Which CSS property controls user interaction with an element?',
        options: ['user-select', 'pointer-events', 'user-interaction', 'interactive'],
        correctAnswer: 1,
        explanation: 'The pointer-events property controls whether an element can be the target of mouse events.'
      }
    ]
  },
  {
    id: 'js-fundamentals',
    title: 'JavaScript Fundamentals',
    subject: 'JavaScript',
    description: 'Test your knowledge of JavaScript syntax, functions, and programming concepts with 50 comprehensive questions.',
    timeLimit: 60,
    questions: [
      // Basic JavaScript Questions (1-20)
      {
        id: 'q1',
        question: 'Which keyword is used to declare a variable in JavaScript?',
        options: ['var', 'let', 'const', 'All of the above'],
        correctAnswer: 3,
        explanation: 'All three keywords (var, let, const) can be used to declare variables, each with different scoping rules.'
      },
      {
        id: 'q2',
        question: 'How do you create a function in JavaScript?',
        options: ['function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}', 'function = myFunction() {}'],
        correctAnswer: 0,
        explanation: 'Functions in JavaScript are declared using the function keyword followed by the function name.'
      },
      {
        id: 'q3',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'add()', 'append()', 'insert()'],
        correctAnswer: 0,
        explanation: 'The push() method adds one or more elements to the end of an array.'
      },
      {
        id: 'q4',
        question: 'What does the === operator do?',
        options: ['Assignment', 'Equality without type conversion', 'Equality with type conversion', 'Not equal'],
        correctAnswer: 1,
        explanation: 'The === operator checks for strict equality, comparing both value and type without type conversion.'
      },
      {
        id: 'q5',
        question: 'Which method is used to remove the last element from an array?',
        options: ['pop()', 'remove()', 'delete()', 'removeLast()'],
        correctAnswer: 0,
        explanation: 'The pop() method removes and returns the last element from an array.'
      },
      {
        id: 'q6',
        question: 'How do you write a comment in JavaScript?',
        options: ['# This is a comment', '// This is a comment', '<!-- This is a comment -->', '* This is a comment'],
        correctAnswer: 1,
        explanation: 'Single-line comments in JavaScript start with //.'
      },
      {
        id: 'q7',
        question: 'Which operator is used to concatenate strings in JavaScript?',
        options: ['+', '&', '*', 'concat'],
        correctAnswer: 0,
        explanation: 'The + operator is used to concatenate strings in JavaScript.'
      },
      {
        id: 'q8',
        question: 'What will console.log(typeof null) output?',
        options: ['null', 'undefined', 'object', 'boolean'],
        correctAnswer: 2,
        explanation: 'This is a known quirk in JavaScript where typeof null returns "object".'
      },
      {
        id: 'q9',
        question: 'What is the result of 3 + "3" in JavaScript?',
        options: ['6', '33', 'Error', 'undefined'],
        correctAnswer: 1,
        explanation: 'JavaScript converts the number 3 to a string and concatenates, resulting in "33".'
      },
      {
        id: 'q10',
        question: 'What is a closure in JavaScript?',
        options: ['A way to close files', 'A function with access to its outer scope', 'A type of loop', 'A way to end programs'],
        correctAnswer: 1,
        explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function returns.'
      },
      // Intermediate JavaScript Questions (11-30)
      {
        id: 'q11',
        question: 'Which method is used to iterate over an array?',
        options: ['forEach()', 'iterate()', 'loop()', 'each()'],
        correctAnswer: 0,
        explanation: 'The forEach() method executes a function for each array element.'
      },
      {
        id: 'q12',
        question: 'What does the "this" keyword refer to?',
        options: ['The current function', 'The global object', 'The calling object', 'The parent object'],
        correctAnswer: 2,
        explanation: 'The "this" keyword refers to the object that is calling the function.'
      },
      {
        id: 'q13',
        question: 'Which method creates a new array with filtered elements?',
        options: ['filter()', 'select()', 'choose()', 'pick()'],
        correctAnswer: 0,
        explanation: 'The filter() method creates a new array with elements that pass a test.'
      },
      {
        id: 'q14',
        question: 'Which method transforms array elements and returns a new array?',
        options: ['transform()', 'map()', 'change()', 'convert()'],
        correctAnswer: 1,
        explanation: 'The map() method creates a new array by calling a function on every array element.'
      },
      {
        id: 'q15',
        question: 'What is the difference between let and var?',
        options: ['No difference', 'let has block scope, var has function scope', 'var is newer', 'let is global'],
        correctAnswer: 1,
        explanation: 'let has block scope while var has function scope, making let safer to use.'
      },
      {
        id: 'q16',
        question: 'Which method finds the first element that matches a condition?',
        options: ['find()', 'search()', 'locate()', 'match()'],
        correctAnswer: 0,
        explanation: 'The find() method returns the first element that satisfies a testing function.'
      },
      {
        id: 'q17',
        question: 'What does JSON stand for?',
        options: ['JavaScript Object Notation', 'Java Syntax Object Notation', 'JavaScript Online Notation', 'Java Standard Object Notation'],
        correctAnswer: 0,
        explanation: 'JSON stands for JavaScript Object Notation, a lightweight data interchange format.'
      },
      {
        id: 'q18',
        question: 'Which method converts a JavaScript object to JSON string?',
        options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toString()'],
        correctAnswer: 0,
        explanation: 'JSON.stringify() converts a JavaScript object into a JSON string.'
      },
      {
        id: 'q19',
        question: 'Which method converts a JSON string to JavaScript object?',
        options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'],
        correctAnswer: 1,
        explanation: 'JSON.parse() converts a JSON string into a JavaScript object.'
      },
      {
        id: 'q20',
        question: 'What is the purpose of the try...catch statement?',
        options: ['To try different approaches', 'To handle errors', 'To catch variables', 'To test functions'],
        correctAnswer: 1,
        explanation: 'The try...catch statement handles errors that may occur during code execution.'
      },
      // Advanced JavaScript Questions (21-40)
      {
        id: 'q21',
        question: 'What is a Promise in JavaScript?',
        options: ['A type of function', 'An object representing asynchronous operation completion', 'A variable type', 'A loop construct'],
        correctAnswer: 1,
        explanation: 'A Promise is an object representing the eventual completion or failure of an asynchronous operation.'
      },
      {
        id: 'q22',
        question: 'Which keyword is used to handle Promise rejections?',
        options: ['catch', 'error', 'reject', 'fail'],
        correctAnswer: 0,
        explanation: 'The catch keyword (or .catch() method) is used to handle Promise rejections.'
      },
      {
        id: 'q23',
        question: 'What does async/await do?',
        options: ['Creates asynchronous functions', 'Makes code wait', 'Handles promises more elegantly', 'All of the above'],
        correctAnswer: 3,
        explanation: 'async/await provides a cleaner way to work with Promises and asynchronous code.'
      },
      {
        id: 'q24',
        question: 'Which method combines all array elements into a string?',
        options: ['join()', 'combine()', 'merge()', 'toString()'],
        correctAnswer: 0,
        explanation: 'The join() method combines all array elements into a single string.'
      },
      {
        id: 'q25',
        question: 'What is destructuring in JavaScript?',
        options: ['Breaking code', 'Extracting values from arrays/objects', 'Deleting variables', 'Error handling'],
        correctAnswer: 1,
        explanation: 'Destructuring allows you to extract values from arrays or properties from objects.'
      },
      {
        id: 'q26',
        question: 'What are template literals?',
        options: ['String templates', 'Strings with embedded expressions', 'HTML templates', 'Function templates'],
        correctAnswer: 1,
        explanation: 'Template literals are strings that allow embedded expressions using ${} syntax.'
      },
      {
        id: 'q27',
        question: 'Which symbol is used for template literals?',
        options: ['Single quotes', 'Double quotes', 'Backticks', 'Forward slashes'],
        correctAnswer: 2,
        explanation: 'Template literals use backticks (`) instead of quotes.'
      },
      {
        id: 'q28',
        question: 'What is the spread operator?',
        options: ['...', '***', '+++', '^^^'],
        correctAnswer: 0,
        explanation: 'The spread operator (...) allows arrays/objects to be expanded or spread.'
      },
      {
        id: 'q29',
        question: 'What does the rest parameter do?',
        options: ['Pauses execution', 'Collects remaining arguments into an array', 'Resets variables', 'Rests the program'],
        correctAnswer: 1,
        explanation: 'The rest parameter (...) collects remaining function arguments into an array.'
      },
      {
        id: 'q30',
        question: 'What is a callback function?',
        options: ['A function that calls back', 'A function passed as an argument', 'A recursive function', 'A return function'],
        correctAnswer: 1,
        explanation: 'A callback function is a function passed as an argument to another function.'
      },
      // Expert JavaScript Questions (31-50)
      {
        id: 'q31',
        question: 'What is event delegation?',
        options: ['Assigning events to delegates', 'Using parent elements to handle child events', 'Delaying events', 'Distributing events'],
        correctAnswer: 1,
        explanation: 'Event delegation uses event bubbling to handle events on parent elements instead of individual child elements.'
      },
      {
        id: 'q32',
        question: 'What is the event loop?',
        options: ['A programming loop', 'JavaScript\'s concurrency model', 'An infinite loop', 'A DOM event'],
        correctAnswer: 1,
        explanation: 'The event loop is JavaScript\'s concurrency model that handles asynchronous operations.'
      },
      {
        id: 'q33',
        question: 'What is hoisting?',
        options: ['Lifting heavy objects', 'Moving declarations to the top', 'Hosting websites', 'Raising errors'],
        correctAnswer: 1,
        explanation: 'Hoisting moves function and variable declarations to the top of their scope during compilation.'
      },
      {
        id: 'q34',
        question: 'What is the difference between call() and apply()?',
        options: ['No difference', 'call() uses comma-separated args, apply() uses array', 'apply() is newer', 'call() is faster'],
        correctAnswer: 1,
        explanation: 'call() accepts arguments individually, while apply() accepts arguments as an array.'
      },
      {
        id: 'q35',
        question: 'What does bind() do?',
        options: ['Connects variables', 'Creates a new function with fixed context', 'Ties objects together', 'Binds events'],
        correctAnswer: 1,
        explanation: 'bind() creates a new function with a permanently bound "this" context.'
      },
      {
        id: 'q36',
        question: 'What is a WeakMap?',
        options: ['A weak data structure', 'A Map with weak references to keys', 'A small Map', 'A broken Map'],
        correctAnswer: 1,
        explanation: 'WeakMap is a collection where keys are weakly referenced and must be objects.'
      },
      {
        id: 'q37',
        question: 'What is a WeakSet?',
        options: ['A weak data structure', 'A Set with weak references to values', 'A small Set', 'A broken Set'],
        correctAnswer: 1,
        explanation: 'WeakSet is a collection of objects held weakly, making them garbage collectible.'
      },
      {
        id: 'q38',
        question: 'What is a Symbol in JavaScript?',
        options: ['A mathematical symbol', 'A unique primitive data type', 'A string symbol', 'A graphic symbol'],
        correctAnswer: 1,
        explanation: 'Symbol is a unique primitive data type often used as object property keys.'
      },
      {
        id: 'q39',
        question: 'What is a Proxy in JavaScript?',
        options: ['A network proxy', 'An object that intercepts operations on other objects', 'A representative object', 'A substitute object'],
        correctAnswer: 1,
        explanation: 'Proxy allows you to intercept and customize operations on objects (property lookup, assignment, etc.).'
      },
      {
        id: 'q40',
        question: 'What is a generator function?',
        options: ['A function that generates code', 'A function that can pause and resume execution', 'A function creator', 'A random function'],
        correctAnswer: 1,
        explanation: 'Generator functions can pause and resume their execution, yielding values over time.'
      },
      {
        id: 'q41',
        question: 'What keyword is used to create a generator function?',
        options: ['generator', 'function*', 'gen', 'yield'],
        correctAnswer: 1,
        explanation: 'Generator functions are created using function* syntax.'
      },
      {
        id: 'q42',
        question: 'What keyword is used to pause a generator function?',
        options: ['pause', 'yield', 'stop', 'wait'],
        correctAnswer: 1,
        explanation: 'The yield keyword pauses a generator function and returns a value.'
      },
      {
        id: 'q43',
        question: 'What is the difference between Map and Object?',
        options: ['No difference', 'Map can have any type of keys, Object keys are strings/symbols', 'Map is faster', 'Object is newer'],
        correctAnswer: 1,
        explanation: 'Map allows any type of keys while Object keys are limited to strings and symbols.'
      },
      {
        id: 'q44',
        question: 'What is the temporal dead zone?',
        options: ['A time zone', 'Period when let/const variables cannot be accessed', 'A dead time period', 'A debugging zone'],
        correctAnswer: 1,
        explanation: 'The temporal dead zone is the period when let/const variables are in scope but not yet accessible.'
      },
      {
        id: 'q45',
        question: 'What is a module in JavaScript?',
        options: ['A code component', 'A reusable piece of code with its own scope', 'A function module', 'A class module'],
        correctAnswer: 1,
        explanation: 'A module is a reusable piece of code with its own scope, exported and imported between files.'
      },
      {
        id: 'q46',
        question: 'Which keyword is used to export from a module?',
        options: ['export', 'module', 'send', 'share'],
        correctAnswer: 0,
        explanation: 'The export keyword is used to export functions, objects, or values from a module.'
      },
      {
        id: 'q47',
        question: 'Which keyword is used to import into a module?',
        options: ['import', 'require', 'include', 'load'],
        correctAnswer: 0,
        explanation: 'The import keyword is used to import functions, objects, or values from other modules.'
      },
      {
        id: 'q48',
        question: 'What is the difference between regular and arrow functions?',
        options: ['No difference', 'Arrow functions have lexical this binding', 'Arrow functions are faster', 'Regular functions are newer'],
        correctAnswer: 1,
        explanation: 'Arrow functions have lexical this binding and cannot be used as constructors.'
      },
      {
        id: 'q49',
        question: 'What is a class in JavaScript?',
        options: ['A CSS class', 'A template for creating objects', 'A function class', 'A data class'],
        correctAnswer: 1,
        explanation: 'A class is a template for creating objects with shared properties and methods.'
      },
      {
        id: 'q50',
        question: 'What is inheritance in JavaScript?',
        options: ['Getting money', 'Objects inheriting properties from other objects', 'Class inheritance', 'Property inheritance'],
        correctAnswer: 1,
        explanation: 'Inheritance allows objects to inherit properties and methods from other objects or classes.'
      }
    ]
  },
  {
    id: 'uiux-design',
    title: 'UI/UX Design Fundamentals',
    subject: 'UI/UX Design',
    description: 'Test your knowledge of user interface and user experience design principles.',
    timeLimit: 45,
    questions: [
      {
        id: 'ux1',
        question: 'What does UX stand for?',
        options: ['User Experience', 'User Extension', 'Universal Experience', 'Unified Experience'],
        correctAnswer: 0,
        explanation: 'UX stands for User Experience, which encompasses all aspects of the end-user\'s interaction with the company, its services, and its products.'
      },
      {
        id: 'ux2',
        question: 'Which principle states that similar elements should be grouped together?',
        options: ['Proximity', 'Alignment', 'Contrast', 'Repetition'],
        correctAnswer: 0,
        explanation: 'The Proximity principle states that related items should be grouped together to create visual unity.'
      },
      {
        id: 'ux3',
        question: 'What is a wireframe?',
        options: ['A high-fidelity design', 'A low-fidelity blueprint', 'A coding framework', 'A testing method'],
        correctAnswer: 1,
        explanation: 'A wireframe is a low-fidelity blueprint that shows the basic structure and layout of a page or app.'
      },
      {
        id: 'ux4',
        question: 'What does A/B testing help determine?',
        options: ['Code quality', 'Which version performs better', 'Server speed', 'Database efficiency'],
        correctAnswer: 1,
        explanation: 'A/B testing compares two versions to see which one performs better with users.'
      },
      {
        id: 'ux5',
        question: 'What is the primary goal of user research?',
        options: ['Increase sales', 'Understand user needs', 'Reduce costs', 'Speed up development'],
        correctAnswer: 1,
        explanation: 'User research aims to understand user behaviors, needs, and motivations through observation and feedback.'
      }
    ]
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis Basics',
    subject: 'Data Analysis',
    description: 'Evaluate your understanding of data analysis concepts and techniques.',
    timeLimit: 45,
    questions: [
      {
        id: 'da1',
        question: 'What is the difference between mean and median?',
        options: ['Mean is average, median is middle value', 'They are the same', 'Mean is middle, median is average', 'There is no difference'],
        correctAnswer: 0,
        explanation: 'Mean is the average of all values, while median is the middle value when data is sorted.'
      },
      {
        id: 'da2',
        question: 'What type of chart is best for showing trends over time?',
        options: ['Pie chart', 'Bar chart', 'Line chart', 'Scatter plot'],
        correctAnswer: 2,
        explanation: 'Line charts are ideal for showing trends and changes over time periods.'
      },
      {
        id: 'da3',
        question: 'What does correlation measure?',
        options: ['Causation', 'Relationship strength', 'Data accuracy', 'Sample size'],
        correctAnswer: 1,
        explanation: 'Correlation measures the strength and direction of a relationship between two variables.'
      },
      {
        id: 'da4',
        question: 'What is a dataset?',
        options: ['A single data point', 'A collection of data', 'A database', 'A spreadsheet'],
        correctAnswer: 1,
        explanation: 'A dataset is a collection of data, typically organized in a structured format.'
      },
      {
        id: 'da5',
        question: 'What is data visualization?',
        options: ['Data storage', 'Data cleaning', 'Graphical representation of data', 'Data collection'],
        correctAnswer: 2,
        explanation: 'Data visualization is the graphical representation of information and data using visual elements.'
      }
    ]
  },
  {
    id: 'video-editing',
    title: 'Video Editing Fundamentals',
    subject: 'Video Editing',
    description: 'Test your knowledge of video editing techniques and software.',
    timeLimit: 40,
    questions: [
      {
        id: 've1',
        question: 'What is a timeline in video editing?',
        options: ['A schedule', 'A sequence of video clips', 'A type of transition', 'A video format'],
        correctAnswer: 1,
        explanation: 'A timeline is the sequence where video clips, audio, and effects are arranged chronologically.'
      },
      {
        id: 've2',
        question: 'What does "cutting" mean in video editing?',
        options: ['Deleting footage', 'Joining clips', 'Adding effects', 'Color correction'],
        correctAnswer: 0,
        explanation: 'Cutting refers to removing or trimming unwanted parts of video footage.'
      },
      {
        id: 've3',
        question: 'What is a transition?',
        options: ['A video format', 'A bridge between clips', 'A type of camera', 'An audio effect'],
        correctAnswer: 1,
        explanation: 'A transition is a visual effect that bridges one video clip to another.'
      },
      {
        id: 've4',
        question: 'What does "rendering" mean?',
        options: ['Recording video', 'Processing final output', 'Editing audio', 'Adding titles'],
        correctAnswer: 1,
        explanation: 'Rendering is the process of generating the final video output from all the editing elements.'
      },
      {
        id: 've5',
        question: 'What is the purpose of color grading?',
        options: ['Adding text', 'Enhancing visual mood', 'Cutting clips', 'Adding audio'],
        correctAnswer: 1,
        explanation: 'Color grading is used to enhance the visual mood and aesthetic of video footage.'
      }
    ]
  },
  {
    id: 'graphics-design',
    title: 'Graphics Design Principles',
    subject: 'Graphics Design',
    description: 'Assess your understanding of graphics design fundamentals and tools.',
    timeLimit: 40,
    questions: [
      {
        id: 'gd1',
        question: 'What are the primary colors?',
        options: ['Red, Green, Blue', 'Red, Yellow, Blue', 'Cyan, Magenta, Yellow', 'Red, Orange, Yellow'],
        correctAnswer: 1,
        explanation: 'The primary colors in traditional color theory are Red, Yellow, and Blue.'
      },
      {
        id: 'gd2',
        question: 'What is typography?',
        options: ['Image editing', 'The art of arranging type', 'Color theory', 'Logo design'],
        correctAnswer: 1,
        explanation: 'Typography is the art and technique of arranging type to make written language legible and appealing.'
      },
      {
        id: 'gd3',
        question: 'What does DPI stand for?',
        options: ['Dots Per Inch', 'Design Per Image', 'Digital Print Index', 'Data Per Inch'],
        correctAnswer: 0,
        explanation: 'DPI stands for Dots Per Inch, which measures the resolution of printed materials.'
      },
      {
        id: 'gd4',
        question: 'What is a vector graphic?',
        options: ['A bitmap image', 'A scalable image made of paths', 'A photograph', 'A web format'],
        correctAnswer: 1,
        explanation: 'Vector graphics are images made of mathematical paths that can be scaled without losing quality.'
      },
      {
        id: 'gd5',
        question: 'What is white space in design?',
        options: ['Empty areas', 'White colored elements', 'Paper type', 'Text spacing'],
        correctAnswer: 0,
        explanation: 'White space (or negative space) refers to empty areas in a design that help create balance and focus.'
      }
    ]
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing Essentials',
    subject: 'Digital Marketing',
    description: 'Test your knowledge of digital marketing strategies and concepts.',
    timeLimit: 45,
    questions: [
      {
        id: 'dm1',
        question: 'What does SEO stand for?',
        options: ['Search Engine Optimization', 'Social Engagement Online', 'Site Enhancement Operations', 'Search Engine Operations'],
        correctAnswer: 0,
        explanation: 'SEO stands for Search Engine Optimization, the practice of increasing website visibility in search results.'
      },
      {
        id: 'dm2',
        question: 'What is a conversion rate?',
        options: ['Website speed', 'Percentage of visitors who take desired action', 'Social media followers', 'Email open rate'],
        correctAnswer: 1,
        explanation: 'Conversion rate is the percentage of visitors who complete a desired action on your website.'
      },
      {
        id: 'dm3',
        question: 'What does CTR stand for?',
        options: ['Click Through Rate', 'Customer Target Rate', 'Content Transfer Rate', 'Campaign Tracking Rate'],
        correctAnswer: 0,
        explanation: 'CTR stands for Click Through Rate, the percentage of people who click on a specific link.'
      },
      {
        id: 'dm4',
        question: 'What is content marketing?',
        options: ['Selling products directly', 'Creating valuable content to attract customers', 'Email campaigns', 'Social media advertising'],
        correctAnswer: 1,
        explanation: 'Content marketing involves creating and sharing valuable content to attract and engage a target audience.'
      },
      {
        id: 'dm5',
        question: 'What is a landing page?',
        options: ['Homepage', 'Contact page', 'Specific page for campaign traffic', 'About page'],
        correctAnswer: 2,
        explanation: 'A landing page is a specific web page created for marketing campaigns where visitors "land" after clicking on ads or links.'
      }
    ]
  }
];

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tests] = useState<Test[]>(mockTests);
  const [testProgress, setTestProgress] = useState<Record<string, TestProgress>>({});
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Load user's quiz progress from Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserProgress();
    } else {
      // Initialize empty progress if not authenticated
      const initialProgress: Record<string, TestProgress> = {};
      mockTests.forEach(test => {
        initialProgress[test.id] = {
          testId: test.id,
          attempts: 0,
          bestScore: 0,
          status: 'not-started'
        };
      });
      setTestProgress(initialProgress);
    }
  }, [isAuthenticated, user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: sessions, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error loading quiz sessions:', error);
        return;
      }

      // Process sessions to create progress
      const progress: Record<string, TestProgress> = {};
      
      // Initialize all tests
      mockTests.forEach(test => {
        progress[test.id] = {
          testId: test.id,
          attempts: 0,
          bestScore: 0,
          status: 'not-started'
        };
      });

      // Update with actual session data
      if (sessions) {
        sessions.forEach(session => {
          const testId = session.subject_id;
          const testName = getTestIdFromSubject(session.subject_id);
          
          if (progress[testName]) {
            progress[testName].attempts++;
            progress[testName].bestScore = Math.max(progress[testName].bestScore, session.score);
            progress[testName].lastAttemptDate = new Date(session.completed_at);
            progress[testName].status = 'completed';
          }
        });
      }

      setTestProgress(progress);
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map subject names to test IDs
  const getTestIdFromSubject = (subjectName: string): string => {
    const mapping: Record<string, string> = {
      'HTML': 'html-basics',
      'CSS': 'css-fundamentals',
      'JavaScript': 'js-essentials',
      'UI/UX Design': 'uiux-design',
      'Data Analysis': 'data-analysis',
      'Video Editing': 'video-editing',
      'Graphics Design': 'graphics-design',
      'Digital Marketing': 'digital-marketing'
    };
    return mapping[subjectName] || subjectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };

  const getSubjectFromTestId = (testId: string): string => {
    const test = tests.find(t => t.id === testId);
    return test?.subject || 'HTML';
  };

  const startTest = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (test) {
      setCurrentTest(test);
      setCurrentAnswers({});
    }
  };

  const submitAnswer = (questionId: string, answer: number) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitTest = async (): Promise<TestAttempt | null> => {
    if (!currentTest || !user || !isAuthenticated) return null;

    try {
      setLoading(true);
      
      let correctAnswers = 0;
      const answerDetails: Array<{
        question_index: number;
        question_text: string;
        selected_answer: string;
        correct_answer: string;
        is_correct: boolean;
        subject: string;
      }> = [];

      currentTest.questions.forEach((question, index) => {
        const userAnswer = currentAnswers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) {
          correctAnswers++;
        }

        answerDetails.push({
          question_index: index,
          question_text: question.question,
          selected_answer: userAnswer !== undefined ? question.options[userAnswer] : 'No answer',
          correct_answer: question.options[question.correctAnswer],
          is_correct: isCorrect,
          subject: currentTest.subject
        });
      });

      const score = Math.round((correctAnswers / currentTest.questions.length) * 100);
      
      // Get subject ID
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', currentTest.subject)
        .single();

      if (!subjects) {
        throw new Error('Subject not found');
      }

      // Save quiz session
      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          subject_id: subjects.id,
          score,
          total_questions: currentTest.questions.length,
          time_taken: null // You can implement timing if needed
        })
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      // Save individual answers
      const answersToSave = answerDetails.map(answer => ({
        ...answer,
        session_id: session.id
      }));

      const { error: answersError } = await supabase
        .from('quiz_answers')
        .insert(answersToSave);

      if (answersError) {
        console.error('Error saving answers:', answersError);
      }

      // Update local progress
      const newProgress = { ...testProgress };
      const currentProgress = newProgress[currentTest.id] || {
        testId: currentTest.id,
        attempts: 0,
        bestScore: 0,
        status: 'not-started' as const
      };

      newProgress[currentTest.id] = {
        ...currentProgress,
        attempts: currentProgress.attempts + 1,
        bestScore: Math.max(currentProgress.bestScore, score),
        lastAttemptDate: new Date(),
        status: 'completed'
      };

      setTestProgress(newProgress);

      const attempt: TestAttempt = {
        testId: currentTest.id,
        score,
        totalQuestions: currentTest.questions.length,
        answers: currentAnswers,
        completedAt: new Date()
      };

      return attempt;
    } catch (error) {
      console.error('Error submitting test:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetCurrentTest = () => {
    setCurrentTest(null);
    setCurrentAnswers({});
  };

  const getTestProgress = (testId: string): TestProgress => {
    return testProgress[testId] || {
      testId,
      attempts: 0,
      bestScore: 0,
      status: 'not-started'
    };
  };

  const value = {
    tests,
    testProgress,
    currentTest,
    currentAnswers,
    startTest,
    submitAnswer,
    submitTest,
    resetCurrentTest,
    getTestProgress
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
};