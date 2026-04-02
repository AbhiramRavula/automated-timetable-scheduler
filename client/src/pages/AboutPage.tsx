import React from 'react';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-50 uppercase tracking-tight">How It Works</h1>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto">
          The Automated Timetable Scheduler is an AI-augmented engine designed to handle complex institutional constraints and optimize class scheduling with zero human collision. Here is the technical breakdown of the processing pipeline.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Step 1: Data Ingestion */}
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-8xl">📊</span>
          </div>
          <div className="relative z-10 space-y-4 max-w-3xl">
            <h2 className="text-2xl font-black text-blue-400 flex items-center gap-3 uppercase">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">1</span>
              Data Ingestion & Mapping
            </h2>
            <p className="text-slate-300 leading-relaxed">
              When a generation is triggered, the engine aggregates the active Institutional Profile. This includes a strict list of <strong>Faculty Availability</strong>, <strong>Room Capacities</strong>, <strong>Batches</strong>, and <strong>Syllabus requirements</strong>.
            </p>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 font-mono text-xs text-slate-400">
              <p><span className="text-pink-400">const</span> <span className="text-blue-300">sessionPool</span> = generateSessions(subjects, batches);</p>
              <p>Every requested subject is expanded into discrete 1-hour or 2-hour "Sessions" based on the academic rules.</p>
            </div>
          </div>
        </div>

        {/* Step 2: Natural Language Constraints */}
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-8xl">🤖</span>
          </div>
          <div className="relative z-10 space-y-4 max-w-3xl">
            <h2 className="text-2xl font-black text-amber-500 flex items-center gap-3 uppercase">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm">2</span>
              Dynamic AI Constraints
            </h2>
            <p className="text-slate-300 leading-relaxed">
              If the user inputs custom requirements like <span className="italic">"Saturdays are holidays"</span>, the prompt requests are passed to Google's <strong>Gemini Large Language Model</strong>.
            </p>
            <p className="text-slate-300 leading-relaxed">
              The AI parses the human text and converts it into mathematical <strong>Hard Constraints</strong>. The backend translates these constraints into an internal <code>blockedSlots</code> grid—permanently locking specific columns in the matrix so no algorithm can ever place a class there.
            </p>
            <div className="grid grid-cols-7 gap-2 text-center mt-4 border border-slate-700 rounded-xl overflow-hidden text-[10px] font-bold">
              <div className="bg-slate-900 py-2">MON</div>
              <div className="bg-slate-900 py-2">TUE</div>
              <div className="bg-slate-900 py-2">WED</div>
              <div className="bg-slate-900 py-2">THU</div>
              <div className="bg-slate-900 py-2">FRI</div>
              <div className="bg-red-500/20 text-red-400 py-2 border-l border-slate-700 uppercase">Blocked by AI</div>
            </div>
          </div>
        </div>

        {/* Step 3: Simulated Annealing */}
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-8xl">🧬</span>
          </div>
          <div className="relative z-10 space-y-4 max-w-3xl">
            <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-3 uppercase">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">3</span>
              N-1/N-2 Optimization Engine
            </h2>
            <p className="text-slate-300 leading-relaxed">
              With the valid mathematical space defined, the backend enters a <strong>Simulated Annealing</strong> loop. It generates a greedy initial schedule and then begins attempting thousands of random swaps.
            </p>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside ml-2">
              <li><strong>Collision Avoidance:</strong> Checks a parallel 3D matrix to ensure no Faculty or Room is assigned to two batches simultaneously.</li>
              <li><strong>Soft Heuristics:</strong> Evaluates "Scoring Criteria" to ensure fair distribution, trying not to give the same subject twice in one day unless it's a lab.</li>
              <li><strong>Mutation:</strong> Random subsets are scrambled until the internal engine temperature "cools", settling on the mathematically optimal, highest-scoring logical grid.</li>
            </ul>
          </div>
        </div>

        {/* Step 4: Normalization */}
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-8xl">✨</span>
          </div>
          <div className="relative z-10 space-y-4 max-w-3xl">
            <h2 className="text-2xl font-black text-purple-400 flex items-center gap-3 uppercase">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">4</span>
              Normalization & Presentation
            </h2>
            <p className="text-slate-300 leading-relaxed">
              The finalized mathematical grid is normalized and hydrated with human-readable information, automatically padding empty hours with intelligently distributed <strong>Library</strong> and <strong>Sports</strong> periods (maximum 2 per day) before saving to MongoDB and delivering to the Frontend React Client.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
