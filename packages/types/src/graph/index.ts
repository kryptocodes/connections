import { z } from "zod";

export const UpsertSocialGraphEdgeRequestQuerySchema = z.object({
  fetchUpdatedAtAfter: z.coerce.date(),
})

export type UpsertSocialGraphEdgeRequestQuery = z.infer<typeof UpsertSocialGraphEdgeRequestQuerySchema>;

export const UpsertSocialGraphEdgeRequestSchema = z.object({
  id: z.string().nullable(), // If null, make a new one
  authToken: z.string(),
  tapSenderHash: z.string().nullable(),
  tapReceiverHash: z.string().nullable(),
});

export type UpsertSocialGraphEdgeRequest = z.infer<typeof UpsertSocialGraphEdgeRequestSchema>;

export const UpsertSocialGraphEdgeResponseSchema = z.object({
  id: z.string(),
});

export type UpsertSocialGraphEdgeResponse = z.infer<typeof UpsertSocialGraphEdgeResponseSchema>;

export const GraphEdgeSchema = z.object({
  tapSenderHash: z.string(),
  tapReceiverHash: z.string(),
  updatedAt: z.coerce.date(),
});

export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const GraphEdgeResponseSchema = z.array(GraphEdgeSchema.nullable());

export type GraphEdgeResponse = z.infer<typeof GraphEdgeResponseSchema>;