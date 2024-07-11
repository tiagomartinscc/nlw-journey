import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";

export async function createActivity(app:FastifyInstance) {
   await app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
      schema: {
        params: z.object({
          tripId: z.string().uuid()
        }),
         body: z.object({
            title: z.string().min(4),
            occurs_at: z.coerce.date(),
         })
      }
   } ,async (request) => {
      const { title, occurs_at } = request.body
      const { tripId } = request.params
      
      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId
        }
      })

      if (!trip) {
        throw new ClientError("trip not found")
      }

      if (dayjs(occurs_at).isBefore(trip.starts_at)) {
        throw new ClientError ("Invalid activity date.")
      }

      if (dayjs(occurs_at).isAfter(trip.ends_at)) {
        throw new ClientError ("Invalid activity date.")
      }

      const activity = await prisma.activity.create({
        data: {
          trip_id: tripId,
          title: title,
          occurs_at: occurs_at
        }
      })

      return { activityId: activity.id }
   })
}