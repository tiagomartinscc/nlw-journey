import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";

export async function createLink(app:FastifyInstance) {
   await app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/links', {
      schema: {
        params: z.object({
          tripId: z.string().uuid()
        }),
         body: z.object({
            title: z.string().min(4),
            url: z.string().url(),
         })
      }
   } ,async (request) => {
      const { title, url } = request.body
      const { tripId } = request.params
      
      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId
        }
      })

      if (!trip) {
        throw new Error("trip not found")
      }

      const link = await prisma.link.create({
        data: {
          trip_id: tripId,
          title: title,
          url: url
        }
      })

      return { linkId: link.id }
   })
}