import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";

export async function updateTrip(app:FastifyInstance) {
   await app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', {
      schema: {
        params: z.object({
          tripId: z.string().uuid()
        }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        })
      }
   } ,async (request) => {
      const { tripId } = request.params
      const { destination, starts_at, ends_at } = request.body
      
      const trip = await prisma.trip.findUnique({
        where: { id: tripId }
      })

    if (!trip) {
      throw new ClientError("trip not found")
    }

     if (dayjs(starts_at).isBefore(new Date())) {
        throw new ClientError("Invalid trip start day")
     }

     if (dayjs(ends_at).isBefore(starts_at)) {
        throw new ClientError("Invalid trip end day")
     }

     await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        destination,
        starts_at,
        ends_at
      }
     }) 

      return { tripId: trip.id }
   })
}