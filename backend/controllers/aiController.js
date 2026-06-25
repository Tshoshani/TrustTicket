/**
 * controllers/aiController.js
 * AI Ticket Advisor controller.
 *
 * Exposes the AI feature to the frontend through the backend only. The frontend
 * never talks to an AI provider directly, and the provider key stays in the
 * backend environment (see src/services/aiService.js).
 *
 * Primary mode: analyze a REAL ticket from the database by its ticketId.
 * Fallback mode: analyze ad-hoc fields posted directly (eventType + prices).
 */

const { getTicketAdvice } = require('../src/services/aiService');
const { Ticket, User } = require('../models');

const VALID_EVENT_TYPES = [
    'Concert', 'Festival', 'Sports', 'Theater', 'Party', 'Standup', 'Other'
];

function validationError(res, message, details = {}) {
    return res.status(400).json({
        success: false,
        data: null,
        error: { code: 'VALIDATION_ERROR', message, details }
    });
}

const aiController = {
    /**
     * POST /api/ai/ticket-advice
     * Body (preferred): { ticketId }
     * Body (manual):    { eventType, originalPrice, salePrice, eventDate?, sellerTrust? }
     * Returns a fair price range, a risk level, and a natural-language tip.
     */
    getTicketAdvice: async (req, res) => {
        try {
            const body = req.body || {};
            let input;

            // ---- Preferred path: analyze a real ticket from MySQL ----
            if (body.ticketId !== undefined && body.ticketId !== null && body.ticketId !== '') {
                const id = parseInt(body.ticketId, 10);
                if (Number.isNaN(id)) {
                    return validationError(res, 'ticketId must be a number.', { ticketId: body.ticketId });
                }

                const ticket = await Ticket.findByPk(id, {
                    include: [{
                        model: User,
                        as: 'seller',
                        attributes: ['userId', 'firstName', 'lastName', 'trustRating']
                    }]
                });

                if (!ticket) {
                    return res.status(404).json({
                        success: false,
                        data: null,
                        error: { code: 'NOT_FOUND', message: `Ticket with ID ${id} not found`, details: {} }
                    });
                }

                input = {
                    ticketId: ticket.ticketId,
                    eventName: ticket.eventName,
                    eventType: ticket.eventType,
                    venue: ticket.venue,
                    eventDate: ticket.eventDate,
                    originalPrice: Number(ticket.originalPrice),
                    salePrice: Number(ticket.salePrice),
                    sellerTrust: ticket.seller ? Number(ticket.seller.trustRating) : null
                };
            } else {
                // ---- Manual path: validate ad-hoc fields ----
                // salePrice is OPTIONAL here: a seller listing a new ticket asks
                // for a recommended price before deciding on one.
                const { eventType, originalPrice, salePrice, eventDate, sellerTrust } = body;

                const missing = [];
                if (!eventType) missing.push('eventType');
                if (originalPrice === undefined || originalPrice === null || originalPrice === '') missing.push('originalPrice');
                if (missing.length > 0) {
                    return validationError(res, `Provide a ticketId, or these field(s): ${missing.join(', ')}`, { missing });
                }

                const original = Number(originalPrice);
                if (Number.isNaN(original) || original <= 0) {
                    return validationError(res, 'originalPrice must be a positive number.', { originalPrice });
                }

                let sale; // undefined => seller mode (no price set yet)
                if (salePrice !== undefined && salePrice !== null && salePrice !== '') {
                    sale = Number(salePrice);
                    if (Number.isNaN(sale) || sale <= 0) {
                        return validationError(res, 'salePrice must be a positive number.', { salePrice });
                    }
                }

                if (!VALID_EVENT_TYPES.includes(eventType)) {
                    return validationError(res, `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}`, { eventType });
                }

                input = { eventType, originalPrice: original, salePrice: sale, eventDate, sellerTrust };
            }

            const advice = await getTicketAdvice(input);

            return res.status(200).json({
                success: true,
                data: { ...advice, ticket: input.ticketId ? {
                    ticketId: input.ticketId,
                    eventName: input.eventName,
                    eventType: input.eventType,
                    originalPrice: input.originalPrice,
                    salePrice: input.salePrice
                } : null },
                error: null
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 'AI_ADVICE_FAILED',
                    message: 'Failed to generate AI ticket advice',
                    details: { reason: err.message }
                }
            });
        }
    }
};

module.exports = aiController;
