// src/lib/mock-data.ts
import { Post, Category } from './data-fetching'

export const mockPosts: Post[] = [
  {
    id: '1',
    databaseId: 1,
    title: 'Getting Started with Next.js 15 and TypeScript',
    excerpt: 'Learn how to set up a modern Next.js 15 project with TypeScript, Tailwind CSS, and best practices for optimal performance and developer experience. We\'ll cover everything from initial setup to deployment.',
    content: 
      '<h2>Introduction</h2>' +
      '<p>Next.js 15 brings exciting new features and improvements that make building modern web applications even more powerful. In this comprehensive guide, we\'ll walk through setting up a Next.js 15 project with TypeScript and Tailwind CSS, covering everything from initial setup to deployment.</p>' +
      
      '<h2>Prerequisites</h2>' +
      '<p>Before we begin, make sure you have the following installed:</p>' +
      '<ul>' +
        '<li>Node.js 18.17 or later</li>' +
        '<li>npm, yarn, or pnpm</li>' +
        '<li>A code editor (VS Code recommended)</li>' +
      '</ul>' +
      
      '<h2>Creating a New Next.js Project</h2>' +
      '<p>Let\'s start by creating a new Next.js project with TypeScript:</p>' +
      '<pre><code>npx create-next-app@latest my-nextjs-app --typescript --tailwind --eslint</code></pre>' +
      
      '<h2>Project Structure</h2>' +
      '<p>Next.js 15 uses the App Router by default, which provides a more intuitive file-based routing system. Here\'s what your project structure will look like:</p>' +
      '<pre><code>my-nextjs-app/\n├── app/\n│   ├── globals.css\n│   ├── layout.tsx\n│   └── page.tsx\n├── components/\n├── lib/\n├── public/\n└── package.json</code></pre>' +
      
      '<h2>Key Features in Next.js 15</h2>' +
      '<p>Next.js 15 introduces several important features:</p>' +
      '<ul>' +
        '<li><strong>Improved Server Components:</strong> Better performance and developer experience</li>' +
        '<li><strong>Enhanced TypeScript Support:</strong> Better type safety and IntelliSense</li>' +
        '<li><strong>Optimized Build System:</strong> Faster builds and better tree shaking</li>' +
        '<li><strong>Advanced Image Optimization:</strong> Better image handling and performance</li>' +
      '</ul>' +
      
      '<h2>Configuration</h2>' +
      '<p>Next.js 15 comes with sensible defaults, but you can customize the configuration in <code>next.config.js</code>:</p>' +
      '<pre><code>/** @type {import(\'next\').NextConfig} */\nconst nextConfig = {\n  experimental: {\n    appDir: true,\n  },\n  images: {\n    domains: [\'your-domain.com\'],\n  },\n}\n\nmodule.exports = nextConfig</code></pre>' +
      
      '<h2>TypeScript Configuration</h2>' +
      '<p>TypeScript is configured out of the box, but you can enhance the configuration in <code>tsconfig.json</code>:</p>' +
      '<pre><code>{\n  "compilerOptions": {\n    "target": "es5",\n    "lib": ["dom", "dom.iterable", "es6"],\n    "allowJs": true,\n    "skipLibCheck": true,\n    "strict": true,\n    "forceConsistentCasingInFileNames": true,\n    "noEmit": true,\n    "esModuleInterop": true,\n    "module": "esnext",\n    "moduleResolution": "node",\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "jsx": "preserve",\n    "incremental": true,\n    "plugins": [\n      {\n        "name": "next"\n      }\n    ],\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  },\n  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],\n  "exclude": ["node_modules"]\n}</code></pre>' +
      
      '<h2>Tailwind CSS Setup</h2>' +
      '<p>Tailwind CSS is pre-configured and ready to use. You can customize the design system in <code>tailwind.config.js</code>:</p>' +
      '<pre><code>/** @type {import(\'tailwindcss\').Config} */\nmodule.exports = {\n  content: [\n    \'./pages/**/*.{js,ts,jsx,tsx,mdx}\',\n    \'./components/**/*.{js,ts,jsx,tsx,mdx}\',\n    \'./app/**/*.{js,ts,jsx,tsx,mdx}\',\n  ],\n  theme: {\n    extend: {\n      colors: {\n        primary: {\n          50: \'#eff6ff\',\n          500: \'#3b82f6\',\n          900: \'#1e3a8a\',\n        },\n      },\n    },\n  },\n  plugins: [],\n}</code></pre>' +
      
      '<h2>Building Your First Component</h2>' +
      '<p>Let\'s create a simple component to get started:</p>' +
      '<pre><code>// components/Button.tsx\ninterface ButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n  variant?: \'primary\' | \'secondary\';\n}\n\nexport default function Button({ \n  children, \n  onClick, \n  variant = \'primary\' \n}: ButtonProps) {\n  const baseClasses = \'px-4 py-2 rounded-lg font-medium transition-colors\';\n  const variantClasses = {\n    primary: \'bg-blue-600 text-white hover:bg-blue-700\',\n    secondary: \'bg-gray-200 text-gray-900 hover:bg-gray-300\',\n  };\n  \n  return (\n    <button\n      onClick={onClick}\n      className={baseClasses + \' \' + variantClasses[variant]}\n    >\n      {children}\n    </button>\n  );\n}</code></pre>' +
      
      '<h2>Using the Component</h2>' +
      '<p>Now you can use your component in any page:</p>' +
      '<pre><code>// app/page.tsx\nimport Button from \'@/components/Button\';\n\nexport default function HomePage() {\n  return (\n    <div className="min-h-screen bg-gray-50 flex items-center justify-center">\n      <div className="text-center">\n        <h1 className="text-4xl font-bold text-gray-900 mb-8">\n          Welcome to Next.js 15\n        </h1>\n        <Button onClick={() => alert(\'Hello!\')}>\n          Get Started\n        </Button>\n      </div>\n    </div>\n  );\n}</code></pre>' +
      
      '<h2>Deployment</h2>' +
      '<p>Deploying your Next.js 15 application is straightforward:</p>' +
      '<ol>' +
        '<li>Build your application: <code>npm run build</code></li>' +
        '<li>Start the production server: <code>npm start</code></li>' +
        '<li>Deploy to Vercel: <code>npx vercel</code></li>' +
      '</ol>' +
      
      '<h2>Conclusion</h2>' +
      '<p>Next.js 15 with TypeScript and Tailwind CSS provides a powerful foundation for building modern web applications. The combination of server components, type safety, and utility-first CSS makes development faster and more enjoyable.</p>' +
      
      '<p>Start building your next project with these tools and experience the difference they make in your development workflow!</p>',
    slug: 'getting-started-nextjs-15-typescript',
    date: '2024-01-15T10:00:00Z',
    modified: '2024-01-15T10:00:00Z',
    featuredImage: {
      node: {
        id: 'img1',
        sourceUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        altText: 'Next.js and TypeScript setup',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author1',
        name: 'Alex Johnson',
        slug: 'alex-johnson'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat1',
          name: 'Development',
          slug: 'development'
        },
        {
          id: 'cat2',
          name: 'Next.js',
          slug: 'nextjs'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag1',
          name: 'TypeScript',
          slug: 'typescript'
        },
        {
          id: 'tag2',
          name: 'React',
          slug: 'react'
        },
        {
          id: 'tag3',
          name: 'Tutorial',
          slug: 'tutorial'
        }
      ]
    }
  },
  {
    id: '2',
    databaseId: 2,
    title: 'Optimizing Core Web Vitals for Better Performance',
    excerpt: 'Discover advanced strategies to improve your website\'s Core Web Vitals scores, including LCP, FID, and CLS optimization techniques. Learn how to achieve perfect scores and boost your SEO rankings.',
    content: 'Full content about Core Web Vitals optimization...',
    slug: 'optimizing-core-web-vitals-performance',
    date: '2024-01-10T14:30:00Z',
    modified: '2024-01-10T14:30:00Z',
    featuredImage: {
      node: {
        id: 'img2',
        sourceUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
        altText: 'Performance optimization dashboard',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author2',
        name: 'Sarah Chen',
        slug: 'sarah-chen'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat3',
          name: 'Performance',
          slug: 'performance'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag4',
          name: 'Web Vitals',
          slug: 'web-vitals'
        },
        {
          id: 'tag5',
          name: 'SEO',
          slug: 'seo'
        },
        {
          id: 'tag6',
          name: 'Optimization',
          slug: 'optimization'
        }
      ]
    }
  },
  {
    id: '3',
    databaseId: 3,
    title: 'Building Accessible Web Applications with WCAG 2.1',
    excerpt: 'Learn how to create web applications that are accessible to all users, including those with disabilities, following WCAG 2.1 guidelines. We\'ll cover semantic HTML, ARIA labels, and keyboard navigation.',
    content: 'Full content about accessibility...',
    slug: 'building-accessible-web-applications-wcag',
    date: '2024-01-05T09:15:00Z',
    modified: '2024-01-05T09:15:00Z',
    featuredImage: {
      node: {
        id: 'img3',
        sourceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        altText: 'Accessibility in web development',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author3',
        name: 'Mike Rodriguez',
        slug: 'mike-rodriguez'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat4',
          name: 'Accessibility',
          slug: 'accessibility'
        },
        {
          id: 'cat1',
          name: 'Development',
          slug: 'development'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag7',
          name: 'WCAG',
          slug: 'wcag'
        },
        {
          id: 'tag8',
          name: 'A11y',
          slug: 'a11y'
        },
        {
          id: 'tag9',
          name: 'Semantic HTML',
          slug: 'semantic-html'
        }
      ]
    }
  },
  {
    id: '4',
    databaseId: 4,
    title: 'Advanced State Management with Zustand and React',
    excerpt: 'Explore modern state management solutions with Zustand, a lightweight and intuitive state management library for React. Learn how to build scalable applications with minimal boilerplate.',
    content: 'Full content about Zustand...',
    slug: 'advanced-state-management-zustand-react',
    date: '2024-01-03T16:45:00Z',
    modified: '2024-01-03T16:45:00Z',
    featuredImage: {
      node: {
        id: 'img4',
        sourceUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        altText: 'State management diagram',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author4',
        name: 'Emma Wilson',
        slug: 'emma-wilson'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat1',
          name: 'Development',
          slug: 'development'
        },
        {
          id: 'cat5',
          name: 'React',
          slug: 'react'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag10',
          name: 'Zustand',
          slug: 'zustand'
        },
        {
          id: 'tag2',
          name: 'React',
          slug: 'react'
        },
        {
          id: 'tag11',
          name: 'State Management',
          slug: 'state-management'
        }
      ]
    }
  },
  {
    id: '5',
    databaseId: 5,
    title: 'Mastering CSS Grid and Flexbox Layouts',
    excerpt: 'Dive deep into modern CSS layout techniques with Grid and Flexbox. Learn how to create responsive, complex layouts that work perfectly across all devices and screen sizes.',
    content: 'Full content about CSS Grid and Flexbox...',
    slug: 'mastering-css-grid-flexbox-layouts',
    date: '2024-01-01T11:20:00Z',
    modified: '2024-01-01T11:20:00Z',
    featuredImage: {
      node: {
        id: 'img5',
        sourceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        altText: 'CSS Grid layout example',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author5',
        name: 'David Kim',
        slug: 'david-kim'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat6',
          name: 'CSS',
          slug: 'css'
        },
        {
          id: 'cat1',
          name: 'Development',
          slug: 'development'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag12',
          name: 'CSS Grid',
          slug: 'css-grid'
        },
        {
          id: 'tag13',
          name: 'Flexbox',
          slug: 'flexbox'
        },
        {
          id: 'tag14',
          name: 'Layout',
          slug: 'layout'
        }
      ]
    }
  },
  {
    id: '6',
    databaseId: 6,
    title: 'Building Scalable APIs with GraphQL and Node.js',
    excerpt: 'Learn how to design and implement scalable APIs using GraphQL and Node.js. We\'ll cover schema design, resolvers, authentication, and best practices for production deployments.',
    content: 'Full content about GraphQL APIs...',
    slug: 'building-scalable-apis-graphql-nodejs',
    date: '2023-12-28T13:10:00Z',
    modified: '2023-12-28T13:10:00Z',
    featuredImage: {
      node: {
        id: 'img6',
        sourceUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        altText: 'GraphQL API architecture',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author6',
        name: 'Lisa Thompson',
        slug: 'lisa-thompson'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat7',
          name: 'Backend',
          slug: 'backend'
        },
        {
          id: 'cat8',
          name: 'API',
          slug: 'api'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag15',
          name: 'GraphQL',
          slug: 'graphql'
        },
        {
          id: 'tag16',
          name: 'Node.js',
          slug: 'nodejs'
        },
        {
          id: 'tag17',
          name: 'API Design',
          slug: 'api-design'
        }
      ]
    }
  },
  {
    id: '7',
    databaseId: 7,
    title: 'Testing React Applications with Jest and React Testing Library',
    excerpt: 'Master the art of testing React applications with Jest and React Testing Library. Learn how to write maintainable tests that give you confidence in your code changes.',
    content: 'Full content about testing...',
    slug: 'testing-react-applications-jest-rtl',
    date: '2023-12-25T08:30:00Z',
    modified: '2023-12-25T08:30:00Z',
    featuredImage: {
      node: {
        id: 'img7',
        sourceUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
        altText: 'Testing React components',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author7',
        name: 'Chris Anderson',
        slug: 'chris-anderson'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat9',
          name: 'Testing',
          slug: 'testing'
        },
        {
          id: 'cat5',
          name: 'React',
          slug: 'react'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag18',
          name: 'Jest',
          slug: 'jest'
        },
        {
          id: 'tag19',
          name: 'React Testing Library',
          slug: 'react-testing-library'
        },
        {
          id: 'tag20',
          name: 'Unit Testing',
          slug: 'unit-testing'
        }
      ]
    }
  },
  {
    id: '8',
    databaseId: 8,
    title: 'Deploying Next.js Applications to Vercel and AWS',
    excerpt: 'Learn how to deploy your Next.js applications to production environments like Vercel and AWS. We\'ll cover CI/CD pipelines, environment variables, and monitoring.',
    content: 'Full content about deployment...',
    slug: 'deploying-nextjs-applications-vercel-aws',
    date: '2023-12-22T15:45:00Z',
    modified: '2023-12-22T15:45:00Z',
    featuredImage: {
      node: {
        id: 'img8',
        sourceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        altText: 'Cloud deployment architecture',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author8',
        name: 'Rachel Green',
        slug: 'rachel-green'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat10',
          name: 'DevOps',
          slug: 'devops'
        },
        {
          id: 'cat2',
          name: 'Next.js',
          slug: 'nextjs'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag21',
          name: 'Vercel',
          slug: 'vercel'
        },
        {
          id: 'tag22',
          name: 'AWS',
          slug: 'aws'
        },
        {
          id: 'tag23',
          name: 'Deployment',
          slug: 'deployment'
        }
      ]
    }
  },
  {
    id: '9',
    databaseId: 9,
    title: 'Optimizing Images and Assets for Web Performance',
    excerpt: 'Discover techniques for optimizing images and assets to improve web performance. Learn about modern image formats, lazy loading, and CDN strategies.',
    content: 'Full content about image optimization...',
    slug: 'optimizing-images-assets-web-performance',
    date: '2023-12-20T12:15:00Z',
    modified: '2023-12-20T12:15:00Z',
    featuredImage: {
      node: {
        id: 'img9',
        sourceUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        altText: 'Image optimization workflow',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author9',
        name: 'Tom Martinez',
        slug: 'tom-martinez'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat3',
          name: 'Performance',
          slug: 'performance'
        },
        {
          id: 'cat1',
          name: 'Development',
          slug: 'development'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag24',
          name: 'Image Optimization',
          slug: 'image-optimization'
        },
        {
          id: 'tag25',
          name: 'WebP',
          slug: 'webp'
        },
        {
          id: 'tag26',
          name: 'CDN',
          slug: 'cdn'
        }
      ]
    }
  },
  {
    id: '10',
    databaseId: 10,
    title: 'Building Progressive Web Apps with Next.js',
    excerpt: 'Learn how to transform your Next.js application into a Progressive Web App (PWA). We\'ll cover service workers, offline functionality, and app-like experiences.',
    content: 'Full content about PWA...',
    slug: 'building-progressive-web-apps-nextjs',
    date: '2023-12-18T09:00:00Z',
    modified: '2023-12-18T09:00:00Z',
    featuredImage: {
      node: {
        id: 'img10',
        sourceUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
        altText: 'Progressive Web App features',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author10',
        name: 'Sophie Lee',
        slug: 'sophie-lee'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat11',
          name: 'PWA',
          slug: 'pwa'
        },
        {
          id: 'cat2',
          name: 'Next.js',
          slug: 'nextjs'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag27',
          name: 'PWA',
          slug: 'pwa'
        },
        {
          id: 'tag28',
          name: 'Service Workers',
          slug: 'service-workers'
        },
        {
          id: 'tag29',
          name: 'Offline',
          slug: 'offline'
        }
      ]
    }
  },
  {
    id: '11',
    databaseId: 11,
    title: 'Security Best Practices for Modern Web Applications',
    excerpt: 'Explore essential security practices for protecting your web applications. Learn about authentication, authorization, data validation, and common security vulnerabilities.',
    content: 'Full content about security...',
    slug: 'security-best-practices-modern-web-applications',
    date: '2023-12-15T14:20:00Z',
    modified: '2023-12-15T14:20:00Z',
    featuredImage: {
      node: {
        id: 'img11',
        sourceUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
        altText: 'Web security concepts',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author11',
        name: 'Kevin Park',
        slug: 'kevin-park'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat12',
          name: 'Security',
          slug: 'security'
        },
        {
          id: 'cat1',
          name: 'Development',
          slug: 'development'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag30',
          name: 'Security',
          slug: 'security'
        },
        {
          id: 'tag31',
          name: 'Authentication',
          slug: 'authentication'
        },
        {
          id: 'tag32',
          name: 'OWASP',
          slug: 'owasp'
        }
      ]
    }
  },
  {
    id: '12',
    databaseId: 12,
    title: 'Microservices Architecture with Node.js and Docker',
    excerpt: 'Learn how to design and implement microservices architecture using Node.js and Docker. We\'ll cover service communication, data consistency, and deployment strategies.',
    content: 'Full content about microservices...',
    slug: 'microservices-architecture-nodejs-docker',
    date: '2023-12-12T11:30:00Z',
    modified: '2023-12-12T11:30:00Z',
    featuredImage: {
      node: {
        id: 'img12',
        sourceUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
        altText: 'Microservices architecture diagram',
        mediaDetails: {
          width: 800,
          height: 400
        }
      }
    },
    author: {
      node: {
        id: 'author12',
        name: 'Maria Garcia',
        slug: 'maria-garcia'
      }
    },
    categories: {
      nodes: [
        {
          id: 'cat7',
          name: 'Backend',
          slug: 'backend'
        },
        {
          id: 'cat10',
          name: 'DevOps',
          slug: 'devops'
        }
      ]
    },
    tags: {
      nodes: [
        {
          id: 'tag33',
          name: 'Microservices',
          slug: 'microservices'
        },
        {
          id: 'tag34',
          name: 'Docker',
          slug: 'docker'
        },
        {
          id: 'tag35',
          name: 'Architecture',
          slug: 'architecture'
        }
      ]
    }
  }
]

export const mockCategories: Category[] = [
  {
    id: 'cat1',
    databaseId: 1,
    name: 'Development',
    slug: 'development',
    description: 'Articles about software development, programming, and technical topics',
    count: 6
  },
  {
    id: 'cat2',
    databaseId: 2,
    name: 'Next.js',
    slug: 'nextjs',
    description: 'Next.js framework tutorials, tips, and best practices',
    count: 3
  },
  {
    id: 'cat3',
    databaseId: 3,
    name: 'Performance',
    slug: 'performance',
    description: 'Web performance optimization and Core Web Vitals',
    count: 2
  },
  {
    id: 'cat4',
    databaseId: 4,
    name: 'Accessibility',
    slug: 'accessibility',
    description: 'Web accessibility guidelines and implementation',
    count: 1
  },
  {
    id: 'cat5',
    databaseId: 5,
    name: 'React',
    slug: 'react',
    description: 'React library tutorials and advanced concepts',
    count: 2
  },
  {
    id: 'cat6',
    databaseId: 6,
    name: 'CSS',
    slug: 'css',
    description: 'CSS techniques, layouts, and styling best practices',
    count: 1
  },
  {
    id: 'cat7',
    databaseId: 7,
    name: 'Backend',
    slug: 'backend',
    description: 'Server-side development and backend technologies',
    count: 2
  },
  {
    id: 'cat8',
    databaseId: 8,
    name: 'API',
    slug: 'api',
    description: 'API design, development, and integration',
    count: 1
  },
  {
    id: 'cat9',
    databaseId: 9,
    name: 'Testing',
    slug: 'testing',
    description: 'Testing strategies and tools for web applications',
    count: 1
  },
  {
    id: 'cat10',
    databaseId: 10,
    name: 'DevOps',
    slug: 'devops',
    description: 'DevOps practices, deployment, and infrastructure',
    count: 2
  },
  {
    id: 'cat11',
    databaseId: 11,
    name: 'PWA',
    slug: 'pwa',
    description: 'Progressive Web App development and features',
    count: 1
  },
  {
    id: 'cat12',
    databaseId: 12,
    name: 'Security',
    slug: 'security',
    description: 'Web security best practices and vulnerabilities',
    count: 1
  }
]

export const mockPageInfo = {
  hasNextPage: true,
  hasPreviousPage: false,
  startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
  endCursor: 'YXJyYXljb25uZWN0aW9uOjEx'
}
