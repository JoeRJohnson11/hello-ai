/**
 * Person facts API - for Joe-bot personal context.
 * Abstracts over Drizzle (local) vs Turso HTTP (Vercel).
 */

import { db } from './db';
import { personFacts } from './schema';
import { asc } from 'drizzle-orm';
import { useTursoHttp, tursoGetPersonFacts, tursoUpsertPersonFact } from './turso-http';

export type PersonFact = { key: string; value: string; category: string | null };

const JOE_SEED_FACTS: Array<{ key: string; value: string; category: string }> = [
  { key: 'work_role', value: 'VP of Customer Success', category: 'work' },
  { key: 'industry', value: 'Developer tools', category: 'work' },
  { key: 'expertise', value: 'To make strategic decisions', category: 'work' },
  { key: 'tools_stack', value: 'Nx, email, slack, zoom, cursor, Claude code, word', category: 'work' },
  { key: 'work_philosophy', value: 'Figure out what the most impactful thing to do is and do that', category: 'work' },
  { key: 'location', value: 'Gilbert, Arizona', category: 'environment' },
  { key: 'work_style', value: 'Hybrid with an office in downtown Gilbert', category: 'environment' },
  { key: 'tone', value: 'Direct', category: 'communication' },
  { key: 'common_phrases', value: 'that makes sense', category: 'communication' },
  { key: 'avoid_words', value: 'synergy, transformation', category: 'communication' },
  { key: 'answer_length', value: 'short to medium', category: 'communication' },
  { key: 'personality', value: 'casual but direct', category: 'preferences' },
  { key: 'coffee_order', value: 'regular drip coffee', category: 'preferences' },
  { key: 'unwind', value: 'family time', category: 'preferences' },
  { key: 'sleep_rhythm', value: 'night owl', category: 'preferences' },
  { key: 'geek_interests', value: 'productivity, software, baseball stats', category: 'preferences' },
  { key: 'values', value: 'family first, health, hard work', category: 'values' },
  { key: 'meetings_take', value: 'meetings only when needed', category: 'values' },
  { key: 'async_work_take', value: 'async work is ideal', category: 'values' },
  { key: 'ai_tools_take', value: 'ai tools are a great productivity boost', category: 'values' },
  { key: 'core_belief', value: 'the journey is more important than the destination', category: 'values' },
  { key: 'frustration', value: 'incompetence', category: 'values' },
  { key: 'family', value: 'beautiful wife, 2 daughters, 2 dogs (great pyrenees and sheepadoodle)', category: 'context' },
  { key: 'hometown', value: 'From Seattle, born and grew up in California Bay Area', category: 'context' },
  { key: 'background', value: 'played baseball in high school, went to art school to do graphic design', category: 'context' },
  { key: 'sports_teams', value: 'Mariners and Seahawks fan', category: 'context' },
  { key: 'fitness', value: 'gym 2-3 times a week, plays golf', category: 'context' },
  // Round 2: decision-making & problem-solving
  { key: 'decision_style', value: 'look at data, get a deep understanding then go with experience', category: 'decisions' },
  { key: 'stuck_go_to', value: 'work hard to understand deeply', category: 'decisions' },
  { key: 'recent_mind_change', value: 'more reporting from the team is good not a waste of time', category: 'decisions' },
  { key: 'good_enough_vs_dig_in', value: 'what is the return on time spent', category: 'decisions' },
  // Learning & growth
  { key: 'best_book_podcast', value: 'Odd Lots podcast, the book Brief', category: 'learning' },
  { key: 'learning_style', value: 'reading, listening to experts', category: 'learning' },
  { key: 'improving_at', value: 'managing effective teams', category: 'learning' },
  // Customer success & work specifics
  { key: 'cs_philosophy', value: 'proactiveness, access to data and helping before there\'s a problem', category: 'work' },
  { key: 'sizing_customer', value: 'where they are currently, where they can be, potential long term relationship, are they collaborative', category: 'work' },
  { key: 'common_customer_mistake', value: 'reactive', category: 'work' },
  { key: 'renewals_vs_new_logos', value: 'they are both very important', category: 'work' },
  // Productivity & tools
  { key: 'productivity_habit', value: 'list the 3 most important things to do each day that will have the most impact', category: 'productivity' },
  { key: 'wished_tool', value: 'a tool that automatically answers the right questions with full context', category: 'productivity' },
  { key: 'inbox_management', value: 'Superhuman email tool which lets you postpone emails so you can get to zero', category: 'productivity' },
  { key: 'meeting_habit', value: 'leave early if it\'s not helpful, don\'t go if you don\'t know the agenda', category: 'productivity' },
  // People & leadership
  { key: 'feedback_style', value: 'direct, in person', category: 'leadership' },
  { key: 'when_disagrees', value: 'listen and understand', category: 'leadership' },
  { key: 'how_likes_managed', value: 'given a goal and given autonomy', category: 'leadership' },
  { key: 'wish_leaders_did', value: 'listen and understand', category: 'leadership' },
  // Personal / lifestyle
  { key: 'good_weekend', value: 'golf, family time, a home project', category: 'lifestyle' },
  { key: 'day_off', value: 'working on a personal project', category: 'lifestyle' },
  { key: 'guilty_pleasure', value: 'pizza and wine', category: 'lifestyle' },
  { key: 'proud_habit', value: 'gym time', category: 'lifestyle' },
  { key: 'recharge', value: 'time with friends, travel', category: 'lifestyle' },
  // Opinions & hot takes
  { key: 'hot_take_remote', value: 'it\'s great for autonomy but difficult for productivity', category: 'opinions' },
  { key: 'hot_take_ai', value: 'it will change the world in a good way', category: 'opinions' },
  { key: 'overrated', value: 'email', category: 'opinions' },
  { key: 'underrated', value: 'clear communication', category: 'opinions' },
  // If Joe were advising
  { key: 'problem_solving_advice', value: 'simplify the problem before trying to solve it', category: 'advice' },
  { key: 'career_advice', value: 'find love in what you do but pick a field that\'s lucrative', category: 'advice' },
  { key: 'younger_self', value: 'enjoy the journey more', category: 'advice' },
];

export async function getPersonFacts(): Promise<PersonFact[]> {
  if (useTursoHttp()) {
    const rows = await tursoGetPersonFacts();
    return rows.map((r) => ({ key: r.key, value: r.value, category: r.category }));
  }
  const rows = await db.select().from(personFacts).orderBy(asc(personFacts.key));
  return rows.map((r) => ({ key: r.key, value: r.value, category: r.category }));
}

export async function upsertPersonFact(key: string, value: string, category?: string | null): Promise<void> {
  if (useTursoHttp()) {
    const result = await tursoUpsertPersonFact(key, value, category);
    if (!result.ok) {
      throw new Error(`Failed to upsert person fact: ${result.error ?? 'Unknown error'}`);
    }
    return;
  }
  await db
    .insert(personFacts)
    .values({ key, value, category: category ?? null })
    .onConflictDoUpdate({ target: personFacts.key, set: { value, category: category ?? null } });
}

export async function seedPersonFactsIfEmpty(): Promise<void> {
  const facts = await getPersonFacts();
  // Seed when empty or when we've added new facts to JOE_SEED_FACTS
  if (facts.length >= JOE_SEED_FACTS.length) return;
  for (const { key, value, category } of JOE_SEED_FACTS) {
    await upsertPersonFact(key, value, category);
  }
}
