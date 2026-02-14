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
  if (facts.length > 0) return;
  for (const { key, value, category } of JOE_SEED_FACTS) {
    await upsertPersonFact(key, value, category);
  }
}
