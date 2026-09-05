import React from 'react';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { PageId } from '../components/Navbar';

interface BlogPageProps {
  setCurrentPage: (page: PageId) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ setCurrentPage }) => {
  const articles = [
    {
      id: 1,
      title: "How Multi-Board Simul Coaching Increases Student Retention by 40%",
      snippet: "Traditional 1-on-1 coaching can bottleneck academy revenue. Discover how Grandmaster coaches use simultaneous board monitoring to coach 10+ students efficiently while keeping parents delighted.",
      author: "GM Vikram Sen",
      date: "September 2, 2026",
      tag: "Academy Growth",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Why Stockfish 16 NNUE & Plain-English Explanations Beat Traditional Eval Numbers",
      snippet: "Young students struggle to interpret computer numbers like -2.1. Learn how tactical motif detection and natural language AI coaching transform blunder review into rapid rating growth.",
      author: "Sarah Jenkins, FIDE Master",
      date: "August 28, 2026",
      tag: "Coaching Tech",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "The Ultimate Guide to Running Online Swiss Tournaments for Clubs",
      snippet: "Everything you need to know about setting up FIDE-compliant Swiss pairings, Buchholz tie-breaks, and broadcast arenas for your academy's weekend championships.",
      author: "Alexei Petrov, International Arbiter",
      date: "August 15, 2026",
      tag: "Tournaments",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Automating Parent Communication: The Secret Weapon of 7-Figure Academies",
      snippet: "How sending automated WhatsApp report cards with attendance stats and homework streaks eliminates parent churn and turns families into word-of-mouth advocates.",
      author: "Rohan Nair, Academy Founder",
      date: "August 10, 2026",
      tag: "Parent Relations",
      readTime: "4 min read"
    }
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 font-sans">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Coaching Resources & Insights</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2">
          The Chess Academy Blueprint
        </h1>
        <p className="text-zinc-400 text-base mt-4 leading-relaxed">
          Actionable strategies on chess pedagogy, academy scaling, and modern coaching technology from leading Grandmasters and academy directors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((art) => (
          <article
            key={art.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7 shadow-lg flex flex-col justify-between hover:border-orange-500/40 transition duration-300 group cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 font-bold text-xs">
                  {art.tag}
                </span>
                <span className="text-xs text-zinc-500">{art.readTime}</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition leading-snug">
                {art.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                {art.snippet}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>{art.author}</span>
              </div>
              <div className="flex items-center gap-1 text-orange-400 font-bold group-hover:underline">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
