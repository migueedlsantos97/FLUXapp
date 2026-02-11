import { z } from 'zod';
import { insertFinancialProfileSchema, insertTransactionSchema, financialProfiles, transactions } from './schema';

export const errorSchemas = {
    validation: z.object({
        message: z.string(),
        field: z.string().optional(),
    }),
    notFound: z.object({
        message: z.string(),
    }),
    internal: z.object({
        message: z.string(),
    }),
    unauthorized: z.object({
        message: z.string(),
    })
};

export const api = {
    financialProfile: {
        get: {
            method: 'GET' as const,
            path: '/api/financial-profile' as const,
            responses: {
                200: z.custom<typeof financialProfiles.$inferSelect>(),
                404: errorSchemas.notFound,
                401: errorSchemas.unauthorized
            }
        },
        createOrUpdate: {
            method: 'POST' as const,
            path: '/api/financial-profile' as const,
            input: insertFinancialProfileSchema,
            responses: {
                200: z.custom<typeof financialProfiles.$inferSelect>(),
                201: z.custom<typeof financialProfiles.$inferSelect>(),
                401: errorSchemas.unauthorized,
                400: errorSchemas.validation
            }
        }
    },
    transactions: {
        list: {
            method: 'GET' as const,
            path: '/api/transactions' as const,
            responses: {
                200: z.array(z.custom<typeof transactions.$inferSelect>()),
                401: errorSchemas.unauthorized
            }
        },
        create: {
            method: 'POST' as const,
            path: '/api/transactions' as const,
            input: insertTransactionSchema,
            responses: {
                201: z.custom<typeof transactions.$inferSelect>(),
                401: errorSchemas.unauthorized,
                400: errorSchemas.validation
            }
        }
    }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
    let url = path;
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (url.includes(`:${key}`)) {
                url = url.replace(`:${key}`, String(value));
            }
        });
    }
    return url;
}
