import type {Route} from './+types/api.predictive-search';
import {getAutocompleteSuggestions} from '~/lib/searchanise';

// ============================================================================
// Predictive Search API Route (Resource Route — no UI)
//
// Powers the SearchAutocomplete dropdown in the Header.
// Returns synonym-aware suggestions from Searchanise.
// GET /api/predictive-search?q=<query>[&limit=<n>]
// ============================================================================

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';

  if (!query.trim()) {
    return Response.json({suggestions: [], products: []});
  }

  const apiKey = (context.env as Env).SEARCHANISE_API_KEY;
  if (!apiKey) {
    return Response.json({suggestions: [], products: []});
  }

  try {
    const result = await getAutocompleteSuggestions(apiKey, query);
    return Response.json(result);
  } catch (err) {
    console.error('[predictive-search] Searchanise API call failed:', err);
    return Response.json({suggestions: [], products: []});
  }
}
