# Pardus pricing and currency

The supplied starting prices remain in `src/data/offers.ts`. The six destination figures are USD 2,950 (Maldives), 2,450 (Seychelles), 1,250 (Dubai), 3,250 (East Africa), 3,950 (Safari & Zanzibar) and 3,850 (Europe). Each retains its existing nights, inclusions and per-person/two-sharing basis. Cruise figures retain their separate vessel, duration and guest-count bases.

The redesign brief requests UGX as the primary currency. This checkout contains no approved UGX price list or approved exchange-rate policy. A redesign does not establish those commercial facts, so no numeric conversion has been made. Existing USD starting amounts remain visible, accompanied by “UGX quote available”. The simple enquiry collects UGX budget preferences; its new bands are preference ranges, not converted package prices.

`PriceAmounts` accepts an optional `fromUGX`. Add this field to an offer only when the business supplies an approved UGX starting amount for the same itinerary and price basis. `displayPrice` then selects UGX as the primary amount and retains a supplied USD amount as secondary context. If no UGX amount exists, it preserves USD; if neither amount is valid, it shows “Quote on request”. The shared formatter never multiplies prices by a market exchange rate.

Record the source, approval date, validity period and applicable inclusions when entering new commercial amounts. If the business instead approves conversion-based display, document the rate source, review interval, rounding policy and the distinction between a displayed estimate and a binding quote before adding conversion code.

`OfferPrice.astro` and `priceText` consume this contract. The PDF generator currently formats USD directly; it must be updated and the note regenerated in the same release that introduces approved UGX amounts. The current PDF stays consistent with the unchanged supplied numeric prices.

Pricing tests cover preservation of supplied USD amounts, explicit UGX precedence and invalid/absent amounts. No exchange rate, mailbox activation or delivery integration is inferred by these changes.
