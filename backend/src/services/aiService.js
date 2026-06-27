/**
 * aiService.js - AI layer for TrustTicket.
 *
 * Feature: "Ticket Advisor" - given a real ticket's details it produces a fair
 * price range, a risk/trust assessment, and a short natural-language
 * recommendation for buyers/sellers.
 *
 * Provider-pluggable design:
 *   - AI_PROVIDER=gemini (default) -> calls Google Gemini (a real LLM) using the
 *     key in AI_API_KEY. The key is read here, in the backend ONLY, and is never
 *     sent to the frontend.
 *   - AI_PROVIDER=local, OR no/placeholder key, OR any provider error
 *     -> automatically falls back to the built-in rule-based engine so the
 *        feature never breaks during a demo.
 *
 * The frontend always talks to the backend endpoint, never to a provider.
 */

// How "hot" each event category tends to be on the resale market.
// Used by the local fallback engine to estimate a fair price.
const DEMAND_MULTIPLIER = {
    Concert: 1.10,
    Festival: 1.15,
    Sports: 1.05,
    Theater: 1.00,
    Party: 0.95,
    Standup: 0.90,
    Other: 1.00
};

function round(n) {
    return Math.round(Number(n));
}

/**
 * Time-to-event factor: tickets very close to the event usually sell below
 * value (sellers are in a hurry), while a healthy lead time holds value.
 */
function timeFactor(eventDate) {
    if (!eventDate) return 1.0;
    const days = (new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (Number.isNaN(days)) return 1.0;
    if (days < 0) return 0.6;
    if (days <= 7) return 0.9;
    if (days >= 120) return 0.95;
    return 1.0;
}

/**
 * Local rule-based recommendation engine (the fallback).
 * @returns {{riskLevel, priceRange, recommendation, advice, factors}}
 */
function localTicketAdvice({ eventType, originalPrice, salePrice, eventDate, sellerTrust }) {
    const original = Number(originalPrice);
    // salePrice is optional: in "seller" mode the price has not been set yet.
    const hasSale = salePrice !== undefined && salePrice !== null && salePrice !== '' && Number(salePrice) > 0;
    const sale = hasSale ? Number(salePrice) : 0;
    const demand = DEMAND_MULTIPLIER[eventType] || DEMAND_MULTIPLIER.Other;
    const tf = timeFactor(eventDate);

    const fairMid = original * demand * tf;
    const priceRange = { min: round(fairMid * 0.9), max: round(fairMid * 1.2) };
    // A single suggested list price (mid-point of the fair range).
    const recommendedPrice = round((priceRange.min + priceRange.max) / 2);

    const markupPct = original > 0 ? ((sale - original) / original) * 100 : 0;

    let recommendation;
    if (!hasSale) recommendation = "suggested";       // seller hasn't set a price yet
    else if (sale > priceRange.max) recommendation = "lower_price";
    else if (sale < priceRange.min) recommendation = "raise_price";
    else recommendation = "good_price";

    let riskScore = 0;
    if (hasSale) {
        if (sale > priceRange.max * 1.25) riskScore += 2;
        else if (sale > priceRange.max) riskScore += 1;
        if (markupPct > 50) riskScore += 1;
    }

    const trust = sellerTrust === undefined || sellerTrust === null ? null : Number(sellerTrust);
    if (trust !== null) {
        if (trust >= 4.5) riskScore -= 1;
        else if (trust < 3) riskScore += 1;
    }

    const riskLevel = riskScore >= 2 ? "High" : riskScore === 1 ? "Medium" : "Low";

    let advice;
    if (recommendation === "suggested") {
        advice =
            `Based on the market for ${eventType} tickets and the time until the event, a ` +
            `competitive list price is around ₪${recommendedPrice} (fair range ` +
            `₪${priceRange.min}-₪${priceRange.max}). Pricing in this range should help it sell.`;
    } else if (recommendation === "lower_price") {
        advice =
            `Your asking price of ₪${round(sale)} is about ${round(markupPct)}% above the ` +
            `original face value. For ${eventType} tickets this is on the high side, so buyers ` +
            `may hesitate. A fair range here is ₪${priceRange.min}-₪${priceRange.max}.`;
    } else if (recommendation === "raise_price") {
        advice =
            `Your asking price of ₪${round(sale)} is below the typical market value for ` +
            `${eventType} tickets (₪${priceRange.min}-₪${priceRange.max}). You could likely ` +
            `raise it and still sell.`;
    } else {
        advice =
            `Your asking price of ₪${round(sale)} sits within the fair market range ` +
            `(₪${priceRange.min}-₪${priceRange.max}) for ${eventType} tickets. This is a ` +
            `competitive, trustworthy listing.`;
    }
    if (riskLevel === "High") {
        advice += ` Note: this listing scores as High risk for buyers, mostly due to the price gap.`;
    }

    return {
        riskLevel,
        priceRange,
        recommendedPrice,
        recommendation,
        advice,
        factors: {
            eventType,
            originalPrice: round(original),
            salePrice: hasSale ? round(sale) : null,
            markupPct: hasSale ? round(markupPct) : null,
            sellerTrust: trust
        }
    };
}

/**
 * Build the natural-language prompt sent to the LLM. We ask for strict JSON so
 * the response slots straight into the same contract the frontend expects.
 */
function buildPrompt(t) {
    const hasSale = t.salePrice !== undefined && t.salePrice !== null && Number(t.salePrice) > 0;
    return [
        'You are a pricing and trust advisor for an Israeli second-hand event-ticket marketplace.',
        'All prices are in Israeli New Shekels (ILS, ₪). Use up-to-date market knowledge of the',
        'Israeli resale market (typical resale prices for similar events, demand, and how close',
        'the event date is) to recommend a fair price. Return all numbers in shekels.',
        hasSale
            ? 'Decide whether the seller\'s asking price is fair, give a fair price range, a single recommended price, and the buyer risk level.'
            : 'The seller has NOT set a price yet. Recommend a single competitive list price and a fair range so the ticket will sell.',
        '',
        'Listing details:',
        `- Event name: ${t.eventName || 'N/A'}`,
        `- Event type: ${t.eventType}`,
        `- Venue: ${t.venue || 'N/A'}`,
        `- Event date: ${t.eventDate || 'N/A'}`,
        `- Original face value: ₪${t.originalPrice}`,
        `- Seller asking price: ${hasSale ? '₪' + t.salePrice : 'not set yet'}`,
        `- Seller trust rating (0-5): ${t.sellerTrust ?? 'unknown'}`,
        '',
        'Respond with ONLY a JSON object (no markdown, no extra text) in exactly this shape:',
        '{',
        '  "riskLevel": "Low" | "Medium" | "High",',
        '  "priceRange": { "min": <number>, "max": <number> },',
        '  "recommendedPrice": <number>,',
        `  "recommendation": ${hasSale ? '"lower_price" | "raise_price" | "good_price"' : '"suggested"'},`,
        '  "advice": "<2-3 sentences of practical, specific advice>"',
        '}'
    ].join('\n');
}

/** Pull a JSON object out of an LLM text response, tolerating ```json fences. */
function parseJsonFromText(text) {
    if (!text) return null;
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    try {
        return JSON.parse(cleaned.slice(start, end + 1));
    } catch (err) {
        return null;
    }
}

/**
 * Call Google Gemini's REST API (real LLM). Returns a normalized advice object,
 * or null so the caller falls back to the local engine.
 * The API key lives only in process.env (backend) - never exposed to the client.
 */
async function callGemini(input) {
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gemini-2.0-flash';

    // No usable key configured -> signal fallback.
    if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) return null;

    // Optional Google Search grounding: lets Gemini actually look up current
    // resale prices on the web before answering. When enabled we cannot force a
    // JSON mime type, so we rely on the prompt + parseJsonFromText() instead.
    const useGrounding = (process.env.AI_GROUNDING || 'true').toLowerCase() === 'true';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: { temperature: 0.4 }
    };
    if (useGrounding) {
        body.tools = [{ google_search: {} }];
    } else {
        body.generationConfig.responseMimeType = 'application/json';
    }

    // Gemini (especially with grounding) can return transient 503 "high demand".
    // Retry a few times with a short backoff before giving up to the local engine.
    const maxAttempts = 3;
    let resp, lastErr;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (resp.ok) break;

        const errText = await resp.text();
        lastErr = `Gemini HTTP ${resp.status}: ${errText.slice(0, 200)}`;

        // Only retry on transient overload; other errors (quota, bad key) fail fast.
        if (resp.status === 503 && attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 700 * attempt));
            continue;
        }
        throw new Error(lastErr);
    }

    const json = await resp.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = parseJsonFromText(text);
    if (!parsed || !parsed.riskLevel || !parsed.priceRange) return null;

    // Normalize into our contract.
    const range = {
        min: round(parsed.priceRange.min),
        max: round(parsed.priceRange.max)
    };
    const hasSale = input.salePrice !== undefined && input.salePrice !== null && Number(input.salePrice) > 0;
    return {
        riskLevel: parsed.riskLevel,
        priceRange: range,
        recommendedPrice: parsed.recommendedPrice
            ? round(parsed.recommendedPrice)
            : round((range.min + range.max) / 2),
        recommendation: parsed.recommendation || (hasSale ? 'good_price' : 'suggested'),
        advice: parsed.advice || '',
        factors: {
            eventType: input.eventType,
            originalPrice: round(input.originalPrice),
            salePrice: hasSale ? round(input.salePrice) : null,
            sellerTrust: input.sellerTrust ?? null
        }
    };
}

/**
 * Public entry point used by the controller.
 * Tries the configured LLM provider first, always with a safe local fallback.
 */
async function getTicketAdvice(input) {
    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

    if (provider === 'gemini') {
        try {
            const llmResult = await callGemini(input);
            if (llmResult) return { ...llmResult, provider: 'gemini' };
        } catch (err) {
            console.error('[aiService] Gemini failed, using local engine:', err.message);
        }
    }

    return { ...localTicketAdvice(input), provider: 'local' };
}

module.exports = { getTicketAdvice };
